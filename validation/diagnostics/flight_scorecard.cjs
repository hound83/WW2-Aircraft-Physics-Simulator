'use strict';
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),D=require('../../aircraft/cases.json');
const Stall=require('../../src/stall-lab.js'),R=require('../../references/stall-calibration-research-2026-11-02.json');
const G=require('../lib/performance_gate.cjs'),legacy=require('./performance_validation.cjs');

const root=path.resolve(__dirname,'../..');
const aircraftIds=['p51b','p47b','bf109f4','spitfire_lfix_bs543'];
const names={p51b:'P-51B',p47b:'P-47B',bf109f4:'Bf 109 F-4',spitfire_lfix_bs543:'Spitfire LF Mk IX'};
const bands=['0–10,000','>10,000–25,000','>25,000'];
const band=altFt=>!Number.isFinite(altFt)?null:bands[altFt<=10000?0:altFt<=25000?1:2];

function workingPrediction(row){
 if(!Number.isFinite(row.value))return {value:null,method:'No historical observation'};
 const ac=D.aircraft[row.aircraftId];
 const {e,profile,...prior}=row.prediction.options;
 const opts={...prior,profile:'P'};
 if(row.metric==='level-speed')return {value:M.maxSpeed(ac,row.altFt,opts),options:opts,method:'Level-speed equilibrium at benchmark aircraft weight'};
 if(row.aircraftId==='p51b')return {value:M.bestClimb(ac,row.altFt,opts).climbFpm??null,options:opts,method:'Best-climb search at report takeoff weight with ram-critical power'};
 if(row.aircraftId==='p47b'){
  const point=ac.observedClimb.find(p=>p.altFt===row.altFt&&p.rating===row.rating);
  return {value:M.climbPrediction(ac,point,opts).predictedFpm??null,options:opts,method:'Reported TAS with inferred climb power'};
 }
 return {value:M.evaluated(ac,row.altFt,row.airspeed.valueMph,opts).power?.climbFpm??null,options:opts,method:'Reported TAS and boost proxy where available'};
}

function checkpoints(){
 return legacy.run().rows.map(row=>{
  const prediction=workingPrediction(row);
  return {id:row.id,aircraftId:row.aircraftId,specimen:row.specimen,variant:row.variant,metric:row.metric,unit:row.unit,
   altFt:row.altFt,band:band(row.altFt),observed:row.value,prediction,source:row.source,inputPath:row.inputPath,
   observedConditions:{rating:row.rating,gear:row.gear,engineRpm:row.engineRpm,weight:row.weight,
    airspeed:row.airspeed,configuration:row.configuration,atmosphere:row.atmosphere},
   modelWeightLb:prediction.options?.weightLb??D.aircraft[row.aircraftId].weightLb,
   role:row.fitRole,independent:false,conditionExclusions:row.exclusions};
 });
}

function run(){
 const baseline=require('../baseline/v36-flight-scorecard.json');
 const checkpointsNow=checkpoints();
 if(Object.keys(baseline.predictions).length!==checkpointsNow.length)throw Error('v3.6 benchmark point count changed');
 const rows=checkpointsNow.map(row=>{
  if(!Object.hasOwn(baseline.predictions,row.id))throw Error('Missing v3.6 baseline for '+row.id);
  const [observed,v36]=baseline.predictions[row.id];
  if(observed!==row.observed)throw Error('Historical observation changed for '+row.id);
  const working=row.prediction.value;
  return {...row,v36,v36Error:G.errors(v36,observed),workingError:G.errors(working,observed)};
 });
 const summary=aircraftIds.flatMap(aircraftId=>['level-speed','climb-rate'].flatMap(metric=>bands.map(range=>{
  const cells=rows.filter(r=>r.aircraftId===aircraftId&&r.metric===metric&&r.band===range&&r.role!=='speed-anchor');
  const paired=cells.filter(r=>Number.isFinite(r.v36Error.absolute)&&Number.isFinite(r.workingError.absolute));
  const mae=key=>paired.length?paired.reduce((total,r)=>total+r[key].absolute,0)/paired.length:null;
  return {aircraftId,metric,band:range,observations:cells.length,paired:paired.length,v36Mae:mae('v36Error'),workingMae:mae('workingError')};
 })));
 const source=R.sources.find(s=>s.id==='naca-tn1044');
 const stall=Stall.cleanStalls(M,D,R).map(row=>{
  const clBracket=row.liftSourceId?source.lowMachRead.engineeringBracket:null;
  const bracketEasMph=clBracket?.map(cl=>Stall.eas(row.weightLb,source.geometry.areaFt2,cl)).sort((a,b)=>a-b)??null;
  const distance=easMph=>bracketEasMph?Math.max(0,bracketEasMph[0]-easMph,easMph-bracketEasMph[1]):null;
  return {...row,bracketEasMph,v36OutsideBracketMph:distance(row.baseline.easMph),workingOutsideBracketMph:distance(row.model.easMph)};
 });
 const p47=require('../current/v34-configuration.json').selected;
 const spitfire=require('../current/v32-high-altitude.json').rows;
 return {baselineCommit:baseline.commit,policy:'Source-conditioned diagnostics from previously exposed evidence. No independent matched-condition accuracy or 5:1 claim.',
  rows,summary,stall,independentChecks:0,pairwise5to1:'unresolved',
  conditionedChecks:{p47b:{check:p47.summary.check,rows:p47.rows.map(r=>({altFt:r.altFt,role:r.fitRole,
   tasMph:r.tasMph,engineRpm:r.engineRpm,shaftHp:r.shaftHp,propulsiveHp:r.propulsiveHp,observedFpm:r.observedFpm,predictedFpm:r.predictedFpm}))},
   spitfireHighAltitude:spitfire}};
}

function writeReport(){
 const r=run(),fmt=v=>Number.isFinite(v)?v.toFixed(1):'—';
 const lines=['# Four-aircraft flight model scorecard','',
  'Baseline [v3.6](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/'+r.baselineCommit+'). Errors are calculated against the recorded observations at their listed test altitudes. These records were already available during development. They include condition mismatches, so the numerical residuals are diagnostics.',
  '', '## Clean one-g stall at 8,000 ft', '',
  '| Aircraft | Weight lb | v3.6 EAS mph | Working EAS mph | NACA-derived EAS bracket mph | Exact corrected stall |',
  '|---|---:|---:|---:|---:|---|'];
 for(const s of r.stall)lines.push(`| ${names[s.id]} | ${s.weightLb} | ${fmt(s.baseline.easMph)} | ${fmt(s.model.easMph)} | ${s.bracketEasMph?.map(fmt).join('–')??'—'} | Unresolved |`);
 const p51=r.stall.find(s=>s.id==='p51b');
 lines.push('',`At this weight and altitude the v3.6 Mustang prediction lies ${fmt(p51.v36OutsideBracketMph)} mph below the TN1044 transfer bracket. The working prediction falls inside it. The bracket comes from the same measured lift evidence used to choose the coefficient, so this is an agreement check against calibration evidence. The exact cockpit correction for 43-24777 remains open.`,
  '', '## Working profile versus historical speed and climb', '',
  'The table excludes speed anchor rows. Counts show scored pairs and available observations. Empty cells mark missing or unscored evidence. Speed uses mph TAS and climb uses ft/min. One Mustang climb observation at 15,700 ft and 75 inHg falls outside the working power domain. The machine-readable report includes every point, source reference, signed residual and condition exclusion.', '',
  '| Aircraft | Metric | Altitude ft | Paired / observed | v3.6 MAE | Working MAE |','|---|---|---|---:|---:|---:|');
 for(const s of r.summary)lines.push(`| ${names[s.aircraftId]} | ${s.metric} | ${s.band} | ${s.paired} / ${s.observations} | ${fmt(s.v36Mae)} | ${fmt(s.workingMae)} |`);
 lines.push('', '## Power and comparison coverage','',
  'The P-47B 41-5902 replay uses ten reported shaft-power states with measured TAS and RPM. Shaft power is a model input there. Propulsive power is calculated. Five previously exposed check rows give '+fmt(r.conditionedChecks.p47b.check.mae)+' ft/min climb MAE with the accepted configuration model.',
  'The Spitfire high-altitude replay retains the 32,000 ft boost discrepancy as diagnostic and blocks the 36,000 ft point outside the engine domain. The 34,000 ft residual is '+fmt(r.conditionedChecks.spitfireHighAltitude.find(x=>x.altFt===34000).error)+' ft/min.',
  'The Mustang has separately documented [power-required and propeller audits](P51_PROPELLER_EFFICIENCY_AUDIT.md). Bf 109 F-4 climb is missing from the established benchmark. Full-envelope independent power-required and propulsive-power validation is open for the four aircraft.',
  '', 'No aircraft pair has independently validated uncertainty bounds under a common comparison policy. All 5:1 claims remain unresolved.',
  '', 'See the [source-condition ledger](../references/performance-evidence.json), [stall research](STALL_ACTUAL_AIRSPEED_RESEARCH.md), [machine-readable v3.6 baseline](../validation/baseline/v36-flight-scorecard.json) and [validation workflow](CURRENT_VALIDATION.md). The full JSON report is produced by `npm run diagnose:flight-scorecard` and included in the GitHub Actions validation artifact.','');
 fs.writeFileSync(path.join(root,'validation/current/flight-scorecard.json'),JSON.stringify(r,null,2)+'\n');
 fs.writeFileSync(path.join(root,'docs/FLIGHT_SCORECARD.md'),lines.join('\n'));
 return r;
}

if(require.main===module){
 const r=writeReport();
 console.log('Flight scorecard: '+r.rows.length+' benchmark records; '+r.independentChecks+' independent checks.');
}
module.exports={checkpoints,run,writeReport};
