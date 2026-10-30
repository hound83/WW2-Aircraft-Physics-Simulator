'use strict';
const assert=require('node:assert/strict'),m=require('../src/physics.js'),ac=require('../aircraft/cases.json').aircraft.spitfire_lfix_bs543;
const data=require('../references/stall-calibration.json'),audit=require('../references/spitfire-ix-stall-audit.json');
const raw=data.records.find(r=>r.id==='spit-7150'),other=data.records.find(r=>r.id==='spit-7800');
assert.equal(raw.configurationState.wingTips,'clipped');assert.equal(raw.configurationState.externalStores,'none');
assert.equal(other.configurationState.externalStores,'45-gallon-blister-drop-tank');assert.equal(other.speed.mph,93);
assert.equal(raw.wingAreaM2,null,'target full-span reference area must not be assigned to clipped manual row');
assert.equal(raw.source.scanVerified,false);assert.equal(raw.source.textVerified,true);assert.equal(raw.source.date,'1946-09');
assert.equal(audit.manual.positionCorrection.minimumIasMph,120);assert.deepEqual(audit.manual.positionCorrection.points,[]);
// Synthetic fixture is expressly not BS.543 evidence. Hold the ID constant while
// changing actual configuration fields: matching strings alone are insufficient.
const fixture={...raw,variant:ac.stallIdentity.variant,specimen:ac.stallIdentity.specimen,configurationId:'SYNTHETIC',configurationState:{...ac.stallConfiguration},altFt:0,weightKind:'instantaneous-stall-test',wingAreaM2:ac.wingAreaM2,geometrySource:'SYNTHETIC',source:{kind:'primary',scanVerified:true,reference:'SYNTHETIC'},speed:{kind:'EAS',mph:90,correctionVerified:true,correctionSource:'SYNTHETIC'}};
assert.equal(m.resolveStallEvidence(ac,fixture).status,'derived-power-off');
for(const [field,value] of [['wingTips','clipped'],['gear','down'],['flaps','down'],['externalStores','45-gallon-blister-drop-tank']]){
 const r=m.resolveStallEvidence(ac,{...fixture,configurationState:{...fixture.configurationState,[field]:value}});
 assert.equal(r.clMax,null);assert.ok(r.reasons.includes('configuration-'+field+'-not-matched'));
}
assert.equal(m.resolveStallEvidence(ac,{...fixture,configurationState:null}).clMax,null);
const ias={...fixture,airspeedInstallationId:'SYNTHETIC',speed:{kind:'IAS',mph:90,instrumentCorrection:'not-removed'}};
const cal={...ac.stallIdentity,configurationId:'SYNTHETIC',configuration:'SYNTHETIC',configurationState:{...ac.stallConfiguration},source:'SYNTHETIC',airspeedInstallationId:'SYNTHETIC',inputInstrumentCorrection:'not-removed',instrumentCorrectionIncluded:true,scanVerified:true,nearStallVerified:true,altitudeRangeFt:[0,1000],points:[{iasMph:80,casMph:85},{iasMph:100,casMph:105}]};
assert.equal(m.resolveStallEvidence(ac,ias,cal).status,'derived-power-off');
assert.ok(m.resolveStallEvidence(ac,ias,{...cal,configurationState:{...cal.configurationState,wingTips:'clipped'}}).reasons.includes('calibration-configuration-wingTips-not-matched'));
const promoted={...fixture,configurationState:other.configurationState};assert.equal(m.resolveStallEvidence(ac,promoted).clMax,null,'invented identity/weight/verification cannot overcome conflicting geometry/stores');
const stall=require('../validation/diagnostics/stall_gate.cjs').run(),r=require('../validation/diagnostics/stall_readiness.cjs').review(stall);
assert.equal(r.aircraft.length,4);assert.equal(r.recordCount,9);assert.equal(r.externalRecords.length,1);assert.equal(r.externalRecords[0].result.clMax,null);assert.equal(r.powerOffClMaxReady,false);assert.equal(r.defaultPredictionsChanged,false);assert.equal(r.pairwise.length,6);assert.equal(r.turnComparisonsReady,false);
for(const a of r.aircraft)for(const record of a.records){assert.equal(record.status,'unresolved');assert.equal(record.derivedClMax,null);assert.equal(record.correctedEasMph,null);assert.ok(record.blockers.length>0);}
assert.equal(ac.clMaxAssumed,1.6);assert.equal(ac.weightLb,7110);
console.log('PASS Spitfire clipped/full-span/stores gate, matched IAS configuration, postwar manual provenance and consolidated four-aircraft readiness');
