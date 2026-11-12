'use strict';

const assert=require('node:assert/strict');
const {buildCatalog}=require('../scripts/research-layer.cjs');
const baseline=require('../references/aircraft-supergoodenough-readiness-2026-11-10.json');
const ranking=require('../references/aircraft-readiness-dual-lane-2026-11-10.json');
const pack=require('../references/research/ww2_twelve_fighter_dual_lane_2026-11-10.json');
const sum=a=>a.reduce((x,y)=>x+y,0);
assert.equal(ranking.schema,'ww2-fighter-dual-lane-readiness/v1');
assert.equal(pack.schema,'ww2-fighter-evidence-pack/v1');
assert.equal(sum(ranking.weights),100);
assert.equal(ranking.variants.length,12);
assert.equal(pack.sources.length,23);
assert.equal(pack.series.reduce((n,s)=>n+s.rows.length,0),74);
const sourceIds=new Set(pack.sources.map(s=>s.id));
assert.equal(sourceIds.size,pack.sources.length);
for(const s of pack.series){
 assert.ok(sourceIds.has(s.source_id),s.id+' source traceable');
 assert.equal(s.columns.length,s.rows[0].length,s.id+' columns consistent');
 assert.ok(s.rows.every(row=>row.length===s.columns.length),s.id+' every row complete');
}
const old=new Map(baseline.variants.map(v=>[v.id,v]));
const seen=new Set();
for(const v of ranking.variants){
 assert.ok(old.has(v.id),v.id+' known variant');
 assert.ok(!seen.has(v.id),v.id+' not duplicated');
 seen.add(v.id);
 assert.equal(v.primary_points.length,6);
 assert.equal(v.augmented_points.length,6);
 assert.ok(v.new_primary_sources.every(id=>sourceIds.has(id)),v.id+' primary cites source pack');
 assert.ok(v.credit.length>90&&v.unresolved.length>90,v.id+' robust audit explanation');
 for(let i=0;i<6;i++){
  assert.ok(Number.isInteger(v.primary_points[i])&&v.primary_points[i]>=0&&v.primary_points[i]<=ranking.weights[i]);
  assert.ok(Number.isInteger(v.augmented_points[i])&&v.augmented_points[i]>=v.primary_points[i]&&v.augmented_points[i]<=ranking.weights[i]);
 }
 assert.ok(sum(v.primary_points)>=old.get(v.id).percent,v.id+' no retroactive scoring loss');
 assert.ok(sum(v.augmented_points)>=sum(v.primary_points),v.id+' dual lane order');
}
assert.equal(seen.size,12);
const c=buildCatalog();
const newRows=c.observations.filter(o=>o.pack_id==='ww2_twelve_fighter_dual_lane_2026-11-10');
assert.equal(newRows.length,74);
assert.equal(c.summary.source_count,313);
assert.equal(c.summary.observation_count,2010);
assert.equal(c.summary.stall_count,272);
assert.equal(c.summary.stall_quality_tiers['reported-CAS'],16,'Five P-38G and two F4U-4 source-backed CAS rows extend the original catalog');
assert.equal(c.summary.stall_quality_tiers['provisional-calibration-table-CAS'],1);
assert.equal(c.calibration_curves.length,22,'Three P-38G report tables extend the 19 existing curves');
const p51=pack.series.find(s=>s.id==='p51b-24777-position-error-chart-digitized');
assert.ok(p51.rows.every(row=>row[0]>=140&&!row[3]),'P51 original low speed outside measured chart');
const f4u=pack.series.find(s=>s.id==='f4u4-80765-derived-stall-vs-mass');
assert.ok(f4u.rows.every(row=>row[4]===false));
for(const [weight,derived,anchorW,anchorSpeed] of f4u.rows){
 assert.ok(Math.abs(derived-anchorSpeed*Math.sqrt(weight/anchorW))<0.015,'Mass-scaled CAS remains transparent derived only');
}
const d30=pack.series.find(s=>s.id==='p47d-433441-stall-run-weights');
assert.equal(d30.rows.length,9);
assert.ok(d30.rows.every(row=>row[1]>=12400&&row[1]<=13170));
assert.ok(newRows.filter(o=>o.quantity==='stall_speed').every(o=>o.speed_basis!=='CAS'));
assert.ok(!newRows.some(o=>o.quantity==='max_sustained_turn_rate'));
console.log('PASS dual lane: 12 ranks, 23 source records / 74 evidence rows, provenance-preserving 1g CAS and sustained-turn gates');
