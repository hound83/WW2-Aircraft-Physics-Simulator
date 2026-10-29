'use strict';
const assert=require('node:assert/strict');
const M=require('./physics.js');
const cases=require('./cases.json');
const source=require('./cross_aircraft_results_v15.json');
const v16=require('./p51_drag_results_v16.json');
const {run,turnAt,solveSeaLevelE,f4StandardEas}=require('./joint_low_speed_v17.cjs');
const v17=run();
const close=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<tol,`${a} vs ${b}`);
const f4=cases.aircraft.bf109f4;
const e=v17.f4WorkingSimulatorConditionedE;

// Simulated benchmark ONLY, with strict train/withheld partition.
assert.ok(e>.52&&e<.57);
assert.equal(v17.f4TurnIndependentSimReference.evidenceClass,'OTHER SIMULATOR OUTPUT — NOT 1941 AIRCRAFT FLIGHT TEST');
assert.equal(v17.f4HistoricalPolarMeasurement,false);
close(v17.sourceRows[0].conditioned.turnSeconds,20.3,1e-9);
assert.ok(Math.abs(v17.sourceRows[1].conditioned.turnSeconds-26.1)<.5);
assert.ok(Math.abs(v17.sourceRows[1].generic.turnSeconds-26.1)>4);
assert.ok(Math.abs(v17.sourceRows[1].greg.turnSeconds-26.1)<1);
assert.ok(v17.sourceRows[1].observed.fitRole.startsWith('withheld'));

// Airspeed correction is unknown: no implicit IAS masquerading as resolved CAS.
assert.throws(()=>M.tasFrom(270/1.609344,'IAS',0),/IAS needs/);
assert.ok(v17.casSensitivity[0].conditionedE<v17.casSensitivity[1].conditionedE);
assert.ok(v17.casSensitivity[2].conditionedE>v17.casSensitivity[1].conditionedE);
assert.ok(Math.abs(v17.casSensitivity[0].conditionedE-e)>.005);

// Low-speed power changes both planes. Sensitivities NEVER write coefficients.
assert.ok(v17.powerSensitivity[0].eIfSimulationSeaLevelReFitted>e);
assert.ok(v17.powerSensitivity[2].eIfSimulationSeaLevelReFitted<e);
assert.ok(v17.powerSensitivity[0].p51Climb[0].newEstimatedFpm<v16.p51ClimbPowerGap[0].modelFpm);
assert.ok(v17.powerSensitivity[2].p51Climb[0].newEstimatedFpm>v16.p51ClimbPowerGap[0].modelFpm);
close(v17.fixedECompare[1].comparison.degSec,f4StandardEas(e).degSec);
close(turnAt(e,0).turnSeconds,20.3);

// Physics remains fully shared: F4 one-speed combat anchor and emergency speed,
// frozen P47/P51 historical baseline, original Fig5 P51 observations.
for(const item of v17.fixedECompare){
  close(item.combatSpeedMph,325,1e-5);
  assert.ok(item.emergencySpeedMph>337&&item.emergencySpeedMph<342);
}
close(M.maxSpeed(cases.aircraft.p47b,27800,{polar:source.profiles[2].p47.polar,profile:'C'}),434.1,1);
close(M.maxSpeed(cases.aircraft.p51b,10300,{polar:source.profiles[2].p51.polar,profile:'C'}),405.9,1);
assert.ok(v17.p51Fig5.find(p=>p.profile==='C').lowMidMAEBhp>80);
assert.ok(v17.nacaPowerSlope.currentHeuristicP51.slopeSign==='increasing');
assert.ok(v17.nacaPowerSlope.currentHeuristicF4.slopeSign==='increasing');
assert.equal(v17.f4TurnCurves.length,2);
console.log('PASS v1.7: independently held-out SIM turn, explicit IAS/CAS caveat, two-airframe power coupling, frozen original source benchmarks');
