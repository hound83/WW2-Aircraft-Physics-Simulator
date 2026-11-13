'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const { profiles, HF, G2, D, FT, KMH, FPM_PER_MPS } = require('../../scripts/aircraft-batch.cjs');

const LF = 'spitfire_lfix_bs543';
const round = x => Number.isFinite(x) ? (+x.toFixed(2) || 0) : null;
const options = mode => ({ mode, fuelFraction: .5 });
const meanAbsoluteError = rows => {
  const residuals = rows.filter(row => row.role !== 'fit' && Number.isFinite(row.error)).map(row => Math.abs(row.error));
  return residuals.length ? round(residuals.reduce((sum, x) => sum + x, 0) / residuals.length) : null;
};

function flight(model, spec, state, tasMph) {
  const { mode = 'combat', altFt, weightLb, rpm, scaleForRpm = true, climbing = false } = state;
  const phase = { ...spec[mode], key: mode };
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
  ];
  return { crossover, aircraft: aircraft.map(a => ({ ...a, levelMaeMph: meanAbsoluteError(a.level),
    climbMaeFpm: meanAbsoluteError(a.climb) })) };
}

module.exports = { sourceChecks };
