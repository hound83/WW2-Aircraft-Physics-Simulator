'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const S=require('../src/fleet-steady-turn.js'),M=require('../src/physics.js'),T=require('../src/turn-lift.js');
const L=require('../references/p51-turn-lift-tn1044.json');
const read=file=>fs.readFileSync(require.resolve(file),'utf8');
const report=JSON.parse(read('../dist/fleet-validation.json'));
const data=JSON.parse(read('../dist/model.html').match(/id="benchmark-operating-data">([^<]+)<\/script>/)[1]);
const grid=report.steadyTurn.cases,settings={mode:'combat',fuelFraction:.5};
const tol=data.sourceGrades.tolerances;
assert.equal(grid.length,9);
for(const c of grid){
 const values=Object.values(c.rows);assert.equal(values.length,14);
 assert.equal(Object.values(c.counts).reduce((a,b)=>a+b,0),91);
 for(const row of values.filter(v=>v.status==='steady')){
  assert.ok(Math.abs(row.rate*row.seconds-360)<1e-8);
  assert.ok(row.g>1 && row.bankDeg<90);
  assert.ok(row.rates[1]>=row.rate && (row.rates[0]===null || row.rates[0]<=row.rate));
  if(row.limiting==='power')assert.ok(Math.abs(row.powerBalanceHp)<1e-7);
 }
 for(const a of values)for(const b of values){
  const v=S.compare(a,b,tol),w=S.compare(b,a,tol);
  if(v.status==='compared'){
   assert.ok(Math.abs(v.rateGap+w.rateGap)<1e-10);
   assert.equal(({a:'b',b:'a'})[v.ordering]??v.ordering,w.ordering);
  }
 }
}
const reference=grid.find(c=>c.altFt===10000&&c.easMph===210);
for(const a of report.aircraft)assert.ok(Math.abs(reference.rows[a.id].rate-a.maneuver.sustainedDegSec)<1e-6);
const run=(id,eas,mass,alt=10000,s=settings)=>S.point(M,T,L,data,id,s,alt,eas,mass);
assert.ok(run('p51b',210,9000).rate>run('p51b',210,9300).rate);
assert.equal(run('p51b',210,-1).status,'invalid-weight');
assert.equal(run('p51b',0,9000).status,'invalid-condition');
assert.notEqual(run('bf109f4',210,6200,40000).status,'steady');
assert.notEqual(run('p51b',50,9000).status,'steady');
assert.equal(run('p51b',601,9000,0).status,'speed-domain-unavailable');
assert.ok(run('p51b',210,9000,10000,{...settings,mode:'normal'}).rate<run('p51b',210,9000).rate);
assert.deepEqual(S.commonRange([7000,7400],[7200,7500]),[7200,7400]);assert.equal(S.commonRange([1,2],[3,4]),null);
const chart=data.steadyEvidence.ellis;
assert.equal(chart.figure,9);assert.equal(chart.specimens.flatMap(s=>s.points).length,7);
assert.equal(chart.proxy[0].g,3.1);assert.ok(chart.proxy[0].gError<-.8);
assert.equal(data.steadyEvidence.finnish.conditions.elapsedSeconds,22);
assert.equal(data.steadyEvidence.simulation.filter(s=>s.replay).length,2);

const identical=run('p51b',210,9000);
assert.deepEqual(S.compare(identical,{...identical},tol).bounds,[0,0]);
