'use strict';
const assert=require('node:assert/strict');
const M=require('./physics.js'),D=require('./cases.json');
const {run}=require('./spitfire_audit_v20.cjs');
const spit=D.aircraft.spitfire_lfix_bs543,R=run();
let count=0;
function test(name,fn){fn();console.log('PASS',name);count++;}
test('Primary BS.543 four-blade RA10061 10ft9in and 0.477 reduction, 7,110 / 7,485 lb separated',()=>{
 assert.equal(spit.propGeometry.diameterFt,10.75);
 assert.equal(spit.historicalConditions.levelSpeed.weightLb,7110);
 assert.equal(spit.historicalConditions.climb.weightLb,7485);
 assert.equal(spit.observedSpeed.length,21);
 assert.equal(spit.observedClimb.length,16);
 assert.ok(Math.abs(1/spit.propGeometry.reductionRatioEnginePerProp-.477)<1e-7);
});
test('Historic level-speed anchor remains only speed fitted; Spit has 20 true unfitted speed rows',()=>{
 assert.ok(Math.abs(R.speed.rows[0].modelTasMph-336)<1e-6);
 assert.equal(R.speed.heldoutCount,20);
 assert.ok(R.speed.maeMph>3&&R.speed.maeMph<7);
});
test('All prior aircraft data remain exactly present, v1.9 unchanged',()=>{
 assert.equal(Object.keys(D.aircraft).length,4);
 assert.equal(D.aircraft.p51b.weightLb,9240);
 assert.equal(D.aircraft.p47b.weightLb,12565);
 assert.equal(D.aircraft.bf109f4.weightLb,6371);
 assert.ok(!('engineCondition' in D.aircraft.p51b));
});
test('Missing boost measurements are explicitly rejected rather than guessed',()=>{
 assert.equal(M.shaftPowerAtMeasuredBoost(spit,20000,'combat+18','high',{}),null);
 assert.equal(M.evaluated(spit,20000,224,{gear:'high',engineCondition:{referenceBoostPsi:18.5,observedBoostPsi:15.8}}).status,'no-engine-source');
});
test('Source boost correction at same rating/gear uses ABSOLUTE manifold pressure',()=>{
 const ac=M.shaftPowerAtMeasuredBoost(spit,22000,'combat+18','high',
  {referenceBoostPsi:18.5,observedBoostPsi:13.8,source:'A&AEE 1943'});
 const sh=M.shaftPower(spit,22000,'combat+18','high');
 assert.ok(ac.bhp<sh.bhp);
 assert.ok(Math.abs(ac.absoluteManifoldRatio-(14.6959+13.8)/(14.6959+18.5))<1e-10);
});
test('At +18/+18 below full-throttle: zero shift and equal historical climb prediction',()=>{
 const p=R.climb.find(x=>x.altFt===2000);
 assert.equal(p.conditionAwareManifoldRatio,1);
 assert.equal(p.conditionAwareFpm,p.predAtReportedSpeedFpm);
});
test('MAP correction improves SOURCE-HELD climb-rate accuracy across 15 altitude points by >65%',()=>{
 assert.equal(R.boostPowerComparison.observations,15);
 assert.ok(R.boostPowerComparison.rawClimbMaeFpm>350);
 assert.ok(R.boostPowerComparison.sourceBoostConditionedClimbMaeFpm<125);
 assert.ok(R.boostPowerComparison.sourceBoostConditionedClimbMaeFpm/R.boostPowerComparison.rawClimbMaeFpm<.35);
});
test('20-30k comparison is not a hidden radiator fit and 14k remains unavailable',()=>{
 assert.equal(R.climb.find(x=>x.altFt===14000).conditionAwareFpm,null);
 for(const p of R.climb.filter(x=>x.altFt>=20000))assert.equal(p.modelRadiators,'CLOSED baseline drag only');
});
test('Spitfire IXe IL-2 two-alt turn points are external and unconditioned baseline has no fit',()=>{
 assert.equal(R.il2Turns.length,2);
 assert.ok(R.il2Turns[0].modelAtTakeoffWeight.turnSeconds<17.7);
 assert.ok(R.il2Turns[1].modelAtTakeoffWeight.turnSeconds<20.5);
});
test('Optional simulator-conditioned e only fits 0m and holds 3km out of calibration',()=>{
 const o=R.optionalSimulatorConditionedE;
 assert.ok(o.fittedE>.55&&o.fittedE<.7);
 assert.ok(Math.abs(o.levels[0].residualSeconds)<.02);
 assert.ok(Math.abs(o.levels[1].residualSeconds)<1);
 assert.equal(o.levels[1].role,'WITHHELD simulation altitude');
});
test('No installed propeller curve or historical Spitfire turn test is claimed',()=>{
 assert.equal(R.gates.exactInstalledBladeEtaMapAvailable,false);
 assert.equal(R.gates.primarySpitTurnAvailable,false);
});
console.log(`PASS ${count}/11 v2.0 Spitfire/boost tests`);
