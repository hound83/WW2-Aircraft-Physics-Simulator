'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const pack=require('../references/research/stall_four_track_followup_2026-11-10.json');
const {buildCatalog}=require('../scripts/research-layer.cjs');

const catalog=buildCatalog({root:path.resolve(__dirname,'..')});
const prefix='stall_four_track_followup_2026-11-10';
const rows=catalog.observations.filter(row=>row.pack_id===prefix);
assert.equal(pack.pack_version,'1.0.0');
assert.equal(rows.length,29);
assert.equal(catalog.summary.observation_count,755);
assert.equal(catalog.summary.stall_count,200);
assert.equal(catalog.summary.source_count,139);
assert.equal(catalog.calibration_curves.length,19,'Unsafe chart digitization must not silently produce a correction curve');
assert.equal(catalog.summary.lineage_groups,15);
assert.equal(catalog.summary.calibration_reviews,2);
assert.equal(catalog.document_lineage.length,15);
assert.equal(catalog.calibration_reviews.length,2);

const va=rows.filter(row=>row.quantity==='stall_speed');
assert.equal(va.length,10);
assert.ok(va.every(row=>row.speed_basis==='IAS'&&row.preferred_airspeed?.basis==='IAS'));
assert.ok(va.every(row=>row.values.weight_lb===6184&&Number.isFinite(row.values.clmax_reported)));
assert.deepEqual([...new Set(va.map(row=>row.values.gun_ports))].sort(),['covered','open']);
assert.equal(va.find(row=>row.values.power==='gliding-throttle-closed'&&row.values.gun_ports==='covered').values.clmax_reported,1.18);

const p47=rows.filter(row=>row.quantity==='stall_trial_metadata');
assert.equal(p47.length,14);
assert.equal(p47.find(row=>row.values.figure==='58').values.alt_ft,3000);
assert.equal(p47.find(row=>row.values.figure==='52').values.weight_lb,12860);
assert.equal(p47.filter(row=>row.values.complete_stall===false).length,2);
assert.ok(p47.every(row=>row.speed_basis==='unestablished'&&!row.preferred_airspeed));

const f6f=rows.filter(row=>row.quantity==='maximum_normal_force_coefficient');
assert.equal(f6f.length,5);
assert.ok(f6f.every(row=>Number.isFinite(row.values.cn_min)&&Number.isFinite(row.values.cn_max)));
assert.ok(f6f.every(row=>row.values.cn_max>=row.values.cn_min));

const sources=new Set(catalog.sources.map(source=>source.id));
for(const link of pack.document_lineage){
 assert.ok(link.members.length>0,link.id);
 for(const id of link.members)assert.ok(sources.has(id),`Unresolved historical source lineage ${link.id}: ${id}`);
}
assert.equal(pack.document_lineage.find(row=>row.id==='p47d30-433441-naca-1948-1953').relationship,'same_experiment_superseded_report');
assert.ok(catalog.document_lineage.every(link=>link.members.every(id=>sources.has(id))));
assert.ok(catalog.calibration_reviews.every(review=>sources.has(review.source_id||review.original_other_source)));
assert.ok(pack.calibration_reviews.every(row=>row.status==='original-low-speed-chart-inspected-not-fit-ready'));
assert.equal(catalog.observations.filter(row=>row.preferred_airspeed?.basis==='CAS*').length,1);
assert.equal(catalog.observations.filter(row=>row.preferred_airspeed?.basis==='CAS').length,4);

console.log('Pass four-track stall research evidence, semantic dedup links, original IAS/CN and unchanged CAS gates');
