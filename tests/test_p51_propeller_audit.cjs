'use strict';
const assert=require('node:assert/strict'),T=require('../validation/lib/propeller_transfer.cjs');
const R=require('../validation/diagnostics/p51_propeller_audit.cjs'),S=require('../validation/diagnostics/p51_climb_states.cjs');
const L=require('../references/p51-propeller-efficiency-audit.json'),M=require('../src/physics.js'),D=require('../aircraft/cases.json');
const target={bladeDrawing:'synthetic'},map={measuredInstalledMap:true,bladeDrawing:'synthetic',installationMatched:true,domain:{J:[1,2],Cp:[.1,.3],tipMach:[0,.9]}},state={J:1,Cp:.3,tipMach:.9};
assert.equal(T.assess(map,target,state).accepted,true);
for(const [key,value]of [['J',.99],['Cp',.301],['tipMach',.91]])assert.ok(T.assess(map,target,{...state,[key]:value}).blockers.includes('outside-domain-'+key));
assert.equal(T.assess({...map,bladeDrawing:'other'},target,state).accepted,false);
assert.ok(T.assess({...map,domain:{...map.domain,tipMach:null}},target,state).blockers.includes('unverified-domain-tipMach'));
assert.ok(T.assess({...map,measuredInstalledMap:false},target,state).blockers.includes('no-measured-installed-map'));
const before=JSON.stringify(D.aircraft.p51b),r=R.run();
assert.equal(JSON.stringify(D.aircraft.p51b),before,'candidate experiments cannot mutate default aircraft inputs');
assert.equal(r.acceptedDefaultChange,null);assert.equal(L.constraints.validatedEtaErrorBound,null);
assert.equal(r.variants.length,4);
const anchor=D.aircraft.p51b.calibration;
for(const v of r.variants){
 assert.equal(v.acceptedAsMeasuredInstalledModel,false);
 assert.ok(Math.abs(v.speeds.candidateAnchoredPolarMph-anchor.tasMph)<.01,'candidate polar must preserve anchor');
 assert.equal(v.figure5.length,6);assert.deepEqual(v.figure5.map(p=>p.prop.engineRpm),[2100,2300,2700,3000,3000,3000]);
 for(const p of v.figure5){assert.equal(p.prop.transfer.accepted,false);assert.ok(Number.isFinite(p.residualBhp));}
 assert.equal(v.climb.length,4);
 for(const c of v.climb){
  assert.equal(c.rows.length,9);
  for(const row of c.rows){assert.equal(row.prop.transfer.accepted,false);assert.ok(row.prop.eta>0&&row.prop.eta<1);}
  if(['N','M'].includes(v.profile))assert.ok(c.rows.every(row=>row.prop.transfer.blockers.includes('outside-domain-Cp')),'clamped Cp cannot be accepted');
 }
}
const c=r.variants[0];
for(const v of r.variants.slice(1)){
 assert.ok(v.speeds.fixedOriginalPolarMph>anchor.tasMph+1);
 for(const trial of v.climb.filter(x=>x.polarPolicy==='candidate-anchor')){
  const base=c.climb.find(x=>x.rating===trial.rating&&x.polarPolicy==='candidate-anchor');
  assert.ok(trial.max.climbFpm<base.max.climbFpm,'reanchored transfers cannot be advertised as climb improvements');
 }
}
for(const p of S.run().comparisons){
 const row=c.climb.find(x=>x.rating===p.rating&&x.polarPolicy==='original-C');
 assert.ok(Math.abs(row.max.climbFpm-p.jointGrid.max.climbFpm)<1e-5,'C endpoints must agree with prior fine grid');
}
assert.equal(M.cd0FromAnchor(D.aircraft.p51b,'C',.78).cd0,R.polar('C').cd0);
console.log('PASS transfer/domain rejection, RPM, fit isolation, shared-solver parity and coupled diagnostics');
