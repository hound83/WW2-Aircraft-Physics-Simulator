'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const M=require(path.join(root,'src/physics.js'));
const E=require(path.join(root,'src/energy-configuration.js'));
const T=require(path.join(root,'src/turn-lift.js'));
const lift=require(path.join(root,'references/p51-turn-lift-tn1044.json'));
const {models}=require(path.join(root,'validation/diagnostics/energy_v41.cjs')).buildData();
function setup(id,alt,mode,override,weightOverride){
 const original=models[id],model={...original};
 let rating=override??({p51b:'67inHg',bf109f4:'combat',f4u4:'military'}[id]??(mode==='source'?original.energyRating:original.ac.defaultRating)??original.ac.defaultRating);
 const weight=weightOverride??(mode==='source'?(original.energyWeightLb??original.ac.weightLb):original.ac.weightLb);
 let fallback=false;
 if(mode!=='source'){delete model.energyConfiguration;delete model.parameterCandidates;}
 else if(model.energyConfiguration&&!E.prepare(M,model,alt,rating,weight,model.energyConfiguration)){
  delete model.energyConfiguration;fallback=true;if(rating==='source-schedule')rating=original.ac.defaultRating;
 }
 return {model,rating,weight,fallback};
}
function evaluate(p,alt,eas){
 const tas=M.tasFrom(eas,'EAS',alt);
 const options=T.optionsFor(M,p.model.ac,lift,alt,tas,{...p.model.options,rating:p.rating,weightLb:p.weight});
 return p.model.energyConfiguration?E.evaluate(M,{...p.model,options},alt,tas,p.rating,p.weight,p.model.energyConfiguration):M.evaluated(p.model.ac,alt,tas,options);
}
function peak(p,alt,key){
 let best=null;
 function sample(eas){
  const r=evaluate(p,alt,eas),v=key==='climb'?r.power?.climbFpm:key==='sust'?r.limits?.sustDegSec:r.limits?.instantDegSec;
  if(r.status==='modelled'&&Number.isFinite(v)&&(!best||v>best.value))best={eas,value:v,r};
 }
 for(let eas=80;eas<=450;eas+=.5)sample(eas);
 if(!best)return null;
 const center=best.eas;for(let eas=center-.5;eas<=center+.5;eas+=.01)sample(eas);
 const r=best.r;
 return {value:best.value,eas:best.eas,tas:r.tasMph,g:key==='sust'?r.limits.nSust:key==='instant'?r.limits.nInst:null,
  seconds:key==='climb'?null:360/best.value,radiusM:key==='climb'?null:r.tasMph*.44704/(best.value*Math.PI/180),
  rating:r.engine.rating,gear:r.engine.gear,shaftHp:r.power.shaftHp,
  limit:r.limits.nPower<=r.limits.nInst?'power':r.limits.nLift<=r.limits.structG?'lift':'structure',
  withinClimbTasWindow:!p.model.energyConfiguration||r.tasMph>=p.model.energyConfiguration.minTasMph&&r.tasMph<=p.model.energyConfiguration.maxTasMph};
}
function level(p,alt){
 let prev=null,crossing=null;
 for(let tas=100;tas<=590;tas+=2){const r=evaluate(p,alt,M.airspeeds(tas,alt).eas);
  if(r.status!=='modelled'||!r.power){prev=null;continue;}
  if(prev&&prev.r.power.excessHp>=0&&r.power.excessHp<0)crossing=[prev.tas,tas];prev={tas,r};
 }
 if(!crossing)return null;
 let [lo,hi]=crossing;for(let i=0;i<35;i++){const mid=(lo+hi)/2,r=evaluate(p,alt,M.airspeeds(mid,alt).eas);if(r.power.excessHp>0)lo=mid;else hi=mid;}
 const tas=(lo+hi)/2,r=evaluate(p,alt,M.airspeeds(tas,alt).eas);
 return {tas,eas:r.air.eas,mach:r.air.mach,rating:r.engine.rating,gear:r.engine.gear,withinClimbTasWindow:!p.model.energyConfiguration||tas<=p.model.energyConfiguration.maxTasMph};
}
function metrics(p,alt){return {sustained:peak(p,alt,'sust'),instantaneous:peak(p,alt,'instant'),climb:peak(p,alt,'climb'),level:level(p,alt)};}
const rows=[];
for(const alt of [5000,15000,27000])for(const id of Object.keys(models))for(const mode of ['reference','source']){
 const p=setup(id,alt,mode);rows.push({id,name:p.model.ac.name,altFt:alt,mode,weightLb:p.weight,rating:p.rating,fallback:p.fallback,sourceConfigured:!!p.model.energyConfiguration,...metrics(p,alt)});
}
const controlled=[];
for(const after of rows.filter(r=>r.mode==='source'&&r.sourceConfigured)){
 const p=setup(after.id,after.altFt,'source'),rating=E.prepare(M,p.model,after.altFt,p.rating,p.weight,p.model.energyConfiguration).options.rating;
 const before=setup(after.id,after.altFt,'reference',rating,p.weight);
 controlled.push({id:after.id,altFt:after.altFt,rating,weightLb:p.weight,before:metrics(before,after.altFt),after});
}
const extra=[5000,8000,15000].map(alt=>{const p=setup('p51b',alt,'source','75inHg');return {altFt:alt,fallback:p.fallback,...metrics(p,alt)};});
const output={commit:'c9a7ff67bce7b70405d6a8b7a28cc8786c1a0f80',rows,controlled,extra,
 qualification:'Model predictions, ISA, coordinated level turns, 7g cap, no fit. Peaks searched 80-450mph EAS then refined to .01mph. Source mode matches UI defaults including report masses, scheduled ratings and fallback masses. Source level speeds beyond 320mph TAS are diagnostic extrapolations of climb configurations. Corsair power-off stall anchor.'};
if(process.argv[2])fs.writeFileSync(path.resolve(process.argv[2]),JSON.stringify(output,null,2)+'\n');
const n=(v,d=1)=>Number.isFinite(v)?+v.toFixed(d):null;
console.log(JSON.stringify({source:rows.filter(r=>r.mode==='source').map(r=>({id:r.id,alt:r.altFt,w:r.weightLb,rating:r.sustained?.rating??r.rating,fallback:r.fallback,
 turn:n(r.sustained?.value),turnSec:n(r.sustained?.seconds),turnEas:n(r.sustained?.eas,0),g:n(r.sustained?.g,2),radius:n(r.sustained?.radiusM,0),instant:n(r.instantaneous?.value),instantEas:n(r.instantaneous?.eas,0),roc:n(r.climb?.value,0),vyEas:n(r.climb?.eas,0),vyTas:n(r.climb?.tas,0),sourceVmax:n(r.level?.tas,0),refVmax:n(rows.find(v=>v.id===r.id&&v.altFt===r.altFt&&v.mode==='reference').level?.tas,0),peakWithinFit:r.sustained?.withinClimbTasWindow})),
 controlled:controlled.map(r=>({id:r.id,alt:r.altFt,rating:r.rating,w:r.weightLb,beforeTurn:n(r.before.sustained?.value,2),afterTurn:n(r.after.sustained?.value,2),beforeClimb:n(r.before.climb?.value,0),afterClimb:n(r.after.climb?.value,0),beforeVmax:n(r.before.level?.tas,0),afterVmax:n(r.after.level?.tas,0)})),extra:extra.map(r=>({alt:r.altFt,fallback:r.fallback,turn:n(r.sustained?.value),roc:n(r.climb?.value,0),vy:n(r.climb?.eas,0),vmax:n(r.level?.tas,0)}))},null,2));
