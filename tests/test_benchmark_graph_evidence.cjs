'use strict';

const assert=require('node:assert/strict');
const E=require('../src/benchmark-graph-evidence.js');
const V46=require('../validation/diagnostics/operating_benchmark_v46.cjs');
const P=require('../src/turn-performance.js');
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

const data=V46.browserData();
function at(id,eas,kind,alt=10000,mode='combat'){
 const settings={mode,fuelFraction:.5,extension:true};
 const spec=data.specification.aircraft[id];
 const mass=B.load(spec,data.specification.policy,settings).weightLb;
 const flight=B.evaluate(M,T,L,data.models[id],spec,settings,alt,eas,mass,undefined,kind==='climb');
 return E.describe(flight,kind,data.graphEvidence[id],P.state(flight)?.limiting);
}
const spit='spitfire_lfix_bs543';
assert.equal(at(spit,170,'climb').covered,false);
assert.match(at(spit,170,'climb').label,/boost-derived power/);
assert.equal(at(spit,170,'climb').reference.measured,true);
assert.equal(at(spit,155,'climb').covered,false);
assert.equal(at(spit,185,'climb').covered,false);
assert.equal(at(spit,170,'climb',40000).covered,false);
assert.equal(at(spit,170,'climb',10000,'normal').covered,false);
assert.equal(at(spit,170,'turn').covered,false);
assert.equal(at('p47b',170,'climb').source.label,'Primary report');
assert.equal(at('p51b',110,'turn').covered,false);
assert.equal(at('p51b',155,'turn').covered,true);
assert.equal(at('p51b',155,'turn').source.label,'Primary lift report');
assert.equal(at('p51b',250,'turn').label,'Calculated · table-supported power');
assert.equal(at('p51b',250,'acceleration').covered,true);
assert.equal(at('p51b',250,'acceleration',10000,'normal').covered,false);
assert.equal(at(spit,250,'acceleration').covered,false);
assert.equal(E.sourceBacked({grade:'primary',method:'table'}),true);
assert.equal(E.sourceBacked({grade:'primary',method:'boost-to-bhp'}),false);
assert.equal(E.sourceBacked({grade:'secondary',method:'mean',independentSources:2}),true);
assert.equal(E.sourceBacked({grade:'secondary',method:'original',independentSources:1}),false);
assert.equal(at('f4u4',250,'turn').covered,true);
assert.equal(at('f4u4',250,'turn',29000).covered,false);

const spitReference=at(spit,170,'climb').reference;
assert.equal(spitReference.observed,4280);
assert.equal(spitReference.tasMph,199);
assert.equal(spitReference.weightLb,7485);
assert.ok(Math.abs(spitReference.bounds[0]-4508.3694247038175)<1e-6);
assert.ok(Math.abs(spitReference.bounds[1]-4558.3694247038175)<1e-6);
assert.equal(at(spit,170,'climb',10000,'normal').reference,null);
assert.equal(at(spit,155,'climb').reference,null);
assert.equal(at(spit,170,'climb',40000).reference,null);
const p47Reference=at('p47b',170,'climb').reference;
assert.equal(p47Reference.observed,2465);
assert.equal(p47Reference.weightLb,12565);
assert.ok(Math.abs(p47Reference.bounds[1]-p47Reference.bounds[0]-50)<1e-9);
for(const id of Object.keys(data.models)){
 assert.match(data.graphEvidence[id].related.url,/WW2_FIGHTER_CALCULATED_EVIDENCE/);
}
