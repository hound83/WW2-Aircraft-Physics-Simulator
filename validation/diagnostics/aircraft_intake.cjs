'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const { profiles, HF, G2, D, FIX, G6, FT, KMH, FPM_PER_MPS, LB_PER_KG } = require('../../scripts/aircraft-batch.cjs');

const LF = 'spitfire_lfix_bs543';
const round = x => Number.isFinite(x) ? (+x.toFixed(2) || 0) : null;
const options = mode => ({ mode, fuelFraction: .5 });
const meanAbsoluteError = rows => {
  const residuals = rows.filter(row => row.role !== 'fit' && Number.isFinite(row.error)).map(row => Math.abs(row.error));
  return residuals.length ? round(residuals.reduce((sum, x) => sum + x, 0) / residuals.length) : null;
};

function flight(model, spec, state, tasMph) {
  const { mode = 'combat', altFt, weightLb, rpm, scaleForRpm = true, climbing = false, gear } = state;
  const phase = { ...spec[mode], key: mode, gear };
  if (rpm) {
    if (scaleForRpm) phase.powerFactor = (phase.powerFactor ?? 1) * rpm / phase.rpm;
    phase.rpm = rpm;
  }
  return B.evaluate(M, T, L, model, spec, options(mode === 'military' ? 'combat' : mode), altFt, M.airspeeds(tasMph, altFt).eas, weightLb, phase, climbing);
}

function levelSpeed(model, spec, state) {
  const at = speed => flight(model, spec, state, speed).power?.excessHp;
  let low = 250, high = 530;
  if (!(at(low) > 0 && at(high) < 0)) return null;
  for (let i = 0; i < 32; i++) {
    const mid = (low + high) / 2;
    if (at(mid) > 0) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function result(row, altFt, observed, predicted, role, weightLb) {
  return { id: row.id, altFt: round(altFt), observed: round(observed), predicted: round(predicted), role, weightLb: round(weightLb),
    error: Number.isFinite(predicted) ? round(predicted - observed) : null };
}

function secondBatchChecks(selected) {
  const fix = selected[FIX], g6 = selected[G6];
  const fWeight = fix.model.ac.weightLb, gWeight = g6.model.ac.weightLb;
  const fLevel = fix.level.map((row, i) => {
    const state = { altFt: row.alt_ft, weightLb: fWeight, rpm: row.rpm, scaleForRpm: true, gear: row.gear };
    return { ...result(row, state.altFt, row.tas_mph, levelSpeed(fix.model, fix.spec, state),
      i === 0 ? 'fit' : 'same-report speed check; boost used as power input', fWeight), mode: 'combat', gear: row.gear };
  });
  const fClimb = Object.entries(fix.climbs).flatMap(([mode, rows]) => rows.filter(row => row.alt_ft <= 40000).map(row => {
    const state = { mode, altFt: row.alt_ft, weightLb: fWeight, climbing: true, gear: row.gear };
    return { ...result(row, state.altFt, row.roc_fpm, flight(fix.model, fix.spec, state, row.tas_mph).power?.climbFpm,
      'same-report climb check; boost and TAS used as inputs', fWeight), mode, gear: row.gear, observedElapsedMin: row.elapsed_min };
  }));
  const fElapsed = [];
  // A fixed-weight source replay bypasses fuel use and retains measured TAS.
  const policy = {};
  for (const [mode, rows] of Object.entries(fix.climbs)) {
    const profile = mode === 'combat' ? { ...fix.spec, combat: { ...fix.spec.combat, seconds: null } } : fix.spec;
    for (const altFt of [10000, 20000, 30000, 40000]) {
      const row = rows.find(entry => entry.alt_ft === altFt);
      const test = B.climb(M, T, L, fix.model, profile, policy, options(mode), 0, altFt, {
        flightCase: { weightLb: fWeight, tasSchedule: [[0, 162], ...rows.map(r => [r.alt_ft, r.tas_mph])] },
      });
      fElapsed.push({ ...result(row, altFt, row.elapsed_min * 60, test.seconds,
        mode === 'combat' ? 'trial concession, full Combat climb' : 'Normal trial', fWeight), mode });
    }
  }
  const fit = g6.level.find(row => row.run === '3b');
  const gLevel = [
    ...g6.level.map(row => ({ ...result(row, 0, row.tas_kmh / KMH,
      ['3a', '3b'].includes(row.run) ? levelSpeed(g6.model, g6.spec, { altFt: 0, weightLb: row.takeoff_kg * LB_PER_KG }) : null,
      row === fit ? 'fit' : row.run === '3a' ? 'same configuration, different loading' : 'attachment comparison, source only',
      row.takeoff_kg * LB_PER_KG),
      configuration: ['Run '+row.run, row.filter?'sand filter':'filter removed', row.gun_pods?'wing pods':'pods removed',
        row.wheel_covers?'wheel covers':'covers removed', row.racks?'ETC racks':null,
        row.bombs_kg?row.bombs_kg+' kg bombs':null].filter(Boolean).join(', ') })),
    result(g6.critical, g6.critical.alt_m / FT, g6.critical.tas_kmh / KMH,
      levelSpeed(g6.model, g6.spec, { altFt: g6.critical.alt_m / FT, weightLb: gWeight }),
      'same-report check; critical altitude used as power input', gWeight),
  ];
  const gRate = altFt => flight(g6.model, g6.spec, { altFt, weightLb: gWeight, climbing: true },
    M.tasFrom(g6.climb.indicated_kmh / KMH, 'CAS', altFt)).power?.climbFpm;
  const observedAltFt = g6.climb.ceiling_m / FT;
  let low = 0, high = 40000;
  const bracketed = gRate(low) > 100 && gRate(high) < 100;
  if (bracketed) for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (gRate(mid) > 100) low = mid;
    else high = mid;
  }
  const ceiling = { id: g6.climb.id, observedAltFt: round(observedAltFt),
    modeledRateAtObservedFpm: round(gRate(observedAltFt)), modeled100FpmAltFt: bracketed ? round((low + high) / 2) : null,
    weightLb: round(gWeight) };
  const dragReference = profile => {
    const { ac, benchmarkPolar } = profile.model;
    const a = ac.calibration;
    const shaftBhp = M.shaftPower(ac, a.altFt, a.rating, a.gear).bhp;
    const { q, dInd } = M.dragBreakdown(ac, a.altFt, a.tasMph, ac.weightLb, benchmarkPolar.cd0, benchmarkPolar.e);
    const cd0 = efficiency => (shaftBhp * 745.6998716 * efficiency / (a.tasMph * .44704) - dInd) / (q * ac.wingAreaM2);
    return { anchor: a, shaftBhp: round(shaftBhp), weightLb: round(ac.weightLb), e: benchmarkPolar.e,
      gregCd0: +cd0(.8).toFixed(6), efficiencySensitivityCd0: [.75, .85].map(eta => +cd0(eta).toFixed(6)),
      runtimeCd0: +benchmarkPolar.cd0.toFixed(6) };
  };
  return [
    { id: FIX, label: 'Spitfire F Mk IX BF.274', level: fLevel, climb: fClimb, elapsed: fElapsed, dragReference: dragReference(fix),
      scope: 'Clean Tables I, II and IV. Level fit at 6,000 ft. The original trial was allowed to climb continuously at Combat power. The operating timer enforces the five-minute allowance.' },
    { id: G6, label: 'Bf 109 G-6/Trop WNr 16476', level: gLevel, climb: [], ceiling, dragReference: dragReference(g6),
      scope: 'Run 3b sets the level polar with pods, filter and covers. Other attachments stay at their source states. The climb ceiling is the available report check. Climb rates use transferred boost and estimated cooling.' },
  ];
}

function sourceChecks(base, catalog) {
  const selected = profiles(base, catalog);
  const hf = selected[HF], g2 = selected[G2], d = selected[D];
  const hfLevel = hf.level.filter((r, i, rows) => !rows.some(x => x.alt_ft === r.alt_ft && x.speed > r.speed)).map(row => {
    const state = { altFt: row.alt_ft, weightLb: 7090, rpm: 2960, scaleForRpm: false };
    return result(row, state.altFt, row.speed, levelSpeed(hf.model, hf.spec, state),
      row.alt_ft === 0 ? 'fit' : 'same-report speed check; boost used as power input', state.weightLb);
  });
  const hfClimb = hf.climbs.map(row => {
    const state = { altFt: row.alt_ft, weightLb: 7470, rpm: 2980, climbing: true };
    return result(row, state.altFt, row.roc, flight(hf.model, hf.spec, state, row.tas_mph).power?.climbFpm,
      'same-report climb check; boost and TAS used as inputs', state.weightLb);
  });

  const g2Level = g2.level.map(row => {
    const state = { altFt: row.corrected_altitude_m / FT, weightLb: g2.model.ac.weightLb, rpm: row.actual_rpm };
    return result(row, state.altFt, row.corrected_tas_kmh / KMH, levelSpeed(g2.model, g2.spec, state),
      row === g2.level[0] ? 'fit' : 'same-report speed check; boost used as power input', state.weightLb);
  });
  const g2Climb = g2.climbs.slice(5).map((row, i) => {
    const scan = g2.scan[i], alternate = g2.transcribed.find(x => x.cina_altitude_m === scan.cina_altitude_m);
    const state = { altFt: row.corrected_altitude_m / FT, weightLb: g2.model.ac.weightLb, rpm: row.actual_rpm, climbing: true };
    return { ...result(scan, state.altFt, scan.climb_rate_mps * FPM_PER_MPS,
      flight(g2.model, g2.spec, state, row.tas_kmh / KMH).power?.climbFpm,
      'scan check; rate altitude is CINA and model altitude is the nearby corrected speed-table altitude', state.weightLb),
      rateAltitudeFt: round(scan.cina_altitude_m / FT), alternateRateFpm: round(alternate.climb_rate_mps * FPM_PER_MPS),
      alternateId: alternate.id, speedId: row.id };
  });

  const dLevel = d.level.filter((r, i, rows) =>
    !rows.some(x => x.mode === r.mode && x.altitude_ft === r.altitude_ft && x.tas_mph > r.tas_mph)).map(row => {
    const state = { mode: row.mode, altFt: row.altitude_ft, weightLb: row.weight_at_altitude_lb };
    return { ...result(row, state.altFt, row.tas_mph, levelSpeed(d.model, d.spec, state),
      row.mode === 'combat' && row.altitude_ft === 0 ? 'fit' :
        'same-report speed check; chart BHP used as input', state.weightLb), mode: row.mode };
  });
  const dClimb = d.climbs.filter(row => row.altitude_ft <= 40000).map(row => {
    const state = { altFt: row.altitude_ft, weightLb: row.weight_at_altitude_lb, climbing: true };
    const tas = M.tasFrom(row.instrument_corrected_ias_mph, 'CAS', state.altFt);
    return result(row, state.altFt, row.standard_roc_fpm, flight(d.model, d.spec, state, tas).power?.climbFpm,
      'same-report climb check; chart BHP and IAS-as-CAS used as inputs', state.weightLb);
  });

  const crossover = [0, 10000, 20000, 30000].map(altFt => {
    const hfRow = hfLevel.find(row => row.altFt === altFt);
    const lf = base.models[LF], spec = base.specification.aircraft[LF];
    const observed = Math.max(...lf.ac.observedSpeed.filter(row => row.altFt === altFt).map(row => row.mphTas));
    const predicted = levelSpeed(lf, spec, { altFt, weightLb: 7110 });
    return { altFt, hfObservedTasMph: hfRow.observed, lfObservedTasMph: observed,
      hfModeledTasMph: hfRow.predicted, lfModeledTasMph: round(predicted),
      observedDifferenceMph: round(hfRow.observed - observed), modeledDifferenceMph: Number.isFinite(hfRow.predicted) && Number.isFinite(predicted) ? round(hfRow.predicted - predicted) : null };
  });
  const aircraft = [
    { id: HF, label: 'Spitfire HF Mk IX BS.551', level: hfLevel, climb: hfClimb,
      scope: 'A&AEE Table VI and Table III at their respective weights. The sea-level Table VI row is fitted. The rest of the speed and climb observations are outside that fit.' },
    { id: G2, label: 'Bf 109 G-2 MT-215', level: g2Level, climb: g2Climb,
      scope: 'Finnish speeds and upper-climb scan, nominal 3,050 kg. The scan and transcription report different upper-climb rates. Both remain visible. The original run mass and installed shaft power remain open.' },
    { id: D, label: 'P-51D-15 44-15342', level: dLevel, climb: dClimb,
      scope: 'Wright Field rack-on, no external load. Level checks use Normal, Military and WEP chart BHP. The sea-level WEP row is fitted. Climb checks use the separate WEP chart power at reported weight.' },
    ...secondBatchChecks(selected),
  ];
  return { crossover, aircraft: aircraft.map(a => ({ ...a, levelMaeMph: meanAbsoluteError(a.level),
    climbMaeFpm: meanAbsoluteError(a.climb) })) };
}

module.exports = { sourceChecks };
