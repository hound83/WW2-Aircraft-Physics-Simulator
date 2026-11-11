'use strict';
const assert = require('node:assert/strict');
const {buildCatalog} = require('../scripts/research-layer.cjs');
const pack = require('../references/research/ww2_fighter_measured_conditions_2026-11-11.json');
const prior = require('../references/aircraft-readiness-flight-tests-2026-11-11.json');
const score = require('../references/aircraft-readiness-measured-conditions-2026-11-11.json');
const archival = require('../references/ww2_fighter_archival_numeric_series_2026-11-10.json');
const previousPack = require('../references/research/ww2_thirteen_fighter_source_recovery_2026-11-11.json');

const packId = 'ww2_fighter_measured_conditions_2026-11-11';
const catalog = buildCatalog();
const observations = catalog.observations.filter(row => row.pack_id === packId);
const get = id => pack.series.find(series => series.id === id);
const sum = values => values.reduce((total, value) => total + value, 0);

assert.equal(observations.length, 141);
assert.equal(catalog.sources.filter(source => source.pack_id === packId).length, 11);
assert.ok(observations.every(row => row.source_location && row.source_class && row.conditions));
assert.ok(observations.every(row => !row.preferred_airspeed));
assert.equal(get('d30-longitudinal-installation').rows[0][1], 'Curtiss SPA-5');
assert.equal(get('d30-additional-stall-traces').speed_basis, 'IAS');
assert.equal(get('d30-corrected-handling-test-speeds').speed_basis, 'CAS');
assert.equal(get('d30-steady-turn-control').speed_basis, 'unestablished');
const prop = get('p47d-hamilton-standard-climb-coefficients');
assert.equal(prop.rows.length, 44);
assert.match(prop.source_class, /different-propeller/);
assert.ok(prop.rows.every(row => Math.abs(row[2] * row[4] / row[3] - row[5]) < 0.01));

const braces = archival.series.find(series => series.id === 'S43').rows;
assert.deepEqual(braces[0], [18100, 1100, 2950, 369.5, 374]);
assert.deepEqual(get('p40f-brace-power-equilibrium-sensitivity').rows.map(row => row.slice(0,5)), braces);
const ki84 = previousPack.series.find(series => series.id === 'ki84-original-powered-landing-control-limits');
assert.equal(ki84.rows[0][ki84.columns.indexOf('map_as_printed')], '20 mm Hg');
assert.equal(ki84.rows[0][ki84.columns.indexOf('map_inhg')], null);
assert.equal(get('g1-14001-cooling-temperature-summary').rows[0][3], 43);

assert.deepEqual(score.weights, prior.weights);
assert.deepEqual(score.targets, prior.targets);
assert.equal(score.variants.length, prior.variants.length);
for (const v of score.variants) {
  const baseline = prior.variants.find(row => row.id === v.id);
  assert.deepEqual(v.previous_primary_points, baseline.primary_points);
  assert.deepEqual(v.previous_augmented_points, baseline.augmented_points);
  assert.equal(v.primary_percent, sum(v.primary_points));
  assert.equal(v.augmented_percent, sum(v.augmented_points));
  assert.equal(v.delta_primary, v.primary_percent - baseline.primary_percent);
  assert.equal(v.delta_augmented, v.augmented_percent - baseline.augmented_percent);
  assert.ok(v.primary_points.every((value, index) => value <= v.augmented_points[index] && v.augmented_points[index] <= score.weights[index]));
}
assert.equal(score.summary.initially_below_70_primary.variant_count, 10);
assert.equal(score.summary.fleet.primary_delta_pp, 1.85);
assert.equal(score.summary.fleet.augmented_delta_pp, 2.85);
console.log('PASS measured fighter data: 141 evidence records, trace speed bases and corrections, fixed coverage rubric');
