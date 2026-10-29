/* Universal Model v0.5 — source-condition audit and cross-aircraft check.
 * No aircraft-specific adjustment is imported into the shared physics solver.
 * Do not treat the two May 1944 Mustang memos as independent flight tests.
 */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.UniversalClimbAudit=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function run(M,D){
 const out={version:'v0.5',status:'experimental predictions, no historical-turn certification',method:'same universal solver; speed-calibrated CD0 held fixed; correct report-specific takeoff mass; Greg only as arithmetic check',profiles:{},p51Reports:[]};
 const p47=D.aircraft.p47b,mustang=D.aircraft.p51b;
 for(const profile of ['A','B','C']){
  const fit=M.equivalentClimbDrag(p47,p47.observedClimb[0],{profile});
  const r47=p47.observedClimb.map((obs,index)=>{const q=M.climbPrediction(p47,obs,{profile,addedCd0:fit.addedCd0});return {altFt:obs.altFt,reportedFpm:obs.fpm,predictedFpm:q.predictedFpm,residualFpm:q.residualFpm,role:index===0?'fit':'withheld'};});
  const p47Hold=r47.filter(r=>r.role==='withheld');
  const reportRows=[];
  for(const rep of mustang.climbReports){
   for(const obs of rep.observations){
    const r=M.bestClimb(mustang,obs.altFt,{rating:obs.rating,profile,weightLb:rep.takeoffWeightLb,minTasMph:100,maxTasMph:280});
    reportRows.push({reportId:rep.id,reportDate:rep.date,reportedWeightLb:rep.takeoffWeightLb,altFt:obs.altFt,rating:obs.rating,reportedFpm:obs.fpm,modelFpm:r.status==='modeled-peak'?r.climbFpm:null,
      residualFpm:r.status==='modeled-peak'?r.climbFpm-obs.fpm:null,predictedBestTasMph:r.status==='modeled-peak'?r.tasMph:null,
      status:r.status,matchedClimbSpeed:false,independentSource:false,sourceUrl:rep.url});
   }
  }
  const m20=reportRows.filter(r=>r.reportId==='wright-1944-05-20'),m15=reportRows.filter(r=>r.reportId==='wright-1944-05-15');
  const delta=m20.length===2&&m20.every(x=>x.modelFpm!=null)?m20[1].modelFpm-m20[0].modelFpm:null;
  const mae=rows=>{const good=rows.filter(x=>x.residualFpm!=null);return good.length?good.reduce((s,x)=>s+Math.abs(x.residualFpm),0)/good.length:null;};
  out.profiles[profile]={p47:{fittedEquivalentCd0:fit.addedCd0,profileSpecificFit:true,observations:r47,holdoutMaeFpm:mae(p47Hold)},
   p51:{observations:reportRows,may20MaeFpm:mae(m20),may15MaeFpm:mae(m15),may20ObservedClimbGainFpm:560,may20PredictedClimbGainFpm:delta,may20GainResidualFpm:delta==null?null:delta-560,
    warning:'20 May memo reports 9,335 lb takeoff; 15 May memo separately reports 9,680 lb; two summaries cover same airplane/test programme; climb TAS not independently known.'}};
 }
 return out;
}
return Object.freeze({run});
});
