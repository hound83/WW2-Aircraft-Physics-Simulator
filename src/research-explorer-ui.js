(function(){
 'use strict';
 const node=document.getElementById('historical-research-data');
 const panel=document.getElementById('historical-evidence');
 if(!node||!panel)return;
 const catalog=JSON.parse(node.textContent);
 const byId=new Map(catalog.sources.map(source=>[source.id,source]));
 const $=id=>document.getElementById(id);
 const selectors={aircraft:$('historical-aircraft'),quantity:$('historical-quantity'),basis:$('historical-basis')};
 let limit=40,visible=[];
 const clear=element=>element.replaceChildren();
 const textNode=(tag,text)=>{const element=document.createElement(tag);element.textContent=String(text);return element;};
 const option=(select,value,label)=>{const item=document.createElement('option');item.value=value;item.textContent=label;select.appendChild(item);};
 const numbers=values=>Object.entries(values).filter(([,value])=>typeof value==='number'&&Number.isFinite(value));
 const safeUrl=url=>typeof url==='string'&&/^https:\/\/[a-z0-9.-]+(?:[/?#]|$)/i.test(url)?url:null;
 const format=n=>Number.isInteger(n)?n.toLocaleString('en-US'):Number(n.toFixed(3)).toLocaleString('en-US');
 const description=record=>{
  const correction=record.correction||{};
  if(record.quantity!=='stall_speed')return record.speed_basis==='unestablished'?'Airspeed basis not established':record.speed_basis;
  const candidate=record.preferred_airspeed;
  if(candidate?.basis==='CAS*')return 'CAS* · documented correction table, within supported range · provisional';
  let basis=record.speed_basis;
  if(basis==='IAS'&&correction.instrument==='applied')basis='IAS corrected* · instrument error corrected';
  if(basis==='IAS'&&correction.position!=='applied')basis+=' · position correction NOT established';
  if(basis==='CAS')basis+=' · '+(correction.basis_evidence==='explicit-CAS'?'explicitly reported CAS':'position correction recorded');
  if(basis==='unestablished')basis+=' · DO NOT infer CAS';
  return basis;
 };
 const matches=record=>(selectors.aircraft.value==='all'||record.aircraft===selectors.aircraft.value)&&
  (selectors.quantity.value==='all'||record.quantity===selectors.quantity.value)&&
  (selectors.basis.value==='all'||(selectors.basis.value==='CAS*'||selectors.basis.value==='IAS corrected*'?record.preferred_airspeed?.basis===selectors.basis.value:record.speed_basis===selectors.basis.value));
 function render(){
  visible=catalog.observations.filter(matches);
  const uniqueFamilies=new Set(visible.map(x=>x.aircraft)).size;
  const tiers=catalog.summary.stall_quality_tiers||{};
  $('historical-summary').textContent=visible.length.toLocaleString('en-US')+' source rows · '+uniqueFamilies+' aircraft designations · '+catalog.sources.length+' original/indexed reports · '+catalog.source_packs.length+' versioned research packs. Stall evidence: '+(tiers['reported-CAS']||0)+' published CAS, '+(tiers['provisional-calibration-table-CAS']||0)+' derived CAS*, '+(tiers['provisional-instrument-corrected-IAS']||0)+' corrected IAS*. Source rows are not automatic model calibrations.';
  const ranges={};
  for(const item of visible)for(const [key,value]of numbers(item.values||{})){
   if(!ranges[key])ranges[key]={min:value,max:value,count:0};
   ranges[key].min=Math.min(ranges[key].min,value);
   ranges[key].max=Math.max(ranges[key].max,value);
   ranges[key].count++;
  }
  const rangeNames=Object.keys(ranges).sort((a,b)=>{
   const rank=x=>/^(?:alt_ft|alt_m|weight_lb|gross_weight_lb|normal_weight_lb|speed_mph|stall_ias_mph|tas_mph|cas_mph|ias_mph)$/.test(x)?0:1;
   return rank(a)-rank(b)||a.localeCompare(b);
  });
  $('historical-ranges').textContent=rangeNames.length?rangeNames.map(key=>key+': '+format(ranges[key].min)+'–'+format(ranges[key].max)+' (n='+ranges[key].count+')').join(' · '):'No numeric values for this selection';
  const tbody=$('historical-rows');clear(tbody);
  for(const item of visible.slice(0,limit)){
   const row=document.createElement('tr');
   const candidate=item.preferred_airspeed;
   const correctedCandidate=candidate&&candidate.basis==='CAS*'?'CAS* '+(candidate.speed_mph!==null?format(candidate.speed_mph):format(candidate.speed_min_mph)+'–'+format(candidate.speed_max_mph))+' mph · '+candidate.calibration_id:
    candidate?.basis==='IAS corrected*'?'Corrected IAS* '+(candidate.speed_mph!==null?format(candidate.speed_mph):format(candidate.speed_min_mph)+'–'+format(candidate.speed_max_mph))+' mph':null;
   for(const value of [item.aircraft,item.quantity,description(item),
    [correctedCandidate,numbers(item.values||{}).map(([key,num])=>key+' '+format(num)).join(' · ')].filter(Boolean).join(' | ')||'see report',
    [Object.entries(item.values||{}).filter(([,value])=>typeof value==='string').map(([key,value])=>key+' '+value).join(' · '),
     item.conditions,item.source_class,item.confidence,item.source_location,item.notes].filter(Boolean).join(' · ')||'Not recorded'])row.appendChild(textNode('td',value));
   const source=byId.get(item.source_id),cell=document.createElement('td');
   const link=safeUrl(source?.primary_url)||safeUrl(source?.catalog_url);
   if(link){const a=textNode('a',source.report||source.type||source.aircraft||item.source_id);a.href=link;a.target='_blank';a.rel='noopener noreferrer';cell.appendChild(a);}
   else cell.appendChild(textNode('span',source?.report||item.source_id));
   cell.appendChild(textNode('small',' · '+item.id));row.appendChild(cell);tbody.appendChild(row);
  }
  $('historical-more').hidden=visible.length<=limit;
  $('historical-more').textContent='Show more ('+Math.min(limit,visible.length).toLocaleString('en-US')+' / '+visible.length.toLocaleString('en-US')+')';
  window.UniversalResearchEvidence.selection={rows:visible.length,shown:Math.min(limit,visible.length),ranges};
 }
 option(selectors.aircraft,'all','All aircraft');
 for(const aircraft of [...new Set(catalog.observations.map(x=>x.aircraft))].sort())option(selectors.aircraft,aircraft,aircraft);
 option(selectors.quantity,'all','All measurement families');
 for(const quantity of Object.keys(catalog.summary.quantities).sort())option(selectors.quantity,quantity,quantity+' ('+catalog.summary.quantities[quantity]+')');
 const correctionRows=$('historical-correction-rows');
 for(const curve of catalog.calibration_curves||[]){
  const row=document.createElement('tr'),original=curve.original_rows||curve.rows,unit=curve.original_unit||curve.unit;
  for(const value of [curve.aircraft||curve.id,curve.mapping+' · '+(curve.transfer_scope||'source-matched only'),
   original.length?format(original[0][0])+'–'+format(original.at(-1)[0])+' '+unit+' · '+original.length+' reported/deduced anchors':'Original graphic indexed · numerical digitization not yet verified',
   curve.applies_to_source_ids.length+' eligible source IDs; '+(curve.applies_to_source_ids.length?'in-range/configuration still required':'no automatic transfer'),
   [curve.source_location,curve.instrument_error,curve.notes].filter(Boolean).join(' · ')])row.appendChild(textNode('td',value));
  const cell=document.createElement('td'),source=byId.get(curve.source_id),link=safeUrl(source?.primary_url)||safeUrl(source?.catalog_url);
  if(link){const a=textNode('a',source?.report||curve.source_id);a.href=link;a.target='_blank';a.rel='noopener noreferrer';cell.appendChild(a);}
  else cell.appendChild(textNode('span',source?.report||curve.source_id));
  row.appendChild(cell);correctionRows.appendChild(row);
 }
 $('historical-correction-count').textContent=(catalog.calibration_curves||[]).length+' original airspeed correction curves; unpaired curves remain research evidence until matching stall conditions are verified.';
 for(const selector of Object.values(selectors))selector.addEventListener('change',()=>{limit=40;render();});
 $('historical-more').addEventListener('click',()=>{limit+=80;render();});
 window.UniversalResearchEvidence={catalog,selection:null,rerender:render,
  // Read-only evidence: the numeric flight model accepts separately audited inputs.
  integration:'source-explorer-and-validation-candidates; no automatic physics recalibration'};
 render();
})();
