/* v1.8 independent simulator reference registry + optional physics-based
 * actuator-disk propeller candidate D. No simulator tuning is performed.
 * D is a SINGLE GLOBAL .85 profile/installation power-fraction assumption;
 * NACA L4I29 gives the loss decomposition, NOT this numerical coefficient.
 * Preserve v1.7 C as the default until the historical holdouts support a swap.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const M=require('./physics.js');
const D=require('./cases.json');
const refs=require('./simulator_reference_v18.json');
const cross=require('./cross_aircraft_diagnostic_v15.cjs');
const old109=require('./joint_low_speed_v17.cjs');
const fig=require('./p51_power_required_source_v16.json');
const LB_PER_KG=2.20462262185;
const MPH_PER_KMH=1/1.609344;
const FPM_PER_MPS=196.8503937;
const FT_PER_M=1/.3048;
const F4=D.aircraft.bf109f4;
const P51=D.aircraft.p51b;
const P47=D.aircraft.p47b;
const WORK_E=old109.solveSeaLevelE();
function polar(ac,profile,e=.78){
 const fit=M.cd0FromAnchor(ac,profile,e);
 if(!fit?.valid)throw Error('Invalid anchor for '+ac.name+': '+profile);
 return {e,cd0:fit.cd0,source:'Original single level-speed anchor; e='+e+' assumed; candidate '+profile+'; no simulator fit'};
}
function turns(ac,altFt,casKmh,profile,e,rating){
 const tas=M.trueFromCAS(casKmh*MPH_PER_KMH,altFt);
 const r=M.evaluated(ac,altFt,tas,{polar:polar(ac,profile,e),profile,rating});
 return {turnSeconds:r.limits.sustDegSec>0?360/r.limits.sustDegSec:null,
    turnDegSec:r.limits.sustDegSec,shaftHp:r.power?.shaftHp,
    propEta:r.prop?.eta,propulsiveHp:r.power?.propulsiveHp,
    inducedHp:r.drag?.inducedHp,parasiteHp:r.drag?.parasiteHp,
    speedAssumption:'simulator IAS provisionally treated as CAS, NOT matched IAS correction'};
}
function holdout(ac,profile){
 const p=polar(ac,profile);
 const rows=ac.observedSpeed.map(o=>({altFt:o.altFt,rating:o.rating,reportedMphTAS:o.mphTas,
    predictedMphTAS:M.maxSpeed(ac,o.altFt,{polar:p,profile,rating:o.rating,gear:o.gear}),
    role:o.rating!==ac.calibration.rating?'different engine rating (separate audit)':'historical same-rating holdout'}));
 for(const r of rows){r.residualMph=r.predictedMphTAS-r.reportedMphTAS;
   if(Math.abs(r.altFt-ac.calibration.altFt)<1 && r.rating===ac.calibration.rating)r.role='calibration anchor';}
 const held=rows.filter(x=>x.role==='historical same-rating holdout');
 return {cd0:p.cd0,anchor:ac.calibration,rows,
    withheldCount:held.length,holdoutMAEMph:held.reduce((s,r)=>s+Math.abs(r.residualMph),0)/held.length};
}
function p51Climb(profile){
 const p=polar(P51,profile);
 return [{rating:'67inHg',observedFpm:3820},{rating:'75inHg',observedFpm:4380}].map(o=>{
  const r=M.bestClimb(P51,2200,{polar:p,profile,rating:o.rating,weightLb:9335});
  return {...o,altFt:2200,modelFpm:r.climbFpm,residualFpm:r.climbFpm-o.observedFpm,
    optimumTasMph:r.tasMph,shaftHp:r.shaftHp,eta:r.propEta};
 });
}
function fig5(profile){
 const p=polar(P51,profile);
 const rows=fig.points.map(q=>{
  const dr=M.dragBreakdown(P51,fig.altitudeFt,q.tasMph,fig.nominalWeightLb,p.cd0,p.e,1);
  const prop=M.propEta(P51,fig.altitudeFt,q.tasMph,q.testBhp,profile,'67inHg',{engineRpmOverride:q.engineRpm});
  return {tasMph:q.tasMph,sourceTestRpm:q.engineRpm,sourceBhp:q.testBhp,
   predictedRequiredShaftBhp:dr.requiredHp/prop.eta,residualBhp:dr.requiredHp/prop.eta-q.testBhp,
   eta:prop.eta};
 });
 return {rows,MAEBhp:rows.reduce((s,r)=>s+Math.abs(r.residualBhp),0)/rows.length,
  lowMidMAEBhp:rows.slice(0,4).reduce((s,r)=>s+Math.abs(r.residualBhp),0)/4,
  warning:profile==='D'?'D momentum disk excludes RPM-sensitive blade profile losses; this is NOT a validated propeller curve':null};
}
function etaPowerSlope(ac,profile,altFt,tas,rating){
 const shaft=M.shaftPower(ac,altFt,rating,'auto');
 const min=M.propEta(ac,altFt,tas,shaft.bhp*.9,profile,rating);
 const max=M.propEta(ac,altFt,tas,shaft.bhp*1.1,profile,rating);
 return {altFt,tasMph:tas,shaftHp:shaft.bhp,etaMinus10pct:min.eta,
  etaPlus10pct:max.eta,delta:max.eta-min.eta,
  powerLoadingTrend:max.eta<min.eta?'efficiency falls with rising power (physically correct induced loading trend)':
   'efficiency rises with rising power (contrary to NACA low-speed induced loading trend)'};
}
function simulatorSummary(){return refs.aircraft.map(r=>{
 const w=r.weightKg?Math.round(r.weightKg*LB_PER_KG):null;
 const speed=r.speed?.filter(s=>s.altMeters===0).map(s=>({mphTAS:s.kmhTAS*MPH_PER_KMH,
  kmhTAS:s.kmhTAS,rating:s.rating}))??[];
 const turns=r.turn?.filter(s=>s.altMeters===0).map(s=>({reportedIasKmh:s.iasKmh??null,
  knotsIAS:s.iasKnots??null,seconds:s.seconds??360/s.degSec,degSec:s.degSec??360/s.seconds,
  rating:s.rating}))??[];
 const climb=r.climb?.filter(s=>s.altMeters===0).map(s=>({ftPerMin:s.mps?s.mps*FPM_PER_MPS:s.ftPerSec*60,
  rating:s.rating,iasKnots:s.iasKnots??null}))??[];
 return {id:r.id,simulator:r.simulator,variant:r.variant,weightLb:w,
  comparisonStatus:r.comparison,confidence:r.confidenceByAuthor??'developer-published simulator specification',
  speedSL:speed,turnSL:turns,climbSL:climb};
 });}
function run(){
 const variants={};
 for(const profile of ['C','D']){
  const f4= [0,3000*FT_PER_M].map((alt,i)=>({altFt:alt,reportedSimSeconds:i===0?20.3:26.1,
    ...turns(F4,alt,270,profile,WORK_E,'emergency')}));
  variants[profile]={
   p47bSpeed:holdout(P47,profile),
   p51bSpeed:holdout(P51,profile),
   p51bClimb:p51Climb(profile),
   p51bPowerRequired:fig5(profile),
   bf109f4AtHeldE:f4,
   bf109f4CombatAt170Eas5000ft:(()=>{
    const tas=M.tasFrom(170,'EAS',5000),r=M.evaluated(F4,5000,tas,{polar:polar(F4,profile,WORK_E),profile,rating:'combat'});
    return {sustDegSec:r.limits.sustDegSec,propEta:r.prop.eta,shaftHp:r.power.shaftHp};
   })(),
   powerLoading:{p51b:etaPowerSlope(P51,profile,2200,171,'67inHg'),
    bf109f4:etaPowerSlope(F4,profile,5000,M.tasFrom(170,'EAS',5000),'combat')}
  };
 }
 const baseline=cross.run().profiles.find(p=>p.profile==='C');
 return {version:'v1.8-cross-simulator-and-actuator-disk-candidate',
  references:{IL2:refs.metadata.il2,DCS:refs.metadata.dcs},
  simulatorPublishedAbsolute:simulatorSummary(),
  variantRules:refs.aircraft.map(r=>({id:r.id,variant:r.variant,warning:r.comparison})),
  bf109ConditionalEFromV17:WORK_E,
  historicalScope:'ONLY P-47B 41-5902, P-51B-15 43-24777, and Bf109F4 source and provisional scenarios are represented by the working physics solver; D-28/D-30/D-15 simulator variants are registry values NOT evaluated by a fictitious model.',
  measuredHistorical:{p47bSpeedHoldoutC:baseline.p47.speed.holdoutMAEMph,
   p51bSpeedHoldoutC:baseline.p51.speed.holdoutMAEMph,
   p51bActualClimbAt2200:{'67inHg':3820,'75inHg':4380}},
  candidates:variants,
  candidateD:{basis:'one-dimensional actuator-disk momentum power balance (physics) with a uniform 0.85 assumed blade/profile/installation power fraction (NOT measured NACA constant)',
   primarySource:'NACA ACR L4I29 (1944), Charts for Determining Propeller Efficiency; https://ntrs.nasa.gov/citations/19930093312',
   secondPrimarySource:'NACA TN 2022 (1950), actual 165mph IAS three-bladed P-47D trial; https://ntrs.nasa.gov/citations/19930082679',
   limitations:'Infinite-blade ideal momentum disk, no type-specific pitch schedule, blade section losses, prop RPM advance-ratio shape, slipstream interference, exhaust thrust or calibrated IAS. Unmeasured .85 constant is global and not allowed to silently replace validated profile C.',
   decision:'Evaluate against all historical holdouts and simulator plausibility. REJECT as default if it increases errors or produces unrealistic low-speed physics; no P51/F4-specific adjustable corrections.'},
  sourceCaution:'IL-2 statistics and 2020–2022 DCS user tests are neither independent wartime flight tests nor variant-matched model calibration data. Published speed values are TAS or presumed TAS; turn IAS has unknown pitot correction. DCS user chart is LOW confidence.'};
}
if(require.main===module){const r=run();if(process.argv.includes('--write')){
 const out=path.join(__dirname,'prop_sim_results_v18.json');fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');console.log(out);
}else console.log(JSON.stringify(r,null,2));}
module.exports={run,polar,holdout,turns};
