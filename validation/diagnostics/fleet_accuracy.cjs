'use strict';

const pack = require('../../references/research/fleet_comparative_flight_data_2026-11-27.json');
const {levelSpeed, sourceChecks} = require('./aircraft_intake.cjs');
const {replayEN524} = require('./fleet_evidence.cjs');
const {speedInterval,speedWindow} = require('../../src/fleet-comparison.js');
const {dataChecks} = require('./early_war_replay.cjs');
const fleet = require('./fleet_validation.cjs');
const accel = require('./level_acceleration.cjs');
const turns = require('./powered_turn.cjs');
const steadyTurn = require('./fleet_steady_turn.cjs');
const round = value => Number.isFinite(value) ? Number(value.toFixed(3)) : null;
const mean = values => values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;
const reserved = new Set(['p38g','p47b','spitfire_hfix_bs551']);
const byId = new Map(pack.series.map(s => [s.id,s]));
const sourceFor = series => pack.sources.find(source => source.id === series.source_id).url;

function alternate(data, factor) {
  const models = {};
  for (const [id, model] of Object.entries(data.models)) {
    const p = model.ac.propGeometry;
    models[id] = {...model, ac:{...model.ac, propGeometry:{...p,
      momentumModel:{...p.momentumModel, inducedPowerFactor:factor}}}};
  }
  return {...data, models};
}

function intervalReadings() {
  return pack.series.filter(s=>s.quantity==='level_acceleration_trace').map(s=>{
    const trace = s.rows.map(([seconds,value])=>({seconds,value}));
    const allowance = s.conditions.reading_allowance_kt;
    const windows = [[160,200],[200,210],[200,230]].map(([low,high])=>{
      const w=speedWindow(trace,low,high,allowance);
      return {low,high,seconds:round(w.seconds),lower:round(w.lower),upper:round(w.upper)};
    });
    return {aircraft:s.aircraft, series:s.id, samples:trace.length, trace, allowance, windows,
      source:sourceFor(s), figure:s.conditions.figure_url, applicability:s.conditions.test_aircraft_context};
  });
}

function sameSerialReferences(data) {
  const va=byId.get('va-summary-x-4922'), lf=byId.get('lf-summary-bs-543');
  const [vaWeight,vaMph,vaFt] = va.rows[0];
  const [lfWeight,msFt,msMph,fsFt,fsMph] = lf.rows[0];
  return [[va,vaWeight,vaFt,vaMph,'single'],[lf,lfWeight,msFt,msMph,'low'],[lf,lfWeight,fsFt,fsMph,'high']].map(([s,weightLb,altFt,observed,gear])=>{
    const id=s.conditions.profile_ids[0], spec=data.specification.aircraft[id];
    const predicted=levelSpeed(data.models[id],spec,{mode:'combat',rpm:3000,scaleForRpm:false,weightLb,altFt,gear});
    return {id,series:s.id,source:sourceFor(s),weightLb,altFt,gear,observed,predicted:round(predicted)};
  });
}

function enBands(en) {
  let prev={altFt:0,observedSeconds:0,seconds:0};
  const bands=[];
  for(const row of en.climb) {
    if(row.seconds!==null && prev.seconds!==null) bands.push({fromFt:prev.altFt,toFt:row.altFt,
      observed:round(row.observedSeconds-prev.observedSeconds),predicted:round(row.seconds-prev.seconds)});
    prev=row;
  }
  return {aircraftId:'spitfire_hfix_bs551',trial:'EN.524 transfer',source:en.source,grade:'separate-airframe transfer',bands};
}

function campaigns(control, candidate, baseEN, testEN) {
  const index = series => {
    const campaigns=new Map();
    for(const s of series) {
      const key=s.aircraftId+'|'+s.source;
      if(!campaigns.has(key)) campaigns.set(key,{id:s.aircraftId,source:s.source,grade:s.grade,bands:new Map()});
      const report=campaigns.get(key);
      for(const row of s.bands) {
        const bandKey=JSON.stringify([s.trial,s.mode??null,s.weightLb??null,row.fromFt,row.toFt]);
        if(report.bands.has(bandKey)) throw Error('Duplicate clock band: '+bandKey);
        report.bands.set(bandKey,row);
      }
    }
    return campaigns;
  };
  const a=index([...control,enBands(baseEN)]), b=index([...candidate,enBands(testEN)]);
  return [...a].map(([key,c])=>{
    const bands=[...c.bands].map(([k,row])=>{
      const test=b.get(key)?.bands.get(k);
      if(test && test.observed!==row.observed) throw Error('Different flight clocks: '+key);
      const [trial,mode,weightLb]=JSON.parse(k);
      return {trial,mode,weightLb,fromFt:row.fromFt,toFt:row.toFt,observed:row.observed,control:row.predicted,test:test?.predicted??null};
    });
    const paired=bands.filter(x=>Number.isFinite(x.test));
    const mae=field=>round(mean(paired.map(row=>Math.abs(row[field]-row.observed))));
    return {id:c.id,source:c.source,grade:c.grade,partition:reserved.has(c.id)?'reserved':'development',
      bands,count:paired.length,missing:bands.length-paired.length,control:mae('control'),test:mae('test')};
  });
}

function pairedErrors(control,test,readObserved,readModel) {
  if(control.length!==test.length) throw Error('Inconsistent comparison dimensions');
  const rows=control.map((c,i)=>{
    const observed=readObserved(c);
    if(observed!==readObserved(test[i])) throw Error('Different guard observations');
    return {observed,control:readModel(c),test:readModel(test[i])};
  }).filter(r=>Number.isFinite(r.observed)&&Number.isFinite(r.control));
  const paired=rows.filter(r=>Number.isFinite(r.test));
  const score=key=>round(mean(paired.map(r=>Math.abs(r[key]-r.observed))));
  return {count:paired.length,missing:rows.length-paired.length,control:score('control'),test:score('test')};
}

function orders(aircraft,keys) {
  return Object.fromEntries(keys.map(key=>{
    const flips=[];
    let pairs=0,unavailable=0,tieChanges=0;
    for(let i=0;i<aircraft.length;i++) for(const b of aircraft.slice(i+1)) {
      const a=aircraft[i], dif=model=>a[model][key]-b[model][key];
      if(![a.control[key],b.control[key],a.test[key],b.test[key]].every(Number.isFinite)){unavailable++;continue;}
      pairs++;
      if(dif('control')*dif('test')<0) flips.push({a:a.id,b:b.id,control:round(dif('control')),test:round(dif('test'))});
      if((dif('control')===0)!==(dif('test')===0))tieChanges++;
    }
    return [key,{pairs,unavailable,tieChanges,flips}];
  }));
}

function historicalErrorBands(clocks) {
  const bands=clocks.flatMap(c=>c.bands.map(b=>({...b,id:c.id,source:c.source,
    errorSeconds:round(b.control-b.observed)})));
  const sum=rows=>rows.reduce((n,r)=>n+Math.abs(r.errorSeconds),0);
  bands.sort((a,b)=>Math.abs(b.errorSeconds)-Math.abs(a.errorSeconds));
  const top=bands.slice(0,Math.ceil(bands.length*.2)), high=bands.filter(b=>b.fromFt>=20000);
  return {count:bands.length,topCount:top.length,topShare:round(sum(top)/sum(bands)),
    highCount:high.length,highShare:round(sum(high)/sum(bands)),largest:top};
}

function build(inputs,control,steady,baseEN,baseBenchmark,tolerances) {
  const data=alternate(inputs.data,1.10);
  const intake=sourceChecks(baseBenchmark,inputs.catalog,data.models);
  intake.aircraft.push(...dataChecks(data));
  const acceleration=accel.browserEvidence(data,intake), poweredTurn=turns.browserEvidence(data);
  const test=fleet.report({...inputs,data,intake,acceleration,poweredTurn});
  const testEN=replayEN524(data), altSteady=steadyTurn.build(data,poweredTurn,tolerances);
  const clocks=campaigns(control.climbIntervals.series,test.climbIntervals.series,baseEN,testEN);
  const partitions=Object.fromEntries(['development','reserved'].map(key=>{
    const groups=clocks.filter(row=>row.partition===key);
    return [key,{campaigns:groups.length,count:groups.reduce((n,r)=>n+r.count,0),missing:groups.reduce((n,r)=>n+r.missing,0),
      control:round(mean(groups.map(r=>r.control).filter(Number.isFinite))),test:round(mean(groups.map(r=>r.test).filter(Number.isFinite)))}];
  }));
  const transfers=intervalReadings();
  const figure=transfers.find(r=>r.series==='p51d-level_acceleration_trace');
  const proxy=figure.windows.filter(w=>w.low===160 || w.high===230).map(w=>({...w,
    control:round(speedInterval(inputs.acceleration.nominal.trace,w.low,w.high)),
    test:round(speedInterval(acceleration.nominal.trace,w.low,w.high))}));
  const cited=sameSerialReferences(inputs.data), changed=sameSerialReferences(data);
  const sameSerial=cited.map((r,i)=>({...r,test:changed[i].predicted}));
  const guards={
    mustangAcceleration:pairedErrors(proxy.map(r=>({...r,p:r.control})),proxy.map(r=>({...r,p:r.test})),r=>r.seconds,r=>r.p),
    separateLevel:pairedErrors(baseEN.level,testEN.level,r=>r.observed,r=>r.after),
    quotedLevel:pairedErrors(cited,changed,r=>r.observed,r=>r.predicted),
    sustainedLoad:pairedErrors(steady.ellis.proxy,altSteady.ellis.proxy,r=>r.g,r=>r.modeled.g),
    finnishTurn:pairedErrors([steady.finnish],[altSteady.finnish],r=>r.conditions.elapsedSeconds,r=>r.cleanSeconds),
  };
  const aircraft=control.aircraft.map(a=>({id:a.id,name:a.name,control:a.model,test:test.aircraft.find(row=>row.id===a.id).model}));
  const rankings=orders(aircraft,control.metrics.map(r=>r.id));
  const allFinnish=control.finnishAcceleration.scenarios.map((r,i)=>({
    altitudeM:r.altitudeM,speedBasis:r.speedBasis,openCooling:r.openCooling,
    intervals:r.runs.map((run,j)=>({fromKmh:run.fromKmh,toKmh:run.toKmh,
      observed:control.finnishAcceleration.intervals.find(obs=>obs.fromKmh===run.fromKmh&&obs.toKmh===run.toKmh).seconds,
      control:run.seconds,test:test.finnishAcceleration.scenarios[i].runs[j].seconds}))
  }));
  const gates={climbDevelopment:partitions.development.test<partitions.development.control,
    climbReserved:partitions.reserved.test<partitions.reserved.control,
    acceleration:guards.mustangAcceleration.test<guards.mustangAcceleration.control,
    coverage:[...Object.values(partitions),...Object.values(guards)].every(r=>r.count>0 && r.missing===0) &&
      aircraft.every(a=>Object.keys(a.control).every(k=>!Number.isFinite(a.control[k])||Number.isFinite(a.test[k]))) &&
      allFinnish.every(s=>s.intervals.every(r=>!Number.isFinite(r.control)||Number.isFinite(r.test))),
    level:[guards.separateLevel,guards.quotedLevel].every(r=>r.test<=r.control),
    turn:[guards.sustainedLoad,guards.finnishTurn].every(r=>r.test<=r.control),
    stall:aircraft.every(r=>r.test.stall===r.control.stall)};
  const focus=control.climbIntervals.focus.map((r,i)=>({left:control.climbIntervals.series[r.left].aircraftId,
    right:control.climbIntervals.series[r.right].aircraftId,fromFt:r.fromFt,toFt:r.toFt,observed:r.observedGap,
    control:r.modeledGap,test:test.climbIntervals.focus[i]?.modeledGap??null}));
  return {schema:'fleet-accuracy/v1',controlVersion:'4.19.0-rc.1',candidateFactor:1.10,
    selectedFactor:1,passesScreen:Object.values(gates).every(Boolean),gates,partitions,clocks,guards,aircraft,rankings,
    focus,proxy,allFinnish,sameSerial,transfers,errorBands:historicalErrorBands(clocks),sourceIntake:{series:pack.series.length,
      rows:pack.series.reduce((n,s)=>n+s.rows.length,0),profiles:Object.keys(pack.profile_series).length}};
}

module.exports={build,intervalReadings,campaigns,orders};
