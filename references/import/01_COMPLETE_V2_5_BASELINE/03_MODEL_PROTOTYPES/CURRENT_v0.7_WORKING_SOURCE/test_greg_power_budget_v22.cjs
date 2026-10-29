'use strict';
const assert=require('node:assert/strict');
const M=require('./physics.js'),D=require('./cases.json');
const R=require('./greg_power_budget_v22.cjs');
function near(x,y,t,msg){assert.ok(Number.isFinite(x)&&Math.abs(x-y)<=t,`${msg}: ${x} vs ${y}`);}
const p=D.aircraft.p51b,f=D.aircraft.bf109f4;
// Every speed fraction is traceable back to the preserved original Greg table.
for(const r of D.greg.p47d28.reference){
 near(M.propEta(p,2200,r[0],1603,'G','67inHg').eta,r[4]/2600,1e-10,'Greg P47D power transfer');
}
near(M.propEta(p,2200,175,1603,'G','67inHg').eta,2080/2600,1e-12,'175mph != .85');
near(M.propEta(p,2200,225,1603,'G','67inHg').eta,.85,1e-12,'225mph plateau');
near(R.gregPowerAvailable.sharedShapeMeanAbsoluteDifferencePct,.76,.015,'matching Greg shapes');
const current=M.bestClimb(p,2200,{rating:'67inHg',weightLb:9335,engineModel:'ram-critical'});
near(current.climbFpm,3401.08615,.03,'v2.1 baseline unchanged');
for(const r of R.mustang.cases){
 assert.ok(r.original.climbFpm<r.gregTransferRefitToOriginalSeaLevelSpeed.climbFpm);
 assert.ok(r.gregTransferRefitToOriginalSeaLevelSpeed.climbFpm<r.gregTransferFixedPolar.climbFpm);
 assert.ok(r.gregTransferFixedPolar.climbFpm<r.historicalClimbFpm);
 assert.ok(r.etaRequiredAtOriginalOptimumIfOnlyPropChanged>.84);
 near(r.deficitUsefulHp,(r.historicalClimbFpm-r.original.climbFpm)*9335/33000,1e-8,'excess hp conversion');
}
near(R.anchorCrossChecks.p51b.baselineMph,361.5,.001,'P51 speed preserved');
assert.ok(R.anchorCrossChecks.p51b.gregMinusSourceMph>5,'G profile breaks source speed without drag refit');
near(R.anchorCrossChecks.p51b.gregRefitMph,361.5,.001,'speed refit changes drag');
near(R.bf109.gregInferredPolar.oswald,.5576706734059873,1e-10,'Greg F4 e');
near(R.bf109.gregInferredPolar.cd0,.02437284688790079,1e-10,'Greg F4 CD0');
assert.ok(R.bf109.seaLevelSpeedCrossCheck.gregPolarWithC.combat<320,'Turn fit cannot conceal combat top-speed shortfall');
assert.ok(R.bf109.impliedPeakEtaIfCombatPowerRating>.89);
assert.ok(R.bf109.impliedPeakEtaIfEmergencyPowerRating<.80);
for(const r of R.bf109.turns){
 assert.ok(Math.abs(r.gregPolarWithCEtaSeconds-r.IL2Seconds)<.3,'Greg polar keeps independent IL2 turn near source');
 assert.ok(Math.abs(r.modelGenericE078Seconds-r.IL2Seconds)>2,'old e=.78 turn mismatch remains visible');
 assert.ok(Math.abs(r.gregOriginalF4PowerScheduleIfEmergencyDenominatorSeconds-
   r.gregOriginalF4PowerScheduleIfCombatDenominatorSeconds)>1.5,'109 shaft rating ambiguity matters');
}
const base109=M.evaluated(f,0,270/1.609344,{rating:'emergency'});
assert.ok(base109.status==='modelled','F4 old solver path remains active');
console.log('PASS v2.2: original Greg row arithmetic; Mustang power residual, IAS turn and high-speed constraints, old default intact');
