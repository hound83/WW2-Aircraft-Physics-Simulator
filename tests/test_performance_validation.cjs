'use strict';
const assert=require('node:assert/strict'),G=require('../validation/lib/performance_gate.cjs'),M=require('../src/physics.js'),D=require('../aircraft/cases.json');
// Deliberately synthetic, independently bounded cases test the scoring rules.
const o={id:'synthetic-A',aircraftId:'synthetic-A',variant:'test',specimen:'test-A',metric:'level-speed',unit:'mph-TAS',altFt:5000,value:300,rating:'test',gear:'low',engineRpm:3000,atmosphere:'standard',configuration:{gearState:'up',flaps:'up',cooling:'closed',stores:'none'},weight:{valueLb:7000,kind:'normalized',source:'SYNTHETIC'},airspeed:{kind:'TAS',valueMph:300,verified:true,source:'SYNTHETIC'},source:{kind:'primary-transcription',reference:'SYNTHETIC',dependencyGroup:'synthetic-A'},fitRole:'non-anchor-checkpoint',independent:true,errorBound:{validated:true,source:'SYNTHETIC BOUND',unit:'mph-TAS',upper:1}};
const p={...structuredClone(o),value:301,weightLb:7000};
const a=G.assess(o,p);assert.equal(a.validationEligible,true);assert.deepEqual(a.matchedErrors,{signed:1,absolute:1,percent:1/3});
for(const changes of [{unit:'mph-IAS'},{airspeed:{...o.airspeed,kind:'IAS'}},{airspeed:{...o.airspeed,kind:'CAS'}},{airspeed:{...o.airspeed,kind:'EAS'}},{airspeed:{...o.airspeed,verified:false}},{specimen:'unspecified'},{specimen:'other'},{variant:'other'},{altFt:6000},{weight:{...o.weight,valueLb:7200}},{weight:{...o.weight,kind:'takeoff'}},{weight:{...o.weight,kind:'nominal-test'}},{engineRpm:2995},{rating:'other'},{gear:'high'},{configuration:{...o.configuration,cooling:'open'}},{configuration:{...o.configuration,stores:'wing-racks'}},{atmosphere:'unknown'},{source:{...o.source,kind:'simulation'}}]){
 const bad=G.assess({...o,...changes},p);assert.equal(bad.validationEligible,false);assert.equal(bad.matchedErrors.signed,null);assert.equal(bad.diagnosticErrors.signed,1,'excluded diagnostics stay visible');
}
assert.equal(G.assess({...o,fitRole:'speed-anchor'},p).validationEligible,false);
assert.equal(G.assess({...o,independent:false},p).validationEligible,false);
assert.equal(G.aggregate([G.assess({...o,weight:{...o.weight,valueLb:null}},p)],'matched').mae,null);
assert.equal(G.aggregate([a],'validation').mae,1);assert.throws(()=>G.aggregate([a],'typo'));
const climb={...o,metric:'climb-rate',unit:'ft/min',value:3000,airspeed:{...o.airspeed,valueMph:175}};
const cp={...p,metric:'climb-rate',unit:'ft/min',value:2900,airspeed:{kind:'TAS',valueMph:175},speedSelection:'reported'};
assert.equal(G.assess(climb,cp).matchedErrors.signed,-100);
assert.equal(G.assess(climb,{...cp,speedSelection:'optimized'}).conditionStatus,'excluded');
assert.equal(G.assess(climb,{...cp,airspeed:{kind:'TAS',valueMph:180}}).conditionStatus,'excluded');
assert.equal(G.assess({...climb,airspeed:{...climb.airspeed,valueMph:null}},cp).matchedErrors.signed,null);
assert.equal(G.errors(1,0).percent,null);assert.equal(G.errors(null,4).absolute,null);
const bo={...structuredClone(o),id:'synthetic-B',aircraftId:'synthetic-B',specimen:'test-B',value:290,source:{...o.source,dependencyGroup:'synthetic-B'}};
const b=G.assess(bo,{...p,aircraftId:'synthetic-B',specimen:'test-B',value:291});
const pair=G.pair(a,b,{comparisonEstablished:true});assert.equal(pair.referenceGap,10);assert.equal(pair.requiredCombinedErrorBound,2);assert.equal(pair.validatedCombinedErrorBound,2);assert.equal(pair.absoluteDifferentialResidual,0);assert.equal(pair.status,'PASS');
assert.equal(G.pair(a,b).status,'UNRESOLVED');
assert.equal(G.pair(a,{...b,errorBound:{validated:true,unit:'mph-TAS',upper:1}},{comparisonEstablished:true}).status,'UNRESOLVED','a verification flag alone is not a bound source');
assert.equal(G.pair(a,{...b,errorBound:null},{comparisonEstablished:true}).validatedCombinedErrorBound,null);
assert.equal(G.pair(a,{...b,errorBound:{validated:true,source:'SYNTHETIC BOUND',unit:'ft/min',upper:1}},{comparisonEstablished:true}).status,'UNRESOLVED');
assert.equal(G.pair(a,{...b,errorBound:{validated:true,source:'SYNTHETIC BOUND',unit:'mph-TAS',upper:2}},{comparisonEstablished:true}).status,'FAIL');
assert.equal(G.pair(a,{...b,source:a.source},{comparisonEstablished:true}).status,'UNRESOLVED','related reports do not create independent tests');
assert.equal(G.pair(a,{...b,value:300},{comparisonEstablished:true}).status,'UNRESOLVED');
assert.equal(G.pair(a,{...b,altFt:6000},{comparisonEstablished:true}).absoluteDifferentialResidual,null);
const violated=G.pair({...a,prediction:{...a.prediction,value:310}},b,{comparisonEstablished:true});assert.equal(violated.status,'FAIL');assert.ok(violated.reasons.includes('observed-differential-residual-exceeds-claimed-bound'));
assert.equal(G.anchorRole(D.aircraft.bf109f4,D.aircraft.bf109f4.observedSpeed[1]),'non-anchor-checkpoint','different rating at same altitude is not the speed anchor');
assert.equal(G.anchorRole(D.aircraft.spitfire_lfix_bs543,D.aircraft.spitfire_lfix_bs543.observedSpeed[0]),'speed-anchor');
const r=require('../validation/diagnostics/performance_validation.cjs').run();
assert.equal(r.rows.length,69);assert.equal(new Set(r.rows.map(x=>x.id)).size,69);assert.equal(r.rows.filter(x=>x.fitRole==='speed-anchor').length,4);assert.equal(r.pairwise.length,12);
assert.equal(r.rows.filter(x=>x.aircraftId==='p51b'&&x.metric==='climb-rate').length,6,'related memos retained without counting duplicate active summary');
for(const x of r.rows){assert.equal(x.validationEligible,false);assert.equal(x.matchedErrors.signed,null);}
for(const x of r.pairwise){assert.equal(x.status,'UNRESOLVED');for(const c of x.candidates){assert.equal(c.absoluteDifferentialResidual,null);assert.equal(c.validatedCombinedErrorBound,null);}}
for(const x of r.rows.filter(x=>x.metric==='level-speed'))assert.equal(x.prediction.value,M.maxSpeed(D.aircraft[x.aircraftId],x.altFt,{profile:'C',e:.78,rating:x.rating,gear:x.gear}),'report uses the existing shared solver without refitting checkpoints');
const mustang=r.rows.filter(x=>x.reportId==='wright-1944-05-20');for(const x of mustang){assert.ok(x.diagnosticErrors.signed < -390);assert.ok(x.exclusions.includes('climb-speed-not-matched'));assert.ok(x.exclusions.includes('point-weight-not-established'));}
assert.ok(Math.abs(r.p47Conditional.rows[0].signed)<1e-6);assert.equal(r.p47Conditional.rows[0].role,'aggregate-loss-fit');
assert.equal(r.controlledP47[0].at200.requiredHp,r.controlledP47[1].at200.requiredHp);assert.ok(r.controlledP47[1].maxSpeedMph>r.controlledP47[0].maxSpeedMph);
console.log('PASS performance conditions/units/weights/cooling/rating, anchor leakage, source dependence, uncertainty bounds, 69-case shared-solver parity and preserved failures');
