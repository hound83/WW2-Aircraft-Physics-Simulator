'use strict';

const {
  LB, FT, G, round, loadScaledCasKnots, liftEasMps, ratioSpeed, effectiveAreaRatio, excessPowerKw,
} = require('./fighter-evidence-methods.cjs');
const us = require('./fighter-evidence-other.cjs');
const german = require('./fighter-evidence-german.cjs');

const ids = records => records.map(o => o.id);

// IAS stays on its own axis. The calibration ratio is an explicit sensitivity input.
function indicatedMassCurve(api, { aircraft, id, title, note, anchor, records, anchorMass, anchorSpeed, weights, unit, speedUnit, calibration = 0.02, includeAnchor = true }) {
  const [light, heavy] = anchorMass;
  const central = (light + heavy) / 2;
  const points = weights.map(weight => api.point(weight, ratioSpeed(anchorSpeed, weight / central), 'scenario', [
    ratioSpeed(anchorSpeed, weight / heavy, 1 - calibration),
    ratioSpeed(anchorSpeed, weight / light, 1 + calibration),
  ]));
  if (includeAnchor) {
    if (light !== heavy || weights.includes(central)) throw Error('A historical IAS anchor requires one exact mass outside the target list');
    points.push(api.point(central, anchorSpeed, 'primary'));
  }
  api.chart({
    aircraft, id, title, x: 'Gross weight (' + unit + ')', y: 'Conditional indicated speed (' + speedUnit + ')', note,
    series: [{
      label: 'Fixed geometry, conditional indicated-speed scaling',
      points: points.sort((a, b) => a[0] - b[0]),
      observations: ids([anchor, ...records]),
      limits: 'Square-root scaling in EAS for fixed effective lift coefficient. Shown on the original indicated scale under a stable proportional calibration assumption, varied by ±' + 100 * calibration + '%. Shading also spans the stated anchor-mass assumption. Near-stall position error remains open.',
    }],
  });
}

function defineFighters(api) {
  const { select, one, chart, table, credit, compare, interpolation, climb, point, extent } = api;

  {
    const aircraft = 'f4u4_80765';
    const anchor = one('US20', v => v.configuration === 'clean' && v.power === 'off');
    const cas = anchor.values.stall_speed;
    const clean = 'corsair-clean-lift';
    chart({
      aircraft, id: clean, title: 'Clean power-off lift limit with load factor',
      x: 'Normal load factor (g)', y: 'Calibrated airspeed (kt)',
      note: '12,500 lb, BuNo 80765. The measured 1 g CAS anchors the curve. Exact stall pressure altitude is unreported. The projected values describe lift onset, with the same airframe and power-off configuration.',
      series: [{
        label: 'BuNo 80765, clean power off',
        observations: [anchor.id],
        limits: 'CAS → EAS → load scaling → CAS at the same ISA pressure altitude. Central case 2,500 ft, bracket 0–5,000 ft. Transfer of effective maximum lift is varied up to ±5% from 2 g onward.',
        points: [point(1, cas, 'primary'), ...[1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3].map(n => {
          const fraction = 0.05 * Math.min(1, n - 1);
          const cases = [0, 5000].flatMap(alt => [1 - fraction, 1 + fraction].map(c => loadScaledCasKnots(cas, alt, n, c)));
          return point(n, loadScaledCasKnots(cas, 2500, n), 'scenario', extent(cases, 6));
        })],
      }],
    });
    credit(aircraft, 'sustained_turn_drag', 2, [clean], 'Adds a source-anchored instantaneous lift boundary with altitude and coefficient sensitivity. Sustained performance remains open.');

    const climbRows = select('f4u4-normal-military-climb', v => v.alt_ft === 0);
    const normal = climbRows.find(o => o.values.power === 'normal');
    const military = climbRows.find(o => o.values.power === 'military');
    const power = o => excessPowerKw(12500 * LB, o.values.roc_fpm * FT / 60);
    table({
      aircraft, id: 'corsair-sea-level-power', title: 'Net climb power under the two Navy ratings',
      columns: ['Rating', 'Climb (ft/min)', 'Nominal net climb power (kW)'],
      rows: [normal, military].map(o => [o.values.power, o.values.roc_fpm, round(power(o), 1)]),
      observations: ids(climbRows),
      note: 'BIS 2157 Plate 4 specifies 12,500 lb gross. Sea-level differences quantify the change in net climb power. Different power schedules and climb speeds can change both thrust and drag.',
    });
    credit(aircraft, 'installed_engine_prop_cooling', 1, ['corsair-sea-level-power'], 'Adds a same-altitude net-power comparison at the two original ratings.');
  }

  {
    const aircraft = 'p51b_4324777';
    const own = one('US02', v => v.power === 'off' && v.gear === 'up' && v.flaps === 'up' && v.oil_shutter === 'closed');
    const open = one('US02', v => v.power === 'off' && v.gear === 'up' && v.flaps === 'up' && v.oil_shutter === 'open');
    const earlier = one('US01', v => v.power === 'off' && v.gear === 'up' && v.flaps === 'up' && v.oil_shutter === 'closed');
    indicatedMassCurve(api, {
      aircraft, id: 'mustang-stall-mass', title: 'Clean power-off stall with gross weight',
      note: '43-24777, 86 mph indicated at 9,270 lb, oil and coolant shutters closed. Target weights are scenario loads. The powered and open-shutter tests are separate.',
      anchor: own, records: [], anchorMass: [own.values.weight_lb, own.values.weight_lb], anchorSpeed: own.values.speed_mph,
      weights: [8900, 9000, 9100, 9200, 9350, 9450, 9550, 9680], unit: 'lb', speedUnit: 'mph',
    });
    credit(aircraft, 'stall_and_actual_mass', 2, ['mustang-stall-mass'], 'Adds narrow same-specimen IAS sensitivity from an actual stall mass, with a separate calibration assumption.');
    for (const [id, other, conditions] of [
      ['mustang-shutter-check', open, 'Same specimen with oil and coolant shutters opened. Raw indication and shutter position can both influence the residual.'],
      ['mustang-b5-check', earlier, 'Independent Wright Field B-5 specimen 43-6883. Weight is approximate and IAS installation equivalence is unresolved.'],
    ]) {
      compare({
        aircraft, id, title: 'Mass-only stall adjustment compared with ' + (other === open ? 'open shutters' : 'P-51B-5'),
        kind: other === open ? 'same-airframe configuration difference' : 'independent report, condition mismatch',
        unit: 'mph IAS (conditional)', predicted: ratioSpeed(own.values.speed_mph, other.values.weight_lb / own.values.weight_lb),
        reported: other.values.speed_mph, observations: [own.id, other.id], conditions,
      });
    }

    const speed = select('S37', v => v.map_inhg === 75);
    const pairs = speed.filter(o => !o.values.racks).map(clean => ({
      clean, rack: speed.find(o => o.values.racks && o.values.alt_ft === clean.values.alt_ft),
    }));
    table({
      aircraft, id: 'mustang-rack-area', title: 'Effective drag-area change from wing racks',
      columns: ['Height (ft)', 'Clean TAS (mph)', 'Racks TAS (mph)', 'Area increase (%)', 'Sensitivity (%)'],
      rows: pairs.map(({ clean, rack }) => {
        const a = clean.values.speed, b = rack.values.speed;
        return [clean.values.alt_ft, a, b, round(100 * (effectiveAreaRatio(a, b) - 1), 1),
          extent([0.97 * effectiveAreaRatio(a - 0.5, b + 0.5), 1.03 * effectiveAreaRatio(a + 0.5, b - 0.5)].map(r => 100 * (r - 1)), 1).join(' to ')];
      }),
      observations: ids(speed),
      note: '15 May 1944, 75 inHg, 3,000 rpm. Match height, engine rating and gear per pair. Derived total effective area ratio assumes equal propulsive power. Sensitivity varies the power ratio by ±3% and speeds by ±0.5 mph. Includes induced drag and installation effects.',
    });
    credit(aircraft, 'sustained_turn_drag', 3, ['mustang-rack-area'], 'Adds three condition-matched relative installed-drag constraints with power-ratio sensitivity.');
  }

  {
    const aircraft = 'f6f3_04776';
    const coefficients = select('f6f3-04776-naca-corrected-peak-cn', v => ['clean-glide', 'landing'].includes(v.condition));
    const loads = select('f6f3-04776-naca-three-loading-conditions');
    const traces = select('f6f3-04776-early-stall-traces', v => ['glide', 'landing'].includes(v.condition));
    const area = 334 * FT ** 2;
    const speed = (weightLb, cn) => liftEasMps(weightLb * LB, area, cn) / 0.44704;
    const estimate = (weight, coefficient) => speed(weight, (coefficient.cn_min + coefficient.cn_max) / 2);
    chart({
      aircraft, id: 'hellcat-weight-lift', title: 'Power-off clean and landing lift envelopes',
      x: 'Gross weight (lb)', y: 'Equivalent airspeed (mph)',
      note: 'NACA’s fuel-corrected normal-force coefficients for BuAer 04776. Gross weights bracket Part I’s reported test loading range. The chart holds coefficient and geometry fixed inside each envelope. CG varied in the source loads.',
      series: coefficients.map(o => ({
        label: o.values.condition + ' at 1 g',
        observations: ids([o, ...loads]),
        limits: 'Normal-force coefficient used as an effective lift coefficient at 1 g, with a 334 ft² wing. The band spans NACA’s stated coefficient range. These are calculated EAS values at target masses.',
        points: [10600, 10800, 11000, 11200, 11400, 11500].map(weight => point(
          weight, estimate(weight, o.values), 'calculated',
          [speed(weight, o.values.cn_max), speed(weight, o.values.cn_min)],
        )),
      })),
    });
    credit(aircraft, 'sustained_turn_drag', 3, ['hellcat-weight-lift'], 'Adds two force-based lift boundaries with measured coefficient ranges for the exact specimen.');
    for (const coefficient of coefficients) {
      const trace = traces.find(o => o.values.condition === (coefficient.values.condition === 'clean-glide' ? 'glide' : 'landing'));
      compare({
        aircraft, id: 'hellcat-' + trace.values.condition + '-scale', title: 'NACA ' + trace.values.condition + ' trace scale',
        kind: 'same-program different speed basis', unit: 'mph (EAS vs indicated trace)',
        predicted: estimate(trace.values.takeoff_weight_lb, coefficient.values), reported: trace.values.figure_speed_mph,
        observations: ids([coefficient, trace]),
        conditions: 'Comparison at documented departure mass. Fuel burn, differing speed basis and event timing limit interpretation. Same test program.',
      });
    }
  }

  {
    const aircraft = 'spitfire_lfix_bs543';
    const records = select('S03');
    const bands = [
      [2000, 7000, 'M.S. +18 psi', 50],
      [7000, 12000, 'M.S. above full-throttle height', 80],
      [14000, 18000, 'F.S. +18 psi', 50],
      [18000, 40000, 'F.S. above full-throttle height', 130],
    ];
    chart({
      aircraft, id: 'spitfire-climb-branches', title: 'Merlin 66 climb by blower branch',
      x: 'Pressure altitude (ft)', y: 'Rate of climb (ft/min)',
      note: 'BS543, 3,000 rpm, radiator open, A&AEE Table II. Break at the 13,000-ft blower change. The table’s boost and flight-speed schedules are retained within each branch.',
      series: bands.map(([from, to, label, gate], index) => interpolation({
        aircraft, id: 'spitfire-climb-' + index, label, records: records.filter(o => o.values.alt_ft >= from && o.values.alt_ft <= to),
        x: 'alt_ft', y: 'roc', reading: 25, gate,
      })),
    });
    const high = records.filter(o => o.values.alt_ft >= 20000 && o.values.alt_ft <= 30000);
    const timing = climb({
      aircraft, id: 'spitfire-climb-time', label: 'BS543, 20,000–30,000 ft', records: high,
      height: 'alt_ft', rate: 'roc', reading: 50, timeReading: 0,
    });
    chart({
      aircraft, id: 'spitfire-climb-time', title: 'High-blower elapsed climb estimate',
      x: 'Pressure altitude (ft)', y: 'Time above 20,000 ft (s)',
      note: 'Condition held to the Table II high-blower schedule, +15.8 to +6.6 psi. The published timing is an internal check from the same report.',
      series: [timing],
    });
    compare({
      aircraft, id: 'spitfire-published-band', title: 'BS543, 20,000 to 30,000 ft published elapsed',
      kind: 'same-report rate vs elapsed', unit: 's', predicted: timing.points.at(-1)[1], reported: (8.4 - 4.75) * 60,
      tolerance: 6, observations: ids(high),
      conditions: 'Published Table II times indexed in references/climb-band-evidence.json. No timing input used in integrating the rates.',
    });
    table({
      aircraft, id: 'spitfire-net-climb-power', title: 'Merlin 66 net power above level flight',
      columns: ['Height (ft)', 'Blower', 'Boost (psi)', 'Climb (ft/min)', 'Net climb power (kW), 95–100% departure mass'],
      rows: records.map(o => {
        const v = o.values;
        const upper = excessPowerKw(7485 * LB, v.roc * FT / 60);
        return [v.alt_ft, v.alt_ft < 13000 ? 'M.S.' : 'F.S.', v.boost_psi, v.roc, extent([0.95 * upper, upper], 1).join(' to ')];
      }),
      observations: ids(records),
      note: 'Uses the recorded 7,485 lb departure mass as the high scenario. The report used 95% of departure mass for its level-speed reductions. That fraction is a sensitivity case for climb, whose pointwise mass is unreported.',
    });
    credit(aircraft, 'installed_engine_prop_cooling', 1, ['spitfire-net-climb-power', 'spitfire-published-band'], 'Adds a blower-specific net-power envelope and a consistent rate-integral check at reported combat settings.');
  }

  us(api, indicatedMassCurve);
  german(api, indicatedMassCurve);
}

module.exports = defineFighters;
