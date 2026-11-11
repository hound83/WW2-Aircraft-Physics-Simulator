'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const { baselineAt, HP, LBF, FPM_PER_MPS, round } = require('./propeller_efficiency_sweep.cjs');
const p47b = require('../../references/p47b-measured-climb-v33.json');
const corsairChart = require('../../references/v4-source-audit.json').corsair.originalLevelChart;
const spitfireClimbs = require('../../references/climb-condition-states.json').states;
const p47dFast = require('./naca_inflight_prop_holdout_v23.cjs');
const sourcePackId = 'ww2_propeller_efficiency_2026-11-11';
const measuredConditionsId = 'ww2_fighter_measured_conditions_2026-11-11';
const propulsionTrialsId = 'ww2_multiaxis_propulsion_trials_2026-11-10';
const range = values => [Math.min(...values), Math.max(...values)];

function series(catalog, pack, id) {
  const rows = catalog.observations.filter(row => row.id.startsWith(pack + ':' + id + ':'));
  if (!rows.length) throw Error('Missing original source series ' + id);
  return rows;
}

function sourceSeries(catalog) {
  const branches = [
    [sourcePackId, 'p47c-military-165'],
    [sourcePackId, 'p47c-normal-160'],
    [sourcePackId, 'p47c-normal-165'],
    [sourcePackId, 'rotol-ra10046-22deg-tunnel'],
    [measuredConditionsId, 'p47d-hamilton-standard-climb-coefficients'],
  ];
  return branches.map(([pack, id]) => {
    const rows = series(catalog, pack, id);
    return {
      id, grade: 'primary', use: 'source-installation-only', aircraft: rows[0].aircraft, source: rows[0].source_id,
      locator: rows[0].source_location, conditions: rows[0].conditions,
      observations: rows.map(row => row.id), observed_eta_span: range(rows.map(row => row.values.efficiency)),
    };
  });
}

// Original density ratios define the supported part of each flight-test branch.
function densityInterpolate(branch, sigma) {
  const i = branch.findIndex(row => row.values.density_ratio <= sigma);
  if (i < 0 || i === 0 && branch[0].values.density_ratio !== sigma) return null;
  const b = branch[i];
  const a = b.values.density_ratio === sigma ? b : branch[i - 1];
  const fraction = a === b ? 0 : (sigma - a.values.density_ratio) / (b.values.density_ratio - a.values.density_ratio);
  const read = key => a.values[key] + fraction * (b.values[key] - a.values[key]);
  return {
    eta: read('efficiency'), J: read('advance_ratio'), Cp: read('power_coefficient'), tip_mach: read('tip_mach'),
    endpoint_eta: [a.values.efficiency, b.values.efficiency], observations: [...new Set([a.id, b.id])],
  };
}

function climbReplay(data, aircraft, source, mode, measuredShaftHp) {
  const model = data.models[aircraft], spec = data.specification.aircraft[aircraft];
  const settings = B.validateSettings(spec, { mode }, model);
  const { altFt, tasMph, weightLb, observedFpm } = source;
  const flight = baselineAt(model, spec, settings, altFt, M.airspeeds(tasMph, altFt).eas, weightLb, B.phaseFor(spec, settings), true);
  if (!flight) return null;
  const shaftHp = measuredShaftHp ?? flight.power.shaftHp;
  const climbHp = observedFpm / FPM_PER_MPS * weightLb * LBF / HP;
  const eta = (flight.power.requiredHp + climbHp) / shaftHp;
  // The Thunderbolt energy fit puts a fraction of useful power on the drag side.
  // Reassign the term to useful power for a donor comparison with the same power balance.
  const fittedLossHp = Math.max(0, flight.energyConfiguration?.powerFraction ?? 0) * flight.power.propulsiveHp;
  const propellerComparison = aircraft === 'p47b' && fittedLossHp > 0 ? {
    fitted_loss_hp_in_drag: round(fittedLossHp, 2),
    drag_hp_excluding_fitted_loss: round(flight.power.requiredHp - fittedLossHp, 2),
    eta_if_fitted_loss_is_in_useful_power: round(eta - fittedLossHp / shaftHp, 6),
  } : null;
  return {
    source_case: source.id, alt_ft: altFt, tas_mph: tasMph, weight_lb: weightLb, rpm: flight.benchmark.rpm,
    observed_fpm: observedFpm, modeled_fpm: round(flight.power.climbFpm, 2),
    shaft_hp: round(shaftHp, 2), modeled_shaft_hp: round(flight.power.shaftHp, 2),
    cooling_model: flight.benchmark.cooling, model_drag_hp: round(flight.power.requiredHp, 2),
    model_eta: round(flight.power.propulsiveHp / flight.power.shaftHp, 6),
    equivalent_eta: round(eta, 6), delta_eta: round(eta - flight.power.propulsiveHp / flight.power.shaftHp, 6),
    J: round(flight.prop.J, 5), Cp: round(flight.prop.Cp, 5), tip_mach: round(flight.prop.tipMach, 5),
    ...(propellerComparison && { propeller_comparison: propellerComparison }),
  };
}

function thunderboltReplay(data, catalog) {
  const military = series(catalog, sourcePackId, 'p47c-military-165');
  const normal = series(catalog, sourcePackId, 'p47c-normal-160');
  const normalFast = series(catalog, sourcePackId, 'p47c-normal-165');
  return p47b.states.map((state, i) => {
    const isMilitary = state.rating === 'military';
    const result = climbReplay(data, 'p47b', { ...state, weightLb: p47b.mass.valueLb }, isMilitary ? 'combat' : 'normal', state.shaftHp);
    if (!result) return { source_case: state.id, status: 'outside-operating-replay' };
    const sigma = M.isa(state.altFt).sigma;
    const alternatives = (isMilitary ? [military] : [normal, normalFast]).flatMap(branch => {
      const reading = densityInterpolate(branch, sigma);
      if (!reading) return [];
      const climbHp = state.observedFpm / FPM_PER_MPS * p47b.mass.valueLb * LBF / HP;
      const impliedDragHp = reading.eta * state.shaftHp - climbHp;
      const fpmPerHp = HP / (p47b.mass.valueLb * LBF) * FPM_PER_MPS;
      const replayFpm = (reading.eta * state.shaftHp - result.model_drag_hp) * fpmPerHp;
      const comparison = result.propeller_comparison;
      return [{
        branch: branch[0].source_location, eta: round(reading.eta, 6), observed_endpoints: reading.endpoint_eta,
        source_observations: reading.observations, donor_J: round(reading.J, 5), donor_Cp: round(reading.Cp, 5),
        donor_tip_mach: round(reading.tip_mach, 5), replay_fpm: round(replayFpm, 2),
        drag_hp_at_observed_climb: round(impliedDragHp, 2),
        drag_hp_delta_to_model: round(impliedDragHp - result.model_drag_hp, 2),
        ...(comparison && {
          replay_fpm_if_fitted_loss_is_in_useful_power: round(replayFpm + comparison.fitted_loss_hp_in_drag * fpmPerHp, 2),
          drag_hp_delta_excluding_fitted_loss: round(impliedDragHp - comparison.drag_hp_excluding_fitted_loss, 2),
        }),
      }];
    });
    return {
      ...result, source_locator: state.sourceLocation, density_ratio_isa: round(sigma, 6),
      calibration_role: i % 2 === 0 ? 'cooling-fit' : 'same-campaign-check',
      donor_alternatives: alternatives,
    };
  });
}

// These rows hold the benchmark clean polar fixed and replay the report's
// actual speed, weight estimate and per-engine shaft power and RPM.
function levelReplay(model, { altFt, tasMph, weightLb, bhp, rpm }) {
  const rating = 'source-check';
  const ac = {
    ...model.ac,
    propGeometry: {
      ...model.ac.propGeometry,
      ...(model.benchmarkReductionRatio && { reductionRatioEnginePerProp: model.benchmarkReductionRatio }),
      engineRpmByRating: { [rating]: rpm },
    },
    powerRatings: { [rating]: { gears: { test: [{ altFt, bhp, engineRpm: rpm }] } } },
  };
  const flight = M.evaluated(ac, altFt, tasMph, { profile: 'P', polar: model.benchmarkPolar, rating, gear: 'test', weightLb });
  if (flight.status !== 'modelled') throw Error('Source level replay failed for ' + ac.name + ': ' + flight.status);
  const eta = flight.power.requiredHp / flight.power.shaftHp;
  return {
    alt_ft: altFt, tas_mph: tasMph, weight_lb: weightLb, rpm,
    shaft_hp_per_engine: bhp, engines: ac.engineCount ?? 1, model_drag_hp: round(flight.power.requiredHp, 2),
    model_eta: round(flight.power.propulsiveHp / flight.power.shaftHp, 6),
    equivalent_eta: round(eta, 6), delta_eta: round(eta - flight.power.propulsiveHp / flight.power.shaftHp, 6),
    within_shaft_limit: eta <= 1,
    minimum_shaft_hp_per_engine: round(flight.power.requiredHp / (ac.engineCount ?? 1), 2),
    J: round(flight.prop.J, 5), Cp: round(flight.prop.Cp, 5), tip_mach: round(flight.prop.tipMach, 5),
  };
}

function levelChecks(data, catalog) {
  const p38 = series(catalog, measuredConditionsId, 'p38g-part-power-level').map(({ id, values: v }) => ({
    observation: id,
    ...levelReplay(data.models.p38g, {
      altFt: v.alt_ft, tasMph: v.speed_tas_mph, weightLb: v.estimated_gross_lb, bhp: v.chart_bhp_per_engine, rpm: v.rpm,
    }),
  }));
  const p51 = series(catalog, propulsionTrialsId, 'p51b15-chart-vs-performance')
    .filter(row => !row.values.wing_racks).map(({ id, values: v }) => ({
      observation: id, boost_inhg: v.manifold_inhg,
      ...levelReplay(data.models.p51b, { altFt: v.alt_ft, tasMph: v.speed_mph, weightLb: 9335, bhp: v.bhp_chart, rpm: v.rpm }),
    }));
  const f4u = series(catalog, propulsionTrialsId, 'f4u4-normal-military-speed').map(({ id, values: v }) => {
    const [, , bhp] = corsairChart.rows.find(([rating, alt]) => v.power === rating && v.alt_ft === alt);
    const rpm = data.specification.aircraft.f4u4[v.power === 'normal' ? 'normal' : 'combat'].rpm;
    const inputs = { altFt: v.alt_ft, tasMph: v.speed_mph, weightLb: 12500, bhp, rpm };
    const point = levelReplay(data.models.f4u4, inputs);
    const shaftReading = [bhp - corsairChart.bhpReadingUncertainty, bhp + corsairChart.bhpReadingUncertainty];
    // At fixed drag, more chart power implies a smaller equivalent efficiency.
    const etaRange = shaftReading.toReversed().map(power => round(point.model_drag_hp / power, 6));
    return { observation: id, power: v.power, shaft_chart_hp_span: shaftReading, chart_reading_eta_span: etaRange, ...point };
  });
  return [
    { aircraft: 'p38g', power_basis: 'Report engine-chart BHP per engine, faired cooling, report-estimated gross weight.', rows: p38 },
    { aircraft: 'p51b', power_basis: 'Packard chart BHP, no wing racks, takeoff weight proxy, experimental 75 inHg only.', rows: p51 },
    { aircraft: 'f4u4', power_basis: 'Chart BHP ±50 hp reading allowance only, 12500 lb, clean reference polar.', source_chart: corsairChart.url, rows: f4u },
  ];
}

function pairedThunderbolt(catalog) {
  const rows = series(catalog, propulsionTrialsId, 'p47b-dec-props-climb');
  const altitudes = [...new Set(rows.map(row => row.values.alt_ft))];
  return altitudes.map(altFt => {
    const group = rows.filter(row => row.values.alt_ft === altFt);
    const { torque_bhp: bhp, climb_speed_mph: tasMph } = group[0].values;
    if (group.some(({ values: v }) => v.torque_bhp !== bhp || v.climb_speed_mph !== tasMph)) throw Error('Unmatched propeller swap conditions');
    const reference = group.find(row => row.values.propeller === 'Curtiss 714-1C2-12 cuffed');
    return {
      alt_ft: altFt, tas_mph: tasMph, shaft_hp: bhp, engine_rpm: 2700, weight_lb: 12620,
      reference: reference.id,
      rows: group.map(({ id, values: v }) => {
        const delta = v.roc_fpm - reference.values.roc_fpm;
        return { observation: id, propeller: v.propeller, delta_fpm: delta, equivalent_delta_eta: round(delta / FPM_PER_MPS * 12620 * LBF / (HP * bhp), 6) };
      }),
    };
  });
}

function sourceEvidence(data, catalog) {
  const spitfire = spitfireClimbs.filter(row => row.aircraftId === 'spitfire_lfix_bs543').map(row =>
    climbReplay(data, 'spitfire_lfix_bs543', row, 'combat') ?? { source_case: row.id, status: 'outside-operating-replay' });
  return {
    primary_series: sourceSeries(catalog),
    p47d_high_speed: {
      source: p47dFast.report, grade: 'primary', use: 'source-installation-only',
      conditions: 'Six selected Table II runs on P-47D with three Hamilton Standard 6507A-2 blades. Nominal 2700 engine rpm.',
      rows: p47dFast.measurements.filter(row => row.table === 'II fast').map(({ run, J, Cp, eta, tipMach }) =>
        ({ run, J, Cp, eta, tip_mach: tipMach })),
    },
    equivalent_efficiency: {
      grade: 'calculated', use: 'source-replay-only',
      method: 'Divide modeled drag power plus measured climb power (zero in level flight) by shaft power. Shaft BHP comes from the trial or the stated proxy. Uses the existing clean or climb drag and quasi-steady climb. Related fitted data cannot be independent eta validation.',
      p47b: {
        source: p47b.source.url, measured_climb_states: 'references/p47b-measured-climb-v33.json',
        condition: '41-5902 torque-meter BHP, true speed, 12565 lb. Donor interpolation is within P-47C source density ratios. J, Cp and tip Mach differences remain visible. No inferred correction for IAS across installations.',
        comparison_basis: 'equivalent_eta keeps the full calibrated model drag. propeller_comparison shows the alternative of assigning the explicit fitted power-proportional term entirely to useful power and keeping the fitted fixed area term. These are two allocations of the same power balance. The physical allocation requires independent evidence.',
        rows: thunderboltReplay(data, catalog),
      },
      spitfire: {
        source: data.specification.sources.spit.url, measured_climb_states: 'references/climb-condition-states.json',
        condition: 'BS.543 Table II schedule and gross mass. Current boost-conditioned model shaft and open-radiator drag are coupled, with fit and check rows from the same campaign.',
        rows: spitfire,
      },
      level: levelChecks(data, catalog),
    },
    paired_propeller_swaps: {
      aircraft: 'P-47B 41-5942', grade: 'calculated', use: 'relative-propeller-effect',
      conditions: 'One specimen and campaign, same reported climb TAS, torque BHP, weight and open cooling. Convert climb-rate difference to equivalent useful-power change; propeller slipstream drag is included in this installed effect.',
      rows: pairedThunderbolt(catalog),
    },
  };
}

module.exports = { sourceEvidence, densityInterpolate };
