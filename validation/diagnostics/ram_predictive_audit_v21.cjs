/* v2.1: PREDICTIVE inlet ram, no observed climb boost as an engine input.
 * Source critical-altitude/speed/boost pairs define full-throttle pressure
 * capacity. The pressure recovery fraction 1 is an IDEAL assumption.
 * Historic climb boost and climb rate are withheld test values.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),D=require('../../aircraft/cases.json');
const spit=D.aircraft.spitfire_lfix_bs543,mustang=D.aircraft.p51b,f4=D.aircraft.bf109f4;
const outputPath=path.join(__dirname,'../baseline/ram_predictive_results_v21.json');
const secondaryTurns=[
 {altMeters:0,iasKmh:270,simSeconds:20.3},
 {altMeters:3000,iasKmh:270,simSeconds:26.1}
];
function mae(rows,key){const usable=rows.map(key).filter(Number.isFinite);return usable.length?usable.reduce((s,x)=>s+Math.abs(x),0)/usable.length:null;}
function spitCheck(recovery=1){
 const rows=spit.observedClimb.map(o=>{
  const pressure=M.ramManifoldAtSpeed(spit,o.altFt,o.tasMph,o.rating,o.gear,{recovery});
  const opts={profile:'C',gear:o.gear,rating:o.rating,weightLb:7485};
  const original=M.evaluated(spit,o.altFt,o.tasMph,opts);
  const prediction=M.evaluated(spit,o.altFt,o.tasMph,{...opts,engineModel:'ram-critical',ramRecovery:recovery});
  return {altFt:o.altFt,gear:o.gear,historicalTasMph:o.tasMph,
   measuredBoostPsi:o.reportedBoostPsi,predictedBoostPsi:pressure.manifoldGaugePsi,
   manifoldPressureResidualPsi:pressure.manifoldGaugePsi-o.reportedBoostPsi,
   historicalClimbFpm:o.fpm,originalClimbFpm:original.power?.climbFpm??null,
   predictedClimbFpm:prediction.power?.climbFpm??null,
   originalClimbResidualFpm:original.power?.climbFpm-o.fpm,
   predictedClimbResidualFpm:prediction.power?.climbFpm-o.fpm,
   shaftBhpBaseline:original.engine?.bhp??null,
   shaftBhpPredicted:prediction.engine?.bhp??null,
   predictedEnginePowerRatio:prediction.engine?.ramPowerRatio??null,
   boostRegulated:pressure.regulated,modelStatus:prediction.status,
   measuredClimbBoostUsedAsInput:false};
 });
 return {pressureMaePsi:mae(rows,p=>p.manifoldPressureResidualPsi),
  originalClimbMaeFpm:mae(rows,p=>p.originalClimbResidualFpm),
  predictedClimbMaeFpm:mae(rows,p=>p.predictedClimbResidualFpm),
  observations:rows.length,rows};
}
function mustangCheck(){
 // This speed is solely a representative LOW-SPEED input sensitivity. The
 // 1944 2,200-ft climb comparison does not publish climb TAS in the excerpt.
 const altFt=2200,tasMph=195,weightLb=9335;
 return ['67inHg','75inHg'].map(rating=>{
  const p=M.ramManifoldAtSpeed(mustang,altFt,tasMph,rating,'low');
  const before=M.evaluated(mustang,altFt,tasMph,{rating,gear:'low'});
  const after=M.evaluated(mustang,altFt,tasMph,{rating,gear:'low',engineModel:'ram-critical'});
  const climb=M.bestClimb(mustang,altFt,{rating,gear:'low',weightLb,engineModel:'ram-critical'});
  const historicalFpm=mustang.observedClimb.find(x=>x.rating===rating)?.ftMin;
  const deficitFpm=historicalFpm-climb.climbFpm;
  return {rating,altFt,tasMph,weightLb,sourceMeasuredClimbFpm:historicalFpm,
   sourceClimbTasMph:null,manifoldAbsoluteInHg:p.manifoldAbsoluteInHg,
   regulated:p.regulated,baselineShaftBhp:before.engine.bhp,
   predictedShaftBhp:after.engine.bhp,ramPowerRatio:after.engine.ramPowerRatio,
   modeledBestClimbFpm:climb.climbFpm,modeledBestClimbTasMph:climb.tasMph,
   modelClimbStatus:climb.status,historicalMinusModelClimbFpm:deficitFpm,
   remainingUsefulPowerEquivalentHp:weightLb*deficitFpm/33000,
   interpretation:'75-inHg low-gear CLIMB critical altitude is 2,200ft in the original report; the LEVEL-FLIGHT 75-inHg low-gear critical altitude is 7,400ft. At representative climb TAS 195mph the modeled regulator holds full MAP. The climb residual remains in prop/drag/weight/engine chart, not a demonstrated ram-pressure shortfall. Source climb TAS unreported; modeled optimum and takeoff mass are assumptions.'};
 });
}
function f4TurnCheck(){
 // Historical F-4-specific MAP-vs-speed is missing. These critical inputs
 // have SIMULATOR provenance, not primary flight-test precision.
 const sourceE=.54698;
 return secondaryTurns.map(p=>{
  const altFt=p.altMeters/0.3048,tasMph=M.trueFromCAS(p.iasKmh/1.609344,altFt);
  const before=M.evaluated(f4,altFt,tasMph,{rating:'emergency',e:sourceE});
  const after=M.evaluated(f4,altFt,tasMph,{rating:'emergency',e:sourceE,engineModel:'ram-critical'});
  return {...p,altFt,tasMph,assumedIASApproximatelyCAS:true,
   boostRegulated:after.engine?.ram?.regulated,
   baselineTurnSeconds:360/before.limits.sustDegSec,
   predictedTurnSeconds:360/after.limits.sustDegSec,
   residualToSimulatorSeconds:360/after.limits.sustDegSec-p.simSeconds,
   baselineShaftBhp:before.engine?.bhp,predictedShaftBhp:after.engine?.bhp,
   secondarySource:'https://il2sturmovik.com/museum/fighters/bf-109-f-4/',
   caveat:'e=0.54698 previously conditioned against simulator sea-level turn; not a wartime measured e'};
 });
}
function speedHoldouts(){
 const rows=spit.observedSpeed.map(o=>{
  const before=M.maxSpeed(spit,o.altFt,{rating:o.rating,gear:o.gear});
  const after=M.maxSpeed(spit,o.altFt,{rating:o.rating,gear:o.gear,engineModel:'ram-critical'});
  return {altFt:o.altFt,gear:o.gear,observedTasMph:o.mphTas,
   originalModelTasMph:before,predictiveModelTasMph:after,
   sourceSpeedResidualMph:after-o.mphTas,modelChangeMph:after-before};
 });
 return {rows,
  predictiveHoldoutMaeMph:mae(rows.filter(x=>x.altFt!==0||x.gear!=='low'),x=>x.sourceSpeedResidualMph),
  differenceFromBaselineMaeMph:mae(rows,x=>x.modelChangeMph)};
}
function lowSpeedSweeps(){
 const configs=[
  {id:'spitfire_lfix_bs543',altFt:22000,rating:'combat+18',gear:'high',label:'Spitfire IX, 22k ft (full-throttle limited)'},
  {id:'p51b',altFt:2200,rating:'67inHg',gear:'low',label:'P-51B, 2.2k ft (67 inHg regulated)'},
  {id:'p51b',altFt:2200,rating:'75inHg',gear:'low',label:'P-51B, 2.2k ft (75 inHg regulated)'},
  {id:'bf109f4',altFt:3000/.3048,rating:'emergency',gear:'fluid',label:'Bf109F-4, 3km (1.42 ata regulated)'}
 ];
 return configs.map(c=>({label:c.label,aircraftId:c.id,altFt:c.altFt,rating:c.rating,gear:c.gear,
  points:Array.from({length:14},(_,i)=>{
   const tasMph=125+25*i,ac=D.aircraft[c.id];
   const pressure=M.ramManifoldAtSpeed(ac,c.altFt,tasMph,c.rating,c.gear);
   const shaft=M.shaftPowerAtRamSpeed(ac,c.altFt,tasMph,c.rating,c.gear);
   return {tasMph,boostRegulated:pressure.regulated,
    predictedMapAbsInHg:pressure.manifoldAbsoluteInHg,
    relativeShaftPower:shaft?.ramPowerRatio??null};
  })}));
}
function run(){
 const spitIdeal=spitCheck(1),spitPartial=spitCheck(.7),spitNoRecovery=spitCheck(0);
 return {version:'2.1',method:'No climb MAP inputs: ideal, isentropic inlet-total-pressure ratio p0=p(1+0.2M^2)^3.5 at sourced full-throttle critical point; regulator caps rated MAP; speed-dependent BHP proportional to predicted manifold pressure relative to measured maximum-speed TAS, or explicit engine-chart rated MAP when no exact-altitude speed anchor exists.',
  defaultUiModel:'charted',predictiveModelOptIn:'ram-critical',
  inletRecoveryIsAssumedNotMeasured:true,
  spitfire:{ideal:spitIdeal,recovery07:spitPartial,recovery0:spitNoRecovery,speed:speedHoldouts()},
  mustang2200Ft:mustangCheck(),bf109Turns:f4TurnCheck(),lowSpeedSweeps:lowSpeedSweeps(),
  p47:{status:'UNCHANGED',reason:'Turbo-supercharged P-47B pressure regulator/inlet capacity cannot be represented by a direct-geared two-speed critical boost point; matched P-47B turbo intake-speed pressure evidence not yet available.'},
  originalP51B1Control:{source:'USAAF May 1943 P-51B-1 AAF 43-12093 separate airframe, NOT the P-51B-15 43-24777 model',
    sourceUrl:'https://www.wwiiaircraftperformance.com/org/p-51/mustangtest.html',
    observation:'At 60.5inHg/3000rpm the separate historical P-51B-1 maintained commanded pressure during climbing at sea level, 5,000ft, 10,000ft and 13,000ft; maximum-level critical point 16,800ft / 425mph in low blower.',
    use:'Independent qualitative/pressure-regulation boundary; different engine/airframe, no published TAS for these climb rows so exact speed-specific power is not reconstructed.'},
  unanswered:['P-51B-15 climb TAS and same-condition manifold pressure absent from source excerpt',
   'Bf109F-4 high-altitude full-throttle speed is simulator-proxy rather than matched original data',
   'Mustang source 75-inHg 7,400ft low-gear speed is INFERRED from the report prose 16mph advantage; its tabulated 395.5mph contradicts the prose',
   'Installed propeller blade η(J,Cp,tip Mach,pitch) still a heuristic C',
   'Spitfire climb shutters OPEN and baseline speed drag polar shutters CLOSED',
   'Pressure recovery fraction varies by intake design and flight speed; assumed unity until measured']};
}
if(require.main===module){
 const result=run();if(process.argv.includes('--write'))fs.writeFileSync(outputPath,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({spitfire:{mapPsi:result.spitfire.ideal.pressureMaePsi,
  climbBefore:result.spitfire.ideal.originalClimbMaeFpm,climbAfter:result.spitfire.ideal.predictedClimbMaeFpm,
  speedMae:result.spitfire.speed.predictiveHoldoutMaeMph},
  p51:result.mustang2200Ft.map(x=>({rating:x.rating,regulator:x.regulated,ratio:x.ramPowerRatio})),
  f4:result.bf109Turns.map(x=>({altM:x.altMeters,turn:x.predictedTurnSeconds,regulator:x.boostRegulated}))},null,2));
}
module.exports={run};
