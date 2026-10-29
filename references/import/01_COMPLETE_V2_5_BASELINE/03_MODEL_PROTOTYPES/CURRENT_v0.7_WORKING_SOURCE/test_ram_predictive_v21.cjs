/* v2.1 source boundaries, dimensional ram pressure and four-aircraft gates. */
'use strict';
const assert=require('node:assert/strict');
const M=require('./physics.js'),D=require('./cases.json');
const A=require('./ram_predictive_audit_v21.cjs');
const S=D.aircraft.spitfire_lfix_bs543,P=D.aircraft.p51b,F=D.aircraft.bf109f4,R=D.aircraft.p47b;
let count=0;
const test=(name,fn)=>{fn();count++;console.log('PASS',name)};
test('ideal stagnation pressure equals ISA p*(1+0.2M²)^3.5',()=>{
 const x=M.inletPressureAtSpeed(22000,407,1),at=M.isa(22000);
 assert.ok(Math.abs(x.pressurePa-at.p*(1+.2*x.mach*x.mach)**3.5)<1e-7);
});
test('zero recovery restores static ambient pressure',()=>{
 const x=M.inletPressureAtSpeed(22000,407,0);
 assert.ok(Math.abs(x.pressurePa-x.staticPa)<1e-9);
});
test('critical source node gives exactly its historical MAP setpoint',()=>{
 for(const [gear,alt,speed,psi] of [['low',10800,384,18],['high',22000,407,18.5]]){
  const x=M.ramManifoldAtSpeed(S,alt,speed,'combat+18',gear);
  assert.ok(Math.abs(x.manifoldGaugePsi-psi)<1e-5);
 }
});
test('maximum rated boost is held well below P-51 critical altitude',()=>{
 for(const rating of ['67inHg','75inHg']){
  const x=M.ramManifoldAtSpeed(P,2200,195,rating,'low');
  assert.equal(x.status,'predicted');assert.equal(x.regulated,true);
  const b=M.shaftPower(P,2200,rating,'low');
  const y=M.shaftPowerAtRamSpeed(P,2200,195,rating,'low');
  assert.equal(y.bhp,b.bhp);assert.equal(y.ramPowerRatio,1);
 }
});
test('P-51 75-inHg level critical point is an explicitly flagged INFERENCE, not measured climb FTH',()=>{
 const x=P.inletRam.ratings['75inHg'].low;
 assert.equal(x.criticalAltitudeFt,7400);
 assert.equal(x.criticalTasMph,411.5);
 assert.match(x.criticalSource,/INFERRED/);
 assert.match(x.criticalSource,/2,200ft/);
});
test('rated-MAP engine chart permits P-51 75-inHg predictive best-climb search at all speed samples',()=>{
 const x=M.bestClimb(P,2200,{rating:'75inHg',gear:'low',weightLb:9335,engineModel:'ram-critical'});
 assert.equal(x.status,'modeled-peak');
 assert.ok(x.viableSpeedSamples>180);
 assert.ok(Math.abs(x.climbFpm-3978.5)<1);
 const slow=M.shaftPowerAtRamSpeed(P,2200,100,'75inHg','low');
 assert.ok(slow?.referenceMapInHg===75||slow?.ram?.regulated);
});
test('P-51 1944 climb holds out: full boost but about 400 fpm short at both ratings',()=>{
 const rows=A.run().mustang2200Ft;
 assert.equal(rows.length,2);
 assert.ok(rows.every(x=>x.regulated&&x.modelClimbStatus==='modeled-peak'));
 assert.ok(rows.every(x=>x.historicalMinusModelClimbFpm>380&&x.historicalMinusModelClimbFpm<430));
 assert.ok(rows.every(x=>x.remainingUsefulPowerEquivalentHp>100));
});
test('Bf 109 low-altitude regulator cannot be the cause of a sea-level turn deficit',()=>{
 for(const rating of ['combat','emergency']){
  const x=M.ramManifoldAtSpeed(F,3000/.3048,170,rating,'fluid');
  assert.equal(x.regulated,true);
 }
});
test('Spitfire ram boost predictions use NO historical climb boost as an input',()=>{
 const x=A.run().spitfire.ideal;
 assert.equal(x.observations,16);
 for(const row of x.rows)assert.equal(row.measuredClimbBoostUsedAsInput,false);
 assert.ok(x.pressureMaePsi<.6,`historic MAP MAE ${x.pressureMaePsi}`);
});
test('Spitfire predicted power improves historical climb over original solver',()=>{
 const x=A.run().spitfire.ideal;
 assert.ok(x.predictedClimbMaeFpm<155);
 assert.ok(x.predictedClimbMaeFpm<x.originalClimbMaeFpm*.45);
});
test('Spitfire no-recovery control is worse than ideal ram in MAP check',()=>{
 const x=A.run().spitfire;
 assert.ok(x.recovery0.pressureMaePsi>x.ideal.pressureMaePsi);
});
test('Spitfire speed holdouts do not regress substantially',()=>{
 const x=A.run().spitfire.speed;
 assert.ok(x.predictiveHoldoutMaeMph<6);
});
test('IL-2 109 F4 sea-level/3km 20.3/26.1s sanity unaffected by this engine mechanism',()=>{
 const x=A.run().bf109Turns;
 assert.ok(Math.abs(x[0].predictedTurnSeconds-20.3)<.1);
 assert.ok(Math.abs(x[1].predictedTurnSeconds-26.1)<.3);
});
test('P-47 turbo stays unchanged; opt-in ram model fails closed without a source',()=>{
 assert.equal(M.ramManifoldAtSpeed(R,15000,250,'military','turbo').status,'missing-source-critical-point');
 assert.equal(M.evaluated(R,15000,250,{engineModel:'ram-critical'}).status,'no-engine-source');
});
test('do not allow the observed-pressure override and predictive model at once',()=>{
 assert.equal(M.evaluated(S,22000,225,{engineModel:'ram-critical',engineCondition:{referenceBoostPsi:18,observedBoostPsi:13,source:'test'}}).status,'invalid-input');
});
test('ram model rejects impossible recovery, missing rating and uncalibrated speed extrapolation',()=>{
 assert.equal(M.ramManifoldAtSpeed(S,22000,225,'combat+18','high',{recovery:1.1}).status,'invalid-ram-condition');
 assert.equal(M.ramManifoldAtSpeed(S,22000,225,'bad-rating','high').status,'missing-source-critical-point');
 assert.equal(M.referenceLevelTas(S,15000,'combat+18','high'),null);
});
console.log(`${count} predictive ram tests passed`);
