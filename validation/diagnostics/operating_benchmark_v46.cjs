'use strict';

const V45=require('./operating_benchmark_v45.cjs');
const pack=require('../../references/analysis/fighter-derived-evidence-2026-11-11.json');

const climbCharts={
 spitfire_lfix_bs543:'spitfire-climb-branches',
 p47b:'p47b-climb-branches'
};

const turnPowerSources={
 p51b:[{phase:'combat',rating:'67inHg',source:'p51-trial'}],
 p47b:[{phase:'combat',rating:'military',source:'p47'},{phase:'normal',rating:'normal',source:'p47'}],
 p38g:[{phase:'combat',rating:'climb',source:'p38-trial'}],
 f4u4:[{phase:'combat',rating:'military',source:'f4u'},{phase:'normal',rating:'normal',source:'f4u'}]
};

function powerTables(id,model,sources){
 return (turnPowerSources[id]??[]).flatMap(({phase,rating,source})=>{
  const report=sources[source];
  const link={label:'Primary power source',title:report.title,url:report.url};
  const inlet=model.ac.ratedInlet?.[rating];
  if(inlet){
   // The Corsair's high-blower transfer has a documented level-speed residual.
   return inlet.gears.filter(g=>g.gear!=='high').map(({gear,minFt,maxFt})=>({phase,gear,minFt,maxFt,source:link}));
  }
  const supplemental=model.options.flightEnvelope?.aircraft?.[id]?.power?.[rating];
  const branches=model.ac.powerRatings[rating]?.gears??(supplemental?{[supplemental.gear]:supplemental.nodes}:{});
  return Object.entries(branches).filter(([,rows])=>rows.length>1).map(([gear,rows])=>({
   phase,gear,minFt:rows[0].altFt,maxFt:rows.at(-1).altFt,source:link
  }));
 });
}

function climbBounds(region,check,chart){
 const heights=new Set(region.anchors.map(p=>p.altFt));
 const rows=check.rows.filter(r=>r.mode===region.phase&&heights.has(r.altFt)&&
  r.afterState?.cooling==='report-conditioned'&&Number.isFinite(r.after));
 const observed=new Map(rows.map(r=>[r.altFt,r.observed]));
 const measured=point=>point[4]==='primary'&&observed.get(point[0])===point[1];
 const envelopes=chart.series.filter(s=>s.points.filter(measured).length>=2).map(s=>{
  const matched=s.points.filter(measured);
  const low=matched[0][0],high=matched.at(-1)[0];
  return s.points.filter(p=>p[0]>=low&&p[0]<=high&&p.slice(1,4).every(Number.isFinite)).map(p=>p.slice(0,4));
 });
 return {...region,replays:rows.map(r=>[r.altFt,r.after,r.tasMph,r.weightLb]),envelopes};
}

function browserData(){
 const data=V45.browserData();
 const graphEvidence=Object.fromEntries(Object.entries(data.graphEvidence).map(([id,record])=>{
  const chart=pack.charts.find(c=>c.id===climbCharts[id]);
  const check=data.flightChecks.find(r=>r.id===id);
  return [id,{...record,turnPower:powerTables(id,data.models[id],data.specification.sources),
   turnSensitivity:id==='p51b'||id==='spitfire_lfix_bs543',
   regions:chart?record.regions.map(r=>climbBounds(r,check,chart)):record.regions}];
 }));
 return {...data,graphEvidence};
}

module.exports={browserData};
