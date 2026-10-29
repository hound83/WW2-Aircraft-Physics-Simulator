/* Four-aircraft cross-check against same-specimen A&AEE Spitfire IXc BS.543.
 * Primary speeds and climbs are HISTORICAL observations; BHP beyond the two
 * published Merlin 66 critical-altitude ratings is visibly a PROXY.
 * Original candidate C remains unchanged; no new per-aircraft efficiency.
 */
'use strict';
const fs=require('fs'),path=require('path');
const M=require('./physics.js'),D=require('./cases.json');
const spit=D.aircraft.spitfire_lfix_bs543;
const P=path.join(__dirname,'spitfire_results_v20.json');
const LBF=4.4482216153,HP=745.6998716,MPH=.44704,FTM=196.8503937;
const classicE=.78,classicProfile='C';
function active(ac,altFt,tasMph,extra={}){
 return M.evaluated(ac,altFt,tasMph,{profile:classicProfile,e:classicE,...extra});
}
function availableEtaForLevel(ac,observation){
 const sh=M.shaftPower(ac,observation.altFt,observation.rating,observation.gear);
 const polar=M.cd0FromAnchor(ac,classicProfile,classicE);
 if(!sh||!polar?.valid)return null;
 const drag=M.dragBreakdown(ac,observation.altFt,observation.mphTas,ac.weightLb,polar.cd0,classicE);
 return drag.requiredHp/sh.bhp;
}
function speedAudit(){
 const rows=spit.observedSpeed.map(o=>{
  const speed=M.maxSpeed(spit,o.altFt,{rating:o.rating,gear:o.gear});
  const shaft=M.shaftPower(spit,o.altFt,o.rating,o.gear);
  const eta=M.propEta(spit,o.altFt,o.mphTas,shaft.bhp,classicProfile,o.rating);
  const requiredEta=availableEtaForLevel(spit,o);
  return {...o,modelTasMph:speed,residualMph:speed==null?null:speed-o.mphTas,
   shaftBhpProxy:shaft.bhp,shaftPowerEvidence:shaft.powerEvidence??null,
   propEtaAtReportedSpeed:eta.eta,requiredEtaAtReportedSpeed:requiredEta,
   advanceRatioJ:eta.J,powerCoefficientCp:eta.Cp};
 });
 const held=rows.filter(r=>!(r.altFt===0&&r.gear==='low')&&Number.isFinite(r.residualMph));
 return {status:'A&AEE level speed, normalized to 7,110 lb, closed radiators',
   rows,maeMph:held.reduce((v,r)=>v+Math.abs(r.residualMph),0)/held.length,
   largestResidualMph:Math.max(...held.map(r=>Math.abs(r.residualMph))),
   heldoutCount:held.length};
}
function levelBoostAt(altFt,gear){
 const nodes=spit.boostComparison.referenceLevelSpeedBoostPsi[gear];
 if(!nodes||altFt<nodes[0][0]||altFt>nodes.at(-1)[0])return null;
 for(let i=0;i<nodes.length;i++){
  if(nodes[i][0]===altFt)return nodes[i][1];
  if(i&&altFt<nodes[i][0]){
   const [al,bl]=nodes[i-1],[ah,bh]=nodes[i];
   return bl+(bh-bl)*(altFt-al)/(ah-al);
  }
 }
 return nodes.at(-1)[1];
}
function climbAudit(){
 const polar=M.cd0FromAnchor(spit,classicProfile,classicE);
 return spit.observedClimb.map(o=>{
  const sh=M.shaftPower(spit,o.altFt,o.rating,o.gear);
  const model=active(spit,o.altFt,o.tasMph,{weightLb:7485,rating:o.rating,gear:o.gear});
  const referenceBoostPsi=levelBoostAt(o.altFt,o.gear);
  const engineCondition={referenceBoostPsi,observedBoostPsi:o.reportedBoostPsi,
   source:'A&AEE Merlin 66 BS.543 Table V level speed boost vs Table II same-altitude measured climb boost; 3,000 rpm'};
  const conditionModel=active(spit,o.altFt,o.tasMph,
   {weightLb:7485,rating:o.rating,gear:o.gear,engineCondition});
  const best=M.bestClimb(spit,o.altFt,{weightLb:7485,rating:o.rating,gear:o.gear,minTasMph:115,maxTasMph:290,stepMph:1});
  const at=sh?M.propEta(spit,o.altFt,o.tasMph,sh.bhp,'C',o.rating):null;
  const drag=M.dragBreakdown(spit,o.altFt,o.tasMph,7485,polar.cd0,classicE);
  const rateMps=o.fpm/FTM;
  const requiredUsefulHp=(drag.drag*o.tasMph*MPH + 7485*LBF*rateMps)/HP;
  const requiredEta=sh?requiredUsefulHp/sh.bhp:null;
  const rotor=at&&sh?at.eta*sh.bhp:null;
  const residualHp=rotor==null?null:requiredUsefulHp-rotor;
  return {...o,predAtReportedSpeedFpm:model.power?.climbFpm??null,
   sourceBoostAtLevelSpeedPsi:referenceBoostPsi,
   conditionAwareFpm:conditionModel.power?.climbFpm??null,
   conditionAwareResidualFpm:conditionModel.power?.climbFpm!=null?conditionModel.power.climbFpm-o.fpm:null,
   conditionAwareBhp:conditionModel.engine?.bhp??null,
   conditionAwareManifoldRatio:conditionModel.engine?.absoluteManifoldRatio??null,
   predOptimizedFpm:best.climbFpm??null,modelBestTasMph:best.tasMph??null,
   shaftBhpProxy:sh?.bhp??null,actualReportRadiators:'OPEN',modelRadiators:'CLOSED baseline drag only',
   requiredPropEtaAtHistoricalClimb:requiredEta,modelPropEtaAtHistoricalClimb:at?.eta??null,
   requiredMinusModeledUsefulHp:residualHp,
   caution:'Required eta includes any missing exhaust, shaft-power or total-drag effects; it assumes CLOSED-RADIATOR drag although A&AEE climbing flaps were OPEN. Therefore NOT an inferred propeller efficiency.'};
 });
}
const secondary={
 simulator:'IL-2 Great Battles developer Mk IXe Merlin 66, DIFFERENT e-armament wing configuration, mass not matched',
 source:'https://forum.il2sturmovik.com/topic/25993-aircraft-flight-and-technical-specifications-and-operational-details/',
 points:[{altMeters:0,iasKmh:270,turnSeconds:17.7},{altMeters:3000,iasKmh:260,turnSeconds:20.5}],
 note:'IAS is NOT historical calibrated CAS. For a transparent indicative comparison ONLY, first equate simulator IAS with CAS and expose ±6 mph CAS perturbations. Historical Spitfire BS.543 uses different wing armament and its 7,110 lb *speed-reference* mass must not be mistaken for IL-2 standard combat mass.'
};
function il2TurnAudit(){
 return secondary.points.map(p=>{
  const altFt=p.altMeters/0.3048,iasMph=p.iasKmh/1.609344;
  function sample(offset,weightLb=7485){
   const tas=M.trueFromCAS(iasMph+offset,altFt);
   const r=active(spit,altFt,tas,{weightLb,rating:'combat+18'});
   return {tasMph:tas,nSust:r.limits?.nSust??null,
    turnSeconds:r.limits?.sustDegSec?360/r.limits.sustDegSec:null,
    modelEngineStatus:r.status};
  }
  const at=sample(0);
  return {...p,assumedCasMph:iasMph,modelAtTakeoffWeight:at,
   weight7110Reference:sample(0,7110),iasAsCasMinus6Mph:sample(-6),iasAsCasPlus6Mph:sample(6),
   residualAtTakeoffWeightSeconds:at.turnSeconds==null?null:at.turnSeconds-p.turnSeconds};
 });
}
function secondaryTurnConditionedScenario(){
 const reference=secondary.points[0];
 const iasMph=reference.iasKmh/1.609344;
 const sourceTas=M.trueFromCAS(iasMph,0);
 const evaluate=(e,point,refit=true)=>{
  const speed=M.trueFromCAS(point.iasKmh/1.609344,point.altMeters/0.3048);
  const r=M.evaluated(spit,point.altMeters/0.3048,speed,
   {profile:'C',e,refit,weightLb:7485,rating:'combat+18'});
  return r.limits?.sustDegSec?360/r.limits.sustDegSec:null;
 };
 const lo=.35,hi=.95;
 let best={e:null,loss:Infinity};
 for(let e=lo;e<=hi+1e-9;e+=.0005){
  const seconds=evaluate(e,reference);
  if(!Number.isFinite(seconds))continue;
  const loss=Math.abs(seconds-reference.turnSeconds);
  if(loss<best.loss)best={e,loss,turnSeconds:seconds};
 }
 const e=best.e;
 const levels=secondary.points.map(p=>({altMeters:p.altMeters,
  il2Seconds:p.turnSeconds,modelSeconds:evaluate(e,p),
  residualSeconds:evaluate(e,p)-p.turnSeconds,
  role:p.altMeters===0?'simulator-conditioned at sea level':'WITHHELD simulation altitude'}));
 const historicalSpeed=spit.observedSpeed.map(p=>{
  const modeled=M.maxSpeed(spit,p.altFt,{profile:'C',e,refit:true,rating:p.rating,gear:p.gear});
  return {altFt:p.altFt,gear:p.gear,observedMph:p.mphTas,modeledMph:modeled,
   residualMph:modeled-p.mphTas};
 });
 const heldSpeed=historicalSpeed.filter(p=>!(p.altFt===0&&p.gear==='low'));
 return {status:'NONHISTORICAL optional simulation-conditioned e exercise; NEVER identified as measured Spitfire polar',
  fittedE:e,fittedTurnSeconds:best.turnSeconds,conditionedCd0:M.cd0FromAnchor(spit,'C',e).cd0,
  levels,periodSpeedHoldoutMaeMph:heldSpeed.reduce((s,r)=>s+Math.abs(r.residualMph),0)/heldSpeed.length,
  standaloneDefaultE:classicE,method:'Single IL-2 Mk IXe sea-level 17.7s at nominal 270 km/h IAS≈CAS; source Mk IXc differs and actual IAS calibration missing. Refit historical SL speed drag anchor for altered e, test 3000m game value without fitting.'};
}
function otherPlanes(){
 const ref=require('./installed_power_results_v19.json');
 return {unchangedWorkingProfile:'C',
  priorHoldouts:{p47bFiveSpeedMaeMph:ref.scenarios[0].p47SpeedHoldouts.maeMph,
   p51bEightSpeedMaeMph:ref.scenarios[0].p51SpeedHoldouts.maeMph,
   bf109f4SeaLevelTurnSeconds:ref.scenarios[0].f4SLTurnSeconds,
   bf109f4At3000mSeconds:ref.scenarios[0].f4TurnAt3000mSeconds}};
}
function fourAtCommonCondition(altFt=0,easMph=170){
 const tas=M.tasFrom(easMph,'EAS',altFt);
 return Object.fromEntries(['spitfire_lfix_bs543','bf109f4','p51b','p47b'].map(id=>{
  const ac=D.aircraft[id];const val=active(ac,altFt,tas,{weightLb:id==='spitfire_lfix_bs543'?7485:ac.weightLb,
   e:id==='bf109f4'?.54698:classicE});
  return [id,{status:val.status,weightLb:val.weightLb,
   shaftHp:val.power?.shaftHp??null,eta:val.prop?.eta??null,
   parasiteHp:val.drag?.parasiteHp??null,inducedHp:val.drag?.inducedHp??null,
   excessHp:val.power?.excessHp??null,sustG:val.limits?.nSust??null,
   turnSeconds:val.limits?.sustDegSec?360/val.limits.sustDegSec:null,
   oswaldE:val.oswald??null}];
 }));
}
function run(){
 const climbs=climbAudit(),conditioned=climbs.filter(c=>c.conditionAwareResidualFpm!=null);
 const raw=conditioned.reduce((s,c)=>s+Math.abs(c.predAtReportedSpeedFpm-c.fpm),0)/conditioned.length;
 const corrected=conditioned.reduce((s,c)=>s+Math.abs(c.conditionAwareResidualFpm),0)/conditioned.length;
 return {version:'2.0',case:spit.name,
  provenance:'A&AEE historical original tables II/V, Rolls-Royce 1946 Merlin 66 engine published critical power points, unmeasured engine-curve proxy and all-aircraft heuristic C propeller',
  speed:speedAudit(),climb:climbs,
  boostPowerComparison:{observations:conditioned.length,rawClimbMaeFpm:raw,sourceBoostConditionedClimbMaeFpm:corrected,
   reductionFpm:raw-corrected,
   condition:'Historical source-supplied climb MAP vs level MAP, not a guessed prop or radiator correction',
   limitation:'Observed climb MAP is used as INPUT, not the observed rate. Same-airframe rate remains withheld from tuning; historical climb radiator OPEN but model drag CLOSED, and engine BHP-MAP proportionality unvalidated.'},
  secondaryIl2:secondary,il2Turns:il2TurnAudit(),
  optionalSimulatorConditionedE:secondaryTurnConditionedScenario(),
  sharedControl:otherPlanes(),commonSeaLevel170Eas:fourAtCommonCondition(),
  gates:{primarySpitSpeedValuesUnfitted:true,
   enginePowerCurveFullyIndependentOfObservedSpeeds:false,
   spitClimbRateValuesUnfitted:true,sourceClimbManifoldPressureUsedAsInput:true,
   primarySpitTurnAvailable:false,
   exactInstalledBladeEtaMapAvailable:false,
   coolingDragSourceAvailable:false,
   engineBhpFullAltitudeMapAvailable:false,
   noChangesToPreviousThreeAircraftPhysics:true}};
}
if(require.main===module){
 const result=run();if(process.argv.includes('--write'))fs.writeFileSync(P,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({speed:{mae:result.speed.maeMph,held:result.speed.heldoutCount},
  climbAt2k:result.climb[0],il2Turns:result.il2Turns,
  commonSeaLevel170Eas:result.commonSeaLevel170Eas},null,2));
}
module.exports={run};
