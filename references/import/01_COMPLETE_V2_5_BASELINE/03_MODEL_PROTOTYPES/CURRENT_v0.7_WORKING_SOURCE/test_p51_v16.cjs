'use strict';
const assert=require('node:assert/strict');
const M=require('./physics.js');
const D=require('./cases.json');
const before=require('./cross_aircraft_results_v15.json');
const after=require('./p51_drag_validation_v16.cjs').run();
const ac=D.aircraft.p51b;
for(const p of before.profiles){
  const current=after.scenarios.find(x=>x.profile===p.profile);
  assert.ok(current);
  assert.ok(Math.abs(p.p51.polar.cd0-current.calibratedPolar.cd0)<1e-12,'P-51 original speed fit frozen');
}
const unmodified=after.baselineUnmodified;
assert.ok(Math.abs(unmodified.p47SpeedHoldoutMAEMph-before.keyMetrics.p47SpeedHoldoutMaeMph)<1e-10);
assert.ok(Math.abs(unmodified.p51SpeedHoldoutMAEMph-before.keyMetrics.p51SpeedHoldoutMaeMph)<1e-10);
assert.ok(Math.abs(unmodified.bf109ClimbSeconds-before.keyMetrics.f4GenericClimbSeconds)<1e-10);
assert.ok(Math.abs(unmodified.bf109CombatToEmergencyMph-before.keyMetrics.f4EmergencyGenericMph)<1e-10);
const p51=after.scenarios.find(x=>x.profile==='C');
assert.equal(p51.points.length,6,'Original figure digitization points');
const first=p51.points[0];
assert.equal(first.engineRpm,2100);
assert.ok(Math.abs(first.propRpm-2100/(44/21))<1e-9,'Historic RPM converted through installed reduction');
assert.ok(Math.abs(first.etaAtSourceRpm-first.etaIfIncorrectlyAt3000Rpm)>.001,'Source RPM actually used');
assert.ok(Math.abs(M.propEta(ac,22400,270,490,'C','67inHg',{engineRpmOverride:3000}).eta
  -M.propEta(ac,22400,270,490,'C','67inHg').eta)<1e-12,'Unspecified RPM identical to rating default');
assert.equal(M.propEta(ac,22400,270,490,'C','67inHg',{engineRpmOverride:0}),null);
assert.ok(p51.points[1].observedEtaNeededForCurrentPolar>.91,'Show mismatch rather than fitting an impossible eta');
assert.equal(after.oswaldSensitivity.at(-1).e,1,'Constrained e upper edge');
for(const point of after.p51ClimbPowerGap){
  assert.ok(point.gapFpm>350&&point.gapFpm<500);
  assert.ok(point.extraPropulsiveHpNeeded>100&&point.extraPropulsiveHpNeeded<130);
}
console.log('v1.6 passed: unchanged three-aircraft baseline, correct original 2100-3000 RPM, source-qualified lower-speed mismatch, no stealth coefficients.');
