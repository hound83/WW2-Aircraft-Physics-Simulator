'use strict';
const assert=require('node:assert/strict');
const M=require('../src/physics.js'),D=require('../aircraft/cases.json');
const R=require('../references/stall-calibration-research-2026-11-02.json'),F=require('../src/stall-lab.js');
const score=require('../validation/diagnostics/flight_scorecard.cjs').run();
assert.equal(score.rows.length,69);
assert.equal(new Set(score.rows.map(r=>r.id)).size,69);
assert.equal(score.independentChecks,0);
assert.equal(score.pairwise5to1,'unresolved');
for(const row of score.rows){
 const v=row.prediction.value;
 if(v===null)assert.equal(row.workingError.absolute,null);
 else assert.equal(row.workingError.signed,v-row.observed);
 assert.equal(row.independent,false);
}
assert.ok(score.summary.filter(s=>s.paired===0).every(s=>s.v36Mae===null&&s.workingMae===null));
assert.ok(score.summary.filter(s=>s.metric==='climb-rate'&&s.aircraftId==='bf109f4').every(s=>s.observations===0));
const p51=score.stall.find(s=>s.id==='p51b');
assert.ok(p51.v36OutsideBracketMph>3.8);
assert.equal(p51.workingOutsideBracketMph,0);
assert.equal(p51.historicalStallCasMph,null);
const read=(alt,weight=9240)=>F.cleanStalls(M,D,R,alt,{p51b:weight})[0];
for(const alt of [5100,8000,9300])assert.equal(read(alt).liftBasis,'source-informed-transfer');
for(const alt of [5099,9301,20000])assert.equal(read(alt).liftBasis,'provisional-lift');
for(const weight of [1000,20000])assert.equal(read(8000,weight).liftBasis,'provisional-lift');
assert.equal(read(NaN).liftBasis,'unavailable');
assert.equal(F.cleanStalls(M,D,{...R,sources:[]})[0].liftBasis,'provisional-lift');
for(const row of score.stall.filter(s=>s.id!=='p51b')){
 assert.equal(row.model.easMph,row.baseline.easMph);
 assert.equal(row.liftBasis,'provisional-lift');
}
console.log('PASS frozen historical scorecard, unscored data gates, and bounded clean-stall lift for four fighters');
