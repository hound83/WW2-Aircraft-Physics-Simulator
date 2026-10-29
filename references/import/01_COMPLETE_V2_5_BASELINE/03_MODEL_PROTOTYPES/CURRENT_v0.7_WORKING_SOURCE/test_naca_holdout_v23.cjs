const assert=require('node:assert/strict');
const data=require('./naca_inflight_prop_holdout_v23.cjs');
assert.equal(data.measurements.length,12);
assert.ok(data.lowSpeedClimb.MAEEfficiency<.10);
assert.equal(data.lowSpeedClimb.count,6);
assert.equal(data.highSpeed.count,6);
assert.ok(data.measurements.every(x=>Number.isFinite(x.etaNaca1941Graph)));
console.log('1945 NACA P-47D direct flight propeller η checked; no fit performed.');
