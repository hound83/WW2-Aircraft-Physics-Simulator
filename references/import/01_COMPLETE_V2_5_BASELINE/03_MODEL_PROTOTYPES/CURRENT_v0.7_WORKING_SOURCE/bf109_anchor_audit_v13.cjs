/* v1.3: The Bf109F4 325-mph anchor has an unresolved engine-rating label.
 * Compare BOTH labels and BOTH e candidates using identical physics.
 * This is scenario arithmetic, not historical calibration of the turn curve.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const model=require('./physics.js');
const source=require('./cases.json');

const FT_1000M=1000/0.3048;
const LOW_EAS=170;
function round(x,n=3){return x==null?null:Number(x.toFixed(n));}
function predictVariant(ac,anchorRating,e,label){
  const anchorAircraft={...ac,calibration:{...ac.calibration,rating:anchorRating}};
  const fit=model.cd0FromAnchor(anchorAircraft,'C',e);
  if(!fit?.valid)throw Error('Cannot fit a plausible CD0 for '+label);
  const polar={cd0:fit.cd0,e,source:'conditional 325 mph '+anchorRating+' scenario; not independently validated'};
  const speedAt=(altFt,rating)=>model.maxSpeed(ac,altFt,{polar,rating});
  const turnAt=eas=>{
    const r=model.evaluated(ac,5000,model.tasFrom(eas,'EAS',5000),{polar,rating:'emergency'});
    return {easMph:eas,sustainedDegSec:r.limits?.sustDegSec??null,
      sustainedG:r.limits?.nSust??null,instantDegSec:r.limits?.instantDegSec??null,
      stallEasMph:r.stallEasMph,powerRequiredHp:r.power?.requiredHp??null,
      propulsiveHp:r.power?.propulsiveHp??null};
  };
  return {id:label,anchorRating,oswald:e,cd0:fit.cd0,anchorMph:325,
    anchorEfficiency:fit.etaAtAnchor,
    seaLevel:{combatMph:speedAt(0,'combat'),emergencyMph:speedAt(0,'emergency')},
    emergencyAt5000ftMph:speedAt(5000,'emergency'),
    emergencyAt15000ftMph:speedAt(15000,'emergency'),
    turnAt5000ft170mphEAS:turnAt(LOW_EAS),
    turnCurveAt5000ft:Array.from({length:46},(_,i)=>turnAt(95+i*5)),
    emergencySpeedCurve:Array.from({length:16},(_,i)=>{
      const altFt=i*1000;
      return {altFt,vmaxMph:speedAt(altFt,'emergency')};
    })
  };
}
function regression(ac){
  const base={rating:ac.defaultRating};
  const rows=ac.observedSpeed.filter(r=>r.rating===ac.defaultRating)
     .map(r=>({...r,modeledMph:model.maxSpeed(ac,r.altFt,base)}));
  const holdouts=rows.filter(r=>r.altFt!==ac.calibration.altFt);
  return {aircraft:ac.name,fitAltitudeFt:ac.calibration.altFt,fitMph:ac.calibration.tasMph,
    holdoutCount:holdouts.length,
    meanAbsErrorMph:holdouts.reduce((s,r)=>s+Math.abs(r.modeledMph-r.mphTas),0)/holdouts.length,
    maxAbsErrorMph:Math.max(...holdouts.map(r=>Math.abs(r.modeledMph-r.mphTas))),
    rows:rows.map(r=>({altFt:r.altFt,observedMph:r.mphTas,modeledMph:r.modeledMph,
      residualMph:r.modeledMph-r.mphTas}))};
}
function run(){
 const ac=source.aircraft.bf109f4,greg=model.inferredGregF4(ac,source.greg.bf109f4);
 const variants=[
  predictVariant(ac,'combat',.78,'combat_anchor_generic_e'),
  predictVariant(ac,'combat',greg.oswald,'combat_anchor_greg_e'),
  predictVariant(ac,'emergency',.78,'emergency_anchor_generic_e'),
  predictVariant(ac,'emergency',greg.oswald,'emergency_anchor_greg_e')
 ];
 const combat=variants.filter(v=>v.anchorRating==='combat');
 const emergency=variants.filter(v=>v.anchorRating==='emergency');
 return {
  version:'v1.3-Bf109-anchor-identifiability',
  status:'conditional model scenarios only; engine-rating label for 325 mph unresolved',
  methodology:'No modifications to physics.js or cases.json. Exactly one CD0 is derived from 325 mph for each rating+e hypothesis; prop candidate, geometry, mass and power curves fixed. None of the four outcomes is independently validated turn performance.',
  suppliedInputs:{weightLb:ac.weightLb,clMaxAssumed:ac.clMaxAssumed,seaLevelAnchorMph:325,
    emergencySeaLevelBhP:model.shaftPower(ac,0,'emergency').bhp,
    combatSeaLevelBhP:model.shaftPower(ac,0,'combat').bhp,
    gregE:greg.oswald,gregCd0:greg.cd0,
    currentOswald:.78,standardTurnCondition:{altFt:5000,easMph:LOW_EAS}},
  independentEvidence:[
    {type:'contemporary-source-index',source:'1942 Bf109 F-1 through F-4 handbook part 0, listed but not extracted',url:'https://www.museumalkmaar40-45.nl/voorschriften-manuals/d-luftt/d-luftt-2109',support:'Aircraft handbook exists; no measured low-speed polar in indexed text',independentTurnConstraint:false},
    {type:'original-1943-report',source:'Messerschmitt report 109 05 E43, F airframe with G wings, high-Mach dive trials',url:'https://www.wwiiaircraftperformance.org/me109/Diving_Test_109F_W.Nr.9228_ger_eng.pdf',support:'Source authentic but modified test wing; no steady level low-speed drag or turn curve',independentTurnConstraint:false},
    {type:'original-1943-report',source:'RAF captured Bf109G-2 tropical trial, gear/flaps-up stall 112 mph IAS',url:'https://www.wwiiaircraftperformance.org/me109/me-109g2-trop.html',support:'Different 109 variant, altered engine/weight, uncorrected IAS; not usable for F CLmax fit',independentTurnConstraint:false},
    {type:'unverified-secondary-quotation',source:'Finnish G-2 1943 Kokko report quoted as 3g sustained at 360 km/h IAS, 1000m',url:'https://www.virtualpilots.fi/feature/articles/109myths/',support:'No original report in hand; G-2 not F-4; no matched CAS/power/prop-efficiency',independentTurnConstraint:false},
    {type:'game-specification',source:'IL-2 developer Bf109F4 522 km/h TAS sea level COMBAT, 1200 PS',url:'https://il2sturmovik.com/museum/fighters/bf-109-f-4/',support:'Motivates alternate rating label, but game specification is not independent flight test',independentTurnConstraint:false},
    {type:'wartime-test-secondary-summary',source:'German F-4 performance documents transcribed as 635 km/h combat at 6000m and 670 km/h emergency at 6300m',url:'https://falkeeins.blogspot.com/2017/07/',support:'High-altitude speed; F engine map currently terminates at 15748 ft, so cannot test without new measured engine-power nodes',independentTurnConstraint:false}
  ],
  variants,
  summary:{
    samePowerAndAnchorSpeedSpreadMph:Math.abs(combat[0].seaLevel.emergencyMph-combat[1].seaLevel.emergencyMph),
    engineRatingAssignmentEmergencySpeedShiftMph:combat[0].seaLevel.emergencyMph-emergency[0].seaLevel.emergencyMph,
    gregVsGenericTurnSpreadDegSec:combat[0].turnAt5000ft170mphEAS.sustainedDegSec-combat[1].turnAt5000ft170mphEAS.sustainedDegSec,
    engineRatingAssignmentTurnShiftDegSec:combat[0].turnAt5000ft170mphEAS.sustainedDegSec-emergency[0].turnAt5000ft170mphEAS.sustainedDegSec,
    modelChoice:'NONE: historical F4 low-speed polar still unidentifiable from these observations; preserve two scenarios, no new default coefficients'
  },
  historicalRegression:{p47b:regression(source.aircraft.p47b),p51b:regression(source.aircraft.p51b)},
  nextRequiredMeasurement:'One F4-specific 2nd speed point under a different weight/power condition with independently characterized propulsive power; preferably low-speed steady turn, glide polar, or calibrated stall test and a contemporaneous power-mode label. High-speed single-point Vmax alone cannot fix e.'
 };
}
if(require.main===module){
 const r=run();
 if(process.argv.includes('--write')){
   const out=path.join(__dirname,'bf109_anchor_results_v13.json');
   fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');
   console.log('Wrote '+out);
 }else if(process.argv.includes('--json'))console.log(JSON.stringify(r,null,2));
 else{
   console.log('Bf109F-4 325mph rating-vs-Oswald scenario audit (no default parameters changed):');
   for(const v of r.variants)console.log(`${v.id.padEnd(28)} CD0=${v.cd0.toFixed(5)}  combat SL=${v.seaLevel.combatMph.toFixed(2)}  emergency SL=${v.seaLevel.emergencyMph.toFixed(2)}  turn @5k/170EAS=${v.turnAt5000ft170mphEAS.sustainedDegSec.toFixed(2)} deg/s`);
   console.log('P47B held-out MAE '+round(r.historicalRegression.p47b.meanAbsErrorMph,2)+' mph; P51B held-out MAE '+round(r.historicalRegression.p51b.meanAbsErrorMph,2)+' mph.');
   console.log('No historical F4 low-speed polar has been validated.');
 }
}
module.exports={run};
