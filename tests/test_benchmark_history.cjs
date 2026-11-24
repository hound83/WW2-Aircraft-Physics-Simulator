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
assert.equal(h.maneuvers[1].figure.recordedFigureLabelMaxKias,255);
assert.equal(h.maneuvers[1].figure.secondaryTargetKias,242);
for(const m of h.maneuvers)assert.ok(m.model.trace.every(p=>p.every(Number.isFinite)));
