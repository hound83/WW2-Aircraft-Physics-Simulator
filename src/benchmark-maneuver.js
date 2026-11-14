'use strict';

(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const api=factory(node?require('./operating-benchmark.js'):root.OperatingBenchmark,
  node?require('./turn-performance.js'):root.TurnPerformance);
 if(node)module.exports=api;else root.BenchmarkManeuver=api;
})(globalThis,function(B,Turn){
 const MPH=.44704,HP=745.6998716,G=9.80665,LBF=4.4482216153;
 const tolerance=1e-7,maxTime=600;
 const turnHeading=180,defaultStep=.5;
 const sweepGrid=Object.freeze({altitudesFt:Object.freeze([5000,10000,20000]),
  entrySpeedsEasMph:Object.freeze([180,210,250])});
 const nominal=Object.freeze({lift:0,power:1,drag:1});

 function condition(flight,commandG,scenario=nominal,policy){
  if(flight.status!=='modelled')return {status:flight.status};
  const lift=scenario.lift===0?1:Turn.liftBounds(flight,policy.maneuverLiftFraction)[scenario.lift<0?0:1];
  const liftG=flight.limits.nLift*lift;
  const g=commandG===1?1:Math.min(commandG,liftG,flight.limits.structG);
  if(g<1)return {status:'lift-limited'};
  const availableHp=Turn.availableHp(flight,scenario.power);
  const requiredHp=flight.power.requiredHp+Turn.addedDragHp(flight,g,scenario.drag);
  const excessHp=availableHp-requiredHp;
  // At fixed altitude all net propulsive work changes kinetic energy.
  const psMps=excessHp*HP/(flight.weightLb*LBF);
  return {g,liftG,availableHp,requiredHp,excessHp,psMps,
   tasAcceleration:B.levelAccelerationMphPerSecond({...flight,power:{psMps}}),
   rateDegSec:Turn.turnFromLoad(g,flight.tasMph).rateDegSec,
   limiting:g===commandG?'command':g===liftG?'lift':'structure'};
 }

 function replay(M,T,L,model,spec,policy,settings,{altFt,entryEasMph,commandG},
   {stepSeconds=defaultStep,scenario=nominal,sensitivity,trace:recordTrace=true}={}){
  if(!Number.isFinite(altFt)||altFt<0||altFt>40000||
    !Number.isFinite(entryEasMph)||entryEasMph<=0||!Number.isFinite(commandG)||commandG<=1||commandG>9||
    !(stepSeconds>=.05&&stepSeconds<=1))throw Error('Choose a valid altitude, positive entry EAS and a load above 1 G up to 9 G.');
  const c=B.levelFlightCase(M,T,L,model,spec,policy,settings,altFt,{allowProvisionalManeuver:true});
  const {initial}=c;
  let eas=entryEasMph,seconds=0,heading=0,fuel=initial.fuelLb,fluid=initial.injectionLb,combatSeconds=0;
  let turnSeconds=null,exitEasMph=null,estimatedPower=false,peakG=1,minEasMph=eas,turnEnergyHeightFt=null;
  const limits={lift:0,structure:0,powerDeficit:0};
  const trace=recordTrace?[{seconds,easMph:eas,headingDeg:heading}]:null,schedule=[];
  const output=status=>({
   status,altFt,entryEasMph,commandG,elapsedSeconds:seconds,turnSeconds,exitEasMph,
   recoverySeconds:status==='reached'?seconds-turnSeconds:null,
   seconds:status==='reached'?seconds:null,reachedEasMph:eas,headingDeg:heading,minEasMph,peakG,limits,
   turnEnergyHeightFt,initialWeightLb:initial.weightLb,endWeightLb:initial.dryLb+fuel+fluid,
   fuelUsedLb:initial.fuelLb-fuel,injectionUsedLb:initial.injectionLb-fluid,injectionRemainingLb:fluid,
   combatSeconds,combatRemainingSeconds:Math.max(0,(spec.combat.seconds??0)-combatSeconds),
   estimatedPower,intake:Boolean(spec.performanceIntake),schedule,...(trace&&{trace})
  });
  if(eas>c.maxEasMph)return output('speed-domain-unavailable');

  while(seconds<maxTime-tolerance){
   const turning=turnSeconds===null,segment=turning?'turn':'recovery',demand=turning?commandG:1;
   const phase=B.phaseFor(spec,c.settings,seconds,combatSeconds,fluid);
   if(!phase)return output('rating-time-exhausted');
   if(fuel<=tolerance)return output('fuel-exhausted');
   const {remaining,boosting,injectionRate}=B.powerStep(spec,phase,seconds,combatSeconds,fluid);
   const weight=initial.dryLb+fuel+fluid;
   const at=(speed,mass)=>c.evaluate(speed,mass,phase);
   const begin=at(eas,weight),start=condition(begin,demand,scenario,sensitivity);
   if(start.status)return output(start.status);
   if(turning&&start.g<=1+tolerance)return output('lift-limited');
   if(!turning&&start.tasAcceleration<=1e-6)return output('power-limited');
   const initialFuelRate=c.fuelFlow(begin);
   const initialEasRate=start.tasAcceleration*c.easPerTas;
   let dt=Math.min(stepSeconds,remaining,maxTime-seconds);
   if(!(dt>1e-8))return output('integration-limit');

   function advance(duration){
    const midEas=eas+initialEasRate*duration/2;
    if(midEas>c.maxEasMph)return {boundary:'speed-domain-unavailable'};
    const midWeight=weight-Math.min(fuel,initialFuelRate*duration/2)-injectionRate*duration/2;
    const mid=at(midEas,midWeight),move=condition(mid,demand,scenario,sensitivity);
    if(move.status)return {boundary:move.status};
    if(turning&&move.g<=1+tolerance)return {boundary:'lift-limited'};
    const speed=eas+move.tasAcceleration*c.easPerTas*duration;
    const burn=c.fuelFlow(mid)*duration;
    const nextHeading=heading+move.rateDegSec*duration;
    if(speed>c.maxEasMph)return {boundary:'speed-domain-unavailable'};
    const end=at(speed,weight-Math.min(burn,fuel)-injectionRate*duration);
    const last=condition(end,demand,scenario,sensitivity);
    if(last.status)return {boundary:last.status};
    if(turning&&last.g<=1+tolerance)return {boundary:'lift-limited'};
    const event=turning&&nextHeading>=turnHeading?'rollout':!turning&&speed>=entryEasMph?'recovered':
     burn>=fuel?'fuel-exhausted':!turning&&last.tasAcceleration<=0?'power-limited':null;
    return {speed,burn,nextHeading,mid,move,end,last,event};
   }

   let next=advance(dt);
   if(next.boundary||next.event){
    // Localize the first stop or phase boundary in this step.
    let low=0,high=dt,lastValid=null;
    for(let i=0;i<27;i++){
     const middle=(low+high)/2,attempt=advance(middle);
     if(attempt.boundary||attempt.event)high=middle;
     else {low=middle;lastValid=attempt;}
    }
    const event=advance(high);
    if(event.boundary&&low<1e-8)return output(event.boundary);
    dt=event.boundary?low:high;
    next=event.boundary?{...lastValid,event:event.boundary}:event;
   }

   const previousEas=eas;
   seconds+=dt;
   eas=next.event==='recovered'?entryEasMph:next.speed;
   heading=next.event==='rollout'?turnHeading:next.nextHeading;
   fuel=Math.max(0,fuel-next.burn);
   fluid=Math.max(0,fluid-injectionRate*dt);
   if(fluid<tolerance)fluid=0;
   if(boosting)combatSeconds+=dt;
   minEasMph=Math.min(minEasMph,eas);
   estimatedPower||=begin.benchmark.estimated||next.mid.benchmark.estimated||next.end.benchmark.estimated;
   if(turning){
    peakG=Math.max(peakG,start.g,next.move.g,next.last.g);
    if(next.move.limiting==='lift'||next.move.limiting==='structure')limits[next.move.limiting]+=dt;
    if(next.move.excessHp<0)limits.powerDeficit+=dt;
   }
   if(recordTrace){
    // Store the relevant inputs at both interval ends and its midpoint.
    const inputs=[begin,next.mid,next.end].map(f=>({
     status:f.status,altFt:f.altFt,tasMph:f.tasMph,air:f.air,benchmark:f.benchmark,engine:{gear:f.engine.gear}
    }));
    trace.push({seconds,easMph:eas,headingDeg:heading,segment,phase:phase.key,
     g:next.move.g,limiting:next.move.limiting,excessHp:next.move.excessHp,weightLb:next.mid.weightLb,inputs});
   }
   const change=schedule.at(-1);
   if(change?.phase===phase.key&&change.segment===segment){change.endSeconds=seconds;change.endEasMph=eas;}
   else schedule.push({segment,phase:phase.key,label:phase.label,startSeconds:seconds-dt,endSeconds:seconds,
    startEasMph:previousEas,endEasMph:eas});

   if(next.event==='rollout'){
    turnSeconds=seconds;
    exitEasMph=eas;
    turnEnergyHeightFt=(exitEasMph**2-entryEasMph**2)*(MPH/c.easPerTas)**2/(2*G*.3048);
    if(eas>=entryEasMph-tolerance)return output('reached');
   }else if(next.event)return output(next.event==='recovered'?'reached':next.event);
  }
  return output('integration-limit');
 }

 function sensitivity(replayAt,policy){
  const runs=[-1,1].flatMap(lift=>policy.usefulPowerFraction.flatMap(power=>
   policy.incrementalDragFraction.map(drag=>replayAt({lift,power,drag}))));
  const range=(key)=>{
   const values=runs.map(run=>run[key]).filter(Number.isFinite);
   return values.length?[Math.min(...values),Math.max(...values)]:null;
  };
  return {tested:runs.length,completed:runs.filter(run=>run.status==='reached').length,
   turnSeconds:range('turnSeconds'),exitEasMph:range('exitEasMph'),recoverySeconds:range('recoverySeconds'),
   totalSeconds:range('seconds')};
 }

 return Object.freeze({condition,replay,sensitivity,sweepGrid});
});
