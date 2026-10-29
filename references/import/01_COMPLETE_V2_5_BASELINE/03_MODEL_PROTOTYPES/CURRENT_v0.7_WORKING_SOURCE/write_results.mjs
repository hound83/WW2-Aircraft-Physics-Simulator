import fs from 'node:fs';import {createRequire} from 'node:module';const require=createRequire(import.meta.url),M=require('./physics.js'),D=require('./cases.json');
let results={version:'v0.5',status:'Exploratory; all historical sustained-turn predictions unvalidated',conditions:{e:.78,propProfile:'C',cd0:'Each aircraft calibrated to exactly one historical or Greg sea-level speed, then held fixed during analysis',clmax:'assumed separately per aircraft',modelRating:'109 emergency; 47 military; 51 67 inHg',comparisonAltitudeFt:5000,comparisonSpeedEasMph:200},aircraft:{},greg:{}};
for(const [id,a] of Object.entries(D.aircraft)){
 const base=M.calibratedCd0?.(a,'C',.78)||M.cd0FromAnchor(a,'C',.78),v=M.tasFrom(200,'EAS',5000),res=M.evaluated(a,5000,v,{profile:'C',e:.78});
 const points=a.observedSpeed.filter(x=>x.rating===a.calibration.rating).map(row=>{const p=M.maxSpeed(a,row.altFt,{rating:row.rating,gear:row.gear,profile:'C'});return {altFt:row.altFt,gear:row.gear,observedMph:row.mphTas,predictedMph:p==null?null:Number(p.toFixed(3)),residualMph:p==null?null:Number((p-row.mphTas).toFixed(3)),anchor:row.altFt===a.calibration.altFt&&row.gear===a.calibration.gear};});
 const hold=points.filter(p=>!p.anchor&&p.predictedMph!=null);
 results.aircraft[id]={name:a.name,cd0Calibration:base,status:res.status,sampleAt5000ft200EAS:res.status==='modelled'?{sustainedG:res.limits.nSust,turnDegSec:res.limits.sustDegSec,stallEasMph:res.stallEasMph,shaftHp:res.power.shaftHp}:null,holds:hold.length,holdoutMAEMph:hold.length?hold.reduce((s,r)=>s+Math.abs(r.residualMph),0)/hold.length:null,maxAbsResidualMph:hold.length?Math.max(...hold.map(r=>Math.abs(r.residualMph))):null,observations:points};
}
results.greg.bf109f4={inferred:M.inferredGregF4(D.aircraft.bf109f4,D.greg.bf109f4),recreation:D.greg.bf109f4.reference.map(row=>{const r=M.greg109At(D,row[0]);return {speedMph:row[0],parasiteDiffLbf:r.paraDrag-row[1],inducedDiffLbf:r.indDrag-row[2],requiredPowerDiffHp:r.reqHp-row[4]};})};
results.greg.highPowerP47={inferred:M.inferredGregP47(D.aircraft.p47b,D.greg.p47d28),warning:'Sea-level worksheet is 2,210 propulsive hp, consistent with a 2,600 bhp / 85% scenario; not the 2,000 bhp P-47B'};
results.greg.p47bAt27000ft=D.greg.p47b27k.readings.map(([cas,gg])=>{const tas=M.tasFrom(cas,'CAS',27000),v=M.evaluated(D.aircraft.p47b,27000,tas,{profile:'C',e:.78});return {assumedCasMph:cas,impliedTasMph:tas,gregApproxG:gg,modelSustainedG:v.limits.nSust,differenceG:v.limits.nSust-gg,note:'Greg chart speed-axis CAS assumption UNVERIFIED; values approximate readings'};});
// v0.3 records: one fitted climb point, four withheld same-specimen test points.
const testPlane=D.aircraft.p47b,points=testPlane.observedClimb,fit=M.equivalentClimbDrag(testPlane,points[0]);
const comparisons=points.map((point,index)=>{const before=M.climbPrediction(testPlane,point),after=M.climbPrediction(testPlane,point,{addedCd0:fit.addedCd0});return {altFt:point.altFt,observedFtMin:point.fpm,levelFlightPowerFtMin:before.baselineFpm,estimatedClimbShaftHp:before.engine.climbBhP,conditionOnlyFtMin:before.predictedFpm,conditionAndEquivalentDragFtMin:after.predictedFpm,heldOut:index!==0,residualFtMin:after.residualFpm};});
const hold=rows=>rows.slice(1).reduce((s,r)=>s+Math.abs(r),0)/(rows.length-1);
results.climbCorrection={status:'exploratory same-test-series check, not independent cross-aircraft validation',testAircraft:'P-47B 41-5902',climbTestConfiguration:'cowl, oil/intercooler flaps fully open; engine MAP from climbing report, not high-speed MAP',enginePowerMethod:'shaft HP scaled by observed climb-vs-level MAP at same altitude and RPM, capped at authorized rating',addedDragFit:fit,holdoutUncorrectedMaeFpm:hold(comparisons.map(r=>r.levelFlightPowerFtMin-r.observedFtMin)),holdoutNewMaeFpm:hold(comparisons.map(r=>r.residualFtMin)),observations:comparisons};
const greg=D.greg.p47d28;results.greg.powerOnlySweep={status:'Greg arithmetic sensitivity, not true B versus D model verification',referenceWeightLb:13065,identicalPropAndDrag:true,variants:[2000,2600].map(bhp=>({shaftHp:bhp,maxLevelSpeedMph:M.gregP47MaxSpeed(greg,bhp),at200Mph:M.gregP47PowerPoint(greg,200,bhp)}))};
// v0.4: independent same-aircraft P-51B rating-power change (67 vs 75 inHg).
// No climb observation is fed to the solver or any fit step.
const mustang=D.aircraft.p51b,claim=mustang.climbPowerComparison;
results.p51BoostClimb={reportId:'Eng-47-1749-A',sourceUrl:claim.sourceUrl,
   observationStatus:claim.sourceQuality,observedAltitudeFt:claim.altFt,
   reported67Fpm:claim.reportedAClimbFpm,reported75Fpm:claim.reportedBClimbFpm,
   observedDeltaFpm:claim.reportedGainFpm,flightTestClimbSpeedTasMph:claim.climbSpeedTasMph,
   reportWeightLb:claim.reportedTakeoffWeightLb,calibrationPolicy:'NONE; power differences predicted with fixed CD0, unchanged weight and unchanged prop category',
   comparisons:Object.fromEntries(['A','B','C'].map(profile=>{
     const x=M.matchedPowerClimb(mustang,claim.altFt,claim.ratingA,claim.ratingB,{profile,weightLb:claim.reportedTakeoffWeightLb,minTasMph:100,maxTasMph:280});
     return [profile,{shaftPowerGainHp:x.deltaShaftHp,
       model67Fpm:x.a.climbFpm,model75Fpm:x.b.climbFpm,modelDeltaFpm:x.deltaClimbFpm,
       modelDeltaResidualFpm:x.deltaClimbFpm-claim.reportedGainFpm,
       absolute67ResidualFpm:x.a.climbFpm-claim.reportedAClimbFpm,
       absolute75ResidualFpm:x.b.climbFpm-claim.reportedBClimbFpm,
       calculatedBestClimb67TasMph:x.a.tasMph,calculatedBestClimb75TasMph:x.b.tasMph}];
   }))};
// One deliberate falsification: does the P-47B's fitted single-point CD0
// configuration adjustment transfer unchanged to the P-51B? No.
const carried=results.climbCorrection.addedDragFit.addedCd0;
const unchanged=M.matchedPowerClimb(mustang,2200,'67inHg','75inHg',{profile:'C'}),
      copied=M.matchedPowerClimb(mustang,2200,'67inHg','75inHg',{profile:'C',addedCd0:carried});
results.crossAircraftTransfer={status:'diagnostic NOT adopted as universal coefficient',p47EquivalentCd0:carried,
  sourcePlane:'P-47B',targetPlane:'P-51B-15',referenceClimbFpm:claim.reportedAClimbFpm,
  unchanged67Fpm:unchanged.a.climbFpm,transferred67Fpm:copied.a.climbFpm,
  unchangedAbsErrorFpm:Math.abs(unchanged.a.climbFpm-claim.reportedAClimbFpm),
  transferredAbsErrorFpm:Math.abs(copied.a.climbFpm-claim.reportedAClimbFpm),
  interpretation:'A single P-47 aggregate climb loss parameter cannot be assumed transferable; do not adopt it as universal.'};
const V05=require('./climb_audit.js');results.sourceConditionAudit=V05.run(M,D);
fs.writeFileSync('results.json',JSON.stringify(results,null,2));console.log('saved results.json');console.log('Mustang independent boost climb, C:',results.p51BoostClimb.comparisons.C.modelDeltaFpm.toFixed(1),'vs historical',claim.reportedGainFpm);for(const [k,v] of Object.entries(results.aircraft))console.log(k,'Cd0',v.cd0Calibration?.cd0.toFixed(5),'holdout MAE',v.holdoutMAEMph,'sample g',v.sampleAt5000ft200EAS?.sustainedG.toFixed(2));
