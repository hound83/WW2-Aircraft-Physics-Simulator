'use strict';

const assert=require('node:assert/strict');
const M=require('../src/physics.js');
const T=require('../src/turn-lift.js');
const G=require('../src/benchmark-graph-evidence.js');
const Turn=require('../src/turn-performance.js');
const Stall=require('../src/provisional-stall-loader.js');
const source=require('../references/p51-turn-lift-tn1044.json');
const pack=require('../references/analysis/fighter-sim-inputs-v1.json');
const {buildCatalog}=require('../scripts/research-layer.cjs');
const {browserData}=require('../validation/diagnostics/shared_flight_climb.cjs');
const {evaluate}=require('../validation/diagnostics/continuous_stall.cjs');
const near=(actual,expected,tolerance=1e-7)=>
 assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance,actual+' vs '+expected);

const catalog=buildCatalog();
const refs=Stall.referencesFor(pack,catalog);
assert.equal(Object.keys(refs).length,7);
assert.ok(Object.values(refs).every(rows=>rows.length>0));
assert.equal(Stall.referenceEas(M,refs.p51b[0]),null);
assert.equal(refs.p51b[0].speed.value,86);
assert.deepEqual(refs.f4u4.map(row=>[row.speed.value,row.speed.unit,row.power]),[
 [89.4,'kt','off'],[84.6,'kt','on'],[105,'mph','glide'],[95,'mph','on']
]);
assert.equal(Stall.referenceEas(M,refs.f4u4[0]),null);
assert.ok(Stall.referenceEas(M,refs.f4u4[2])>Stall.referenceEas(M,refs.f4u4[3]));
near(Stall.referenceEas(M,refs.p38g[0]),111.8637,.0001);
assert.match(refs.p38g[0].aircraft,/42-12690/);

const data=browserData(),at=(alt,speed,weight=9270)=>evaluate(data,'p51b',alt,speed,weight);
for(const edge of source.altitudeWindowFt){
 const a=at(edge-1,170),b=at(edge,170),c=at(edge+1,170);
 near(a.stallEasMph,b.stallEasMph,.001);
 near(c.stallEasMph,b.stallEasMph,.001);
 near(a.limits.nLift,b.limits.nLift,.005);
 near(c.limits.nLift,b.limits.nLift,.005);
}
const {ac}=data.models.p51b,alt=8000,weight=9270;
const tasAtMach=mach=>mach*M.isa(alt).a/.44704;
const options={profile:'P',weightLb:weight};
const stallAtMach=mach=>T.optionsFor(M,ac,source,alt,tasAtMach(mach),options);
for(const edge of [source.nodes[0][0],source.nodes.at(-1)[0]]){
 const lift=mach=>stallAtMach(mach).maneuverClMax??ac.clMaxAssumed;
 near(lift(edge-1e-5),lift(edge+1e-5),.00001);
}
const stallMachPerSqrtLb=M.airspeeds(M.tasFrom(at(alt,170,weight).stallEasMph,'EAS',alt),alt).mach/Math.sqrt(weight);
for(const edge of source.cleanStallMachWindow){
 const atMass=(mach)=>at(alt,170,(mach/stallMachPerSqrtLb)**2);
 near(atMass(edge-1e-5).clMax,atMass(edge+1e-5).clMax,.00001);
}
near(at(alt,170,10000).stallEasMph/at(alt,170,weight).stallEasMph,Math.sqrt(10000/weight));
const speeds=[90,100,110,130,170,200,250,300];
const sweep=order=>order.map(speed=>{
 const r=at(alt,speed);
 near(r.limits.nLift,(r.air.eas/r.stallEasMph)**2*(r.limits.maneuverClMax??r.clMax)/r.clMax);
 return [r.status,r.limits.nLift,r.limits.nSust];
});
const ascending=sweep(speeds);
assert.deepEqual(sweep(speeds.slice().reverse()).reverse(),ascending);
assert.ok(ascending.every((row,i)=>i===0||row[1]>ascending[i-1][1]));
assert.equal(ascending[0][0],'below-provisional-stall');
assert.equal(ascending[0][2],null);
assert.equal(ascending[2][0],'modelled');

const record=data.graphEvidence.p51b;
const segment=(eas,kind)=>{
 const r=at(alt,eas);
 const ev=G.describe(r,kind,record,Turn.state(r)?.limiting);
 return G.sample(eas,1,ev.covered);
};
const segments=G.lineSegments([110,170,200,220].map(eas=>segment(eas,'turn')));
assert.deepEqual(segments.map(s=>s.solid),[false,true]);
assert.equal(segments[0].points.at(-1),segments[1].points[0]);
assert.equal(segment(104,'acceleration').covered,false);
assert.equal(segment(200,'acceleration').covered,true);
console.log('Continuous stall: smooth altitude, Mach and weight edges, separate CAS/IAS evidence, and lift-limited segment styling.');
