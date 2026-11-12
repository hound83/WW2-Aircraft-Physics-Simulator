'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const Turn = require('../../src/turn-performance.js');
const Match = require('../../src/benchmark-matchup.js');
const Energy = require('../../src/energy-configuration.js');
const Conditions = require('../../src/climb-conditions.js');
const Envelope = require('../../src/maneuver-envelope.js');
const Stall = require('../../src/stall-lab.js');
const lift = require('../../references/p51-turn-lift-tn1044.json');
const tolerance = require('../../scripts/fighter-value-selection.cjs').tolerances;
const latest = require('./remaining_fighter_propellers.cjs');
const data = latest.browserData();
const MPH = .44704, FT = .3048, HP = 745.6998716, LBF = 4.4482216152605;
const G = 9.80665, R = 287.05287, FPM = 60 / FT, RHO0 = 1.225;
const polar = { cd0: .021, e: .8, source: 'Analytic verification polar' };
const geometry = {
  diameterFt: 12, bladeCount: 4, reductionRatioEnginePerProp: 2, engineRpmByRating: { test: 3000 },
  momentumModel: { retainedPowerFraction: .9, advanceLoss: .06, machPenalty: 2, machOnset: .92 },
};
const shaftBhp = 1350;
const aircraft = {
  name: 'Analytic verification aircraft', weightLb: 8000, wingAreaM2: 22, spanM: 11.5, clMaxAssumed: 1.55,
  propGeometry: geometry, defaultRating: 'test', defaultGear: 'low',
  stallIdentity: { aircraftId: 'analytic', variant: 'fixture', specimen: 'fixture-01' },
  powerRatings: { test: { gears: { low: [0, 40000].map(altFt => ({ altFt, bhp: shaftBhp, mapInHg: 45, engineRpm: 3000 })) } } },
};
const options = { profile: 'A', polar, rating: 'test', gear: 'low' };
const numbers = new Map(), failures = [];
const round = (value, digits = 5) => Number.isFinite(value) ? +value.toFixed(digits) : null;

function check(family, name, observed, expected, allowance = 1e-8) {
  const matches = typeof expected === 'number'
    ? Number.isFinite(observed) && Math.abs(observed - expected) <= allowance
    : Object.is(observed, expected);
  const summary = numbers.get(family) ?? { passed: 0, failed: 0 };
  summary[matches ? 'passed' : 'failed']++;
  numbers.set(family, summary);
  if (!matches) failures.push({ family, name, observed, expected, allowance });
}

// US Standard Atmosphere hydrostatics and the subsonic Pitot equation are evaluated
// independently of the simulator. CAS uses a numerical pressure-to-speed inverse.
function atmosphere(ft) {
  const h = ft * FT, h0 = Math.min(h, 11000);
  const t = 288.15 - .0065 * h0;
  const integral = Math.log(288.15 / t) / .0065 + Math.max(0, h - 11000) / t;
  const p = 101325 * Math.exp(-G / R * integral);
  return { t, p, rho: p / (R * t), sound: Math.sqrt(1.4 * R * t) };
}
function impact(speedMps, { p, rho }) {
  return p * Math.expm1(3.5 * Math.log1p(rho * speedMps ** 2 / (7 * p)));
}
function bisect(fn, low, high) {
  const sign = Math.sign(fn(low));
  if (sign === Math.sign(fn(high))) throw Error('Expected root bracket');
  for (let i = 0; i < 55; i++) {
    const mid = (low + high) / 2;
    if (Math.sign(fn(mid)) === sign) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}
function tasForCas(casMph, altFt) {
  const q = impact(casMph * MPH, atmosphere(0));
  const air = atmosphere(altFt);
  return bisect(v => impact(v, air) - q, 0, air.sound) / MPH;
}
function checkAtmosphere() {
  const family = 'Standard atmosphere and airspeed';
  const official = [
    [0, 288.15, 101325, 1.2250], [5000, 255.65, 54019.9, .73612],
    [11000, 216.65, 22632.1, .36392], [12000, 216.65, 19330.4, .31083],
  ];
  for (const [m, kelvin, pascal, density] of official) {
    const { T, p, rho } = M.isa(m / FT);
    check(family, m + ' m temperature', T, kelvin, 1e-7);
    check(family, m + ' m pressure', p, pascal, .08);
    check(family, m + ' m density', rho, density, 1e-5);
  }
  for (const alt of [0, 10000, 22000, 36089, 40000]) {
    const air = atmosphere(alt);
    for (const tas of [110, 205, 375, 550]) {
      const state = M.airspeeds(tas, alt);
      const eas = tas * Math.sqrt(air.rho / RHO0);
      const qc = impact(tas * MPH, air);
      const cas = bisect(v => impact(v, atmosphere(0)) - qc, 0, atmosphere(0).sound) / MPH;
      check(family, 'TAS to EAS ' + alt + '/' + tas, state.eas, eas, .0001);
      check(family, 'TAS to CAS ' + alt + '/' + tas, state.cas, cas, .0001);
      check(family, 'CAS inverse ' + alt + '/' + tas, M.tasFrom(cas, 'CAS', alt), tas, .0001);
      check(family, 'Mach ' + alt + '/' + tas, state.mach, tas * MPH / air.sound, 1e-8);
      check(family, 'TAS to EAS preserves q ' + alt + '/' + tas, RHO0 * state.eas ** 2, air.rho * tas ** 2, .01);
    }
  }
  const calibration = { source: 'Synthetic two-node example', configuration: 'Clean', points: [
    { iasMph: 95, casMph: 101 }, { iasMph: 145, casMph: 148 },
  ] };
  check(family, 'IAS interpolation', M.casFromIAS(115, calibration), 119.8);
  check(family, 'IAS extrapolation denied', M.casFromIAS(90, calibration), null);
  check(family, 'IAS correction applied once', M.resolveAirspeed(115, 'IAS', 10000, calibration).tas, tasForCas(119.8, 10000), .0001);
}

function checkPower() {
  const family = 'Shaft schedules, boost and ram';
  const ac = { ...aircraft, powerRatings: { test: { gears: {
    low: [{ altFt: 0, bhp: 1200, mapInHg: 45 }, { altFt: 10000, bhp: 1000, mapInHg: 41 }],
    high: [{ altFt: 5000, bhp: 1150 }, { altFt: 10000, bhp: 1050 }],
  } } } };
  const point = M.shaftPower(ac, 7500, 'test', 'low');
  check(family, 'BHP interpolation', point.bhp, 1050);
  check(family, 'MAP interpolation', point.mapInHg, 42);
  check(family, 'Auto selection by shaft power for table', M.shaftPower(ac, 7500, 'test', 'auto').gear, 'high');
  check(family, 'Uncovered altitude', M.shaftPower(ac, 15000, 'test', 'auto'), null);
  check(family, 'Observed MAP proxy uses absolute pressure', M.shaftPowerAtMeasuredBoost(ac, 7500, 'test', 'low',
    { referenceBoostPsi: 18, observedBoostPsi: 12, source: 'Synthetic boost' }, { chargeExponent: .75 }).bhp,
  1050 * ((14.6959 + 12) / (14.6959 + 18)) ** .75);
  const alt = 12000, tas = 320, air = atmosphere(alt), recovered = .85;
  check(family, 'Recovered ram pressure', M.inletPressureAtSpeed(alt, tas, recovered).pressurePa,
    air.p + recovered * impact(tas * MPH, air), .003);
  check(family, 'Supersonic inlet denied', M.inletPressureAtSpeed(alt, air.sound / MPH * 1.02), null);
  const configured = {
    ...ac,
    ratedInlet: { test: { gears: [{ gear: 'low', minFt: 0, maxFt: 20000, bhp: 1350,
      staticCriticalFt: 5000, criticalFt: 8000, criticalTasMph: 300 }],
    manifoldAta: 1.3, recovery: recovered, engineRpm: 3000, chargeExponent: .75 } },
  };
  const critical = atmosphere(8000);
  const inletRatio = (air.p + recovered * impact(tas * MPH, air)) / (critical.p + recovered * impact(300 * MPH, critical));
  check(family, 'Above critical height power law',
    M.ratedInletPower(configured, alt, tas, 'test', 'low', 'rated-inlet').bhp, 1350 * inletRatio ** .75, .0001);
  check(family, 'Below critical height boost cap',
    M.ratedInletPower(configured, 0, tas, 'test', 'low', 'rated-inlet').bhp, 1350);
  const ramRef = { criticalAltitudeFt: 8000, criticalTasMph: 300, criticalManifold: { value: 1.3, unit: 'absoluteAta' } };
  const withRam = { ...ac, inletRam: { ratings: { test: { low: ramRef } } } };
  const ram = M.ramManifoldAtSpeed(withRam, alt, tas, 'test', 'low', { recovery: recovered });
  check(family, '1.3 ata converted and lapsed as absolute pressure', ram.manifoldAbsolutePa, 1.3 * 98066.5 * inletRatio, .003);
}

function disk(velocity, rho, diameter, diskWatts) {
  const area = Math.PI * (diameter / 2) ** 2;
  const target = diskWatts / (2 * rho * area);
  let vi = Math.cbrt(target);
  for (let i = 0; i < 20; i++) {
    vi -= (vi * (velocity + vi) ** 2 - target) / ((velocity + vi) * (velocity + 3 * vi));
  }
  return vi;
}
function checkPropeller() {
  const family = 'Propeller, shaft and useful power';
  const d = geometry.diameterFt * FT, n = 25;
  for (const alt of [0, 10000, 26000]) {
    const air = atmosphere(alt);
    for (const tas of [135, 235, 370]) {
      const v = tas * MPH, j = v / (n * d), mach = Math.sqrt(v ** 2 + (Math.PI * n * d) ** 2) / air.sound;
      const cp = shaftBhp * HP / (air.rho * n ** 3 * d ** 5);
      const loss = geometry.momentumModel;
      const vi = disk(v, air.rho, d, loss.retainedPowerFraction * shaftBhp * HP);
      const eta = loss.retainedPowerFraction * v / (v + vi) *
        Math.exp(-loss.machPenalty * Math.max(0, mach - loss.machOnset) ** 2 - loss.advanceLoss * Math.max(0, j - 1.65) ** 2);
      const actual = M.propEta(aircraft, alt, tas, shaftBhp, 'P', 'test');
      check(family, 'Gear and rpm to advance ratio', actual.J, j);
      check(family, 'Helical tip Mach', actual.tipMach, mach);
      check(family, 'Dimensionless power coefficient', actual.Cp, cp, 1e-7);
      check(family, 'Disk root vs Newton iteration', actual.inducedVelocityMps, vi, .00001);
      check(family, 'Working propeller useful fraction', actual.eta, eta, 1e-7);
      const ideal = disk(v, air.rho, d, .85 * shaftBhp * HP);
      check(family, 'Legacy ideal-disk arithmetic', M.propEta(aircraft, alt, tas, shaftBhp, 'D', 'test').eta,
        Math.max(.05, .85 * v / (v + ideal)), 1e-7);
      const c = Math.exp(Math.log(.83) - .075 * ((j - 1.65) / .8) ** 2 -
        .04 * ((cp - .36) / .85) ** 2 - .26 * Math.max(0, mach - .92) ** 2);
      check(family, 'Legacy empirical curve arithmetic', M.propEta(aircraft, alt, tas, shaftBhp, 'C', 'test').eta, c, 1e-7);
    }
  }
  check(family, 'Constant propeller control', M.propEta(aircraft, 0, 470, shaftBhp, 'A').eta, .8);
  check(family, 'Linear propeller control', M.propEta(aircraft, 0, 470, shaftBhp, 'B').eta, .755);
  check(family, 'Greg worksheet interpolation', M.propEta(aircraft, 0, 162.5, shaftBhp, 'G').eta, .85 * (1950 + 2080) / (2 * 2210));
  const v = 2 * n * d, bhp = .4 * atmosphere(0).rho * n ** 3 * d ** 5 / HP;
  const naca = M.propEta(aircraft, 0, v / MPH, bhp, 'N');
  check(family, 'Digitized chart node', naca.eta, .84, 1e-7);
  check(family, 'Digitized chart low-Cp extrapolation flag', M.nacaLowSpeedPropChart(4, 2, .1).chartWithinCp, false);
  const k = Math.log(1.07) / (.21 ** 2 - .11 ** 2);
  const correction = Math.exp(-k * Math.max(0, naca.tipMach - .95) ** 2);
  check(family, 'Transferred Mach modifier', M.propEta(aircraft, 0, v / MPH, bhp, 'M').eta, .84 * correction, 1e-7);
  const m = data.models.p38g, spec = data.specification.aircraft.p38g, settings = { mode: 'combat', fuelFraction: .5 };
  const { weightLb } = B.load(spec, data.specification.policy, settings);
  const state = (alt, tas, climb = false) => B.evaluate(M, T, lift, m, spec, settings, alt, M.airspeeds(tas, alt).eas, weightLb, undefined, climb);
  const fast = state(22600, 404), faded = state(30500, 396), open = state(22600, 404, true);
  check(family, 'P-38G each shaft at level test', fast.power.shaftHpPerEngine, 1225);
  check(family, 'P-38G total shaft', fast.power.shaftHp, 2450);
  check(family, 'P-38G useful power sums both disks once', fast.power.propulsiveHp, 2 * 1225 * fast.prop.eta);
  check(family, 'P-38G same fade applied to shaft schedule', faded.power.shaftHpPerEngine, 953);
  check(family, 'P-38G open cooling takes climb schedule', open.power.shaftHpPerEngine, 1140.4);
  check(family, 'P-38G open cooling bypasses tip fit', !!open.prop.levelReference, false);
}

function forces(ac, alt, tas, weightLb = ac.weightLb) {
  const { rho } = atmosphere(alt), speed = tas * MPH, weight = weightLb * LBF;
  const q = rho * speed ** 2 / 2;
  const cl = weight / (q * ac.wingAreaM2), ar = ac.spanM ** 2 / ac.wingAreaM2;
  const parasiteN = q * ac.wingAreaM2 * polar.cd0;
  const inducedN = q * ac.wingAreaM2 * cl ** 2 / (Math.PI * ar * polar.e);
  return { speed, weight, q, cl, parasiteN, inducedN, requiredW: (parasiteN + inducedN) * speed };
}
function checkForces() {
  const family = 'Lift, stall, drag, climb and turns';
  const availableW = .8 * shaftBhp * HP;
  let example;
  for (const alt of [0, 10000, 30000]) {
    const air = atmosphere(alt);
    for (const eas of [85, 110, 160, 210, 260, 310]) {
      const tas = eas / Math.sqrt(air.rho / RHO0);
      const actual = M.evaluated(aircraft, alt, tas, options), expected = forces(aircraft, alt, tas);
      const { speed, weight, q, cl, parasiteN, inducedN, requiredW } = expected;
      const { drag, limits, power } = actual;
      const stallEas = Math.sqrt(2 * weight / (RHO0 * aircraft.wingAreaM2 * aircraft.clMaxAssumed)) / MPH;
      const pExcessW = availableW - requiredW;
      check(family, '1 G stall', actual.stallEasMph, stallEas, .0001);
      check(family, 'Dynamic pressure', drag.q, q, .001);
      check(family, 'One-G lift coefficient', drag.CL, cl, 1e-7);
      check(family, 'Parasite force', drag.parasiteHp, parasiteN * speed / HP, .0001);
      check(family, 'Induced force', drag.inducedHp, inducedN * speed / HP, .0001);
      check(family, 'Four-G induced drag n squared',
        M.dragBreakdown(aircraft, alt, tas, aircraft.weightLb, polar.cd0, polar.e, 4).inducedHp, 16 * inducedN * speed / HP, .001);
      check(family, 'Drag power = D V', power.requiredHp, requiredW / HP, .0001);
      check(family, 'Specific excess power', power.psMps, pExcessW / weight, 1e-6);
      check(family, 'Useful power minus drag power', power.excessHp, pExcessW / HP, .0001);
      const canFly = eas >= stallEas, nInstant = canFly ? Math.min(7, aircraft.clMaxAssumed / cl) : null;
      const nSustained = canFly && pExcessW >= 0 ? Math.min(nInstant, Math.sqrt(1 + pExcessW / (inducedN * speed))) : null;
      check(family, 'Instantaneous G cap', limits.nInst, nInstant, 1e-6);
      check(family, 'Sustained G cap', limits.nSust, nSustained, 1e-7);
      check(family, 'Steady climb feet/min', power.climbFpm, canFly ? pExcessW * FPM / weight : null, .001);
      if (canFly) {
        check(family, 'Level acceleration from kinetic energy', B.levelAccelerationMphPerSecond(actual),
          G * pExcessW / (weight * speed * MPH), 1e-7);
      }
      if (nSustained > 1) {
        const bank = Math.acos(1 / nSustained);
        const omega = G * Math.tan(bank) / speed;
        const turn = Turn.state(actual);
        check(family, 'Sustained turn rate', turn.turn.rateDegSec, omega * 180 / Math.PI, 1e-6);
        check(family, 'Sustained turn radius', turn.turn.radiusM, speed / omega, .001);
        check(family, 'Bank angle', turn.turn.bankDeg, bank * 180 / Math.PI, 1e-5);
        check(family, 'Incremental turn drag only above one G', turn.turnDragHp,
          (nSustained ** 2 - 1) * inducedN * speed / HP, .0001);
        if (alt === 10000 && eas === 210) {
          example = { altFt: alt, easMph: eas, tasMph: round(tas), weightLb: aircraft.weightLb,
            shaftHp: shaftBhp, usefulHp: availableW / HP, requiredHp: round(requiredW / HP),
            steadyClimbFpm: round(pExcessW * FPM / weight), sustainedG: round(nSustained),
            sustainedDegSec: round(omega * 180 / Math.PI), radiusM: round(speed / omega) };
        }
      }
    }
  }

  const alt = 10000, air = atmosphere(alt), weight = aircraft.weightLb * LBF;
  const a = air.rho * aircraft.wingAreaM2 * polar.cd0 / 2;
  const b = 2 * weight ** 2 / (air.rho * Math.PI * aircraft.spanM ** 2 * polar.e);
  const vyMps = (b / (3 * a)) ** .25;
  const required = v => a * v ** 3 + b / v;
  const topTas = bisect(v => required(v) - availableW, vyMps, 590 * MPH) / MPH;
  check(family, 'Upper power-balance root', M.maxSpeed(aircraft, alt, options), topTas, .0001);
  const anchored = { ...aircraft, calibration: { altFt: alt, tasMph: topTas, rating: 'test', gear: 'low' } };
  check(family, 'Recover known zero-lift drag from exact equilibrium', M.cd0FromAnchor(anchored, 'A', polar.e).cd0, polar.cd0, 1e-7);
  const state = M.evaluated(aircraft, alt, 250, options);
  const increased = Turn.state(state, { dragFraction: 1.15 });
  const n = Math.sqrt(1 + state.power.excessHp / (1.15 * state.drag.inducedHp));
  check(family, 'Additional turn drag holds 1 G power fixed', increased.levelHp, state.power.requiredHp);
  check(family, 'Turn drag perturbation reduces usable power-limited G', increased.nPower, n);
  const best = M.bestClimb(aircraft, alt, { ...options, stepMph: .25 });
  check(family, 'Best climb speed vs analytic derivative', best.tasMph, vyMps / MPH, .1251);
  check(family, 'Best climb rate vs analytic derivative', best.climbFpm, (availableW - required(vyMps)) / weight * FPM, .01);
  const record = {
    id: 'analytic-stall', ...aircraft.stallIdentity, configurationId: 'clean', power: 'off', loadFactor: 1,
    weightLb: aircraft.weightLb, weightKind: 'instantaneous-stall-test', wingAreaM2: aircraft.wingAreaM2, geometrySource: 'Fixture',
    source: { reference: 'Analytic known value', scanVerified: true, kind: 'primary' },
    altFt: alt, speed: { kind: 'EAS', mph: 100, correctionVerified: true, correctionSource: 'Fixture' },
  };
  const clMax = weight / (.5 * RHO0 * (100 * MPH) ** 2 * aircraft.wingAreaM2);
  check(family, 'Corrected EAS to lift coefficient', M.resolveStallEvidence(aircraft, record).clMax, clMax);
  check(family, 'Rejected nonmatching stall specimen', M.resolveStallEvidence(aircraft, { ...record, specimen: 'other' }).status, 'unresolved');
  check(family, 'Stall lab shares lift equation', Stall.eas(aircraft.weightLb, aircraft.wingAreaM2 / .09290304, clMax), 100, .0001);
  check(family, 'Weight scaling at fixed lift coefficient', M.evaluated(aircraft, alt, 200, { ...options, weightLb: 9800 }).stallEasMph /
    M.evaluated(aircraft, alt, 200, options).stallEasMph, Math.sqrt(9800 / 8000));
  return example;
}

function checkConfiguration() {
  const family = 'Configuration losses and condition-specific replays';
  const alt = 10000, tas = 210, v = tas * MPH, air = atmosphere(alt);
  const f = forces(aircraft, alt, tas);
  const stock = M.evaluated(aircraft, alt, tas, options);
  const dragArea = .22;
  const stores = M.evaluated(aircraft, alt, tas, { ...options, addedDragAreaM2: dragArea, storesWeightLb: 400 });
  const addedInducedW = (forces(aircraft, alt, tas, 8400).inducedN - f.inducedN) * v;
  check(family, 'Stores weight added once', stores.weightLb, 8400);
  check(family, 'Stores area and mass both raise drag power', stores.power.requiredHp - stock.power.requiredHp,
    (f.q * dragArea * v + addedInducedW) / HP, .0001);
  for (const powerFraction of [.1, -.04]) {
    const branch = { loss: { areaM2: dragArea, powerFraction } };
    const result = Energy.evaluatePrepared(M, alt, tas, { ac: aircraft, options, branch }, { id: 'fixture', source: 'fixture' });
    const watt = (1 - powerFraction) * .8 * shaftBhp * HP - f.requiredW - f.q * dragArea * v;
    check(family, 'Equivalent power loss or gain and fixed cooling drag', result.power.climbFpm, watt / f.weight * FPM, .001);
  }
  const ref = { altFt: 5000, tasMph: 180, shaftHp: 1500 };
  const heat = .65, refRho = atmosphere(ref.altFt).rho;
  const qvRatio = shaftBhp / ref.shaftHp * (refRho * ref.tasMph ** 3) / (air.rho * tas ** 3);
  check(family, 'Conditioned cooling heat proxy', Conditions.factor(M, { altFt: alt, tasMph: tas }, shaftBhp, ref, heat),
    (1 - heat) + heat * qvRatio, 1e-7);
  const entry = {
    identity: aircraft.stallIdentity,
    fastFlight: { low: { ratings: ['test'], shape: 'constant', minAltFt: 0, maxAltFt: 20000,
      edgeFt: 500, originFt: 0, spanFt: 20000, offset: .003, slope: 0, machStart: .4, machFull: .45, machFade: .55, machEnd: .62 } },
    cooling: { minAltFt: 0, maxAltFt: 20000, minTasMph: 150, maxTasMph: 450, reference: ref, deltaCd0: .004, heatFraction: heat },
  };
  const envelope = { ...options, profile: 'P', flightEnvelope: { aircraft: { analytic: entry } } };
  const speedAtHalfMach = air.sound / (2 * MPH);
  check(family, 'Fast-flight delta Cd0 within the Mach window', M.evaluated(aircraft, alt, speedAtHalfMach, envelope).cd0, polar.cd0 + .003);
  check(family, 'Fast-flight delta Cd0 stays outside low-speed flight', M.evaluated(aircraft, alt, tas, envelope).cd0, polar.cd0);
  check(family, 'Shared solver uses the conditioned cooling proxy', M.evaluated(aircraft, alt, tas, { ...envelope, flightCooling: true }).coolingDeltaCd0,
    .004 * (1 - heat + heat * qvRatio), 1e-7);
  const point = { altFt: alt, tasMph: tas, fpm: 2000, observedMapInHg: 36, rating: 'test', engineRpm: 3000 };
  const derived = M.equivalentClimbDrag(aircraft, point, options);
  const implied = (.8 * shaftBhp * .8 * HP - f.requiredW - (point.fpm / FPM) * f.weight) / (f.q * aircraft.wingAreaM2 * v);
  check(family, 'Inverse drag from a known climb residual', derived.addedCd0, implied, 1e-7);
  check(family, 'Interpolate report-conditioned power at matched altitude', Energy.interpolate([
    { altFt: 0, bhp: 1100 }, { altFt: 10000, bhp: 1300 },
  ], 2500).bhp, 1150);
}

const standardSettings = { mode: 'normal', fuelFraction: .5 };
const fixtureSpec = {
  baseRating: 'test', baseRpm: 3000, baseMap: 45, pressureExponent: 1, fuelCapacityUSGal: 100,
  referenceWeightLb: 8000, referenceFuelUSGal: 50,
  normal: { map: 45, rpm: 3000, label: 'Normal' },
  combat: { map: 45, rpm: 3000, label: 'Combat', seconds: 60 },
  climbIAS: [[0, 200], [40000, 200]],
};
const fixtureModel = { ac: aircraft, options, benchmarkPolar: polar };
const fixturePolicy = { fuelDensityLbPerUSGal: 6, bsfcLbPerHpHour: 0 };
function checkTiming() {
  const family = 'Operating phases, integration and comparison';
  const syntheticPs = 10;
  // An exact constant excess-power state isolates the integrators from the
  // installation-specific aerodynamic and propulsion estimates.
  const fixturePhysics = {
    ...M, evaluated(ac, altFt, tasMph) {
      return { status: 'modelled', altFt, tasMph, engine: { gear: 'low' },
        power: { shaftHp: shaftBhp, psMps: syntheticPs, climbFpm: syntheticPs * FPM } };
    },
  };
  const alt = 10000, start = 150, end = 250, air = atmosphere(alt);
  const trueV = eas => eas * MPH / Math.sqrt(air.rho / RHO0);
  const exactAccel = (trueV(end) ** 2 - trueV(start) ** 2) / (2 * G * syntheticPs);
  const acceleration = B.accelerate(fixturePhysics, T, lift, fixtureModel, fixtureSpec, fixturePolicy, standardSettings, alt, start, end);
  check(family, 'Constant Ps acceleration reaches target', acceleration.status, 'reached');
  check(family, 'Constant Ps acceleration analytic time', acceleration.seconds, exactAccel, .001);
  const withFuel = { ...fixturePolicy, bsfcLbPerHpHour: .5 };
  const burn = B.accelerate(fixturePhysics, T, lift, fixtureModel, fixtureSpec, withFuel, standardSettings, alt, start, end);
  check(family, 'Fuel burn converts hour to seconds', burn.fuelUsedLb, .5 * shaftBhp * burn.seconds / 3600, 1e-6);
  check(family, 'Fuel burn reduces mass once', burn.endWeightLb, 8000 - burn.fuelUsedLb);
  check(family, 'Combat time edge', B.phaseFor(fixtureSpec, { ...standardSettings, mode: 'combat' }, 60, 60).key, 'normal');
  const f4 = data.specification.aircraft.f4u4;
  const inject = { ...standardSettings, mode: 'combat', injection: true };
  check(family, 'Dry fallback after water depletion', B.phaseFor(f4, inject, 90, 90, 0).key, 'combat');
  check(family, 'Water and dry power share combat allowance', B.phaseFor(f4, inject, f4.combat.seconds, f4.combat.seconds, 20).key, 'normal');
  const found = B.climb(fixturePhysics, T, lift, fixtureModel, fixtureSpec, fixturePolicy, standardSettings, 0, 20000);
  const stillTAS = 20000 * FT / syntheticPs;
  check(family, 'Timed climb integrates dh/Ps for its stated steady-rate approximation', found.seconds, stillTAS);
  const energyTime = stillTAS + ((tasForCas(200, 20000) * MPH) ** 2 - (200 * MPH) ** 2) / (2 * G * syntheticPs);
  const bandModel = { ac: aircraft, options };
  const bandPhysics = { ...M, bestClimb: () => ({ climbFpm: 2000, shaftHp: 1500 }) };
  const band = Envelope.climbBand(bandPhysics, bandModel, 0, 6000, 'test', 8000, .5, 12);
  check(family, 'Separate maneuver-envelope climb band units', band.minutes, 3);
  check(family, 'Climb-band fuel units', band.fuelUsedLb, 37.5);
  check(family, 'Seconds tie uses mean of the two times', Match.compare('elapsed_time', 97, 101, tolerance).lead, 'tie');
  check(family, 'Lower elapsed time wins', Match.compare('elapsed_time', 90, 100, tolerance).lead, 'a');
  check(family, '6 km/h comparison converts to mph', Match.compare('level_speed', 400, 404, tolerance).lead, 'b');
  check(family, '0.5 degrees/s turn margin', Match.compare('sustained_turn_rate', 10.2, 10.7, tolerance).lead, 'tie');
  return { constantPsMps: syntheticPs, climbCasMph: 200, toFt: 20000, steadyRateSeconds: round(found.seconds),
    energyHeightSeconds: round(energyTime), differenceSeconds: round(energyTime - found.seconds),
    levelAccelerationSeconds: round(acceleration.seconds), analyticLevelAccelerationSeconds: round(exactAccel) };
}

function liveTiming() {
  const { models, specification: { aircraft: specs, policy } } = data;
  const levelRuns = Object.keys(models).map(id => {
    const settings = { mode: 'combat', fuelFraction: .5 };
    const at = stepSeconds => B.accelerate(M, T, lift, models[id], specs[id], policy, settings,
      10000, 180, 300, { stepSeconds });
    const a = at(.5), b = at(.25);
    return { id, coarseStatus: a.status, fineStatus: b.status, coarseSeconds: round(a.seconds), fineSeconds: round(b.seconds),
      deltaSeconds: Number.isFinite(b.seconds) && Number.isFinite(a.seconds) ? round(b.seconds - a.seconds) : null };
  });
  const normalClimbs = ['p51b', 'p38g', 'spitfire_lfix_bs543'].map(id => {
    const spec = specs[id], coarse = B.climb(M, T, lift, models[id], spec, policy, standardSettings, 0, 20000);
    const fine = B.climb(M, T, lift, models[id], spec, policy, standardSettings, 0, 20000, { stepFt: 250, trace: true });
    if (fine.status !== 'reached') throw Error('Unavailable climb timing diagnostic for ' + id);
    const kineticHeightAt = alt => (tasForCas(B.interpolate(spec.climbIAS, alt, 1), alt) * MPH) ** 2 / (2 * G);
    const extra = fine.trace.slice(1).reduce((sum, row, i) => {
      const start = fine.trace[i];
      return sum + (row.seconds - start.seconds) * (kineticHeightAt(row.altFt) - kineticHeightAt(start.altFt)) /
        ((row.altFt - start.altFt) * FT);
    }, 0);
    return { id, coarseSeconds: round(coarse.seconds), fineSeconds: round(fine.seconds),
      stepDeltaSeconds: round(fine.seconds - coarse.seconds), frozenStateEnergyHeightSeconds: round(fine.seconds + extra),
      kineticTimeSeconds: round(extra) };
  });
  return { levelRuns, normalClimbs,
    qualification: 'The scheduled TAS energy-height estimate reuses the same altitude states, fuel trajectory and force balance. It illustrates the omitted term before any refit.' };
}

function rootGuardExample() {
  // Choose a stall speed above the unconstrained maximum-power-balance root.
  const weak = { ...aircraft, clMaxAssumed: .48, powerRatings: { test: { gears: {
    low: [{ altFt: 0, bhp: 280, mapInHg: 45, engineRpm: 3000 }],
  } } } };
  const raw = M.maxSpeed(weak, 0, options);
  const flight = M.evaluated(weak, 0, raw, options);
  const current = B.metrics(M, T, lift, { ...fixtureModel, ac: weak }, fixtureSpec, fixturePolicy, standardSettings, 0);
  return { helperTasMph: round(raw), stallEasMph: round(flight.stallEasMph), helperAtRootStatus: flight.status,
    liveBenchmarkStatus: current.status, liveBenchmarkTasMph: round(current.level?.tasMph) };
}

function mae(rows, observedKey, predictedKey) {
  const eligible = rows.filter(row => Number.isFinite(row[observedKey]) && Number.isFinite(row[predictedKey]));
  if (!eligible.length) return null;
  return round(eligible.reduce((sum, row) => sum + Math.abs(row[predictedKey] - row[observedKey]), 0) / eligible.length, 3);
}

function lightningClimbTime() {
  const report = require('../../references/p38g-42-12687.json');
  const { models: { p38g: model }, specification: { aircraft: { p38g: spec } } } = data;
  const settings = { mode: 'combat', fuelFraction: .5 };
  const phase = B.phaseFor(spec, settings);
  const endFt = 20000, weightLb = report.takeoffWeightLb;
  const tas = altFt => B.interpolate(report.climb, altFt, 1);
  const energyHeight = altFt => (tas(altFt) * MPH) ** 2 / (2 * G);
  let steady = 0, scheduled = 0, stepFt = 100;
  for (let alt = 0; alt < endFt; alt += stepFt) {
    const mid = alt + stepFt / 2;
    const state = B.evaluate(M, T, lift, model, spec, settings, mid, M.airspeeds(tas(mid), mid).eas, weightLb, phase, true);
    if (!(state.power?.psMps > 0)) throw Error('Missing P-38G report state');
    steady += stepFt * FT / state.power.psMps;
    scheduled += (stepFt * FT + energyHeight(alt + stepFt) - energyHeight(alt)) / state.power.psMps;
  }
  const elapsedObserved = report.climb.find(row => row[0] === endFt)[4] * 60;
  return {
    endFt, weightLb, observedSeconds: round(elapsedObserved), steadySeconds: round(steady),
    energyHeightSeconds: round(scheduled), energyTermSeconds: round(scheduled - steady),
    qualification: 'FS-M-19-1538-A B.4 recorded climb TAS and chart BHP, open coolers, test power schedule, fixed takeoff mass. Diagnostic replay of reported elapsed time with the same thrust and drag.',
  };
}

function historical() {
  const earlier = require('./operating_benchmark_v46.cjs').browserData();
  const reportClimbs = data.flightChecks.filter(group => group.id !== 'p47b-41-5942').map(group => {
    const spec = data.specification.aircraft[group.id];
    const rows = group.rows.map(row => {
      const settings = { mode: row.mode, extension: false };
      const evaluate = stage => B.evaluate(M, T, lift, stage.models[group.id], spec, settings,
        row.altFt, M.airspeeds(row.tasMph, row.altFt).eas, row.weightLb, undefined, true).power.climbFpm;
      return { ...row, prePropFpm: round(evaluate(earlier)), currentFpm: round(evaluate(data)) };
    });
    const reserved = rows.filter(row => row.role === 'check');
    return { id: group.id, name: group.name, source: group.url, conditions: group.condition, reserved: reserved.length,
      beforeMaeFpm: mae(reserved, 'observed', 'prePropFpm'), afterMaeFpm: mae(reserved, 'observed', 'currentFpm'), rows };
  });
  const independent = data.flightChecks.find(group => group.id === 'p47b-41-5942');
  const corsair = require('./operating_benchmark_v410.cjs').run().corsairClimb.checks;
  const corsairReserved = corsair.filter(row => row.role !== 'earlier climb fit');
  const lightning = latest.run().lightningClimb;
  const lightningReserved = lightning.filter(row => row.role === 'check');
  const fwModel = data.models.fw190a4, spec = data.specification.aircraft.fw190a4;
  const fw = require('./fw190a4.cjs').run();
  const settings = { mode: 'normal', fuelFraction: .5 };
  const phase = B.phaseFor(spec, settings);
  const withCooling = { ...fwModel, climbCoolingAreaM2: fw.coolingAreaM2 };
  const fwRows = fw.climbs.map(row => {
    const { altM, observed, role } = row;
    const best = model => B.bestClimb(M, T, lift, model, spec, settings, altM / FT, model.ac.weightLb, phase, 1).climbFpm;
    return { altM, role, observedFpm: round(observed * FPM), liveFpm: round(best(fwModel)), coolingDiagnosticFpm: round(best(withCooling)) };
  });
  const fwReserved = fwRows.filter(row => row.role === 'check');
  const mustang = require('./flight_scorecard.cjs').run().summary.filter(row => row.aircraftId === 'p51b' && row.metric === 'climb-rate');
  const liftCheck = require('./turn_performance_v44.cjs').liftChecks(data.models.p51b);
  return {
    reportClimbs, independentThunderbolt: { checks: independent.checks, conditions: independent.condition, rows: independent.rows },
    corsair: { reserved: corsairReserved.length, beforeMaeFpm: mae(corsairReserved, 'observedFpm', 'beforeFpm'),
      afterMaeFpm: mae(corsairReserved, 'observedFpm', 'afterFpm'), rows: corsair },
    lightning: { reserved: lightningReserved.length, beforeMaeFpm: mae(lightningReserved, 'observedFpm', 'beforeFpm'),
      afterMaeFpm: mae(lightningReserved, 'observedFpm', 'afterFpm'), rows: lightning, timedReport: lightningClimbTime() },
    fw190: { liveAreaM2: fwModel.climbCoolingAreaM2, historicalAreaM2: fw.coolingAreaM2, takeoffWeightLb: fwModel.ac.weightLb,
      mode: phase.key, rpm: phase.rpm, ratedAta: phase.map, reserved: fwReserved.length, liveMaeFpm: mae(fwReserved, 'observedFpm', 'liveFpm'),
      diagnosticMaeFpm: mae(fwReserved, 'observedFpm', 'coolingDiagnosticFpm'), source: fw.source.climb.url, rows: fwRows },
    mustang, mustangManeuverLift: liftCheck,
  };
}

function run() {
  checkAtmosphere();
  checkPower();
  checkPropeller();
  const forcesExample = checkForces();
  checkConfiguration();
  const timingExample = checkTiming();
  return { schema: 'ww2-flight-formula-audit/v1', checks: Object.fromEntries(numbers), failures, forcesExample,
    timingExample, convergence: liveTiming(), rootGuard: rootGuardExample(), historical: historical() };
}

if (require.main === module) {
  const result = run();
  console.log(JSON.stringify(result, null, 2));
  if (result.failures.length) process.exitCode = 1;
}
