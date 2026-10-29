const assert=require('node:assert/strict');
const {run,point}=require('../validation/diagnostics/lift_sensitivity.cjs');
const d=require('../aircraft/cases.json'),m=require('../src/physics.js');
const r=run();
assert.deepEqual(Object.keys(r.aircraft),['bf109f4','p47b','p51b']);
for(const [id,result] of Object.entries(r.aircraft)){
 assert.equal(result.scenarios.length,9);
 assert.ok(result.baseline.peakSustained.value>=result.baseline.sustained170DegSec-1e-8);
 const ac=d.aircraft[id];
 for(const e of [.6,.78,.9]){
  const low=point(ac,e,ac.clMaxAssumed*.85,170),high=point(ac,e,ac.clMaxAssumed*1.15,170);
  assert.ok(high.stallEasMph<low.stallEasMph,'higher CLmax lowers stall EAS');
  assert.ok(high.limits.nInst>=low.limits.nInst,'higher CLmax cannot lower instantaneous lift limit');
 }
 for(const f of [.85,1,1.15]){
  const low=point(ac,.6,ac.clMaxAssumed*f,170),high=point(ac,.9,ac.clMaxAssumed*f,170);
  assert.ok(high.drag.inducedLbf<low.drag.inducedLbf,'greater e lowers induced drag');
  assert.ok(high.limits.nSust>=low.limits.nSust,'greater e cannot lower sustained turn under same fixed anchor polar');
 }
 const baseline=point(ac,.78,ac.clMaxAssumed,170);
 const rerun=m.evaluated(ac,5000,m.tasFrom(170,'EAS',5000));
 assert.equal(baseline.limits.sustDegSec,rerun.limits.sustDegSec,'baseline solver unchanged');
}
assert.ok(r.aircraft.bf109f4.sensitivity.sustained170DegSec[0] <=r.aircraft.p51b.sensitivity.sustained170DegSec[1],
 'overlapping assumptions cannot establish a fixed 109/P51 historical ranking');
console.log('PASS v0.9 lift/induced-drag 3-aircraft sensitivity grid, power/stall invariants and frozen baseline');
