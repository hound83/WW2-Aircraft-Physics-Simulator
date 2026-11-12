'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const B = require('../src/operating-benchmark.js');
const T = require('../src/turn-lift.js');
const L = require('../references/p51-turn-lift-tn1044.json');
const evidence = require('../src/benchmark-graph-evidence.js');
const previous = require('../validation/diagnostics/operating_benchmark_v46.cjs').browserData();
const milestone = require('../validation/diagnostics/operating_benchmark_v410.cjs');
const data = milestone.browserData(previous);

function state(fleet, id, alt, tas, mode = 'combat', extra = {}) {
  const model = fleet.models[id], spec = fleet.specification.aircraft[id];
  const settings = { mode, fuelFraction: .5, ...extra };
  const weight = B.load(spec, fleet.specification.policy, settings).weightLb;
  return B.evaluate(M, T, L, model, spec, settings, alt, M.airspeeds(tas, alt).eas, weight);
}
function preserved(id, alt, tas, mode, settings) {
  assert.deepEqual(state(data, id, alt, tas, mode, settings), state(previous, id, alt, tas, mode, settings));
}

const f4u = state(data, 'f4u4', 29000, 430);
assert.equal(f4u.prop.eta, .8);
assert.equal(f4u.prop.levelReference.fraction, 1);
assert.equal(f4u.cleanCd0, .01726788);
assert.equal(f4u.power.shaftHp, state(previous, 'f4u4', 29000, 430).power.shaftHp);
assert.ok(f4u.power.propulsiveHp <= f4u.power.shaftHp);
const f4uEvidence = evidence.describe(f4u, 'acceleration', data.graphEvidence.f4u4);
assert.match(f4uEvidence.label, /clean-flight propeller and drag fit/);
assert.ok(f4uEvidence.propellerSource.url.endsWith('/f4u-4-80765.pdf'));

const p47 = state(data, 'p47b', 25000, 420);
assert.equal(p47.prop.eta, .76);
assert.equal(p47.cleanCd0, .01888452);
assert.equal(state(data, 'p47b', 5000, 352).prop.eta, .8);
const blend = state(data, 'p47b', 15000, 320).prop.levelReference?.fraction;
assert.ok(blend > 0 && blend < 1, 'the reference fades before the full high-speed domain');

preserved('p47b', 15000, 355, 'normal');
preserved('p47b', 10000, 196, 'combat', { openCooling: true });
preserved('p47b', 3000, 330, 'combat');
preserved('f4u4', 10000, 170, 'combat');
preserved('f4u4', 25000, 400, 'combat', { openCooling: true });
preserved('f4u4', 25000, 400, 'combat', { injection: true });
preserved('f4u4', 35000, 430, 'combat', { extension: true });

const levelGain = alt => state(data, 'f4u4', alt, 430).power.excessHp -
  state(previous, 'f4u4', alt, 430).power.excessHp;
assert.ok(Math.abs(levelGain(29000.1) - levelGain(28999.9)) < .05);
assert.equal(levelGain(30000), 0);
assert.ok(Math.abs(levelGain(29999.9)) < .05);

const score = milestone.run();
const [corsair, thunderbolt, independent] = score.speedChecks;
assert.equal(corsair.fixedShaft.count, 7);
assert.ok(corsair.fixedShaft.afterMaeMph < corsair.fixedShaft.beforeMaeMph * .5);
assert.ok(corsair.nativePower.afterMaeMph < corsair.nativePower.beforeMaeMph * .75);
assert.ok(thunderbolt.fixedShaft.afterMaeMph - thunderbolt.fixedShaft.beforeMaeMph < 1);
assert.equal(independent.fixedShaft.count, 3);
assert.ok(independent.fixedShaft.afterMaeMph < independent.fixedShaft.beforeMaeMph);
assert.ok(score.corsairClimb.checks.every(row => row.beforeFpm === row.afterFpm));
for (const [i, row] of score.differences.entries()) {
  assert.equal(row.changedStatus.length, 0, row.aircraft);
  for (const key of ['stallEasMph','climbFpm','sustainedDegSec','instantaneousDegSec','timedClimbSeconds']) {
    assert.equal(row[key]?.delta, 0, row.aircraft + ' ' + key);
  }
  if (!['p47b','f4u4'].includes(row.aircraft)) assert.deepEqual(score.after[i], score.before[i]);
}
assert.deepEqual(score.comparisonSensitivity.levelVerdicts, ['b', 'tie', 'a']);
