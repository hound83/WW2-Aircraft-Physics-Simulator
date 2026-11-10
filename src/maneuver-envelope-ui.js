'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const {models, scorecard} = JSON.parse(byId('v4-envelope-data').textContent);
  const M = UniversalAirPhysics;
  const E = ManeuverEnvelope;
  const source = JSON.parse(byId('turn-lift-source').textContent);
  const fmt = (v, digits = 1) => Number.isFinite(v) ? v.toFixed(digits) : '—';
  const value = id => Number(byId(id).value);
  function table(id, columns, records) {
    const t = document.createElement('table');
    const header = t.createTHead().insertRow();
    for (const label of columns) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = label;
      header.append(cell);
    }
    const body = t.createTBody();
    for (const record of records) {
      const row = body.insertRow();
      const cell = document.createElement('th');
      cell.scope = 'row';
      cell.textContent = record[0];
      row.append(cell);
      for (const value of record.slice(1)) row.insertCell().textContent = value;
    }
    byId(id).replaceChildren(t);
  }
  for (const id of ['v4-first', 'v4-second']) {
    for (const [key, model] of Object.entries(models)) byId(id).add(new Option(model.ac.name, key));
  }
  byId('v4-first').value = 'f4u4';
  byId('v4-second').value = 'p47b';
  function activeModel(id, altitude = value('v4-alt')) {
    const model = models[id];
    if (byId('v41-mode').value === 'energy') {
      const selected = {p51b:'v4-p51-rating',bf109f4:'v4-f4-rating',f4u4:'v4-rating'}[id];
      const selectedRating = selected ? byId(selected).value : model.energyRating;
      const supported = !model.energyConfiguration || model.energyConfiguration.branches.some(branch =>
        altitude >= branch.minFt && altitude <= branch.maxFt &&
        (selectedRating === 'source-schedule' || selectedRating === branch.rating));
      return supported ? model : {...model, energyConfiguration:undefined, energyFallback:true};
    }
    return {...model, energyConfiguration: undefined, energyRating: undefined, parameterCandidates: undefined};
  }
  const weight = model => byId('v41-mode').value === 'energy'
    ? model.energyWeightLb ?? model.ac.weightLb : model.ac.weightLb;
  function rating(id, model) {
    const control = {f4u4: 'v4-rating', bf109f4: 'v4-f4-rating', p51b: 'v4-p51-rating'}[id];
    return control ? byId(control).value : model.energyConfiguration ? model.energyRating : model.ac.defaultRating;
  }
  function renderClimb() {
    const mass = value('v4-mass');
    const rows = Object.keys(models).map(id => {
      const model = activeModel(id, 7500);
      const configured = {...model, options: {...model.options, ...(model.energyConfiguration ? {} : model.climbOptions)}};
      const selected = model.energyConfiguration ? rating(id, model) : model.climbOptions?.rating ?? rating(id, model);
      const start = mass * weight(model);
      const fixed = E.climbBand(M, configured, 5000, 10000, selected, start, 0);
      const fuel = E.climbBand(M, configured, 5000, 10000, selected, start, .5);
      return [model.ac.name, selected, fmt(start, 0), fmt(fixed?.minutes * 60, 2), fmt(fuel?.minutes * 60, 2),
        fmt(fuel?.endWeightLb, 1), fmt(fuel?.fuelUsedLb, 1)];
    });
    table('v4-climb', ['Aircraft', 'Rating', 'Start lb', 'Fixed mass sec', 'With fuel burn sec', 'End lb', 'Fuel lb'], rows);
  }
  function render() {
    const alt = value('v4-alt');
    const eas = value('v4-eas');
    const mass = value('v4-mass');
    const results = Object.fromEntries(Object.keys(models).map(id => {
      const model = activeModel(id);
      const chosen = id === 'f4u4' && byId('v4-lift').value === 'on'
        ? {...model, options: {...model.options, clMax: model.poweredClMax}} : model;
      return [id, E.state(M, UniversalTurnLift, source, chosen, alt, eas, rating(id, model), weight(model) * mass)];
    }));
    table('v4-flight', ['Aircraft', 'Mass lb', 'Rating / gear', 'Stall mph EAS', 'Instant g', 'Sustained g',
      'Turn °/s', 'Scenario °/s', 'Limit', 'Configuration basis', 'Shaft / useful hp', 'Climb ft/min at selected speed'],
      Object.values(results).map(row => [row.name, fmt(row.weightLb, 0), row.rating + ' / ' + (row.gear ?? '—'),
        fmt(row.stallEasMph), fmt(row.instantG, 2), fmt(row.sustainedG, 2), fmt(row.sustainedDegSec),
        row.band.map(v => fmt(v)).join(' to ') || '—', row.limit, row.configuration,
        fmt(row.shaftHp, 0) + ' / ' + fmt(row.propulsiveHp, 0), fmt(row.climbFpm, 0)]));
    globalThis.EnergyFlightState = results;
    const a = byId('v4-first').value;
    const b = byId('v4-second').value;
    const gap = a === b ? null : E.separation(results[a], results[b]);
    const finding = !gap ? 'Select two aircraft with model coverage at this condition.'
      : gap.min > 0 ? results[a].name + ' leads throughout these scenarios.'
      : gap.max < 0 ? results[b].name + ' leads throughout these scenarios.'
      : 'Order unresolved within these scenarios.';
    byId('v4-order').textContent = finding + (gap ? ' A − B: ' + fmt(gap.min) + ' to ' + fmt(gap.max) + ' °/s.' : '') +
      ' Historical 5:1 unresolved.';
    renderPlot(alt, mass, a, b);
    if (byId('v4-climb').parentElement.open) renderClimb();
  }
  for (const id of ['v41-mode', 'v4-alt', 'v4-eas', 'v4-mass', 'v4-rating', 'v4-lift', 'v4-f4-rating', 'v4-p51-rating', 'v4-first', 'v4-second']) {
    byId(id).addEventListener('change', render);
  }
  byId('v4-climb').parentElement.addEventListener('toggle', event => {
    if (event.target.open) renderClimb();
  });
  function renderPlot(alt, mass, first, second) {
    const colors = ['#70d7fa', '#ffbf69'];
    const sets = [first, second].map(id => {
      const model = activeModel(id);
      const chosen = id === 'f4u4' && byId('v4-lift').value === 'on'
        ? {...model, options: {...model.options, clMax: model.poweredClMax}} : model;
      const points = [];
      for (let eas = 110; eas <= 250; eas += 5) {
        const row = E.state(M, UniversalTurnLift, source, chosen, alt, eas, rating(id, model), weight(model) * mass);
        points.push({eas, ...row});
      }
      return points;
    });
    const peak = Math.max(10, ...sets.flatMap(points => points.flatMap(p => p.band).filter(Number.isFinite)));
    const x = v => 55 + (v - 110) * 660 / 140;
    const y = v => 260 - 220 * v / peak;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 760 325');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Sustained-turn rate by EAS, with engineering scenario bands');
    svg.style.minWidth = '520px';
    function add(tag, attrs, text) {
      const node = document.createElementNS(ns, tag);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
      if (text) node.textContent = text;
      svg.append(node);
    }
    for (const speed of [110, 150, 200, 250]) {
      add('line', {x1: x(speed), x2: x(speed), y1: 40, y2: 260, stroke: '#52636e'});
      add('text', {x: x(speed), y: 282, fill: 'currentColor', 'text-anchor': 'middle'}, String(speed));
    }
    for (const fraction of [0, .5, 1]) {
      const rate = peak * fraction;
      add('text', {x: 44, y: y(rate) + 4, fill: 'currentColor', 'text-anchor': 'end'}, fmt(rate));
    }
    sets.forEach((points, i) => {
      const valid = points.filter(p => p.band.length === 2 && p.band.every(Number.isFinite));
      const polygon = valid.map(p => x(p.eas) + ',' + y(p.band[0])).concat(
        [...valid].reverse().map(p => x(p.eas) + ',' + y(p.band[1]))).join(' ');
      add('polygon', {points: polygon, fill: colors[i], opacity: '.13'});
      let line = '';
      let move = true;
      for (const p of points) {
        if (p.sustainedDegSec === null) { move = true; continue; }
        line += (move ? 'M' : 'L') + x(p.eas) + ',' + y(p.sustainedDegSec);
        move = false;
      }
      add('path', {d: line, fill: 'none', stroke: colors[i], 'stroke-width': 2.5});
      add('text', {x: 55, y: 305 + 16 * i, fill: colors[i], 'font-size': 12}, models[[first, second][i]].ac.name);
    });
    add('text', {x: 380, y: 282, fill: 'currentColor', 'font-size': 12}, 'mph EAS');
    add('text', {x: 55, y: 22, fill: 'currentColor'}, 'Sustained turn °/s · shaded scenario ranges');
    byId('v4-plot').replaceChildren(svg);
  }

  const {corsair, thunderbolt, mustang} = scorecard;
  byId('v4-corsair-note').textContent = corsair.limitations;
  table('v4-stall-source', ['Clean stall state', 'Observed kt CAS', 'Replayed kt CAS', 'Effective CLmax'],
    corsair.stall.map(row => [row.power, fmt(row.knotsCas), fmt(row.replayCasKt), fmt(row.clMax, 3)]));
  table('v4-corsair-source', ['Metric / rating', 'Altitude ft', 'Observed', 'Control', 'Current', 'Error', 'Role'],
    [corsair.speed, corsair.climb].flatMap((rows, i) => rows.map(row => [
      (i === 0 ? 'Level kt TAS' : 'Max climb ft/min') + ' / ' + row.rating, row.altFt,
      fmt(row.observed), fmt(row.baseline), fmt(row.predicted), fmt(row.predicted - row.observed), row.role])));
  byId('v4-p47-note').textContent = thunderbolt.installation + '. ' + thunderbolt.limitations;
  table('v4-installation-source', ['Change', 'Altitude ft', 'Observed', 'Control', 'Candidate', 'Role'],
    [thunderbolt.climbChecks, thunderbolt.speedChecks].flatMap((rows, i) => rows.map(row => [
      i === 0 ? 'P-47B climb ft/min' : 'P-47B level mph TAS', row.alt,
      fmt(row.observed), fmt(row.baseline), fmt(row.candidate), row.role])).concat(
      [mustang.fit, mustang.reserved].map((row, i) => [
        'P-51B racks, mph TAS at ' + row.inHg + ' inHg', mustang.alt,
        fmt(row.observed), fmt(row.baseline), fmt(row.candidate), i ? 'reserved' : 'fit'])));
  byId('v4-p51-note').textContent = mustang.limitations;
  table('v41-checks', ['Aircraft', 'Height ft', 'Observed ft/min', 'Evidence basis', 'v4.0', 'v4.1', 'Signed error', 'Derived excess hp', 'Role'],
    Object.entries(scorecard.energy).flatMap(([id, report]) => report.rows.map(row => [
      models[id].ac.name, fmt(row.altFt,0), fmt(row.observed), row.observationKind, fmt(row.before), fmt(row.candidate),
      fmt(row.candidate-row.observed), fmt(row.observedExcessHp), row.role])));
  byId('v4-game-note').textContent = scorecard.il2.qualification;
  table('v4-game', ['Altitude m', 'Mass kg', 'IL-2 turn sec', 'Model at IAS=CAS sec', 'CAS offset ±5 mph sec',
    'Limiting factor', 'Conditional lift coefficient at IL-2 turn'],
    scorecard.il2.rows.map(row => [row.altM, row.weightKg, fmt(row.seconds),
      fmt(row.scenarios[1].seconds), row.scenarios.map(s => fmt(s.seconds)).join(' / '),
      row.scenarios[1].nominalLimit, fmt(row.scenarios[1].targetRequiredCl, 3)]));
  render();
})();
