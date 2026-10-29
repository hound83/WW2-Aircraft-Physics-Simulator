/* v1.7: JOINT low-speed power / turn audit for P-51B and Bf 109 F-4.
 * Flight-simulator turn benchmark is NOT a historical F-4 measurement.
 * Match ONLY its sea-level turn time; withhold the 3000m result.
 * Every trial re-anchors CD0 to the same original 325 mph combat speed;
 * no additional physics coefficient, propeller multiplier or historical
 * aircraft-specific turn claim is inserted into the shared solver.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const M=require('../../src/physics.js');
const D=require('../../aircraft/cases.json');
const p51=require('./p51_drag_validation_v16.cjs');
const KPH_PER_MPH=1.609344;
const FPM_PER_MPS=196.8503937;
const N_PER_LBF=4.4482216153;
const HP_WATT=745.6998716;
const F4=D.aircraft.bf109f4;
const P51=D.aircraft.p51b;
const TURN_SOURCE={
  source:'IL-2 Great Battles in-game Bf 109 F-4 technical specification, reproduced by Open Flight School',
  url:'https://www.openflightschool.de/mod/book/view.php?chapterid=357&id=515',
  evidenceClass:'OTHER SIMULATOR OUTPUT — NOT 1941 AIRCRAFT FLIGHT TEST',
  conditions:'standard weight 2890 kg; emergency DB601E 1350 PS; 270 km/h IAS in both cases; standard atmosphere',
  unknown:'Bf 109 F-4 specimen-specific IAS-to-CAS correction and simulator modeling methodology unavailable',
  examples:[{altFt:0,iasKmh:270,turnSeconds:20.3,fitRole:'single simulation-proxy fit'},
    {altFt:3000/.3048,iasKmh:270,turnSeconds:26.1,fitRole:'withheld simulation-proxy comparison'}]
};
function polarAtE(e){
  const anchor=M.cd0FromAnchor(F4,'C',e);
  if(!anchor?.valid)throw Error('Invalid reanchored F4 polar at e='+e);
  return {e,cd0:anchor.cd0,source:'325 mph combat anchor plus explicitly scenario-dependent e (not measured F4 low-speed polar)'};
}
function turnAt(e,altFt,casKmh=270,rating='emergency',powerFactor=1){
  const tasMph=M.tasFrom(casKmh/KPH_PER_MPH,'CAS',altFt);
  const at=M.evaluated(F4,altFt,tasMph,{polar:polarAtE(e),profile:'C',rating});
  if(!at.power||!at.drag)throw Error('Missing F4 turn power at '+altFt);
  // Multiplicative propulsive-power trial is used ONLY as a sensitivity,
  // not silently inserted into any flight-model coefficient.
  const v=tasMph*.44704,pav=at.power.propulsiveHp*HP_WATT*powerFactor;
  const pRatio=(pav/v-at.drag.dParasite)/at.drag.dInd;
  const nLift=at.limits.nLift;
  const nSust=pRatio>=1&&nLift>=1?Math.min(nLift,7,Math.sqrt(pRatio)):null;
  const degSec=nSust===null?null:9.80665*Math.sqrt(Math.max(0,nSust*nSust-1))/v*180/Math.PI;
  return {altFt,casProxyKmh:casKmh,reportedIasKmh:270,tasMph,sourceIasNotCalibrated:true,
    e,cd0:at.cd0,rating,shaftBhp:at.power.shaftHp,propEta:at.prop.eta,
    propulsiveHp:at.power.propulsiveHp*powerFactor,requiredHp1G:at.power.requiredHp,
    excessHp1G:at.power.propulsiveHp*powerFactor-at.power.requiredHp,
    parasiteDragLbf:at.drag.parasiteLbf,inducedDragLbf:at.drag.inducedLbf,
    nLift,nPower:pRatio>=1?Math.sqrt(pRatio):null,nSust,degSec,
    turnSeconds:degSec>0?360/degSec:null,powerFactor};
}
function solveSeaLevelE(casCorrectionKmh=0,powerFactor=1){
  const target=TURN_SOURCE.examples[0].turnSeconds;
  let low=.42,high=.71;
  if(!(turnAt(low,0,270+casCorrectionKmh,'emergency',powerFactor).turnSeconds>target &&
      turnAt(high,0,270+casCorrectionKmh,'emergency',powerFactor).turnSeconds<target))
    throw Error('Cannot bracket turn simulation benchmark for '+casCorrectionKmh+' / '+powerFactor);
  for(let i=0;i<65;i++){
    const mid=(low+high)/2;
    if(turnAt(mid,0,270+casCorrectionKmh,'emergency',powerFactor).turnSeconds>target)low=mid;else high=mid;
  }
  return (low+high)/2;
}
function f4StandardEas(e,powerFactor=1,rating='combat',altFt=5000,easMph=170){
  const tas=M.tasFrom(easMph,'EAS',altFt),raw=M.evaluated(F4,altFt,tas,{polar:polarAtE(e),profile:'C',rating});
  const speed=M.casFromTrue(tas,altFt)*KPH_PER_MPH;
  const ans=turnAt(e,altFt,speed,rating,powerFactor);
  return {...ans,easMph,casProxyKmh:speed,sourceIasNotCalibrated:false,
    note:'170 mph EAS is a model-specified comparison, not IL-2 270 km/h IAS'};
}
function nearPowerDerivative(ac,alt,tas,bhp,rating){
  const pMinus=M.propEta(ac,alt,tas,bhp*.9,'C',rating);
  const pBase=M.propEta(ac,alt,tas,bhp,'C',rating);
  const pPlus=M.propEta(ac,alt,tas,bhp*1.1,'C',rating);
  return {atTasMph:tas,atAltFt:alt,bhp,rating,etaAtMinus10PercentPower:pMinus.eta,
    etaAtNominal:pBase.eta,etaAtPlus10PercentPower:pPlus.eta,
    deltaEtaPlusMinus:pPlus.eta-pMinus.eta,atCp:pBase.Cp,atJ:pBase.J,
    slopeSign:pPlus.eta>pMinus.eta?'increasing':pPlus.eta<pMinus.eta?'decreasing':'flat'};
}
function run(){
  const workingE=solveSeaLevelE();
  const f4TurnCurves=TURN_SOURCE.examples.map(point=>({altFt:point.altFt,reportedReferenceSeconds:point.turnSeconds,
    points:Array.from({length:17},(_,i)=>230+i*5).map(kmh=>({kmh,
      generic:turnAt(.78,point.altFt,kmh).turnSeconds,
      greg:turnAt(.55767,point.altFt,kmh).turnSeconds,
      conditioned:turnAt(workingE,point.altFt,kmh).turnSeconds}))}));
  const sourceRows=TURN_SOURCE.examples.map(x=>{
    const generic=turnAt(.78,x.altFt),greg=turnAt(.55767,x.altFt),conditioned=turnAt(workingE,x.altFt);
    return {observed:x,referenceType:'another simulation, NOT period flight test',
      generic:{...generic,residualSeconds:generic.turnSeconds-x.turnSeconds},
      greg:{...greg,residualSeconds:greg.turnSeconds-x.turnSeconds},
      conditioned:{...conditioned,residualSeconds:conditioned.turnSeconds-x.turnSeconds}};
  });
  const casSensitivity=[-5,0,5].map(delta=>{
    const e=solveSeaLevelE(delta);
    const predicted=turnAt(e,3000/.3048,270+delta);
    return {assumedIasMinusCasKmh:-delta,assumedCasMinusIasKmh:delta,conditionedE:e,
      withheld3000mSeconds:predicted.turnSeconds,withheldResidualSeconds:predicted.turnSeconds-26.1};
  });
  const powerSensitivity=[.95,1,1.05].map(factor=>{
    const eFitToSea=solveSeaLevelE(0,factor);
    const f4=turnAt(workingE,0,270,'emergency',factor);
    const f4Alt=turnAt(workingE,3000/.3048,270,'emergency',factor);
    const f4Combat=f4StandardEas(workingE,factor);
    const p51May=p51.run().p51ClimbPowerGap.map(x=>{
      const effectiveHp=(factor-1)*x.modelEta*x.shaftBhp;
      const fpmShift=effectiveHp*HP_WATT/(9335*N_PER_LBF)*FPM_PER_MPS;
      return {rating:x.rating,sourceFpm:x.observedFpm,baselineFpm:x.modelFpm,
        powerDeltaHp:effectiveHp,newEstimatedFpm:x.modelFpm+fpmShift,
        residualFpm:x.modelFpm+fpmShift-x.observedFpm,
        caveat:'Local fixed-optimal-speed sensitivity; not reoptimized climb or a physical η correction'};
    });
    return {multiplierForDiagnosticOnly:factor,turnAtFixedConditionedE:{seaLevelSeconds:f4.turnSeconds,
      at3000mSeconds:f4Alt.turnSeconds,combat5000ft170EasDegSec:f4Combat.degSec},
      eIfSimulationSeaLevelReFitted:eFitToSea,simWithheldTurnSecondsAfterRefit:turnAt(eFitToSea,3000/.3048,270,'emergency',factor).turnSeconds,
      p51Climb:p51May};
  });
  const fixedECompare=[.55767,workingE,.78].map(e=>({e,
    anchor:M.cd0FromAnchor(F4,'C',e),combatSpeedMph:M.maxSpeed(F4,0,{polar:polarAtE(e),profile:'C',rating:'combat'}),
    emergencySpeedMph:M.maxSpeed(F4,0,{polar:polarAtE(e),profile:'C',rating:'emergency'}),
    comparison:f4StandardEas(e),
    oneToFiveKmClimb:'see unchanged v1.5 climb integration (rating combat)' }));
  const rawP51=p51.run();
  const p51PropSlope=nearPowerDerivative(P51,2200,171,rawP51.p51ClimbPowerGap[0].shaftBhp,'67inHg');
  const f4PropSlope=nearPowerDerivative(F4,5000,M.tasFrom(170,'EAS',5000),
    M.shaftPower(F4,5000,'combat','auto').bhp,'combat');
  return {version:'v1.7-joint-low-speed-and-IL2-conditional-holdout',
    f4TurnIndependentSimReference:TURN_SOURCE,
    f4WorkingSimulatorConditionedE:workingE,f4HistoricalPolarMeasurement:false,
    sourceRows,f4TurnCurves,casSensitivity,powerSensitivity,fixedECompare,
    p51Fig5:rawP51.scenarios.map(x=>({profile:x.profile,lowMidMAEBhp:x.lowAndMidSpeed.MAEBhp,allMAEBhp:x.summary.MAEBhp})),
    p51Climb:rawP51.p51ClimbPowerGap,
    nacaPowerSlope:{source:'NACA TN 2022 (1950) three-bladed radial-fighter propeller flight test; qualitative mechanism only',
      url:'https://ntrs.nasa.gov/citations/19930082679',
      measuredQualitativeClimbTrend:'at 165 mph IAS, increased propeller blade power loading lowered efficiency by higher induced losses',
      applicability:'Different propeller/blade/airframe; cannot transfer empirical numeric η correction to P51/F4',
      currentHeuristicP51:p51PropSlope,currentHeuristicF4:f4PropSlope},
    interpretation:'F4 e fitted to a different modern flight simulator, NOT a historical efficiency. 3000m withheld check tests conditional reproducibility; it cannot validate flight-test accuracy. Shared heuristic incorrectly trends prop efficiency upward with power loading in low speed, unlike qualitative NACA measurements on different propellers; requires type-relevant map rather than ad hoc correction. P51 absolute power deficit remains.'};
}
if(require.main===module){const result=run();if(process.argv.includes('--write')){
  const out=path.join(__dirname,'../baseline/joint_low_speed_results_v17.json');
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
  console.log('Wrote '+out);
}else if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));else{
  console.log('F4 conditional e: '+result.f4WorkingSimulatorConditionedE.toFixed(5));
  for(const r of result.sourceRows)console.log('F4 '+r.observed.altFt.toFixed(0)+' ft: sim '+r.observed.turnSeconds+'s; e=.78 '+r.generic.turnSeconds.toFixed(2)+'s; Greg '+r.greg.turnSeconds.toFixed(2)+'s; conditioned '+r.conditioned.turnSeconds.toFixed(2)+'s');
  console.log('P51 power loading η slope: '+result.nacaPowerSlope.currentHeuristicP51.slopeSign);
  console.log('F4 power loading η slope: '+result.nacaPowerSlope.currentHeuristicF4.slopeSign);
}}
module.exports={run,turnAt,solveSeaLevelE,f4StandardEas};
