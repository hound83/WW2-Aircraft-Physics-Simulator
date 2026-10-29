'use strict';
const assert=require('node:assert/strict');
const M=require('../src/physics.js');
const D=require('../aircraft/cases.json');
const {run}=require('../validation/diagnostics/cross_aircraft_diagnostic_v15.cjs');
const r=run();
const [a,b,c]=r.profiles;

assert.equal(r.version,'v1.5-rated-prop-RPM-and-diagnostic');
assert.equal(r.f4Reduction.correctRatio,1.685);
assert.ok(Math.abs(r.f4Reduction.combatPropRpm-1483.6795)<.001);
assert.ok(Math.abs(r.f4Reduction.emergencyPropRpm-1602.374)<.001);
const ac=D.aircraft.bf109f4;
const pc=M.propEta(ac,0,325,M.shaftPower(ac,0,'combat').bhp,'C','combat');
const pe=M.propEta(ac,0,336,M.shaftPower(ac,0,'emergency').bhp,'C','emergency');
assert.ok(pc.propRpm<pe.propRpm);
assert.ok(Math.abs(pc.propRpm-2500/1.685)<.001);
assert.ok(Math.abs(pe.propRpm-2700/1.685)<.001);
assert.equal(M.propEta(D.aircraft.p47b,15000,300,2000,'C').propRpm,1350,
  'American aircraft fixed-RPM data path unchanged');

for(const p of r.profiles){
  for(const v of [p.f4.generic,p.f4.greg]){
    assert.ok(Math.abs(v.speed.calibrationCombatMph-325)<.01);
    assert.ok(v.speed.predictedEmergencyMph>335&&v.speed.predictedEmergencyMph<342);
    assert.equal(v.climb.steps.length,16);
    assert.ok(v.turn170EasCombat.degSec>12);
    assert.ok(v.turn170EasCombat.degSec<22);
  }
  assert.ok(p.p47.speed.holdoutCount===5&&p.p51.speed.holdoutCount===8);
  assert.equal(p.p47.climb.withheldCount,4);
  assert.ok(p.p47.climb.rows[0].residualFpm<.001);
  assert.ok(p.p51.climb.reports.every(rep=>rep.rows.every(row=>!row.matchedHistoricalClimbAirspeed)));
}
assert.ok(c.p47.speed.holdoutMAEMph<b.p47.speed.holdoutMAEMph&&b.p47.speed.holdoutMAEMph<a.p47.speed.holdoutMAEMph);
assert.ok(c.p51.speed.holdoutMAEMph<b.p51.speed.holdoutMAEMph&&b.p51.speed.holdoutMAEMph<a.p51.speed.holdoutMAEMph);
assert.ok(c.p47.climb.withheldMAEFpm<a.p47.climb.withheldMAEFpm);
assert.ok(c.p47.climb.withheldMAEFpm<b.p47.climb.withheldMAEFpm);
assert.ok(Math.abs(c.p47.speed.holdoutMAEMph-3.65)<.05);
assert.ok(Math.abs(c.p51.speed.holdoutMAEMph-2.61)<.05);
assert.ok(c.p47.climb.withheldMAEFpm<60);
assert.ok(Math.abs(c.p51.climb.boostGain.residualFpm)<25);
assert.ok(c.p51.climb.reports[0].MAEFpm>300,
  'Mustang absolute climb is still systematically underpredicted; NEVER present only its boost gain');
assert.ok(Math.abs(c.f4.generic.climb.seconds-213.9)<.3);
assert.ok(Math.abs(c.f4.greg.climb.seconds-229.9)<.3);
assert.ok(Math.abs(c.f4.greg.climb.seconds-240)>9,
  'Accidental v1.4 ~3:59 coincidence must not persist after correcting gear ratio');
assert.ok(Math.abs(c.f4.generic.speed.predictedEmergencyMph-339.37)<.1);

const d=r.turnSensitivity.decomposition;
assert.ok(d.eChangeAtFrozenCd0DegSec<-3.1&&d.eChangeAtFrozenCd0DegSec>-3.4);
assert.ok(Math.abs(d.followOnCd0RefitDegSec)<.05);
assert.ok(Math.abs(d.eChangeAtFrozenCd0DegSec+d.followOnCd0RefitDegSec-d.totalDegSec)<1e-8);
for(const x of Object.values(r.turnSensitivity.paramSensitivity)){
  assert.ok(Number.isFinite(x.minus)&&Number.isFinite(x.base)&&Number.isFinite(x.plus));
}
assert.ok(r.sources.some(s=>s.grade.includes('original wartime report scan')));
console.log('PASS v1.5: authentic DB601E ratio/RPM; independent speed+climb diagnostics; Greg drag decomposition; honest P51 absolute-climb failure preserved');
