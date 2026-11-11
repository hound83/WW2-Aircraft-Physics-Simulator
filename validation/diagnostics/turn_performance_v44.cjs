'use strict';

const fs=require('node:fs');
const path=require('node:path');
const M=require('../../src/physics.js');
const B=require('../../src/operating-benchmark.js');
const T=require('../../src/turn-lift.js');
const P=require('../../src/turn-performance.js');
const V43=require('./operating_benchmark_v43.cjs');
const L=require('../../references/p51-turn-lift-tn1044.json');
const evidence=require('../../references/v44-turn-evidence.json');
const baseline=require('../../references/analysis/v44-operating-before.json');

function withTurnData(data){
 const mustang=data.models.p51b;
 return {...data,models:{...data.models,p51b:{...mustang,maneuverLiftSource:evidence.mustang}},turnEvidence:evidence};
}

function liftChecks(model){
 const source=evidence.mustang;
 const areaScale=model.ac.wingAreaM2/(source.sourceAreaFt2*.09290304);
 const rows=source.check.map(([mach,low,high])=>({
  mach,observedBand:[low,high],observedMidpoint:(low+high)/2,
  before:model.ac.clMaxAssumed*areaScale,after:P.liftRead(source,mach).midpoint
 }));
 const outside=(r,key)=>Math.max(0,r.observedBand[0]-r[key],r[key]-r.observedBand[1]);
 const mean=(key,fn)=>rows.reduce((sum,row)=>sum+fn(row,key),0)/rows.length;
 return {source:source.url,rows,
  meanOutsideBefore:mean('before',outside),meanOutsideAfter:mean('after',outside),
  midpointMaeBefore:mean('before',(r,k)=>Math.abs(r[k]-r.observedMidpoint)),
  midpointMaeAfter:mean('after',(r,k)=>Math.abs(r[k]-r.observedMidpoint)),
  interpretation:'Previously exposed Figure 6 trace bands at withheld Mach sections. Before is the nominal maneuver lift outside the older altitude gate. After is the interior of the bounded lift transfer. This verifies the curve shape in report coordinates.'};
}

function browserData(){
 const data=withTurnData(V43.browserData());
 return {...data,turnLiftChecks:liftChecks(data.models.p51b)};
}

function compact(row){
 return {stallEasMph:row.stallEasMph,turnDegSec:row.sustained?.rateDegSec??null,
  turnEasMph:row.sustained?.easMph??null,turnG:row.sustained?.g??null,
  climbFpm:row.climb?.climbFpm??null,vyEasMph:row.climb?.easMph??null,levelTasMph:row.level?.tasMph??null};
}

function run(){
 const control=V43.buildData(),candidate=withTurnData(control);
 const {models,specification:S}=candidate;
 const rows=baseline.rows.map(values=>{
  const {id,altFt,mode,injection,...before}=Object.fromEntries(baseline.columns.map((key,i)=>[key,values[i]]));
  const settings={mode,injection,extension:true,fuelFraction:.5};
  const row=B.metrics(M,T,L,models[id],S.aircraft[id],S.policy,settings,altFt);
  return {id,altFt,mode,injection,before,after:compact(row)};
 });
 const comparison=S.altitudesFt.flatMap(altFt=>['normal','combat'].map(mode=>{
  const settings={mode,extension:true,fuelFraction:.5};
  const probe=(data,id,easMph)=>{
   const spec=S.aircraft[id],w=B.load(spec,S.policy,settings).weightLb;
   const flight=B.evaluate(M,T,L,data.models[id],spec,settings,altFt,easMph,w);
   return P.assessment(flight,evidence.sensitivity);
  };
  const samples=[125,150,175,200,225,250,275,300].map(easMph=>{
   const reference=probe(control,'p51b',easMph),a=probe(candidate,'p51b',easMph),b=probe(candidate,'spitfire_lfix_bs543',easMph);
   return {easMph,mustangV43:reference.nominal?.turn??null,mustang:a,spitfire:b,difference:P.difference(a,b)};
  });
  return {altFt,mode,samples};
 }));
 return {version:require('../../package.json').version,baseline:baseline.commit,rows,
  lift:liftChecks(models.p51b),comparison,directTurns:evidence.directTurns,sensitivity:evidence.sensitivity,
  flightChecks:V43.reportClimbs(control),independentThunderbolt:V43.independentThunderbolt(control)};
}

function writeReport(){
 const r=run();
 fs.writeFileSync(path.join(__dirname,'../current/turn-performance-v44.json'),JSON.stringify(r,null,2)+'\n');
 return r;
}

if(require.main===module){
 const r=writeReport();
 console.log(JSON.stringify({states:r.rows.length,lift:r.lift,pairedTurnStates:r.comparison.length},null,2));
}

module.exports={withTurnData,liftChecks,browserData,run,writeReport};
