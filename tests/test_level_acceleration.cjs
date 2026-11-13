'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const { browserData } = require('../validation/diagnostics/shared_flight_climb.cjs');
const { addAircraftBatch } = require('../scripts/aircraft-batch.cjs');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { sourceChecks } = require('../validation/diagnostics/aircraft_intake.cjs');
const { replay, run } = require('../validation/diagnostics/level_acceleration.cjs');
const sources = require('../references/analysis/level-acceleration-evidence-2026-11-13.json');

const base = browserData(), catalog = buildCatalog(), data = addAircraftBatch(base,catalog);
const modelBefore = JSON.stringify(data);
const checks = run(data,sourceChecks(base,catalog));
const { nominal, observation, standardAtmosphereSensitivity:standard } = checks;
const { endpoints, conditions } = observation;
const close = (actual, expected, tolerance) => {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${actual} differs from ${expected} by more than ${tolerance}`);
};

assert.equal(JSON.stringify(data),modelBefore);
assert.equal(conditions.airspeedCalibration,null);
assert.equal(endpoints.intermediateSamples,null);
assert.equal(endpoints.independentReservedIntervals,0);
assert.equal(nominal.status,'reached');
assert.ok(nominal.trace.every(point => point.covered === false));
assert.deepEqual(nominal.trace.map(point => point.seconds),nominal.trace.map(point => point.seconds).sort((a,b) => a-b));
assert.ok(nominal.trace.slice(1).every((point,i) => point.value > nominal.trace[i].value));
assert.equal(nominal.trace[0].value,endpoints.startKnots);
assert.equal(nominal.trace.at(-1).value,endpoints.endKnots);
assert.equal(nominal.trace.at(-1).seconds,nominal.seconds);

const massKg = 8900 * .45359237, mphToMps = .44704, wattsPerHp = 745.6998716;
const kineticEnergyChange = massKg * mphToMps ** 2 *
  (nominal.endpointsTasMph[1] ** 2 - nominal.endpointsTasMph[0] ** 2) / 2;
close(nominal.observedEquivalentMeanExcessHp,kineticEnergyChange / (wattsPerHp * endpoints.elapsedSeconds),.00001);
close(nominal.modeledMeanExcessHp,kineticEnergyChange / (wattsPerHp * nominal.seconds),.00001);
const expectedDensity = M.isa(nominal.pressureAltitudeFt).p / (287.05287 * 283.15);
close(M.isa(nominal.densityAltitudeFt).rho,expectedDensity,1e-9);
assert.deepEqual(nominal.endpointsEasMph,standard.endpointsEasMph);
assert.ok(nominal.endpointsTasMph[0] > standard.endpointsTasMph[0]);
assert.ok(nominal.seconds > standard.seconds);
assert.ok(nominal.maxTipMach < nominal.tipLossOnset);
close(nominal.seconds,93.32229,.00001);
close(nominal.residualSeconds,nominal.seconds - endpoints.elapsedSeconds,.000001);
close(nominal.residualPct,100 * nominal.residualSeconds / endpoints.elapsedSeconds,.000001);
close(nominal.timerCheck.fineSeconds,nominal.timerCheck.speedQuadratureSeconds,.0005);
close(nominal.seconds,nominal.timerCheck.speedQuadratureSeconds,.002);
const revisedTime = replay(data,{ audit:true },{ ...observation,endpoints:{ ...endpoints,elapsedSeconds:150 } });
for (const key of ['seconds','modeledMeanExcessHp','trace','timerCheck']) assert.deepEqual(revisedTime[key],nominal[key]);
assert.notEqual(revisedTime.residualSeconds,nominal.residualSeconds);
assert.equal(checks.scenarios.length,18);
assert.ok(checks.scenarios.every(row => row.status === 'reached'));
assert.ok(checks.scenarioRangeSeconds[0] < nominal.seconds && nominal.seconds < checks.scenarioRangeSeconds[1]);

assert.equal(checks.wartime.point.tasMph,362);
assert.equal(checks.wartime.point.shaftBhp,1140);
assert.equal(checks.wartime.equilibriumErrorMph,-1.66);
assert.ok(checks.wartime.tasAccelerationMphPerSecond < 0);
assert.deepEqual(checks.spitfire.rows.map(row => [row.altFt,row.role]),[
  [7000,'check'],[8000,'check'],[10000,'fit'],[12000,'check'],
]);
for (const row of checks.spitfire.rows) {
  const vertical = 9.80665 * row.observedFpm * .3048 / 60 / (row.tasMph * mphToMps ** 2);
  close(row.verticalOnly.observed,vertical,.000001);
  assert.ok(row.slopeToFt < sources.spitfire.conditions.gearChangeAltFt);
  assert.ok(row.withScheduleEnergy.observed > row.verticalOnly.observed);
}

assert.equal(checks.formulaCheck.checkedForceBalancePoints,36);
assert.ok(checks.formulaCheck.maxDifferenceMphPerSecond < 1e-9);
assert.deepEqual(checks.probe.map(row => row[0]),checks.regression.aircraft.map(row => row.aircraft));
if (checks.version === '4.14.0-rc.2') {
  assert.equal(checks.regression.exactScorecardParity,true);
  assert.equal(checks.regression.exactFixedProbeParity,true);
}
console.log('Level acceleration: report basis, fixed mass and power, observed-time independence, force balance, timer and 12-profile regression verified.');
