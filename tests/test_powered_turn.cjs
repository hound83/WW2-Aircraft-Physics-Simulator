'use strict';

const assert = require('node:assert/strict');
const { browserData } = require('../validation/diagnostics/shared_flight_climb.cjs');
const { addAircraftBatch } = require('../scripts/aircraft-batch.cjs');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { replay } = require('../validation/diagnostics/powered_turn.cjs');

const data = addAircraftBatch(browserData(),buildCatalog());
const before = JSON.stringify(data);
const report = replay(data);
const { clean, open, asTas, observation, formula, scenarios } = report;
const close = (value, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(value - expected) < tolerance, value + ' differs from ' + expected);
};

assert.equal(JSON.stringify(data),before);
assert.equal(data.specification.aircraft[observation.modelId].performanceIntake,true);
assert.equal(observation.conditions.airspeedCalibration,null);
assert.equal(observation.conditions.startKmh,360);
assert.equal(observation.conditions.endKmh,360);
assert.equal(observation.conditions.elapsedSeconds,22);
assert.equal(observation.replay.fitPoints,0);
assert.equal(observation.replay.reservedTimedTurns,1);
assert.equal(observation.replay.independentRepeatRuns,0);
assert.ok(observation.relatedTurns.every(row => row.startKmh > row.endKmh));

close(report.observedRateDegSec,360/22);
close(clean.observedGeometry.bankLoad,2.923804400);
close(clean.observedGeometry.timeLoad,3.212699938);
close(clean.observedGeometry.impliedTasKmh,339.625367);
close(clean.observedGeometry.secondsAtBank,24.447253397);
assert.ok(clean.observedGeometry.bankLoad < observation.conditions.reportedG);
assert.ok(clean.observedGeometry.timeLoad > observation.conditions.reportedG);
assert.equal(clean.limiting,'power');
assert.ok(clean.liftLimitG > clean.observedGeometry.timeLoad);
close(clean.seconds,23.996205704);
close(clean.residuals.rateDegSec,-1.361264554);
close(clean.power.atSourceLoads.timeLoad.excessHp,-123.736775390);
close(clean.power.atSourceLoads.reportedLoad.excessHp,-13.729517688);
assert.ok(clean.power.atSourceLoads.bankLoad.excessHp > 0);
close(open.seconds,26.150856241);
assert.ok(open.power.levelHp > clean.power.levelHp);
assert.equal(open.power.shaftBhp,clean.power.shaftBhp);
close(asTas.seconds,22.754462199);
assert.ok(asTas.tasMph < clean.tasMph);

assert.equal(scenarios.length,12);
assert.equal(formula.cases,15);
assert.ok(formula.maxRateDifferenceDegSec < 1e-10);
assert.ok(formula.maxDragDifferenceHp < 1e-8);
assert.ok(formula.maxPowerLimitedEquilibriumDifferenceHp < 1e-8);
assert.deepEqual(report.scenarioRanges.seconds,[
  Math.min(...scenarios.map(row=>row.seconds)),Math.max(...scenarios.map(row=>row.seconds)),
]);
const differentTime = { ...observation, conditions:{ ...observation.conditions, elapsedSeconds:25 } };
const changed = replay(data,differentTime);
assert.deepEqual(changed.clean.turn,clean.turn);
assert.equal(changed.clean.seconds,clean.seconds);
assert.notEqual(changed.clean.residuals.rateDegSec,clean.residuals.rateDegSec);
assert.notEqual(changed.clean.observedGeometry.timeLoad,clean.observedGeometry.timeLoad);
assert.throws(() => replay(data,{ ...observation,conditions:{...observation.conditions,endKmh:330} }),/matching speed endpoints/);
console.log('Powered turn: observed timing kept outside the calculation, independent kinematics and power balance checked.');
