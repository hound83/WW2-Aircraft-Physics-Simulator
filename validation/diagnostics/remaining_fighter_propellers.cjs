'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const Match = require('../../src/benchmark-matchup.js');
const { tolerances } = require('../../scripts/fighter-value-selection.cjs');
const previous = require('./operating_benchmark_v410.cjs');
const frozen = require('../../references/analysis/v410-rc1-operating-baseline.json');
const { working_reference: working, fleet_reference: fleet } = require('../../references/analysis/fighter-propeller-efficiency-v1.json');
const lightningReport = require('../../references/p38g-42-12687.json');

const lightning = working.level.find(group => group.aircraft === 'p38g');
const lightningFleet = fleet.p38g.level_rows;
const cleanMilitary = 'combat';
const fitAltitudeFt = 22600;
const alternateFitFt = 24400;
const targets = ['p38g', 'p51b', 'spitfire_lfix_bs543', 'fw190a4', 'bf109f4'];
const round = n => Number.isFinite(n) ? +n.toFixed(3) : null;

function lightningReference(model, fitAltFt) {
  const { ac, benchmarkPolar: polar } = model;
  const ordinary = lightning.rows.filter(row => row.role !== 'separate-rating-check');
  const low = ordinary[0], high = ordinary.at(-1);
  const fit = lightning.rows.find(row => row.altFt === fitAltFt);
  const propAt = row => M.propEta(ac, row.altFt, row.observed, row.bhp, 'P', row.rating, { engineRpmOverride: row.rpm });
  const onset = propAt(low).tipMach;
  const prop = propAt(fit);
  const drag = M.dragBreakdown(ac, fit.altFt, fit.observed, fit.weightLb, polar.cd0, polar.e);
  const usefulHp = prop.eta * fit.bhp * ac.engineCount;
  const coefficient = Math.log(usefulHp / drag.requiredHp) / (prop.tipMach - onset) ** 2;
  if (!(prop.tipMach > onset && coefficient > 0 && coefficient < 10)) throw Error('Invalid P-38G tip-loss fit');
  return {
    altitudeFt: [low.altFt, high.altFt],
    advanceRatio: [1.75, 2.10],
    engineRpm: lightningReport.engineRpm,
    powerRating: 'level',
    tipMachLoss: { onset, coefficient, maxTipMach: 1.09 },
    source: {
      label: 'P-38G 42-12687 level-flight report',
      title: 'Wright Field FS-M-19-1538-A B.1. Faired-shutter chart power and fitted relative tip loss.',
      url: 'https://www.wwiiaircraftperformance.com/org/p-38/p-38.html',
    },
  };
}

function withLightningReference(data, reference) {
  const model = data.models.p38g;
  return { ...data, models: {
    ...data.models,
    p38g: { ...model, cleanLevelPropellers: { [cleanMilitary]: reference } },
  } };
}

function browserData(data = previous.browserData()) {
  return withLightningReference(data, lightningReference(data.models.p38g, fitAltitudeFt));
}

function compare(rows, key, include = row => row.role === 'reserved same-report check') {
  const checks = rows.filter(row => include(row) && row[key]);
  const mae = side => {
    if (checks.some(row => !Number.isFinite(row[key][side].tasMph))) throw Error('Missing P-38G replay result');
    return round(checks.reduce((sum, row) => sum + Math.abs(row[key][side].tasMph - row.observedTasMph), 0) / checks.length);
  };
  return { count: checks.length, beforeMaeMph: mae('before'), afterMaeMph: mae('after') };
}

function lightningLevel(before, after) {
  const base = before.models.p38g, updated = after.models.p38g;
  const alternate = withLightningReference(before, lightningReference(base, alternateFitFt)).models.p38g;
  const rows = lightning.rows.map((row, i) => {
    const separate = row.role === 'separate-rating-check';
    const role = row.anchor ? 'existing drag anchor and tip-loss onset'
      : row.altFt === fitAltitudeFt ? 'tip-loss fit' : separate ? 'separate rating, same report' : 'reserved same-report check';
    const replay = model => previous.fixedShaftReplay(model, row, cleanMilitary);
    const native = data => previous.nativePowerReplay(data, 'p38g', row, cleanMilitary);
    return {
      observation: lightningFleet[i].observation,
      altFt: row.altFt, rpm: row.rpm, weightLb: row.weightLb, chartBhpPerEngine: row.bhp,
      mapInHg: lightningFleet[i].manifold_inhg, observedTasMph: row.observed, role,
      fixedShaft: { before: replay(base), after: replay(updated) },
      ...(separate ? {} : { nativePower: { before: native(before), after: native(after) } }),
      alternateFitTasMph: replay(alternate).tasMph,
    };
  });
  const alternateCommon = rows.filter(row => row.role === 'reserved same-report check' && row.altFt !== alternateFitFt);
  const alternateMae = alt => round(alternateCommon.reduce((sum, row) => sum +
    Math.abs((alt === alternateFitFt ? row.alternateFitTasMph : row.fixedShaft.after.tasMph) - row.observedTasMph), 0) /
    alternateCommon.length);
  return {
    fitAltitudeFt, alternateFitFt, fixedShaft: compare(rows, 'fixedShaft'), nativePower: compare(rows, 'nativePower'),
    alternateFit: {
      coefficient: alternate.cleanLevelPropellers.combat.tipMachLoss.coefficient,
      commonCheckAltitudesFt: alternateCommon.map(row => row.altFt),
      primaryFitMaeMph: alternateMae(fitAltitudeFt), alternateFitMaeMph: alternateMae(alternateFitFt),
    },
    rows,
  };
}

function lightningClimb(before, after) {
  const spec = before.specification.aircraft.p38g, weightLb = lightningReport.takeoffWeightLb;
  const settings = { mode: cleanMilitary, fuelFraction: frozen.fuelFraction };
  const phase = B.phaseFor(spec, settings);
  return lightningReport.climb.map(([altFt, tasMph, bhp, observedFpm, , mapInHg, role]) => {
    const eas = M.airspeeds(tasMph, altFt).eas;
    const replay = data => round(B.evaluate(M, T, L, data.models.p38g, spec, settings, altFt, eas, weightLb, phase, true).power?.climbFpm);
    return { altFt, tasMph, chartBhpPerEngine: bhp, mapInHg, weightLb, observedFpm, role, beforeFpm: replay(before), afterFpm: replay(after) };
  });
}

function lightningPartPower({ ac, benchmarkPolar: polar }) {
  return working.p38g_part_power.cases.flatMap(({ alt_ft: altFt, rows }) => rows.map(row => {
    const { rpm, weight_lb: weightLb, bhp_per_engine: bhp, observed } = row;
    const drag = M.dragBreakdown(ac, altFt, observed, weightLb, polar.cd0, polar.e);
    const prop = M.propEta(ac, altFt, observed, bhp, 'P', 'level', { engineRpmOverride: rpm });
    return {
      observation: row.observation, altFt, rpm, weightLb, chartBhpPerEngine: bhp, observedTasMph: observed,
      modeledEta: round(prop.eta), etaRequiredAtExistingDrag: round(drag.requiredHp / (bhp * ac.engineCount)),
      modeledTasMph: row.current, interpolationTasMph: row.simple,
    };
  }));
}

function matchupSensitivity(data, before, after) {
  const altFt = 30000, mode = cleanMilitary, id = 'p38g', other = 'spitfire_lfix_bs543';
  const findSpeed = (rows, aircraft) => rows.find(row => row.id === aircraft).cases.find(row => row[0] === mode && row[1] === altFt)[4];
  const beforeTasMph = findSpeed(before, id), afterTasMph = findSpeed(after, id), otherTasMph = findSpeed(after, other);
  const verdict = tas => Match.compare('level_speed', tas, otherTasMph, tolerances).lead;
  const model = data.models[id], { ac } = model, level = ac.powerRatings.level;
  const settings = { mode, fuelFraction: frozen.fuelFraction };
  const { policy, aircraft } = data.specification;
  const powerScenarios = [.98, 1.02].map(scale => {
    const gears = { turbo: level.gears.turbo.map(row => ({ ...row, bhp: row.bhp * scale })) };
    const powerRatings = { ...ac.powerRatings, level: { ...level, gears } };
    const scenario = { ...model, ac: { ...ac, powerRatings } };
    const tasMph = B.metrics(M, T, L, scenario, aircraft[id], policy, settings, altFt).level.tasMph;
    return { scale, tasMph: round(tasMph), verdict: verdict(tasMph) };
  });
  return { altFt, aircraft: [id, other], otherTasMph, beforeTasMph, afterTasMph,
    beforeVerdict: verdict(beforeTasMph), afterVerdict: verdict(afterTasMph), powerScenarios,
    qualification: 'Engineering sensitivity with level chart BHP varied 2% and tip loss and drag held fixed.' };
}

function reportChecks(before,after) {
  return {lightningLevel:lightningLevel(before,after),lightningClimb:lightningClimb(before,after)};
}

function run() {
  const before = previous.browserData(), after = browserData(before);
  const actual = previous.scorecard(after);
  return {
    schema: 'ww2-remaining-fighter-propellers/v1',
    baselineCommit: frozen.commit, baselineVersion: frozen.version,
    reference: after.models.p38g.cleanLevelPropellers.combat,
    before: frozen.aircraft, after: actual,
    differences: actual.map((row, i) => previous.caseSummary(frozen.aircraft[i], row)),
    fixed80AndDrag: targets.map(aircraft => {
      const { summary_mph, low_blower_mph } = working.level.find(group => group.aircraft === aircraft);
      return { aircraft, level: summary_mph, lowBlower: low_blower_mph ?? null };
    }),
    ...reportChecks(before,after),
    lightningPartPower: lightningPartPower(before.models.p38g),
    lightningSpitfireMatchup: matchupSensitivity(after, frozen.aircraft, actual),
    spitfireUpperBlower: fleet.spitfire_lfix_bs543,
    mustangUpperBlower: fleet.p51b,
    fw190IntakeChartCheck: fleet.fw190a4.chart_check,
  };
}

module.exports = { browserData, reportChecks, run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
