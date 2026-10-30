'use strict';
// Reporting gate only: all physical predictions come from src/physics.js.
const known=x=>typeof x==='string'&&x.trim()&&!['unknown','unspecified'].includes(x.trim().toLowerCase());
const finite=x=>typeof x==='number'&&Number.isFinite(x),positive=x=>finite(x)&&x>0;
function errors(predicted,observed){
 const signed=finite(predicted)&&finite(observed)?predicted-observed:null;
 return {signed,absolute:signed===null?null:Math.abs(signed),percent:signed===null||observed===0?null:100*signed/observed};
}
function anchorRole(ac,point){
 const a=ac.calibration;
 return point.altFt===a.altFt&&point.rating===a.rating&&point.gear===a.gear&&point.mphTas===a.tasMph?'speed-anchor':'non-anchor-checkpoint';
}
function assess(observation,prediction){
 const o=observation,p=prediction,reasons=[];
 for(const field of ['aircraftId','variant','specimen'])if(!known(o[field])||!known(p[field])||o[field]!==p[field])reasons.push(field+'-not-matched');
 if(!['level-speed','climb-rate'].includes(o.metric)||o.metric!==p.metric)reasons.push('metric-not-matched');
 const unit=o.metric==='level-speed'?'mph-TAS':'ft/min';
 if(o.unit!==unit||p.unit!==unit)reasons.push('unit-not-matched');
 if(!finite(o.altFt)||o.altFt<0||o.altFt>36089||o.altFt!==p.altFt)reasons.push('altitude-not-matched');
 if(!finite(o.value)||!finite(p.value)||(o.metric==='level-speed'&&!positive(o.value)))reasons.push('observation-or-prediction-unavailable');
 if(!known(o.source?.reference)||!['primary-transcription','primary-scan'].includes(o.source?.kind))reasons.push('historical-source-not-established');
 if(o.atmosphere!=='standard'||p.atmosphere!=='standard')reasons.push('standard-atmosphere-not-established');
 if(!positive(o.weight?.valueLb)||!['instantaneous','normalized'].includes(o.weight?.kind)||!known(o.weight?.source))reasons.push('point-weight-not-established');
 if(!positive(p.weightLb)||o.weight?.valueLb!==p.weightLb)reasons.push('weight-not-matched');
 for(const field of ['rating','gear'])if(!known(o[field])||!known(p[field])||o[field]!==p[field])reasons.push(field+'-not-matched');
 if(!positive(o.engineRpm)||o.engineRpm!==p.engineRpm)reasons.push('engine-rpm-not-matched');
 for(const field of ['gearState','flaps','cooling','stores'])if(!known(o.configuration?.[field])||!known(p.configuration?.[field])||o.configuration[field]!==p.configuration[field])reasons.push('configuration-'+field+'-not-matched');
 if(o.airspeed?.kind!=='TAS'||p.airspeed?.kind!=='TAS'||o.airspeed?.verified!==true||!known(o.airspeed?.source))reasons.push('airspeed-basis-not-established');
 if(o.metric==='climb-rate'&&(!positive(o.airspeed?.valueMph)||o.airspeed.valueMph!==p.airspeed?.valueMph||p.speedSelection!=='reported'))reasons.push('climb-speed-not-matched');
 const diagnostic=errors(p.value,o.value),matched=reasons.length===0;
 return {...o,prediction:p,conditionStatus:matched?'matched':'excluded',exclusions:reasons,diagnosticErrors:diagnostic,matchedErrors:matched?diagnostic:{signed:null,absolute:null,percent:null},
  validationEligible:matched&&o.fitRole==='non-anchor-checkpoint'&&o.independent===true,
  validationExclusions:[...(o.fitRole==='speed-anchor'?['fitted-speed-anchor']:[]),...(o.independent===true?[]:['not-an-independent-withheld-observation'])]};
}
function aggregate(rows,mode){
 if(!['diagnostic','matched','validation'].includes(mode))throw Error('Unknown performance aggregation mode');
 const selected=rows.filter(r=>mode==='diagnostic'?finite(r.diagnosticErrors.signed):mode==='matched'?r.conditionStatus==='matched'&&r.fitRole!=='speed-anchor':r.validationEligible);
 const values=selected.map(r=>mode==='diagnostic'?r.diagnosticErrors:r.matchedErrors);
 return {count:values.length,meanSigned:values.length?values.reduce((s,x)=>s+x.signed,0)/values.length:null,mae:values.length?values.reduce((s,x)=>s+x.absolute,0)/values.length:null,maxAbsolute:values.length?Math.max(...values.map(x=>x.absolute)):null};
}
function pair(a,b,{comparisonEstablished=false}={}){
 const reasons=[];
 if(a.aircraftId===b.aircraftId)reasons.push('same-aircraft');
 if(a.metric!==b.metric||a.unit!==b.unit||a.altFt!==b.altFt)reasons.push('metric-unit-or-altitude-not-matched');
 if(!a.validationEligible||!b.validationEligible)reasons.push('independent-matched-checkpoints-required');
 if(!known(a.source?.dependencyGroup)||!known(b.source?.dependencyGroup)||a.source.dependencyGroup===b.source.dependencyGroup)reasons.push('independent-source-groups-not-established');
 if(!comparisonEstablished)reasons.push('cross-aircraft-loading-and-rating-policy-not-established');
 const referenceGap=finite(a.value)&&finite(b.value)?a.value-b.value:null;
 const requiredBound=referenceGap!==null&&referenceGap!==0?Math.abs(referenceGap)/5:null;
 if(requiredBound===null)reasons.push('nonzero-reference-gap-required');
 const bounded=r=>r.errorBound?.validated===true&&known(r.errorBound.source)&&r.errorBound.unit===r.unit&&finite(r.errorBound.upper)&&r.errorBound.upper>=0;
 const bound=bounded(a)&&bounded(b)?a.errorBound.upper+b.errorBound.upper:null;
 if(bound===null)reasons.push('validated-differential-error-bound-missing');
 const comparable=reasons.filter(x=>x!=='validated-differential-error-bound-missing').length===0;
 const signed=comparable?(a.prediction.value-b.prediction.value)-referenceGap:null;
 const status=reasons.length?'UNRESOLVED':bound<=requiredBound&&Math.abs(signed)<=bound?'PASS':'FAIL';
 if(status==='FAIL'&&Math.abs(signed)>bound)reasons.push('observed-differential-residual-exceeds-claimed-bound');
 return {a:a.id,b:b.id,metric:a.metric,unit:a.unit,altFt:a.altFt,referenceGap,requiredCombinedErrorBound:requiredBound,validatedCombinedErrorBound:bound,signedDifferentialResidual:signed,absoluteDifferentialResidual:signed===null?null:Math.abs(signed),status,reasons,
  method:'Conservative sum of validated individual upper bounds; no assumed error cancellation. A residual from one pair is not a validated bound.'};
}
module.exports={errors,anchorRole,assess,aggregate,pair};
