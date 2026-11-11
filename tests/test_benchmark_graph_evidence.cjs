'use strict';

const assert=require('node:assert/strict');
const E=require('../src/benchmark-graph-evidence.js');
const V45=require('../validation/diagnostics/operating_benchmark_v45.cjs');
const M=require('../src/physics.js');
const B=require('../src/operating-benchmark.js');
const T=require('../src/turn-lift.js');
const L=require('../references/p51-turn-lift-tn1044.json');

const countries=['germany','us','uk','ussr'];
assert.equal(new Set(countries.map(country=>E.colors(country,country).a)).size,countries.length);
for(const country of countries){
 const pair=E.colors(country,country);
 assert.notEqual(pair.a,pair.b);
 assert.equal(E.colors('other',country).b,pair.a);
}

const low=E.sample(100,3,false,[2,4]),first=E.sample(125,12,true,[11,15]);
const last=E.sample(150,16.8,true,[14,18]),high=E.sample(175,13,false,[12,14]);
const gap=E.sample(200,null,false,[18,14]),tail=E.sample(225,7,false,null),end=E.sample(250,3,false,null);
const segments=E.lineSegments([low,first,last,high,gap,tail,end]);
assert.deepEqual(segments.map(s=>s.solid),[false,true,false,false]);
assert.equal(segments[0].points.at(-1),segments[1].points[0]);
assert.equal(segments[1].points.at(-1),segments[2].points[0]);
assert.deepEqual(segments[3].points,[tail,end]);
assert.deepEqual(E.bands([low,first,gap,last,high]),[[low,first],[last,high]]);
assert.equal(last.rate,16.8);
assert.equal(E.sample(150,null,false,[14,18]).rate,16);
assert.equal(E.sample(150,19.4,false,[14,18]).outsideRange,true);
assert.equal(gap.rate,null);
assert.equal(gap.range,null);

const data=V45.browserData();
function at(id,eas,kind,alt=10000,mode='combat'){
 const settings={mode,fuelFraction:.5,extension:true};
 const spec=data.specification.aircraft[id];
 const mass=B.load(spec,data.specification.policy,settings).weightLb;
 const flight=B.evaluate(M,T,L,data.models[id],spec,settings,alt,eas,mass,undefined,kind==='climb');
 return E.describe(flight,kind,data.graphEvidence[id]);
}
const spit='spitfire_lfix_bs543';
assert.equal(at(spit,170,'climb').covered,true);
assert.equal(at(spit,155,'climb').covered,false);
assert.equal(at(spit,185,'climb').covered,false);
assert.equal(at(spit,170,'climb',40000).covered,false);
assert.equal(at(spit,170,'climb',10000,'normal').covered,false);
assert.equal(at(spit,170,'turn').covered,false);
assert.equal(at('p47b',170,'climb').source.label,'Primary report');
assert.equal(at('p51b',155,'turn').covered,false);
assert.equal(at('p51b',155,'turn').source.label,'Primary lift report');
for(const id of Object.keys(data.models)){
 assert.match(data.graphEvidence[id].related.url,/WW2_FIGHTER_CALCULATED_EVIDENCE/);
}
