'use strict';

const baseline = require('./operating_benchmark_v46.cjs');
const { working_reference: working } = require('../../references/analysis/fighter-propeller-efficiency-v1.json');

function reference(level, rating, advanceRatio, efficiency, source) {
  const rows = level.rows.filter(row => row.rating === rating);
  const engineRpm = rows[0]?.rpm;
  if (!engineRpm || rows.some(row => row.rpm !== engineRpm) || !(level.cd0 > 0)) {
    throw Error('Invalid clean-flight reference for ' + level.aircraft + ' ' + rating);
  }
  return {
    altitudeFt: [Math.min(...rows.map(row => row.altFt)), Math.max(...rows.map(row => row.altFt))],
    engineRpm, advanceRatio, cd0: level.cd0, ...efficiency, source,
  };
}

function browserData(data = baseline.browserData()) {
  const f4u4 = working.level.find(row => row.aircraft === 'f4u4');
  const p47b = working.level.find(row => row.aircraft === 'p47b');
  const corsair = {
    label: 'Corsair clean level reference',
    title: 'F4U-4 BuNo 80765 production inspection trials and single-anchor drag fit',
    url: 'https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf',
  };
  const curtiss = {
    label: 'Curtiss clean level reference',
    title: 'NACA L4L07 same-blade high-speed tests and P-47B clean drag fit',
    url: 'https://ntrs.nasa.gov/citations/19930093302',
  };
  const eta = working.reference_values.baseline_eta;
  return { ...data, models: {
    ...data.models,
    f4u4: { ...data.models.f4u4, cleanLevelPropellers: {
      normal: reference(f4u4, 'normal', [1.8, 2.5], { eta }, corsair),
      combat: reference(f4u4, 'military', [1.8, 2.5], { eta }, corsair),
    } },
    p47b: { ...data.models.p47b, cleanLevelPropellers: {
      combat: reference(p47b, 'military', [1.85, 2.35], {
        tipMachEfficiency: working.reference_values.p47b_military_level_tip_mach_eta,
      }, curtiss),
    } },
  } };
}

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const frozen = require('../../references/analysis/v410-propeller-before.json');
const { tolerances } = require('../../scripts/fighter-value-selection.cjs');
const Match = require('../../src/benchmark-matchup.js');
const round = (value, digits = 3) => Number.isFinite(value) ? +value.toFixed(digits) : null;
const settings = mode => ({ mode, fuelFraction: frozen.fuelFraction });
const modes = ['normal', 'combat'];

function scorecard({ models, specification }) {
  const { policy } = specification;
  return Object.entries(specification.aircraft).map(([id, spec]) => {
    const model = models[id];
    const cases = modes.flatMap(mode => specification.altitudesFt.map(alt => {
      const a = B.metrics(M, T, L, model, spec, policy, settings(mode), alt);
      return [mode, alt, a.status, round(a.stallEasMph), round(a.level?.tasMph),
        round(a.climb?.climbFpm), round(a.sustained?.rateDegSec), round(a.instantaneous?.rateDegSec)];
    }));
    const timed = modes.flatMap(mode => [10000, 20000, 30000].map(alt => {
      const a = B.accelerate(M, T, L, model, spec, policy, settings(mode), alt, ...frozen.accelerationEasMph);
      return [mode, alt, a.status, round(a.seconds), round(a.reachedEasMph)];
    }));
    const climb = modes.map(mode => {
      const a = B.climb(M, T, L, model, spec, policy, settings(mode), ...frozen.timedClimbFt);
      return [mode, a.status, round(a.seconds)];
    });
    return { id, cases, timed, climb };
  });
}

function caseSummary(before, after) {
  const largest = (a, b, index) => {
    const rows = a.flatMap((row, i) =>
      Number.isFinite(row[index]) && Number.isFinite(b[i][index]) ?
        [{ mode: row[0], altFt: index === 2 ? null : row[1], delta: round(b[i][index] - row[index]) }] : []);
    return rows.reduce((best, row) => !best || Math.abs(row.delta) > Math.abs(best.delta) ? row : best, null);
  };
  return {
    aircraft: before.id,
    stallEasMph: largest(before.cases, after.cases, 3),
    levelTasMph: largest(before.cases, after.cases, 4),
    climbFpm: largest(before.cases, after.cases, 5),
    sustainedDegSec: largest(before.cases, after.cases, 6),
    instantaneousDegSec: largest(before.cases, after.cases, 7),
    accelerationSeconds: largest(before.timed, after.timed, 3),
    timedClimbSeconds: largest(before.climb, after.climb, 2),
    changedStatus: [
      ...before.cases.filter((row, i) => row[2] !== after.cases[i][2]),
      ...before.timed.filter((row, i) => row[2] !== after.timed[i][2]),
      ...before.climb.filter((row, i) => row[1] !== after.climb[i][1]),
    ],
  };
}

function powerAt(flight) {
  return {
    shaftHp: round(flight.power?.shaftHp),
    usefulHp: round(flight.power?.propulsiveHp),
    dragHp: round(flight.power?.requiredHp),
    eta: round(flight.prop?.eta, 5),
    referenceShare: round(flight.prop?.levelReference?.fraction ?? 0),
    gear: flight.engine?.gear ?? null,
  };
}

function fixedShaftReplay(model, row, mode) {
  const { altFt, rating, gear, bhp, rpm, weightLb, observed } = row;
  const ac = {
    ...model.ac,
    propGeometry: {
      ...model.ac.propGeometry,
      ...(model.benchmarkReductionRatio && { reductionRatioEnginePerProp: model.benchmarkReductionRatio }),
      engineRpmByRating: { [rating]: rpm },
    },
    powerRatings: { [rating]: { gears: { [gear]: [{ altFt, bhp, engineRpm: rpm }] } } },
  };
  const options = {
    profile: 'P', polar: model.benchmarkPolar, flightEnvelope: model.options.flightEnvelope,
    rating, gear, weightLb, cleanLevelPropeller: model.cleanLevelPropellers?.[mode],
  };
  const flight = M.evaluated(ac, altFt, observed, options);
  return { tasMph: round(M.maxSpeed(ac, altFt, options)), ...powerAt(flight) };
}

function nativePowerReplay(data, id, row, mode) {
  const { altFt, weightLb, observed } = row;
  const original = data.specification.aircraft[id], model = data.models[id], s = settings(mode);
  // At 50% fuel this replay loads the report's gross weight, including any
  // carried injection-system mass that the operating profile accounts for.
  const spec = {
    ...original,
    referenceWeightLb: weightLb - (original.injection?.fluidLb ?? 0),
    referenceFuelUSGal: original.fuelCapacityUSGal * s.fuelFraction,
    serviceLoadDeltaLb: 0,
  };
  const flight = B.evaluate(M, T, L, model, spec, s, altFt, M.airspeeds(observed, altFt).eas, weightLb);
  const result = B.metrics(M, T, L, model, spec, data.specification.policy, s, altFt);
  return { tasMph: round(result.level?.tasMph), ...powerAt(flight) };
}

function historicalGroup(before, after, id, rows, separateAirframe = false) {
  const checks = rows.map(row => {
    const mode = row.rating === 'normal' ? 'normal' : 'combat';
    const left = fixedShaftReplay(before.models[id], row, mode);
    const right = fixedShaftReplay(after.models[id], row, mode);
    return {
      altFt: row.altFt, rating: row.rating, rpm: row.rpm, weightLb: row.weightLb,
      role: row.anchor ? 'drag fit' : separateAirframe ? 'separate airframe and report' : 'same-report check outside drag fit',
      observation: row.observation ?? null, observedTasMph: round(row.observed),
      shaftPowerReadingRange: row.chartHpSpan ?? null,
      fixedShaft: { before: left, after: right },
      ...(separateAirframe ? {} : { nativePower: {
        before: nativePowerReplay(before, id, row, mode), after: nativePowerReplay(after, id, row, mode),
      } }),
    };
  });
  const summarize = method => {
    const eligible = checks.filter(row => row.role !== 'drag fit' &&
      Number.isFinite(row[method]?.before.tasMph) && Number.isFinite(row[method]?.after.tasMph));
    const mae = key => round(eligible.reduce((n, row) =>
      n + Math.abs(row[method][key].tasMph - row.observedTasMph), 0) / eligible.length);
    return { count: eligible.length, beforeMaeMph: mae('before'), afterMaeMph: mae('after') };
  };
  return { aircraft: id, separateAirframe, fixedShaft: summarize('fixedShaft'),
    ...(separateAirframe ? {} : { nativePower: summarize('nativePower') }), checks };
}

function corsairClimb(before, after) {
  const archive = require('../../references/research/ww2_multiaxis_propulsion_trials_2026-11-10.json');
  const source = archive.series.find(s => s.id === 'f4u4-normal-military-climb');
  const spec = before.specification.aircraft.f4u4;
  const weightLb = working.level.find(s => s.aircraft === 'f4u4').anchor.weightLb;
  const checks = source.rows.map(([rating, altFt, observedFpm]) => {
    const mode = rating === 'normal' ? 'normal' : 'combat', s = settings(mode);
    const phase = B.phaseFor(spec, s);
    const predicted = data => round(B.bestClimb(M, T, L, data.models.f4u4, spec, s, altFt, weightLb, phase, 1).climbFpm);
    return {rating, altFt, weightLb, observedFpm, beforeFpm: predicted(before), afterFpm: predicted(after),
      role: rating === 'normal' && altFt === 0 ? 'earlier climb fit' : 'same-report maximum-climb diagnostic'};
  });
  return {basis: 'Report gross mass and observed maximum climb. The replay uses modeled best-rate speed.', checks};
}

function shiftEfficiency(model, delta) {
  const cleanLevelPropellers = Object.fromEntries(Object.entries(model.cleanLevelPropellers).map(([phase, ref]) => [
    phase, { ...ref, ...(ref.tipMachEfficiency ? {
      tipMachEfficiency: ref.tipMachEfficiency.map(([mach, eta]) => [mach, eta + delta]),
    } : { eta: ref.eta + delta }) },
  ]));
  return { ...model, cleanLevelPropellers };
}

function sensitivity({ models, specification }) {
  const phase = 'combat', altFt = 29000, s = settings(phase);
  const ids = ['f4u4', 'p47b'];
  const rows = ids.map(id => {
    const range = [-.02, 0, .02].map(delta => B.metrics(M, T, L, shiftEfficiency(models[id], delta),
      specification.aircraft[id], specification.policy, s, altFt).level?.tasMph ?? null);
    return { id, levelTasMph: range.map(x => round(x)) };
  });
  const [a, b] = rows.map(row => row.levelTasMph);
  const verdict = (x, y) => Match.compare('level_speed', x, y, tolerances)?.lead ?? null;
  return { phase, altFt, etaOffsets: [-.02, 0, .02], rows,
    levelVerdicts: [verdict(a[0], b[2]), verdict(a[1], b[1]), verdict(a[2], b[0])],
    interpretation: 'Engineering sensitivity with reference drag fixed. The efficiency offsets are scenarios.' };
}

function run() {
  const before = baseline.browserData(), after = browserData(before);
  const actual = scorecard(after);
  const changed = ['f4u4', 'p47b'].map(id => historicalGroup(before, after, id,
    working.level.find(row => row.aircraft === id).rows));
  return {
    schema: 'ww2-propeller-milestone/v1',
    baselineCommit: frozen.commit, baselineVersion: frozen.version, dataVersion: frozen.data,
    before: frozen.aircraft, after: actual,
    differences: actual.map((row, i) => caseSummary(frozen.aircraft[i], row)),
    speedChecks: [...changed, historicalGroup(before, after, 'p47b', working.p47b_independent_level.rows, true)],
    corsairClimb: corsairClimb(before, after),
    comparisonSensitivity: sensitivity(after),
  };
}

module.exports = { browserData, run, scorecard };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
