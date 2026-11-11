'use strict';

const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createHash } = require('node:crypto');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { sampleAt, accelerationTime, excessHp, HP, LBF } = require('../validation/diagnostics/propeller_efficiency_sweep.cjs');
const { densityInterpolate } = require('../validation/diagnostics/propeller_efficiency_evidence.cjs');
const pack = require('../references/analysis/fighter-sim-inputs-v1.json');

const bytes = readFileSync(join(__dirname, '..', pack.propeller_efficiency.path));
assert.equal(createHash('sha256').update(bytes).digest('hex'), pack.propeller_efficiency.sha256);
const evidence = JSON.parse(bytes);
const catalog = buildCatalog();
const originals = new Map(catalog.observations.map(row => [row.id, row]));
for (const branch of evidence.primary_series) {
  const rows = branch.observations.map(id => originals.get(id));
  assert.ok(rows.every(row => row?.source_id === branch.source));
  const values = rows.map(row => row.values.efficiency);
  assert.deepEqual(branch.observed_eta_span, [Math.min(...values), Math.max(...values)]);
}
const flightRows = evidence.primary_series.slice(0, 3).flatMap(branch => branch.observations.map(id => originals.get(id)));
assert.equal(flightRows.length, 42);
assert.equal(flightRows.find(row => row.values.run === '20-1').values.efficiency, .779);
assert.equal(flightRows.find(row => row.values.run === '20-3').values.efficiency, .799);
for (const { values: v } of flightRows) {
  assert.ok(Math.abs(v.advance_ratio * v.thrust_coefficient / v.power_coefficient - v.efficiency) < .007);
}
const rotol = evidence.primary_series.find(branch => branch.id === 'rotol-ra10046-22deg-tunnel');
assert.equal(rotol.observations.length, 25);
for (const id of rotol.observations) {
  const v = originals.get(id).values;
  assert.ok(Math.abs(v.advance_ratio * v.propulsive_thrust_coefficient / (2 * Math.PI * v.torque_coefficient) - v.efficiency) < .005);
  assert.notEqual(v.table_row, 23);
}
const military = flightRows.filter(row => row.values.run.startsWith('29-'));
assert.equal(densityInterpolate(military, 1), null);
assert.equal(densityInterpolate(military, .45), null);
assert.equal(densityInterpolate(military, .858).eta, .750);

const { input, counts, cases, unavailable } = evidence.sweep;
assert.deepEqual(input.output_factors, [.8, .95, 1, 1.05, 1.2]);
assert.equal(cases.length, counts.supported_cases);
assert.equal(unavailable.length, counts.unavailable_cases);
assert.equal(counts.baseline_states * input.applied_factors.length, counts.efficiency_evaluations);
const scope = new Set([...cases, ...unavailable].map(row => row.aircraft));
assert.equal(cases.length + unavailable.length, scope.size * input.modes.length * input.altitudes_ft.length);
const names = new Set();
for (const row of [...cases, ...unavailable]) {
  const key = [row.aircraft, row.mode, row.alt_ft].join('/');
  assert.ok(!names.has(key));
  names.add(key);
}
for (const row of cases) {
  assert.equal(row.level_tas_mph.length, input.output_factors.length);
  assert.equal(row.climb_fpm.length, input.output_factors.length);
  assert.equal(row.acceleration_seconds.length, input.output_factors.length);
  assert.deepEqual(row.at_eas.map(sample => sample.eas_mph), input.sample_eas_mph);
  for (const sample of row.at_eas) {
    assert.equal(sample.effective_eta.length, input.output_factors.length);
    assert.ok(sample.effective_eta.every(eta => eta === null || eta > 0 && eta <= 1));
  }
}
assert.equal(evidence.equivalent_efficiency.level.find(row => row.aircraft === 'p38g')
  .rows.filter(row => !row.within_shaft_limit).length, 6);

// A known constant acceleration exercises force/mass conversion and the timed integral.
const flight = tasMph => {
  const weightLb = 10000;
  const requiredHp = 350;
  const usefulHp = requiredHp + 5 * .44704 ** 2 * tasMph * weightLb * LBF / (9.80665 * HP);
  return { status: 'modelled', tasMph, weightLb, power: { requiredHp, propulsiveHp: usefulHp, shaftHp: 2000 },
    limits: { nLift: 4, structG: 8 }, drag: { inducedHp: 150 } };
};
const states = [200, 225, 250].map(flight);
const before = structuredClone(states);
assert.equal(sampleAt(states[0], 1).acceleration_mph_s, 5);
assert.ok(Math.abs(accelerationTime(states, 1) - 10) < 1e-9);
assert.ok(accelerationTime(states, 1.05) < 10);
assert.equal(excessHp(states[0], 10), 2000 - 350);
assert.deepEqual(states, before);
console.log('Propeller sources, aligned sweep series, physical cap and timed sensitivity verified.');
