'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const {model, run} = require('../validation/diagnostics/p38g.cjs');

const twin = model(2);
const single = model(1);
const alt = 20000;
const tas = 219;
const flight = twin.climb(alt, tas);
const expected = M.propEta(twin.ac, alt, tas, 1195, 'P', 'climb');
assert.equal(flight.engine.bhp, 1195);
assert.equal(flight.power.shaftHpPerEngine, 1195);
assert.equal(flight.power.shaftHp, 2390);
assert.equal(flight.power.engineCount, 2);
assert.equal(flight.prop.eta, expected.eta);
assert.equal(flight.prop.propRpm, 1500);
assert.ok(Math.abs(flight.power.propulsiveHp - 2390 * expected.eta) < 1e-9);

const options = {...twin.base, rating: 'climb'};
const samePolar = M.evaluated({...twin.ac, engineCount: 1}, alt, tas, options);
const defaultCount = {...twin.ac};
delete defaultCount.engineCount;
assert.deepEqual(M.evaluated(defaultCount, alt, tas, options), samePolar);
const two = M.evaluated(twin.ac, alt, tas, options);
assert.deepEqual(two.drag, samePolar.drag);
assert.equal(two.power.propulsiveHp, 2 * samePolar.power.propulsiveHp);
assert.equal(twin.level(14700, 13525, 'level-48'), null);
assert.equal(twin.level(31000, 13550), null);
assert.ok(twin.coolingAreaM2 > 0);
assert.ok(single.requestedCoolingAreaM2 < 0);
assert.equal(single.coolingAreaM2, 0);

const report = run();
const point = report.level.find(row => row.altFt === 22600);
assert.equal(point.observedMph, 404);
assert.equal(point.bhpPerEngine, 1225);
assert.ok(Math.abs(point.twinMph - 409.34) < 0.01);
assert.equal(report.metrics.levelMph.count, 4);
assert.equal(report.metrics.climbFpm.count, 7);
assert.equal(report.comparison.length, 6);
assert.ok(report.comparison.every(row => [row.lightning, row.thunderbolt].every(aircraft =>
  [aircraft.speedMph, aircraft.climbFpm, aircraft.propRpm].every(Number.isFinite))));
