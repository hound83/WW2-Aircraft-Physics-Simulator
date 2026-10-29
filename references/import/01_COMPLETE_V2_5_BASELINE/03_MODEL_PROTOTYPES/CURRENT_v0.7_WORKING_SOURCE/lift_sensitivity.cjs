/* v0.9: uncertainty exploration, NOT a fit or source-backed confidence interval.
 * Run: node lift_sensitivity.cjs [--json]
 * Three aircraft at common 5,000 ft; fixed speed-calibrated reference polar.
 */
const physics=require('./physics.js');
const cases=require('./cases.json');
const ALT=5000, REFERENCE_EAS=170;
const OSWALD=[.60,.78,.90], CL_FACTORS=[.85,1,1.15];
const aircraftIds=['bf109f4','p47b','p51b'];
function point(ac,e,clMax,easMph){
 const tas=physics.tasFrom(easMph,'EAS',ALT);
 return physics.evaluated(ac,ALT,tas,{e,clMax});
}
function peak(ac,e,clMax,metric){
 let best=null;
 for(let easMph=90;easMph<=300;easMph+=1){
  const r=point(ac,e,clMax,easMph),value=r.limits?.[metric];
  if(r.status!=='modelled'||!Number.isFinite(value))continue;
  if(best===null||value>best.value)best={easMph,value};
 }
 return best;
}
function run(){
 const aircraft={};
 for(const id of aircraftIds){
  const ac=cases.aircraft[id],scenarios=[];
  for(const e of OSWALD)for(const clFactor of CL_FACTORS){
   const clMax=ac.clMaxAssumed*clFactor,r=point(ac,e,clMax,REFERENCE_EAS);
   scenarios.push({e,clFactor,clMax,stallEasMph:r.stallEasMph,
     instant170DegSec:r.limits.instantDegSec,
     sustained170DegSec:r.limits.sustDegSec,
     peakInstant:peak(ac,e,clMax,'instantDegSec'),
     peakSustained:peak(ac,e,clMax,'sustDegSec')});
  }
  const baseline=scenarios.find(x=>x.e===.78&&x.clFactor===1);
  const valid=(field)=>scenarios.map(x=>field(x)).filter(Number.isFinite);
  const range=(field)=>{const v=valid(field);return v.length?[Math.min(...v),Math.max(...v)]:null;};
  aircraft[id]={name:ac.name,weightLb:ac.weightLb,assumedClMax:ac.clMaxAssumed,
    originalStatus:ac.clStatus,baseline,
    sensitivity:{stallEasMph:range(x=>x.stallEasMph),instant170DegSec:range(x=>x.instant170DegSec),
      sustained170DegSec:range(x=>x.sustained170DegSec),
      peakInstantDegSec:range(x=>x.peakInstant?.value),peakSustainedDegSec:range(x=>x.peakSustained?.value)},
    scenarios};
 }
 return {version:'clean-physics-v0.9-sensitivity',altFt:ALT,referenceEasMph:REFERENCE_EAS,
  grid:{oswald:OSWALD,clMaxMultipliers:CL_FACTORS,speedSearchEasMph:[90,300],speedStepMph:1},
  warning:'Exploratory assumptions, not measured bounds or probability distributions. Different airplane test weights and power states remain source-limited. Speed-anchor CD0 stays fixed; no refit per scenario.',
  aircraft};
}
if(require.main===module){const r=run();if(process.argv.includes('--json'))console.log(JSON.stringify(r,null,2));else{
 console.log('Exploratory lift/induced-drag sensitivity at 5,000 ft; 170 mph EAS; NO historical validation');
 for(const [id,a] of Object.entries(r.aircraft)){
  const b=a.baseline,s=a.sensitivity;
  const fmt=v=>v==null?'n/a':Number(v).toFixed(2);
  const bounds=v=>v?`${fmt(v[0])}–${fmt(v[1])}`:'n/a';
  console.log(`${id}: assumed CLmax ${a.assumedClMax}; baseline Vs(EAS) ${fmt(b.stallEasMph)} mph; instantaneous ${fmt(b.instant170DegSec)} °/s, sustained ${fmt(b.sustained170DegSec)} °/s`);
  console.log(`  grid: stall ${bounds(s.stallEasMph)} mph EAS; instantaneous ${bounds(s.instant170DegSec)} °/s; sustained ${bounds(s.sustained170DegSec)} °/s; peak sustained ${bounds(s.peakSustainedDegSec)} °/s`);
 }
}}
module.exports={run,point,peak};
