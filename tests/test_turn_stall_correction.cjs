'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const lift = require('../src/turn-lift.js');
const source = require('../references/p51-turn-lift-tn1044.json');
const {p51b} = require('../aircraft/cases.json').aircraft;
const {run, state} = require('../validation/diagnostics/turn_stall_correction.cjs');

const near = (actual, expected, tolerance = 1e-8) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' vs ' + expected);
const report = run();
const sample = report.mustang.find(row => row.altFt === 8000).rows.find(row => row.easMph === 175);
near(sample.baseline.nSust, 2.94281589388901);
near(sample.corrected.stallEasMph, 103.3871410242965);
near(sample.corrected.nSust, 2.525639692107349);
assert.ok(sample.bracket[0] < sample.corrected.nSust && sample.corrected.nSust < sample.bracket[1]);

// Hurt, Flight at High Lift Conditions and Turning Performance.
const g = sample.corrected.nSust;
const bank = Math.acos(1 / g);
const tasKnots = sample.corrected.tasMph / 1.150779448;
near(sample.corrected.degSec, 1091 * Math.tan(bank) / tasKnots, .02);
const {baseline, corrected} = state('p51b', 8000, sample.corrected.tasMph, {rating: '67inHg'});
near(corrected.limits.nLift,
  (corrected.air.eas / corrected.stallEasMph) ** 2 * corrected.limits.maneuverClMax / corrected.clMax);
near(corrected.power.excessHp, baseline.power.excessHp);
near(corrected.power.climbFpm, baseline.power.climbFpm);
const f4 = report.f4[1];
assert.ok(f4.baseline.nPower < f4.baseline.nLift);
assert.ok(f4.extraDragN > 0 && !report.f4CurvatureTrial.adopted);
near(report.workbook.corrected.nSust, 2.3877270823772214);
const opts = {profile: 'P'};
assert.equal(lift.optionsFor(M, p51b, source, 15000, 200, opts), opts);
assert.equal(lift.optionsFor(M, p51b, source, 8000, 200, {...opts, storesWeightLb: 200}).clMax, undefined);
const high = lift.optionsFor(M, p51b, source, 8000, 300, opts);
assert.equal(high.maneuverClMax, p51b.clMaxAssumed);
assert.equal(M.evaluated(p51b, 8000, 200, {...opts, maneuverClMax: 0}).status, 'invalid-input');
assert.equal(M.evaluated(p51b, 8000, 200, {...opts, maneuverClMax: .1}).limits.nSust, null);
