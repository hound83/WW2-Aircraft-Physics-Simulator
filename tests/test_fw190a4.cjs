'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const aircraft = require('../aircraft/fw190a4.json');
const {run} = require('../validation/diagnostics/fw190a4.cjs');

const power = (m, kmh, mode = 'rated-inlet', gear = 'auto') =>
  M.ratedInletPower(aircraft, m / 0.3048, kmh / 1.609344, 'combat', gear, mode);
assert.equal(power(2999, 550).gear, 'low');
assert.equal(power(3000, 550).gear, 'high');
assert.equal(power(2999, 550, 'rated-inlet', 'high'), null);
assert.equal(power(10001, 550), null);
assert.equal(power(8000, 0), null);
assert.equal(power(1000, 575).engineRpm, 2400);
assert.equal(power(6950, 652).estimatedManifoldAta, 1.32);
assert.ok(power(9000, 650).bhp > power(9000, 350).bhp);
assert.ok(power(9000, 650).bhp > power(9000, 650, 'rated-static').bhp);
assert.equal(power(9000, 650, 'rated-static').bhp, power(9000, 350, 'rated-static').bhp);
assert.ok(power(10000, 650).bhp < power(9000, 650).bhp);

const r = run();
assert.equal(r.speed.filter(row => row.role === 'check').length, 7);
assert.equal(r.climbs.filter(row => row.role === 'check').length, 8);
for (const row of r.speed.filter(row => row.role !== 'check')) {
  assert.ok(Math.abs(row.installed - row.observed) < 1e-7);
}
assert.ok(r.metrics.speedKmh.installed < 0.5 * r.metrics.speedKmh.static);
assert.ok(r.metrics.climbFpm.installed < 0.7 * r.metrics.climbFpm.static);
assert.ok(r.climbs.at(-1).installed < r.climbs.at(-1).observed);
assert.ok(r.coolingAreaM2 > 0 && r.coolingAreaM2 < 0.25);
assert.ok(Object.values(r.fastFlight).every(row => Math.abs(row.offset + row.slope) < 0.005));
assert.equal(r.comparison.length, 5);
for (const point of r.comparison) {
  assert.deepEqual(point.speeds.map(row => row.easMph), [150, 175, 225]);
  assert.ok(point.speeds.every(row => row.aircraft.length === 2));
  assert.equal(point.speeds[0].aircraft[0].speedKmh, point.speeds[2].aircraft[0].speedKmh);
}
