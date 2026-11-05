'use strict';
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),D=require('../../aircraft/cases.json');
const ledger=require('../../references/p47b-measured-climb-v33.json');
const evidence=require('../../references/performance-evidence.json');
const p47Cooling=require('../../calibration/v3.4-configuration-model.json');
const spitCooling=require('../../calibration/v3.1-climb-model.json');
const climbStates=require('../../references/climb-condition-states.json');
const root=path.resolve(__dirname,'../..');
const knots={p51b:{low:'anchored-ramp',high:'linear'},spitfire_lfix_bs543:{low:'anchored-ramp',high:'constant'}};
const policy={machStart:.36,machFull:.46,edgeFt:2000,limitCd0:.003};
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const mean=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;

function level(ac,row,flightEnvelope,scenario={}){
 return M.maxSpeed(ac,row.altFt,{...scenario,profile:'P',rating:row.rating,gear:row.gear,flightEnvelope});
}

function fit(ac,rows,shape,fitRows,scenario=policy){
 const minAltFt=Math.min(...rows.map(r=>r.altFt)),maxAltFt=Math.max(...rows.map(r=>r.altFt));
 const anchored=shape==='anchored-ramp';
 // The Mustang saturates at the first non-anchor test altitude. The
 // Spitfire starts at the published low-blower engine power peak.
 const originFt=anchored?(ac.stallIdentity.aircraftId==='p51b'?ac.calibration.altFt:5750):(minAltFt+maxAltFt)/2;
 const spanFt=anchored&&ac.stallIdentity.aircraftId==='p51b'?4000:maxAltFt-originFt;
 const x=r=>{
  const raw=(r.altFt-originFt)/spanFt;
  return anchored?clamp(raw,0,1):raw;
 };
 const samples=fitRows.map(r=>{
  const state=M.evaluated(ac,r.altFt,r.mphTas,{profile:'P',rating:r.rating,gear:r.gear});
  const t=clamp((state.air.mach-scenario.machStart)/(scenario.machFull-scenario.machStart),0,1);
  const gain=t*t*(3-2*t);
  const target=state.power.excessHp*745.6998716/(state.drag.q*ac.wingAreaM2*r.mphTas*.44704*gain);
  return {x:x(r),target};
 });
 const xx=samples.reduce((sum,p)=>sum+p.x*p.x,0),xy=samples.reduce((sum,p)=>sum+p.x*p.target,0);
 const mx=mean(samples.map(p=>p.x)),my=mean(samples.map(p=>p.target));
 const cov=xy-samples.length*mx*my,variance=xx-samples.length*mx*mx;
 const slope=anchored?xy/xx:shape==='linear'&&variance>1e-10?cov/variance:0;
 const offset=anchored?0:my-slope*mx;
 if(![offset,slope].every(Number.isFinite))throw Error('Underdetermined installation correction');
 for(const altFt of [minAltFt,maxAltFt]){
  if(Math.abs(offset+slope*x({altFt}))>policy.limitCd0)throw Error('Installation correction exceeds the declared limit');
 }
 return {ratings:[...new Set(rows.map(r=>r.rating))],shape,minAltFt,maxAltFt,originFt,spanFt,offset,slope,
  machStart:scenario.machStart,machFull:scenario.machFull,edgeFt:policy.edgeFt};
}

function buildPower(){
 if(ledger.identity.aircraftId!=='p47b'||ledger.identity.specimen!=='41-5902'||ledger.powerKind!=='report-recorded-shaft-bhp'||ledger.gearing.propPerEngine!==.5||!ledger.source.sha256)throw Error('P-47B source/installation mismatch');
 const ratings={};
 for(const rating of ['military','normal']){
  // Retain the existing level-flight military chart from its first node.
  const rows=ledger.states.filter(r=>r.rating===rating&&(rating==='normal'||r.altFt<=5000));
  if(rows.length<2||new Set(rows.map(r=>r.altFt)).size!==rows.length||!rows.every(r=>r.gear==='turbo'&&r.engineRpm===rows[0].engineRpm&&r.shaftHp>0&&r.sourceLocation))throw Error('Invalid power nodes for '+rating);
  ratings[rating]={gear:'turbo',source:ledger.source.reference+'; interpolated only between same-rating 41-5902 report nodes',
   engineRpm:rows[0].engineRpm,reductionRatioEnginePerProp:1/ledger.gearing.propPerEngine,
   nodes:rows.map(r=>({altFt:r.altFt,bhp:r.shaftHp,sourceStateId:r.id}))};
 }
 const old=M.shaftPower(D.aircraft.p47b,5000,'military','turbo');
 if(old?.bhp!==ratings.military.nodes.at(-1).bhp)throw Error('P-47B military junction does not match the existing chart');
 return ratings;
}

function coolingEnvelope(fit,heatFraction,states){
 return {deltaCd0:fit.deltaCd0,heatFraction,reference:fit.reference,
  minAltFt:Math.min(...states.map(s=>s.altFt)),maxAltFt:Math.max(...states.map(s=>s.altFt)),
  minTasMph:Math.min(...states.map(s=>s.tasMph)),maxTasMph:Math.max(...states.map(s=>s.tasMph))};
}

function run(){
 const aircraft=Object.fromEntries(Object.entries(D.aircraft).map(([id,ac])=>[id,{identity:ac.stallIdentity}]));
 aircraft.p47b.power=buildPower();
 if(p47Cooling.sourceSha256!==ledger.source.sha256)throw Error('P-47B cooling calibration belongs to a different report');
 aircraft.p47b.cooling=coolingEnvelope(p47Cooling,p47Cooling.heatFraction,ledger.states);
 const spitStates=climbStates.states.filter(s=>s.aircraftId==='spitfire_lfix_bs543'&&s.sourceSpecimen==='BS.543'&&s.engineCondition);
 aircraft.spitfire_lfix_bs543.cooling=coolingEnvelope(spitCooling.aircraft.spitfire_lfix_bs543,spitCooling.heatFraction,spitStates);
 const calibration={schema:1,policy,sourcePowerSha256:ledger.source.sha256,aircraft};
 const fits=[];
 for(const [id,gears] of Object.entries(knots)){
  const ac=D.aircraft[id];
  aircraft[id].fastFlight={};
  for(const [gear,shape] of Object.entries(gears)){
   const rows=ac.observedSpeed.filter(r=>r.gear===gear);
   // Keep the entire high-boost Mustang rating out of every fit.
   const eligible=rows.filter(r=>r.rating===ac.defaultRating);
   const heights=[...new Set(eligible.map(r=>r.altFt))].sort((a,b)=>a-b);
   const envelope=curve=>({aircraft:{[id]:{identity:ac.stallIdentity,fastFlight:{[gear]:curve}}}});
   const compare=(curve,checks)=>checks.map(r=>({altFt:r.altFt,rating:r.rating,observed:r.mphTas,
    before:level(ac,r),after:level(ac,r,envelope(curve))}));
   const folds=[];
   const alternatives=shape==='anchored-ramp'?[shape]:['constant','linear'];
   for(const kind of alternatives)for(const fold of [0,1]){
    const train=eligible.filter(r=>heights.indexOf(r.altFt)%2===fold),check=eligible.filter(r=>!train.includes(r));
    const rowsChecked=compare(fit(ac,rows,kind,train),check.filter(r=>r.altFt!==ac.calibration.altFt||gear!==ac.calibration.gear));
    folds.push({shape:kind,fold,fitAltitudes:train.map(r=>r.altFt),rows:rowsChecked,
     beforeMae:mean(rowsChecked.map(r=>Math.abs(r.before-r.observed))),afterMae:mean(rowsChecked.map(r=>Math.abs(r.after-r.observed)))});
   }
   const curve=fit(ac,rows,shape,eligible);
   aircraft[id].fastFlight[gear]=curve;
   const blocks=[];
   const split=Math.ceil(heights.length/2);
   for(const first of [true,false]){
    const train=eligible.filter(r=>(heights.indexOf(r.altFt)<split)===first);
    const check=eligible.filter(r=>!train.includes(r));
    const rowsChecked=compare(fit(ac,rows,shape,train),check.filter(r=>r.altFt!==ac.calibration.altFt||gear!==ac.calibration.gear));
    blocks.push({first,fitAltitudes:train.map(r=>r.altFt),rows:rowsChecked,
     beforeMae:mean(rowsChecked.map(r=>Math.abs(r.before-r.observed))),afterMae:mean(rowsChecked.map(r=>Math.abs(r.after-r.observed)))});
   }
   const heldRating=compare(curve,rows.filter(r=>r.rating!==ac.defaultRating));
   const stress=[.34,.38].map(machStart=>({
    machStart,rows:compare(fit(ac,rows,shape,eligible,{...policy,machStart}),rows)
   }));
   fits.push({id,gear,shape,folds,blocks,heldRating,stress});
  }
 }
 const p47=D.aircraft.p47b;
 const powerReplay=ledger.states.map(s=>{
  const opts={profile:'P',gear:s.gear,rating:s.rating},old=M.evaluated(p47,s.altFt,s.tasMph,opts),now=M.evaluated(p47,s.altFt,s.tasMph,{...opts,flightEnvelope:calibration});
  return {stateId:s.id,altFt:s.altFt,rating:s.rating,observedHp:s.shaftHp,oldHp:old.engine?.bhp??null,newHp:now.engine?.bhp??null,propRpm:now.prop?.propRpm??null};
 });
 const coolingReplay=ledger.states.map(s=>{
  const opts={profile:'P',gear:s.gear,rating:s.rating,weightLb:ledger.mass.valueLb,flightEnvelope:calibration};
  const clean=M.evaluated(p47,s.altFt,s.tasMph,opts),open=M.evaluated(p47,s.altFt,s.tasMph,{...opts,flightCooling:true});
  return {stateId:s.id,altFt:s.altFt,rating:s.rating,fit:p47Cooling.fitStateIds.includes(s.id),observed:s.observedFpm,
   clean:clean.power?.climbFpm??null,open:open.power?.climbFpm??null};
 });
 const speeds=Object.entries(D.aircraft).map(([id,ac])=>{
  const rows=ac.observedSpeed.map(r=>({altFt:r.altFt,rating:r.rating,gear:r.gear,observed:r.mphTas,before:level(ac,r),after:level(ac,r,calibration)}));
  const nonAnchor=rows.filter(r=>r.altFt!==ac.calibration.altFt||r.gear!==ac.calibration.gear||r.rating!==ac.calibration.rating);
  return {id,rows,beforeMae:mean(nonAnchor.map(r=>Math.abs(r.before-r.observed))),afterMae:mean(nonAnchor.map(r=>Math.abs(r.after-r.observed)))};
 });
 const loadStress=[.98,1.02].flatMap(weightFactor=>[.96,1.04].map(eFactor=>({
  weightFactor,eFactor,aircraft:Object.entries(D.aircraft).map(([id,ac])=>{
   const scenario={weightLb:ac.weightLb*weightFactor,e:ac.workingModel.e*eFactor};
   const rows=ac.observedSpeed.filter(r=>r.altFt!==ac.calibration.altFt||r.gear!==ac.calibration.gear||r.rating!==ac.calibration.rating);
   return {id,beforeMae:mean(rows.map(r=>Math.abs(level(ac,r,null,scenario)-r.mphTas))),
    afterMae:mean(rows.map(r=>Math.abs(level(ac,r,calibration,scenario)-r.mphTas)))};
  })
 })));
 const climbGuard=Object.entries(D.aircraft).flatMap(([id,ac])=>(ac.observedClimb??[]).filter(r=>r.tasMph>0).map(r=>{
  const opts={profile:'P',rating:r.rating,gear:r.gear,weightLb:id==='spitfire_lfix_bs543'?7485:ac.weightLb};
  const before=M.evaluated(ac,r.altFt,r.tasMph,opts),after=M.evaluated(ac,r.altFt,r.tasMph,{...opts,flightEnvelope:calibration});
  return {id,altFt:r.altFt,tasMph:r.tasMph,before:before.power?.climbFpm??null,after:after.power?.climbFpm??null};
 }));
 // A pressure-ratio extension is a diagnostic challenger. The secondary
 // level speeds are not used to infer power or to extend the DB 601E curve.
 const f4=D.aircraft.bf109f4;
 const f4Challenger=evidence.supplementalF4.speed.map(row=>{
  const altFt=row.altM/.3048,tas=row.speedKph/1.609344,rating=row.rating;
  const last=f4.powerRatings[rating].gears.fluid.at(-1);
  const hp=last.bhp*M.isa(altFt).p/M.isa(last.altFt).p;
  const polar=M.workingOptions(f4).polar;
  const required=M.dragBreakdown(f4,altFt,tas,f4.weightLb,polar.cd0,polar.e).requiredHp;
  const available=hp*M.propEta(f4,altFt,tas,hp,'P',rating).eta;
  return {rating,altFt,sourceKph:row.speedKph,proxyShaftHp:hp,requiredHp:required,availableHp:available,excessHp:available-required};
 });
 return {calibration,fits,speeds,powerReplay,coolingReplay,loadStress,climbGuard,f4Challenger,
  independentValidation:false,qualification:'Previously exposed observations; installation residuals do not identify measured drag or shaft power.'};
}

function writeReport(report=run()){
 fs.writeFileSync(path.join(root,'validation/current/flight-envelope.json'),JSON.stringify(report,null,2)+'\n');
 return report;
}
if(require.main===module){
 const report=writeReport();
 if(process.argv.includes('--calibrate'))fs.writeFileSync(path.join(root,'calibration/flight-envelope.json'),JSON.stringify(report.calibration,null,2)+'\n');
 console.log(report.speeds.map(s=>s.id+': '+s.beforeMae.toFixed(2)+' → '+s.afterMae.toFixed(2)+' mph').join('\n'));
}
module.exports={run,writeReport};
