import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const m=require('../src/physics.js');
const data=JSON.parse(fs.readFileSync(new URL('../aircraft/cases.json',import.meta.url)));
const close=(actual,expected,tol=1e-8)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} versus ${expected}`);

// Synthetic calibration tests check the conversion machinery, NOT historical
// claims about P-47 or any other aircraft's position error.
const calibration={source:'synthetic-test-only',configuration:'test pitot/static state',points:[
 {iasMph:170,casMph:175},{iasMph:220,casMph:223},{iasMph:300,casMph:298}
]};
close(m.casFromIAS(195,calibration),199);
assert.equal(m.casFromIAS(115,calibration),null,'no extension of P-47 high-speed chart down to 115-mph stall');
assert.equal(m.resolveAirspeed(115,'IAS',8000,calibration).status,'outside-calibration-range');
assert.throws(()=>m.resolveAirspeed(195,'IAS',8000),/calibration/);
const fromIas=m.resolveAirspeed(195,'IAS',8000,calibration);
const fromCas=m.resolveAirspeed(199,'CAS',8000);
close(fromIas.tas,fromCas.tas);
close(fromIas.eas,fromCas.eas);
close(fromIas.cas,199);
assert.equal(fromIas.source,'synthetic-test-only');
for(const kind of ['TAS','CAS','EAS']){
 const input=kind==='TAS'?fromIas.tas:kind==='CAS'?fromIas.cas:fromIas.eas;
 close(m.resolveAirspeed(input,kind,8000).tas,fromIas.tas);
}
assert.throws(()=>m.casFromIAS(190,{...calibration,points:[{iasMph:170,casMph:180},{iasMph:220,casMph:175}]}),/increasing/);

// Adding stores changes the weight used by climb drag AND the energy-to-rate
// conversion. Previously climbPrediction silently dropped that mass.
const ac=data.aircraft.p47b,p=ac.observedClimb[0];
const clean=m.climbPrediction(ac,p);
const loaded=m.climbPrediction(ac,p,{storesWeightLb:500});
assert.equal(clean.status,'estimated');
assert.equal(loaded.status,'estimated');
assert.ok(loaded.predictedFpm<clean.predictedFpm,'loaded airplane must have lower climb prediction');
const direct=m.evaluated(ac,p.altFt,p.tasMph,{storesWeightLb:500});
close(loaded.dynamicPressure,direct.drag.q);
assert.ok(loaded.extraDragLbf>=0);
console.log('PASS clean v0.8: sourced IAS/CAS conversion, no extrapolation/double correction, stores-mass climb consistency');
