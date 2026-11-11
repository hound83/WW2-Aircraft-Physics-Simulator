'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { buildCatalog } = require('./research-layer.cjs');
const { round, between, bracket, climbSeconds } = require('./fighter-evidence-methods.cjs');
const defineFighters = require('./fighter-evidence-recipes.cjs');

const root = path.resolve(__dirname, '..');
const baselinePath = 'references/aircraft-readiness-german-archive-2026-11-11.json';
const outputPath = 'references/analysis/fighter-derived-evidence-2026-11-11.json';
const chartPath = 'dist/fighter-evidence-curves.html';
const save = (name, content) => fs.writeFileSync(path.join(root, name), content);
const load = name => fs.readFileSync(path.join(root, name), 'utf8');
const sum = values => values.reduce((total, value) => total + value, 0);
const extent = (values, places = 3) => [round(Math.min(...values), places), round(Math.max(...values), places)];
const around = (value, tolerance) => [value - tolerance, value + tolerance];

function point(x, y, mode = 'calculated', limits = [y, y]) {
  if (![x, y, ...limits].every(Number.isFinite) || limits[0] > y || limits[1] < y) {
    throw Error('Invalid point or envelope: ' + [x, y, mode, ...limits]);
  }
  return [round(x), round(y), ...limits.map(value => round(value)), mode];
}

function buildEvidence(catalog = buildCatalog(), baselineText = load(baselinePath)) {
  const baseline = JSON.parse(baselineText);
  const charts = [];
  const tables = [];
  const checks = [];
  const credits = new Map();
  const observations = new Map();
  const sources = new Map(catalog.sources.map(record => [record.id, record]));
  const usedSources = new Set();
  const ids = new Set();

  function select(series, filter = () => true) {
    const records = catalog.observations.filter(o => o.id.split(':')[1] === series && filter(o.values));
    if (!records.length || new Set(records.map(o => o.source_id)).size !== 1) throw Error('Missing or ambiguous series: ' + series);
    for (const o of records) {
      observations.set(o.id, {
        source: o.source_id, locator: o.source_location,
      });
      usedSources.add(o.source_id);
    }
    return records;
  }

  function one(series, filter) {
    const records = select(series, filter);
    if (records.length !== 1) throw Error('Expected one observation: ' + series);
    return records[0];
  }

  function anchorRows(records, xField, yField) {
    const rows = records.map(o => ({ x: o.values[xField], y: o.values[yField], o })).sort((a, b) => a.x - b.x);
    if (rows.length < 2 || rows.some((row, i) => !Number.isFinite(row.x) || !Number.isFinite(row.y) || i > 0 && row.x <= rows[i - 1].x)) {
      throw Error('Unusable or nonunique anchors: ' + records[0].id + ' ' + xField + ' / ' + yField);
    }
    return rows;
  }

  function recordId(item) {
    if (ids.has(item.id)) throw Error('Duplicate analysis id: ' + item.id);
    ids.add(item.id);
  }

  function chart(item) {
    recordId(item);
    for (const series of item.series) {
      if (!series.points.length || series.points.some((p, i) => i && p[0] <= series.points[i - 1][0])) {
        throw Error('Chart points need strictly increasing x: ' + item.id);
      }
      if (series.observations.some(id => !observations.has(id))) throw Error('Unknown chart source: ' + item.id);
    }
    charts.push(item);
  }

  function table(item) {
    recordId(item);
    if (!item.rows.length || item.rows.some(row => row.length !== item.columns.length) ||
        item.observations.some(id => !observations.has(id))) throw Error('Invalid evidence table: ' + item.id);
    tables.push(item);
  }

  function credit(aircraft, axis, points, evidence, reason) {
    const items = credits.get(aircraft) || [];
    if (!baseline.dimensions.includes(axis) || !Number.isInteger(points) || points < 1 || evidence.some(id => !ids.has(id))) {
      throw Error('Unresolved coverage credit for ' + aircraft);
    }
    items.push({ axis, points, evidence, reason });
    credits.set(aircraft, items);
  }

  function compare({ aircraft, id, title, kind, unit, predicted, reported, tolerance = null, observations: refs, conditions }) {
    recordId({ id });
    if (![predicted, reported].every(Number.isFinite) || refs.some(id => !observations.has(id))) throw Error('Invalid check: ' + id);
    const delta = predicted - reported;
    checks.push({
      id, aircraft, title, kind, unit, predicted: round(predicted), reported: round(reported), delta: round(delta),
      tolerance, outcome: tolerance === null ? 'comparison-only' : Math.abs(delta) <= tolerance + 1e-9 ? 'within' : 'outside',
      observations: refs, conditions,
    });
  }

  function interpolation({ aircraft, id, label, records, x, y, reading, gate, mode = 'primary', targets = [] }) {
    const rows = anchorRows(records, x, y);
    const units = { roc: 'ft/min', roc_fpm: 'ft/min', elapsed_min: 'min', speed_tas_mph: 'mph TAS', corrected_tas_kmh: 'km/h TAS' };
    const residuals = rows.slice(1, -1).map((row, i) => {
      const predicted = between(rows[i], rows[i + 2], row.x);
      compare({
        aircraft, id: id + '-holdout-' + row.x, title: label + ' at ' + row.x,
        kind: 'same-branch leave-one-out', unit: units[y] || y, predicted, reported: row.y, tolerance: gate,
        observations: [rows[i].o.id, row.o.id, rows[i + 2].o.id],
        conditions: 'Interior published point withheld. Adjacent points are from the same source and branch.',
      });
      return Math.abs(predicted - row.y);
    });
    const largest = Math.max(0, ...residuals);
    const resultMode = residuals.length >= 2 && largest <= gate ? 'calculated' : 'scenario';
    const width = Math.max(gate, largest + reading);
    const xSamples = new Set(rows.slice(1).map((r, i) => (r.x + rows[i].x) / 2));
    for (const sample of targets) xSamples.add(sample);
    const points = [...rows.map(r => point(r.x, r.y, mode, around(r.y, reading)))];
    for (const sample of xSamples) {
      if (rows.some(r => r.x === sample)) continue;
      const [a, b] = bracket(rows, sample);
      const value = between(a, b, sample);
      points.push(point(sample, value, resultMode, around(value, width)));
    }
    return {
      label, observations: rows.map(r => r.o.id), points: points.sort((a, b) => a[0] - b[0]),
      limits: 'Linear between adjacent source values. Margin uses the larger of the declared check tolerance and the worst local holdout plus source reading allowance. The checks reuse one test series.',
    };
  }

  function climb({ aircraft, id, label, records, height, rate, elapsed, metric, reading, timeReading, assumed = false }) {
    const rows = anchorRows(records, height, rate);
    const rateToPerSecond = metric ? 1 : 1 / 60;
    const timeToSeconds = elapsed?.endsWith('_min') || elapsed?.endsWith('_min_approx') ? 60 : 1;
    const travelTime = (a, b, x, shift = 0) => climbSeconds(
      x - a.x, (a.y + shift) * rateToPerSecond, (between(a, b, x) + shift) * rateToPerSecond,
    );
    let value = 0;
    let low = 0;
    let high = 0;
    const points = [point(rows[0].x, 0, assumed ? 'scenario' : 'calculated')];
    for (const [i, b] of rows.slice(1).entries()) {
      const a = rows[i];
      const duration = travelTime(a, b, b.x);
      const minDuration = travelTime(a, b, b.x, reading);
      const maxDuration = travelTime(a, b, b.x, -reading);
      const [t0, t1] = [a.o.values[elapsed], b.o.values[elapsed]];
      const hasTime = Number.isFinite(t0) && Number.isFinite(t1);
      const original = hasTime ? (t1 - t0) * timeToSeconds : null;
      const tolerance = round(timeReading + Math.max(duration - minDuration, maxDuration - duration));
      const conflict = hasTime && Math.abs(duration - original) > tolerance;
      if (hasTime) compare({
        aircraft, id: id + '-time-' + b.x, title: label + ' ' + a.x + ' to ' + b.x,
        kind: 'same-report rate vs elapsed', unit: 's', predicted: duration, reported: original,
        tolerance, observations: [a.o.id, b.o.id],
        conditions: 'Adjacent altitude band. The allowance combines rate reading sensitivity and elapsed reading/rounding. Rate and elapsed can derive from the same flight.',
      });
      const mode = assumed || conflict || points.at(-1)[4] === 'scenario' ? 'scenario' : 'calculated';
      const mid = (a.x + b.x) / 2;
      points.push(point(mid, value + travelTime(a, b, mid), mode, [
        low + travelTime(a, b, mid, reading), high + travelTime(a, b, mid, -reading),
      ]));
      value += duration;
      low += minDuration;
      high += maxDuration;
      points.push(point(b.x, value, mode, [low, high]));
    }
    return {
      label, observations: rows.map(r => r.o.id), points,
      limits: 'Elapsed from first plotted altitude. Integrates the reciprocal of linear climb rate. Shading varies source rates by the stated allowance. Timing discrepancies are separate checks and can exceed that shading.',
    };
  }

  defineFighters({ select, one, chart, table, credit, compare, interpolation, climb, point, extent, around });

  const rows = baseline.variants.map(variant => {
    const items = credits.get(variant.id) || [];
    const added = baseline.dimensions.map(axis => sum(items.filter(item => item.axis === axis).map(item => item.points)));
    const points = variant.augmented_points.map((value, i) => value + added[i]);
    if (points.some((value, i) => value > baseline.weights[i]) || added[0] || added[2] ||
        !charts.some(item => item.aircraft === variant.id)) throw Error('Invalid or missing coverage: ' + variant.id);
    return {
      id: variant.id, label: variant.label, primary_percent: variant.primary_percent,
      augmented_percent: variant.augmented_percent, with_calculations_percent: sum(points),
      delta_calculations_points: sum(added), points, credits: items,
    };
  });
  if (rows.length !== 13 || [...charts, ...tables, ...checks].some(item => !rows.some(row => row.id === item.aircraft))) {
    throw Error('Expected the fixed thirteen-variant scope');
  }
  const averages = group => Object.fromEntries(
    ['primary_percent', 'augmented_percent', 'with_calculations_percent', 'delta_calculations_points']
      .map(key => [key, round(sum(group.map(row => row[key])) / group.length, 2)]),
  );
  return {
    schema: 'ww2-fighter-derived-evidence/v1',
    as_of: baseline.as_of,
    baseline: { path: baselinePath, sha256: createHash('sha256').update(baselineText).digest('hex') },
    scope: 'Standalone historical-data analysis. Calculated estimates and engineering scenarios require separate review before any calibration use.',
    coverage: {
      definition: 'Cumulative third lane adds limited credit for new, condition-qualified engineering coverage to the preceding augmented score. Historical scores are carried forward, including earlier credited derivations. Points reflect gap coverage and expert judgment.',
      targets: baseline.targets, dimensions: baseline.dimensions, weights: baseline.weights,
      fleet: averages(rows), german: averages(rows.filter(row => /^(bf109|fw190)/.test(row.id))), rows,
    },
    point_fields: ['x', 'value', 'low', 'high', 'evidence'],
    charts, tables, checks,
    observations: Object.fromEntries(observations),
    sources: Object.fromEntries([...usedSources].map(id => {
      const source = sources.get(id);
      return [id, {
        name: source.report || source.work, url: source.primary_url, locator: source.location || source.notes,
        sha256: source.inspected_copy_sha256 || source.sha256 || null,
      }];
    })),
  };
}

// Retain one row per compact series, check or source so the pack stays diffable.
function encode(data) {
  const compact = new Set(['charts', 'tables', 'checks', 'observations', 'sources']);
  const sections = Object.entries(data).map(([key, value]) => {
    const label = '  ' + JSON.stringify(key) + ': ';
    if (!compact.has(key)) return label + JSON.stringify(value, null, 2).replace(/\n/g, '\n  ');
    if (Array.isArray(value)) return label + '[\n' + value.map(item => '    ' + JSON.stringify(item)).join(',\n') + '\n  ]';
    return label + '{\n' + Object.entries(value).map(([id, row]) =>
      '    ' + JSON.stringify(id) + ': ' + JSON.stringify(row)).join(',\n') + '\n  }';
  });
  return '{\n' + sections.join(',\n') + '\n}\n';
}

function renderExplorer(data, inputs = require('./fighter-sim-inputs.cjs').buildSimInputs(undefined, data)) {
  const template = load('scripts/fighter-evidence-view.html');
  const { charts, cases, coverage, observations, sources } = inputs;
  const { checks, tables } = data;
  const embedded = JSON.stringify({ charts, cases, coverage, observations, sources, checks, tables }).replace(/</g, '\\u003c');
  return template.replace('/* EVIDENCE_DATA */ null', () => embedded);
}

if (require.main === module) {
  const data = buildEvidence();
  const json = encode(data);
  if (process.argv.includes('--check')) {
    if (load(outputPath) !== json) throw Error('Evidence pack is stale. Run node scripts/derive-fighter-evidence.cjs');
  } else {
    save(outputPath, json);
  }
  fs.mkdirSync(path.dirname(path.join(root, chartPath)), { recursive: true });
  save(chartPath, renderExplorer(data));
  const all = data.charts.flatMap(item => item.series.flatMap(series => series.points));
  console.log(JSON.stringify({
    aircraft: data.coverage.rows.length, fleet: data.coverage.fleet, german: data.coverage.german,
    charts: data.charts.length, tables: data.tables.length,
    calculated_curve_points: all.filter(p => p[4] === 'calculated').length,
    scenario_curve_points: all.filter(p => p[4] === 'scenario').length,
    checks: Object.groupBy(data.checks.map(item => item.outcome), item => item),
    output: outputPath, explorer: chartPath,
  }, (key, value) => ['within', 'outside', 'comparison-only'].includes(key) ? value.length : value, 2));
}

module.exports = { buildEvidence, encode, renderExplorer, point };
