'use strict';
const assert=require('node:assert/strict');
const M=require('../src/physics.js'),D=require('../aircraft/cases.json').aircraft;
const envelope=require('../calibration/flight-envelope.json'),report=require('../validation/diagnostics/flight_envelope.cjs').run();
const close=(a,b,tol=1e-8)=>assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<tol,`${a} versus ${b}`);
const fit=report.fits;
for(const row of fit){
 const actual=envelope.aircraft[row.id].fastFlight[row.gear],generated=report.calibration.aircraft[row.id].fastFlight[row.gear];
 assert.equal(actual.shape,generated.shape);
 close(actual.machEnd,generated.machEnd,1e-12);
 close(actual.slope,generated.slope,1e-12);close(actual.offset,generated.offset,1e-12);
 assert.ok(row.folds.filter(f=>f.shape===row.shape).every(f=>f.beforeMae>f.afterMae));
 assert.ok(row.blocks.every(f=>f.beforeMae>f.afterMae));
 assert.ok(row.heldRating.every(r=>Math.abs(r.after-r.observed)<=Math.abs(r.before-r.observed)+1e-7));
}
for(const r of report.speeds){
 const improves=r.id==='p51b'||r.id==='spitfire_lfix_bs543';
 if(improves)assert.ok(r.afterMae<r.beforeMae*.35);
 else close(r.beforeMae,r.afterMae);
}
for(const s of report.loadStress)for(const r of s.aircraft){
 if(r.id==='p51b'||r.id==='spitfire_lfix_bs543')assert.ok(r.beforeMae-r.afterMae>2);
 else close(r.beforeMae,r.afterMae);
}
for(const r of report.climbGuard)close(r.before,r.after);
assert.ok(report.f4Challenger.every(r=>r.excessHp<-200));
const opts={profile:'P',flightEnvelope:envelope};
const f4=D.bf109f4,spit=D.spitfire_lfix_bs543,p47=D.p47b,p51=D.p51b;
assert.equal(M.maxSpeed(f4,7000/.3048,opts),null);
const at=(ac,alt,tas,options={})=>M.evaluated(ac,alt,tas,{...opts,...options});
for(const [ac,alt,tas] of [[spit,16000,394],[p51,18000,415],[spit,16000,200],[p51,18000,220]]){
 const auto=at(ac,alt,tas),low=at(ac,alt,tas,{gear:'low'}),high=at(ac,alt,tas,{gear:'high'});
 close(auto.power.excessHp,Math.max(low.power.excessHp,high.power.excessHp));
}
for(const ac of Object.values(D)){
 const {altFt,tasMph,rating,gear}=ac.calibration,old=M.evaluated(ac,altFt,tasMph,{profile:'P',rating,gear});
 close(at(ac,altFt,tasMph,{rating,gear}).power.excessHp,old.power.excessHp);
}
const forced={gear:'low',rating:'67inHg'};
const edge1=at(p51,10300,400,forced),edge2=at(p51,10300.1,400,forced);
close(edge1.installedDeltaCd0,edge2.installedDeltaCd0,1e-7);
assert.equal(at(p51,13000,400,forced).installedDeltaCd0,0);
assert.equal(at(p51,8000,170,forced).installedDeltaCd0,0);
assert.equal(at(p51,32000,550,{gear:"high"}).installedDeltaCd0,0);
const unloaded=at(p51,22000,400,{gear:'high'}),loaded=at(p51,22000,400,{gear:'high',storesWeightLb:500,addedDragAreaM2:.10});
assert.ok(loaded.power.requiredHp>unloaded.power.requiredHp);
close(loaded.installedDeltaCd0,unloaded.installedDeltaCd0);

assert.deepEqual(envelope.aircraft.p47b,report.calibration.aircraft.p47b);
for(const row of report.powerReplay){close(row.newHp,row.observedHp);assert.equal(row.propRpm,row.rating==='normal'?1275:1350);}
assert.equal(report.powerReplay.filter(r=>r.oldHp===null&&r.newHp!==null).length,7);
assert.equal(at(p47,0,180).engine.bhp,2000);
assert.equal(at({...p47,stallIdentity:{...p47.stallIdentity,specimen:'41-5931'}},0,180).status,'no-engine-source');
const normal={rating:'normal',flightCooling:true};
assert.equal(at(p47,12599,195,normal).status,'no-engine-source');
assert.equal(at(p47,35001,305,normal).status,'no-engine-source');
assert.equal(at(p47,35000,310,normal).status,'no-cooling-source');
assert.equal(at(p47,35000,305,{...normal,addedDragAreaM2:1}).status,'no-cooling-source');
const p47Check=report.coolingReplay.filter(r=>!r.fit);
const mae=key=>p47Check.reduce((s,r)=>s+Math.abs(r[key]-r.observed),0)/p47Check.length;
assert.ok(mae('clean')>500&&mae('open')<35);
const high=at(p47,35000,305,normal);
close(high.power.climbFpm,366.4167552209,1e-6);
assert.equal(high.prop.propRpm,1275);
assert.ok(M.bestClimb(p47,35000,{...opts,...normal}).best);
assert.equal(at(spit,10000,190,{flightCooling:true}).coolingDeltaCd0,envelope.aircraft.spitfire_lfix_bs543.cooling.deltaCd0);
assert.equal(at(spit,34000,220,{flightCooling:true}).status,'no-cooling-source');
console.log('PASS altitude-block and rating checks, mass/e stress, frozen anchors, gear selection, historical P-47B power/RPM/cooling and F-4 evidence gates');

