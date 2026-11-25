'use strict';
globalThis.BenchmarkHistoryUI=(()=>{
 const $=id=>document.getElementById(id);
 const el=(tag,content)=>{const n=document.createElement(tag);if(content!==undefined)n.textContent=content;return n;};
 const fmt=(n,d=1)=>Number.isFinite(n)?Number(n).toLocaleString('en-US',{maximumFractionDigits:d}):'—';
 const signed=(n,d=1)=>Number.isFinite(n)?(n>0?'+':'')+fmt(n,d):'—';
 function table(host,headers,rows){
  const scroll=el('div'),t=el('table'),h=el('thead'),r=el('tr'),b=el('tbody');
  scroll.className='bench-table-scroll';
  for(const name of headers){const th=el('th',name);th.scope='col';r.append(th);}
  for(const values of rows){const tr=el('tr');for(const v of values)tr.append(el('td',v));b.append(tr);}
  h.append(r);t.append(h,b);scroll.append(t);host.append(scroll);
 }
 function link(parent,label,url){if(!url)return;const a=el('a',label);a.href=url;parent.append(a,document.createTextNode(' '));}
 function section(parent,title){const d=el('details');d.append(el('summary',title));parent.append(d);return d;}
 function trace(host,points,observed,label,unit){
  const ns='http://www.w3.org/2000/svg';
  function svg(tag,attrs){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;}
  if(!points.length)return;
  const all=[...points,...observed],maxT=Math.max(1,...all.map(p=>p[0])),minV=Math.floor(Math.min(...all.map(p=>p[1]))/10)*10,maxV=Math.ceil(Math.max(...all.map(p=>p[1]))/10)*10;
  const x=s=>48+s/maxT*482,y=v=>131-(v-minV)/(maxV-minV||1)*106;
  const g=svg('svg',{viewBox:'0 0 560 164',role:'img','aria-label':label,style:'width:100%;max-width:640px'});
  const txt=(a,b,s)=>{const n=svg('text',{x:a,y:b,fill:'currentColor','font-size':11});n.textContent=s;g.append(n);};
  g.append(svg('path',{d:'M48 20V131H538',stroke:'currentColor',fill:'none'}));
  txt(1,28,fmt(maxV,0));txt(1,130,fmt(minV,0));txt(48,151,'0 s');txt(493,151,fmt(maxT,1)+' s');txt(50,14,unit);
  g.append(svg('polyline',{points:points.map(p=>x(p[0])+','+y(p[1])).join(' '),fill:'none',stroke:'#469cca','stroke-width':2}));
  for(const p of observed)g.append(svg('circle',{cx:x(p[0]),cy:y(p[1]),r:4,fill:'#e68b44',stroke:'currentColor','data-flight-test-point':'true'}));
  host.append(g);
 }
 function fleetEvidence(data) {
  const sweep=data.sweep, host=$('bench-sweep-results');
  const labels={level:'Level speed',climb:'Climb rate',elapsed:'Time to altitude',stall:'Clean stall',acceleration:'Level acceleration',roll:'Roll rate'};
  table(host,['Aircraft',...sweep.metrics.map(k=>labels[k])],sweep.aircraft.map(a=>[a.name,...sweep.metrics.map(k=>{
   const groups=a.cells[k].groups;
   return groups.length?[...new Set(groups.map(g=>g.grade))].join(', '):'Evidence sought';
  })]));
  const label=el('label','Aircraft evidence '), select=el('select'), detail=el('div');
  select.id='bench-sweep-aircraft';
  for(const a of sweep.aircraft){const o=el('option',a.name);o.value=a.id;select.append(o);}
  label.append(select);host.append(label,detail);
  function show(){
   detail.replaceChildren();
   const a=sweep.aircraft.find(r=>r.id===select.value);
   for(const k of sweep.metrics){
    const c=a.cells[k],d=section(detail,labels[k]);d.open=k==='level';
    for(const g of c.groups){
     const p=el('p',g.grade+' · '+g.qualifier+'. '+g.reference+' ');link(p,'Source',g.source);d.append(p);
    }
    d.append(el('p','Next evidence: '+c.next));
    if(a.bands[k]?.length)table(d,['Altitude band','Test group','Rows','Mean model − observed','Mean absolute error','Unit'],
     a.bands[k].map(r=>[r.band,r.qualifier,r.count,signed(r.signedMean),fmt(r.absoluteMean),r.unit]));
   }
  }
  select.addEventListener('change',show);show();
  const rolls=section(host,'Reported roll rates');rolls.open=true;
  table(rolls,['Aircraft','Achieved °/s','Test condition'],sweep.roll.flatMap(r=>r.points.map(p=>[p.aircraft,p.rateDegS,r.condition])));
  for(const r of sweep.roll){const p=el('p',r.aircraft+' · '+r.grade+'. ');link(p,r.locator,r.source);rolls.append(p);}
  const en=sweep.holdout,d=section(host,'Separate Spitfire HF IX test · EN.524');
  const p=el('p',en.conditions+' ');link(p,'A&AEE Tables I and IV',en.source);d.append(p);
  table(d,['Height (ft)','Gear','Observed TAS (mph)','4.16 prediction','4.17 prediction','4.17 − observed'],
   en.level.map(r=>[fmt(r.altFt),r.gear,fmt(r.observed),fmt(r.before),fmt(r.after),signed(r.error)]));
  table(d,['Height (ft)','Observed ft/min','Modeled ft/min','Error (ft/min)','Observed s','Modeled s','Error (s)'],
   en.climb.map(r=>[fmt(r.altFt),fmt(r.observedRate),fmt(r.rate),signed(r.rateError),fmt(r.observedSeconds),fmt(r.seconds),signed(r.secondsError)]));
 }
 function render(data){
  fleetEvidence(data);
  const h=data.historical, select=$('bench-archive-group'),name=key=>data.service.aircraft[h.ids[key]].displayName;
  function archives(){
   const out=$('bench-archive-results'),early=select.value==='early',keys=early?['e3','va']:['g6','f','lf','hf'];
   out.replaceChildren();
   for(const k of keys){const p=el('p',h.conditions[k]+' '),sp=data.specification.aircraft[h.ids[k]];
    for(const id of sp.sources.slice(0,k==='e3'?2:1)){const s=data.specification.sources[id];link(p,s.title,s.url);}out.append(p);}
   out.append(el('p',early?h.early.caution:h.later.caution));
   const observed=o=>o?fmt(o.value)+(o.kind==='interpolated'?' *':''):'—';
   if(early){
    table(out,['Altitude (m)','E-3 radiator / pressure','E-3 (km/h)','Va (mph TAS)','Va − E-3 (mph TAS)'],
     h.early.level.map(r=>[fmt(r.altM),r.radiator+' / '+r.pressureMm+' mm',fmt(r.eKmh),observed(r.va),signed(r.vaMinusEMph)]));
    table(out,['Altitude (ft)','E-3 (ft/min)','Va (ft/min)','Va − E-3 (ft/min)','E-3 interval (s)','Va interval (s)'],
     h.early.climb.map(r=>[fmt(r.altFt),fmt(r.eRateFpm),observed(r.vaRateFpm),signed(r.vaMinusERateFpm),fmt(r.eIntervalSeconds),fmt(r.vaIntervalSeconds)]));
   }else{
    for(const [key,title,unit] of [['level','Maximum level speed','mph TAS'],['rate','Rate of climb','ft/min'],['seconds','Elapsed climb','s']]){
     const group=section(out,title+' ('+unit+')');group.open=key==='level';
     table(group,['Altitude (ft)',...keys.map(name)],h.later.rows.map(r=>[fmt(r.altFt),...keys.map(k=>observed(r[key][k]))]));
    }
    const group=section(out,'HF minus LF level speed');group.open=true;
    table(group,['Altitude (ft)','Observed (mph TAS)','Modeled (mph TAS)','Model − observation (mph TAS)'],
     h.crossover.map(r=>[fmt(r.altFt),signed(r.observedDifferenceMph),signed(r.modeledDifferenceMph),signed(r.modeledDifferenceMph-r.observedDifferenceMph)]));
   }
   out.append(el('p','* Interpolated between readings in the same configuration. A dash marks an unavailable observation or unmatched condition.'));
   for(const k of keys){
    const id=h.ids[k],d=section(out,name(k)+' · matched model residuals');
    const intake=data.intakeChecks.aircraft.find(a=>a.id===id);
    for(const [metric,unit] of [['level','mph TAS'],['climb','ft/min'],['elapsed','s']]){
     const groups=early?[{qualifier:intake.scope,rows:intake[metric]}]:h.modelMinusSource[id][metric];
     for(const g of groups){
      d.append(el('h4',metric+' ('+unit+')'),el('p',g.qualifier));
      table(d,['Altitude or interval (ft)','Observed','Modeled','Model − observed','Test condition / row'],
       g.rows.map(r=>[r.fromFt!=null?fmt(r.fromFt)+'–'+fmt(r.toFt):fmt(r.altFt),fmt(r.observed),fmt(r.predicted),signed(r.error),
        [r.configuration,r.role,r.mode,r.gear,r.id].filter(Boolean).join(' · ')]));
     }
    }
   }
  }
   select.addEventListener('change',archives);archives();
   for(const side of ['a','b'])$('bench-aircraft-'+side).addEventListener('change',()=>{
    const ids=['a','b'].map(s=>$('bench-aircraft-'+s).value);
    const earlyIds=[h.ids.e3,h.ids.va],laterIds=[h.ids.g6,h.ids.f,h.ids.lf,h.ids.hf];
    const group=ids.every(id=>earlyIds.includes(id))?'early':ids.every(id=>laterIds.includes(id))?'later':null;
    if(group&&group!==select.value){select.value=group;archives();}
   });
  const f=$('bench-factory-results');
  f.append(el('p','WNr 16476, DB 605 A, 3,260 kg fixed, 260 km/h indicated, 2,600 rpm, 1.30 ata commanded. All three replays use the same timed factory climb, TAS schedule and modeled cooling drag.'));
  table(f,['Altitude interval','Factory (s)','Chart allowance (s)','Replay','Modeled (s)','Model − factory (s)'],
   Object.entries(h.factory.scenarios).flatMap(([key,rows])=>rows.map(r=>[r.fromKm+'–'+r.toKm+' km',fmt(r.observedS), '±'+fmt(r.endpointReadAllowanceS),
    ({baseline:'4.16 G-2 transfer',pressureOnly:'Current G-6 measured pressure',pressureAlignedToCommand:'Plateau aligned to command'})[key],fmt(r.modeledS),signed(r.errorS)])));
  f.append(el('p','The factory chart constrains manifold pressure. Installed shaft power, cooling drag and the plateau alignment remain uncertain.'));
  link(f,'G-6 factory plate',h.factory.sources.g6);link(f,'G-1 comparison',h.factory.sources.g1);link(f,'DB 605 engine sheet',h.factory.sources.engine);
  const target=$('bench-phase-data');
  for(const r of h.maneuvers){
   const d=section(target,r.title);d.open=true;
   d.append(el('p',r.note),el('p','Model overlay uses a 4 G command, '+fmt(r.model.weightLb,0)+' lb, '+fmt(r.model.altFt,0)+' ft and '+r.model.mode+' power on the operating profile. IAS is approximated as CAS. The command and event weight are assumptions.'));
   table(d,['Stage','Source','Modeled proxy','Proxy − source'],[
    ['Entry ('+r.unit+')',fmt(r.entry),fmt(r.model.entry),'Input'],
    ['180° turn (s)',fmt(r.turnSeconds),fmt(r.model.turnSeconds),signed(r.model.turnSeconds-r.turnSeconds)],
    ['Exit ('+r.unit+')',fmt(r.exit),fmt(r.model.exit),r.exit===null?'—':signed(r.model.exit-r.exit)],
    ['Recovery to entry (s)','Unrecorded',fmt(r.model.recovery),'—']]);
   const dots=[[0,r.entry]];if(r.exit!==null)dots.push([r.turnSeconds,r.exit]);
   d.append(el('p','Blue line shows the modeled turn and recovery. Orange points mark reported speeds.'));trace(d,r.model.trace,dots,r.title+' turn and recovery',r.unit);
   if(r.straight){
    table(d,['Separate straight acceleration (km/h)','Recorded time (s)'],r.straight.map(s=>[s.fromKmh+'–'+s.toKmh,fmt(s.seconds)]));
    d.append(el('p','Interpolating the two straight runs gives '+fmt(r.estimate)+' s across the lost speed. The post-turn recovery was unrecorded.'));
   }else{
    const a=r.figure;d.append(el('h4','Separate straight acceleration at METO'));
    table(d,['Event','Observed','Modeled proxy','Proxy − source'],[
     ['Speed at 60 s',a.observed60sKias.join('–')+' KIAS',fmt(a.modeled60sProxyKias,2)+' proxy KIAS',a.residualKias.map(v=>signed(v,2)).join(' to ')+' kt'],
     ['Printed maximum',a.recordedFigureLabelMaxKias+' KIAS','—','—'],
     ['Time to secondary '+a.secondaryTargetKias+' KIAS endpoint',fmt(a.secondaryElapsedSeconds)+' s',fmt(a.modeledSecondsToSecondaryTarget)+' s',signed(a.residualSeconds)+' s']]);
    trace(d,r.straightTrace,a.observed60sKias.map(v=>[60,v]),'Mustang separate straight acceleration; markers bound the 60-second reading','KIAS proxy');
   }
   r.sources.forEach((url,i)=>link(d,(r.secondary?'Transcription ':'Test source ')+(i+1),url));
  }
 }
 return {render};
})();
