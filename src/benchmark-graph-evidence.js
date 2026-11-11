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

 function describe(flight,kind,record){
  const state=flight.benchmark;
  const fit=state&&!state.estimated&&flight.status==='modelled'&&(record.regions??[]).find(region=>
   region.metric===kind&&nearSchedule(region.anchors,flight.altFt,flight.tasMph)&&
   (region.phase===undefined||state.phase===region.phase)&&
   (region.cooling===undefined||state.cooling===region.cooling));
  const source=fit?.source??(kind==='turn'&&state?.maneuverLift?record.maneuverLift:record.source);
  let label='Calculated · model estimate';
  if(fit)label='Calculated · near flight-test schedule';
  else if(state?.estimated)label='Calculated · extrapolated power';
  else if(kind==='turn'&&state?.maneuverLift)label='Calculated · measured lift input';
  else if(kind==='climb'&&state?.cooling==='report-conditioned')label='Calculated · report fit transferred';
  return {covered:Boolean(fit),label,source,related:record.related};
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