'use strict';
const assert=require('node:assert/strict'),M=require('../src/physics.js'),D=require('../aircraft/cases.json');
const R=require('../validation/diagnostics/source_chart_climb.cjs'),S=require('../validation/diagnostics/p51_climb_states.cjs');
const ac=D.aircraft.p51b,base=R.options(),before=JSON.stringify(ac);
const rejected=(opts,alt=2200,aircraft=ac)=>assert.equal(M.sourceChartClimb(aircraft,alt,opts).status,'blocked-source-chart');
for(const selection of ['lower','midpoint','upper']){
 const opts={...base,selection},r=M.sourceChartClimb(ac,2200,opts),point=base.chart.nodes.find(n=>n.altFt===2200&&n.rating===base.rating);
 const bhp=selection==='lower'?point.lowerBhp:selection==='upper'?point.upperBhp:(point.lowerBhp+point.upperBhp)/2;
 assert.equal(r.status,'modeled-peak');assert.equal(r.shaftHp,bhp);assert.equal(r.sourceChart.historicallyValidated,false);
 const prior=S.chartPrediction(2200,base.rating,bhp,9335,'C',base.polar);
 assert.ok(Math.abs(r.climbFpm-prior.climbFpm)<1e-8,'same source power must use the existing shared solver');
}
for(const change of [{polar:null},{weight:null},{weight:{...base.weight,kind:'actual'}},{selection:'invented'},{engineModel:'ram-critical'},{engineCondition:{}},{refit:false},{climbMapInHg:75},{gear:'high'}])rejected({...base,...change});
rejected({...base,polar:{}});rejected({...base,profile:'not-a-profile'});
rejected({...base,speedGrid:{minTasMph:100,maxTasMph:290,stepMph:1,weightLb:5000}});
const unknownAc={...ac,stallIdentity:{...ac.stallIdentity,specimen:'unknown'}};
rejected({...base,chart:{...base.chart,identity:{...unknownAc.stallIdentity}}},2200,unknownAc);
rejected(base,6000);rejected(base,36090);rejected(base,NaN);
rejected({...base,configuration:{...base.configuration,cooling:'closed'}});
for(const k of ['aircraftId','variant','specimen'])rejected({...base,chart:{...base.chart,identity:{...base.chart.identity,[k]:'other'}}});
for(const change of [{purpose:'level-flight'},{powerKind:'measured-torque'},{source:''}])rejected({...base,chart:{...base.chart,...change}});
for(const change of [{engineRpm:2700},{lowerBhp:-1},{upperBhp:1},{sourceLocation:''}]){
 const chart=structuredClone(base.chart);Object.assign(chart.nodes.find(n=>n.altFt===2200&&n.rating===base.rating),change);rejected({...base,chart});
}
const duplicate=structuredClone(base.chart);duplicate.nodes.push({...duplicate.nodes.find(n=>n.altFt===2200&&n.rating===base.rating)});rejected({...base,chart:duplicate});
rejected({...base,speedGrid:{minTasMph:100,maxTasMph:290,stepMph:.0001}});
const r=R.run();assert.equal(r.rows.length,10);assert.ok(r.unsupportedRequests.every(x=>x.result.status==='blocked-source-chart'));
for(const row of r.rows){
 assert.ok(row.samples.every(s=>s.status==='modeled-peak'));
 assert.ok(row.samples[0].climbFpm<row.samples[1].climbFpm&&row.samples[1].climbFpm<row.samples[2].climbFpm);
 if(row.altFt>=8000)assert.equal(row.proxy.climbFpm,null);
}
assert.ok(Math.abs(r.levelSpeedDefaultMph-361.5)<.001);
assert.equal(JSON.stringify(ac),before,'no source-chart request may mutate default input nodes');
console.log('PASS exact-node source gate, identity/config/RPM/weight/polar isolation, no interpolation and shared-solver parity');
