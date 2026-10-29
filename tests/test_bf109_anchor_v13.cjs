'use strict';
const assert=require('node:assert/strict');
const {run}=require('../validation/diagnostics/bf109_anchor_audit_v13.cjs');
const r=run();
assert.equal(r.variants.length,4);
assert.equal(r.variants.filter(v=>v.anchorRating==='combat').length,2);
assert.equal(r.variants.filter(v=>v.anchorRating==='emergency').length,2);
for(const v of r.variants){
  const anchors=v.anchorRating==='combat'?v.seaLevel.combatMph:v.seaLevel.emergencyMph;
  assert.ok(Math.abs(anchors-325)<1e-5,'Every hypothesis reproduces its *conditional* 325 mph speed anchor');
  assert.ok(v.cd0>.005&&v.cd0<.085);
  assert.equal(v.emergencySpeedCurve.length,16,'No unsupported 109 F4 engine power beyond documented nodes');
  assert.ok(v.turnCurveAt5000ft.some(p=>p.sustainedDegSec!=null));
}
assert.ok(r.summary.engineRatingAssignmentEmergencySpeedShiftMph>13&&r.summary.engineRatingAssignmentEmergencySpeedShiftMph<15);
assert.ok(r.summary.samePowerAndAnchorSpeedSpreadMph<.5,
 'High-speed anchor at fixed power should not distinguish the drag factors');
assert.ok(r.summary.gregVsGenericTurnSpreadDegSec>3.0,
 'Low speed sustained turns must reveal that speed validation does not select induced drag');
assert.ok(r.summary.engineRatingAssignmentTurnShiftDegSec<.5,
 'The low-speed turn difference due to the power-label-induced CD0 change is much smaller');
assert.ok(r.independentEvidence.every(x=>x.independentTurnConstraint===false),
 'No unsupported primary or game evidence may be promoted to a validated polar');
assert.ok(Math.abs(r.historicalRegression.p47b.meanAbsErrorMph-3.65)<.05);
assert.ok(Math.abs(r.historicalRegression.p51b.meanAbsErrorMph-2.61)<.05);
console.log('PASS Bf109 v1.3: conditional anchor/rating/e differentiation + P47/P51 held-out regression + historical evidence gates');
