const assert=require('node:assert/strict');
const m=require('../src/physics.js'),d=require('../aircraft/cases.json'),x=require('../validation/diagnostics/p47_control_v12.cjs');
const close=(a,b,tol)=>assert.ok(Math.abs(a-b)<tol,`${a} vs ${b}`);
const result=x.run();
assert.equal(result.scenarios.length,4);
for(const name of ['B_anchor','Greg_D']){
 const lo=x.point(name,2000,200),hi=x.point(name,2600,200);
 close(lo.dragHp,hi.dragHp,1e-9);
 close(lo.parasiteHp,hi.parasiteHp,1e-9);
 close(lo.inducedHp,hi.inducedHp,1e-9);
 close(lo.eta,hi.eta,1e-12);
 assert.ok(hi.availableHp>lo.availableHp&&hi.nSust>lo.nSust);
 assert.ok(x.maxSpeed(name,2600)>x.maxSpeed(name,2000));
}
for(const hp of [2000,2600]){
 close(x.maxSpeed('Greg_D',hp),m.gregP47MaxSpeed(d.greg.p47d28,hp),.01);
}
const ac=d.aircraft.p47b,polar={...x.polars.Greg_D};
const casePoint=m.evaluated(ac,5000,300,{polar});
assert.equal(casePoint.status,'modelled');
close(casePoint.cleanCd0,polar.cd0,1e-12);
close(casePoint.oswald,polar.e,1e-12);
assert.equal(casePoint.dragPolarSource,polar.source);
assert.equal(m.evaluated(ac,5000,300,{polar,e:.78}).status,'invalid-polar-input');
assert.equal(m.evaluated(ac,5000,300,{polar:{cd0:.02,e:.78}}).status,'invalid-polar-input');
const cl=m.climbPrediction(ac,ac.observedClimb[0],{polar});
assert.equal(cl.status,'estimated','explicit polar usable across climb paths');
assert.ok(cl.predictedFpm<m.climbPrediction(ac,ac.observedClimb[0]).predictedFpm,
 'higher direct transferred CD0 reduces estimated climb');
const held=result.historicalP47BCheck.heldOutMeanAbsErrorMph;
assert.ok(held.B_anchor<held.Greg_D_directTransfer);
assert.equal(result.historicalP47BCheck.observations.filter(p=>p.calibratedAtThisAltitude).length,1);
console.log('PASS v1.2: shared P47 aerodynamics, frozen prop curve, 2000/2600 hp isolation, Greg exact regression and P47B held-out challenge');
