'use strict';

const M = require('../../src/physics.js');
const lift = require('../../src/turn-lift.js');
const D = require('../../aircraft/cases.json');
const envelope = require('../../calibration/flight-envelope.json');
const source = require('../../references/p51-turn-lift-tn1044.json');

const KPH = 1.609344;
const KNOT = 1.150779448;
const G = 9.80665;
const MPH = .44704;
const W_PER_HP = 745.6998715822702;
const KG_PER_LB = .45359237;

function state(id, altFt, tasMph, opts) {
  const ac = D.aircraft[id];
  const options = {profile: 'P', flightEnvelope: envelope, ...opts};
  const baseline = M.evaluated(ac, altFt, tasMph, options);
  const selection = lift.scenario(M, ac, source, altFt, tasMph, options);
  const run = maneuverClMax => M.evaluated(ac, altFt, tasMph, {...options, clMax: selection.clMax, maneuverClMax});
  const corrected = M.evaluated(ac, altFt, tasMph, lift.optionsFor(M, ac, source, altFt, tasMph, options));
  const bracket = selection?.maneuverBracket?.map(cl => run(cl).limits.nSust) ?? null;
  return {baseline, corrected, bracket, liftSource: selection?.maneuverClMax != null ? 'TN1044 conditional transfer' : 'provisional'};
}

function summary(row) {
  const limits = row.limits;
  const n = limits.nSust;
  const rpm = row.prop.engineRpm;
  return {tasMph: row.tasMph, easMph: row.air.eas, mach: row.air.mach, stallEasMph: row.stallEasMph,
    nLift: limits.nLift, nPower: limits.nPower, nSust: n, degSec: limits.sustDegSec,
    seconds: limits.sustDegSec > 0 ? 360 / limits.sustDegSec : null,
    propulsiveHp: row.power.propulsiveHp, requiredHp: row.power.requiredHp, rpm};
}

function point(id, altFt, tasMph, opts) {
  const result = state(id, altFt, tasMph, opts);
  return {baseline: summary(result.baseline), corrected: summary(result.corrected),
    bracket: result.bracket, liftSource: result.liftSource};
}

function f4Diagnosis() {
  const ac = D.aircraft.bf109f4;
  const greg = M.inferredGregF4(ac, D.greg.bf109f4);
  return [[0, 20.3], [3000, 26.1]].map(([altM, observedSeconds]) => {
    const altFt = altM / .3048;
    const tasMph = M.tasFrom(270 / KPH, 'CAS', altFt);
    const opts = {profile: 'P', rating: 'emergency', flightEnvelope: envelope};
    const base = M.evaluated(ac, altFt, tasMph, opts);
    const gregResult = M.evaluated(ac, altFt, tasMph, {...opts,
      polar: {cd0: greg.cd0, e: greg.oswald, source: greg.source}});
    const v = tasMph * MPH;
    const targetN = Math.hypot(1, 2 * Math.PI * v / (observedSeconds * G));
    const induced = base.drag.dInd * targetN ** 2;
    const requiredHp = (base.drag.dParasite + induced) * v / W_PER_HP;
    const extraDragN = (base.power.propulsiveHp - requiredHp) * W_PER_HP / v;
    return {altM, observedSeconds, targetN, baseline: summary(base), gregPolarOnly: summary(gregResult),
      equivalentStallEasMph: base.air.eas / Math.sqrt(targetN), requiredHp,
      extraDragN, equivalentInducedRatio: 1 + extraDragN / induced,
      curvature: extraDragN / induced / (targetN ** 2 - 1)};
  });
}

function run() {
  const mustang = [5100, 8000, 9300, 15000].map(altFt => ({altFt,
    rows: [130, 145, 160, 175, 200].map(easMph => ({easMph,
      ...point('p51b', altFt, M.tasFrom(easMph, 'EAS', altFt), {rating: '67inHg'})}))}));
  const f4 = f4Diagnosis();
  // A nonlinear extra-drag hypothesis is calibrated at sea level only.
  const held = f4[1], x = held.baseline.nPower ** 2, k = f4[0].curvature;
  const n2 = 2 * x / (1 - k + Math.sqrt((1 - k) ** 2 + 4 * k * x));
  const heldRate = G * Math.sqrt(n2 - 1) / (held.baseline.tasMph * MPH) * 180 / Math.PI;
  const workbook = point('p51b', 20800, 250, {rating: '67inHg', gear: 'high'});
  const spitIl2 = [[0, 270, 17.7], [3000, 260, 20.5]].map(([altM, ias, observedSeconds]) => ({
    altM, observedSeconds, ...point('spitfire_lfix_bs543', altM / .3048,
      M.tasFrom(ias / KPH, 'CAS', altM / .3048), {weightLb: 3359 / KG_PER_LB})
  }));
  const p51Il2 = [[0, 290, 19], [3000, 295, 28]].map(([altM, ias, observedSeconds]) => ({
    altM, observedSeconds, ...point('p51b', altM / .3048,
      M.tasFrom(ias / KPH, 'CAS', altM / .3048), {rating: '67inHg'})
  }));
  const dcs = [['p51b', 4331, 132, 17], ['spitfire_lfix_bs543', 3525, 152, 24]]
    .map(([id, kg, kias, observedDegSec]) => {
      const tasMph = M.tasFrom(kias * KNOT, 'CAS', 0);
      const opts = {weightLb: kg / KG_PER_LB};
      const result = state(id, 0, tasMph, opts);
      const v = tasMph * MPH;
      const targetN = Math.hypot(1, observedDegSec * Math.PI / 180 * v / G);
      const {dParasite, dInd} = result.corrected.drag;
      const powerNeededHp = (dParasite + dInd * targetN ** 2) * v / W_PER_HP;
      return {id, kg, kias, observedDegSec, targetN, powerNeededHp, baseline: summary(result.baseline),
        corrected: summary(result.corrected), liftSource: result.liftSource};
    });
  return {source, mustang, f4, f4CurvatureTrial: {k, heldSeconds: 360 / heldRate, adopted: false},
    workbook, spitIl2, p51Il2, dcs, report: 'docs/TURN_STALL_CORRECTION.md'};
}

module.exports = {run, state};
