'use strict';
const assert=require('node:assert/strict'),m=require('../src/physics.js'),d=require('../aircraft/cases.json');
const audit=require('../references/p47b-stall-weight-audit.json'),evidence=require('../references/stall-calibration.json'),ac=d.aircraft.p47b;
const r=evidence.records.find(r=>r.id==='p47b-415902-clean'),cal=evidence.calibrations.p47bAcceptance;
assert.equal(r.specimen,'41-5902');assert.equal(r.speed.mph,105);assert.equal(r.source.scanVerified,true);assert.equal(r.power,'off');
assert.equal(r.weightLb,null);assert.notEqual(r.weightKind,'instantaneous-stall-test');assert.deepEqual(r.reportedWeightsLb,[12565,12560]);assert.equal(r.altFt,null);
assert.equal(evidence.records.find(r=>r.id==='p47-manual').speed.mph,115,'generic manual must remain separate');
assert.equal(evidence.records.find(r=>r.id==='p47d-closed').speed.mph,116,'D reference must remain separate');
const result=m.resolveStallEvidence(ac,r,cal);assert.equal(result.status,'unresolved');assert.equal(result.clMax,null);assert.equal(result.correctedEasMph,null);
assert.ok(result.reasons.includes('matched-stall-weight-missing'));assert.ok(result.reasons.includes('test-altitude-missing-or-outside-atmosphere'));
assert.ok(result.reasons.includes('stall-outside-calibration-range'),'missing altitude must not hide the independent 105-vs-170 mph coverage failure');
assert.equal(m.casFromIAS(105,cal),null);assert.equal(m.casFromIAS(115,cal),null);assert.equal(m.casFromIAS(116,cal),null);
for(const row of audit.calibration.rows){
assert.equal(m.casFromIAS(row.indicatedMph,cal),row.calibratedMph);
const positionOnly={...cal,inputInstrumentCorrection:'removed',instrumentCorrectionIncluded:false,points:audit.calibration.rows.map(p=>({iasMph:p.waterColumnMph,casMph:p.calibratedMph}))};
assert.equal(m.casFromIAS(row.waterColumnMph,positionOnly),row.calibratedMph,'water-column basis must not receive raw instrument error again');
}
const at200=audit.calibration.rows.find(p=>p.indicatedMph===200);assert.equal(at200.waterColumnMph,201);assert.equal(at200.calibratedMph,206.5);
assert.equal(at200.calibratedMph-at200.indicatedMph,6.5);assert.equal(at200.calibratedMph-at200.waterColumnMph,5.5,'total correction differs from installation-only correction');
const invented={...r,weightLb:12565,weightKind:'instantaneous-stall-test',altFt:5000,speed:{...r.speed,instrumentCorrection:'not-removed'}};
assert.equal(m.resolveStallEvidence(ac,invented,{...cal,configurationId:r.configurationId,altitudeRangeFt:[0,10000],nearStallVerified:true}).status,'unresolved','even invented weight/altitude flags cannot extend the actual calibration nodes');
assert.equal(audit.derivedHistoricalClMax,null);assert.deepEqual(audit.weightEvidence.map(w=>w.valueLb),[12565,12560]);
assert.equal(ac.weightLb,12565);assert.equal(ac.clMaxAssumed,1.3,'new IAS source is not permission to tune CLmax');
assert.equal(audit.calibration.staticHolesAheadOfLeadingEdgeIn,67.375);assert.equal(audit.calibration.distanceInboardFromLeftWingtipIn,43);
console.log('PASS primary P-47B 105 IAS provenance, non-instantaneous weights, independent coverage blockers and water-column correction basis');
