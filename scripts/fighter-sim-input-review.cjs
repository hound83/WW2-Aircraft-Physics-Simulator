'use strict';

const german = 'ww2_german_fighter_archive_2026-11-11:';
const thirteen = 'ww2_thirteen_fighter_source_recovery_2026-11-11:';
const measured = 'ww2_fighter_measured_conditions_2026-11-11:';
const twelve = 'ww2_twelve_fighter_dual_lane_2026-11-10:';
const lednicer = thirteen + 'lednicer-equivalent-flat-plate-synthesis:';

// These slots are counted once per variant, regardless of chart sample density.
// Exact source conditions are attached when a slot is populated.
const benchmarks = {
  'clean-stall': 'Clean 1 g power-off CAS or EAS at known stall mass',
  'landing-stall': 'Landing 1 g power-off CAS or EAS at known stall mass and flap setting',
  'stall-calibration': 'Matching instrument and position correction at the clean stall IAS',
  'normal-power': 'Installed normal shaft power at a documented altitude, RPM and boost',
  'combat-power': 'Installed combat shaft power at a documented altitude, RPM and boost',
  'low-speed-run': 'Level TAS at a documented altitude up to 5,000 ft and a known installed rating',
  'high-speed-run': 'Level TAS at a documented altitude above 15,000 ft and a known installed rating',
  'climb-rate': 'Climb rate at a documented mid-altitude point with matched speed, weight and rating',
  'timed-climb': 'Time through a fixed altitude interval on a matched climb schedule',
  'timed-acceleration': 'Time through a fixed speed interval at matched altitude, load and power',
  'sustained-turn': 'Steady level turn rate at a documented altitude, mass, speed and power',
  'maneuver-drag': 'Whole-airframe drag or L/D at a documented high-lift maneuver point',
};

// Conservative allocations inside the old augmented ceilings. These are
// coverage points, including partial coverage where the evidence only supports
// a contextual comparison. The referenced readings retain their source grades.
const legacyCredits = [
  ['f4u4_80765', 'stall_and_actual_mass', 'calculated', 1, twelve + 'f4u4-80765-derived-stall-vs-mass:0003',
    'Same-specimen weight scaling from the original clean CAS anchor.'],
  ['p51b_4324777', 'sustained_turn_drag', 'secondary', 1, lednicer + '0002',
    'P-51B parasite-area synthesis with unresolved cooling and serial. Partial drag context.'],
  ['spitfire_lfix_bs543', 'sustained_turn_drag', 'secondary', 1, lednicer + '0001',
    'Spitfire IX parasite-area synthesis with unresolved cooling and serial. Partial drag context.'],
  ['p47b_415902', 'sustained_turn_drag', 'calculated', 1, thirteen + 'p51b-p47b-period-drag-assumption-labels:0002',
    'Period calculated power-required context at 12,563 lb with R-2800-21. Test serial unverified.'],
  ['fw190d9_210002', 'sustained_turn_drag', 'secondary', 1, lednicer + '0004',
    'D-9 parasite-area synthesis with unresolved cooling and serial. Partial drag context.'],
  ['fw190d9_210002', 'sustained_turn_drag', 'secondary', 1, german + 'd9-210251-niivvs-timed-turn:0001',
    'Separate captured D-9 turn-duration comparison with unqualified power and energy retention.'],
  ['fw190a4_783', 'stall_and_actual_mass', 'secondary', 1, german + 'a4-niivvs-landing-speed:0001',
    'Captured A-4 landing-speed context at unknown landing mass.'],
  ['fw190a4_783', 'sustained_turn_drag', 'secondary', 1, german + 'a4-niivvs-turn-and-low-speed:0001',
    'Captured A-4 timed-turn context with configuration noted and power and speed unresolved.'],
  ['p40f_4113635', 'sustained_turn_drag', 'calculated', 3, measured + 'p40f-brace-power-equilibrium-sensitivity:0001',
    'Three-point legacy credit for the seven matched brace pairs. The later calculation covers the same installation cases.',
    'p40f-brace-area'],
  ['bf109g2_db605a', 'independent_speed_climb', 'secondary', 1, thirteen + 'g2-mt215-speed-power-table:0001',
    'Secondary time-course transcription on the known 2,540 rpm level-speed branch.'],
].map(([aircraft, dimension, grade, points, observation, reason, superseded_by]) =>
  ({ aircraft, dimension, grade, points, observation, reason, ...(superseded_by && { superseded_by }) }));

function reviewedCases(observations, charts) {
  const cases = [];

  function add(id, aircraft, metric, unit, conditions, candidates, placement = {}) {
    cases.push({ id, aircraft, metric, unit, conditions, ...placement,
      candidates: candidates.map(row => ({ ...row, case_id: id })) });
  }

  function reading(observation, field, grade, options = {}) {
    const { allowance, ...metadata } = options;
    const value = observations.get(observation)?.values[field];
    if (!Number.isFinite(value)) throw Error('Missing reviewed reading ' + observation + ' ' + field);
    return {
      id: observation + '/' + field, observation_ids: [observation], grade, value,
      method: 'original', use: 'eligible',
      range: allowance == null ? null : [value - allowance, value + allowance],
      ...metadata,
    };
  }

  const corsair = 'stall_us_2026-11-10:US20:0002';
  add('f4u4-80765-clean-1g', 'f4u4_80765', 'stall_speed', 'kt CAS', {
    specimen: 'BuNo 80765', load_factor_g: 1, weight_lb: 12500,
    configuration: 'clean, power off', pressure_altitude_ft: null,
    scope: 'BIS 2157 clean stall. The report supplies no absolute speed uncertainty for this reading.',
  }, [
    reading(corsair, 'stall_speed', 'primary', { lineage: ['bis-2157'] }),
    reading(twelve + 'f4u4-80765-derived-stall-vs-mass:0004', 'derived_cas_kt', 'calculated', {
      lineage: ['bis-2157'], method: 'mass-scaling', use: 'comparison-only',
      reason: 'The weight transfer uses the exact stall reading as its anchor.',
    }),
  ], { benchmark: 'clean-stall', curve: { chart: 'corsair-clean-lift', series: 0, x: 1 } });

  const g2 = 'bf109g2_db605a';
  const runSeries = german + 'g2-wnf-individual-timed-course-runs:';
  const course = [...observations.values()].filter(row => row.id.startsWith(runSeries));
  const allowance = observations.get(german + 'g2-wnf-sea-level-reduced-comparison:0002').values.report_absolute_tolerance_kmh_approx;
  const lineage = ['wnf-109-11-l-42'];
  for (const [surface, field, reported] of [
    ['production', 'vnk_kmh', 'archival-2026-11-10:S13:0001'],
    ['production', 'vn_kmh', null],
    ['treated', 'vnk_kmh', 'archival-2026-11-10:S13:0002'],
  ]) {
    const id = 'g2-wnf-250m-' + surface + '-' + field.split('_')[0];
    const conditions = {
      specimen: 'WNF G-2 production comparison', altitude_m: 250, atmosphere: 'standardized by report',
      normalized_manifold_kg_cm2: 1.30, normalized_blower_kg_cm2: 1.80,
      surface, normalization: field === 'vnk_kmh' ? 'Vnk, with rod correction' : 'Vn, without rod correction',
      actual_rpm: null, stall_or_flight_mass: null, reported_absolute_tolerance_kmh: allowance,
      scope: 'Relative timed-course reference. The overwritten engine designation and RPM remain unresolved.',
    };
    const rows = course.filter(row => row.values.surface_group === surface).map(row => reading(row.id, field, 'primary', {
      allowance, lineage, combine_group: id, sample_id: 'wnf-airframe-' + row.values.airframe_werknummer,
    }));
    if (reported) rows.push(reading(reported, 'mean_speed_kmh', 'primary', { allowance, lineage, method: 'reported-summary' }));
    add(id, g2, 'level_speed', 'km/h TAS', conditions, rows);
  }

  const mt215 = ['finnish-mt215-vtt-flight-trials'];
  const speed = thirteen + 'g2-mt215-speed-power-table:0001';
  const level = observations.get(speed).values;
  add('g2-mt215-140m-speed', g2, 'level_speed', 'km/h TAS', {
    specimen: 'MT-215 WNr 14783', corrected_altitude_m: level.corrected_altitude_m,
    actual_rpm: level.actual_rpm, actual_map_ata: level.actual_map_ata,
    scope: 'Corrected level-run transcription at the recorded engine setting. Separate from WNF standardization.',
  }, [reading(speed, 'corrected_tas_kmh', 'secondary', { allowance: 1, lineage: mt215 })],
  { benchmark: 'low-speed-run', curve: { chart: 'g2-known-setting-speed', series: 0, x: 140 } });

  const original = thirteen + 'g2-mt215-original-upper-climb:0006';
  const disputed = thirteen + 'g2-mt215-cina-climb:0012';
  add('g2-mt215-10000m-climb', g2, 'climb_rate', 'm/s', {
    specimen: 'MT-215 WNr 14783', cina_altitude_m: 10000, actual_rpm: 2540,
    cooling: 'thermostatic', scope: 'Original chart p. 16, curve 1, upper schedule.',
  }, [
    reading(original, 'climb_rate_mps', 'primary', { allowance: 0.5, lineage: mt215 }),
    reading(disputed, 'climb_rate_mps', 'secondary', {
      lineage: mt215, use: 'comparison-only', reason: 'Conflicting column mapping from the same flight-test program.',
    }),
  ], { curve: { chart: 'g2-finnish-climb-rate', series: 0, x: 10000 } });

  const open = charts.find(chart => chart.id === 'a4-timed-cooling-climb').series[0];
  const tail = open.points.at(-1);
  add('a4-783-open-1000-10000m-time', 'fw190a4_783', 'elapsed_time', 's', {
    specimen: 'WNr 783', from_barometric_altitude_m: 1000, to_barometric_altitude_m: 10000, rpm: 2400,
    takeoff_mass_kg: 3870, cooling: 'open flaps, long external intakes',
    scope: 'Observed elapsed time to 9,000 m plus integration of measured rates over the final interval.',
  }, [{
    id: 'a4-open-climb-calculated-tail', observation_ids: [open.observations[0], ...open.observations.slice(-2)],
    value: tail[1], range: tail.slice(2, 4), method: 'integration', grade: 'calculated', use: 'eligible',
    lineage: ['focke-wulf-783-nr1'],
  }], { benchmark: 'timed-climb', curve: { chart: 'a4-timed-cooling-climb', series: 0, x: 10000 } });

  return cases;
}

const rejectedPairs = [
  {
    observation_ids: ['archival-2026-11-10:S01:0010', 'archival-2026-11-10:S02:0001'],
    reason: 'Spitfire BS543 at 16,000 ft, 383 and 381.5 mph. Different blower and boost settings.',
  },
  {
    observation_ids: ['ww2_multiaxis_propulsion_trials_2026-11-10:p40f-five-props-level:0001',
      'ww2_multiaxis_propulsion_trials_2026-11-10:p40f-five-props-level:0002'],
    reason: 'P-40F at 18,100 ft, 355 and 356 mph. Different propellers at the same nominal altitude and power.',
  },
  {
    observation_ids: [german + 'f4-rechlin-matched-climb:0001', german + 'f4-original-1941-climb-time:0001',
      german + 'f4-original-1941-climb-time:0003', german + 'f4-original-1941-climb-time:0004'],
    reason: 'Rechlin and interpolated factory 1,000–5,000 m time both give 240 s. Weight, RPM and boost are unresolved.',
  },
];

module.exports = { benchmarks, legacyCredits, reviewedCases, rejectedPairs };
