'use strict';
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),D=require('../../aircraft/cases.json'),E=require('../lib/climb_energy.cjs');
const performance=require('./performance_validation.cjs');
const graph=require('../baseline/p51_power_required_source_v16.json');
const conditions={profile:'C',e:.78};
function p51State(rating){
 const ac=D.aircraft.p51b,opts={...conditions,rating,gear:'low',engineModel:'ram-critical',weightLb:9335,minTasMph:100,maxTasMph:290,stepMph:1};
 const best=M.bestClimb(ac,2200,opts),at=M.evaluated(ac,2200,best.tasMph,opts);
 return {ac,opts,best,at};
}
function constantEtaScenario(ac,opts,eta){
 let best=null;
 for(let tas=100;tas<=290;tas++){
  const r=M.evaluated(ac,2200,tas,opts);if(r.status!=='modelled')continue;
  const hpPerFpm=r.weightLb*4.4482216153/(745.6998716*196.8503937),rate=(eta*r.power.shaftHp-r.power.requiredHp)/hpPerFpm;
  if(!best||rate>best.climbFpm)best={tasMph:tas,climbFpm:rate};
 }
 return {eta,...best,label:'Climb-only finite-grid counterfactual, 100-290 mph TAS / 1 mph. Frozen C polar; not a source-backed eta or an anchor-preserving replacement model.'};
}
function requiredMassScenario(ac,opts,observedFpm){
 let lo=5000,hi=opts.weightLb;
 const at=w=>M.bestClimb(ac,2200,{...opts,weightLb:w}).climbFpm;
 if(!(at(lo)>=observedFpm&&at(hi)<=observedFpm))return {status:'not-bracketed',weightLb:null};
 for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(at(mid)>observedFpm)lo=mid;else hi=mid;}
 return {status:'conditional-root',weightLb:(lo+hi)/2,takeoffMinusRequiredLb:opts.weightLb-(lo+hi)/2,warning:'Inverse mass scenario with optimized TAS and unchanged speed-anchor polar. Not reconstructed fuel burn or instantaneous historical weight.'};
}
function run(){
 const p51=[['67inHg',3820],['75inHg',4380]].map(([rating,observedFpm])=>{
  const {ac,opts,best,at}=p51State(rating);
  const b=E.budget({weightLb:at.weightLb,shaftHp:at.power.shaftHp,eta:at.prop.eta,requiredHp:at.power.requiredHp,qPa:at.drag.q,wingAreaM2:ac.wingAreaM2,tasMph:best.tasMph,observedClimbFpm:observedFpm});
  return {rating,altFt:2200,source:'Eng-47-1749-A, 20 May 1944; rate summary, 9335 lb takeoff (not known instantaneous)',climbSpeed:'model-optimized; historical TAS unknown',budget:b,withAdditional50HpCoolingLossFpm:E.withExtraDragHp(b,50),
   shaftPowerHypothesis:'extraShaftHpAtFixedEta holds eta constant; real propeller eta also changes with power coefficient. Not a corrected engine rating.',
   cFormulaAmplitudeEnvelope:constantEtaScenario(ac,opts,.83),losslessUsefulPowerScenario:constantEtaScenario(ac,opts,1),massOnly:requiredMassScenario(ac,opts,observedFpm)};
 });
 const all=performance.run(),other=[];
 for(const row of all.rows.filter(x=>x.metric==='climb-rate'&&['p47b','spitfire_lfix_bs543'].includes(x.aircraftId))){
  const ac=D.aircraft[row.aircraftId],source=ac.observedClimb.find(x=>x.altFt===row.altFt),opts=row.prediction.options;
  let shaft,eta,requiredHp,q;
  if(row.aircraftId==='p47b'){
   const r=M.climbPrediction(ac,source,opts),drag=M.dragBreakdown(ac,row.altFt,source.tasMph,opts.weightLb,M.cd0FromAnchor(ac,'C',.78).cd0,.78);
   shaft=r.shaftHp;eta=r.prop.eta;requiredHp=drag.requiredHp;q=drag.q;
  }else{
   const r=M.evaluated(ac,row.altFt,source.tasMph,opts);shaft=r.power.shaftHp;eta=r.prop.eta;requiredHp=r.power.requiredHp;q=r.drag.q;
  }
  other.push({aircraftId:row.aircraftId,altFt:row.altFt,conditionExclusions:row.exclusions,sourcePowerProxy:row.prediction.method,budget:E.budget({weightLb:opts.weightLb,shaftHp:shaft,eta,requiredHp,qPa:q,wingAreaM2:ac.wingAreaM2,tasMph:source.tasMph,observedClimbFpm:source.fpm})});
 }
 const a=D.aircraft.p51b,polar=M.cd0FromAnchor(a,'C',.78);
 const powerRequiredCheck=graph.points.map(p=>{
  const drag=M.dragBreakdown(a,graph.altitudeFt,p.tasMph,graph.nominalWeightLb,polar.cd0,.78);
  const eta=M.propEta(a,graph.altitudeFt,p.tasMph,p.testBhp,'C','67inHg',{engineRpmOverride:p.engineRpm}).eta;
  return {...p,modeledEta:eta,modeledRequiredBhp:drag.requiredHp/eta,diagnosticResidualBhp:drag.requiredHp/eta-p.testBhp,sourceReading:'Inherited approximate Fig.5 reading, not newly digitized or a validated uncertainty bound'};
 });
 return {schema:1,scope:'Source-bounded climb power/cooling diagnosis; no default correction adopted',p51,otherAircraft:other,absentBf109:'No matched historical climb-rate/TAS/weight chain; no inverse cooling or eta fit attempted.',
  powerRequiredCheck:{altFt:graph.altitudeFt,weightLb:graph.nominalWeightLb,source:graph.source,url:graph.url,uncertainty:'Inherited graph-reading estimates are approximate; not independent validated error bounds. Different altitude/speed regime from 2200-ft climb.',rows:powerRequiredCheck},
  conclusion:'Positive extra cooling drag cannot close a positive useful-power deficit. Eta-only, shaft-only, mass-only and net-drag inverse solutions are not identifiable causes. No matched installed propeller map or cooling increment was established; preserve default solver and known failures.'};
}
function writeReport(){
 const r=run(),root=path.resolve(__dirname,'../..'),f=x=>Number.isFinite(x)?x.toFixed(3):'unresolved';
 fs.writeFileSync(path.join(root,'validation/current/climb-power-cooling.json'),JSON.stringify(r,null,2)+'\n');
 const lines=['# Climb power and cooling diagnosis','', 'Generated by `npm run check`. No default physics correction, fitted coefficient or historical uncertainty bound is introduced.','', '## Mustang at 2200 ft','', 'All values below are conditional on 9335 lb (reported takeoff, not verified instantaneous weight), model-optimized TAS, the existing shaft-power proxy and frozen speed-anchor polar. Historical climb TAS is unknown.','', '| Rating | TAS mph, model | Shaft hp | Eta, model | Useful hp available | Drag hp required | Model / report ft/min | Useful-hp deficit | Eta if prop-only | Extra shaft hp if eta fixed |','|---|---:|---:|---:|---:|---:|---|---:|---:|---:|'];
 for(const x of r.p51){const b=x.budget;lines.push(`| ${x.rating} | ${b.tasMph} | ${f(b.shaftHp)} | ${f(b.eta)} | ${f(b.availableUsefulHp)} | ${f(b.requiredHp)} | ${f(b.modelClimbFpm)} / ${b.observedClimbFpm} | ${f(b.gapUsefulHp)} | ${f(b.etaIfPropOnly)} | ${f(b.extraShaftHpAtFixedEta)} |`);}
 lines.push('','These are propulsive-power deficits, not shaft-horsepower deficits. A shaft-only change divided by fixed eta is an inverse sensitivity; actual eta changes with power coefficient. Eta below one passes only a necessary energy-conservation test, not installed-propeller validation.','', '## Cooling sign and alternative explanations','', '| Rating | With another 50 hp drag: ft/min | Net CD0 delta needed if drag-only | Required mass if mass-only, lb | Mass below takeoff, lb | Constant eta 0.83 grid result, ft/min |','|---|---:|---:|---:|---:|---:|');
 for(const x of r.p51)lines.push(`| ${x.rating} | ${f(x.withAdditional50HpCoolingLossFpm)} | ${f(x.budget.equivalentNetCd0Delta)} | ${Math.round(x.massOnly.weightLb/10)*10} | ${Math.round(x.massOnly.takeoffMinusRequiredLb/10)*10} | ${f(x.cFormulaAmplitudeEnvelope.climbFpm)} |`);
 lines.push('','The 50 hp increment is an illustrative sign test, not measured cooling loss. The negative net CD0 required to improve these climbs cannot be implemented as additional positive cooling drag. It could algebraically represent less baseline drag or extra thrust; neither is established by this inversion. This does not rule out radiator heat recovery or exhaust effects.','', '0.83 is the mathematical amplitude of the current heuristic C formula, not a measured physical efficiency limit. Its constant-eta grid is a climb-only envelope at the frozen polar; it is not an anchor-preserving replacement. Mass roots are shown to the nearest 10 lb and are unverified counterfactuals, not inferred fuel burn. All calculations retain the original reference polar rather than refitting drag to climb.','', '## P-47B and Spitfire: separate power and cooling','', '| Aircraft | Altitude ft | Useful-hp deficit (negative = model surplus) | Equivalent net CD0 delta | Additional positive drag has compatible sign? |','|---|---:|---:|---:|---|');
 for(const x of r.otherAircraft)lines.push(`| ${x.aircraftId} | ${x.altFt} | ${f(x.budget.gapUsefulHp)} | ${f(x.budget.equivalentNetCd0Delta)} | ${x.budget.additionalPositiveDragCanCloseGap?'yes, sign only':'no'} |`);
 lines.push('','P-47B uses the existing source climb-MAP/BHP proxy without the fitted aggregate-loss increment. Spitfire uses the existing same-altitude boost proxy where available; a missing reference retains the labeled nominal-engine diagnostic. Open versus closed cooling, mass and source-power uncertainties remain in the JSON. Even a compatible sign cannot identify a cooling coefficient separately from engine/propeller/exhaust errors. The P-47 15000-ft fit remains an aggregate fit in the performance report, not a transferable cooling law.','', '## Other constraints','', '| Fig.5 TAS mph | Engine rpm | Source chart BHP, approximate | Modeled required BHP | Signed BHP residual |','|---:|---:|---:|---:|---:|');
 for(const x of r.powerRequiredCheck.rows)lines.push(`| ${x.tasMph} | ${x.engineRpm} | ${x.testBhp} | ${f(x.modeledRequiredBhp)} | ${f(x.diagnosticResidualBhp)} |`);
 lines.push('','These inherited 22400-ft level-flight graph readings use recorded RPM; they cannot directly calibrate 2200-ft climb eta, and they share the flight programme. No graph-reading uncertainty is promoted to a validated bound.','', 'The preceding diagnosis inspected original Mustang Figures 6/7 without digitizing new coordinates. The subsequent [chart-state reconstruction](P51_CLIMB_STATE_RECONSTRUCTION.md) retains Figure 4 and sparse weight/BHP reading brackets, with joint sensitivities. No matched climb TAS/mass or isolated cooling drag is established. The [earlier ledger](../references/climb-power-cooling-audit.json) preserves that stage of the audit.','',r.absentBf109,'',r.conclusion,'', '## Result and continuation','', 'The investigation narrows the sign and magnitude of possible explanations, while leaving cause unresolved. The existing simulator is unchanged; controlled P-47 power cases, Mustang shortfall and 5:1 exclusions remain visible. See [current validation](CURRENT_VALIDATION.md), [performance report](PERFORMANCE_VALIDATION.md), and [machine-readable budget](../validation/current/climb-power-cooling.json).','');
 fs.writeFileSync(path.join(root,'docs/CLIMB_POWER_COOLING_DIAGNOSIS.md'),lines.join('\n'));return r;
}
if(require.main===module){writeReport();console.log('Climb diagnosis: 2 Mustang conditions, 21 P-47/Spitfire conditions; no default correction.');}
module.exports={run,writeReport,constantEtaScenario,requiredMassScenario};
