'use strict';

const V44=require('./turn_performance_v44.cjs');
const pack=require('../../references/analysis/fighter-derived-evidence-2026-11-11.json');

const coverageIds={
 bf109f4:'bf109f4_representative',fw190a4:'fw190a4_783',p51b:'p51b_4324777',
 spitfire_lfix_bs543:'spitfire_lfix_bs543',p47b:'p47b_415902',p38g:'p38g_4212687',f4u4:'f4u4_80765'
};
const relatedUrl='https://github.com/hound83/WW2-Aircraft-Physics-Simulator/blob/main/docs/research/WW2_FIGHTER_CALCULATED_EVIDENCE_2026-11-11.md';

function link(record){
 const type=record.kind?.startsWith('primary')?'Primary report':record.kind?.startsWith('secondary')?'Secondary source':'Input source';
 return {label:type,title:record.title,url:record.url};
}

function climbRegions(model,check){
 if(!model.benchmarkCooling||!check)return [];
 const {branches,ratings}=model.benchmarkCooling;
 return branches.flatMap(branch=>{
  const phase=Object.keys(ratings).find(key=>ratings[key].rating===branch.rating);
  const rows=check.rows.filter(row=>row.mode===phase&&row.altFt>=branch.minFt&&row.altFt<=branch.maxFt&&Number.isFinite(row.tasMph));
  if(rows.length<2)return [];
  const anchors=rows.map(({altFt,tasMph})=>({altFt,tasMph})).sort((a,b)=>a.altFt-b.altFt);
  return [{metric:'climb',phase,cooling:'report-conditioned',anchors,
   source:{label:'Primary report',title:check.name+' climb',url:check.url}}];
 });
}

function graphEvidence(data){
 const entries=Object.entries(data.models).map(([id,model])=>{
  const spec=data.specification.aircraft[id];
  const source=link(data.specification.sources[spec.sources[0]]);
  const chartTitles=pack.charts.filter(chart=>chart.aircraft===coverageIds[id]).map(chart=>chart.title);
  const related=chartTitles.length?{label:'Related calculations',title:chartTitles.join(' · '),url:relatedUrl}:null;
  const maneuverLift=id==='p51b'?{label:'Primary lift report',title:data.turnEvidence.mustang.title,url:data.turnEvidence.mustang.url,
   input:{grade:'primary',method:'table'}}:null;
  const regions=climbRegions(model,data.flightChecks.find(check=>check.id===id));
  return [id,{source,related,maneuverLift,regions}];
 });
 return Object.fromEntries(entries);
}

function browserData(){
 const data=V44.browserData();
 return {...data,graphEvidence:graphEvidence(data)};
}

module.exports={browserData,graphEvidence};
