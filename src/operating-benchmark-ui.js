'use strict';
(()=>{
 const $=id=>document.getElementById(id),B=OperatingBenchmark,M=UniversalAirPhysics,T=UniversalTurnLift,L=JSON.parse($('turn-lift-source').textContent);
 const data=JSON.parse($('benchmark-operating-data').textContent),{models,specification:specs,service}=data;
 const fmt=(x,n=1)=>Number.isFinite(x)?x.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n}):'—';
 const Chart=OperatingBenchmarkChart,History=BenchmarkServiceContext,Evidence=BenchmarkGraphEvidence;
 const sides=['a','b'];
 const height=$('bench-altitude'),fromHeight=$('bench-climb-from'),toHeight=$('bench-climb-to');
 const altitudes=Array.from({length:9},(_,i)=>i*5000);
 const heightLabel=alt=>alt===0?'Sea level':fmt(alt,0)+' ft';
 for(const alt of altitudes){
  if(alt<40000)fromHeight.add(new Option(heightLabel(alt),alt));
  if(alt>0)toHeight.add(new Option(heightLabel(alt),alt));
 }
 toHeight.value='10000';
 const turnUnit=()=>Chart.turnUnits[$('bench-turn-unit').value];
 const api=globalThis.OperatingBenchmarkUI={data,settings:{},rows:{},altitudeRows:[],climbs:null,probe:null,probeLocked:false,probeLock:null};
 const speed=(value,kind)=>Chart.speed(value,$('bench-speed-unit').value,kind);
 const text=(tag,value,className)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(className)e.className=className;return e;};
 const shortName=id=>service.aircraft[id].displayName;
 let allAircraftChoice='spitfire_lfix_bs543';
 function aircraftOptions(select,ids,preferred){
  select.replaceChildren();
  for(const group of service.groups){
   const members=ids.filter(id=>service.aircraft[id].group===group.id);
   if(!members.length)continue;
   const options=document.createElement('optgroup');options.label=group.label;
   for(const id of members)options.append(new Option(shortName(id),id));
   select.append(options);
  }
  if(ids.includes(preferred))select.value=preferred;
 }
 const aircraftIds=Object.keys(models).sort((a,b)=>service.aircraft[a].years[0]-service.aircraft[b].years[0]||shortName(a).localeCompare(shortName(b)));
 aircraftOptions($('bench-aircraft-a'),aircraftIds,'p51b');
 function updateSecondAircraft(){
  const first=$('bench-aircraft-a').value,select=$('bench-aircraft-b'),filter=$('bench-aircraft-filter');
  const contemporaries=aircraftIds.filter(id=>id!==first&&History.overlap(service.aircraft[first],service.aircraft[id]));
  filter.options[1].disabled=!contemporaries.length;
  if(!contemporaries.length)filter.value='all';
  const all=filter.value==='all';
  aircraftOptions(select,all?aircraftIds:contemporaries,all?allAircraftChoice:select.value);
 }
 updateSecondAircraft();
 function read(side){const id=$('bench-aircraft-'+side).value,spec=specs.aircraft[id],input=$('bench-injection-'+side),combat=$('bench-power-'+side).value==='combat';
  const injection=B.fittedInjection(models[id],spec);
  input.hidden=!injection;input.disabled=!injection||!combat;if(input.disabled)input.checked=false;
  $('bench-injection-label-'+side).textContent=injection?(injection.type+(combat?'':' · Combat only')):'Injection unavailable';
  const cooling=$('bench-cooling-'+side);
  cooling.disabled=!(models[id].benchmarkCooling||models[id].climbCoolingAreaM2);
  if(cooling.disabled)cooling.value='clean';
  return {id,settings:{mode:combat?'combat':'normal',fuelFraction:Number($('bench-fuel-'+side).value),injection:input.checked,
   extension:$('bench-extension').checked,openCooling:cooling.value==='open'}};
 }
 function number(label,value,detail){const e=document.createElement('div');e.className='bench-number';e.append(text('span',label),text('strong',value),text('small',detail));return e;}
 function renderSide(side){
  const chosen=api.settings[side],spec=specs.aircraft[chosen.id],r=api.rows[side];
  const context=service.aircraft[chosen.id];
  $('bench-service-'+side).textContent=context.note??('c. '+History.yearLabel(context.years)+' · '+context.theatres.join(', '));
  $('bench-title-'+side).textContent='Aircraft '+(side==='a'?'1':'2')+' · '+fmt(r.altFt,0)+' ft';
  $('bench-setting-'+side).textContent=(chosen.settings.mode==='combat'?'COMBAT':'NORMAL')+' · '+fmt(chosen.settings.fuelFraction*100,0)+'% FUEL · '+(chosen.settings.injection?spec.injection.type.toUpperCase():'DRY');
  const result=$('bench-result-'+side),box=text('div',undefined,'bench-result-header');result.replaceChildren(box);
  box.append(text('p',r.phase.label+' · '+(r.phase.seconds?fmt(r.phase.seconds/60,1)+' min limit':'no timed limit in selected profile')));
  box.append(text('p',fmt(r.loading.weightLb,0)+' lb · '+fmt(r.loading.fuelUSGal,1)+' US gal internal · '+spec.armament,'bench-note'));
  box.append(text('p',spec.ratingEvidence??'Source-based settings; installed-power and load reconstruction remain model estimates.','bench-note'));
  if(r.status==='source-power-unavailable'){box.append(text('p','Power source does not cover this altitude. Enable labelled estimates to inspect a pressure-lapse scenario.','bench-warning'));return;}
  if(r.status!=='modelled')box.append(text('p','This model cannot sustain level flight at this load, power and altitude.','bench-warning'));
  if(r.sustained?.estimatedPower||r.level?.estimatedPower||r.climb?.estimatedPower)box.append(text('p','High-altitude power estimate beyond the last source node.','bench-warning'));
  if(r.climb?.cooling==='report-conditioned')box.append(text('p','Climb uses report-conditioned power and open-cooling losses.','bench-note'));
  if(chosen.settings.openCooling)box.append(text('p','Turn and level speed use the modeled climb cooling scenario.','bench-note'));
  const grid=document.createElement('div');grid.className='bench-numbers';
  const metric=turnUnit(),peak=r[metric.peak];
  grid.append(number(metric.key==='g'?'Peak sustained load':'Maximum sustained turn',fmt(peak?.[metric.field],metric.digits)+' '+metric.label,
   fmt(peak?.seconds360)+' s / 360° · '+speed(peak?.easMph,'EAS')),
   number('Sustained load / radius',fmt(r.sustained?.g,2)+' g',fmt(r.sustained?.radiusM,0)+' m radius at peak rate'),
   number('Best climb rate',fmt(r.climb?.climbFpm,0)+' ft/min','Vy '+speed(r.climb?.easMph,'EAS')+' / '+speed(r.climb?.tasMph,'TAS')),
   number('Maximum level speed',speed(r.level?.tasMph,'TAS'),speed(r.level?.easMph,'EAS')+' · steady equilibrium'),
   number('Minimum sustained radius',fmt(r.minSustainedRadius?.radiusM,0)+' m','At '+speed(r.minSustainedRadius?.easMph,'EAS')),
   number('Instantaneous turn scenario',fmt(r.instantaneous?.rateDegSec)+'°/s',fmt(r.instantaneous?.seconds360)+' s / 360° at '+speed(r.instantaneous?.easMph,'EAS')+' · 7 G cap · may lose energy'));
  result.append(grid,text('p','At the scheduled climb speed of '+speed(r.manualClimb?.iasMph,'IAS≈CAS')+', the climb rate is '+fmt(r.manualClimb?.climbFpm,0)+' ft/min.','bench-note'));
 }
 function plot(alt){
  const advantage=$('bench-advantage-plot'),readout=$('bench-advantage-readout'),limits=$('bench-turn-limits');
  advantage.replaceChildren();readout.replaceChildren();limits.replaceChildren();
  const names=Object.fromEntries(sides.map(side=>[side,shortName(api.settings[side].id)]));
  const colors=Evidence.colors(...sides.map(side=>service.aircraft[api.settings[side].id].country));
  const panel=$('operating-benchmark');
  for(const side of sides)panel.style.setProperty('--bench-'+side,colors[side]);
  $('bench-curve-names').replaceChildren(...sides.map((side,i)=>
   text('span',(i+1)+' · '+names[side],'bench-aircraft-key bench-'+side)));
  const series=sides.map(side=>{
   const row=api.rows[side],evidence=data.graphEvidence[api.settings[side].id];
   return {
    side,
    name:'Aircraft '+(side==='a'?'1':'2')+' · '+names[side],
    color:colors[side],evidence,turnPolicy:evidence.turnSensitivity?data.turnEvidence.sensitivity:null,
    range:row.turnRange,
    stallEasMph:row.stallEasMph,
    levelEasMph:row.level?.easMph??null,
    peakEasMph:row.sustained?.easMph,
    peakRate:row.sustained?.rateDegSec,
    peakLoad:row.sustainedLoad,
    climbFpm:row.climb?.climbFpm,
    vyEasMph:row.climb?.easMph,
    scanMaxEasMph:M.airspeeds(590,alt).eas
   };
  });
  const policy=series.every(a=>a.turnPolicy)?data.turnEvidence.sensitivity:null;
  $('bench-advantage-key').hidden=!policy;
  $('bench-solo-key').hidden=true;
  $('bench-plot-note').textContent=turnUnit().key==='g'?
   'Squares mark peak sustained G and best climb speed (Vy). The grey guide shows the load needed for 3°/s at each speed.':
   'Squares mark peak turn rate and best climb speed (Vy). The grey guide shows 3°/s.';
  const samples=new Map();
  function evaluateAt(side,eas,climbing){
   const key=side+':'+eas+':'+Boolean(climbing);
   if(!samples.has(key)){
    const chosen=api.settings[side],row=api.rows[side];
    samples.set(key,B.evaluate(M,T,L,models[chosen.id],specs.aircraft[chosen.id],chosen.settings,
     alt,eas,row.loading.weightLb,row.phase,climbing));
   }
   return samples.get(key);
  }
  Chart.render({
   chart:$('bench-turn-plot'),climbChart:$('bench-climb-plot'),slider:$('bench-probe-speed'),value:$('bench-probe-value'),
   results:$('bench-probe-results'),climbResults:$('bench-climb-at-speed'),
   rangeStatus:$('bench-range-status'),focus:$('bench-turn-focus').value==='3',
   unit:$('bench-speed-unit').value,turnUnit:turnUnit(),altFt:alt,series,
   selectedEasMph:api.probe?.easMph,
   lockButton:$('bench-probe-lock'),lockStatus:$('bench-probe-lock-status'),lock:api.probeLock,
   onLock(anchor){api.probeLock=anchor;api.probeLocked=Boolean(anchor);},
   evaluateAt,
   makeAdvantage(domain){
    return OperatingTurnComparison.advantage({...domain,host:advantage,readout,limits,names,colors,policy,
     soloKey:$('bench-solo-key'),turnUnit:turnUnit(),unit:$('bench-speed-unit').value});
   },
   onProbe(probe){api.probe=probe;}
  });
 }
 function renderSourceGrades(){
  const {cases,coverage,observations,sources,tolerances}=data.sourceGrades;
  const aircraftIds={p51b:'p51b_4324777',p47b:'p47b_415902',bf109f4:'bf109f4_representative',
   fw190a4:'fw190a4_783',p38g:'p38g_4212687',f4u4:'f4u4_80765'};
  const output=$('bench-source-grade-results'),panels=text('div',undefined,'bench-probe-cards');
  const value=new Intl.NumberFormat('en-US',{maximumFractionDigits:3});
  const range=bounds=>bounds?.map(n=>value.format(n)).join('–');
  for(const side of sides){
   const {id}=api.settings[side],specimen=aircraftIds[id]??id;
   const row=coverage.find(item=>item.id===specimen);
   const panel=text('article',undefined,'bench-probe-card');panel.dataset.side=side;
   panel.append(text('strong',shortName(id),'bench-probe-name'),
    text('p',row.gold_count+' GOLD · '+row.gold_qualified_count+' GOLD* of '+row.planned_count+' planned benchmarks','bench-note'));
   const reviewed=cases.filter(item=>item.aircraft===specimen);
   if(!reviewed.length)panel.append(text('p','No reviewed benchmark cases yet.','bench-note'));
   for(const item of reviewed){
    const details=text('details'),{agreement,preferred,unit}=item;
    const badge=item.gold_status==='gold'?'GOLD':item.gold_status==='gold-qualified'?'GOLD*':'Open';
    details.dataset.caseGrade=item.gold_status;
    details.append(text('summary',badge+' · '+item.conditions.specimen+' · '+item.metric.replaceAll('_',' ')),
     text('p',item.conditions.scope,'bench-note'));
    if(preferred)details.append(text('p','Preferred '+value.format(preferred.value)+' '+unit+' · '+preferred.grade+
     (preferred.range?' · source range '+range(preferred.range)+' '+unit:''),'bench-note'));
    const policy=tolerances[item.metric];
    const spread=agreement.spread===null?'Agreement unscored':'Central spread '+value.format(agreement.spread)+' '+unit+
     (agreement.percent===null?'':' ('+value.format(agreement.percent)+'%)');
    let limit='';
    if(agreement.limit_percent!==null)limit=' · limit '+value.format(agreement.limit_percent)+'%'+
     (agreement.spread===null?'':' ('+value.format(agreement.limit)+' '+unit+')');
    else if(agreement.limit!==null)limit=' · limit '+value.format(agreement.limit)+' '+unit+
     (unit===policy.unit?'':' ('+value.format(policy.spread)+' '+policy.unit+')');
    const center=agreement.spread===null?'':' · comparison mean '+value.format(agreement.center)+' '+unit;
    details.append(text('p',spread+limit+center+'. '+agreement.reason,'bench-note'));
    const list=text('ul',undefined,'bench-evidence-sources');
    for(const candidate of item.candidates){
     const valueLabel=Number.isFinite(candidate.value)?value.format(candidate.value):range(candidate.range);
     const sourceLinks=new Map();
     for(const obs of candidate.observation_ids){
      const record=observations[obs],source=sources[record?.source];
      if(source?.url&&/^https?:\/\//i.test(source.url))sourceLinks.set(source.url,source.name??record.source);
     }
     const original=candidate.original_reading;
     const li=text('li',valueLabel+' '+unit+' · '+candidate.grade+' · '+candidate.method.replaceAll('-',' ')+
      (original?' from '+value.format(original.value)+' '+original.unit:'')+
      (Number.isFinite(candidate.value)&&candidate.range?' · range '+range(candidate.range)+' '+unit:''));
     if(candidate.reason)li.append(text('small',candidate.reason));
     const links=text('div',undefined,'bench-probe-links');
     for(const [url,label] of sourceLinks){const link=text('a',label);link.href=url;link.target='_blank';link.rel='noopener';links.append(link);}
     if(links.childElementCount)li.append(links);
     list.append(li);
    }
    details.append(list);panel.append(details);
   }
   panels.append(panel);
  }
  output.replaceChildren(text('p','GOLD* marks agreement with a source or condition qualification. These grades apply to the original test cases listed below.','bench-note'),panels);
 }
 function sourceDetails(){
  const box=$('bench-sources');box.replaceChildren();
  for(const side of sides){
   const c=api.settings[side],sp=specs.aircraft[c.id],context=service.aircraft[c.id];
   box.append(text('h3',shortName(c.id)),text('p',sp.loadQualification),text('p',api.rows[side].powerQualification),text('p',sp.speedQualification));
   for(const id of sp.sources){
    const src=specs.sources[id],p=text('p'),a=text('a',src.title);a.href=src.url;a.target='_blank';a.rel='noopener';
    p.append(a,text('small',' · '+src.kind+' · '+src.facts));box.append(p);
   }
   if(context.source){
    const a=text('a','Service history');a.href=context.source;a.target='_blank';a.rel='noopener';
    const p=text('p');p.append(a);box.append(p);
   }
  }
 }
 const altitudeCache={};
 function readAltitudes(side,chosen){
  const key=JSON.stringify(chosen);
  if(altitudeCache[side]?.key!==key){
   const rows=altitudes.map(alt=>B.metrics(M,T,L,models[chosen.id],specs.aircraft[chosen.id],specs.policy,chosen.settings,alt));
   altitudeCache[side]={key,rows};
  }
  return altitudeCache[side].rows;
 }
 function makeTable(labels,className){
  const table=text('table',undefined,className),head=text('thead'),headers=text('tr'),body=text('tbody');
  for(const label of labels){const th=text('th',label);th.scope='col';headers.append(th);}
  head.append(headers);table.append(head,body);return {table,body};
 }
 function renderAltitudeOverview(alt){
  const turn=turnUnit();
  const {table,body}=makeTable(['Altitude','Peak sustained turn ('+turn.label+')','Best climb (ft/min)','Top level speed (TAS)'],'bench-altitude-table');
  const unit=$('bench-speed-unit').value;
  const speedFactor={mph:1,kph:1.609344,knots:1609.344/1852}[unit];
  function pair(a,b,format,delta,estimated){
   const cell=text('td');
   const values=sides.map((side,i)=>text('span',format([a,b][i])+(estimated[i]?'*':''),'bench-'+side));
   cell.append(values[0],document.createTextNode(' / '),values[1]);
   if(Number.isFinite(a)&&Number.isFinite(b))cell.append(text('small','Δ '+(a-b>0?'+':'')+delta(a-b),'bench-note'));
   return cell;
  }
  for(const {altFt,a,b} of api.altitudeRows){
   const tr=text('tr');tr.dataset.altitude=altFt;
   const label=heightLabel(altFt);
   const th=text('th');th.scope='row';
   const button=text('button',label);button.type='button';
   if(altFt===alt){tr.setAttribute('aria-selected','true');button.setAttribute('aria-current','true');}
   tr.addEventListener('click',()=>{
    height.value=altFt;renderAltitude();
    $('bench-altitude-overview').querySelector('button[aria-current="true"]').focus();
   });
   th.append(button);
   const positive=row=>row.climb?.climbFpm>0?row.climb.climbFpm:null;
   tr.append(th,
    pair(a[turn.peak]?.[turn.field],b[turn.peak]?.[turn.field],v=>fmt(v,turn.digits),v=>fmt(v,turn.digits),[a.sustained?.estimatedPower,b.sustained?.estimatedPower]),
    pair(positive(a),positive(b),v=>fmt(v,0),v=>fmt(v,0),[a.climb?.estimatedPower&&positive(a),b.climb?.estimatedPower&&positive(b)]),
    pair(a.level?.tasMph,b.level?.tasMph,v=>speed(v,'TAS'),v=>fmt(v*speedFactor,0),[a.level?.estimatedPower,b.level?.estimatedPower]));
   body.append(tr);
  }
  $('bench-altitude-overview').replaceChildren(table);
 }
 function renderFlightChecks(){
  const target=$('bench-flight-check-results');
  target.append(text('p','Mean absolute errors are in ft/min. The first two cases use points excluded from fitting. The third uses a separate report and airframe.','bench-note'));
  for(const check of data.flightChecks){
   const {count,beforeMae,afterMae,largestRegression}=check.checks;
   const source=text('a','Original flight report');
   source.href=check.url;source.target='_blank';source.rel='noopener';
   target.append(text('h4',check.name),
    text('p',fmt(beforeMae,0)+' → '+fmt(afterMae,0)+' ft/min mean error over '+count+' checks. Largest increase '+fmt(largestRegression,0)+' ft/min.'),
    text('p',check.condition,'bench-note'),source);
   const details=text('details'),summary=text('summary','Observed and modeled climb rates');
   const {table,body}=makeTable(['Altitude (ft)','Rating','Role','Observed','v4.2','v4.3']);
   const box=text('div',undefined,'bench-table-scroll');box.append(table);details.append(summary,box);
   for(const row of check.rows){
    const tr=text('tr');
    for(const value of [fmt(row.altFt,0),row.mode==='normal'?'Normal':'Combat',
     row.role==='fit'?'Fit':row.role==='transfer'?'Separate report':'Held out',fmt(row.observed,0),fmt(row.before,0),fmt(row.after,0)])tr.append(text('td',value));
    body.append(tr);
   }
   target.append(details);
  }
  const ceiling=data.spitfireCeiling;
  target.append(text('p','At 40,000 ft BS.543 recorded '+fmt(ceiling.observed,0)+' ft/min. The model’s high-altitude estimate is '+fmt(ceiling.predicted,0)+' ft/min at the reported speed and gross weight. This test used an extended Combat allowance.','bench-note'));
  const speedCheck=data.spitfireBestSpeedSensitivity;
  target.append(text('p','Spitfire sensitivity at each model’s own best climb speed. Mean error '+fmt(speedCheck.beforeMae,0)+' → '+fmt(speedCheck.afterMae,0)+' ft/min. Largest increase '+fmt(speedCheck.largestRegression,0)+' ft/min.','bench-note'));
 }
 function invalidateClimbs(message){
  api.climbs=null;
  $('bench-climb-result').textContent=message;
 }
 function renderAltitude(){
  const alt=Number(height.value),label=heightLabel(alt);
  height.setAttribute('aria-valuetext',label);
  $('bench-altitude-value').value=label;
  const current=api.altitudeRows.find(row=>row.altFt===alt);
  for(const side of sides){api.rows[side]=current[side];renderSide(side);}
  plot(alt);renderAltitudeOverview(alt);
  const turn=turnUnit(),a=api.rows.a[turn.peak]?.[turn.field],b=api.rows.b[turn.peak]?.[turn.field];
  $('bench-comparison').textContent=Number.isFinite(a)&&Number.isFinite(b)?'Modeled peak difference (aircraft 1 − aircraft 2): '+fmt(a-b,turn.digits)+' '+turn.label+'. Historical ranking uncertainty remains unresolved.':'A sustained-turn comparison is unavailable for one or both selected states.';
 }
 function render(){
  for(const side of sides){const chosen=read(side);api.settings[side]=chosen;readAltitudes(side,chosen);}
  api.altitudeRows=altitudes.map((altFt,i)=>({altFt,a:altitudeCache.a.rows[i],b:altitudeCache.b.rows[i]}));
  renderAltitude();sourceDetails();renderSourceGrades();
  $('bench-matchup').textContent=History.compare(service.aircraft[api.settings.a.id],service.aircraft[api.settings.b.id]);
  invalidateClimbs('Calculate both climbs for the current aircraft and settings.');
 }
 function changeHeight(){if(Number(height.value)!==api.rows.a?.altFt)renderAltitude();}
 height.addEventListener('input',changeHeight);
 height.addEventListener('change',changeHeight);
 for(const id of ['bench-extension',...sides.flatMap(s=>['power','fuel','injection','cooling'].map(k=>'bench-'+k+'-'+s))])$(id).addEventListener('change',render);
 for(const id of ['bench-aircraft-a','bench-aircraft-filter'])$(id).addEventListener('change',()=>{updateSecondAircraft();render();});
 $('bench-aircraft-b').addEventListener('change',()=>{
  if($('bench-aircraft-filter').value==='all')allAircraftChoice=$('bench-aircraft-b').value;
  render();
 });
 $('bench-turn-focus').addEventListener('change',()=>plot(Number(height.value)));
 $('bench-turn-unit').addEventListener('change',renderAltitude);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&api.probeLocked)$('bench-probe-lock').click();
 });
 $('bench-speed-unit').addEventListener('change',()=>{
  for(const side of ['a','b'])renderSide(side);
  const alt=Number($('bench-altitude').value);
  plot(alt);renderAltitudeOverview(alt);
 });
 for(const input of [fromHeight,toHeight])input.addEventListener('change',()=>invalidateClimbs('Climb altitude changed. Recalculate both climbs.'));
 $('bench-climb-calculate').addEventListener('click',()=>{const from=Number(fromHeight.value),to=Number(toHeight.value),box=$('bench-climb-result');box.replaceChildren();if(to<=from){box.append(text('p','Choose a target altitude above the climb start.'));return;}
  const results={};for(const side of ['a','b']){const c=api.settings[side];results[side]=B.climb(M,T,L,models[c.id],specs.aircraft[c.id],specs.policy,c.settings,from,to);const r=results[side];
   box.append(text('h3','Aircraft '+(side==='a'?'1':'2')+' · '+shortName(c.id)),text('p',r.status==='reached'?heightLabel(from)+' to '+heightLabel(to)+': '+fmt(r.seconds/60,2)+' min':'Target not reached: '+r.status+' at '+fmt(r.reachedFt,0)+' ft'),text('p','Combat used '+fmt(r.combatSeconds/60,2)+' min · remaining '+fmt(r.combatRemainingSeconds/60,2)+' min · fuel used '+fmt(r.fuelUsedLb,1)+' lb · arrival mass '+fmt(r.endWeightLb,0)+' lb · injection fluid remaining '+fmt(r.injectionRemainingLb,1)+' lb'));
   for(const p of r.schedule)box.append(text('p',p.label+': '+fmt(p.fromFt,0)+' → '+fmt(p.toFt,0)+' ft · '+fmt(p.seconds/60,2)+' min','bench-note'));
   box.append(text('p',r.policy,'bench-note'));
  }api.climbs=results;
 });
 render();
 renderFlightChecks();
 OperatingTurnComparison.evidence($('bench-turn-evidence'),data.turnEvidence,data.turnLiftChecks,
  data.turnEvidence.sensitivity,data.turnEvidence.directTurns);
})();
