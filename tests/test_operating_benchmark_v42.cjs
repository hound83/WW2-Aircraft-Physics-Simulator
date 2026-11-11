'use strict';
const assert=require('node:assert/strict'),M=require('../src/physics.js'),B=require('../src/operating-benchmark.js'),T=require('../src/turn-lift.js'),L=require('../references/p51-turn-lift-tn1044.json');
const {models,specification:S}=require('../validation/diagnostics/operating_benchmark_v42.cjs').buildData();
const settings={mode:'combat',fuelFraction:.5,injection:false,extension:true};
assert.deepEqual(S.altitudesFt,[0,10000,20000,30000,35000,40000]);
for(const h of [0,1000,10000,20000,30000,35000,36089]){
 const H=h*.3048,temperature=288.15-.0065*H,pressure=101325*Math.pow(temperature/288.15,5.2558797);
 assert.equal(M.isa(h).T,temperature,'Old troposphere temperatures remain exact');assert.equal(M.isa(h).p,pressure,'Old pressure values remain exact');
}
assert.ok(Math.abs(M.isa(40000).p-18753)<3);assert.equal(M.isa(40000).T,216.65);
const trop=11000/.3048;assert.ok(Math.abs(M.isa(trop-.01).p-M.isa(trop+.01).p)<.1);assert.throws(()=>M.isa(40001));
const before=JSON.stringify(models),specBefore=JSON.stringify(S);
const row=(id,s=settings,h=10000)=>B.metrics(M,T,L,models[id],S.aircraft[id],S.policy,s,h);
for(const [id,spec]of Object.entries(S.aircraft)){
 const low=row(id,{...settings,fuelFraction:.25}),high=row(id,{...settings,fuelFraction:.75});
 assert.equal(low.status,'modelled',id+' low-load flight');assert.equal(high.status,'modelled',id+' high-load flight');
 assert.ok(low.loading.weightLb<high.loading.weightLb);assert.ok(low.sustained.rateDegSec>high.sustained.rateDegSec,id+' fuel load changes turn performance');
 assert.ok(low.climb.climbFpm>high.climb.climbFpm,id+' fuel load changes climb');
 const normal=row(id,{...settings,mode:'normal'}),combat=row(id);
 assert.equal(normal.loading.weightLb,combat.loading.weightLb,'Power does not change initial aircraft loading');
 assert.ok(normal.sustained&&normal.climb&&normal.level&&normal.instantaneous&&normal.minSustainedRadius,id+' both profiles expose all outputs');
 for(const h of S.altitudesFt){const r=row(id,settings,h);assert.ok(['modelled','cannot-sustain-level-flight'].includes(r.status),id+' complete extended calculation at '+h);
  for(const p of [r.sustained,r.instantaneous,r.minSustainedRadius])if(p){assert.ok(p.rateDegSec>=0&&p.g>=1&&p.radiusM>0);assert.ok(Math.abs(p.seconds360*p.rateDegSec-360)<1e-7);}
 }
 assert.throws(()=>B.validateSettings(spec,{...settings,fuelFraction:.9}));
 if(!spec.injection)assert.throws(()=>row(id,{...settings,injection:true}),'No injection system transfer to an unequipped airframe');
 for(const source of spec.sources)assert.ok(S.sources[source]?.url.startsWith('https://'));
}
const p47n=B.evaluate(M,T,L,models.p47b,S.aircraft.p47b,{...settings,mode:'normal'},5000,170,11705);
const p47c=B.evaluate(M,T,L,models.p47b,S.aircraft.p47b,settings,5000,170,11705);
assert.equal(p47n.prop.propRpm,1275);assert.equal(p47c.prop.propRpm,1350);assert.equal(p47n.power.shaftHp,1625);assert.equal(p47c.power.shaftHp,2000);
const dry=row('f4u4'),wet=row('f4u4',{...settings,injection:true});
assert.equal(dry.loading.weightLb,wet.loading.weightLb,'The charged system is present in dry and injected comparisons');
assert.ok(wet.climb.climbFpm>dry.climb.climbFpm+100);assert.ok(wet.sustained.rateDegSec>dry.sustained.rateDegSec);assert.throws(()=>row('f4u4',{...settings,injection:true,mode:'normal'}));
assert.equal(row('p51b',{...settings,extension:false},40000).status,'source-power-unavailable');
assert.ok(row('p51b',settings,40000).climb.estimatedPower);
const climb=(id,s,to,options)=>B.climb(M,T,L,models[id],S.aircraft[id],S.policy,s,0,to,options);
const normal=climb('spitfire_lfix_bs543',{...settings,mode:'normal'},30000);
const legal=climb('spitfire_lfix_bs543',settings,30000);
assert.equal(normal.status,'reached');assert.equal(legal.status,'reached');assert.ok(legal.seconds<normal.seconds);
assert.ok(legal.combatSeconds<=300+1e-6);assert.ok(legal.schedule.some(p=>p.phase==='normal'));assert.ok(legal.fuelUsedLb>0);assert.ok(legal.endFuelLb<row('spitfire_lfix_bs543').loading.fuelLb);
assert.ok(legal.seconds<=legal.frontLoadedSeconds+1e-6,'The selected window retains or improves the front-loaded candidate');
const dense=climb('spitfire_lfix_bs543',settings,30000,{stepFt:250});assert.ok(Math.abs(dense.seconds-legal.seconds)/dense.seconds<.02,'Climb time converges across altitude steps');
const impossibleSpec=structuredClone(S.aircraft.spitfire_lfix_bs543);impossibleSpec.combat.seconds=1e7;
const unlimited=B.climb(M,T,L,models.spitfire_lfix_bs543,impossibleSpec,S.policy,settings,0,30000);
assert.ok(legal.seconds>unlimited.seconds,'A finite combat allowance cannot return the unlimited-combat climb time');
const reservoir=structuredClone(S.aircraft.f4u4);reservoir.injection.fluidLb=20;
const limited=B.climb(M,T,L,models.f4u4,reservoir,S.policy,{...settings,injection:true},0,20000);
assert.ok(limited.schedule.some(p=>p.phase==='injection'));assert.ok(limited.schedule.some(p=>p.phase==='combat'),'Exhausting fluid uses remaining dry Combat allowance');
assert.ok(limited.combatSeconds<=300+1e-6);assert.ok(limited.injectionRemainingLb>=0);assert.ok(limited.schedule.filter(p=>p.phase==='injection').reduce((sum,p)=>sum+p.seconds,0)<=60+1e-6);
const shortNormal=structuredClone(S.aircraft.spitfire_lfix_bs543);shortNormal.normal.seconds=30;
const reduced=B.climb(M,T,L,models.spitfire_lfix_bs543,shortNormal,S.policy,{...settings,mode:'normal'},0,10000);
assert.equal(reduced.status,'reached');assert.ok(reduced.schedule.some(p=>p.phase==='continuous'),'Finite routine climb allowance reduces to continuous power');
assert.ok(Math.abs(reduced.schedule.filter(p=>p.phase==='normal').reduce((sum,p)=>sum+p.seconds,0)-30)<1e-6);
const exhausted=B.climb(M,T,L,models.spitfire_lfix_bs543,S.aircraft.spitfire_lfix_bs543,{...S.policy,bsfcLbPerHpHour:500},settings,0,10000);
assert.equal(exhausted.status,'fuel-exhausted');assert.ok(exhausted.endFuelLb>=0,'Fuel cannot become negative');
assert.throws(()=>B.climb(M,T,L,models.p51b,S.aircraft.p51b,S.policy,settings,20000,10000));
assert.equal(JSON.stringify(models),before,'Independent comparisons do not mutate shared aircraft');assert.equal(JSON.stringify(S),specBefore,'Profiles and source records stay immutable');
