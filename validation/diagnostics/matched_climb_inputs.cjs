'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const { climb_reference: reference } = require('../../references/analysis/fighter-sim-inputs-v1.json');
const { browserData } = require('./remaining_fighter_propellers.cjs');
const { run: accuracy } = require('./implemented_model_accuracy.cjs');
const fwReport = require('../../references/fw190a4-783.json');

const FT = 0.3048;
const FPM = 60 / FT;
const MPH = 0.44704;
const G = 9.80665;
const round = n => Number.isFinite(n) ? +n.toFixed(3) : null;
const mae = rows => round(rows.reduce((sum, value) => sum + Math.abs(value), 0) / rows.length);

function powerBudget(state) {
  const { shaftHp, propulsiveHp, requiredHp } = state.power;
  return {
    shaft_hp_total: round(shaftHp), useful_propeller_hp_total: round(propulsiveHp), drag_hp_total: round(requiredHp),
    excess_hp_total: round(propulsiveHp - requiredHp), modeled_propulsive_fraction: round(propulsiveHp / shaftHp),
  };
}

function context(data, id, mode, weightLb, model = data.models[id]) {
  const spec = data.specification.aircraft[id];
  const settings = { mode, extension: false };
  const phase = B.phaseFor(spec, settings);
  return {
    weightLb, phase,
    best: altFt => B.bestClimb(M, T, L, model, spec, settings, altFt, weightLb, phase, 1),
    at(altFt, tasMph, open = true) {
      const state = B.evaluate(M, T, L, model, spec, settings, altFt, M.airspeeds(tasMph, altFt).eas, weightLb, phase, open);
      if (state.status !== 'modelled') throw Error(id + ': ' + state.status + ' at ' + altFt + ' ft and ' + tasMph + ' mph TAS');
      return state;
    },
  };
}

// Each knot is an altitude checkpoint. Divide only the modeled specific excess
// power by the change in total energy height. Reported rates are vertical rates.
function integrate(schedule, evaluate, stepFt) {
  const tas = altFt => B.interpolate(schedule, altFt, 1);
  const energyHeight = altFt => (tas(altFt) * MPH) ** 2 / (2 * G);
  let steady = 0, withEnergy = 0;
  return schedule.slice(1).map(([endFt], i) => {
    const [startFt] = schedule[i];
    let steadyBand = 0, energyBand = 0;
    for (let h = startFt; h < endFt;) {
      const next = Math.min(h + stepFt, endFt), mid = (next + h) / 2;
      const ps = evaluate(mid, tas(mid)).power.psMps;
      const dh = (next - h) * FT, de = energyHeight(next) - energyHeight(h);
      if (!(ps > 0 && dh + de > 0)) throw Error('Unsupported positive climb at ' + mid + ' ft');
      steadyBand += dh / ps;
      energyBand += (dh + de) / ps;
      h = next;
    }
    steady += steadyBand;
    withEnergy += energyBand;
    return { steady, withEnergy, steadyBand, energyBand };
  });
}

function timingScore(nodes, before, after, fine) {
  return nodes.slice(1).map(([altitude, elapsed], i) => {
    const [startAltitude, startElapsed] = nodes[i];
    const row = after[i];
    return {
      from_altitude: startAltitude, altitude, reported_cumulative_s: elapsed,
      before_steady_cumulative_s: round(before[i].steady), after_steady_cumulative_s: round(row.steady),
      after_tas_energy_cumulative_s: round(row.withEnergy),
      before_cumulative_error_s: round(before[i].steady - elapsed),
      after_cumulative_error_s: round(row.withEnergy - elapsed),
      reported_band_s: round(elapsed - startElapsed),
      before_band_error_s: round(before[i].steadyBand - (elapsed - startElapsed)),
      after_band_error_s: round(row.energyBand - (elapsed - startElapsed)),
      after_50ft_minus_100ft_cumulative_s: round(fine[i].withEnergy - row.withEnergy),
    };
  });
}

function fwReplay(data, climb) {
  const model = data.models.fw190a4;
  const areaM2 = climb.cooling_fit.area_m2;
  const control = context(data, 'fw190a4', 'normal', model.ac.weightLb, { ...model, climbCoolingAreaM2: 0 });
  const candidate = context(data, 'fw190a4', 'normal', model.ac.weightLb, { ...model, climbCoolingAreaM2: areaM2 });
  const rows = climb.rows.map(row => {
    const altM = row.altitude_m, altFt = altM / FT;
    const old = control.best(altFt), next = candidate.best(altFt);
    const closed = candidate.at(altFt, next.tasMph, false), open = candidate.at(altFt, next.tasMph);
    const [slow, fast] = [.9, 1.1].map(scale => next.tasMph * scale);
    const sourceRate = (row.existing_replay_open_rate_m_s ?? row.open_rate_m_s) * FPM;
    return {
      altitude_m: altM, observation_id: row.observation_id, role: row.role,
      graph_open_rate_m_s: row.open_rate_m_s, graph_closed_rate_m_s: row.closed_rate_m_s,
      replay_source_open_fpm: round(sourceRate),
      before_tas_mph_estimate: old.tasMph, after_tas_mph_estimate: next.tasMph,
      tas_sensitivity_mph: [round(slow), round(fast)],
      after_rate_fpm_at_tas_bounds: [slow, fast].map(tas => round(candidate.at(altFt, tas).power.climbFpm)),
      before_open_error_fpm: round(old.climbFpm - sourceRate), after_open_error_fpm: round(next.climbFpm - sourceRate),
      observed_paired_penalty_fpm: row.closed_rate_m_s === null ? null : round((row.closed_rate_m_s - row.open_rate_m_s) * FPM),
      modeled_paired_penalty_fpm: round(closed.power.climbFpm - open.power.climbFpm),
      open: powerBudget(open), closed: powerBudget(closed),
    };
  });
  const reserved = rows.filter(row => row.role === 'same-report-reserved' && fwReport.climb.rows.some(([alt]) => row.altitude_m === alt));
  const timed = climb.rows.filter(row => row.open_elapsed_from_1000_m_s !== null);
  const altitudeFt = row => row.altitude_m / FT;
  const speedSchedule = (state, scale = 1) => timed.map(row => [altitudeFt(row), state.best(altitudeFt(row)).tasMph * scale]);
  const old = integrate(speedSchedule(control), control.at, 100);
  const next = integrate(speedSchedule(candidate), candidate.at, 100);
  const fine = integrate(speedSchedule(candidate), candidate.at, 50);
  return {
    case_id: climb.id, estimated_tas_basis: 'Best-rate search in 1 mph steps on the bounded open-cooling scenario. ±10% is an engineering sensitivity.',
    replay_weight_lb: round(model.ac.weightLb), operating_phase: control.phase.key, rated_manifold_ata: control.phase.map,
    cooling_area_m2: areaM2, rate_rows: rows,
    same_eight_rate_checks: {
      before_mae_fpm: mae(reserved.map(row => row.before_open_error_fpm)),
      after_mae_fpm: mae(reserved.map(row => row.after_open_error_fpm)),
    },
    timing_start_m: climb.elapsed_time.start_altitude_m, timing_chart_reading_allowance_s: climb.elapsed_time.normalized_chart_allowance_s,
    timing_bands: timingScore(timed.map(row => [row.altitude_m, row.open_elapsed_from_1000_m_s]), old, next, fine),
    timing_sensitivity_at_last_chart_row_s: [.9, 1, 1.1].map(scale => ({
      tas_scale: scale, elapsed_s: round(integrate(speedSchedule(candidate, scale), candidate.at, 100).at(-1).withEnergy),
    })),
  };
}

function p38Replay(data, climb) {
  const replay = context(data, 'p38g', 'combat', climb.conditions.takeoff_weight_lb);
  const schedule = climb.rows.map(row => [row.alt_ft, row.climb_tas_mph]);
  const steady = integrate(schedule, replay.at, 100);
  const fine = integrate(schedule, replay.at, 50);
  const rows = climb.rows.map(row => {
    const state = replay.at(row.alt_ft, row.climb_tas_mph);
    return {
      observation_id: row.observation_id, altitude_ft: row.alt_ft, role: row.role,
      reported_tas_mph: row.climb_tas_mph, chart_bhp_per_engine: row.bhp_each,
      observed_vertical_rate_fpm: row.roc_fpm, steady_rate_error_fpm: round(state.power.climbFpm - row.roc_fpm),
      power: powerBudget(state),
    };
  });
  return {
    case_id: climb.id, replay_weight_lb: replay.weightLb, rate_rows: rows,
    seven_reserved_rate_checks_mae_fpm: mae(rows.filter(row => row.role === 'same-report-reserved').map(row => row.steady_rate_error_fpm)),
    timing_start_ft: 0,
    timing_bands: timingScore(climb.rows.map(row => [row.alt_ft, row.elapsed_from_sea_level_s]), steady, steady, fine),
  };
}

function propulsion(data, historical, fw, p38) {
  const cases = [
    ['spitfire_lfix_bs543', 'spitfire-climb', 12000, 'combat', 'BS.543 open radiator, recorded TAS; installed power and drag coupled.'],
    ['p47b', 'p47-climb', 12600, 'combat', '41-5902 report replay at chart-assigned power and TAS; efficiency is transferred.'],
    ['p51b', 'p51-climb', 2200, 'combat', '43-24777 rated configuration, model best-rate TAS; racked automatic-shutter trial.'],
    ['f4u4', 'f4u-climb', 6500, 'normal', '12,500-lb Navy Normal climb, modeled best-rate TAS; clean-level efficiency reference has its own domain.'],
  ];
  const budgets = cases.map(([id, groupId, altFt, mode, qualification]) => {
    const group = historical.find(row => row.id === groupId);
    const observed = group.rows.find(row => row.altFt === altFt);
    const replay = context(data, id, mode, observed.weightLb);
    const tasMph = observed.tasMph ?? observed.modelTasMph ?? replay.best(altFt).tasMph;
    return {
      aircraft: id, altitude_ft: altFt, weight_lb: observed.weightLb, tas_mph: tasMph, phase: mode,
      source_url: group.source, reported_shaft_hp_total: observed.reportBhp ?? null,
      source_rate_fpm: observed.observed, native_rate_error_fpm: round(observed.error),
      power: powerBudget(replay.at(altFt, tasMph)), qualification,
    };
  });
  const fwAnchor = fw.rate_rows.find(row => row.role === 'cooling-fit-anchor');
  const p38Anchor = p38.rate_rows.find(row => row.role === 'cooling-fit-anchor');
  const bf = context(data, 'bf109f4', 'combat', data.models.bf109f4.ac.weightLb);
  const bfTas = M.tasFrom(175, 'EAS', 10000);
  return [
    ...budgets,
    { aircraft: 'fw190a4', altitude_m: fwAnchor.altitude_m, weight_lb: fw.replay_weight_lb, tas_mph: fwAnchor.after_tas_mph_estimate,
      source_observation_id: fwAnchor.observation_id, phase: 'normal', power: fwAnchor.open, closed_power: fwAnchor.closed,
      qualification: 'WNr 783 cooling fit. Direct shaft and useful power remain unavailable.' },
    { aircraft: 'p38g', altitude_ft: p38Anchor.altitude_ft, weight_lb: p38.replay_weight_lb, tas_mph: p38Anchor.reported_tas_mph,
      source_observation_id: p38Anchor.observation_id, phase: 'combat', power: p38Anchor.power,
      reported_shaft_hp_total: 2 * p38Anchor.chart_bhp_per_engine,
      qualification: 'Wright Field B.4 cooling-fit point. Total chart-assigned shaft power is twice the BHP per engine.' },
    { aircraft: 'bf109f4', altitude_ft: 10000, weight_lb: bf.weightLb, tas_mph: round(bfTas), phase: 'combat',
      power: powerBudget(bf.at(10000, bfTas)), qualification: 'Engineering point at 175 mph EAS. Matched measured climb power and efficiency remain open.' },
  ];
}

function run() {
  const data = browserData();
  const historical = accuracy().groups;
  const fw = fwReplay(data, reference.cases[0]);
  const p38 = p38Replay(data, reference.cases[1]);
  return {
    schema: 'ww2-matched-climb-input-scorecard/v1', input_pack_version: '1.7.0',
    baseline_commit: '636d57c52228012fcdb932973af5636320c0dac1',
    scope: 'Fixed takeoff mass, ISA and source-conditioned power. The Fw 190 control omits the open-cooling area to reproduce the frozen baseline. Error is modeled minus reported. The timing comparison shares report lineage with the fitted input. No independent timing validation.',
    integration: '100-ft midpoint specific excess power. After time uses Δt = (Δh + Δ(TAS²/2g)) / Ps; 50-ft repeat. Fixed-mass diagnosis excludes fuel burn and rating-duration effects.',
    fw190: fw, p38g: p38,
    seven_aircraft_propulsion: propulsion(data, historical, fw, p38),
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run };
