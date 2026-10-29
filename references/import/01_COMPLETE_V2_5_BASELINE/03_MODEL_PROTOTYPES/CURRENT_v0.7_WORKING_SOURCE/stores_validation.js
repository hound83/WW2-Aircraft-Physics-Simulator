/* Universal three-aircraft model v0.6: zero-engine-refit configuration changes.
   Physical model: D = Dp,clean(1+delta) + Di,clean(weightRatio)^2 for level flight.
   At fixed altitude and shaft power, relative power balance is:
   1 = fp * (1+delta) * (Vloaded/Vclean)^3 + fi * weightRatio^2 * (Vclean/Vloaded).
   No specific aircraft's propeller/blade geometry is implied. Shaft power and
   propulsive efficiency are provisionally assumed equal between speed points.
   This approximate equation must not be mistaken for a verified Mosquito polar. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.UniversalStoresValidation=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function requireFinite(x,label){if(!Number.isFinite(x))throw Error('Invalid '+label);}
function fitParasiteIncrease(cleanMph,loadedMph,weightRatio,inducedShare){
 [cleanMph,loadedMph,weightRatio,inducedShare].forEach((v,i)=>requireFinite(v,['clean','loaded','weightRatio','inducedShare'][i]));
 if(cleanMph<=0||loadedMph<=0||loadedMph>=cleanMph||weightRatio<=0||inducedShare<0||inducedShare>=.5)throw Error('Invalid matched-condition stores fitting inputs');
 const r=loadedMph/cleanMph,f=inducedShare;
 const delta=(1-(1-f)*r**3-f*weightRatio**2/r)/((1-f)*r**3);
 if(!(delta>=0))throw Error('Inputs imply negative added parasite drag; inspect test conditions');
 return {parasiteDragIncrease:delta,speedRatio:r,inducedShare:f,weightRatio,scope:'conditional inverse fit to unequal-altitude peak speeds, NOT a direct drag measurement'};
}
function predictLoaded(cleanMph,weightRatio,inducedShare,delta){
 [cleanMph,weightRatio,inducedShare,delta].forEach((v,i)=>requireFinite(v,['clean','weightRatio','inducedShare','dragIncrease'][i]));
 if(!(cleanMph>0&&weightRatio>0&&inducedShare>=0&&inducedShare<.5&&delta>=0))throw Error('Invalid stores calculation');
 const equation=r=>(1-inducedShare)*(1+delta)*r**3+inducedShare*weightRatio**2/r-1;
 // Physical high-speed branch only; reject an unattainable speed balance.
 let lo=.55,hi=1,scan=null;
 for(let i=1;i<=450;i++){
   const r=1-i*.001; if(r<.55)break;
   if(equation(r)<=0){scan=[r,r+.001];break;}
 }
 if(!scan)return {status:'no-supported-level-speed',reason:'No valid high-speed root; stores too large for reduced model'};
 [lo,hi]=scan;
 for(let i=0;i<60;i++){
   const mid=(lo+hi)/2;
   if(equation(mid)>0)hi=mid;else lo=mid;
 }
 const speed=cleanMph*(lo+hi)/2;
 return {status:'modeled',loadedMph:speed,lossMph:cleanMph-speed,deltaParasite:delta,weightRatio,inducedShare};
}
function audit(data,{inducedShareLow=.11,inducedShareHigh=.16,mode='raw'}={}){
 const [low,high]=data.mosquito.gears,w=data.mosquito.loadedTakeoffWeightLb/data.mosquito.cleanTakeoffWeightLb;
 const lowLoadedMph=mode==='raf-corrected'?low.clean.tasMph-16.5:low.loaded.tasMph;
 const fit=fitParasiteIncrease(low.clean.tasMph,lowLoadedMph,w,inducedShareLow);
 const hold=predictLoaded(high.clean.tasMph,w,inducedShareHigh,fit.parasiteDragIncrease);
 return {mode,fit,hold,reference:{low,high,weightRatio:w,reportedPenaltyMph:data.mosquito.reportedSourcePenaltyMph},highResidualMph:hold.status==='modeled'?hold.loadedMph-high.loaded.tasMph:null,
  warning:'Calibration low peak is at 13,800/13,000 ft; high holdout peaks are 25,700/25,100 ft. Constant η and same-altitude power are assumptions, and airframe deterioration confounds the paired results. Not independent aircraft-accuracy validation.'};
}
// Independent Focke-Wulf evidence: no coefficient is fitted to the Fw result when
// evaluating transfer of a Mosquito-derived constant *fractional* store penalty.
// This is a deliberately harsh/generalization test; different rack geometries
// should NOT be assumed to have the same fitted percentage.
function auditFw190(data,{sourceMode='raw',inducedShare=.07}={}){
 if(!(inducedShare>=0&&inducedShare<.5))throw Error('Invalid induced share');
 const fw=data.fw190a4,clean=fw.baseline;
 const mosquito=audit(data,{mode:sourceMode});
 const rows=fw.stages.map(stage=>{
  const w=stage.weightKg!=null?stage.weightKg/clean.weightKg:null;
  const sourcePenalty=clean.speedMph-stage.speedMph;
  // The transferred Mosquito penalty describes a complete external bomb/rack pack.
  // Do not pretend it also predicts a clean airframe or every partial Fw rack stage.
  const transferable=stage.id==='four-bombs'&&w!=null?predictLoaded(clean.speedMph,w,inducedShare,mosquito.fit.parasiteDragIncrease):null;
  const implied=w!=null&&sourcePenalty>0?fitParasiteIncrease(clean.speedMph,stage.speedMph,w,inducedShare).parasiteDragIncrease:stage.id==='clean'?0:null;
  return {...stage,sourcePenalty,wRatio:w,impliedParasiteFraction:implied,transferMph:stage.id==='clean'?clean.speedMph:(transferable?.loadedMph??null),transferResidualMph:transferable?.status==='modeled'?transferable.loadedMph-stage.speedMph:null};
 });
 const bomb=rows.find(x=>x.id==='four-bombs');
 return {fw,inducedShare,mosquitoDelta:mosquito.fit.parasiteDragIncrease,sourceMode,rows,bomb,
  warning:'Different bomb/rack geometry: transferring one Mosquito *fractional drag penalty* to every Fw store configuration is an intentionally falsifiable baseline, NOT a recommended universal stores coefficient. Fw weight/power corrections remain uncertain. IAS correction changes with external tank installation (Report 5).'};
}
return Object.freeze({fitParasiteIncrease,predictLoaded,audit,auditFw190});
});
