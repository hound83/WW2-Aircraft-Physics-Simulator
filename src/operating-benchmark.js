'use strict';
(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const api=factory(node?require('./energy-configuration.js'):root.EnergyConfiguration,
  node?require('./turn-performance.js'):root.TurnPerformance);
 if(node)module.exports=api;else root.OperatingBenchmark=api;
})(globalThis,function(Energy,Turn){
 const MPH=.44704,HP=745.6998716,G=9.80665;
 const interpolate=(rows,x,key)=>{if(!rows?.length||x<rows[0][0]||x>rows.at(-1)[0])return null;const i=rows.findIndex(r=>r[0]>=x);if(rows[i][0]===x)return rows[i][key];const a=rows[i-1],b=rows[i];return a[key]+(b[key]-a[key])*(x-a[0])/(b[0]-a[0]);};
 const nodeAt=(nodes,x)=>{const a=nodes.map(r=>[r.altFt,r]);const i=a.findIndex(r=>r[0]>=x);if(i<0||x<a[0][0])return null;if(a[i][0]===x)return a[i][1];const lo=a[i-1],hi=a[i],f=(x-lo[0])/(hi[0]-lo[0]);return Object.fromEntries(Object.keys(lo[1]).map(k=>[k,typeof lo[1][k]==='number'&&typeof hi[1][k]==='number'?lo[1][k]+f*(hi[1][k]-lo[1][k]):lo[1][k]]));};
 function fittedInjection(model,spec){
  const fit=spec.injection?.installation,ac=model.ac;
  return fit&&fit.variant===(ac.stallIdentity?.variant??ac.variant)&&fit.engine===ac.engine?spec.injection:null;
 }
 function validateSettings(spec,s={},model){
  const mode=s.mode??'combat',fuelFraction=s.fuelFraction??.5;
  if(!['normal','combat'].includes(mode)||![.25,.5,.75].includes(fuelFraction))throw Error('Choose Normal/Combat and 25%, 50% or 75% fuel');
  if(s.injection&&!(model?fittedInjection(model,spec):spec.injection))throw Error('Injection is unavailable for this engine and variant');
  if(s.injection&&mode!=='combat')throw Error('Injection requires Combat power');
  return {mode,fuelFraction,injection:!!s.injection,extension:!!s.extension,openCooling:!!s.openCooling};
 }
 function load(spec,policy,s){
  const fuelLb=spec.fuelCapacityUSGal*s.fuelFraction*policy.fuelDensityLbPerUSGal;
  const dryLb=spec.referenceWeightLb-spec.referenceFuelUSGal*policy.fuelDensityLbPerUSGal+(spec.serviceLoadDeltaLb??0);
  // The same charged injection system is carried in dry and injected comparisons.
  const injectionLb=spec.injection?.fluidLb??0;
  return {weightLb:dryLb+fuelLb+injectionLb,dryLb,fuelLb,injectionLb,fuelUSGal:fuelLb/policy.fuelDensityLbPerUSGal};
 }
 function phaseFor(spec,s,seconds=0,combatUsed=0,fluidLb=Infinity){
  if(s.mode==='combat'&&combatUsed<(spec.combat.seconds??Infinity)-1e-7){
   if(s.injection&&fluidLb>1e-7&&combatUsed<(spec.injection.seconds??Infinity)-1e-7)return {...spec.combat,...spec.injection,key:'injection'};
   return {...spec.combat,key:'combat'};
  }
  if(seconds<(spec.normal.seconds??Infinity)-1e-7)return {...spec.normal,key:'normal'};
  return spec.continuous?{...spec.continuous,key:'continuous'}:null;
 }
 function nativePower(M,model,spec,phase,altFt,tas,extension,open=false){
  const rating=phase.nativeRating??spec.baseRating;
  const climbRating=open&&model.climbPowerRatings?.[rating];
  const ac=climbRating?{...model.ac,powerRatings:{...model.ac.powerRatings,[rating]:climbRating}}:model.ac;
  const curve=ac.ratedInlet?.[rating];
  let powers=ac.powerRatings[rating]?.gears;
  const supplemental=model.options.flightEnvelope?.aircraft?.[ac.stallIdentity?.aircraftId]?.power?.[rating];
  const maxFt=curve?Math.max(...curve.gears.map(g=>g.maxFt)):Math.max(...Object.values(powers??{}).flat().map(p=>p.altFt),...(supplemental?.nodes??[]).map(p=>p.altFt));
  const transferred=spec.baseRating==='combat'&&ac.stallIdentity?.aircraftId==='bf109f4';
  const max=transferred&&rating==='combat'?23000:maxFt;
  if(!Number.isFinite(max)||altFt<0||altFt>40000||altFt>max&&!extension)return null;
  const at=Math.min(altFt,max);
  let shaft;
  if(curve)shaft=M.ratedInletPower(ac,at,tas,rating,'auto','rated-inlet');
  else if(transferred&&rating==='combat')shaft=M.evaluated(ac,at,tas,{...model.options,polar:model.benchmarkPolar,rating,weightLb:ac.weightLb,engineModel:'inlet-transfer'}).engine;
  else {
   const shift=climbRating&&model.climbGearChangesFt?.[rating];
   shaft=M.shaftPower(ac,at,rating,phase.gear??(shift?(at<shift?'low':'high'):'auto'));
  }
  if(!shaft&&supplemental){const node=nodeAt(supplemental.nodes,at)??(phase.nativeRating==='normal'&&at<supplemental.nodes[0].altFt?supplemental.nodes[0]:null);if(node)shaft={...node,rating,gear:supplemental.gear,engineRpm:supplemental.engineRpm};}
  // P-38 report's level chart begins at 5000 ft; its climb power covers sea level.
  if(!shaft&&ac.stallIdentity?.aircraftId==='p38g')shaft=M.shaftPower(ac,at,'climb','auto');
  if(!shaft)return null;
  let bhp=shaft.bhp,estimated=altFt>max;
  if(estimated){const ref=M.isa(max),air=M.isa(altFt);bhp*=air.rho/ref.rho;}
  const nativeRpm=shaft.engineRpm??ac.propGeometry.engineRpmByRating?.[rating]??spec.baseRpm;
  if(phase.nativeRating&&curve||phase.nativeRating&&supplemental){/* an actual lower-rating curve, not scaled combat power */}
  else if(phase.powerFactor!==undefined)bhp*=phase.powerFactor;
  else {
   const peak=curve?Math.max(...curve.gears.filter(g=>g.gear===shaft.gear).map(g=>g.bhp)):Math.max(...(ac.powerRatings[spec.baseRating]?.gears?.[shaft.gear]??Object.values(ac.powerRatings[spec.baseRating]?.gears??{}).flat()).map(p=>p.bhp));
   const availableMap=shaft.mapInHg??spec.baseMap*Math.min(1,shaft.bhp/peak)**(1/spec.pressureExponent);
   bhp*=Math.min(1,phase.map/availableMap)**spec.pressureExponent*phase.rpm/nativeRpm;
  }
  return {...shaft,bhp,engineRpm:phase.rpm,rating:spec.baseRating,estimated,sourceMaxFt:max,
   estimatedMap:Math.min(phase.map,spec.baseMap*(estimated?M.isa(altFt).rho/M.isa(max).rho:1))};
 }
 function cleanLevelPower(M,model,spec,phase,altFt,tas,native,reference){
  if(!reference?.powerRating||native.estimated)return native;
  const geometry=model.ac.propGeometry;
  const reduction=model.benchmarkReductionRatio??geometry.reductionRatioEnginePerProp;
  const advanceRatio=M.propellerAdvanceRatio(tas,phase.rpm/reduction,geometry.diameterFt);
  const fraction=M.cleanLevelReferenceShare(altFt,phase.rpm,advanceRatio,reference);
  if(!(fraction>0))return native;
  // Fade the power difference at the closest source node outside the recorded altitude range.
  const [low,high]=reference.altitudeFt;
  const anchorFt=Math.max(low,Math.min(high,altFt));
  const level=nativePower(M,model,spec,{...phase,nativeRating:reference.powerRating},anchorFt,tas,false);
  const climb=anchorFt===altFt?native:nativePower(M,model,spec,phase,anchorFt,tas,false);
  if(!level||!climb)return native;
  const bhp=native.bhp+fraction*(level.bhp-climb.bhp);
  const mapInHg=[native.mapInHg,level.mapInHg,climb.mapInHg].every(Number.isFinite)
   ?native.mapInHg+fraction*(level.mapInHg-climb.mapInHg):native.mapInHg;
  return {...native,bhp,mapInHg};
 }
 function climbTasShare(tas,{minTasMph,maxTasMph,fadeTasMph}) {
  return Math.max(0,Math.min(1,(tas-minTasMph)/fadeTasMph,(maxTasMph-tas)/fadeTasMph));
 }
 // These configurations were derived from climbs with open cooling. Rating, RPM,
 // airspeed and altitude checks keep them within the applicable test conditions.
 function installedClimb(M,model,altFt,tas,weightLb,phase,native){
  const configuration=model.benchmarkCooling;
  const match=configuration?.ratings[phase.key];
  if(!match||native.estimated||phase.map!==match.map)return null;
  const fraction=climbTasShare(tas,configuration);
  if(fraction<=0)return null;
  const prepared=Energy.prepare(M,model,altFt,match.rating,weightLb,configuration);
  if(!prepared||prepared.branch.engineRpm!==phase.rpm)return null;
  const {ac,options,branch}=prepared;
  const nodes=ac.powerRatings[options.rating].gears[options.gear];
  const power=nodes[0];
  const areaM2=(model.climbCoolingAreaM2??0)*(1-fraction)+branch.loss.areaM2*fraction;
  return {
   configuration, fraction,
   prepared:{
    ...prepared,
    ac:{...ac,powerRatings:{[options.rating]:{gears:{[options.gear]:[
     {...power,bhp:native.bhp+(power.bhp-native.bhp)*fraction}
    ]}}}},
    options:{...options,polar:model.benchmarkPolar},
    branch:{...branch,loss:{areaM2,powerFraction:branch.loss.powerFraction*fraction}}
   }
  };
 }
 function evaluate(M,turn,lift,model,spec,s,altFt,eas,weightLb,phase,climbing=false,{allowProvisionalManeuver=false}={}){
  if(!(altFt>=0&&altFt<=40000&&eas>0&&weightLb>0))return {status:'invalid-benchmark-input'};
  phase=phase??phaseFor(spec,s);
  if(!phase)return {status:'rating-time-exhausted'};
  if(phase.key==='injection'&&!fittedInjection(model,spec))return {status:'injection-unavailable'};
  const open=climbing||s.openCooling;
  const tas=M.tasFrom(eas,'EAS',altFt),native=nativePower(M,model,spec,phase,altFt,tas,s.extension,open);
  if(!native)return {status:'source-power-unavailable'};
  const reference=open?undefined:model.cleanLevelPropellers?.[phase.key];
  const p=cleanLevelPower(M,model,spec,phase,altFt,tas,native,reference);
  const rating=spec.baseRating,gear=p.gear??'benchmark';
  const ac={...model.ac,powerRatings:{[rating]:{gears:{[gear]:[{altFt,bhp:p.bhp,engineRpm:phase.rpm,mapInHg:p.mapInHg}]}}},
   propGeometry:{...model.ac.propGeometry,...(model.benchmarkReductionRatio?{reductionRatioEnginePerProp:model.benchmarkReductionRatio}:{}),engineRpmByRating:{...model.ac.propGeometry.engineRpmByRating,[rating]:phase.rpm}}};
  const opts={...model.options,profile:'P',polar:model.benchmarkPolar,rating,gear,weightLb,
   cleanLevelPropeller:reference};
  delete opts.engineModel;delete opts.flightCooling;
  const coolingCase=model.climbCoolingCase;
  const matchedCooling=open&&coolingCase&&phase.map===coolingCase.map&&phase.rpm===coolingCase.rpm&&
   altFt>=coolingCase.minFt&&altFt<=coolingCase.maxFt&&!p.estimated?coolingCase:null;
  const coolingShare=matchedCooling?climbTasShare(tas,matchedCooling):0;
  const coolingArea=coolingShare>0?matchedCooling.areaM2*coolingShare:model.climbCoolingAreaM2;
  if(open&&coolingArea)opts.addedDragAreaM2=coolingArea;
  const installed=open?installedClimb(M,model,altFt,tas,weightLb,phase,p):null;
  const turnOptions=turn.optionsFor(M,ac,lift,altFt,tas,opts);
  const maneuverLift=!open?Turn.maneuverLift(M,ac,model.maneuverLiftSource,altFt,tas,turnOptions):null;
  let r;
  if(installed){
   const {prepared,configuration}=installed;
   prepared.options=turn.optionsFor(M,prepared.ac,lift,altFt,tas,prepared.options);
   r=Energy.evaluatePrepared(M,altFt,tas,prepared,configuration);
  }else{
   r=M.evaluated(ac,altFt,tas,maneuverLift?{...turnOptions,maneuverClMax:maneuverLift.clMax}:turnOptions);
  }
  const limits=spec.performanceIntake&&!allowProvisionalManeuver&&r.limits?{...r.limits,nLift:null,nPower:null,nInst:null,nSust:null,instantDegSec:null,sustDegSec:null}:r.limits;
  return {...r,limits,benchmark:{phase:phase.key??s.mode,label:phase.label,estimated:p.estimated,sourceMaxFt:p.sourceMaxFt,
   rpm:phase.rpm,map:phase.map,mapUnit:spec.mapUnit,cooling:installed||coolingShare>0?'report-conditioned':open?'climb-estimate':'clean',
   ...(coolingShare>0?{coolingFit:{...matchedCooling,appliedAreaM2:coolingArea}}:{}),
   ...(installed&&model.climbRateTas?.[phase.key]?{climbRateShare:installed.fraction}:{}),
   ...(maneuverLift?{maneuverLift}:{}),
   ...(!installed&&turnOptions.stallLiftEvidence?{stallLift:turnOptions.stallLiftEvidence}:{}),
   ...(r.prop?.levelReference?{propellerReference:r.prop.levelReference}:{})}};
 }
 function levelAccelerationMphPerSecond(flight){
  const {status,tasMph,power}=flight;
  if(status!=='modelled'||!Number.isFinite(tasMph)||tasMph<=0||!Number.isFinite(power?.psMps))return null;
  // Specific excess power is energy rate per weight. At fixed altitude it goes into speed.
  const tasMps=tasMph*MPH;
  return G*power.psMps/tasMps/MPH;
 }
 function summary(r,eas,kind){
  const g=kind==='instant'?r.limits.nInst:r.limits.nSust,rate=kind==='instant'?r.limits.instantDegSec:r.limits.sustDegSec;
  return {rateDegSec:rate,seconds360:rate>0?360/rate:null,easMph:eas,tasMph:r.tasMph,g,
   radiusM:rate>0?r.tasMph*MPH/(rate*Math.PI/180):null,estimatedPower:r.benchmark.estimated,cooling:r.benchmark.cooling,
   limiting:r.limits.nPower<=r.limits.nInst?'power':r.limits.nLift<=r.limits.structG?'lift':'structure'};
 }
 function bestClimb(M,T,L,model,spec,s,alt,w,phase,step=4){
  let best=null;
  for(let tas=100;tas<=340;tas+=step){const eas=M.airspeeds(tas,alt).eas,r=evaluate(M,T,L,model,spec,s,alt,eas,w,phase,true);
   if(r.status==='source-power-unavailable')return {status:r.status};
   if(r.status==='modelled'&&Number.isFinite(r.power?.climbFpm)&&(!best||r.power.climbFpm>best.climbFpm))best={status:'modelled',climbFpm:r.power.climbFpm,easMph:eas,tasMph:tas,shaftHp:r.power.shaftHp,estimatedPower:r.benchmark.estimated,cooling:r.benchmark.cooling};}
  return best??{status:'no-level-flight'};
 }
 function firstSustainedSpeed(atSpeed, low, high){
  if(Number.isFinite(atSpeed(low).limits?.nSust))return low;
  for(let i=0;i<30;i++){
   const middle=(low+high)/2;
   if(Number.isFinite(atSpeed(middle).limits?.nSust))high=middle;
   else low=middle;
  }
  return high;
 }
 function metrics(M,T,L,model,spec,policy,settings,alt){
  const s=validateSettings(spec,settings,model),loading=load(spec,policy,s),phase=phaseFor(spec,s,0,0,loading.injectionLb);
  const out={altFt:alt,settings:s,loading,phase,sourceQualification:spec.loadQualification,powerQualification:phase.qualification??'Existing source power plus documented rating inputs; lower-rating shaft power may use an explicit pressure/RPM conversion.',
   sustained:null,sustainedLoad:null,instantaneous:null,minSustainedRadius:null,climb:null,level:null,stallEasMph:null,turnRange:null};
  const atSpeed=eas=>evaluate(M,T,L,model,spec,s,alt,eas,loading.weightLb,phase);
  let last=null,crossing=null,engineSeen=false;
  let firstSustained=null,lastSustained=null;
  const maxEas=M.airspeeds(590,alt).eas;
  for(let eas=65;eas<=maxEas;eas+=1){const r=atSpeed(eas);
   if(r.benchmark)engineSeen=true;
   if(Number.isFinite(r.stallEasMph)&&out.stallEasMph===null){
    out.stallEasMph=r.stallEasMph;
    if(r.benchmark?.stallLift)out.stallEasRange=r.benchmark.stallLift.range;
   }
   if(r.status!=='modelled'||!r.power){last=null;continue;}
   if(last&&last.r.power.excessHp>=0&&r.power.excessHp<0)crossing=[last.eas,eas];last={eas,r};
   if(Number.isFinite(r.limits.nSust)){
    firstSustained??=eas;
    lastSustained=eas;
    if(r.limits.nSust>(out.sustainedLoad?.g??1))out.sustainedLoad=summary(r,eas,'sust');
   }
   const su=r.limits.sustDegSec,ins=r.limits.instantDegSec;
   if(su>0&&(!out.sustained||su>out.sustained.rateDegSec))out.sustained=summary(r,eas,'sust');
   if(ins>0&&(!out.instantaneous||ins>out.instantaneous.rateDegSec))out.instantaneous=summary(r,eas,'instant');
   if(su>0){const p=summary(r,eas,'sust');if(!out.minSustainedRadius||p.radiusM<out.minSustainedRadius.radiusM)out.minSustainedRadius=p;}
  }
  if(!engineSeen&&!spec.performanceIntake){out.status='source-power-unavailable';return out;}
  for(const [key,kind]of [['sustained','sust'],['sustainedLoad','sust'],['instantaneous','instant'],['minSustainedRadius','sust']]){
   if(!out[key])continue;const center=out[key].easMph;
   for(let eas=center-1;eas<=center+1;eas+=.05){const r=atSpeed(eas);if(r.status!=='modelled')continue;
    const value=kind==='instant'?r.limits.instantDegSec:r.limits.sustDegSec;if(!(value>0))continue;const p=summary(r,eas,kind);
    if(key==='minSustainedRadius'?p.radiusM<out[key].radiusM:
     key==='sustainedLoad'?p.g>out[key].g:value>out[key].rateDegSec)out[key]=p;}
  }
  if(crossing){
   let [lo,hi]=crossing;
   for(let i=0;i<30;i++){
    const middle=(lo+hi)/2;
    if(atSpeed(middle).power?.excessHp>0)lo=middle;
    else hi=middle;
   }
   const eas=(lo+hi)/2,r=atSpeed(eas);
   if(r.status==='modelled')out.level={easMph:eas,tasMph:r.tasMph,mach:r.air.mach,estimatedPower:r.benchmark.estimated,qualification:'Steady level-speed equilibrium at this rating; acceleration/engine thermal history not simulated.'};
  }
  if(firstSustained!==null){
   const lower=Math.min(firstSustained,Math.max(firstSustained-1,out.stallEasMph));
   out.turnRange={
    minEasMph:firstSustainedSpeed(atSpeed,lower,firstSustained),
    maxEasMph:out.level?.easMph??lastSustained
   };
  }
  out.climb=bestClimb(M,T,L,model,spec,s,alt,loading.weightLb,phase,1);
  const ias=interpolate(spec.climbIAS,alt,1),tas=spec.climbTAS?interpolate(spec.climbTAS,alt,1):M.tasFrom(ias,'CAS',alt);
  const eas=M.airspeeds(tas,alt).eas;
  const manual=evaluate(M,T,L,model,spec,s,alt,eas,loading.weightLb,phase,true);
  out.manualClimb={iasMph:ias,climbFpm:manual.power?.climbFpm??null,qualification:spec.speedQualification+(spec.climbTAS?'':' IAS=CAS engineering approximation; not a newly measured calibration.')};
  out.status=out.sustained||(spec.performanceIntake&&(out.level||out.climb?.status==='modelled'))?'modelled':
   engineSeen?'cannot-sustain-level-flight':'source-power-unavailable';return out;
 }
 function traceInputs(flight){
  return {status:flight.status,altFt:flight.altFt,tasMph:flight.tasMph,benchmark:flight.benchmark,engine:{gear:flight.engine?.gear}};
 }
 function levelFlightCase(M,T,L,model,spec,policy,settings,alt,{allowProvisionalManeuver=false}={}){
  const s=validateSettings(spec,settings,model);
  return {
   settings:s,
   initial:load(spec,policy,s),
   easPerTas:M.airspeeds(1,alt).eas,
   maxEasMph:M.airspeeds(590,alt).eas,
   evaluate:(speed,weight,phase)=>evaluate(M,T,L,model,spec,s,alt,speed,weight,phase,false,{allowProvisionalManeuver}),
   fuelFlow:flight=>policy.bsfcLbPerHpHour*flight.power.shaftHp/3600
  };
 }
 function powerStep(spec,phase,seconds,combatSeconds,fluid){
  const boosting=phase.key==='combat'||phase.key==='injection';
  const injectionRate=phase.key==='injection'?(spec.injection.fluidLbPerMinute??0)/60:0;
  let remaining=boosting?(spec.combat.seconds??Infinity)-combatSeconds:
   phase.key==='normal'?(spec.normal.seconds??Infinity)-seconds:Infinity;
  if(phase.key==='injection')remaining=Math.min(remaining,(spec.injection.seconds??Infinity)-combatSeconds);
  if(injectionRate>0)remaining=Math.min(remaining,fluid/injectionRate);
  return {boosting,injectionRate,remaining};
 }
 function accelerate(M,T,L,model,spec,policy,settings,alt,from,to,options={}){
  if(![alt,from,to].every(Number.isFinite)||alt<0||alt>40000||from<=0||to<=from){
   throw Error('Choose increasing positive EAS endpoints and an altitude from sea level to 40,000 ft.');
  }
  const step=options.stepSeconds??.5;
  if(!(step>0&&step<=1))throw Error('Acceleration integration step must be greater than zero and at most one second.');
  const {settings:s,initial,easPerTas,maxEasMph,evaluate:at,fuelFlow}=levelFlightCase(M,T,L,model,spec,policy,settings,alt);
  let eas=from,seconds=0,combatSeconds=0,fuel=initial.fuelLb,fluid=initial.injectionLb,estimatedPower=false;
  const schedule=[],trace=[{seconds,easMph:eas}];
  const result=status=>({
   status,seconds:status==='reached'?seconds:null,elapsedSeconds:seconds,altFt:alt,startEasMph:from,targetEasMph:to,reachedEasMph:eas,
   combatSeconds,combatRemainingSeconds:Math.max(0,(spec.combat.seconds??0)-combatSeconds),
   fuelUsedLb:initial.fuelLb-fuel,injectionRemainingLb:fluid,endWeightLb:initial.dryLb+fuel+fluid,estimatedPower,schedule,trace
  });
  if(to>maxEasMph)return result('speed-domain-unavailable');
  const rate=flight=>{
   const acceleration=levelAccelerationMphPerSecond(flight);
   return acceleration===null?null:acceleration*easPerTas;
  };
  while(seconds<7200&&eas<to-1e-8){
   const phase=phaseFor(spec,s,seconds,combatSeconds,fluid);
   if(!phase)return result('rating-time-exhausted');
   const weight=initial.dryLb+fuel+fluid,start=at(eas,weight,phase),initialRate=rate(start);
   if(initialRate===null)return result(start.status);
   if(initialRate<=1e-6)return result('power-limited');

   const {boosting,injectionRate,remaining}=powerStep(spec,phase,seconds,combatSeconds,fluid);
   let dt=Math.min(step,remaining,7200-seconds);
   if(!(dt>1e-8))return result('integration-limit');
   const startFlow=fuelFlow(start);
   if(fuel<=0)return result('fuel-exhausted');

   // Hold altitude and integrate true airspeed in EAS coordinates at the midpoint mass.
   function advance(duration){
    const midWeight=weight-Math.min(fuel,startFlow*duration/2)-Math.min(fluid,injectionRate*duration/2);
    const mid=at(Math.min(to,eas+initialRate*duration/2),midWeight,phase);
    const midRate=rate(mid);
    if(midRate===null)return {status:mid.status};
    if(midRate<=0)return {status:'power-limited'};
    return {speed:eas+midRate*duration,burn:fuelFlow(mid)*duration,flight:mid};
   }
   let trial=advance(dt);
   if(trial.status)return result(trial.status);
   if(trial.speed>=to||trial.burn>fuel){
    // Locate a target-speed or fuel event inside the last step.
    let low=0,high=dt;
    for(let i=0;i<28;i++){
     const middle=(low+high)/2,p=advance(middle);
     if(p.status||p.speed>=to||p.burn>fuel)high=middle;
     else low=middle;
    }
    dt=high;
    trial=advance(dt);
    if(trial.status)return result(trial.status);
   }
   const next=Math.min(to,trial.speed);
   const burn=Math.min(fuel,trial.burn),water=Math.min(fluid,injectionRate*dt);
   const end=at(next,weight-burn-water,phase),endRate=rate(end);
   if(endRate===null)return result(end.status);
   if(endRate<=0)return result('power-limited');

   const previous=eas;
   eas=next;seconds+=dt;fuel-=burn;fluid=Math.max(0,fluid-water);
   if(fluid<1e-7)fluid=0;
   if(boosting)combatSeconds+=dt;
   estimatedPower||=start.benchmark.estimated||trial.flight.benchmark.estimated||end.benchmark.estimated;
   const tail=schedule.at(-1);
   if(tail?.phase===phase.key){tail.toEasMph=eas;tail.seconds+=dt;}
   else schedule.push({phase:phase.key,label:phase.label,fromEasMph:previous,toEasMph:eas,seconds:dt});
   trace.push({seconds,easMph:eas,phase:phase.key,inputs:traceInputs(trial.flight)});
  }
  return result(eas>=to-1e-8?'reached':'integration-limit');
 }
 function speedEnergyHeightFt(startMph,endMph) {
  return (endMph-startMph)*(endMph+startMph)*MPH**2/(2*G*.3048);
 }

 function scheduledClimbStep({dh, tas, weightLb, dryLb, speedAt, stateAt, referenceSpeedAt, fuelPerHpSecond, injectionRate, limit}) {
  function trial(distanceFt) {
   let massUsedLb=0;
   for(let iteration=0;iteration<6;iteration++){
    const endWeight=Math.max(dryLb,weightLb-massUsedLb);
    const endTas=speedAt(distanceFt,endWeight);
    if(!(endTas>0))return {status:'source-power-unavailable'};
    const mid=stateAt(distanceFt/2,(weightLb+endWeight)/2);
    if(!mid.power)return {status:mid.status};
    // Specific excess power pays for both altitude and the signed change in kinetic energy.
    const energyHeightFt=distanceFt+speedEnergyHeightFt(tas,endTas);
    let excessRateFpm=mid.power.climbFpm;
    // Existing installation fits use vertical rates along the report's speed
    // schedule. Restore that schedule's energy gain in the calibrated share.
    const share=mid.benchmark.climbRateShare;
    if(share){
     const refStart=referenceSpeedAt(0),refEnd=referenceSpeedAt(distanceFt);
     if(refStart>0&&refEnd>0)excessRateFpm*=1+share*speedEnergyHeightFt(refStart,refEnd)/distanceFt;
    }
    if(!(excessRateFpm>0&&energyHeightFt>0))return {status:'unattainable'};
    const dt=60*energyHeightFt/excessRateFpm;
    const burn=fuelPerHpSecond*mid.power.shaftHp*dt;
    const nextMassUsedLb=burn+injectionRate*dt;
    if(Math.abs(nextMassUsedLb-massUsedLb)<=1e-5)return {dh:distanceFt,dt,burn,mid,endTas};
    massUsedLb=nextMassUsedLb;
   }
   return {status:'integration-limit'};
  }

  const full=trial(dh);
  if(full.status||full.dt<=limit)return full;
  // Shorten the altitude step using the same energy equation at a rating or fluid limit.
  let low=0,high=dh,best=null;
  for(let iteration=0;iteration<40;iteration++){
   const candidate=trial((low+high)/2);
   if(candidate.status)return candidate;
   if(candidate.dt>limit)high=candidate.dh;
   else {
    low=candidate.dh;
    best=candidate;
    if(limit-candidate.dt<1e-8)break;
   }
  }
  return best??{status:'rating-time-exhausted'};
 }

 function climb(M,T,L,model,spec,policy,settings,from,to,options={}){
  if(!(from>=0&&to>from&&to<=40000))throw Error('Climb target must be above start, within 0-40000 ft');
  const s=validateSettings(spec,settings,model),stepFt=options.stepFt??500;
  if(!(stepFt>=50&&stepFt<=1000))throw Error('Invalid climb integration step');
  const source=options.flightCase;
  if(source&&(!(source.weightLb>0&&Number.isFinite(source.weightLb))||
    !Array.isArray(source.tasSchedule)||!source.tasSchedule.length||s.injection))throw Error('Invalid climb flight case');
  const initial=source?{weightLb:source.weightLb,dryLb:source.weightLb,fuelLb:0,injectionLb:0}:load(spec,policy,s);
  const accountForTasChange=options.accountForTasChange??model.timedClimbEnergy??false;
  const fuelPerHpSecond=source?0:policy.bsfcLbPerHpHour/3600;
  const plannedPhase=accountForTasChange&&s.mode==='combat'?phaseFor(spec,s,0,0,initial.injectionLb):null;
  function manualTas(alt){
   if(spec.climbTAS)return interpolate(spec.climbTAS,alt,1);
   const ias=interpolate(spec.climbIAS,alt,1);
   return ias===null?null:M.tasFrom(ias,'CAS',alt);
  }
  // Reuse optimal speed at three load levels. Every replay re-evaluates the shared
  // force balance at actual midpoint fuel mass; interpolated speeds are not rates.
  const speedCache=new Map();
  function speedFor(alt,w,phase){
   if(source)return interpolate(source.tasSchedule,alt,1);
   if(s.mode==='normal')return manualTas(alt);
   // Fix the planned Combat speed schedule across power changes. Its interpolation
   // stays continuous when the actual phase or boost-window start changes.
   const speedPhase=plannedPhase??phase;
   const lower=Math.floor(alt/1000)*1000,upper=Math.min(40000,lower+1000),minW=initial.dryLb,maxW=initial.weightLb;
   function atHeight(h){const samples=[minW,(minW+maxW)/2,maxW];let i=w>(minW+maxW)/2?1:0;
    const vals=samples.slice(i,i+2).map(weight=>{const key=[h,speedPhase.key,weight].join(':');if(!speedCache.has(key))speedCache.set(key,bestClimb(M,T,L,model,spec,s,h,weight,speedPhase,5).tasMph??null);return speedCache.get(key);});
    if(vals.some(v=>v===null))return accountForTasChange?manualTas(h):null;
    return vals[0]+(vals[1]-vals[0])*(w-samples[i])/(samples[i+1]-samples[i]);}
   const a=atHeight(lower),b=atHeight(upper);return a===null||b===null?null:a+(b-a)*(alt-lower)/(upper-lower||1);
  }
  function replay(boostStart,captureTrace=false){let h=from,seconds=0,combatUsed=0,fuel=initial.fuelLb,fluid=initial.injectionLb,iterations=0,estimated=false;const schedule=[];
   const trace=captureTrace?[{seconds,altFt:h}]:null;
   function output(status){return {status,seconds:status==='reached'?seconds:null,elapsedSeconds:seconds,reachedFt:h,startFt:from,targetFt:to,boostStartFt:boostStart,combatSeconds:combatUsed,combatRemainingSeconds:Math.max(0,(spec.combat.seconds??0)-combatUsed),injectionRemainingLb:fluid,fuelUsedLb:initial.fuelLb-fuel,endFuelLb:fuel,endWeightLb:initial.dryLb+fuel+fluid,estimatedPower:estimated,schedule,...(trace&&{trace})};}
   while(h<to-1e-6&&iterations++<3000){
    if(seconds>7200)return output('time-limit');
    const canBoost=s.mode==='combat'&&h>=boostStart-1e-6&&combatUsed<(spec.combat.seconds??Infinity)-1e-7;
    const phase=phaseFor(spec,{...s,mode:canBoost?'combat':'normal'},seconds,combatUsed,fluid);
    if(!phase)return output('rating-time-exhausted');
    const w=initial.dryLb+fuel+fluid,tas=speedFor(h,w,phase);
    if(!tas)return output('source-power-unavailable');
    const get=(height,weight)=>{const speed=speedFor(height,weight,phase);return speed?evaluate(M,T,L,model,spec,s,height,M.airspeeds(speed,height).eas,weight,phase,true):{status:'source-power-unavailable'};};
    const a=get(h,w);if(!a.power)return output(a.status);if(!(a.power.climbFpm>0))return output('unattainable');
    let dh=Math.min(stepFt,to-h);if(!canBoost&&s.mode==='combat'&&boostStart>h)dh=Math.min(dh,boostStart-h);
    const injectionRate=phase.key==='injection'?(spec.injection.fluidLbPerMinute??0)/60:0;
    const remaining=phase.key==='continuous'?Infinity:phase.key==='injection'?Math.min((spec.combat.seconds??Infinity)-combatUsed,(spec.injection.seconds??Infinity)-combatUsed):phase.key==='combat'?(spec.combat.seconds??Infinity)-combatUsed:(spec.normal.seconds??Infinity)-seconds;
    const remainingFluid=injectionRate>0?fluid/injectionRate:Infinity;
    let dt,burn,mid,endTas;
    if(accountForTasChange){
     const limit=Math.min(remaining,remainingFluid);
     if(!(limit>1e-8))return output('rating-time-exhausted');
     const step=scheduledClimbStep({
      dh,tas,weightLb:w,dryLb:initial.dryLb,fuelPerHpSecond,injectionRate,limit,
      speedAt:(distance,weight)=>speedFor(h+distance,weight,phase),
      stateAt:(distance,weight)=>get(h+distance,weight),
      referenceSpeedAt:distance=>interpolate(model.climbRateTas?.[phase.key],h+distance,1)
     });
     if(step.status)return output(step.status);
     ({dh,dt,burn,mid,endTas}=step);
    }else{
     // Historical scorecards keep the original steady-rate integration.
     dt=dh/a.power.climbFpm*60;
     const halfBurn=(source?0:policy.bsfcLbPerHpHour*a.power.shaftHp*dt/7200)+injectionRate*dt/2;
     mid=get(h+dh/2,w-halfBurn);if(!mid.power)return output(mid.status);if(!(mid.power.climbFpm>0))return output('unattainable');
     dt=dh/mid.power.climbFpm*60;
     const allowed=Math.min(dt,remaining,remainingFluid);
     if(!(allowed>1e-8))return output('rating-time-exhausted');
     if(allowed<dt){
      dt=allowed;dh=Math.min(dh,mid.power.climbFpm*dt/60);
      mid=get(h+dh/2,w-((source?0:policy.bsfcLbPerHpHour*a.power.shaftHp/3600)+injectionRate)*dt/2);
      if(!mid.power)return output(mid.status);
     }
     burn=source?0:policy.bsfcLbPerHpHour*mid.power.shaftHp*dt/3600;
    }
    if(burn>fuel)return output('fuel-exhausted');
    const start=h;h+=dh;seconds+=dt;fuel-=burn;fluid=Math.max(0,fluid-injectionRate*dt);
    if(phase.key==='combat'||phase.key==='injection')combatUsed+=dt;
    estimated||=mid.benchmark.estimated;
    const tail=schedule.at(-1);if(tail?.phase===phase.key){tail.toFt=h;tail.seconds+=dt;}else schedule.push({phase:phase.key,label:phase.label,fromFt:start,toFt:h,seconds:dt});
    trace?.push({seconds,altFt:h,phase:phase.key,inputs:traceInputs(mid),...(accountForTasChange?{tasMph:endTas}:{})});
   }
   return output(h>=to-1e-6?'reached':'integration-limit');
  }
  if(source)return {...replay(s.mode==='combat'?from:Infinity,options.trace),policy:'Recorded climb TAS at report takeoff weight and rating schedule.'};
  if(s.mode==='normal')return {...replay(Infinity,options.trace),policy:accountForTasChange?
   (spec.climbTAS?'Recorded Normal climb TAS schedule and signed TAS energy.':
    'Manual Normal climb schedule with IAS approximated as CAS and signed TAS energy.'):
   'Manual normal-climb schedule; IAS approximately CAS; no time budget reset.'};
  const starts=[from];for(let h=from+1000;h<to;h+=1000)starts.push(h);starts.push(to);
  const candidates=starts.map(start=>replay(start)),valid=candidates.filter(r=>r.status==='reached');
  function withTrace(run){return options.trace?{...run,trace:replay(run.boostStartFt,true).trace}:run;}
  if(!valid.length)return {...withTrace(candidates.reduce((a,b)=>b.reachedFt>a.reachedFt?b:a)),candidateWindows:starts.length,policy:'No tested permitted boost window reaches the target.'};
  let best=valid.reduce((a,b)=>b.seconds<a.seconds?b:a);
  for(const h of [best.boostStartFt-500,best.boostStartFt+500].filter(h=>h>=from&&h<to)){const r=replay(h);candidates.push(r);if(r.status==='reached'&&r.seconds<best.seconds)best=r;}
  return {...withTrace(best),candidateWindows:candidates.length,frontLoadedSeconds:candidates[0].seconds,policy:accountForTasChange?
   'Quickest tested contiguous boost window on one planned Combat speed schedule. Timed steps include signed TAS energy and changing fuel mass.':
   'Quickest tested contiguous boost window, 1000-ft grid plus local 500-ft refinement; shared-solver midpoint mass replay. Not a proof of global optimal control; no thermal or speed-change acceleration model.'};
 }
 return Object.freeze({validateSettings,fittedInjection,load,phaseFor,nativePower,evaluate,levelFlightCase,powerStep,levelAccelerationMphPerSecond,bestClimb,metrics,climb,accelerate,interpolate});
});
