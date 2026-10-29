/* v1.4: Correct the historically supported Bf109F-4 325-mph COMBAT rating.
 * The ~336-mph emergency value and ~4min 1000-to-5000m climb are withheld.
 * Never solve for e using those withheld observations, and never confuse
 * a modeled peak-turn rate with a measured one.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const physics=require('./physics.js');
const cases=require('./cases.json');
const MPH_PER_KMH=1/1.609344;
const FPM_TO_MPS=.00508;
const CLIMB_START_M=1000;
const CLIMB_END_M=5000;
const CLIMB_STEP_M=250;

function rounded(n,d=3){return n===null||n===undefined?null:Number(n.toFixed(d));}
function polarFor(ac,e,label){
  const fit=physics.cd0FromAnchor(ac,'C',e);
  if(!fit?.valid)throw Error('Invalid combat-power single-anchor fit: '+label);
  return {cd0:fit.cd0,e,source:'v1.4 F4 '+label+'; CD0 fit only to 325 mph combat sea-level speed; not an independently measured polar'};
}
function turnPoint(ac,polar,rating,altFt,easMph){
  const tas=physics.tasFrom(easMph,'EAS',altFt);
  const out=physics.evaluated(ac,altFt,tas,{polar,rating});
  return {easMph,stallEasMph:out.stallEasMph,
    turnDegSec:out.limits?.sustDegSec??null,
    sustainedG:out.limits?.nSust??null,
    instantaneousDegSec:out.limits?.instantDegSec??null};
}
function climbTime(ac,polar,rating){
  const points=[];
  let elapsedS=0;
  for(let m=CLIMB_START_M;m<CLIMB_END_M;m+=CLIMB_STEP_M){
    const midAltM=m+CLIMB_STEP_M/2;
    const climb=physics.bestClimb(ac,midAltM/.3048,{polar,rating});
    if(climb.status!=='modeled-peak'||!(climb.climbFpm>0))
      return {status:'no-source-or-positive-climb',failedMidAltitudeM:midAltM,reason:climb.status};
    const climbMps=climb.climbFpm*FPM_TO_MPS;
    const segmentS=CLIMB_STEP_M/climbMps;
    points.push({midAltitudeM:midAltM,bestClimbMps:climbMps,bestClimbTasMph:climb.tasMph,
      segmentS,engineBhP:climb.shaftHp});
    elapsedS+=segmentS;
  }
  return {status:'modelled-integration',startAltitudeM:CLIMB_START_M,endAltitudeM:CLIMB_END_M,
    integrationStepM:CLIMB_STEP_M,elapsedS,elapsedMin:elapsedS/60,
    recordedRechlinSecondaryS:240,residualVsRechlinSecondaryS:elapsedS-240,points,
    caveat:'Every slice assumes instantaneous best-climb TAS, constant 30-min combat-power map, no acceleration and no climb MAP/cooling correction. The 4:00 reference is a secondary quotation, not an inspected original scan.'};
}
function p47p51Regression(ac){
  const rows=ac.observedSpeed.filter(row=>row.rating===ac.defaultRating).map(row=>{
    const predicted=physics.maxSpeed(ac,row.altFt,{rating:row.rating});
    return {altFt:row.altFt,rating:row.rating,observedMph:row.mphTas,predictedMph:predicted,
      residualMph:predicted-row.mphTas};
  });
  const holdouts=rows.filter(row=>row.altFt!==ac.calibration.altFt);
  return {aircraft:ac.name,calibration:{...ac.calibration},holdoutCount:holdouts.length,
    holdoutMeanAbsErrorMph:holdouts.reduce((sum,p)=>sum+Math.abs(p.residualMph),0)/holdouts.length,
    holdoutMaxAbsErrorMph:Math.max(...holdouts.map(p=>Math.abs(p.residualMph))),rows};
}
function variant(ac,e,label){
  const polar=polarFor(ac,e,label);
  const combat=physics.maxSpeed(ac,0,{polar,rating:'combat'});
  const emergency=physics.maxSpeed(ac,0,{polar,rating:'emergency'});
  const climb=climbTime(ac,polar,'combat');
  return {id:label,e,cd0:polar.cd0,
    seaLevel:{combatMph:combat,emergencyMph:emergency,
      withheldEmergencyMph:336,emergencyResidualMph:emergency-336,
      withheldEmergencyKmH:540,emergencyResidualKmH:emergency/MPH_PER_KMH-540},
    fiveThousandFt:{combatMph:physics.maxSpeed(ac,5000,{polar,rating:'combat'}),
      emergencyMph:physics.maxSpeed(ac,5000,{polar,rating:'emergency'}),
      combatTurn170Eas:turnPoint(ac,polar,'combat',5000,170),
      emergencyTurn170Eas:turnPoint(ac,polar,'emergency',5000,170)},
    combatClimbSeaLevel:physics.bestClimb(ac,0,{polar,rating:'combat'}),
    combatClimbTime1000to5000m:climb,
    curves:{
      combatSpeed:Array.from({length:16},(_,i)=>({altFt:i*1000,mph:physics.maxSpeed(ac,i*1000,{polar,rating:'combat'})})),
      emergencySpeed:Array.from({length:16},(_,i)=>({altFt:i*1000,mph:physics.maxSpeed(ac,i*1000,{polar,rating:'emergency'})})),
      combatTurn:Array.from({length:46},(_,i)=>turnPoint(ac,polar,'combat',5000,95+i*5)),
      emergencyTurn:Array.from({length:46},(_,i)=>turnPoint(ac,polar,'emergency',5000,95+i*5))
    }};
}
function run(){
  const ac=cases.aircraft.bf109f4;
  if(ac.calibration.rating!=='combat'||ac.calibration.tasMph!==325)
    throw Error('Bf109 calibration must be the published 325 mph combat rating');
  const greg=physics.inferredGregF4(ac,cases.greg.bf109f4);
  const generic=variant(ac,.78,'generic_e_0p78');
  const gregVariant=variant(ac,greg.oswald,'greg_worksheet_e_0p558');
  const regressions={p47b:p47p51Regression(cases.aircraft.p47b),
    p51b:p47p51Regression(cases.aircraft.p51b)};
  return {version:'v1.4-historical-combat-rating-resolved',
    modelStatus:'325 mph combat-power label corrected; emergency 336 mph independent power-setting holdout; 109 low-speed polar still unvalidated',
    sourceNotes:[
      {level:'published-secondary-wartime-record-transcription',
        url:'https://info.eduard.com/en/06-2023-1/rufe',
        claim:'Jan Bobek 2023 cites Baumgartl tables based on Rechlin: 523 km/h Bf109F4 combat speed, 540 km/h emergency sea-level speed; H.H. Vogt also 540. Exact source-test airframe/conditions not independently inspected.'},
      {level:'contemporaneous-report-discussed-in-secondary-source',
        url:'https://falkeeins.blogspot.com/2017/07/fw-190-versus-bf-109-friedrich-rechlin.html',
        claim:'Rechlin 10 December 1941 F4 vs Fw190A2 combat-weight flight comparison, original page 2 pictured; author notes restricted DB601E emergency rating in 1941.'},
      {level:'2008-forum-quotation-of-wartime-comparison-not-primary-verified',
        url:'https://www.whq-forum.de/invisionboard/index.php?showtopic=27166',
        claim:'Attribution: 109F4 climbs 1000 to 5000m in 4 min vs Fw190A2 4 min 50 sec. This datum is a provisional withheld clue, not a vetted flight-test target.'},
      {level:'simulator-not-flight-test',url:'https://il2sturmovik.com/museum/fighters/bf-109-f-4/',
        claim:'Game designer power modes are combat 30-min and emergency 1-min, prop and engine maps heuristic; not independently measured turn performance.'}
    ],
    calibration:{speedMph:325,altFt:0,rating:'combat',
      combatShaftBhp:physics.shaftPower(ac,0,'combat').bhp,
      emergencyShaftBhp:physics.shaftPower(ac,0,'emergency').bhp,
      headlineReferenceKmH:{combat:523,emergency:540},
      originalGermanReportInspected:false},
    variants:[generic,gregVariant],
    comparative:{emergencySeaLevelSpreadMph:generic.seaLevel.emergencyMph-gregVariant.seaLevel.emergencyMph,
      combatTurnDifferenceDegSec:generic.fiveThousandFt.combatTurn170Eas.turnDegSec-gregVariant.fiveThousandFt.combatTurn170Eas.turnDegSec,
      emergencyTurnDifferenceDegSec:generic.fiveThousandFt.emergencyTurn170Eas.turnDegSec-gregVariant.fiveThousandFt.emergencyTurn170Eas.turnDegSec,
      climbTimeSpreadS:gregVariant.combatClimbTime1000to5000m.elapsedS-generic.combatClimbTime1000to5000m.elapsedS,
      provisionalFourMinClimbFit:'greg-derived e is closer, but no selection: climb source indirect and prop/engine/cooling inaccuracies confound e'},
    otherAircraftRegression:regressions,
    guardrails:{
      highAltitude:'No F4 predictions beyond the rating-specific sourced engine nodes: combat 16076 ft; emergency 15748 ft',
      publishedEmergencySpeed:'Held-out 540 km/h / 336 mph is a different engine rating, NOT a second independently measured drag-polar point',
      lowSpeed:'Do not adopt either e or CLmax based on max level speed or weakly sourced climb time',
      turnDuration:'Combat rating max 30 minutes; emergency rating max 1 minute. Geometric steady turn capability at emergency power cannot be maintained indefinitely.',
      historicBaseline:'v1.3 emergency-anchor plots and values remain in archive as superseded, not current physics model'
    }};
}
if(require.main===module){
  const result=run();
  if(process.argv.includes('--write')){
    const dest=path.join(__dirname,'bf109_rating_results_v14.json');
    fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');
    console.log('Wrote '+dest);
  }else if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
  else{
    for(const v of result.variants)console.log(`${v.id} | CD0=${v.cd0.toFixed(5)} | combat SL ${v.seaLevel.combatMph.toFixed(2)} mph | emergency SL ${v.seaLevel.emergencyMph.toFixed(2)} mph (+${v.seaLevel.emergencyResidualMph.toFixed(2)}) | combat 1000->5000m ${v.combatClimbTime1000to5000m.elapsedS.toFixed(1)}s`);
    for(const [id,r] of Object.entries(result.otherAircraftRegression))console.log(`${id}: ${r.holdoutCount} held-out max-speed points; MAE ${r.holdoutMeanAbsErrorMph.toFixed(2)} mph`);
  }
}
module.exports={run};
