'use strict';

(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BenchmarkMatchup=api;
})(globalThis,function(){
 const epsilon=1e-9;

 function compare(metric,a,b,tolerances){
  if(!Number.isFinite(a)||!Number.isFinite(b))return null;
  const policy=tolerances[metric];
  let margin=policy.spread;
  if(policy.unit==='%')margin*=Math.abs((a+b)/2)/100;
  else if(metric==='level_speed')margin/=1.609344;
  const delta=metric==='elapsed_time'?b-a:a-b;
  const lead=Math.abs(delta)<=margin+epsilon?'tie':delta>0?'a':'b';
  return {lead,delta,margin};
 }

 function turnVerdict(bounds,margin){
  if(!bounds)return null;
  const [low,high]=bounds;
  if(low>margin+epsilon)return 'a';
  if(high<-margin-epsilon)return 'b';
  if(low>=-margin-epsilon&&high<=margin+epsilon)return 'tie';
  return 'uncertain';
 }

 return Object.freeze({compare,turnVerdict});
});
