'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const B = require('../src/operating-benchmark.js');
const T = require('../src/turn-lift.js');
const lift = require('../references/p51-turn-lift-tn1044.json');
const prior = require('../validation/diagnostics/remaining_fighter_propellers.cjs');
const shared = require('../validation/diagnostics/shared_flight_climb.cjs');

const FT = .3048, MPH = .44704, G = 9.80665;
const altitudeFt = 100 / FT;
const psMps = 10, shaftHp = 1000;
const v0 = 80 / MPH;
const speedAtEnergyHeight = meters => Math.sqrt(80 ** 2 + 2 * G * meters) / MPH;
const close = (actual, expected, tolerance = 1e-6) =>
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, actual + ' vs ' + expected);

const fixture = {
  ...M,
  tasFrom(speed, basis, altFt) {
    return basis === 'CAS' ? speed : M.tasFrom(speed, basis, altFt);
  },
  evaluated(ac, altFt, tasMph) {
    return { status: 'modelled', altFt, tasMph,
      power: { shaftHp, psMps, climbFpm: psMps * 60 / FT } };
  },
};
const model = {
  ac: { weightLb: 8000, propGeometry: {},
    powerRatings: { normal: { gears: { low: [{ altFt: 0, bhp: shaftHp }, { altFt: 1000, bhp: shaftHp }] } } } },
  options: {}, benchmarkPolar: {}, timedClimbEnergy: true,
};
const phase = { map: 40, rpm: 2500, powerFactor: 1, label: 'Normal' };
const spec = {
  baseRating: 'normal', baseRpm: 2500, baseMap: 40, normal: phase, combat: { ...phase, seconds: 60 },
  referenceWeightLb: 8000, referenceFuelUSGal: 50, fuelCapacityUSGal: 100,
};
const policy = { fuelDensityLbPerUSGal: 6, bsfcLbPerHpHour: .5 };
const settings = { mode: 'normal', fuelFraction: .5 };
for (const [energyHeight, expected] of [[50, 15], [0, 10], [-50, 5]]) {
  const tasSchedule = [[0, v0], [altitudeFt, speedAtEnergyHeight(energyHeight)]];
  const result = B.climb(fixture, T, lift, model, spec, policy, settings, 0, altitudeFt,
    { flightCase: { weightLb: 8000, tasSchedule }, trace: true });
  assert.equal(result.status, 'reached');
  close(result.seconds, expected);
  close(result.trace.at(-1).tasMph, tasSchedule[1][1]);
}
const limited = {
  ...spec, normal: { ...phase, seconds: 12 }, continuous: { ...phase, label: 'Continuous' },
  climbIAS: [[0, v0], [altitudeFt, speedAtEnergyHeight(50)]],
};
const transitioned = B.climb(fixture, T, lift, model, limited, policy, settings, 0, altitudeFt, { trace: true });
assert.equal(transitioned.status, 'reached');
assert.deepEqual(transitioned.schedule.map(row => row.phase), ['normal', 'continuous']);
close(transitioned.seconds, 15);
close(transitioned.schedule[0].seconds, 12);
close(transitioned.fuelUsedLb, 15 * policy.bsfcLbPerHpHour * shaftHp / 3600);
close(transitioned.endWeightLb, 8000 - transitioned.fuelUsedLb);
const exhausted = B.climb(fixture, T, lift, model, limited, { ...policy, bsfcLbPerHpHour: 500 }, settings, 0, altitudeFt);
assert.equal(exhausted.status, 'fuel-exhausted');
assert.ok(exhausted.endFuelLb >= 0);

const old = prior.browserData(), data = shared.browserData(old);
const fw = data.flightChecks.at(-1);
assert.equal(fw.id, 'fw190a4');
assert.equal(fw.checks.count, 8);
assert.equal(fw.rows.filter(row => row.role === 'fit').length, 1);
assert.ok(fw.checks.afterMae < fw.checks.beforeMae);
close(fw.paired.modeledPenaltyFpm, fw.paired.observedPenaltyFpm, fw.readingToleranceFpm);
const fwSpec = data.specification.aircraft.fw190a4;
const fwModel = data.models.fw190a4;
const tas = fw.paired.tasMph, alt = fw.paired.altFt;
const evaluateFw = (chosen, mode, open) => B.evaluate(M, T, lift, chosen, fwSpec,
  { mode, fuelFraction: .5 }, alt, M.airspeeds(tas, alt).eas, fw.weightLb, undefined, open);
assert.equal(evaluateFw(fwModel, 'normal', false).power.climbFpm,
  evaluateFw(old.models.fw190a4, 'normal', false).power.climbFpm);
assert.equal(evaluateFw(fwModel, 'combat', true).power.climbFpm,
  evaluateFw(old.models.fw190a4, 'combat', true).power.climbFpm);
assert.ok(evaluateFw(fwModel, 'normal', true).benchmark.coolingFit);
const outOfBand = B.evaluate(M, T, lift, fwModel, fwSpec, settings, alt,
  M.airspeeds(290, alt).eas, fw.weightLb, undefined, true);
assert.equal(outOfBand.benchmark.coolingFit, undefined);

const timing = shared.timedChecks(data);
const p38 = timing.find(row => row.id === 'p38g' && row.toFt === 20000);
assert.equal(p38.afterStatus, 'reached');
assert.equal(p38.observedSeconds, 340.8);
close(p38.afterSeconds, 346.255, .01);
assert.ok(Math.abs(p38.afterErrorSeconds) < Math.abs(p38.beforeErrorSeconds));
const p47Rated = timing.find(row => row.id === 'p47b' && row.fromFt === 20000);
assert.ok(p47Rated.withoutRateBasisSeconds > 470);
close(p47Rated.afterSeconds, p47Rated.beforeSeconds, .01);

const { specification } = data;
const corsair = data.models.f4u4;
const specCorsair = specification.aircraft.f4u4;
const waterLimited = {
  ...specCorsair, combat: { ...specCorsair.combat, seconds: 15 },
  injection: { ...specCorsair.injection, fluidLb: 1 },
};
const injection = B.climb(M, T, lift, corsair, waterLimited, specification.policy,
  { mode: 'combat', fuelFraction: .5, injection: true }, 0, 6000, { trace: true });
assert.equal(injection.status, 'reached');
assert.ok(injection.combatSeconds <= 15 + 1e-7);
assert.ok(injection.injectionRemainingLb >= 0);
const wet = injection.schedule.find(row => row.phase === 'injection');
assert.ok(wet && wet.seconds <= 60 / waterLimited.injection.fluidLbPerMinute + 1e-7);
assert.ok(injection.schedule.some(row => row.phase === 'combat'));
console.log('Shared climb: signed energy, clipped rating and fluid time, actual fuel burn, matched cooling and timed P-38G report.');
