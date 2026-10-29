/* Comparative uncertainty audit: separates local sensitivity, shared-model
 * scenarios, and unconstrained per-airframe parameters. None is a CI. */
const m=require('./physics.js'),d=require('./cases.json');
const evidence=require('./evidence_gates_v10.json');
const ALT_FT=5000,EAS_MPH=170,E=[.60,.78,.90],CL=[.85,1,1.15];
const ids=['bf109f4','p47b','p51b'];
function value(id,e=.78,clFactor=1){const ac=d.aircraft[id];
 const tas=m.tasFrom(EAS_MPH,'EAS',ALT_FT);
 const r=m.evaluated(ac,ALT_FT,tas,{e,clMax:ac.clMaxAssumed*clFactor});
 return r.status==='modelled'?r.limits.sustDegSec:null;
}
function bounds(values){const finite=values.filter(Number.isFinite);return finite.length?[Math.min(...finite),Math.max(...finite)]:null;}
function cross(a,b){const ds=[];for(const x of a)for(const y of b)ds.push(x-y);return bounds(ds);}
function run(){
 const aircraft={};
 for(const id of ids){
  const ac=d.aircraft[id],baseline=value(id);
  const atE=E.map(e=>({e,turnDegSec:value(id,e,1)}));
  const atCl=CL.map(clFactor=>({clFactor,clMax:ac.clMaxAssumed*clFactor,turnDegSec:value(id,.78,clFactor)}));
  const all=E.flatMap(e=>CL.map(cl=>value(id,e,cl)));
  const polar=E.map(e=>({e,...m.cd0FromAnchor(ac,'C',e)}));
  aircraft[id]={baselineDegSec:baseline,sourceGate:evidence[id],
    oneParameterAtATime:{oswald:atE,clMax:atCl},
    combinedIndependentExploration:bounds(all),speedAnchorPolarNonUniqueness:polar};
 }
 const pairs=[];
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const a=ids[i],b=ids[j];
  const paired=E.flatMap(e=>CL.map(cl=>value(a,e,cl)-value(b,e,cl)));
  const independentA=E.flatMap(e=>CL.map(cl=>value(a,e,cl)));
  const independentB=E.flatMap(e=>CL.map(cl=>value(b,e,cl)));
  const same=bounds(paired),independent=cross(independentA,independentB);
  pairs.push({aircraftA:a,aircraftB:b,baselineDifferenceDegSec:value(a)-value(b),
   sharedAssumptionDifferenceRange:same,independentAssumptionDifferenceRange:independent,
   signRobustShared:same[0]>0||same[1]<0,signRobustIndependent:independent[0]>0||independent[1]<0,
   interpretation:'Shared-factor span is a what-if systematic-error illustration ONLY; not evidence of actual correlated parameter errors across unlike wings.'});
 }
 return {version:'v1.0-evidence-gated-audit',conditions:{altFt:ALT_FT,easMph:EAS_MPH},
  aircraft,pairs,
  conclusions:[
   'The speed anchor identifies one total drag/power balance, not a unique parasite/induced drag polar.',
   'Published raw IAS stall speeds cannot constrain CLmax without valid low-speed IAS->CAS correction and weight/configuration alignment.',
   'Do not average or plot combined scenario extrema as statistical uncertainty on the aircraft comparison.',
   'Baseline turn figures are provisional model outputs; no historical combat turning rank is validated.'
  ]};
}
if(require.main===module){const r=run();if(process.argv.includes('--json'))console.log(JSON.stringify(r,null,2));else{
 const f=v=>Number(v).toFixed(2),range=arr=>arr.map(f).join(' to ');
 console.log('Evidence-gated comparative audit — 5000 ft, 170 mph EAS; predictions only');
 for(const [id,a] of Object.entries(r.aircraft)){
  const oe=a.oneParameterAtATime.oswald,oc=a.oneParameterAtATime.clMax;
  console.log(`${id}: baseline ${f(a.baselineDegSec)}°/s; varying e alone ${range(bounds(oe.map(x=>x.turnDegSec)))}; varying CLmax alone ${range(bounds(oc.map(x=>x.turnDegSec)))}`);
 }
 for(const p of r.pairs)console.log(`${p.aircraftA} − ${p.aircraftB}: baseline ${f(p.baselineDifferenceDegSec)}°/s; shared hypothetical ${range(p.sharedAssumptionDifferenceRange)}; independent hypothetical ${range(p.independentAssumptionDifferenceRange)}`);
}}
module.exports={run,value};
