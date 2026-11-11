'use strict';
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BenchmarkServiceContext=api;
})(globalThis,function(){
 function yearLabel([start,end]){return start===end?String(start):start+'–'+end;}
 function overlap(a,b){
  if(a.group==='trials'||b.group==='trials')return null;
  const start=Math.max(a.years[0],b.years[0]),end=Math.min(a.years[1],b.years[1]);
  return start<=end?[start,end]:null;
 }
 function compare(a,b){
  if(a.group==='trials'||b.group==='trials')return 'Flight-test or training comparison';
  const years=overlap(a,b);
  if(!years)return 'Different main service periods';
  const theatres=a.theatres.filter(theatre=>b.theatres.includes(theatre));
  return theatres.length
   ? 'Approximate overlap · '+yearLabel(years)+' · '+theatres.join(', ')
   : 'Similar period · '+yearLabel(years)+' · Different main theatres';
 }
 return Object.freeze({compare,yearLabel,overlap});
});
