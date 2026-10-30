'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../src/physics.js'),D=require('../aircraft/cases.json'),F=require('../calibration/v2.8-working-model.json');
const R=require('../validation/diagnostics/working_validation_v28.cjs').run();
const frozen=require('../validation/current/v28-calibration.json');
assert.equal(F.version,require('../package.json').version);
assert.equal(frozen.acceptance.pass,true);
assert.deepEqual(frozen.selected.model.params,F.sharedPropeller);
for(const f of frozen.selected.model.fits){assert.equal(f.e,F.aircraft[f.id].e);assert.ok(Math.abs(f.delta-F.aircraft[f.id].openCoolingDeltaCd0)<1e-10);}
assert.ok(frozen.acceptance.mustangReduction>=.30);
for(const s of R.current.summary){
 const expected=frozen.selected.summary.find(x=>x.id===s.id);
 for(const key of ['speedMae','speedCheckMae','climbMae','climbCheckMae'])
  if(expected[key]===null)assert.equal(s[key],null);else assert.ok(Math.abs(s[key]-expected[key])<1e-7,s.id+' '+key);
}
const before=JSON.stringify(D);
for(const [id,a]of Object.entries(D.aircraft)){
 const fit=F.aircraft[id],o=M.workingOptions(a),anchor=M.cd0FromAnchor(a,'P',fit.e);
 assert.equal(o.profile,'P');assert.equal(o.polar.e,fit.e);
 assert.ok(Math.abs(o.polar.cd0-fit.cd0AtCalibration)<1e-10);
 assert.ok(Math.abs(o.polar.cd0-anchor.cd0)<1e-12);
 assert.deepEqual(a.propGeometry.momentumModel,F.sharedPropeller);
 const low=M.propEta(a,5000,200,700,'P'),high=M.propEta(a,5000,200,1700,'P');
 assert.ok(low.eta>high.eta&&high.eta>0&&low.eta<=1,id+' loading response');
 const clean=M.workingOptions(a),open=M.workingOptions(a,{coolingState:'source-climb'});
 assert.equal(clean.addedDragAreaM2,undefined);
 assert.equal(open.addedDragAreaM2,fit.openCoolingDeltaCd0*a.wingAreaM2);
 const x=M.evaluated(a,5000,200,{profile:'P'}),y=M.evaluated(a,5000,200,clean);
 assert.equal(x.status,'modelled');assert.deepEqual(x,y);
}
assert.equal(JSON.stringify(D),before,'working evaluation must not mutate source inputs');
const a=D.aircraft.p51b;
assert.equal(M.propEta(a,5000,200,1200,'P','67inHg',{engineRpmOverride:-1}),null);
const r1=M.propEta(a,5000,250,1200,'P','67inHg',{engineRpmOverride:2100}),r2=M.propEta(a,5000,250,1200,'P','67inHg',{engineRpmOverride:3000});
assert.ok(r2.tipMach>r1.tipMach);assert.notEqual(r1.eta,r2.eta);
for(const w of [9135,9335,9535]){
 const c=R.sensitivity.find(r=>r.weightLb===w&&r.profile==='C'),p=R.sensitivity.find(r=>r.weightLb===w&&r.profile==='P');
 assert.ok(p.mae<c.mae,'Mustang improvement survives tested weight '+w);
}
assert.ok(F.aircraft.spitfire_lfix_bs543.boundaryWarning);
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/model.html'),'utf8');
assert.ok(html.includes('<option value="P" selected>'));
assert.ok(html.includes('<option value="C">'));
console.log('PASS v2.8 working profile: fixed-fit reproduction, loading/RPM responses, input immutability, configuration handling, weight sensitivity and UI default');
