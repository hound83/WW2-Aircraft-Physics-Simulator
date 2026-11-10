'use strict';
const M = require('../../src/physics.js');
const Stall = require('../../src/stall-lab.js');
const airframe = require('../../aircraft/f4u4.json');
const audit = require('../../references/v4-source-audit.json');
const archive = require('../../references/research/ww2_multiaxis_propulsion_trials_2026-11-10.json');
const stalls = require('../../references/research/stall_us_2026-11-10.json');
const MPH_PER_KNOT = 1.150779448;
const series = id => archive.series.find(item => item.id === id).rows;
const cleanStalls = stalls.series.find(item => item.id === 'US20').rows.filter(row => row[0] === 'clean');
const anchor = cleanStalls.map(([, power, knotsCas]) => {
  const eas = M.airspeeds(M.tasFrom(knotsCas * MPH_PER_KNOT, 'CAS', 0), 0).eas;
  const unitClEas = Stall.eas(airframe.weightLb, airframe.wingAreaM2 / 0.09290304, 1);
  return {power, knotsCas, clMax: (unitClEas / eas) ** 2, role: 'lift anchor'};
});
const control = {...airframe, clMaxAssumed: anchor.find(row => row.power === 'off').clMax};
const powered = anchor.find(row => row.power === 'on').clMax;
const options = (rating, extra = {}) => ({profile: 'P', rating, engineModel: 'rated-inlet', ...extra});
const normalClimb = series('f4u4-normal-military-climb').find(row => row[0] === 'normal' && row[1] === 0);
const withClimbAdjustment = climbDeltaEta => ({...control, propGeometry: {...control.propGeometry,
  installedEfficiency: {minFt: 0, maxFt: 30000, minShaftHp: 1250, maxShaftHp: 2100,
    minJ: 0.55, climbJ: 0.94, levelJ: 1.4, maxJ: 1.55, climbDeltaEta, levelDeltaEta: 0}}});
function fitClimb() {
  let low = 0;
  let high = 0.08;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    const {climbFpm} = M.bestClimb(withClimbAdjustment(mid), 0, options('normal'));
    if (climbFpm < normalClimb[2]) low = mid;
    else high = mid;
  }
  return withClimbAdjustment((low + high) / 2);
}
const ac = fitClimb();

function run() {
  const speed = series('f4u4-normal-military-speed').map(([rating, altFt, observed]) => ({
    rating, altFt, observed, predicted: M.maxSpeed(ac, altFt, options(rating)) / MPH_PER_KNOT,
    role: rating === 'normal' && altFt === 0 ? 'drag anchor' : altFt === 0 ? 'same-report check' : 'critical-height diagnostic'
  }));
  const chartConditioned = speed.map(row => {
    const power = audit.corsair.originalLevelChart.rows.find(p => p[0] === row.rating && p[1] === row.altFt);
    const test = {...ac, defaultGear: 'test', powerRatings: {...ac.powerRatings,
      [row.rating]: {gears: {test: [{altFt: row.altFt, bhp: power[2]}]}}}};
    const optionsAtPoint = {...M.workingOptions(ac), gear: 'test', rating: row.rating};
    return {...row, predicted: M.maxSpeed(test, row.altFt, optionsAtPoint) / MPH_PER_KNOT,
      chartBhp: power[2], role: 'digitized power-conditioned diagnostic'};
  });
  const climb = series('f4u4-normal-military-climb').map(([rating, altFt, observed]) => {
    const model = M.bestClimb(ac, altFt, options(rating));
    const baseline = M.bestClimb(control, altFt, options(rating)).climbFpm ?? null;
    return {rating, altFt, observed, predicted: model.climbFpm ?? null, modeledTasMph: model.tasMph ?? null,
      baseline, role: rating === 'normal' && altFt === 0 ? 'climb fit' : 'same-report maximum climb check'};
  });
  const stall = anchor.map(row => {
    const eas = Stall.eas(ac.weightLb, ac.wingAreaM2 / 0.09290304, row.clMax);
    return {...row, replayCasKt: Stall.air(M, eas, 0).casMph / MPH_PER_KNOT};
  });
  return {stall, speed, chartConditioned, climb, installedEfficiency: ac.propGeometry.installedEfficiency, status: 'source-conditioned research profile',
    limitations: 'Clean one-g stall anchors at reported 12,500 lb; reference atmosphere assumed. Stall power-on setting is unspecified. One normal sea-level climb fits an equivalent low-J propulsion adjustment. Nominal engine ratings, assumed inlet recovery and gear schedule transfer to the 1948 airplane. Chart critical heights are diagnostic. Climb uses model-best speed, report gross weight and a clean polar; instantaneous mass and cooling drag are unverified.'};
}
module.exports = {ac, powered, options, run};
