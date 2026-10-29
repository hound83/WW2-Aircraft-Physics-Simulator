/*
 * v2.2: an honest power/drag audit, not a fitted replacement for period data.
 *
 * Input 1: Greg's untouched 109 F-4 and high-power P-47D screenshot tables,
 *          transcribed into cases.json; P-47D != P-47B.
 * Input 2: independently sourced original P-51B-15 43-24777 20 May 1944
 *          Wright Field sea-level speed and 2200-ft climb results.
 * Input 3: IL-2's independently documented F-4 sustained-turn constraints.
 * The peak propulsive efficiency in Greg's P-47D power table is inferred
 * from the table's plateau, 2210/2600=0.85; it is not a NACA blade chart.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const M=require('../../src/physics.js');
const D=require('../../aircraft/cases.json');
const P=D.aircraft.p51b,F=D.aircraft.bf109f4;
const LBF=4.4482216152605,HP=745.699872,MPH=.44704,G=9.80665;
const lin=(nodes,x)=>{
 if(x<=nodes[0][0])return nodes[0][1];
 for(let i=1;i<nodes.length;i++)if(x<=nodes[i][0]){
  const [x0,y0]=nodes[i-1],[x1,y1]=nodes[i];
  return y0+(y1-y0)*(x-x0)/(x1-x0);
 }
 return nodes.at(-1)[1];
};
const greg109=D.greg.bf109f4.reference,greg47=D.greg.p47d28.reference;
const p109=greg109.at(-1)[7],p47=2210;
const norm109=greg109.map(r=>[r[0],r[7]/p109]);
const norm47=greg47.map(r=>[r[0],r[4]/p47]);
const speeds=[100,125,150,175,200,225,250,275,300,325];
const normalizedComparison=speeds.map(speedMph=>({speedMph,
 gregF4:lin(norm109,speedMph),gregP47D:lin(norm47,speedMph),
 differencePercentagePoints:100*(lin(norm109,speedMph)-lin(norm47,speedMph)),
 propHypothesisEta:.85*lin(norm47,speedMph),
 modelP51CEta:M.propEta(P,2200,speedMph,1603.1,'C','67inHg')?.eta}));
const sharedShapeMeanAbsoluteDifferencePct=normalizedComparison
 .slice(0,6).reduce((s,r)=>s+Math.abs(r.differencePercentagePoints),0)/6;

const input=P.climbPowerComparison;
const ratings=[{rating:'67inHg',actual:input.reportedAClimbFpm},
 {rating:'75inHg',actual:input.reportedBClimbFpm}];
const p51=ratings.map(({rating,actual})=>{
 const base={rating,gear:'low',engineModel:'ram-critical',weightLb:input.reportedTakeoffWeightLb,
  e:.78,stepMph:1,minTasMph:100,maxTasMph:290};
 const original=M.bestClimb(P,input.altFt,{...base,profile:'C'});
 const gregFixed=M.bestClimb(P,input.altFt,{...base,profile:'G'});
 const gregRefit=M.bestClimb(P,input.altFt,{...base,profile:'G',refit:true});
 const neededUsefulHp=(actual-original.climbFpm)*input.reportedTakeoffWeightLb/33000;
 const sample=M.evaluated(P,input.altFt,original.tasMph,{...base,profile:'C'});
 const etaNeededAtOriginalOptimum=original.propEta+neededUsefulHp/original.shaftHp;
 const eOne=M.bestClimb(P,input.altFt,{...base,profile:'C',e:1});
 const reducedWeight=M.bestClimb(P,input.altFt,{...base,profile:'C',weightLb:8500});
 return {rating,historicalClimbFpm:actual,sourceTakeoffWeightLb:input.reportedTakeoffWeightLb,
 original:{tasMph:original.tasMph,climbFpm:original.climbFpm,eta:original.propEta,
  shaftHp:original.shaftHp,dragRequiredHp:sample.power.requiredHp,
  excessUsefulHp:sample.power.excessHp},
 gregTransferFixedPolar:{tasMph:gregFixed.tasMph,climbFpm:gregFixed.climbFpm,
  eta:gregFixed.propEta,deltaFpm:gregFixed.climbFpm-original.climbFpm,
  residualFpm:actual-gregFixed.climbFpm},
 gregTransferRefitToOriginalSeaLevelSpeed:{tasMph:gregRefit.tasMph,
  climbFpm:gregRefit.climbFpm,residualFpm:actual-gregRefit.climbFpm,
  fittedCd0:M.cd0FromAnchor(P,'G',.78).cd0},
 sourceClimbMinusModeledFpm:actual-original.climbFpm,
 deficitUsefulHp:neededUsefulHp,
 etaRequiredAtOriginalOptimumIfOnlyPropChanged:etaNeededAtOriginalOptimum,
 eOneMaxClimbFpm:eOne.climbFpm,
 artificially8500LbMaxClimbFpm:reducedWeight.climbFpm,
 ramBoostRegulatedAtOptimum:sample.engine.ram?.regulated,
 notes:'Optimized TAS is unknown in USAAF report; η required is a one-variable thought experiment at the unchanged baseline optimum.'};
});

const anchorData={};
for(const id of ['p51b','bf109f4','p47b','spitfire_lfix_bs543']){
 const ac=D.aircraft[id],a=ac.calibration;
 const opts={rating:a.rating,gear:a.gear,weightLb:ac.weightLb,e:.78};
 const baseline=M.maxSpeed(ac,a.altFt,{...opts,profile:'C'});
 const gregTransfer=M.maxSpeed(ac,a.altFt,{...opts,profile:'G'});
 const gregRefit=M.maxSpeed(ac,a.altFt,{...opts,profile:'G',refit:true});
 anchorData[id]={sourceAnchorMph:a.tasMph,baselineMph:baseline,
  gregTransferMph:gregTransfer,gregMinusSourceMph:gregTransfer-a.tasMph,
  gregRefitMph:gregRefit,originalCd0:M.cd0FromAnchor(ac,'C',.78)?.cd0,
  gregRefitCd0:M.cd0FromAnchor(ac,'G',.78)?.cd0};
}

const fp=M.inferredGregF4(F,D.greg.bf109f4);
const sourcedPolar={cd0:fp.cd0,e:fp.oswald,source:fp.source};
const sourceTurn=[{altMeters:0,seconds:20.3},{altMeters:3000,seconds:26.1}];
function turnUsingCustomEta(air,altFt,tas,eta){
 const r=M.evaluated(air,altFt,tas,{rating:'emergency',profile:'C',polar:sourcedPolar,engineModel:'ram-critical'});
 const d=r.drag,vel=tas*MPH,available=eta*r.engine.bhp*HP;
 const n2=(available/vel-d.dParasite)/d.dInd;
 const n=Math.min(r.limits.nLift,r.limits.structG,Math.sqrt(Math.max(0,n2)));
 if(n<1)return null;
 return 360/(G*Math.sqrt(n*n-1)/vel*180/Math.PI);
}
const shaft0Emergency=M.shaftPower(F,0,'emergency','fluid')?.bhp;
const shaft0Combat=M.shaftPower(F,0,'combat','fluid')?.bhp;
const f4Speed={sourceCombatMph:F.calibration.tasMph,sourceEmergencyMph:336,
 baselineC:{combat:M.maxSpeed(F,0,{rating:'combat',profile:'C',e:.78}),
  emergency:M.maxSpeed(F,0,{rating:'emergency',profile:'C',e:.78})},
 gregPolarWithC:{combat:M.maxSpeed(F,0,{rating:'combat',profile:'C',polar:sourcedPolar}),
  emergency:M.maxSpeed(F,0,{rating:'emergency',profile:'C',polar:sourcedPolar})},
 gregPolarWithTransferredP47DShape:{combat:M.maxSpeed(F,0,{rating:'combat',profile:'G',polar:sourcedPolar}),
  emergency:M.maxSpeed(F,0,{rating:'emergency',profile:'G',polar:sourcedPolar})},
 warning:'Greg e/CD0 + assumed 109 propeller C or P-47D G can nearly match IL-2 turns but does not satisfy BOTH F-4 speed references. Do not call this independently validated.'};
const f4Turns=sourceTurn.map(({altMeters,seconds})=>{
 const altFt=altMeters/.3048,cas=270/1.609344,tas=M.trueFromCAS(cas,altFt),opts={rating:'emergency',engineModel:'ram-critical'};
 const generic=M.evaluated(F,altFt,tas,{...opts,e:.78,profile:'C',refit:true});
 const previouslySimulatorConditioned=M.evaluated(F,altFt,tas,{...opts,e:.5469811060803458,profile:'C',refit:true});
 const gc=M.evaluated(F,altFt,tas,{...opts,polar:sourcedPolar,profile:'C'});
 const gg=M.evaluated(F,altFt,tas,{...opts,polar:sourcedPolar,profile:'G'});
 const gregRatio=lin(norm109,tas);
 const eEmergency=(p109/shaft0Emergency)*gregRatio;
 const eCombat=(p109/shaft0Combat)*gregRatio;
 return {altMeters,assumedSpeed270IASasCAS:true,tasMph:tas,IL2Seconds:seconds,
  modelGenericE078Seconds:360/generic.limits.sustDegSec,
  modelSimulatorConditionedSeconds:360/previouslySimulatorConditioned.limits.sustDegSec,
  gregPolarWithCEtaSeconds:360/gc.limits.sustDegSec,
  gregPolarWithP47DTransferredEtaSeconds:360/gg.limits.sustDegSec,
  gregOriginalF4PowerScheduleIfEmergencyDenominatorSeconds:turnUsingCustomEta(F,altFt,tas,eEmergency),
  gregOriginalF4PowerScheduleIfCombatDenominatorSeconds:turnUsingCustomEta(F,altFt,tas,eCombat),
  impliedGregF4EtaIfEmergencyDenominator:eEmergency,
  impliedGregF4EtaIfCombatDenominator:eCombat};
});
const result={version:'2.2',sourceStatement:'Original Greg spreadsheet/screenshot table as comparative arithmetic; actual 1944 P-51B and 1943 Spitfire data remain primary.',
 gregPowerAvailable:{p47DPlateauHp:2210,p47DEngineAssumptionBhp:2600,
 p47DPeakEtaAssumed:2210/2600,sourceBf109F4PlateauPropulsiveHp:p109,
 normalizedComparison,sharedShapeMeanAbsoluteDifferencePct,
 warning:'Both worksheets have almost the same speed curve: probably a common modeling assumption, not independent historical propeller validation. F-4 underlying BHP/rating is not written on screenshot.'},
 mustang:{originalAirframe:'P-51B-15 43-24777, 20 May 1944',altFt:2200,
  sourceSpeedAnchorMph:P.calibration.tasMph,sourceMassNote:input.weightNotes,
  cases:p51,
  result:'Transfer of Greg P-47D shape slightly reduces climb deficit but breaks the fixed 361.5-mph anchor unless drag is recalibrated; neither alternative eliminates missing power.'},
 anchorCrossChecks:anchorData,
 bf109:{gregInferredPolar:fp,sourceIL2:'https://il2sturmovik.com/museum/fighters/bf-109-f-4/',
 gregF4ShaftSeaLevelCombatBhp:shaft0Combat,gregF4ShaftSeaLevelEmergencyBhp:shaft0Emergency,
 impliedPeakEtaIfCombatPowerRating:p109/shaft0Combat,
 impliedPeakEtaIfEmergencyPowerRating:p109/shaft0Emergency,
 seaLevelSpeedCrossCheck:f4Speed,
 note:'Source Greg worksheet says 1058 *propulsive* hp at 325 mph, but does not specify matching DB601E shaft BHP/rating; do not assert a unique η.',
 turns:f4Turns},
 settings:{weightForMustangClimbLb:9335,sourceP47Variant:'D-family high-power; not P-47B',
 propTransfer:'G is opt-in 0.85 × normalized Greg P-47D worksheet available-power curve; NOT a measured K-6523A-24/VDM/Rotol map',
 dragBaseline:'No source CD0 or e changed in baseline; G what-if is shown both at unchanged C-fitted CD0 and at re-fitted same historical sea-level speed.',
 cooling:'Mustang Meredith-effect heating/recovery not quantified; no unsupported low-speed radiator drag term added.',
 source:'cases.json and physics.js',sourcedClimbVsPredictedSpeed:'Report did not specify climb IAS/TAS; optimizing speed is a model sensitivity, not reconstructed historical procedure.'}};
if(process.argv.includes('--write')){
 const filename=path.join(__dirname,'../baseline/greg_power_budget_results_v22.json');
 fs.writeFileSync(filename,JSON.stringify(result,null,2)+'\n');
 console.log(filename);
}
console.log('Normalized speed-shape MAE Greg109-vs-Greg47:',sharedShapeMeanAbsoluteDifferencePct.toFixed(2),'percentage points');
for(const r of p51)console.log(r.rating,'source',r.historicalClimbFpm,'C',r.original.climbFpm.toFixed(1),
 'Greg transfer',r.gregTransferFixedPolar.climbFpm.toFixed(1),'Greg refit',r.gregTransferRefitToOriginalSeaLevelSpeed.climbFpm.toFixed(1),
 'required eta',r.etaRequiredAtOriginalOptimumIfOnlyPropChanged.toFixed(3));
console.log('P-51 sea level speed C',anchorData.p51b.baselineMph.toFixed(2),'G',anchorData.p51b.gregTransferMph.toFixed(2));
for(const r of f4Turns)console.log('109 alt',r.altMeters,'IL2',r.IL2Seconds,'GregPolar+G',r.gregPolarWithP47DTransferredEtaSeconds.toFixed(2));
module.exports=result;
