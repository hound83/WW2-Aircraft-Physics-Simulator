'use strict';
const assert=require('node:assert/strict');
const {build,asCsv}=require('../validation/diagnostics/fleet_climb_intervals.cjs');
const source=require('../references/analysis/powered-turn-evidence-2026-11-13.json').finnish.relatedAcceleration;
const stall=require('../references/spitfire-ix-stall-audit.json');

function row(fromFt,toFt,observed,predicted,mode='normal',weightLb=7000) {
  return {fromFt,toFt,observed,predicted,error:predicted-observed,mode,weightLb};
}
function plane(id,checks) {
  return {id,name:id,evidence:{elapsed:[{qualifier:'Trial, A',source:'page',grade:'conditional',reference:'fixture',checks}]}};
}
const a=plane('a',[row(0,10000,100,92),row(0,20000,210,198),row(0,10000,95,88,'combat'),
  row(10000,30000,240,257),{...row(0,20000,135,125,'combat'),error:null}]);
const b=plane('b',[row(0,20000,200,199)]);
const comparison=build([a,b]);
assert.deepEqual(comparison.series.map(s=>s.bands.length),[2,1,1,1]);
assert.equal(comparison.series[0].bands[1].observed,110);
assert.equal(comparison.series[0].bands[1].predicted,106);
assert.equal(comparison.pairs.length,1);
assert.deepEqual([comparison.pairs[0].observedGap,comparison.pairs[0].modeledGap,comparison.pairs[0].reversed],[-10,1,true]);
assert.equal(comparison.pairs[0].a.interpolated,false);
assert.match(asCsv(comparison.series),/"Trial, A"/);
assert.throws(()=>build([plane('missing',[{error:0}])]),/boundaries/);
assert.throws(()=>build([plane('duplicate',[row(0,1,1,1),row(0,1,2,2)])]),/Duplicate/);

const g=plane('g',[{...row(0,5,50,45),readUncertaintySeconds:2},{...row(0,8,90,90),readUncertaintySeconds:3}]);
assert.deepEqual(build([g]).series[0].bands.map(i=>i.readAllowanceSeconds),[2,5]);
assert.equal(stall.wartimeManual.scanVerified,true);
assert.equal(stall.wartimeManual.actualStallRunMassLb,null);
assert.equal(stall.wartimeManual.rows[0].mph,86);
assert.equal(stall.wartimeManual.minimumCorrectionIasMph,120);
assert.equal(stall.derivedHistoricalClMax,null);
assert.deepEqual(source.rows.map(r=>r.seconds),[27,35,9,33]);
assert.equal(source.verifiedOriginalTimingSheet,false);
assert.equal(source.recordedAltitudeM,null);
assert.equal(source.recordedSpeedBasis,null);
