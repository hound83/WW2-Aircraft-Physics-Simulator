'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {integrateSeconds, run} = require('../validation/diagnostics/climb_band.cjs');

const close = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance,
  'Expected ' + expected + ', got ' + actual);
const rate = (altFt, fpm) => ({altFt, fpm});
close(integrateSeconds([rate(0, 1000), rate(1000, 1000)], 'fpm'), 60);
close(integrateSeconds([rate(0, 1000), rate(500, 1500), rate(1000, 2000)], 'fpm'), 60 * Math.log(2));
close(integrateSeconds([rate(0, 2000), rate(1000, 1000)], 'fpm'), 60 * Math.log(2));
for (const invalid of [[], [rate(0, 1000), rate(0, 1000)], [rate(0, 1000), rate(1000, 0)],
  [rate(0, 1000), rate(1000, NaN)], [rate(1000, 1000), rate(0, 1000)]]) {
  assert.throws(() => integrateSeconds(invalid, 'fpm'), /increasing altitudes and positive finite rates/);
}

const report = run();
const {spitfire, thunderbolt, endpoints, time, alternates, scenarios} = report;
assert.deepEqual(report.bandFt, [20000, 30000]);
assert.deepEqual(spitfire.rows.map(r => r.sourceFpm), [3560, 3270, 2970, 2700, 2400, 2120]);
assert.deepEqual(thunderbolt.rows.map(r => [r.sourceFpm, r.engineRpm, r.shaftHp]),
  [[1565, 2550, 1625], [1380, 2550, 1625], [1140, 2550, 1625]]);
assert.deepEqual(thunderbolt.rows.map(r => r.fitRole), ['fit', 'reserved engineering check', 'fit']);
assert.deepEqual(endpoints.map(r => r.sourceGapFpm), [1995, 980]);
close(spitfire.reportedSeconds, 219);
close(thunderbolt.reportedSeconds, 441);
close(time.sourceTimeLeadSeconds, 222);
close(time.modelTimeLeadSeconds, 219.4077547089737);
close(time.precision.required3to1, 74);
close(time.precision.required5to1, 44.4);
assert.ok(Math.abs(time.precision.residual) < Math.abs(time.cleanControlTimeLeadSeconds - time.sourceTimeLeadSeconds));
assert.deepEqual(scenarios.map(r => r.sourceGapFpm), [1995, 1410, 1565, 980]);
assert.ok(scenarios[3].durationEvidence.includes('Integrated'));
close(scenarios[3].timeLeadSeconds, 98.51431732717174);
for (const result of [...endpoints, time]) {
  assert.equal(result.precision.practical3to1, 'unresolved');
  assert.equal(result.precision.highPrecision5to1, 'unresolved');
  assert.equal(result.precision.validatedErrorBound, null);
}
for (const source of [spitfire, thunderbolt, alternates.thunderbolt]) {
  const bytes = fs.readFileSync(path.join(__dirname, '..', source.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
}
