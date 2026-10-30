'use strict';
const assert=require('node:assert/strict'),m=require('../src/physics.js'),d=require('../aircraft/cases.json');
const audit=require('../references/p51-low-speed-audit.json'),evidence=require('../references/stall-calibration.json'),ac=d.aircraft.p51b;
// Synthetic values isolate correction order; they do not establish aircraft data.
const record={...evidence.records.find(r=>r.id==='p51-closed'),source:{reference:'SYNTHETIC',kind:'primary',scanVerified:true},airspeedInstallationId:'synthetic-channel',speed:{kind:'IAS',mph:86,instrumentCorrection:'not-removed'}};
const cal={...ac.stallIdentity,source:'SYNTHETIC',configuration:'synthetic',configurationId:record.configurationId,airspeedInstallationId:'synthetic-channel',inputInstrumentCorrection:'not-removed',instrumentCorrectionIncluded:true,nearStallVerified:true,scanVerified:true,altitudeRangeFt:[7900,8100],points:[{iasMph:80,casMph:85},{iasMph:90,casMph:95}]};
const raw=m.resolveStallEvidence(ac,record,cal);assert.equal(raw.status,'derived-power-off');assert.equal(raw.correctedCasMph,91);
const correctedRecord={...record,speed:{kind:'IAS',mph:88,instrumentCorrection:'removed'}};
const positionOnly={...cal,inputInstrumentCorrection:'removed',instrumentCorrectionIncluded:false,points:[{iasMph:82,casMph:85},{iasMph:92,casMph:95}]};
const once=m.resolveStallEvidence(ac,correctedRecord,positionOnly);assert.equal(once.status,'derived-power-off');assert.equal(once.correctedCasMph,raw.correctedCasMph);assert.equal(once.clMax,raw.clMax,'raw + total correction equals instrument-corrected + position only');
const duplicate=m.resolveStallEvidence(ac,correctedRecord,{...cal,inputInstrumentCorrection:'removed'});assert.ok(duplicate.reasons.includes('instrument-correction-would-be-applied-twice'));assert.equal(duplicate.clMax,null);
assert.ok(m.resolveStallEvidence(ac,record,positionOnly).reasons.includes('calibration-input-correction-state-mismatch'));
for(const changes of [{airspeedInstallationId:'different-channel'},{airspeedInstallationId:null},{airspeedInstallationId:undefined}]){
const r=m.resolveStallEvidence(ac,record,{...cal,...changes});assert.equal(r.status,'unresolved');assert.ok(r.reasons.includes('airspeed-installation-not-matched'));assert.equal(r.correctedEasMph,null);
}
assert.ok(m.resolveStallEvidence(ac,{...record,speed:{kind:'IAS',mph:86,instrumentCorrection:'unknown'}},cal).reasons.includes('ias-instrument-correction-state-unknown'));
assert.equal(m.resolveStallEvidence(ac,{...record,airspeedInstallationId:null},cal).status,'unresolved');
for(const unknown of ['unknown','unspecified',' '])assert.equal(m.resolveStallEvidence(ac,{...record,airspeedInstallationId:unknown},{...cal,airspeedInstallationId:unknown}).status,'unresolved');
assert.equal(audit.target.matchedStallCorrection,null);assert.equal(audit.target.measuredClMax,null);assert.equal(audit.candidates.length,5);
const naca=audit.candidates.find(c=>c.id==='naca-l5k29a');assert.deepEqual(naca.levelCalibrationMachRange,[.24,.43]);assert.equal(naca.uncertainty,null);assert.equal(naca.calibrationAltitudeRangeFt,null,'pressure-survey altitudes do not establish calibration-domain altitudes');
const b5=audit.candidates.find(c=>c.id==='wf6883');assert.equal(b5.stallObservations[0].iasMph,94);assert.equal(b5.stallObservations[0].weightLb,9100);assert.equal(b5.matchedStallCorrection,null);
const drag=audit.candidates.find(c=>c.id==='naca-4k02');assert.equal(drag.instrumentReadabilityMph,2);assert.equal(drag.stallSpeedUncertaintyMph,null);
for(const row of evidence.records.filter(r=>r.aircraftId==='p51b')){assert.equal(row.speed.instrumentCorrection,'unknown');assert.equal(m.resolveStallEvidence(ac,row).status,'unresolved');}
const before=require('../validation/current/stall-gate.json').aircraft.find(a=>a.id==='p51b');assert.deepEqual(before.before,before.after);
console.log('PASS P-51 installation matching, correction composition/no double correction, source-domain and uncertainty nontransfer');
