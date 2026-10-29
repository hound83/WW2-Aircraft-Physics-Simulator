import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const m=require('./physics.js'),d=JSON.parse(fs.readFileSync(new URL('./cases.json',import.meta.url)));
const close=(a,b,tolerance,label)=>assert.ok(Math.abs(a-b)<=tolerance,`${label||''}: got ${a}; expected ${b} ±${tolerance}`);
// Source worksheet transcription is an *internal* mathematical benchmark, not aircraft observation.
const g109=d.greg.bf109f4.reference;for(const r of g109){const o=m.greg109At(d,r[0]);close(o.paraDrag,r[1],4,'109 parasite drag');close(o.indDrag,r[2],1.4,'109 induced drag');close(o.totalDrag,r[3],5,'109 total drag (worksheet rounding)');close(o.reqHp,r[4],6.5,'109 power required (worksheet rounding)');close(o.availableHp,r[7],.01,'109 power available');}
const inf=m.inferredGregF4(d.aircraft.bf109f4,d.greg.bf109f4);close(inf.oswald,.55767,.001,'109 implied e');close(inf.cd0,.024373,.0002,'109 implied CD0');
const g47=d.greg.p47d28.reference;const p47last=g47.at(-1);for(const r of g47){const [v,preq,ppr,pi]=r;const parasite=p47last[2]*Math.pow(v/p47last[0],3),induced=p47last[3]*p47last[0]/v;close(parasite,ppr,5,'Greg P-47 parasite power');close(induced,pi,3,'Greg P-47 induced power');close(parasite+induced,preq,6,'Greg P-47 total power');}
const inf47=m.inferredGregP47(d.aircraft.p47b,d.greg.p47d28);close(inf47.oswald,.784,.003,'Greg D28 implied e');
for(const altitude of [0,5000,12000,25000,34000])for(const tas of [170,290,430]){const speeds=m.airspeeds(tas,altitude);close(m.trueFromCAS(speeds.cas,altitude),tas,1e-9,'TAS-CAS reversible');close(m.tasFrom(speeds.eas,'EAS',altitude),tas,1e-9,'TAS-EAS reversible');assert.equal(speeds.ias,null);}
assert.throws(()=>m.tasFrom(140,'IAS',5000),/calibration/);
for(const [id,ac] of Object.entries(d.aircraft)){const cal=ac.calibration;const anchor=m.evaluated(ac,cal.altFt,cal.tasMph,{profile:'C'});assert.equal(anchor.status,'modelled');close(anchor.power.excessHp,0,1e-5,`calibration anchor ${id}`);for(const e of [.6,.78,.9]){let pt=m.evaluated(ac,cal.altFt,220,{e});if(pt.power){close(pt.power.excessHp,(pt.power.propulsiveHp-pt.power.requiredHp),1e-8,'power conservation');assert.ok(pt.limits.nSust==null||pt.limits.nSust<=pt.limits.nInst+1e-12,'sustained <= instantaneous');}}}
const lower=m.evaluated(d.aircraft.bf109f4,5000,45,{profile:'C'});assert.equal(lower.status,'below-provisional-stall');assert.equal(lower.limits.nSust,null);
const missing=m.evaluated(d.aircraft.bf109f4,27000,200);assert.equal(missing.status,'no-engine-source','no invented BF109 engine power at 27000ft');
const p47At0=m.evaluated(d.aircraft.p47b,0,300);assert.equal(p47At0.status,'no-engine-source','no P47 B sea-level extrapolation');
for(const [id,ac] of Object.entries(d.aircraft)){const speed=m.maxSpeed(ac,ac.calibration.altFt,{profile:'C'});close(speed,ac.calibration.tasMph,.02,`anchor max speed ${id}`);}
// v0.3: one new calibration observation, four genuinely withheld climb observations.
const p47=d.aircraft.p47b;
const extra=m.equivalentClimbDrag(p47,p47.observedClimb[0]);
assert.equal(extra.status,'derived');assert.ok(extra.addedCd0>0,'positive extra configuration drag in this data set');
close(extra.addedCd0,.015819,.00005,'one-point climb configuration fit');
let oldAbs=0,newAbs=0;for(const [i,point] of p47.observedClimb.entries()){
 const old=m.climbPrediction(p47,point),corrected=m.climbPrediction(p47,point,{addedCd0:extra.addedCd0});
 assert.equal(old.status,'estimated');assert.equal(corrected.status,'estimated');
 assert.equal(corrected.engine.climbMapInHg,point.observedMapInHg);
 if(i===0)close(corrected.residualFpm,0,.001,'calibration point does not leak into holdout');
 else{oldAbs+=Math.abs(old.baselineFpm-point.fpm);newAbs+=Math.abs(corrected.residualFpm);}
}
assert.ok(newAbs<oldAbs,'source-configuration correction improves held-out climb without refitting each point');
const eng30=m.climbConditionEngine(p47,p47.observedClimb.at(-1));
assert.ok(eng30.climbBhP<eng30.levelBhP,'30k climb pressure cannot sustain max-speed BHP');
assert.equal(eng30.climbMapInHg,41);
assert.equal(eng30.levelMapInHg,47.5);
const reg=d.greg.p47d28;
const hi=m.gregP47PowerPoint(reg,200,2600),lo=m.gregP47PowerPoint(reg,200,2000);
close(hi.availableHp,2145,1e-9,'Greg high-power available');
close(lo.availableHp,2145*2000/2600,1e-9,'power-only sensitivity');
close(hi.requiredHp,lo.requiredHp,1e-9,'aero polar unchanged by shaft power');
assert.ok(hi.nPower>lo.nPower);
const lowMax=m.gregP47MaxSpeed(reg,2000),hiMax=m.gregP47MaxSpeed(reg,2600);
assert.ok(lowMax>315&&lowMax<330&&hiMax>350&&hiMax<360,'same-polar top speeds');
assert.equal(m.gregP47PowerPoint(reg,500,2600),null,'no extrapolation beyond Greg available-power schedule');
// v0.4: a genuinely held-out same-airframe ENGINE-RATING difference on P-51B.
// The solver never sees the measured climb rates; it uses the SAME speed-fitted
// polar and propeller assumptions at both ratings.
const mustang=d.aircraft.p51b,documented=mustang.climbPowerComparison;
assert.equal(documented.reportedBClimbFpm-documented.reportedAClimbFpm,documented.reportedGainFpm);
assert.equal(documented.climbSpeedTasMph,null,'Wright Field summary does not publish the climbing IAS/TAS');
assert.equal(documented.reportedGainFpm,560);
for(const profile of ['A','B','C']){
 const x=m.matchedPowerClimb(mustang,2200,'67inHg','75inHg',{profile});
 assert.equal(x.status,'modeled-comparison');
 assert.ok(x.deltaClimbFpm>0&&x.deltaShaftHp>0,'boost adds shaft power and climb');
 assert.ok(x.a.tasMph>=100&&x.b.tasMph>=100,'optimized within stated flight envelope');
 assert.ok(Number.isFinite(x.deltaClimbFpm-documented.reportedGainFpm),'finite, honestly reported residual');
}
const c=m.matchedPowerClimb(mustang,2200,'67inHg','75inHg',{profile:'C'});
close(c.deltaClimbFpm,583.1568904,.2,'frozen candidate C regression, NOT acceptance limit');
const p47ClimbFit=m.equivalentClimbDrag(p47,p47.observedClimb[0]);
const misguidedTransfer=m.matchedPowerClimb(mustang,2200,'67inHg','75inHg',{profile:'C',addedCd0:p47ClimbFit.addedCd0});
assert.ok(Math.abs(misguidedTransfer.a.climbFpm-documented.reportedAClimbFpm)>
          Math.abs(c.a.climbFpm-documented.reportedAClimbFpm),
          'P47 equivalent drag correction does not transfer to P51 candidate C');
const insufficient=m.bestClimb(d.aircraft.bf109f4,27000);
assert.equal(insufficient.status,'no-engine-source','no engine extrapolation for German fighter');
console.log('PASS v0.4 3-aircraft prototype + P-47 climb MAP correction / held-out checks + Greg 2600-hp power scenario: two Greg worksheet reconstructions, sourced bounded engine envelopes, speed conversions, stall/turn constraints, power balance, baseline calibration');
// v0.5: source-conditioned cross-aircraft audit, with no retuning of the solver.
const Audit=require('./climb_audit.js');
const v05=Audit.run(m,d);
assert.equal(d.aircraft.p51b.climbReports.length,2,'two separately attributed Mustang memos');
assert.deepEqual(d.aircraft.p51b.climbReports.map(x=>x.takeoffWeightLb),[9335,9680]);
assert.ok(d.aircraft.p51b.climbReports.every(x=>x.observations.every(r=>r.speedTasMph===null)),'unreported climbing airspeeds stay unknown');
for(const [profile,row] of Object.entries(v05.profiles)){
 assert.equal(row.p47.observations.length,5);
 assert.equal(row.p47.observations.filter(x=>x.role==='fit').length,1,'exactly one climb point for P47 configuration calibration');
 assert.equal(row.p47.observations.filter(x=>x.role==='withheld').length,4,'four held-out P47 climb points');
 assert.ok(row.p47.holdoutMaeFpm>0);
 assert.equal(row.p51.observations.length,6);
 assert.ok(row.p51.observations.some(x=>x.status==='no-engine-source'&&x.altFt===15700&&x.rating==='75inHg'),'do not extrapolate 75-inch high blower at 15700ft');
 const m20=row.p51.observations.filter(x=>x.reportId==='wright-1944-05-20');
 assert.ok(m20.every(x=>x.reportedWeightLb===9335),'correct 20 May mass');
 assert.ok(m20.every(x=>x.matchedClimbSpeed===false),'missing climb airspeed cannot be marked matched');
 assert.ok(m20.every(x=>x.modelFpm!=null));
 close(m20[1].modelFpm-m20[0].modelFpm,row.p51.may20PredictedClimbGainFpm,1e-7,'May20 differential internally consistent');
}
assert.ok(v05.profiles.B.p51.may20MaeFpm<v05.profiles.C.p51.may20MaeFpm,'B closer on Mustang absolute climb');
assert.ok(v05.profiles.C.p47.holdoutMaeFpm<v05.profiles.B.p47.holdoutMaeFpm,'C closer on Thunderbolt held-out climb');
assert.ok(v05.profiles.C.p51.may20GainResidualFpm!==0,'Mustang power response not fitted to exactly +560');
console.log('PASS v0.5 independent source-weight audit and cross-aircraft no-single-winner checks');
