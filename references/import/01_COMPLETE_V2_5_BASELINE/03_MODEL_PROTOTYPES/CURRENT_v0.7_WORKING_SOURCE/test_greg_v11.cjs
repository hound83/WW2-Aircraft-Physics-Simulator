const assert=require('node:assert/strict');
const {run}=require('./greg_reconciliation_v11.cjs');
const m=require('./physics.js'),d=require('./cases.json');
const r=run(),close=(x,y,t)=>assert.ok(Math.abs(x-y)<=t,`${x} vs ${y}`);
// Greg's drag law and our SI aerodynamic law must be mathematically compatible.
for(const p of r.bf109.rows){
 close(p.reconstructed.parasLbf,p.greg.parasLbf,5.5);
 close(p.reconstructed.indLbf,p.greg.indLbf,2);
 close(p.reconstructed.requiredHp,p.greg.requiredHp,6);
}
for(const p of r.p47Dscenario.rows){
 close(p.reconstructed.parasHp,p.greg.parasHp,5.1);
 close(p.reconstructed.indHp,p.greg.indHp,3);
 close(p.reconstructed.requiredHp,p.greg.requiredHp,6.5);
}
// Test what actually makes the current solver different from Greg:
assert.ok(r.bf109.gregImplied.e<.60&&r.bf109.currentParams.e>.75);
assert.ok(r.bf109.isolatedTurnImpact.gregDerivedEDegSec<r.bf109.isolatedTurnImpact.baselineDegSec-3);
const s=m.maxSpeed(d.aircraft.bf109f4,0,{e:r.bf109.gregImplied.e,refit:true});
close(s,325,.03); // speed anchor preserved, *turn prediction changes*
assert.ok(r.p47Dscenario.gregImplied.cd0>r.p47Dscenario.currentSharedGeometryParams.cd0P47BAnchor);
assert.ok(r.p47Graph27k.meanAbsResidualG>.1,'screen reading mismatch remains visible');
assert.equal(r.p47Graph27k.chartSpeedKindAssumed,'CAS, UNVERIFIED');
console.log('PASS v1.1: Greg worksheet reconstruction, parameter difference and independent-case guardrails');
