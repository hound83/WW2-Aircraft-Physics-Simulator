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

const thunderbolt = evidence.equivalent_efficiency.p47b.rows.find(row => row.alt_ft === 10000);
const { fitted_loss_hp_in_drag: fittedLoss, eta_if_fitted_loss_is_in_useful_power: comparableEta } = thunderbolt.propeller_comparison;
const donor = thunderbolt.donor_alternatives[0];
assert.equal(fittedLoss, 153.72);
assert.ok(Math.abs(thunderbolt.equivalent_eta - comparableEta - fittedLoss / thunderbolt.shaft_hp) < .00001);
assert.equal(donor.eta, .765391);
assert.ok(Math.abs(comparableEta - donor.eta - .0132) < .0001);
assert.ok(Math.abs(donor.replay_fpm_if_fitted_loss_is_in_useful_power - 2395.63) < .03);

const reference = evidence.working_reference;
assert.equal(reference.reference_values.baseline_eta, .8);
assert.equal(reference.reference_values.p47b_military_climb_eta, .76);
const newFlightRows = reference.flight_efficiency.rows.filter(row => row.id.includes('p47c-high-speed:'));
assert.equal(newFlightRows.length, 11);
for (const row of newFlightRows) {
  const v = originals.get(row.id)?.values;
  assert.equal(v.efficiency, row.eta);
  assert.ok(Math.abs(v.advance_ratio * v.thrust_coefficient / v.power_coefficient - v.efficiency) <= .006);
}
assert.equal(reference.flight_efficiency.rows.length, 103);
assert.equal(reference.level.length, 7);
const corsair = reference.level.find(row => row.aircraft === 'f4u4');
assert.equal(corsair.summary_mph.count, 7);
assert.ok(corsair.summary_mph.simple_mae < corsair.summary_mph.current_mae);
assert.ok(reference.p47b_independent_level.summary_mph.simple_mae < 3);
assert.equal(reference.p47b_independent_level.summary_mph.count, 3);
for (const test of reference.p38g_part_power.cases) {
  assert.equal(test.rows[0].simple, null);
  assert.equal(test.rows.at(-1).simple, null);
  assert.equal(test.leave_one_out_mph.count, test.rows.length - 2);
  assert.ok(test.leave_one_out_mph.simple_mae < 2);
}

const fleet = evidence[pack.propeller_efficiency.fleet_reference_key];
assert.deepEqual(fleet.aircraft.map(row => row.id).sort(), pack.coverage.rows.map(row => row.id).sort());
const sources = new Set(catalog.sources.map(row => row.id));
assert.ok(fleet.aircraft.every(row => row.sources.length && row.sources.every(id => sources.has(id))));
const donorRows = fleet.p47d28_high_speed.rows;
assert.equal(donorRows.length, 62);
assert.deepEqual(fleet.p47d28_high_speed.all.eta_span, [.611, .841]);
for (const row of donorRows) {
  const v = originals.get(row.observation).values;
  assert.equal(row.eta, v.efficiency);
  assert.equal(row.tip_mach, v.tip_mach);
  assert.ok(Math.abs(v.advance_ratio * v.thrust_coefficient / v.power_coefficient - v.efficiency) < .003);
}
assert.deepEqual(fleet.p47d28_high_speed.tip_mach_review.map(row => row.run), ['22-15']);
assert.equal(fleet.p47d28_high_speed.bands.at(-2).fixed_80_mae_pp, 16.05);
assert.equal(fleet.p47d28_high_speed.bands.at(-1).fixed_80_mae_pp, 7.59);

const intake = fleet.fw190a4;
assert.equal(intake.rows.length, 21);
assert.equal(intake.rows.find(row => row.altitude_m === 6000).internal_minus_external_kmh, 13);
assert.equal(intake.rows.find(row => row.altitude_m === 9000).internal_minus_external_kmh, -29);
assert.ok(intake.chart_check.internal_mae_kmh < 3);
assert.ok(intake.chart_check.long_external_mae_kmh < 3);
assert.ok(intake.chart_check.wrong_intake_mae_kmh > 10);
assert.deepEqual(fleet.p38g.replay.chart_bhp_per_engine, [1220, 1320]);
assert.ok(Math.abs(fleet.p38g.replay.error_mph) < 1);
assert.equal(fleet.p51b.at_20800_ft.rack_effect_mph, 13);
assert.equal(fleet.p51b.at_20800_ft.rating_gain_mph, 14);
assert.equal(fleet.p51b.replays.rating_check.error_mph, 5.78);
assert.equal(fleet.p51b.figure_5[0].manifold_inhg, 61);
assert.equal(fleet.p51b.figure_5[2].manifold_inhg, null);
const highBlower = fleet.spitfire_lfix_bs543;
assert.equal(highBlower.below_or_at_full_throttle_height.count, 3);
assert.ok(highBlower.below_or_at_full_throttle_height.anchored_mae_mph < 1);
assert.ok(highBlower.above_full_throttle_height.anchored_mae_mph > highBlower.above_full_throttle_height.current_mae_mph);
for (const row of highBlower.rows) {
  const v = originals.get(row.observation).values;
  assert.equal(v.tas_mph, row.observed_tas_mph);
  assert.equal(v.boost_psi, row.boost_psi);
}
assert.deepEqual(fleet.p40f_4113635.climb_comparison.map(row => row.april_minus_february_best_fpm), [175, 135, 110, 80]);

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
