'use strict';

(()=>{
 const P=TurnPerformance;
 const svgNs='http://www.w3.org/2000/svg';
 const paint={a:'#75dbff',b:'#ffc077'};
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
 function chartPath(rows,x,y,value){
  let d='',previous=false;
  for(const row of rows){
   const v=value(row);
   if(Number.isFinite(v)){d+=(previous?'L':'M')+x(row.eas)+','+y(v);previous=true;}
   else previous=false;
  }
  return d;
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

 function advantage({host,readout,limits,minEas,maxEas,unit,names,evaluateAt,policy,selectSpeed}){
  const width=780,height=214,left=76,right=758,top=23,bottom=160;
  const cache=new Map();
  function sample(eas){
   if(!cache.has(eas)){
    const aircraft=Object.fromEntries(sides.map(side=>[side,P.assessment(evaluateAt(side,eas,false),policy)]));
    cache.set(eas,{eas,aircraft,difference:P.difference(aircraft.a,aircraft.b)});
   }
   return cache.get(eas);
  }
  const rows=[];
  for(let eas=minEas;eas<=maxEas;eas+=2)rows.push(sample(eas));
  if(rows.at(-1).eas<maxEas)rows.push(sample(maxEas));
  const supported=rows.filter(r=>r.difference);
  if(!supported.length){
   host.replaceChildren(el('p','The selected aircraft have no shared sustained-turn speed range.','bench-note'));
   return {update(eas){
    readout.replaceChildren();
    limits.replaceChildren(...sides.map(side=>limitsCard(names[side],sample(eas).aircraft[side],side)));
   }};
  }
  const maxRate=Math.max(1,...supported.flatMap(r=>[Math.abs(r.difference.rateDegSec),...(r.difference.range??[]).map(Math.abs)]));
  const step=[.5,1,2,3,5,10].find(n=>maxRate<=3*n)??10;
  const bound=Math.ceil(maxRate/step)*step;
  const x=eas=>left+(right-left)*(eas-minEas)/(maxEas-minEas);
  const y=rate=>top+(bottom-top)*(bound-rate)/(2*bound);
  const g=svg(width,height,'Sustained-turn advantage in degrees per second at the shared airspeed. Positive values favour aircraft 1.');
  const zero=y(0);
  draw(g,'rect',{x:left,y:top,width:right-left,height:zero-top,fill:paint.a,opacity:.045});
  draw(g,'rect',{x:left,y:zero,width:right-left,height:bottom-zero,fill:paint.b,opacity:.045});
  g.dataset.minEas=minEas;
  g.dataset.maxEas=maxEas;
  for(const {eas,label} of OperatingBenchmarkChart.ticks(minEas,maxEas,unit)){
   const at=x(eas);
   draw(g,'line',{x1:at,x2:at,y1:top,y2:bottom,class:'bench-grid-line'});
   draw(g,'text',{x:at,y:bottom+28,'text-anchor':'middle'},label);
  }
  for(let n=-bound;n<=bound;n+=step){
   const at=y(n);
   draw(g,'line',{x1:left,x2:right,y1:at,y2:at,class:n===0?'bench-advantage-zero':'bench-grid-line'});
   draw(g,'text',{x:left-11,y:at+5,'text-anchor':'end'},signed(n,step<1?1:0));
  }
  draw(g,'text',{x:left,y:16},'Aircraft 1 − Aircraft 2 (°/s)');
  const unitLabel=OperatingBenchmarkChart.speed(1,unit,'EAS').replace(/^[\d,.]+ /,'');
  draw(g,'text',{x:(left+right)/2,y:height-2,'text-anchor':'middle'},'Equivalent airspeed ('+unitLabel+')');

  let segment=[];
  function band(){
   if(segment.length>1){
    const upper=segment.map(r=>[x(r.eas),y(r.difference.range[1])]);
    const lower=segment.slice().reverse().map(r=>[x(r.eas),y(r.difference.range[0])]);
    draw(g,'polygon',{points:[...upper,...lower].map(a=>a.join(',')).join(' '),class:'bench-advantage-band','data-turn-range':''});
   }
   segment=[];
  }
  for(const row of rows){if(row.difference?.range)segment.push(row);else band();}
  band();
  draw(g,'path',{d:chartPath(rows,x,y,r=>r.difference?.rateDegSec),fill:'none',
   stroke:'#f1f3f7','stroke-width':2.6,'data-turn-difference':''});
  for(const [i,r] of rows.entries()){
   const side=r.difference?.side,next=rows[i+1];
   if(side&&next?.difference?.side===side){
    const bar=draw(g,'line',{x1:x(r.eas),x2:x(next.eas),y1:bottom+7,y2:bottom+7,
     stroke:paint[side]??'#84919e','stroke-width':4});
    draw(bar,'title',{},side==='uncertain'?'Lead depends on the tested inputs':names[side]+' leads across the tested inputs');
   }
  }
  const crosshair=draw(g,'line',{y1:top,y2:bottom,class:'bench-crosshair','data-advantage-crosshair':''});
  const marker=draw(g,'circle',{r:4.5,class:'bench-probe-dot'});
  host.replaceChildren(g);
  function pointer(event){
   const transform=g.getScreenCTM();
   if(!transform)return;
   const at=new DOMPoint(event.clientX,event.clientY).matrixTransform(transform.inverse());
   if(at.x>=left&&at.x<=right&&at.y>=top&&at.y<=bottom+11){
    selectSpeed(minEas+(maxEas-minEas)*(at.x-left)/(right-left));
   }
  }
  g.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')pointer(e);});
  g.addEventListener('pointerdown',pointer);

  function update(eas){
   const {aircraft,difference:d}=sample(eas);
   const at=x(eas);
   crosshair.setAttribute('x1',at);crosshair.setAttribute('x2',at);
   marker.style.display=d?'':'none';
   readout.replaceChildren();
   if(!d){
    readout.append(el('strong','Difference unavailable'),el('span','Both aircraft need a sustained turn at the selected speed.','bench-note'));
   }else{
    const leader=d.rateDegSec>=0?'a':'b';
    marker.setAttribute('cx',at);marker.setAttribute('cy',y(d.rateDegSec));marker.setAttribute('fill',paint[leader]);
    const title=Math.abs(d.rateDegSec)<.05?'Similar modeled turn rates':names[leader]+' +'+fmt(Math.abs(d.rateDegSec))+'°/s';
    readout.append(el('strong',title,'bench-'+leader),
     el('span',fmt(Math.abs(d.g),2)+' G difference · '+OperatingBenchmarkChart.speed(eas,unit,'EAS'),'bench-note'));
    if(d.range){
     const message=d.side==='uncertain'?'The lead can change across tested inputs.':names[d.side]+' leads across tested inputs.';
     readout.append(el('span','Tested difference '+d.range.map(n=>signed(n)).join(' to ')+'°/s. '+message,'bench-note'));
    }else if(policy)readout.append(el('span','The tested range includes a case outside sustained flight.','bench-note'));
   }
   limits.replaceChildren(...sides.map(side=>limitsCard(names[side],aircraft[side],side)));
  }
  return {update};
 }

 function evidence(host,source,checks,policy,direct){
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
  const list=el('ul',undefined,'bench-evidence-sources');
  for(const source of direct.sources){
   const item=el('li'),a=el('a',source.title);
   a.href=source.url;a.target='_blank';a.rel='noopener';
   item.append(a,el('small',source.scope));list.append(item);
  }
  host.append(list);
 }

 globalThis.OperatingTurnComparison=Object.freeze({advantage,evidence});
})();
