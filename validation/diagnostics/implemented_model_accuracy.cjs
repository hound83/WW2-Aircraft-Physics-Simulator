'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const latest = require('./remaining_fighter_propellers.cjs');
const propeller = require('./operating_benchmark_v410.cjs');
const { working_reference: references } = require('../../references/analysis/fighter-propeller-efficiency-v1.json');
const p38Report = require('../../references/p38g-42-12687.json');
const fwReport = require('../../references/fw190a4-783.json');
const liftReport = require('../../references/v44-turn-evidence.json').mustang;

const release = {
  version: require('../../package.json').version,
  pagesCommit: '52369812a7ed40ec8fed1cde42354023aec407f0',
  htmlSha256: '724ac05c59da0de2d7413eca917ade12645d0ef96e0012918e60aeb7497fc908',
};

const sources = {
  spitfire: 'https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html',
  p47: 'https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf',
  p51: 'https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html',
  f4u: 'https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf',
  bf109: 'https://info.eduard.com/en/06-2023-1/page-12',
};

const FT = 0.3048;
const MPH = 0.44704;
const mean = values => values.reduce((total, value) => total + value, 0) / values.length;
const settings = mode => ({ mode, fuelFraction: 0.5, extension: false });
const asEas = (tasMph, altFt) => M.airspeeds(tasMph, altFt).eas;
const observation = (observed, predicted, conditions) => ({ ...conditions, observed, predicted });

function group(id, aircraft, metric, unit, evidence, source, conditions, observations) {
  if (!observations.length) throw Error('No observations for ' + id);
  const rows = observations.map(row => {
    const { observed, predicted } = row;
    if (!(Number.isFinite(observed) && observed > 0 && Number.isFinite(predicted))) {
      throw Error('Missing or invalid prediction for ' + id + ': ' + JSON.stringify(row));
    }
    const error = predicted - observed;
    return { ...row, error, errorPercent: 100 * error / observed };
  });
  const mape = mean(rows.map(row => Math.abs(row.errorPercent)));
  return {
    id, aircraft, metric, unit, evidence, source, conditions,
    count: rows.length, mape, agreement: 100 - mape,
    mae: mean(rows.map(row => Math.abs(row.error))),
    bias: mean(rows.map(row => row.error)),
    worst: rows.reduce((a, b) => Math.abs(a.errorPercent) >= Math.abs(b.errorPercent) ? a : b),
    rows,
  };
}

function flight(data, id, mode, altFt, tasMph, weightLb, climbing = false) {
  return B.evaluate(M, T, L, data.models[id], data.specification.aircraft[id],
    settings(mode), altFt, asEas(tasMph, altFt), weightLb, undefined, climbing);
}

function bestClimb(data, id, mode, altFt, weightLb) {
  return B.bestClimb(M, T, L, data.models[id], data.specification.aircraft[id],
    settings(mode), altFt, weightLb, undefined, 1);
}

function levelGroups(data, previous, lightning) {
  const level = id => references.level.find(entry => entry.aircraft === id).rows;
  const native = (id, row, mode) => propeller.nativePowerReplay(data, id, row, mode).tasMph;
  const sourceLevelConditions = ({ altFt, weightLb, rating, gear, rpm, bhp }) =>
    ({ altFt, weightLb, rating, gear, rpm, reportBhp: bhp });
  const nativeRows = (id, rows, mode) => rows.map(row =>
    observation(row.observed, native(id, row, mode), sourceLevelConditions(row)));
  const earlierProp = id => previous.speedChecks.find(entry => entry.aircraft === id && !entry.separateAirframe);
  const propRows = (id, method) => earlierProp(id).checks.filter(row => row.role !== 'drag fit')
    .map(row => observation(row.observedTasMph, row[method].after.tasMph, {
      altFt: row.altFt, rpm: row.rpm, weightLb: row.weightLb, rating: row.rating,
      reference: row.observation, shaftPowerReadingRange: row.shaftPowerReadingRange,
    }));
  const independent = references.p47b_independent_level;
  const spit = 'spitfire_lfix_bs543';
  const scheduledSpit = level(spit).filter(row => !row.anchor && !(row.gear === 'low' && row.altFt >= 14000));
  return [
    group('spitfire-level', spit, 'level speed', 'mph TAS', 'fit consistency',
      sources.spitfire, 'BS.543 Table V, closed radiators, 7,110 lb. One selected blower per height. Excludes the drag anchor and three low-blower observations at and above the benchmark blower change. High blower trial boost is +18.5 versus nominal +18.',
      nativeRows(spit, scheduledSpit, 'combat')),
    group('bf109-level', 'bf109f4', 'level speed', 'mph TAS', 'secondary check',
      sources.bf109, 'One secondary sea-level emergency point (540 km/h from Baumgartl and Vogt via Bobek), 1.42 ata / 2,700 rpm, 6,371 lb assumed. The underlying test sheet remains unrecovered.',
      nativeRows('bf109f4', level('bf109f4').filter(row => !row.anchor)
        .map(row => ({ ...row, observed: 540 / 1.609344 })), 'combat')),
    group('p47-level', 'p47b', 'level speed', 'mph TAS', 'same-report reserved',
      sources.p47, '41-5902, 12,565 lb, 2,700 rpm, dry Military. Excludes 5,000-ft drag anchor.',
      propRows('p47b', 'nativePower')),
    group('p47-independent-level', 'p47b', 'level speed', 'mph TAS', 'separate-airframe power replay',
      independent.source, '41-5942, 12,620 lb. Eight-gun trial with recorded torque-meter shaft power supplied to the simulator; the 41-5902 drag/propeller model transfers without refitting.',
      independent.rows.map(row => observation(row.observed,
        propeller.fixedShaftReplay(data.models.p47b, row, 'combat').tasMph, sourceLevelConditions(row)))),
    group('p51-level', 'p51b', 'level speed', 'mph TAS', 'fit consistency with configuration caveat',
      sources.p51, '43-24777, 67 inHg series with wing racks and chart BHP. The rack-free benchmark inherits a polar and power deck developed with this racked reference. This quantifies fit consistency with that curve. Excludes the sea-level drag anchor and the 75-inHg test rating.',
      nativeRows('p51b', level('p51b').filter(row => !row.anchor && row.rating === '67inHg'), 'combat')),
    group('fw190-level', 'fw190a4', 'level speed', 'mph TAS', 'same-report reserved',
      fwReport.url, 'W.Nr. 783, 3,870 kg, long external intake, 1.32 ata / 2,400 rpm (sim Normal). Excludes sea-level drag and both inlet anchors.',
      nativeRows('fw190a4', level('fw190a4').filter(row => row.role === 'check'), 'normal')),
    group('p38-level', 'p38g', 'level speed', 'mph TAS', 'same-report reserved',
      p38Report.url, '42-12687, faired coolers, dry 3,000-rpm Military. Excludes the drag and tip-loss fit points and the 48-inHg test rating.',
      lightning.lightningLevel.rows.filter(row => row.role === 'reserved same-report check')
        .map(row => observation(row.observedTasMph, row.nativePower.after.tasMph, {
          altFt: row.altFt, weightLb: row.weightLb, rpm: row.rpm, chartBhpPerEngine: row.chartBhpPerEngine,
        }))),
    group('f4u-level', 'f4u4', 'level speed', 'mph TAS', 'same-report diagnostic',
      sources.f4u, 'F4U-4 12,500-lb Normal and Military cases. Sim-native power. Excludes the Normal sea-level drag anchor.',
      propRows('f4u4', 'nativePower')),
    group('f4u-level-fixed-power', 'f4u4', 'level speed', 'mph TAS', 'same-report power replay',
      sources.f4u, 'Same seven observations with digitized chart BHP supplied. Diagnostic for the engine deck and its interaction with the propeller/drag solution.',
      propRows('f4u4', 'fixedShaft')),
  ];
}

function climbGroups(data, previous, lightning) {
  const groups = data.flightChecks.filter(entry => entry.id !== 'p47b-41-5942').map(entry =>
    group(entry.id === 'p47b' ? 'p47-climb' : 'spitfire-climb', entry.id, 'climb rate', 'ft/min',
      'same-report reserved', entry.url, entry.condition, entry.rows.filter(row => row.role === 'check').map(row => {
        const { altFt, tasMph, weightLb, mode, bhp } = row;
        const state = flight(data, entry.id, mode, altFt, tasMph, weightLb, true);
        return observation(row.observed, state.power?.climbFpm, {
          altFt, tasMph, weightLb, mode, reportBhp: bhp ?? null,
          modelShaftHp: state.power?.shaftHp, cooling: state.benchmark?.cooling,
        });
      })));
  const independent = data.flightChecks.find(entry => entry.id === 'p47b-41-5942');
  const mustang = require('../../aircraft/cases.json').aircraft.p51b.climbReports.flatMap(report =>
    report.observations.filter(row => row.rating === '67inHg').map(row => {
      const { altFt, fpm } = row, weightLb = report.takeoffWeightLb;
      const result = bestClimb(data, 'p51b', 'combat', altFt, weightLb);
      return observation(fpm, result.climbFpm, {
        altFt, weightLb, modelTasMph: result.tasMph, source: report.url, reportId: report.id,
      });
    }));
  const fwWeightLb = data.models.fw190a4.ac.weightLb;
  return [
    ...groups,
    group('p47-independent-climb', 'p47b', 'climb rate', 'ft/min', 'separate-airframe power replay',
      independent.url, independent.condition,
      independent.rows.map(row => observation(row.observed, row.after, { altFt: row.altFt, tasMph: row.tasMph, bhp: row.bhp }))),
    group('p51-climb', 'p51b', 'climb rate', 'ft/min', 'configuration transfer',
      sources.p51, '67-inHg racked, automatic-shutter Wright Field tests, including the related May 15 memo. Live best-rate search at takeoff weight. Actual climb TAS and instantaneous weights are unavailable. The 75-inHg trials use a different rating.',
      mustang),
    group('fw190-climb', 'fw190a4', 'climb rate', 'ft/min', 'same-report open-cooling comparison',
      fwReport.climb.url, 'W.Nr. 783 open-cooling climb against the current live Normal best-climb solution. Live climb has no additional cooling drag. Excludes the historical 5,000-m cooling fit.',
      fwReport.climb.rows.filter(row => row[3] === 'check').map(([altM, observedMps]) => {
        const altFt = altM / FT;
        const result = bestClimb(data, 'fw190a4', 'normal', altFt, fwWeightLb);
        return observation(observedMps * 60 / FT, result.climbFpm, { altFt, altM, weightLb: fwWeightLb, modelTasMph: result.tasMph });
      })),
    group('p38-climb', 'p38g', 'climb rate', 'ft/min', 'same-report reserved',
      p38Report.url, '42-12687, open coolers, 13,900-lb takeoff weight and report B.4 TAS. Excludes the 10,000-ft cooling anchor.',
      lightning.lightningClimb.filter(row => row.role === 'check').map(row =>
        observation(row.observedFpm, row.afterFpm, { altFt: row.altFt, weightLb: row.weightLb, tasMph: row.tasMph }))),
    group('f4u-climb', 'f4u4', 'climb rate', 'ft/min', 'same-report maximum-climb diagnostic',
      sources.f4u, '12,500-lb clean Normal and Military best-rate search; excludes the earlier Normal sea-level climb fit.',
      previous.corsairClimb.checks.filter(row => row.role !== 'earlier climb fit').map(row =>
        observation(row.observedFpm, row.afterFpm, { altFt: row.altFt, weightLb: row.weightLb, rating: row.rating }))),
  ];
}

// Table II elapsed minutes at the TAS nodes already retained by the BS.543 climb replay.
const spitfireElapsed = [
  [2000, .45], [4000, .85], [6000, 1.30], [7000, 1.50], [8000, 1.70], [10000, 2.15],
  [12000, 2.65], [14000, 3.15], [16000, 3.70], [18000, 4.20], [20000, 4.75], [22000, 5.35],
  [24000, 5.95], [26000, 6.70], [28000, 7.50], [30000, 8.40],
];

function timingRows(data, id, schedule, checkpointsFt, weightLb, stepFt = 100) {
  const [startFt, , startMin] = schedule[0];
  let elapsed = 0, altFt = startFt;
  return checkpointsFt.map(endFt => {
    while (altFt < endFt) {
      const dh = Math.min(stepFt, endFt - altFt), mid = altFt + dh / 2;
      const tasMph = B.interpolate(schedule, mid, 1);
      const state = flight(data, id, 'combat', mid, tasMph, weightLb, true);
      if (!(state.power?.psMps > 0)) throw Error('Unavailable timed climb state for ' + id + ' at ' + mid);
      elapsed += dh * FT / state.power.psMps;
      altFt += dh;
    }
    const endMin = schedule.find(row => row[0] === endFt)[2];
    return observation(60 * (endMin - startMin), elapsed, { startFt, altFt: endFt, weightLb, stepFt });
  });
}

function timingGroups(data) {
  const spit = 'spitfire_lfix_bs543';
  const spitTAS = data.flightChecks.find(row => row.id === spit).rows;
  const spitSchedule = spitfireElapsed.map(([altFt, minutes]) => [altFt, spitTAS.find(row => row.altFt === altFt).tasMph, minutes]);
  const p38Schedule = p38Report.climb.map(([altFt, tasMph, , , elapsedMin]) => [altFt, tasMph, elapsedMin]);
  return [
    group('spitfire-time', spit, 'elapsed climb', 's', 'same-report schedule replay',
      sources.spitfire, 'Table II, elapsed since 2,000 ft, 7,485 lb fixed, open radiators, +18 test schedule, 3,000 rpm and 13,000-ft blower change. Report allowed extended Combat use. Checkpoints share a common start.',
      timingRows(data, spit, spitSchedule, [10000, 20000, 30000], 7485)),
    group('p38-time', 'p38g', 'elapsed climb', 's', 'same-report schedule replay',
      p38Report.url, 'Table B.4, elapsed since sea level, 13,900 lb fixed, open coolers and report Military schedule. Checkpoints share a common start. Ceiling rows excluded.',
      timingRows(data, 'p38g', p38Schedule, [10000, 20000, 30000, 35000], p38Report.takeoffWeightLb)),
  ];
}

function stallGroups(data) {
  // FS-M-19-1492-A printed p. 1 B.1. Retain the reported CAS and raw IAS separately.
  const altFt = 10000, weightLb = 14800, observedCasMph = 112, rawIasMph = 98;
  const observed = M.resolveAirspeed(observedCasMph, 'CAS', altFt);
  const result = flight(data, 'p38g', 'normal', altFt, observed.tas, weightLb);
  return [
    group('p38-stall', 'p38g', 'clean one-g stall speed', 'mph EAS', 'separate-airframe stall check',
      'https://wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G_42-12690_FS-M-19-1492-A.pdf',
      'FS-M-19-1492-A B.1, 42-12690 with gear and wing flaps up, power off, 1,700 rpm, both coolers neutral. Approximately 14,800 lb and 10,000 ft. The model uses a one-g lift threshold; the report gives no load-factor trace or test uncertainty. CAS converted to EAS in ISA.',
      [observation(observed.eas, result.stallEasMph, {
        altFt, weightLb, observedCasMph, rawIasMph,
        predictedCasMph: M.airspeeds(M.tasFrom(result.stallEasMph, 'EAS', altFt), altFt).cas,
        inferredClMax: result.clMax * (result.stallEasMph / observed.eas) ** 2,
        modelClMax: result.clMax,
      })]),
  ];
}

function maneuverLift(data) {
  const id = 'p51b', altFt = 10500, model = data.models[id];
  const rows = liftReport.check.map(([mach, low, high]) => {
    const tasMph = mach * M.isa(altFt).a / MPH;
    const result = flight(data, id, 'normal', altFt, tasMph, model.ac.weightLb);
    const applied = result.benchmark?.maneuverLift;
    if (!applied) throw Error('Mustang lift curve inactive at Mach ' + mach);
    const predicted = applied.clMax * model.ac.wingAreaM2 / (liftReport.sourceAreaFt2 * .09290304);
    return observation((low + high) / 2, predicted, { mach, altFt, sourceCurveFraction: applied.fraction, observedBand: [low, high], withinBand: predicted >= low && predicted <= high });
  });
  return group('p51-lift', id, 'maneuver lift curve', 'CLmax', 'same-figure held-out lift component',
    liftReport.url, 'NACA TN 1044 Fig. 6 P-51B throttle-closed traces. Held-out Mach sections scored against digitized band midpoints; simulator states use 10,500 ft, with the live Mach fade retained. Bands pool source traces and the comparison uses source wing area. This covers the lift input to turning.',
    rows);
}

function lightningShaftPower(data) {
  const model = data.models.p38g;
  const rows = references.p38g_part_power.cases.flatMap(({ alt_ft: altFt, rows }) => rows.map(row => {
    const { rpm, weight_lb: weightLb, bhp_per_engine: chartBhp, observed: tasMph } = row;
    const rating = 'part-power', gear = 'turbo';
    const stateAt = bhp => M.evaluated({
      ...model.ac, powerRatings: { [rating]: { gears: { [gear]: [{ altFt, bhp, engineRpm: rpm }] } } },
    }, altFt, tasMph, {
      ...model.options, profile: 'P', polar: model.benchmarkPolar, rating, gear, weightLb,
      cleanLevelPropeller: model.cleanLevelPropellers.combat,
    }).power;
    let low = 1, high = 2200;
    if (!(stateAt(low)?.excessHp < 0 && stateAt(high)?.excessHp > 0)) {
      throw Error('Unbracketed part-power equilibrium for ' + row.observation);
    }
    for (let i = 0; i < 40; i++) {
      const middle = (low + high) / 2;
      if (stateAt(middle).excessHp < 0) low = middle;
      else high = middle;
    }
    const atChartPower = stateAt(chartBhp);
    return observation(chartBhp, (low + high) / 2, {
      altFt, tasMph, rpm, weightLb, reference: row.observation,
      requiredEfficiencyAtChartPower: atChartPower.requiredHp / atChartPower.shaftHp,
    });
  }));
  return group('p38-shaft-power', 'p38g', 'part-power shaft requirement', 'bhp per engine', 'different operating regime, same report',
    p38Report.url, 'FS-M-19-1538-A B.2–3, 5,000 and 24,400 ft, faired coolers. Solve zero excess power using the current polar and propeller equation at reported TAS, RPM and gross weight. Original BHP is chart-derived; this residual tests the combined drag and propulsion model.',
    rows);
}

function fwInstallationGroups(data) {
  const id = 'fw190a4', model = data.models[id];
  const speed = new Map(fwReport.speed.rows.map(([altM, kmh]) => [altM, kmh / 1.609344]));
  const lapse = fwReport.boost.rows.filter(([, level]) => level < 1.32);
  const ataAt = (altFt, tasMph) => M.ratedInletPower(model.ac, altFt, tasMph, 'combat', 'auto', 'rated-inlet').estimatedManifoldAta;
  const [coolingAltM, openMps, closedMps] = fwReport.climb.rows.find(row => row[3] === 'cooling-anchor');
  const coolingAltFt = coolingAltM / FT, weightLb = model.ac.weightLb;
  const coolingTasMph = bestClimb(data, id, 'normal', coolingAltFt, weightLb).tasMph;
  const coolingRate = open => flight(data, id, 'normal', coolingAltFt, coolingTasMph, weightLb, open).power.climbFpm;
  const modeledOpenFpm = coolingRate(true), modeledClosedFpm = coolingRate(false);
  return [
    group('fw190-cooling', id, 'climb penalty from cooling flaps', 'ft/min', 'single paired configuration check',
      fwReport.climb.url, 'Graph 2 open/closed pair at 5,000 m, long external inlet, 1.32 ata and 2,400 rpm. Live cases share gross weight and model best-climb TAS. Source climb TAS unavailable. This historical pair anchored a separate research cooling correction.',
      [observation((closedMps - openMps) * 60 / FT, modeledClosedFpm - modeledOpenFpm, {
        altM: coolingAltM, altFt: coolingAltFt, tasMph: coolingTasMph, openMps, closedMps, modeledOpenFpm, modeledClosedFpm,
      })]),
    group('fw190-boost-level', id, 'post-critical inlet pressure in level flight', 'ata', 'same-report inlet diagnostic',
      fwReport.url, 'Long external inlet graph, observed level TAS at each altitude. Rated-boost plateau excluded. Source graph read tolerance ±0.025 ata.',
      lapse.map(([altM, observed]) => {
        const altFt = altM / FT, tasMph = speed.get(altM);
        return observation(observed, ataAt(altFt, tasMph), { altM, altFt, tasMph });
      })),
    group('fw190-boost-climb', id, 'post-critical inlet pressure in climb', 'ata', 'same-report inlet diagnostic',
      fwReport.url, 'Long external inlet graph, model best-climb TAS for the live Normal phase; source climb TAS unavailable. Rated-boost plateau excluded.',
      lapse.map(([altM, , observed]) => {
        const altFt = altM / FT, tasMph = bestClimb(data, id, 'normal', altFt, model.ac.weightLb).tasMph;
        return observation(observed, ataAt(altFt, tasMph), { altM, altFt, tasMph });
      })),
  ];
}

function run() {
  const data = latest.browserData(), previous = propeller.run(), lightning = latest.run();
  return {
    schema: 'ww2-implemented-model-accuracy/v1',
    release,
    groups: [
      ...levelGroups(data, previous, lightning), ...climbGroups(data, previous, lightning),
      ...timingGroups(data), ...stallGroups(data), maneuverLift(data), lightningShaftPower(data), ...fwInstallationGroups(data),
    ],
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run };
