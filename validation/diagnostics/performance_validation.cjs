'use strict';
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),D=require('../../aircraft/cases.json'),ledger=require('../../references/performance-evidence.json'),G=require('../lib/performance_gate.cjs');
const ids=['bf109f4','p47b','p51b','spitfire_lfix_bs543'];
const baseOptions={profile:'C',e:.78};
function boostAt(nodes,alt){
 if(!nodes||alt<nodes[0][0]||alt>nodes.at(-1)[0])return null;
 for(let i=0;i<nodes.length;i++){if(alt===nodes[i][0])return nodes[i][1];if(i&&alt<nodes[i][0]){const [x,y]=nodes[i-1],[xx,yy]=nodes[i];return y+(yy-y)*(alt-x)/(xx-x);}}
 return null;
}
function observation(id,metric,index,point,condition){
 const ac=D.aircraft[id],entry=ledger.aircraft[id],identity=ac.stallIdentity;
 return {id:id+'-'+metric+'-'+index,aircraftId:id,variant:identity.variant,specimen:identity.specimen,metric,unit:metric==='level-speed'?'mph-TAS':'ft/min',altFt:point.altFt,value:metric==='level-speed'?point.mphTas:point.fpm,
  rating:point.rating,gear:point.gear??null,engineRpm:condition.rpmByRating?.[point.rating]??point.engineRpm??null,atmosphere:'standard',configuration:condition.configuration,
  weight:{valueLb:condition.weightLb??null,kind:condition.weightKind??'unknown',source:entry.source.reference},
  airspeed:{kind:'TAS',valueMph:metric==='level-speed'?point.mphTas:point.tasMph??null,verified:entry.source.kind==='primary-transcription',source:entry.source.reference},
  fitRole:metric==='level-speed'?G.anchorRole(ac,point):'non-anchor-checkpoint',independent:false,errorBound:null,source:entry.source,sourceNote:condition.note,
  inputPath:'aircraft/cases.json:aircraft.'+id+'.'+(metric==='level-speed'?'observedSpeed':'observedClimb')+'['+index+']'};
}
function prediction(o,value,extra={}){
 const ac=D.aircraft[o.aircraftId];
 return {aircraftId:o.aircraftId,variant:ac.stallIdentity.variant,specimen:ac.stallIdentity.specimen,metric:o.metric,unit:o.unit,altFt:o.altFt,value:Number.isFinite(value)?value:null,
  rating:o.rating,gear:o.gear??'auto',engineRpm:ac.propGeometry?.engineRpmByRating?.[o.rating]??(o.aircraftId==='p47b'?2700:null),atmosphere:'standard',weightLb:ac.weightLb,
  configuration:ledger.modelConfigurations[o.aircraftId],airspeed:{kind:'TAS',valueMph:o.airspeed.valueMph},...extra};
}
function run(){
 const rows=[];
 for(const id of ids){
  const ac=D.aircraft[id],entry=ledger.aircraft[id];
  for(const [i,p] of ac.observedSpeed.entries()){
   const o=observation(id,'level-speed',i,p,entry.speed),v=M.maxSpeed(ac,p.altFt,{...baseOptions,rating:p.rating,gear:p.gear});
   rows.push(G.assess(o,prediction(o,v,{method:'maxSpeed, frozen speed-anchor polar',options:{...baseOptions,rating:p.rating,gear:p.gear},airspeed:{kind:'TAS',valueMph:v}})));
  }
  if(id==='p51b'){
   for(const rep of ac.climbReports)for(const [i,p] of rep.observations.entries()){
    const o=observation(id,'climb-rate',rep.id+'-'+i,{...p,tasMph:p.speedTasMph},entry.climb);
    o.source={...entry.source,reference:rep.sourceId,url:rep.url,inspection:rep.id==='wright-1944-05-15'?'Inherited alternate memo summary; not freshly scan-verified':entry.source.inspection};o.reportId=rep.id;
    o.inputPath='aircraft/cases.json:aircraft.p51b.climbReports.'+rep.id+'.observations['+i+']';
    o.weight={valueLb:rep.takeoffWeightLb,kind:'takeoff',source:rep.sourceId};
    const opts={...baseOptions,rating:p.rating,gear:'auto',engineModel:'ram-critical',weightLb:rep.takeoffWeightLb,minTasMph:100,maxTasMph:290,stepMph:1};
    const r=M.bestClimb(ac,p.altFt,opts);
    rows.push(G.assess(o,prediction(o,r.climbFpm,{weightLb:rep.takeoffWeightLb,gear:'auto',speedSelection:'optimized',airspeed:{kind:'TAS',valueMph:r.tasMph??null},method:'bestClimb; legacy ram-critical diagnostic, not measured climb TAS',solverStatus:r.status,solverReason:r.reason??null,options:opts})));
   }
  }else if(id==='bf109f4'){
   const o=observation(id,'climb-rate','unavailable',{altFt:null,fpm:null,rating:ac.defaultRating},{});
   o.sourceNote=entry.climb.note;rows.push(G.assess(o,prediction(o,null,{speedSelection:'unavailable',method:'No direct active climb-rate observation'})));
  }else for(const [i,p] of ac.observedClimb.entries()){
   const condition={...entry.climb,rpmByRating:id==='p47b'?{military:2700}:{'combat+18':3000}};
   const o=observation(id,'climb-rate',i,p,condition),opts={...baseOptions,rating:p.rating,gear:p.gear??'auto',weightLb:entry.climb.weightLb};
   let value,method;
   if(id==='p47b'){
    value=M.climbPrediction(ac,p,opts).predictedFpm;method='Reported TAS, climb MAP proportional-BHP proxy; no fitted extra drag';
   }else{
    const reference=boostAt(ac.boostComparison.referenceLevelSpeedBoostPsi[p.gear],p.altFt);
    if(reference!==null)opts.engineCondition={referenceBoostPsi:reference,observedBoostPsi:p.reportedBoostPsi,source:ac.boostComparison.source};
    value=M.evaluated(ac,p.altFt,p.tasMph,opts).power?.climbFpm;
    method=reference===null?'Reported TAS; source level-boost reference unavailable, nominal engine retained (diagnostic only)':'Reported TAS and same-altitude boost proxy; closed-cooling polar retained';
   }
   rows.push(G.assess(o,prediction(o,value,{weightLb:opts.weightLb,speedSelection:'reported',method,options:opts})));
  }
 }
 const summary=ids.map(id=>({aircraftId:id,metrics:['level-speed','climb-rate'].map(metric=>{
  const r=rows.filter(r=>r.aircraftId===id&&r.metric===metric);
  return {metric,unit:metric==='level-speed'?'mph-TAS':'ft/min',records:r.length,anchors:r.filter(r=>r.fitRole==='speed-anchor').length,excluded:r.filter(r=>r.conditionStatus==='excluded').length,diagnostic:G.aggregate(r,'diagnostic'),matchedNonAnchor:G.aggregate(r,'matched'),independentValidation:G.aggregate(r,'validation')};
 })}));
 const pairwise=[];
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)for(const metric of ['level-speed','climb-rate']){
  const a=rows.filter(r=>r.aircraftId===ids[i]&&r.metric===metric),b=rows.filter(r=>r.aircraftId===ids[j]&&r.metric===metric),candidates=[];
  for(const x of a)for(const y of b)if(Number.isFinite(x.altFt)&&x.altFt===y.altFt)candidates.push(G.pair(x,y,{comparisonEstablished:ledger.crossAircraftComparisonEstablished}));
  pairwise.push({a:ids[i],b:ids[j],metric,status:'UNRESOLVED',candidates,reason:candidates.length?'No independent matched cases, common loading/rating policy and validated differential bounds established':'No common-altitude active observations for this metric; no interpolation invented'});
 }
 const ac=D.aircraft.p47b,fit=M.equivalentClimbDrag(ac,ac.observedClimb[0],baseOptions);
 const p47Conditional={status:'conditional-one-point-fit',fitAltitudeFt:15000,addedCd0:fit.addedCd0,warning:'Aggregate loss fitted to 15000-ft climb. Not independently measured cooling drag, instantaneous mass or prop efficiency. Excluded from matched/independent scores.',rows:ac.observedClimb.map((p,i)=>({altFt:p.altFt,role:i===0?'aggregate-loss-fit':'conditional-check',...G.errors(M.climbPrediction(ac,p,{...baseOptions,addedCd0:fit.addedCd0}).predictedFpm,p.fpm)}))};
 const controlledP47=[2000,2600].map(shaftHp=>({shaftHp,at200:M.gregP47PowerPoint(D.greg.p47d28,200,shaftHp),maxSpeedMph:M.gregP47MaxSpeed(D.greg.p47d28,shaftHp),role:'controlled-arithmetic-sensitivity; not historical P-47B performance'}));
 return {schema:1,scope:ledger.scope,policy:ledger.policy,defaultSolverChanged:false,rows,summary,pairwise,p47Conditional,controlledP47,uncertainty:ledger.uncertainty};
}
function writeReport(){
 const r=run(),root=path.resolve(__dirname,'../..'),fmt=x=>Number.isFinite(x)?x.toFixed(3):'unresolved';
 fs.writeFileSync(path.join(root,'validation/current/performance-validation.json'),JSON.stringify(r,null,2)+'\n');
 const lines=['# Four-aircraft speed and climb validation','', 'Generated by `npm run check`. Solver, weights and coefficients are unchanged. '+r.policy,'', '## Coverage and errors','', 'Diagnostic errors are predicted minus observed in the listed native units. They remain visible for excluded and fitted points; they are not a matched-condition accuracy score. No empty aggregate is reported as zero error.','', '| Target | Metric / unit | Records | Speed anchors | Excluded | Diagnostic MAE | Matched non-anchor count / MAE | Independent count / MAE |','|---|---|---:|---:|---:|---:|---|---|'];
 for(const a of r.summary)for(const m of a.metrics)lines.push(`| ${a.aircraftId} | ${m.metric} / ${m.unit} | ${m.records} | ${m.anchors} | ${m.excluded} | ${fmt(m.diagnostic.mae)} | ${m.matchedNonAnchor.count} / ${fmt(m.matchedNonAnchor.mae)} | ${m.independentValidation.count} / ${fmt(m.independentValidation.mae)} |`);
 lines.push('','The Bf 109 climb row is an explicit missing-evidence record. A secondary elapsed-climb-time citation is not a direct climb-rate observation. Exact Spitfire RPM matching rejects 2995 versus nominal 3000 RPM; this does not establish a material performance effect, only an unresolved input difference. No unverified tolerance or correction was introduced.','', '## Every checkpoint','', '| Record | Altitude ft | Role | Observed | Predicted | Signed error | Absolute error | Signed % | Conditions |','|---|---:|---|---:|---:|---:|---:|---:|---|');
 for(const x of r.rows)lines.push(`| ${x.id} | ${fmt(x.altFt)} | ${x.fitRole} | ${fmt(x.value)} | ${fmt(x.prediction.value)} | ${fmt(x.diagnosticErrors.signed)} | ${fmt(x.diagnosticErrors.absolute)} | ${fmt(x.diagnosticErrors.percent)} | ${x.conditionStatus} |`);
 lines.push('','Units follow the metric above. Machine-readable rows include source pointers, observed/model mass, airspeed basis, configuration, rating/RPM/gear, options and all exclusions. Figures at different weights, cooling states, ratings or unknown climb speeds do not enter matched accuracy aggregates.','', '## Exclusions and source limits','');
 for(const id of ids){const rows=r.rows.filter(x=>x.aircraftId===id),reasons=[...new Set(rows.flatMap(x=>x.exclusions))];lines.push('- **'+id+'**: '+reasons.join('; ')+'. '+ledger.aircraft[id].speed.note);}
 lines.push('','All checkpoints are legacy data already exposed during development. Non-anchor points are not newly independent holdouts. Both Mustang memos share a test-programme dependency group. Primary-report transcription is not original scan verification.','', '## Pairwise uncertainty','', '| Pair | Metric | Common-altitude candidates | 5:1 |','|---|---|---:|---|');
 for(const p of r.pairwise)lines.push(`| ${p.a} - ${p.b} | ${p.metric} | ${p.candidates.length} | ${p.status} |`);
 lines.push('','Required combined error bound is |observed A - observed B| / 5 in that metric and unit. A valid score also requires independently withheld matched-condition cases, a documented loading/rating comparison policy and validated individual upper bounds. Conservative pair bound sums those upper bounds; measured residuals cannot stand in for uncertainty. No correlated-error cancellation or missing bounds are assumed. Candidate details and reasons are in JSON.','', '## Preserved failures and controlled cases','', 'Mustang optimized climb residuals stay visible above; unknown observed TAS and instantaneous mass prevent matched scoring. The following P-47 aggregate-loss experiment is kept separate from historical validation.','', '| P-47 conditional climb altitude ft | Role | Signed ft/min |','|---:|---|---:|');
 for(const x of r.p47Conditional.rows)lines.push(`| ${x.altFt} | ${x.role} | ${fmt(x.signed)} |`);
 lines.push('','Fitted aggregate added CD0 = '+fmt(r.p47Conditional.addedCd0)+'. '+r.p47Conditional.warning,'', '| Controlled Greg case, shaft hp | Maximum mph | Required hp at 200 mph | Available hp at 200 mph |','|---:|---:|---:|---:|');
 for(const x of r.controlledP47)lines.push(`| ${x.shaftHp} | ${fmt(x.maxSpeedMph)} | ${fmt(x.at200.requiredHp)} | ${fmt(x.at200.availableHp)} |`);
 lines.push('','These are arithmetic sensitivities, not B-model ratings. Frozen tests and historical failures were not rewritten.','', 'See [source-condition ledger](../references/performance-evidence.json), [machine-readable results](../validation/current/performance-validation.json), [validation](CURRENT_VALIDATION.md), and [decisions](DECISIONS.md).','');
 fs.writeFileSync(path.join(root,'docs/PERFORMANCE_VALIDATION.md'),lines.join('\n'));return r;
}
if(require.main===module){const r=writeReport();console.log('Performance validation: '+r.rows.length+' records, '+r.pairwise.length+' unresolved aircraft/metric pairs.');}
module.exports={run,writeReport};
