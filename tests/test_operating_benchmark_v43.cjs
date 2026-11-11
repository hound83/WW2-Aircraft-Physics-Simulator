'use strict';
const assert=require('node:assert/strict');
const M=require('../src/physics.js');
const T=require('../src/turn-lift.js');
const B=require('../src/operating-benchmark.js');
const H=require('../src/benchmark-service-context.js');
const V=require('../validation/diagnostics/operating_benchmark_v43.cjs');
const L=require('../references/p51-turn-lift-tn1044.json');
const {aircraft:S}=require('../references/benchmark-service-context.json');

const report=V.run();
assert.equal(report.rows.length,90);
const [thunderbolt,spitfire,donor]=report.flightChecks;
for(const [trial,count,limit] of [[thunderbolt,5,50],[spitfire,10,90],[donor,5,100]]){
 assert.equal(trial.checks.count,count);
 assert.ok(trial.checks.afterMae<limit&&trial.checks.afterMae<trial.checks.beforeMae,trial.name);
 assert.ok(trial.checks.largestRegression<100,trial.name+' pointwise climb degradation in ft/min');
 assert.ok(trial.rows.every(r=>[r.before,r.after,r.observed,r.tasMph].every(Number.isFinite)));
}
for(const row of thunderbolt.rows){
 assert.equal(row.afterState.bhp,row.bhp);
 assert.equal(row.afterState.tasMph,row.tasMph);
 assert.equal(row.afterState.cooling,'report-conditioned');
}
assert.ok(report.spitfireBestSpeedSensitivity.checks.afterMae<report.spitfireBestSpeedSensitivity.checks.beforeMae);
assert.ok(report.spitfireBestSpeedSensitivity.checks.largestRegression>100,'The separate best-speed sensitivity retains the unfavorable row');
assert.equal(report.corsair.accepted,false);
assert.ok(report.corsair.highSpeed.afterMae<report.corsair.highSpeed.beforeMae);
const high=report.corsair.speedRows.find(r=>r.altFt===29000&&r.rating==='military');
assert.ok(high.halfLossPowerBand[1]<high.observed&&high.zeroLoss<high.observed);
assert.equal(report.coolingFlapCheck.rows.find(r=>r.oil==='wide open'&&r.intercooler==='wide open').tasMph,309);

const scoped=new Set(['p47b','spitfire_lfix_bs543']);
for(const row of report.rows){
 const keys=scoped.has(row.id)?['stallEasMph','turnDegSec','turnEasMph','turnG','levelTasMph']:Object.keys(row.before);
 for(const key of keys){
  const before=row.before[key],after=row.after[key],label=row.id+' '+row.altFt+' '+key+' clean benchmark';
  if(before===null)assert.equal(after,null,label);
  // Apply the repository's cross-runtime numerical tolerance to the frozen snapshot.
  else assert.ok(Number.isFinite(after)&&Math.abs(after-before)<=1e-9+1e-12*Math.abs(before),label);
 }
}
const {models,specification}=V.buildData();
const sample=(id,alt,tas,settings={},climbing=true,changePhase={})=>{
 const spec=specification.aircraft[id],model=models[id];
 const s={mode:'combat',extension:true,...settings},p={...B.phaseFor(spec,s),...changePhase};
 return B.evaluate(M,T,L,model,spec,s,alt,M.airspeeds(tas,alt).eas,model.ac.weightLb,p,climbing);
};
const climb=sample('p47b',10000,196),open=sample('p47b',10000,196,{openCooling:true},false);
const clean=sample('p47b',10000,196,{},false);
assert.equal(climb.benchmark.cooling,'report-conditioned');
assert.equal(climb.power.shaftHp,2000);
assert.equal(climb.prop.propRpm,1350);
assert.equal(climb.power.propulsiveHp,open.power.propulsiveHp);
assert.ok(climb.power.propulsiveHp<=climb.power.shaftHp);
assert.ok(open.limits.nSust<clean.limits.nSust);
assert.equal(clean.benchmark.cooling,'clean');
assert.equal(sample('p47b',15000,220).benchmark.cooling,'climb-estimate');
assert.equal(sample('p47b',10000,325).benchmark.cooling,'climb-estimate');
assert.equal(sample('p47b',10000,196,{},true,{rpm:2550}).benchmark.cooling,'climb-estimate');
assert.equal(sample('p47b',10000,196,{},true,{map:51}).benchmark.cooling,'climb-estimate');
assert.equal(sample('spitfire_lfix_bs543',10000,190,{mode:'normal'}).benchmark.cooling,'climb-estimate');
assert.equal(sample('spitfire_lfix_bs543',35000,240).benchmark.cooling,'climb-estimate');
assert.equal(sample('p47b',40000,240,{extension:false}).status,'source-power-unavailable');
const other={...models.p47b.ac,stallIdentity:{...models.p47b.ac.stallIdentity,specimen:'different'}};
const altered={...models.p47b,ac:other},spec=specification.aircraft.p47b;
assert.equal(B.evaluate(M,T,L,altered,spec,{mode:'combat',extension:true},10000,170,12565,undefined,true).benchmark.cooling,'climb-estimate');

for(const id of scoped){
 const run=stepFt=>B.climb(M,T,L,models[id],specification.aircraft[id],specification.policy,
  {mode:'combat',extension:true,fuelFraction:.5},0,30000,{stepFt});
 const coarse=run(500),fine=run(250);
 assert.equal(coarse.status,'reached');
 assert.equal(fine.status,'reached');
 assert.ok(coarse.combatSeconds<=300+1e-6&&fine.combatSeconds<=300+1e-6);
 assert.ok(coarse.schedule.some(p=>p.phase==='normal'));
 assert.ok(coarse.endFuelLb>0&&coarse.fuelUsedLb>0);
 assert.ok(Math.abs(fine.seconds-coarse.seconds)/fine.seconds<.02);
}
assert.deepEqual(Object.keys(S).sort(),Object.keys(models).sort());
assert.equal(H.compare(S.p51b,S.bf109f4),'Different main service periods');
assert.match(H.compare(S.p51b,S.spitfire_lfix_bs543),/Approximate overlap.*Western Europe/);
assert.match(H.compare(S.p51b,S.f4u4),/Different main theatres/);
assert.match(H.compare(S.p47b,S.fw190a4),/Flight-test/);
