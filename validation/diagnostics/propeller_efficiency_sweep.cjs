'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const Turn = require('../../src/turn-performance.js');
const liftSource = require('../../references/p51-turn-lift-tn1044.json');

const HP = 745.6998716;
const LBF = 4.4482216153;
const FPM_PER_MPS = 196.850394;
const grid = (start, end, step) => Array.from({ length: (end - start) / step + 1 }, (_, i) => start + step * i);
const altitudesFt = grid(0, 40000, 2500);
const levelTasMph = grid(90, 590, 2);
const climbTasMph = grid(100, 340, 2);
const sampleEasMph = [150, 200, 250, 300];
const accelerationEasMph = [200, 250];
const factors = grid(80, 120, 1).map(value => value / 100);
const publishedFactors = [.8, .95, 1, 1.05, 1.2];
const round = (value, digits = 4) => Number.isFinite(value) ? Number(value.toFixed(digits)) : null;

function baselineAt(model, spec, settings, altitude, eas, weight, phase, climbing) {
  const flight = B.evaluate(M, T, liftSource, model, spec, settings, altitude, eas, weight, phase, climbing);
  return flight.status === 'modelled' ? flight : null;
}

function excessHp(flight, factor) {
  const { propulsiveHp, shaftHp, requiredHp } = flight.power;
  return Math.min(propulsiveHp * factor, shaftHp) - requiredHp;
}

function accelerationAt(flight, factor) {
  const psMps = excessHp(flight, factor) * HP / (flight.weightLb * LBF);
  return B.levelAccelerationMphPerSecond({ status: flight.status, tasMph: flight.tasMph, power: { psMps } });
}

function sampleAt(flight, factor) {
  const acceleration = accelerationAt(flight, factor);
  const turn = Turn.state(flight, { powerFraction: factor });
  return {
    effective_eta: round(turn.availableHp / flight.power.shaftHp, 6),
    acceleration_mph_s: round(acceleration),
    sustained_deg_s: round(turn.turn?.rateDegSec),
  };
}

function maxLevel(states, factor) {
  let previous = null;
  let result = null;
  for (const flight of states) {
    if (!flight) {
      previous = null;
      continue;
    }
    const hp = excessHp(flight, factor);
    if (previous?.hp >= 0 && hp < 0) {
      const span = flight.tasMph - previous.tas;
      result = previous.tas + span * previous.hp / (previous.hp - hp);
    }
    previous = { hp, tas: flight.tasMph };
  }
  return result;
}

function bestClimb(states, factor) {
  let best = null;
  for (const flight of states) {
    if (!flight) continue;
    const fpm = excessHp(flight, factor) * HP / (flight.weightLb * LBF) * FPM_PER_MPS;
    if (!best || fpm > best.fpm) best = { fpm, tas: flight.tasMph };
  }
  return best;
}

function accelerationTime(states, factor) {
  let previous = null;
  let seconds = 0;
  for (const flight of states) {
    if (!flight) return null;
    const tas = flight.tasMph;
    const acceleration = accelerationAt(flight, factor);
    if (!(acceleration > 0)) return null;
    // Integrate reciprocal TAS acceleration using the fixed-mass speed samples.
    if (previous) seconds += (tas - previous.tas) * (1 / previous.acceleration + 1 / acceleration) / 2;
    previous = { tas, acceleration };
  }
  return seconds;
}

function runSweep(data, full = false) {
  const outputFactors = full ? factors : publishedFactors;
  const { models, specification } = data;
  const cases = [];
  const unavailable = [];
  const counts = { supported_cases: 0, unavailable_cases: 0, baseline_states: 0, efficiency_evaluations: 0, shaft_cap_evaluations: 0 };
  for (const [aircraft, model] of Object.entries(models)) {
    const spec = specification.aircraft[aircraft];
    for (const mode of ['normal', 'combat']) {
      const settings = B.validateSettings(spec, { mode, fuelFraction: .5, extension: false, injection: false }, model);
      const weight = B.load(spec, specification.policy, settings).weightLb;
      const phase = B.phaseFor(spec, settings);
      for (const altFt of altitudesFt) {
        const at = (eas, climbing = false) => baselineAt(model, spec, settings, altFt, eas, weight, phase, climbing);
        const scenario = { aircraft, mode, alt_ft: altFt };
        // Evaluate the operational branch once. Its airframe, rating, RPM,
        // shaft power, lift and cooling drag are frozen before any perturbation.
        const level = levelTasMph.map(tas => at(M.airspeeds(tas, altFt).eas));
        if (!level.some(Boolean)) {
          unavailable.push(scenario);
          counts.unavailable_cases++;
          continue;
        }
        const climb = climbTasMph.map(tas => at(M.airspeeds(tas, altFt).eas, true));
        const samples = sampleEasMph.map(eas => at(eas));
        const [from, to] = accelerationEasMph.map(eas => M.tasFrom(eas, 'EAS', altFt));
        const [start, finish] = accelerationEasMph.map(eas => samples[sampleEasMph.indexOf(eas)]);
        const timedRun = [start, ...level.filter((_, i) => levelTasMph[i] > from && levelTasMph[i] < to), finish];
        const states = [...level, ...climb, ...samples].filter(Boolean);
        counts.supported_cases++;
        counts.baseline_states += states.length;
        counts.efficiency_evaluations += states.length * factors.length;

        const sweep = factors.map(factor => {
          counts.shaft_cap_evaluations += states.filter(r => r.power.propulsiveHp * factor > r.power.shaftHp).length;
          const best = bestClimb(climb, factor);
          return {
            level_tas_mph: round(maxLevel(level, factor)),
            climb_fpm: round(best?.fpm, 2),
            climb_tas_mph: round(best?.tas),
            acceleration_seconds: round(accelerationTime(timedRun, factor), 2),
            at_eas: samples.map(flight => flight ? sampleAt(flight, factor) : null),
          };
        });
        const selected = outputFactors.map(factor => sweep[factors.indexOf(factor)]);
        cases.push({
          ...scenario,
          weight_lb: round(weight, 2), engine_rpm: phase.rpm, rating: phase.label,
          level_tas_mph: selected.map(row => row.level_tas_mph),
          climb_fpm: selected.map(row => row.climb_fpm),
          climb_tas_mph: selected.map(row => row.climb_tas_mph),
          acceleration_seconds: selected.map(row => row.acceleration_seconds),
          at_eas: sampleEasMph.map((eas, i) => ({
            eas_mph: eas,
            effective_eta: selected.map(row => row.at_eas[i]?.effective_eta ?? null),
            acceleration_mph_s: selected.map(row => row.at_eas[i]?.acceleration_mph_s ?? null),
            sustained_deg_s: selected.map(row => row.at_eas[i]?.sustained_deg_s ?? null),
          })),
        });
      }
    }
  }
  return {
    input: {
      grade: 'calculated', use: 'sensitivity-only', parameter: 'effective propulsive efficiency multiplier',
      applied_factors: factors, output_factors: outputFactors, altitudes_ft: altitudesFt,
      level_tas_grid_mph: [levelTasMph[0], levelTasMph.at(-1), 2],
      climb_tas_grid_mph: [climbTasMph[0], climbTasMph.at(-1), 2],
      sample_eas_mph: sampleEasMph, timed_acceleration_eas_mph: accelerationEasMph, modes: ['normal', 'combat'],
      fuel_fraction: .5, injection: false, power_extension: false,
      cooling: 'Clean for level, acceleration and turn. Existing climb cooling at each climb state.',
      interpretation: 'Deterministic stress sweep. Each state changes only useful power, capped at shaft power. No fit or probability weighting. Outer factors may exceed the ideal disk or actual blade limits.',
      indexing: 'Every result array within a case follows output_factors. The at_eas entries identify each EAS slice.',
      timed_acceleration: 'Constant-altitude, fixed-mass integral over the specified EAS interval using the corresponding TAS steps. Starts at the selected rating. No rating changes or fuel burn.',
      missing: 'Unavailable rating-altitude cases and null values indicate unsupported power, provisional stall, absent high-speed crossing, insufficient power to reach the timed target or no sustained turn.',
    },
    counts, unavailable, cases,
  };
}

module.exports = { runSweep, sampleAt, accelerationTime, excessHp, baselineAt, HP, LBF, FPM_PER_MPS, round };
