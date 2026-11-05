'use strict';
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),D=require('../../aircraft/cases.json').aircraft;
const envelope=require('../../calibration/flight-envelope.json');
const S=require('../../references/independent-flight-checks.json');
const f4Lead=require('../../references/performance-evidence.json').supplementalF4;
const root=path.resolve(__dirname,'../..');
const kphPerMph=1.609344,ftPerM=1/.3048;
const mae=(rows,key)=>{const scored=rows.filter(r=>Number.isFinite(r[key]));return scored.length?
 scored.reduce((sum,r)=>sum+Math.abs(r[key]-r.observed),0)/scored.length:null;};

function speed(ac,altFt,gear,weightLb,flightEnvelope){
 return M.maxSpeed(ac,altFt,{profile:'P',gear,weightLb,flightEnvelope});
}

function f4Check(){
 const ac=D.bf109f4,ref=envelope.aircraft.bf109f4.inletTransfer,lead=f4Lead.speed.find(r=>r.rating==='combat');
 const {rating,gear}=ref,altFt=lead.altM*ftPerM,observed=lead.speedKph/kphPerMph;
 const opts={profile:'P',rating,gear,engineModel:'inlet-transfer',flightEnvelope:envelope};
 const endpoint=ac.powerRatings[rating].gears[gear].at(-1);
 const base=M.shaftPower(ac,endpoint.altFt,rating,gear);
 const legacyHp=base.bhp*M.isa(altFt).p/M.isa(base.altFt).p;
 const heldPolar=M.workingOptions(ac).polar;
 const isolated={...ac,powerRatings:{[rating]:{gears:{[gear]:[{altFt,bhp:legacyHp}]}}}};
 const legacy=M.maxSpeed(isolated,altFt,{profile:'P',rating,gear,polar:heldPolar});
 const predicted=M.maxSpeed(ac,altFt,opts),atSourceSpeed=M.evaluated(ac,altFt,observed,opts);
 const sensitivity=[.65,.85,1].flatMap(ramRecovery=>[2/3,1].map(chargeExponent=>({
  ramRecovery,chargeExponent,predicted:M.maxSpeed(ac,altFt,{...opts,ramRecovery,chargeExponent})
 })));
 const alternateEntry={...envelope.aircraft.bf109f4,inletTransfer:{...ref,referenceTasMph:522/kphPerMph}};
 const alternateEnvelope={...envelope,aircraft:{...envelope.aircraft,bf109f4:alternateEntry}};
 const atRatedPoint=M.evaluated(ac,ref.referenceAltFt,ref.referenceTasMph,opts);
 return {source:S.db601e,checkSource:f4Lead.url,altFt,observed,legacy,predicted,sensitivity,
  alternateScanTextPrediction:M.maxSpeed(ac,altFt,{...opts,flightEnvelope:alternateEnvelope}),
  nominalBhp:ref.nominalBhp,ratedPointAta:atRatedPoint.engine.estimatedManifoldAta,
  propulsiveHpAtObservedSpeed:atSourceSpeed.power.propulsiveHp,
  requiredHpAtObservedSpeed:atSourceSpeed.power.requiredHp,
  defaultAtCheck:M.maxSpeed(ac,altFt,{profile:'P',rating,gear,flightEnvelope:envelope}),
  emergencyAtCheck:M.maxSpeed(ac,altFt,{...opts,rating:'emergency'}),
  status:'conditional same-engine installation transfer; secondary check'};
}

function emergencyChallenger(){
 const source=S.db601eEmergency,ac=D.bf109f4;
 const rating='emergency',gear='fluid',lead=f4Lead.speed.find(row=>row.rating===rating);
 const referenceAltFt=source.ratedM*ftPerM,highAltFt=source.highM*ftPerM;
 const pressureRatio=M.isa(highAltFt).p/M.isa(referenceAltFt).p;
 const chargeExponent=Math.log(source.highPS/source.ratedPS)/Math.log(pressureRatio);
 const nominalBhp=source.ratedPS*.98632;
 const rated={rating,gear,engineRpm:source.rpm,boostAta:source.ratedAta,referenceAltFt,
  referenceTasMph:0,maxAltFt:23000,nominalBhp,chargeExponent,source:source.kind};
 const flightEnvelope={aircraft:{bf109f4:{identity:ac.stallIdentity,inletTransfer:rated}}};
 const altFt=lead.altM*ftPerM,observed=lead.speedKph/kphPerMph;
 const sensitivity=[.65,.85,1].map(ramRecovery=>({ramRecovery,predicted:M.maxSpeed(ac,altFt,
  {profile:'P',rating,gear,engineModel:'inlet-transfer',flightEnvelope,ramRecovery})}));
 return {source,chargeExponent,altFt,observed,sensitivity,highStaticPressureProxyAta:source.ratedAta*pressureRatio,promoted:false};
}

function withReportedSpitfireBoost(ac,altFt,gear,weightLb,observedBoostPsi){
 const rows=ac.boostComparison.referenceLevelSpeedBoostPsi[gear];
 const idx=rows.findIndex(([height])=>height>=altFt);
 if(idx<0||altFt<rows[0][0])return null;
 const [hiAlt,hiBoost]=rows[idx];
 const lo=rows[idx-1];
 const referenceBoostPsi=hiAlt===altFt?hiBoost:lo[1]+(hiBoost-lo[1])*(altFt-lo[0])/(hiAlt-lo[0]);
 const engineCondition={referenceBoostPsi,observedBoostPsi,source:'Diagnostic MA.648 versus BS.543 boost substitution at matched altitude and gear'};
 return M.maxSpeed(ac,altFt,{profile:'P',gear,weightLb,engineCondition,chargeExponent:.75});
}

function run(){
 const s=S.spitfire,spit=D.spitfire_lfix_bs543;
 const spitRows=s.rows.map(([altFt,gear,boostPsi,observed])=>({altFt,gear,boostPsi,observed,
  base:speed(spit,altFt,gear,s.weightLb),working:speed(spit,altFt,gear,s.weightLb,envelope),
  boostOnly:withReportedSpitfireBoost(spit,altFt,gear,s.weightLb,boostPsi)}));
 const comparisonPeaks=s.comparisonPeaks.flatMap(([specimen,weightLb,lowAlt,lowSpeed,highAlt,highSpeed])=>
  [[lowAlt,'low',lowSpeed],[highAlt,'high',highSpeed]].map(([altFt,gear,observed])=>({specimen,altFt,gear,weightLb,observed,
   base:speed(spit,altFt,gear,weightLb),working:speed(spit,altFt,gear,weightLb,envelope)})));
 const m=S.mustang;
 const mustang={...m,observed:m.observedMph,base:speed(D.p51b,m.altFt,'low',m.weightLb),
  working:speed(D.p51b,m.altFt,'low',m.weightLb,envelope)};
 const t=S.thunderbolt,p47=D.p47b,polar=M.workingOptions(p47).polar;
 const p47Rows=t.rows.map(([altFt,bhp,observed])=>{
  // Preserve the production speed anchor, geometry and propeller model.
  const measuredPower={...p47,powerRatings:{military:{gears:{turbo:[{altFt,bhp}]}}}};
  const opts={profile:'P',rating:'military',gear:'turbo',weightLb:t.weightLb,polar};
  return {altFt,bhp,observed,chart:M.maxSpeed(p47,altFt,opts),
   reportedPower:M.maxSpeed(measuredPower,altFt,opts)};
 });
 const production=S.thunderboltProduction;
 const productionOpts={profile:'P',rating:'military',gear:'turbo',weightLb:production.weightLb,polar};
 const measuredAt=(altFt,bhp)=>({...p47,powerRatings:{military:{gears:{turbo:[{altFt,bhp}]}}}});
 const productionLevel=production.level.map(([altFt,bhp,observed])=>({altFt,bhp,observed,
  predicted:M.maxSpeed(measuredAt(altFt,bhp),altFt,productionOpts)}));
 const productionClimb=production.climb.map(([altFt,bhp,tasMph,observed])=>{
  const ac=measuredAt(altFt,bhp);
  const predict=extra=>M.evaluated(ac,altFt,tasMph,{...productionOpts,...extra}).power?.climbFpm??null;
  return {altFt,bhp,tasMph,observed,clean:predict({}),
   fixedCd0:predict({addedDragAreaM2:p47.workingModel.openCoolingDeltaCd0*p47.wingAreaM2}),
   open:predict({flightEnvelope:envelope,flightCooling:true})};
 });
 return {policy:S.policy,exactSpecimenIndependentCases:0,calibrationTargetCount:0,f4:f4Check(),emergencyChallenger:emergencyChallenger(),
  spitfire:{source:s.report,url:s.url,qualification:s.qualification,rows:spitRows,comparisonPeaks,
   scored:spitRows.filter(r=>Number.isFinite(r.working)).length,baseMae:mae(spitRows,'base'),workingMae:mae(spitRows,'working'),boostOnlyMae:mae(spitRows,'boostOnly')},
  mustang,thunderbolt:{source:t.report,url:t.url,qualification:t.qualification,rows:p47Rows,
   chartMae:mae(p47Rows,'chart'),reportedPowerMae:mae(p47Rows,'reportedPower')},
  thunderboltProduction:{source:production.report,url:production.url,qualification:production.qualification,
   level:productionLevel,climb:productionClimb,levelMae:mae(productionLevel,'predicted'),
   cleanClimbMae:mae(productionClimb,'clean'),fixedCd0ClimbMae:mae(productionClimb,'fixedCd0'),openClimbMae:mae(productionClimb,'open')}};

}

function writeReport(){
 const report=run();
 fs.writeFileSync(path.join(root,'validation/current/independent-flight-checks.json'),JSON.stringify(report,null,2)+'\n');
 return report;
}
if(require.main===module){
 const r=writeReport(),f=x=>x.toFixed(2);
 console.log('F-4 at 7,000 m, km/h: pressure continuation '+f(r.f4.legacy*kphPerMph)+', inlet transfer '+f(r.f4.predicted*kphPerMph)+', source '+f(r.f4.observed*kphPerMph));
 console.log('MA.648 mph MAE: '+f(r.spitfire.baseMae)+' / '+f(r.spitfire.workingMae));
 console.log('XP-47B mph MAE: '+f(r.thunderbolt.chartMae)+' / '+f(r.thunderbolt.reportedPowerMae));
 console.log('P-47B 41-5942: level '+f(r.thunderboltProduction.levelMae)+' mph; climb '+f(r.thunderboltProduction.fixedCd0ClimbMae)+' → '+f(r.thunderboltProduction.openClimbMae)+' ft/min');
}
module.exports={run,writeReport};
