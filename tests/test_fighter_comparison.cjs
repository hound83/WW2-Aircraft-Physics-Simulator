'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../src/physics.js');
const data = require('../aircraft/cases.json');
const flightEnvelope = require('../calibration/flight-envelope.json');
const {run} = require('../validation/diagnostics/fighter_comparison.cjs');

const report = run();
assert.deepEqual(report.scenarios.map(row => row.altFt), [8000, 15000, 27000]);
assert.equal(report.pairwise5to1, 'unresolved');
for (const scenario of report.scenarios) {
  assert.equal(scenario.rows.length, 4);
  assert.equal(scenario.air.ias, null);
  assert.ok(Math.abs(scenario.air.eas - 175) < 1e-9);
  for (const row of scenario.rows) {
    const ac = data.aircraft[row.id];
    const options = {profile: 'P', flightEnvelope, weightLb: ac.weightLb, rating: ac.defaultRating};
    const direct = M.evaluated(ac, scenario.altFt, scenario.air.tas, options);
    assert.equal(row.status, direct.status);
    assert.equal(row.climbFpm, direct.power?.climbFpm ?? null);
    assert.equal(row.sustainedG, direct.limits?.nSust ?? null);
    assert.equal(row.maxLevelTasMph, M.maxSpeed(ac, scenario.altFt, options));
    assert.ok(row.stall.easMph > 0);
    if (direct.limits) {
      assert.ok(Math.abs(row.stall.easMph - direct.stallEasMph) < 1e-9);
      assert.ok(Math.abs(row.sustainedG - Math.min(row.liftG, row.structuralG, row.powerG)) < 1e-9);
    }
  }
}
const f4High = report.scenarios.at(-1).rows.find(row => row.id === 'bf109f4');
assert.equal(f4High.status, 'no-engine-source');
assert.equal(f4High.sustainedG, null);
assert.equal(f4High.shaftHp, null);
assert.ok(f4High.stall.casMph > f4High.stall.easMph);

const m = report.mustang;
assert.equal(m.air.tas, 250);
assert.equal(m.workbook.shaftHp * m.workbook.propEta, m.workbook.propulsiveHp);
assert.equal(m.working.shaftHp, 1390);
assert.equal(m.working.gear, 'high');
assert.equal(m.delta.propulsiveHp, m.working.propulsiveHp - m.workbook.propulsiveHp);
assert.equal(m.delta.sustainedG, m.working.sustainedG - m.workbook.sustainedG);

const [cas, eas] = report.gregP47.cases;
assert.equal(report.gregP47.stallEasMph, 120);
assert.equal(cas.rows.length, 7);
assert.equal(eas.rows.length, 7);
assert.ok(Math.abs(cas.rows[0].air.cas - 125) < 1e-9);
assert.ok(Math.abs(eas.rows[0].air.eas - 125) < 1e-9);
assert.ok(cas.rows[0].gregStallG < cas.rows[0].workingG && cas.rows[0].powerG > cas.rows[0].workingG);
assert.ok(cas.rows.slice(2).every(row => row.gregStallG === row.workingG && row.powerG === row.workingG));
assert.notEqual(cas.errors.workingG.mae, eas.errors.workingG.mae);

const built = fs.readFileSync(path.join(__dirname, '../dist/model.html'), 'utf8');
const embedded = built.match(/<script type="application\/json" id="fighter-comparison-data">([^<]+)<\/script>/);
assert.ok(embedded);
assert.deepEqual(JSON.parse(embedded[1]), report);
