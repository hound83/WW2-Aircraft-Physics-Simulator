'use strict';

(()=>{
 const P=TurnPerformance,Evidence=BenchmarkGraphEvidence,Match=BenchmarkMatchup;
 const svgNs='http://www.w3.org/2000/svg';
 const paint=Evidence.colors('us','germany');
 const sides=['a','b'];
 const fmt=(n,d=1)=>Number.isFinite(n)?n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
 const signed=(n,d=1)=>(n<0?'−':n>0?'+':'')+fmt(Math.abs(n),d);
 const el=(tag,text,style)=>{
  const node=document.createElement(tag);
  if(text!==undefined)node.textContent=text;
  if(style)node.className=style;
  return node;
 };
 function svg(w,h,label){
  const node=document.createElementNS(svgNs,'svg');
  node.setAttribute('viewBox','0 0 '+w+' '+h);
  node.setAttribute('role','img');
  node.setAttribute('aria-label',label);
  return node;
 }
 function draw(parent,tag,attrs,text){
  const node=document.createElementNS(svgNs,tag);
  for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);
  if(text!==undefined)node.textContent=text;
  parent.append(node);
  return node;
 }

 function limitsCard(name,assessment,side){
  const card=el('article',undefined,'bench-limit-card');
  card.dataset.side=side;
  card.append(el('h4',name));
  const r=assessment.nominal;
  if(!r?.turn){
   card.append(el('p','A sustained turn is unavailable at this speed.','bench-note'));
   return card;
  }
  const limits=[['Lift','lift',r.nLift],['Available power','power',r.nPower],['Model G cap','structure',r.nStructure]];
  card.append(el('p',fmt(r.turn.g,2)+' G · '+fmt(r.turn.bankDeg,0)+'° bank · '+fmt(r.turn.radiusM,0)+' m radius','bench-limit-stats'));
  const list=el('dl',undefined,'bench-limit-bars');
  for(const [label,key,n] of limits){
   const row=el('div'),term=el('dt',label),detail=el('dd'),track=el('span',undefined,'bench-limit-track');
   track.setAttribute('aria-hidden','true');
   const bar=el('span');bar.style.width=Math.min(100,n/r.nStructure*100)+'%';
   if(key===r.limiting)row.dataset.binding='true';
   track.append(bar);
   detail.append(track,el('span',fmt(n,2)+' G'));
   row.append(term,detail);list.append(row);
  }
  card.append(list);
  if(assessment.evidence)card.append(el('p','TN 1044 lift transfer · Mach '+fmt(assessment.evidence.mach,2),'bench-note'));
  const power=el('div',undefined,'bench-power-budget');
  power.setAttribute('aria-hidden','true');
  for(const [name,hp] of [['level',r.levelHp],['turn',r.turnDragHp]]){
   const bar=el('span');bar.className='bench-power-'+name;bar.style.width=Math.min(100,hp/r.availableHp*100)+'%';
   power.append(bar);
  }
  card.append(power,el('p',fmt(r.levelHp,0)+' hp for level flight + '+fmt(r.turnDragHp,0)+' hp to turn · '+fmt(r.availableHp,0)+' hp available','bench-note'));
  return card;
 }

 function updateDragProbe({host,evaluateAt,donor},eas,row,names,policy,turnUnit,turnMargin){
  if(!row.difference){
   host.replaceChildren(el('p','Both aircraft need sustained flight at this speed to compare turn drag.','bench-note'));
   return;
  }
  const flights=sides.map(side=>evaluateAt(side,eas,false));
  const nominal=sides.map(side=>row.aircraft[side].nominal);
  const dragRange=policy.incrementalDragFraction;
  const tested=flights.map((flight,i)=>P.dragSensitivity(flight,nominal[i],nominal[1-i].turn.g,dragRange));
  const change=P.difference(...tested,turnUnit.field);
  const percent=multiplier=>signed((multiplier-1)*100,1)+'%';
  host.replaceChildren(el('p','Extra drag varied '+dragRange.map(percent).join(' to ')+' on each aircraft. Lift and useful power are held at their nominal values.','bench-note'));
  if(change.range){
   const rateRange=turnUnit.field==='rateDegSec'?change.range:P.difference(...tested).range;
   const verdict=Match.turnVerdict(rateRange,turnMargin);
   const outcome=verdict==='uncertain'?'The lead depends on drag.':verdict==='tie'?'Effectively tied across the drag sweep.':
    names[verdict]+' leads across the drag sweep.';
   const line=el('p',undefined,'bench-note');
   const range=el('strong',change.range.map(n=>signed(n,turnUnit.digits)).join(' to ')+' '+turnUnit.label);
   range.dataset.dragRange='';
   line.append(range,' for '+names.a+' minus '+names.b+'. '+outcome);
   host.append(line);
  }else{
   host.append(el('p','The drag sweep crosses a sustained-flight boundary.','bench-note'));
  }

  const list=el('ul',undefined,'bench-evidence-sources');
  for(const [i,side] of sides.entries()){
   const parity=tested[i].parity;
   if(!parity)continue;
   const rival=names[sides[1-i]];
   const line=el('li',names[side]+(parity.limiting?' reaches its '+parity.limiting+' limit below '+rival+'’s nominal turn.':
    ' reaches '+rival+'’s nominal turn at '+percent(parity.fraction)+' change in added turn drag.'));
   line.dataset.dragParity=side;
   list.append(line);
  }
  if(list.children.length)host.append(list);
  if(!donor||eas<donor.range[0]||eas>donor.range[1])return;

  const transfer=P.boundedDragTurn(flights[sides.indexOf(donor.side)],donor.transfer);
  if(!transfer)return;
  const name=names[donor.side], value=fmt(transfer.turn[turnUnit.field],turnUnit.digits+1)+' '+turnUnit.label;
  const reference=fmt(nominal[sides.indexOf(donor.side)].turn[turnUnit.field],turnUnit.digits+1)+' '+turnUnit.label;
  const info=el('p',undefined,'bench-note');
  info.dataset.dragDonor='';
  info.append(el('strong','Provisional Spitfire Mk I glide replay. '),name+' reaches '+(transfer.lowerBound?'at least ':'')+value+
   ' in this scenario. Nominal '+reference+'. '+(transfer.lowerBound?
    'At the last measured lift coefficient, '+fmt(transfer.remainingHp,0)+' hp remains. The replay stops there.':
    'The modeled limiting point is inside the source lift range.'));
  const link=el('a',donor.title);
  link.href=donor.url;link.target='_blank';link.rel='noopener';
  info.append(' ',link);
  host.append(info);
 }

 function advantage({host,readout,limits,minEas,maxEas,unit,turnUnit,names,colors,pointAt,policy,series,soloKey,tolerances,dragProbe}){
  const width=780,height=214,left=76,right=758,top=23,bottom=160;
  const cache=new Map(),levels=series.map(a=>a.levelEasMph),load=turnUnit.key==='g';
  const referenceLoad=load?1:0,turnMargin=tolerances.sustained_turn_rate.spread;
  function sample(eas){
   if(cache.has(eas))return cache.get(eas);
   const points=sides.map(side=>pointAt(side,eas,'turn'));
   const [a,b]=points,aircraft={a:a.assessment,b:b.assessment};
   const comparable=Number.isFinite(a.rate)&&Number.isFinite(b.rate);
   const rateDifference=comparable?P.difference(aircraft.a,aircraft.b):null;
   const difference=load&&rateDifference?P.difference(aircraft.a,aircraft.b,'g'):rateDifference;
   const nominal=rateDifference?Match.compare('sustained_turn_rate',rateDifference.rateDegSec,0,tolerances):null;
   const verdict=Match.turnVerdict(rateDifference?.range,turnMargin);
   let solo=null;
   for(const [i,point] of points.entries()){
    const opposite=levels[1-i],own=levels[i],turn=point.assessment.nominal?.turn;
    if(Number.isFinite(own)&&Number.isFinite(opposite)&&own>opposite&&eas>=opposite&&eas<=own&&Number.isFinite(point.rate)&&turn){
     solo={side:sides[i],rate:(i===0?1:-1)*(turn[turnUnit.field]-referenceLoad)};
    }
   }
   const row={...Evidence.sample(eas,difference?.[turnUnit.field],a.covered&&b.covered,difference?.range),aircraft,difference,solo,nominal,verdict};
   cache.set(eas,row);
   return row;
  }
  const speeds=new Set([minEas,maxEas,...levels.filter(Number.isFinite)]);
  for(let eas=minEas;eas<maxEas;eas+=2)speeds.add(eas);
  const rows=[...speeds].filter(eas=>eas>=minEas&&eas<=maxEas).sort((a,b)=>a-b).map(sample);
  const supported=rows.filter(r=>r.difference||r.solo);
  if(!supported.length){
   host.replaceChildren(el('p','Turn advantage is unavailable at this altitude.','bench-note'));
   return {update(eas){
    const row=sample(eas);
    limits.replaceChildren(...sides.map(side=>limitsCard(names[side],row.aircraft[side],side)));
    if(dragProbe)updateDragProbe(dragProbe,eas,row,names,policy,turnUnit,turnMargin);
   }};
  }
  soloKey.hidden=!rows.some(r=>r.solo&&r.solo.rate!==0);
  const maxRate=Math.max(load ? .1 : 1,...supported.flatMap(r=>[
   Math.abs(r.rate??0),Math.abs(r.solo?.rate??0),...(r.range??[]).map(Math.abs)]));
  const step=[.05,.1,.2,.25,.5,1,2,3,5,10,20].find(n=>maxRate<=3*n)??25;
  const tickCount=Math.ceil(maxRate/step),bound=tickCount*step;
  const x=eas=>left+(right-left)*(eas-minEas)/(maxEas-minEas);
  const y=rate=>top+(bottom-top)*(bound-rate)/(2*bound);
  const g=svg(width,height,'Sustained-turn advantage in '+turnUnit.label+' at the shared airspeed. Positive values favour '+names.a+'. Negative values favour '+names.b+'.');
  const zero=y(0);
  draw(g,'rect',{x:left,y:top,width:right-left,height:zero-top,fill:colors.a,opacity:.045});
  draw(g,'rect',{x:left,y:zero,width:right-left,height:bottom-zero,fill:colors.b,opacity:.045});
  g.dataset.minEas=minEas;
  g.dataset.maxEas=maxEas;
  for(const {eas,label} of OperatingBenchmarkChart.ticks(minEas,maxEas,unit)){
   const at=x(eas);
   draw(g,'line',{x1:at,x2:at,y1:top,y2:bottom,class:'bench-grid-line'});
   draw(g,'text',{x:at,y:bottom+28,'text-anchor':'middle'},label);
  }
  for(let tick=-tickCount;tick<=tickCount;tick++){
   const n=tick*step,at=y(n);
   draw(g,'line',{x1:left,x2:right,y1:at,y2:at,class:n===0?'bench-advantage-zero':'bench-grid-line'});
   draw(g,'text',{x:left-11,y:at+5,'text-anchor':'end'},signed(n,step<.1||step===.25?2:step<1?1:0));
  }
  const title=draw(g,'text',{x:left,y:16});
  draw(title,'tspan',{fill:colors.a},names.a);
  draw(title,'tspan',{},' − ');
  draw(title,'tspan',{fill:colors.b},names.b);
  draw(title,'tspan',{},' ('+turnUnit.label+')');
  const unitLabel=OperatingBenchmarkChart.speed(1,unit,'EAS').replace(/^[\d,.]+ /,'');
  draw(g,'text',{x:(left+right)/2,y:height-2,'text-anchor':'middle'},'Equivalent airspeed ('+unitLabel+')');

  for(const band of Evidence.bands(rows)){
   const upper=band.map(r=>[x(r.eas),y(r.range[1])]);
   const lower=band.slice().reverse().map(r=>[x(r.eas),y(r.range[0])]);
   draw(g,'polygon',{points:[...upper,...lower].map(a=>a.join(',')).join(' '),class:'bench-advantage-band','data-turn-range':''});
  }
  const path=segment=>segment.points.map((p,i)=>(i?'L':'M')+x(p.eas)+','+y(p.rate)).join('');
  for(const segment of Evidence.lineSegments(rows)){
   draw(g,'path',{d:path(segment),fill:'none',stroke:'#f1f3f7','stroke-width':2.6,'stroke-linecap':'round',
    'data-turn-difference':'','data-bench-style':segment.solid?'solid':'dotted',
    ...(segment.solid?{}:{'stroke-dasharray':'1 6'})});
  }
  for(const side of sides){
   const points=rows.map(r=>({eas:r.eas,rate:r.solo?.side===side?r.solo.rate:null}));
   for(const segment of Evidence.lineSegments(points)){
    draw(g,'path',{d:path(segment),fill:'none',stroke:colors[side],'stroke-width':3,'stroke-dasharray':'7 5','data-turn-solo':side});
    const strip=draw(g,'line',{x1:x(segment.points[0].eas),x2:x(segment.points.at(-1).eas),y1:bottom+8,y2:bottom+8,
     stroke:colors[side],'stroke-width':7,'stroke-dasharray':'6 3','data-turn-solo-lead':side});
    draw(strip,'title',{},'Only '+names[side]+' can sustain flight at modeled power');
   }
  }
  function verdictLabel(verdict){
   if(verdict==='tie')return 'Effectively tied across tested inputs';
   if(verdict==='uncertain')return 'Outcome depends on tested inputs';
   return names[verdict]+' has a clear lead across tested inputs';
  }
  for(let i=0;i<rows.length-1;){
   const verdict=rows[i].verdict;let end=i+1;
   while(end<rows.length&&rows[end].verdict===verdict)end++;
   if(verdict&&end>i+1){
    const bar=draw(g,'line',{x1:x(rows[i].eas),x2:x(rows[end-1].eas),y1:bottom+8,y2:bottom+8,
     stroke:colors[verdict]??(verdict==='tie'?'#e0e5eb':'#84919e'),'stroke-width':7,'data-bench-lead':verdict});
    draw(bar,'title',{},verdictLabel(verdict));
   }
   i=end;
  }
  const crosshair=draw(g,'line',{y1:top,y2:bottom,class:'bench-crosshair','data-advantage-crosshair':''});
  const marker=draw(g,'circle',{r:4.5,class:'bench-probe-dot'});
  host.replaceChildren(g);
  function summary({difference,solo,nominal}){
   if(!difference)return solo?'Only '+names[solo.side]+' can sustain flight':'Difference unavailable';
   const value=difference[turnUnit.field];
   if(nominal.lead==='tie')return 'Effectively tied';
   return names[nominal.lead]+' +'+fmt(Math.abs(value),turnUnit.digits)+(load?' G':'°/s');
  }

  function update(eas){
   const row=sample(eas),{aircraft,difference:d,solo,nominal,verdict}=row;
   const at=x(eas),value=d?.[turnUnit.field]??solo?.rate;
   const leader=d?nominal.lead:solo?.side;
   crosshair.setAttribute('x1',at);crosshair.setAttribute('x2',at);
   marker.style.display=Number.isFinite(value)?'':'none';
   readout.replaceChildren(el('strong',summary(row),colors[leader]?'bench-'+leader:undefined));
   if(Number.isFinite(value)){
    marker.setAttribute('cx',at);marker.setAttribute('cy',y(value));marker.setAttribute('fill',colors[leader]??'#c1cad5');
   }
   const speed=OperatingBenchmarkChart.speed(eas,unit,'EAS');
   if(d){
    const alternate=load?fmt(Math.abs(d.rateDegSec))+'°/s':fmt(Math.abs(d.g),2)+' G';
    readout.append(el('span',alternate+' difference · '+speed,'bench-note'));
    if(d.range){
     const message=verdict?verdictLabel(verdict)+'.':'';
     readout.append(el('span','Tested difference '+d.range.map(n=>signed(n,turnUnit.digits)).join(' to ')+' '+turnUnit.label+'. '+message,'bench-note'));
    }else if(policy)readout.append(el('span','The tested range includes a case outside sustained flight.','bench-note'));
   }else if(solo){
    const turn=aircraft[solo.side].nominal.turn;
    readout.append(el('span',fmt(turn[turnUnit.field],turnUnit.digits)+' '+turnUnit.label+' sustained · '+speed+' · other aircraft above maximum level speed','bench-note'));
   }else readout.append(el('span','Both aircraft need supported flight at this speed for a difference.','bench-note'));
   limits.replaceChildren(...sides.map(side=>limitsCard(names[side],aircraft[side],side)));
   if(dragProbe)updateDragProbe(dragProbe,eas,row,names,policy,turnUnit,turnMargin);
  }
  return {kind:'advantage',host,svg:g,left,right,top,bottom,x,update,tipText:eas=>summary(sample(eas))};
 }

 function evidence(host,source,checks,policy,direct,turnDrag){
  const p=source.mustang;
  const graph=el('div',undefined,'bench-chart');
  const g=svg(780,252,'NACA P-51B maneuver lift. Held-out bands and the fitted curve by Mach number.');
  const left=76,right=758,top=28,bottom=196;
  const x=m=>left+(right-left)*(m-.20)/.28,y=cl=>bottom-(bottom-top)*(cl-1)/.65;
  for(const mach of [.20,.25,.30,.35,.40,.45]){
   draw(g,'line',{x1:x(mach),x2:x(mach),y1:top,y2:bottom,class:'bench-grid-line'});
   draw(g,'text',{x:x(mach),y:bottom+25,'text-anchor':'middle'},fmt(mach,2));
  }
  for(const cl of [1,1.2,1.4,1.6]){
   draw(g,'line',{x1:left,x2:right,y1:y(cl),y2:y(cl),class:'bench-grid-line'});
   draw(g,'text',{x:left-11,y:y(cl)+5,'text-anchor':'end'},fmt(cl));
  }
  draw(g,'text',{x:left,y:17},'Usable maneuver lift coefficient');
  draw(g,'text',{x:(left+right)/2,y:244,'text-anchor':'middle'},'Mach number');
  const before=checks.rows[0].before;
  draw(g,'line',{x1:left,x2:right,y1:y(before),y2:y(before),stroke:'#aebdca','stroke-width':2,'stroke-dasharray':'6 5'});
  const fit=p.fit.map(([m,lo,hi])=>[x(m),y((lo+hi)/2)]);
  draw(g,'polyline',{points:fit.map(pair=>pair.join(',')).join(' '),fill:'none',stroke:paint.a,'stroke-width':3});
  for(const [cx,cy] of fit)draw(g,'circle',{cx,cy,r:3.5,fill:paint.a});
  for(const r of checks.rows){
   const cx=x(r.mach),lo=y(r.observedBand[0]),hi=y(r.observedBand[1]);
   const group=draw(g,'g',{'data-lift-check':r.mach});
   draw(group,'line',{x1:cx,x2:cx,y1:lo,y2:hi,stroke:paint.b,'stroke-width':3});
   for(const at of [lo,hi])draw(group,'line',{x1:cx-5,x2:cx+5,y1:at,y2:at,stroke:paint.b,'stroke-width':3});
   draw(group,'title',{},'Mach '+fmt(r.mach,2)+' · Read band '+r.observedBand.map(n=>fmt(n,2)).join('–')+
    ' · Fitted '+fmt(r.after,2));
  }
  graph.append(g);
  const legends=el('p',undefined,'bench-note bench-evidence-legend');
  legends.append(el('span','– – v4.3 reference outside its lift gate'),el('span','● v4.4 lift fit','bench-a'),el('span','│ Held-out chart readings','bench-b'));
  const link=el('a','Original NACA report');
  link.href=p.url;link.target='_blank';link.rel='noopener';
  const spread=(range)=>range.map(n=>signed((n-1)*100,0)+'%').join(' to ');
  host.replaceChildren(el('h4','Mustang lift measured in flight'),graph,legends,
   el('p','The fitted curve lies inside all '+checks.rows.length+' reserved reading bands. The NACA tests used a throttled engine. Applying the lift curve to a powered turn is a same-type transfer.','bench-note'),link,
   el('h4','Inputs varied for the Mustang–Spitfire comparison'),
   el('p','Maneuver lift '+spread(policy.maneuverLiftFraction)+', useful power '+spread(policy.usefulPowerFraction)+
    ', extra drag above 1 G '+spread(policy.incrementalDragFraction)+'. The Mustang range also includes the lift spread read from Figure 6 where the transfer applies.','bench-note'),
   el('p','The band shows the extremes of these tested inputs. A band crossing zero means the ranking depends on them.','bench-note'),
   el('h4','Historical turn verification'),
   el('p',direct.matched===0?'Matched powered sustained-turn records remain open for this pair. The reports below constrain lift, drag or straight-flight performance.':'Matched powered sustained-turn records '+direct.matched+'.','bench-note'));
  const glide=turnDrag.glide;
  const glideLink=el('a',glide.title);
  glideLink.href=glide.url;glideLink.target='_blank';glideLink.rel='noopener';
  host.append(el('h4','Spitfire Mk I glide drag'),el('p',
   'Four clean, engine-off points fit the drag slope. Across '+glide.checkCount+' reserved speeds, mean absolute sink-rate error falls from '+
   fmt(glide.checks.controlMaeFpm,1)+' to '+fmt(glide.checks.candidateMaeFpm,1)+' ft/min. At '+fmt(glide.adverse.easMph,0)+
   ' mph, the fitted sink rate is '+signed(glide.adverse.errorFpm,0)+' ft/min from the reported value. The replay uses an earlier Spitfire with a windmilling propeller.','bench-note'),glideLink);
  const list=el('ul',undefined,'bench-evidence-sources');
  for(const source of [...direct.sources,...turnDrag.sources.filter(s=>s.role==='XP-51B high-lift drag lead'||s.role==='Separate qualitative turning comparison')]){
   const item=el('li'),a=el('a',source.title);
   a.href=source.url;a.target='_blank';a.rel='noopener';
   item.append(a,el('small',source.scope??source.finding));list.append(item);
  }
  host.append(list);
 }

 globalThis.OperatingTurnComparison=Object.freeze({advantage,evidence});
})();
