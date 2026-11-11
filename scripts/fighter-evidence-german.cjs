'use strict';

const { round, climbSeconds, liftEasMps, excessPowerKw } = require('./fighter-evidence-methods.cjs');
const ids = records => records.map(o => o.id);

module.exports = function defineGermanFighters(api, indicatedMassCurve) {
  const { select, one, chart, table, credit, compare, interpolation, climb, point, extent } = api;

  {
    const aircraft = 'fw190a4_783';
    const rows = select('a4-783-open-and-closed-climb');
    const last = rows.at(-1);
    const join = rows.at(-2);
    const start = rows[0];
    const elapsed = (o, base) => (o.values.open_elapsed_min_approx - base.values.open_elapsed_min_approx) * 60;
    const openTime = o => climbSeconds(last.values.barometric_altitude_m - join.values.barometric_altitude_m,
      join.values.open_roc_mps_approx + o, last.values.open_roc_mps_approx + o);
    climb({
      aircraft, id: 'a4-open-climb', label: 'Open cooling flaps', records: rows,
      height: 'barometric_altitude_m', rate: 'open_roc_mps_approx', elapsed: 'open_elapsed_min_approx', metric: true,
      reading: 0.35, timeReading: 30,
    });
    const closed = climb({
      aircraft, id: 'a4-closed-climb', label: 'Closed cooling flaps, integrated from rate', records: rows,
      height: 'barometric_altitude_m', rate: 'closed_roc_mps_approx', metric: true,
      reading: 0.35, timeReading: 0,
    });
    chart({
      aircraft, id: 'a4-timed-cooling-climb', title: 'Open and closed cooling flaps, elapsed climb',
      x: 'Barometric altitude (m)', y: 'Time above 1,000 m (s)',
      note: 'WNr 783, 2,400 rpm, 3,870 kg takeoff, long external intakes. The open-flap source time ends at 9,000 m. The dotted tail starts at that exact point and uses the same configuration’s recorded climb rates to reach 10,000 m.',
      series: [{
        label: 'Open flaps, digitized source then calculated tail', observations: ids(rows), solidHistory: true,
        limits: 'Time read to ±0.25 min per point, with the uncertainty of the 1,000 m baseline propagated. The 9–10 km tail adds rate sensitivity of ±0.35 m/s. Closed-flap timing uses the rate curve throughout.',
        points: [
          ...rows.slice(0, -1).map(o => point(o.values.barometric_altitude_m, elapsed(o, start), 'primary',
            o === start ? [0, 0] : [elapsed(o, start) - 30, elapsed(o, start) + 30])),
          point(last.values.barometric_altitude_m, elapsed(join, start) + openTime(0), 'calculated',
            [elapsed(join, start) - 30 + openTime(0.35), elapsed(join, start) + 30 + openTime(-0.35)]),
        ],
      }, closed],
    });
    table({
      aircraft, id: 'a4-cooling-net-power', title: 'Nominal climb-power difference between cooling settings',
      columns: ['Height (m)', 'Open (m/s)', 'Closed (m/s)', 'Closed minus open (kW)', 'Sensitivity (kW)'],
      rows: rows.map(o => {
        const v = o.values, delta = v.closed_roc_mps_approx - v.open_roc_mps_approx;
        return [v.barometric_altitude_m, v.open_roc_mps_approx, v.closed_roc_mps_approx, round(excessPowerKw(3870, delta), 1),
          extent([excessPowerKw(0.95 * 3870, delta - 0.7), excessPowerKw(3870, delta + 0.7)], 1).join(' to ')];
      }),
      observations: ids(rows),
      note: 'Net rate difference times nominal weight. Bounds span 95–100% of the recorded takeoff mass and independent ±0.35 m/s read windows. Cooling can affect thrust as well as drag.',
    });
    credit(aircraft, 'sustained_turn_drag', 3, ['a4-cooling-net-power', 'a4-timed-cooling-climb'], 'Adds paired cooling-state net-power constraints and estimates a missing elapsed-time interval.');
  }

  {
    const aircraft = 'fw190d9_210002';
    const rates = select('d9-210002-3000rpm-combat-climb');
    const time = climb({
      aircraft, id: 'd9-time-reconstruction', label: 'Integrated climb rates', records: rates,
      height: 'barometric_altitude_m', rate: 'climb_rate_mps_approx', elapsed: 'elapsed_min_approx', metric: true,
      reading: 0.5, timeReading: 54,
    });
    chart({
      aircraft, id: 'd9-time-reconstruction', title: 'WNr 210002 elapsed climb, factory plot versus integration',
      x: 'Barometric altitude (m)', y: 'Time above 1,000 m (s)',
      note: '3,000 rpm, 4,300 kg departure, ETC 504, intake-side flap flush and others open. Through 8,000 m only. The 9,000 m radiator setting change and the 4,100 kg level run are separate conditions.',
      series: [{
        label: 'Factory elapsed trace', observations: ids(rates), solidHistory: true,
        limits: '±0.45 min read allowance at each altitude, propagated against the common 1,000 m reading.',
        points: rates.map((o, i) => {
          const time = (o.values.elapsed_min_approx - rates[0].values.elapsed_min_approx) * 60;
          return point(o.values.barometric_altitude_m, time, 'primary', i ? [time - 54, time + 54] : [0, 0]);
        }),
      }, time],
    });
    table({
      aircraft, id: 'd9-climb-power', title: 'Nominal net climb power in the 3,000 rpm configuration',
      columns: ['Height (m)', 'Rate (m/s)', 'Net power (kW)', 'Sensitivity (kW)'],
      rows: rates.map(o => {
        const v = o.values, rate = v.climb_rate_mps_approx;
        return [v.barometric_altitude_m, rate, round(excessPowerKw(4300, rate), 1),
          extent([excessPowerKw(0.95 * 4300, rate - 0.5), excessPowerKw(4300, rate + 0.5)], 1).join(' to ')];
      }),
      observations: ids(rates),
      note: 'Weight times recorded climb rate. Sensitivity to a 0–5% weight reduction from departure and the ±0.5 m/s chart window. Net climb power includes both thrust and aerodynamic drag. The separate 4,100 kg level trial supplies no climb mass.',
    });
    const cooling = select('d9-006-radiator-speed');
    const shut = cooling.find(o => o.values.flap_position_tenths === 0);
    const optimal = cooling.find(o => o.values.flap_position_tenths === 3);
    const full = cooling.find(o => o.values.flap_position_tenths === 10);
    table({
      aircraft, id: 'd9-cooling-tradeoff', title: 'D-9 family cooling-setting differences at Rechlin',
      columns: ['Change', 'Reported Vw difference (km/h)', 'Chart-reading sensitivity (km/h)'],
      rows: [[shut, optimal, 'Shut to 3/10'], [shut, full, 'Shut to fully open'], [optimal, full, '3/10 to fully open']].map(([a, b, label]) => {
        const d = b.values.speed_vw_kmh - a.values.speed_vw_kmh;
        return [label, d, [d - 4, d + 4].join(' to ')];
      }),
      observations: ids([shut, optimal, full]),
      note: 'Rechlin WNr 210006, 2,000 m, 2,700 rpm, empty external tank. Vw retained as printed. Reading allowance ±2 km/h per point. The test provides a separate installation tradeoff, with transfer to WNr 210002 unresolved.',
    });
    credit(aircraft, 'sustained_turn_drag', 2, ['d9-climb-power', 'd9-time-reconstruction', 'd9-cooling-tradeoff'], 'Adds a condition-specific net-power envelope and qualifies separate D-9 radiator changes with scan bounds.');
  }

  {
    const aircraft = 'bf109f4_representative';
    const original = select('f4-original-1941-climb-time');
    const trace = interpolation({
      aircraft, id: 'f4-factory-climb', label: 'Messerschmitt November 1941', records: original,
      x: 'top_altitude_m', y: 'elapsed_min', reading: 0.05, gate: 0.45, targets: [5000],
    });
    chart({
      aircraft, id: 'f4-factory-climb', title: '1941 factory climb time under the reported schedule',
      x: 'Height (m)', y: 'Cumulative time (min)',
      note: '29 November original flight-results sheet at 2,890 kg listed loading. RPM and boost are unspecified. Interpolated values stay within the published schedule.',
      series: [trace],
    });
    const rechlin = one('f4-rechlin-matched-climb', v => v.upper_altitude_m === 5000);
    const t = x => trace.points.find(p => p[0] === x)[1];
    compare({
      aircraft, id: 'f4-rechlin-factory-1-to-5', title: 'Messerschmitt versus December Rechlin, 1,000–5,000 m',
      kind: 'independent report, condition mismatch', unit: 's',
      predicted: (t(5000) - t(1000)) * 60, reported: rechlin.values.bf109f4_time_s,
      observations: ids([...original, rechlin]),
      conditions: 'Independent original flight reports agree on elapsed time. Only the factory sheet supplies a listed mass. Boost and RPM in both reports remain unresolved, limiting power-specific validation.',
    });
    const design = one('f4-1943-wing-and-coefficients');
    const landing = one('f4-original-1941-landing');
    const { wing_area_m2: area, landing_cl_as_printed: cn, listed_flight_loading_kg: fullMass, landing_speed_kmh: designSpeed } = design.values;
    const speed = (mass, coefficient = cn) => liftEasMps(mass, area, coefficient) * 3.6;
    const loading = landing.values.landing_loading_kg;
    chart({
      aircraft, id: 'f4-landing-mass', title: 'Landing speed implied by the factory lift coefficient',
      x: 'Mass (kg)', y: 'Conditional EAS (km/h)',
      note: 'Engineering calculation from the 1943 landing coefficient and wing area. The 1941 sheet’s 135 km/h landing figure has an unresolved speed basis, so it is compared separately.',
      series: [{
        label: 'Fixed landing coefficient, weight sensitivity', observations: [design.id, landing.id],
        limits: 'Factory cA = 1.70 and S = 16.05 m². The 1.65–1.75 coefficient range is a sensitivity choice. The 2,560 and 2,890 kg source loads are reference masses within the target scenario.',
        points: [2450, 2500, loading, 2650, 2750, 2800, fullMass].map(m =>
          point(m, speed(m), 'scenario', [speed(m, cn + 0.05), speed(m, cn - 0.05)])),
      }],
    });
    for (const [id, mass, value, evidence, conditions] of [
      ['f4-1943-design-check', fullMass, designSpeed, [design.id], 'Same 1943 engineering sheet and listed gross weight. Checks arithmetic and convention only.'],
      ['f4-1941-landing-check', loading, landing.values.speed_kmh, [design.id, landing.id], 'Separate original reports. Landing regime matched broadly, with speed basis and precise flap/engine states unconfirmed.'],
    ]) {
      compare({
        aircraft, id, title: 'Landing figure compared with the factory coefficient at ' + mass + ' kg',
        kind: evidence.length === 1 ? 'same-document arithmetic' : 'independent report, condition mismatch',
        unit: 'km/h (EAS vs reported)', predicted: speed(mass), reported: value, observations: evidence, conditions,
      });
    }
    credit(aircraft, 'stall_and_actual_mass', 2, ['f4-landing-mass', 'f4-1941-landing-check'], 'Expands the earlier single landing-weight calculation to a useful range, with a separately qualified original landing observation.');
  }

  {
    const aircraft = 'bf109g2_db605a';

    const published = select('g2-mt215-cina-climb', v => v.cina_altitude_m >= 5000 && Number.isFinite(v.climb_rate_mps));
    const original = select('g2-mt215-original-upper-climb');
    const integrated = climb({
      aircraft, id: 'g2-finnish-original-time', label: 'Integrated original chart rates', records: original,
      height: 'cina_altitude_m', rate: 'climb_rate_mps', elapsed: 'elapsed_min', metric: true,
      reading: 0.5, timeReading: 24,
    });
    climb({
      aircraft, id: 'g2-finnish-table-time', label: 'Integrated prior table mapping', records: published,
      height: 'cina_altitude_m', rate: 'climb_rate_mps', elapsed: 'elapsed_min', metric: true,
      reading: 0.25, timeReading: 6, assumed: true,
    });
    chart({
      aircraft, id: 'g2-finnish-climb-time', title: 'Finnish MT-215 climb time and transcription discrepancy',
      x: 'CINA altitude (m)', y: 'Time above 5,000 m (s)',
      note: 'WNr 14783, actual 2,540 rpm from the trial narrative, thermostatic radiator, first fully open at 2,500 m. The original chart is plotted alongside its rate integral and the separately retained earlier HTML table mapping.',
      series: [{
        label: 'Digitized original p. 16, curve 2', solidHistory: true, observations: ids(original),
        limits: '±0.2 min reading allowance per point, propagated against the 5,000 m reading.',
        points: original.map((o, i) => {
          const time = (o.values.elapsed_min - original[0].values.elapsed_min) * 60;
          return point(o.values.cina_altitude_m, time, 'primary', i ? [time - 24, time + 24] : [0, 0]);
        }),
      }, integrated, {
        label: 'Prior HTML table mapping, elapsed', observations: ids(published),
        limits: 'The high-altitude rate and time columns disagree with the primary graph. Column alignment remains unresolved in the absence of the original table.',
        points: published.map(o => point(o.values.cina_altitude_m, (o.values.elapsed_min - published[0].values.elapsed_min) * 60, 'secondary')),
      }],
    });
    chart({
      aircraft, id: 'g2-finnish-climb-rate', title: 'Finnish MT-215 upper climb-rate anchors',
      x: 'CINA altitude (m)', y: 'Climb rate (m/s)',
      note: 'The digitized original graph takes precedence above 5,000 m. The earlier HTML table mapping is shown for comparison. Both sources describe the same trial.',
      series: [{
        label: 'Digitized original p. 16, curve 1', solidHistory: true, observations: ids(original),
        limits: 'Visual reading of the original m/s axis, ±0.5 m/s.',
        points: original.map(o => point(o.values.cina_altitude_m, o.values.climb_rate_mps, 'primary',
          [o.values.climb_rate_mps - 0.5, o.values.climb_rate_mps + 0.5])),
      }, {
        label: 'Prior HTML table mapping, rate', observations: ids(published),
        limits: 'Original column alignment and last two altitude entries unresolved. The lower trace reflects the prior transcription mapping.',
        points: published.map(o => point(o.values.cina_altitude_m, o.values.climb_rate_mps, 'secondary')),
      }],
    });
    const oldTop = published.at(-1);
    const originalTop = original.at(-1);
    compare({
      aircraft, id: 'g2-original-10km-roc', title: 'Original chart versus prior table mapping at 10,000 m',
      kind: 'same-test source conflict', unit: 'm/s', predicted: originalTop.values.climb_rate_mps,
      reported: oldTop.values.climb_rate_mps, observations: [originalTop.id, oldTop.id],
      conditions: 'Direct read of the original chart replaces the prior table mapping for this estimate. The original page-16 scan is archived in the source recovery manifest.',
    });
    const level = select('g2-mt215-speed-power-table');
    chart({
      aircraft, id: 'g2-known-setting-speed', title: 'Finnish level speed with actual 2,540 rpm',
      x: 'Corrected height (m)', y: 'Corrected TAS (km/h)',
      note: 'MT-215 WNr 14783. Uses corrected v and the recorded 1.30–1.32 ata below full-throttle height. Above the peak, a separate falling-boost branch starts at 1.19 ata. The 6,420–7,110 m gap stays open.',
      series: [
        [140, 5120, 'Near-constant boost, 1.30–1.32 ata', 9],
        [5120, 6420, 'Approaching full-throttle height, 1.30 ata', 12],
        [7110, 10100, 'Falling boost, 1.19–0.74 ata', 18],
      ].map(([from, to, label, gate], i) => interpolation({
        aircraft, id: 'g2-level-' + i, label, records: level.filter(o => o.values.corrected_altitude_m >= from && o.values.corrected_altitude_m <= to),
        x: 'corrected_altitude_m', y: 'corrected_tas_kmh', reading: 1, gate, mode: 'secondary',
      })),
    });
    const glide = one('g2-14513-minimum-controlled-speed', v => v.condition === 'glide' && v.flaps === 'up');
    const weighing = one('g2-14513-weighing-and-cg', v => v.condition === 'control_and_speed_loss_forward');
    const fuel = one('g2-14513-measured-loading');
    indicatedMassCurve(api, {
      aircraft, id: 'g2-clean-control-speed-mass', title: 'Captured 14513 flaps-up glide minimum control speed',
      note: '180 km/h reported indicated, captured WNr 14513 with underwing gun pods. Starting load 3,235 kg. Sensitivity assumes 0–150 kg of the 300 kg fuel was consumed. Actual break mass, other configuration details and near-stall calibration are open.',
      anchor: glide, records: [weighing, fuel], anchorMass: [weighing.values.mass_kg - fuel.values.fuel_kg / 2, weighing.values.mass_kg],
      anchorSpeed: glide.values.indicated_kmh, weights: [3000, 3050, 3100, 3150, 3200, 3250, 3300],
      unit: 'kg', speedUnit: 'km/h', includeAnchor: false,
    });
    credit(aircraft, 'stall_and_actual_mass', 2, ['g2-clean-control-speed-mass'], 'Adds a minimum-control-speed sensitivity constrained by same-specimen weight and fuel inventory. The separate Finnish aircraft retains its own condition set.');

    const historicalDrag = one('me109g-hoerner-drag-budget');
    const drag = historicalDrag.values;
    const lowArea = 0.95 * drag.component_synthesis_parasite_ft2;
    const highArea = 1.05 * drag.flight_inferred_parasite_ft2;
    const coefficient = drag.induced_planform_factor / (Math.PI * drag.effective_aspect_ratio);
    const liftToDrag = (q, f) => drag.weight_lb / (q * f + coefficient * drag.weight_lb ** 2 / (q * drag.wing_area_ft2));
    const central = (drag.component_synthesis_parasite_ft2 + drag.flight_inferred_parasite_ft2) / 2;
    chart({
      aircraft, id: 'me109g-hoerner-ld', title: 'Me 109 G family high-speed lift-to-drag sensitivity',
      x: 'Dynamic pressure (lbf/ft²)', y: 'Effective L/D',
      note: 'Hoerner’s 6,700 lb, 610 km/h engineering reference. He calls the aircraft a 1944 Me 109 G and prints DB 601A. The unspecified fit and engine conflict keep this family-level estimate separate from DB 605 A G-2 trials.',
      series: [{
        label: 'Hoerner high-speed neighborhood, configuration unresolved',
        observations: [historicalDrag.id],
        limits: 'Quasi-steady level flight. Parasite area 5.6–5.8 ft² from component and flight inversions, with an extra ±5% scenario margin. Use the reported effective aspect ratio only near the source dynamic pressure. Cooling and compressibility changes are unresolved.',
        points: [170, 175, 180, drag.q_psf, 190, 195, 200].map(q => point(q, liftToDrag(q, central), 'scenario',
          [liftToDrag(q, highArea), liftToDrag(q, lowArea)])),
      }],
    });
    compare({
      aircraft, id: 'me109g-hoerner-ld-reference', title: 'Hoerner component area versus thrust-based drag estimate',
      kind: 'same-document engineering consistency', unit: 'L/D',
      predicted: liftToDrag(drag.q_psf, drag.component_synthesis_parasite_ft2),
      reported: drag.weight_lb / drag.total_drag_lbf, observations: [historicalDrag.id],
      conditions: 'Calculated with the source’s component-sum parasite area and induced term. The comparison’s thrust-derived drag uses an estimated propeller efficiency and exhaust thrust.',
    });
    credit(aircraft, 'sustained_turn_drag', 1, ['me109g-hoerner-ld'], 'Adds a bounded, family-level drag plausibility check with the unresolved engine identification retained.');

  }
};
