'use strict';

const { round, climbSeconds } = require('./fighter-evidence-methods.cjs');
const { sourcePack } = require('./fighter-engine-reference.cjs');

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

function reviewedCases(observations, { charts, checks }) {
  const cases = [];

  function add(id, aircraft, metric, unit, conditions, candidates, placement = {}) {
    cases.push({ id, aircraft, metric, unit, conditions, ...placement,
      candidates: candidates.map(row => ({ ...row, case_id: id })) });
  }

  function reading(observation, field, grade, options = {}) {
    const { allowance, scale = 1, source_unit, ...metadata } = options;
    const originalValue = observations.get(observation)?.values[field];
    const value = originalValue * scale;
    if (!Number.isFinite(value)) throw Error('Missing reviewed reading ' + observation + ' ' + field);
    return {
      id: observation + '/' + field, observation_ids: [observation], grade, value,
      method: scale === 1 ? 'original' : 'conversion', use: 'eligible',
      ...(source_unit && { original_reading: { value: originalValue, unit: source_unit } }),
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
  const power = sourcePack + ':';
  const powerCases = [
    ['g2-db605a-combat-sea-level-rating', g2, 'db605a-rated-power:0002', 'DB 605 A', 0, 2600, 1.30, null, 'Daimler-Benz B4 rating'],
    ['g2-db605a-combat-5800m-rating', g2, 'db605a-rated-power:0005', 'DB 605 A', 5800, 2600, 1.30, null, 'Daimler-Benz B4 rating'],
    ['a4-bmw801d-combat-low-gear-rating', 'fw190a4_783', 'bmw801d-rated-power:0002', 'BMW 801 D', 700, 2400, 1.32, 'low', 'Handbook full-throttle rating without ram'],
    ['a4-bmw801d-combat-high-gear-rating', 'fw190a4_783', 'bmw801d-rated-power:0006', 'BMW 801 D', 5300, 2400, 1.32, 'high', 'Handbook full-throttle rating without ram'],
  ];
  for (const [id, aircraft, key, engine, altitude, rpm, manifold, gear, scope] of powerCases) {
    const observation = power + key;
    add(id, aircraft, 'shaft_power', 'PS', {
      engine, pressure_altitude_m: altitude, rpm, manifold_ata: manifold, gear,
      rating: 'climb-combat', basis: 'manufacturer engine rating', scope,
    }, [reading(observation, 'power_ps', 'primary', { lineage: [observations.get(observation).source_id] })]);
  }

  add('a4-783-external-intake-6950m', 'fw190a4_783', 'level_speed', 'km/h TAS', {
    specimen: 'WNr 783', pressure_altitude_m: 6950, weight_at_takeoff_kg: 3870, rpm: 2400,
    rating: 'climb-combat', configuration: 'long external intake, closed split cooling flaps',
    scope: 'Focke-Wulf 783 Nr. 1. High-gear inlet anchor in the existing replay.',
  }, [reading(power + 'a4-783-long-intake-level:0007', 'tas_kmh', 'primary', { lineage: ['focke-wulf-783-nr1'] })],
  { benchmark: 'high-speed-run' });

  add('a4-783-internal-intake-6000m', 'fw190a4_783', 'level_speed', 'km/h TAS', {
    specimen: 'WNr 783', pressure_altitude_m: 6000, weight_at_takeoff_kg: 3870, rpm: 2400,
    rating: 'climb-combat', configuration: 'normal internal intake, closed split cooling flaps',
    scope: 'Focke-Wulf 783 Nr. 2. Separate installation comparison.',
  }, [reading(power + 'a4-783-internal-intake:0001', 'tas_kmh', 'primary', { lineage: ['focke-wulf-783-nr2'] })]);
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
    const productionVnk = surface === 'production' && field === 'vnk_kmh';
    add(id, g2, 'level_speed', 'km/h TAS', conditions, rows, productionVnk ? {
      benchmark: 'low-speed-run', allow_replicates: true,
      qualification: 'Four distinct airframes in one standardized WNF program. Actual RPM, mass and engine designation are unresolved.',
    } : {});
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

  const timingSlot = { benchmark: 'timed-climb' };
  const chart = id => charts.find(item => item.id === id).series[0];
  const check = id => checks.find(item => item.id === id);
  const calculated = (id, series, lineage) => ({
    id, observation_ids: series.observations, value: series.points.at(-1)[1],
    range: series.points.at(-1).slice(2, 4), method: 'integration',
    grade: 'calculated', use: 'eligible', lineage: [lineage],
  });

  const p47 = chart('p47b-climb-times'), p47Report = 'wright-field-41-5902';
  add('p47b-415902-military-elapsed', 'p47b_415902', 'elapsed_time', 's', {
    specimen: '41-5902', from_pressure_altitude_ft: 0, to_pressure_altitude_ft: 12600,
    rpm: 2700, shaft_hp: 2000, takeoff_mass_lb: 12565, cooling: 'climb flaps open',
    scope: 'Sea level to 12,600 ft at 2,000 bhp and 2,700 RPM with open climb flaps. The integral uses the rate column of the recorded climb schedule.',
  }, [
    reading(p47.observations.at(-1), 'time_min', 'primary', { scale: 60, source_unit: 'min', lineage: [p47Report] }),
    calculated('p47b-military-rate-integral', p47, p47Report),
  ], { ...timingSlot, qualification: 'Timing and integrated rates come from the same report and may share a flight.' });

  const spit = chart('spitfire-climb-time'), spitReport = 'aaee-bs543-table-ii';
  const [startTime, endTime] = require('../references/climb-band-evidence.json').spitfire.timesMin;
  add('spitfire-bs543-high-blower-elapsed', 'spitfire_lfix_bs543', 'elapsed_time', 's', {
    specimen: 'BS.543', from_pressure_altitude_ft: 20000, to_pressure_altitude_ft: 30000,
    rpm: 3000, takeoff_mass_lb: 7485, cooling: 'radiator open', blower: 'F.S.', boost_psi: [15.8, 6.6],
    scope: 'Elapsed time from the Table II entries at 20,000 ft (4.75 min) and 30,000 ft (8.4 min).',
  }, [{
    id: 'spitfire-bs543-table-ii-elapsed', observation_ids: [spit.observations[0], spit.observations.at(-1)],
    value: round((endTime - startTime) * 60), range: null, method: 'reported-interval',
    grade: 'primary', use: 'eligible', lineage: [spitReport],
  }, calculated('spitfire-bs543-rate-integral', spit, spitReport)],
  { ...timingSlot, qualification: 'Published timing and integrated rates come from the same A&AEE report.' });

  const f4 = check('f4-rechlin-factory-1-to-5');
  add('f4-factory-rechlin-1000-5000m', 'bf109f4_representative', 'elapsed_time', 's', {
    specimen: 'Bf 109 F-4, Messerschmitt and Rechlin trials', from_altitude_m: 1000, to_altitude_m: 5000,
    factory_listed_mass_kg: 2890, rechlin_mass_kg: null, rpm: null, boost_ata: null,
    scope: 'Separate original trials. The factory interval uses an interpolated 5,000 m point. Exact ratings and climb schedules cannot be matched.',
  }, [
    reading(f4.observations.at(-1), 'bf109f4_time_s', 'primary', { lineage: ['rechlin-15023-41'] }),
    { id: f4.id, observation_ids: f4.observations.slice(0, -1), value: f4.predicted, range: null,
      method: 'interpolation', grade: 'calculated', use: 'eligible', lineage: ['messerschmitt-1941-11-29'] },
  ], { ...timingSlot, qualification: 'RPM, boost, climb speed and Rechlin mass are unreported.' });

  const a4Start = open.points[0][0], a4End = 9000;
  const [, elapsed, elapsedLow, elapsedHigh] = open.points.find(point => point[0] === a4End);
  const a4Ids = open.observations.slice(0, -1), a4Report = 'focke-wulf-783-nr1';
  const a4Rates = a4Ids.map(id => observations.get(id).values);
  function a4Integral(offset) {
    return round(a4Rates.slice(1).reduce((time, row, i) => {
      const previous = a4Rates[i];
      return time + climbSeconds(row.barometric_altitude_m - previous.barometric_altitude_m,
        previous.open_roc_mps_approx + offset, row.open_roc_mps_approx + offset);
    }, 0));
  }
  add('a4-783-open-1000-9000m-time', 'fw190a4_783', 'elapsed_time', 's', {
    specimen: 'WNr 783', from_barometric_altitude_m: a4Start, to_barometric_altitude_m: a4End, rpm: 2400,
    takeoff_mass_kg: 3870, cooling: 'open flaps, long external intakes',
    scope: '1,000 to 9,000 m with open flaps at 2,400 RPM. The timing and integrated rates use this interval and cooling configuration.',
  }, [{
    id: 'a4-783-open-elapsed-interval', observation_ids: [a4Ids[0], a4Ids.at(-1)], value: elapsed,
    range: [elapsedLow, elapsedHigh], method: 'reported-interval', grade: 'primary', use: 'eligible', lineage: [a4Report],
  }, {
    id: 'a4-783-open-rate-integral', observation_ids: a4Ids, value: a4Integral(0),
    range: [a4Integral(.35), a4Integral(-.35)], method: 'integration', grade: 'calculated', use: 'eligible', lineage: [a4Report],
  }], { ...timingSlot, qualification: 'Timing and rate curves share the same factory report and test configuration.',
    curve: { chart: 'a4-timed-cooling-climb', series: 0, x: a4End } });

  const mustang = 'archival-2026-11-10:S37:0009', mustangReport = 'aaf-43-24777-44-1-fuel';
  add('p51b-4324777-clean-75in-level', 'p51b_4324777', 'level_speed', 'mph TAS', {
    specimen: '43-24777', altitude_ft: 20600, rpm: 3000, boost_inhg: 75, fuel: '44-1',
    configuration: 'wing racks removed, F.S. gear',
    scope: 'Both transcriptions show 444 mph. They list different altitudes and weight conventions and refer to the same test program.',
  }, [
    reading(mustang, 'speed', 'primary', { lineage: [mustangReport] }),
    reading('ww2_multiaxis_propulsion_trials_2026-11-10:p51b15-chart-vs-performance:0001', 'speed_mph', 'primary', {
      lineage: [mustangReport], use: 'comparison-only', reason: '20,800 ft and a different stated weight basis. Keep both original entries pending reconciliation.',
    }),
  ], { benchmark: 'high-speed-run' });

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
];

module.exports = { benchmarks, legacyCredits, reviewedCases, rejectedPairs };
