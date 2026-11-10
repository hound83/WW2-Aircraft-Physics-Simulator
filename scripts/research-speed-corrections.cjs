'use strict';

// Recorded IAS is useful evidence. A position-error correction is only applied
// inside its documented interval and to the *same source and configuration*.
function finite(value){return typeof value==='number'&&Number.isFinite(value);}
function interpolate(curve,x){
 const rows=curve.rows;
 if(!finite(x)||!Array.isArray(rows)||rows.length<2)return null;
 const inputs=rows.map(row=>row[0]);
 if(x<inputs[0]||x>inputs.at(-1))return null;
 for(let i=1;i<rows.length;i++){
  const [low,high]=[rows[i-1],rows[i]];
  if(x>=low[0]&&x<=high[0])return low[1]+(high[1]-low[1])*(x-low[0])/(high[0]-low[0]);
 }
 return null;
}
function validateCurve(curve,sourceIds){
 const label=curve.id||'(unnamed)';
 if(!label||!sourceIds.has(curve.source_id))throw Error('Correction curve lacks source: '+label);
 if(!['IAS_to_CAS','instrument_corrected_IAS_to_CAS','IAS_to_instrument_corrected_IAS'].includes(curve.mapping))throw Error('Unsupported correction mapping: '+label);
 if(['kt','kts','knots'].includes(curve.unit)){
  curve.original_unit=curve.unit;
  curve.original_rows=curve.rows.map(row=>[...row]);
  curve.rows=curve.rows.map(row=>row.map(value=>value*1.150779448));
  curve.unit='mph';
 }
 if(curve.unit!=='mph')throw Error('Only mph/knots correction tables are supported: '+label);
 // An unpaired original calibration curve is useful evidence and remains
 // searchable, but must never automatically correct a different specimen.
 if(!Array.isArray(curve.applies_to_source_ids)||curve.applies_to_source_ids.some(id=>!sourceIds.has(id)))throw Error('Correction curve lacks valid explicit target sources: '+label);
 if(!curve.configuration||typeof curve.configuration!=='object'||!Object.keys(curve.configuration).length)throw Error('Correction curve lacks matched configuration: '+label);
 if(!Array.isArray(curve.rows))throw Error('Correction curve lacks rows: '+label);
 if(curve.rows.length===0){curve.index_only=true;return curve;} // original figure found, but not safely digitized
 if(curve.rows.length<2)throw Error('At least two numerical calibration anchors needed: '+label);
 let previous=-Infinity;
 for(const row of curve.rows){
  if(!Array.isArray(row)||row.length!==2||!row.every(finite)||row[0]<=previous)throw Error('Invalid correction table or non-increasing input: '+label);
  previous=row[0];
 }
 return curve;
}
function matchesConfiguration(curve,observation){
 if(!curve.applies_to_source_ids.includes(observation.source_id))return false;
 for(const [key,wanted]of Object.entries(curve.configuration)){
  if(wanted==='all-verified')continue;
  if(observation.values?.[key]!==wanted)return false;
 }
 return true;
}
function originalCandidate(observation){
 if(observation.quantity!=='stall_speed')return null;
 const v=observation.values||{};
 const exact=finite(v.speed_mph)?v.speed_mph:null;
 const low=finite(v.speed_min_mph)?v.speed_min_mph:(finite(v.low_mph)?v.low_mph:exact);
 const high=finite(v.speed_max_mph)?v.speed_max_mph:(finite(v.high_mph)?v.high_mph:exact);
 const basis=observation.speed_basis;
 const corrected=basis==='IAS'&&observation.correction?.instrument==='applied';
 return {basis:basis==='CAS'?'CAS':corrected?'IAS corrected*':basis==='IAS'?'IAS':basis,
  status:basis==='CAS'?'reported-CAS':corrected?'provisional-instrument-corrected-IAS':basis==='IAS'?'reported-IAS':'basis-unestablished',
  speed_mph:exact,speed_min_mph:low,speed_max_mph:high,calibration_id:null,
  provisional:corrected,fit_eligible:false};
}
function applyCorrections(observation,curves){
 let candidate=originalCandidate(observation);
 if(!candidate||observation.speed_basis!=='IAS')return candidate;
 const applicable=curves.filter(curve=>matchesConfiguration(curve,observation));
 const stage=(mapping,oldCandidate)=>{
  const matches=applicable.filter(curve=>curve.mapping===mapping&&
   finite(oldCandidate.speed_min_mph)&&finite(oldCandidate.speed_max_mph)&&
   interpolate(curve,oldCandidate.speed_min_mph)!==null&&interpolate(curve,oldCandidate.speed_max_mph)!==null);
  if(matches.length!==1)return null; // conflicting calibration curves must be reviewed
  const [curve]=matches;
  const low=interpolate(curve,oldCandidate.speed_min_mph),high=interpolate(curve,oldCandidate.speed_max_mph);
  const exact=finite(oldCandidate.speed_mph)?interpolate(curve,oldCandidate.speed_mph):null;
  if(!finite(low)||!finite(high)||low>high)return null;
  return {basis:mapping.endsWith('_to_CAS')?'CAS*':'IAS corrected*',
   status:mapping.endsWith('_to_CAS')?'provisional-calibration-table-CAS':'provisional-instrument-corrected-IAS',
   speed_mph:exact,speed_min_mph:low,speed_max_mph:high,calibration_id:curve.id,
   original_basis:observation.speed_basis,original_speed_mph:observation.values?.speed_mph??null,
   provisional:true,fit_eligible:false};
 };
 if(observation.correction?.instrument==='applied')return stage('instrument_corrected_IAS_to_CAS',candidate)||candidate;
 const direct=stage('IAS_to_CAS',candidate);
 if(direct)return direct;
 const instrument=stage('IAS_to_instrument_corrected_IAS',candidate);
 if(instrument)return stage('instrument_corrected_IAS_to_CAS',instrument)||instrument;
 return candidate;
}
module.exports={interpolate,validateCurve,applyCorrections,originalCandidate};
