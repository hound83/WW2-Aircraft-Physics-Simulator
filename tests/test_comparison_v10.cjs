const assert=require('node:assert/strict');
const {run,value}=require('../validation/diagnostics/comparison_audit_v10.cjs');
const {run:oldRun}=require('../validation/diagnostics/lift_sensitivity.cjs');
const d=require('../aircraft/cases.json');
const r=run(),old=oldRun();
assert.equal(r.pairs.length,3);
for(const [id,a] of Object.entries(r.aircraft)){
 assert.equal(a.baselineDegSec,old.aircraft[id].baseline.sustained170DegSec);
 assert.equal(a.speedAnchorPolarNonUniqueness.length,3);
 // A max-speed observation never picks a unique induced/parasite split.
 const cd=a.speedAnchorPolarNonUniqueness;
 assert.ok(cd[0].cd0<cd[1].cd0&&cd[1].cd0<cd[2].cd0);
 assert.ok(cd.every(x=>x.valid));
 assert.ok(!/measured|independently validated/.test(d.aircraft[id].clStatus),
   'original CLmax must not be represented as measured');
 assert.notEqual(a.sourceGate.clMax.status,'measured');
 assert.notEqual(a.sourceGate.stallSpeed.status,'validated CAS/EAS');
}
for(const p of r.pairs){
 const expected=value(p.aircraftA)-value(p.aircraftB);
 assert.equal(p.baselineDifferenceDegSec,expected);
 const [sa,sb]=p.sharedAssumptionDifferenceRange,[ia,ib]=p.independentAssumptionDifferenceRange;
 assert.ok(ia<=sa&&sb<=ib,'independent variations must envelop matched hypothetical');
 assert.ok(ia<=p.baselineDifferenceDegSec&&p.baselineDifferenceDegSec<=ib);
}
console.log('PASS v1.0: evidence gates, nonidentifiability and honest comparative/conditional sensitivity');
