'use strict';

const M = require('../../src/physics.js');
const C = require('../../src/climb-conditions.js');
const {aircraft} = require('../../aircraft/cases.json');
const {thunderboltProduction: donor} = require('../../references/independent-flight-checks.json');
const {gearing} = require('../../references/p47b-measured-climb-v33.json');
const cooling = require('../../calibration/v3.4-configuration-model.json');
const policy = require('../../references/operational-climb.json');
const {integrateSeconds} = require('./climb_band.cjs');

function interpolate(rows, altitude, key) {
  const index = rows.findIndex(row => row.altFt >= altitude);
  if (index < 0 || altitude < rows[0].altFt) throw Error('Outside climb profile');
  const end = rows[index];
  if (end.altFt === altitude) return end[key];
  const start = rows[index - 1];
  return start[key] + (end[key] - start[key]) * (altitude - start.altFt) / (end.altFt - start.altFt);
}

function timeBetween(rows, from, to) {
  if (from === to) return 0;
  return integrateSeconds([
    {altFt: from, fpm: interpolate(rows, from, 'fpm')},
    ...rows.filter(row => row.altFt > from && row.altFt < to),
    {altFt: to, fpm: interpolate(rows, to, 'fpm')}
  ], 'fpm');
}

function schedule(sustained, short, budgetSeconds) {
  if (sustained.length < 2 || short.length < 2) throw Error('Invalid climb policy or band');
  const start = sustained[0].altFt;
  const end = sustained.at(-1).altFt;
  if (!Number.isFinite(budgetSeconds) || budgetSeconds < 0 ||
      short[0].altFt !== start || short.at(-1).altFt !== end) throw Error('Invalid climb policy or band');
  // Validate the complete profiles before searching for the time-limited transition.
  const sustainedSeconds = integrateSeconds(sustained, 'fpm');
  const shortSeconds = integrateSeconds(short, 'fpm');
  if (budgetSeconds === 0) return {seconds: sustainedSeconds, shortSeconds: 0, switchAltFt: null};
  if (budgetSeconds >= shortSeconds) return {seconds: shortSeconds, shortSeconds, switchAltFt: null};
  let lo = start;
  let hi = end;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (timeBetween(short, start, mid) < budgetSeconds) lo = mid;
    else hi = mid;
  }
  const switchAltFt = (lo + hi) / 2;
  return {seconds: budgetSeconds + timeBetween(sustained, switchAltFt, end),
    shortSeconds: budgetSeconds, switchAltFt};
}

function predict(ac, state, rating, weightLb, coolingCd0) {
  const {altFt, tasMph, shaftHp, engineRpm, gear} = state;
  // Use the existing force balance at an isolated power point. Retain the clean
  // polar from the working configuration so the synthetic rating cannot reanchor it.
  const {polar} = M.workingOptions(ac);
  const rated = {...ac, powerRatings: {[rating]: {gears: {[gear]: [{altFt, bhp: shaftHp}]}}},
    propGeometry: {...ac.propGeometry, engineRpmByRating: {[rating]: engineRpm},
      reductionRatioEnginePerProp: gear === 'turbo' ? 1 / gearing.propPerEngine : ac.propGeometry.reductionRatioEnginePerProp}};
  const result = M.evaluated(rated, altFt, tasMph, {profile: 'P', polar, rating, gear,
    weightLb, addedDragAreaM2: coolingCd0 * ac.wingAreaM2});
  if (result.status !== 'modelled' || !(result.power.climbFpm > 0) ||
      result.prop.engineRpm !== engineRpm) throw Error('Unavailable operational climb state: ' + ac.name + ' at ' + altFt + ' ft (' + result.status + ')');
  return {...state, fpm: result.power.climbFpm, weightLb, coolingCd0, propRpm: result.prop.propRpm, propulsiveHp: result.power.propulsiveHp};
}

function spitfireSustained(rows, exponent, scaleForRpm) {
  const spec = policy.spitfire;
  const ac = aircraft.spitfire_lfix_bs543;
  return rows.map(row => {
    const boostPsi = Math.min(row.boostPsi, spec.sustainedBoostPsi);
    const pressureRatio = (14.6959 + boostPsi) / (14.6959 + row.boostPsi);
    const rpmRatio = scaleForRpm ? spec.sustainedRpm / row.engineRpm : 1;
    return predict(ac, {altFt: row.altFt, tasMph: row.tasMph, gear: 'high', boostPsi,
      shaftHp: row.shaftHp * pressureRatio ** exponent * rpmRatio, engineRpm: spec.sustainedRpm},
      'operational-sustained', spec.weightLb, row.coolingCd0);
  });
}

function militaryThunderbolt(band, weightLb) {
  const ac = aircraft.p47b;
  return donor.climb.filter(([alt]) => alt >= band[0] && alt <= band[1]).map(([altFt, shaftHp, tasMph, observedFpm]) => {
    const state = {altFt, tasMph, shaftHp, engineRpm: donor.rpm, gear: 'turbo'};
    const cd0 = cooling.deltaCd0 * C.factor(M, state, shaftHp, cooling.reference, cooling.heatFraction);
    return {...predict(ac, state, 'military', weightLb, cd0), observedDonorFpm: observedFpm};
  });
}

function run(historical) {
  const nominal = spitfireSustained(historical.spitfire.rows, policy.spitfire.nominalChargeExponent, true);
  const spitShort = historical.spitfire.rows.map(row => ({...row, fpm: row.modelFpm}));
  const p47Normal = historical.thunderbolt.rows.map(row => ({...row, fpm: row.modelFpm}));
  const p47Short = militaryThunderbolt(historical.bandFt, policy.thunderbolt.weightLb);
  const donorReplay = militaryThunderbolt(historical.bandFt, donor.weightLb);
  const donorErrors = donorReplay.map(row => ({altFt: row.altFt, observedFpm: row.observedDonorFpm,
    replayFpm: row.fpm, residualFpm: row.fpm - row.observedDonorFpm}));
  const sensitivity = [2/3, 1].flatMap(exponent => [true, false].map(scale => ({
    exponent, rpmPowerScaling: scale, curve: spitfireSustained(historical.spitfire.rows, exponent, scale)
  })));
  const scenarios = policy.budgetsSeconds.map(budgetSeconds => {
    const s = schedule(nominal, spitShort, budgetSeconds);
    const p = schedule(p47Normal, p47Short, budgetSeconds);
    const endpoint = (atEnd, sustained, short, timing) => atEnd
      ? (budgetSeconds > 0 && timing.switchAltFt === null ? short : sustained).at(-1).fpm
      : (budgetSeconds > 0 ? short : sustained)[0].fpm;
    const estimates = sensitivity.map(({exponent, rpmPowerScaling, curve}) => ({
      exponent, rpmPowerScaling, leadSeconds: p.seconds - schedule(curve, spitShort, budgetSeconds).seconds
    }));
    const leads = estimates.map(x => x.leadSeconds);
    return {budgetSeconds, spitfire: s, thunderbolt: p, leadSeconds: p.seconds - s.seconds,
      endpoints: historical.bandFt.map((altFt, index) => {
        const spitfireFpm = endpoint(index === 1, nominal, spitShort, s);
        const thunderboltFpm = endpoint(index === 1, p47Normal, p47Short, p);
        return {altFt, spitfireFpm, thunderboltFpm, leadFpm: spitfireFpm - thunderboltFpm};
      }),
      sensitivity: {leadSeconds: [Math.min(...leads), Math.max(...leads)], estimates}};
  });
  return {bandFt: historical.bandFt, policy, scenarios,
    curves: {spitfireSustained: nominal, spitfireShort: spitShort, thunderboltSustained: p47Normal, thunderboltShort: p47Short},
    donorCheck: {report: donor.report, specimen: donor.specimen, url: donor.url, rows: donorErrors,
      maeFpm: donorErrors.reduce((sum, row) => sum + Math.abs(row.residualFpm), 0) / donorErrors.length},
    precision: {status: 'model-estimate', validatedErrorBound: null, practical3to1: 'unresolved', highPrecision5to1: 'unresolved'}};
}

module.exports = {run, schedule};
