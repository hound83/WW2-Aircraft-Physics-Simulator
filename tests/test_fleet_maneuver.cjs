'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const B = require('../src/operating-benchmark.js');
const T = require('../src/turn-lift.js');
const Turn = require('../src/turn-performance.js');
const Maneuver = require('../src/benchmark-maneuver.js');
const lift = require('../references/p51-turn-lift-tn1044.json');
const { browserData } = require('../validation/diagnostics/shared_flight_climb.cjs');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { addAircraftBatch } = require('../scripts/aircraft-batch.cjs');

const data = addAircraftBatch(browserData(),buildCatalog());
const { models,specification } = data;
const { aircraft,policy } = specification;
const settings = { mode:'combat',fuelFraction:.5 };
const flightCase = { altFt:10000,entryEasMph:210,commandG:4 };
const near = (x,y,tol=1e-7) => assert.ok(Math.abs(x-y)<tol,x+' differs from '+y);
const replay = (id,overrides={},opts={},spec=aircraft[id],selection=settings) => Maneuver.replay(M,T,lift,
  models[id],spec,policy,selection,{...flightCase,...overrides},opts);

const run = replay('spitfire_lfix_bs543');
assert.equal(run.status,'reached');
assert.equal(run.headingDeg,180);
assert.equal(run.trace.at(-1).easMph,flightCase.entryEasMph);
assert.ok(run.exitEasMph < run.entryEasMph && run.turnEnergyHeightFt < 0);
const rollout = run.trace.find(row => row.headingDeg===180);
near(rollout.seconds,run.turnSeconds);
near(rollout.easMph,run.exitEasMph);
assert.equal(rollout.segment,'turn');
assert.ok(run.trace.slice(run.trace.indexOf(rollout)+1).every(row => row.segment==='recovery'&&row.g===1&&row.headingDeg===180));
assert.ok(run.trace.every((row,i,a) => !i||row.seconds>a[i-1].seconds));
near(run.turnSeconds+run.recoverySeconds,run.seconds);
near(run.initialWeightLb-run.endWeightLb,run.fuelUsedLb+run.injectionUsedLb);
near(run.seconds,replay('spitfire_lfix_bs543',{}, {stepSeconds:.25}).seconds,.02);

const f4 = aircraft.f4u4;
assert.ok(f4.injection);
const injectionSpec = { ...f4, combat:{ ...f4.combat,seconds:12 },injection:{ ...f4.injection,seconds:2 } };
const withInjection = replay('f4u4',{}, {},injectionSpec,{...settings,injection:true});
assert.equal(withInjection.status,'reached');
assert.deepEqual(withInjection.schedule.map(row=>[row.segment,row.phase]),[
  ['turn','injection'],['turn','combat'],['recovery','combat'],['recovery','normal'],
]);
near(withInjection.schedule[0].endSeconds,2);
near(withInjection.schedule[2].endSeconds,12);
near(withInjection.combatSeconds,12);
near(withInjection.injectionUsedLb,2*f4.injection.fluidLbPerMinute/60);
near(withInjection.initialWeightLb-withInjection.endWeightLb,withInjection.fuelUsedLb+withInjection.injectionUsedLb);
const thinFluid = { ...f4, injection:{ ...f4.injection, fluidLb:.1,fluidLbPerMinute:6,seconds:60 } };
const emptyFluid = replay('f4u4',{}, {},thinFluid,{...settings,injection:true});
assert.equal(emptyFluid.status,'reached');
assert.equal(emptyFluid.schedule[0].phase,'injection');
near(emptyFluid.schedule[0].endSeconds,1);
assert.equal(emptyFluid.schedule[1].phase,'combat');
assert.equal(emptyFluid.injectionRemainingLb,0);
const shortRating = replay('f4u4',{}, {},{ ...f4,combat:{...f4.combat,seconds:2},
 normal:{...f4.normal,seconds:2},continuous:undefined });
assert.equal(shortRating.status,'rating-time-exhausted');
near(shortRating.elapsedSeconds,2);

const view = (id,options) => B.levelFlightCase(M,T,lift,models[id],aircraft[id],policy,settings,flightCase.altFt,options);
const id = 'bf109g2_db605a';
const evaluate = c => c.evaluate(flightCase.entryEasMph,c.initial.weightLb);
assert.equal(evaluate(view(id)).limits.nLift,null);
const f = evaluate(view(id,{allowProvisionalManeuver:true}));
assert.ok(f.limits.nLift>1&&aircraft[id].performanceIntake);
near(Maneuver.condition(f,1).tasAcceleration,B.levelAccelerationMphPerSecond(f));
near(Maneuver.condition(f,1).requiredHp,f.power.requiredHp);
const sustained = Turn.state(f);
assert.equal(sustained.limiting,'power');
near(Maneuver.condition(f,sustained.turn.g).excessHp,0);
const sameG = Maneuver.condition(f,3);
near(sameG.requiredHp-f.power.requiredHp,8*f.drag.inducedHp);
near(sameG.rateDegSec,Turn.turnFromLoad(3,f.tasMph).rateDegSec);
assert.ok(replay(id).intake);
assert.equal(replay(id,{entryEasMph:40}).status,'below-provisional-stall');
assert.equal(replay(id,{entryEasMph:900}).status,'speed-domain-unavailable');

const game = data.turnEvidence.sensitivity;
const stress = Maneuver.sensitivity(scenario=>replay(id,{}, {scenario,sensitivity:game,trace:false}),game);
assert.equal(stress.completed,8);
assert.ok(stress.totalSeconds[0]<stress.totalSeconds[1]);
for(const modelId of Object.keys(models)){
  const maneuver = replay(modelId,{}, { trace:false });
  assert.equal(maneuver.status,'reached',modelId);
  assert.ok(maneuver.turnSeconds>0 && Number.isFinite(maneuver.seconds),modelId);
}
console.log('Fleet maneuver: signed energy, exact rollout, recovery and rating events, all 12 profiles.');
