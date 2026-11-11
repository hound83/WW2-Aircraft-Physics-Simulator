'use strict';
(()=>{
 const $=id=>document.getElementById(id),B=OperatingBenchmark,M=UniversalAirPhysics,T=UniversalTurnLift,L=JSON.parse($('turn-lift-source').textContent);
 const data=JSON.parse($('benchmark-operating-data').textContent),{models,specification:specs,service}=data;
 const fmt=(x,n=1)=>Number.isFinite(x)?x.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n}):'—';
 const Chart=OperatingBenchmarkChart,History=BenchmarkServiceContext;
 const sides=['a','b'];
 const api=globalThis.OperatingBenchmarkUI={data,settings:{},rows:{},altitudeRows:[],climbs:null,probe:null};
 const speed=(value,kind)=>Chart.speed(value,$('bench-speed-unit').value,kind);
 const text=(tag,value,className)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(className)e.className=className;return e;};
 const shortName=id=>models[id].ac.name.split(' / ')[0];
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
  input.disabled=!spec.injection||!combat;if(input.disabled)input.checked=false;
  $('bench-injection-label-'+side).textContent=spec.injection?(spec.injection.type+(combat?'':' · Combat only')):'Injection not fitted';
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
  const box=$('bench-result-'+side);box.replaceChildren();
  box.append(text('p',r.phase.label+' · '+(r.phase.seconds?fmt(r.phase.seconds/60,1)+' min limit':'no timed limit in selected profile')));
  box.append(text('p',fmt(r.loading.weightLb,0)+' lb · '+fmt(r.loading.fuelUSGal,1)+' US gal internal · '+spec.armament,'bench-note'));
  box.append(text('p',spec.ratingEvidence??'Source-based settings; installed-power and load reconstruction remain model estimates.','bench-note'));
  if(r.status==='source-power-unavailable'){box.append(text('p','Power source does not cover this altitude. Enable labelled estimates to inspect a pressure-lapse scenario.','bench-warning'));return;}
  if(r.status!=='modelled')box.append(text('p','This model cannot sustain level flight at this load, power and altitude.','bench-warning'));
  if(r.sustained?.estimatedPower||r.level?.estimatedPower||r.climb?.estimatedPower)box.append(text('p','High-altitude power estimate beyond the last source node.','bench-warning'));
  if(r.climb?.cooling==='report-conditioned')box.append(text('p','Climb uses report-conditioned power and open-cooling losses.','bench-note'));
  if(chosen.settings.openCooling)box.append(text('p','Turn and level speed use the modeled climb cooling scenario.','bench-note'));
  const grid=document.createElement('div');grid.className='bench-numbers';
  grid.append(number('Maximum sustained turn',fmt(r.sustained?.rateDegSec)+'°/s',fmt(r.sustained?.seconds360)+' s / 360° · '+speed(r.sustained?.easMph,'EAS')),
   number('Sustained load / radius',fmt(r.sustained?.g,2)+' g',fmt(r.sustained?.radiusM,0)+' m radius at peak rate'),
   number('Best climb rate',fmt(r.climb?.climbFpm,0)+' ft/min','Vy '+speed(r.climb?.easMph,'EAS')+' / '+speed(r.climb?.tasMph,'TAS')),
   number('Maximum level speed',speed(r.level?.tasMph,'TAS'),speed(r.level?.easMph,'EAS')+' · steady equilibrium'),
   number('Minimum sustained radius',fmt(r.minSustainedRadius?.radiusM,0)+' m','At '+speed(r.minSustainedRadius?.easMph,'EAS')),
   number('Instantaneous turn scenario',fmt(r.instantaneous?.rateDegSec)+'°/s',fmt(r.instantaneous?.seconds360)+' s / 360° at '+speed(r.instantaneous?.easMph,'EAS')+' · 7 G cap · may lose energy'));
  box.append(grid,text('p','At the scheduled climb speed of '+speed(r.manualClimb?.iasMph,'IAS≈CAS')+', the climb rate is '+fmt(r.manualClimb?.climbFpm,0)+' ft/min.','bench-note'));
 }
 function plot(alt){
  const series=['a','b'].map(side=>{
   const row=api.rows[side],model=models[api.settings[side].id];
   return {
    side,
    name:'Aircraft '+(side==='a'?'1':'2')+' · '+model.ac.name.split(' / ')[0],
    range:row.turnRange,
    stallEasMph:row.stallEasMph,
    levelEasMph:row.level?.easMph??null,
    peakEasMph:row.sustained?.easMph,
    peakRate:row.sustained?.rateDegSec,
    climbFpm:row.climb?.climbFpm,
    vyEasMph:row.climb?.easMph,
    scanMaxEasMph:M.airspeeds(590,alt).eas
   };
  });
  Chart.render({
   chart:$('bench-turn-plot'),climbChart:$('bench-climb-plot'),slider:$('bench-probe-speed'),value:$('bench-probe-value'),
   results:$('bench-probe-results'),unit:$('bench-speed-unit').value,altFt:alt,series,
   selectedEasMph:api.probe?.easMph,
   evaluateAt(side,eas,climbing){
    const chosen=api.settings[side],row=api.rows[side];
    return B.evaluate(M,T,L,models[chosen.id],specs.aircraft[chosen.id],chosen.settings,
     alt,eas,row.loading.weightLb,row.phase,climbing);
   },
   onProbe(probe){api.probe=probe;}
  });
 }
 function sourceDetails(){
  const box=$('bench-sources');box.replaceChildren();
  for(const side of sides){
   const c=api.settings[side],sp=specs.aircraft[c.id],context=service.aircraft[c.id];
   box.append(text('h3',models[c.id].ac.name),text('p',sp.loadQualification),text('p',api.rows[side].powerQualification),text('p',sp.speedQualification));
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
   const rows=specs.altitudesFt.map(alt=>B.metrics(M,T,L,models[chosen.id],specs.aircraft[chosen.id],specs.policy,chosen.settings,alt));
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
  const {table,body}=makeTable(['Altitude','Peak sustained turn (°/s)','Best climb (ft/min)','Top level speed (TAS)'],'bench-altitude-table');
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
   const label=altFt===0?'Sea level':fmt(altFt,0)+' ft';
   const th=text('th');th.scope='row';
   const button=text('button',label);button.type='button';
   if(altFt===alt){tr.setAttribute('aria-selected','true');button.setAttribute('aria-current','true');}
   tr.addEventListener('click',()=>{
    $('bench-altitude').value=altFt;render();
    $('bench-altitude-overview').querySelector('button[aria-current="true"]').focus();
   });
   th.append(button);
   const positive=row=>row.climb?.climbFpm>0?row.climb.climbFpm:null;
   tr.append(th,
    pair(a.sustained?.rateDegSec,b.sustained?.rateDegSec,fmt,fmt,[a.sustained?.estimatedPower,b.sustained?.estimatedPower]),
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
  const speedCheck=data.spitfireBestSpeedSensitivity;
  target.append(text('p','Spitfire sensitivity at each model’s own best climb speed. Mean error '+fmt(speedCheck.beforeMae,0)+' → '+fmt(speedCheck.afterMae,0)+' ft/min. Largest increase '+fmt(speedCheck.largestRegression,0)+' ft/min.','bench-note'));
 }
 function render(){
  const alt=Number($('bench-altitude').value);
  for(const side of sides){
   const chosen=read(side);api.settings[side]=chosen;readAltitudes(side,chosen);
  }
  api.altitudeRows=specs.altitudesFt.map((altFt,i)=>({altFt,a:altitudeCache.a.rows[i],b:altitudeCache.b.rows[i]}));
  const current=api.altitudeRows.find(row=>row.altFt===alt);
  for(const side of sides){api.rows[side]=current[side];renderSide(side);}
  plot(alt);renderAltitudeOverview(alt);sourceDetails();api.climbs=null;
  $('bench-matchup').textContent=History.compare(service.aircraft[api.settings.a.id],service.aircraft[api.settings.b.id]);$('bench-climb-result').replaceChildren(text('p','Settings updated. Calculate both climbs for the current choices.'));
  const a=api.rows.a.sustained?.rateDegSec,b=api.rows.b.sustained?.rateDegSec;
  $('bench-comparison').textContent=Number.isFinite(a)&&Number.isFinite(b)?'Modeled sustained-turn difference (aircraft 1 − aircraft 2): '+fmt(a-b,2)+'°/s. Historical ranking uncertainty remains unresolved.':'A sustained-turn comparison is unavailable for one or both selected states.';
 }
 for(const id of ['bench-altitude','bench-extension',...sides.flatMap(s=>['power','fuel','injection','cooling'].map(k=>'bench-'+k+'-'+s))])$(id).addEventListener('change',render);
 for(const id of ['bench-aircraft-a','bench-aircraft-filter'])$(id).addEventListener('change',()=>{updateSecondAircraft();render();});
 $('bench-aircraft-b').addEventListener('change',()=>{
  if($('bench-aircraft-filter').value==='all')allAircraftChoice=$('bench-aircraft-b').value;
  render();
 });
 $('bench-speed-unit').addEventListener('change',()=>{
  for(const side of ['a','b'])renderSide(side);
  const alt=Number($('bench-altitude').value);
  plot(alt);renderAltitudeOverview(alt);
 });
 $('bench-climb-from').addEventListener('change',()=>{api.climbs=null;$('bench-climb-result').textContent='Start altitude changed. Recalculate both climbs.';});
 $('bench-climb-calculate').addEventListener('click',()=>{const from=Number($('bench-climb-from').value),to=Number($('bench-altitude').value),box=$('bench-climb-result');box.replaceChildren();if(to<=from){box.append(text('p','Choose a target altitude above the climb start.'));return;}
  const results={};for(const side of ['a','b']){const c=api.settings[side];results[side]=B.climb(M,T,L,models[c.id],specs.aircraft[c.id],specs.policy,c.settings,from,to);const r=results[side];
   box.append(text('h3','Aircraft '+(side==='a'?'1':'2')+' · '+models[c.id].ac.name),text('p',r.status==='reached'?'Time to '+fmt(to,0)+' ft: '+fmt(r.seconds/60,2)+' min':'Target not reached: '+r.status+' at '+fmt(r.reachedFt,0)+' ft'),text('p','Combat used '+fmt(r.combatSeconds/60,2)+' min · remaining '+fmt(r.combatRemainingSeconds/60,2)+' min · fuel used '+fmt(r.fuelUsedLb,1)+' lb · arrival mass '+fmt(r.endWeightLb,0)+' lb · injection fluid remaining '+fmt(r.injectionRemainingLb,1)+' lb'));
   for(const p of r.schedule)box.append(text('p',p.label+': '+fmt(p.fromFt,0)+' → '+fmt(p.toFt,0)+' ft · '+fmt(p.seconds/60,2)+' min','bench-note'));
   box.append(text('p',r.policy,'bench-note'));
  }api.climbs=results;
 });
 render();
 renderFlightChecks();
})();
