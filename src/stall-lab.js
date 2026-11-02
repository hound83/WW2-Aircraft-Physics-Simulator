'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.UniversalStallLab=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const MPH=.44704,LBF=4.4482216153,FT2=.09290304,RHO0=1.225;
 const names={p51b:'P-51B',p47b:'P-47B',bf109f4:'Bf 109 F-4',spitfire_lfix_bs543:'Spitfire LF IX'};
 function air(M,easMph,altFt){const tasMph=M.tasFrom(easMph,'EAS',altFt);return {easMph,casMph:M.casFromTrue(tasMph,altFt),tasMph,mach:tasMph*MPH/M.isa(altFt).a};}
 function eas(weightLb,areaFt2,clMax){return Math.sqrt(2*weightLb*LBF/(RHO0*areaFt2*FT2*clMax))/MPH;}
 function p51Candidate(M,ac,source,{altFt=8000,weightLb=9240,sourceClMax=1.45}={}){
  const fail=reason=>({status:'unavailable',reason,correctedIasMph:null,clMax:null,air:null});
  if(ac?.stallIdentity?.aircraftId!=='p51b')return fail('This candidate is restricted to the P-51B model.');
  if(!Number.isFinite(altFt)||altFt<5100||altFt>9300)return fail('Outside the declared 5,100-9,300 ft low-Mach transfer window; no altitude extrapolation.');
  if(!Number.isFinite(weightLb)||weightLb<=0)return fail('Invalid scenario weight.');
  if(!Number.isFinite(sourceClMax)||sourceClMax<1.40||sourceClMax>1.48)return fail('Outside the 1.40-1.48 engineering lift bracket.');
  if(source.id!=='naca-tn1044'||source.geometry?.areaFt2!==233.2||!(ac.wingAreaM2>0))return fail('Missing or incompatible source/area convention.');
  const areaFt2=source.geometry.areaFt2,at=air(M,eas(weightLb,areaFt2,sourceClMax),altFt);
  if(at.mach<.14||at.mach>.18)return fail('Solved stall falls outside Mach 0.14-0.18; the source shows lift changing with Mach.');
  // Preserve CL*S: source uses 233.2 sqft, current P51B model uses 233 sqft.
  const clMax=sourceClMax*areaFt2*FT2/ac.wingAreaM2;
  const result=M.evaluated(ac,altFt,at.tasMph,{profile:'P',weightLb,clMax});
  if(!Number.isFinite(result.stallEasMph)||Math.abs(result.stallEasMph-at.easMph)>1e-7)return fail('Shared solver cannot reproduce the source-area lift balance.');
  const baseline=M.evaluated(ac,altFt,at.tasMph,{profile:'P',weightLb});
  return {status:'source-informed-candidate',sourceId:source.id,altFt,weightLb,sourceClMax,sourceAreaFt2:areaFt2,modelAreaFt2:ac.wingAreaM2/FT2,clMax,air:at,baselineEasMph:baseline.stallEasMph,deltaEasMph:at.easMph-baseline.stallEasMph,sharedSolverStallEasMph:result.stallEasMph,correctedIasMph:null,historicalResidualMph:null,qualification:'P-51B gradual throttled-engine/high-pitch tests, exceptional finish; transfer to 43-24777 is conditional. Bracket is not a confidence interval. No cockpit IAS correction recovered.'};
 }
 function correct(M,register,sourceId,iasMph,altFt){
  const fail=reason=>({status:'unavailable',reason,casMph:null,easMph:null,tasMph:null});
  if(!Number.isFinite(iasMph)||iasMph<=0||!Number.isFinite(altFt)||altFt<0||altFt>36089)return fail('Invalid airspeed or atmosphere altitude.');
  const source=register.sources.find(s=>s.id===sourceId);if(!source)return fail('Unknown correction source.');
  if(source.installationCorrectionPoints){
   const p=source.installationCorrectionPoints.map(r=>({iasMph:r.iasMph,casMph:r.iasMph+r.addMph}));
   if(iasMph<p[0].iasMph||iasMph>p.at(-1).iasMph)return fail('Outside the manual correction table; extrapolation to stall is blocked.');
   const casMph=M.casFromIAS(iasMph,{source:source.url,configuration:source.configuration,points:p}),tasMph=M.trueFromCAS(casMph,altFt);
   return {status:'manual-cas-conversion',sourceId,iasMph,altFt,casMph,easMph:M.airspeeds(tasMph,altFt).eas,tasMph,method:'Linear interpolation between manual installation-correction nodes; not a B/C stall measurement.'};
  }
  if(source.positionErrorBands){
   const matches=source.positionErrorBands.filter(r=>iasMph>=r.iasMph[0]&&iasMph<=r.iasMph[1]);
   if(!matches.length)return fail('Position-error table does not cover this indication. No low-speed extrapolation.');
   const corrected=matches.map(r=>iasMph+r.addMph),unique=[...new Set(corrected)];
   return {status:unique.length>1?'band-boundary-ambiguous':'position-only',sourceId,iasMph,altFt,positionCorrectedMph:unique.length===1?unique[0]:null,positionCorrectedRangeMph:[Math.min(...unique),Math.max(...unique)],casMph:null,easMph:null,tasMph:null,reason:unique.length>1?'Adjacent published bands give different corrections at this shared boundary; do not choose silently.':'Position correction only. Independent instrument-error state and installation match are not established, so this is not accepted target CAS.'};
  }
  return fail('This source does not supply an applicable cockpit correction table.');
 }
 function targets(M,D,register,altFt=8000){return Object.entries(names).map(([id,name])=>{const ac=D.aircraft[id],pred=eas(ac.weightLb,ac.wingAreaM2/FT2,ac.clMaxAssumed);return {id,name,weightLb:ac.weightLb,assumedClMax:ac.clMaxAssumed,model:air(M,pred,altFt),targetStatus:'unresolved',historicalStallCasMph:null,historicalStallEasMph:null,finding:register.remainingTargets.find(r=>r.aircraftId===id)?.finding};});}
 return Object.freeze({air,eas,p51Candidate,correct,targets});
});
