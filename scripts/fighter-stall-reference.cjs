'use strict';

const selectionOrder = [
  'calibrated_from_source',
  'indicated_from_source',
  'calculated',
  'emergency_research_needed',
];
const basisStatus = { CAS: selectionOrder[0], EAS: selectionOrder[0], IAS: selectionOrder[1] };
const speedSuffix = { mph: 'mph', kt: 'kt', 'km/h': 'kmh' };
const positive = value => Number.isFinite(value) && value > 0;

function observedStall(candidate, observations) {
  const row = observations.get(candidate.observation_id);
  if (!row) throw Error('Unresolved clean-stall observation ' + candidate.observation_id);
  const values = row.values;
  const clean = values.configuration === 'clean' || values.gear_flaps === 'up_up' ||
    (values.gear === 'up' && values.flaps === 'up');
  const power = values.power ?? values.condition ?? null;
  if (!clean || !['stall_speed', 'stall_or_closest_approach_trace_window'].includes(row.quantity) ||
      ![null, 'off', 'idle', 'glide', 'not stated', 'unreported for numerical table'].includes(power) ||
      !Object.hasOwn(basisStatus, row.speed_basis) || !['primary', 'secondary'].includes(candidate.grade)) {
    throw Error('Ineligible clean-stall observation ' + row.id);
  }

  const unit = candidate.unit ?? 'mph';
  const suffix = speedSuffix[unit];
  const value = values[candidate.value_field ?? 'speed_' + suffix];
  if (!suffix || !positive(value)) throw Error('Invalid clean-stall speed or unit for ' + row.id);
  const readAllowance = unit === 'mph' ? values.read_window_plus_minus_mph : undefined;
  const min = values['speed_min_' + suffix] ?? (value - (readAllowance ?? 0));
  const max = values['speed_max_' + suffix] ?? (value + (readAllowance ?? 0));
  if (!positive(min) || !positive(max) || min > value || max < value) {
    throw Error('Invalid clean-stall speed range for ' + row.id);
  }

  return {
    status: basisStatus[row.speed_basis],
    grade: candidate.grade,
    speed: { value, unit, basis: row.speed_basis, range: min === max ? null : [min, max] },
    observation_ids: [row.id],
    source_aircraft: row.aircraft,
    source_class: row.source_class,
    conditions: {
      weight_lb: values.weight_lb ?? values.gross_weight_lb ?? null,
      weight_basis: values.weight_basis ?? null,
      takeoff_weight_lb: values.takeoff_weight_lb ?? null,
      altitude_ft: values.alt_ft ?? null,
      ...candidate.conditions,
      gear: 'up',
      flaps: 'up',
      power,
    },
    ...(Number.isFinite(values.original_ias_mph) && { reported_ias_mph: values.original_ias_mph }),
    ...(row.correction?.calibration_id && { calibration_id: row.correction.calibration_id }),
    qualification: candidate.qualification,
  };
}

function selectCleanStall(variant, observations) {
  const { sources, calculation } = variant.clean_stall;
  const candidates = sources.map(candidate => observedStall(candidate, observations));
  for (const status of selectionOrder.slice(0, 2)) {
    const matches = candidates.filter(row => row.status === status);
    const preferred = matches.find(row => row.grade === 'primary') ?? matches[0];
    if (preferred) return preferred;
  }

  if (!calculation) return {
    status: 'emergency_research_needed',
    grade: null,
    label: 'emergency research needed',
    speed: null,
    observation_ids: [],
    qualification: variant.open,
  };

  const loading = observations.get(calculation.loading_observation_id);
  const mass = loading?.values[calculation.mass_field];
  const area = calculation.wing_area_m2 ?? loading?.values.wing_area_m2;
  const clMax = calculation.cl_max;
  if (![mass, area, clMax].every(positive) || !calculation.cl_max_source) {
    throw Error('Invalid clean-stall calculation inputs for ' + variant.id);
  }

  const gravity = 9.80665;
  const density = 1.225;
  const value = Math.round(3.6 * Math.sqrt(2 * mass * gravity / (density * area * clMax)));
  return {
    status: 'calculated',
    grade: 'calculated',
    speed: { value, unit: 'km/h', basis: 'EAS', range: null },
    observation_ids: [loading.id],
    source_aircraft: loading.aircraft,
    conditions: { gear: 'up', flaps: 'up', power: 'off (assumed)', load_factor_g: 1 },
    calculation: {
      method: 'clean 1g lift balance',
      mass_kg: mass,
      mass_field: calculation.mass_field,
      wing_area_m2: area,
      wing_area_source: calculation.wing_area_source ?? loading.id,
      cl_max: clMax,
      cl_max_source: calculation.cl_max_source,
      reference_density_kg_m3: density,
      gravity_m_s2: gravity,
    },
    qualification: calculation.qualification,
  };
}

module.exports = { selectionOrder, selectCleanStall };
