'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const Turn = require('../../src/turn-performance.js');
const lift = require('../../references/p51-turn-lift-tn1044.json');
const { browserData } = require('./remaining_fighter_propellers.cjs');
const { integrateSeconds } = require('./climb_band.cjs');
const accuracy = require('./implemented_model_accuracy.cjs');
const p47 = require('../../references/p47b-measured-climb-v33.json');
const p47Transfer = require('../../references/independent-flight-checks.json').thunderboltProduction;
const fw190 = require('../../references/fw190a4-783.json');
const stalls = require('../../references/stall-calibration.json').records;
const navy = require('../../references/research/ww2_multiaxis_propulsion_trials_2026-11-10.json');

const FT = .3048;
const MPH = .44704;
const LB = 4.4482216153;
const RHO0 = 1.225;
const KNOT_MPH = 1852 / 1609.344;
const reference = { mode: 'combat', fuelFraction: .5, altitudeFt: 10000, maneuverEasMph: 200 };

const citations = {
  p51: 'https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html',
  p51TimeFigure: 'https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Climb.jpg',
  p51TimeFigureSha256: '3be7ddb992591651c516c5e05b13b44196ae274ad8a2d30e4a2847a468b49bff',
  p47: 'https://wwiiaircraftperformance.com/org/p-47/p-47.html',
  f4u: 'https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf',
  f4uNaca: 'https://ntrs.nasa.gov/citations/20050081862',
  bfDonor: 'https://wwiiaircraftperformance.com/org/me109/g/me109g-14026.html',
};

function evaluate(data, id, mode, altFt, easMph, weightLb, climbing = false) {
  const spec = data.specification.aircraft[id];
  return B.evaluate(M, T, lift, data.models[id], spec, { mode, fuelFraction: .5 },
    altFt, easMph, weightLb, undefined, climbing);
}

function liveOutputs(data) {
  const { altitudeFt, maneuverEasMph, mode, fuelFraction } = reference;
  const { aircraft, policy } = data.specification;
  const settings = { mode, fuelFraction };
  return Object.entries(data.models).map(([id, model]) => {
    const spec = aircraft[id];
    const { weightLb } = B.load(spec, policy, settings);
    const state = evaluate(data, id, mode, altitudeFt, maneuverEasMph, weightLb);
    const snapshot = B.metrics(M, T, lift, model, spec, policy, settings, altitudeFt);
    const time = B.climb(M, T, lift, model, spec, policy, settings, 0, altitudeFt);
    if (time.status !== 'reached' || !Number.isFinite(state.limits?.nLift) ||
        !Number.isFinite(snapshot.level?.tasMph) || !Number.isFinite(snapshot.climb?.climbFpm)) {
      throw Error('Reference scenario unavailable for ' + id);
    }
    return {
      id, weightLb, levelTasMph: snapshot.level.tasMph, bestClimbFpm: snapshot.climb.climbFpm,
      timeSeconds: time.seconds, stallEasMph: state.stallEasMph,
      stallCl: state.clMax, maneuverCl: state.limits.maneuverClMax ?? state.clMax,
      liftLimitG: state.limits.nLift, sustainedLimitG: state.limits.nSust,
      sustainedDegSec: state.limits.sustDegSec, mach: state.air.mach,
    };
  });
}

function modelTime(data, id, mode, weightLb, fromFt, toFt, reportSpeed, stepFt = 250) {
  const model = data.models[id], spec = data.specification.aircraft[id];
  const settings = { mode, fuelFraction: .5 };
  const rates = [];
  for (let altFt = fromFt; ; altFt = Math.min(altFt + stepFt, toFt)) {
    const tasMph = reportSpeed?.(altFt);
    const roc = reportSpeed
      ? evaluate(data, id, mode, altFt, M.airspeeds(tasMph, altFt).eas, weightLb, true).power?.climbFpm
      : B.bestClimb(M, T, lift, model, spec, settings, altFt, weightLb, undefined, 2).climbFpm;
    rates.push({ altFt, roc });
    if (altFt === toFt) break;
  }
  return integrateSeconds(rates, 'roc');
}

function timings(data, prior) {
  const rows = [];
  const record = (id, fromFt, toFt, referenceSeconds, modeledSeconds, type, source, notes, extra = {}) => {
    rows.push({ id, fromFt, toFt, referenceSeconds, modeledSeconds,
      errorSeconds: modeledSeconds - referenceSeconds, type, source, notes, ...extra });
  };
  for (const id of ['spitfire-time', 'p38-time']) {
    const group = prior.groups.find(item => item.id === id);
    const point = group.rows.find(item => item.altFt === 20000);
    record(group.aircraft, point.startFt, point.altFt, point.observed, point.predicted,
      'reported elapsed time', group.source, group.conditions);
  }

  // FS-M-19-1417-A B.3 distinguishes five minutes at Military from the later Rated climb.
  for (const [mode, rating, fromFt, toFt, minutes] of [
    ['combat', 'military', 0, 10000, 3.95],
    ['normal', 'normal', 20000, 30000, 17.10 - 9.75],
  ]) {
    const knots = p47.states.filter(row => row.rating === rating).map(row => [row.altFt, row.tasMph]);
    const model = modelTime(data, 'p47b', mode, p47.mass.valueLb, fromFt, toFt,
      altFt => B.interpolate(knots, altFt, 1));
    record('p47b', fromFt, toFt, minutes * 60, model, 'reported elapsed time', citations.p47,
      '41-5902 B.3, report gross weight and interpolated report TAS, wide-open cooling. Selected bands each retain the reported power rating.');
  }
  const transfer = prior.groups.find(item => item.id === 'p47-independent-climb');
  const transferRates = transfer.rows.filter(row => row.altFt <= 24000);
  record('p47b', 10000, 24000, integrateSeconds(transferRates, 'observed'),
    integrateSeconds(transferRates, 'predicted'), 'integrated reported climb rates', p47Transfer.url,
    '41-5942, 2,000 torque-meter BHP at 2,700 RPM. Historical and model rates integrated on the same altitude nodes. Time is derived from this separate report.');

  // Eng-47-1749-A Fig. 6 has a second horizontal scale in minutes. The middle
  // trace is labelled 67 inHg. Use broad read bands on the original 1200x1594 scan.
  for (const [altFt, centerMin, minutesBand, nativeY] of [
    [10000, 2.65, [2.4, 2.9], [1111, 1119]],
    [20000, 5.8, [5.5, 6.1], [819, 827]],
  ]) {
    const model = modelTime(data, 'p51b', 'combat', 9335, 0, altFt);
    record('p51b', 0, altFt, centerMin * 60, model, 'digitized elapsed-time curve',
      citations.p51TimeFigure,
      'Eng-47-1749-A Fig. 6, 67 inHg, 3,000 RPM, 9,335-lb takeoff gross, racks, automatic shutters. Replay uses best-rate TAS and constant mass. Brackets cover chart reading.',
      { chartSecondsBand: minutesBand.map(minutes => minutes * 60), nativeY });
  }

  const f4Points = navy.series.find(item => item.id === 'f4u4-normal-military-climb').rows
    .filter(([rating, altFt]) => rating === 'military' && altFt <= 19000)
    .map(([, altFt, observedFpm]) => ({ altFt, observedFpm }));
  record('f4u4', 0, 19000, integrateSeconds(f4Points, 'observedFpm'),
    modelTime(data, 'f4u4', 'combat', 12500, 0, 19000), 'integrated reported climb rates', citations.f4u,
    'Military, 12,500-lb normal fighter gross. Three source points with a wide gap across a blower transition. Time is an interpolation scenario.',
    { sourceRates: f4Points });

  const fwPoints = fw190.climb.rows.filter(row => row[0] <= 6000).map(([altM, roc]) => ({
    altFt: altM / FT, observedFpm: roc * 60 / FT,
  }));
  const fwReadingBand = [-1, 1].map(sign => integrateSeconds(fwPoints.map(row => ({
    ...row, observedFpm: row.observedFpm - sign * fw190.climb.readingToleranceMps * 60 / FT,
  })), 'observedFpm'));
  record('fw190a4', 0, 6000 / FT, integrateSeconds(fwPoints, 'observedFpm'),
    modelTime(data, 'fw190a4', 'normal', 3870 / .45359237, 0, 6000 / FT),
    'integrated digitized climb rates', fw190.climb.url,
    'W.Nr. 783 long inlet at 1.32 ata / 2,400 RPM. Factory curve with open cooling; live Normal has no incremental cooling penalty.',
    { chartSecondsBand: fwReadingBand, sourceRates: fwPoints });

  const manual = data.specification.aircraft.bf109f4.climbIAS;
  record('bf109f4', 0, 6000 / FT, 7.05 * 60,
    modelTime(data, 'bf109f4', 'normal', 6371, 0, 6000 / FT,
      altFt => M.tasFrom(B.interpolate(manual, altFt, 1), 'CAS', altFt)),
    'same-engine donor', citations.bfDonor,
    'V.B. 109 19 L 42 Blatt 5, Bf 109 G-1 W.Nr. 14026 with DB 601 E and F-series VDM propeller, 1.30 ata / 2,500 RPM. Uncorrected timing curve. F-4 replay uses 2,890-kg reference mass and the manual climb schedule.',
    { chartSecondsBand: [6.8 * 60, 7.3 * 60] });
  return rows;
}

function stallBackfills(data, prior) {
  const clAtEas = (id, weightLb, easMph) => 2 * weightLb * LB /
    (RHO0 * data.models[id].ac.wingAreaM2 * (easMph * MPH) ** 2);
  const casToEas = (casMph, altFt) => M.resolveAirspeed(casMph, 'CAS', altFt).eas;
  const record = (id, label, weightLb, altFt, casMph, extra = {}) => {
    const easMph = casToEas(casMph, altFt);
    const modelEas = evaluate(data, id, 'normal', altFt, 180, weightLb).stallEasMph;
    return { id, label, weightLb, altFt, casMph, easMph, modeledEasMph: modelEas,
      impliedCl: clAtEas(id, weightLb, easMph), errorEasMph: modelEas - easMph, ...extra };
  };
  const p38 = prior.groups.find(item => item.id === 'p38-stall').rows[0];
  const primary = [
    record('p38g', '42-12690 clean power-off', p38.weightLb, p38.altFt, p38.observedCasMph,
      { type: 'separate-airframe check', rawIasMph: p38.rawIasMph }),
    record('f4u4', '80765 clean power-off at assumed sea-level atmosphere', 12500, 0, 89.4 * KNOT_MPH,
      { type: 'calibration anchor', source: citations.f4u }),
    record('f4u4', 'NACA glide, 15 inHg / 2,150 RPM', 12100, 8000, 105,
      { type: 'approximate separate same-variant test', source: citations.f4uNaca }),
    record('f4u4', 'NACA power-on clean, 48 inHg / 2,600 RPM', 12100, 8000, 95,
      { type: 'approximate separate same-variant test', source: citations.f4uNaca }),
  ];
  const scenarioCases = [
    { id: 'p51b', observed: stalls.find(item => item.id === 'p51-closed'), weightLb: 9270, altitudes: [8000] },
    { id: 'p47b', observed: stalls.find(item => item.id === 'p47b-415902-clean'), weightLb: p47.mass.valueLb, altitudes: [0, 10000] },
  ];
  const sensitivity = scenarioCases.flatMap(({ id, observed, weightLb, altitudes }) => altitudes.map(altFt => {
    const iasMph = observed.speed.mph;
    const modeledEasMph = evaluate(data, id, 'normal', altFt, 180, weightLb).stallEasMph;
    const modeledCasMph = M.airspeeds(M.tasFrom(modeledEasMph, 'EAS', altFt), altFt).cas;
    return { id, altFt, weightLb, iasMph, modeledCasMph,
      correctionNeededToMatchMph: modeledCasMph - iasMph,
      scenarios: [0, 5, 10, 15].map(correctionMph => record(id, 'assumed IAS-to-CAS increment', weightLb, altFt,
        iasMph + correctionMph, { correctionMph })) };
  }));
  const transfers = [
    ...[84, 87].map(iasMph => record('spitfire_lfix_bs543', 'full-span pilot-notes estimate, CAS=IAS scenario', 7150, 0, iasMph)),
    record('fw190a4', 'approximate RAF A-3 reading used as a CAS scenario on A-4 geometry', 8600, 0, 110),
  ];
  return { primary, sensitivity, transfers };
}

function liftAndDragChecks(data, live) {
  const mustang = [5099, 5100, 9300, 9301].map(altFt => {
    const state = evaluate(data, 'p51b', 'normal', altFt, 180, 9270);
    return { altFt, weightLb: 9270, stallEasMph: state.stallEasMph, stallCl: state.clMax };
  });
  const bf = live.find(row => row.id === 'bf109f4');
  const spit = live.find(row => row.id === 'spitfire_lfix_bs543');
  const state = evaluate(data, bf.id, reference.mode, reference.altitudeFt, reference.maneuverEasMph, bf.weightLb);
  // At the same TAS, matching sustained turn rate is equivalent to matching load factor.
  const requiredDragMultiplier = (state.limits.nPower ** 2 - 1) / (spit.sustainedLimitG ** 2 - 1);
  return {
    mustangAltitudeBoundary: mustang,
    spitfireBf109DragSensitivity: {
      bf109NominalDegSec: bf.sustainedDegSec, spitfireNominalDegSec: spit.sustainedDegSec,
      incrementalDragMultiplierToTie: requiredDragMultiplier,
      bf109AtFifteenPercentMoreIncrementalDrag: Turn.state(state, { dragFraction: 1.15 }).turn.rateDegSec,
    },
  };
}

function run() {
  const data = browserData(), prior = accuracy.run(), live = liveOutputs(data);
  return {
    schema: 'ww2-validation-backfill/v1',
    version: require('../../package.json').version, reference, citations, live,
    timing: timings(data, prior), stall: stallBackfills(data, prior), sensitivity: liftAndDragChecks(data, live),
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run };
