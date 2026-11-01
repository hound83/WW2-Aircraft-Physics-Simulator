'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../src/physics.js'),D=require('../aircraft/cases.json'),C=require('../src/climb-conditions.js'),model=require('../calibration/v3.1-climb-model.json');
const S=require('../references/climb-condition-states.json').states,R=require('../validation/diagnostics/high_altitude_v32.cjs');
const before=JSON.stringify({D,S,model}),out=R.run();
assert.equal(out.coefficientChanges,0);assert.equal(out.sourceHashesVerified,true);assert.equal(model.chargeExponent,.75);assert.equal(model.heatFraction,0);
assert.equal(model.aircraft.p47b.deltaCd0,.018868610875495496);assert.equal(model.aircraft.spitfire_lfix_bs543.deltaCd0,.003721641620434722);
for(const r of out.rows.filter(r=>r.status==='blocked')){assert.equal(r.predictedFpm,null);assert.equal(r.error,null);}
const high=out.rows.find(r=>r.altFt===34000);assert.equal(high.status,'qualified check');assert.ok(high.error< -250,'retain unfavorable new check rather than refitting it away');
assert.equal(out.rows.find(r=>r.altFt===32000).status,'diagnostic-only');
const p=S.find(s=>s.aircraftId==='p47b'),a=D.aircraft.p47b;
assert.throws(()=>C.evaluate(M,a,p,model,{requireMatchedSpecimen:true}),/specimen/);
assert.throws(()=>C.evaluate(M,a,{...p,transferPolicy:undefined},model),/specimen/);
assert.throws(()=>C.evaluate(M,a,{...p,sourceSpecimen:undefined},model),/specimen/);
assert.equal(C.evaluate(M,a,p,model).validationEligibility,'cross-specimen engineering only');
const sp=S.find(s=>s.aircraftId==='spitfire_lfix_bs543');assert.equal(C.evaluate(M,D.aircraft[sp.aircraftId],sp,model,{requireMatchedSpecimen:true}).validationEligibility,'same-specimen qualified source scenario');
const performance=require('../validation/diagnostics/performance_validation.cjs').run();
for(const r of performance.rows.filter(r=>r.aircraftId==='p47b'&&r.metric==='climb-rate')){assert.equal(r.specimen,'41-5931');assert.equal(r.prediction.specimen,'41-5902');assert.notEqual(r.conditionStatus,'matched');assert.equal(r.validationEligible,false);assert.ok(r.source.reference.includes('1469'));}
assert.equal(JSON.stringify({D,S,model}),before);assert.equal(out.independentHistoricalAccuracy,null);
assert.ok(fs.readFileSync(require('node:path').join(__dirname,'../dist/model.html'),'utf8').includes('cross-specimen engineering benchmarks'));
console.log('PASS high-altitude validation: frozen coefficients, source hashes, blocked nulls, unfavorable residual, strict specimen gate and qualified transfer');
