'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const G = require('../../src/benchmark-graph-evidence.js');
const Turn = require('../../src/turn-performance.js');
const Stall = require('../../src/provisional-stall-loader.js');
const Corsair = require('./f4u4.cjs');
const L = require('../../references/p51-turn-lift-tn1044.json');
const pack = require('../../references/analysis/fighter-sim-inputs-v1.json');
const frozen = require('../../references/analysis/v411-continuous-stall-before.json');
const {browserData} = require('./shared_flight_climb.cjs');
const {scorecard,caseSummary} = require('./operating_benchmark_v410.cjs');

const settings = {mode:'combat',fuelFraction:.5};
const round = value => Number.isFinite(value) ? +value.toFixed(6) : null;

function evaluate(data,id,altFt,easMph,weightLb) {
 const {models,specification:S} = data;
 const spec = S.aircraft[id];
 const weight = weightLb ?? B.load(spec,S.policy,settings).weightLb;
 return B.evaluate(M,T,L,models[id],spec,settings,altFt,easMph,weight);
}

function metrics(data,{id,altFt,easMph,weightLb}) {
 const r = evaluate(data,id,altFt,easMph,weightLb);
 return {id,altFt,easMph,weightLb,stallEasMph:round(r.stallEasMph),
  liftG:round(r.limits?.nLift),sustainedG:round(r.limits?.nSust),
  sustainedDegSec:round(r.limits?.sustDegSec)};
}

function sourceChecks(data,refs) {
 const lightning=refs.p38g[0];
 const observed=Stall.referenceEas(M,lightning);
 const modeled=evaluate(data,'p38g',lightning.altFt,170,lightning.weightLb).stallEasMph;
 const corsair=refs.f4u4;
 const navy=corsair.filter(row=>row.altFt===null).map(row=>{
  const replay=Corsair.stallAnchors.find(x=>x.power===row.power);
  return {...row,role:'Existing coefficient anchor. Sea-level conversion assumption.',
   modeledEasMph:round(replay.easMph),clMax:round(replay.clMax)};
 });
 const naca=corsair.filter(row=>row.altFt!==null).map(row=>{
  const clMax=Corsair.stallAnchors.find(x=>x.power===(row.power==='glide'?'off':'on')).clMax;
  const observed=Stall.referenceEas(M,row);
  const modeled=Math.sqrt(2*row.weightLb*4.4482216153/(1.225*data.models.f4u4.ac.wingAreaM2*clMax))/.44704;
  return {...row,role:'Separate NACA report transfer check at approximate loading',
   observedEasMph:round(observed),modeledEasMph:round(modeled),errorEasMph:round(modeled-observed)};
 });
 return {lightning:{...lightning,originalIasMph:98,observedEasMph:round(observed),
   modeledEasMph:round(modeled),errorEasMph:round(modeled-observed)},corsair:{navy,naca}};
}

function run(catalog) {
 const data=browserData(),refs=Stall.referencesFor(pack,catalog);
 const current=scorecard(data);
 const sweep=[90,100,110,130,170,200,250,300].map(easMph=>{
  const f=evaluate(data,'p51b',8000,easMph,9270),limit=Turn.state(f)?.limiting;
  const evidence=G.describe(f,'turn',data.graphEvidence.p51b,limit);
  return {easMph,stallStatus:f.status,liftG:round(f.limits?.nLift),sustainedG:round(f.limits?.nSust),
   covered:evidence.covered,provisionalLift:evidence.provisionalLift,limiting:limit??null};
 });
 return {schema:'ww2-continuous-stall/v1',version:require('../../package.json').version,inputPack:pack.version,
  baselineCommit:frozen.commit,aircraft:current.map((row,i)=>({id:row.id,
   before:frozen.scorecard[i],after:row,delta:caseSummary(frozen.scorecard[i],row),reference:refs[row.id][0]})),
  fixed:frozen.fixed.map(before=>({before,after:metrics(data,before)})),
  edges:frozen.edges.map(before=>({before,after:metrics(data,before)})),
  sweep,checks:sourceChecks(data,refs),
  interpretation:'Steady lift limit, including the applicable Mach correction. Historical stall airspeed and powered sustained turn retain their separate evidence limits.'};
}

module.exports={evaluate,run};
