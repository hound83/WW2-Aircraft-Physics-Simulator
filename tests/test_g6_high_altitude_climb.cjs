'use strict';

const assert = require('node:assert/strict');
const intake = require('../scripts/aircraft-batch.cjs');
const catalog = require('../scripts/research-layer.cjs').buildCatalog();
const base = require('../validation/diagnostics/shared_flight_climb.cjs').browserData();
const data = intake.addAircraftBatch(base, catalog);
const archived = require('../validation/diagnostics/g6_archival_climb.cjs').evidence(data);
const report = require('../validation/diagnostics/g6_high_altitude_climb.cjs').run(data);
const { baseline, pressureOnly, pressureHigh, pressureLow, pressureAlignedToCommand,
  estimatedFuelBurnOnly, pressureAndEstimatedFuelBurn } = report.scenarios;
const band = (scenario, from, to) => scenario.bands.find(r => r.fromKm === from && r.toKm === to);

for (const row of archived.elapsed.rows.filter(r => [5, 8, 10].includes(r.altKm))) {
  assert.equal(band(pressureOnly, 0, row.altKm).modeledS, row.predicted);
}
assert.equal(band(baseline, 8, 10).observedS, 390);
assert.equal(band(baseline, 8, 10).endpointReadAllowanceS, 36);
assert.ok(Math.abs(report.rateIntegrationS.from8to10Km - 390) < 2);
assert.ok(Math.abs(report.rateIntegrationS.to10Km - 1026) < 10);
assert.ok(band(baseline, 9, 10).errorS / band(baseline, 8, 10).errorS > 0.8);
assert.ok(Math.abs(band(pressureOnly, 8, 10).errorS) < band(pressureOnly, 8, 10).endpointReadAllowanceS);
assert.ok(band(pressureOnly, 0, 8).errorS < band(baseline, 0, 8).errorS);
assert.equal(band(pressureOnly, 0, 5).modeledS, band(baseline, 0, 5).modeledS);
assert.ok(band(pressureHigh, 8, 10).modeledS < band(pressureLow, 8, 10).modeledS);
assert.ok(band(pressureAlignedToCommand, 8, 10).modeledS > band(pressureLow, 8, 10).modeledS);
assert.ok(band(estimatedFuelBurnOnly, 8, 10).errorS > band(pressureOnly, 8, 10).errorS);
assert.ok(pressureAndEstimatedFuelBurn.modeledFuelUsedKg.at(-1).kg > 0);
const ten = report.powerBudgets.find(r => r.altKm === 10);
assert.equal(ten.baseline.requiredHp, ten.chartPressure.requiredHp);
assert.ok(ten.baseline.manifoldAta < 0.70 && ten.chartPressure.manifoldAta > 0.75);
assert.ok(Math.abs(ten.chartPressure.verticalMps - ten.observedMps) < ten.readAllowanceMps);
assert.ok(report.manifoldPressure.g1.at(-1).ata > ten.baseline.manifoldAta);
assert.ok(Object.values(report.numerical).every(seconds => seconds <= 0.2));
