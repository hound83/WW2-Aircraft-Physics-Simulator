'use strict';

(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BenchmarkGraphEvidence=api;
})(globalThis,function(){
 const palettes={
  germany:['#ffc76e','#d49149'],
  us:['#83d3ff','#5197e9'],
  uk:['#7ce5cc','#38ad9a'],
  ussr:['#ff959a','#e56371'],
  other:['#d2bdf4','#a98bd9']
 };

 function colors(first,second){
  const a=palettes[first]??palettes.other,b=palettes[second]??palettes.other;
  return {a:a[0],b:b[a===b?1:0]};
 }

 function nearSchedule(anchors,altFt,tasMph){
  const exact=anchors.find(point=>point.altFt===altFt);
  const lower=anchors.findLast(point=>point.altFt<altFt)??exact;
  const upper=anchors.find(point=>point.altFt>altFt)??exact;
  return lower&&upper&&tasMph>=Math.min(lower.tasMph,upper.tasMph)&&
   tasMph<=Math.max(lower.tasMph,upper.tasMph);
 }

 function interpolate(rows,altFt){
  const i=rows.findIndex(row=>row[0]>=altFt);
  if(i<0)return null;
  const next=rows[i];
  if(next[0]===altFt)return next.slice(1);
  if(i===0)return null;
  const previous=rows[i-1],fraction=(altFt-previous[0])/(next[0]-previous[0]);
  return previous.slice(1).map((value,j)=>value+(next[j+1]-value)*fraction);
 }

 function climbReference(fit,flight){
  const alt=flight.altFt,rate=flight.power?.climbFpm;
  if(!fit?.envelopes||!(rate>0))return null;
  const data=fit.envelopes.map(rows=>interpolate(rows,alt)).find(Boolean);
  const replay=interpolate(fit.replays,alt);
  if(!data||!replay)return null;
  const [observed,low,high]=data,[replayed,tasMph,weightLb]=replay;
  const delta=rate-replayed;
  return {observed,replayed,tasMph,weightLb,bounds:[low+delta,high+delta]};
 }

 function describe(flight,kind,record,limiting){
  const state=flight.benchmark;
  const inDomain=state&&!state.estimated&&flight.status==='modelled';
  const fit=inDomain&&(record.regions??[]).find(region=>
   region.metric===kind&&state.phase===region.phase&&state.cooling===region.cooling&&
   nearSchedule(region.anchors,flight.altFt,flight.tasMph));
  const cleanTurn=inDomain&&kind==='turn'&&state.cooling==='clean';
  const lift=cleanTurn&&limiting==='lift'&&state.maneuverLift&&record.maneuverLift;
  const power=cleanTurn&&limiting==='power'&&(record.turnPower??[]).find(t=>
   t.phase===state.phase&&t.gear===flight.engine?.gear&&flight.altFt>=t.minFt&&flight.altFt<=t.maxFt);
  const source=fit?.source||lift||power?.source||
   (kind==='turn'&&state?.maneuverLift?record.maneuverLift:record.source);
  let label='Calculated · model estimate';
  if(fit)label='Calculated · near flight-test schedule';
  else if(lift)label='Calculated · NACA maneuver-lift data';
  else if(power)label='Calculated · table-supported power';
  else if(state?.estimated)label='Calculated · extrapolated power';
  else if(kind==='climb'&&state?.cooling==='report-conditioned')label='Calculated · report fit transferred';
  return {covered:Boolean(fit||lift||power),label,source,related:record.related,reference:climbReference(fit,flight)};
 }

 function sample(eas,estimate,covered,range){
  const bounds=range?.length===2&&range.every(Number.isFinite)&&range[0]<=range[1]?range:null;
  const rate=Number.isFinite(estimate)?estimate:bounds?(bounds[0]+bounds[1])/2:null;
  return {eas,rate,covered,range:bounds,
   outsideRange:Boolean(bounds&&(rate<bounds[0]||rate>bounds[1]))};
 }

 function lineSegments(points){
  const result=[];
  let previous=null;
  for(const point of points){
   if(!Number.isFinite(point.rate)){previous=null;continue;}
   if(previous){
    // A segment is supported when both of its endpoints are covered.
    const solid=Boolean(previous.covered&&point.covered),last=result.at(-1);
    if(last?.solid===solid&&last.points.at(-1)===previous)last.points.push(point);
    else result.push({solid,points:[previous,point]});
   }
   previous=point;
  }
  return result;
 }

 function bands(points){
  const result=[];
  let current=[];
  for(const point of points){
   if(point.range)current.push(point);
   else{
    if(current.length>1)result.push(current);
    current=[];
   }
  }
  if(current.length>1)result.push(current);
  return result;
 }

 return Object.freeze({colors,describe,sample,lineSegments,bands});
});