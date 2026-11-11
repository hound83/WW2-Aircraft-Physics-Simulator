'use strict';

(() => {
 const colors = { a: '#75dbff', b: '#ffc077' };
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

 function plotPoints(aircraft, evaluateAt) {
  const { minEasMph, maxEasMph } = aircraft.range;
  const speeds = new Set([minEasMph, maxEasMph]);
  for (let eas = Math.ceil(minEasMph / 2) * 2; eas < maxEasMph; eas += 2) speeds.add(eas);
  if (aircraft.peakEasMph >= minEasMph && aircraft.peakEasMph <= maxEasMph) {
   speeds.add(aircraft.peakEasMph);
  }
  return [...speeds].sort((a, b) => a - b).map(eas => ({
   eas,
   // At the level-speed equilibrium all available power sustains 1 G.
   rate: eas === aircraft.levelEasMph ? 0 : evaluateAt(aircraft.side, eas).limits?.sustDegSec
  }));
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

 function readoutCard(aircraft, point, unit) {
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
   ['Max sustained G', point.sustainedG === null ? '—' : format(point.sustainedG, 2) + ' G'],
   ['Straight climb', climbLabel(point.climbFpm)]
  ]) {
   const entry = element('div');
   entry.append(element('dt', label), element('dd', value));
   metrics.append(entry);
  }
  card.append(metrics);
  if (point.turnStatus) card.append(element('p', point.turnStatus, 'bench-note'));
  return card;
 }

 function render({ chart, slider, value, results, series, altFt, unit, evaluateAt, selectedEasMph, onProbe }) {
  const available = series.filter(aircraft => aircraft.range);
  slider.oninput = null;
  if (!available.length) {
   chart.replaceChildren(element('p', 'Sustained turn is unavailable for both selected configurations.', 'bench-warning'));
   slider.disabled = true;
   slider.removeAttribute('aria-valuetext');
   value.textContent = '—';
   results.replaceChildren();
   onProbe(null);
   return;
  }

  const curves = available.map(aircraft => ({ aircraft, points: plotPoints(aircraft, evaluateAt) }));
  const minEas = Math.floor(Math.min(...available.map(a => a.stallEasMph ?? a.range.minEasMph)) / probeStepMph) * probeStepMph;
  const maxEas = Math.max(minEas + probeStepMph,
   Math.ceil(Math.max(...available.map(a => a.range.maxEasMph)) / probeStepMph) * probeStepMph);
  const left = 58, right = 758, top = 36, bottom = 256;
  const peak = Math.max(5, Math.ceil(Math.max(...curves.flatMap(c => c.points.map(p => p.rate ?? 0))) / 5) * 5);
  const x = eas => left + (eas - minEas) * (right - left) / (maxEas - minEas);
  const y = rate => bottom - rate * (bottom - top) / peak;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 780 306');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Sustained turn curves at ' + format(altFt) + ' ft. Aircraft stall and maximum level speeds are marked.');
  function add(tag, attributes, label, parent = svg) {
   const node = document.createElementNS(svg.namespaceURI, tag);
   for (const [name, val] of Object.entries(attributes)) node.setAttribute(name, val);
   if (label) node.textContent = label;
   parent.append(node);
   return node;
  }
  const displayFactor = units[unit].factor;
  const desiredTick = (maxEas - minEas) * displayFactor / 5;
  const tick = [5, 10, 20, 25, 50, 100, 200].find(step => step >= desiredTick) ?? 200;
  for (let label = Math.ceil(minEas * displayFactor / tick) * tick; label <= maxEas * displayFactor; label += tick) {
   const tickX = x(label / displayFactor);
   add('line', { x1: tickX, x2: tickX, y1: top, y2: bottom, class: 'bench-grid-line' });
   add('text', { x: tickX, y: 279, 'text-anchor': 'middle' }, format(label));
  }
  for (let rate = 0; rate <= peak; rate += 5) {
   add('line', { x1: left, x2: right, y1: y(rate), y2: y(rate), class: 'bench-grid-line' });
   add('text', { x: left - 11, y: y(rate) + 5, 'text-anchor': 'end' }, format(rate));
  }
  add('line', { x1: left, x2: right, y1: y(3), y2: y(3), class: 'bench-turn-reference' });
  add('title', {}, '3°/s reference. A full circle takes two minutes.', svg.lastChild);
  add('text', { x: left, y: 21 }, 'Sustained turn (°/s) at ' + format(altFt) + ' ft');
  add('text', { x: (left + right) / 2, y: 303, 'text-anchor': 'middle' },
   'Equivalent airspeed (' + units[unit].label + ' EAS)');
  add('rect', { x: left, y: top, width: right - left, height: bottom - top, fill: 'transparent' });

  for (const { aircraft, points } of curves) {
   let path = '', startSegment = true;
   for (const point of points) {
    if (!Number.isFinite(point.rate)) {
     startSegment = true;
     continue;
    }
    path += (startSegment ? 'M' : 'L') + x(point.eas) + ',' + y(point.rate);
    startSegment = false;
   }
   const stroke = colors[aircraft.side];
   add('path', {
    d: path, fill: 'none', stroke, 'stroke-width': 3, 'data-bench-curve': aircraft.side,
    ...(aircraft.side === 'b' ? { 'stroke-dasharray': '8 4' } : {})
   });
   if (Number.isFinite(aircraft.stallEasMph)) {
    const stallX = x(aircraft.stallEasMph);
    const marker = add('polygon', {
     points: (stallX - 5) + ',' + bottom + ' ' + stallX + ',' + (bottom - 9) + ' ' + (stallX + 5) + ',' + bottom,
     fill: stroke, 'data-bench-stall': aircraft.side
    });
    add('title', {}, aircraft.name + ' 1 G stall ' + speed(aircraft.stallEasMph, unit, 'EAS'), marker);
   }
   if (Number.isFinite(aircraft.levelEasMph)) {
    const marker = add('circle', {
     cx: x(aircraft.levelEasMph), cy: bottom, r: 5, fill: stroke, 'data-bench-level': aircraft.side
    });
    add('title', {}, aircraft.name + ' maximum level speed ' + speed(aircraft.levelEasMph, unit, 'EAS'), marker);
   }
  }

  const crosshair = add('line', { y1: top, y2: bottom, class: 'bench-crosshair' });
  const dots = {};
  for (const aircraft of available) {
   dots[aircraft.side] = add('circle', { r: 4.5, fill: colors[aircraft.side], class: 'bench-probe-dot' });
  }
  const tooltip = element('div', null, 'bench-probe-tooltip');
  tooltip.id = 'bench-hover-readout';
  tooltip.setAttribute('aria-hidden', 'true');
  tooltip.hidden = true;
  chart.replaceChildren(svg, tooltip);

  slider.disabled = false;
  slider.min = minEas;
  slider.max = maxEas;
  slider.step = probeStepMph;
  let probe;
  function update(rawEas) {
   const easMph = Math.max(minEas, Math.min(maxEas, Math.round(rawEas / probeStepMph) * probeStepMph));
   if (probe?.easMph === easMph) return;
   const points = Object.fromEntries(series.map(a => [a.side, probeAircraft(a, easMph, evaluateAt)]));
   probe = { easMph, aircraft: points };
   onProbe(probe);
   slider.value = easMph;
   const label = speed(easMph, unit, 'EAS', unit === 'mph' ? 0 : 1);
   slider.setAttribute('aria-valuetext', label);
   value.textContent = label;
   const probeX = x(easMph);
   crosshair.setAttribute('x1', probeX);
   crosshair.setAttribute('x2', probeX);
   for (const aircraft of available) {
    const dot = dots[aircraft.side], rate = points[aircraft.side].turnRate;
    dot.style.display = Number.isFinite(rate) ? '' : 'none';
    if (Number.isFinite(rate)) {
     dot.setAttribute('cx', probeX);
     dot.setAttribute('cy', y(rate));
    }
   }
   results.replaceChildren(...series.map(a => readoutCard(a, points[a.side], unit)));
   tooltip.replaceChildren(element('strong', label));
   for (const aircraft of series) {
    const point = points[aircraft.side];
    const row = element('div');
    row.append(element('strong', aircraft.name, 'bench-probe-name'));
    const turn = point.turnStatus ?? format(point.turnRate, 1) + '°/s · ' + format(point.sustainedG, 2) + ' G';
    const climb = point.climbFpm > 0 ? climbLabel(point.climbFpm) + ' climb' : climbLabel(point.climbFpm);
    row.append(element('span', turn + ' · ' + climb));
    row.dataset.side = aircraft.side;
    tooltip.append(row);
   }
  }
  function probeAtPointer(event, showTooltip) {
   const matrix = svg.getScreenCTM();
   if (!matrix) return;
   const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
   if (point.x < left || point.x > right || point.y < top || point.y > bottom + 8) {
    tooltip.hidden = true;
    return;
   }
   update(minEas + (point.x - left) * (maxEas - minEas) / (right - left));
   if (!showTooltip) return;
   const frame = chart.getBoundingClientRect();
   tooltip.hidden = false;
   const tooltipX = Math.min(event.clientX - frame.left + 12, frame.width - tooltip.offsetWidth - 8);
   tooltip.style.left = Math.max(8, tooltipX) + 'px';
   tooltip.style.top = Math.max(0, event.clientY - frame.top - tooltip.offsetHeight - 12) + 'px';
  }
  slider.oninput = () => {
   tooltip.hidden = true;
   update(Number(slider.value));
  };
  svg.addEventListener('pointermove', event => {
   if (event.pointerType !== 'touch') probeAtPointer(event, true);
  });
  svg.addEventListener('pointerdown', event => probeAtPointer(event, false));
  svg.addEventListener('pointerleave', () => { tooltip.hidden = true; });
  update(selectedEasMph ?? available[0].peakEasMph ?? (minEas + maxEas) / 2);
 }

 globalThis.OperatingBenchmarkChart = Object.freeze({ render, speed });
})();

