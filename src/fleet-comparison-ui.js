'use strict';

const FleetComparisonUI = (() => {
 function setup({api,data,text,appendTable,shortName,fmt,speed,fromHeight,toHeight}) {
  const $=id=>document.getElementById(id);
  const F=FleetComparison, sides=['a','b'];
  const ids=()=>sides.map(side=>api.settings[side].id);
  const signed=x=>Number.isFinite(x)?(x>0?'+':'')+fmt(x,1)+' s':'—';
  const seconds=x=>Number.isFinite(x)?fmt(x,1)+' s':'Unavailable';
  const link=(title,url)=>{const a=text('a',title);a.href=url;a.target='_blank';a.rel='noopener';return a;};
  const trialSelects=sides.map(side=>$('bench-trial-'+side));
  let previousIds=[];

  function climb() {
   const box=$('bench-trial-results');box.replaceChildren();
   const low=Number(fromHeight.value),high=Number(toHeight.value);
   const selected=ids();
   const clocks=selected.map((id,i)=>{
    const trials=data.trialClocks[id], control=trialSelects[i];
    if(previousIds[i]!==id){
     control.replaceChildren(...trials.map((t,j)=>new Option(shortName(id)+' · '+t.trial+(t.mode?' · '+t.mode:''),j)));
     if(!trials.length)control.add(new Option('No timed test',''));
     control.disabled=trials.length<2;
    }
    const trial=trials[Number(control.value)];
    return {trial,result:F.interval(trial,low,high)};
   });
   previousIds=selected;
   if(high<=low){box.append(text('p','Select a target above the start height.'));return;}
   appendTable(box,['Aircraft','Trial time','Model at trial settings','Model − trial','Endpoints'],clocks.map(({result:r},i)=>[
    shortName(selected[i]),seconds(r?.observed),seconds(r?.predicted),
    signed(Number.isFinite(r?.predicted)?r.predicted-r.observed:null),r?(r.interpolated?'Interpolated within trial':'Recorded heights'):'Outside available interval']));
   clocks.forEach(({trial:t,result:r},i)=>{
    if(!t)return;
    const p=text('p',shortName(selected[i])+' · '+t.grade+' · '+t.conditions+
     (r?.bounds?' Interval reading range '+seconds(r.bounds[0])+' to '+seconds(r.bounds[1])+'.':'')+' ','bench-note');
    p.append(link('Trial source',t.source));box.append(p);
   });
   const [a,b]=clocks.map(c=>c.result);
   if(!a || !b){box.append(text('p','A measured pair gap needs trial times for both aircraft across these heights.'));return;}
   const lead=x=>x===0?'Equal times':shortName(selected[x>0?0:1])+' by '+seconds(Math.abs(x));
   const observed=b.observed-a.observed;
   const modeled=Number.isFinite(b.predicted)&&Number.isFinite(a.predicted)?b.predicted-a.predicted:null;
   const errors=text('p','Measured lead: '+lead(observed)+'.');
   if(modeled!==null)errors.append(document.createTextNode(' Replay lead: '+lead(modeled)+'. Gap error (aircraft 2 minus aircraft 1, replay less trial): '+signed(modeled-observed)+'.'));
   box.prepend(errors);
   const tolerance=BenchmarkMatchup.compare('elapsed_time',a.observed,b.observed,data.sourceGrades.tolerances);
   let uncertainty='One or both trials lack a numerical reading range. A reversal from measurement or condition uncertainty cannot be excluded.';
   if(a.bounds && b.bounds){
    const l=b.bounds[0]-a.bounds[1], h=b.bounds[1]-a.bounds[0];
    uncertainty='Gap range from chart readings '+signed(l)+' to '+signed(h)+'. '+(l*h<=0?'These bounds allow either order.':'These reading bounds preserve the order.')+' Trial-condition uncertainty is additional.';
   }
   box.append(text('p','Practical tie margin '+seconds(tolerance.margin)+'. '+(tolerance.lead==='tie'?'The measured gap is within this margin. ':'The measured gap exceeds this margin. ')+uncertainty,'bench-note'));
  }

  function stall(){
   const box=$('bench-selected-stall');box.replaceChildren();
   appendTable(box,['Aircraft','Selected weight','Modeled clean 1 g stall','Reference status'],sides.map(side=>{
    const id=api.settings[side].id,r=api.rows[side];
    const g=data.sweep.aircraft.find(a=>a.id===id).cells.stall.groups;
    const band=data.specification.aircraft[id].stallWeightRangeLb;
    const out=band && (r.loading.weightLb<band[0] || r.loading.weightLb>band[1]);
    return [shortName(id),fmt(r.loading.weightLb,0)+' lb',Number.isFinite(r.stallEasMph)?speed(r.stallEasMph,'EAS'):'Unavailable',
     (g.length?[...new Set(g.map(v=>v.grade))].join(', '):'Unverified lift estimate')+(out?' · outside handbook weight range':'')];
   }));
   const [a,b]=sides.map(s=>api.rows[s].stallEasMph);
   if(Number.isFinite(a)&&Number.isFinite(b))box.append(text('p',a===b?'Modeled stalls coincide.':shortName(ids()[a<b?0:1])+' stalls at a modeled '+speed(Math.abs(a-b),'EAS')+' lower speed at these weights.'));
   box.append(text('p','Measured stall-speed uncertainty at these two selected weights is unquantified. A small modeled difference can reverse.','bench-note'));
   for(const id of new Set(ids())){
    const details=text('details');details.append(text('summary',shortName(id)+' · recorded stall conditions'));
    const refs=data.stallReferences[id];
    for(const r of refs){
     const p=text('p',r.aircraft+' · '+r.speed.value+' '+r.speed.unit+' '+r.speed.basis+' · '+(Number.isFinite(r.weightLb)?fmt(r.weightLb,0)+' lb':'event weight unknown')+' · power '+r.power+' · '+r.role+'. '+r.qualification+' ');
     p.append(link('Source',r.source.url));details.append(p);
    }
    for(const r of data.earlyStall[id]??[]){
     const p=text('p',r.description+' ');p.append(link('Source',r.source));details.append(p);
    }
    if(data.stallChecks[id].length)appendTable(details,['At test weight','Test','Model','Evidence'],data.stallChecks[id].map(r=>[
     Number.isFinite(r.weightLb)?fmt(r.weightLb,0)+' lb':'Unknown',fmt(r.observed)+' '+r.unit,fmt(r.predicted)+' '+r.unit,r.grade]));
    const groups=data.sweep.aircraft.find(a=>a.id===id).cells.stall.groups;
    for(const g of groups.filter(g=>g.source && !refs.some(r=>r.source.url===g.source) && !data.earlyStall[id]?.some(r=>r.source===g.source))){
     const p=text('p',g.grade+' · '+g.qualifier+'. '+g.reference+' ');p.append(link('Source',g.source));details.append(p);
    }
    if(!groups.length && !refs.length && !data.earlyStall[id]?.length)details.append(text('p','No recorded clean stall for this configuration.'));
    box.append(details);
   }
  }

  function acceleration(){
   const box=$('bench-selected-acceleration');box.replaceChildren();
   for(const id of new Set(ids())){
    const trial=data.historical.maneuvers.find(t=>t.id===id);
    box.append(text('h4',shortName(id)));
    if(!trial){box.append(text('p','No matched, timed level-acceleration test in this evidence pack.'));continue;}
    if(trial.straight){
     const finn=data.sweep.finnishAcceleration;
     const note=text('p','MT-215 · maximum power. The source leaves altitude, event weight and speed calibration open. ');
     note.append(link('Published transcription',trial.sources[0]));box.append(note);
     appendTable(box,['Reported interval','Power','Recorded time'],finn.intervals.map(r=>[r.fromKmh+'–'+r.toKmh+' km/h',r.rating,seconds(r.seconds)]));
     const details=text('details');details.append(text('summary','Conditional replay at alternative heights and speed conventions'),text('p',finn.assumptions.note));
     appendTable(details,['Assumed height','Speed basis','Radiators',...trial.straight.map(r=>r.fromKmh+'–'+r.toKmh+' km/h')],finn.scenarios.map(s=>[s.altitudeM+' m',s.speedBasis,s.openCooling?'Open':'Clean',...s.runs.map(r=>r.seconds===null?r.status:seconds(r.seconds))]));
     box.append(details);
    }else{
     const points=trial.figure.points;
     const note=text('p','Restored 45-11586 at 10,000 ft MSL, 50 °F and METO power. The wartime model approximates IAS as CAS. Both intervals come from one flight. ');
     note.append(link('Figure 8',trial.sources[1]));box.append(note);
     appendTable(box,['Figure 8 interval','Chart time','Wartime proxy','Proxy − chart'],data.restoredAcceleration.map(r=>
      [r.low+'–'+r.high+' KIAS',seconds(r.observed),seconds(r.predicted),signed(r.error)]));
     const comparison=text('details');comparison.append(text('summary','All four test aircraft at 60 seconds'));
     appendTable(comparison,['Test aircraft','Figure 8 speed','Marker'],trial.figure.comparison60s.map(p=>[p.aircraft,p.value+' ± '+p.allowance+' KIAS',p.marker]));
     box.append(comparison);
     box.append(text('p','Chart readings carry ±'+points[0].allowance+' kt. The interval timings interpolate the measured markers. Event weight and installation differ or remain uncertain.','bench-note'));
    }
   }
  }

  function roll(){
   const box=$('bench-selected-roll');box.replaceChildren();
   const selected=ids(), groups=data.sweep.roll.filter(g=>g.ids.some(id=>selected.includes(id)));
   const points=groups.flatMap(g=>g.points.filter(p=>selected.includes(p.profileId)).map(p=>({...p,group:g})));
   if(points.length){
    const element=(tag,attrs,label)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);if(label)e.textContent=label;return e;};
    const svg=element('svg',{viewBox:'0 0 500 124',role:'img','aria-label':'Measured roll rates at individual reported speeds',style:'width:100%;max-width:560px;height:auto;color:inherit'});
    const x=v=>52+(v-180)*1.6, y=v=>100-(v-40)*1.5;
    svg.append(element('path',{d:'M48 13 V101 H459',fill:'none',stroke:'currentColor'}));
    for(const v of [200,300,400])svg.append(element('text',{x:x(v),y:118,fill:'currentColor','font-size':11},v+' mph'));
    for(const v of [50,70,90])svg.append(element('text',{x:3,y:y(v)+4,fill:'currentColor','font-size':11},v+'°/s'));
    for(const p of points){
     const dot=element('circle',{cx:x(p.group.speedMph),cy:y(p.rateDegS),r:4,fill:'var(--bench-'+sides[selected.indexOf(p.profileId)]+')'});
     dot.append(element('title',{},p.aircraft+' · '+p.rateDegS+'°/s'));svg.append(dot);
    }
    box.append(svg);
    appendTable(box,['Tested aircraft','Test speed','Achieved roll rate','Evidence'],points.map(p=>[p.aircraft,p.group.speedMph+' mph · '+p.group.speedBasis,p.rateDegS+'°/s',p.group.grade]));
   }
   for(const g of groups){const p=text('p',g.aircraft+' · '+g.condition+' ','bench-note');p.append(link('Test source',g.source));box.append(p);}
   for(const id of new Set(selected))if(!points.some(p=>p.profileId===id))box.append(text('p',shortName(id)+' has no measured rate in degrees per second here.'));
  }
  for(const select of trialSelects)select.addEventListener('change',climb);
  return {climb,stall,acceleration,roll};
 }
 return {setup};
})();
