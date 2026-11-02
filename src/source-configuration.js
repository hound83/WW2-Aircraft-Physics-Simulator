'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.UniversalSourceConfiguration=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function evaluate(M,F,C,ac,ledger,stateId,model,scenario={}){
  const blocked=reason=>({status:'blocked-configuration-model',reason,predictedFpm:null,errorFpm:null});
  if(Object.keys(scenario).some(k=>!['weightLb','retainedPowerScale'].includes(k)))return blocked('unsupported-scenario-input');
  if(!model||!ledger||!Array.isArray(ledger.states)||model.sourceSha256!==ledger.source?.sha256||['aircraftId','variant','specimen'].some(k=>model.identity?.[k]!==ledger.identity?.[k]))return blocked('calibration-source-mismatch');
  if(JSON.stringify(model.configuration)!==JSON.stringify(ledger.configuration))return blocked('calibration-configuration-mismatch');
  if(!(Number.isFinite(model.deltaCd0)&&model.deltaCd0>=0&&model.deltaCd0<=.03&&Number.isFinite(model.heatFraction)&&model.heatFraction>=0&&model.heatFraction<=1))return blocked('invalid-configuration-coefficients');
  const refs=ledger.states.filter(s=>s.id===model.reference?.stateId),states=ledger.states.filter(s=>s.id===stateId);
  if(refs.length!==1||states.length!==1)return blocked('exact-reference-and-target-required');
  const ref=refs[0],state=states[0];
  if(ref.altFt!==model.reference.altFt||ref.tasMph!==model.reference.tasMph||ref.shaftHp!==model.reference.shaftHp)return blocked('reference-state-mismatch');
  const raw=F.evaluate(M,ac,ledger,stateId,scenario);if(raw.status!=='qualified-measured-power-scenario')return raw;
  const factor=C.factor(M,state,raw.shaftHp,model.reference,model.heatFraction),deltaCd0=model.deltaCd0*factor;
  if(!(Number.isFinite(deltaCd0)&&deltaCd0>=0&&deltaCd0<=.03))return blocked('configuration-drag-outside-bound');
  const result=F.evaluate(M,ac,ledger,stateId,{...scenario,deltaCd0});
  return {...result,configurationModelVersion:model.version,heatFraction:model.heatFraction,configurationFactor:factor,referenceDeltaCd0:model.deltaCd0,fitRole:model.fitStateIds?.includes(stateId)?'fit':'reserved engineering check',qualification:'Source-matched aggregate configuration-loss fit; pressure/airflow and shaft-power mixture is an engineering approximation, not isolated measured cooling drag. Gross test mass and installed propeller losses remain assumptions.'};
 }
 return Object.freeze({evaluate});
});
