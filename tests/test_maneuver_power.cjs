'use strict';

const assert = require('node:assert/strict');
const {run} = require('../validation/diagnostics/maneuver_power.cjs');

const report = run();
assert.equal(report.source.observedTasMph, null);
assert.equal(report.source.instantaneousWeightLb, null);
assert.equal(report.coverage.genericCount, 3);
assert.equal(report.coverage.chartCount, 5);
assert.deepEqual(report.climbs[0].observedFpm, [3820, 3820]);
assert.deepEqual(report.climbs[4].observedFpm, [2925, 3175]);
assert.equal(report.climbs[4].bestGenericClimbFpm, null);
assert.ok(report.climbs[4].bestChartClimbFpm > 2700);
for (const row of report.climbs) {
  for (const {chart, chartClimbFpm} of row.speeds) {
    assert.ok(chartClimbFpm[0] <= chart.climbFpm && chart.climbFpm <= chartClimbFpm[1]);
    assert.ok(Math.abs(chart.propulsiveHp - chart.requiredHp - chart.excessHp) < 1e-9);
  }
}
const workbook = report.turn.find(row => row.altFt === 20800).rows.find(row => row.tasMph === 250);
assert.ok(Math.abs(workbook.nominal.sustainedG - 2.3877270823772214) < 1e-9);
assert.ok(workbook.sustainedG[0] < workbook.nominal.sustainedG && workbook.nominal.sustainedG < workbook.sustainedG[1]);
assert.ok(report.turn.every(station => station.rows.every(row => row.sustainedG?.every(Number.isFinite))));
assert.equal(report.candidate.splits.length, 4);
assert.equal(report.candidate.splits.filter(row => row.candidateMae < row.baselineMae).length, 3);
assert.equal(report.candidate.donor.baselineRows.climb.length, 5);
assert.ok(report.candidate.donor.challenger.climbMaeFpm > report.candidate.donor.baseline.climbMaeFpm);
assert.equal(report.candidate.decision, 'retain v3.12 propulsion');
