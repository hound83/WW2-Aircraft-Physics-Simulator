'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.UniversalClimbConditions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const LBF=4.4482216153,MPH=.44704;
 function options(M,ac,state,exponent,powerScale=1,weightScale=1){
  if(state.aircraftId!==ac.stallIdentity.aircraftId||state.configuration!=='source-climb'||!state.source||!(state.weightLb>0&&state.tasMph>0&&Number.isFinite(powerScale)&&powerScale>0&&Number.isFinite(weightScale)&&weightScale>0))throw Error('Matched source-climb identity/configuration/input required');
  // Scale an isolated copy for sensitivity; never rewrite source nodes or observations.
  const a=powerScale===1?ac:{...ac,powerRatings:Object.fromEntries(Object.entries(ac.powerRatings).map(([k,v])=>[k,{...v,gears:Object.fromEntries(Object.entries(v.gears).map(([g,rows])=>[g,rows.map(p=>({...p,bhp:p.bhp*powerScale}))]))}]))};
  const o={...M.workingOptions(ac),rating:state.rating,gear:state.gear,weightLb:state.weightLb*weightScale};
  if(state.engineCondition){o.engineCondition=state.engineCondition;o.chargeExponent=exponent;}
  return {a,o};
 }
 function raw(M,ac,state,exponent,powerScale=1,weightScale=1){const {a,o}=options(M,ac,state,exponent,powerScale,weightScale),r=M.evaluated(a,state.altFt,state.tasMph,o);if(r.status!=='modelled')throw Error('Unavailable source-climb state: '+r.status);return r;}
 function factor(M,state,shaftHp,reference,heatFraction){
  if(!(heatFraction>=0&&heatFraction<=1&&reference.shaftHp>0))throw Error('Invalid configuration heat fraction/reference');
  const ratio=shaftHp/reference.shaftHp*M.isa(reference.altFt).rho/M.isa(state.altFt).rho*(reference.tasMph/state.tasMph)**3;
  return (1-heatFraction)+heatFraction*ratio;
 }
 function evaluate(M,ac,state,model,scenario={}){
  if(!model||!model.aircraft?.[state.aircraftId])throw Error('No condition-model calibration for this aircraft');
  const f=model.aircraft[state.aircraftId];
  if(!(Number.isFinite(model.chargeExponent)&&model.chargeExponent>=2/3&&model.chargeExponent<=1&&Number.isFinite(f.deltaCd0)&&f.deltaCd0>=0&&f.deltaCd0<=.03))throw Error('Invalid source-climb calibration');
  const r=raw(M,ac,state,model.chargeExponent,scenario.powerScale??1,scenario.weightScale??1);
  const shape=factor(M,state,r.engine.bhp,f.reference,model.heatFraction),delta=f.deltaCd0*shape;
  const adjusted=M.evaluated(ac,state.altFt,state.tasMph,{profile:'P',polar:{cd0:r.cleanCd0,e:r.oswald,source:'v3.1 source-anchor polar; conditional climb inputs'},weightLb:r.weightLb,rating:state.rating,gear:state.gear,...(state.engineCondition?{engineCondition:state.engineCondition,chargeExponent:model.chargeExponent}:{}),addedDragAreaM2:delta*ac.wingAreaM2});
  // For power sensitivity use the same isolated input copy as raw(), not an HP-to-climb multiplier.
  let result=adjusted;
  if((scenario.powerScale??1)!==1){const {a,o}=options(M,ac,state,model.chargeExponent,scenario.powerScale,scenario.weightScale??1);result=M.evaluated(a,state.altFt,state.tasMph,{...o,addedDragAreaM2:delta*ac.wingAreaM2});}
  if(result.status!=='modelled'||!Number.isFinite(result.power.climbFpm))throw Error('Nonfinite conditioned climb');
  const W=r.weightLb*LBF,V=state.tasMph*MPH,slope=.5*M.isa(state.altFt).rho*V**3*ac.wingAreaM2/W*196.8503937;
  return {stateId:state.id,aircraftId:state.aircraftId,altFt:state.altFt,tasMph:state.tasMph,rating:state.rating,gear:state.gear,weightLb:r.weightLb,observedFpm:state.observedFpm,predictedFpm:result.power.climbFpm,error:result.power.climbFpm-state.observedFpm,shaftHp:result.engine.bhp,propulsiveHp:result.power.propulsiveHp,configurationDeltaCd0:delta,configurationFactor:shape,rawFpm:r.power.climbFpm,dragSlopeFpmPerCd0:slope,chargeLawApplied:!!state.engineCondition};
 }
 return Object.freeze({raw,factor,evaluate});
});
