'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { resolveCase } = require('../scripts/fighter-value-selection.cjs');
const { interpolate } = require('../scripts/research-speed-corrections.cjs');
const { buildSimInputs, encodeSimInputs, releasePath } = require('../scripts/fighter-sim-inputs.cjs');
const { selectCleanStall } = require('../scripts/fighter-stall-reference.cjs');
const stallArchive = require('../references/research/ww2_fleet_stall_2026-11-12.json');
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
assert.equal(pack.version, '1.11.0');
const comparative = pack.priority_comparative_reference;
assert.equal(comparative.observation_count, 21);
assert.equal(comparative.coverage_assessment.roster_count, 19);
assert.equal(comparative.coverage_assessment.crosswalk.length, 8);
assert.equal(comparative.coverage_assessment.dossiers.length, 6);
assert.deepEqual(comparative.coverage_assessment.dossiers.map(row => row.with_calculations_percent),
  [51, 46, 35, 44, 32, 24]);
assert.ok(comparative.coverage_assessment.dossiers.every(row =>
  row.evidence_ids.every(id => pack.observations[id])));
const a8LowSpeed = comparative.series.find(row => row.id === 'a8-733705-fb1-low-speed');
assert.equal(a8LowSpeed.speed_basis, 'unestablished');
assert.equal(a8LowSpeed.quantity, 'low_speed_nose_drop');
assert.deepEqual(a8LowSpeed.rows[0], [190, 200, 'retracted']);
const priority = pack.priority_aircraft_reference;
assert.equal(priority.observation_count, 164);
assert.equal(priority.reviewed_artifact_count, 8);
assert.equal(priority.concurrent_followups.artifacts.length, 5);
assert.equal(priority.candidate_artifact.structured_claim_count, 31);
assert.equal(priority.aircraft.reduce((total, row) => total + row.observation_count, 0), priority.observation_count);
assert.deepEqual(priority.coverage_assessment.credits, []);
assert.ok(priority.existing_observation_ids.includes('balanced-2026-11-10:BS08:0001'));
const prioritySeries = id => priority.series.find(row => row.id === id);
assert.equal(prioritySeries('p51d-an0160je1-stall-racks').speed_basis, 'IAS');
assert.deepEqual(prioritySeries('p51d-an0160je1-stall-racks').rows[2], [9500, 103, 'up', 'up']);
assert.equal(prioritySeries('fw190a8-1944-10-25-level').speed_basis, 'unestablished');
assert.equal(prioritySeries('bf109e-v15a-1774-level').rows[1][2], 1.33);
assert.equal(prioritySeries('bf109e3-1792-level').rows[0][2], 1.3);
const batch = pack.batch_reference;
assert.equal(batch.reviewed_artifact_count, 28);
assert.equal(batch.observation_count, 96);
assert.equal(batch.reference_specimen_observation_count, 12);
assert.equal(new Set(batch.observation_ids).size, batch.observation_count);
assert.ok([...batch.observation_ids, ...batch.existing_observation_ids].every(id => pack.observations[id]));
for (const series of batch.series) {
  const original = series.observation_ids.map(id => observations.get(id));
  assert.deepEqual(series.rows, original.map(row => series.fields.map(field => row.values[field])));
  if (series.application === 'reference-specimen') {
    assert.ok(['p47d30_433441', 'p51b_4324777'].includes(series.roster_id));
  }
}
const batchSeries = id => batch.series.find(row => row.id === id);
assert.deepEqual(batchSeries('g1-rechlin-1586-climb-time').rows[4], [5, '4:11', 280]);
assert.equal(batchSeries('g1-rechlin-1586-climb-time').application, 'comparison');
assert.deepEqual(batchSeries('p47d30-433441-glide-fig50').rows[6], [12, 104, 3]);
assert.equal(batchSeries('p47d30-433441-glide-fig50').speed_basis, 'IAS');
assert.equal(batchSeries('mustang-iii-fx858-climb').source_class, 'original-report-composite');
assert.deepEqual(batchSeries('mustang-iii-fx858-pec').rows[0], [140, 4.6]);
const [fwClimb, p38Climb] = pack.climb_reference.cases;
assert.equal(fwClimb.reported_climb_tas, null);
assert.equal(fwClimb.estimated_climb_tas.grade, 'calculated');
assert.ok(fwClimb.estimated_climb_tas.rows.every(row =>
  row.sensitivity_mph[0] < row.tas_mph && row.sensitivity_mph[1] > row.tas_mph));
assert.equal(fwClimb.replay_summary.open_rate_checks_fpm.before_mae_fpm, 220.667);
assert.equal(fwClimb.rows.filter(row => row.closed_rate_m_s !== null).length, 10);
assert.equal(fwClimb.rows.find(row => row.altitude_m === 9000).open_elapsed_from_1000_m_s, 786);
assert.equal(fwClimb.rows.at(-1).open_elapsed_from_1000_m_s, null);
assert.equal(fwClimb.elapsed_time.calculated_open_tail.grade, 'calculated');
assert.equal(fwClimb.cooling_fit.altitude_m, 5000);
assert.deepEqual(p38Climb.rows.find(row => row.alt_ft === 20000),
  { observation_id: 'balanced-2026-11-10:BS02:0005', alt_ft: 20000, roc_fpm: 3280, climb_tas_mph: 219,
    bhp_each: 1195, time_min: 5.68, mp_inhg: 44.7, elapsed_from_sea_level_s: 340.8,
    limiting_factor: 'Carburetor air temperature', role: 'same-report-reserved' });
assert.equal(p38Climb.rows.at(-1).roc_fpm, 1200);
assert.equal(p38Climb.replay_summary.time_from_sea_level_to_20000_ft_s.reported_cumulative_s, 340.8);
assert.equal(p38Climb.ceiling_rows[0].roc_fpm, 100);
assert.ok(p38Climb.separate_b1_level_observation_ids.every(id => !p38Climb.rows.some(row => row.observation_id === id)));
assert.ok(pack.climb_reference.observation_ids.every(id => pack.observations[id]));
const stall = pack.stall_reference;
assert.deepEqual(stall.variants.map(row => row.id), baseline.variants.map(row => row.id));
assert.deepEqual(stall.clean_stall_selection_order, [
  'calibrated_from_source', 'indicated_from_source', 'calculated', 'emergency_research_needed',
]);
assert.deepEqual(stall.summary, {
  clean_stall_by_status: { calibrated_from_source: 2, indicated_from_source: 8, calculated: 3, emergency_research_needed: 0 },
  variants_reviewed: 13,
  variants_numerically_improved: 6,
  new_clean_power_off_variants: 1,
  catalog_rows_added: 37,
});
const stallRows = new Map(stall.observations.map(row => [row.id, row]));
for (const variant of stall.variants) {
  for (const id of [...variant.numerical_improvement_ids, ...variant.clean_power_off_case_ids]) {
    assert.ok(variant.added_ids.includes(id), 'New case is assigned to its reviewed variant');
  }
  for (const id of variant.added_ids) assert.ok(stallRows.has(id) && pack.observations[id]);
  for (const id of variant.prior_ids) assert.ok(pack.observations[id]);
}
const cleanStalls = stall.variants.map(({ id, clean_stall: row }) => [id, row.status, row.speed]);
const measured = (value, basis, unit = 'mph', range = null) => ({ value, unit, basis, range });
assert.deepEqual(cleanStalls, [
  ['f4u4_80765', 'calibrated_from_source', measured(89.4, 'CAS', 'kt')],
  ['p51b_4324777', 'indicated_from_source', measured(86, 'IAS')],
  ['f6f3_04776', 'indicated_from_source', measured(95, 'IAS', 'mph', [93, 97])],
  ['spitfire_lfix_bs543', 'indicated_from_source', measured(86, 'IAS')],
  ['p47b_415902', 'indicated_from_source', measured(105, 'IAS')],
  ['p38g_4212687', 'calibrated_from_source', measured(112, 'CAS')],
  ['fw190d9_210002', 'calculated', measured(185, 'EAS', 'km/h')],
  ['fw190a4_783', 'calculated', measured(177, 'EAS', 'km/h')],
  ['p40f_4113635', 'indicated_from_source', measured(92, 'IAS')],
  ['ki84_302', 'indicated_from_source', measured(102, 'IAS')],
  ['p47d30_433441', 'indicated_from_source', measured(116, 'IAS', 'mph', [113, 119])],
  ['bf109f4_representative', 'calculated', measured(159, 'EAS', 'km/h')],
  ['bf109g2_db605a', 'indicated_from_source', measured(112, 'IAS')],
]);
for (const { clean_stall: row } of stall.variants) {
  assert.ok(row.qualification && row.observation_ids.length);
  assert.equal(row.grade, row.status === 'calculated' ? 'calculated' : 'primary');
  assert.ok(row.observation_ids.every(id => pack.observations[id]));
  assert.deepEqual([row.conditions.gear, row.conditions.flaps], ['up', 'up']);
  if (row.status === 'calculated') {
    const input = row.calculation;
    assert.equal(input.mass_kg, observations.get(row.observation_ids[0]).values[input.mass_field]);
    const eas = Math.sqrt(2 * input.mass_kg * input.gravity_m_s2 /
      (input.reference_density_kg_m3 * input.wing_area_m2 * input.cl_max));
    assert.equal(row.speed.value, Math.round(eas * 3.6));
  }
}
const cleanById = id => stall.variants.find(row => row.id === id).clean_stall;
assert.equal(cleanById('p38g_4212687').reported_ias_mph, 98);
assert.equal(cleanById('p51b_4324777').conditions.altitude_ft, 8000);
assert.equal(cleanById('ki84_302').conditions.weight_lb, null);
assert.equal(cleanById('ki84_302').conditions.takeoff_weight_lb, 7900);
assert.equal(cleanById('bf109f4_representative').calculation.wing_area_m2, 16.1);
assert.equal(pack.cases.filter(row => row.metric === 'stall_speed').length, 1);

const rawVariant = id => stallArchive.stall_review.variants.find(row => row.id === id);
const p38Sources = rawVariant('p38g_4212687').clean_stall.sources;
const fallbackCalculation = rawVariant('fw190d9_210002').clean_stall.calculation;
const resolveStall = sources => selectCleanStall({
  id: 'test-fallback', open: 'Find the original stall report.', clean_stall: { sources, calculation: fallbackCalculation },
}, observations);
assert.equal(resolveStall([...p38Sources].reverse()).status, 'calibrated_from_source');
assert.equal(resolveStall([p38Sources[1]]).status, 'indicated_from_source');
const secondaryStall = { ...p38Sources[1], grade: 'secondary' };
assert.equal(resolveStall([secondaryStall]).grade, 'secondary');
assert.equal(resolveStall([secondaryStall, p38Sources[1]]).grade, 'primary');
assert.equal(resolveStall([]).status, 'calculated');
const emptyStall = selectCleanStall({
  id: 'test-empty', open: 'Find the original stall report.', clean_stall: { sources: [] },
}, observations);
assert.deepEqual([emptyStall.status, emptyStall.label, emptyStall.speed],
  ['emergency_research_needed', 'emergency research needed', null]);
assert.throws(() => resolveStall([{ observation_id: 'stall_us_2026-11-10:US20:0003', grade: 'primary' }]),
  /Ineligible clean-stall observation/);

const addedStall = id => stallRows.get('ww2_fleet_stall_2026-11-12:' + id);
const lightning = addedStall('p38g-4212690-clean-off');
assert.deepEqual([lightning.values.original_ias_mph, lightning.values.speed_mph, lightning.values.weight_lb], [98, 112, 14800]);
assert.equal(lightning.speed_basis, 'CAS');
assert.equal(lightning.values.power, 'off');
const lightningCurve = catalog.calibration_curves.find(row => row.id === lightning.correction.calibration_id);
assert.deepEqual(lightningCurve.configuration, { gear: 'up', flaps: 'up', pitot: 'Kollsman D-2, left wing' });
assert.deepEqual(lightningCurve.applies_to_source_ids, [pack.observations[lightning.id].source]);
assert.equal(interpolate(lightningCurve, 98), 112.4);
assert.equal(interpolate(lightningCurve, 92), null);
assert.equal(addedStall('p38g-4212690-clean-powered').values.speed_mph, 107);
assert.equal(addedStall('p38g-4212690-clean-powered').correction.in_report_calibration_interpolated_cas_mph, null);
assert.equal(addedStall('f4u4-clean-powered').values.speed_kt, 84.6);
assert.equal(addedStall('f4u4-landing-power-off').values.power, 'off');
assert.equal(addedStall('f4u4-landing-power-off').values.speed_kt, 77.7);
assert.deepEqual(addedStall('f4u4-clean-powered').supersedes, ['stall_us_2026-11-10:US20:0001']);
assert.equal(addedStall('f6f3-glide-fig5-first-roll').speed_basis, 'IAS');
assert.equal(addedStall('f6f3-glide-fig5-first-roll').values.weight_lb, null);
assert.equal(addedStall('p47d30-landing-wind-up-fig59').quantity, 'accelerated_stall_speed');
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
  assert.equal(row.primary_percent, baseline.variants[i].primary_percent + row.source_review_points);
  assert.equal(row.with_calculations_percent - row.source_review_points + row.legacy_context_points + row.overlapping_legacy_points, row.previous_total_percent);
  assert.equal(row.benchmarks.length, row.planned_count);
}
assert.equal(pack.coverage.rows.find(row => row.id === 'p40f_4113635').overlapping_legacy_points, 3);
console.log('PASS fighter sim inputs: reproducible release, preserved originals, grade selection, Gold, graph ranges and coverage reconciliation');
