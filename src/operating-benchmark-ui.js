'use strict';
(()=>{
 const $=id=>document.getElementById(id),B=OperatingBenchmark,M=UniversalAirPhysics,T=UniversalTurnLift,L=JSON.parse($('turn-lift-source').textContent);
 const data=JSON.parse($('benchmark-operating-data').textContent),{models,specification:specs,service}=data;
 const fmt=(x,n=1)=>Number.isFinite(x)?x.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n}):'—';
 const Chart=OperatingBenchmarkChart,History=BenchmarkServiceContext,Evidence=BenchmarkGraphEvidence;
 const sides=['a','b'];
 const Match=BenchmarkMatchup,tolerances=data.sourceGrades.tolerances;
 const height=$('bench-altitude'),fromHeight=$('bench-climb-from'),toHeight=$('bench-climb-to');
 const altitudeControls=[...document.querySelectorAll('[data-bench-altitude]')];
 const altitudeReadouts=[...document.querySelectorAll('[data-bench-altitude-value]')];
 const altitudes=Array.from({length:9},(_,i)=>i*5000);
 const heightLabel=alt=>alt===0?'Sea level':fmt(alt,0)+' ft';
 for(const alt of altitudes){
  if(alt<40000)fromHeight.add(new Option(heightLabel(alt),alt));
  if(alt>0)toHeight.add(new Option(heightLabel(alt),alt));
 }
 toHeight.value='10000';
 const turnUnit=()=>Chart.turnUnits[$('bench-turn-unit').value];
 const api=globalThis.OperatingBenchmarkUI={data,settings:{},rows:{},altitudeRows:[],climbs:null,accelerations:null,probe:null,probeLocked:false,probeLock:null};
 const speed=(value,kind)=>Chart.speed(value,$('bench-speed-unit').value,kind);
 const accelerationInputs=[$('bench-acceleration-from'),$('bench-acceleration-to')],accelerationSpeeds=[180,300];
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
  cooling.disabled=!(models[id].benchmarkCooling||models[id].climbCoolingAreaM2||models[id].climbCoolingCase);
  if(cooling.disabled)cooling.value='clean';
  return {id,settings:{mode:combat?'combat':'normal',fuelFraction:Number($('bench-fuel-'+side).value),injection:input.checked,
   extension:$('bench-extension').checked,openCooling:cooling.value==='open'}};
 }
 function number(label,value,detail){const e=document.createElement('div');e.className='bench-number';e.append(text('span',label),text('strong',value),text('small',detail));return e;}
 function stallReferences(side){
  const id=api.settings[side].id;
  const rows=data.stallReferences[id];
  if(!rows.length)return null;
  const group=text('details',undefined,'bench-note');
  group.append(text('summary','Stall references'));
  for(const row of rows){
   const {value,unit,basis}=row.speed;
   const condition=[row.power==='on'?'power on':row.power==='off'?'power off':row.power,
    Number.isFinite(row.weightLb)?fmt(row.weightLb,0)+' lb':null,
    Number.isFinite(row.altFt)?heightLabel(row.altFt):null].filter(Boolean).join(', ');
   const note=text('p',(row.grade==='calculated'?'Calculated clean stall':row.role)+' · '+row.aircraft+' · '+
    value+' '+unit+' '+basis+' · '+condition+'. '+row.qualification+' ');
   note.dataset.stallObservation=row.id;
   const link=text('a',row.source.title);
   link.href=row.source.url;link.target='_blank';link.rel='noopener';
   note.append(link);group.append(note);
  }
  return group;
 }
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
  const stallDetails=stallReferences(side);
  if(stallDetails)result.append(stallDetails);
  if(r.status==='source-power-unavailable'){box.append(text('p','Power source does not cover this altitude. Enable labelled estimates to inspect a pressure-lapse scenario.','bench-warning'));return;}
  if(r.status!=='modelled')box.append(text('p','This model cannot sustain level flight at this load, power and altitude.','bench-warning'));
  if(r.sustained?.estimatedPower||r.level?.estimatedPower||r.climb?.estimatedPower)box.append(text('p','High-altitude power estimate beyond the last source node.','bench-warning'));
  if(r.climb?.cooling==='report-conditioned')box.append(text('p','Climb uses report-conditioned power and open-cooling losses.','bench-note'));
  if(chosen.settings.openCooling)box.append(text('p',(spec.performanceIntake?'Level speed':'Turn, level speed')+
   ' and acceleration use the modeled climb cooling scenario.','bench-note'));
  const grid=document.createElement('div');grid.className='bench-numbers';
  if(spec.performanceIntake){
   if(r.climb?.climbFpm>0)grid.append(number(spec.climbProjectionOnly?'Best climb rate (estimated)':'Best climb rate',fmt(r.climb.climbFpm,0)+' ft/min',
    'Vy '+speed(r.climb.easMph,'EAS')+' / '+speed(r.climb.tasMph,'TAS')));
   if(r.level){
    const outsideReport=r.altFt<spec.levelObservationFloorFt||r.altFt>spec.levelObservationCeilingFt;
    grid.append(number('Maximum level speed',speed(r.level.tasMph,'TAS'),
     speed(r.level.easMph,'EAS')+(outsideReport?' · estimate outside trial altitude range':' · steady equilibrium')));
   }
   else if(r.climb?.climbFpm>0)box.append(text('p','Level speed is unavailable at this altitude and rating.','bench-note'));
   if(Number.isFinite(r.stallEasMph)){
    const band=spec.stallWeightRangeLb,w=r.loading.weightLb;
    const outside=band&&(w<band[0]||w>band[1]);
    grid.append(number('Provisional clean stall',speed(r.stallEasMph,'EAS'),spec.stallQualification+
     (outside?' Selected loading is outside the handbook weight range.':'')));
   }
   if(grid.childElementCount)result.append(grid);
   if(Number.isFinite(r.manualClimb?.climbFpm))result.append(text('p','At the scheduled climb speed of '+
    speed(r.manualClimb.iasMph,spec.climbTAS?'IAS':'IAS≈CAS')+', the climb rate is '+fmt(r.manualClimb.climbFpm,0)+' ft/min.','bench-note'));
   return;
  }
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
  const includesIntake=sides.some(side=>specs.aircraft[api.settings[side].id].performanceIntake);
  const series=sides.map(side=>{
   const row=api.rows[side],id=api.settings[side].id,evidence=data.graphEvidence[id];
   return {
    side,
    name:'Aircraft '+(side==='a'?'1':'2')+' · '+names[side],
    color:colors[side],evidence,turnPolicy:evidence.turnSensitivity?data.turnEvidence.sensitivity:null,
    range:includesIntake?null:row.turnRange,
    turnComparisonUnavailable:includesIntake,
    stallEasMph:row.stallEasMph,
    provisionalStallBand:row.stallEasRange?{
     minEasMph:row.stallEasRange[0],maxEasMph:row.stallEasRange[1],
     limitation:'NACA TN 1044 lift transfer at the selected weight. Wright Field IAS has no matched low-speed correction.'
    }:null,
    stallChecks:data.stallReferences[api.settings[side].id].filter(ref=>
     ref.altFt===alt&&(ref.role==='Reserved sister-airframe check'||ref.role==='Separate NACA configuration check')).map(ref=>({
      ...ref,eas:BenchmarkStallReferences.referenceEas(M,ref)
     })),
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
  const replay=data.turnDrag.replay, chosen=sides.map(side=>api.settings[side]);
  const dragPair=chosen[0].id!==chosen[1].id&&chosen.every(({id})=>replay.ids.includes(id));
  const donorCase=dragPair&&alt===replay.altFt&&chosen.every(({settings:s})=>
   s.mode===replay.mode&&s.fuelFraction===replay.fuelFraction&&s.injection===replay.injection&&!s.openCooling);
  $('bench-turn-drag').hidden=!dragPair;
  const dragProbe=dragPair?{
   host:$('bench-turn-drag-result'), evaluateAt,
   donor:donorCase?{...data.turnDrag.glide,range:replay.speedRangeMph,
    side:chosen[0].id===replay.ids[1]?'a':'b'}:null
  }:null;
  $('bench-advantage-key').hidden=!policy;
  $('bench-solo-key').hidden=true;
  $('bench-plot-note').textContent=includesIntake?'Turn curves require drag-under-load and lift evidence for both aircraft.':
   turnUnit().key==='g'?
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
   chart:$('bench-turn-plot'),climbChart:$('bench-climb-plot'),accelerationChart:$('bench-acceleration-plot'),
   slider:$('bench-probe-speed'),value:$('bench-probe-value'),results:$('bench-probe-results'),
   climbResults:$('bench-climb-at-speed'),accelerationResults:$('bench-acceleration-at-speed'),
   rangeStatus:$('bench-range-status'),focus:$('bench-turn-focus').value==='3',
   unit:$('bench-speed-unit').value,turnUnit:turnUnit(),altFt:alt,series,
   selectedEasMph:api.probe?.easMph,
   lockButton:$('bench-probe-lock'),lockStatus:$('bench-probe-lock-status'),lock:api.probeLock,
   onLock(anchor){api.probeLock=anchor;api.probeLocked=Boolean(anchor);},
   evaluateAt,
   makeAdvantage(domain){
    if(includesIntake)return null;
    return OperatingTurnComparison.advantage({...domain,host:advantage,readout,limits,names,colors,policy,dragProbe,
     soloKey:$('bench-solo-key'),turnUnit:turnUnit(),unit:$('bench-speed-unit').value,tolerances});
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
    text('p',row?row.gold_count+' GOLD · '+row.gold_qualified_count+' GOLD* of '+row.planned_count+' planned benchmarks':
     'Benchmark agreement is unscored for this profile.','bench-note'));
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
 function peakVerdict(a,b,turn){
  if(!a||!b)return null;
  if(turn.key==='rate')return Match.compare('sustained_turn_rate',a.rateDegSec,b.rateDegSec,tolerances);
  const tas=(a.tasMph+b.tasMph)/2;
  return Match.compare('sustained_turn_rate',TurnPerformance.turnFromLoad(a.g,tas).rateDegSec,
   TurnPerformance.turnFromLoad(b.g,tas).rateDegSec,tolerances);
 }
 function leadLabel(verdict,margin){
  if(verdict.lead==='tie')return text('strong','Effectively tied','bench-note');
  return text('strong',shortName(api.settings[verdict.lead].id)+' +'+margin,'bench-'+verdict.lead);
 }
 function renderAltitudeOverview(alt){
  const turn=turnUnit();
  const compareTurns=sides.every(side=>!specs.aircraft[api.settings[side].id].performanceIntake);
  const {table,body}=makeTable(['Altitude',...(compareTurns?['Peak sustained turn ('+turn.label+')']:[]),'Best climb (ft/min)','Top level speed (TAS)'],'bench-altitude-table');
  const unit=$('bench-speed-unit').value;
  function pair(a,b,format,margin,estimated,verdict){
   const cell=text('td');
   const values=sides.map((side,i)=>text('span',format([a,b][i])+(estimated[i]?'*':''),'bench-'+side));
   cell.append(values[0],document.createTextNode(' / '),values[1]);
   if(verdict){
    const label=text('small');label.dataset.lead=verdict.lead;
    label.append(leadLabel(verdict,margin(Math.abs(a-b))));cell.append(label);
   }
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
   const ta=a[turn.peak],tb=b[turn.peak],climbA=positive(a),climbB=positive(b),levelA=a.level?.tasMph,levelB=b.level?.tasMph;
   tr.append(th,
    ...(compareTurns?[pair(ta?.[turn.field],tb?.[turn.field],v=>fmt(v,turn.digits),v=>fmt(v,turn.digits)+' '+turn.label,
     [ta?.estimatedPower,tb?.estimatedPower],peakVerdict(ta,tb,turn))]:[]),
    pair(climbA,climbB,v=>fmt(v,0),v=>fmt(v,0)+' ft/min',[a.climb?.estimatedPower&&climbA,b.climb?.estimatedPower&&climbB],
     Match.compare('climb_rate',climbA,climbB,tolerances)),
    pair(levelA,levelB,v=>Chart.speed(v,unit,'TAS'),v=>Chart.speed(v,unit,'TAS'),[a.level?.estimatedPower,b.level?.estimatedPower],
     Match.compare('level_speed',levelA,levelB,tolerances)));
   body.append(tr);
  }
  $('bench-altitude-overview').replaceChildren(table);
 }
 function renderFlightChecks(){
  const target=$('bench-flight-check-results');
  target.append(text('p','Mean absolute errors are in ft/min. Each case identifies its fitted points, held-out checks and any separate-airframe evidence.','bench-note'));
  for(const check of data.flightChecks){
   const {count,beforeMae,afterMae,largestRegression}=check.checks;
   const source=text('a','Original flight report');
   source.href=check.url;source.target='_blank';source.rel='noopener';
   target.append(text('h4',check.name),
    text('p',fmt(beforeMae,0)+' → '+fmt(afterMae,0)+' ft/min mean error over '+count+' checks. Largest increase '+fmt(largestRegression,0)+' ft/min.'),
    text('p',check.condition,'bench-note'),source);
   const details=text('details'),summary=text('summary','Observed and modeled climb rates');
   const {table,body}=makeTable(['Altitude (ft)','Rating','Role','Observed',...(check.modelLabels??['v4.2','v4.3'])]);
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
 function appendTable(parent,labels,rows){
  const {table,body}=makeTable(labels);
  for(const values of rows){
   const tr=text('tr');
   for(const value of values)tr.append(text('td',value));
   body.append(tr);
  }
  const scroll=text('div',undefined,'bench-table-scroll');scroll.append(table);parent.append(scroll);
 }
 function renderIntakeChecks(){
  const target=$('bench-intake-check-results'),{crossover,aircraft}=data.intakeChecks;
  target.append(text('p','Spitfire HF IX versus LF IX. A positive difference favors the HF. Table VI sea level is the HF drag fit.','bench-note'));
  appendTable(target,['Altitude','Observed HF − LF (mph TAS)','Modeled HF − LF (mph TAS)'],
   crossover.map(row=>[heightLabel(row.altFt),fmt(row.observedDifferenceMph,1),fmt(row.modeledDifferenceMph,1)]));
  for(const check of aircraft){
   const details=text('details');
   details.append(text('summary',check.label),text('p',check.scope,'bench-note'),
    text('p','Mean absolute level-speed error outside the fit is '+fmt(check.levelMaeMph,1)+' mph TAS.'+
     (check.climbMaeFpm===null?'':' Mean absolute climb-rate error is '+fmt(check.climbMaeFpm,0)+' ft/min.'),'bench-note'));
   if(check.ceiling){
    const c=check.ceiling;
    details.append(text('p','Reported ceiling '+heightLabel(c.observedAltFt)+'. At that altitude the model gives '+
     fmt(c.modeledRateAtObservedFpm,0)+' ft/min. Its 100 ft/min ceiling is '+heightLabel(c.modeled100FpmAltFt)+'.','bench-note'));
   }
   for(const [metric,rows,unit] of [['Level speed',check.level,'mph TAS'],['Climb rate',check.climb,'ft/min'],
    ['Climb elapsed time',check.elapsed,'s']]){
    if(!rows?.length)continue;
    details.append(text('h4',metric));
    const alternate=rows.some(row=>Number.isFinite(row.alternateRateFpm));
    appendTable(details,['Altitude','Weight (lb)','Observed ('+unit+')','Modeled','Residual','Test condition',
     ...(alternate?['Scan rate altitude','Alternate (ft/min)']:[])],
    rows.map(row=>[heightLabel(row.altFt),fmt(row.weightLb,0),fmt(row.observed),fmt(row.predicted),fmt(row.error),
     [row.mode,row.gear,row.role,row.configuration].filter(Boolean).join(' · '),
     ...(alternate?[heightLabel(row.rateAltitudeFt),fmt(row.alternateRateFpm)]:[])]));
   }
   target.append(details);
  }
 }
 function invalidateClimbs(message){
  api.climbs=null;
  $('bench-climb-result').textContent=message;
  $('bench-climb-trace').replaceChildren();
 }
 function renderAltitude(){
  const alt=Number(height.value),label=heightLabel(alt);
  for(const control of altitudeControls){control.value=alt;control.setAttribute('aria-valuetext',label);}
  for(const output of altitudeReadouts)output.value=label;
  const current=api.altitudeRows.find(row=>row.altFt===alt)??Object.fromEntries(sides.map(side=>{
   const chosen=api.settings[side];
   return [side,B.metrics(M,T,L,models[chosen.id],specs.aircraft[chosen.id],specs.policy,chosen.settings,alt)];
  }));
  for(const side of sides){api.rows[side]=current[side];renderSide(side);}
  plot(alt);renderAltitudeOverview(alt);
  const turn=turnUnit(),a=api.rows.a[turn.peak],b=api.rows.b[turn.peak],verdict=peakVerdict(a,b,turn);
  const comparison=$('bench-comparison');comparison.replaceChildren();
  if(verdict)comparison.append(document.createTextNode('Modeled peak sustained turn. '),
   leadLabel(verdict,fmt(Math.abs(a[turn.field]-b[turn.field]),turn.digits)+' '+turn.label));
  else comparison.textContent=sides.some(side=>specs.aircraft[api.settings[side].id].performanceIntake)?
   'Turn comparison awaits drag-under-load and lift evidence.':'A sustained-turn comparison is unavailable for one or both selected states.';
  if(api.accelerations&&api.accelerations.a.altFt!==alt)invalidateAcceleration('Altitude changed. Recalculate both runs.');
  $('bench-acceleration-altitude').textContent='Shared altitude '+label;
 }
 function render(){
  for(const side of sides){const chosen=read(side);api.settings[side]=chosen;readAltitudes(side,chosen);}
  api.altitudeRows=altitudes.map((altFt,i)=>({altFt,a:altitudeCache.a.rows[i],b:altitudeCache.b.rows[i]}));
  renderAltitude();sourceDetails();renderSourceGrades();
  $('bench-matchup').textContent=History.compare(service.aircraft[api.settings.a.id],service.aircraft[api.settings.b.id]);
  invalidateClimbs('Calculate both climbs for the current aircraft and settings.');
  invalidateAcceleration('Calculate both runs for the current aircraft and settings.');
 }
 function changeHeight(event){
  height.value=event.currentTarget.value;
  if(Number(height.value)!==api.rows.a?.altFt)renderAltitude();
 }
 for(const control of altitudeControls){control.addEventListener('input',changeHeight);control.addEventListener('change',changeHeight);}
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
  plot(alt);renderAltitudeOverview(alt);showAccelerationInputs();
  if(api.accelerations)renderAcceleration();
 });
 for(const input of [fromHeight,toHeight])input.addEventListener('change',()=>invalidateClimbs('Climb altitude changed. Recalculate both climbs.'));
 $('bench-climb-calculate').addEventListener('click',()=>{const from=Number(fromHeight.value),to=Number(toHeight.value),box=$('bench-climb-result');box.replaceChildren();if(to<=from){box.append(text('p','Choose a target altitude above the climb start.'));return;}
  const results={};for(const side of ['a','b']){const c=api.settings[side];results[side]=B.climb(M,T,L,models[c.id],specs.aircraft[c.id],specs.policy,c.settings,from,to,{trace:true});const r=results[side];
   box.append(text('h3','Aircraft '+(side==='a'?'1':'2')+' · '+shortName(c.id)),text('p',r.status==='reached'?heightLabel(from)+' to '+heightLabel(to)+': '+fmt(r.seconds/60,2)+' min':'Target not reached: '+r.status+' at '+fmt(r.reachedFt,0)+' ft'),text('p','Combat used '+fmt(r.combatSeconds/60,2)+' min · remaining '+fmt(r.combatRemainingSeconds/60,2)+' min · fuel used '+fmt(r.fuelUsedLb,1)+' lb · arrival mass '+fmt(r.endWeightLb,0)+' lb · injection fluid remaining '+fmt(r.injectionRemainingLb,1)+' lb'));
   for(const p of r.schedule)box.append(text('p',p.label+': '+fmt(p.fromFt,0)+' → '+fmt(p.toFt,0)+' ft · '+fmt(p.seconds/60,2)+' min','bench-note'));
   box.append(text('p',r.policy,'bench-note'));
  }
  box.prepend(timeVerdict(results));
  renderTimeGraph('bench-climb-trace',results,'climb',from,to,'Altitude (ft)',point=>point.altFt);
  api.climbs=results;
 });
 function invalidateAcceleration(message){
  api.accelerations=null;
  $('bench-acceleration-result').textContent=message;
  $('bench-acceleration-trace').replaceChildren();
 }
 function timeVerdict(results){
  const result=text('p',undefined,'bench-time-verdict'),a=results.a,b=results.b;
  const verdict=Match.compare('elapsed_time',a.seconds,b.seconds,tolerances);
  if(verdict){
   const gap=fmt(Math.abs(verdict.delta),1)+' s';
   if(verdict.lead==='tie')result.append(text('strong','Effectively tied'),document.createTextNode(' · '+gap+' apart within the '+tolerances.elapsed_time.spread+'% margin'));
   else result.append(text('strong',shortName(api.settings[verdict.lead].id)+' arrives '+gap+' sooner','bench-'+verdict.lead));
  }else{
   const finisher=sides.find(side=>results[side].status==='reached');
   result.textContent=finisher?shortName(api.settings[finisher].id)+' reaches the target':'Target not reached by either aircraft';
  }
  return result;
 }
 function renderTimeGraph(id,results,kind,low,high,label,coordinate){
  const colors=Evidence.colors(...sides.map(side=>service.aircraft[api.settings[side].id].country));
  const series=sides.map(side=>{
   const aircraft=api.settings[side].id,record=data.graphEvidence[aircraft];
   const trace=results[side].trace.map(point=>({
    ...point,value:coordinate(point),covered:point.inputs?Evidence.describe(point.inputs,kind,record).covered:false
   }));
   return {side,color:colors[side],name:shortName(aircraft),trace};
  });
  Chart.timedTrace($(id),series,{low,high,label});
 }
 function renderAccelerationEvidence(){
  const {observation,nominal,scenarioRangeSeconds,scenarios,scenarioInputs,wartime,spitfire}=data.accelerationEvidence;
  const {aircraft,conditions,endpoints,source}=observation;
  const result=$('bench-acceleration-evidence-result'),context=$('bench-acceleration-evidence-context');
  const link=(label,url)=>{
   const a=text('a',label);
   a.href=url;a.target='_blank';a.rel='noopener';
   return a;
  };
  const signed=(value,digits)=>Number.isFinite(value)?(value>0?'+':'')+fmt(value,digits):'Unavailable';
  result.append(text('p',aircraft+' · '+heightLabel(conditions.altitudeFtMsl)+' MSL · '+conditions.outsideAirTempF+
   ' °F · '+conditions.rating+' in low blower · '+endpoints.startKnots+'–'+endpoints.endKnots+' KIAS.'));
  appendTable(result,['Transcribed time','Calculated time','Calculated minus transcribed'],[[
   fmt(endpoints.elapsedSeconds,0)+' s',
   nominal.seconds===null?'Target not reached':fmt(nominal.seconds,1)+' s',
   nominal.residualSeconds===null?'Unavailable':signed(nominal.residualSeconds,1)+' s ('+signed(nominal.residualPct,1)+'%)'
  ]]);
  const observedEndpoints=[
   {seconds:0,value:endpoints.startKnots,label:'Transcribed start · '+endpoints.startKnots+' KIAS'},
   {seconds:endpoints.elapsedSeconds,value:endpoints.endKnots,label:'Transcribed finish · '+endpoints.endKnots+' KIAS at '+endpoints.elapsedSeconds+' s'}
  ];
  Chart.timedTrace($('bench-acceleration-evidence-trace'),[
   {side:'replay',name:'Calculated replay',color:'var(--bench-a)',trace:nominal.trace}
  ],{low:endpoints.startKnots-8,high:endpoints.endKnots+8,label:'Indicated knots (calculated IAS proxy)',observedEndpoints});
  const references=text('p','Open circles show the two transcribed observations. The dotted curve uses the 44-15342 power and drag model. ',
   'bench-note');
  references.append(link('Flight report',source.url),document.createTextNode(' · '),
   link('Figure 8',source.figure),document.createTextNode(' · '),link('Endpoint transcription',endpoints.transcription));
  context.append(references,text('p','The replay assumes '+fmt(nominal.weightLb,0)+' lb, '+fmt(nominal.shaftBhp,0)+' BHP at '+
   fmt(nominal.rpm,0)+' RPM, and treats IAS as CAS. Actual run weight, power, rack fit, cooling and IAS correction remain unknown.','bench-note'));
  if(scenarioRangeSeconds){
   const incomplete=scenarios.filter(row=>row.status!=='reached').length;
   const weightRange=[scenarioInputs.weightLb[0],scenarioInputs.weightLb.at(-1)].map(weight=>fmt(weight,0)).join('–');
   const powerVariation=fmt(100*(scenarioInputs.shaftPowerFactors.at(-1)-1),0);
   const speedVariation=fmt(scenarioInputs.commonCasMinusIasKnots.at(-1),0);
   context.append(text('p','Completed scenarios span '+scenarioRangeSeconds.map(value=>fmt(value,1)).join('–')+
    ' s with '+weightRange+' lb, ±'+powerVariation+'% shaft power and ±'+speedVariation+
    ' kt common CAS–IAS offset. The range illustrates input sensitivity.'+
    (incomplete?' '+incomplete+' scenarios did not reach the target.':''),'bench-note'));
  }
  const related=text('details');
  related.append(text('summary','Wartime power-balance checks'));
  const level=text('p','P-51D 44-15342 at '+heightLabel(wartime.point.altFt)+' and Normal power reached '+
   fmt(wartime.point.tasMph,0)+' mph TAS. The calculated equilibrium is '+fmt(wartime.equilibriumTasMph,2)+
   ' mph TAS. ', 'bench-note');
  level.append(link('Wright Field B.4',wartime.url));
  const climb=text('p','Spitfire LF Mk IX BS.543, open radiators and 3,000 RPM. Table II climb rate and TAS give a calculated level-equivalent acceleration in mph TAS/s. ',
   'bench-note');
  climb.append(link('A&AEE Table II',spitfire.url));
  related.append(level,climb);
  appendTable(related,['Altitude','Role','From report climb','From modeled climb','Residual'],
   spitfire.rows.map(row=>[heightLabel(row.altFt),row.role==='fit'?'Fit':'Reserved',
    fmt(row.verticalOnly.observed,2),fmt(row.verticalOnly.modeled,2),signed(row.verticalOnly.residual,2)]));
  context.append(related);
 }
 function showAccelerationInputs(){
  const unit=$('bench-speed-unit').value,factor=Chart.speedFactor(unit);
  for(const [i,input] of accelerationInputs.entries()){
   input.value=Number.isFinite(accelerationSpeeds[i])?Math.round(accelerationSpeeds[i]*factor*100)/100:'';
  }
  $('bench-acceleration-unit').textContent=Chart.speed(0,unit,'EAS').slice(2);
 }
 function renderAcceleration(){
  const results=api.accelerations,box=$('bench-acceleration-result');
  const status={
   'power-limited':'Acceleration reaches its power limit',
   'source-power-unavailable':'Power data unavailable',
   'below-provisional-stall':'Starting speed is below the modeled 1 G stall',
   'speed-domain-unavailable':'Target is outside the modeled speed range',
   'rating-time-exhausted':'Available rating time exhausted',
   'fuel-exhausted':'Fuel exhausted',
   'integration-limit':'Run ended at the integration limit'
  };
  box.replaceChildren(timeVerdict(results));
  for(const side of sides){
   const r=results[side],name=shortName(api.settings[side].id);
   const summary=r.status==='reached'?fmt(r.seconds,2)+' s to '+speed(r.targetEasMph,'EAS'):
    (status[r.status]??r.status)+' at '+speed(r.reachedEasMph,'EAS');
   box.append(text('h4',name,'bench-'+side),text('p',summary),
    text('p','Combat remaining '+fmt(r.combatRemainingSeconds,1)+' s · fuel used '+fmt(r.fuelUsedLb,1)+' lb · injection fluid remaining '+fmt(r.injectionRemainingLb,1)+' lb','bench-note'));
   if(r.estimatedPower)box.append(text('p','Includes extrapolated engine power.','bench-note'));
   for(const phase of r.schedule){
    box.append(text('p',phase.label+' · '+speed(phase.fromEasMph,'EAS')+' to '+speed(phase.toEasMph,'EAS')+' · '+fmt(phase.seconds,1)+' s','bench-note'));
   }
  }
  const unit=$('bench-speed-unit').value,factor=Chart.speedFactor(unit);
  renderTimeGraph('bench-acceleration-trace',results,'acceleration',results.a.startEasMph*factor,
   results.a.targetEasMph*factor,'Speed ('+Chart.speed(0,unit,'EAS').slice(2)+')',point=>point.easMph*factor);
 }
 for(const [i,input] of accelerationInputs.entries()){
  input.addEventListener('input',()=>{
   accelerationSpeeds[i]=input.valueAsNumber/Chart.speedFactor($('bench-speed-unit').value);
   invalidateAcceleration('Speed interval changed. Recalculate both runs.');
  });
 }
 $('bench-acceleration-calculate').addEventListener('click',()=>{
  const [from,to]=accelerationSpeeds,alt=Number(height.value);
  if(![from,to].every(Number.isFinite)||from<=0||to<=from){
   invalidateAcceleration('Choose a positive start speed and a higher target speed.');return;
  }
  api.accelerations=Object.fromEntries(sides.map(side=>{
   const c=api.settings[side];
   return [side,B.accelerate(M,T,L,models[c.id],specs.aircraft[c.id],specs.policy,c.settings,alt,from,to)];
  }));
  renderAcceleration();
 });
 showAccelerationInputs();
 $('bench-tie-margins').textContent='Effective ties use '+tolerances.sustained_turn_rate.spread+'°/s, '+
  tolerances.climb_rate.spread+'% climb rate and '+tolerances.level_speed.spread+' km/h TAS. In G view the peak tie margin uses the two peaks’ mean TAS. * includes estimated power.';
 render();
 renderFlightChecks();renderIntakeChecks();renderAccelerationEvidence();
 OperatingTurnComparison.evidence($('bench-turn-evidence'),data.turnEvidence,data.turnLiftChecks,
  data.turnEvidence.sensitivity,data.turnEvidence.directTurns,data.turnDrag);
})();
