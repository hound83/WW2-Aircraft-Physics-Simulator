'use strict';
// Requires full Git history. Does not rewrite the accepted comparison fixture.
const assert=require('node:assert/strict'),cp=require('node:child_process'),vm=require('node:vm'),crypto=require('node:crypto');
const B=require('../validation/baseline/pre-pr1-comparison.json'),S=require('../references/climb-condition-states.json').states;
const read=p=>cp.execFileSync('git',['show',B.baselineCommit+':'+p],{cwd:require('node:path').resolve(__dirname,'..'),encoding:'utf8',maxBuffer:8*1024*1024});
const engine=read('src/physics.js'),cases=read('aircraft/cases.json'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
assert.equal(sha(engine),B.engineSha256);assert.equal(sha(cases),B.casesSha256);
const box={module:{exports:{}}};vm.runInNewContext(engine,box);const M=box.module.exports,D=JSON.parse(cases),opts={profile:'C',e:.78};
for(const r of B.rows){const a=D.aircraft[r.id];let pred;
 if(r.kind==='speed')pred=M.maxSpeed(a,r.altFt,{...opts,rating:r.rating,gear:r.gear});
 else if(r.id==='p51b')pred=M.bestClimb(a,r.altFt,{...opts,rating:r.rating,gear:'low',engineModel:'ram-critical',weightLb:9335,minTasMph:120,maxTasMph:260,stepMph:1}).climbFpm;
 else {const p=a.observedClimb.find(p=>p.altFt===r.altFt);if(r.id==='p47b'){const fit=r.kind==='conditional-climb'?M.equivalentClimbDrag(a,a.observedClimb[0],opts):null;pred=M.climbPrediction(a,p,{...opts,...(fit?{addedCd0:fit.addedCd0}:{})}).predictedFpm;}
 else {const s=S.find(s=>s.aircraftId===r.id&&s.altFt===r.altFt);pred=M.evaluated(a,r.altFt,p.tasMph,{...opts,rating:p.rating,gear:p.gear,weightLb:7485,...(s.engineCondition?{engineCondition:s.engineCondition}:{})}).power.climbFpm;}}
 assert.ok(Math.abs(pred-r.predicted)<1e-6,r.id+' '+r.kind+' '+r.altFt+': '+pred+' vs '+r.predicted);
}
const a=D.aircraft.p47b,fit=M.equivalentClimbDrag(a,a.observedClimb[0],opts),mae=a.observedClimb.reduce((sum,p)=>sum+Math.abs(M.climbPrediction(a,p,{...opts,addedCd0:fit.addedCd0}).predictedFpm-p.fpm),0)/a.observedClimb.length;
assert.ok(Math.abs(mae-B.summary.find(s=>s.id==='p47b').conditionalClimbMae)<1e-6);
console.log('Verified pre-PR1 fixture: source hashes, '+B.rows.length+' original-engine predictions and pre-existing P47 conditional fit.');
