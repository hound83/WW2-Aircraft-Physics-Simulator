'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.UniversalMeasuredClimb=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 // Exact report states only. A measured shaft input is not a new altitude power law.
 function evaluate(M,ac,ledger,stateId,scenario={}){
  const blocked=reason=>({status:'blocked-measured-climb',reason,predictedFpm:null,errorFpm:null});
  if(Object.keys(scenario).some(k=>!['deltaCd0','weightLb'].includes(k)))return blocked('unsupported-scenario-input');
  const identity=ac.stallIdentity;
  if(!ledger||['aircraftId','variant','specimen'].some(k=>!identity?.[k]||identity[k]!==ledger.identity?.[k]||/unknown|placeholder|unspecified/i.test(identity[k])))return blocked('source-identity-mismatch');
  const nodes=ledger.states.filter(s=>s.id===stateId);if(nodes.length!==1)return blocked('exact-unique-report-state-required');
  const s=nodes[0],c=ledger.configuration,g=ledger.gearing;
  if(!ledger.source?.reference||!ledger.source?.sha256||ledger.powerKind!=='report-recorded-shaft-bhp'||!g?.source||!(g.propPerEngine>0&&g.propPerEngine<1))return blocked('missing-source-power-or-gearing');
  if(!c||c.gearState!=='up'||c.flaps!=='up'||!c.cooling||c.stores!=='none')return blocked('unsupported-report-configuration');
  if(!(Number.isFinite(s.altFt)&&s.altFt>=0&&s.altFt<=36089&&Number.isFinite(s.tasMph)&&s.tasMph>=100&&s.tasMph<=590&&Number.isFinite(s.shaftHp)&&s.shaftHp>0&&Number.isFinite(s.engineRpm)&&s.engineRpm>0&&s.sourceLocation&&s.rating&&s.gear))return blocked('invalid-report-state');
  const weightLb=scenario.weightLb??ledger.mass.valueLb,deltaCd0=scenario.deltaCd0??0;
  if(!(Number.isFinite(weightLb)&&weightLb>0&&Number.isFinite(deltaCd0)&&deltaCd0>=0&&deltaCd0<=.03))return blocked('invalid-weight-or-drag-scenario');
  const base=M.workingOptions(ac),polar=base.polar;
  // Keep the original speed-anchor polar fixed. Never reanchor on the measured climb BHP.
  const isolated={...ac,propGeometry:{...ac.propGeometry,engineRpmByRating:{[s.rating]:s.engineRpm},reductionRatioEnginePerProp:1/g.propPerEngine},powerRatings:{[s.rating]:{notes:ledger.source.reference+' exact report BHP; no interpolation',gears:{[s.gear]:[{altFt:s.altFt,bhp:s.shaftHp}]}}}};
  const r=M.evaluated(isolated,s.altFt,s.tasMph,{profile:'P',polar,rating:s.rating,gear:s.gear,weightLb,addedDragAreaM2:deltaCd0*ac.wingAreaM2});
  if(r.status!=='modelled')return blocked(r.status);
  return {status:'qualified-measured-power-scenario',stateId,altFt:s.altFt,tasMph:s.tasMph,engineRpm:s.engineRpm,propRpm:r.prop.propRpm,shaftHp:r.engine.bhp,propulsiveHp:r.power.propulsiveHp,propEta:r.prop.eta,weightLb,deltaCd0,predictedFpm:r.power.climbFpm,observedFpm:Number.isFinite(s.observedFpm)?s.observedFpm:null,errorFpm:Number.isFinite(s.observedFpm)?r.power.climbFpm-s.observedFpm:null,polar:{...polar},sourceSpecimen:identity.specimen,historicalAccuracy:null,qualification:'Same-specimen report power/RPM/TAS; gross test mass is a scenario, installed propeller efficiency and open-cooling drag remain unverified. No climb fitting.'};
 }
 return Object.freeze({evaluate});
});
