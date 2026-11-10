'use strict';
const M = require('../../src/physics.js');
const {aircraft} = require('../../aircraft/cases.json');
const source = require('../../references/research/ww2_multiaxis_propulsion_trials_2026-11-10.json');
const rows = id => source.series.find(series => series.id === id).rows;
const WT = 12620;
const RPM = 2700;
const BHP = 2000;
const SPEED_PROP = 'Curtiss 714-1C2-12 cuffed';
const CLIMB_PROP = 'Hamilton Standard 6501A-0';
const base = aircraft.p47b;
const hpPerFpm = WT / 33000;

function testAircraft(ac, altFt, bhp, propGeometry = ac.propGeometry, rpm = RPM) {
  return {...ac, propGeometry: {...propGeometry, engineRpmByRating: {test: rpm}},
    defaultRating: 'test', defaultGear: 'test',
    powerRatings: {test: {gears: {test: [{altFt, bhp}]}}}};
}

function p47(climbFitFt = 10000, speedFitFt = 5000) {
  const level = rows('p47b-dec-props-level');
  const climb = rows('p47b-dec-props-climb');
  const curtiss = {...base.propGeometry, reductionRatioEnginePerProp: 2, diameterFt: 12 + 2/12};
  const hamilton = {...base.propGeometry, reductionRatioEnginePerProp: 2, diameterFt: 13};
  const efficiencies = (alt, tas, bhp) => [curtiss, hamilton].map(prop => {
    const ac = testAircraft(base, alt, bhp, prop);
    return M.propEta(ac, alt, tas, bhp, 'P');
  });
  const climbPair = alt => {
    const a = climb.find(row => row[0] === SPEED_PROP && row[1] === alt);
    const b = climb.find(row => row[0] === CLIMB_PROP && row[1] === alt);
    if (!a || !b || a[3] !== b[3] || a[4] !== b[4]) throw Error('P-47 climb pair mismatch');
    return {alt, speed: a[4], bhp: a[3], observed: b[2] - a[2]};
  };
  const speedPair = alt => {
    const a = level.find(row => row[0] === SPEED_PROP && row[1] === alt);
    const b = level.find(row => row[0] === CLIMB_PROP && row[1] === alt);
    if (!a || !b || a[3] !== b[3] || a[4] !== b[4]) throw Error('P-47 speed pair mismatch');
    return {alt, referenceTas: a[2], speed: b[2], bhp: a[3], observed: b[2] - a[2]};
  };
  // At equal TAS and weight, common drag cancels from the climb-power difference.
  const cp = climbPair(climbFitFt);
  const [cClimb, hClimb] = efficiencies(cp.alt, cp.speed, cp.bhp);
  const climbDeltaEta = cp.observed * hpPerFpm / cp.bhp - (hClimb.eta - cClimb.eta);
  const sp = speedPair(speedFitFt);
  const e = base.workingModel.e;
  function referencePolar(pair) {
    const ac = testAircraft({...base, weightLb: WT}, pair.alt, pair.bhp, curtiss);
    ac.calibration = {altFt: pair.alt, tasMph: pair.referenceTas, rating: 'test', gear: 'test'};
    return M.workingOptions(ac).polar;
  }
  const polar = referencePolar(sp);
  const required = M.dragBreakdown(base, sp.alt, sp.speed, WT, polar.cd0, e).requiredHp;
  const hLevel = efficiencies(sp.alt, sp.speed, sp.bhp)[1];
  const installedEfficiency = {minFt: 5000, maxFt: 25000, shaftHp: BHP, engineRpm: RPM,
    minJ: 0.85, maxJ: 2.25, climbJ: hClimb.J, levelJ: hLevel.J,
    climbDeltaEta, levelDeltaEta: required / sp.bhp - hLevel.eta};
  const candidate = {...hamilton, installedEfficiency};
  const climbChecks = [10000, 15000, 20000, 24000].map(alt => {
    const pair = climbPair(alt);
    const [c, h] = efficiencies(alt, pair.speed, pair.bhp);
    const fitted = M.propEta(testAircraft(base, alt, pair.bhp, candidate), alt, pair.speed, pair.bhp, 'P');
    return {...pair, role: alt === climbFitFt ? 'fit' : 'reserved',
      baseline: (h.eta - c.eta) * pair.bhp / hpPerFpm,
      candidate: (fitted.eta - c.eta) * pair.bhp / hpPerFpm};
  });
  const speedChecks = [5000, 25000].map(alt => {
    const pair = speedPair(alt);
    const options = {profile: 'P', weightLb: WT, polar: referencePolar(pair)};
    const predict = prop => M.maxSpeed(testAircraft(base, alt, pair.bhp, prop), alt, options) - pair.referenceTas;
    return {...pair, role: alt === speedFitFt ? 'fit' : 'reserved', baseline: predict(hamilton), candidate: predict(candidate)};
  });
  return {installation: '41-5942 December paired trial, Hamilton Standard 6501A-0 vs Curtiss 714 cuffed',
    installedEfficiency, climbChecks, speedChecks,
    metrics: {climb: errors(climbChecks), speed: errors(speedChecks)},
    limitations: 'Conditional equivalent installed efficiency at the measured shaft setting only. Cooling effects, reference gross weight and prop-airframe interactions are not isolated. Speed pairs use the measured Curtiss speed to anchor a common polar at each altitude. January trials are excluded because blade/cuff/CG and climb-speed labels differ. No transfer to 41-5902.'};
}

function errors(records) {
  const kept = records.filter(row => row.role === 'reserved');
  const mae = key => kept.reduce((sum, row) => sum + Math.abs(row[key] - row.observed), 0) / kept.length;
  return {count: kept.length, baselineMae: mae('baseline'), candidateMae: mae('candidate')};
}

function mustang() {
  const ac = aircraft.p51b;
  const trials = rows('p51b15-chart-vs-performance');
  const clean = trials.find(row => !row[5]);
  const anchor = trials.find(row => row[5] && row[2] === clean[2]);
  const reserved = trials.find(row => row[5] && row[2] !== clean[2]);
  const rpm = clean[3];
  const alt = clean[0];
  const reference = testAircraft(ac, alt, clean[4], ac.propGeometry, rpm);
  reference.calibration = {altFt: alt, tasMph: clean[1], rating: 'test', gear: 'test'};
  const options = M.workingOptions(reference);
  const atAnchor = M.evaluated(reference, alt, anchor[1], options);
  const watts = atAnchor.power.excessHp * 745.6998716;
  const areaM2 = watts / (atAnchor.drag.q * anchor[1] * 0.44704);
  const replay = row => {
    const airframe = testAircraft(ac, alt, row[4], ac.propGeometry, row[3]);
    return {inHg: row[2], observed: row[1], chartBhp: row[4], baseline: M.maxSpeed(airframe, alt, options),
      candidate: M.maxSpeed(airframe, alt, {...options, addedDragAreaM2: areaM2})};
  };
  return {alt, areaM2, clean, fit: replay(anchor), reserved: replay(reserved),
    limitations: 'Same 43-24777 installation at 20,800 ft and 3,000 rpm. Power from Packard chart, not measured torque. Rack drag area is equivalent, held constant for this local check only; no extrapolation to other speeds, loads or altitudes.'};
}
module.exports = {p47, mustang};
