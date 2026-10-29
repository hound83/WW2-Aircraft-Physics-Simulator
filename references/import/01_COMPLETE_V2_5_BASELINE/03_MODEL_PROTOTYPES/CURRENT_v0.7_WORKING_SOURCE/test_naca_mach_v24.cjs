'use strict';
const assert=require('node:assert/strict');const fs=require('fs');const vm=require('vm');
const M=require('./physics.js'),D=require('./cases.json'),R=require('./naca_mach_analysis_v24.json');
const NACA=M.nacaMachResearch;
assert.ok(NACA(.8,.85).eta===.85,'low Mach research effect should vanish');
const p=NACA(1.16,.8),q=NACA(1.06,.8);
assert.ok(Math.abs((q.eta/p.eta)-1.07)<1e-12,'source ratio anchors 1945 observation');
assert.ok(q.eta>p.eta,'lower tip Mach should improve efficiency');
assert.ok(NACA(1.25,.8).eta<p.eta,'higher Mach should decrease efficiency');
assert.ok(R.scores.highSpeed.MAE_M<R.scores.highSpeed.MAE_N,'published Mach correction should be tested, not assumed helpful');
assert.equal(R.scores.climb.MAE_N,R.scores.climb.MAE_M,'study must not change lower-speed P47D climbs');
assert.equal(R.mustangClimb[0].M,R.mustangClimb[0].N,'mustang climb deficit MUST remain, no magic correction');
assert.equal(R.mustangClimb[1].M,R.mustangClimb[1].N,'higher boost must also remain unchanged');
for (const a of Object.values(D.aircraft)) {
 const ref=a.calibration,engine=M.shaftPower(a,ref.altFt,ref.rating,ref.gear);
 const n=M.propEta(a,ref.altFt,ref.tasMph,engine.bhp,'N',ref.rating),
       x=M.propEta(a,ref.altFt,ref.tasMph,engine.bhp,'M',ref.rating);
 assert.ok(x.eta<=n.eta+1e-12,'no invented power bonus');
}
const h=fs.readFileSync('./Universal_Four_Aircraft_Model_v2.4.html','utf8');
assert.ok(h.includes('version:"2.4"'));
assert.ok(h.includes('option value="M"'));
assert.ok(h.includes('v2.4 — historical source review'));
const block=h.match(/<script>\/\* Universal Model v0\.2 ([\s\S]*?)<\/script>/);
assert.ok(block,'must have rebuilt embedded new physics');new vm.Script('/* Universal Model v0.2 '+block[1]);
assert.ok(h.includes('function nacaMachResearch('));
console.log('PASS 12/12 source-bounded Mach profile, four aircraft, unchanged Mustang miss, and offline HTML syntax');
