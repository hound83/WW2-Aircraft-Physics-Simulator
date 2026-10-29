'use strict';
const assert=require('node:assert/strict');
const M=require('../src/physics.js');
const D=require('../aircraft/cases.json');
const A=require('../validation/diagnostics/installed_power_audit_v19.cjs');
const base=require('../validation/baseline/prop_sim_results_v18.json');
const R=A.run();
function near(a,b,tol=.001){assert.ok(Math.abs(a-b)<=tol,`${a} vs ${b}`);}
let tests=0;
function test(name,cb){cb();tests++;console.log('PASS',name);}
test('Zero-exhaust P-51 aerodynamic anchor exactly equals existing candidate C',()=>{
 const p=D.aircraft.p51b;
 near(A.anchoredPolar(p).cd0,M.cd0FromAnchor(p,'C',.78).cd0,1e-12);
});
test('Zero-exhaust P-47 aerodynamic anchor exactly equals candidate C',()=>{
 const p=D.aircraft.p47b;
 near(A.anchoredPolar(p).cd0,M.cd0FromAnchor(p,'C',.78).cd0,1e-12);
});
test('P-51 original 67/75 climb numbers numerically reproduced',()=>{
 const o=R.scenarios[0];
 near(o.p51Climb67.fpm,3401.0861529653166,.001);
 near(o.p51Climb75.fpm,3978.538324234923,.001);
 near(o.p51BoostGainFpm,577.452171269606,.001);
});
test('P-51 and P-47 holdouts identical to v1.8',()=>{
 const o=R.scenarios[0],baseline=base.candidates.C;
 near(o.p51SpeedHoldouts.maeMph,baseline.p51bSpeed.holdoutMAEMph,.0001);
 near(o.p47SpeedHoldouts.maeMph,baseline.p47bSpeed.holdoutMAEMph,.0001);
 near(o.p51Fig5.firstFourMaeBhp,baseline.p51bPowerRequired.lowMidMAEBhp,.0001);
});
test('Bf 109 emergency turn reproduces IL-2-conditioned v1.8 physics',()=>{
 const o=R.scenarios[0],baseline=base.candidates.C.bf109f4AtHeldE;
 near(o.f4SLTurnSeconds,baseline[0].turnSeconds,.0001);
 near(o.f4TurnAt3000mSeconds,baseline[1].turnSeconds,.0001);
});
test('Each nonzero exhaust coefficient reanchors rather than double counting',()=>{
 for(const f of [.025,.05,.1,.2,.25])for(const ac of [D.aircraft.p51b,D.aircraft.p47b,D.aircraft.bf109f4]){
  const p=A.anchoredPolar(ac,f,.78),ref=ac.calibration;
  const s=A.sample(ac,ref.altFt,ref.tasMph,ref.rating,p);
  near(s.excessHp,0,1e-7);
 }
});
test('Physical drag accounting still works with alternate exhaust force',()=>{
 const p=A.anchoredPolar(D.aircraft.p51b,.1,.78),r=A.sample(D.aircraft.p51b,2200,171,'67inHg',p,9335);
 assert.ok(r.exhaustLbf>0);
 near(r.propulsiveHp-r.requiredHp,r.excessHp,1e-9);
});
test('No hypothetical exhaust solves both boost climb measurements',()=>{
 const a=R.crossCheck.scenarioForceToClose67Lbf.coefficientLbfPerBhp;
 const b=R.crossCheck.scenarioForceToClose75Lbf.coefficientLbfPerBhp;
 assert.ok(a>b+.03);
});
test('Every tested positive exhaust correction worsens P-47 holdout MAE',()=>{
 const baseMae=R.scenarios[0].p47SpeedHoldouts.maeMph;
 for(const r of R.scenarios.slice(1))assert.ok(r.p47SpeedHoldouts.maeMph>baseMae);
});
test('All hypothetical weight reductions improve climb but do not erase the gap',()=>{
 for(const r of R.weightSensitivity.slice(1)){assert.ok(r.climb67Fpm>3401);assert.ok(r.climb67Fpm<3820);}
});
console.log(`PASS ${tests}/${tests} v1.9 installed-power tests`);
