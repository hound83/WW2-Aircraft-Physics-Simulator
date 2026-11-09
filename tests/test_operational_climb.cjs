'use strict';

const assert = require('node:assert/strict');
const {schedule, run} = require('../validation/diagnostics/operational_climb.cjs');
const {run: historical} = require('../validation/diagnostics/climb_band.cjs');
const intake = require('../references/aircraft-intake.json');

const close = (actual, expected, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) < tolerance,
  'Expected ' + expected + ', got ' + actual);
const curve = fpm => [{altFt: 20000, fpm}, {altFt: 30000, fpm}];
const sustained = curve(1000);
const short = curve(2000);
assert.deepEqual(schedule(sustained, short, 0), {seconds: 600, shortSeconds: 0, switchAltFt: null});
assert.deepEqual(schedule(sustained, short, 300), {seconds: 300, shortSeconds: 300, switchAltFt: null});
const switched = schedule(sustained, short, 120);
close(switched.seconds, 480);
close(switched.switchAltFt, 24000);
assert.throws(() => schedule(sustained, short, -1), /Invalid climb policy/);
assert.throws(() => schedule(sustained, curve(0), 120), /positive finite rates/);
assert.throws(() => schedule(sustained, short.slice(0, 1), 120), /Invalid climb policy/);
assert.throws(() => schedule([], short, 0), /Invalid climb policy/);

const source = historical();
const result = run(source);
const [continuous, twoMinutes, fiveMinutes] = result.scenarios;
assert.deepEqual(result.bandFt, [20000, 30000]);
assert.deepEqual(result.scenarios.map(s => s.budgetSeconds), [0, 120, 300]);
assert.deepEqual(result.curves.spitfireSustained.map(r => r.boostPsi), [12, 12, 11.9, 10.1, 8.4, 6.6]);
assert.ok(result.curves.spitfireSustained.every(r => r.engineRpm === 2850 && r.propRpm < 1400));
assert.deepEqual(result.curves.thunderboltShort.map(r => r.shaftHp), [2000, 2000, 1645]);
assert.ok(result.curves.thunderboltShort.every(r => r.engineRpm === 2700 && r.propRpm === 1350));
assert.equal(continuous.thunderbolt.seconds, source.thunderbolt.modelSeconds);
assert.equal(fiveMinutes.spitfire.seconds, source.spitfire.modelSeconds);
close(continuous.leadSeconds, 193.6884396675);
close(twoMinutes.spitfire.switchAltFt, 26247.55743561);
close(twoMinutes.thunderbolt.switchAltFt, 24393.80672221);
close(fiveMinutes.thunderbolt.switchAltFt, 29504.61231427);
assert.ok(result.scenarios.every(s => s.leadSeconds >= s.sensitivity.leadSeconds[0] - 1e-8 &&
  s.leadSeconds <= s.sensitivity.leadSeconds[1] + 1e-8));
assert.equal(result.donorCheck.rows.length, 3);
close(result.donorCheck.maeFpm, 109.8583756677);
assert.equal(result.precision.validatedErrorBound, null);
assert.deepEqual(intake.baseline, ['p51b', 'p47b', 'bf109f4', 'spitfire_lfix_bs543']);
assert.equal(intake.firstCandidate.specimen, 'W.Nr. 783');
