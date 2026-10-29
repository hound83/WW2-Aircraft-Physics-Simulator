/* v1.6 independent within-same-report low/mid-speed power-required constraint.
 * Figure 5 readings are approximate; this IS NOT a fitting objective.
 * Distinguishes a direct source-RPM comparison from the incorrect 3000rpm
 * assumption at the 2100/2300/2700rpm flight-test observations.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const M=require('./physics.js');
const data=require('./cases.json');
const source=require('./p51_power_required_source_v16.json');
const cross=require('./cross_aircraft_diagnostic_v15.cjs');
function summarize(rows){return {meanResidualBhp:rows.reduce((s,p)=>s+p.residualBhp,0)/rows.length,MAEBhp:rows.reduce((s,p)=>s+Math.abs(p.residualBhp),0)/rows.length,maxAbsResidualBhp:Math.max(...rows.map(p=>Math.abs(p.residualBhp)))};}
function run(){
  const ac=data.aircraft.p51b;
  const previous=cross.run(),baseline=previous.profiles.find(p=>p.profile==='C');
  const scenarios=[];
  for(const profile of ['A','B','C']){
    const polar=previous.profiles.find(p=>p.profile===profile).p51.polar;
    const pts=source.points.map(obs=>{
      const drag=M.dragBreakdown(ac,source.altitudeFt,obs.tasMph,source.nominalWeightLb,polar.cd0,polar.e);
      const prop=M.propEta(ac,source.altitudeFt,obs.tasMph,obs.testBhp,profile,'67inHg',{engineRpmOverride:obs.engineRpm});
      const nominal=M.propEta(ac,source.altitudeFt,obs.tasMph,obs.testBhp,profile,'67inHg');
      if(!prop||!nominal)throw Error('Missing propeller geometry for source-RPM validation');
      const modeledRequiredBhp=drag.requiredHp/prop.eta;
      return {...obs,observedEtaNeededForCurrentPolar:drag.requiredHp/obs.testBhp,
        modeledRequiredBhp,etaAtSourceRpm:prop.eta,etaIfIncorrectlyAt3000Rpm:nominal.eta,
        propRpm:prop.propRpm??null,parasiteRequiredHp:drag.parasiteHp,
        inducedRequiredHp:drag.inducedHp,residualBhp:modeledRequiredBhp-obs.testBhp};
    });
    scenarios.push({profile,calibratedPolar:polar,sourceRpmCorrected:profile==='C',
      summary:summarize(pts),lowAndMidSpeed:summarize(pts.slice(0,4)),points:pts});
  }
  const fixedE=[];
  for(const e of [.55,.65,.78,.90,1.0]){
    const fit=M.cd0FromAnchor(ac,'C',e);
    const polar={cd0:fit.cd0,e};
    const rows=source.points.map(obs=>{
      const drag=M.dragBreakdown(ac,source.altitudeFt,obs.tasMph,source.nominalWeightLb,polar.cd0,polar.e);
      const eta=M.propEta(ac,source.altitudeFt,obs.tasMph,obs.testBhp,'C','67inHg',{engineRpmOverride:obs.engineRpm}).eta;
      return {...obs,residualBhp:drag.requiredHp/eta-obs.testBhp};
    });
    fixedE.push({e,cd0:fit.cd0,valid:fit.valid,...summarize(rows),lowAndMidSpeed:summarize(rows.slice(0,4))});
  }
  const climbs=baseline.p51.climb.reports.find(r=>r.id==='wright-1944-05-20').rows;
  const climbRpm=3000;
  const climbGap=climbs.map(r=>{
    const test=M.bestClimb(ac,r.altFt,{polar:baseline.p51.polar,profile:'C',rating:r.rating,weightLb:9335});
    const eta=test.propEta;
    // At fixed weight P=W*dH/dt: 1 HP = 745.7W; fpm/HP = HP/W*60/0.3048.
    const correctFpmPerHp=745.6998716/(9335*4.4482216153)*196.8503937;
    const excessPowerNeededHp=(r.reportedFpm-r.modeledFpm)/correctFpmPerHp;
    return {rating:r.rating,altFt:r.altFt,modeledOptimumTasMph:test.tasMph,
      modelFpm:r.modeledFpm,observedFpm:r.reportedFpm,gapFpm:r.reportedFpm-r.modeledFpm,
      sourceEngineRpm:climbRpm,modelEta:eta,shaftBhp:test.shaftHp,
      extraPropulsiveHpNeeded:excessPowerNeededHp,
      etaIfExplainedSolelyByProp:eta+excessPowerNeededHp/test.shaftHp,
      note:'Power gap arithmetic; does NOT prove the propeller is the physical cause.'};
  });
  return {version:'v1.6-source-RPM-and-untuned-figure-5',
    source,scenarios,oswaldSensitivity:fixedE,p51ClimbPowerGap:climbGap,
    baselineUnmodified:{p47SpeedHoldoutMAEMph:baseline.p47.speed.holdoutMAEMph,
      p51SpeedHoldoutMAEMph:baseline.p51.speed.holdoutMAEMph,
      bf109CombatToEmergencyMph:baseline.f4.generic.speed.predictedEmergencyMph,
      bf109ClimbSeconds:baseline.f4.generic.climb.seconds},
    verdict:'Chart power-required markers and takeoff-weight climb checks are a NEW independent speed-regime constraint, NOT a validated engine/propeller efficiency or airframe-specific Oswald fit. F4 still lacks a measured glide/turn polar. Do not retrofit a hidden P-51 coefficient.'};
}
if(require.main===module){const out=run();if(process.argv.includes('--write')){
  const file=path.join(__dirname,'p51_drag_results_v16.json');fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');console.log('Wrote '+file);
}else if(process.argv.includes('--json'))console.log(JSON.stringify(out,null,2));else {
 for(const p of out.scenarios)console.log(`${p.profile}: Figure 5 MAE=${p.summary.MAEBhp.toFixed(1)}bhp, low/mid=${p.lowAndMidSpeed.MAEBhp.toFixed(1)}bhp, modeled eta vs actual source RPM ${p.points.map(x=>x.etaAtSourceRpm.toFixed(3)).join(' / ')}`);
 for(const p of out.oswaldSensitivity)console.log(`e=${p.e}: low/mid MAE=${p.lowAndMidSpeed.MAEBhp.toFixed(1)}bhp`);
 for(const p of out.p51ClimbPowerGap)console.log(`${p.rating}: ${p.gapFpm.toFixed(0)}fpm short, +${p.extraPropulsiveHpNeeded.toFixed(0)} propulsive hp needed; eta-if-prop-only=${p.etaIfExplainedSolelyByProp.toFixed(3)}`);
}}
module.exports={run};
