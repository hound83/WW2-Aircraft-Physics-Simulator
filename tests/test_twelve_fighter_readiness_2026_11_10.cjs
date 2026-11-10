'use strict';

const assert=require('node:assert/strict');
const {buildCatalog}=require('../scripts/research-layer.cjs');
const readiness=require('../references/aircraft-supergoodenough-readiness-2026-11-10.json');
const intake=require('../references/aircraft-intake.json');
const followup=require('../references/research/ww2_twelve_fighter_gap_followup_2026-11-10.json');
const corrected=require('../references/research/ww2_low_speed_turn_calibration_2026-11-10.json');

assert.equal(readiness.schema,'ww2-fighter-supergoodenough-readiness/v1');
assert.equal(readiness.variants.length,12,'Exactly six modeled and six research intake variants');
assert.equal(new Set(readiness.variants.map(v=>v.id)).size,12,'Unique versioned specimen identifiers');
assert.equal(readiness.variants.filter(v=>v.role==='modeled').length,6);
assert.equal(readiness.variants.filter(v=>v.role==='candidate').length,6);
assert.equal(intake.nextCandidates.length,6);
assert.equal(intake.candidateResearchOnly,false);
assert.deepEqual(intake.nextCandidates.map(v=>v.variant),['F4U-4','F6F-3','P-47D-30','P-40F','Fw 190 D-9','Ki-84-I']);
assert.ok(intake.nextCandidates[0].research_status.includes('v4.0 source-conditioned'));
assert.ok(intake.nextCandidates.slice(1).every(v=>v.research_status.includes('not admitted')));
const max=Object.values(readiness.weights).reduce((s,v)=>s+v,0);
assert.equal(max,100,'Scoring weights must add to 100');
for(const [i,v]of readiness.variants.entries()){
 assert.ok(Number.isInteger(v.percent)&&v.percent>=0&&v.percent<=100,v.id+' bounded score');
 assert.equal(v.points.length,Object.keys(readiness.weights).length,v.id+' six dimensions');
 for(const [j,p]of v.points.entries())assert.ok(Number.isInteger(p)&&p>=0&&p<=Object.values(readiness.weights)[j],v.id+' category point bounds');
 assert.equal(v.points.reduce((a,b)=>a+b,0),v.percent,v.id+' score is reproducible');
 assert.ok(v.primary_sources.length>=2&&v.primary_sources.every(s=>/^https:\/\//.test(s)),v.id+' source URLs');
 assert.ok(v.chief_gaps.length>=2&&v.chief_gaps.every(s=>s.length>35),v.id+' searched detailed missing data');
 assert.equal(v.super_good_enough,false,'No unverified source evidence can become admitted automatically: '+v.id);
 assert.equal(v.sustained_turn_historical_verified,false,'No source-only discovery invents historical sustained turn: '+v.id);
 if(i)assert.ok(readiness.variants[i-1].percent>=v.percent,'Sorted by score descending');
}
assert.deepEqual(readiness.variants.filter(v=>v.verified_near_stall_cas).map(v=>v.id),['f4u4_80765']);

const c=buildCatalog();
const newRows=c.observations.filter(v=>v.pack_id==='ww2_twelve_fighter_gap_followup_2026-11-10');
assert.equal(followup.pack_version,'1.0.0');
assert.equal(newRows.length,24);
assert.equal(c.summary.observation_count,979);
assert.equal(c.summary.source_count,168);
assert.equal(c.summary.stall_count,208);
assert.equal(c.summary.stall_quality_tiers['reported-CAS'],4);
assert.equal(c.summary.stall_quality_tiers['provisional-calibration-table-CAS'],1);
assert.equal(c.calibration_curves.length,19,'No unvalidated near-stall airspeed calibration activated');
assert.equal(corrected.pack_version,'1.0.1');
const kiCorrection=corrected.calibration_reviews.find(x=>x.id==='ki84-t2-original-chart-lead');
assert.ok(kiCorrection.finding.includes('FALSE')&&kiCorrection.finding.includes('no measured performance climb'));

const p38=newRows.filter(x=>x.quantity==='airspeed_calibration_ias_to_cas');
assert.equal(p38.length,8);
assert.ok(p38.every(x=>x.aircraft.startsWith('P-38J 42-67869')&&x.values.cockpit_ias_mph>=150));
assert.deepEqual(p38.map(x=>x.values.cockpit_ias_mph).sort((a,b)=>a-b),[150,180,210,240,270,300,330,360]);
assert.ok(p38.every(x=>x.preferred_airspeed===undefined));
assert.equal(newRows.filter(x=>x.quantity==='published_engine_power_rating'&&x.aircraft.includes('Ki-84')).length,7);
assert.ok(newRows.filter(x=>x.quantity==='third_party_simulator_sustained_turn_benchmark').every(x=>x.source_class.includes('NOT-HISTORICAL')));
assert.equal(newRows.filter(x=>x.quantity==='accelerated_turn_nonstall_limit').length,1);
assert.ok(!newRows.some(x=>x.quantity==='stall_speed'||x.quantity==='max_sustained_turn_rate'));
console.log('PASS twelve-fighter source gap audit: 12 ranked exact variants, +24 source observations, +5 sources, no false new CAS or historical sustained turn');
