'use strict';
const M=require('../../src/physics.js'), B=require('../../src/operating-benchmark.js');
const T=require('../../src/turn-lift.js'), L=require('../../references/p51-turn-lift-tn1044.json');
const Maneuver=require('../../src/benchmark-maneuver.js');
const archive=require('./historical_flight_comparison.cjs');
const records=require('../../references/analysis/combined-flight-comparison-sources.json');
const finn=require('../../references/analysis/powered-turn-evidence-2026-11-13.json').finnish;
const {E3,VA}=require('../../scripts/early-war-batch.cjs');
const {G2,D}=require('../../scripts/aircraft-batch.cjs');
function turnCase(data,id,altFt,entry,unitFactor,weightLb,mode) {
  const spec=data.specification.aircraft[id],policy=data.specification.policy,settings={mode,fuelFraction:.5};
  const loading=B.load(spec,policy,settings);
  const testSpec={...spec,referenceWeightLb:spec.referenceWeightLb+weightLb-loading.weightLb};
  const inputEas=M.airspeeds(M.tasFrom(entry/unitFactor,'CAS',altFt),altFt).eas;
  const replay=Maneuver.replay(M,T,L,data.models[id],testSpec,policy,settings,{altFt,entryEasMph:inputEas,commandG:4});
  const display=eas=>Number.isFinite(eas)?M.airspeeds(M.tasFrom(eas,'EAS',altFt),altFt).cas*unitFactor:null;
  return {weightLb,mode,altFt,entry,turnSeconds:replay.turnSeconds,exit:display(replay.exitEasMph),recovery:replay.recoverySeconds,
    trace:replay.trace.filter((p,i)=>i%4===0||i===replay.trace.length-1).map(p=>[p.seconds,display(p.easMph)])};
}
function build(data,catalog,fleet,intake,acceleration) {
  const report=archive.build(catalog,fleet,intake,acceleration);
  const g6=require('./g6_high_altitude_climb.cjs').run(data);
  const stage=report.dynamic, mt=stage.mt215.find(t=>t.headingDeg===180);
  const us=stage.restoredTrials.find(r=>r.serial==='45-11586');
  return {early:report.early,later:report.later,conditions:{...report.researchConditions,
    e3:'WNr 1304 / AE479, 5,600 lb comparison weight. Open and closed radiators have distinct measured pressures and drag anchors.',
    va:'X.4922, 6,450 lb, de Havilland, nominal +9 psi. 3,000 rpm level, climb mostly 2,850 rpm.'},
    ids:{e3:E3,va:VA,g6:'bf109g6trop_16476',f:'spitfire_fix_bf274',lf:'spitfire_lfix_bs543',hf:'spitfire_hfix_bs551'},
    modelMinusSource:report.modelMinusSource,crossover:intake.crossover,
    factory:{sources:g6.sources,scenarios:Object.fromEntries(['baseline','pressureOnly','pressureAlignedToCommand']
      .map(k=>[k,g6.scenarios[k].bands.filter(r=>(r.fromKm===0&&[8,10].includes(r.toKm))||(r.fromKm===8&&r.toKm===10))]))},
    maneuvers:[{id:G2,title:'MT-215 · Finnish flight trial',unit:'km/h IAS',entry:mt.startKmh,exit:mt.exitKmh,
      turnSeconds:mt.turnSeconds,secondary:records.mt215.firstAccount,sources:[records.mt215.firstAccount,records.mt215.secondAccount],
      note:records.mt215.role,straight:stage.accelerationSegments,estimate:mt.separateStraightSegmentEstimateSeconds,
      model:turnCase(data,G2,1000/.3048,mt.startKmh,1.609344,finn.replay.nominal.massKg/.45359237,'combat')},
    {id:D,title:'Restored Mustang · 45-11586',unit:'knots indicated (proxy)',entry:220,exit:null,turnSeconds:us.turn180Seconds,
      sources:[records.restored.paper,records.restored.printedFig8],note:records.restored.conditions,figure:stage.restoredMustang,
      straightTrace:acceleration.nominal.trace.map(p=>[p.seconds,p.value]),
      model:turnCase(data,D,10000,220,1/1.150779448,us.takeoffLb,'normal')}]};
}
module.exports={build};
