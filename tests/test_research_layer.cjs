'use strict';
// The repository's regression runner counts one TAP result per test file.
// Group our related assertions under that single script-level result.
const test=(label,callback)=>{callback();console.log('# PASS '+label);};
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {buildCatalog,SCHEMA}=require('../scripts/research-layer.cjs');
const {validateCurve,applyCorrections}=require('../scripts/research-speed-corrections.cjs');

test('existing performance archives and both original stall research packs join reproducibly',()=>{
 const a=buildCatalog(),b=buildCatalog();
 assert.equal(a.schema,SCHEMA);
 assert.equal(a.fingerprint,b.fingerprint);
 assert.ok(a.summary.observation_count>=718);
 assert.ok(a.summary.stall_count>=182);
 assert.ok(a.summary.source_count>=122);
 assert.ok(a.source_packs.length>=5);
 assert.equal(a.observations.filter(row=>row.pack_id==='stall_us_2026-11-10').length,115);
 assert.equal(a.observations.filter(row=>row.pack_id==='stall_global_2026-11-10').length,44);
 assert.equal(a.observations.filter(row=>row.pack_id==='stall_airspeed_corrections_us_2026-11-10').length,6);
 assert.equal(a.observations.filter(row=>row.pack_id==='stall_airspeed_corrections_global_2026-11-10').length,8);
 assert.equal(a.calibration_curves.length,19);
 assert.equal(a.calibration_curves.filter(curve=>curve.index_only).length,2);
 const corsair=a.observations.find(row=>row.id.endsWith(':corsair1945-stall-full-flaps-power-off'));
 assert.equal(corsair.preferred_airspeed.basis,'CAS*');
 assert.ok(Math.abs(corsair.preferred_airspeed.speed_mph-83.43151)<1e-4);
 assert.equal(corsair.preferred_airspeed.fit_eligible,false);
 const hurricane=a.observations.filter(row=>row.pack_id==='stall_airspeed_corrections_global_2026-11-10');
 assert.ok(hurricane.every(row=>row.speed_basis==='IAS'&&row.values.weight_lb===7014));
 assert.equal(a.observations.filter(row=>row.preferred_airspeed?.basis==='CAS*').length,1);
 const indexed=new Set(a.sources.map(source=>source.id));
 assert.ok(a.observations.every(row=>indexed.has(row.source_id)));
 assert.ok(a.observations.every(row=>Object.values(row.values).every(v=>typeof v!=='number'||Number.isFinite(v))));
});

test('stall evidence does not mistake instrument-corrected IAS for CAS or ranges for points',()=>{
 const catalog=buildCatalog();
 const p51=catalog.observations.filter(row=>row.pack_id==='stall_us_2026-11-10'&&row.id.includes(':US01:'));
 assert.equal(p51.length,9);
 assert.deepEqual([...new Set(p51.map(row=>row.values.weight_lb))].sort((a,b)=>a-b),[9045,9055,9065,9075,9080,9085,9090,9095,9100]);
 assert.ok(p51.every(row=>row.speed_basis==='IAS'&&row.correction.instrument==='applied'&&row.correction.position==='not-established'));
 const f4u4=catalog.observations.filter(row=>row.id.includes(':US20:'));
 assert.equal(f4u4.length,4);
 assert.ok(f4u4.every(row=>row.speed_basis==='CAS'&&row.correction.basis_evidence==='explicit-CAS'));
 const spit=catalog.observations.filter(row=>row.id.includes(':SPIT-IX-conventional-'));
 assert.equal(spit.length,6);
 assert.deepEqual([...new Set(spit.map(row=>row.values.weight_lb))].sort((a,b)=>a-b),[7150,7800,8700]);
 const interval=spit.find(row=>row.values.speed_min_mph===75);
 assert.equal(interval.values.speed_mph,null);
 assert.equal(interval.values.speed_max_mph,79);
 assert.equal(interval.speed_basis,'IAS');
});

test('new versioned packs can extend altitude, speed and mass without research caps',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ww2-evidence-test-'));
 try{
  const required=['references/ww2_fighter_archival_reports_2026-11-10.json','references/ww2_fighter_archival_numeric_series_2026-11-10.json','references/ww2_fighter_balanced_reports_2026-11-10.json','references/ww2_fighter_balanced_observations_2026-11-10.json'];
  fs.mkdirSync(path.join(temp,'references/research'),{recursive:true});
  for(const file of required)fs.copyFileSync(path.join(root,file),path.join(temp,file));
  const file=path.join(temp,'references/research/added_future_pack.json');
  const pack={schema:'ww2-fighter-evidence-pack/v1',pack_version:'1.0.0',sources:[{id:'future',aircraft:'Test specimen',report:'Numeric extension source',pdf:'https://example.org/future.pdf'}],
   series:[{id:'sample',source_id:'future',aircraft:'Test specimen',quantity:'stall_speed',speed_basis:'CAS',corrections:{instrument:'applied',position:'applied'},columns:['speed_mph','weight_lb','alt_ft','config'],rows:[[1800,220000,120000,'clean']]}]};
  fs.writeFileSync(file,JSON.stringify(pack));
  const c=buildCatalog({root:temp,version:'3.14.0'});
  assert.equal(c.summary.metrics.alt_ft.max,120000);
  assert.equal(c.summary.metrics.speed_mph.max,1800);
  assert.equal(c.summary.metrics.weight_lb.max,220000);
  assert.ok(c.observations.some(row=>row.id==='added_future_pack:sample:0001'));
  assert.equal(c.source_packs.length,3);
  // A source cannot become CAS merely by labeling an instrument correction.
  pack.series[0].corrections={instrument:'applied',position:'not-established'};
  fs.writeFileSync(file,JSON.stringify(pack));
  assert.throws(()=>buildCatalog({root:temp,version:'3.14.0'}),/CAS claim lacks position-correction/);
  pack.series[0].corrections={instrument:'applied',position:'applied'};
  pack.series[0].rows[0][0]='unverified';
  fs.writeFileSync(file,JSON.stringify(pack));
  assert.throws(()=>buildCatalog({root:temp,version:'3.14.0'}),/Missing stall speed/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('documented correction tables apply provisionally within source and configuration, never extrapolate',()=>{
 const curve=validateCurve({id:'c',source_id:'charts:source',applies_to_source_ids:['tests:specimen'],mapping:'instrument_corrected_IAS_to_CAS',unit:'mph',
  configuration:{gear:'up',flaps:'up'},rows:[[80,85],[100,107],[120,129]]},new Set(['charts:source','tests:specimen']));
 const record={quantity:'stall_speed',source_id:'tests:specimen',speed_basis:'IAS',correction:{instrument:'applied',position:'not-established'},values:{speed_mph:90,gear:'up',flaps:'up'}};
 const provisional=applyCorrections(record,[curve]);
 assert.equal(provisional.basis,'CAS*');
 assert.equal(provisional.speed_mph,96);
 assert.equal(provisional.status,'provisional-calibration-table-CAS');
 assert.equal(provisional.fit_eligible,false);
 assert.equal(provisional.original_speed_mph,90);
 assert.equal(provisional.calibration_id,'c');
 assert.equal(applyCorrections({...record,values:{...record.values,speed_mph:79}},[curve]).basis,'IAS corrected*');
 assert.equal(applyCorrections({...record,values:{...record.values,flaps:'down'}},[curve]).basis,'IAS corrected*');
 assert.equal(applyCorrections({...record,source_id:'tests:other'},[curve]).basis,'IAS corrected*');
 assert.equal(applyCorrections({...record,correction:{instrument:'unestablished'}},[curve]).basis,'IAS');
 const knots=validateCurve({id:'kt',source_id:'charts:source',applies_to_source_ids:['tests:specimen'],mapping:'IAS_to_CAS',unit:'knots',
  configuration:{gear:'down'},rows:[[80,86.5],[100,104.5]]},new Set(['charts:source','tests:specimen']));
 assert.equal(knots.original_unit,'knots');
 assert.equal(knots.original_rows[0][0],80);
 assert.ok(Math.abs(knots.rows[0][0]-92.06235584)<1e-8);
});

test('current HTML embeds exactly the reviewed catalog and read-only browser explorer',()=>{
 const html=fs.readFileSync(path.join(root,'dist/model.html'),'utf8');
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'dist/research-catalog.json'),'utf8'));
 const build=JSON.parse(fs.readFileSync(path.join(root,'dist/build.json'),'utf8'));
 assert.equal(build.researchFingerprint,catalog.fingerprint);
 assert.equal(build.researchObservations,catalog.summary.observation_count);
 assert.ok(html.includes('id="historical-evidence"'));
 assert.ok(html.includes('id="historical-audit"'));
 assert.ok(html.includes('id="historical-lineage-rows"'));
 assert.ok(html.includes('id="historical-review-rows"'));
 assert.equal(catalog.document_lineage.length,47);
 assert.equal(catalog.calibration_reviews.length,29);
 assert.ok(html.includes('id="historical-research-data"'));
 assert.ok(html.includes('window.UniversalResearchEvidence'));
 assert.ok(html.includes(catalog.fingerprint));
});
