'use strict';
const assert = require('node:assert/strict');
const {run} = require('../validation/diagnostics/stall_test_replay.cjs');
const report = run();

assert.deepEqual(report.p47d30.windows.map(window => window.figure), ['48', '49', '50', '51a']);
for (const window of report.p47d30.windows) {
  assert.equal(window.historicalResidualMph, null);
  assert.ok(window.weightLb > 0);
  assert.ok(window.scenarios[0].midpointCn > window.scenarios.at(-1).midpointCn);
}
assert.ok(report.spitfireVa.twoStateMae < report.spitfireVa.pooledMae);
const at150 = report.p47bSustainedSensitivity.find(point => point.easMph === 150);
const at200 = report.p47bSustainedSensitivity.find(point => point.easMph === 200);
assert.ok(at150.cases.every(point => point.limit === 'lift'));
assert.ok(at150.cases[0].nSust < at150.cases.at(-1).nSust);
assert.ok(at200.cases.every(point => point.limit === 'power' && point.nSust === at200.cases[0].nSust));
