'use strict';
// Research calculations only. Does not modify aircraft inputs or evidence gates.
const fs=require('node:fs'),path=require('node:path');
const m=require('../../src/physics.js'),d=require('../../aircraft/cases.json');
const evidence=require('../../references/stall-calibration-research-2026-11-02.json');
const MPH=.44704,LBF=4.4482216153,RHO0=1.225,FT2=.09290304;
function stallEas(weightLb,areaFt2,cl){return Math.sqrt(2*weightLb*LBF/(RHO0*areaFt2*FT2*cl))/MPH;}
function speeds(easMph,altFt){const tasMph=m.tasFrom(easMph,'EAS',altFt);return {altFt,easMph,casMph:m.casFromTrue(tasMph,altFt),tasMph,mach:tasMph*MPH/m.isa(altFt).a};}
function run(){
 const source=evidence.sources.find(s=>s.id==='naca-tn1044');
 const p51={status:'source-informed-P51B-candidate-not-exact-specimen-calibration',sourceId:source.id,weightLb:9240,areaFt2:source.geometry.areaFt2,clMax:source.lowMachRead.clMaxApprox,clMaxEngineeringBracket:source.lowMachRead.engineeringBracket};
 p51.at8000Ft=speeds(stallEas(p51.weightLb,p51.areaFt2,p51.clMax),8000);
 p51.stallEasBracketMph=p51.clMaxEngineeringBracket.map(c=>stallEas(p51.weightLb,p51.areaFt2,c)).sort((a,b)=>a-b);
 p51.sameLiftAt9270Lb=speeds(stallEas(9270,p51.areaFt2,p51.clMax),8000);
 const spit={status:'older-mark-transfer-sensitivity-only-not-measured-IX',sourceId:'rae-aero1106',weightLb:7110,areaFt2:242,clMax:1.36};
 spit.at8000Ft=speeds(stallEas(spit.weightLb,spit.areaFt2,spit.clMax),8000);
 const baseline=Object.entries(d.aircraft).filter(([id])=>['bf109f4','p47b','p51b','spitfire_lfix_bs543'].includes(id)).map(([id,ac])=>{
  const r=m.evaluated(ac,8000,m.tasFrom(170,'EAS',8000),{profile:'C'});
  return {aircraftId:id,weightLb:ac.weightLb,clMax:r.clMax,stallEasMph:r.stallEasMph,status:'existing-provisional-model-not-observation'};
 });
 const conversionExample=[0,8000,20000,30000].map(altFt=>{const tas=m.trueFromCAS(105,altFt);return {altFt,iasMph:100,installationCorrectionMph:5,casMph:105,easMph:m.airspeeds(tas,altFt).eas,tasMph:tas,status:'P51D-conversion-example-not-stall-measurement'};});
 return {date:evidence.date,activePhysicsChanged:false,targetStallCalibrationsCompleted:[],baseline,p51,spit,conversionExample,warning:'No IAS correction has been recovered for the exact four targets at stall. Candidate lift measurements can constrain engineering choices but cannot be reported as the missing cockpit corrections. Constant CLmax is not established across altitude/Mach.'};
}
if(require.main===module){const out=path.join(__dirname,'../research/stall-2026-11-02.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(run(),null,2)+'\n');console.log(JSON.stringify(run(),null,2));}
module.exports={run,stallEas};
