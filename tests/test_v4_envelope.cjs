'use strict';
const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const E = require('../src/maneuver-envelope.js');
const turn = require('../src/turn-lift.js');
const source = require('../references/p51-turn-lift-tn1044.json');
const {buildData} = require('../validation/diagnostics/v4_envelope.cjs');
const {models, scorecard} = buildData();
assert.equal(Object.keys(models).length, 7);
for (const row of scorecard.corsair.stall) assert.ok(Math.abs(row.replayCasKt - row.knotsCas) < 1e-8);
assert.ok(scorecard.corsair.climb.every(row => row.predicted > row.baseline));
assert.ok(scorecard.corsair.climb.filter(row => row.role !== 'climb fit' && row.altFt < 20000)
  .every(row => Math.abs(row.predicted - row.observed) < 200));
assert.ok(scorecard.corsair.speed.filter(row => row.altFt < 10000).every(row => Math.abs(row.predicted - row.observed) < 2));
assert.ok(scorecard.corsair.speed.some(row => row.altFt > 20000 && row.predicted - row.observed < -10));
assert.ok(scorecard.thunderbolt.metrics.climb.candidateMae < scorecard.thunderbolt.metrics.climb.baselineMae);
assert.ok(scorecard.thunderbolt.metrics.speed.candidateMae < scorecard.thunderbolt.metrics.speed.baselineMae);
const check = scorecard.mustang.reserved;
assert.ok(Math.abs(check.candidate - check.observed) < Math.abs(check.baseline - check.observed));
assert.ok(Math.abs(check.candidate - check.observed) > 3); // Retain the unfavorable residual.
for (const alt of [0, 5000, 15000, 27000]) {
  for (const eas of [110, 130, 170, 225]) {
    for (const model of Object.values(models)) {
      const row = E.state(M, turn, source, model, alt, eas, model.ac.defaultRating, model.ac.weightLb);
      if (!row.band.length) continue;
      assert.ok(row.band.every(Number.isFinite));
      assert.ok(row.band[0] <= row.band[1]);
      assert.ok(row.sustainedDegSec === null || row.band[0] <= row.sustainedDegSec + 1e-7);
      assert.ok(row.sustainedDegSec === null || row.band[1] >= row.sustainedDegSec - 1e-7);
    }
  }
}
const a = models.f4u4;
const fixed = E.climbBand(M, a, 5000, 10000, 'military', 12500, 0);
const burned = E.climbBand(M, a, 5000, 10000, 'military', 12500, .5);
assert.ok(burned.endWeightLb < 12500 && burned.fuelUsedLb > 0 && burned.minutes < fixed.minutes);
const invalid = M.evaluated(a.ac, 5000, 170, {...a.options, propulsivePowerScale: 2});
assert.equal(invalid.status, 'invalid-propulsive-power-scenario');
assert.equal(M.evaluated(a.ac, 50000, 170, a.options).status, 'no-engine-source');
const withProp = {...models.p47b.ac, propGeometry: {...models.p47b.ac.propGeometry,
  reductionRatioEnginePerProp: 2, engineRpmByRating: {test: 2700},
  installedEfficiency: scorecard.thunderbolt.installedEfficiency}};
const noProp = {...withProp, propGeometry: {...withProp.propGeometry, installedEfficiency: undefined}};
assert.deepEqual(M.propEta(withProp, 10000, 200, 1900, 'P', 'test'),
  {...M.propEta(noProp, 10000, 200, 1900, 'P', 'test'), installedDeltaEta: 0});


for (const alt of [15000, 20000]) {
  const report = require('../validation/diagnostics/v4_installations.cjs').p47(alt);
  assert.ok(report.metrics.climb.candidateMae < report.metrics.climb.baselineMae);
}
const refined = E.climbBand(M, a, 5000, 10000, 'military', 12500, .5, 20);
assert.ok(Math.abs(refined.minutes - burned.minutes) * 60 < .1);
assert.throws(() => E.climbBand(M, a, 10000, 5000, 'military', 12500, .5));
const malformed = {...a.ac, propGeometry: {...a.ac.propGeometry,
  installedEfficiency: {...a.ac.propGeometry.installedEfficiency, minJ: 2}}};
assert.equal(M.propEta(malformed, 5000, 170, 1700, 'P', 'normal'), null);

for (const model of Object.values(models)) {
  const configured = {...model, options: {...model.options, ...model.climbOptions}};
  const rating = model.climbOptions?.rating ?? model.ac.defaultRating;
  const coarse = E.climbBand(M, configured, 5000, 10000, rating, model.ac.weightLb, .5, 10);
  const fine = E.climbBand(M, configured, 5000, 10000, rating, model.ac.weightLb, .5, 20);
  assert.ok(coarse && fine);
  assert.ok(Math.abs(coarse.minutes - fine.minutes) * 60 < .1, model.ac.name);
}

assert.equal(scorecard.il2.rows.length, 2);
for (const row of scorecard.il2.rows) {
  assert.equal(row.historicalResidual, null);
  assert.ok(row.scenarios.every(s => s.seconds < row.seconds));
}
