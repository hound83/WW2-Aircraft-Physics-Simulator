'use strict';

// A source-preserving evidence registry. It is deliberately independent of the
// calibrated physics model: finding a source never silently changes an aircraft.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {validateCurve,applyCorrections}=require('./research-speed-corrections.cjs');
const root=path.resolve(__dirname,'..');
const SCHEMA='ww2-fighter-research-catalog/v1';
const PACK_SCHEMA='ww2-fighter-evidence-pack/v1';
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');

function safeUrl(value){return typeof value==='string'&&/^https:\/\/[a-z0-9.-]+(?:[/?#]|$)/i.test(value)?value:null;}
function checkNumber(n,context){
 if(typeof n!=='number'||!Number.isFinite(n))throw Error(context+': expected a finite number');
 // The research archive does not impose an arbitrary fighter-era speed, mass,
 // or altitude ceiling; simulator applicability is assessed separately.
 return n;
}
function parseJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function speedBasis(series){
 const basis=String(series.speed_basis||series.unit||'');
 if(/(?:^|[_ ])CAS(?:$|[_ ])/i.test(basis)||/calibrated airspeed/i.test(basis))return 'CAS';
 if(/(?:^|[_ ])IAS(?:$|[_ ])/i.test(basis)||/indicated airspeed/i.test(basis))return 'IAS';
 if(/(?:^|[_ ])EAS(?:$|[_ ])/i.test(basis))return 'EAS';
 if(/(?:^|[_ ])TAS(?:$|[_ ])/i.test(basis))return 'TAS';
 return 'unestablished';
}
function buildCatalog(options={}){
 const base=options.root||root;
 const sourcePacks=[],observations=[],sources=[],calibrationCurves=[],documentLineage=[],calibrationReviews=[],sourceKeys=new Set(),observationKeys=new Set();
 const addSource=(record,packId,foreignId)=>{
  const id=packId+':'+foreignId;
  if(sourceKeys.has(id))throw Error('Duplicate research source: '+id);
  sourceKeys.add(id);
  const result={...record,id,source_id:foreignId,pack_id:packId,primary_url:safeUrl(record.pdf)||safeUrl(record.source)||null,
   catalog_url:safeUrl(record.catalog)||safeUrl(record.transcription)||null};
  sources.push(result);
 };
 const addObservation=(record,packId)=>{
  const id=packId+':'+record.id;
  if(observationKeys.has(id))throw Error('Duplicate research observation: '+id);
  observationKeys.add(id);
  if(!sourceKeys.has(record.source_id))throw Error('Unresolved research source '+record.source_id+' for '+id);
  for(const [key,value]of Object.entries(record.values||{}))if(typeof value==='number')checkNumber(value,id+' '+key);
  if(record.quantity==='stall_speed'){
   const basis=record.speed_basis;
   if(!['CAS','IAS','EAS','TAS','unestablished'].includes(basis))throw Error('Invalid stall speed basis: '+id);
   if(basis==='CAS'&&record.correction?.position!=='applied'&&record.correction?.basis_evidence!=='explicit-CAS')throw Error('CAS claim lacks position-correction or explicitly documented CAS: '+id);
   const lo=record.values?.speed_min_mph??record.values?.low_mph;
   const hi=record.values?.speed_max_mph??record.values?.high_mph;
   if(!Number.isFinite(record.values?.speed_mph)&&!(Number.isFinite(lo)&&Number.isFinite(hi)&&lo<=hi))throw Error('Missing stall speed or bounded range: '+id);
  }
  observations.push({...record,id,pack_id:packId});
 };
 const imports=[
  ['archival-2026-11-10','references/ww2_fighter_archival_reports_2026-11-10.json','references/ww2_fighter_archival_numeric_series_2026-11-10.json'],
  ['balanced-2026-11-10','references/ww2_fighter_balanced_reports_2026-11-10.json','references/ww2_fighter_balanced_observations_2026-11-10.json']
 ];
 for(const [packId,reportsFile,seriesFile]of imports){
  const reportContent=fs.readFileSync(path.join(base,reportsFile));
  const seriesContent=fs.readFileSync(path.join(base,seriesFile));
  const reports=JSON.parse(reportContent),data=JSON.parse(seriesContent);
  sourcePacks.push({id:packId,kind:'legacy-series-adapter',version:'1.0.0',files:[reportsFile,seriesFile],sha256:[sha256(reportContent),sha256(seriesContent)]});
  for(const report of reports.reports)addSource(report,packId,report.id);
  for(const series of data.series){
   const prefix=packId+':'+series.id;
   const columns=series.columns;
   if(!Array.isArray(columns)||new Set(columns).size!==columns.length)throw Error('Bad columns in '+prefix);
   for(const [i,row]of series.rows.entries()){
    if(!Array.isArray(row)||row.length!==columns.length)throw Error('Column/row mismatch at '+prefix+':'+i);
    const values={};for(let j=0;j<columns.length;j++){const v=row[j];if(typeof v==='number')checkNumber(v,prefix+':'+i);values[columns[j]]=v;}
    if(series.quantity==='stall_speed'){
     const key=['stall_speed','stall_ias_mph','stall_cas_mph','stall_eas_mph','speed_mph'].find(k=>typeof values[k]==='number');
     if(key)values.speed_mph=values[key];
    }
    addObservation({id:series.id+':'+String(i+1).padStart(4,'0'),source_id:packId+':'+series.report_id,
     aircraft:series.aircraft,quantity:series.quantity,source_location:series.source_location||null,
     values,columns,unit:series.unit||null,speed_basis:speedBasis(series),
     conditions:series.conditions||series.condition||null,source_class:'original-report-table',
     correction:{instrument:'unestablished',position:'unestablished'},
     status:'source-observation—not-an-automatic-physics-fit'},packId);
   }
  }
 }
 const folder=path.join(base,'references/research');
 if(fs.existsSync(folder))for(const name of fs.readdirSync(folder).filter(x=>x.endsWith('.json')).sort()){
  const relative='references/research/'+name,content=fs.readFileSync(path.join(folder,name));
  const pack=JSON.parse(content);
  const packId=path.basename(name,'.json');
  sourcePacks.push({id:packId,kind:'independent-research-pack',version:pack.pack_version||pack.revision||'1.0.0',original_schema:pack.schema,files:[relative],sha256:[sha256(content)]});
  if(pack.schema===PACK_SCHEMA){
   if(!/^\d+\.\d+\.\d+$/.test(pack.pack_version||''))throw Error(relative+': missing semantic pack_version');
   if(!Array.isArray(pack.sources)||(!Array.isArray(pack.observations)&&!Array.isArray(pack.series)&&!Array.isArray(pack.calibration_curves)))throw Error(relative+': sources and observations, compact series or calibration curves must be arrays');
   for(const record of pack.sources){if(!record.id)throw Error(relative+': source without id');addSource({...record,source:record.url||record.source,report:record.work||record.report},packId,record.id);}
   for(const curve of pack.calibration_curves||[]){
    if(!curve.id||!curve.source_id)throw Error('Calibration without source/id: '+relative);
    calibrationCurves.push({...curve,id:packId+':'+curve.id,source_id:packId+':'+curve.source_id,
     applies_to_source_ids:(curve.applies_to_source_ids||[]).map(id=>id.includes(':')?id:packId+':'+id)});
   }
   for(const lineage of pack.document_lineage||[]){
    if(!lineage.id||!Array.isArray(lineage.members)||lineage.members.length===0||!lineage.relationship)throw Error('Incomplete source lineage: '+relative);
    documentLineage.push({...lineage,id:packId+':'+lineage.id,pack_id:packId,
     members:lineage.members.map(id=>id.includes(':')?id:packId+':'+id)});
   }
   for(const review of pack.calibration_reviews||[]){
    if(!review.id||!review.status||(!review.source_id&&!review.original_other_source))throw Error('Incomplete chart review: '+relative);
    calibrationReviews.push({...review,id:packId+':'+review.id,pack_id:packId,
     source_id:review.source_id?(review.source_id.includes(':')?review.source_id:packId+':'+review.source_id):null,
     original_other_source:review.original_other_source?(review.original_other_source.includes(':')?review.original_other_source:packId+':'+review.original_other_source):null});
   }
   const entries=pack.observations?.length?pack.observations:(!Array.isArray(pack.series)?[]:pack.series.flatMap(series=>{
    if(!Array.isArray(series.columns)||!Array.isArray(series.rows))throw Error(relative+': compact series without columns/rows');
    return series.rows.map((row,i)=>{
     if(row.length!==series.columns.length)throw Error(relative+': compact series row width mismatch: '+series.id);
     const value=Object.fromEntries(series.columns.map((column,j)=>[column,row[j]]));
     if(series.quantity==='stall_speed'&&value.speed_mph===undefined){
      value.speed_mph=value.stall_speed??value.stall_ias_mph??value.stall_cas_mph??value.minimum_speed;
     }
     return {id:series.id+':'+String(i+1).padStart(4,'0'),source_id:series.source_id,aircraft:series.aircraft,quantity:series.quantity,
      value,speed_basis:series.speed_basis||'unestablished',corrections:series.corrections||{},source_location:series.source_location,
      source_class:series.source_class,conditions:series.conditions,notes:series.notes};
    });
   }));
   for(const record of entries){
    if(!record.id||!record.source_id)throw Error(relative+': observation without id/source_id');
    if(!record.quantity||!record.aircraft)throw Error(relative+': observation without quantity/aircraft');
    const values=record.values||record.value;
    const rawBasis=record.speed_basis||values?.speed_basis||'unestablished';
    const basis=rawBasis==='unknown'?'unestablished':rawBasis;
    const correction=record.correction||record.corrections||{};
    addObservation({...record,source_id:packId+':'+record.source_id,values,speed_basis:basis,correction,
     source_class:record.source_class||'research-pack',status:record.status||'source-observation—not-an-automatic-physics-fit'},packId);
   }
  }else if(pack.schema==='ww2-us-stall-archive/v1'){
   if(!pack.sources||!Array.isArray(pack.series))throw Error(relative+': incomplete US stall pack');
   for(const [id,record]of Object.entries(pack.sources))addSource({...record,source:record.url},packId,id);
   for(const series of pack.series){
    if(!Array.isArray(series.columns))throw Error(relative+': missing source columns '+series.id);
    for(const [i,row]of series.rows.entries()){
     if(row.length!==series.columns.length)throw Error('Stall series width mismatch '+series.id);
     const values=Object.fromEntries(series.columns.map((key,j)=>[key,row[j]]));
     const raw=values.stall_speed??values.minimum_speed??values.reported_speed;
     if(!Number.isFinite(raw))throw Error('Missing US stall speed '+series.id+':'+i);
     // Keep the source literal and unit. All *_mph fields use statute miles/hour.
     const sourceUnit=series.speed_unit||'mph';
     if(!['mph','knots'].includes(sourceUnit))throw Error('Unsupported US stall unit: '+sourceUnit);
     values.speed_mph=sourceUnit==='knots'?raw*1852/1609.344:raw;
     if(values.exact_stall_weight_lb!==undefined)values.weight_lb=values.exact_stall_weight_lb;
     else if(values.approx_stall_weight_lb!==undefined)values.weight_lb=values.approx_stall_weight_lb;
     const basis=series.basis.startsWith('IAS')||series.basis==='manual_IAS'?'IAS':series.basis==='CAS_explicit'?'CAS':'unestablished';
     const instrument=series.basis==='IAS_instrument_corrected'?'applied':series.basis==='IAS_raw'?'not-applied':'unestablished';
     addObservation({id:series.id+':'+String(i+1).padStart(4,'0'),source_id:packId+':'+series.source,aircraft:pack.sources[series.source]?.aircraft||series.aircraft,
      quantity:'stall_speed',values,unit:series.speed_unit||'mph',speed_basis:basis,
      correction:{instrument,position:'not-established',...(basis==='CAS'?{basis_evidence:'explicit-CAS'}:{})},
      source_class:pack.sources[series.source]?.type||'report',conditions:series.weight_context||null,
      source_location:pack.sources[series.source]?.location||null,
      status:'source-observation—not-an-automatic-physics-fit',notes:series.warning||series.note||null},packId);
    }
   }
  }else if(pack.schema==='ww2-fighter-stall-global-evidence/v1'){
   if(!Array.isArray(pack.sources)||!Array.isArray(pack.series)||!Array.isArray(pack.row_columns))throw Error(relative+': incomplete international stall pack');
   for(const record of pack.sources)addSource({...record,report:record.work||record.report,source:record.url},packId,record.id);
   for(const series of pack.series){
    for(const [i,row]of series.rows.entries()){
     if(row.length!==pack.row_columns.length)throw Error('Stall series width mismatch '+series.id);
     const values=Object.fromEntries(pack.row_columns.map((key,j)=>[key,row[j]]));
     const basis=values.basis==='IAS'?'IAS':values.basis==='CAS'?'CAS':values.basis==='EAS'?'EAS':values.basis==='TAS'?'TAS':'unestablished';
     if(values.low_mph===values.high_mph)values.speed_mph=values.low_mph;
     addObservation({id:series.id+':'+String(i+1).padStart(4,'0'),source_id:packId+':'+series.source_id,aircraft:series.aircraft,
      quantity:'stall_speed',values,unit:'mph',speed_basis:basis,
      correction:{instrument:'unestablished',position:'not-established',...(basis==='CAS'?{basis_evidence:'explicit-CAS'}:{})},
      source_class:series.evidence||'report',conditions:[series.variant,series.weight_basis,series.altitude_basis].filter(Boolean).join(' · '),
      source_location:pack.sources.find(s=>s.id===series.source_id)?.locator||null,
      status:'source-observation—not-an-automatic-physics-fit',notes:[series.note,series.pec].filter(Boolean).join(' · ')},packId);
    }
   }
  }else throw Error(relative+': unsupported schema '+pack.schema);
 }
 observations.sort((a,b)=>a.id.localeCompare(b.id));sources.sort((a,b)=>a.id.localeCompare(b.id));
 for(const curve of calibrationCurves)validateCurve(curve,sourceKeys);
 const lineageIds=new Set();
 for(const lineage of documentLineage){
  if(lineageIds.has(lineage.id))throw Error('Duplicate document lineage '+lineage.id);
  lineageIds.add(lineage.id);
  if(new Set(lineage.members).size!==lineage.members.length)throw Error('Repeated lineage member '+lineage.id);
  for(const id of lineage.members)if(!sourceKeys.has(id))throw Error('Unresolved document lineage source '+id);
 }
 for(const review of calibrationReviews){
  const id=review.source_id||review.original_other_source;
  if(!sourceKeys.has(id))throw Error('Unresolved reviewed calibration source '+id);
 }
 for(const record of observations)if(record.quantity==='stall_speed')record.preferred_airspeed=applyCorrections(record,calibrationCurves);
 const metrics={},aircraft=new Set(),quantities={};
 for(const record of observations){
  aircraft.add(record.aircraft);quantities[record.quantity]=(quantities[record.quantity]||0)+1;
  for(const [field,value]of Object.entries(record.values||{}))if(typeof value==='number'){
   if(!metrics[field])metrics[field]={min:value,max:value,n:0};
   metrics[field].min=Math.min(metrics[field].min,value);metrics[field].max=Math.max(metrics[field].max,value);metrics[field].n++;
  }
 }
 const stallTier={};for(const row of observations.filter(x=>x.quantity==='stall_speed')){
  const tier=row.preferred_airspeed?.status||'missing';stallTier[tier]=(stallTier[tier]||0)+1;
 }
 const manifest={schema:SCHEMA,schema_version:'1.0.0',version:options.version||require(path.join(base,'package.json')).version,
  source_packs:sourcePacks,summary:{source_count:sources.length,series_count:imports.reduce((n,[, ,f])=>n+parseJson(path.join(base,f)).series.length,0),
   observation_count:observations.length,stall_count:observations.filter(x=>x.quantity==='stall_speed').length,
   stall_quality_tiers:stallTier,airframe_labels:aircraft.size,quantities,metrics,
   lineage_groups:documentLineage.length,calibration_reviews:calibrationReviews.length},
  sources,observations,calibration_curves:calibrationCurves,document_lineage:documentLineage,calibration_reviews:calibrationReviews};
 manifest.fingerprint=sha256(JSON.stringify(manifest));
 return manifest;
}

if(require.main===module){const catalog=buildCatalog();console.log(JSON.stringify({schema:catalog.schema,version:catalog.version,fingerprint:catalog.fingerprint,summary:catalog.summary,source_packs:catalog.source_packs},null,2));}
module.exports={buildCatalog,SCHEMA,PACK_SCHEMA,speedBasis};
