'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const fleet=JSON.parse(fs.readFileSync(path.join(root,'dist/fleet-validation.json')));
const html=fs.readFileSync(path.join(root,'dist/model.html'),'utf8');
const data=JSON.parse(html.match(/<script type="application\/json" id="benchmark-operating-data">([\s\S]*?)<\/script>/)[1]);
const early=['bf109e3_1304','spitfire_va_x4922'];
const prior=fleet.aircraft.filter(row=>!early.includes(row.id));
assert.equal(prior.length,12);
const oldNumerics=prior.map(a=>[a.id,...Object.values(a.model).map(x=>+x.toFixed(3))]);
assert.equal(crypto.createHash('sha256').update(JSON.stringify(oldNumerics)).digest('hex'),
 'ec08017a2f05e40d15832f76edc04b3421e16a6bcd0f1211636ab693083e0567');
for(const id of early){
 const a=data.intakeChecks.aircraft.find(r=>r.id===id);
 assert.equal(a.climb.filter(r=>r.role==='fit').length,1);
 assert.ok([...a.level,...a.climb,...a.elapsed].every(r=>Number.isFinite(r.error)&&r.source.startsWith('https://')));
 assert.ok(a.levelMaeMph<10&&a.climbMaeFpm<300);
 assert.ok(data.models[id].climbPowerFit.requestedFactor<data.models[id].climbPowerFit.factor);
}
const e=data.intakeChecks.aircraft.find(r=>r.id===early[0]);
assert.deepEqual(e.level.filter(r=>r.role==='fit').map(r=>r.configuration.split(' ')[0]),['open','closed']);
assert.equal(data.specification.aircraft[early[1]].levelObservationFloorFt,10000);
const h=data.historical;
assert.equal(h.early.level.length+2*h.early.climb.length+3*h.later.rows.length,88);
assert.equal(Math.round(h.factory.scenarios.baseline[1].errorS),167);
assert.equal(Math.round(h.factory.scenarios.pressureOnly[1].errorS),14);
assert.equal(Math.round(h.factory.scenarios.pressureAlignedToCommand[1].errorS),60);
assert.equal(h.maneuvers[0].estimate,16.6);
assert.equal(h.maneuvers[1].exit,null);
assert.deepEqual(h.maneuvers[1].figure.observed60sKias,[211,215]);
assert.equal(h.maneuvers[1].figure.points.at(-1).value,238);
assert.equal(h.maneuvers[1].figure.secondaryTargetKias,242);
for(const m of h.maneuvers)assert.ok(m.model.trace.every(p=>p.every(Number.isFinite)));

const sweep=data.sweep;
assert.equal(sweep.aircraft.length,14);
assert.deepEqual(sweep.metrics,['level','climb','elapsed','stall','acceleration','roll']);
for(const aircraft of sweep.aircraft){
 for(const metric of sweep.metrics){
  const cell=aircraft.cells[metric];
  assert.ok(Array.isArray(cell.groups)&&cell.next.length>0,aircraft.id+' '+metric);
 }
 for(const groups of Object.values(aircraft.bands)){
  assert.ok(groups.every(b=>b.count>0&&Number.isFinite(b.signedMean)&&b.absoluteMean>=Math.abs(b.signedMean)));
 }
}
const hf=data.intakeChecks.aircraft.find(r=>r.id===h.ids.hf);
assert.deepEqual(hf.level.filter(r=>r.role==='fit').map(r=>r.altFt),[0,27400]);
assert.ok(Math.abs(h.crossover.at(-1).modeledDifferenceMph-18)<.1);
const en=sweep.holdout;
assert.equal(en.level.length,17);
const comparable=en.level.filter(r=>r.after!==null);
assert.equal(comparable.length,13);
const mae=field=>comparable.reduce((n,r)=>n+Math.abs(r[field]-r.observed),0)/comparable.length;
assert.ok(mae('before')>9&&mae('after')<4.5);
assert.ok(en.level.filter(r=>r.gear==='low').every(r=>r.after===r.before));
assert.equal(en.climb.at(-1).observedSeconds,1215);
assert.equal(en.climb.at(-1).seconds,null);
const rollPair=sweep.roll.find(r=>r.ids.includes('p51b'));
assert.deepEqual(rollPair.points.map(r=>r.rateDegS),[81,71]);
assert.ok(sweep.roll.find(r=>r.ids.includes('p38g')).grade.includes('variant'));
