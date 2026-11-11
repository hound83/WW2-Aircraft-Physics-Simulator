'use strict';

const assert=require('node:assert/strict');
const {buildCatalog}=require('../scripts/research-layer.cjs');
const propulsion=require('../references/research/ww2_multiaxis_propulsion_trials_2026-11-10.json');
const corrections=require('../references/research/ww2_low_speed_turn_calibration_2026-11-10.json');

const c=buildCatalog();
const take=(id)=>c.observations.filter(row=>row.pack_id===id);
const prop=take('ww2_multiaxis_propulsion_trials_2026-11-10');
const low=take('ww2_low_speed_turn_calibration_2026-11-10');
assert.equal(prop.length,143,'All 143 independently sourced scalar propeller/power/altitude observations survive ingestion');
assert.equal(low.length,57,'All 57 low-speed, turn/control and correction entries survive ingestion');
assert.equal(c.summary.observation_count,1275);
assert.equal(c.summary.stall_count,250);
assert.equal(c.summary.source_count,238);
assert.equal(c.calibration_curves.length,19,'No unapproved CAS curve was fitted from installation-only data');

const p47Dec=prop.filter(x=>x.id.includes('p47b-dec-props-level'));
const p47Jan=prop.filter(x=>x.id.includes('p47b-jan-uncuffed-climb'));
assert.equal(p47Dec.length,18);
assert.equal(p47Jan.length,14);
assert.ok(p47Dec.every(x=>x.speed_basis==='TAS'));
assert.ok(p47Jan.every(x=>x.speed_basis==='unestablished'));
assert.ok(p47Jan.every(x=>x.values.original_table_speed_header==='IAS'));
assert.equal(prop.filter(x=>x.aircraft==='P-47B 41-5942').length,68);

const p40f=prop.filter(x=>x.aircraft==='P-40F 41-13635');
assert.equal(p40f.length,25);
assert.ok(p40f.some(x=>x.values.propeller_original_print==='89303-23W'));
assert.ok(p40f.some(x=>x.values.propeller_original_print==='89303-24W'));

const p38=low.filter(x=>x.quantity==='airspeed_installation_correction');
assert.equal(p38.length,17);
assert.ok(p38.every(x=>x.speed_basis==='IAS'&&!x.preferred_airspeed));
assert.ok(p38.every(x=>x.values.correction_scope==='installation-only'));
const cleanCorrected=low.filter(x=>x.quantity==='stall_speed_corrected_estimate');
assert.equal(cleanCorrected.length,3);
assert.ok(cleanCorrected.every(x=>x.speed_basis==='IAS'&&!x.preferred_airspeed));
const weight17000=cleanCorrected.find(x=>x.values.weight_lb===17000);
assert.ok(Math.abs(weight17000.values.installation_corrected_star_mph-114.7826086957)<1e-8);

const f6f25820=low.filter(x=>x.aircraft==='F6F-3 BuNo 25820'&&x.quantity==='stall_speed');
assert.equal(f6f25820.length,4);
assert.ok(f6f25820.every(x=>x.speed_basis==='IAS'&&x.values.weight_lb===null));
assert.ok(f6f25820.every(x=>x.preferred_airspeed?.basis==='IAS'));

const turns=low.filter(x=>x.quantity==='steady_turn_elevator_stick_force_per_g');
assert.equal(turns.length,4);
assert.ok(turns.every(x=>!x.preferred_airspeed));
assert.ok(![...low,...prop].some(x=>x.quantity==='max_sustained_turn_rate'));
assert.equal(low.filter(x=>x.quantity==='turn_stall_speed').length,2);
assert.ok(low.filter(x=>x.quantity==='position_error_correction_applied').every(x=>x.speed_basis==='IAS'));
assert.equal(low.filter(x=>x.quantity==='position_error_correction_applied'&&x.values.within_measured_130_320_ias===false).length,4);
assert.equal(low.filter(x=>x.quantity==='stall_speed'&&x.source_class.includes('secondary-book')).length,2);

const p51B15=prop.filter(x=>x.aircraft==='P-51B-15 AAF 43-24777');
assert.equal(p51B15.length,5);
assert.ok(p51B15.filter(x=>x.quantity==='level_flight_speed').every(x=>x.source_class.includes('BHP-from-Packard-chart')));
assert.equal(c.observations.filter(x=>x.source_id==='stall_us_2026-11-10:P51B15'&&x.quantity==='stall_speed').length,9,
 'Matched P51B15 original stall tests already indexed; do not duplicate as independent trials');

const uniqueSourceIds=new Set(c.sources.map(x=>x.id));
for(const pack of [propulsion,corrections])for(const lineage of pack.document_lineage)for(const id of lineage.members){
 const qualified=id.includes(':')?id:`${pack===propulsion?'ww2_multiaxis_propulsion_trials_2026-11-10':'ww2_low_speed_turn_calibration_2026-11-10'}:${id}`;
 assert.ok(uniqueSourceIds.has(qualified),`Missing source lineage ${qualified}`);
}
assert.equal(c.summary.stall_quality_tiers['reported-CAS'],9);
assert.equal(c.summary.stall_quality_tiers['provisional-calibration-table-CAS'],1);
console.log('PASS primary performance expansion (200 rows), original IAS/CAS restrictions, independent specimens, source contradictions and lineage');
