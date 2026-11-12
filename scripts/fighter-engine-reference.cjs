'use strict';

const { round } = require('./fighter-evidence-methods.cjs');

const sourcePack = 'ww2_engine_ratings_and_propeller_2026-11-12';
const psToKw = 0.73549875;
const psToBhp = psToKw / 0.7456998715822702;
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;

function engineReference(observations) {
  const originalIds = [];
  function rows(series) {
    const prefix = sourcePack + ':' + series + ':';
    const entries = [...observations.values()].filter(row => row.id.startsWith(prefix));
    if (entries.length === 0) throw Error('Missing engine reference series ' + series);
    originalIds.push(...entries.map(row => row.id));
    return entries.map(row => ({ observation_id: row.id, ...row.values }));
  }

  function ratedPower(series) {
    return rows(series).map(row => ({
      ...row, power_kw: round(row.power_ps * psToKw, 2),
      power_bhp: round(row.power_ps * psToBhp, 2), grade: 'primary',
    }));
  }

  function levelCurve(series, criticalAltitudeM) {
    const points = rows(series).map(row => {
      const tas = row.tas_kmh_printed_or_curve + row.report_indicator_correction_kmh;
      const allowance = row.chart_read_allowance_kmh;
      return { ...row, tas_kmh: tas, grade: 'primary',
        range_kmh: allowance == null ? null : [tas - allowance, tas + allowance] };
    });
    const branches = [
      points.filter(point => point.altitude_m <= criticalAltitudeM),
      points.filter(point => point.altitude_m >= criticalAltitudeM),
    ];
    const checks = branches.flatMap(branch => branch.slice(1, -1).map((point, i) => {
      const left = branch[i], right = branch[i + 2];
      const fraction = (point.altitude_m - left.altitude_m) / (right.altitude_m - left.altitude_m);
      const predicted = left.tas_kmh + fraction * (right.tas_kmh - left.tas_kmh);
      return { altitude_m: point.altitude_m, observed_tas_kmh: point.tas_kmh,
        interpolated_tas_kmh: round(predicted, 2), error_kmh: round(predicted - point.tas_kmh, 2) };
    }));
    return { critical_altitude_m: criticalAltitudeM, points, interpolation_checks: checks,
      interpolation_mae_kmh: round(mean(checks.map(row => Math.abs(row.error_kmh))), 2) };
  }

  const propellerClimb = ['normal', 'military', 'war-emergency'].map(rating => {
    const climbRows = rows('l7d10-' + rating);
    for (const row of climbRows) {
      const eta = row.advance_ratio * row.thrust_coefficient / row.power_coefficient;
      const tipMach = row.flight_mach * Math.hypot(1, Math.PI / row.advance_ratio);
      if (Math.abs(eta - row.efficiency) > 0.0045 || Math.abs(tipMach - row.tip_mach) > 0.006) {
        throw Error('Inconsistent printed propeller coefficients ' + row.observation_id);
      }
    }
    const efficiencies = climbRows.map(row => row.efficiency);
    return { rating, observation_ids: climbRows.map(row => row.observation_id),
      mean_eta: round(mean(efficiencies), 5), observed_span_eta: [Math.min(...efficiencies), Math.max(...efficiencies)],
      fixed_80_mae_percentage_points: round(mean(efficiencies.map(eta => Math.abs(eta - 0.80))) * 100, 2),
      fixed_76_mae_percentage_points: round(mean(efficiencies.map(eta => Math.abs(eta - 0.76))) * 100, 2) };
  });

  const db605 = ratedPower('db605a-rated-power');
  const bmw801 = ratedPower('bmw801d-rated-power');
  const g1DB601E = levelCurve('g1-14026-db601e-level', 6000);
  const g1DB605A = levelCurve('g1-14026-db605a-level', 6100);
  const a4Boost = rows('a4-783-boost-by-flight-phase').map(row => ({
    ...row, level_minus_climb_ata: round(row.level_manifold_ata - row.climb_manifold_ata, 3),
  }));
  const a4Level = rows('a4-783-long-intake-level');
  const [a4Internal] = rows('a4-783-internal-intake');
  const a4Climb = rows('a4-handbook-climb-time');
  const [bmwShift] = rows('bmw801d2-shift-bench');

  return {
    observation_ids: originalIds,
    rated_power: {
      bf109g2_db605a: { engine: 'DB 605 A', fuel: 'B4', engine_to_prop_reduction: 1.685,
        active_reference_rating: 'climb-combat', active_reference_manifold_ata: 1.30, active_reference_rpm: 2600,
        qualification: 'Engine-type ratings. The restricted G-2 comparison uses 1.30 ata and 2,600 rpm. Use the MT-215 test settings for its own speed trace.',
        anchors: db605 },
      fw190a4_783: { engine: 'BMW 801 D-2', active_reference_rating: 'climb-combat',
        active_reference_manifold_ata: 1.32, active_reference_rpm: 2400,
        qualification: 'Handbook BMW 801 D full-throttle ratings without ram. Select the documented gear. Installed flight boost depends on intake and flight phase.',
        anchors: bmw801 },
    },
    flight_tests: {
      g1_14026: {
        scope: 'Original corrected speed in a G-1 with two different installations. The propeller and intake also changed. Retain the two curves separately when comparing F-4 and G-2 engine references.',
        db601e: { engine_serial: '177', engine_rpm: 2500, rating_target_ata: 1.30, ...g1DB601E },
        db605a: { engine_serial: '76098', engine_rpm: 2600, rating_target_ata: 1.30, ...g1DB605A },
      },
      fw190a4_783: {
        scope: 'WNr 783, long external intakes, 3,870 kg takeoff, combat 2,400 rpm.',
        level_tas: a4Level, internal_intake_comparison: a4Internal, manifold_by_flight_phase: a4Boost,
        handbook_climb_context: a4Climb, controller_bench_context: bmwShift,
      },
    },
    propeller_check: {
      scope: 'NACA L7D10 independent P-47D-28 test installation with modified Curtiss 838-1C2-18. Compare with v1.3 references at each recorded condition.',
      climb: propellerClimb,
    },
  };
}

module.exports = { engineReference, sourcePack };
