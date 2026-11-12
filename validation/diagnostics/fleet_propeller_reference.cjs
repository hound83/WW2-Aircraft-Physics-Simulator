'use strict';

const { round } = require('./propeller_efficiency_sweep.cjs');
const { DEFAULT_ETA, dragAt, fitCleanDrag, levelSpeed } = require('./simple_propeller_efficiency.cjs');

const pack = 'ww2_fleet_propeller_2026-11-12';
const trials = 'ww2_multiaxis_propulsion_trials_2026-11-10';
const engine = 'ww2_engine_ratings_and_propeller_2026-11-12';
const german = 'ww2_german_fighter_archive_2026-11-11';
const recovery = 'ww2_thirteen_fighter_source_recovery_2026-11-11';
const mean = values => values.reduce((total, value) => total + value, 0) / values.length;
const span = values => [Math.min(...values), Math.max(...values)];

function highSpeedDonor(series) {
  const rows = series(pack, 'p47d28-838-extended-blade-high-speed').map(({ id, values: v }) => ({
    observation: id, run: v.run, J: v.advance_ratio, Cp: v.power_coefficient,
    tip_mach: v.tip_mach, eta: v.efficiency,
    tip_mach_from_rounded_columns: round(v.flight_mach * Math.hypot(1, Math.PI / v.advance_ratio), 4),
  }));
  const flagged = rows.filter(row => Math.abs(row.tip_mach - row.tip_mach_from_rounded_columns) > .006);
  const comparable = rows.filter(row => !flagged.includes(row) && row.J >= 1.55);
  const summary = (conditions, group) => ({
    conditions, count: group.length, eta_span: span(group.map(row => row.eta)),
    mean_eta: round(mean(group.map(row => row.eta)), 4),
    fixed_80_mae_pp: round(100 * mean(group.map(row => Math.abs(DEFAULT_ETA - row.eta))), 2),
    observations: group.map(row => row.observation),
  });
  return {
    grade: 'primary',
    installation: 'P-47D-28, modified three-blade Curtiss 838-1C2-18',
    use: 'Independent flight dataset for testing propeller assumptions at the original J, Cp and tip Mach. Use the measured span as donor evidence.',
    source: pack + ':NACA-RM-L7D10-TABLE-III',
    all: summary('Full Table III', rows),
    bands: [
      summary('J >= 1.55, tip Mach 0.94-1.02', comparable.filter(row => row.tip_mach >= .94 && row.tip_mach <= 1.02)),
      summary('J >= 1.55, tip Mach >1.02 and <1.08', comparable.filter(row => row.tip_mach > 1.02 && row.tip_mach < 1.08)),
      summary('J >= 1.55, tip Mach >=1.08, Cp <0.20', comparable.filter(row => row.tip_mach >= 1.08 && row.Cp < .20)),
      summary('J >= 1.55, tip Mach >=1.08, Cp >=0.20', comparable.filter(row => row.tip_mach >= 1.08 && row.Cp >= .20)),
    ],
    tip_mach_review: flagged,
    rows,
  };
}

function intakeComparison(series) {
  const internal = series(pack, 'a4-783-normal-internal-intake-level');
  const external = new Map(series(pack, 'a4-783-long-external-intake-level').map(row => [row.values.altitude_m, row]));
  const rows = internal.map(({ id, values: v }) => {
    const long = external.get(v.altitude_m);
    const point = (observation, { tas_kmh, reading_uncertainty_kmh }) => ({
      observation, tas_kmh, reading_range_kmh: [tas_kmh - reading_uncertainty_kmh, tas_kmh + reading_uncertainty_kmh],
    });
    return {
      altitude_m: v.altitude_m, branch: v.branch, internal: point(id, v), long_external: point(long.id, long.values),
      internal_minus_external_kmh: v.tas_kmh - long.values.tas_kmh,
    };
  });
  const checks = rows.flatMap((row, i) => {
    const a = rows[i - 1], b = rows[i + 1];
    if (a?.branch !== row.branch || b?.branch !== row.branch) return [];
    const fraction = (row.altitude_m - a.altitude_m) / (b.altitude_m - a.altitude_m);
    const check = key => {
      const predicted = a[key].tas_kmh + fraction * (b[key].tas_kmh - a[key].tas_kmh);
      return { predicted_kmh: round(predicted, 2), error_kmh: round(predicted - row[key].tas_kmh, 2) };
    };
    return [{ altitude_m: row.altitude_m, internal: check('internal'), long_external: check('long_external') }];
  });
  return {
    grade: 'primary',
    conditions: 'WNr 783, BMW 801 D-2/20208, combat 2400 rpm, closed cooling flaps, 3870 kg takeoff, pressure altitude.',
    source: pack + ':FW190-783-NR2-CURVES',
    use: 'Use the matching intake trace. Use the report nodes at critical heights and interpolate within the individual plotted branches.',
    chart_check: {
      method: 'Hold each interior altitude out of its own chart branch; use adjacent altitudes from the same intake. The dashed external trace is from Nr. 1.',
      count_per_intake: checks.length,
      internal_mae_kmh: round(mean(checks.map(row => Math.abs(row.internal.error_kmh))), 2),
      long_external_mae_kmh: round(mean(checks.map(row => Math.abs(row.long_external.error_kmh))), 2),
      wrong_intake_mae_kmh: round(mean(checks.map(row =>
        Math.abs(rows.find(point => point.altitude_m === row.altitude_m).internal_minus_external_kmh))), 2),
      rows: checks,
    },
    crossover_altitude_bracket_m: [6000, 6950],
    rows,
  };
}

function matchedPowerCheck(model, anchor, check) {
  const cd0 = fitCleanDrag(model, anchor);
  const predicted = levelSpeed(model, check, cd0, 'A');
  return {
    alt_ft: check.altFt, rpm: check.rpm, reference_eta: DEFAULT_ETA,
    anchor_observation: anchor.observation, check_observation: check.observation,
    chart_bhp_per_engine: [anchor.bhp, check.bhp],
    observed_tas_mph: [anchor.tasMph, check.tasMph],
    replay_tas_mph: round(predicted, 2), error_mph: round(predicted - check.tasMph, 2),
  };
}

function lightning(data, series) {
  const rows = series('balanced-2026-11-10', 'BS01').map(({ id, values: v }, i) => ({
    observation: id, altFt: v.alt_ft, bhp: v.bhp_each, tasMph: v.tas_mph,
    weightLb: v.gross_weight_lb, rpm: 3000, rating: 'level', gear: 'turbo',
    manifold_inhg: v.mp_inhg,
    limit: [null, '48 inHg demonstration', 'carburetor-air temperature limits higher rating',
      '44.7 inHg turbo critical altitude', 'carburetor-air temperature', 'turbo rpm'][i],
  }));
  return {
    grade: 'primary',
    conditions: '42-12687, V-1710-51 and -55, 88996-18 and 89303-18, shutters faired for level flight. Power is from engine charts, per engine.',
    use: '48 inHg is a 5000-ft comparison point. Use the published manifold and BHP rows by altitude; use the separate open-shutter climb schedule.',
    level_rows: rows,
    replay: { grade: 'calculated', ...matchedPowerCheck(data.models.p38g, rows[0], rows[1]) },
  };
}

function mustang(data, series) {
  const model = data.models.p51b;
  const table = series(trials, 'p51b15-chart-vs-performance');
  const point = (observation, altFt, tasMph, bhp) => ({
    observation, altFt, tasMph, bhp, rpm: 3000, weightLb: 9240, rating: 'level', gear: 'high',
  });
  const tablePoint = ({ id, values: v }) => point(id, v.alt_ft, v.speed_mph, v.bhp_chart);
  const [clean, higher, lower] = table.map(tablePoint);
  const figure = series(pack, 'p51b-24777-fig5-high-blower');
  const [figLow, figAnchor, figHigh] = figure.map(({ id, values: v }) => point(id, v.alt_ft, v.tas_mph, v.bhp_chart));
  return {
    grade: 'primary',
    conditions: '43-24777, V-1650-7, K-6523A-24, high blower, 3000 rpm, auto shutters and auto-rich mixture. Table V.B uses a faired curve and reports carburetor-related scatter.',
    use: 'Use the original matched rack and rating speed cases. Use Fig. 5 to constrain the high-blower level power requirement near 22400 ft.',
    at_20800_ft: {
      rack_fit_67: lower.observation, rack_fit_75: higher.observation, rack_removed_75: clean.observation,
      rack_effect_mph: clean.tasMph - higher.tasMph,
      rating_gain_mph: higher.tasMph - lower.tasMph,
    },
    figure_5: figure.map(({ id, values }) => ({ observation: id, ...values })),
    replays: {
      grade: 'calculated',
      weight_lb: 9240,
      method: 'Set one drag reference at the specified speed and BHP, then hold it and 80% fixed. 9240 lb is the report cruise reference, used here as the replay mass. Fig. 5 checks are from the same test campaign.',
      rating_check: matchedPowerCheck(model, lower, higher),
      figure_5_checks: [figLow, figHigh].map(check => matchedPowerCheck(model, figAnchor, check)),
    },
  };
}

function spitfire(data, series, reference) {
  const source = series(pack, 'spit-bs543-table-v-upper-level');
  const level = reference.level.find(row => row.aircraft === 'spitfire_lfix_bs543');
  const model = data.models.spitfire_lfix_bs543;
  const high = level.rows.filter(row => row.gear === 'high');
  const anchor = high.find(row => row.altFt === 20000);
  const fraction = dragAt(model, anchor, level.cd0).requiredHp / anchor.bhp;
  const rows = high.map(row => {
    const original = source.find(({ values: v }) => v.alt_ft === row.altFt && v.blower === 'F.S.');
    return {
      observation: original.id, alt_ft: row.altFt, boost_psi: original.values.boost_psi, observed_tas_mph: row.observed,
      chart_bhp: row.bhp, flat_80_tas_mph: round(row.simple, 2),
      anchored_tas_mph: round(levelSpeed(model, { ...row, bhp: row.bhp * fraction / DEFAULT_ETA }, level.cd0, 'A'), 2),
      current_tas_mph: round(row.current, 2),
    };
  });
  const compare = checks => ({
    count: checks.length,
    flat_80_mae_mph: round(mean(checks.map(row => Math.abs(row.flat_80_tas_mph - row.observed_tas_mph))), 2),
    anchored_mae_mph: round(mean(checks.map(row => Math.abs(row.anchored_tas_mph - row.observed_tas_mph))), 2),
    current_mae_mph: round(mean(checks.map(row => Math.abs(row.current_tas_mph - row.observed_tas_mph))), 2),
  });
  return {
    grade: 'calculated',
    use: 'Read Table V for original speeds. Use the anchored useful-power reference for this level-flight installation below or at full-throttle height.',
    method: 'Hold the existing low-blower reference polar and chart BHP schedule, anchor useful power at 20000 ft, and check the remaining F.S. nodes. Table V shows +18.5 lb boost and 2995 rpm below full-throttle height; replay uses the nominal +18 schedule and 3000 rpm.',
    anchor_alt_ft: anchor.altFt,
    equivalent_useful_hp_at_anchor: round(fraction * anchor.bhp, 2),
    equivalent_useful_to_chart_power: round(fraction, 5),
    below_or_at_full_throttle_height: compare(rows.filter(row => row.alt_ft <= 22000 && row.alt_ft !== anchor.altFt)),
    above_full_throttle_height: compare(rows.filter(row => row.alt_ft > 22000)),
    rows,
    source_observations: source.map(row => row.id),
  };
}

function warhawk(series) {
  const climb = series(trials, 'p40f-five-props-climb');
  const level = series(trials, 'p40f-five-props-level');
  const april = series(pack, 'p40f-101344-april-climb');
  const comparison = april.map(({ id, values: v }) => {
    const february = climb.filter(row => row.values.alt_ft === v.alt_ft && row.values.spinner === 'standard');
    const rates = span(february.map(row => row.values.roc_fpm));
    return {
      alt_ft: v.alt_ft, february_observations: february.map(row => row.id), february_fpm_span: rates,
      april_observation: id, april_fpm: v.roc_fpm, april_minus_february_best_fpm: v.roc_fpm - rates[1],
    };
  });
  const speeds = level.filter(row => row.values.spinner === 'standard');
  const levelSpan = span(speeds.map(row => row.values.speed_mph));
  return {
    grade: 'primary',
    use: 'Select blade, hub and spinner by test, including the 101344-24 April climb series. Retain the airframe and configuration in any comparison.',
    february_standard_spinner_level: {
      alt_ft: 18100, chart_bhp: 1100, rpm: 2950, tas_span_mph: levelSpan,
      tas_spread_mph: levelSpan[1] - levelSpan[0], observations: speeds.map(row => row.id),
    },
    climb_comparison: comparison,
  };
}

function fleetPropellerReference(data, catalog, reference) {
  const series = (sourcePack, id) => catalog.observations.filter(row => row.id.startsWith(sourcePack + ':' + id + ':'));
  const aircraft = [
    ['p47b_415902', 'p47b', 'same-blade reference', 'Use 76% for documented 2700-rpm military climb with the matched cooling area. Use the checked Curtiss level tip-Mach nodes.',
      ['ww2_propeller_efficiency_2026-11-11:NACA-L4L07', trials + ':P47B-415942-DEC']],
    ['f4u4_80765', 'f4u4', 'conditioned reference', 'Use 80% for 80765 clean level Normal and Military with the report chart power.',
      [trials + ':F4U4-80765']],
    ['p51b_4324777', 'p51b', 'conditioned reference', 'Use 80% in the checked low-blower case. Use the original high-blower cases and the Fig. 5 power comparison for the matched configuration.',
      [pack + ':P51B-ENG-47-1749-A-FIG-5', trials + ':P51B15-4324777', pack + ':NACA-MR-L4L18-P51-INSTALLATION']],
    ['spitfire_lfix_bs543', 'spitfire_lfix_bs543', 'conditioned reference', 'Use 80% in the checked M.S. case. The F.S. branch has original speeds and a separate useful-power reference.',
      [pack + ':SPIT-BS543-AAEE-TABLE-V', 'ww2_propeller_efficiency_2026-11-11:RAE-RM2357']],
    ['p38g_4212687', 'p38g', 'conditioned reference', 'Use the two checked part-power series and the 5000-ft rating comparison. Match the per-engine BHP and cooler positions.',
      ['balanced-2026-11-10:B01', 'ww2_fighter_measured_conditions_2026-11-11:G-12687-PARTPOWER']],
    ['bf109f4_representative', 'bf109f4', 'installation evidence', 'Use the DB 601 E ratings and matched performance. The factory G-1 comparison uses a 9-12010 A with the DB 601 E and supplies installation context.',
      [german + ':F4-601E-INSTALLATION', engine + ':MTT-109-19-L-42']],
    ['fw190a4_783', 'fw190a4', 'configuration reference', 'Use the 783 combat-power curve for the actual intake, with the separate cooling and manifold evidence.',
      [pack + ':FW190-783-NR2-CURVES', german + ':A4-783-FW-NR1', 'ww2_fighter_measured_conditions_2026-11-11:A4-783-NR4', engine + ':NACA-MR-E5D19']],
    ['bf109g2_db605a', null, 'installation evidence', 'Use the MT-215 combat settings and Finnish speed/climb. The 9-12087 A in WNr 14026 is a G-1 installation lead.',
      [recovery + ':G2-MT215-SCAN', engine + ':DB-605-A-C-MUSTER', engine + ':MTT-109-19-L-42']],
    ['fw190d9_210002', null, 'installation evidence', 'Use the separate dry and MW 50 cases, preserving the source intake and radiator conditions.',
      [german + ':D9-210002-FW-NR1', recovery + ':FW190D9-210002-NR2', german + ':D9-210002-FW-NR3']],
    ['p47d30_433441', null, 'installation evidence', 'Use the verified four-blade Curtiss SPA-5 identity. The modified 838 and Hamilton 6507A-2 data are test-installation donors.',
      [pack + ':NACA-RM-L8A06-D30-INSTALLATION', pack + ':NACA-RM-L7D10-TABLE-III', 'ww2_fighter_measured_conditions_2026-11-11:D-PROP-WR594']],
    ['p40f_4113635', null, 'propeller-swap evidence', 'Use the original blade/hub/spinner-specific level and climb points, including the separate April 101344-24 trial.',
      [trials + ':P40F-4113635-FEB', pack + ':P40F-1578A-101344-CLIMB']],
    ['f6f3_04776', null, 'installation evidence', 'Use the 04776 three-blade Hydromatic geometry. A drawing match is still needed for a specific Hamilton efficiency map.',
      [pack + ':NACA-MR-L5B13-F6F-INSTALLATION']],
    ['ki84_302', null, 'installation evidence', 'Use T-2 302 handling and configuration data. A loaded flight performance or propeller thrust/power series is still needed.',
      ['ww2_twelve_fighter_dual_lane_2026-11-10:KI84-302-AAF-LIMIT']],
  ].map(([id, sim_id, status, use, sources]) => ({ id, sim_id, status, use, sources }));
  const sources = new Map(catalog.sources.map(row => [row.id, row]));
  for (const row of aircraft) for (const id of row.sources) {
    if (!sources.has(id)) throw Error('Unresolved fleet propeller source ' + id);
  }
  return {
    test_base: { version: '4.9.0-rc.2', commit: 'e7fee380bcd1b89ddfff5214c0d75d410616b9de' },
    reference_eta: DEFAULT_ETA,
    reference_eta_grade: 'calculated',
    conditions: 'The 80% starting value applies in the tested regions. Source-specific installation data take precedence. A useful-power replay retains combined installation effects.',
    aircraft,
    p47d28_high_speed: highSpeedDonor(series),
    fw190a4: intakeComparison(series),
    p38g: lightning(data, series),
    p51b: mustang(data, series),
    spitfire_lfix_bs543: spitfire(data, series, reference),
    p40f_4113635: warhawk(series),
  };
}

module.exports = { fleetPropellerReference };
