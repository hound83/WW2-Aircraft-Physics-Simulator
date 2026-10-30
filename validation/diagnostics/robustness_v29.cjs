'use strict';
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),D=require('../../aircraft/cases.json');
const V=require('./joint_calibration_v28.cjs'),C=require('./source_chart_climb.cjs');
const F=require('../../calibration/v2.8-working-model.json'),P=require('../../calibration/v2.9-robustness-policy.json');
const fig=require('../baseline/p51_power_required_source_v16.json'),perf=require('../current/performance-validation.json');
const ids=['p51b','p47b','spitfire_lfix_bs543','bf109f4'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const mae=rows=>mean(rows.map(r=>Math.abs(r.error)));
function finite(x,label){if(!Number.isFinite(x))throw Error('Missing/nonfinite '+label);return x;}
function inFit(kind,id,i,split){
 if(!P.splits.includes(split))throw Error('Unknown fit split');
 if(kind==='speed')return id!=='bf109f4'&&i%2===(split==='original'?0:1);
 if(kind==='figure')return i%2===(split==='original'?0:1);
 if(id==='p51b')return i===(split==='alternate'?1:0);
 if(id==='p47b')return (split==='original'?[0,3]:split==='alternate'?[1,4]:[0,2]).includes(i);
 return i%4===(split==='original'?0:split==='alternate'?1:2);
}
function climb(id,a,polar,delta,point,weight){
 if(id==='p51b')return finite(M.bestClimb(a,point.altFt,{profile:'P',polar,rating:point.rating,gear:'low',engineModel:'ram-critical',weightLb:weight??9335,minTasMph:120,maxTasMph:260,stepMph:2}).climbFpm,'Mustang climb');
 if(id==='p47b')return finite(M.climbPrediction(a,point,{profile:'P',polar,weightLb:weight??a.weightLb,addedCd0:delta}).predictedFpm,'P47 climb');
 const row=perf.rows.find(r=>r.aircraftId===id&&r.metric==='climb-rate'&&r.altFt===point.altFt);
 return finite(M.evaluated(a,point.altFt,point.tasMph,{...row.prediction.options,weightLb:weight??row.prediction.options.weightLb,profile:'P',polar,e:undefined,addedDragAreaM2:delta*a.wingAreaM2}).power?.climbFpm,'Spitfire climb');
}
function fitAircraft(id,params,e,split){
 const a=V.clone(id,params),polar=V.pol(a,'P',e);
 if(!polar||!(polar.cd0>.005&&polar.cd0<.085))return {id,e,score:Infinity};
 let delta=0,unclippedDelta=0;
 if(['p47b','spitfire_lfix_bs543'].includes(id)){
  let num=0,den=0;
  a.observedClimb.forEach((p,i)=>{if(!inFit('climb',id,i,split))return;
   const w=id==='p47b'?a.weightLb:7485,v=p.tasMph*.44704;
   const slope=.5*M.isa(p.altFt).rho*v**3*a.wingAreaM2/(w*4.4482216153)*196.8503937;
   num+=slope*(climb(id,a,polar,0,p)-p.fpm);den+=slope*slope;
  });
  unclippedDelta=num/den;delta=Math.max(0,Math.min(.03,unclippedDelta));
 }
 const groups=[],speeds=V.speedRows(id).filter((p,i)=>inFit('speed',id,i,split));
 if(speeds.length)groups.push(mean(speeds.map(p=>(finite(M.evaluated(a,p.altFt,p.mphTas,{profile:'P',polar,rating:p.rating,gear:p.gear}).power?.excessHp,'speed fit')/60)**2)));
 if(id==='p51b'){
  const high=split==='alternate',rating=high?'75inHg':'67inHg',obs=high?4380:3820;
  groups.push(2*((climb(id,a,polar,0,{altFt:2200,rating})-obs)/200)**2);
  groups.push(mean(fig.points.filter((p,i)=>inFit('figure',id,i,split)).map(p=>{
   const drag=M.dragBreakdown(a,fig.altitudeFt,p.tasMph,fig.nominalWeightLb,polar.cd0,e);
   const prop=M.propEta(a,fig.altitudeFt,p.tasMph,p.testBhp,'P','67inHg',{engineRpmOverride:p.engineRpm});
   return ((finite(drag.requiredHp/prop.eta,'Figure 5 fit')-p.testBhp)/60)**2;
  })));
 }else if(id!=='bf109f4')groups.push(mean(a.observedClimb.filter((p,i)=>inFit('climb',id,i,split)).map(p=>((climb(id,a,polar,delta,p)-p.fpm)/250)**2)));
 return {id,profile:'P',params,e,cd0:polar.cd0,delta,unclippedDelta,deltaClipped:delta!==unclippedDelta,score:finite((groups.length?mean(groups):0)+.025*((e-.8)/.15)**2+.02*(delta/.02)**2,'fit objective')};
}
function search(split,extended=false){
 const trials=[];
 for(const f of P.retainedPowerFraction)for(const j of P.advanceLoss){
  const params={...F.sharedPropeller,retainedPowerFraction:f,advanceLoss:j};
  const fits=ids.map(id=>{const es=id==='bf109f4'?[.78]:id==='spitfire_lfix_bs543'&&extended?P.spitfireExtendedE:P.effectiveE;
   return es.map(e=>fitAircraft(id,params,e,split)).sort((a,b)=>a.score-b.score)[0];});
  trials.push({profile:'P',params,fits,score:mean(fits.map(fit=>fit.score))});
 }
 return trials.sort((a,b)=>a.score-b.score);
}
function ownChecks(evaluation,split){
 return ids.map(id=>{
  const speed=evaluation.speed.filter(r=>r.id===id).filter((r,i)=>!inFit('speed',id,i,split));
  const climb=evaluation.climbs.filter(r=>r.id===id).filter((r,i)=>!inFit('climb',id,i,split));
  return {id,speedCount:speed.length,speedMae:mae(speed),climbCount:climb.length,climbMae:mae(climb)};
 });
}
function comparisons(current,candidate){return candidate.summary.map(s=>{const b=current.summary.find(r=>r.id===s.id);return {id:s.id,speedCheckDelta:s.speedCheckMae-b.speedCheckMae,climbCheckDelta:s.climbCheckMae===null?null:s.climbCheckMae-b.climbCheckMae};});}
function guardrails(comparison){return comparison.every(r=>r.speedCheckDelta<=.5&&(r.climbCheckDelta===null||r.climbCheckDelta<=10))&&comparison.find(r=>r.id==='p47b').climbCheckDelta<=-10;}
function chartScenarios(){
 const a=D.aircraft.p51b,source=C.chart(),rows=[];
 for(const node of source.nodes)for(const weightLb of P.mustangWeightsLb)for(const profile of ['C','P'])for(const selection of ['lower','midpoint','upper']){
  const opts=C.options('C',selection),polar=profile==='C'?opts.polar:M.workingOptions(a).polar;
  const r=M.sourceChartClimb(a,node.altFt,{...opts,chart:source,profile,polar,rating:node.rating,gear:node.gear,weight:{valueLb:weightLb,kind:'scenario',source:'v2.9 explicit assumed mass; instantaneous mass unknown'}});
  if(r.status!=='modeled-peak')throw Error('Source chart rejected: '+JSON.stringify(r));
  rows.push({nodeId:node.id,altFt:node.altFt,rating:node.rating,weightLb,profile,selection,shaftHp:r.shaftHp,climbFpm:r.climbFpm,residualFpm:node.altFt===2200?r.climbFpm-(node.rating==='67inHg'?3820:4380):null});
 }
 const paired=[];
 for(const w of P.mustangWeightsLb)for(const selection of ['lower','midpoint','upper'])for(const selection75 of ['lower','midpoint','upper']){
  const c=rows.filter(r=>r.altFt===2200&&r.weightLb===w&&r.selection===(r.rating==='67inHg'?selection:selection75)&&r.profile==='C');
  const p=rows.filter(r=>r.altFt===2200&&r.weightLb===w&&r.selection===(r.rating==='67inHg'?selection:selection75)&&r.profile==='P');
  paired.push({weightLb:w,selection,selection75,cMae:mean(c.map(r=>Math.abs(r.residualFpm))),pMae:mean(p.map(r=>Math.abs(r.residualFpm)))});
 }
 return {rows,paired,improves:paired.filter(r=>r.pMae<r.cMae).length,total:paired.length};
}
function figureScenarios(){
 const a=D.aircraft.p51b,rows=[],polar=M.workingOptions(a).polar;
 for(const [i,p]of fig.points.entries())for(const dv of P.figure5TasOffsetsMph)for(const dp of P.figure5PowerOffsetsBhp)for(const dr of P.rpmScenarioOffsets){
  const v=p.tasMph+dv,hp=p.testBhp+dp,rpm=p.engineRpm+dr;
  const drag=M.dragBreakdown(a,fig.altitudeFt,v,fig.nominalWeightLb,polar.cd0,polar.e),eta=M.propEta(a,fig.altitudeFt,v,hp,'P','67inHg',{engineRpmOverride:rpm});
  rows.push({point:i,tasOffsetMph:dv,powerOffsetBhp:dp,rpmOffset:dr,sourceRpm:p.engineRpm,eta:eta.eta,requiredShaftHp:drag.requiredHp/eta.eta,residualHp:drag.requiredHp/eta.eta-hp});
 }
 return {rows,points:fig.points.map((p,i)=>{const r=rows.filter(x=>x.point===i);return {point:i,sourceRpm:p.engineRpm,minResidualHp:Math.min(...r.map(x=>x.residualHp)),maxResidualHp:Math.max(...r.map(x=>x.residualHp)),recordedRpmNominal:r.find(x=>x.tasOffsetMph===0&&x.powerOffsetBhp===0&&x.rpmOffset===0).residualHp};})};
}
function run(){
 const current=V.evaluate({profile:'P',params:F.sharedPropeller,fits:Object.entries(F.aircraft).map(([id,f])=>({id,e:f.e,delta:f.openCoolingDeltaCd0,profile:'P',params:F.sharedPropeller}))});
 const splits=P.splits.map(split=>{
  const trials=search(split),winner=trials[0],evaluated=V.evaluate(winner),near=trials.filter(t=>t.score<=winner.score+P.nearOptimalScoreAllowance);
  return {split,winner,fixedChecks:evaluated.summary,ownChecks:ownChecks(evaluated,split),comparison:comparisons(current,evaluated),nearOptimal:near.map(t=>({model:t,summary:V.evaluate(t).summary}))};
 });
 const extension=P.splits.map(split=>{const trials=search(split,true),winner=trials[0],ev=V.evaluate(winner);return {split,winner,summary:ev.summary,comparison:comparisons(current,ev),ownChecks:ownChecks(ev,split)};});
 const boundary=[];
 for(const e of P.spitfireExtendedE){const fit=fitAircraft('spitfire_lfix_bs543',F.sharedPropeller,e,'original'),ev=V.evaluate({...current.model,fits:current.model.fits.map(f=>f.id===fit.id?fit:f)});boundary.push({e,fit,summary:ev.summary.find(s=>s.id===fit.id)});}
 const models=[...splits.map(x=>x.winner),...extension.map(x=>x.winner),...splits.find(x=>x.split==='original').nearOptimal.map(x=>x.model)];
 const seen=new Set(),candidateChecks=[];
 for(const model of models){
  const key=JSON.stringify({params:model.params,fits:model.fits.map(f=>({id:f.id,e:f.e,delta:f.delta}))});if(seen.has(key))continue;seen.add(key);
  const ev=V.evaluate(model),comparison=comparisons(current,ev);
  const own=P.splits.map(split=>{
   const b=ownChecks(current,split),n=ownChecks(ev,split);
   return {split,rows:n.map(r=>{const old=b.find(x=>x.id===r.id);return {id:r.id,speedCheckDelta:r.speedMae-old.speedMae,climbCheckDelta:r.climbMae===null?null:r.climbMae-old.climbMae};})};
  });
  const pass=guardrails(comparison)&&own.every(s=>s.rows.every(r=>r.speedCheckDelta<=.5&&(r.climbCheckDelta===null||r.climbCheckDelta<=10)));
  candidateChecks.push({model,comparison,own,pass});
 }
 const promotion=candidateChecks.some(x=>x.pass);
 return {schema:1,version:P.version,workingCalibration:F.version,policy:P,current:current.summary,splits,extension,boundary,candidateChecks,chart:chartScenarios(),figure5:figureScenarios(),decision:{promote:promotion,retainV28:!promotion,reason:promotion?'All predefined comparison guardrails pass; review fixed candidate before promotion.':'No cross-split gain passes every documented guardrail; retain working coefficients.'},independentHistoricalValidation:false,pairwiseAccuracy:null};
}
function writeReport(){
 const out=run(),root=path.resolve(__dirname,'../..'),f=x=>x===null?'—':x.toFixed(1),lines=['# v2.9 robustness results','','Existing-data sensitivity analysis; working calibration remains separately identified. All checks were already exposed. Scenario envelopes are not confidence intervals.','','## Decision','',out.decision.reason,'','## Fixed v2.8 check rows after refitting','','Every split winner is compared on the same original check rows. Some original check rows enter alternate fits; these comparisons are diagnostics, not blind validation.','','| Split | Retained fraction | High-J loss | P51 speed / climb MAE | P47 speed / climb MAE | Spitfire speed / climb MAE |','|---|---:|---:|---:|---:|---:|'];
 const row=(name,model,summary)=>{const vals=['p51b','p47b','spitfire_lfix_bs543'].map(id=>{const s=summary.find(s=>s.id===id);return f(s.speedCheckMae)+' mph / '+f(s.climbCheckMae)+' ft/min';});lines.push('| '+name+' | '+model.params.retainedPowerFraction+' | '+model.params.advanceLoss+' | '+vals.join(' | ')+' |');};
 row('Retained v2.8',{params:F.sharedPropeller},out.current);for(const s of out.splits)row(s.split,s.winner,s.fixedChecks);for(const s of out.extension)row(s.split+' extended e',s.winner,s.summary);
 lines.push('','Own-split check counts and errors, all near-optimal families within '+P.nearOptimalScoreAllowance+' objective units, raw residuals and clipping flags are retained in [JSON](../validation/current/v29-robustness.json). Bf109 speed is included there; no Bf109 climb score is invented.','','## Candidate selection limits','',out.candidateChecks.length+' distinct fixed candidates were checked: the three original-grid split winners, three extended-grid winners, and original-split near-optimal families, with duplicates removed. None is a global optimization claim. Alternative fit splits change which observations contribute to fitting; the same observations are still exposed engineering data. Only this finite search was evaluated.','', '## Mustang chart power and weight stress','','Two 2200-ft report rates, same source-chart BHP/weight choices for both models. Five exact chart nodes were calculated; higher-altitude predictions without observed matched rates carry null residuals.','','| Weight lb | 67 / 75-inHg BHP readings | C climb MAE ft/min | P climb MAE ft/min |','|---|---|---:|---:|');
 for(const p of out.chart.paired)lines.push('| '+p.weightLb+' | '+p.selection+' / '+p.selection75+' | '+f(p.cMae)+' | '+f(p.pMae)+' |');
 lines.push('', 'P improves '+out.chart.improves+' of '+out.chart.total+' paired power/weight scenarios. Source graph brackets are not measured torque uncertainty. No interpolation across altitude, rating or gear.','','## Spitfire lower-bound profile','','Shared propeller parameters held at v2.8 while effective e and aggregate open-state drag refit. Lower e is only a model scenario.','','| Effective e | Training objective | Config delta CD0 | Speed check MAE mph | Climb check MAE ft/min |','|---|---:|---:|---:|---:|');
 for(const b of out.boundary)lines.push('| '+b.e+' | '+b.fit.score.toFixed(4)+' | '+b.fit.delta.toFixed(5)+' | '+f(b.summary.speedCheckMae)+' | '+f(b.summary.climbCheckMae)+' |');
 lines.push('','## Figure 5 reading and RPM stress','','Six source points retain their recorded 2100/2300/2700/3000 RPM. Each uses a 27-case Cartesian grid: TAS ±4 mph, BHP ±35, and assumed RPM ±100. These offsets are not independent historical observations or probabilities.','','| Source point | Source RPM | Nominal BHP residual | Scenario residual min / max BHP |','|---|---:|---:|---:|');
 for(const p of out.figure5.points)lines.push('| '+p.point+' | '+p.sourceRpm+' | '+f(p.recordedRpmNominal)+' | '+f(p.minResidualHp)+' / '+f(p.maxResidualHp)+' |');
 lines.push('','## Interpretation','','The small fitted Mustang residual is not a reliable uncertainty estimate. Mass and assigned power perturbations change it substantially; compare the full scenario ranges rather than retaining the nominal 9 ft/min as a prediction guarantee. Spitfire boundary movement can trade induced drag against aggregate configuration loss and shared propeller losses. A lower training score alone does not identify the physical cause.','','P47 is compared with both v2.8 and its earlier conditional climb fit (70.5 ft/min on original reserved points), not just raw C. No measured historical turn/stall or 5:1 accuracy result follows. The existing Bf109 simulator scenario remains distinct. Source observations, shaft-power curves, historical speed anchors and frozen baselines are untouched.','','Reproduce with npm run diagnose:robustness and npm run check. Policy is recorded in calibration/v2.9-robustness-policy.json. Interactive browser testing is reported separately in CURRENT_VALIDATION.md.');
 fs.writeFileSync(path.join(root,'validation/current/v29-robustness.json'),JSON.stringify(out,null,2)+'\n');fs.writeFileSync(path.join(root,'docs/V29_ROBUSTNESS.md'),lines.join('\n')+'\n');
 console.log(JSON.stringify({decision:out.decision,chartPairsImproved:out.chart.improves,chartPairs:out.chart.total,splits:out.splits.map(s=>({split:s.split,params:s.winner.params})),extension:out.extension.map(s=>({split:s.split,params:s.winner.params,spitE:s.winner.fits.find(f=>f.id==='spitfire_lfix_bs543').e}))}));return out;
}
if(require.main===module)writeReport();
module.exports={run,writeReport,inFit,fitAircraft,search,guardrails,chartScenarios,figureScenarios,finite,ownChecks};
