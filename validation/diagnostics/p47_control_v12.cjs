/* Controlled P-47 aerodynamic/power experiment.
 * All scenario points use same 13065 lb, P-47 shared wing geometry, sea level,
 * and same Greg eta(speed) schedule. No scenario is labeled a historic P-47B
 * or D-28 measured flight trial.
 */
const m=require('../../src/physics.js'),data=require('../../aircraft/cases.json');
const ac=data.aircraft.p47b,greg=data.greg.p47d28;
const inf=m.inferredGregP47(ac,greg),fit=m.cd0FromAnchor(ac,'C',.78);
const polars={
  B_anchor:{cd0:fit.cd0,e:.78,source:'P-47B 5000-ft speed-fitted candidate (not measured CD0)'},
  Greg_D:{cd0:inf.cd0,e:inf.oswald,source:'Greg D-style worksheet reconstruction (not measured CD0)'}
};
const rows=greg.reference;
function eta(speedMph){
 if(!(speedMph>=rows[0][0]&&speedMph<=rows.at(-1)[0]))return null;
 for(let i=0;i<rows.length;i++){
  if(speedMph===rows[i][0])return rows[i][4]/2600;
  if(i&&speedMph<rows[i][0]){
   const t=(speedMph-rows[i-1][0])/(rows[i][0]-rows[i-1][0]);
   return (rows[i-1][4]+t*(rows[i][4]-rows[i-1][4]))/2600;
  }
 }
 return rows.at(-1)[4]/2600;
}
function point(polarName,shaftHp,speedMph){
 const p=polars[polarName],propEta=eta(speedMph);
 if(!p||!(shaftHp>0)||propEta==null)return null;
 const D=m.dragBreakdown(ac,0,speedMph,13065,p.cd0,p.e),availableHp=shaftHp*propEta;
 const powerN2=(availableHp-D.parasiteHp)/D.inducedHp;
 const nPower=availableHp>=D.requiredHp?Math.sqrt(Math.max(0,powerN2)):null;
 const liftN=D.q*ac.wingAreaM2*ac.clMaxAssumed/(13065*4.4482216153);
 const nSust=nPower===null?null:Math.min(nPower,liftN,7);
 const V=speedMph*.44704;
 const degSec=nSust>=1?9.80665*Math.sqrt(nSust*nSust-1)/V*180/Math.PI:null;
 return {speedMph,shaftHp,dragHp:D.requiredHp,parasiteHp:D.parasiteHp,inducedHp:D.inducedHp,
  eta:propEta,availableHp,excessHp:availableHp-D.requiredHp,nPower,nLift:liftN,nSust,turnDegSec:degSec,
  clMaxStatus:'P-47B provisional CLmax=1.30: turn constraint is illustrative only'};
}
function maxSpeed(polarName,shaftHp){
 let crossing=null,earlier=null;
 for(let v=100;v<=375;v++){
  const next=point(polarName,shaftHp,v);
  if(earlier?.excessHp>=0&&next.excessHp<=0){crossing=[v-1,v];break;}
  earlier=next;
 }
 if(!crossing)return null;
 let [lo,hi]=crossing;
 for(let i=0;i<40;i++){
  const v=(lo+hi)/2;
  if(point(polarName,shaftHp,v).excessHp>=0)lo=v;else hi=v;
 }
 return (lo+hi)/2;
}
function historicalP47BCheck(){
 const obs=ac.observedSpeed.map((row,i)=>{
  const common={rating:row.rating,gear:row.gear};
  const baseline=m.maxSpeed(ac,row.altFt,common);
  const gregTransfer=m.maxSpeed(ac,row.altFt,{...common,polar:{...polars.Greg_D}});
  return {altFt:row.altFt,observedTasMph:row.mphTas,
   calibratedAtThisAltitude:i===0,baselineTasMph:baseline,gregPolarTransferredTasMph:gregTransfer,
   baselineErrorMph:baseline-row.mphTas,gregPolarErrorMph:gregTransfer-row.mphTas,
   inputStatus:'P-47B sourced test, not a D-28 flight measurement'};
 });
 const held=obs.filter(x=>!x.calibratedAtThisAltitude);
 const mae=key=>held.reduce((acc,row)=>acc+Math.abs(row[key]),0)/held.length;
 return {observations:obs,heldOutMeanAbsErrorMph:{B_anchor:mae('baselineErrorMph'),Greg_D_directTransfer:mae('gregPolarErrorMph')},
  caveat:'Both candidates share the same P47B engine/prop assumptions. CD0 B-anchor was fitted at 5000 ft; other altitudes are withheld from that one-point fit. Source engine curves may nevertheless use the same test series.'};
}
function run(){
 const scenarios=[];
 for(const polarName of Object.keys(polars))for(const shaftHp of [2000,2600]){
  scenarios.push({polarName,shaftHp,maxSpeedMph:maxSpeed(polarName,shaftHp),at200:point(polarName,shaftHp,200),at250:point(polarName,shaftHp,250)});
 }
 const named=(polarName,shaftHp)=>scenarios.find(x=>x.polarName===polarName&&x.shaftHp===shaftHp);
 return {version:'v1.2-P47-controlled-airframe',geometry:{wingAreaM2:ac.wingAreaM2,spanM:ac.spanM,weightLb:13065},
  fixedFactors:'ISA sea-level atmosphere; P-47 shared wing/weight/geometry; Greg source eta(speed) is held identical at both shaft powers and both polars',
  polars,scenarios,
  isolatedEffects:{
   plus600HpSameGregPolarMph:named('Greg_D',2600).maxSpeedMph-named('Greg_D',2000).maxSpeedMph,
   plus600HpSameBPolarMph:named('B_anchor',2600).maxSpeedMph-named('B_anchor',2000).maxSpeedMph,
   swapPolarAt2000HpMph:named('B_anchor',2000).maxSpeedMph-named('Greg_D',2000).maxSpeedMph,
   swapPolarAt2600HpMph:named('B_anchor',2600).maxSpeedMph-named('Greg_D',2600).maxSpeedMph
  },
  historicalP47BCheck:historicalP47BCheck(),
  note:'This is a controlled power/drag experiment, not a claim that P-47B and D-28 installations are historically drag-identical. Canopy, propeller, cooling and test configuration can alter aircraft-level CD0 despite common wing geometry.'};
}
if(require.main===module){const out=run();if(process.argv.includes('--json'))console.log(JSON.stringify(out,null,2));else{
 const f=x=>Number(x).toFixed(2);
 for(const r of out.scenarios)console.log(`${r.polarName} + ${r.shaftHp} hp: max ${f(r.maxSpeedMph)} mph; 200 mph sustained ${f(r.at200.nSust)} g (${f(r.at200.turnDegSec)}°/s)`);
 console.log('Isolated speed effects (mph)',Object.fromEntries(Object.entries(out.isolatedEffects).map(([k,v])=>[k,f(v)])));
 console.log('P47B historical held-out TAS MAE (mph)',out.historicalP47BCheck.heldOutMeanAbsErrorMph);
}}
module.exports={run,point,maxSpeed,polars,eta};
