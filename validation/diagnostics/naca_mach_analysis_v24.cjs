'use strict';
const fs=require('fs'); const path=require('path');
const M=require('../../src/physics.js'), D=require('../../aircraft/cases.json'), H=require('./naca_inflight_prop_holdout_v23.cjs');
const f=(x,n=3)=>Number(x.toFixed(n));
const observations=H.measurements.map(r=>{
  const mach=M.nacaMachResearch(r.tipMach,r.etaNaca1941Graph);
  return {table:r.table,run:r.run,J:r.J,Cp:r.Cp,tipMach:r.tipMach,
    etaFlight:r.eta,etaNaca1941:r.etaNaca1941Graph,etaMachCandidate:mach.eta,
    residualN:r.errorEta,residualM:mach.eta-r.eta,outside1941CpRange:r.outsideGraphCp};
});
const score=rows=>({n:rows.length,MAE_N:f(rows.reduce((s,x)=>s+Math.abs(x.residualN),0)/rows.length,4),
  MAE_M:f(rows.reduce((s,x)=>s+Math.abs(x.residualM),0)/rows.length,4),
  bias_N:f(rows.reduce((s,x)=>s+x.residualN,0)/rows.length,4),
  bias_M:f(rows.reduce((s,x)=>s+x.residualM,0)/rows.length,4)});
const comparisons=[];
for(const [id,a] of Object.entries(D.aircraft)){
 const ref=a.calibration, s=M.shaftPower(a,ref.altFt,ref.rating,ref.gear);
 const N=M.propEta(a,ref.altFt,ref.tasMph,s.bhp,'N',ref.rating);
 const X=M.propEta(a,ref.altFt,ref.tasMph,s.bhp,'M',ref.rating);
 comparisons.push({id,aircraft:a.name,altFt:ref.altFt,sourceSpeedMph:ref.tasMph,
   etaN:f(N.eta,4),etaM:f(X.eta,4),tipMach:f(X.tipMach,3),
   speedC:f(M.maxSpeed(a,ref.altFt,{profile:'C',rating:ref.rating,gear:ref.gear}),2),
   speedNwithFrozenDrag:f(M.maxSpeed(a,ref.altFt,{profile:'N',rating:ref.rating,gear:ref.gear}),2),
   speedMwithFrozenDrag:f(M.maxSpeed(a,ref.altFt,{profile:'M',rating:ref.rating,gear:ref.gear}),2),
   speedMRefitted:f(M.maxSpeed(a,ref.altFt,{profile:'M',rating:ref.rating,gear:ref.gear,refit:true}),2)});
}
const P=D.aircraft.p51b, cp=P.climbPowerComparison;
const climbs=[];
for(const rating of ['67inHg','75inHg']){
 const opts={rating,gear:'low',engineModel:'ram-critical',weightLb:cp.reportedTakeoffWeightLb,e:.78,stepMph:1,minTasMph:100,maxTasMph:290,refit:true};
 const C=M.bestClimb(P,cp.altFt,{...opts,profile:'C'}),N=M.bestClimb(P,cp.altFt,{...opts,profile:'N'}),Mnew=M.bestClimb(P,cp.altFt,{...opts,profile:'M'});
 climbs.push({rating,sourceFpm:rating==='67inHg'?cp.reportedAClimbFpm:cp.reportedBClimbFpm,C:f(C.climbFpm),N:f(N.climbFpm),M:f(Mnew.climbFpm),tipMach:f(M.propEta(P,cp.altFt,Mnew.tasMph,Mnew.shaftHp,'M',rating).tipMach)});
}
const out={version:'v2.4/source-constrained research experiment',note:'NACA 1945 7% ratio is from SAME TEST CAMPAIGN as selected 12 P47D points; these checks are no longer a fully independent holdout for M (they remain independent for original N 1941 curves).',
 source1941:'https://ntrs.nasa.gov/citations/19930093644',source1938:'https://ntrs.nasa.gov/citations/19930091714',source1945:'https://ntrs.nasa.gov/citations/19930093653',
 candidateParameter:'Mach onset .95 is an assumption, while curvature is set to satisfy published ~7% relative gain 1.16 -> 1.06 on 1945 P-47D 3-blade at J~2.5, Cp~0.24.',
 holdoutStatus:'M is calibrated to the report-summary pair; not fully independent against report table rows',
 scores:{all:score(observations),climb:score(observations.filter(x=>x.table==='I climb')),highSpeed:score(observations.filter(x=>x.table==='II fast')),within1941Cp:score(observations.filter(x=>!x.outside1941CpRange))},observations,
 aircraftSpeedAnchors:comparisons,mustangClimb:climbs,scopeLimitations:['No original scan PDF embedded in handover (NASA source links preserved).','Original TR-639 curve shape not digitized; onset remains hypothesis.','TR-639 rotational tip-speed onset not directly equivalent to helical tip Mach used in 1945 aircraft flight comparison.']};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(__dirname,'../baseline/naca_mach_analysis_v24.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({scores:out.scores,climbs,comparisons},null,2));
module.exports=out;
