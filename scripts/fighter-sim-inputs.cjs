'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { buildCatalog } = require('./research-layer.cjs');
const { buildEvidence } = require('./derive-fighter-evidence.cjs');
const { tolerances, resolveCase } = require('./fighter-value-selection.cjs');
const { engineReference } = require('./fighter-engine-reference.cjs');
const { selectionOrder, selectCleanStall } = require('./fighter-stall-reference.cjs');
const { benchmarks, legacyCredits, reviewedCases, rejectedPairs } = require('./fighter-sim-input-review.cjs');

const root = path.resolve(__dirname, '..');
const releasePath = 'references/analysis/fighter-sim-inputs-v1.json';
const propellerPath = 'references/analysis/fighter-propeller-efficiency-v1.json';
const evidencePath = 'references/analysis/fighter-derived-evidence-2026-11-11.json';
const baselinePath = 'references/aircraft-readiness-german-archive-2026-11-11.json';
const stallPath = 'references/research/ww2_fleet_stall_2026-11-12.json';
const interpolatedCharts = new Set(['spitfire-climb-branches', 'p47b-climb-branches', 'p38g-part-power-speed',
  'p40f-standard-spinner-climb', 'f4-factory-climb', 'g2-known-setting-speed']);
const comparedSeries = new Set(['d9-time-reconstruction/2', 'g2-finnish-climb-time/2',
  'g2-finnish-climb-time/3', 'g2-finnish-climb-rate/2']);
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha256 = text => createHash('sha256').update(text).digest('hex');
const sum = values => values.reduce((a, b) => a + b, 0);
const percent = (total, count) => Math.round(100 * total / count) / 100;

function scoreCoverage(baseline, evidence, cases) {
  const rows = baseline.variants.map((variant, i) => {
    const prior = evidence.coverage.rows[i];
    if (prior.id !== variant.id) throw Error('Coverage variant mismatch');
    const credits = legacyCredits.filter(credit => credit.aircraft === variant.id);
    const slots = Object.keys(benchmarks).map(id => {
      const matching = cases.filter(item => item.aircraft === variant.id && item.benchmark === id);
      const current = matching.find(item => item.gold) ?? matching.find(item => item.gold_status === 'gold-qualified') ?? matching[0];
      return { id, case_id: current?.id ?? null, status: current?.gold_status !== 'open' ? current?.gold_status ?? 'open' : 'reviewed-open' };
    });
    const dimensions = baseline.dimensions.map((id, j) => {
      const primary = variant.primary_points[j];
      const secondary = sum(credits.filter(c => c.dimension === id && c.grade === 'secondary').map(c => c.points));
      const legacyCalculated = sum(credits.filter(c => c.dimension === id && c.grade === 'calculated').map(c => c.points));
      const overlap = sum(credits.filter(c => c.dimension === id &&
        prior.credits.some(newer => newer.axis === id && newer.evidence.includes(c.superseded_by))).map(c => c.points));
      const unallocated = variant.augmented_points[j] - primary - secondary - legacyCalculated;
      const calculated = prior.points[j] - variant.augmented_points[j] + legacyCalculated - overlap;
      if (unallocated < 0 || calculated < 0 || primary + secondary + calculated > baseline.weights[j]) {
        throw Error('Invalid split coverage for ' + variant.id + ' ' + id);
      }
      return { id, primary, secondary, calculated, unallocated, overlap };
    });
    const primary = sum(dimensions.map(row => row.primary));
    const withSecondary = primary + sum(dimensions.map(row => row.secondary));
    const withCalculations = withSecondary + sum(dimensions.map(row => row.calculated));
    const unallocated = sum(dimensions.map(row => row.unallocated));
    const overlap = sum(dimensions.map(row => row.overlap));
    if (withCalculations + unallocated + overlap !== prior.with_calculations_percent) throw Error('Prior coverage must reconcile');
    return {
      id: variant.id, label: variant.label, primary_percent: primary, with_secondary_percent: withSecondary,
      with_calculations_percent: withCalculations, previous_total_percent: prior.with_calculations_percent,
      legacy_context_points: unallocated, overlapping_legacy_points: overlap, delta_total_points: -(unallocated + overlap),
      gold_count: slots.filter(slot => slot.status === 'gold').length,
      gold_qualified_count: slots.filter(slot => slot.status === 'gold-qualified').length, planned_count: slots.length,
      dimensions, legacy_credits: credits, calculation_credits: prior.credits, benchmarks: slots,
    };
  });

  function summary(group) {
    const averages = Object.fromEntries(['primary_percent', 'with_secondary_percent', 'with_calculations_percent',
      'previous_total_percent', 'legacy_context_points', 'overlapping_legacy_points', 'delta_total_points']
      .map(key => [key, percent(sum(group.map(row => row[key])), group.length)]));
    const gold_count = sum(group.map(row => row.gold_count));
    const planned_count = sum(group.map(row => row.planned_count));
    const gold_qualified_count = sum(group.map(row => row.gold_qualified_count));
    return { ...averages, gold_count, gold_qualified_count, planned_count,
      gold_percent: percent(gold_count * 100, planned_count),
      gold_qualified_percent: percent(gold_qualified_count * 100, planned_count) };
  }

  return {
    weights: Object.fromEntries(baseline.dimensions.map((id, i) => [id, baseline.weights[i]])),
    targets: { primary_percent: baseline.targets.primary_percent, with_secondary_percent: baseline.targets.augmented_percent },
    planned_benchmarks: benchmarks,
    fleet: summary(rows), german: summary(rows.filter(row => /^(bf109|fw190)/.test(row.id))),
    rows: rows.map(row => ({ ...row, gold_percent: percent(row.gold_count * 100, row.planned_count),
      gold_qualified_percent: percent(row.gold_qualified_count * 100, row.planned_count) })),
  };
}

function curveSeries(chart, series, i, cases) {
  const id = chart.id + '/' + (i + 1);
  const checkedInterpolation = interpolatedCharts.has(chart.id);
  const role = comparedSeries.has(id) ? 'comparison' :
    series.points.every(point => point[4] === 'documentary') ? 'documentary' : 'conditioned-curve';
  const points = series.points.map(([x, value, low, high, source], j) => {
    const original = ['primary', 'secondary', 'documentary'].includes(source);
    const grade = source === 'documentary' ? 'primary' : original ? source : 'calculated';
    const method = original ? source === 'documentary' ? 'documentary' : 'original' :
      source === 'scenario' ? 'scenario' : checkedInterpolation ? 'interpolation' : 'estimate';
    const origin = j === 0 && value === 0 && low === 0 && high === 0 && /^Time (above|from)/.test(chart.y);
    const range = low !== high || origin ? [low, high] : null;
    const range_kind = origin ? 'defined-origin' : range === null ? null : original ? 'source-reading' : 'sensitivity';
    const resolved = cases.find(row => row.curve?.chart === chart.id && row.curve.series === i && row.curve.x === x);
    if (resolved && (resolved.preferred?.value !== value || resolved.preferred.grade !== grade ||
      JSON.stringify(resolved.preferred.range) !== JSON.stringify(range))) throw Error('Curve and preferred case disagree ' + resolved.id);
    return { x, value, grade, method: resolved?.preferred.method ?? method, range, range_kind,
      ...(resolved && { case_id: resolved.id, gold: resolved.gold, gold_status: resolved.gold_status }) };
  });

  const segments = points.slice(1).map((point, index) => {
    const previous = points[index];
    const recorded = series.solidHistory && [previous, point].every(p =>
      ['original', 'reported-interval'].includes(p.method));
    const withinBranch = checkedInterpolation && [previous, point].every(p => ['original', 'interpolation'].includes(p.method));
    return {
      from: index, to: index + 1,
      style: role === 'conditioned-curve' && (recorded || withinBranch) ? 'solid' : 'dotted',
      band: Boolean(previous.range && point.range && [previous, point].some(p => p.range[0] !== p.range[1])),
    };
  });
  return { id, label: series.label, role, limits: series.limits ?? null,
    observations: series.observations, points, segments };
}

function fwIntakeChart(reference) {
  const series = ['internal', 'long_external'].flatMap(intake => ['lower', 'upper'].map(branch => {
    const rows = reference.rows.filter(row => row.branch === branch);
    const name = intake === 'internal' ? 'Normal internal' : 'Long external';
    return {
      label: name + ' intake, ' + branch + ' branch',
      limits: reference.conditions,
      solidHistory: true,
      observations: rows.map(row => row[intake].observation),
      points: rows.map(row => [row.altitude_m, row[intake].tas_kmh, ...row[intake].reading_range_kmh, 'primary']),
    };
  }));
  return {
    id: 'a4-783-combat-intake-level', aircraft: 'fw190a4_783',
    title: 'Fw 190 A-4 WNr 783 combat-power level speed by intake',
    x: 'Pressure altitude (m)', y: 'Level TAS (km/h)',
    note: 'Focke-Wulf Flugbericht 783 Nr. 2, Blatt 3. Readings follow the two faired traces, with a chart-reading band and a break at the blower transition.',
    series,
  };
}

function stallReference(catalog, catalogObservations) {
  const review = JSON.parse(read(stallPath)).stall_review;
  const packId = path.basename(stallPath, '.json');
  const rows = catalog.observations.filter(row => row.pack_id === packId);
  const observations = rows.map(row => ({
    id: row.id,
    quantity: row.quantity,
    values: row.values,
    speed_basis: row.speed_basis,
    correction: row.correction,
    source_class: row.source_class,
    notes: row.notes,
    supersedes: row.supersedes,
  }));
  const variants = review.variants.map(variant => ({
    ...variant, clean_stall: selectCleanStall(variant, catalogObservations),
  }));
  const cleanStallCounts = Object.fromEntries(selectionOrder.map(status => [
    status, variants.filter(row => row.clean_stall.status === status).length,
  ]));
  return {
    ...review,
    variants,
    clean_stall_selection_order: selectionOrder,
    summary: {
      clean_stall_by_status: cleanStallCounts,
      variants_reviewed: review.variants.length,
      variants_numerically_improved: review.variants.filter(row => row.numerical_improvement_ids.length).length,
      new_clean_power_off_variants: review.variants.filter(row => row.clean_power_off_case_ids.length).length,
      catalog_rows_added: rows.length,
    },
    observations,
    calibration_ids: catalog.calibration_curves.filter(curve => curve.source_id.startsWith(packId + ':')).map(curve => curve.id),
  };
}

function buildSimInputs(catalog = buildCatalog(), evidence = buildEvidence(catalog)) {
  const observations = new Map(catalog.observations.map(row => [row.id, row]));
  const engine = engineReference(observations);
  const stall = stallReference(catalog, observations);
  const propeller = read(propellerPath);
  const fleet = JSON.parse(propeller).fleet_reference;
  const charts = [...evidence.charts, fwIntakeChart(fleet.fw190a4)];
  const fleetObservationIds = catalog.observations.filter(row => row.pack_id === 'ww2_fleet_propeller_2026-11-12').map(row => row.id);
  const originalIds = new Set([...Object.keys(evidence.observations), ...engine.observation_ids, ...fleetObservationIds]);
  const cases = reviewedCases(observations, evidence).map(item => ({ ...item, ...resolveCase(item) }));
  for (const id of [...cases.flatMap(item => item.candidates.flatMap(row => row.observation_ids)),
    ...rejectedPairs.flatMap(row => row.observation_ids), ...legacyCredits.map(row => row.observation),
    ...stall.observations.map(row => row.id),
    ...stall.variants.flatMap(row => [...row.prior_ids, ...row.clean_stall.observation_ids])]) {
    if (!observations.has(id)) throw Error('Unresolved original observation ' + id);
    originalIds.add(id);
  }
  const originalRefs = Object.fromEntries([...originalIds].sort().map(id => {
    const row = observations.get(id);
    return [id, { source: row.source_id, locator: row.source_location }];
  }));
  const sourceIds = new Set(Object.values(originalRefs).map(ref => ref.source));
  const sources = Object.fromEntries(catalog.sources.filter(row => sourceIds.has(row.id)).map(row => [row.id, {
    name: row.report || row.work, url: row.primary_url, locator: row.location || row.notes,
    sha256: row.inspected_copy_sha256 || row.sha256 || null,
  }]));
  const packs = new Set([...originalIds].map(id => observations.get(id).pack_id));
  const baseline = JSON.parse(read(baselinePath));
  return {
    schema: 'ww2-fighter-sim-inputs/v1', version: '1.6.0', as_of: '2026-11-12',
    scope: 'Historical inputs and conditional estimates for source-case lookups and evidence graphs.',
    originals: {
      catalog: 'research-catalog.json',
      curve_pack: { path: evidencePath, sha256: sha256(read(evidencePath)) },
      coverage_baseline: evidence.baseline,
      source_packs: catalog.source_packs.filter(pack => packs.has(pack.id)),
    },
    propeller_efficiency: {
      path: propellerPath, build_file: 'fighter-propeller-efficiency.json', sha256: sha256(propeller),
      fleet_reference_key: 'fleet_reference',
      use: '13-aircraft installation reference, original source observations, condition-specific replays and efficiency-only sensitivity',
    },
    engine_reference: engine,
    stall_reference: stall,
    tolerances, coverage: scoreCoverage(baseline, evidence, cases),
    cases, rejected_pairs: rejectedPairs,
    charts: charts.map(chart => ({
      ...chart, series: chart.series.map((series, i) => curveSeries(chart, series, i, cases)),
    })),
    observations: originalRefs, sources,
  };
}

function encodeSimInputs(data) {
  const sections = Object.entries(data).map(([key, value]) => {
    const prefix = '  ' + JSON.stringify(key) + ': ';
    if (['cases', 'charts'].includes(key)) {
      return prefix + '[\n' + value.map(row => '    ' + JSON.stringify(row)).join(',\n') + '\n  ]';
    }
    if (['observations', 'sources'].includes(key)) {
      return prefix + '{\n' + Object.entries(value).map(([id, row]) =>
        '    ' + JSON.stringify(id) + ': ' + JSON.stringify(row)).join(',\n') + '\n  }';
    }
    return prefix + JSON.stringify(value, null, 2).replace(/\n/g, '\n  ');
  });
  return '{\n' + sections.join(',\n') + '\n}\n';
}

if (require.main === module) {
  const data = buildSimInputs();
  const encoded = encodeSimInputs(data);
  if (process.argv.includes('--check')) {
    if (read(releasePath) !== encoded) throw Error('Fighter sim input pack is stale');
  } else {
    fs.writeFileSync(path.join(root, releasePath), encoded);
  }
  console.log(JSON.stringify({
    version: data.version, fleet: data.coverage.fleet, german: data.coverage.german,
    curves: data.charts.length, reviewed_cases: data.cases.length, output: releasePath,
  }, null, 2));
}

module.exports = { buildSimInputs, encodeSimInputs, releasePath };
