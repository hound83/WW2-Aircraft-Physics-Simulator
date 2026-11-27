'use strict';
const M=require('../../src/physics.js'),T=require('../../src/turn-lift.js'),L=require('../../references/p51-turn-lift-tn1044.json');
const S=require('../../src/fleet-steady-turn.js'),Turn=require('../../src/turn-performance.js');
const sources=require('../../references/analysis/m4-steady-turn-sources.json');

function build(data,poweredTurn,tolerances){
 const settings={mode:'combat',fuelFraction:.5};
 const altitudes=[0,10000,20000],speeds=[150,210,270],ids=Object.keys(data.models);
 const cases=[];
 for(const altFt of altitudes)for(const easMph of speeds){
  const rows=Object.fromEntries(ids.map(id=>[id,S.point(M,T,L,data,id,settings,altFt,easMph)]));
  const counts={a:0,b:0,tie:0,uncertain:0,boundary:0,unavailable:0};
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
   const verdict=S.compare(rows[ids[i]],rows[ids[j]],tolerances);
   counts[verdict.ordering??'unavailable']++;
  }
  cases.push({altFt,easMph,rows,counts});
 }
 const ellis=sources.ellis;
 const mustang=ellis.specimens.find(s=>s.serial==='45-11586');
 // Use the study's published takeoff mass as a proxy for the unknown turn-event mass.
 const restored=require('../../references/analysis/combined-flight-comparison-sources.json').restored;
 const weightLb=restored.rows.find(row=>row[1]===mustang.serial)[2];
 const proxy=mustang.points.map(([kias,g])=>{
  const tas=M.tasFrom(kias*1852/1609.344,'CAS',ellis.altFtMsl),eas=M.airspeeds(tas,ellis.altFtMsl).eas;
  const observedEquivalent=Turn.turnFromLoad(g,tas);
  const modeled=S.point(M,T,L,data,mustang.profile,{mode:'normal',fuelFraction:.5},ellis.altFtMsl,eas,weightLb);
  return {kias,g,easMph:eas,weightLb,observedEquivalent,modeled,gError:modeled.status==='steady'?modeled.g-g:null};
 });
 const simulation=sources.simulation.map(record=>{
  if(!record.standardKg)return record;
  const replay=record.points.map(([altM,iasKmh,seconds])=>{
   const altFt=altM/.3048,tas=M.tasFrom(iasKmh/1.609344,'CAS',altFt);
   const r=S.point(M,T,L,data,record.profile,settings,altFt,M.airspeeds(tas,altFt).eas,record.standardKg/.45359237);
   return {altM,iasKmh,seconds,modelSeconds:r.seconds??null,rating:r.rating};
  });
  return {...record,replay};
 });
 return {settings,cases,ellis:{...ellis,proxyId:mustang.profile,proxy},simulation,
  finnish:{id:poweredTurn.observation.modelId,source:poweredTurn.observation.transcriptions,
   conditions:poweredTurn.observation.conditions,cleanSeconds:poweredTurn.clean.seconds,openSeconds:poweredTurn.open.seconds}};
}
module.exports={build};
