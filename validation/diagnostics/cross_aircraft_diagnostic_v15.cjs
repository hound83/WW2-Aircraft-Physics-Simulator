/* European Air War clean physics v1.5: source-aware discriminating experiment.
 * Correct DB601E rated prop RPM, re-anchor a single CD0 per prop/e scenario,
 * and compare held-out level speeds + genuinely limited climb constraints.
 * No fitting to F4 turn or climb and NO cross-aircraft coefficient transplant.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const M=require('../../src/physics.js');
const D=require('../../aircraft/cases.json');
const CLIMB_INTERVAL_M=250;
const MPS_PER_FPM=.00508;
const TARGET_109_EAS=170;
const TARGET_109_FT=5000;

function fit(ac,e,profile){
  const r=M.cd0FromAnchor(ac,profile,e);
  if(!r?.valid)throw Error(`${ac.name}: unusable single-anchor polar for ${profile} / e=${e}`);
  return {polar:{cd0:r.cd0,e,source:`v1.5 anchored ${profile} / e=${e}; single sea-level or 5000-ft observed speed only`},
    anchorEta:r.etaAtAnchor};
}
function climbTime(ac,polar,profile,rating,startM=1000,endM=5000){
  const steps=[];
  let seconds=0;
  for(let m=startM;m<endM;m+=CLIMB_INTERVAL_M){
    const midM=m+CLIMB_INTERVAL_M/2;
    const r=M.bestClimb(ac,midM/.3048,{polar,profile,rating});
    if(r.status!=='modeled-peak'||!(r.climbFpm>0))
      return {status:'unavailable',atM:midM,reason:r.status};
    const secondsThisStep=CLIMB_INTERVAL_M/(r.climbFpm*MPS_PER_FPM);
    seconds+=secondsThisStep;
    steps.push({midAltitudeM:midM,climbMps:r.climbFpm*MPS_PER_FPM,
      bestTasMph:r.tasMph,shaftBhp:r.shaftHp,secondsThisStep});
  }
  return {status:'integrated-optimistic-peak',startM,endM,seconds,minutes:seconds/60,
    reportedF4RechlinSecondarySeconds:240,
    residualSeconds:seconds-240,
    steps,note:'Optimized best TAS at every step; no acceleration, climb IAS schedule, exact cooling/prop calibration or observed climb power. Rechlin 4:00 is SECONDARY quotation.'};
}
function turn(ac,polar,profile,easMph=TARGET_109_EAS,rating='combat',altFt=TARGET_109_FT,other={}){
  const tas=M.tasFrom(easMph,'EAS',altFt);
  const r=M.evaluated(ac,altFt,tas,{polar,profile,rating,...other});
  return {status:r.status,altFt,easMph,tasMph:tas,
    degSec:r.limits?.sustDegSec??null,g:r.limits?.nSust??null,
    instantDegSec:r.limits?.instantDegSec??null,stallEasMph:r.stallEasMph,
    nLift:r.limits?.nLift??null,nPower:r.limits?.nPower??null,
    propEta:r.prop?.eta??null,propRpm:r.prop?.propRpm??null,
    propulsiveHp:r.power?.propulsiveHp??null,
    parasiteDragLbf:r.drag?.parasiteLbf??null,inducedDragLbf:r.drag?.inducedLbf??null};
}
function oneAircraft(ac,profile,e=.78){
  const {polar,anchorEta}=fit(ac,e,profile);
  const rows=ac.observedSpeed.filter(r=>r.rating===ac.defaultRating).map(r=>{
    const pred=M.maxSpeed(ac,r.altFt,{polar,profile,rating:r.rating});
    return {altFt:r.altFt,reportedMph:r.mphTas,modelMph:pred,
      residualMph:pred===null?null:pred-r.mphTas,
      role:r.altFt===ac.calibration.altFt?'calibration':'withheld'};
  });
  const hold=rows.filter(r=>r.role==='withheld'&&r.modelMph!=null);
  const mae=hold.reduce((s,r)=>s+Math.abs(r.residualMph),0)/hold.length;
  return {id:ac.name,profile,e,polar,anchorEta,speed:{rows,holdoutCount:hold.length,holdoutMAEMph:mae,
    holdoutMaxErrorMph:Math.max(...hold.map(r=>Math.abs(r.residualMph)))}};
}
function p47Climb(ac,polar,profile){
  const point=ac.observedClimb[0];
  const fitted=M.equivalentClimbDrag(ac,point,{polar,profile});
  if(fitted.status!=='derived')throw Error('Cannot form source-conditioned P47 climb benchmark');
  const rows=ac.observedClimb.map((obs,i)=>{
    const calc=M.climbPrediction(ac,obs,{polar,profile,addedCd0:fitted.addedCd0});
    return {altFt:obs.altFt,reportedFpm:obs.fpm,modeledFpm:calc.predictedFpm,
      residualFpm:calc.residualFpm,
      rating:obs.rating||ac.defaultRating,role:i?'withheld':'one-point-cooling/configuration-fit'};
  });
  const hold=rows.filter(r=>r.role==='withheld');
  return {fittedConfigurationCd0:fitted.addedCd0,fitAltitudeFt:point.altFt,
    withheldCount:hold.length,withheldMAEFpm:hold.reduce((s,p)=>s+Math.abs(p.residualFpm),0)/hold.length,
    rows,qualification:'At 15000 ft, historical P47 climb MAP is used to fit an aggregate configuration loss. Four other altitudes are withheld; this is not a test of zero unknown cooling drag.'};
}
function p51Climb(ac,polar,profile){
  const reports=[];
  for(const memo of ac.climbReports){
    const rows=memo.observations.map(obs=>{
      const pred=M.bestClimb(ac,obs.altFt,{polar,profile,rating:obs.rating,weightLb:memo.takeoffWeightLb});
      return {altFt:obs.altFt,rating:obs.rating,reportedFpm:obs.fpm,
        modeledFpm:pred.status==='modeled-peak'?pred.climbFpm:null,
        residualFpm:pred.status==='modeled-peak'?pred.climbFpm-obs.fpm:null,
        modeledOptimumTasMph:pred.tasMph??null,
        matchedHistoricalClimbAirspeed:false};
    });
    const good=rows.filter(r=>r.residualFpm!==null);
    reports.push({id:memo.id,date:memo.date,reportedTakeoffWeightLb:memo.takeoffWeightLb,
      status:'same test programme, not an independent flight-test series',
      MAEFpm:good.reduce((s,r)=>s+Math.abs(r.residualFpm),0)/good.length,rows});
  }
  const may20=reports.find(x=>x.id==='wright-1944-05-20');
  const gain=may20.rows[1].modeledFpm-may20.rows[0].modeledFpm;
  return {reports,boostGain:{reportedFpm:560,modeledFpm:gain,residualFpm:gain-560,
    status:'held-out same-airframe rating differential with unmatched climb IAS; no climb rating fit'}};
}
function powerFactorTurn(r,powerFactor){
  const v=r.tasMph*.44704;
  const parasiteN=r._drag.dParasite,inducedN=r._drag.dInd;
  const powerWatts=r._powerWatts*powerFactor;
  const sq=(powerWatts/v-parasiteN)/inducedN;
  if(sq<1)return null;
  const n=Math.min(r.nLift,7,Math.sqrt(sq));
  return 9.80665*Math.sqrt(Math.max(0,n*n-1))/v*180/Math.PI;
}
function sensitivity(ac,gregE){
  const profile='C',reference=fit(ac,.78,profile).polar,
    other=fit(ac,gregE,profile).polar;
  const basic=turn(ac,reference,profile),lowerEAtFrozenCd0=turn(ac,{...reference,e:gregE},profile),
    lowerERefit=turn(ac,other,profile);
  const tas=M.tasFrom(TARGET_109_EAS,'EAS',TARGET_109_FT);
  const physical=M.evaluated(ac,TARGET_109_FT,tas,{polar:reference,profile,rating:'combat'});
  const forFactor=f=>powerFactorTurn({...basic,_drag:physical.drag,
    _powerWatts:physical.power.propulsiveHp*745.6998716},f);
  const eRefitChange=forE=>turn(ac,fit(ac,forE,'C').polar,'C').degSec;
  const paramSensitivity={
    e10pct:{minus:eRefitChange(.78*.9),base:basic.degSec,plus:eRefitChange(.78*1.1)},
    weight5pct:{minus:turn(ac,reference,profile,TARGET_109_EAS,'combat',TARGET_109_FT,{weightLb:ac.weightLb*.95}).degSec,
      base:basic.degSec,plus:turn(ac,reference,profile,TARGET_109_EAS,'combat',TARGET_109_FT,{weightLb:ac.weightLb*1.05}).degSec},
    clMax10pct:{minus:turn(ac,reference,profile,TARGET_109_EAS,'combat',TARGET_109_FT,{clMax:ac.clMaxAssumed*.9}).degSec,
      base:basic.degSec,plus:turn(ac,reference,profile,TARGET_109_EAS,'combat',TARGET_109_FT,{clMax:ac.clMaxAssumed*1.1}).degSec},
    propulsivePower5pct:{minus:forFactor(.95),base:basic.degSec,plus:forFactor(1.05)}
  };
  return {condition:{altFt:TARGET_109_FT,easMph:TARGET_109_EAS,rating:'combat'},
    generic:basic,greg:lowerERefit,
    decomposition:{
      eChangeAtFrozenCd0DegSec:lowerEAtFrozenCd0.degSec-basic.degSec,
      followOnCd0RefitDegSec:lowerERefit.degSec-lowerEAtFrozenCd0.degSec,
      totalDegSec:lowerERefit.degSec-basic.degSec,
      meaning:'Exact path: lower e with CD0 held, then refit CD0 once to preserve the 325-mph historical speed. Not a derivative or causal measurement.'},
    paramSensitivity,perturbationDisclaimer:'These +/-5% or +/-10% perturbations diagnose sensitivity; they are not historical error bars or permissible aircraft-to-aircraft adjustments.'};
}
function f4Run(profile,e){
  const ac=D.aircraft.bf109f4,{polar,anchorEta}=fit(ac,e,profile),
    combatMax=M.maxSpeed(ac,0,{polar,profile,rating:'combat'}),
    emergencyMax=M.maxSpeed(ac,0,{polar,profile,rating:'emergency'});
  return {profile,e,polar,anchorEta,
    propAtCombatAnchor:M.propEta(ac,0,325,M.shaftPower(ac,0,'combat').bhp,profile,'combat'),
    propAtEmergencySpeed:M.propEta(ac,0,336,M.shaftPower(ac,0,'emergency').bhp,profile,'emergency'),
    speed:{calibrationCombatMph:combatMax,publishedCombatMph:325,
      withheldEmergencyMph:336,predictedEmergencyMph:emergencyMax,
      emergencyResidualMph:emergencyMax-336},
    climb:climbTime(ac,polar,profile,'combat'),
    turn170EasCombat:turn(ac,polar,profile),
    maxSpeedCurveCombat:Array.from({length:16},(_,i)=>({altFt:i*1000,
      mph:M.maxSpeed(ac,i*1000,{polar,profile,rating:'combat'})}))};
}
function run(){
  const f4=D.aircraft.bf109f4;
  const ratio=f4.propGeometry.reductionRatioEnginePerProp;
  if(Math.abs(ratio-1.685)>.0001)throw Error('v1.5 must use documented 1.685 DB601E reduction ratio');
  const greg=M.inferredGregF4(f4,D.greg.bf109f4);
  const profiles=[];
  for(const profile of ['A','B','C']){
    const p47=oneAircraft(D.aircraft.p47b,profile),p51=oneAircraft(D.aircraft.p51b,profile);
    profiles.push({profile,
      f4:{generic:f4Run(profile,.78),greg:f4Run(profile,greg.oswald)},
      p47:{...p47,climb:p47Climb(D.aircraft.p47b,p47.polar,profile)},
      p51:{...p51,climb:p51Climb(D.aircraft.p51b,p51.polar,profile)}});
  }
  const c=profiles.find(p=>p.profile==='C');
  return {version:'v1.5-rated-prop-RPM-and-diagnostic',
    changedPhysics:'DB601E rating-aware propeller rpm: combat=2500/1.685, emergency=2700/1.685. Universal prop-efficiency function receives rating. No e, CLmax, prop-profile or hidden aircraft-specific fitting adjustments.',
    sources:[
      {grade:'original 1941 German Bf109F2/F4 technical manual facsimile, text indexed; scan not saved',url:'https://stephentaylorhistorian.com/wp-content/uploads/2020/04/bf109f-2-f-4wa.pdf',claim:'DB601E for Bf109F3/F4 propeller reduction 1.685:1, unlike DB601N 1.55:1'},
      {grade:'original wartime report scan, inspected',url:'https://www.wwiiaircraftperformance.org/me109/VB-109-19-L-42.pdf',claim:'Messerschmitt September 1942 DB601E installed in Bf109G1 climbed at 2500 engine RPM / 1.30 ata and 260kmh IAS; different airframe, not F4 glide/turn or direct climb-speed measurement'},
      {grade:'published source synthesis citing Rechlin',url:'https://info.eduard.com/en/06-2023-1/rufe',claim:'Bf109F4 325mph combat SL, 336mph emergency SL; second rating is withheld computationally but from same historical analysis'},
      {grade:'secondary unverified report quotation',url:'https://www.whq-forum.de/invisionboard/index.php?showtopic=27166',claim:'Rechlin F4 supposedly 1000m to 5000m in 4:00; no original numeric table inspected'},
      {grade:'engine-mode proxy, simulated specification',url:'https://il2sturmovik.com/museum/fighters/bf-109-f-4/',claim:'DB601E 2500 combat, 2700 emergency; not a measured propeller efficiency map'}
    ],
    f4Reduction:{oldLegacyRatio:1/.645,correctRatio:ratio,
      combatEngineRpm:2500,combatPropRpm:2500/ratio,
      emergencyEngineRpm:2700,emergencyPropRpm:2700/ratio},
    greg:{f4DerivedE:greg.oswald,f4DerivedCd0:greg.cd0,
      note:'Greg F4 e inferred from a drag/power spreadsheet at a nominal mass; not observed Oswald efficiency'},
    profiles,turnSensitivity:sensitivity(f4,greg.oswald),
    decision:{
      propulsion:'Profile C yields the lowest held-out speed error on both Allied planes under equal single-anchor refits. This is cross-aircraft model discrimination, not a measured propeller map.',
      inducedDrag:'No F4-specific calibrated low-speed polar is validated. The 4-minute Rechlin clue and Greg worksheet cannot independently establish an Oswald factor; wrong gear ratio previously created a misleading 3:59 coincidence.',
      currentBaseline:'Keep F4 generic e=.78 provisional in interactive UI and preserve Greg-derived e=.558 as explicit sensitivity case, rather than artificially narrowing a band.',
      limit:'F4 emergency power documented to 15748ft, combat to 16076ft; 27000ft F4 comparisons remain unavailable.'
    },
    keyMetrics:{p47SpeedHoldoutMaeMph:c.p47.speed.holdoutMAEMph,
      p51SpeedHoldoutMaeMph:c.p51.speed.holdoutMAEMph,
      f4GenericClimbSeconds:c.f4.generic.climb.seconds,
      f4GregClimbSeconds:c.f4.greg.climb.seconds,
      f4EmergencyGenericMph:c.f4.generic.speed.predictedEmergencyMph,
      f4EmergencyGregMph:c.f4.greg.speed.predictedEmergencyMph}
  };
}
if(require.main===module){
  const result=run();
  if(process.argv.includes('--write')){
    const target=path.join(__dirname,'../baseline/cross_aircraft_results_v15.json');
    fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');
    console.log('Wrote '+target);
  }else if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
  else{
    for(const p of result.profiles){
      console.log(`${p.profile}: P47 speed MAE ${p.p47.speed.holdoutMAEMph.toFixed(2)} mph, P51 speed MAE ${p.p51.speed.holdoutMAEMph.toFixed(2)} mph; F4 climb generic ${p.f4.generic.climb.seconds.toFixed(1)}s Greg ${p.f4.greg.climb.seconds.toFixed(1)}s; F4 5k/170EAS turn ${p.f4.generic.turn170EasCombat.degSec.toFixed(2)} vs ${p.f4.greg.turn170EasCombat.degSec.toFixed(2)} deg/s`);
      console.log(`  P47 cooled-climb holdouts MAE ${p.p47.climb.withheldMAEFpm.toFixed(0)} fpm; P51 May20 boost delta error ${p.p51.climb.boostGain.residualFpm.toFixed(0)} fpm`);
    }
    console.log('F4 rated prop rpm combat/emergency',result.f4Reduction.combatPropRpm.toFixed(1),result.f4Reduction.emergencyPropRpm.toFixed(1));
    console.log('F4 turn decomposition',result.turnSensitivity.decomposition);
  }
}
module.exports={run};
