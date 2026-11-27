'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {interval,speedInterval}=require('../src/fleet-comparison.js');
const html=fs.readFileSync(require.resolve('../dist/model.html'),'utf8');
const data=JSON.parse(html.match(/id="benchmark-operating-data">([^<]+)<\/script>/)[1]);
const report=JSON.parse(fs.readFileSync(require.resolve('../dist/fleet-validation.json')));
for(const pair of report.climbIntervals.focus) {
  const values=[pair.left,pair.right].map(i=>{
    const series=report.climbIntervals.series[i], options=data.trialClocks[series.aircraftId];
    return interval(options.find(t=>t.mode===series.mode && t.trial===series.trial),Math.round(pair.fromFt),Math.round(pair.toFt));
  });
  assert.ok(Math.abs(values[1].observed-values[0].observed-pair.observedGap)<0.002);
  assert.ok(Math.abs(values[1].predicted-values[0].predicted-pair.modeledGap)<0.002);
}
const lf=data.trialClocks.spitfire_lfix_bs543[0];
assert.equal(interval(lf,5000,10000),null);
assert.equal(interval(lf,0,20000),null);
assert.equal(interval(lf,2000,20000).observed,258);
const f4=data.trialClocks.bf109f4[0];
assert.equal(interval(f4,3281,26247).predicted,null);
assert.ok(interval(f4,3281,26247).observed>0);
assert.deepEqual(data.restoredAcceleration,report.restoredAcceleration);
assert.deepEqual(data.restoredAcceleration.map(r=>r.observed),[31.5,40]);
assert.deepEqual(data.restoredAcceleration.map(r=>Math.round(r.error*10)/10),[-7.1,-10.2]);
assert.equal(speedInterval(data.historical.maneuvers[1].figure.points,110,242),null);
assert.equal(Object.keys(data.trialClocks).length,14);
