/* Universal Model v0.2 — shared equations for three aircraft, deliberately provisional coefficients.
   SI internal units. Greg worksheets are regression comparators, NOT measured aircraft data. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.UniversalAirPhysics=api;})(typeof globalThis!=='undefined'?globalThis:this, function(){
'use strict';
const MPH=.44704,FT=.3048,HP=745.6998716,LBF=4.4482216153,RHO0=1.225,PS0=101325,T0=288.15,R=287.05287,G=9.80665,GAMMA=1.4;
function isa(ft){if(!Number.isFinite(ft)||ft<0||ft>36089)throw Error('Atmosphere valid only for 0–36,089 ft');const h=ft*FT,T=T0-.0065*h,p=PS0*Math.pow(T/T0,5.2558797),rho=p/(R*T),a=Math.sqrt(GAMMA*R*T);return {T,p,rho,a,sigma:rho/RHO0};}
function trueFromCAS(mph,ft){const at=isa(ft),M0=mph*MPH/Math.sqrt(GAMMA*R*T0),impact=PS0*(Math.pow(1+.2*M0*M0,3.5)-1),M=Math.sqrt(5*(Math.pow(1+impact/at.p,2/7)-1));return M*at.a/MPH;}
function casFromTrue(mph,ft){const at=isa(ft),M=mph*MPH/at.a,impact=at.p*(Math.pow(1+.2*M*M,3.5)-1),M0=Math.sqrt(5*(Math.pow(1+impact/PS0,2/7)-1));return M0*Math.sqrt(GAMMA*R*T0)/MPH;}
function tasFrom(mph,kind,alt){if(kind==='TAS')return mph;if(kind==='EAS')return mph/Math.sqrt(isa(alt).sigma);if(kind==='CAS')return trueFromCAS(mph,alt);throw Error('IAS needs a specimen-specific instrument/position calibration');}
// Calibration rows must be sourced IAS/CAS pairs for one aircraft, installation,
// and configuration. Deliberately forbid extrapolation (notably near stall).
function casFromIAS(iasMph,calibration){
 if(!Number.isFinite(iasMph)||iasMph<=0)throw Error('Invalid indicated airspeed');
 if(!calibration||!Array.isArray(calibration.points)||calibration.points.length<2||!calibration.source||!calibration.configuration)
   throw Error('IAS needs a sourced, configuration-specific calibration');
 const p=[...calibration.points].sort((a,b)=>a.iasMph-b.iasMph);
 for(let i=0;i<p.length;i++){
   if(!(p[i].iasMph>0&&p[i].casMph>0)||i&&!(p[i].iasMph>p[i-1].iasMph&&p[i].casMph>p[i-1].casMph))
     throw Error('IAS calibration nodes must be positive and strictly increasing');
 }
 if(iasMph<p[0].iasMph||iasMph>p.at(-1).iasMph)return null;
 for(let i=0;i<p.length;i++){
   if(iasMph===p[i].iasMph)return p[i].casMph;
   if(i&&iasMph<p[i].iasMph){const t=(iasMph-p[i-1].iasMph)/(p[i].iasMph-p[i-1].iasMph);return p[i-1].casMph+t*(p[i].casMph-p[i-1].casMph);}
 }
 return p.at(-1).casMph;
}
function resolveAirspeed(valueMph,kind,altFt,calibration=null){
 if(!(Number.isFinite(valueMph)&&valueMph>0))throw Error('Invalid airspeed');
 let tas,cas,correction='none';
 if(kind==='IAS'){
   cas=casFromIAS(valueMph,calibration);
   if(cas===null)return {status:'outside-calibration-range',input:{valueMph,kind,altFt},source:calibration.source};
   tas=trueFromCAS(cas,altFt);correction='IAS to CAS once, sourced linear interpolation';
 }else{tas=tasFrom(valueMph,kind,altFt);cas=casFromTrue(tas,altFt);}
 return {status:'resolved',input:{valueMph,kind,altFt},...airspeeds(tas,altFt),cas,
   correction,source:kind==='IAS'?calibration.source:null,configuration:kind==='IAS'?calibration.configuration:null};
}
function airspeeds(tas,ft){const a=isa(ft);return {tas,cas:casFromTrue(tas,ft),eas:tas*Math.sqrt(a.sigma),ias:null,mach:tas*MPH/a.a};}
function interp(rows,alt){const p=[...rows].sort((a,b)=>a.altFt-b.altFt);if(!p.length||alt<p[0].altFt||alt>p.at(-1).altFt)return null;for(let i=0;i<p.length;i++){if(Math.abs(p[i].altFt-alt)<1e-8)return {...p[i]};if(i&&alt<p[i].altFt){const q=p[i-1],r=p[i],t=(alt-q.altFt)/(r.altFt-q.altFt);return {altFt:alt,bhp:q.bhp+t*(r.bhp-q.bhp),mapInHg:q.mapInHg!=null&&r.mapInHg!=null?q.mapInHg+t*(r.mapInHg-q.mapInHg):null,method:'linear between sourced engine nodes'};}}return {...p.at(-1)};}
function shaftPower(ac,alt,rating,gear){const rr=ac.powerRatings[rating||ac.defaultRating];if(!rr)return null;const gg=gear||ac.defaultGear;let candidates=[];if(gg==='auto'){for(const [g,rows] of Object.entries(rr.gears)){const s=interp(rows,alt);if(s)candidates.push({gear:g,...s});}}else{const s=interp(rr.gears[gg]||[],alt);if(s)candidates.push({gear:gg,...s});}if(!candidates.length)return null;const best=candidates.sort((a,b)=>b.bhp-a.bhp)[0];return {...best,notes:rr.notes,rating:rating||ac.defaultRating};}
// A period report may supply *both* the wide-open/level-speed engine boost and
// the slower-climb engine boost at the same altitude and gear. Above the
// supercharger critical height these differ: propeller aircraft do not always
// deliver their top-speed chart horsepower during a slow turn or climb.
// Constant-RPM absolute-MAP scaling is an explicit PROXY, not measured torque.
// Nothing changes in the core solver unless the caller explicitly supplies
// source-identified, condition-specific boost measurements.
function shaftPowerAtMeasuredBoost(ac,alt,rating,gear,condition){
 const baseline=shaftPower(ac,alt,rating,gear);
 if(!baseline)return null;
 const ref=condition?.referenceBoostPsi,actual=condition?.observedBoostPsi;
 if(!(Number.isFinite(ref)&&Number.isFinite(actual)&&
    ref>-14.6&&actual>-14.6&&typeof condition.source==='string'&&condition.source.trim()))return null;
 const ratio=Math.min(1,(14.6959+actual)/(14.6959+ref));
 return {...baseline,bhp:baseline.bhp*ratio,
   condition:'observed same-aircraft, same-altitude, same-gear MAP correction',
   referenceBhp:baseline.bhp,referenceBoostPsi:ref,observedBoostPsi:actual,
   absoluteManifoldRatio:ratio,boostSource:condition.source,
   accuracy:'provisional BHP ∝ absolute MAP at constant RPM; NOT a torque-meter reading'};
}
// v2.1: predict the *availability* of manifold pressure from flight-speed ram.
// At the source-reported full-throttle altitude and speed, the engine just
// achieves its commanded manifold pressure. At other conditions, inlet total
// pressure p0=p(1+.2M^2)^3.5 (isentropic subsonic flow) is the AVAILABLE
// pressure source. A regulator caps boost when sufficient pressure exists.
// Recovery=1 is an ideal, explicit upper-bound assumption, NOT a measured
// engine-specific ram-recovery map. All reference critical points carry sources.
function ramCriticalAbsolutePa(map){
 if(!(map&&Number.isFinite(map.value)))return null;
 if(map.unit==='absoluteInHg')return map.value*3386.389;
 if(map.unit==='absoluteAta')return map.value*98066.5;
 if(map.unit==='gaugePsi')return PS0+map.value*6894.757293;
 return null;
}
function inletPressureAtSpeed(altFt,tasMph,recovery=1){
 if(!(Number.isFinite(tasMph)&&tasMph>0&&Number.isFinite(recovery)&&recovery>=0&&recovery<=1))return null;
 const at=isa(altFt),mach=tasMph*MPH/at.a;
 if(!(mach<1))return null;
 const pitot=at.p*Math.pow(1+.2*mach*mach,3.5);
 return {pressurePa:at.p+recovery*(pitot-at.p),staticPa:at.p,pitotPa:pitot,mach,recovery};
}
function ramManifoldAtSpeed(ac,altFt,tasMph,rating,gear,options={}){
 const rated=rating||ac.defaultRating,selectedGear=gear||ac.defaultGear;
 const point=ac.inletRam?.ratings?.[rated]?.[selectedGear];
 if(!point||!(point.criticalAltitudeFt>=0&&point.criticalTasMph>0))return {status:'missing-source-critical-point'};
 const capPa=ramCriticalAbsolutePa(point.criticalManifold);
 const recovery=options.recovery??1;
 if(!(capPa>0))return {status:'invalid-manifold-unit'};
 const reference=inletPressureAtSpeed(point.criticalAltitudeFt,point.criticalTasMph,recovery);
 const actual=inletPressureAtSpeed(altFt,tasMph,recovery);
 if(!reference||!actual)return {status:'invalid-ram-condition'};
 const unregulatedPa=capPa*actual.pressurePa/reference.pressurePa;
 const predictedPa=Math.min(capPa,unregulatedPa);
 return {status:'predicted',rated,gear:selectedGear,altFt,tasMph,
  criticalAltitudeFt:point.criticalAltitudeFt,criticalTasMph:point.criticalTasMph,
  regulated:unregulatedPa>=capPa,manifoldAbsolutePa:predictedPa,
  manifoldAbsoluteInHg:predictedPa/3386.389,
  manifoldGaugePsi:(predictedPa-PS0)/6894.757293,
  manifoldAta:predictedPa/98066.5,
  capManifoldAbsolutePa:capPa,unregulatedManifoldPa:unregulatedPa,
  criticalSource:point.criticalSource,inletSource:ac.inletRam.source,
  ramRecoveryAssumption:recovery,
  confidence:ac.inletRam.status,
  note:'Ideal total-pressure ratio between flight condition and source full-throttle point; not a measured induction-system pressure recovery or blower map'};
}
function referenceLevelTas(ac,altFt,rating,gear){
 const rows=(ac.observedSpeed||[]).filter(p=>p.rating===rating&&p.gear===gear&&p.mphTas>0).sort((a,b)=>a.altFt-b.altFt);
 if(!rows.length||altFt<rows[0].altFt||altFt>rows.at(-1).altFt)return null;
 for(let i=0;i<rows.length;i++){
  if(rows[i].altFt===altFt)return rows[i].mphTas;
  if(i&&altFt<rows[i].altFt){const x=rows[i-1],y=rows[i];return x.mphTas+(y.mphTas-x.mphTas)*(altFt-x.altFt)/(y.altFt-x.altFt);}
 }
 return rows.at(-1).mphTas;
}
function shaftPowerAtRamSpeed(ac,altFt,tasMph,rating,gear,options={}){
 const baseline=shaftPower(ac,altFt,rating,gear);
 if(!baseline)return null;
 const sourceRating=baseline.rating,sourceGear=baseline.gear;
 const current=ramManifoldAtSpeed(ac,altFt,tasMph,sourceRating,sourceGear,options);
 if(current.status!=='predicted')return null;
 // When the regulator maintains boost, this motor cannot lose horsepower
 // solely because of slower ram; no max-level-speed measurement is required.
 if(current.regulated)return {...baseline,ram:current,ramPowerRatio:1,
  powerCondition:'boost regulation maintains source rating; no speed-related ram reduction'};
 const refTas=referenceLevelTas(ac,altFt,sourceRating,sourceGear);
 // Some primary power tables publish rated MAP but no same-rating maximum
 // speed at this exact height. Use that explicit rated-MAP BHP condition,
 // not a fabricated maximum-level speed, as the power reference.
 if(!(refTas>0)){
  if(!(baseline.mapInHg>0))return null;
  const ratedMapPa=baseline.mapInHg*3386.389;
  const ratio=Math.min(1,current.manifoldAbsolutePa/ratedMapPa);
  return {...baseline,bhp:baseline.bhp*ratio,referenceBhp:baseline.bhp,
   ram:current,ramPowerRatio:ratio,referenceMapInHg:baseline.mapInHg,
   powerCondition:'PREDICTED manifold pressure relative to rated-MAP engine chart; no maximum-level TAS at this altitude',
   accuracy:'PROXY BHP proportional to absolute MAP at fixed RPM; no measured pressure recovery or part-load torque map'};
 }
 const reference=ramManifoldAtSpeed(ac,altFt,refTas,sourceRating,sourceGear,options);
 if(reference.status!=='predicted')return null;
 const ratio=Math.min(1,current.manifoldAbsolutePa/reference.manifoldAbsolutePa);
 return {...baseline,bhp:baseline.bhp*ratio,
  referenceBhp:baseline.bhp,ram:current,referenceRam:reference,
  referenceLevelTasMph:refTas,ramPowerRatio:ratio,
  powerCondition:'PREDICTED speed-dependent total-pressure ratio, from critical-speed/altitude source',
  accuracy:'PROXY BHP proportional to predicted absolute manifold pressure; no inlet recovery measurement, no measured part-load torque map'};
}
// NACA ARR (Oct 1941), Biermann and Conway, "The Selection of Propellers for
// High Thrust at Low Airspeed", figs. 10–12 on PDF p.27, public NASA NTRS
// 19930093644. These are graph-read, rounded engineering RESEARCH values,
// NOT measured aircraft-specific P-51/109/Spit/P-47 efficiencies.
// Plot reading uncertainty ~0.03–0.05 eta; Cp<0.2 is outside documented
// figure range. Chart explicitly studies Hamilton Standard test blades and
// distinct 3/4/6/8-blade solitidies, using low-speed experimental data.
const NACA_LOW_SPEED_J=[.3,.5,1,1.5,2,2.5,3,3.5];
const NACA_LOW_SPEED_ETA={
  3:{'.2':[.44,.60,.80,.85,.86,.81,.70,.40],'.4':[.24,.42,.68,.80,.85,.80,.70,.53],'.6':[.08,.12,.20,.30,.43,.64,.77,.82]},
  4:{'.2':[.38,.55,.78,.84,.855,.83,.78,.71],'.4':[.20,.39,.67,.79,.84,.85,.82,.77],'.6':[.10,.18,.32,.48,.64,.75,.81,.82]}
};
function linearGrid(x,nodes,values){
 if(!(Number.isFinite(x)&&x>=nodes[0]&&x<=nodes.at(-1)))return null;
 for(let k=1;k<nodes.length;k++)if(x<=nodes[k]){
  const t=(x-nodes[k-1])/(nodes[k]-nodes[k-1]);return values[k-1]+(values[k]-values[k-1])*t;
 }
 return values.at(-1);
}
function nacaLowSpeedPropChart(bladeCount,J,Cp){
 const grid=NACA_LOW_SPEED_ETA[bladeCount];
 if(!grid||!Number.isFinite(Cp)||!(J>=.3&&J<=3.5)||!(Cp>0))return null;
 const boundedCp=Math.min(.6,Math.max(.2,Cp)),cps=[.2,.4,.6];
 const rows=cps.map(cp=>linearGrid(J,NACA_LOW_SPEED_J,grid[cp.toFixed(1).replace(/^0/,'')]));
 if(rows.some(x=>x===null))return null;
 let eta=rows[0];
 for(let k=1;k<cps.length;k++)if(boundedCp<=cps[k]){
  eta=rows[k-1]+(rows[k]-rows[k-1])*(boundedCp-cps[k-1])/(cps[k]-cps[k-1]);break;
 }
 return {eta,bladeCount,J,Cp,chartCp:boundedCp,
  chartWithinCp:Math.abs(Cp-boundedCp)<1e-8,
  source:'NACA 1941 ARR, Biermann & Conway, Figures 10–12, NASA NTRS 19930093644, p.27',
  digitization:'approximate manual chart reading: eta error ±0.03–0.05; no aircraft-specific fitted points',
  limitations:'Hamilton Standard experimental propeller shapes; no validated installed VDM/Rotol/K-6523A-24 geometry or high-tip-Mach correction; Cp 0.2–0.6, J 0.3–3.5'};
}
// v2.4 RESEARCH scenario: Mach-dependent propeller losses. NOT a measured
// installed-aircraft propeller map. The 1938 NACA TR-639 documents varied
// onset (rotational tip Mach 0.5–0.7 in the studied climb blade-angle regimes).
// Gardner's NACA MR L5G09a (1945) separately reports a roughly 7% efficiency
// increase reducing *resultant* tip Mach 1.16 -> 1.06 at J=2.5, Cp/blade=.08.
// M mode anchors a single simple curvature to that quantitative observation;
// the onset .95 is a transfer assumption, not a measured K-6523/VDM/Rotol map.
// WARNING: the 1945 source is the SAME campaign as the 12 P-47D η samples;
// those samples cannot be described as fully independent validation for M.
function nacaMachResearch(tipMach,etaBase,options={}){
 if(!(Number.isFinite(tipMach)&&tipMach>=0&&etaBase>0))return null;
 const onset=options.onset??.95;
 const observedLower=1.06,observedHigher=1.16;
 // Interpret the source's '7 percent' as a RELATIVE ratio; whether it meant
 // percentage points is unresolved pending direct paired-table audit.
 const observedRatio=1.07;
 const delta=Math.max(0,observedHigher-onset)**2-Math.max(0,observedLower-onset)**2;
 if(!(delta>0))return null;
 const k=Math.log(observedRatio)/delta;
 const correction=Math.exp(-k*Math.max(0,tipMach-onset)**2);
 return {eta:etaBase*correction,correction,penaltyCoefficient:k,
  MachOnsetAssumed:onset,matchedReportRatio:Math.exp(k*delta),
  type:'SOURCE-BOUNDED RESEARCH TRANSFER, not an aircraft-specific measured efficiency',
  source:'NACA 1938 TR-639 19930091714; NACA 1945 MR L5G09a 19930093653, summary and reduced-RPM tests',
  warnings:['.95 onset is assumed; NACA 1938 test onset depends on blade geometry, loading and angle',
   'The report says about 7 percent: treating this as a RELATIVE gain (1.07) rather than 7 percentage points is an explicit assumption pending detailed original table audit',
   '1945 numerical 7 percent ratio is from P-47D three-blade 6507A-2 and is NOT an independent validation of 1945 tabulated rows',
   'No exact four-blade, VDM, Rotol or Mustang blade map; high-Mach test data needed']};
}
function propEta(ac,alt,tasMph,bhp,profile='C',rating=ac.defaultRating,options={}){const v=tasMph*MPH,at=isa(alt);let eta=.8,debug={};if(profile==='A'){eta=.8;}else if(profile==='B'){eta=.8-.045*(tasMph-320)/150;}else if(profile==='C'||profile==='N'||profile==='M'){
  const params=ac.propGeometry||{};
  // Fixed reduction gear: propeller RPM changes with the ENGINE RATING.
  // This matters on the Bf109F4: DB601E combat is 2500 engine rpm, emergency
  // is 2700, with 1.685 engine revs per propeller revolution. It cannot use
  // a single 1741.5 prop rpm copied from the earlier 601A-family gearing.
  const ratedEngineRpm=params.engineRpmByRating?.[rating];
  const hasRatedRpm=params.engineRpmByRating!==undefined;
  const hasOverride=options.engineRpmOverride!==undefined;
  // A flight-test power-required curve includes PART-THROTTLE observations
  // at 2100, 2300, 2700 and 3000 engine RPM. Preserve the normal rating
  // behavior; an explicitly supplied test RPM overrides it for that point.
  if(hasOverride&&(!(options.engineRpmOverride>0)||!Number.isFinite(options.engineRpmOverride)))return null;
  const engineRpm=hasOverride?options.engineRpmOverride:ratedEngineRpm;
  if((hasRatedRpm||hasOverride)&&(!(params.reductionRatioEnginePerProp>1)||!(engineRpm>0)))return null;
  const propRpm=hasRatedRpm||hasOverride?engineRpm/params.reductionRatioEnginePerProp:params.propRpm;
  if(!(params.diameterFt>0&&propRpm>0))return null;
  const n=propRpm/60,D=params.diameterFt*FT,J=v/(n*D),Cp=bhp*HP/(at.rho*n**3*D**5),tipMach=Math.hypot(v,Math.PI*n*D)/at.a;
  if(profile==='N'||profile==='M'){
   const lookup=nacaLowSpeedPropChart(params.bladeCount,J,Cp);
   if(!lookup)return null;
   const researchMach=profile==='M'?nacaMachResearch(tipMach,lookup.eta):null;
   eta=researchMach?researchMach.eta:lookup.eta;
   debug={...lookup,...(researchMach||{}),etaBaseFrom1941Chart:lookup.eta,tipMach,propRpm,engineRpm:hasRatedRpm||hasOverride?engineRpm:null,
    highTipMachUnvalidated:tipMach>.85,
    unmeasuredInstallation:true,
    note:'RESEARCH SCENARIO only; approximate 1941 NACA chart transfer, 0.2 Cp floor is expressly disclosed; no drag fitting to observed climbs.'};
  }else{
   eta=.83*Math.exp(-.075*Math.pow((J-1.65)/.8,2)-.04*Math.pow((Cp-.36)/.85,2))*Math.exp(-.26*Math.pow(Math.max(0,tipMach-.92),2));
   debug={J,Cp,tipMach,propRpm,engineRpm:hasRatedRpm||hasOverride?engineRpm:null,reductionRatio:hasRatedRpm||hasOverride?params.reductionRatioEnginePerProp:null,engineRpmOverrideUsed:hasOverride};
  }
 }else if(profile==='G'){
  // v2.2 deliberately UNVALIDATED transfer experiment: Greg's screenshot
  // for a high-powered P-47D shows propulsive power available vs speed.
  // At 225+ mph the worksheet assumes 2210/2600 = 0.85 efficiency.
  // Below this speed interpolate the worksheet's ratio to that plateau.
  // The curve is not a period Hamilton Standard/VDM/Rotol propeller map,
  // and must not silently replace the aircraft-specific default profile C.
  const nodes=[[100,1700],[125,1800],[150,1950],[175,2080],[200,2145],[225,2210]];
  let available=nodes[0][1];
  if(tasMph>=225)available=2210;
  else if(tasMph>100){
   for(let i=1;i<nodes.length;i++)if(tasMph<=nodes[i][0]){
    const [s0,p0]=nodes[i-1],[s1,p1]=nodes[i];
    available=p0+(p1-p0)*(tasMph-s0)/(s1-s0);break;
   }
  }
  eta=.85*available/2210;
  debug={gregTableP47DPropulsivePowerHp:available,gregTablePlateauHp:2210,
   note:'Research WHAT-IF only: normalized available-power vs TAS from Greg high-power P-47D spreadsheet; 0.85 plateau is inferred from 2210/2600, not a P-51B/109/Spitfire measured blade map.'};
 }else if(profile==='D'){
  // v1.8 opt-in IDEAL ACTUATOR-DISK diagnostic. Momentum theory imposes an
  // induced-energy penalty that grows with propeller thrust/power loading.
  // A single global .85 profile/installation power fraction is an ASSUMPTION,
  // not a measured P-51/109/47 blade map. No aircraft-specific low-speed fit.
  // Paero = T (V + vi); T = 2 rho A vi (V + vi).
  const params=ac.propGeometry||{};
  if(!(params.diameterFt>0&&v>0&&bhp>0))return null;
  const profileFraction=.85;
  const area=Math.PI*(params.diameterFt*FT/2)**2;
  const aeroPower=profileFraction*bhp*HP;
  let low=0,high=Math.cbrt(aeroPower/(2*at.rho*area));
  for(let i=0;i<65;i++){
   const mid=(low+high)/2;
   if(2*at.rho*area*mid*(v+mid)**2>aeroPower)high=mid;else low=mid;
  }
  const vi=(low+high)/2;
  eta=profileFraction*v/(v+vi);
  debug={inducedVelocityMps:vi,diskAreaM2:area,idealInducedEfficiency:v/(v+vi),assumedProfileAndInstallationPowerFraction:profileFraction,
    note:'NACA-inspired actuator-disk momentum bound with a GLOBAL unmeasured 0.85 blade/profile/installation power fraction; no J/Cp blade map, finite blade or compressibility model. Optional research case ONLY.'};
 }else throw Error('Unknown profile');return {eta:Math.max(.05,Math.min(.91,eta)),...debug,method:profile==='M'?'1941 NACA chart plus 1938/1945 source-bounded Mach research scenario (not yet validated for aircraft)':profile==='N'?'NACA 1941 FIGURE-DIGITIZED TRANSFER: approximate 3-/4-blade research data, not installed aircraft flight measurement':profile==='D'?'ideal momentum disk plus assumed global loss fraction; NOT flight-calibrated':profile==='G'?'Greg P-47D worksheet speed-shaped 0.85 plateau, transferred ONLY as an unvalidated test':'heuristic; not a NACA measured propeller map'};}
function geometry(ac){const S=ac.wingAreaM2,b=ac.spanM;if(!(S>0&&b>0))throw Error('Geometry unavailable');return {S,b,AR:b*b/S};}
function dragBreakdown(ac,alt,tasMph,weightLb,cd0,e,n=1){const v=tasMph*MPH,at=isa(alt),geo=geometry(ac),W=weightLb*LBF,q=.5*at.rho*v*v,CL=n*W/(q*geo.S),dParasite=q*geo.S*cd0,dInd=n*n*W*W/(q*Math.PI*e*geo.b*geo.b),drag=dParasite+dInd;return {q,CL,parasiteLbf:dParasite/LBF,inducedLbf:dInd/LBF,totalLbf:drag/LBF,dParasite,dInd,drag,requiredHp:drag*v/HP,parasiteHp:dParasite*v/HP,inducedHp:dInd*v/HP};}
function cd0FromAnchor(ac,profile,e,sourceOnly=false){const ref=ac.calibration,at=ref.altFt,sp=ref.tasMph,sh=shaftPower(ac,at,ref.rating,ref.gear);if(!sh)return null;const prop=propEta(ac,at,sp,sh.bhp,profile,ref.rating);if(!prop)return null;const V=sp*MPH,q=.5*isa(at).rho*V*V,W=ac.weightLb*LBF,b=ac.spanM,S=ac.wingAreaM2;const total=prop.eta*sh.bhp*HP/V,ind=W*W/(q*Math.PI*e*b*b),cd0=(total-ind)/(q*S);return {cd0,etaAtAnchor:prop.eta,anchorSpeed:sp,anchorAlt:at,origin:'calibrated from one speed anchor; NOT a measured drag polar',valid:cd0>.005&&cd0<.085};}
function evaluated(ac,alt,tasMph,opts={}){const profile=opts.profile||'C',polar=opts.polar,e=polar?polar.e:(opts.e??.78),storesWeightLb=opts.storesWeightLb??0,addedDragAreaM2=opts.addedDragAreaM2??0,weight=(opts.weightLb??ac.weightLb)+storesWeightLb,clMax=opts.clMax??ac.clMaxAssumed,structG=opts.structG??7,rating=opts.rating||ac.defaultRating,gear=opts.gear||'auto';if(!(weight>0&&clMax>0&&e>0&&e<=1&&Number.isFinite(storesWeightLb)&&storesWeightLb>=0&&Number.isFinite(addedDragAreaM2)&&addedDragAreaM2>=0)||opts.engineCondition&&opts.engineModel)return {status:'invalid-input'};
 if(polar&&(opts.e!==undefined||opts.refit||!(polar.cd0>.005&&polar.cd0<.085)||typeof polar.source!=='string'||!polar.source.trim()))return {status:'invalid-polar-input',reason:'Explicit polar requires sourced CD0 and e; do not simultaneously refit or override e'};
 const shaft=opts.engineCondition?shaftPowerAtMeasuredBoost(ac,alt,rating,gear,opts.engineCondition):opts.engineModel==='ram-critical'?shaftPowerAtRamSpeed(ac,alt,tasMph,rating,gear,{recovery:opts.ramRecovery??1}):opts.engineModel===undefined?shaftPower(ac,alt,rating,gear):null;
 if(!shaft)return {status:'no-engine-source',aircraft:ac.name,altFt:alt,reason:opts.engineCondition?'No sourced same-condition boost data for power correction':'No source-bounded engine power at selected altitude/rating/gear'};
 const cdData=polar?{cd0:polar.cd0,valid:true,origin:polar.source}:cd0FromAnchor(ac,opts.refit?profile:'C',opts.refit?e:.78);
 if(!cdData||!cdData.valid)return {status:'no-credible-drag-anchor'};
 const prop=propEta(ac,alt,tasMph,shaft.bhp,profile,rating);if(!prop)return {status:'no-prop-input'};
 const effectiveCd0=cdData.cd0+addedDragAreaM2/ac.wingAreaM2;
 const D=dragBreakdown(ac,alt,tasMph,weight,effectiveCd0,e,1),V=tasMph*MPH,W=weight*LBF,geo=geometry(ac),q=D.q;
 const Pav=prop.eta*shaft.bhp*HP,Ps=(Pav-D.drag*V)/W,stallEas=Math.sqrt(2*W/(RHO0*geo.S*clMax))/MPH,air=airspeeds(tasMph,alt),nLift=q*geo.S*clMax/W;
 const feasible=nLift>=1;const nPower2=(Pav/V-D.dParasite)/Math.max(1e-9,D.dInd),powerOk=feasible&&nPower2>=1;const nInst=feasible?Math.min(nLift,structG):null;
 const nSust=powerOk?Math.min(nInst,Math.sqrt(nPower2)):null;
 const turn=n=>n!=null&&n>=1?G*Math.sqrt(Math.max(0,n*n-1))/V*180/Math.PI:null;
 return {status:feasible?'modelled':'below-provisional-stall',aircraft:ac.name,altFt:alt,tasMph,air,weightLb:weight,engine:shaft,prop,cd0:effectiveCd0,cleanCd0:cdData.cd0,dragPolarSource:cdData.origin,externalDragAreaM2:addedDragAreaM2,storesWeightLb,oswald:e,clMax,stallEasMph:stallEas,drag:D,
   power:{shaftHp:shaft.bhp,propulsiveHp:Pav/HP,requiredHp:D.requiredHp,excessHp:(Pav-D.drag*V)/HP,psMps:Ps,climbFpm:feasible?Ps*196.850394:null},
   limits:{nLift,nPower:powerOk?Math.sqrt(nPower2):null,nInst,nSust,instantDegSec:turn(nInst),sustDegSec:turn(nSust),structG},
   provenance:polar?'scenario using an explicitly supplied drag polar plus engine/prop assumptions; polar source is not necessarily an independent measurement':'modeled from sourced geometry/engine nodes, per-aircraft CD0 anchor fit and assumed e/CLmax/prop profile; not an independently validated turn curve'};
}
function maxSpeed(ac,alt,opts={}){let crossing=null,last=null;for(let tas=90;tas<=590;tas+=2){const r=evaluated(ac,alt,tas,opts);if(r.status==='no-engine-source')return null;if(r.power&&last?.power&&last.power.excessHp>=0&&r.power.excessHp<0)crossing=[tas-2,tas];last=r;}if(!crossing)return null;let [lo,hi]=crossing;for(let i=0;i<40;i++){const mid=(lo+hi)/2,rr=evaluated(ac,alt,mid,opts);if(rr.power.excessHp>0)lo=mid;else hi=mid;}return (lo+hi)/2;}
function greg109At(data,speed){const reference=data.greg.bf109f4.reference,top=reference.at(-1),v0=top[0];const paraDrag=top[1]*(speed/v0)**2,indDrag=top[2]*(v0/speed)**2,reqHp=(paraDrag+indDrag)*speed/375.0;
 const one=reference[0],last=reference.at(-1);let av=null;for(let i=0;i<reference.length;i++){const x=reference[i];if(Math.abs(speed-x[0])<1e-6){av=x[7];break;}if(i&&speed<x[0]){const lo=reference[i-1],w=(speed-lo[0])/(x[0]-lo[0]);av=lo[7]+w*(x[7]-lo[7]);break;}}if(av==null&&speed>=last[0])av=last[7];return {paraDrag,indDrag,totalDrag:paraDrag+indDrag,reqHp,availableHp:av,powerN:av!=null&&av>=reqHp?Math.sqrt(Math.max(0,(av-paraDrag*speed/375)/(indDrag*speed/375))):null};}
function inferredGregF4(ac,sourceGreg){const row=sourceGreg.reference.at(-1),v=row[0]*MPH,q=.5*RHO0*v*v,W=ac.weightLb*LBF,DI=row[2]*LBF,DP=row[1]*LBF;return {oswald:W*W/(q*Math.PI*ac.spanM*ac.spanM*DI),cd0:DP/(q*ac.wingAreaM2),parasiteShare:row[1]/row[3],inducedShare:row[2]/row[3],source:'Greg 109F4 screenshot, assumed 6,371 lb weight; inferred parameters not independently measured'};}
function inferredGregP47(ac,greg){const row=greg.reference.at(-1),v=row[0]*MPH,q=.5*RHO0*v*v,W=13065*LBF,DiHp=row[3],DpHp=row[2],Di=(DiHp*HP/v),Dp=DpHp*HP/v;return {oswald:W*W/(q*Math.PI*ac.spanM**2*Di),cd0:Dp/(q*ac.wingAreaM2),weightLb:13065,source:'Greg high-power P-47 worksheet; likely D-28, not B; power output cannot be transferred to P-47B'};}
// v0.3: use actual climb-test manifold pressure; the speed-test turbo-limited
// shaft power is NOT automatically achievable at lower climb TAS.
function climbConditionEngine(ac,point){
 const level=shaftPower(ac,point.altFt,point.rating||ac.defaultRating,'auto');
 if(!level)return {status:'no-engine-source'};
 if(!(level.mapInHg>0&&point.observedMapInHg>0&&point.engineRpm>0))return {status:'missing-climb-map'};
 const fraction=Math.min(1,point.observedMapInHg/level.mapInHg);
 return {status:'estimated',levelBhP:level.bhp,levelMapInHg:level.mapInHg,climbMapInHg:point.observedMapInHg,
    climbBhP:level.bhp*fraction,fraction,notes:'Constant-RPM MAP-proportional shaft power proxy, capped at documented military rating; not torque-meter-observed climb horsepower.'};
}
function climbPrediction(ac,point,opts={}){
 if(!(point.altFt>=0&&point.tasMph>0&&Number.isFinite(point.fpm)))return {status:'invalid-climb-point'};
 const baseline=evaluated(ac,point.altFt,point.tasMph,opts);
 if(baseline.status!=='modelled')return {status:baseline.status,reason:baseline.reason};
 const engine=climbConditionEngine(ac,point);
 if(engine.status!=='estimated')return {status:engine.status};
 const prop=propEta(ac,point.altFt,point.tasMph,engine.climbBhP,opts.profile||'C',point.rating||ac.defaultRating);
 if(!prop)return {status:'no-prop-model'};
 const weight=(opts.weightLb??ac.weightLb)+(opts.storesWeightLb??0),e=baseline.oswald,addedCd0=opts.addedCd0??0;
 if(!Number.isFinite(addedCd0)||addedCd0<0)return {status:'invalid-added-drag'};
 const drag=dragBreakdown(ac,point.altFt,point.tasMph,weight,baseline.cd0+addedCd0,e,1);
 const W=weight*LBF,V=point.tasMph*MPH,power=prop.eta*engine.climbBhP*HP;
 const fpm=(power-drag.drag*V)/W*196.8503937;
 return {status:'estimated',altFt:point.altFt,tasMph:point.tasMph,observedFpm:point.fpm,
    baselineFpm:baseline.power.climbFpm,predictedFpm:fpm,residualFpm:fpm-point.fpm,
    engine,prop,addedCd0,extraDragLbf:dragBreakdown(ac,point.altFt,point.tasMph,weight,addedCd0,e,1).parasiteLbf,
    dynamicPressure:drag.q,shaftHp:engine.climbBhP,propulsiveHp:power/HP,
    note:'Derived using observed climb MAP, approximated climb BHP, and optional equivalent configuration drag. Not a measured cooling-drag coefficient.'};
}
function equivalentClimbDrag(ac,point,opts={}){
 const base=climbPrediction(ac,point,{...opts,addedCd0:0});if(base.status!=='estimated')return {status:base.status};
 const W=((opts.weightLb??ac.weightLb)+(opts.storesWeightLb??0))*LBF,V=point.tasMph*MPH;
 const gapPower=(base.predictedFpm-point.fpm)/196.8503937*W;
 const dCd0=gapPower/(V*base.dynamicPressure*ac.wingAreaM2);
 return {status:Number.isFinite(dCd0)?'derived':'invalid',addedCd0:dCd0,calibrationAltitudeFt:point.altFt,
   note:'One-point fit of aggregate climb-vs-speed-configuration loss. Could include cooling drag, installed propeller efficiency, or remaining engine error. Not independently measured drag.'};
}
// Greg's D-28-style sheet is an independent numerical POWER SCENARIO benchmark.
// We change shaft horsepower ONLY: common weight, same prop efficiency curve and
// same parasitic/induced power polar. This is not a historical B vs D flight trial.
function gregP47PowerPoint(greg,speedMph,shaftHp){
 if(!(shaftHp>0&&speedMph>0))return null;
 const rows=greg.reference,last=rows.at(-1),first=rows[0];
 if(speedMph<first[0]||speedMph>last[0])return null;
 let available=null;
 for(let i=0;i<rows.length;i++){
  const r=rows[i];if(Math.abs(speedMph-r[0])<1e-8){available=r[4];break;}
  if(i&&speedMph<r[0]){const prev=rows[i-1],t=(speedMph-prev[0])/(r[0]-prev[0]);available=prev[4]*(1-t)+r[4]*t;break;}
 }
 const parasiteHp=last[2]*(speedMph/last[0])**3,inducedHp=last[3]*last[0]/speedMph;
 const delivered=available*shaftHp/2600,required=parasiteHp+inducedHp;
 const nPower=delivered>=required?Math.sqrt(Math.max(0,(delivered-parasiteHp)/inducedHp)):null;
 return {speedMph,shaftHp,availableHp:delivered,propEta:available/2600,parasiteHp,inducedHp,
  requiredHp:required,excessHp:delivered-required,nPower,
  provenance:'Greg D-28-style 2600 hp worksheet; 2000 hp variant is a POWER-ONLY counterfactual with IDENTICAL drag/weight/propeller, not a documented P-47B test.'};
}
function gregP47MaxSpeed(greg,shaftHp){
 let earlier=null,cross=null;
 for(let speed=greg.reference[0][0];speed<=greg.reference.at(-1)[0];speed++){
  const r=gregP47PowerPoint(greg,speed,shaftHp);
  if(earlier&&earlier.excessHp>=0&&r.excessHp<=0){cross=[speed-1,speed];break;}
  earlier=r;
 }
 if(!cross)return null;
 let [lo,hi]=cross;
 for(let i=0;i<32;i++){
  const mid=(lo+hi)/2;
  if(gregP47PowerPoint(greg,mid,shaftHp).excessHp>=0)lo=mid;else hi=mid;
 }
 return (lo+hi)/2;
}

// v0.4: generic maximized steady-climb prediction, with no aircraft-specific
// drag/power refitting to the target climb results. This is a *model* maximum,
// not a documented climbing IAS or flight procedure.
function bestClimb(ac,altFt,opts={}){
 const lo=opts.minTasMph??100,hi=opts.maxTasMph??290,step=opts.stepMph??1;
 if(!(step>0&&lo>0&&hi>lo))throw Error('Invalid climb-search speed range');
 let best=null,viable=0;
 for(let tas=lo;tas<=hi+1e-9;tas+=step){
   const r=evaluated(ac,altFt,tas,opts);
   if(r.status==='no-engine-source')return {status:'no-engine-source'};
   if(r.status!=='modelled'||!Number.isFinite(r.power?.climbFpm))continue;
   // If a specific report records a different climb MAP, use it explicitly.
   let shaftHp=r.engine.bhp,prop=r.prop,engineMethod='rating curve, no climb MAP correction';
   if(opts.climbMapInHg!=null){
     if(!(opts.climbMapInHg>0&&r.engine.mapInHg>0))return {status:'missing-climb-map'};
     shaftHp=Math.min(r.engine.bhp,r.engine.bhp*opts.climbMapInHg/r.engine.mapInHg);
     prop=propEta(ac,altFt,tas,shaftHp,opts.profile||'C',opts.rating||ac.defaultRating);
     engineMethod='climb MAP / level MAP proxy (not measured torque)';
   }
   const added=opts.addedCd0??0;
   if(!(Number.isFinite(added)&&added>=0))return {status:'invalid-added-drag'};
   const V=tas*MPH,weightLb=(opts.weightLb??ac.weightLb)+(opts.storesWeightLb??0),W=weightLb*LBF;
   const additionalPower=.5*isa(altFt).rho*V*V*ac.wingAreaM2*added*V;
   const oldPropPower=r.prop.eta*r.engine.bhp*HP;
   const newPropPower=prop.eta*shaftHp*HP;
   const newExcess=(r.power.excessHp*HP)-(oldPropPower-newPropPower)-additionalPower;
   const fpm=newExcess/W*196.8503937;
   viable++;
   if(!best||fpm>best.climbFpm)best={tasMph:tas,climbFpm:fpm,shaftHp,propEta:prop.eta,powerMethod:engineMethod};
 }
 if(!best)return {status:'no-valid-flight-condition'};
 return {status:'modeled-peak',altFt,rating:opts.rating||ac.defaultRating,
    profile:opts.profile||'C',best,...best,viableSpeedSamples:viable,
    sourceStatus:'calculated optimization; climb speed not directly reported',
    addedCd0:opts.addedCd0??0};
}
// Comparative check: at the same documented altitude, vary the engine rating,
// holding aircraft, weight, prop category and drag polar fixed. Difference in
// best climb rates is an independent check of power sensitivity; historical
// report results must not be used to fit the two model outputs.
function matchedPowerClimb(ac,altFt,ratingA,ratingB,opts={}){
 const a=bestClimb(ac,altFt,{...opts,rating:ratingA}),
       b=bestClimb(ac,altFt,{...opts,rating:ratingB});
 if(a.status!=='modeled-peak'||b.status!=='modeled-peak')return {status:'missing-rating',a,b};
 const low=shaftPower(ac,altFt,ratingA,'auto'),high=shaftPower(ac,altFt,ratingB,'auto');
 return {status:'modeled-comparison',altFt,ratingA,ratingB,a,b,
   deltaClimbFpm:b.climbFpm-a.climbFpm,deltaShaftHp:high.bhp-low.bhp,
   provenance:'calculated from frozen speed-calibrated polar; NO climb-rate calibration'};
}
return Object.freeze({isa,airspeeds,tasFrom,trueFromCAS,casFromTrue,casFromIAS,resolveAirspeed,shaftPower,shaftPowerAtMeasuredBoost,inletPressureAtSpeed,ramManifoldAtSpeed,referenceLevelTas,shaftPowerAtRamSpeed,nacaLowSpeedPropChart,nacaMachResearch,propEta,dragBreakdown,cd0FromAnchor,evaluated,maxSpeed,greg109At,inferredGregF4,inferredGregP47,climbConditionEngine,climbPrediction,equivalentClimbDrag,gregP47PowerPoint,gregP47MaxSpeed,bestClimb,matchedPowerClimb});
});
