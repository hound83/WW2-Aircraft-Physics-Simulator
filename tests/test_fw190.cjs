/* Unfitted, different-aircraft generalization test; intentionally expects nonzero error. */
'use strict';
const assert=require('node:assert/strict'),D=require('../aircraft/stores.json'),V=require('../validation/diagnostics/stores_validation.js');
assert.equal(D.fw190a4.specimen,'619');
assert.equal(D.fw190a4.stages.length,5);
assert.deepEqual(D.fw190a4.stages.map(s=>s.speedMph),[321,318,317,310,293]);
assert.equal(D.fw190a4.stages[1].weightKg,null,'unknown wheel-door weight stays unknown');
assert.deepEqual(D.fw190a4.furtherControl.lossesKmH,[22,58,73]);
assert.deepEqual(D.fw190a4.pitotCaveat.extraIasUnderReadKmH,[6,7]);
const out=V.auditFw190(D,{inducedShare:.07,sourceMode:'raw'});
assert.ok(Math.abs(out.mosquitoDelta-.14853617069)<1e-7);
assert.equal(out.rows[0].transferMph,321,'clean prediction must remain clean, not inherit loaded penalty');
assert.equal(out.rows[2].transferMph,null,'Mosquito complete-store fit is NOT used to predict an ETC-only rack');
assert.equal(out.rows[1].impliedParasiteFraction,null,'never infer unknown weight');
assert.equal(out.rows[1].transferMph,null);
assert.equal(out.bomb.sourcePenalty,28,'321−293 arithmetic retained separately from rounded 29');
assert.equal(out.bomb.reportedLossMph,29,'original printed rounding retained');
assert.ok(Math.abs(out.bomb.impliedParasiteFraction-.28531673771)<1e-7);
assert.ok(Math.abs(out.bomb.transferMph-304.58322147)<1e-5);
assert.ok(out.bomb.transferResidualMph>11&&out.bomb.transferResidualMph<12,'unfitted cross-airframe transfer fails visibly');
const corrected=V.auditFw190(D,{inducedShare:.07,sourceMode:'raf-corrected'});
assert.ok(corrected.bomb.transferResidualMph>out.bomb.transferResidualMph);
for(const share of [.03,.07,.12,.17]){
 const d=V.auditFw190(D,{inducedShare:share,sourceMode:'raw'});
 assert.ok(d.bomb.impliedParasiteFraction>d.mosquitoDelta,'real source needs more effective parasite penalty than the Mosquito-fitted common fraction');
 assert.ok(d.bomb.transferMph>293,'generic transfer too fast across modeled plausible induced shares');
}
assert.throws(()=>V.auditFw190(D,{inducedShare:-.1}),/Invalid/);
assert.throws(()=>V.auditFw190(D,{inducedShare:.7}),/Invalid/);
console.log('PASS v0.7 Fw 190 W.Nr.619 actual stage losses + nontransfer of Mosquito single drag percentage + pitot correction evidence');
