'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { resolveCase } = require('../scripts/fighter-value-selection.cjs');
const { buildSimInputs, encodeSimInputs, releasePath } = require('../scripts/fighter-sim-inputs.cjs');
const derived = require('../references/analysis/fighter-derived-evidence-2026-11-11.json');
const baseline = require('../references/aircraft-readiness-german-archive-2026-11-11.json');

const catalog = buildCatalog();
const pack = buildSimInputs(catalog);
const committed = fs.readFileSync(path.join(__dirname, '..', releasePath), 'utf8');
assert.equal(encodeSimInputs(pack), committed, 'The release JSON must reproduce from the retained original data');
const observations = new Map(catalog.observations.map(row => [row.id, row]));
for (const [id, ref] of Object.entries(pack.observations)) {
  const original = observations.get(id);
  assert.equal(original.source_id, ref.source);
  assert.equal(original.source_location, ref.locator);
  assert.ok(pack.sources[ref.source]);
}

const byId = id => pack.cases.find(row => row.id === id);
assert.equal(pack.version, '1.5.0');
assert.equal(byId('g2-db605a-combat-sea-level-rating').preferred.value, 1310);
assert.equal(byId('g2-db605a-combat-5800m-rating').preferred.value, 1250);
assert.equal(byId('a4-bmw801d-combat-low-gear-rating').preferred.value, 1520);
assert.equal(byId('a4-bmw801d-combat-high-gear-rating').preferred.value, 1320);
assert.equal(byId('a4-783-external-intake-6950m').preferred.value, 652);
assert.equal(byId('a4-783-internal-intake-6000m').preferred.value, 645);
const engine = pack.engine_reference;
assert.equal(engine.observation_ids.length, 110);
assert.ok(engine.observation_ids.every(id => pack.observations[id]));
assert.equal(engine.rated_power.bf109g2_db605a.anchors.find(row => row.power_ps === 1310).power_bhp, 1292.08);
const g1 = engine.flight_tests.g1_14026.db601e;
assert.equal(g1.points.find(row => row.altitude_m === 6000).tas_kmh, 622);
assert.deepEqual(g1.points.find(row => row.altitude_m === 5000).range_kmh, [588, 594]);
assert.equal(engine.flight_tests.fw190a4_783.manifold_by_flight_phase.at(-1).level_minus_climb_ata, 0.11);
assert.deepEqual(engine.propeller_check.climb.map(row => row.observation_ids.length), [24, 14, 12]);
assert.deepEqual(engine.propeller_check.climb.map(row => row.fixed_80_mae_percentage_points), [2.51, 0.74, 1.79]);
const production = byId('g2-wnf-250m-production-vnk');
assert.equal(production.preferred.value, 518.75);
assert.equal(production.preferred.grade, 'primary');
assert.equal(production.preferred.method, 'mean');
assert.equal(production.preferred.observation_ids.length, 4);
assert.deepEqual(production.preferred.observed_span, [518, 520]);
assert.deepEqual(production.preferred.range, [511, 527]);
assert.equal(production.conditions.reported_absolute_tolerance_kmh, 7);
assert.equal(byId('g2-wnf-250m-production-vn').preferred.value, 517.25);
const treated = byId('g2-wnf-250m-treated-vnk');
assert.equal(treated.status, 'conflict');
assert.equal(treated.preferred, null);
assert.equal(treated.candidates.find(row => row.method === 'reported-summary').value, 527);
assert.equal(treated.by_grade.primary.candidate_ids.length, 4, 'The repeated flight is retained and only counted once');
assert.deepEqual(treated.by_grade.primary.observed_span, [520, 529]);
assert.equal(byId('g2-mt215-140m-speed').preferred.grade, 'secondary');
assert.equal(byId('a4-783-open-1000-10000m-time').preferred.grade, 'calculated');
assert.equal(byId('f4u4-80765-clean-1g').preferred.range, null);
const finnish = byId('g2-mt215-10000m-climb');
assert.equal(finnish.preferred.value, 5.3);
assert.equal(finnish.candidates[1].value, 2.1);
assert.equal(finnish.candidates[1].use, 'comparison-only');

const candidates = (grade, values) => values.map((value, i) => ({
  id: grade + i, case_id: 'exact', grade, value, method: grade === 'calculated' ? 'estimate' : 'original',
  use: 'eligible', sample_id: grade + i, combine_group: grade + '-condition',
  range: [value - 1, value + 1], lineage: [grade + '-trial'], accuracy_reviewed: true, observation_ids: [grade + i],
}));
const resolve = (rows, options) => resolveCase({ id: 'exact', metric: 'level_speed', unit: 'km/h TAS', candidates: rows, ...options });
const primary = candidates('primary', [450, 455]);
const secondary = candidates('secondary', [451, 452]);
const calculated = candidates('calculated', [451, 453]);
const all = resolve([...primary, ...secondary, ...calculated]);
assert.equal(all.preferred.value, 452.5);
assert.equal(all.preferred.grade, 'primary');
assert.equal(all.by_grade.secondary.method, 'mean');
assert.equal(all.by_grade.calculated.method, 'mean');
assert.equal(all.gold, true, 'Comparable central values agree across independent sources');
assert.equal(resolve([primary[0], ...secondary]).preferred.method, 'original', 'One primary outranks a secondary mean');
assert.equal(resolve([...secondary, ...calculated]).preferred.grade, 'secondary');
assert.equal(resolve(calculated).preferred.method, 'mean');
assert.equal(resolve([calculated[0]]).preferred.method, 'estimate');
assert.equal(resolve([{ ...primary[0], case_id: 'different-rating' }, ...secondary]).preferred.grade, 'secondary');
assert.equal(resolve(candidates('primary', [450, 454, 458])).status, 'conflict');
assert.equal(resolve([...candidates('primary', [400, 500]), ...secondary]).preferred, null);
assert.equal(resolve(candidates('primary', [450, 456])).preferred.value, 453);
assert.equal(resolve(candidates('primary', [450, 456.01])).status, 'conflict');
assert.equal(resolve(primary, { unit: 'mph TAS' }).status, 'conflict', 'A five-mph span exceeds six km/h');
const timedClimb = { metric: 'elapsed_time', unit: 's' };
assert.equal(resolve(candidates('primary', [195, 205]), timedClimb).preferred.value, 200);
assert.equal(resolve(candidates('primary', [195, 205.01]), timedClimb).status, 'conflict');
assert.equal(resolve(candidates('primary', [90, 91]), { metric: 'stall_speed', unit: 'mph IAS' }).status, 'conflict');
const duplicate = { ...primary[0], id: 'same-reading-in-reprint' };
assert.deepEqual(resolve([...primary, duplicate]).preferred.candidate_ids, ['primary0', 'primary1']);
const priorMean = { ...primary[0], id: 'old-mean', value: 452.5, method: 'mean' };
assert.equal(resolve([...primary, priorMean]).preferred.value, 452.5);
assert.equal(resolve([{ ...primary[0], method: 'reported-summary' }]).preferred.method, 'reported-summary');

const triple = [...candidates('primary', [451]), ...candidates('secondary', [452]), ...candidates('calculated', [453])];
assert.equal(resolve(triple).gold, true);
assert.equal(resolve([triple[0], { ...triple[1], lineage: triple[0].lineage }, triple[2]]).gold, true);
assert.equal(resolve([triple[0], { ...triple[1], lineage: null }]).gold, false);
const wide = resolve([triple[0], triple[1], { ...triple[2], range: [400, 500] }]);
assert.equal(wide.gold, true, 'Source uncertainty is displayed independently of central agreement');
assert.deepEqual(wide.by_grade.calculated.range, [400, 500]);
const rangeOnly = resolve([triple[0], { ...triple[1], value: null, range: [440, 464] }]);
assert.equal(rangeOnly.by_grade.secondary.value, 452, 'Use the midpoint when the source gives a range only');
assert.equal(rangeOnly.gold, true);
const primaryPair = candidates('primary', [450, 456]);
primaryPair[1].lineage = ['independent-primary-trial'];
assert.equal(resolve(primaryPair).gold_status, 'gold');
assert.equal(resolve(primaryPair, { qualification: 'RPM unreported.' }).gold_status, 'gold-qualified');
assert.equal(resolve(candidates('primary', [450, 456])).gold_status, 'open');
const shared = { ...triple[2], lineage: triple[0].lineage };
assert.equal(resolve([triple[0], shared]).gold_status, 'open');
assert.equal(resolve([triple[0], shared], {qualification:'Same report, rate versus timing.'}).gold_status, 'gold-qualified');
assert.equal(resolve([triple[0], { ...triple[1], value: 470, range: null }], {qualification:'Unknown RPM.'}).gold_status, 'open');

assert.equal(resolve([...candidates('primary', [450]), ...candidates('secondary', [453]), ...candidates('calculated', [456])]).gold, true);
assert.equal(resolve([...candidates('primary', [450]), ...candidates('secondary', [453]), ...candidates('calculated', [456.01])]).gold, false);

const series = id => pack.charts.find(row => row.id === id).series;
const a4 = series('a4-timed-cooling-climb')[0];
assert.equal(a4.segments.at(-2).to, a4.segments.at(-1).from);
assert.equal(a4.points[a4.segments.at(-1).from].x, 9000);
assert.equal(a4.segments.at(-2).style, 'solid');
assert.equal(a4.segments.at(-1).style, 'dotted');
assert.ok(a4.segments.at(-1).band);
const speed = series('g2-known-setting-speed');
assert.equal(speed[0].points[0].grade, 'secondary');
assert.ok(speed[0].segments.every(segment => segment.style === 'solid' && segment.band));
assert.ok(speed[2].segments.every(segment => segment.style === 'dotted'));
assert.deepEqual([speed[1].points.at(-1).x, speed[2].points[0].x], [6420, 7110]);
const disagreement = series('g2-finnish-climb-rate')[1];
assert.equal(disagreement.role, 'comparison');
assert.ok(disagreement.segments.every(segment => segment.style === 'dotted' && !segment.band));

for (const [i, chart] of pack.charts.slice(0, derived.charts.length).entries()) for (const [j, branch] of chart.series.entries()) {
  const legacy = derived.charts[i].series[j];
  assert.deepEqual(branch.observations, legacy.observations);
  for (const [k, point] of branch.points.entries()) {
    const original = legacy.points[k];
    assert.deepEqual([point.x, point.value], original.slice(0, 2));
    if (point.range) assert.deepEqual(point.range, original.slice(2, 4));
  }
  for (const segment of branch.segments) {
    assert.equal(segment.to, segment.from + 1);
    if (segment.band) assert.ok(branch.points[segment.from].range && branch.points[segment.to].range);
  }
}
assert.equal(pack.charts.length, derived.charts.length + 1);
const intakes = series('a4-783-combat-intake-level');
assert.equal(intakes.length, 4);
assert.deepEqual(intakes.map(branch => [branch.points[0].x, branch.points.at(-1).x]),
  [[0, 2900], [3000, 9500], [0, 2900], [3000, 9500]]);
for (const branch of intakes) {
  assert.ok(branch.segments.every(segment => segment.style === 'solid' && segment.band));
  for (const [index, point] of branch.points.entries()) {
    assert.equal(point.grade, 'primary');
    const v = observations.get(branch.observations[index]).values;
    assert.deepEqual([point.x, point.value, ...point.range], [v.altitude_m, v.tas_kmh, v.tas_kmh - 3, v.tas_kmh + 3]);
    assert.ok(pack.observations[branch.observations[index]]);
  }
}
assert.equal(intakes[1].points.find(point => point.x === 6000).value, 645);
assert.equal(intakes[3].points.find(point => point.x === 6950).value, 652);
assert.equal(pack.coverage.rows.length, 13);
assert.equal(pack.coverage.fleet.planned_count, 156);
assert.equal(pack.coverage.fleet.gold_count, 0);
assert.equal(pack.coverage.fleet.gold_qualified_count, 5);
assert.equal(pack.coverage.fleet.gold_qualified_percent, 3.21);
assert.equal(production.agreement.spread, 2);
assert.equal(production.agreement.limit, 6);
assert.equal(treated.agreement.spread, 9);
assert.equal(byId('p51b-4324777-clean-75in-level').gold_status, 'open');
assert.equal(byId('p47b-415902-military-elapsed').agreement.limit_percent, 5);
assert.deepEqual(byId('p47b-415902-military-elapsed').candidates[0].original_reading, { value: 5, unit: 'min' });
assert.equal(byId('f4-factory-rechlin-1000-5000m').agreement.spread, 0);
for (const [i, row] of pack.coverage.rows.entries()) {
  assert.equal(row.primary_percent, baseline.variants[i].primary_percent);
  assert.equal(row.with_calculations_percent + row.legacy_context_points + row.overlapping_legacy_points, row.previous_total_percent);
  assert.equal(row.benchmarks.length, row.planned_count);
}
assert.equal(pack.coverage.rows.find(row => row.id === 'p40f_4113635').overlapping_legacy_points, 3);
console.log('PASS fighter sim inputs: reproducible release, preserved originals, grade selection, Gold, graph ranges and coverage reconciliation');
