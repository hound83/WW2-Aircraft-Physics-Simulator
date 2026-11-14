'use strict';

(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.TurnPerformance=api;
})(globalThis,function(){
 const G=9.80665;
 const MPH=.44704;

 function interpolate(rows,x){
  if(x<rows[0][0]||x>rows.at(-1)[0])return null;
  const i=rows.findIndex(row=>row[0]>=x),right=rows[i];
  if(right[0]===x)return right.slice(1);
  const left=rows[i-1],f=(x-left[0])/(right[0]-left[0]);
  return left.slice(1).map((y,k)=>y+f*(right[k+1]-y));
 }

 function liftRead(source,mach){
  const bracket=interpolate(source.fit,mach);
  return bracket?{midpoint:(bracket[0]+bracket[1])/2,bracket}:null;
 }

 function maneuverLift(M,ac,source,altFt,tasMph,options){
  if(!source||options.profile!=='P'||ac.stallIdentity?.aircraftId!=='p51b'||
   ac.stallIdentity?.specimen!=='43-24777'||options.storesWeightLb||options.addedDragAreaM2)return null;
  const altitude=source.minimumMachByAltitude,minAlt=altitude[0][0],maxAlt=altitude.at(-1)[0];
  const lower=interpolate(altitude,altFt)?.[0];
  if(lower===undefined)return null;
  const mach=M.airspeeds(tasMph,altFt).mach,upper=source.fit.at(-1)[0];
  const sample=liftRead(source,mach);
  if(!sample)return null;
  const fraction=Math.min(1,(mach-lower)/source.machFade,(upper-mach)/source.machFade,
   (altFt-minAlt)/source.altitudeFadeFt,(maxAlt-altFt)/source.altitudeFadeFt);
  if(fraction<=0)return null;
  const scale=source.sourceAreaFt2*.09290304/ac.wingAreaM2;
  const reference=options.maneuverClMax??options.clMax??ac.clMaxAssumed;
  const mix=cl=>reference+(cl*scale-reference)*fraction;
  return {clMax:mix(sample.midpoint),bracket:sample.bracket.map(mix),mach,fraction,source:'naca-tn1044-figure-6'};
 }

 function turnFromLoad(n,tasMph){
  const v=tasMph*MPH,radSec=G*Math.sqrt(Math.max(0,n*n-1))/v;
  return {g:n,rateDegSec:radSec*180/Math.PI,radiusM:radSec>0?v/radSec:null,
   bankDeg:Math.acos(1/n)*180/Math.PI};
 }

 function availableHp(flight,powerFraction){
  return Math.min(flight.power.shaftHp,flight.power.propulsiveHp*powerFraction);
 }
 function addedDragHp(flight,n,dragFraction){
  return flight.drag.inducedHp*dragFraction*(n*n-1);
 }
 function liftBounds(flight,[low,high]){
  const evidence=flight.benchmark?.maneuverLift;
  return evidence?[Math.min(low,evidence.bracket[0]/evidence.clMax),Math.max(high,evidence.bracket[1]/evidence.clMax)]:[low,high];
 }

 // Separate the power needed for level flight from the additional drag above 1 G.
 // A multiplier on the latter preserves the one-g drag anchor at this speed.
 function state(flight,{liftFraction=1,powerFraction=1,dragFraction=1}={}){
  if(flight.status!=='modelled'||!flight.power||!flight.limits)return null;
  const {limits,drag,power,tasMph}=flight;
  const available=availableHp(flight,powerFraction);
  const marginHp=available-power.requiredHp;
  const nLift=limits.nLift*liftFraction;
  const nPower=marginHp>=0?Math.sqrt(1+marginHp/Math.max(1e-9,drag.inducedHp*dragFraction)):null;
  const g=nPower===null||nLift<1?null:Math.min(nLift,nPower,limits.structG);
  const limiting=g===null?null:g===nPower?'power':g===nLift?'lift':'structure';
  const turn=g===null?null:turnFromLoad(g,tasMph);
  return {turn,limiting,nLift,nPower,nStructure:limits.structG,availableHp:available,levelHp:power.requiredHp,marginHp,
   turnDragHp:g===null?null:addedDragHp(flight,g,dragFraction)};
 }

 function assessment(flight,policy){
  const nominal=state(flight);
  const evidence=flight.benchmark?.maneuverLift;
  if(!nominal||!policy)return {nominal,range:null,evidence};
  const [lowLift,highLift]=policy.maneuverLiftFraction,[lowPower,highPower]=policy.usefulPowerFraction;
  const [lowDrag,highDrag]=policy.incrementalDragFraction;
  return {nominal,evidence,range:{
   lower:state(flight,{liftFraction:minLift,powerFraction:lowPower,dragFraction:highDrag}).turn,
   upper:state(flight,{liftFraction:maxLift,powerFraction:highPower,dragFraction:lowDrag}).turn
  }};
 }

 function dragSensitivity(flight,nominal,rivalG,[lowDrag,highDrag]){
  const range={
   lower:state(flight,{dragFraction:highDrag})?.turn,
   upper:state(flight,{dragFraction:lowDrag})?.turn
  };
  const cap=Math.min(nominal.nLift,nominal.nStructure);
  const targetDragHp=flight.drag.inducedHp*(rivalG*rivalG-1);
  const parity=rivalG>cap?{limiting:nominal.nLift<=nominal.nStructure?'lift':'structure'}:
   targetDragHp>0&&nominal.marginHp>0?{fraction:nominal.marginHp/targetDragHp}:null;
  return {nominal,range,parity};
 }

 // Apply a slope transfer only to the part of the lift interval covered by the source.
 function boundedDragTurn(flight,{minCl,maxCl,dragFraction}){
  const nominal=state(flight);
  if(!nominal?.turn||!(minCl>0&&maxCl>minCl&&dragFraction>0&&Number.isFinite(dragFraction)))return null;
  const {CL,inducedHp}=flight.drag;
  const startG=Math.max(1,minCl/CL),sourceG=maxCl/CL;
  if(sourceG<=startG||nominal.turn.g<=startG)return null;

  const physicalCap=Math.min(nominal.nLift,nominal.nStructure);
  const endG=Math.min(physicalCap,sourceG);
  const dragAt=g=>inducedHp*(startG**2-1+dragFraction*(g**2-startG**2));
  const g=nominal.marginHp>=dragAt(endG)?endG:
   Math.sqrt(startG**2+(nominal.marginHp/inducedHp-(startG**2-1))/dragFraction);
  const turnDragHp=dragAt(g);
  const remainingHp=Math.max(0,nominal.marginHp-turnDragHp);
  const lowerBound=g===sourceG&&sourceG<physicalCap&&remainingHp>1e-9;
  return {turn:turnFromLoad(g,flight.tasMph),liftCoefficient:CL*g,lowerBound,
   levelHp:nominal.levelHp,turnDragHp,remainingHp};
 }

 function difference(a,b,field='rateDegSec'){
  const x=a.nominal?.turn,y=b.nominal?.turn;
  if(!x||!y)return null;
  const lower=a.range?.lower&&b.range?.upper?a.range.lower[field]-b.range.upper[field]:null;
  const upper=a.range?.upper&&b.range?.lower?a.range.upper[field]-b.range.lower[field]:null;
  const range=Number.isFinite(lower)&&Number.isFinite(upper)?[lower,upper]:null;
  return {rateDegSec:x.rateDegSec-y.rateDegSec,g:x.g-y.g,
   radiusM:Number.isFinite(x.radiusM)&&Number.isFinite(y.radiusM)?x.radiusM-y.radiusM:null,
   range,side:range?(range[0]>.001?'a':range[1]<-.001?'b':'uncertain'):null};
 }

 return Object.freeze({liftRead,maneuverLift,turnFromLoad,availableHp,addedDragHp,liftBounds,state,assessment,dragSensitivity,boundedDragTurn,difference});
});
