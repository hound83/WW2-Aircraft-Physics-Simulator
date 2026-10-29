/* v2.3: NACA 1941 Figure 10–12 transfer; independent of Greg's power-table ramps.
   No historical climb/turn numbers may be used in the coefficient inputs.
   Approximate manual graph readings; NOT an installed aircraft-specific map.
*/
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const M=require('./physics.js');
const D=require('./cases.json');
const cmp=(a,b)=>Number((a-b).toFixed(3));
const C=(ac,alt,speed,rating)=>M.propEta(ac,alt,speed,M.shaftPower(ac,alt,rating,'auto').bhp,'C',rating);
const N=(ac,alt,speed,rating)=>M.propEta(ac,alt,speed,M.shaftPower(ac,alt,rating,'auto').bhp,'N',rating);

const chart=[];
for(const blades of [3,4])for(const Cp of [.2,.4,.6])for(const J of [.3,.5,1,1.5,2,2.5,3,3.5]){
 const r=M.nacaLowSpeedPropChart(blades,J,Cp);
 chart.push({blades,J,Cp,eta:r.eta,readingUncertaintyEta:.04});
}
const cross1944=M.nacaLowSpeedPropChart(4,2.26,.342);
const design1944={nacaReport:'NACA ACR L4I29, September 1944; PDF pp. 16–17',
 enginePowerHp:2000,altitudeFt:25000,speedMph:425,diameterFt:12,
 rpm:23*60,bladeCount:4,reportedJ:2.26,reportedCp:.342,
 reportedInducedEta:.931,reportedInstalledTestCaseEta:.848,
 naca1941ChartApproximateEta:cross1944.eta,
 differenceEtaPoints:cmp(cross1944.eta,.848),
 note:'The 1941 chart and 1944 design example may share underlying Hamilton Standard data; this is a consistency check, NOT independent airframe validation.'};

const P=D.aircraft.p51b;
const prior=P.climbPowerComparison;
const mustang=[];
for(const rating of ['67inHg','75inHg']){
 const history=rating==='67inHg'?prior.reportedAClimbFpm:prior.reportedBClimbFpm;
 const common={rating,gear:'low',engineModel:'ram-critical',
  weightLb:prior.reportedTakeoffWeightLb,e:.78,stepMph:1,minTasMph:100,maxTasMph:290};
 const c=M.bestClimb(P,prior.altFt,{...common,profile:'C'});
 const nFrozen=M.bestClimb(P,prior.altFt,{...common,profile:'N'});
 const nRefit=M.bestClimb(P,prior.altFt,{...common,profile:'N',refit:true});
 const prop=N(P,prior.altFt,nRefit.tasMph,rating);
 mustang.push({rating,sourceClimbFpm:history,sourceCondition:'May 1944 P-51B-15 43-24777 @ 2200 ft / takeoff weight 9335 lb',
  baselineC:{optimalTasMph:c.tasMph,climbFpm:c.climbFpm,eta:c.propEta},
  nacaNWithOldFrozenDrag:{optimalTasMph:nFrozen.tasMph,climbFpm:nFrozen.climbFpm,eta:nFrozen.propEta},
  nacaNWithOriginalSpeedReanchor:{optimalTasMph:nRefit.tasMph,climbFpm:nRefit.climbFpm,eta:nRefit.propEta},
  nacaVsCReanchoredClimbFpm:cmp(nRefit.climbFpm,c.climbFpm),
  remainingHistoricalResidualFpm:cmp(history,nRefit.climbFpm),
  chartCpAtOptimum:prop.Cp,chartCpBoundedTo:.2,
  uncertainty:'Cp below 1941 NACA Figure 10 minimum; nearest Cp=0.2 curve used as research extrapolation only; true installed Hamilton Standard K-6523A-24 η unknown.'});
}

const F=D.aircraft.bf109f4;
const polar=M.inferredGregF4(F,D.greg.bf109f4);
const explicitPolar={cd0:polar.cd0,e:polar.oswald,source:polar.source};
const turns=[];
for(const [altMeters,il2Seconds] of [[0,20.3],[3000,26.1]]){
 const ft=altMeters/.3048,assumedCASMph=270/1.609344,tas=M.trueFromCAS(assumedCASMph,ft);
 const opts={rating:'emergency',engineModel:'ram-critical',polar:explicitPolar};
 const c=M.evaluated(F,ft,tas,{...opts,profile:'C'});
 const n=M.evaluated(F,ft,tas,{...opts,profile:'N'});
 turns.push({altMeters,sourceIL2Seconds:il2Seconds,iasKmh:270,
  IASassumedCAS:true,tasMph:tas,
  C:{eta:c.prop.eta,seconds:360/c.limits.sustDegSec},
  N:{eta:n.prop.eta,seconds:360/n.limits.sustDegSec},
  nacaResidualSeconds:cmp(360/n.limits.sustDegSec,il2Seconds),
  nacaCp:n.prop.Cp,nacaChartCp:n.prop.chartCp,
  source:'IL-2 F-4 official technical specifications SECONDARY; Greg F-4 drag at 325 mph plus assumed source weight; not primary Bf109 measured polar.'});
}
const f4Speed={historicalCombatTasMph:325,
 CwithGregPolar:M.maxSpeed(F,0,{rating:'combat',profile:'C',polar:explicitPolar}),
 NwithGregPolar:M.maxSpeed(F,0,{rating:'combat',profile:'N',polar:explicitPolar})};
f4Speed.nacaResidualMph=cmp(f4Speed.NwithGregPolar,f4Speed.historicalCombatTasMph);

const aircraft=[];
for(const [id,a] of Object.entries(D.aircraft)){
 const ref=a.calibration;
 const profileRef=M.propEta(a,ref.altFt,ref.tasMph,
  M.shaftPower(a,ref.altFt,ref.rating,ref.gear).bhp,'N',ref.rating);
 const common={rating:ref.rating,gear:ref.gear,e:.78};
 const speeds={c:M.maxSpeed(a,ref.altFt,{...common,profile:'C'}),
  nFrozen:M.maxSpeed(a,ref.altFt,{...common,profile:'N'}),
  nReanchored:M.maxSpeed(a,ref.altFt,{...common,profile:'N',refit:true})};
 aircraft.push({id,aircraft:a.name,bladeCount:a.propGeometry.bladeCount,
  sourceAnchorMph:ref.tasMph,sourceAnchorAltitudeFt:ref.altFt,
  nacaJAtSpeedAnchor:profileRef?.J,nacaCpAtSpeedAnchor:profileRef?.Cp,
  nacaEtaAtSpeedAnchor:profileRef?.eta,
  ...speeds,sourceMustNotBeRetunedToClimb:'NACA chart transfer assumes no aircraft-specific efficiency correction; speed-anchor reanchor changes only inferred CD0.'});
}

const output={version:'2.3 NACA evidence checkpoint',date:'2026-10-27',
 sourceArchive:'Official NASA NTRS, original NACA 1934–1946 PDFs and extracted report figures',
 method:'Graph-read Figure 10/11/12 η(J,Cp) 3-/4-blade research interpolant, ±0.03–0.05; NO hidden source-dependent empirical tuning',
 naca1941FigureCurves:{ntrs:'https://ntrs.nasa.gov/citations/19930093644',
  imagePage:27,chart,limitations:'NACA tested Hamilton Standard propellers; non-identical VDM/Rotol/K-6523A-24 installations. Figure Cp0.2–0.6 only. Near-Mach blade losses not included.'},
 naca1944DesignCase:design1944,
 mustang:{sourceActualSpeedMph:P.calibration.tasMph,sourceClimbs:mustang},
 bf109:{gregIndependentPolar:explicitPolar,sourceIL2TurnTimes:turns,
  speed:f4Speed,warning:'Still misses F-4 combat speed by a few mph with source-derived Greg polar. Do not tune away or claim match.'},
 allAircraftSpeedAnchors:aircraft,
 stillMissing:['Installed aircraft-specific blade efficiency maps and geometric station data',
  'NACA1941 high tip Mach correction / compressibility under real blade helices',
  'F-4 full-throttle 325-mph source rating, weight and matching manifold/rpm',
  'P-51B 2200-ft actual climb TAS and matching propeller thrust/torque vs speed',
  'Spitfire climb radiator-open drag vs closed level-flight anchor',
  'Lift-dependent wing profile drag and stall physics for sustained turns'],
 noMeredithFit:'Original NACA cooling power balance is configuration-dependent; no low-speed cooling thrust was added or adjusted.'};

if(process.argv.includes('--write')){
 const filename=path.join(__dirname,'naca_propeller_benchmark_results_v23.json');
 fs.writeFileSync(filename,JSON.stringify(output,null,2)+'\n');
 console.log('Saved',filename);
}
console.log('NACA 1941 chart predicts for 1944 4-blade design case',cross1944.eta.toFixed(3),'vs',.848);
for(const p of mustang)console.log('Mustang',p.rating,'C',p.baselineC.climbFpm.toFixed(0),
 'N reanchored',p.nacaNWithOriginalSpeedReanchor.climbFpm.toFixed(0),
 'historical',p.sourceClimbFpm);
for(const x of turns)console.log('109',x.altMeters,'IL2',x.sourceIL2Seconds,'N',x.N.seconds.toFixed(2));
console.log('109 combat mph with Greg polar C',f4Speed.CwithGregPolar.toFixed(1),
 'N',f4Speed.NwithGregPolar.toFixed(1),'vs',f4Speed.historicalCombatTasMph);
module.exports=output;
