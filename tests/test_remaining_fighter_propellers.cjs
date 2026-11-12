'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const B = require('../src/operating-benchmark.js');
const T = require('../src/turn-lift.js');
const L = require('../references/p51-turn-lift-tn1044.json');
const Evidence = require('../src/benchmark-graph-evidence.js');
const previous = require('../validation/diagnostics/operating_benchmark_v410.cjs').browserData();
const milestone = require('../validation/diagnostics/remaining_fighter_propellers.cjs');
const data = milestone.browserData(previous);

function flight(fleet, altFt, tasMph, mode = 'combat', openCooling = false) {
  const { specification: { aircraft: { p38g: spec }, policy }, models: { p38g: model } } = fleet;
  const settings = { mode, fuelFraction: .5, openCooling };
  const { weightLb } = B.load(spec, policy, settings);
  return B.evaluate(M, T, L, model, spec, settings, altFt, M.airspeeds(tasMph, altFt).eas, weightLb);
}

const earlier = flight(previous, 22600, 404);
const military = flight(data, 22600, 404);
assert.equal(military.prop.levelReference.fraction, 1);
assert.equal(military.power.shaftHpPerEngine, 1225);
assert.equal(military.power.shaftHp, 2450);
assert.equal(military.power.engineCount, 2);
assert.equal(military.cleanCd0, earlier.cleanCd0);
assert.ok(military.prop.eta < earlier.prop.eta);
assert.ok(military.power.propulsiveHp > 0 && military.power.propulsiveHp <= military.power.shaftHp);
assert.equal(flight(data, 30000, 396).engine.mapInHg, 36);
const evidence = Evidence.describe(military, 'acceleration', data.graphEvidence.p38g);
assert.match(evidence.label, /clean-flight propeller and shaft-power reference/);
assert.ok(evidence.propellerSource.url.endsWith('/p-38/p-38.html'));

for (const args of [
  [22600, 404, 'normal'], [22600, 404, 'combat', true], [22600, 200], [4000, 346], [31000, 396],
]) {
  assert.deepEqual(flight(data, ...args), flight(previous, ...args), args.join(', '));
}
const powerDifference = altFt => flight(data, altFt, 396).power.excessHp - flight(previous, altFt, 396).power.excessHp;
assert.ok(Math.abs(powerDifference(29999.9) - powerDifference(30000.1)) < .1);
assert.ok(Math.abs(powerDifference(30999.9)) < .01);
const faded = flight(data, 30500, 396);
assert.equal(faded.prop.levelReference.fraction, .5);
assert.ok(faded.power.propulsiveHp > 0 && faded.power.propulsiveHp < faded.power.shaftHp);

const result = milestone.run();
const { fixedShaft, nativePower, rows, alternateFit } = result.lightningLevel;
assert.equal(fixedShaft.count, 3);
assert.equal(nativePower.count, 3);
assert.ok(fixedShaft.afterMaeMph < 1.5 && fixedShaft.afterMaeMph < fixedShaft.beforeMaeMph * .5);
assert.ok(nativePower.afterMaeMph < 1.5 && nativePower.afterMaeMph < nativePower.beforeMaeMph * .5);
assert.ok(alternateFit.alternateFitMaeMph < 2);
const highRating = rows.find(row => row.mapInHg === 48);
assert.ok(Math.abs(highRating.fixedShaft.after.tasMph - highRating.observedTasMph) < 1);
assert.ok(result.lightningClimb.every(row => row.beforeFpm === row.afterFpm));
assert.equal(result.lightningSpitfireMatchup.beforeVerdict, 'a');
assert.equal(result.lightningSpitfireMatchup.afterVerdict, 'tie');
for (const [i, difference] of result.differences.entries()) {
  assert.equal(difference.changedStatus.length, 0, difference.aircraft);
  for (const key of ['stallEasMph', 'climbFpm', 'timedClimbSeconds', 'instantaneousDegSec', 'sustainedDegSec']) {
    // Fw 190 climbFpm changes by design once the matched 0.171 m² open-cooling area is applied.
    if (difference.aircraft === 'fw190a4' && (key === 'climbFpm' || key === 'timedClimbSeconds')) continue;
    assert.equal(difference[key]?.delta, 0, difference.aircraft + ' ' + key);
  }
  if (difference.aircraft !== 'p38g' && difference.aircraft !== 'fw190a4') assert.deepEqual(result.before[i], result.after[i]);
}
