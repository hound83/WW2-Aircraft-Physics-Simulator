'use strict';

(() => {
 const Evidence = BenchmarkGraphEvidence;
 const units = {
  mph: { label: 'mph', factor: 1 },
  kph: { label: 'km/h', factor: 1.609344 },
  knots: { label: 'kn', factor: 1609.344 / 1852 }
 };
 const probeStepMph = 5;
 const turnUnits = {
  rate: {key:'rate',label:'°/s',digits:1,field:'rateDegSec',peak:'sustained'},
  g: {key:'g',label:'G',digits:2,field:'g',peak:'sustainedLoad'}
 };
 const format = (value, digits = 0) => value.toLocaleString('en-US', {
  minimumFractionDigits: digits, maximumFractionDigits: digits
 });
 function speed(value, unit, kind, digits = 0) {
  if (!Number.isFinite(value)) return '—';
  return format(value * units[unit].factor, digits) + ' ' + units[unit].label + ' ' + kind;
 }

 const signedAcceleration = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero', minimumFractionDigits: 2, maximumFractionDigits: 2
 });
 const accelerationUnit = unit => units[unit].label + '/s';
 function accelerationLabel(rate, unit) {
  return Number.isFinite(rate) ? signedAcceleration.format(rate * units[unit].factor) + ' ' + accelerationUnit(unit) : 'Acceleration unavailable';
 }

 function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content) node.textContent = content;
  if (className) node.className = className;
  return node;
 }

 function plotPoints(aircraft, pointAt) {
  const { minEasMph, maxEasMph } = aircraft.range;
  const speeds = new Set([minEasMph, maxEasMph]);
  for (let eas = Math.ceil(minEasMph / 2) * 2; eas < maxEasMph; eas += 2) speeds.add(eas);
  for(const peak of [aircraft.peakEasMph,aircraft.peakLoad?.easMph]){
   if(peak>=minEasMph&&peak<=maxEasMph)speeds.add(peak);
  }
  // At the level-speed equilibrium all available power sustains 1 G.
  return [...speeds].sort((a, b) => a - b).map(eas =>
   pointAt(aircraft.side,eas,'turn'));
 }

 function probeAircraft(aircraft, easMph, evaluateAt, pointAt) {
  const flight = evaluateAt(aircraft.side, easMph);
  const climb = evaluateAt(aircraft.side, easMph, true);
  const turn = pointAt(aircraft.side,easMph,'turn');
  const sustainedG = turn.load;
  let turnStatus = 'Sustained turn unavailable';
  if (Number.isFinite(sustainedG)) turnStatus = null;
  else if (flight.status === 'source-power-unavailable') turnStatus = 'Power data unavailable';
  else if (easMph < aircraft.stallEasMph) turnStatus = 'Below 1 G stall';
  else if (aircraft.levelEasMph !== null && easMph > aircraft.levelEasMph) {
   turnStatus = 'Above maximum level speed';
  }
  return {
   sustainedG,
   turnRate: turn.rate,
   climbFpm: climb.status === 'modelled' ? climb.power?.climbFpm ?? null : null,
   accelerationMphPerSecond: pointAt(aircraft.side,easMph,'acceleration').rate,
   turnStatus
  };
 }

 function climbLabel(rate) {
  if (!Number.isFinite(rate)) return '—';
  return rate > 0 ? format(rate) + ' ft/min' : 'No positive climb';
 }

 function probeCard(aircraft) {
  const card = element('div', null, 'bench-probe-card');
  card.dataset.side = aircraft.side;
  card.append(element('strong', aircraft.name, 'bench-probe-name'));
  return card;
 }

 function readoutCard(aircraft, point, unit, evidence, locked, turnUnit) {
  const card = probeCard(aircraft);
  const bounds = '1 G stall ' + speed(aircraft.stallEasMph, unit, 'EAS') +
    ' · Max level ' + speed(aircraft.levelEasMph, unit, 'EAS');
  card.append(element('p', bounds, 'bench-note bench-probe-bounds'));
  if (aircraft.range?.minEasMph - aircraft.stallEasMph > .1) {
   card.append(element('p', 'First sustainable speed ' + speed(aircraft.range.minEasMph, unit, 'EAS'), 'bench-note'));
  }
  const metrics = element('dl', null, 'bench-probe-metrics');
  for (const [label, value] of [
   ['Sustained turn', point.turnRate === null ? '—' : format(point.turnRate, 1) + '°/s'],
   ['Max sustained G', point.sustainedG === null ? '—' : format(point.sustainedG, 2) + ' G']
  ]) {
   const entry = element('div');
   entry.append(element('dt', label), element('dd', value));
   metrics.append(entry);
  }
  card.append(metrics);
  if(!point.turnStatus)appendEvidence(card,evidence,locked,turnUnit.label,turnUnit.digits);
  if (point.turnStatus) card.append(element('p', point.turnStatus, 'bench-note'));
  return card;
 }

 function appendEvidence(parent, point, locked, unit, digits) {
  parent.append(element('p',point.evidence.label,'bench-note'));
  const reference=point.evidence.reference;
  if(point.range)parent.append(element('p',(reference?'Report-adjusted range ':'Tested input range ')+point.range.map(v=>format(v,digits)).join('–')+' '+unit,'bench-note'));
  if(point.outsideRange)parent.append(element('p','The estimate falls outside the '+(reference?'report-adjusted':'tested input')+' range.','bench-note'));
  if(!locked)return;
  if(reference)parent.append(element('p','Report '+format(reference.observed)+' ft/min at '+format(reference.weightLb)+' lb','bench-note'));
  const links=element('div',null,'bench-probe-links');
  for(const source of [point.evidence.source,point.evidence.related].filter(Boolean)){
   const link=element('a',source.label);link.href=source.url;link.title=source.title;
   link.target='_blank';link.rel='noopener';
   links.append(link);
  }
  if(links.childElementCount)parent.append(links);
 }

 function climbPoints(aircraft, pointAt, altFt) {
  if (!Number.isFinite(aircraft.stallEasMph) || !(aircraft.climbFpm > 0)) return [];
  const low=aircraft.stallEasMph,high=aircraft.scanMaxEasMph;
  const at=eas=>({...pointAt(aircraft.side,Math.max(eas,low+1e-7),'climb'),eas});
  const speeds = new Set([low, aircraft.vyEasMph, high]);
  for(const region of aircraft.evidence.regions??[]){
   const anchor=region.anchors.find(row=>row.altFt===altFt);
   const speedsTas=Evidence.scheduleWindow(region.anchors,altFt)??[];
   if(anchor)speedsTas.push(anchor.tasMph);
   for(const tas of speedsTas){const eas=UniversalAirPhysics.airspeeds(tas,altFt).eas;if(eas>=low&&eas<=high)speeds.add(eas);}
  }
  for (let eas = Math.ceil(low / probeStepMph) * probeStepMph; eas < high; eas += probeStepMph) speeds.add(eas);
  const points=[...speeds].sort((a,b)=>a-b).map(at),result=[];
  // Add zero-climb endpoints where the level-flight balance crosses zero.
  for (const [i, point] of points.entries()) {
   const previous = points[i - 1];
   if (Number.isFinite(previous?.rate) && Number.isFinite(point.rate) && (point.rate > 0) !== (previous.rate > 0)) {
    let a = previous.eas, b = point.eas;
    for (let j = 0; j < 20; j++) {
     const mid = (a + b) / 2;
     if ((at(mid).rate > 0) === (previous.rate > 0)) a = mid;
     else b = mid;
    }
    result.push({...at((a+b)/2),rate:0});
   }
   result.push(Number.isFinite(point.rate)&&point.rate>=0?point:{...point,rate:null,range:null});
  }
  return result;
 }

 function accelerationPoints(aircraft, pointAt, minEas, maxEas, factor) {
  const stall=aircraft.stallEasMph;
  if(!Number.isFinite(stall))return [];
  const low=Math.max(stall,minEas),high=Math.min(aircraft.scanMaxEasMph,maxEas);
  if(high<=low)return [];
  const speeds=new Set([low,high]);
  const level=aircraft.levelEasMph;
  if(Number.isFinite(level)&&level>=low&&level<=high)speeds.add(level);
  for(let eas=Math.ceil(low/probeStepMph)*probeStepMph;eas<high;eas+=probeStepMph)speeds.add(eas);
  return [...speeds].sort((a,b)=>a-b).map(eas=>{
   const point=pointAt(aircraft.side,Math.max(eas,stall+1e-7),'acceleration');
   return {...point,eas,rate:point.rate===null?null:point.rate*factor};
  });
 }

 function ticks(minEas,maxEas,unit){
  const factor=units[unit].factor,span=(maxEas-minEas)*factor;
  const step=[5,10,20,25,50,100,200].find(n=>n>=span/5)??200;
  const result=[minEas];
  for(let v=Math.ceil(minEas*factor/step)*step;v<maxEas*factor;v+=step){
   const eas=v/factor;
   if(eas-minEas>(maxEas-minEas)*.09&&maxEas-eas>(maxEas-minEas)*.09)result.push(eas);
  }
  result.push(maxEas);
  return result.map(eas=>({eas,label:format(eas*factor,span<10?1:0)}));
 }

 function focusCurves(curves,pointAt,threshold){
  const focused=[];
  for(const {aircraft,points} of curves){
   const first=points.findIndex(p=>p.rate>=threshold),last=points.findLastIndex(p=>p.rate>=threshold);
   if(first<0)continue;
   const meets=eas=>(pointAt(aircraft.side,eas,'turn').rate??0)>=threshold;
   function crossing(a,b,aMeets){
    for(let i=0;i<20;i++){
     const mid=(a+b)/2;
     if(meets(mid)===aMeets)a=mid;else b=mid;
    }
    return (a+b)/2;
   }
   const lo=first===0?points[first].eas:crossing(points[first-1].eas,points[first].eas,false);
   const hi=last===points.length-1?points[last].eas:crossing(points[last].eas,points[last+1].eas,true);
   if(hi>lo){
    const clipped=points.slice(first,last+1).map(p=>p.rate>=threshold?p:{...p,rate:null,range:null});
    if(lo<points[first].eas)clipped.unshift(pointAt(aircraft.side,lo,'turn',threshold));
    if(hi>points[last].eas)clipped.push(pointAt(aircraft.side,hi,'turn',threshold));
    focused.push({aircraft,points:clipped,range:[lo,hi]});
   }
  }
  return focused;
 }


 function attachProbe(plot, state, minEas, maxEas) {
  const { kind, host, svg, left, right, top, bottom, x } = plot;
  const tooltip=element('div',null,'bench-probe-tooltip');
  tooltip.id=kind==='turn'?'bench-hover-readout':'bench-'+kind+'-hover-readout';
  tooltip.hidden=true;
  host.append(tooltip);
  let lastSpeed, lastPinned, press, suppressClick=false;

  function atPointer(event) {
   const matrix=svg.getScreenCTM();
   if(!matrix)return null;
   const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
   return point.x>=left&&point.x<=right&&point.y>=top&&point.y<=bottom+8?point:null;
  }

  function show(y,pinned) {
   const {probe,label,series,sources,turnUnit,unit}=state.read();
   const matrix=svg.getScreenCTM();
   if(!matrix)return;
   if(lastSpeed!==probe.easMph||lastPinned!==pinned){
    tooltip.replaceChildren(element('strong',label));
    if(kind==='advantage'&&plot.tipText)tooltip.append(element('p',plot.tipText(probe.easMph),'bench-note'));
    for(const aircraft of series){
     const point=probe.aircraft[aircraft.side],metric=kind==='advantage'?'turn':kind;
     const row=element('div');
     row.dataset.side=aircraft.side;
     row.append(element('strong',aircraft.name,'bench-probe-name'));
     let rate,readout,rateUnit,digits;
     if(metric==='turn'){
      rate=point.turnRate;rateUnit=turnUnit.label;digits=turnUnit.digits;
      readout=point.turnStatus??(turnUnit.key==='g'?format(point.sustainedG,2)+' G · '+format(rate,1)+'°/s':
       format(rate,1)+'°/s · '+format(point.sustainedG,2)+' G');
     }else if(metric==='climb'){
      rate=point.climbFpm;rateUnit='ft/min';digits=0;
      readout=climbLabel(rate);
     }else{
      rate=point.accelerationMphPerSecond;rateUnit=accelerationUnit(unit);digits=2;
      readout=accelerationLabel(rate,unit);
     }
     row.append(element('span',readout));
     if(Number.isFinite(rate))appendEvidence(row,sources[aircraft.side][metric],pinned,rateUnit,digits);
     tooltip.append(row);
    }
    lastSpeed=probe.easMph;lastPinned=pinned;
   }
   tooltip.dataset.locked=String(pinned);
   tooltip.setAttribute('aria-hidden',String(!pinned));
   tooltip.hidden=false;
   const anchor=new DOMPoint(x(probe.easMph),y).matrixTransform(matrix);
   const frame=host.getBoundingClientRect(),px=anchor.x-frame.left,py=anchor.y-frame.top;
   const margin=12,ahead=px+margin,behind=px-tooltip.offsetWidth-margin,above=py-tooltip.offsetHeight-margin;
   tooltip.style.left=Math.max(8,ahead+tooltip.offsetWidth+8<=frame.width?ahead:behind)+'px';
   tooltip.style.top=(above>=0?above:py+margin)+'px';
  }

  function hide(){tooltip.hidden=true;}
  function hover(at){
   if(!at){hide();return;}
   state.update(minEas+(at.x-left)*(maxEas-minEas)/(right-left));
   state.hover({kind,y:at.y});
   show(at.y,false);
  }

  svg.addEventListener('pointerdown',event=>{
   suppressClick=false;
   if(state.locked()&&event.button===0&&atPointer(event)){
    press={id:event.pointerId,x:event.clientX,y:event.clientY};
    svg.setPointerCapture(event.pointerId);
   }
  });
  svg.addEventListener('pointermove',event=>{
   if(state.locked()){
    if(press?.id!==event.pointerId||Math.hypot(event.clientX-press.x,event.clientY-press.y)<16)return;
    suppressClick=true;
    state.setLock(null);
   }
   if(event.pointerType!=='touch'||suppressClick)hover(atPointer(event));
  });
  svg.addEventListener('pointerup',()=>{press=null;});
  svg.addEventListener('pointercancel',()=>{press=null;});
  svg.addEventListener('pointerleave',()=>{if(!state.locked())hide();});
  svg.addEventListener('click',event=>{
   if(suppressClick){suppressClick=false;return;}
   const at=atPointer(event);
   if(!at)return;
   if(state.locked()){
    state.setLock(null);
    hover(at);
   }else{
    hover(at);
    state.setLock({kind,y:at.y});
   }
  });
  return {kind,show,hide,centerY:(top+bottom)/2};
 }

 function drawPlot({ host, kind, curves, altFt, unit, turnUnit, minEas, maxEas, threshold }) {
  const turn = kind === 'turn', load = turn&&turnUnit.key==='g', acceleration = kind==='acceleration';
  const title = turn ? 'Sustained turn' : acceleration ? 'Level acceleration' : 'Straight climb';
  if (!curves.length) {
   host.replaceChildren(element('p', (kind==='climb'?'Positive straight climb':title)+' is unavailable.', 'bench-note'));
   return null;
  }
  const left = 76, right = 758, top = 36, bottom = turn ? 256 : 206;
  const displayHeight = bottom + 50;
  const rates=curves.flatMap(c=>c.points.flatMap(p=>[p.rate??0,p.range?.[1]??0,p.evidence?.reference?.observed??0]));
  const maxRate=Math.max(...rates),minRate=acceleration?Math.min(...rates):0;
  let yStep;
  if(acceleration)yStep=[.05,.1,.25,.5,1,2,5,10,20].find(step=>maxRate-minRate<=5*step)??25;
  else if(turn)yStep=load?(maxRate<4?.5:1):5;
  else yStep=[250,500,1000,1500,2000].find(step=>maxRate<=5*step)??2500;
  const yMin=acceleration?Math.floor(minRate/yStep)*yStep:load?1:0;
  const peak=load?Math.max(1.5,maxRate+Math.max(.05,(maxRate-yMin)*.04)):
   Math.max(yMin+yStep,Math.ceil(maxRate/yStep)*yStep);
  const x = eas => left + (eas - minEas) * (right - left) / (maxEas - minEas);
  const y = rate => bottom - (rate-yMin) * (bottom - top) / (peak-yMin);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 780 ' + displayHeight);
  svg.setAttribute('role', 'img');
  const rateUnit=turn?turnUnit.label:acceleration?accelerationUnit(unit):'ft/min';
  const heading=title+' ('+rateUnit+') at '+format(altFt)+' ft';
  svg.setAttribute('aria-label', heading);
  function add(tag, attributes, label, parent = svg) {
   const node = document.createElementNS(svg.namespaceURI, tag);
   for (const [name, val] of Object.entries(attributes)) node.setAttribute(name, val);
   if (label) node.textContent = label;
   parent.append(node);
   return node;
  }
  svg.dataset.minEas=minEas;
  svg.dataset.maxEas=maxEas;
  const clipId='bench-speed-window-'+kind;
  const clip=add('clipPath',{id:clipId});
  add('rect',{x:left,y:top,width:right-left,height:bottom-top+1},undefined,clip);
  for (const {eas,label} of ticks(minEas,maxEas,unit)) {
   const tickX = x(eas);
   add('line', { x1: tickX, x2: tickX, y1: top, y2: bottom, class: 'bench-grid-line' });
   add('text', { x: tickX, y: bottom + 23, 'text-anchor': 'middle' }, label);
  }
  const inView=eas=>Number.isFinite(eas)&&eas>=minEas&&eas<=maxEas;
  const tickDigits=yStep<.5?2:yStep<1?1:0;
  for(let tick=Math.round(yMin/yStep);tick<=Math.floor(peak/yStep+1e-8);tick++){
   const rate=tick*yStep;
   add('line',{x1:left,x2:right,y1:y(rate),y2:y(rate),class:acceleration&&tick===0?'bench-acceleration-zero':'bench-grid-line'});
   add('text',{x:left-11,y:y(rate)+5,'text-anchor':'end'},format(rate,tickDigits));
  }
  if (turn) {
   const guide = load ? add('path',{d:Array.from({length:33},(_,i)=>{
    const eas=minEas+(maxEas-minEas)*i/32;
    return (i?'L':'M')+x(eas)+','+y(loadForRate(3,UniversalAirPhysics.tasFrom(eas,'EAS',altFt)));
   }).join(''),fill:'none','clip-path':'url(#'+clipId+')',class:'bench-turn-reference'}) :
    add('line', { x1: left, x2: right, y1: y(3), y2: y(3), class: 'bench-turn-reference' });
   add('title', {}, '3°/s reference. A full circle takes two minutes.', guide);
  }
  add('text', { x: left, y: 21 }, heading);
  add('text', { x: (left + right) / 2, y: displayHeight - 3, 'text-anchor': 'middle' },
   'Equivalent airspeed (' + units[unit].label + ' EAS)');
  add('rect', { x: left, y: top, width: right - left, height: bottom - top, fill: 'transparent' });

  for(const {aircraft,points} of curves){
   for(const band of Evidence.bands(points)){
    const upper=band.map(p=>x(p.eas)+','+y(p.range[1]));
    const lower=band.slice().reverse().map(p=>x(p.eas)+','+y(p.range[0]));
    add('polygon',{points:[...upper,...lower].join(' '),fill:aircraft.color,opacity:.16,
     'clip-path':'url(#'+clipId+')','data-bench-tested-range':aircraft.side});
   }
  }
  for (const { aircraft, points } of curves) {
   const stroke=aircraft.color;
   const curveAttribute=turn?'data-bench-curve':'data-bench-'+kind+'-curve';
   const group=add('g',{[curveAttribute]:aircraft.side,'clip-path':'url(#'+clipId+')'});
   for(const segment of Evidence.lineSegments(points)){
    const d=segment.points.map((point,i)=>(i?'L':'M')+x(point.eas)+','+y(point.rate)).join('');
    add('path',{d,fill:'none',stroke,'stroke-width':3,'stroke-linecap':'round',
     'data-bench-style':segment.solid?'solid':'dotted',...(segment.solid?{}:{'stroke-dasharray':'1 6'})},undefined,group);
   }
   if(kind==='climb'){
    const measured=points.find(p=>p.evidence?.reference?.measured&&
     Math.abs(p.eas-UniversalAirPhysics.airspeeds(p.evidence.reference.tasMph,altFt).eas)<1e-6);
    if(measured&&inView(measured.eas)){
     const report=measured.evidence.reference;
     const dot=add('circle',{cx:x(measured.eas),cy:y(report.observed),r:5,fill:'#18242e',stroke,'stroke-width':2.3,'data-bench-measured-climb':aircraft.side});
     add('title',{},aircraft.name+' flight test '+format(report.observed)+' ft/min at '+format(report.weightLb)+' lb',dot);
    }
   }
   if(acceleration){
    const level=aircraft.levelEasMph;
    if(points.some(p=>p.eas===level&&Number.isFinite(p.rate))){
     const marker=add('circle',{cx:x(level),cy:y(0),r:5,fill:'none',stroke,'stroke-width':2,'data-bench-level-equilibrium':aircraft.side});
     add('title',{},aircraft.name+' maximum level speed '+speed(level,unit,'EAS'),marker);
    }
    continue;
   }
   const bestEas = turn ? (load?aircraft.peakLoad?.easMph:aircraft.peakEasMph) : aircraft.vyEasMph;
   const bestRate = turn ? (load?aircraft.peakLoad?.g:aircraft.peakRate) : aircraft.climbFpm;
   if (inView(bestEas) && bestRate > 0) {
    const marker = add('rect', {x:x(bestEas)-4,y:y(bestRate)-4,width:8,height:8,fill:stroke,
     [turn?'data-bench-best-turn':'data-bench-vy']:aircraft.side});
    add('title', {}, aircraft.name + (turn ? (load?' peak sustained G ':' peak sustained turn rate ') : ' best climb, Vy ') + speed(bestEas, unit, 'EAS'), marker);
   }
  }

  const crosshair = add('line', { y1: top, y2: bottom, class: 'bench-crosshair' });
  const dots = Object.fromEntries(curves.map(({aircraft}) =>
   [aircraft.side,add('circle',{r:4.5,fill:aircraft.color,class:'bench-probe-dot'})]));
  host.replaceChildren(svg);

  function update(easMph, points) {
   const probeX = x(easMph);
   crosshair.setAttribute('x1', probeX);
   crosshair.setAttribute('x2', probeX);
   for (const [side,dot] of Object.entries(dots)) {
    const point=points[side];
    let rate;
    if(turn)rate=load?point.sustainedG:point.turnRate;
    else if(acceleration)rate=point.accelerationMphPerSecond===null?null:point.accelerationMphPerSecond*units[unit].factor;
    else rate=point.climbFpm;
    const shown=Number.isFinite(rate)&&(turn?point.turnRate>=threshold:acceleration||rate>=0);
    dot.style.display = shown ? '' : 'none';
    if (shown) {
     dot.setAttribute('cx', probeX);
     dot.setAttribute('cy', y(rate));
    }
   }
  }
  return {kind,host,svg,left,right,top,bottom,x,update};
 }

 // Coordinated level turn: n² = 1 + (ω V / g₀)².
 function loadForRate(rate,tasMph){return Math.hypot(1,rate*Math.PI/180*tasMph*.44704/9.80665);}

 function render({ chart, climbChart, accelerationChart, slider, value, results, climbResults, accelerationResults, rangeStatus, focus, series, altFt, unit,turnUnit,
  evaluateAt, selectedEasMph, onProbe, makeAdvantage, lockButton, lockStatus, lock, onLock }) {
  const bySide=Object.fromEntries(series.map(a=>[a.side,a]));
  const sampleCache=new Map();
  function pointAt(side,eas,kind,override){
   const key=side+':'+kind+':'+eas;
   if(override===undefined&&sampleCache.has(key))return sampleCache.get(key);
   const flight=evaluateAt(side,eas,kind==='climb');
   const {evidence:record,turnPolicy,range:turnRange,levelEasMph,scanMaxEasMph}=bySide[side];
   const turn=kind==='turn',inRange=turnRange&&eas>=turnRange.minEasMph&&eas<=turnRange.maxEasMph;
   const atLevel=turn&&inRange&&eas===levelEasMph;
   const assessment=turn?TurnPerformance.assessment(flight,turnPolicy):null;
   if(atLevel&&assessment.nominal){
    assessment.nominal={...assessment.nominal,turn:{g:1,rateDegSec:0,radiusM:null,bankDeg:0},limiting:'power'};
   }
   let estimate=null;
   if(turn&&inRange)estimate=override??(atLevel?0:flight.limits?.sustDegSec);
   else if(kind==='climb'&&flight.status==='modelled')estimate=flight.power?.climbFpm;
   else if(kind==='acceleration'&&eas<=scanMaxEasMph)estimate=OperatingBenchmark.levelAccelerationMphPerSecond(flight);
   const load=turn&&Number.isFinite(estimate)?(override===undefined?(atLevel?1:flight.limits?.nSust):loadForRate(override,flight.tasMph)):null;
   const evidence=Evidence.describe(flight,kind,record,assessment?.nominal?.limiting);
   const range=assessment?.range;
   const bounds=evidence.reference?.bounds??
    (Number.isFinite(estimate)&&range?.lower&&range?.upper?[range.lower.rateDegSec,range.upper.rateDegSec]:null);
   const loadRange=turn&&Number.isFinite(estimate)&&range?.lower&&range?.upper?[range.lower.g,range.upper.g]:null;
   const point={...Evidence.sample(eas,estimate,evidence.covered,bounds),load:load??null,loadRange,evidence,assessment};
   if(override===undefined)sampleCache.set(key,point);
   return point;
  }
  const turning = series.filter(aircraft => aircraft.range).map(aircraft => ({ aircraft, points:plotPoints(aircraft,pointAt) }));
  const climbing = series.map(aircraft => ({ aircraft, points:climbPoints(aircraft,pointAt,altFt) }))
   .filter(curve => curve.points.some(point => point.rate > 0));
  const curves=[...turning,...climbing];
  const levelSpeeds=series.map(a=>a.levelEasMph).filter(Number.isFinite);
  const flightEnds=curves.map(c=>c.points.findLast(p=>Number.isFinite(p.rate))?.eas??0);
  const withStall=series.filter(a=>Number.isFinite(a.stallEasMph));
  const domainEnds=levelSpeeds.length?levelSpeeds:flightEnds.length?flightEnds:withStall.map(a=>a.scanMaxEasMph);
  const quickest=Math.max(0,...domainEnds);
  const lowestStall=Math.min(...withStall.map(a=>a.stallEasMph));
  const minEas=Number.isFinite(lowestStall)?Math.max(0,Math.floor(lowestStall/probeStepMph)*probeStepMph-probeStepMph):0;
  const factor=units[unit].factor;
  const maxEas=(Math.floor(quickest*factor/10+1e-9)+1)*10/factor;
  const accelerating=withStall.map(aircraft=>({aircraft,points:accelerationPoints(aircraft,pointAt,minEas,maxEas,factor)}))
   .filter(curve=>curve.points.some(point=>Number.isFinite(point.rate)));
  const hasCurves=curves.length>0||accelerating.length>0;
  slider.oninput=null;
  lockButton.onclick=null;
  lockButton.disabled=!hasCurves;
  if(!hasCurves){
   chart.replaceChildren(element('p', 'Sustained turn is unavailable for both selected configurations.', 'bench-warning'));
   climbChart.replaceChildren();
   accelerationChart.replaceChildren(element('p','Level acceleration is unavailable.','bench-note'));
   slider.disabled = true;
   slider.removeAttribute('aria-valuetext');
   value.textContent = '—';
   results.replaceChildren();
   climbResults.replaceChildren();
   accelerationResults.replaceChildren();
   rangeStatus.textContent='';
   lockButton.textContent='Lock speed';
   lockButton.setAttribute('aria-pressed','false');
   lockStatus.textContent='';
   onLock(null);
   onProbe(null);
   return;
  }

  const maxStep=Math.floor((maxEas+1e-9)/probeStepMph)*probeStepMph;
  const visibleTurns=focus?focusCurves(turning,pointAt,3):[];
  const focused=visibleTurns.length>0;
  rangeStatus.textContent=focused?'Turn curves shown at 3°/s and above.':
   focus?'Neither aircraft reaches 3°/s. Showing the full turn envelope.':'Turn curves show the full flight envelope.';
  const asTurn=point=>turnUnit.key==='g'?
   {...point,...Evidence.sample(point.eas,Number.isFinite(point.rate)?point.load:null,point.covered,Number.isFinite(point.rate)?point.loadRange:null)}:point;
  const plottedTurns=(focused?visibleTurns:turning).map(curve=>({...curve,points:curve.points.map(asTurn)}));
  let probe,sources,label,lastHover;
  const plots=[
   drawPlot({host:chart,kind:'turn',curves:plottedTurns,altFt,unit,turnUnit,minEas,maxEas,threshold:focused?3:0}),
   drawPlot({host:climbChart,kind:'climb',curves:climbing,altFt,unit,turnUnit,minEas,maxEas,threshold:0}),
   drawPlot({host:accelerationChart,kind:'acceleration',curves:accelerating,altFt,unit,turnUnit,minEas,maxEas}),
   makeAdvantage?.({minEas,maxEas,pointAt,series})
  ].filter(Boolean);
  const interaction={read:()=>({probe,label,series,sources,turnUnit,unit}),update,locked:()=>lock!==null,setLock,
   hover(anchor){lastHover=anchor;}};
  const tips=plots.filter(plot=>plot.svg).map(plot=>attachProbe(plot,interaction,minEas,maxEas));
  const defaultAnchor={kind:tips[0].kind,y:tips[0].centerY};
  if(lock&&!tips.some(t=>t.kind===lock.kind)){
   lock=defaultAnchor;
   onLock(lock);
  }
  slider.disabled=false;
  slider.min=minEas;
  slider.max=maxStep;
  slider.step=probeStepMph;

  function drawReadouts(){
   lockButton.textContent=lock?'Unlock speed':'Lock speed';
   lockButton.setAttribute('aria-pressed',String(Boolean(lock)));
   lockStatus.textContent=lock?'Locked at '+label:'Click a plot to lock its reading.';
   results.replaceChildren(...series.map(a=>readoutCard(a,probe.aircraft[a.side],unit,sources[a.side].turn,Boolean(lock),turnUnit)));
   climbResults.replaceChildren(...series.map(a=>{
    const card=probeCard(a);
    card.append(element('p',climbLabel(probe.aircraft[a.side].climbFpm)+' · '+label));
    if(probe.aircraft[a.side].climbFpm>0)appendEvidence(card,sources[a.side].climb,Boolean(lock),'ft/min',0);
    return card;
   }));
   accelerationResults.replaceChildren(...series.map(a=>{
    const card=probeCard(a),point=sources[a.side].acceleration;
    card.append(element('p',accelerationLabel(point.rate,unit)+' · '+label));
    if(Number.isFinite(point.rate))appendEvidence(card,point,Boolean(lock),accelerationUnit(unit),2);
    return card;
   }));
   if(lock)tips.find(t=>t.kind===lock.kind).show(lock.y,true);
  }

  function update(rawEas) {
   const easMph=Math.max(minEas,Math.min(maxStep,Math.round(rawEas/probeStepMph)*probeStepMph));
   if(probe?.easMph===easMph)return;
   const points=Object.fromEntries(series.map(a=>[a.side,probeAircraft(a,easMph,evaluateAt,pointAt)]));
   probe={easMph,aircraft:points};
   sources=Object.fromEntries(series.map(a=>[a.side,{
    turn:asTurn(pointAt(a.side,easMph,'turn')),climb:pointAt(a.side,easMph,'climb'),
    acceleration:pointAt(a.side,easMph,'acceleration')
   }]));
   onProbe(probe);
   slider.value=easMph;
   label=speed(easMph,unit,'EAS',unit==='mph'?0:1);
   slider.setAttribute('aria-valuetext',label);
   value.textContent=label;
   for(const plot of plots)plot.update(easMph,points);
   drawReadouts();
  }

  function setLock(next) {
   lock=next;
   onLock(lock);
   for(const tip of tips)tip.hide();
   drawReadouts();
  }
  slider.oninput=()=>{
   if(!lock)for(const tip of tips)tip.hide();
   update(Number(slider.value));
  };
  lockButton.onclick=()=>setLock(lock?null:lastHover??defaultAnchor);
  update(selectedEasMph??turning[0]?.aircraft.peakEasMph??climbing[0]?.aircraft.vyEasMph??maxEas/2);
 }

 function timedTrace(host,series,{low,high,label}){
  const elapsed=Math.max(0,...series.map(a=>a.trace.at(-1)?.seconds??0));
  host.replaceChildren();
  if(!(elapsed>0))return;
  const width=780,height=222,left=76,right=758,top=30,bottom=174;
  const secondsStep=[5,10,15,30,60,120,300,600,1800].find(step=>elapsed<=6*step)??3600;
  const end=Math.ceil(elapsed/secondsStep)*secondsStep;
  const x=seconds=>left+(right-left)*seconds/end;
  const y=value=>bottom-(bottom-top)*(value-low)/(high-low);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 '+width+' '+height);
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label',label+' against elapsed time');
  function draw(tag,attrs,content,parent=svg){
   const node=document.createElementNS(svg.namespaceURI,tag);
   for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);
   if(content!==undefined)node.textContent=content;
   parent.append(node);
   return node;
  }
  draw('text',{x:left,y:20},label);
  for(let seconds=0;seconds<=end;seconds+=secondsStep){
   const at=x(seconds);
   draw('line',{x1:at,x2:at,y1:top,y2:bottom,class:'bench-grid-line'});
   draw('text',{x:at,y:bottom+22,'text-anchor':'middle'},format(seconds));
  }
  for(let i=0;i<=4;i++){
   const value=low+(high-low)*i/4,at=y(value);
   draw('line',{x1:left,x2:right,y1:at,y2:at,class:i===4?'bench-advantage-zero':'bench-grid-line'});
   draw('text',{x:left-9,y:at+5,'text-anchor':'end'},format(value));
  }
  draw('text',{x:(left+right)/2,y:height-4,'text-anchor':'middle'},'Elapsed time (s)');
  for(const aircraft of series){
   const {side,color,name,trace}=aircraft;
   if(trace.length<2)continue;
   const group=draw('g',{'data-bench-time-trace':side});
   for(const segment of Evidence.lineSegments(trace.map((point,i)=>({
    eas:point.seconds,rate:point.value,covered:i===0?trace[1].covered:point.covered
   })))){
    const d=segment.points.map((point,i)=>(i?'L':'M')+x(point.eas)+','+y(point.rate)).join('');
    draw('path',{d,fill:'none',stroke:color,'stroke-width':3,'stroke-linecap':'round',
     'data-bench-style':segment.solid?'solid':'dotted',...(segment.solid?{}:{'stroke-dasharray':'1 6'})},undefined,group);
   }
   for(let i=1;i<trace.length;i++){
    const point=trace[i],next=trace[i+1];
    if(next&&next.phase===point.phase)continue;
    const node=draw('circle',{cx:x(point.seconds),cy:y(point.value),r:4.5,fill:color,'data-bench-time-phase':point.phase},undefined,group);
    draw('title',{},name+' · '+(next?'Power changes at ':'Run ends at ')+format(point.seconds,1)+' s',node);
   }
  }
  host.append(svg);
 }

 globalThis.OperatingBenchmarkChart = Object.freeze({ render, timedTrace, speed, ticks, turnUnits, speedFactor:unit=>units[unit].factor });
})();

