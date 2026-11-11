'use strict';

const assert=require('node:assert/strict');
const M=require('../src/physics.js'),B=require('../src/operating-benchmark.js'),T=require('../src/turn-lift.js');
const Match=require('../src/benchmark-matchup.js');
const L=require('../references/p51-turn-lift-tn1044.json');
const {tolerances}=require('../scripts/fighter-value-selection.cjs');
const {models,specification}=require('../validation/diagnostics/operating_benchmark_v46.cjs').browserData();
const settings={mode:'combat',fuelFraction:.5,extension:true};
const policy=specification.policy;
const run=(id,from,to,s=settings,alt=10000,options)=>B.accelerate(
 M,T,L,models[id],specification.aircraft[id],policy,s,alt,from,to,options);

const results={};
for(const id of ['p51b','p47b','bf109f4','spitfire_lfix_bs543']){
 const result=run(id,180,300),fine=run(id,180,300,settings,10000,{stepSeconds:.25});
 assert.equal(result.status,'reached',id);
 assert.equal(result.reachedEasMph,300,id);
 assert.ok(result.fuelUsedLb>0&&result.combatSeconds<=specification.aircraft[id].combat.seconds+1e-7,id);
 assert.ok(Math.abs(result.seconds-fine.seconds)<.01,id+' converges at a finer step');
 assert.ok(result.trace.every((point,i)=>!i||(point.seconds>result.trace[i-1].seconds&&point.easMph>result.trace[i-1].easMph)),id);
 assert.equal(result.trace.at(-1).seconds,result.seconds,id);
 results[id]=result;
}
assert.equal(Match.compare('elapsed_time',results.p51b.seconds,results.spitfire_lfix_bs543.seconds,tolerances).lead,'tie');
assert.equal(Match.compare('elapsed_time',results.p47b.seconds,results.p51b.seconds,tolerances).lead,'b');
assert.equal(Match.compare('climb_rate',2800,2800.3,tolerances).lead,'tie');
assert.equal(Match.compare('climb_rate',4203,4705,tolerances).lead,'b');
assert.equal(Match.compare('sustained_turn_rate',16,15.5,tolerances).lead,'tie');
assert.equal(Match.compare('sustained_turn_rate',16,15.49,tolerances).lead,'a');
assert.equal(Match.compare('level_speed',400,400+6/1.609344,tolerances).lead,'tie');
assert.equal(Match.compare('level_speed',400,404,tolerances).lead,'b');
assert.equal(Match.compare('level_speed',400,null,tolerances),null);
assert.equal(Match.turnVerdict([-.59,.65],.5),'uncertain');
assert.equal(Match.turnVerdict([.61,7.39],.5),'a');
assert.equal(Match.turnVerdict([-.4,.3],.5),'tie');
assert.equal(Match.turnVerdict(null,.5),null);
assert.equal(run('p47b',70,300).status,'below-provisional-stall');
assert.equal(run('p47b',180,250,{...settings,extension:false},40000).status,'source-power-unavailable');
assert.equal(run('spitfire_lfix_bs543',355,375).status,'power-limited');
assert.equal(run('p51b',180,600).status,'speed-domain-unavailable');
assert.throws(()=>run('p51b',300,180),/increasing/);

const spec=specification.aircraft.f4u4;
const shortFluid={...spec,injection:{...spec.injection,fluidLb:5}};
const injected=B.accelerate(M,T,L,models.f4u4,shortFluid,policy,{...settings,injection:true},10000,180,300);
assert.equal(injected.status,'reached');
assert.deepEqual(injected.schedule.map(row=>row.phase),['injection','combat']);
assert.ok(Math.abs(injected.schedule[0].seconds-15)<1e-7);
assert.equal(injected.injectionRemainingLb,0);
assert.ok(Math.abs(injected.combatSeconds-injected.seconds)<1e-7);
const shortCombat={...spec,combat:{...spec.combat,seconds:10}};
const downgraded=B.accelerate(M,T,L,models.f4u4,shortCombat,policy,settings,10000,180,280);
assert.equal(downgraded.status,'reached');
assert.deepEqual(downgraded.schedule.map(row=>row.phase),['combat','normal']);
assert.ok(Math.abs(downgraded.combatSeconds-10)<1e-7);

const climbArgs=[M,T,L,models.p51b,specification.aircraft.p51b,policy,settings,0,10000];
const raw=B.climb(...climbArgs),{trace,...graphed}=B.climb(...climbArgs,{trace:true});
assert.deepEqual(graphed,raw);
assert.deepEqual(trace[0],{seconds:0,altFt:0});
assert.equal(trace.at(-1).altFt,10000);
assert.equal(trace.at(-1).seconds,raw.seconds);
