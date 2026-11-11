'use strict';
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),B=require('../../src/operating-benchmark.js'),T=require('../../src/turn-lift.js'),L=require('../../references/p51-turn-lift-tn1044.json');
const specification=require('../../references/benchmark-operating-profiles.json');
function buildData(){
 const {models}=require('./v4_envelope.cjs').buildData();
 for(const [id,model]of Object.entries(models)){
  model.benchmarkPolar=M.workingOptions(model.ac).polar;
  if(id==='p47b')model.benchmarkReductionRatio=2;
  model.climbCoolingAreaM2=model.climbOptions?.addedDragAreaM2??(id==='p47b'||id==='spitfire_lfix_bs543'?(model.ac.workingModel.openCoolingDeltaCd0??0)*model.ac.wingAreaM2:0);
 }
 return {models,specification};
}
function run(options={}){
 const data=buildData(),rows=[],climbs=[];
 for(const [id,model]of Object.entries(data.models))for(const altFt of specification.altitudesFt)for(const mode of ['normal','combat']){
  for(const injection of mode==='combat'&&specification.aircraft[id].injection?[false,true]:[false]){
   const settings={mode,fuelFraction:.5,injection,extension:true};
   rows.push({id,...B.metrics(M,T,L,model,specification.aircraft[id],specification.policy,settings,altFt)});
  }
 }
 if(options.climbs!==false)for(const [id,model]of Object.entries(data.models))for(const mode of ['normal','combat']){
  const settings={mode,fuelFraction:.5,injection:!!specification.aircraft[id].injection&&mode==='combat',extension:true};
  climbs.push({id,settings,...B.climb(M,T,L,model,specification.aircraft[id],specification.policy,settings,0,20000)});
 }
 return {version:require('../../package.json').version,baseline:specification.baselineCommit,altitudesFt:specification.altitudesFt,rows,climbs,
  interpretation:'Operational scenarios at common fuel fractions and air-to-air loads. Quantified loading/rating transfers and pressure-lapse extensions are engineering assumptions. No new historical sustained-turn accuracy claim.'};
}
function writeReport(){const r=run();fs.writeFileSync(path.join(__dirname,'../current/operating-benchmark-v42.json'),JSON.stringify(r,null,2)+'\n');return r;}
if(require.main===module){const r=writeReport();console.log(JSON.stringify({rows:r.rows.length,climbs:r.climbs.map(c=>({id:c.id,mode:c.settings.mode,status:c.status,seconds:c.seconds,combat:c.combatSeconds,boostStart:c.boostStartFt}))},null,2));}
module.exports={buildData,run,writeReport};
