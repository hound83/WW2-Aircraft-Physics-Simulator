'use strict';

const { MPH, FT, LB, G, round, ratioSpeed, effectiveAreaRatio, levelDragN, physics } = require('./fighter-evidence-methods.cjs');
const ids = records => records.map(o => o.id);

module.exports = function defineOtherFighters(api, indicatedMassCurve) {
  const { select, one, chart, table, credit, compare, interpolation, climb, point, extent } = api;

  {
    const aircraft = 'p47b_415902';
    const records = select('BS07');
    const branches = [
      ['Military, 2,700 rpm / 2,000 bhp', records.filter(o => o.values.rpm === 2700)],
      ['Rated, 2,550 rpm / 1,625 bhp', records.filter(o => o.values.rpm === 2550 && o.values.bhp === 1625)],
    ];
    chart({
      aircraft, id: 'p47b-climb-branches', title: 'Military and rated climb branches',
      x: 'Pressure altitude (ft)', y: 'Rate of climb (ft/min)',
      note: 'Wright Field 41-5902. At 12,600 ft the source reports 2,410 ft/min on military power and 1,800 ft/min at rated power. The 35,000-ft turbo-limited point has its own lower shaft power.',
      series: branches.map(([label, records], index) => interpolation({
        aircraft, id: 'p47b-roc-' + index, label, records, x: 'alt_ft', y: 'roc_fpm', reading: 25, gate: 100,
      })),
    });
    chart({
      aircraft, id: 'p47b-climb-times', title: 'Elapsed time derived from the separate climb schedules',
      x: 'Pressure altitude (ft)', y: 'Time from first point on branch (s)',
      note: 'Each branch starts at its own lower altitude. The first rated-power altitude is 12,600 ft. The published first rated-power point has no separate cumulative time.',
      series: branches.map(([label, records], index) => climb({
        aircraft, id: 'p47b-elapsed-' + index, label, records, height: 'alt_ft', rate: 'roc_fpm', elapsed: 'time_min',
        reading: 25, timeReading: 3,
      })),
    });
    const cooling = select('p47b-cooling-flap-speed');
    const ref = cooling.find(o => o.values.oil_flaps === 'neutral' && o.values.intercooler_flaps === 'neutral');
    const a = ref.values.speed_tas_mph;
    table({
      aircraft, id: 'p47b-cooling-area', title: 'Cooling-flap effective drag area relative to neutral',
      columns: ['Oil flaps', 'Intercooler flaps', 'TAS (mph)', 'Effective area change (%)', 'Sensitivity (%)'],
      rows: cooling.map(o => {
        const v = o.values, b = v.speed_tas_mph;
        const central = o === ref ? 0 : 100 * (effectiveAreaRatio(a, b) - 1);
        const bounds = o === ref ? [0, 0] : [0.97 * effectiveAreaRatio(a - 0.5, b + 0.5), 1.03 * effectiveAreaRatio(a + 0.5, b - 0.5)].map(x => 100 * (x - 1));
        return [v.oil_flaps, v.intercooler_flaps, b, round(central, 1), extent(bounds, 1).join(' to ')];
      }),
      observations: ids(cooling),
      note: '5,000 ft, 1,605 torque-meter bhp, 2,700 rpm. Equal propulsive power central estimate, ±3% sensitivity and ±0.5 mph source rounding. Effective total drag area includes lift and installation effects.',
    });
    credit(aircraft, 'sustained_turn_drag', 3, ['p47b-cooling-area'], 'Adds direct matched-power constraints on effective installation drag for distinct cooling settings.');
  }

  {
    const aircraft = 'p38g_4212687';
    const all = select('p38g-part-power-level');
    const bands = [5000, 24400];
    chart({
      aircraft, id: 'p38g-part-power-speed', title: 'Level speed on Wright Field part-power schedules',
      x: 'Shaft power per engine (chart bhp)', y: 'True airspeed (mph)',
      note: '42-12687, gear up, wing flaps neutral, cooling flaps faired. RPM and gross weight change with chart power. Each altitude is a separate measured schedule.',
      series: bands.map(alt => interpolation({
        aircraft, id: 'lightning-power-' + alt, label: alt.toLocaleString('en-US') + ' ft',
        records: all.filter(o => o.values.alt_ft === alt), x: 'chart_bhp_per_engine', y: 'speed_tas_mph', reading: 1, gate: 8,
      })),
    });
    const ratio = (v, eta, shaftFactor, massFactor) => v.estimated_gross_lb * LB * G * massFactor /
      levelDragN(v.speed_tas_mph, 2 * v.chart_bhp_per_engine * shaftFactor, eta);
    function ratios(v) {
      return [ratio(v, 0.85, 1.05, 0.98), ratio(v, 0.775, 1, 1), ratio(v, 0.70, 0.95, 1.02)];
    }
    const note = 'Quasi-steady level flight, L/D = W·V/(η·2·BHP). η = 0.70–0.85, chart shaft power ±5%, reported estimated weight ±2%. Analyst sensitivity ranges. Efficiency can vary with speed and RPM, so the curve gives conditional operating points.';
    chart({
      aircraft, id: 'p38g-effective-ld', title: 'Effective lift-to-drag ratio at the reported operating points',
      x: 'True airspeed (mph)', y: 'Effective L/D', note,
      series: bands.map(alt => {
        const records = all.filter(o => o.values.alt_ft === alt);
        return {
          label: alt.toLocaleString('en-US') + ' ft, faired cooling', observations: ids(records), limits: note,
          points: records.map(o => {
            const [lo, mid, hi] = ratios(o.values);
            return point(o.values.speed_tas_mph, mid, 'scenario', [lo, hi]);
          }).sort((a, b) => a[0] - b[0]),
        };
      }),
    });
    table({
      aircraft, id: 'p38g-part-power-drag', title: 'Thirteen speed, power and effective drag constraints',
      columns: ['Height (ft)', 'TAS (mph)', 'RPM', 'Total chart bhp', 'Estimated weight (lb)', 'Drag (kN), sensitivity', 'L/D, sensitivity'],
      rows: all.map(o => {
        const v = o.values, power = 2 * v.chart_bhp_per_engine;
        return [v.alt_ft, v.speed_tas_mph, v.rpm, power, v.estimated_gross_lb,
          extent([levelDragN(v.speed_tas_mph, 0.95 * power, 0.7), levelDragN(v.speed_tas_mph, 1.05 * power, 0.85)].map(n => n / 1000), 2).join(' to '),
          extent(ratios(v), 2).join(' to ')];
      }),
      observations: ids(all), note,
    });
    credit(aircraft, 'sustained_turn_drag', 4, ['p38g-part-power-drag', 'p38g-part-power-speed'], 'Adds source-matched flight drag and L/D envelopes at two altitudes, limited by assumed installed efficiency.');
  }

  {
    const aircraft = 'p40f_4113635';
    const pairs = select('S43');
    const prop = select('p40f-five-props-climb', v => ['89301-3', '89303-24W', '89306-19S'].includes(v.propeller_original_print));
    chart({
      aircraft, id: 'p40f-standard-spinner-climb', title: 'Climb with the three standard-spinner propellers',
      x: 'Pressure altitude (ft)', y: 'Rate of climb (ft/min)',
      note: '41-13635, same test airframe, one trace per propeller. The test’s airspeed and chart BHP schedule are retained by propeller. Other tests with a special spinner are outside this comparison.',
      series: [...new Set(prop.map(o => o.values.propeller_original_print))].map(propeller => interpolation({
        aircraft, id: 'p40f-prop-' + propeller, label: propeller,
        records: prop.filter(o => o.values.propeller_original_print === propeller),
        x: 'alt_ft', y: 'roc_fpm', reading: 15, gate: 70,
      })),
    });
    chart({
      aircraft, id: 'p40f-brace-area', title: 'Effective drag-area increase with empty belly braces',
      x: 'Braces removed TAS (mph)', y: 'Effective drag-area increase (%)',
      note: '41-13635, 18,100 ft, high blower. Empty braces versus removed braces. Same chart bhp and RPM within each pair. The pairs cover a range of power and propeller operating points.',
      series: [{
        label: 'Empty braces, paired level runs', observations: ids(pairs),
        limits: 'Equal propulsive power central case. Bounds vary the propulsive power ratio by ±3% and each speed by ±0.5 mph.',
        points: pairs.map(o => {
          const a = o.values.tas_braces_removed, b = o.values.tas_with_empty_braces;
          return point(a, 100 * (effectiveAreaRatio(a, b) - 1), 'scenario', [
            100 * (0.97 * effectiveAreaRatio(a - 0.5, b + 0.5) - 1),
            100 * (1.03 * effectiveAreaRatio(a + 0.5, b - 0.5) - 1),
          ]);
        }).sort((a, b) => a[0] - b[0]),
      }],
    });
    credit(aircraft, 'sustained_turn_drag', 4, ['p40f-brace-area', 'p40f-standard-spinner-climb'], 'Adds seven same-power installation drag constraints and an altitude-resolved comparison across three documented props.');
  }

  {
    const aircraft = 'ki84_302';
    const stall = one('KI84-302-1');
    const loading = one('ki84-302-mass-basis-discrepancy');
    indicatedMassCurve(api, {
      aircraft, id: 'ki84-clean-indicated-mass', title: 'Captured 302, clean power-off weight sensitivity',
      note: 'U.S. T-2 clean stall at 8,000 ft, 102 mph indicated. Actual mass at the break is missing. The worked case varies anchor mass from 95–100% of the 7,900 lb test gross. Scenario target masses 7,400–8,400 lb.',
      anchor: stall, records: [loading], anchorMass: [0.95 * stall.values.weight_lb, stall.values.weight_lb], anchorSpeed: stall.values.speed_mph,
      weights: [7400, 7550, 7700, 7850, 8000, 8200, 8400], unit: 'lb', speedUnit: 'mph', includeAnchor: false,
    });
    credit(aircraft, 'stall_and_actual_mass', 1, ['ki84-clean-indicated-mass'], 'Adds a documented exact-airframe sensitivity band with a separately stated anchor-weight and calibration scenario.');
    const turn = one('ki84-302-observed-turn-abort-not-sustained');
    const v = turn.values;
    const bankLoad = 1 / Math.cos(v.estimated_bank_degrees * Math.PI / 180);
    const hypothetical = ratioSpeed(stall.values.speed_mph, bankLoad);
    compare({
      aircraft, id: 'ki84-bank-load-check', title: 'Bank angle versus approximate reported load',
      kind: 'level-turn geometry consistency', unit: 'g', predicted: bankLoad, reported: v.estimated_g,
      observations: [turn.id], conditions: 'A 60-degree bank implies about 2 g in a coordinated level turn. The pilot also estimated 3 g. Turn geometry and altitude hold are unestablished.',
    });
    table({
      aircraft, id: 'ki84-turn-threshold', title: 'Conditional lift boundary versus buffet and abort',
      columns: ['Case', 'Speed (mph, indicated scale)', 'Basis'],
      rows: [
        ['60° coordinated level turn, 2 g', round(hypothetical, 1), 'Calculated, clean/off reference with fixed coefficient and proportional IAS calibration'],
        ['3 g pilot estimate', round(ratioSpeed(stall.values.speed_mph, v.estimated_g), 1), 'Same assumptions, separate load scenario'],
        ['Buffet begins below', v.buffet_starts_below_ias_mph, 'Reported IAS'],
        ['Turn discontinued', v.turn_discontinued_ias_mph, 'Reported IAS'],
      ],
      observations: [stall.id, turn.id],
      note: 'Power, true normal force, instantaneous mass, speed retention and flight path were unspecified in the turn. The comparison shows why it cannot constrain maximum sustained turn rate.',
    });

    const handbook = select('ki84-pacmirs-full-power-climb', v => v.alt_m <= 8000);
    const time = climb({
      aircraft, id: 'ki84-handbook-time', label: 'Japanese handbook, military schedule', records: handbook,
      height: 'alt_m', rate: 'roc_m_s', elapsed: 'elapsed_seconds_from_printed_min_sec', metric: true,
      reading: 0.25, timeReading: 3, assumed: true,
    });
    chart({
      aircraft, id: 'ki84-handbook-time', title: 'Japanese handbook climb schedule consistency',
      x: 'Height (m)', y: 'Time above 1,000 m (s)',
      note: 'Captured Japanese operating document translated as PACMIRS No. 8. No corresponding serial 302 climb test is documented. Rate and elapsed rows are compared on the original published variable-boost schedule. The unresolved 9,000 m boost entry is outside the analysis.',
      series: [time, {
        label: 'Published elapsed, handbook', observations: ids(handbook),
        points: handbook.map(o => point(o.values.alt_m, o.values.elapsed_seconds_from_printed_min_sec - handbook[0].values.elapsed_seconds_from_printed_min_sec, 'documentary')),
      }],
    });
    credit(aircraft, 'independent_speed_climb', 1, ['ki84-handbook-time'], 'Adds a qualified period family-level climb schedule and a numerical consistency check. The exact captured aircraft remains without a completed climb trial.');
  }

  {
    const aircraft = 'p47d30_433441';
    const records = select('d30-steady-turn-control');
    const area = one('d30-longitudinal-installation');
    const documentedMass = select('p47d30-433441-stall-traces');
    const weights = documentedMass.map(o => o.values.gross_weight_lb);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const mid = (min + max) / 2;
    const pair = records.filter(o => o.values.direction === 'left').map(left => ({
      left, right: records.find(o => o.values.direction === 'right' && o.values.altitude_ft === left.values.altitude_ft &&
        Math.abs(o.values.labeled_speed_mph - left.values.labeled_speed_mph) <= 1),
    }));
    table({
      aircraft, id: 'p47d30-turn-pair-check', title: 'Left/right steady-turn control compatibility',
      columns: ['Speed label left/right (mph)', 'Height (ft)', 'Right/left normal-force coefficient', 'Right minus left elevator up (°)'],
      rows: pair.map(({ left, right }) => {
        const l = left.values, r = right.values;
        return [l.labeled_speed_mph + '/' + r.labeled_speed_mph, l.altitude_ft,
          round(r.normal_force_coefficient / l.normal_force_coefficient),
          round(r.elevator_up_deg - l.elevator_up_deg, 1)];
      }),
      observations: ids(records),
      note: 'Matched in label within 1 mph, altitude and CG. Fig. 25 reading allowance ±0.02 coefficient and ±0.2° elevator per marker. The lowest-speed pair shows the largest elevator offset. These are control points, with speed-basis, thrust and sustained limit unresolved.',
    });
    const g = (v, weight, cn, basis) => {
      const a = physics.resolveAirspeed(v.labeled_speed_mph, basis, v.altitude_ft);
      return 0.5 * 1.225 * (a.eas * MPH) ** 2 * area.values.wing_area_ft2 * FT ** 2 * cn / (weight * LB * G);
    };
    chart({
      aircraft, id: 'p47d30-turn-load-cases', title: 'Conditional normal load in the NACA turn-control trials',
      x: 'Figure 25 speed label (mph)', y: 'Inferred normal load (g)',
      note: 'Separate interpretations of the unqualified speed label for left turns. Gross-weight brackets use the same airframe’s separate longitudinal stall trials (' + min + '–' + max + ' lb). Each point uses its own reported altitude, between 6,500 and 7,500 ft. Actual turn mass and speed channel are unresolved.',
      series: ['CAS', 'TAS'].map(basis => ({
        label: 'If the speed label is ' + basis, observations: ids([...records, area, ...documentedMass]),
        limits: 'ISA dynamic pressure, q·S·Cₙ/W. Bounds vary Cₙ by ±0.02 and weight over the separate stall-test loadings. IAS would require separate calibration.',
        points: pair.map(({ left }) => {
          const v = left.values, cn = v.normal_force_coefficient;
          return point(v.labeled_speed_mph, g(v, mid, cn, basis), 'scenario',
            [g(v, max, cn - 0.02, basis), g(v, min, cn + 0.02, basis)]);
        }),
      })),
    });
    credit(aircraft, 'sustained_turn_drag', 2, ['p47d30-turn-pair-check', 'p47d30-turn-load-cases'], 'Adds matched directional comparisons and bounded load interpretations for a documented control trial.');
  }
};
