'use strict';
function assess(map,target,operating){
 const blockers=[];
 if(!map?.measuredInstalledMap)blockers.push('no-measured-installed-map');
 if(map?.bladeDrawing!==target.bladeDrawing)blockers.push('blade-geometry-not-matched');
 if(!map?.installationMatched)blockers.push('installation-not-matched');
 for(const key of ['J','Cp','tipMach']){
  const value=operating?.[key],range=map?.domain?.[key];
  if(!Number.isFinite(value))blockers.push('missing-operating-'+key);
  if(!Array.isArray(range)||range.length!==2||!range.every(Number.isFinite)||range[0]>range[1])blockers.push('unverified-domain-'+key);
  else if(Number.isFinite(value)&&(value<range[0]||value>range[1]))blockers.push('outside-domain-'+key);
 }
 return {accepted:blockers.length===0,blockers};
}
module.exports={assess};
