// WWII aircraft performance research kernel, v0.3 DIAGNOSTIC; model parameters not calibrated.
// Not a certified flight simulator. See FRAMEWORK.md for evidence limitations.
// SI units inside calculations; aviation units only at input/output boundaries.
const FT = 0.3048;
const MPH = 0.44704;
const HP_W = 745.6998716;
const LB_N = 4.4482216153;
const FT2_M2 = 0.09290304;
const G = 9.80665;
const R = 287.05287;
const GAMMA = 1.4;
const MPS_TO_FTMIN = 196.8503937;

export function atmosphereISA(altFt) {
  if (!Number.isFinite(altFt) || altFt < 0 || altFt > 36089) {
    throw new RangeError("Reference engine supports ISA 0–36,089 ft.");
  }
  const h = altFt * FT;
  const tempK = 288.15 - 0.0065 * h;
  const pressurePa = 101325 * Math.pow(tempK / 288.15, 5.2558797);
  const densityKgM3 = pressurePa / (R * tempK);
  return {
    tempK,
    pressurePa,
    densityKgM3,
    soundSpeedMps: Math.sqrt(GAMMA * R * tempK),
    densityRatio: densityKgM3 / 1.225
  };
}

export function interpolateBracket(points, x, xKey, yKey) {
  if (!points || points.length < 2) throw new Error("At least two measured points required.");
  const sorted = [...points].sort((a,b) => a[xKey] - b[xKey]);
  if (x < sorted[0][xKey] || x > sorted[sorted.length-1][xKey]) {
    throw new RangeError("Requested value outside supported source interval. No extrapolation.");
  }
  for (let i=1; i<sorted.length; i++) {
    const lo=sorted[i-1], hi=sorted[i];
    if (x <= hi[xKey]) {
      const t=(x-lo[xKey])/(hi[xKey]-lo[xKey]);
      return lo[yKey]+t*(hi[yKey]-lo[yKey]);
    }
  }
  return sorted[sorted.length-1][yKey];
}

export function shaftHorsepower(aircraft, {altFt, rating="67inHg", gear="auto"}) {
  const mode=aircraft.powerRatings[rating];
  if (!mode) throw new Error("Unknown engine rating: "+rating);
  if (gear==="auto") {
    // Placeholder only: real shift is scheduled from engine and flight manuals.
    gear = altFt < aircraft.supercharger.illustrativeAutoShiftFt ? "low" : "high";
    const chosen=mode.gears[gear];
    if (altFt<chosen[0].altFt || altFt>chosen[chosen.length-1].altFt) {
      const alternative=gear==="low" ? "high" : "low";
      const alt=mode.gears[alternative];
      if (altFt>=alt[0].altFt && altFt<=alt[alt.length-1].altFt) gear=alternative;
    }
  }
  const points=mode.gears[gear];
  if (!points) throw new Error("Unsupported supercharger gear: "+gear);
  // Requested MAP is not the same as the manifold pressure actually attainable.
  // Interpolate within same-source rating + blower gear points only; never extrapolate.
  if(!points.every(p=>Number.isFinite(p.attainableManifoldInHg)))
    throw new Error("Missing source-backed attainable MAP values for this power curve.");
  const bhp=interpolateBracket(points,altFt,"altFt","bhp");
  const actualMAP=interpolateBracket(points,altFt,"altFt","attainableManifoldInHg");
  const criticalAltitudeFt=aircraft.supercharger.criticalAltitudeFtByRatingAndGear?.[rating]?.[gear]??null;
  return {bhp,rating,gear,rpm:mode.rpm,
    manifoldInHg:actualMAP,requestedManifoldInHg:mode.manifoldInHg,
    criticalAltitudeFt,boostLimited:actualMAP<mode.manifoldInHg-1e-6,
    boostEvidence:"interpolated 1944 flight-test table; not a full compressor or throttle map",
    status:mode.status};
}

export function geometry(aircraft) {
  const areaM2=aircraft.geometry.wingAreaFt2*FT2_M2;
  const spanM=aircraft.geometry.spanFt*FT;
  const aspectRatio=spanM*spanM/areaM2;
  const e=aircraft.aerodynamicModel.oswaldEfficiency;
  return {areaM2,spanM,aspectRatio,inducedFactor:1/(Math.PI*aspectRatio*e)};
}

export function evaluatePoint(aircraft, options) {
  const {altFt, speedMphTas,weightLb=aircraft.referenceWeightLb,
    rating="67inHg",gear="auto",loadFactor=1,
    extraCd=0}=options;
  if (![altFt,speedMphTas,weightLb,loadFactor,extraCd].every(Number.isFinite)) {
    throw new TypeError("All flight condition numbers must be finite.");
  }
  if (speedMphTas<=0 || weightLb<=0 || loadFactor<1 || extraCd<0) {
    throw new RangeError("Invalid speed/weight/load factor/configuration drag.");
  }
  const atmo=atmosphereISA(altFt);
  const geom=geometry(aircraft);
  const engine=shaftHorsepower(aircraft,{altFt,rating,gear});
  const V=speedMphTas*MPH;
  const W=weightLb*LB_N;
  const q=0.5*atmo.densityKgM3*V*V;
  const CL=loadFactor*W/(q*geom.areaM2);
  const CDind=geom.inducedFactor*CL*CL;
  const CDparasite=aircraft.aerodynamicModel.cd0+extraCd;
  // Additional aircraft-specific wave-drag model must be sourced before enablement.
  const CDwave=0;
  const Dparasite=q*geom.areaM2*CDparasite;
  const Dinduced=q*geom.areaM2*CDind;
  const Dwave=q*geom.areaM2*CDwave;
  const Dtotal=Dparasite+Dinduced+Dwave;
  const eta=aircraft.propeller.etaModel.value;
  if (eta<=0 || eta>1) throw new Error("Invalid propeller efficiency.");
  const shaftPowerW=engine.bhp*HP_W;
  const propulsivePowerW=eta*shaftPowerW;
  const powerRequiredW=Dtotal*V; // aerodynamic/propulsive power, not engine shaft hp
  const powerExcessW=propulsivePowerW-powerRequiredW;
  const psMps=powerExcessW/W; // specific excess power = ROC at constant speed, small climb angle
  const clMax=aircraft.aerodynamicModel.clMaxClean;
  const liftLimitN=q*geom.areaM2*clMax;
  const steadyFlightFeasible=liftLimitN>=W;
  const flightStatus=steadyFlightFeasible?"within_illustrative_lift_envelope":"below_model_stall_speed";
  const stallEasMph=Math.sqrt(2*W/(1.225*geom.areaM2*clMax))/MPH;
  const gLimit=aircraft.aerodynamicModel.illustrativeStructuralGLimit;
  const aerodynamicNmax=clMax*q*geom.areaM2/W;
  const nInstant=steadyFlightFeasible?Math.min(gLimit,aerodynamicNmax):null;
  // Solve P_available = P_required(n) for a level, sustained coordinated turn.
  const dragAllowance=propulsivePowerW/V-Dparasite-Dwave;
  const inducedAtOneG=q*geom.areaM2*geom.inducedFactor*Math.pow(W/(q*geom.areaM2),2);
  const nSustained=steadyFlightFeasible && dragAllowance>=inducedAtOneG ?
    Math.min(nInstant,Math.sqrt(dragAllowance/inducedAtOneG)) : null;
  const turn=(n)=>{
    if(n===null || n<=1) return {degPerSec:null,radiusM:null};
    const rate=G*Math.sqrt(n*n-1)/V;
    return {degPerSec:rate*180/Math.PI,radiusM:V/rate};
  };
  return {
    input:{altFt,speedMphTas,weightLb,rating,gear:engine.gear,loadFactor,extraCd},
    atmosphere:{rhoKgM3:atmo.densityKgM3,mach:V/atmo.soundSpeedMps,easMph:speedMphTas*Math.sqrt(atmo.densityRatio)},
    engine:{bhp:engine.bhp,rpm:engine.rpm,manifoldInHg:engine.manifoldInHg,requestedManifoldInHg:engine.requestedManifoldInHg,
      criticalAltitudeFt:engine.criticalAltitudeFt,boostLimited:engine.boostLimited,boostEvidence:engine.boostEvidence,
      gear:engine.gear,shaftHpPerWeightLb:engine.bhp/weightLb,propEfficiency:eta},
    aerodynamics:{wingLoadingLbFt2:weightLb/aircraft.geometry.wingAreaFt2,aspectRatio:geom.aspectRatio,dynamicPressurePa:q,CL,CDparasite,CDinduced:CDind,CDtotal:CDparasite+CDind+CDwave,
      dragParasiteLbf:Dparasite/LB_N,dragInducedLbf:Dinduced/LB_N,dragTotalLbf:Dtotal/LB_N,
      parasiteSharePct:100*Dparasite/Dtotal,inducedSharePct:100*Dinduced/Dtotal,
      liftToDrag:loadFactor*W/Dtotal,
      stallEasMph},
    power:{shaftHp:engine.bhp,propulsiveHp:propulsivePowerW/HP_W,requiredPropulsiveHp:powerRequiredW/HP_W,requiredShaftHp:powerRequiredW/eta/HP_W,
      excessPropulsiveHp:steadyFlightFeasible?powerExcessW/HP_W:null,
      specificExcessPowerMps:steadyFlightFeasible?psMps:null,
      rawUnconstrainedExcessPropulsiveHp:powerExcessW/HP_W,
      rateClimbFtMin:steadyFlightFeasible?psMps*MPS_TO_FTMIN:null,
      levelAccelerationMps2:steadyFlightFeasible?powerExcessW/(W/G*V):null,
      rawUnconstrainedRateClimbFtMin:psMps*MPS_TO_FTMIN},
    flightValidity:{feasibleUnderProvisionalCLmax:steadyFlightFeasible,status:flightStatus,
      note:"CLmax is an unvalidated assumption; test stall figures are IAS and cannot become calibrated EAS without airspeed correction."},
    maneuver:{instantaneousG:nInstant,sustainedG:nSustained,
      instantaneousTurn:turn(nInstant),sustainedTurn:turn(nSustained)},
    confidence:{historicalEngine:"A/B",geometric:"A",aerodynamicModel:"D illustrative",propEfficiency:"D illustrative",handlingAndGLimit:"D illustrative",derivedOutput:"model, not measurement"}
  };
}

export function speedSweep(aircraft,{altFt,speedsMphTas,weightLb=aircraft.referenceWeightLb,rating="67inHg",gear="auto",loadFactor=1,extraCd=0}) {
  return speedsMphTas.map(speedMphTas=>evaluatePoint(aircraft,{altFt,speedMphTas,weightLb,rating,gear,loadFactor,extraCd}));
}

export function maxLevelSpeed(aircraft, {altFt,weightLb=aircraft.referenceWeightLb,rating="67inHg",gear="auto"}) {
  const f=(v)=>{const p=evaluatePoint(aircraft,{altFt,speedMphTas:v,weightLb,rating,gear});
    return p.flightValidity.feasibleUnderProvisionalCLmax?p.power.excessPropulsiveHp:null;};
  let last=null,upper=null;
  // Find the highest positive-to-negative power-excess crossing.
  for(let v=90;v<=600;v+=2) {
    const current=f(v);
    if(last && last.value!==null && current!==null && last.value>=0 && current<0) upper=[last.speed,v];
    last={speed:v,value:current};
  }
  if(!upper) return null;
  let [lo,hi]=upper;
  for(let i=0;i<42;i++) {
    const mid=(lo+hi)/2;
    if(f(mid)!==null && f(mid)>0) lo=mid; else hi=mid;
  }
  return (lo+hi)/2;
}

export function bestRateClimb(aircraft,{altFt,weightLb=aircraft.referenceWeightLb,rating="67inHg",gear="auto"}) {
  let best=null;
  for(let speed=95;speed<=330;speed+=1) {
    const p=evaluatePoint(aircraft,{altFt,speedMphTas:speed,weightLb,rating,gear});
    if(speed<p.aerodynamics.stallEasMph/Math.sqrt(atmosphereISA(altFt).densityRatio)) continue;
    if(p.power.rateClimbFtMin===null)continue;
    if(!best || p.power.rateClimbFtMin>best.rateClimbFtMin) best={speedMphTas:speed,rateClimbFtMin:p.power.rateClimbFtMin};
  }
  return best;
}

export function timeToClimbMinutes(aircraft,{fromAltFt,toAltFt,stepFt=200,weightLb=aircraft.referenceWeightLb,rating="67inHg"}) {
  if(toAltFt<=fromAltFt) throw new RangeError("Destination must be higher.");
  let seconds=0;
  for(let h=fromAltFt;h<toAltFt;h+=stepFt) {
    const dh=Math.min(stepFt,toAltFt-h);
    const best=bestRateClimb(aircraft,{altFt:h+dh/2,weightLb,rating});
    const roc=best?.rateClimbFtMin;
    if(roc===null || !Number.isFinite(roc) || roc<=0) return null;
    seconds+=dh/roc*60;
  }
  // Constant-weight approximation: no fuel burn, acceleration or gear-change delay.
  return seconds/60;
}

export function afterFuelBurn(weightLb, gallonsBurned, poundsPerUSGallon=6) {
  if(gallonsBurned<0 || poundsPerUSGallon<=0 || weightLb<=gallonsBurned*poundsPerUSGallon) {
    throw new RangeError("Invalid fuel scenario.");
  }
  return weightLb-gallonsBurned*poundsPerUSGallon;
}
