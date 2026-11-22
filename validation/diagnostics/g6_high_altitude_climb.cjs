'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const lift = require('../../references/p51-turn-lift-tn1044.json');
const sources = require('../../references/analysis/g6-16476-climb-pressure.json');
const { FT, KMH, LB_PER_KG } = require('../../scripts/aircraft-batch.cjs');
const { id, chartReplay, observations } = require('./g6_archival_climb.cjs');

const hpWatts = 745.6998716;
const psWatts = 735.49875;
const gravity = 9.80665;
const round = (x, places = 1) => Number(x.toFixed(places));
const feet = km => 1000 * km * (1 / FT);
const checkpoints = [5, 8, 9, 10];
const bands = [[0, 5], [0, 8], [8, 9], [9, 10], [8, 10], [0, 10]];

function readPressure(source) {
  const scale = source.calibration;
  return source.rows.map(([altKm, , x]) => ({
    altKm, ata: round(scale.referenceAta + (x - scale.referenceX) / scale.pixelsPerAta, 3),
    readAllowanceAta: scale.readAllowanceAta,
  }));
}

// Only the manifold-pressure input changes. Preserve the baseline power at its
// own pressure, the DB rating, pressure exponent, RPM, propeller, polar and cooling.
function withMeasuredPressure(model, spec, readings, offsetAta) {
  const old = model.climbPowerRatings.combat.gears.hydraulic;
  const pressure = readings.map(r => [feet(r.altKm), r.ata + offsetAta]);
  const top = pressure.at(-1)[0];
  const heights = new Set([...old.map(n => n.altFt).filter(h => h <= top), ...pressure.map(p => p[0])]);
  const curve = [...heights].sort((a, b) => a - b).map(altFt => {
    const measuredAta = B.interpolate(pressure, altFt, 1);
    const previous = M.shaftPower({ powerRatings: { combat: model.climbPowerRatings.combat } }, altFt, 'combat', 'hydraulic');
    const ata = Math.min(spec.combat.map, measuredAta);
    return { altFt, mapInHg: ata, engineRpm: spec.combat.rpm,
      bhp: previous.bhp * (ata / previous.mapInHg) ** spec.pressureExponent };
  });
  return { ...model, climbPowerRatings: { ...model.climbPowerRatings, combat: { gears: { hydraulic: curve } } } };
}

function reached(run) {
  if (run.status !== 'reached') throw Error('G-6 chart replay failed at ' + run.targetFt + ' ft: ' + run.status);
  return run;
}

function fixedRun(data, model, kg, stepFt) {
  const replay = chartReplay(data, model, kg);
  return altKm => reached(replay.climb(0, feet(altKm), stepFt));
}

// The source flight-case entry point holds mass fixed. The operating climb also
// accepts a prescribed TAS under its manual schedule, with fuel debited by the
// shared integrator. Supply the actual native 2600-rpm phase on that path.
// Zero-burn parity checks the two entry points at every reported checkpoint.
function burningRun(data, model, kg, fuelGPerPsHour, stepFt) {
  const spec = data.specification.aircraft[id];
  const { schedule } = chartReplay(data, model, kg);
  const fuelFraction = 0.75;
  const actualRating = { ...spec.combat, seconds: null };
  const flight = { ...spec, normal: actualRating, climbTAS: schedule,
    referenceWeightLb: kg * LB_PER_KG, referenceFuelUSGal: spec.fuelCapacityUSGal * fuelFraction };
  const policy = { ...data.specification.policy,
    bsfcLbPerHpHour: fuelGPerPsHour / 1000 * LB_PER_KG * hpWatts / psWatts };
  return altKm => {
    const run = reached(B.climb(M, T, lift, model, flight, policy, { mode: 'normal', fuelFraction },
      0, feet(altKm), { stepFt, accountForTasChange: true }));
    if (run.endFuelLb <= 0) throw Error('G-6 mass sensitivity ran out of the assumed fuel stock');
    return run;
  };
}

function timeResults(runTo, reads) {
  const endpoints = new Map([[0, { seconds: 0, fuelUsedLb: 0 }]]);
  for (const km of checkpoints) endpoints.set(km, runTo(km));
  const readSeconds = km => reads.find(row => row.altKm === km).elapsedMin * 60;
  const allowance = km => km === 0 ? 0 : km === 10 ? 24 : 12;
  return {
    bands: bands.map(([fromKm, toKm]) => {
      const observedS = readSeconds(toKm) - readSeconds(fromKm);
      const modeledS = endpoints.get(toKm).seconds - endpoints.get(fromKm).seconds;
      return { fromKm, toKm, observedS: round(observedS), modeledS: round(modeledS),
        errorS: round(modeledS - observedS), endpointReadAllowanceS: allowance(fromKm) + allowance(toKm) };
    }),
    modeledFuelUsedKg: checkpoints.map(altKm => ({ altKm,
      kg: round(endpoints.get(altKm).fuelUsedLb / LB_PER_KG, 2) })),
  };
}

function powerBudgets(data, base, chart, kg, reads) {
  const spec = data.specification.aircraft[id];
  const phase = { ...spec.combat, key: 'combat' };
  const noAddedCooling = { ...base, climbCoolingAreaM2: 0 };
  return checkpoints.map(km => {
    const i = reads.findIndex(r => r.altKm === km), row = reads[i];
    const lower = reads[i-1], upper = reads[Math.min(i+1, reads.length-1)];
    const slope = (upper.tasKmh - lower.tasKmh) / 3.6 / (1000 * (upper.altKm - lower.altKm));
    const perMass = gravity + row.tasKmh / 3.6 * slope;
    const elevation = feet(km);
    const eas = M.airspeeds(row.tasKmh / KMH, elevation).eas;
    const evaluate = model => B.evaluate(M, T, lift, model, spec, { mode: 'combat' },
      elevation, eas, kg * LB_PER_KG, phase, true);
    const original = evaluate(base), replacement = evaluate(chart), noExtraCooling = evaluate(noAddedCooling);
    const summarize = state => ({
      manifoldAta: round(state.engine.mapInHg, 3), shaftHp: round(state.power.shaftHp),
      propulsiveHp: round(state.power.propulsiveHp), requiredHp: round(state.power.requiredHp),
      excessHp: round(state.power.excessHp), propellerEfficiency: round(state.prop.eta, 3),
      verticalMps: round(state.power.psMps * gravity / perMass, 2),
      missingUsefulKw: round((kg * row.rateMps * perMass - state.power.excessHp * hpWatts) / 1000),
    });
    return { altKm: km, tasKmh: row.tasKmh, observedMps: row.rateMps, readAllowanceMps: 0.2,
      baseline: summarize(original), chartPressure: summarize(replacement),
      modeledCoolingPowerKw: round((original.power.requiredHp - noExtraCooling.power.requiredHp) * hpWatts / 1000) };
  });
}

function run(data) {
  const base = data.models[id], spec = data.specification.aircraft[id];
  const reads = observations().rows.filter(row => row.tasKmh !== null);
  const kg = sources.g6.weightKg.reportProse;
  const primary = readPressure(sources.g6), crossCheck = readPressure(sources.g1);
  const chartModel = offset => withMeasuredPressure(base, spec, primary, offset);
  const chart = chartModel(0), tolerance = sources.g6.calibration.readAllowanceAta;
  const regulated = primary.filter(row => row.altKm <= 5);
  const plateauOffset = spec.combat.map - regulated.reduce((sum, row) => sum + row.ata, 0) / regulated.length;
  const nominalBurn = sources.engine.climbSpecificFuelGPerPsHour;
  const timed = fn => timeResults(fn, reads);
  const fixed = (model, mass = kg, step = 100) => timed(fixedRun(data, model, mass, step));
  const burning = (model, burn) => timed(burningRun(data, model, kg, burn, 100));
  const zeroBurn = burning(base, 0), baseline = fixed(base), pressureOnly = fixed(chart);
  const maxTimeDiff = (first, second) => Math.max(...first.bands.map((r,i) => Math.abs(r.modeledS - second.bands[i].modeledS)));
  const integratedRate = reads.slice(1).map((b, i) => {
    const a = reads[i];
    return 1000 * (b.altKm - a.altKm) * Math.log(a.rateMps / b.rateMps) / (a.rateMps - b.rateMps);
  });
  return {
    schema: 'ww2-g6-high-altitude-climb/v1', aircraft: id, simulatorVersion: require('../../package.json').version,
    role: 'Diagnostic pressure substitution from the same G-6 trial. The G-1 pressure readings are an independent installation check only. Rates and times from each plate share a flight lineage.',
    sources: { g6: sources.g6.url, g1: sources.g1.url, engine: sources.engine.url },
    manifoldPressure: { g6: primary, g1: crossCheck },
    plateauAlignmentOffsetAta: round(plateauOffset, 3),
    rateIntegrationS: { to10Km: round(integratedRate.reduce((sum, s) => sum + s, 0)),
      from8to10Km: round(integratedRate.slice(8).reduce((sum, s) => sum + s, 0)) },
    scenarios: { baseline, pressureOnly, pressureLow: fixed(chartModel(-tolerance)),
      pressureHigh: fixed(chartModel(tolerance)), pressureAlignedToCommand: fixed(chartModel(plateauOffset)),
      plateWeightOnly: fixed(base, sources.g6.weightKg.plateAnnotation),
      estimatedFuelBurnOnly: burning(base, nominalBurn), pressureAndEstimatedFuelBurn: burning(chart, nominalBurn),
      pressureAndHigherEstimatedFuelBurn: burning(chart, nominalBurn + sources.engine.printedPlusAllowanceGPerPsHour),
      zeroAddedCoolingDragOnly: fixed({ ...base, climbCoolingAreaM2: 0 }) },
    powerBudgets: powerBudgets(data, base, chart, kg, reads),
    numerical: { zeroBurnPathMaxDiffS: round(maxTimeDiff(zeroBurn, baseline), 2),
      halfStepBaselineMaxDiffS: round(maxTimeDiff(baseline, fixed(base, kg, 50)), 2),
      halfStepPressureMaxDiffS: round(maxTimeDiff(pressureOnly, fixed(chart, kg, 50)), 2) },
  };
}

module.exports = { run };
