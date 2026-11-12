'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const lift = require('../../references/p51-turn-lift-tn1044.json');
const inputPack = require('../../references/analysis/fighter-sim-inputs-v1.json');
const fwCase = inputPack.climb_reference.cases.find(row => row.id === 'fw190a4-783-nr1-climb');
const lightning = inputPack.climb_reference.cases.find(row => row.id === 'p38g-12687-b4-climb');
const lightningTas = lightning.rows.map(row => [row.alt_ft, row.climb_tas_mph]);
const thunderbolt = require('../../references/p47b-measured-climb-v33.json');
const { integrateSeconds } = require('./climb_band.cjs');
const { scorecard, caseSummary } = require('./operating_benchmark_v410.cjs');
const previous = require('./remaining_fighter_propellers.cjs');
const { fadeTasMph } = require('../../calibration/v4.3-benchmark.json');

const FT = .3048;
const FPM = 60 / FT;
const fwId = 'fw190a4';
const spitId = 'spitfire_lfix_bs543';
const round = n => Number.isFinite(n) ? +n.toFixed(3) : null;
const settings = mode => ({ mode, fuelFraction: .5 });
const powerAt = state => ({
  shaftHp: round(state.power?.shaftHp),
  usefulHp: round(state.power?.propulsiveHp),
  dragHp: round(state.power?.requiredHp),
  excessHp: round(state.power?.excessHp),
  eta: round(state.prop?.eta),
  gear: state.engine?.gear ?? null,
  cooling: state.benchmark?.cooling ?? null,
});

function evaluate(data, id, mode, altFt, weightLb, tasMph, open) {
  const model = data.models[id], spec = data.specification.aircraft[id];
  return B.evaluate(M, T, lift, model, spec, settings(mode), altFt,
    M.airspeeds(tasMph, altFt).eas, weightLb, undefined, open);
}

function bestClimb(data, id, mode, altFt, weightLb) {
  return B.bestClimb(M, T, lift, data.models[id], data.specification.aircraft[id],
    settings(mode), altFt, weightLb, undefined, 1);
}

function fw190Checks(before, after) {
  const weightLb = fwCase.conditions.takeoff_mass_kg / .45359237;
  const legacyRows = fwCase.rows.filter(row => row.existing_replay_open_rate_m_s !== null);
  const rows = legacyRows.map(row => {
    const altM = row.altitude_m, altFt = altM / FT;
    const fit = row.role === 'cooling-fit-anchor';
    const pre = bestClimb(before, fwId, 'normal', altFt, weightLb);
    const post = bestClimb(after, fwId, 'normal', altFt, weightLb);
    const budget = evaluate(after, fwId, 'normal', altFt, weightLb, post.tasMph, true);
    const sensitivity = [-10, 10].map(delta => {
      const tasMph = post.tasMph + delta;
      const point = evaluate(after, fwId, 'normal', altFt, weightLb, tasMph, true);
      return { tasMph: round(tasMph), climbFpm: round(point.power?.climbFpm) };
    });
    if (!Number.isFinite(pre.climbFpm) || !Number.isFinite(post.climbFpm)) {
      throw Error('Missing WNr 783 climb prediction at ' + altM + ' m');
    }
    const observed = row.existing_replay_open_rate_m_s * FPM;
    return {
      altM, altFt, mode: 'normal', role: fit ? 'fit' : 'check', observationId: row.observation_id,
      observed, closedObserved: fit ? fwCase.cooling_fit.closed_rate_m_s * FPM : null,
      before: pre.climbFpm, after: post.climbFpm,
      beforeErrorFpm: round(pre.climbFpm - observed), afterErrorFpm: round(post.climbFpm - observed),
      beforeTasMph: round(pre.tasMph), afterTasMph: round(post.tasMph),
      power: powerAt(budget), sensitivity,
    };
  });
  const held = rows.filter(row => row.role === 'check');
  const error = (row, key) => Math.abs(row[key] - row.observed);
  const mae = key => held.reduce((sum, row) => sum + error(row, key), 0) / held.length;
  const anchor = rows.find(row => row.role === 'fit');
  const atAnchor = open => evaluate(after, fwId, 'normal', anchor.altFt, weightLb, anchor.afterTasMph, open);
  return {
    id: fwId, name: 'Fw 190 A-4 WNr 783', url: fwCase.source.chart_url,
    condition: '3,870 kg takeoff, long external intake and open cooling at 1.32 ata / 2,400 RPM. TAS is modeled. The 5,000 m pair sets the equivalent cooling area.',
    modelLabels: ['v4.10', 'Shared climb'],
    weightLb, coolingFit: after.models[fwId].climbCoolingCase, readingToleranceFpm: fwCase.chart_reading_allowance.rate_m_s * FPM,
    checks: {
      count: held.length, beforeMae: mae('before'), afterMae: mae('after'),
      largestRegression: Math.max(0, ...held.map(row => error(row, 'after') - error(row, 'before'))),
    },
    paired: {
      altFt: anchor.altFt, tasMph: anchor.afterTasMph, observedPenaltyFpm: round(anchor.closedObserved - anchor.observed),
      modeledPenaltyFpm: round(atAnchor(false).power.climbFpm - atAnchor(true).power.climbFpm),
    },
    rows,
  };
}

function browserData(before = previous.browserData()) {
  const { engine_rpm: rpm, rated_manifold_ata: map } = fwCase.conditions;
  const [minM, maxM] = fwCase.altitude_domain_m;
  const after = {
    ...before,
    models: Object.fromEntries(Object.entries(before.models).map(([id, model]) => [id, { ...model, timedClimbEnergy: true }])),
  };
  // These installation models were fitted to measured vertical rates along
  // the corresponding report schedules. The timer uses that speed lineage.
  const spitfire = before.flightChecks.find(row => row.id === spitId);
  after.models[spitId].climbRateTas = { combat: spitfire.rows.map(row => [row.altFt, row.tasMph]) };
  after.models.p47b.climbRateTas = Object.fromEntries([
    ['combat', 'military'], ['normal', 'normal'],
  ].map(([mode, rating]) => [mode, thunderbolt.states.filter(row => row.rating === rating)
    .map(row => [row.altFt, row.tasMph])]));
  after.models[fwId].climbCoolingCase = {
    areaM2: fwCase.cooling_fit.area_m2, rpm, map,
    minTasMph: 130, maxTasMph: 275, fadeTasMph,
    minFt: minM / FT, maxFt: maxM / FT,
    anchorFt: fwCase.cooling_fit.altitude_m / FT,
    source: fwCase.source.chart_url, observationId: fwCase.cooling_fit.observation_id,
  };
  return { ...after, flightChecks: [...before.flightChecks, fw190Checks(before, after)] };
}

function sourceTiming(data, id, mode, weightLb, tasSchedule, fromFt, toFt, stepFt, testRating) {
  const current = data.specification.aircraft[id];
  // A fixed report replay follows the observed test rating. Operational clocks
  // still apply to the separate live comparison at service loading.
  const spec = testRating ? { ...current, [mode]: { ...current[mode], seconds: null } } : current;
  const model = data.models[id];
  const options = { stepFt, flightCase: { weightLb, tasSchedule } };
  const time = (currentModel, accountForTasChange) => B.climb(M, T, lift, currentModel, spec,
    data.specification.policy, settings(mode), fromFt, toFt, { ...options, accountForTasChange });
  const before = time(model, false), after = time(model, true);
  const unadjusted = model.climbRateTas ? time({ ...model, climbRateTas: undefined }, true) : after;
  return { fromFt, toFt, beforeStatus: before.status, afterStatus: after.status,
    beforeSeconds: round(before.seconds), afterSeconds: round(after.seconds),
    withoutRateBasisSeconds: round(unadjusted.seconds) };
}

function modeledSchedule(data, id, mode, weightLb, toFt) {
  const knots = [];
  for (let altFt = 0; ; altFt = Math.min(toFt, altFt + 1000)) {
    const tasMph = bestClimb(data, id, mode, altFt, weightLb).tasMph;
    if (!Number.isFinite(tasMph)) throw Error('Missing modeled TAS for ' + id + ' at ' + altFt + ' ft');
    knots.push([altFt, tasMph]);
    if (altFt === toFt) return knots;
  }
}

function timedChecks(data) {
  const rows = [];
  const add = (id, mode, weightLb, schedule, from, to, observed, source, qualification, details = {}) => {
    const replay = sourceTiming(data, id, mode, weightLb, schedule, from, to, 100, details.testRating);
    rows.push({
      id, mode, weightLb, observedSeconds: round(observed), source, qualification, ...details, ...replay,
      beforeErrorSeconds: replay.beforeSeconds === null ? null : round(replay.beforeSeconds - observed),
      afterErrorSeconds: replay.afterSeconds === null ? null : round(replay.afterSeconds - observed),
    });
  };
  for (const row of lightning.rows.filter(point => point.alt_ft > 0)) {
    add('p38g', 'combat', lightning.conditions.takeoff_weight_lb, lightningTas, 0, row.alt_ft,
      row.elapsed_from_sea_level_s, lightning.source.url,
      'B.4 recorded TAS, wide-open coolers and chart BHP per engine. Fixed takeoff mass and the report’s Military test schedule.',
      { testRating: true, evidence: 'same-report elapsed check', observationId: row.observation_id });
  }
  const spit = data.flightChecks.find(row => row.id === spitId);
  add(spitId, 'combat', 7485, spit.rows.map(row => [row.altFt, row.tasMph]), 2000, 20000, 258,
    spit.url, 'Table II open radiators, recorded TAS and fixed takeoff mass. BHP is derived from chart and boost.',
    { evidence: 'same-report elapsed check' });
  for (const [mode, rating, from, to, minutes] of [
    ['combat', 'military', 0, 10000, 3.95],
    ['normal', 'normal', 20000, 30000, 17.10 - 9.75],
  ]) {
    const schedule = thunderbolt.states.filter(row => row.rating === rating).map(row => [row.altFt, row.tasMph]);
    add('p47b', mode, thunderbolt.mass.valueLb, schedule, from, to, minutes * 60,
      thunderbolt.source.url, 'B.3 recorded TAS, torque-meter BHP and open coolers. Each band retains its reported rating.',
      { evidence: 'same-report elapsed check' });
  }
  const mustangTas = modeledSchedule(data, 'p51b', 'combat', 9335, 20000);
  for (const [to, observed, readBandSeconds] of [[10000, 159, [144, 174]], [20000, 348, [330, 366]]]) {
    add('p51b', 'combat', 9335, mustangTas, 0, to, observed,
      'https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Climb.jpg',
      'Figure 6, 67 inHg / 3,000 RPM, automatic shutters and racked test. Modeled best-rate TAS and fixed takeoff weight are conditional estimates.',
      { evidence: 'digitized curve and modeled TAS', readBandSeconds, testRating: true });
  }
  return rows;
}

function fixedSpeed(data) {
  const { aircraft, policy } = data.specification;
  return Object.keys(data.models).flatMap(id => ['normal', 'combat'].flatMap(mode => [10000, 30000].flatMap(altFt =>
    [180, 200, 240].flatMap(easMph => [false, true].map(open => {
      const { weightLb } = B.load(aircraft[id], policy, settings(mode));
      const tasMph = M.tasFrom(easMph, 'EAS', altFt);
      const r = evaluate(data, id, mode, altFt, weightLb, tasMph, open);
      return { id, mode, altFt, easMph, open, weightLb: round(weightLb), tasMph: round(tasMph),
        status: r.status, sustainedDegSec: round(r.limits?.sustDegSec), instantaneousDegSec: round(r.limits?.instDegSec),
        climbFpm: round(r.power?.climbFpm), ...powerAt(r) };
    })))));
}

function run() {
  const frozen = require('../../references/analysis/v410-shared-climb-before.json');
  const old = previous.browserData(), current = browserData(old);
  const before = scorecard(old), after = scorecard(current);
  const fixedBefore = fixedSpeed(old), fixedAfter = fixedSpeed(current);
  const fw = current.flightChecks.at(-1);
  const sourceRows = fw.rows.filter(row => row.altM <= 6000);
  const rateTime = key => round(integrateSeconds(sourceRows, key));
  const { start_altitude_m: startM, last_source_altitude_m: endM, normalized_chart_allowance_s: allowance } = fwCase.elapsed_time;
  const fwTas = fwCase.estimated_climb_tas.rows.map(row => [row.altitude_m / FT, row.tas_mph]);
  const fwTimedArgs = [fwId, 'normal', fw.weightLb, fwTas, startM / FT, endM / FT, 100, false];
  const fwTimed = {
    startM, endM, allowanceSeconds: allowance,
    observedSeconds: fwCase.rows.find(row => row.altitude_m === endM).open_elapsed_from_1000_m_s,
    beforeSeconds: sourceTiming(old, ...fwTimedArgs).beforeSeconds,
    afterSeconds: sourceTiming(current, ...fwTimedArgs).afterSeconds,
  };
  const lightningRates = lightning.rows.map(row => {
    const { alt_ft: altFt, climb_tas_mph: tasMph, bhp_each: bhpPerEngine,
      roc_fpm: observedFpm, mp_inhg: mapInHg, role } = row;
    const state = evaluate(current, 'p38g', 'combat', altFt, lightning.conditions.takeoff_weight_lb, tasMph, true);
    return { altFt, tasMph, bhpPerEngine, mapInHg, role, observedFpm, observationId: row.observation_id,
      modeledFpm: round(state.power?.climbFpm),
      errorFpm: round(state.power?.climbFpm - observedFpm), ...powerAt(state) };
  });
  const timing = timedChecks(current);
  const convergence = [500, 250, 100, 50].map(stepFt => ({
    stepFt, ...sourceTiming(current, 'p38g', 'combat', lightning.conditions.takeoff_weight_lb,
      lightningTas, 0, 20000, stepFt, true),
  }));
  return {
    schema: 'ww2-shared-flight-climb/v1', version: require('../../package.json').version,
    inputPackVersion: inputPack.version,
    baselineCommit: frozen.commit, sameFrozenBefore: JSON.stringify(before) === JSON.stringify(frozen.scorecard),
    aircraft: before.map((row, i) => ({ id: row.id, before: row, after: after[i], changes: caseSummary(row, after[i]) })),
    fixedSpeed: fixedBefore.map((row, i) => ({ before: row, after: fixedAfter[i] })),
    fw190: { ...fw, timedChart: fwTimed, integratedRateSeconds: {
      toFt: sourceRows.at(-1).altFt, observed: rateTime('observed'), before: rateTime('before'), after: rateTime('after'),
      readBand: [-1, 1].map(sign => round(integrateSeconds(sourceRows.map(row => ({
        altFt: row.altFt, rate: row.observed - sign * fw.readingToleranceFpm,
      })), 'rate'))),
    } },
    lightning: { rates: lightningRates, convergence },
    timing,
    evidence: 'Flight-check fit and reserved roles are tied to their own reports. Seven-aircraft fixed-speed power budgets use matched operational settings and are model calculations. The F-4 has no directly matched climb report. Shaft and useful power are separate from aerodynamic drag.',
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { browserData, fw190Checks, sourceTiming, timedChecks, run };
