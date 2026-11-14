'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const Turn = require('../../src/turn-performance.js');
const Maneuver = require('../../src/benchmark-maneuver.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const Stall = require('../../src/provisional-stall-loader.js');
const { historicalGroups } = require('./implemented_model_accuracy.cjs');
const propeller = require('./operating_benchmark_v410.cjs');
const remaining = require('./remaining_fighter_propellers.cjs');
const { timedGroups } = require('./fleet_source_timing.cjs');
const { sourceChecks:stallChecks } = require('./continuous_stall.cjs');

const MPH = .44704, HP = 745.6998716, LBF = 4.4482216153, G = 9.80665;
const condition = Object.freeze({
  altFt:10000, entryEasMph:210, commandG:4, mode:'combat', fuelFraction:.5, injection:false, openCooling:false,
});
const metrics = [
  { id:'level',label:'Level speed',unit:'mph TAS' },
  { id:'climb',label:'Climb rate',unit:'ft/min' },
  { id:'elapsed',label:'Time to climb',unit:'s' },
  { id:'stall',label:'Clean 1 G stall',unit:'mph EAS' },
  { id:'acceleration',label:'Level acceleration',unit:'s' },
  { id:'maneuver',label:'Maneuverability',unit:'s' },
];
const historicalMetric = {
  'level speed':'level', 'climb rate':'climb', 'clean one-g stall speed':'stall', 'maneuver lift curve':'maneuver',
};
const finite = Number.isFinite;
const round = value => finite(value)?+value.toFixed(6):null;
const mean = rows => rows.reduce((sum,value) => sum+value,0)/rows.length;

function summarize({qualifier,source,reference,grade,rows,unit}) {
  const checks = rows.map(row => {
    const scored = finite(row.predicted)&&finite(row.observed)&&row.observed>0;
    const error = scored?row.predicted-row.observed:null;
    return { ...row,error:round(error),errorPercent:scored?round(100*error/row.observed):null };
  });
  const scored = checks.filter(row => finite(row.errorPercent));
  const bias = scored.length?round(mean(scored.map(row => row.error))):null;
  const mape = scored.length?round(mean(scored.map(row => Math.abs(row.errorPercent)))):null;
  return { qualifier,source,reference,grade,unit,count:scored.length,available:checks.length,bias,mape,
    agreement:scored.length?round(100-mape):null,checks };
}

function historicalEvidence(inputs) {
  const {data,catalog,intake,stallReferences,acceleration,poweredTurn,propellerReport,remainingReport} = inputs;
  const evidence = Object.fromEntries(Object.keys(data.models).map(id => [id,Object.fromEntries(metrics.map(m => [m.id,[]]))]));
  const add = (id,metric,group) => evidence[id][metric].push(summarize({
    unit:metrics.find(m => m.id===metric).unit,...group,
  }));

  const propellerChecks = propellerReport??propeller.reportChecks(data,data);
  const remainingChecks = remainingReport??remaining.reportChecks(data,data);
  const qualified = historicalGroups(data,propellerChecks,remainingChecks);
  for (const row of qualified) {
    if (row.id==='fw190-climb')continue;
    const grade = row.evidence.startsWith('fit consistency')?'fit-consistency':
      row.evidence.includes('separate-airframe')?'transfer':
      row.evidence.includes('reserved')||row.evidence.includes('held-out')?'reserved':'conditional';
    add(row.aircraft,historicalMetric[row.metric],{ ...row,qualifier:row.evidence,reference:row.conditions,grade });
  }
  const fw = data.flightChecks.find(row => row.id==='fw190a4');
  add(fw.id,'climb',{ qualifier:'Reserved WNr 783 open-cooling rows',source:fw.url,reference:fw.condition,grade:'reserved',
    rows:fw.rows.filter(r => r.role==='check').map(r => ({ ...r,predicted:r.after })) });

  const byId = new Map(catalog.observations.map(row => [row.id,row]));
  const sources = new Map(catalog.sources.map(row => [row.id,row]));
  const sourceLink = id => sources.get(byId.get(id)?.source_id)?.primary_url;
  for (const a of intake.aircraft) {
    for (const metric of ['level','climb']) {
      const rows = a[metric];
      if (!rows.length)continue;
      const fits = rows.filter(row => row.role==='fit');
      const outsideFit = rows.filter(row => row.role!=='fit'&&finite(row.predicted));
      const refs = rows.filter(row=>row.role!=='fit'&&!finite(row.predicted));
      if (outsideFit.length)add(a.id,metric,{ qualifier:'Report-conditioned comparison',grade:'report-conditioned',
        source:sourceLink(outsideFit[0].id),reference:a.scope,rows:outsideFit });
      if (refs.length)add(a.id,metric,{ qualifier:'Other source conditions',grade:'reference',
        source:sourceLink(refs[0].id),reference:'The listed conditions require a separate configuration or a wider modeled envelope.',rows:refs });
      if (fits.length)add(a.id,metric,{ qualifier:'Fit consistency',grade:'fit-consistency',
        source:sourceLink(fits[0].id),reference:'These observations set the model inputs.',rows:fits });
    }
  }

  const elapsed = new Map();
  for (const {aircraft,key,row,...group} of timedGroups(data,catalog,intake)) {
    if(!elapsed.has(key))elapsed.set(key,{ aircraft,...group,rows:[] });
    elapsed.get(key).rows.push(row);
  }
  for (const {aircraft,...group} of elapsed.values())add(aircraft,'elapsed',group);

  const corsair = stallChecks(data,stallReferences).corsair;
  for (const check of corsair.naca) {
    add('f4u4','stall',{ qualifier:'Separate NACA ' + check.power + ' transfer',source:check.source.url,grade:'transfer',
      reference:check.qualification+' Stall coefficient transfer at the NACA mass and altitude.',
      rows:[{ ...check,observed:check.observedEasMph,predicted:check.modeledEasMph }] });
  }
  for (const [id,refs] of Object.entries(stallReferences)) {
    for (const ref of refs) {
      if (['Reserved sister-airframe check','Separate NACA configuration check'].includes(ref.role))continue;
      const spec = data.specification.aircraft[id];
      const sourceSpeed = ref.speed.value+' '+ref.speed.unit+' '+ref.speed.basis;
      const observed = Stall.referenceEas(M,ref);
      const anchor = corsair.navy.find(check => check.id===ref.id);
      const modeled = anchor?.modeledEasMph??(ref.weightLb?
        B.evaluate(M,T,L,data.models[id],spec,condition,ref.altFt??0,210,ref.weightLb).stallEasMph:null);
      const approximate = ref.speed.basis==='IAS'&&finite(ref.weightLb)&&finite(modeled)&&!ref.role.includes('minimum-control');
      const comparison = approximate?'Modeled at report mass '+round(modeled)+' mph EAS. IAS is shown in its recorded basis.':null;
      add(id,'stall',{ qualifier:ref.role+' · '+sourceSpeed,grade:'reference',source:ref.source.url,
        reference:[ref.qualification,comparison].filter(Boolean).join(' '),
        rows:[{ ...ref,observedEasMph:observed,predicted:round(modeled),originalSpeed:ref.speed }] });
    }
  }

  const restored = acceleration.observation, endpoints = restored.endpoints;
  add('p51d15_4415342','acceleration',{ qualifier:'Restored-aircraft acceleration proxy',grade:'conditional',
    source:restored.source.url,reference:'Different installation and loading. The wartime rack-on profile uses Normal power as a METO proxy. IAS is treated as CAS. Endpoints are from one run.',
    rows:[{ observed:endpoints.elapsedSeconds,predicted:acceleration.nominal.seconds,sourceEndpoints:endpoints }] });

  add('spitfire_lfix_bs543','acceleration',{ qualifier:'Acceleration equivalent from climb energy',grade:'derived',
    source:data.flightChecks.find(trial => trial.id==='spitfire_lfix_bs543').url,
    reference:'Recorded vertical rate plus the change in TAS along the climb schedule. Represents excess energy in that climb configuration.',
    rows:acceleration.spitfire.rows.map(row => ({ ...row,observed:null,predicted:row.withScheduleEnergy.modeled })) });

  const observedTurn = poweredTurn.observation;
  add(observedTurn.modelId,'maneuver',{ qualifier:'Finnish 360° continuous-turn transcription',grade:'conditional',
    source:observedTurn.transcriptions[0].url,
    reference:'Separate test. Assumed IAS correction, mass and cooling. The reported bank and timing imply different loads. Recovery was unrecorded.',
    rows:[{ observed:observedTurn.conditions.elapsedSeconds,predicted:poweredTurn.clean.seconds,
      conditions:observedTurn.conditions,scenariosSeconds:poweredTurn.scenarioRanges.seconds }] });
  add(observedTurn.modelId,'acceleration',{ qualifier:'Finnish elapsed segments',grade:'reference',
    source:observedTurn.transcriptions[0].url,
    reference:'Maximum-power 300–440 km/h in 27 s and 440–510 km/h in 35 s. Altitude, RPM, exact mass and speed calibration remain open.',
    rows:observedTurn.relatedAcceleration.rows.filter(row => row.rating==='Maximum'),
  });
  const f4 = catalog.observations.filter(row => row.id.includes(':f4-rechlin-matched-climb:'));
  if (f4.length)add('bf109f4','elapsed',{ qualifier:'Rechlin comparative climb',grade:'reference',source:sourceLink(f4[0].id),
    reference:'Production aircraft with ammunition. Original run mass, RPM, boost and climb airspeed remain open.',rows:f4 });
  const fwTurn = catalog.observations.filter(row => row.id.includes(':a4-niivvs-turn-and-low-speed:')&&finite(row.values.turn_time_min_s));
  if (fwTurn.length)add('fw190a4','maneuver',{ qualifier:'Captured A-4 timed turn',grade:'reference',source:sourceLink(fwTurn[0].id),
    reference:'Reported clean turn of 23–24 s at 1,000 m and 3,989 kg takeoff. Entry/exit speed, power and turn profile remain open.',
    rows:fwTurn });
  const ceiling = intake.aircraft.find(row => row.id==='bf109g6trop_16476').ceiling;
  add('bf109g6trop_16476','climb',{ qualifier:'Reported ceiling reference',grade:'reference',source:sourceLink(ceiling.id),
    reference:'Observed ceiling '+Math.round(ceiling.observedAltFt)+' ft. The climb-rate criterion and complete climb-rate schedule remain open.',
    rows:[ceiling] });
  return evidence;
}

const stallGaps = {
  p51b:'Wright Field IAS is available. Recover low-speed position error and takeoff/instantaneous mass.',
  p38g:'Sister-airframe CAS check at approximate weight and height.',
  f4u4:'Identify the original stall-run serial and mass for a same-airframe check.',
  spitfire_lfix_bs543:'Clean 86 mph IAS is available. Recover the stall-speed position correction.',
  p47b:'Clean 105 mph IAS is available. Recover the stall-speed position correction.',
  fw190a4:'Weight-scaled stall estimate. Recover WNr 783 clean corrected power-off stall.',
  bf109f4:'Weight-scaled stall estimate. Recover F-4 clean corrected stall at measured mass.',
  spitfire_hfix_bs551:'Full-span Spitfire lift transfer. Recover BS.551 clean corrected stall and mass.',
  bf109g2_db605a:'G-2/Trop IAS and separate glide minimum-control source. Recover MT-215 clean CAS and mass.',
  p51d15_4415342:'Handbook IAS and loading are available. Recover rack-on position error and stall test conditions.',
  spitfire_fix_bf274:'Shared full-span lift estimate. BF.274’s position-error curve stops above stall.',
  bf109g6trop_16476:'F-4 lift transfer. Recover clean stall CAS at the modeled pods and sand-filter state.',
};

function makeGaps(id) {
  return {
    level:id==='bf109g6trop_16476'?'Independent installed-power and matched-configuration flight speeds remain open.':null,
    climb:id==='bf109f4'?'Pointwise measured rate, boost and climb speed are open. See measured elapsed intervals.':
      id==='bf109g6trop_16476'?'Recover climb TAS, temperatures, boost and rate by altitude.':null,
    elapsed:id==='f4u4'?'Recover the BuNo 80765 elapsed record and its climb-speed schedule.':
      id==='bf109g6trop_16476'?'Recover elapsed checkpoints. The source supplies a ceiling and IAS.':null,
    stall:stallGaps[id],
    acceleration:'Recover calibrated speed-versus-time in level flight with mass, altitude and engine setting.',
    maneuver:'Recover a powered turn with heading, load and calibrated speed through rollout and recovery.',
  };
}

function checkFormulas(flight, run, refined) {
  const oneG = Maneuver.condition(flight,1),turn = Turn.state(flight);
  const V = flight.tasMph*MPH;
  const [, ...steps] = run.trace;
  const expectedAccel = flight.power.excessHp*HP/(flight.weightLb*LBF/G*V)/MPH;
  const expectedTurnRate = G*Math.sqrt(turn.turn.g**2-1)/V*180/Math.PI;
  const equilibrium = turn.limiting==='power'?
    Maneuver.condition(flight,turn.turn.g).excessHp:null;
  const workResidual = steps.reduce((energy,point,i) => {
    const previous = run.trace[i];
    const endTas = M.tasFrom(point.easMph,'EAS',run.altFt)*MPH;
    const startTas = M.tasFrom(previous.easMph,'EAS',run.altFt)*MPH;
    const netPowerPerMass = point.excessHp*HP/(point.weightLb*LBF/G);
    const deltaEnergy = (endTas**2-startTas**2)/2;
    return energy+Math.abs(deltaEnergy-netPowerPerMass*(point.seconds-previous.seconds));
  },0);
  return {
    oneGAccelerationErrorMphPerSecond:Math.abs(oneG.tasAcceleration-expectedAccel),
    turnRateErrorDegSec:Math.abs(turn.turn.rateDegSec-expectedTurnRate),
    powerEquilibriumErrorHp:equilibrium===null?null:Math.abs(equilibrium),
    kineticIntegrationResidualJPerKg:Math.abs(workResidual),
    halfStepTotalTimeDifferenceSeconds:finite(run.seconds)&&finite(refined.seconds)?Math.abs(run.seconds-refined.seconds):null,
  };
}

function report(inputs) {
  const {data} = inputs,{models,specification} = data;
  const evidence = historicalEvidence(inputs);
  const { altFt,entryEasMph,commandG } = condition;
  const aircraft = Object.entries(models).map(([id,model]) => {
    const spec = specification.aircraft[id],policy = specification.policy;
    const operating = B.metrics(M,T,L,model,spec,policy,condition,altFt);
    const flightCase = B.levelFlightCase(M,T,L,model,spec,policy,condition,altFt,{ allowProvisionalManeuver:true });
    const flight = flightCase.evaluate(entryEasMph,flightCase.initial.weightLb);
    const turn = Turn.state(flight);
    const climb = B.climb(M,T,L,model,spec,policy,condition,0,altFt);
    const acceleration = B.accelerate(M,T,L,model,spec,policy,condition,altFt,180,250);
    const replay = (c,options) => Maneuver.replay(M,T,L,model,spec,policy,condition,c,options);
    const maneuver = replay(condition);
    const fine = replay(condition,{ stepSeconds:.25,trace:false });
    const stress = data.turnEvidence.sensitivity;
    const sensitivity = Maneuver.sensitivity(scenario => replay(condition,{ scenario,sensitivity:stress,trace:false }),stress);
    const grid = Maneuver.sweepGrid.altitudesFt.flatMap(h => Maneuver.sweepGrid.entrySpeedsEasMph.map(v => {
      const run = replay({ altFt:h,entryEasMph:v,commandG },{ trace:false });
      return { altFt:h,entryEasMph:v,status:run.status,turnSeconds:round(run.turnSeconds),
        exitEasMph:round(run.exitEasMph),recoverySeconds:round(run.recoverySeconds),totalSeconds:round(run.seconds) };
    }));
    return {
      id,name:data.service.aircraft[id].displayName,loadingLb:round(flightCase.initial.weightLb),
      model:{ level:round(operating.level?.tasMph),climb:round(operating.climb?.climbFpm),elapsed:round(climb.seconds),
        stall:round(operating.stallEasMph),acceleration:round(acceleration.seconds),maneuver:round(maneuver.seconds) },
      operatingStatus:{ level:operating.status,elapsed:climb.status,acceleration:acceleration.status,maneuver:maneuver.status },
      stallEasRange:operating.stallEasRange??null,evidence:evidence[id],gaps:makeGaps(id),
      maneuver:{ intake:Boolean(spec.performanceIntake), oneGAccelMphPerSecond:round(B.levelAccelerationMphPerSecond(flight)),
        usableLiftG:round(turn.nLift),sustainedG:round(turn.turn?.g),sustainedDegSec:round(turn.turn?.rateDegSec),
        turnSeconds:round(maneuver.turnSeconds),exitEasMph:round(maneuver.exitEasMph),recoverySeconds:round(maneuver.recoverySeconds),
        energyHeightChangeFt:round(maneuver.turnEnergyHeightFt),limits:maneuver.limits,sensitivity,grid },
      formulas:checkFormulas(flight,maneuver,fine),
    };
  });
  const coverage=Object.fromEntries(metrics.map(({id})=>[id,{
    modeled:aircraft.filter(row=>finite(row.model[id])).length,
    numericalComparisons:aircraft.filter(row=>row.evidence[id].some(group=>group.count>0)).length,
    sourceReferences:aircraft.filter(row=>row.evidence[id].length>0).length,
  }]));
  return { schema:'ww2-fleet-maneuver-validation/v1',version:require('../../package.json').version,
    inputPack:require('../../references/analysis/fighter-sim-inputs-v1.json').version,condition,metrics,aircraft,coverage,
    interpretation:'Agreement is 100 minus MAPE over the indicated observations. Report-conditioned checks may supply shaft power, boost or speed. Fit consistency, transfers, proxy cases and separate aircraft remain explicitly identified. Historical maneuver observations do not match the new 180 degree turn plus recovery run.' };
}

function browserData(report) {
  return {
    condition:report.condition,metrics:report.metrics,aircraft:report.aircraft.map(({id,name,model,evidence,gaps,maneuver,stallEasRange,operatingStatus}) => ({
      id,name,model,gaps,stallEasRange,operatingStatus,
      liftG:maneuver.usableLiftG,sustainedDegSec:maneuver.sustainedDegSec,
      evidence:Object.fromEntries(Object.entries(evidence).map(([key,groups]) =>
        [key,groups.map(({checks,...summary}) => summary)])),
    })),
  };
}

module.exports = { report,browserData };
