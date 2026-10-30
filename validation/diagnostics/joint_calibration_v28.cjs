'use strict';
const fs=require('node:fs'),path=require('node:path'),M=require('../../src/physics.js'),D=require('../../aircraft/cases.json');
const perf=require('../current/performance-validation.json'),fig=require('../baseline/p51_power_required_source_v16.json');
const ids=['p51b','p47b','spitfire_lfix_bs543','bf109f4'],ES=[.60,.70,.78,.85,.92,.98];
const average=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const mae=a=>a.length?average(a.map(p=>Math.abs(p.error))):null;
function clone(id,params){const a=D.aircraft[id];return {...a,propGeometry:{...a.propGeometry,momentumModel:params}};}
function pol(a,profile,e){const p=M.cd0FromAnchor(a,profile,e);return p?{cd0:p.cd0,e,source:'v2.8 existing speed anchor; empirical joint calibration'}:null;}
function speedRows(id){const a=D.aircraft[id];return (a.observedSpeed||[]).filter(p=>!(p.altFt===a.calibration.altFt&&p.rating===a.calibration.rating&&p.gear===a.calibration.gear)).map((p,i)=>({...p,split:id==='bf109f4'?'check':i%2===0?'fit':'check'}));}
const climbFit=(id,i)=>id==='p47b'?[0,3].includes(i):i%4===0;
function climb(id,a,profile,polar,delta,p,stepMph=2,weightOverride){
 if(id==='p51b')return M.bestClimb(a,p.altFt,{profile,polar,rating:p.rating,gear:'low',engineModel:'ram-critical',weightLb:weightOverride??9335,minTasMph:120,maxTasMph:260,stepMph}).climbFpm;
 if(id==='p47b')return M.climbPrediction(a,p,{profile,polar,weightLb:weightOverride??a.weightLb,addedCd0:delta}).predictedFpm;
 const row=perf.rows.find(r=>r.aircraftId===id&&r.metric==='climb-rate'&&r.altFt===p.altFt);
 return M.evaluated(a,p.altFt,p.tasMph,{...row.prediction.options,profile,polar,e:undefined,addedDragAreaM2:delta*a.wingAreaM2}).power?.climbFpm;
}
function coolingFit(id,a,profile,polar){
 if(!['p47b','spitfire_lfix_bs543'].includes(id))return 0;
 let numerator=0,denominator=0;
 for(const [i,p]of a.observedClimb.entries()){
  if(!climbFit(id,i))continue;
  const w=id==='p47b'?a.weightLb:7485,V=p.tasMph*.44704;
  const slope=.5*M.isa(p.altFt).rho*V**3*a.wingAreaM2/(w*4.4482216153)*196.8503937;
  numerator+=slope*(climb(id,a,profile,polar,0,p)-p.fpm);denominator+=slope*slope;
 }
 return Math.max(0,Math.min(.03,numerator/denominator));
}
function fitAircraft(id,profile,params,e){
 const a=clone(id,params),polar=pol(a,profile,e);
 if(!polar||!(polar.cd0>.005&&polar.cd0<.085))return {id,score:Infinity};
 const delta=coolingFit(id,a,profile,polar),terms=[];
 const sp=speedRows(id).filter(p=>p.split==='fit').map(p=>M.evaluated(a,p.altFt,p.mphTas,{profile,polar,rating:p.rating,gear:p.gear}).power?.excessHp).filter(Number.isFinite);
 if(sp.length)terms.push(average(sp.map(x=>(x/60)**2)));
 if(id==='p51b'){
  terms.push(2*((climb(id,a,profile,polar,0,{altFt:2200,rating:'67inHg'})-3820)/200)**2);
  terms.push(average(fig.points.filter((p,i)=>i%2===0).map(p=>{
   const drag=M.dragBreakdown(a,fig.altitudeFt,p.tasMph,fig.nominalWeightLb,polar.cd0,e);
   const eta=M.propEta(a,fig.altitudeFt,p.tasMph,p.testBhp,profile,'67inHg',{engineRpmOverride:p.engineRpm}).eta;
   return ((drag.requiredHp/eta-p.testBhp)/60)**2;
  })));
 }else if(id!=='bf109f4')terms.push(average(a.observedClimb.filter((p,i)=>climbFit(id,i)).map(p=>((climb(id,a,profile,polar,delta,p)-p.fpm)/250)**2)));
 return {id,profile,params,e,cd0:polar.cd0,delta,score:average(terms)+.025*((e-.80)/.15)**2+.02*(delta/.02)**2};
}
function fit(profile,params){const fits=ids.map(id=>(id==='bf109f4'?[.78]:ES).map(e=>fitAircraft(id,profile,params,e)).sort((a,b)=>a.score-b.score)[0]);return {profile,params,fits,score:average(fits.map(f=>f.score))};}
function evaluate(model){
 const speed=[],climbs=[],figures=[];
 for(const fit of model.fits){
  const {id,e,delta,profile,params}=fit,a=clone(id,params),polar=pol(a,profile,e);
  for(const p of speedRows(id)){const pred=M.maxSpeed(a,p.altFt,{profile,polar,rating:p.rating,gear:p.gear});speed.push({id,split:p.split,altFt:p.altFt,observed:p.mphTas,pred,error:pred-p.mphTas});}
  if(id==='p51b'){
   for(const rating of ['67inHg','75inHg']){const obs=rating==='67inHg'?3820:4380,pred=climb(id,a,profile,polar,delta,{altFt:2200,rating},1);climbs.push({id,split:rating==='67inHg'?'fit':'check',altFt:2200,rating,observed:obs,pred,error:pred-obs});}
   for(const [i,p]of fig.points.entries()){
    const dr=M.dragBreakdown(a,fig.altitudeFt,p.tasMph,fig.nominalWeightLb,polar.cd0,e),eta=M.propEta(a,fig.altitudeFt,p.tasMph,p.testBhp,profile,'67inHg',{engineRpmOverride:p.engineRpm}).eta;
    figures.push({split:i%2===0?'fit':'check',speed:p.tasMph,engineRpm:p.engineRpm,observed:p.testBhp,pred:dr.requiredHp/eta,error:dr.requiredHp/eta-p.testBhp});
   }
  }else if(id!=='bf109f4')for(const [i,p]of a.observedClimb.entries()){const pred=climb(id,a,profile,polar,delta,p);climbs.push({id,split:climbFit(id,i)?'fit':'check',altFt:p.altFt,observed:p.fpm,pred,error:pred-p.fpm});}
 }
 const summary=ids.map(id=>({id,speedMae:mae(speed.filter(p=>p.id===id)),speedCheckMae:mae(speed.filter(p=>p.id===id&&p.split==='check')),climbMae:mae(climbs.filter(p=>p.id===id)),climbCheckMae:mae(climbs.filter(p=>p.id===id&&p.split==='check'))}));
 return {model,summary,speed,climbs,figures};
}
function run(){
 const baseline=evaluate({profile:'C',params:null,fits:ids.map(id=>({id,e:.78,delta:0,profile:'C',params:null}))});
 const dragOnly=evaluate(fit('C',null)),trials=[];
 for(const f of [.85,.87,.89,.91,.93,.95,.97])for(const j of [0,.06,.12,.18,.24,.30,.36])trials.push(fit('P',{retainedPowerFraction:f,machPenalty:2,machOnset:.92,advanceLoss:j}));
 trials.sort((a,b)=>a.score-b.score);
 const selected=evaluate(trials[0]),p47Prior=perf.p47Conditional.rows.filter(p=>p.altFt!==15000&&p.altFt!==25000);
 const priorP47CheckMae=average(p47Prior.map(p=>p.absolute));
 const bounds=selected.summary.map(s=>{
  const b=baseline.summary.find(x=>x.id===s.id);
  return {id:s.id,speedPass:s.speedCheckMae<=b.speedCheckMae+Math.max(2,b.speedCheckMae*.1),
   climbPass:s.climbCheckMae===null?null:s.climbCheckMae<=(s.id==='p47b'?priorP47CheckMae:b.climbCheckMae)+50};
 });
 const p51Old=baseline.summary.find(s=>s.id==='p51b').climbMae,p51New=selected.summary.find(s=>s.id==='p51b').climbMae;
 const acceptance={mustangReduction:1-p51New/p51Old,targetMet:p51New<=.7*p51Old,priorP47CheckMae,bounds,
  pass:p51New<=.7*p51Old&&bounds.every(b=>b.speedPass&&b.climbPass!==false)};
 return {schema:1,baseline,dragOnly,selected,top:trials.slice(0,7),acceptance,
  policy:'Engineering calibration with qualified scenarios. Split revised during development; all data already exposed. Check data participate in acceptance, not parameter fitting. No independent historical-accuracy or 5:1 claim.'};
}
if(require.main===module){
 const out=run();fs.writeFileSync(path.join(__dirname,'../current/v28-calibration.json'),JSON.stringify(out,null,2)+'\n');
 for(const key of ['selected','baseline','dragOnly','acceptance','top'])console.log('V28_'+key.toUpperCase()+' '+JSON.stringify(out[key]));
}
module.exports={run,fit,evaluate,fitAircraft,speedRows,climb,pol,clone,average,climbFit};
