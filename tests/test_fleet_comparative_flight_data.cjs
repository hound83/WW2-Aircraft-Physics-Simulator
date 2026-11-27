'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { asCsv } = require('../scripts/export-fleet-research.cjs');
const baseline = require('./fixtures/fleet-intake-baseline.json');
const pack = require('../references/research/fleet_comparative_flight_data_2026-11-27.json');
const packId = 'fleet_comparative_flight_data_2026-11-27';
const catalog = buildCatalog();
const previous = new Set(baseline.packs);
const countPrevious = records => records.filter(record => previous.has(record.pack_id)).length;

// Historical intake tests used to pin totals for the entire, growing catalog.
// Keep the original inventory exact while allowing an independently sourced intake.
assert.equal(countPrevious(catalog.source_packs.map(pack => ({ pack_id: pack.id }))), 25);
assert.equal(countPrevious(catalog.observations), baseline.observations);
assert.equal(countPrevious(catalog.sources), baseline.sources);
assert.equal(countPrevious(catalog.document_lineage), baseline.lineageGroups);

const observations = catalog.observations.filter(row => row.pack_id === packId);
const bySeries = Object.fromEntries(pack.series.map(series => [series.id, series]));
assert.equal(pack.sources.length, 13);
assert.equal(pack.series.length, 91);
assert.equal(observations.length, 332);
assert.equal(catalog.sources.filter(row => row.pack_id === packId).length, pack.sources.length);
assert.equal(catalog.document_lineage.filter(row => row.pack_id === packId).length, 4);
assert.ok(pack.sources.every(source => source.url.startsWith('https://') && source.primary_followup));
const fleet = require('../dist/fleet-validation.json').aircraft.map(row => row.id);
assert.deepEqual(Object.keys(pack.profile_series).sort(), fleet.sort());
for (const [id, seriesIds] of Object.entries(pack.profile_series)) {
  assert.ok(seriesIds.length > 0);
  assert.deepEqual(seriesIds, pack.series.filter(row => row.conditions.profile_ids.includes(id)).map(row => row.id));
}
assert.ok(pack.series.every(series => series.conditions.profile_ids.every(id => fleet.includes(id))));
assert.ok(observations.every(row => row.source_location && row.conditions.applicability));
assert.equal(bySeries['taic-f4u-4'].conditions.low_speed_definition, 'Power-on stall at normal gross weight');
assert.equal(bySeries['taic-p-38j'].conditions.low_speed_definition, 'Typical landing speed quoted by pilots');
assert.equal(bySeries['ptr-fw190-speed'].conditions.full_power_duration_s, 120);
assert.equal(bySeries['ptr-f6f3-speed'].rows.find(row => row[0] === 15000)[1], 310);
assert.equal(bySeries['ptr-fw190-ratings'].rows[1].at(-1), 2450);
assert.equal(bySeries['e3-climb-unit-conflict'].conditions.use, 'archival discrepancy only');
assert.ok(bySeries['p51d-pitch_force_by_load'].rows.slice(2).every(row => row[2].startsWith('author estimate')));

function crossingTime(rows, target) {
  const upper = rows.findIndex(([, speed]) => speed >= target);
  assert.ok(upper > 0, 'Both speed crossings must be bracketed by this aircraft’s own trace');
  const [t1, v1] = rows[upper - 1];
  const [t2, v2] = rows[upper];
  return t1 + (t2 - t1) * (target - v1) / (v2 - v1);
}
for (const [key, roundedSeconds] of Object.entries({ p47d: 34, fg1d: 41, f6f5: 33, p51d: 25 })) {
  const trace = bySeries[key + '-level_acceleration_trace'];
  assert.equal(trace.conditions.altitude_msl_ft, 10000);
  assert.equal(trace.speed_basis, 'IAS');
  const elapsed = crossingTime(trace.rows, 205) - crossingTime(trace.rows, 180);
  assert.equal(Math.round(elapsed), roundedSeconds);
}
const saved = fs.readFileSync(require.resolve('../references/analysis/fleet-comparative-flight-data-2026-11-27.csv'), 'utf8');
assert.equal(asCsv(pack), saved);
