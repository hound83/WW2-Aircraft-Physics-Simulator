'use strict';

const assert = require('node:assert/strict');
const {buildCatalog} = require('../scripts/research-layer.cjs');
const pack = require('../references/research/ww2_german_fighter_archive_2026-11-11.json');
const baseline = require('../references/aircraft-readiness-measured-conditions-2026-11-11.json');
const score = require('../references/aircraft-readiness-german-archive-2026-11-11.json');

const catalog = buildCatalog();
const packId = 'ww2_german_fighter_archive_2026-11-11';
const observations = catalog.observations.filter(row => row.pack_id === packId);
const series = id => pack.series.find(entry => entry.id === id);
const sum = values => values.reduce((total, value) => total + value, 0);

assert.equal(observations.length, 136);
assert.equal(catalog.sources.filter(source => source.pack_id === packId).length, 28);
assert.ok(observations.every(row => row.source_location && row.source_class && row.conditions));
assert.ok(observations.every(row => row.quantity !== 'stall_speed' && row.speed_basis !== 'CAS'));
assert.ok(catalog.calibration_curves.every(curve => !curve.id.startsWith(packId + ':')));

const landing = series('f4-original-1941-landing');
assert.equal(landing.quantity, 'landing_speed');
assert.equal(landing.speed_basis, 'unestablished');
assert.deepEqual(landing.rows, [[2560, 135, 15]]);
assert.deepEqual(series('f4-rechlin-matched-climb').rows, [[1000, 5000, 240, 290], [1000, 10000, 750, 1110]]);
const doraLoads = series('d9-210002-load-by-trial');
assert.deepEqual(doraLoads.rows.map(row => row[1]), [4100, 4300]);

const gustav = series('g2-1943-pilot-rating-table');
assert.deepEqual(gustav.rows[0], ['start_emergency', 2800, 1.42, 1, false, null]);
assert.deepEqual(gustav.rows[1], ['climb_combat', 2600, 1.3, 30, true, 0.03]);
assert.equal(series('g2-14513-glide-speed-loss-trace').speed_basis, 'unestablished');
assert.equal(series('g2-14513-slat-events').speed_basis, 'IAS');
assert.deepEqual(series('g2-14513-weighing-and-cg').rows.slice(-2).map(row => row.slice(1)), [
  [3235, 25, 'takeoff'],
  [3235, 30.7, 'takeoff']
]);

for (const row of series('a4-teil0-four-airframe-loads').rows) {
  assert.equal(sum(row.slice(2, -1)), row.at(-1));
}
for (const id of ['a4-niivvs-turn-and-low-speed', 'd9-210251-niivvs-timed-turn']) {
  const turns = series(id);
  assert.equal(turns.quantity, 'reported_timed_turn');
  assert.equal(turns.source_class, 'historical-secondary-test-summary');
}
const eltron = series('d9-210002-original-eltron-chart');
assert.equal(eltron.rows[0][0], 360);
assert.equal(eltron.rows.at(-1)[0], 550);
assert.ok(eltron.rows.every(([, withCompressibility, withoutCompressibility]) => withCompressibility > withoutCompressibility));

assert.deepEqual(score.weights, baseline.weights);
assert.deepEqual(score.dimensions, baseline.dimensions);
assert.deepEqual(score.targets, baseline.targets);
assert.deepEqual(score.variants.map(row => row.id), baseline.variants.map(row => row.id));
const changed = new Set(['bf109f4_representative', 'bf109g2_db605a', 'fw190a4_783', 'fw190d9_210002']);
for (const [index, variant] of score.variants.entries()) {
  const prior = baseline.variants[index];
  assert.deepEqual(variant.previous_primary_points, prior.primary_points);
  assert.deepEqual(variant.previous_augmented_points, prior.augmented_points);
  assert.equal(variant.primary_percent, sum(variant.primary_points));
  assert.equal(variant.augmented_percent, sum(variant.augmented_points));
  assert.equal(variant.delta_primary, variant.primary_percent - prior.primary_percent);
  assert.equal(variant.delta_augmented, variant.augmented_percent - prior.augmented_percent);
  assert.ok(variant.primary_points.every((point, dimension) => point <= variant.augmented_points[dimension]));
  assert.ok(variant.augmented_points.every((point, dimension) => point <= score.weights[dimension]));
  if (changed.has(variant.id)) {
    assert.ok(variant.delta_primary > 0 && variant.delta_augmented > 0);
  } else {
    assert.deepEqual(variant.primary_points, prior.primary_points);
    assert.deepEqual(variant.augmented_points, prior.augmented_points);
  }
}

const german = score.variants.filter(variant => changed.has(variant.id));
for (const [summaryKey, variants] of [['german', german], ['fleet', score.variants]]) {
  const summary = score.summary[summaryKey];
  assert.equal(summary.variant_count, variants.length);
  for (const lane of ['primary', 'augmented']) {
    const after = sum(variants.map(variant => variant[lane + '_percent'])) / variants.length;
    const delta = sum(variants.map(variant => variant['delta_' + lane])) / variants.length;
    assert.equal(summary[lane + '_after'], Number(after.toFixed(2)));
    assert.equal(summary[lane + '_before'], Number((after - delta).toFixed(2)));
    assert.equal(summary[lane + '_delta_pp'], Number(delta.toFixed(2)));
  }
}
console.log('PASS German fighter archive: source scope, original conditions, and coverage deltas');
