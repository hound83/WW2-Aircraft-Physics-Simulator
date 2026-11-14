'use strict';

(()=>{
 const Maneuver=BenchmarkManeuver,Chart=OperatingBenchmarkChart,Evidence=BenchmarkGraphEvidence;
 const $=id=>document.getElementById(id),sides=['a','b'];
 const input=$('bench-maneuver-entry'),loadInput=$('bench-maneuver-load');
 const altitude=$('bench-maneuver-altitude'),result=$('bench-maneuver-result'),plot=$('bench-maneuver-trace');
 const sweep=$('bench-maneuver-sweep-result');
 const unit=()=>$('bench-speed-unit').value;
 const factor=()=>Chart.speedFactor(unit());
 const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}):'Unavailable';
 const mph=(n,d=1)=>Chart.speed(n,unit(),'EAS',d);
 const time=n=>Number.isFinite(n)?fmt(n)+' s':'Unavailable';
 const name=(data,id)=>data.service.aircraft[id].displayName;
 const statusLabel={
  'reached':'Completed',
  'invalid-benchmark-input':'Outside the modeled flight envelope',
  'speed-domain-unavailable':'Reached the speed limit of the model',
  'source-power-unavailable':'Power curve unavailable',
  'below-provisional-stall':'Reached the modeled 1 G stall',
  'lift-limited':'Insufficient lift to continue the turn',
  'power-limited':'Insufficient power to recover entry speed',
  'fuel-exhausted':'Fuel exhausted',
  'rating-time-exhausted':'Rating time exhausted',
  'integration-limit':'Replay stopped at the calculation limit'
 };
 function node(tag,content,className){
  const el=document.createElement(tag);
  if(content!==undefined)el.textContent=content;
  if(className)el.className=className;
  return el;
 }
 function table(labels){
  const scroll=node('div',undefined,'bench-table-scroll'),el=node('table'),thead=node('thead'),row=node('tr'),body=node('tbody');
  labels.forEach(label=>{const header=node('th',label);header.scope='col';row.append(header);});
  thead.append(row);el.append(thead,body);scroll.append(el);
  return {scroll,body};
 }
 function addRow(body,label,values){
  const row=node('tr'),head=node('th',label);head.scope='row';
  row.append(head,...values.map(value=>{
   const cell=node('td');
   cell.append(value);
   return cell;
  }));
  body.append(row);
 }

 function setup({M,T,L,data,api}){
  const {models,specification,graphEvidence}=data;
  const {aircraft,policy}=specification,stress=data.turnEvidence.sensitivity;
  let entryEasMph=210,lastCase=null,lastSweep=null;
  const placeholder='Choose the entry speed and G command, then run both aircraft.';
  function clear(message=placeholder){
   api.maneuvers=null;lastCase=null;lastSweep=null;
   result.textContent=message;plot.replaceChildren();sweep.replaceChildren();
  }
  function setAltitude(altFt,label){
   altitude.textContent='Shared altitude '+label;
   if(lastCase&&lastCase.altFt!==altFt)clear('Altitude changed. Recalculate both runs.');
  }
  function renderInputs(){
   input.value=Number.isFinite(entryEasMph)?String(+(entryEasMph*factor()).toFixed(1)):'';
   $('bench-maneuver-unit').textContent=mph(0,0).slice(2);
  }
  function runSide(side,flightCase,options){
   const selected=api.settings[side];
   return Maneuver.replay(M,T,L,models[selected.id],aircraft[selected.id],policy,selected.settings,flightCase,options);
  }
  function render(){
   renderInputs();
   if(!api.maneuvers)return;
   const results=api.maneuvers,colors=Evidence.colors(...sides.map(side=>data.service.aircraft[api.settings[side].id].country));
   const cards=node('div',undefined,'bench-probe-cards');
   const bands=sides.map(side=>results[side].sensitivity);
   const [a,b]=bands;
   const complete=sides.every(side=>results[side].nominal.status==='reached'&&
    results[side].sensitivity.completed===results[side].sensitivity.tested);
   const stableLead=complete&&(a.totalSeconds[1]<b.totalSeconds[0]?'a':b.totalSeconds[1]<a.totalSeconds[0]?'b':null);
   const comparison=stableLead?
    name(data,api.settings[stableLead].id)+' completed sooner across the tested inputs.':
    complete?'Completion times overlap across the tested inputs.':
    bands.every(band=>band.completed===0)&&sides.every(side=>results[side].nominal.status!=='reached')?
     'Neither aircraft recovered entry speed across the tested inputs.':
     'At least one run did not recover entry speed.';
   result.replaceChildren(node('p',comparison),cards);
   const series=sides.map(side=>{
    const runs=results[side],r=runs.nominal,id=api.settings[side].id,band=runs.sensitivity;
    const card=node('article',undefined,'bench-probe-card');card.dataset.side=side;
    const label=name(data,id);
    const metrics=node('dl',undefined,'bench-probe-metrics');
    for(const [key,value] of [
     ['Turn time',time(r.turnSeconds)],['Exit speed',r.exitEasMph===null?'Unavailable':mph(r.exitEasMph)],
     ['Recovery time',time(r.recoverySeconds)],['Total time',time(r.seconds)],['Peak load',fmt(r.peakG)+' G'],
     ['Energy height change in turn',r.turnEnergyHeightFt===null?'Unavailable':fmt(r.turnEnergyHeightFt,0)+' ft']
    ]){
     const line=node('div');line.append(node('dt',key),node('dd',value));metrics.append(line);
    }
    card.append(node('h4',label,'bench-'+side),metrics);
    if(r.status!=='reached')card.append(node('p',(statusLabel[r.status]??r.status)+' at '+fmt(r.headingDeg,0)+'° and '+mph(r.reachedEasMph)+'.'));
    if(r.intake)card.append(node('p','Provisional maneuver estimate for this intake profile.','bench-note'));
    if(r.estimatedPower)card.append(node('p','Includes extrapolated engine power.','bench-note'));
    card.append(node('p','Lift cap '+time(r.limits.lift)+' · G cap '+time(r.limits.structure)+' · power deficit '+time(r.limits.powerDeficit)+' during the turn.','bench-note'),
     node('p','Fuel used '+fmt(r.fuelUsedLb,1)+' lb · injection fluid used '+fmt(r.injectionUsedLb,1)+' lb · Combat used '+time(r.combatSeconds)+'.','bench-note'),
     node('p','Tested total time '+(band.totalSeconds?band.totalSeconds.map(time).join(' to '):'unavailable')+
      ' · '+band.completed+'/'+band.tested+' combinations completed.','bench-note'));
    const schedule=node('details');
    schedule.append(node('summary','Power and phase schedule'));
    for(const row of r.schedule)schedule.append(node('p',(row.segment==='turn'?'Turn':'Recovery')+' · '+row.label+' · '+
     time(row.startSeconds)+' to '+time(row.endSeconds),'bench-note'));
    card.append(schedule);cards.append(card);
    const trace=r.trace.map(p=>({...p,value:p.easMph*factor(),covered:p.segment==='recovery'&&
     p.inputs.every(state=>Evidence.describe(state,'acceleration',graphEvidence[id]).covered)}));
    return {side,name:label,trace,color:colors[side]};
   });
   const shown=series.flatMap(row=>row.trace.map(p=>p.value));
   const low=Math.floor(shown.reduce((a,b)=>Math.min(a,b))/10)*10-5;
   const high=Math.ceil(shown.reduce((a,b)=>Math.max(a,b))/10)*10+5;
   Chart.timedTrace(plot,series,{low,high,
    label:'Speed ('+mph(0,0).slice(2)+')',intervalEvidence:true});
   renderSweep();
  }
  function renderSweep(){
   if(!lastSweep){sweep.replaceChildren();return;}
   const names=sides.map(side=>name(data,api.settings[side].id));
   const {scroll,body}=table(['Altitude','Entry speed',...names]);
   for(const {altFt,entryEasMph,a,b} of lastSweep)addRow(body,fmt(altFt,0)+' ft',[mph(entryEasMph,0),...[a,b].map(r=>
    r.status==='reached'?time(r.seconds)+' total · '+mph(r.exitEasMph,0)+' at rollout':
    statusLabel[r.status]??r.status)]);
   sweep.replaceChildren(scroll);
  }
  input.addEventListener('input',()=>{entryEasMph=input.valueAsNumber/factor();clear();});
  loadInput.addEventListener('input',()=>clear());
  $('bench-maneuver-run').addEventListener('click',()=>{
   const commandG=loadInput.valueAsNumber,altFt=+$('bench-altitude').value;
   if(!(entryEasMph>0&&commandG>1&&commandG<=9)){clear('Enter a positive airspeed and a load above 1 G up to 9 G.');return;}
   lastCase={altFt,entryEasMph,commandG};lastSweep=null;
   api.maneuvers=Object.fromEntries(sides.map(side=>[side,{
    nominal:runSide(side,lastCase),
    sensitivity:Maneuver.sensitivity(scenario=>runSide(side,lastCase,{scenario,sensitivity:stress,trace:false}),stress)
   }]));
   render();
  });
  $('bench-maneuver-sweep').addEventListener('click',()=>{
   if(!lastCase){sweep.textContent='Run the comparison to set the G command and aircraft settings.';return;}
   const {commandG}=lastCase,{altitudesFt,entrySpeedsEasMph}=Maneuver.sweepGrid;
   lastSweep=altitudesFt.flatMap(altFt=>entrySpeedsEasMph.map(entryEasMph=>{
    const flightCase={altFt,entryEasMph,commandG};
    return {altFt,entryEasMph,...Object.fromEntries(sides.map(side=>[side,runSide(side,flightCase,{trace:false})]))};
   }));
   renderSweep();
  });
  clear();renderInputs();
  return {clear,setAltitude,render};
 }

 function scorecard(host,{aircraft,metrics,condition}){
  const {scroll,body}=table(['Aircraft',...metrics.map(metric=>metric.label)]);
  const displayModel=(value,unit)=>value===null?'Run unavailable':fmt(value,unit==='ft/min'?0:1)+' '+unit;
  for(const row of aircraft){
   addRow(body,row.name,metrics.map(metric=>{
    const cell=node('div'),display=row.model[metric.id];
    cell.append(node('strong',displayModel(display,metric.unit)));
    if(metric.id==='maneuver')cell.append(node('div','180° + recovery, provisional','bench-note'),
     node('div',fmt(row.liftG,2)+' G lift cap · '+fmt(row.sustainedDegSec,1)+'°/s sustained at entry','bench-note'));
    if(metric.id==='stall'&&row.stallEasRange)cell.append(node('div','Transfer range '+
     row.stallEasRange.map(v=>fmt(v)).join('–')+' mph EAS','bench-note'));
    if(metric.id==='maneuver'&&display===null)cell.append(node('div',
     statusLabel[row.operatingStatus.maneuver]??row.operatingStatus.maneuver,'bench-note'));
    const checks=row.evidence[metric.id];
    if(!checks.length)cell.append(node('div',row.gaps[metric.id],'bench-note'));
    else{
     const details=node('details'),first=checks[0];
     const summary=first.count?
      fmt(first.agreement)+'% · n='+first.count+' · '+first.qualifier:first.qualifier;
     details.append(node('summary',summary));
     for(const group of checks){
      details.append(node('p',group.qualifier,'bench-note'));
      if(group.count)details.append(node('p',fmt(group.agreement)+'% · n='+group.count+' · mean signed error '+
       (group.bias>=0?'+':'')+fmt(group.bias,2)+' '+group.unit+
       (group.count<group.available?' · '+(group.available-group.count)+' source rows without a residual':''),'bench-note'));
      if(group.reference)details.append(node('p',group.reference,'bench-note'));
      if(group.source){
       const link=node('a','Source');link.href=group.source;link.target='_blank';link.rel='noopener';
       details.append(link);
      }
     }
     if(row.gaps[metric.id])details.append(node('p',row.gaps[metric.id],'bench-note'));
     cell.append(details);
    }
    return cell;
   }));
  }
  host.replaceChildren(node('p','Model comparison at '+fmt(condition.altFt,0)+' ft, Combat rating, 50% internal fuel and clean cooling. '+
   'Timed climb starts at sea level. Straight acceleration uses 180–250 mph EAS. The turn starts at '+condition.entryEasMph+' mph EAS with a '+condition.commandG+' G command.'),
   node('p','Percentages compare with the indicated report conditions. Agreement is 100 minus mean absolute percentage error. Open a result for its basis and signed residual.','bench-note'),scroll);
 }

 globalThis.BenchmarkManeuverUI=Object.freeze({setup,scorecard});
})();
