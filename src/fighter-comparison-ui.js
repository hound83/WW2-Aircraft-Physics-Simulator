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
      for (const value of values.slice(1)) {
        const cell = row.insertCell();
        if (value instanceof Node) cell.append(value);
        else cell.textContent = value;
      }
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

  function renderFw190() {
    const fw = report.fw190a4;
    const selector = byId('comparison-fw-altitude');
    const speedSelector = byId('comparison-fw-eas');
    for (const point of fw.comparison) selector.add(new Option(fmt(point.altM) + ' m', point.altM));
    function render() {
      const point = fw.comparison.find(row => row.altM === Number(selector.value));
      const state = point.speeds.find(row => row.easMph === Number(speedSelector.value));
      table('comparison-fw-flight', ['Aircraft', 'Weight lb', 'Level speed km/h TAS', 'Climb ft/min at ' + state.easMph + ' mph EAS',
        'Shaft hp', 'Gear', 'Estimated sustained g'], state.aircraft.map(row =>
        [row.name, fmt(row.weightLb), fmt(row.speedKmh, 1), fmt(row.fixedSpeedClimbFpm), fmt(row.shaftHp),
          row.gear ?? '-', fmt(row.sustainedG, 2)]), true);
    }
    selector.addEventListener('change', render);
    speedSelector.addEventListener('change', render);
    render();
    const {speedKmh, climbFpm} = fw.metrics;
    byId('comparison-fw-metrics').textContent =
      'Mean absolute error on reserved points, static to speed-dependent power: ' +
      fmt(speedKmh.static, 1) + ' to ' + fmt(speedKmh.installed, 1) + ' km/h level speed; ' +
      fmt(climbFpm.static) + ' to ' + fmt(climbFpm.installed) + ' ft/min open-cooling climb. ' + fw.validation;
    table('comparison-fw-speed', ['Altitude m', 'Chart km/h', 'Static power km/h', 'Installed power km/h', 'Evidence role'],
      fw.speed.map(row => [fmt(row.altM), fmt(row.observed, 1), fmt(row.static, 1), fmt(row.installed, 1), row.role]), true);
    table('comparison-fw-climb', ['Altitude m', 'Chart m/s', 'Static power m/s', 'Installed power m/s', 'Evidence role'],
      fw.climbs.map(row => [fmt(row.altM), fmt(row.observed, 2), fmt(row.static, 2), fmt(row.installed, 2), row.role]), true);
    byId('comparison-fw-report').href = repo + fw.report;
  }

  function renderTurnCorrection() {
    const correction = report.turnCorrection;
    const altitude = byId('comparison-turn-correction-alt');
    for (const row of correction.mustang) {
      altitude.add(new Option(fmt(row.altFt) + ' ft', row.altFt, row.altFt === 8000, row.altFt === 8000));
    }
    function render() {
      const {rows} = correction.mustang.find(row => row.altFt === Number(altitude.value));
      table('comparison-turn-correction', ['mph EAS', 'Mach', 'Stall mph EAS prior / corrected', 'Sustained g prior / corrected',
        'Lift reading sensitivity (g)', 'Maneuver lift basis'], rows.map(row => [
        fmt(row.easMph), fmt(row.corrected.mach, 3),
        fmt(row.baseline.stallEasMph, 1) + ' / ' + fmt(row.corrected.stallEasMph, 1),
        fmt(row.baseline.nSust, 2) + ' / ' + fmt(row.corrected.nSust, 2),
        row.bracket ? row.bracket.map(value => fmt(value, 2)).join(' to ') : '-', row.liftSource]), true);
    }
    altitude.addEventListener('change', render);
    render();
    table('comparison-turn-f4', ['Altitude m', 'Reference s/circle', 'Greg polar only s/circle', 'IL-2 s/circle',
      'Stall EAS needed if lift alone (mph)', 'Excess hp at IL-2 load'], correction.f4.map(row => [
      fmt(row.altM), fmt(row.baseline.seconds, 1), fmt(row.gregPolarOnly.seconds, 1), fmt(row.observedSeconds, 1),
      fmt(row.equivalentStallEasMph, 1), fmt(row.baseline.propulsiveHp - row.requiredHp)]), true);
    table('comparison-turn-games', ['Aircraft and source', 'Altitude m', 'Corrected build deg/s', 'Published deg/s'],
      [...correction.p51Il2.map(row => ['Mustang B / IL-2', fmt(row.altM), fmt(row.corrected.degSec, 1), fmt(360 / row.observedSeconds, 1)]),
        ...correction.spitIl2.map(row => ['Spitfire / IL-2', fmt(row.altM), fmt(row.corrected.degSec, 1), fmt(360 / row.observedSeconds, 1)]),
        ...correction.dcs.map(row => [row.id === 'p51b' ? 'Mustang B vs D / DCS' : 'Spitfire / DCS', '0',
          fmt(row.corrected.degSec, 1), fmt(row.observedDegSec, 1)])]);
    byId('comparison-turn-correction-report').href = repo + correction.report;
  }

  function renderManeuverPower() {
    const {climbs, coverage, turn, candidate, report: reportPath} = report.maneuverPower;
    const interval = (values, digits = 0) => values ? values.map(value => fmt(value, digits)).join(' to ') : '-';
    const speed = byId('comparison-maneuver-climb-speed');
    const altitude = byId('comparison-maneuver-turn-altitude');
    for (const row of climbs[0].speeds) {
      const eas = row.chart.easMph;
      speed.add(new Option(eas + ' mph EAS', eas, eas === 160, eas === 160));
    }
    for (const row of turn) altitude.add(new Option(fmt(row.altFt) + ' ft', row.altFt));
    function renderClimb() {
      table('comparison-maneuver-climb', ['Altitude ft', 'Test schedule', 'Historical ft/min', 'Evidence', 'Scenario TAS mph',
        'Chart shaft BHP', 'Propulsive / required / excess hp', 'Fixed-speed climb ft/min',
        'Best climb generic / chart ft/min'], climbs.map(row => {
        const {chart, chartClimbFpm} = row.speeds.find(point => point.chart.easMph === Number(speed.value));
        return [fmt(row.altFt), row.rating, row.reportedFpm ? fmt(row.reportedFpm) : interval(row.observedFpm),
          row.evidence, fmt(chart.tasMph, 1), interval(row.shaftBhp),
          [chart.propulsiveHp, chart.requiredHp, chart.excessHp].map(value => fmt(value)).join(' / '),
          interval(chartClimbFpm), fmt(row.bestGenericClimbFpm) + ' / ' + fmt(row.bestChartClimbFpm)];
      }), true);
    }
    function renderTurn() {
      const {gear, rows} = turn.find(point => point.altFt === Number(altitude.value));
      table('comparison-maneuver-turn', ['mph EAS / TAS', 'Gear', 'Nominal eta', 'Nominal sustained g',
        'Sampled sustained g', 'Sampled sustained deg/s'], rows.map(row =>
        [fmt(row.easMph, 1) + ' / ' + fmt(row.tasMph, 1), gear, fmt(100 * row.nominal.eta, 1) + '%',
          fmt(row.nominal.sustainedG, 2), interval(row.sustainedG, 2), interval(row.sustainedDegSec, 2)]));
    }
    speed.addEventListener('change', renderClimb);
    altitude.addEventListener('change', renderTurn);
    renderClimb();
    renderTurn();
    byId('comparison-maneuver-coverage').textContent = 'Exact chart points cover ' + coverage.chartCount +
      ' states versus ' + coverage.genericCount + ' on the generic engine schedule. The test schedule label does not imply that the requested MAP was maintained above critical altitude.';
    byId('comparison-maneuver-decision').textContent =
      'Decision: ' + candidate.decision + '. Each altitude was withheld in turn. Figure 5, non-anchor speed observations and the separate P-47B report were kept out of this fit.';
    const {donor, powerMaeBhp, heldSpeed} = candidate;
    table('comparison-maneuver-checks', ['Check', 'Unit', 'Baseline MAE', 'Candidate MAE'],
      [...candidate.splits.map(row => ['Mustang ' + fmt(row.altFt) + ' ft (' + fmt(row.fraction, 2) + ' retained)', 'ft/min',
        fmt(row.baselineMae), fmt(row.candidateMae)]),
      ['Mustang Figure 5', 'BHP', fmt(powerMaeBhp.baseline, 1), fmt(powerMaeBhp.challenger, 1)],
      ['Mustang non-anchor level speed', 'mph TAS', fmt(heldSpeed.baseline.maeMph, 2), fmt(heldSpeed.challenger.maeMph, 2)],
      ['P-47B 41-5942 climb', 'ft/min', fmt(donor.baseline.climbMaeFpm), fmt(donor.challenger.climbMaeFpm)],
      ['P-47B 41-5942 level speed', 'mph TAS', fmt(donor.baseline.speedMaeMph, 2), fmt(donor.challenger.speedMaeMph, 2)]]);
    byId('comparison-maneuver-report').href = repo + reportPath;
  }

  function renderP38G() {
    const p38 = report.p38g;
    const selector = byId('comparison-p38-altitude');
    for (const point of p38.comparison) selector.add(new Option(fmt(point.altFt) + ' ft', point.altFt));
    function render() {
      const point = p38.comparison.find(row => row.altFt === Number(selector.value));
      table('comparison-p38-flight', ['Aircraft', 'Speed weight lb', 'Climb weight lb', 'Level speed mph TAS',
        'Climb ft/min', 'Climb shaft hp total / per engine', 'Climb prop rpm', 'Estimated prop efficiency'],
        [['P-38G-1 42-12687', point.lightning], ['P-47B 41-5902', point.thunderbolt]].map(([name, row]) =>
          [name, fmt(row.levelWeightLb), fmt(row.climbWeightLb), fmt(row.speedMph, 1), fmt(row.climbFpm),
            fmt(row.totalShaftHp) + ' / ' + fmt(row.shaftHpPerEngine), fmt(row.propRpm), fmt(row.propEta * 100, 1) + '%']), true);
    }
    selector.addEventListener('change', render);
    render();
    const {levelMph, climbFpm} = p38.metrics;
    byId('comparison-p38-metrics').textContent =
      'Reserved Wright Field points, mean absolute error with two propellers versus one disk at the same total shaft power: ' +
      fmt(levelMph.twin, 1) + ' vs ' + fmt(levelMph.single, 1) + ' mph TAS (' + levelMph.count + ' speeds), ' +
      fmt(climbFpm.twin) + ' vs ' + fmt(climbFpm.single) + ' ft/min (' + climbFpm.count + ' climbs). ' + p38.validation;
    table('comparison-p38-speed', ['Altitude ft', 'Report mph TAS', 'Twin mph TAS', 'One-disk mph TAS',
      'Estimated weight lb', 'BHP per engine', 'MAP inHg', 'Evidence role'], p38.level.map(row => [
      fmt(row.altFt), fmt(row.observedMph, 1), fmt(row.twinMph, 1), fmt(row.singleMph, 1),
      fmt(row.weightLb), fmt(row.bhpPerEngine), fmt(row.mapInHg, 1), row.role]), true);
    table('comparison-p38-climb', ['Altitude ft', 'Report mph TAS', 'Report ft/min', 'Twin ft/min',
      'One-disk ft/min', 'BHP per engine', 'MAP inHg', 'Evidence role'], p38.climbs.map(row => [
      fmt(row.altFt), fmt(row.tasMph), fmt(row.observedFpm), fmt(row.twinFpm), fmt(row.singleFpm),
      fmt(row.bhpPerEngine), fmt(row.mapInHg, 1), row.role]), true);
    byId('comparison-p38-report').href = repo + p38.report;
  }

  function renderOperationalClimb() {
    const {scenarios, policy, donorCheck} = report.operationalClimb;
    const input = byId('comparison-climb-budget');
    for (const scenario of scenarios) {
      const seconds = scenario.budgetSeconds;
      input.add(new Option(seconds === 0 ? 'Sustained only' : seconds / 60 + ' min short power', seconds));
    }
    function render() {
      const scenario = scenarios.find(row => row.budgetSeconds === Number(input.value));
      const [low, high] = scenario.sensitivity.leadSeconds;
      byId('comparison-operational-summary').textContent =
        'Spitfire time advantage: ' + fmt(scenario.leadSeconds, 1) + ' s. Spitfire power-assumption sensitivity: ' +
        fmt(low, 1) + ' to ' + fmt(high, 1) + ' s. There is no validated historical error bound. 3:1 and 5:1 remain unresolved.';
      table('comparison-operational-times', ['Aircraft', 'Band time (s)', 'Short power used (s)', 'Switch to sustained power'],
        [['Spitfire BS.543', scenario.spitfire], ['P-47B 41-5902', scenario.thunderbolt]].map(([name, row]) =>
          [name, fmt(row.seconds, 1), fmt(row.shortSeconds, 1),
            row.switchAltFt === null ? 'No switch in band' : fmt(row.switchAltFt) + ' ft']), true);
      table('comparison-operational-rates', ['Altitude', 'Spitfire (ft/min)', 'P-47B (ft/min)', 'Spitfire lead (ft/min)'],
        scenario.endpoints.map(row => [fmt(row.altFt) + ' ft', fmt(row.spitfireFpm), fmt(row.thunderboltFpm), signed(row.leadFpm, 0)]));
    }
    input.addEventListener('change', render);
    render();
    byId('comparison-operational-assumptions').textContent = [
      policy.startCondition, policy.spitfire.qualification, policy.thunderbolt.qualification, policy.method
    ].join(' ');
    byId('comparison-operational-donor').textContent = 'Separate P-47B donor check: ' +
      fmt(donorCheck.maeFpm, 1) + ' ft/min MAE across ' + donorCheck.rows.length + ' 41-5942 points at reported TAS and torque BHP.';
    byId('comparison-intake').textContent = 'Fifth aircraft: ' + report.intake.firstCandidate.variant +
      '. ' + report.intake.firstCandidate.status + '. ' + report.intake.firstCandidate.blockers.join(' ');
    byId('comparison-operational-report').href = repo + 'docs/V310_OPERATIONAL_CLIMB.md';
  }

  function renderClimbBand() {
    const {bandFt, spitfire, thunderbolt, endpoints, time, scenarios, alternates, report: reportPath} = report.climbBand;
    const aircraft = [spitfire, thunderbolt];
    const duration = seconds => {
      const rounded = Math.round(seconds);
      return Math.floor(rounded / 60) + ':' + String(rounded % 60).padStart(2, '0');
    };
    byId('comparison-climb-summary').textContent = 'From ' + bandFt.map(n => fmt(n)).join(' to ') +
      ' ft, the reports give ' + duration(spitfire.reportedSeconds) + ' for BS.543 and ' +
      duration(thunderbolt.reportedSeconds) + ' for 41-5902. The Spitfire took ' +
      fmt(time.sourcePercentLessTime, 1) + '% less time.';
    table('comparison-climb-band', ['Spitfire advantage', 'Historical reports', 'Conditioned replay',
      'Replay − reports', 'Required bound for 3:1 / 5:1'], [
      ...endpoints.map(row => [fmt(row.altFt) + ' ft · climb rate', signed(row.sourceGapFpm, 0) + ' ft/min',
        signed(row.modelGapFpm, 0) + ' ft/min', signed(row.precision.residual, 0) + ' ft/min',
        fmt(row.precision.required3to1, 1) + ' / ' + fmt(row.precision.required5to1, 1) + ' ft/min']),
      [bandFt.map(n => fmt(n)).join('–') + ' ft · time saved', fmt(time.sourceTimeLeadSeconds) + ' s', fmt(time.modelTimeLeadSeconds, 1) + ' s',
        signed(time.precision.residual, 1) + ' s',
        fmt(time.precision.required3to1, 1) + ' / ' + fmt(time.precision.required5to1, 1) + ' s']
    ], true);
    byId('comparison-climb-conditions').textContent = aircraft.map(a => a.specimen + ' · ' + a.conditions).join(' ');
    table('comparison-climb-rates', ['Specimen', 'Altitude ft', 'TAS mph / rpm', 'Source ft/min',
      'Replay ft/min', 'Replay − source ft/min', 'Calibration role'], aircraft.flatMap(a => a.rows.map(r => [
      a.specimen, fmt(r.altFt), fmt(r.tasMph) + ' / ' + fmt(r.engineRpm), fmt(r.sourceFpm),
      fmt(r.modelFpm), signed(r.modelFpm - r.sourceFpm, 0), r.fitRole
    ])), true);
    table('comparison-climb-alternates', ['Spitfire', 'P-47B', 'Gap at ' + fmt(bandFt[0]) + ' ft', 'Time saved over band', 'Time evidence'],
      scenarios.map(r => [r.spitfire, r.thunderbolt, signed(r.sourceGapFpm, 0) + ' ft/min',
        fmt(r.timeLeadSeconds, 1) + ' s', r.durationEvidence]), true);
    for (const source of [...aircraft, alternates.spitfire, alternates.thunderbolt]) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.specimen + ' · ' + source.reference;
      item.append(link, ' · ' + source.evidence + ' ' + source.conditions);
      byId('comparison-climb-sources').append(item);
    }
    byId('comparison-climb-report').href = repo + reportPath;
  }

  function renderArchival() {
    const {rows, sources, exclusions, precision, sourceAssessment, audit} = report.archival;
    const replays = rows.filter(row => row.status === 'qualified replay').length;
    byId('comparison-archival-summary').textContent =
      rows.length + ' reference points · ' + replays + ' qualified replays · ' +
      precision.historicalEligibleCount + ' independent matched validation points in this set. ' +
      'Practical 3:1 and high-precision 5:1 are unresolved. A&AEE assessed the LR495 rack-and-bomb penalty at ' +
      sourceAssessment.rangeMph.join('–') + ' mph; the airframe deteriorated between trials.';
    byId('comparison-archival-exclusions').textContent = Object.values(exclusions).join(' ');
    byId('comparison-archival-source').href = repo + audit;
    const reading = (value, unit) => Number.isFinite(value) ? fmt(value, 1) + ' ' + unit : '—';
    table('comparison-archival', ['Aircraft / test', 'Altitude ft', 'Historical reference', 'Model replay',
      'Model − reference', 'Evidence / status', 'Source', 'Conditions and limits'], rows.map(row => {
      const source = document.createElement('a');
      source.href = sources[row.sourceId].url;
      source.textContent = row.location;
      source.title = sources[row.sourceId].report;
      const c = row.conditions;
      const conditions = [c.configuration, c.gear && c.gear + ' gear', c.engineRpm && c.engineRpm + ' rpm',
        c.tasMph && c.tasMph + ' mph TAS', c.weightLb && fmt(c.weightLb) + ' lb (' + c.weightKind + ')',
        c.weightKg && fmt(c.weightKg) + ' kg', c.boostPsi && '+' + c.boostPsi + ' psi',
        c.boostAta && c.boostAta + ' ata', c.manifoldInHg && c.manifoldInHg + ' inHg',
        c.bhpPerEngine && c.bhpPerEngine + ' bhp per engine', c.shaftBhp && c.shaftBhp + ' bhp (chart)'].filter(Boolean).join(' · ');
      const detail = [conditions + '.', row.qualification, row.method].filter(Boolean).join(' ');
      return [row.label, fmt(row.altFt), reading(row.value,row.unit), reading(row.model,row.unit),
        Number.isFinite(row.difference) ? signed(row.difference,1) + ' ' + row.unit : '—',
        row.evidence + ' / ' + row.status, source, detail];
    }), true);
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
  renderArchival();
  renderClimbBand();
  renderOperationalClimb();
  renderFw190();
  renderP38G();
  renderManeuverPower();
  renderTurnCorrection();
  renderGreg();
})();
