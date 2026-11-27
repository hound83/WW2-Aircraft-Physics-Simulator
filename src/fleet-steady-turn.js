'use strict';

(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const api=factory(node?require('./operating-benchmark.js'):root.OperatingBenchmark,
  node?require('./turn-performance.js'):root.TurnPerformance,node?require('./benchmark-matchup.js'):root.BenchmarkMatchup);
 if(node)module.exports=api;else root.FleetSteadyTurn=api;
})(globalThis,function(B,Turn,Match){
 function loadingRange(spec,policy){
  // Use the simulator's selectable fuel envelope for comparisons at equal gross weight.
  return [.25,.75].map(fuelFraction=>B.load(spec,policy,{fuelFraction}).weightLb);
 }
 function commonRange(left,right){
  const low=Math.max(left[0],right[0]),high=Math.min(left[1],right[1]);
  return low<=high?[low,high]:null;
 }
 function point(M,T,L,data,id,settings,altFt,easMph,weightLb){
  const model=data.models[id],spec=data.specification.aircraft[id],policy=data.specification.policy;
  if(![altFt,easMph].every(Number.isFinite)||altFt<0||altFt>40000||easMph<=0)return {status:'invalid-condition'};
  const flightCase=B.levelFlightCase(M,T,L,model,spec,policy,settings,altFt,{allowProvisionalManeuver:true});
  const mass=weightLb===undefined?flightCase.initial.weightLb:weightLb;
  if(!(Number.isFinite(mass)&&mass>0))return {status:'invalid-weight'};
  const phase=B.phaseFor(spec,flightCase.settings,0,0,flightCase.initial.injectionLb);
  const base={id,altFt,easMph,openCooling:flightCase.settings.openCooling,weightLb:mass,rating:phase?.label,provisionalInputs:Boolean(spec.performanceIntake)};
  if(!phase)return {...base,status:'rating-time-exhausted'};
  if(easMph>flightCase.maxEasMph)return {...base,status:'speed-domain-unavailable'};
  const flight=flightCase.evaluate(easMph,mass,phase);
  if(flight.status!=='modelled')return {...base,status:flight.status};
  const {nominal,range}=Turn.assessment(flight,data.turnEvidence.sensitivity);
  if(!nominal?.turn||!(nominal.turn.rateDegSec>0))return {...base,status:nominal?.nLift<1?'below-stall':'no-sustained-turn'};
  const turn=nominal.turn,seconds=360/turn.rateDegSec;
  const rates=[range.lower?.rateDegSec,range.upper?.rateDegSec].map(r=>r>0?r:null);
  return {...base,status:'steady',rate:turn.rateDegSec,seconds,g:turn.g,bankDeg:turn.bankDeg,
   tasMph:flight.tasMph,shaftHp:flight.power.shaftHp,limiting:nominal.limiting,
   rates,estimatedPower:Boolean(flight.benchmark?.estimated),ratingSeconds:phase.seconds??null,
   wholeCircleAtRating:!Number.isFinite(phase.seconds)||seconds<=phase.seconds,
   powerBalanceHp:nominal.availableHp-nominal.levelHp-nominal.turnDragHp};
 }
 function compare(a,b,tolerances){
  if(a.status!=='steady'||b.status!=='steady')return {status:'unavailable'};
  const nominal=Match.compare('sustained_turn_rate',a.rate,b.rate,tolerances);
  const identical=['id','altFt','easMph','weightLb','rating','openCooling','rate','estimatedPower'].every(k=>a[k]===b[k]);
  const bounds=identical?[0,0]:[...a.rates,...b.rates].every(Number.isFinite)?[a.rates[0]-b.rates[1],a.rates[1]-b.rates[0]]:null;
  return {status:'compared',lead:nominal.lead,rateGap:a.rate-b.rate,secondsGap:b.seconds-a.seconds,
   margin:nominal.margin,bounds,ordering:bounds?Match.turnVerdict(bounds,nominal.margin):'boundary'};
 }
 return {point,compare,loadingRange,commonRange};
});
