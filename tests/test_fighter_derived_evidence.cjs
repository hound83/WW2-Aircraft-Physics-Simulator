'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { buildEvidence, encode, renderExplorer } = require('../scripts/derive-fighter-evidence.cjs');
const { bracket, climbSeconds, effectiveAreaRatio, loadScaledCasKnots, ratioSpeed, KNOT_MPH } = require('../scripts/fighter-evidence-methods.cjs');
const baseline = require('../references/aircraft-readiness-german-archive-2026-11-11.json');

const catalog = buildCatalog();
const data = buildEvidence(catalog);
const file = path.resolve(__dirname, '../references/analysis/fighter-derived-evidence-2026-11-11.json');
assert.equal(fs.readFileSync(file, 'utf8'), encode(data), 'Committed evidence pack matches the reproducible analysis');

const corsair = catalog.observations.find(o => o.id === 'stall_us_2026-11-10:US20:0002');
assert.equal(corsair.unit, 'knots');
assert.equal(corsair.values.stall_speed, 89.4);
assert.equal(corsair.speed_basis, 'CAS');
assert.ok(Math.abs(corsair.preferred_airspeed.speed_mph - 89.4 * KNOT_MPH) < 1e-9);
assert.equal(ratioSpeed(100, 0.81), 90);
assert.equal(climbSeconds(1000, 10, 10), 100);
assert.ok(Math.abs(climbSeconds(1000, 10, 20) - 100 * Math.log(2)) < 1e-9);
assert.ok(Math.abs(loadScaledCasKnots(89.4, 2500, 1) - 89.4) < 1e-9);
assert.ok(effectiveAreaRatio(323, 309) > 1.14);
assert.throws(() => bracket([{x:0,y:5},{x:10,y:8}], 11), /outside source bracket/);

const sourceModes = new Set(['primary', 'secondary', 'documentary']);
for (const [i, row] of data.coverage.rows.entries()) {
  assert.equal(row.id, baseline.variants[i].id);
  assert.equal(row.primary_percent, baseline.variants[i].primary_percent);
  assert.equal(row.augmented_percent, baseline.variants[i].augmented_percent);
  assert.ok(row.delta_calculations_points > 0);
  assert.equal(row.with_calculations_percent, row.augmented_percent + row.delta_calculations_points);
  row.points.forEach((score, j) => assert.ok(score >= baseline.variants[i].augmented_points[j] && score <= baseline.weights[j]));
  assert.ok(data.charts.some(c => c.aircraft === row.id));
}
for (const c of data.charts) for (const s of c.series) {
  assert.ok(s.observations.length);
  for (const id of s.observations) assert.ok(data.sources[data.observations[id].source], id);
  assert.ok(s.points.every(([x, y, lo, hi, mode], i) =>
    lo <= y && y <= hi && (!i || x > s.points[i - 1][0]) &&
    (sourceModes.has(mode) || mode === 'scenario' || mode === 'calculated')));
}
const chart = id => data.charts.find(c => c.id === id);
const check = id => data.checks.find(c => c.id === id);
const open = chart('a4-timed-cooling-climb').series[0];
assert.equal(open.solidHistory, true);
assert.deepEqual(open.points.at(-2), [9000, 786, 756, 816, 'primary']);
assert.deepEqual([open.points.at(-1)[0], open.points.at(-1)[4]], [10000, 'calculated']);
const g2 = chart('g2-known-setting-speed');
assert.equal(g2.series[1].points.at(-1)[0], 6420);
assert.equal(g2.series[2].points[0][0], 7110);
assert.equal(check('g2-finnish-table-time-time-10000').outcome, 'outside');
assert.equal(check('g2-finnish-original-time-time-10000').outcome, 'within');
assert.ok(Math.abs(check('g2-finnish-original-time-time-10000').delta) < 3);
assert.equal(check('f4-rechlin-factory-1-to-5').delta, 0);
assert.equal(check('f4-rechlin-factory-1-to-5').outcome, 'comparison-only');
assert.equal(check('ki84-handbook-time-time-8000').outcome, 'outside');

const html = renderExplorer(data);
const code = html.match(/<script>([\s\S]+)<\/script>/)[1];
new vm.Script(code, { filename: 'fighter-evidence-curves.html' });
assert.ok(!code.includes('/* EVIDENCE_DATA */ null'));
assert.ok(html.includes('Fw 190 A-4 783'));
console.log('PASS fighter calculations: checked units, coverage caps, physical transforms, source conflicts, matched curve joins and standalone viewer');
