'use strict';
const assert=require('node:assert/strict');
const physics=require('./physics.js');
const cases=require('./cases.json');
const {run}=require('./bf109_rating_resolution_v14.cjs');
const r=run();
const [generic,greg]=r.variants;

assert.equal(cases.aircraft.bf109f4.calibration.rating,'combat');
assert.equal(cases.aircraft.bf109f4.calibration.tasMph,325);
assert.equal(cases.aircraft.bf109f4.observedSpeed[1].role,'withheld-rating-check');
assert.ok(r.sourceNotes.some(x=>x.level.includes('secondary')));
assert.equal(r.calibration.originalGermanReportInspected,false);
assert.ok(r.variants.length===2);

for(const v of r.variants){
  assert.ok(v.cd0>.005&&v.cd0<.085);
  assert.ok(Math.abs(v.seaLevel.combatMph-325)<.001,'The single speed anchor is combat, not emergency');
  assert.ok(v.seaLevel.emergencyMph>335&&v.seaLevel.emergencyMph<342,
    'Do not fit emergency speed, but compare the withheld historical value');
  assert.ok(v.seaLevel.emergencyResidualMph>2&&v.seaLevel.emergencyResidualMph<4);
  assert.ok(v.fiveThousandFt.combatTurn170Eas.turnDegSec<v.fiveThousandFt.emergencyTurn170Eas.turnDegSec);
  assert.ok(v.combatClimbTime1000to5000m.status==='modelled-integration');
  assert.equal(v.combatClimbTime1000to5000m.points.length,16);
  // v1.4 historical climb match is not a required property of later model
  // revisions; correcting the DB601E reduction ratio exposes the coincidence.
  const gearCorrected=cases.aircraft.bf109f4.propGeometry.reductionRatioEnginePerProp===1.685;
  assert.ok(Math.abs(v.combatClimbTime1000to5000m.elapsedS-240)<(gearCorrected?30:22));
  assert.equal(v.curves.emergencySpeed.length,16);
}
assert.ok(Math.abs(generic.seaLevel.emergencyMph-greg.seaLevel.emergencyMph)<.5,
  'Two drag polars have nearly indistinguishable high-speed outcome');
assert.ok(generic.fiveThousandFt.combatTurn170Eas.turnDegSec-
  greg.fiveThousandFt.combatTurn170Eas.turnDegSec>3,
  'Turn predictions cannot be classified as validated merely by matching Vmax');
if(cases.aircraft.bf109f4.propGeometry.reductionRatioEnginePerProp===1.685){
  assert.ok(Math.abs(greg.combatClimbTime1000to5000m.elapsedS-229.9)<.3,
    'v1.5 must preserve the documented gear-ratio correction, not the earlier coincidence');
}else assert.ok(Math.abs(greg.combatClimbTime1000to5000m.elapsedS-240)<2);
assert.equal(physics.maxSpeed(cases.aircraft.bf109f4,15800,{rating:'emergency'}),null,
  'Never extrapolate the emergency engine above its highest sourced node');

assert.ok(Math.abs(r.otherAircraftRegression.p47b.holdoutMeanAbsErrorMph-3.65)<.05);
assert.ok(Math.abs(r.otherAircraftRegression.p51b.holdoutMeanAbsErrorMph-2.61)<.05);
assert.equal(r.otherAircraftRegression.p47b.holdoutCount,5);
assert.equal(r.otherAircraftRegression.p51b.holdoutCount,8);
assert.ok(r.guardrails.turnDuration.includes('1 minute'));
console.log('PASS Bf109 v1.4 compatibility: historical combat anchor, withheld emergency, explicit v1.5 gearing correction + unchanged Allied regressions');
