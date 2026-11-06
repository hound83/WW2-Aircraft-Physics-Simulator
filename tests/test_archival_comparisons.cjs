'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const {run} = require('../validation/diagnostics/archival_comparisons.cjs');

const report = run();
assert.equal(report.rows.length, 28);
assert.equal(new Set(report.rows.map(r => r.id)).size, 28);
assert.equal(report.rows.filter(r => r.evidence === 'digitized').length, 6);
assert.equal(report.rows.filter(r => r.status === 'qualified replay').length, 8);
assert.ok(report.rows.every(r => r.historicalValidationEligible === false));
assert.ok(report.rows.filter(r => r.status === 'source-only').every(r => r.difference === null && r.model === null));
assert.ok(report.rows.every(r => report.sources[r.sourceId]));
assert.deepEqual(report.sourceAssessment.rangeMph, [15,18]);
assert.equal(report.sourceAssessment.evidence, 'derived');
assert.equal(report.precision.practical3to1, 'UNRESOLVED');
assert.equal(report.precision.highPrecision5to1, 'UNRESOLVED');
assert.equal(report.precision.differentialBound, null);

const byId = id => report.rows.find(row => row.id === id);
assert.equal(byId('p51-speed-20800').conditions.weightLb, null);
assert.equal(byId('p51-fig5-1').conditions.engineRpm, 2100);
assert.match(byId('p51-speed-20800').conditions.configuration, /wing racks installed/);
assert.match(byId('p51-fig5-1').conditions.configuration, /wing racks installed/);
const tableV = report.rows.filter(row => row.location === 'Table V');
assert.deepEqual(tableV.map(row => [row.altFt, row.value, row.conditions.gear, row.conditions.boostPsi]), [
  [0, 336, 'low', 18], [10800, 384, 'low', 18], [20000, 399, 'high', 18.5], [22000, 407, 'high', 18.5]
]);
assert.ok(tableV.every(row => row.conditions.engineRpm === 2995 && row.conditions.weightLb === 7110
  && row.status === 'source-only'));
assert.equal(byId('bs543-climb-20000').conditions.tasMph, 224);
assert.equal(byId('bs543-climb-20000').fitRole, 'exposed calibration programme');
assert.equal(byId('p38g-clean-22600').conditions.bhpPerEngine, 1225);
assert.equal(byId('p38g-clean-22600').conditions.engineCount, 2);
assert.equal(byId('lr495-clean-20000').conditions.externalBombsLb, 0);
assert.equal(byId('lr495-loaded-20000').conditions.internalBombsLb, 2000);
assert.equal(byId('lr495-loaded-20000').conditions.externalBombsLb, 1000);
assert.equal(byId('lr495-loaded-20000').conditions.weightLb, 21700);
assert.equal(report.sources['lr495-4'].dependencyGroup, report.sources['lr495-8'].dependencyGroup);
assert.notEqual(report.sources['fw783-5'].dependencyGroup, report.sources['fw619-3'].dependencyGroup);
assert.equal(byId('fw190-783-special-sl').conditions.boostAta, 1.7);
assert.ok(report.exclusions.p38Mosquito.includes('2 × 1,100 lb'));

for (const source of Object.values(report.sources).filter(s => s.kind === 'primary-scan')) {
  assert.match(source.sha256, /^[a-f0-9]{64}$/);
  if (source.localPath) {
    const bytes = fs.readFileSync(path.join(__dirname, '..', source.localPath));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), source.sha256);
  }
}
