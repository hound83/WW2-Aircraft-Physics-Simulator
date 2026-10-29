/* Cross-check Greg's sea-level spreadsheet against the current engine.
 * Greg worksheet math is a reference, not an independent flight measurement.
 * P-47D-style 2600 bhp case is NOT P-47B rated-power validation.
 */
const m=require('../../src/physics.js');
const d=require('../../aircraft/cases.json');
const FOCUS=[150,200,250,300];
const pct=(v,ref)=>ref===0?null:100*(v/ref-1);
function avg(values){return values.reduce((a,b)=>a+b,0)/values.length;}
function row109(){
 const a=d.aircraft.bf109f4,g=d.greg.bf109f4,anchor=m.cd0FromAnchor(a,'C',.78),derived=m.inferredGregF4(a,g);
 const rows=g.reference.map(([speedMph,gParasLbf,gIndLbf,gTotalLbf,gPowerReqHp,gParasHp,gIndHp,gPowerAvailHp])=>{
  const base=m.dragBreakdown(a,0,speedMph,a.weightLb,anchor.cd0,.78);
  const reconstructed=m.dragBreakdown(a,0,speedMph,a.weightLb,derived.cd0,derived.oswald);
  const engine=m.shaftPower(a,0,a.calibration.rating,a.calibration.gear),prop=m.propEta(a,0,speedMph,engine.bhp,'C');
  return {speedMph,greg:{parasLbf:gParasLbf,indLbf:gIndLbf,totalLbf:gTotalLbf,requiredHp:gPowerReqHp,availableHp:gPowerAvailHp},
    baseline:{parasLbf:base.parasiteLbf,indLbf:base.inducedLbf,totalLbf:base.totalLbf,requiredHp:base.requiredHp,availableHp:engine.bhp*prop.eta},
    reconstructed:{parasLbf:reconstructed.parasiteLbf,indLbf:reconstructed.inducedLbf,requiredHp:reconstructed.requiredHp},
    residualPct:{paras:pct(base.parasiteLbf,gParasLbf),ind:pct(base.inducedLbf,gIndLbf),requiredHp:pct(base.requiredHp,gPowerReqHp),availableHp:pct(engine.bhp*prop.eta,gPowerAvailHp)}
  };
 });
 const top=rows.at(-1),bhp=m.shaftPower(a,0,a.calibration.rating,a.calibration.gear).bhp;
 const tasAt5000=m.tasFrom(170,'EAS',5000);
 const frozen=m.evaluated(a,5000,tasAt5000,{e:.78});
 const sameSpeedWithGregE=m.evaluated(a,5000,tasAt5000,{e:derived.oswald,refit:true});
 return {case:'Bf109F-4 Greg sea level; same 6371-lb nominal test weight',
  currentParams:{cd0:anchor.cd0,e:.78,etaAt325:anchor.etaAtAnchor},
  gregImplied:{cd0:derived.cd0,e:derived.oswald,propulsiveHpAt325:top.greg.availableHp,impliedEtaAt325:top.greg.availableHp/bhp},
  isolatedTurnImpact:{condition:'5000 ft, 170 mph EAS, CLmax unchanged; CD0 re-fitted ONLY to preserve same 325-mph engine/prop speed anchor',
    baselineDegSec:frozen.limits.sustDegSec,gregDerivedEDegSec:sameSpeedWithGregE.limits.sustDegSec,
    changeDegSec:sameSpeedWithGregE.limits.sustDegSec-frozen.limits.sustDegSec},
  caveat:'Greg power-available schedule is a worksheet input and may use different engine rating, PS/hp and propeller assumptions; current CD0 is fitted with the current prop candidate, so polar and eta differences are coupled.',
  rows,summary:{meanAbsRequiredPowerErrorPct:avg(rows.map(r=>Math.abs(r.residualPct.requiredHp))),
    meanAbsInducedDragErrorPct:avg(rows.map(r=>Math.abs(r.residualPct.ind)))}};
}
function row47(){
 const a=d.aircraft.p47b,g=d.greg.p47d28,anchor=m.cd0FromAnchor(a,'C',.78),derived=m.inferredGregP47(a,g);
 const rows=g.reference.map(([speedMph,gRequiredHp,gParasHp,gIndHp,gAvailableHp])=>{
  // Geometry is shared as a deliberate D-28-style regression; the original
  // P-47B's power and mass must NOT be copied into a 2600-hp scenario.
  const base=m.dragBreakdown(a,0,speedMph,derived.weightLb,anchor.cd0,.78);
  const reconstructed=m.dragBreakdown(a,0,speedMph,derived.weightLb,derived.cd0,derived.oswald);
  const prop=m.propEta(a,0,speedMph,2600,'C');
  return {speedMph,greg:{parasHp:gParasHp,indHp:gIndHp,requiredHp:gRequiredHp,availableHp:gAvailableHp},
    baselineGeometry:{parasHp:base.parasiteHp,indHp:base.inducedHp,requiredHp:base.requiredHp,availableHpHypothetical2600:2600*prop.eta},
    reconstructed:{parasHp:reconstructed.parasiteHp,indHp:reconstructed.inducedHp,requiredHp:reconstructed.requiredHp},
    residualPct:{paras:pct(base.parasiteHp,gParasHp),ind:pct(base.inducedHp,gIndHp),requiredHp:pct(base.requiredHp,gRequiredHp),availablePowerAt2600:pct(2600*prop.eta,gAvailableHp)},
    eta:{greg:gAvailableHp/2600,genericCandidateC:prop.eta}};
 });
 return {case:'P-47D-28-like 2600-bhp Greg worksheet; 13065-lb reference, shared Thunderbolt geometry',
  currentSharedGeometryParams:{cd0P47BAnchor:anchor.cd0,e:.78},
  gregImplied:{cd0:derived.cd0,e:derived.oswald},
  caveat:'The parasite CD0 discrepancy combines B versus D variant, different speed/altitude/rating/prop/cooling, and anchor method. No direct historical P-47B validation is implied.',
  rows,summary:{meanAbsRequiredPowerErrorPct:avg(rows.map(r=>Math.abs(r.residualPct.requiredHp))),
    meanAbsInducedDragErrorPct:avg(rows.map(r=>Math.abs(r.residualPct.ind)))}};
}
function graph27k(){
 const g=d.greg.p47b27k,a=d.aircraft.p47b;const rows=g.readings.map(([chartMph,gregSustainedG])=>{
   const r=m.evaluated(a,27000,m.tasFrom(chartMph,'CAS',27000),{e:.78});
   return {chartMph,gregSustainedG,modeledSustainedG:r.limits?.nSust??null,
     residualG:r.limits?.nSust!=null?r.limits.nSust-gregSustainedG:null};
 });
 return {case:'P-47B 27000-ft plot read approximately from Greg screenshot',chartSpeedKindAssumed:'CAS, UNVERIFIED',
  rows,meanAbsResidualG:avg(rows.filter(r=>r.residualG!=null).map(r=>Math.abs(r.residualG))),
  caveat:'Not an independent observation; chart transcription approximate; speed axis definition unresolved. Bf109F 27000-ft engine envelope unavailable, so no numeric 109 comparison.'};
}
function run(){return {version:'v1.1-Greg-crosscheck',
  sources:'Greg user-supplied screenshots reconstructed in cases.json; not certified measured report data',
  bf109:row109(),p47Dscenario:row47(),p47Graph27k:graph27k(),
  conclusion:'The shared mathematical drag law reproduces Greg if supplied Greg-implied e and CD0. The current coefficients/eta are different because max-speed anchor alone does not determine them. Do not automatically overwrite coefficients from a worksheet as historical measurements.'};}
if(require.main===module){const x=run();if(process.argv.includes('--json'))console.log(JSON.stringify(x,null,2));else{
 const f=n=>Number(n).toFixed(2);
 console.log('Greg comparison. Reconstructed worksheet != independent flight validation.');
 console.log(`Bf109 current CD0 ${x.bf109.currentParams.cd0.toFixed(5)}, Greg ${x.bf109.gregImplied.cd0.toFixed(5)}; current e ${f(x.bf109.currentParams.e)}, Greg ${f(x.bf109.gregImplied.e)}; current eta@325 ${f(x.bf109.currentParams.etaAt325)}, Greg inferred ${f(x.bf109.gregImplied.impliedEtaAt325)}`);
 console.log(`109 turn sensitivity, same speed anchor: baseline ${f(x.bf109.isolatedTurnImpact.baselineDegSec)}°/s -> Greg-implied e ${f(x.bf109.isolatedTurnImpact.gregDerivedEDegSec)}°/s (not independent validation)`);
 for(const v of [...FOCUS,325]){const r=x.bf109.rows.find(r=>r.speedMph===v);if(r)console.log(`109 ${v} mph: Greg req ${r.greg.requiredHp} hp, current ${f(r.baseline.requiredHp)} hp; Greg avail ${r.greg.availableHp} hp, current ${f(r.baseline.availableHp)} hp`);}
 console.log(`P47 current-B CD0 ${x.p47Dscenario.currentSharedGeometryParams.cd0P47BAnchor.toFixed(5)}, Greg-D implied ${x.p47Dscenario.gregImplied.cd0.toFixed(5)}; current e .78, Greg D ${f(x.p47Dscenario.gregImplied.e)}`);
 for(const v of [...FOCUS,350]){const r=x.p47Dscenario.rows.find(r=>r.speedMph===v);if(r)console.log(`P47D scenario ${v} mph: Greg req ${r.greg.requiredHp} hp, current-B geometry ${f(r.baselineGeometry.requiredHp)} hp; Greg eta ${f(r.eta.greg)}, generic C ${f(r.eta.genericCandidateC)}`);}
 console.log(`P47B 27000-ft approximate plotted-g MAE ${f(x.p47Graph27k.meanAbsResidualG)}g (CAS interpretation unverified)`);
}}
module.exports={run};
