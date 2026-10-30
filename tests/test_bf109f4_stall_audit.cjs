'use strict';
const assert=require('node:assert/strict'),m=require('../src/physics.js'),ac=require('../aircraft/cases.json').aircraft.bf109f4;
const data=require('../references/stall-calibration.json'),raw=data.records.find(r=>r.id==='109-simulator');
const result=m.resolveStallEvidence(ac,raw);assert.equal(result.clMax,null);assert.ok(result.reasons.includes('specimen-identity-not-established'));assert.ok(result.reasons.includes('slat-state-not-established'));
// Synthetic conditions exercise acceptance/rejection only, never historical evidence.
const target={...ac,stallIdentity:{...ac.stallIdentity,specimen:'SYNTHETIC-F4'}};
const r={...raw,specimen:'SYNTHETIC-F4',power:'off',altFt:0,weightKind:'instantaneous-stall-test',slatState:'automatic-free',slatStateSource:'SYNTHETIC TEST ONLY',source:{kind:'primary',scanVerified:true,reference:'SYNTHETIC TEST ONLY'},airspeedInstallationId:'synthetic',speed:{kind:'IAS',mph:100,instrumentCorrection:'not-removed'}};
const cal={source:"SYNTHETIC TEST ONLY",configuration:"synthetic",...target.stallIdentity,configurationId:r.configurationId,slatState:r.slatState,airspeedInstallationId:'synthetic',inputInstrumentCorrection:'not-removed',instrumentCorrectionIncluded:true,scanVerified:true,nearStallVerified:true,altitudeRangeFt:[0,1000],points:[{iasMph:90,casMph:95},{iasMph:110,casMph:115}]};
assert.equal(m.resolveStallEvidence(target,r,cal).status,'derived-power-off');
for(const specimen of [undefined,null,'','  ','unknown',' UNSPECIFIED ']){
const a={...target,stallIdentity:{...target.stallIdentity,specimen}};
assert.equal(m.resolveStallEvidence(a,{...r,specimen},{...cal,specimen}).clMax,null,'matching placeholders cannot identify a specimen');
}
for(const slatState of [undefined,'unknown',''])assert.ok(m.resolveStallEvidence(target,{...r,slatState},cal).reasons.includes('slat-state-not-established'));
assert.equal(m.resolveStallEvidence(target,{...r,slatStateSource:null},cal).clMax,null);
for(const slatState of [undefined,'unknown','locked-closed'])assert.ok(m.resolveStallEvidence(target,r,{...cal,slatState}).reasons.includes('calibration-slat-state-not-matched'));
for(const kind of ['CAS','EAS']){
const corrected={...r,speed:{kind,mph:105,correctionVerified:true,correctionSource:'SYNTHETIC TEST ONLY'}};
assert.equal(m.resolveStallEvidence(target,corrected).status,'derived-power-off');
assert.equal(m.resolveStallEvidence(target,{...corrected,slatState:'unknown'}).clMax,null,'corrected speeds do not bypass slat metadata');
}
assert.equal(m.resolveStallEvidence(target,{...r,variant:'Bf 109 F-2'},cal).clMax,null);
assert.equal(m.resolveStallEvidence(target,{...r,source:raw.source},cal).clMax,null,'simulation provenance cannot pass the primary-source gate');
assert.equal(ac.clMaxAssumed,1.5);assert.equal(ac.weightLb,6371);
console.log('PASS F-4 synthetic specimen, slat-state and calibration compatibility; simulation and F-2 transfer rejected');
