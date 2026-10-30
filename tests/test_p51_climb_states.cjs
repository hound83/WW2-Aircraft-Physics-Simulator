'use strict';
const assert=require('node:assert/strict'),C=require('../validation/lib/chart_reading.cjs'),R=require('../validation/diagnostics/p51_climb_states.cjs'),L=require('../references/p51-climb-state-reconstruction.json'),M=require('../src/physics.js'),D=require('../aircraft/cases.json');
assert.deepEqual(C.reading({ticks:[[10,100],[20,200]],pixelAllowance:1,roundOut:10},[12,16]),[110,170]);
assert.deepEqual(C.reading({ticks:[[10,200],[20,100]],pixelAllowance:1,roundOut:10},[12,16]),[130,190]);
for(const axis of [{ticks:[[1,2],[1,3]],pixelAllowance:0,roundOut:1},{ticks:[[1,2],[3,4]],pixelAllowance:-1,roundOut:1}])assert.throws(()=>C.reading(axis,[1,2]));
assert.throws(()=>C.reading(L.axes.fig4Weight,[20,10]));
const bad=structuredClone(L);bad.scans.fig4.sha256='0'.repeat(64);assert.throws(()=>R.verifySources(bad),/checksum/);
const r=R.run();assert.equal(r.weightCurve.length,5);assert.equal(r.powerCurve.length,5);
assert.equal(C.pointAt(L,'power',2200,'61inHg'),null);assert.equal(C.pointAt(L,'power',2300,'75inHg'),null);
for(const p of r.weightCurve){assert.equal(p.usableAsMatchedClimbWeight,false);assert.equal(C.weightForClimb(p),null);assert.ok(p.bounds[0]<p.bounds[1]);}
for(const p of r.comparisons){
 assert.equal(p.weightAdoption,null);assert.ok(p.jointGrid.remainingShortfallFpm>100);
 assert.ok(p.requiredShaftHpAtPriorFixedEta>p.powerReadingBhp[1]);assert.ok(p.inverseMassOnlyLb<p.weightCurveScenarioLb[0]-500);
 assert.ok(p.jointGrid.samples>20);assert.ok(p.jointGrid.max.climbFpm<p.reportedFpm);
 assert.ok(p.weightOnlyGridFpm[1]-p.baselineFpm<50);
 const at=R.chartPrediction(2200,p.rating,p.baselineShaftHp,9335);
 assert.ok(Math.abs(at.climbFpm-p.baselineFpm)<1e-5,'source power must reproduce existing optimum at same fixed-polar state');
}
assert.equal(r.acceptedDefaultCorrection,null);assert.equal(r.unresolved.climbTasMph,null);
assert.equal(D.aircraft.p51b.weightLb,9240);
const polar=M.cd0FromAnchor(D.aircraft.p51b,'C',.78);
assert.ok(polar.valid);
console.log('PASS chart units/sign, source hashes, missing-node policy, weight-role isolation and shared-solver fixed-polar sensitivity');
