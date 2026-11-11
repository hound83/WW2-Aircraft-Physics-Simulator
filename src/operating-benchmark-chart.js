'use strict';

(() => {
 const Evidence = BenchmarkGraphEvidence;
 const units = {
  mph: { label: 'mph', factor: 1 },
  kph: { label: 'km/h', factor: 1.609344 },
  knots: { label: 'kn', factor: 1609.344 / 1852 }
 };
 const probeStepMph = 5;
 const format = (value, digits = 0) => value.toLocaleString('en-US', {
  minimumFractionDigits: digits, maximumFractionDigits: digits
 });
 function speed(value, unit, kind, digits = 0) {
  if (!Number.isFinite(value)) return '—';
  return format(value * units[unit].factor, digits) + ' ' + units[unit].label + ' ' + kind;
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
  if (aircraft.peakEasMph >= minEasMph && aircraft.peakEasMph <= maxEasMph) {
   speeds.add(aircraft.peakEasMph);
  }
  // At the level-speed equilibrium all available power sustains 1 G.
  return [...speeds].sort((a, b) => a - b).map(eas =>
   pointAt(aircraft.side,eas,'turn',eas===aircraft.levelEasMph?0:undefined));
 }

 function probeAircraft(aircraft, easMph, evaluateAt) {
  const flight = evaluateAt(aircraft.side, easMph);
  const climb = evaluateAt(aircraft.side, easMph, true);
  const sustainedG = flight.limits?.nSust ?? null;
  let turnStatus = 'Sustained turn unavailable';
  if (Number.isFinite(sustainedG)) turnStatus = null;
  else if (flight.status === 'source-power-unavailable') turnStatus = 'Power data unavailable';
  else if (easMph < aircraft.stallEasMph) turnStatus = 'Below 1 G stall';
  else if (aircraft.levelEasMph !== null && easMph > aircraft.levelEasMph) {
   turnStatus = 'Above maximum level speed';
  }
  return {
   sustainedG,
   turnRate: flight.limits?.sustDegSec ?? null,
   climbFpm: climb.status === 'modelled' ? climb.power?.climbFpm ?? null : null,
   turnStatus
  };
 }

 function climbLabel(rate) {
  if (!Number.isFinite(rate)) return '—';
  return rate > 0 ? format(rate) + ' ft/min' : 'No positive climb';
 }

 function readoutCard(aircraft, point, unit, evidence, locked) {
  const card = element('div', null, 'bench-probe-card');
  card.dataset.side = aircraft.side;
  card.append(element('strong', aircraft.name, 'bench-probe-name'));
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
  if(!point.turnStatus)appendEvidence(card,evidence,locked,'°/s',1);
  if (point.turnStatus) card.append(element('p', point.turnStatus, 'bench-note'));
  return card;
 }

 function appendEvidence(parent, point, locked, unit, digits) {
  parent.append(element('p',point.evidence.label,'bench-note'));
  if(point.range)parent.append(element('p','Tested range '+point.range.map(v=>format(v,digits)).join('–')+' '+unit,'bench-note'));
  if(point.outsideRange)parent.append(element('p','The estimate falls outside the tested range.','bench-note'));
  if(!locked)return;
  const links=element('div',null,'bench-probe-links');
  for(const source of [point.evidence.source,point.evidence.related].filter(Boolean)){
   const link=element('a',source.label);link.href=source.url;link.title=source.title;
   link.target='_blank';link.rel='noopener';
   links.append(link);
  }
  if(links.childElementCount)parent.append(links);
 }

 function climbPoints(aircraft, pointAt) {
  if (!Number.isFinite(aircraft.stallEasMph) || !(aircraft.climbFpm > 0)) return [];
  const low=aircraft.stallEasMph,high=aircraft.scanMaxEasMph;
  const at=eas=>({...pointAt(aircraft.side,Math.max(eas,low+1e-7),'climb'),eas});
  const speeds = new Set([low, aircraft.vyEasMph, high]);
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

 function drawPlot({ host, kind, curves, altFt, unit, minEas, maxEas, selectSpeed, isLocked }) {
  const turn = kind === 'turn';
  if (!curves.length) {
   host.replaceChildren(element('p', turn ? 'Sustained turn is unavailable.' : 'Positive straight climb is unavailable.', 'bench-note'));
   return null;
  }
  const left = 76, right = 758, top = 36, bottom = turn ? 256 : 206;
  const displayHeight = bottom + 50;
  const maxRate = Math.max(...curves.flatMap(c=>c.points.flatMap(p=>[p.rate??0,p.range?.[1]??0])));
  const yStep = turn ? 5 : [250, 500, 1000, 1500, 2000].find(step => maxRate <= 5 * step) ?? 2500;
  const peak = Math.max(yStep, Math.ceil(maxRate / yStep) * yStep);
  const x = eas => left + (eas - minEas) * (right - left) / (maxEas - minEas);
  const y = rate => bottom - rate * (bottom - top) / peak;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 780 ' + displayHeight);
  svg.setAttribute('role', 'img');
  const heading = (turn ? 'Sustained turn (°/s)' : 'Straight climb (ft/min)') + ' at ' + format(altFt) + ' ft';
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
  for (let rate = 0; rate <= peak; rate += yStep) {
   add('line', { x1: left, x2: right, y1: y(rate), y2: y(rate), class: 'bench-grid-line' });
   add('text', { x: left - 11, y: y(rate) + 5, 'text-anchor': 'end' }, format(rate));
  }
  if (turn) {
   const guide = add('line', { x1: left, x2: right, y1: y(3), y2: y(3), class: 'bench-turn-reference' });
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
   const group=add('g',{[turn?'data-bench-curve':'data-bench-climb-curve']:aircraft.side,'clip-path':'url(#'+clipId+')'});
   for(const segment of Evidence.lineSegments(points)){
    const d=segment.points.map((point,i)=>(i?'L':'M')+x(point.eas)+','+y(point.rate)).join('');
    add('path',{d,fill:'none',stroke,'stroke-width':3,'stroke-linecap':'round',
     'data-bench-style':segment.solid?'solid':'dotted',...(segment.solid?{}:{'stroke-dasharray':'1 6'})},undefined,group);
   }
   if (turn && inView(aircraft.stallEasMph)) {
    const stallX = x(aircraft.stallEasMph);
    const marker = add('polygon', {
     points: (stallX - 5) + ',' + bottom + ' ' + stallX + ',' + (bottom - 9) + ' ' + (stallX + 5) + ',' + bottom,
     fill: stroke, 'data-bench-stall': aircraft.side
    });
    add('title', {}, aircraft.name + ' 1 G stall ' + speed(aircraft.stallEasMph, unit, 'EAS'), marker);
   }
   if (turn && inView(aircraft.levelEasMph)) {
    const marker = add('circle', {
     cx: x(aircraft.levelEasMph), cy: bottom, r: 5, fill: stroke, 'data-bench-level': aircraft.side
    });
    add('title', {}, aircraft.name + ' maximum level speed ' + speed(aircraft.levelEasMph, unit, 'EAS'), marker);
   }
   const bestEas = turn ? aircraft.peakEasMph : aircraft.vyEasMph;
   const bestRate = turn ? aircraft.peakRate : aircraft.climbFpm;
   if (inView(bestEas) && bestRate > 0) {
    const marker = add('rect', {x:x(bestEas)-4,y:y(bestRate)-4,width:8,height:8,fill:stroke,
     [turn?'data-bench-best-turn':'data-bench-vy']:aircraft.side});
    add('title', {}, aircraft.name + (turn ? ' best sustained turn ' : ' best climb, Vy ') + speed(bestEas, unit, 'EAS'), marker);
   }
  }

  const crosshair = add('line', { y1: top, y2: bottom, class: 'bench-crosshair' });
  const dots = Object.fromEntries(curves.map(({aircraft}) =>
   [aircraft.side,add('circle',{r:4.5,fill:aircraft.color,class:'bench-probe-dot'})]));
  const tooltip = element('div', null, 'bench-probe-tooltip');
  tooltip.id = turn ? 'bench-hover-readout' : 'bench-climb-hover-readout';
  tooltip.setAttribute('aria-hidden', 'true');
  tooltip.hidden = true;
  host.replaceChildren(svg, tooltip);

  function onPointer(event, pin) {
   if(!pin&&isLocked())return;
   const matrix = svg.getScreenCTM();
   if (!matrix) return;
   const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
   if (point.x < left || point.x > right || point.y < top || point.y > bottom + 8) {
    tooltip.hidden = true;
    return;
   }
   selectSpeed(minEas + (point.x - left) * (maxEas - minEas) / (right - left),pin);
   if(pin)return;
   const frame = host.getBoundingClientRect();
   tooltip.hidden = false;
   const tooltipX = Math.min(event.clientX - frame.left + 12, frame.width - tooltip.offsetWidth - 8);
   tooltip.style.left = Math.max(8, tooltipX) + 'px';
   tooltip.style.top = Math.max(0, event.clientY - frame.top - tooltip.offsetHeight - 12) + 'px';
  }
  svg.addEventListener('pointermove', event => {
   if (event.pointerType !== 'touch') onPointer(event, false);
  });
  svg.addEventListener('click', event => onPointer(event, true));
  svg.addEventListener('pointerleave', () => { tooltip.hidden = true; });

  function update(easMph, points, label, series, sources) {
   const probeX = x(easMph);
   crosshair.setAttribute('x1', probeX);
   crosshair.setAttribute('x2', probeX);
   for (const [side,dot] of Object.entries(dots)) {
    const rate = turn ? points[side].turnRate : points[side].climbFpm;
    const shown = Number.isFinite(rate) && rate >= 0;
    dot.style.display = shown ? '' : 'none';
    if (shown) {
     dot.setAttribute('cx', probeX);
     dot.setAttribute('cy', y(rate));
    }
   }
   tooltip.replaceChildren(element('strong', label));
   for (const aircraft of series) {
    const point = points[aircraft.side];
    const row = element('div');
    row.dataset.side = aircraft.side;
    row.append(element('strong', aircraft.name, 'bench-probe-name'));
    const readout = turn
     ? (point.turnStatus ?? format(point.turnRate, 1) + '°/s · ' + format(point.sustainedG, 2) + ' G')
     : climbLabel(point.climbFpm);
    row.append(element('span', readout));
    if(Number.isFinite(turn?point.turnRate:point.climbFpm)){
     const provenance=sources[aircraft.side][kind].evidence;
     row.append(element('span',[provenance.label,provenance.source?.label].filter(Boolean).join(' · '),'bench-note'));
    }
    tooltip.append(row);
   }
  }
  return { update, hideTooltip:() => { tooltip.hidden = true; } };
 }

 function render({ chart, climbChart, slider, value, results, climbResults, rangeStatus, focus, series, altFt, unit,
  evaluateAt, selectedEasMph, onProbe, makeAdvantage, policy, lockButton, lockStatus, locked, onLock }) {
  const bySide=Object.fromEntries(series.map(a=>[a.side,a]));
  const sampleCache=new Map();
  function pointAt(side,eas,kind,override){
   const key=side+':'+kind+':'+eas;
   if(override===undefined&&sampleCache.has(key))return sampleCache.get(key);
   const flight=evaluateAt(side,eas,kind==='climb');
   const evidence=Evidence.describe(flight,kind,bySide[side].evidence);
   const estimate=override??(kind==='turn'?flight.limits?.sustDegSec:flight.status==='modelled'?flight.power?.climbFpm:null);
   const assessment=kind==='turn'?TurnPerformance.assessment(flight,policy):null;
   const range=assessment?.range;
   const bounds=Number.isFinite(estimate)&&range?.lower&&range?.upper?[range.lower.rateDegSec,range.upper.rateDegSec]:null;
   const point={...Evidence.sample(eas,estimate,evidence.covered,bounds),evidence,assessment};
   if(override===undefined)sampleCache.set(key,point);
   return point;
  }
  const turning = series.filter(aircraft => aircraft.range).map(aircraft => ({ aircraft, points:plotPoints(aircraft,pointAt) }));
  const climbing = series.map(aircraft => ({ aircraft, points:climbPoints(aircraft,pointAt) }))
   .filter(curve => curve.points.some(point => point.rate > 0));
  const curves = [...turning, ...climbing];
  slider.oninput = null;
  lockButton.onclick=null;
  lockButton.disabled=!curves.length;
  if (!curves.length) {
   chart.replaceChildren(element('p', 'Sustained turn is unavailable for both selected configurations.', 'bench-warning'));
   climbChart.replaceChildren();
   slider.disabled = true;
   slider.removeAttribute('aria-valuetext');
   value.textContent = '—';
   results.replaceChildren();
   climbResults.replaceChildren();
   rangeStatus.textContent='';
   lockButton.textContent='Lock speed';
   lockButton.setAttribute('aria-pressed','false');
   lockStatus.textContent='';
   onLock(false);
   onProbe(null);
   return;
  }
  const stall = Math.min(...curves.map(c=>c.aircraft.stallEasMph ?? c.aircraft.range.minEasMph));
  const topSpeeds = [...turning.map(c=>c.aircraft.range.maxEasMph),
   ...climbing.map(c=>c.points.findLast(p=>Number.isFinite(p.rate)).eas)];
  const visibleTurns=focus?focusCurves(turning,pointAt,3):[];
  const focused=visibleTurns.length>0;
  const [minEas,maxEas]=focused
   ? [Math.min(...visibleTurns.map(c=>c.range[0])),Math.max(...visibleTurns.map(c=>c.range[1]))]
   : [stall,Math.max(stall+.1,...topSpeeds)];
  const minStep=Math.ceil(minEas/probeStepMph)*probeStepMph,maxStep=Math.floor(maxEas/probeStepMph)*probeStepMph;
  const stepped=maxStep>minStep;
  rangeStatus.textContent=focused?'Speeds where at least one aircraft sustains 3°/s.':
   focus?'Neither aircraft reaches 3°/s. Showing the full envelope.':'The shared axis begins at the lower 1 G stall speed.';
  let probe,sources,label;
  const isLocked=()=>locked;
  const plots = [
   drawPlot({host:chart,kind:'turn',curves:focused?visibleTurns:turning,altFt,unit,minEas,maxEas,selectSpeed,isLocked}),
   drawPlot({host:climbChart,kind:'climb',curves:climbing,altFt,unit,minEas,maxEas,selectSpeed,isLocked})
  ].filter(Boolean);
  const advantage = makeAdvantage?.({minEas,maxEas,selectSpeed,pointAt});
  slider.disabled = false;
  slider.min = stepped?minStep:minEas;
  slider.max = stepped?maxStep:maxEas;
  slider.step = stepped?probeStepMph:'any';

  function drawReadouts(){
   lockButton.textContent=locked?'Unlock speed':'Lock speed';
   lockButton.setAttribute('aria-pressed',String(locked));
   lockStatus.textContent=locked?'Locked at '+label:'Click a plot to lock its reading.';
   results.replaceChildren(...series.map(a=>readoutCard(a,probe.aircraft[a.side],unit,sources[a.side].turn,locked)));
   climbResults.replaceChildren(...series.map(a=>{
    const card=element('div',null,'bench-probe-card');
    card.dataset.side=a.side;
    card.append(element('strong',a.name,'bench-probe-name'),
     element('p',climbLabel(probe.aircraft[a.side].climbFpm)+' · '+label));
    if(probe.aircraft[a.side].climbFpm>0)appendEvidence(card,sources[a.side].climb,locked,'ft/min',0);
    return card;
   }));
  }

  function update(rawEas) {
   const easMph = stepped?Math.max(minStep,Math.min(maxStep,Math.round(rawEas/probeStepMph)*probeStepMph)):
    Math.max(minEas,Math.min(maxEas,rawEas));
   if (probe?.easMph === easMph) return;
   const points = Object.fromEntries(series.map(a => [a.side, probeAircraft(a, easMph, evaluateAt)]));
   probe = { easMph, aircraft: points };
   sources=Object.fromEntries(series.map(a=>[a.side,{turn:pointAt(a.side,easMph,'turn'),climb:pointAt(a.side,easMph,'climb')}]));
   onProbe(probe);
   slider.value = easMph;
   label = speed(easMph, unit, 'EAS', unit === 'mph' ? 0 : 1);
   slider.setAttribute('aria-valuetext', label);
   value.textContent = label;
   drawReadouts();
   for (const plot of plots) plot.update(easMph, points, label, series, sources);
   advantage?.update(easMph);
  }

  function setLock(next){
   locked=next;
   onLock(locked);
   for(const plot of plots)plot.hideTooltip();
   if(probe)drawReadouts();
  }
  function selectSpeed(eas,pin=false){
   if(pin&&!locked)setLock(true);
   if(pin||!locked)update(eas);
  }
  slider.oninput = () => {
   for (const plot of plots) plot.hideTooltip();
   update(Number(slider.value));
  };
  lockButton.onclick=()=>setLock(!locked);
  update(selectedEasMph ?? turning[0]?.aircraft.peakEasMph ?? climbing[0]?.aircraft.vyEasMph ?? (minEas + maxEas) / 2);
 }

 globalThis.OperatingBenchmarkChart = Object.freeze({ render, speed, ticks });
})();

