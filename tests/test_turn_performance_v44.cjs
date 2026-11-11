'use strict';

const assert=require('node:assert/strict');
const M=require('../src/physics.js');
const B=require('../src/operating-benchmark.js');
const T=require('../src/turn-lift.js');
const P=require('../src/turn-performance.js');
const V43=require('../validation/diagnostics/operating_benchmark_v43.cjs');
const V44=require('../validation/diagnostics/turn_performance_v44.cjs');
const L=require('../references/p51-turn-lift-tn1044.json');
const E=require('../references/v44-turn-evidence.json');

const report=V44.run();
assert.equal(report.rows.length,90);
assert.equal(report.directTurns.matched,0);
assert.equal(report.lift.rows.length,5);
assert.equal(report.lift.meanOutsideAfter,0);
assert.ok(report.lift.meanOutsideBefore>.25);
assert.ok(E.mustang.check.every(r=>!E.mustang.fit.some(f=>f[0]===r[0])));
assert.equal(P.liftRead(E.mustang,.19),null);
assert.equal(P.liftRead(E.mustang,.49),null);

const close=(a,b,label)=>{
 if(b===null)assert.equal(a,null,label);
 else assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=1e-9+1e-12*Math.abs(b),label);
};
for(const r of report.rows){
 const canChange=r.id==='p51b'&&[10000,20000,30000].includes(r.altFt);
 for(const k of Object.keys(r.before)){
  if(canChange&&['turnDegSec','turnEasMph','turnG'].includes(k))continue;
  close(r.after[k],r.before[k],r.id+' '+r.altFt+' '+r.mode+' '+k);
 }
 if(canChange)assert.ok(r.after.turnDegSec<=r.before.turnDegSec+1e-8);
}
const peak=report.rows.find(r=>r.id==='p51b'&&r.mode==='combat'&&r.altFt===10000);
assert.ok(peak.after.turnDegSec<peak.before.turnDegSec-1.5);
assert.ok(peak.after.turnEasMph>peak.before.turnEasMph+20);

const d=V44.withTurnData(V43.buildData()),model=d.models.p51b,S=d.specification,s=S.aircraft.p51b;
const settings={mode:'combat',fuelFraction:.5,extension:true};
const weight=B.load(s,S.policy,settings).weightLb;
const at=(alt,eas,more={},climbing=false)=>B.evaluate(M,T,L,model,s,{...settings,...more},alt,eas,weight,undefined,climbing);
const r=at(10000,175);
assert.equal(r.benchmark.maneuverLift.source,'naca-tn1044-figure-6');
assert.ok(!at(10000,175,{},true).benchmark.maneuverLift);
assert.ok(!at(10000,175,{openCooling:true}).benchmark.maneuverLift);
assert.ok(!at(35000,175).benchmark.maneuverLift);
assert.ok(!at(10000,100).benchmark.maneuverLift);
assert.ok(!at(10000,375).benchmark.maneuverLift);
const bracket=P.assessment(r,E.sensitivity),q=bracket.nominal;
close(q.turn.rateDegSec,r.limits.sustDegSec,'same turn equation');
close(q.turn.g,r.limits.nSust,'same sustained load');
assert.ok(bracket.range.lower.g<=q.turn.g&&bracket.range.upper.g>=q.turn.g);
assert.ok(q.levelHp+q.turnDragHp<=q.availableHp+1e-8);
assert.ok(q.turn.g<=Math.min(q.nLift,q.nPower,q.nStructure)+1e-8);
const same=P.state(r,{dragFraction:1.15});
close(same.levelHp,q.levelHp,'turn drag sensitivity holds the 1 G requirement');
assert.ok(same.turn.g<=q.turn.g+1e-8);
assert.equal(P.difference(P.assessment(at(10000,70),E.sensitivity),bracket),null);

const corsair=d.models.f4u4,profile=S.aircraft.f4u4;
assert.equal(B.fittedInjection(corsair,profile).installation.variant,'F4U-4');
assert.equal(B.fittedInjection(corsair,profile).installation.engine,'Pratt & Whitney R-2800-18W');
assert.ok(profile.injection.installation.sources.every(id=>S.sources[id]?.url.startsWith('https://')));
assert.equal(B.fittedInjection(model,profile),null);
assert.equal(B.fittedInjection({...corsair,ac:{...corsair.ac,engine:'unmatched'}},profile),null);
assert.equal(B.fittedInjection({...corsair,ac:{...corsair.ac,variant:'F4U-1D'}},profile),null);
assert.throws(()=>B.validateSettings(profile,{mode:'combat',injection:true},model),/engine and variant/);
for(const [id,ac] of Object.entries(d.models))assert.equal(Boolean(B.fittedInjection(ac,S.aircraft[id])),id==='f4u4');
const pair=report.comparison.find(x=>x.altFt===10000&&x.mode==='combat');
const slow=pair.samples.find(x=>x.easMph===150).difference,fast=pair.samples.find(x=>x.easMph===200).difference;
assert.equal(slow.side,'b');
assert.ok(slow.range[1]<0);
assert.ok(fast.rateDegSec>0);
assert.equal(fast.side,'uncertain');
assert.ok(fast.range[0]<0&&fast.range[1]>0);
