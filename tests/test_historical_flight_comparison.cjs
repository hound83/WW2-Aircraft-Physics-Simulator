'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const catalog = require('../scripts/research-layer.cjs').buildCatalog();
const { reconcile } = require('../validation/diagnostics/early_war_series_crosswalk.cjs');
const charts = require('../validation/diagnostics/g6_archival_climb.cjs').observations();
const compare = require('../validation/diagnostics/historical_flight_comparison.cjs');

const ledger = reconcile(catalog);
assert.equal(ledger.seriesCount, 78);
assert.equal(ledger.rowCount, 522);
assert.equal(ledger.linkedRowCount, 70);
assert.equal(ledger.series.filter(s => s.id.startsWith('x4922-')).reduce((n,s) => n+s.matches.length,0), 28);
assert.equal(new Set(ledger.series.flatMap(s => s.matches.map(r => r.catalogId))).size, 70);
assert.equal(ledger.sourceLeads.length, 10);

let integratedMinutes = 0;
for (let i = 1; i <= 10; i++) {
  const lower = charts.rows[i-1], upper = charts.rows[i];
  integratedMinutes += 1000 * Math.log(lower.rateMps / upper.rateMps) / (lower.rateMps - upper.rateMps) / 60;
  assert.ok(Math.abs(integratedMinutes - upper.elapsedMin) < 0.3, 'Rate and time axes agree at '+upper.altKm+' km');
}
assert.equal(charts.rows[0].tasKmh, 260);
assert.equal(charts.rows.at(-1).tasKmh, null);
assert.ok(charts.rows[10].tasKmh > 440 && charts.rows[10].tasKmh < 452);
assert.equal(charts.temperature.length, 23);
assert.equal(charts.opening.length, 11);

const early = compare.earlyComparison(), later = compare.laterComparison(catalog);
assert.equal(early.level.find(r => r.altM === 3000).va, null);
assert.deepEqual(early.level.filter(r=>r.altM === 5000).map(r=>[r.radiator,r.pressureMm,r.vaMinusEMph]),
  [['open',870,36.6],['closed',880,5.5]]);
assert.equal(early.climb[0].vaMinusEIntervalSeconds, 0);
assert.deepEqual(later.measuredLevelReversalBandsFt, [[12000,14000],[18000,20000],[24000,26000]]);
assert.equal(later.rows.find(r=>r.altFt === 10000).level.g6, null);
assert.equal(later.rows.find(r=>r.altFt === 30000).deltas.tasMph.hfMinusLf, 18);
assert.equal(compare.comparisonCsv({early,later}),
  fs.readFileSync(path.join(root,'references/analysis/six-aircraft-flight-comparison.csv'),'utf8').replace(/\r\n/g,'\n'));
