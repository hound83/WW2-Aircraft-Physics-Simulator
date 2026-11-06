'use strict';

(() => {
  const byId = id => document.getElementById(id);
  const report = JSON.parse(byId('fighter-comparison-data').textContent);
  const altitude = byId('comparison-altitude');
  const gregAxis = byId('comparison-greg-axis');
  const repo = 'https://github.com/hound83/WW2-Aircraft-Physics-Simulator/blob/main/';
  const fmt = (value, digits = 0) => Number.isFinite(value) ? value.toLocaleString('en-US', {
    minimumFractionDigits: digits, maximumFractionDigits: digits
  }) : '—';
  const signed = (value, digits) => (value > 0 ? '+' : '') + fmt(value, digits);

  function table(id, columns, rows, wide = false) {
    const t = document.createElement('table');
    if (wide) t.className = 'comparison-wide';
    const head = t.createTHead().insertRow();
    for (const title of columns) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = title;
      head.append(th);
    }
    const body = t.createTBody();
    for (const values of rows) {
      const row = body.insertRow();
      const label = document.createElement('th');
      label.scope = 'row';
      label.textContent = values[0];
      row.append(label);
      for (const value of values.slice(1)) row.insertCell().textContent = value;
    }
    byId(id).replaceChildren(t);
  }

  function renderFighters() {
    const scenario = report.scenarios.find(item => String(item.altFt) === altitude.value);
    const {air} = scenario;
    byId('comparison-condition').textContent = [
      fmt(scenario.altFt) + ' ft', fmt(air.eas, 1) + ' mph EAS',
      fmt(air.cas, 1) + ' mph CAS', fmt(air.tas, 1) + ' mph TAS',
      'IAS unavailable without an instrument/position correction'
    ].join(' · ');
    table('comparison-fighters',
      ['Aircraft', 'Climb ft/min', 'Top speed mph TAS', 'Stall mph EAS / CAS / TAS',
        'Instant g', 'Sustained g', 'Turn °/s sustained', 'Sustained limit / status'],
      scenario.rows.map(r => [
        r.name, fmt(r.climbFpm), fmt(r.maxLevelTasMph, 1),
        [r.stall.easMph, r.stall.casMph, r.stall.tasMph].map(v => fmt(v, 1)).join(' / '),
        fmt(r.instantG, 2), fmt(r.sustainedG, 2), fmt(r.sustainedDegSec, 1), r.sustainedLimit ?? r.reason ?? r.status
      ]), true);
    table('comparison-power', ['Aircraft', 'Weight lb', 'Rating / gear', 'Engine rpm', 'Shaft hp',
      'Propulsive hp', 'Required hp (1 g)', 'Excess hp (1 g)'],
      scenario.rows.map(r => [r.name, fmt(r.weightLb), r.rating + ' / ' + (r.gear ?? '—'),
        fmt(r.engineRpm), fmt(r.shaftHp), fmt(r.propulsiveHp), fmt(r.requiredHp), fmt(r.excessHp)]), true);

    const history = report.historical.summary.filter(row => row.band === scenario.historicalBand);
    table('comparison-historical', ['Aircraft', 'Speed scored / observed', 'Speed MAE mph TAS',
      'Climb scored / observed', 'Climb MAE ft/min'], scenario.rows.map(aircraft => {
      const speed = history.find(row => row.aircraftId === aircraft.id && row.metric === 'level-speed');
      const climb = history.find(row => row.aircraftId === aircraft.id && row.metric === 'climb-rate');
      return [aircraft.name, speed.paired + ' / ' + speed.observations, fmt(speed.workingMae, 1),
        climb.paired + ' / ' + climb.observations, fmt(climb.workingMae, 1)];
    }));
  }

  function renderMustang() {
    const m = report.mustang;
    byId('comparison-mustang-note').textContent =
      fmt(m.air.tas) + ' mph TAS · ' + fmt(m.weightLb) + ' lb · ' + m.rating +
      ' · ' + m.gear + ' blower. ' + m.sourceLocation + '. ' + m.evidence;
    const metrics = [['shaftHp', 'Shaft hp', 1], ['propEta', 'Propeller efficiency (%)', 1, 100],
      ['propulsiveHp', 'Propulsive hp', 1], ['requiredHp', 'Required hp at 1 g', 1],
      ['sustainedG', 'Sustained g', 2]];
    table('comparison-mustang', ['Metric', 'Workbook', 'Working profile P', 'Model − workbook'],
      metrics.map(([key, label, digits, scale = 1]) => [label, fmt(m.workbook[key] * scale, digits),
        fmt(Number.isFinite(m.working[key]) ? m.working[key] * scale : null, digits),
        signed(Number.isFinite(m.delta[key]) ? m.delta[key] * scale : null, digits)]));
  }

  const series = [
    {key:'graphG', label:'Greg graph', color:'#f2c47c'},
    {key:'workingG', label:'Working sim', color:'#88bcdf'},
    {key:'gregStallG', label:'Sim with Greg stall', color:'#a6dab3', dash:'7 4'},
    {key:'powerG', label:'Power limit', color:'#e3abda', dash:'3 4'}
  ];

  function plot({basis, rows}) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 670 250');
    svg.setAttribute('class', 'comparison-plot');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Greg and simulated P-47B turn load, graph speed assumed ' + basis);
    function draw(tag, attributes, label) {
      const item = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attributes)) item.setAttribute(key, value);
      if (label !== undefined) item.textContent = label;
      svg.append(item);
    }
    const left = 45, right = 625, top = 18, bottom = 180;
    const x = mph => left + (right - left) * (mph - rows[0].axisMph) / (rows.at(-1).axisMph - rows[0].axisMph);
    const upper = Math.max(2, Math.ceil(2 * Math.max(...rows.flatMap(row => series.map(s => row[s.key] ?? 0)))) / 2);
    const y = g => bottom - (bottom - top) * g / upper;
    for (let g = 0; g <= upper; g += 0.5) {
      draw('line', {x1:left, x2:right, y1:y(g), y2:y(g), stroke:'#46606d'});
      draw('text', {x:left - 8, y:y(g) + 4, fill:'currentColor', 'text-anchor':'end', 'font-size':12}, fmt(g, 1));
    }
    for (const row of rows) draw('text', {x:x(row.axisMph), y:198, fill:'currentColor',
      'text-anchor':'middle', 'font-size':12}, row.axisMph);
    draw('text', {x:left, y:12, fill:'currentColor', 'font-size':12}, 'Load (g)');
    draw('text', {x:(left + right) / 2, y:218, fill:'currentColor', 'text-anchor':'middle', 'font-size':12},
      'Speed (mph, ' + basis + ' assumed)');
    for (const [index, s] of series.entries()) {
      let connected = false;
      const points = rows.map(row => {
        if (!Number.isFinite(row[s.key])) {
          connected = false;
          return '';
        }
        const point = (connected ? 'L' : 'M') + x(row.axisMph) + ' ' + y(row[s.key]);
        connected = true;
        return point;
      });
      draw('path', {d:points.join(' '), fill:'none', stroke:s.color,
        'stroke-width':2.5, 'stroke-dasharray':s.dash ?? 'none'});
      draw('text', {x:left + 151 * index, y:240, fill:s.color, 'font-size':12}, s.label);
    }
    byId('comparison-greg-plot').replaceChildren(svg);
  }

  function renderGreg() {
    const selected = report.gregP47.cases.find(item => item.basis === gregAxis.value);
    const {basis, rows, errors} = selected;
    byId('comparison-greg-errors').textContent = 'Mean absolute differences vs Greg (' + basis + ' assumed) · ' +
      series.slice(1).map(s => s.label + ' ' + fmt(errors[s.key].mae, 3) + ' g (' +
        errors[s.key].paired + '/' + rows.length + ')').join(' · ');
    table('comparison-greg', ['Speed mph (' + basis + ' assumed)', 'Greg g', 'Working sim g',
      'Sim with Greg stall g', 'Power limit g'],
    rows.map(r => [fmt(r.axisMph), fmt(r.graphG, 2), fmt(r.workingG, 2), fmt(r.gregStallG, 2), fmt(r.powerG, 2)]));
    plot(selected);
  }

  for (const s of report.scenarios) altitude.add(new Option(fmt(s.altFt) + ' ft', s.altFt));
  byId('comparison-greg-note').textContent = fmt(report.gregP47.weightLb) + ' lb · military power. ' +
    'Greg stall scenario uses ' + report.gregP47.stallEasMph + ' mph EAS, equivalent to CAS at standard sea level. ' +
    report.gregP47.evidence;
  byId('comparison-history-source').href = repo + report.historical.scorecard;
  byId('comparison-independent-source').href = repo + report.historical.separateChecks;
  byId('comparison-mustang-source').href = repo + report.mustang.source;
  byId('comparison-greg-source').href = repo + report.gregP47.source;
  byId('comparison-stall-source').href = repo + report.gregP47.stallSource;
  altitude.addEventListener('change', renderFighters);
  gregAxis.addEventListener('change', renderGreg);
  byId('comparison-export').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2) + '\n'], {type:'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fighter-comparison.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  renderFighters();
  renderMustang();
  renderGreg();
})();
