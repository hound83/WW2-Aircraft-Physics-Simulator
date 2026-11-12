'use strict';

const fwReport = require('../references/fw190a4-783.json');
const p38Report = require('../references/p38g-42-12687.json');
const scorecardPath = 'references/analysis/ww2_matched_climb_scorecard_2026-11-12.json';
const scorecard = require('../' + scorecardPath);

const fwArchive = 'ww2_german_fighter_archive_2026-11-11:';
const fwEngine = 'ww2_engine_ratings_and_propeller_2026-11-12:';
const supplement = 'ww2_flight_case_climb_2026-11-12:';
const idAt = (series, i) => series + ':' + String(i + 1).padStart(4, '0');
const seconds = minutes => Math.round(minutes * 600) / 10;

function climbReference(observations, charts) {
  const ids = [];
  function original(id) {
    const row = observations.get(id);
    if (!row) throw Error('Missing matched climb observation ' + id);
    ids.push(id);
    return { observation_id: id, ...row.values };
  }

  const seaLevel = original(idAt(supplement + 'fw190a4-783-open-climb-sea-level', 0));
  const fwPairs = Array.from({ length: 10 }, (_, i) => original(idAt(fwArchive + 'a4-783-open-and-closed-climb', i)));
  const fwTiming = charts.find(chart => chart.id === 'a4-timed-cooling-climb');
  const fwOpen = fwTiming.series[0].points;
  const fwTail = fwOpen.at(-1);
  const [fitAltitude, fitOpen, fitClosed] = fwReport.climb.rows.find(row => row[3] === 'cooling-anchor');
  const fwRows = [seaLevel, ...fwPairs].map(row => {
    const altM = row.barometric_altitude_m;
    const timing = fwOpen.find(point => point[0] === altM && point[4] === 'primary');
    const replay = fwReport.climb.rows.find(point => point[0] === altM);
    return {
      observation_id: row.observation_id, altitude_m: altM,
      open_rate_m_s: row.open_roc_mps_approx, closed_rate_m_s: row.closed_roc_mps_approx ?? null,
      open_chart_time_min: row.open_elapsed_min_approx ?? null,
      open_elapsed_from_1000_m_s: timing?.[1] ?? null,
      existing_replay_open_rate_m_s: replay?.[1] ?? null,
      role: altM === fitAltitude ? 'cooling-fit-anchor' : 'same-report-reserved',
    };
  });

  const p38Rows = p38Report.climb.map(([alt, tas, bhp, rate, elapsed, map, role], i) => {
    const row = original(i === 7 ? idAt(supplement + 'p38g-12687-b4-35000ft', 0) : idAt('balanced-2026-11-10:BS02', i));
    if (row.alt_ft !== alt || row.climb_tas_mph !== tas || row.bhp_each !== bhp ||
        row.roc_fpm !== rate || row.time_min !== elapsed || row.mp_inhg !== map) {
      throw Error('Wright Field B.4 data disagrees with the checked report at ' + alt + ' ft');
    }
    const reportedLimit = {
      20000: p38Report.reportedLimits.climb20000And25000Ft,
      25000: p38Report.reportedLimits.climb20000And25000Ft,
      30000: p38Report.reportedLimits.climb30000Ft,
      35000: p38Report.reportedLimits.climb35000Ft,
    }[alt];
    return {
      ...row, elapsed_from_sea_level_s: seconds(elapsed), limiting_factor: reportedLimit ?? null,
      role: role === 'cooling-anchor' ? 'cooling-fit-anchor' : 'same-report-reserved',
    };
  });

  return {
    use: 'Source-conditioned replay and data lookup. Identical reports share lineage across all transcriptions.',
    replay_scorecard: { path: scorecardPath, baseline_commit: scorecard.baseline_commit,
      qualification: 'Fixed-mass diagnostic using the same reports and their published input bounds.' },
    cases: [
      {
        id: 'fw190a4-783-nr1-climb', aircraft: 'fw190a4_783',
        source: { url: fwReport.url, locator: 'Flugbericht 190/783 Nr. 1, Kurvenblatt 2', chart_url: fwReport.climb.url,
          chart_sha256: fwReport.climb.sha256, grade: 'primary', method: 'digitized-chart' },
        conditions: {
          engine: 'BMW 801 D-2/20208', intake: 'long external', cooling: ['open', 'closed'],
          takeoff_mass_kg: 3870, gross_mass_by_altitude: null, rating: 'Combat', engine_rpm: 2400,
          rated_manifold_ata: 1.32, reported_manifold_drop_height_m: 6100,
        },
        altitude_domain_m: [0, 10000],
        chart_reading_allowance: { rate_m_s: fwReport.climb.readingToleranceMps, open_time_min: 0.25 },
        reported_climb_tas: null,
        estimated_climb_tas: {
          grade: 'calculated', unit: 'mph', basis: 'TAS',
          method: scorecard.fw190.estimated_tas_basis,
          rows: scorecard.fw190.rate_rows.map(row => ({
            altitude_m: row.altitude_m, tas_mph: row.after_tas_mph_estimate, sensitivity_mph: row.tas_sensitivity_mph,
          })),
        },
        replay_summary: {
          open_rate_checks_fpm: scorecard.fw190.same_eight_rate_checks,
          open_time_from_1000_m_to_9000_m_s: scorecard.fw190.timing_bands.at(-1),
        },
        rows: fwRows,
        climb_manifold_points: fwReport.boost.rows.map((_, i) => original(idAt(fwEngine + 'a4-783-boost-by-flight-phase', i))),
        service_ceilings: [0, 1].map(i => original(idAt(fwArchive + 'a4-783-cooling-climb-ceiling', i))),
        cooling_fit: {
          grade: 'calculated', area_m2: 0.1712229990138041, altitude_m: fitAltitude,
          modeled_fit_tas_mph: 192, open_rate_m_s: fitOpen, closed_rate_m_s: fitClosed,
          observation_id: fwRows.find(row => row.altitude_m === fitAltitude).observation_id,
          formula: 'Equivalent area = (closed rate − open rate) × weight / (0.5 × ISA density × TAS³).',
          qualification: 'The existing fit uses the alternate reading of the same graph and modeled climb TAS. The area represents aggregate installed loss.',
          replay: 'validation/diagnostics/fw190a4.cjs',
        },
        elapsed_time: {
          start_altitude_m: 1000, last_source_altitude_m: 9000, closed_chart_time: null,
          normalized_chart_allowance_s: 30, chart_id: fwTiming.id,
          calculated_open_tail: { altitude_m: fwTail[0], elapsed_from_1000_m_s: fwTail[1],
            range_s: [fwTail[2], fwTail[3]], grade: 'calculated', method: 'integration of the source vertical-rate curve' },
        },
        open_research: ['Actual climb TAS and mass at altitude', 'Installed shaft power around the blower transition',
          'Specimen propeller blade drawing and direct useful propeller power'],
      },
      {
        id: 'p38g-12687-b4-climb', aircraft: 'p38g_4212687',
        source: { url: p38Report.url, locator: 'Wright Field FS-M-19-1538-A §A and §B.4', sha256: p38Report.sha256,
          grade: 'primary', method: 'reported-table' },
        conditions: {
          ...p38Report.installation, takeoff_weight_lb: p38Report.takeoffWeightLb, gross_weight_by_altitude: null,
          rating: 'Wright Field B.4 Military test schedule', engine_rpm: p38Report.engineRpm,
          coolant_shutters: 'wide open', oil_cooler_shutters: 'wide open', gear: 'up', wing_flaps: 'neutral', mixture: 'auto-rich',
        },
        altitude_domain_ft: [0, 35000],
        tas_basis: 'reported TAS (mph)',
        shaft_power_basis: 'Average BHP per engine assigned from engine power curves',
        replay_summary: {
          reserved_steady_rate_mae_fpm: scorecard.p38g.seven_reserved_rate_checks_mae_fpm,
          time_from_sea_level_to_20000_ft_s: scorecard.p38g.timing_bands.find(row => row.altitude === 20000),
        },
        interpolation: 'Linear between B.4 altitude nodes. Keep B.1 level points and the two ceiling rows outside the climb schedule.',
        elapsed_time: { start_altitude_ft: 0, units_as_reported: 'min', resolution_min: 0.01, flight_test_uncertainty_s: null },
        rows: p38Rows,
        ceiling_rows: [0, 1].map(i => original(idAt(supplement + 'p38g-12687-b4-ceilings', i))),
        separate_b1_level_observation_ids: p38Report.level.map((_, i) => original(idAt('balanced-2026-11-10:BS01', i)).observation_id),
        open_research: ['Instantaneous climb loading and fuel burn', 'Direct shaft and propulsive-power measurements',
          'Independent matched B.4 climb replay'],
      },
    ],
    observation_ids: ids,
  };
}

module.exports = { climbReference };
