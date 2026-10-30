'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const S=require('../validation/diagnostics/robustness_v29.cjs'),V=require('../validation/diagnostics/joint_calibration_v28.cjs');
const D=require('../aircraft/cases.json'),F=require('../calibration/v2.8-working-model.json'),P=require('../calibration/v2.9-robustness-policy.json');
const archived=require('../validation/current/v29-robustness.json');
assert.equal(P.version,require('../package.json').version);
assert.equal(archived.workingCalibration,F.version);
assert.deepEqual(archived.policy,P);
assert.equal(archived.independentHistoricalValidation,false);
assert.equal(archived.pairwiseAccuracy,null);
assert.throws(()=>S.inFit('speed','p51b',0,'unknown'),/Unknown/);
assert.throws(()=>S.finite(NaN,'missing'),/nonfinite/);
assert.equal(S.ownChecks({speed:[],climbs:[]},'original')[0].climbMae,null,'no observations is not zero error');
const before=JSON.stringify(D);
for(const split of P.splits){
 for(const [id,a]of Object.entries(D.aircraft)){
  const rows=V.speedRows(id);
  assert.ok(rows.some((p,i)=>!S.inFit('speed',id,i,split)),id+' speed check coverage');
  if(id==='bf109f4')continue;
  assert.ok(a.observedClimb.some((p,i)=>S.inFit('climb',id,i,split)),id+' climb fit coverage');
  assert.ok(a.observedClimb.some((p,i)=>!S.inFit('climb',id,i,split)),id+' climb check coverage');
 }
}
for(const id of ['p51b','p47b','spitfire_lfix_bs543']){
 const a=S.fitAircraft(id,F.sharedPropeller,F.aircraft[id].e,'original'),b=V.fitAircraft(id,'P',F.sharedPropeller,F.aircraft[id].e);
 assert.ok(Math.abs(a.score-b.score)<1e-10,id+' original objective reproduction');
 assert.ok(Math.abs(a.delta-b.delta)<1e-12);
}
const ac=D.aircraft.spitfire_lfix_bs543,p=ac.observedClimb[1],original=p.fpm;
const base=S.fitAircraft('spitfire_lfix_bs543',F.sharedPropeller,.6,'original');
try{p.fpm+=10000;const changed=S.fitAircraft('spitfire_lfix_bs543',F.sharedPropeller,.6,'original');assert.equal(changed.score,base.score);assert.equal(changed.delta,base.delta,'excluded climb cannot alter fit');}finally{p.fpm=original;}
assert.equal(JSON.stringify(D),before);
const chart=S.chartScenarios(),figure=S.figureScenarios();
assert.equal(chart.rows.length,90);assert.equal(chart.paired.length,27);
assert.ok(chart.rows.filter(r=>r.altFt!==2200).every(r=>r.residualFpm===null),'unobserved rates stay null');
function close(actual,expected,label){
 if(typeof expected==='number'){assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=1e-8+1e-11*Math.abs(expected),label);return;}
 if(expected&&typeof expected==='object'){assert.deepEqual(Object.keys(actual),Object.keys(expected),label+' shape');for(const k of Object.keys(expected))close(actual[k],expected[k],label+'.'+k);return;}
 assert.equal(actual,expected,label);
}
close(chart,archived.chart,'recomputed chart envelope');
assert.equal(figure.rows.length,162);close(figure,archived.figure5,'recomputed Figure 5');
assert.deepEqual([...new Set(figure.rows.map(r=>r.sourceRpm))],[2100,2300,2700,3000]);
const good=['p51b','p47b','spitfire_lfix_bs543','bf109f4'].map(id=>({id,speedCheckDelta:0,climbCheckDelta:id==='bf109f4'?null:id==='p47b'?-11:0}));
assert.equal(S.guardrails(good),true);
assert.equal(S.guardrails(good.map(r=>r.id==='p51b'?{...r,speedCheckDelta:.51}:r)),false);
assert.equal(S.guardrails(good.map(r=>r.id==='p47b'?{...r,climbCheckDelta:-9}:r)),false);
assert.ok(archived.candidateChecks.length>1);
assert.equal(archived.decision.promote,archived.candidateChecks.some(r=>r.pass));
for(const s of archived.splits){assert.ok(s.nearOptimal.length>0);assert.equal(s.fixedChecks.find(x=>x.id==='bf109f4').climbMae,null);}
const html=fs.readFileSync(path.join(__dirname,'../dist/model.html'),'utf8');assert.ok(html.includes('id="v29-robustness"'));assert.ok(html.includes('27 of 27 tested power/weight scenarios'));
console.log('PASS v2.9 robustness: split coverage, fit exclusion, original objective parity, source chart/RPM grids, null observations, promotion rejection and UI disclosure');
