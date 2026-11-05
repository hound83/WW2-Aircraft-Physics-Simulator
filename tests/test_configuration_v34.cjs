'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const M=require('../src/physics.js'),F=require('../src/measured-climb.js'),C=require('../src/climb-conditions.js'),Q=require('../src/source-configuration.js'),R=require('../validation/diagnostics/configuration_v34.cjs');
const D=require('../aircraft/cases.json'),L=require('../references/p47b-measured-climb-v33.json'),P=require('../calibration/v3.4-policy.json'),active=require('../calibration/v3.4-configuration-model.json');
const a=D.aircraft.p47b,before=JSON.stringify({D,L,P,active}),close=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,a+' vs '+b);
const report=R.run();assert.equal(report.acceptance.pass,true);assert.equal(report.selected.summary.fit.count,5);assert.equal(report.selected.summary.check.count,5);
for(const change of [{errorFpm:null},{predictedFpm:null},{status:'blocked-measured-climb'}])assert.throws(()=>R.summarize(report.selected.rows.map((r,i)=>i?{...r}:{...r,...change}),P.splits[0]),/Unscorable/,'missing/blocked evidence must never score as zero error');
assert.throws(()=>R.summarize([],P.splits[0]),/Unscorable/);
assert.ok(report.selected.summary.check.mae<.7*report.selected.transferred.summary.check.mae);assert.ok(report.selected.summary.check.mae<.8*report.selected.refittedConstant.summary.check.mae);
assert.equal(report.acceptance.improvedStressCases,9);assert.ok(report.folds.every(f=>f.summary.check.mae<f.refittedConstant.summary.check.mae));
assert.ok(report.selected.rows.at(-1).errorFpm<0,'retain remaining high-altitude deficit');assert.ok(Math.abs(report.selected.rows.at(-1).errorFpm)<200);
assert.equal(active.heatFraction,report.selected.model.heatFraction);close(active.deltaCd0,report.selected.model.deltaCd0,1e-12);assert.deepEqual(active.fitStateIds,P.splits[0].fit);assert.ok(!active.fitStateIds.includes(L.states.at(-1).id));
// A corrupted check set must not change the fit, search ordering, or selected parameters.
const original=L.states.map(s=>s.observedFpm),searchBefore=R.search(P.splits[0]);
try{for(const s of L.states)if(!P.splits[0].fit.includes(s.id))s.observedFpm+=100000;assert.deepEqual(R.search(P.splits[0]),searchBefore);}finally{L.states.forEach((s,i)=>s.observedFpm=original[i]);}
for(const s of L.states){
 const prediction=Q.evaluate(M,F,C,a,L,s.id,active),old=F.evaluate(M,a,L,s.id,{deltaCd0:require('../calibration/v3.1-climb-model.json').aircraft.p47b.deltaCd0});
 assert.equal(prediction.shaftHp,s.shaftHp);assert.equal(prediction.propRpm,s.engineRpm*.5);assert.equal(prediction.propulsiveHp,old.propulsiveHp,'drag fit never changes available power');
 assert.equal(prediction.polar.cd0,M.workingOptions(a).polar.cd0);assert.ok(prediction.deltaCd0>=0&&prediction.deltaCd0<=.03);assert.equal(prediction.historicalAccuracy,null);
 const noObserved=structuredClone(L);delete noObserved.states.find(x=>x.id===s.id).observedFpm;const blind=Q.evaluate(M,F,C,a,noObserved,s.id,active);assert.equal(blind.predictedFpm,prediction.predictedFpm);assert.equal(blind.errorFpm,null);
 if(!active.fitStateIds.includes(s.id))assert.ok(Math.abs(prediction.errorFpm)<Math.abs(old.errorFpm),'each reserved residual improves');
}
// For the pure power-linked hypothesis, extra drag POWER / shaft power is constant.
const pure={...active,heatFraction:1},ratios=[L.states[0],L.states.at(-1)].map(s=>{const raw=F.evaluate(M,a,L,s.id),r=Q.evaluate(M,F,C,a,L,s.id,pure);return (raw.predictedFpm-r.predictedFpm)*r.weightLb*4.4482216153/196.850394/745.6998716/s.shaftHp;});close(ratios[0],ratios[1],1e-9);
const base=Q.evaluate(M,F,C,a,L,L.states[5].id,active),low=Q.evaluate(M,F,C,a,L,L.states[5].id,active,{retainedPowerScale:.97}),high=Q.evaluate(M,F,C,a,L,L.states[5].id,active,{retainedPowerScale:1.03});assert.ok(low.predictedFpm<base.predictedFpm&&high.predictedFpm>base.predictedFpm);assert.equal(low.shaftHp,base.shaftHp);assert.equal(low.polar.cd0,base.polar.cd0);
const rejected=(model=active,ledger=L,id=L.states[0].id,scenario={})=>assert.ok(Q.evaluate(M,F,C,a,ledger,id,model,scenario).status.startsWith('blocked'));
for(const change of [{deltaCd0:-.01},{deltaCd0:Infinity},{heatFraction:-1},{heatFraction:1.01},{sourceSha256:'wrong'},{identity:{...active.identity,specimen:'41-5931'}},{reference:{...active.reference,shaftHp:1900}},{configuration:{...active.configuration,cooling:'closed'}}])rejected({...active,...change});
rejected(active,L,'invented-6000-ft');rejected(active,L,L.states[0].id,{retainedPowerScale:1.2});rejected(active,L,L.states[0].id,{deltaCd0:0});rejected(active,L,L.states[0].id,{weightLb:NaN});
assert.equal(F.evaluate(M,a,{...L,states:null},L.states[0].id).status,'blocked-measured-climb');
assert.equal(JSON.stringify({D,L,P,active}),before,'solver and search do not mutate source, configuration or default aircraft');
// Keep the aircraft inputs frozen. The optional new engine path is tested separately;
// the pre-PR1 and numerical suites protect the compatibility path.
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(require('node:path').join(__dirname,'..',p),'utf8').replace(/\r\n/g,'\n')).digest('hex');
assert.equal(hash('aircraft/cases.json'),'c0e5f628496af2ca50c3dd181ddb97bd9257c1b20ec358e98aa86b4a1ebd78e1');
console.log('PASS train/check isolation, fair controls, paired stress, frozen calibration, aggregate-loss energy scaling, source gates, immutable inputs and generic-model preservation');
