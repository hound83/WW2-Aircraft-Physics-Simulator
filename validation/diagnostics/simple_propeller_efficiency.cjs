'use strict';

const M = require('../../src/physics.js');
const { HP, LBF, FPM_PER_MPS, round } = require('./propeller_efficiency_sweep.cjs');
const p47 = require('../../references/p47b-measured-climb-v33.json');
const p38 = require('../../references/p38g-42-12687.json');
const fw190 = require('../../references/fw190a4-783.json');
const { thunderboltProduction } = require('../../references/independent-flight-checks.json');

const MPH = .44704;
const DEFAULT_ETA = .8;
const CURTISS_MILITARY_CLIMB_ETA = .76;
const CURTISS_HIGH_TIP = [[.979, DEFAULT_ETA], [1.035, CURTISS_MILITARY_CLIMB_ETA]];
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const span = values => [Math.min(...values), Math.max(...values)];

function directFlightCheck(data, catalog, evidence) {
  const rows = new Map(catalog.observations.map(row => [row.id, row]));
  const groups = [
    ...evidence.primary_series.filter(group => group.id.startsWith('p47c-') || group.id === 'p47d-hamilton-standard-climb-coefficients'),
    {
      id: 'p47c-high-speed',
      observations: catalog.observations.filter(row => row.id.startsWith('ww2_propeller_efficiency_2026-11-11:p47c-high-speed:')).map(row => row.id),
    },
  ];
  const samples = groups.flatMap(group => group.observations.map(id => {
    const v = rows.get(id).values;
    const donor = group.id.startsWith('p47c') ? 'p47c' : 'p47d';
    const condition = group.id.includes('high-speed') ? 'high-speed' : v.rating ??
      (group.id === 'p47c-military-165' ? 'military' : 'normal');
    return { id, donor, condition, J: v.advance_ratio, Cp: v.power_coefficient, tipMach: v.tip_mach, eta: v.efficiency };
  }));
  samples.push(...evidence.p47d_high_speed.rows.map(row => ({
    id: 'NACA L5G09a Table II ' + row.run, donor: 'p47d', condition: 'high-speed',
    J: row.J, Cp: row.Cp, tipMach: row.tip_mach, eta: row.eta,
  })));

  const geometry = data.models.p47b.ac.propGeometry;
  const air = M.isa(0);
  function currentEta(row) {
    // Reconstruct a state with the recorded dimensionless J, Cp and tip Mach.
    const diameter = (row.donor === 'p47c' ? 12 + 2 / 12 : 12 + 10 / 12) * .3048;
    const n = row.tipMach * air.a / (diameter * Math.hypot(Math.PI, row.J));
    const tas = row.J * n * diameter / MPH;
    const bhp = row.Cp * air.rho * n ** 3 * diameter ** 5 / HP;
    const ac = { propGeometry: { ...geometry, diameterFt: diameter / .3048, reductionRatioEnginePerProp: 2 } };
    return M.propEta(ac, 0, tas, bhp, 'P', 'flight-test', { engineRpmOverride: n * 120 }).eta;
  }
  const checked = samples.map(row => ({
    ...row, simple_eta: DEFAULT_ETA, current_eta: round(currentEta(row), 6),
  }));
  const summary = (id, rows) => ({
    id, n: rows.length, observed_eta: span(rows.map(r => r.eta)),
    mean_eta: round(mean(rows.map(r => r.eta)), 4),
    simple_mae_pp: round(mean(rows.map(r => Math.abs(r.simple_eta - r.eta))) * 100, 2),
    current_mae_pp: round(mean(rows.map(r => Math.abs(r.current_eta - r.eta))) * 100, 2),
  });
  return {
    method: 'The 80% constant comes from Greg’s worksheet. Compare it and the current momentum/loss equation at each NACA test’s J, Cp and helical tip Mach. The two reports have separate installations.',
    curtiss_military_climb_reference_mae_pp: round(mean(checked.filter(row => row.donor === 'p47c' && row.condition === 'military')
      .map(row => Math.abs(CURTISS_MILITARY_CLIMB_ETA - row.eta))) * 100, 2),
    summaries: [
      summary('all retained direct flight readings', checked),
      summary('Curtiss military climb', checked.filter(row => row.donor === 'p47c' && row.condition === 'military')),
      summary('Curtiss normal climb', checked.filter(row => row.donor === 'p47c' && row.condition === 'normal')),
      summary('Hamilton climb', checked.filter(row => row.donor === 'p47d' && row.condition !== 'high-speed')),
      summary('fast flight, J 1.55–2.15 and tip Mach 0.94–1.02', checked.filter(row =>
        row.condition === 'high-speed' && row.J >= 1.55 && row.J <= 2.15 && row.tipMach >= .94 && row.tipMach <= 1.02)),
      summary('fast flight, tip Mach above 1.02', checked.filter(row => row.condition === 'high-speed' && row.tipMach > 1.02)),
    ],
    rows: checked,
  };
}

function levelCases(data, evidence) {
  const rows = {};
  for (const id of ['spitfire_lfix_bs543', 'bf109f4', 'p47b', 'p51b']) {
    const { ac } = data.models[id];
    const { calibration } = ac;
    rows[id] = ac.observedSpeed.flatMap(o => {
      const shaft = M.shaftPower(ac, o.altFt, o.rating, o.gear);
      if (!shaft) return [];
      return [{
        altFt: o.altFt, tasMph: o.mphTas, weightLb: ac.weightLb, rating: o.rating, gear: o.gear,
        bhp: shaft.bhp, rpm: shaft.engineRpm ?? ac.propGeometry.engineRpmByRating?.[o.rating] ?? data.specification.aircraft[id].baseRpm,
        anchor: calibration.altFt === o.altFt && calibration.tasMph === o.mphTas && calibration.rating === o.rating,
        role: 'source checkpoint',
      }];
    });
  }
  rows.fw190a4 = fw190.speed.rows.flatMap(([altM, kmh, role]) => {
    const altFt = altM / .3048, tasMph = kmh / 1.609344;
    const { ac } = data.models.fw190a4;
    const shaft = M.ratedInletPower(ac, altFt, tasMph, 'combat', 'auto', 'rated-inlet');
    return shaft ? [{
      altFt, tasMph, weightLb: ac.weightLb, rating: 'combat', gear: shaft.gear,
      bhp: shaft.bhp, rpm: shaft.engineRpm, anchor: altM === 0, role,
    }] : [];
  });
  rows.p38g = p38.level.map(([altFt, tasMph, bhp, weightLb, , role]) => ({
    altFt, tasMph, bhp, weightLb, rating: 'level', gear: 'turbo', rpm: p38.engineRpm,
    anchor: role === 'drag-anchor', role,
  }));
  rows.f4u4 = evidence.equivalent_efficiency.level.find(group => group.aircraft === 'f4u4').rows.map(row => ({
    altFt: row.alt_ft, tasMph: row.tas_mph, bhp: row.shaft_hp_per_engine, weightLb: row.weight_lb,
    rating: row.power, gear: 'test', rpm: row.rpm, anchor: row.alt_ft === 0 && row.power === 'normal',
    role: 'chart power checkpoint', observation: row.observation, chartHpSpan: row.shaft_chart_hp_span,
  }));
  return rows;
}

function dragAt(model, row, cd0) {
  return M.dragBreakdown(model.ac, row.altFt, row.tasMph, row.weightLb, cd0, model.benchmarkPolar.e);
}

function fitCleanDrag(model, anchor) {
  const unit = dragAt(model, anchor, 1);
  const shaftHp = (model.ac.engineCount ?? 1) * anchor.bhp;
  return (DEFAULT_ETA * shaftHp - unit.inducedHp) / unit.parasiteHp;
}

function levelSpeed(model, row, cd0, profile) {
  const { altFt, rating, gear, bhp, rpm, weightLb } = row;
  const ac = {
    ...model.ac,
    propGeometry: {
      ...model.ac.propGeometry,
      ...(model.benchmarkReductionRatio && { reductionRatioEnginePerProp: model.benchmarkReductionRatio }),
      engineRpmByRating: { [rating]: rpm },
    },
    powerRatings: { [rating]: { gears: { [gear]: [{ altFt, bhp, engineRpm: rpm }] } } },
  };
  const polar = { ...model.benchmarkPolar, cd0 };
  const flightEnvelope = profile === 'P' ? model.options.flightEnvelope : undefined;
  return M.maxSpeed(ac, altFt, { profile, polar, rating, gear, weightLb, flightEnvelope });
}

function curtissLevelSpeed(model, row, cd0) {
  const [[lowMach, lowEta], [highMach, highEta]] = CURTISS_HIGH_TIP;
  const n = row.rpm / model.benchmarkReductionRatio / 60;
  const tip = Math.PI * n * model.ac.propGeometry.diameterFt * .3048;
  const sound = M.isa(row.altFt).a;
  const balance = tasMph => {
    const tipMach = Math.hypot(tip, tasMph * MPH) / sound;
    const fraction = Math.max(0, Math.min(1, (tipMach - lowMach) / (highMach - lowMach)));
    const eta = lowEta + fraction * (highEta - lowEta);
    return eta * row.bhp - dragAt(model, { ...row, tasMph }, cd0).requiredHp;
  };
  // The report-conditioned level points are all on the high-speed crossing.
  let low = 250, high = 550;
  if (balance(low) < 0 || balance(high) > 0) return null;
  for (let i = 0; i < 34; i++) {
    const mid = (low + high) / 2;
    if (balance(mid) > 0) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function errors(rows, select = () => true) {
  const check = rows.filter(row => select(row) && Number.isFinite(row.current) && Number.isFinite(row.simple));
  const mae = key => check.length ? round(mean(check.map(row => Math.abs(row[key] - row.observed))), 2) : null;
  return { count: check.length, current_mae: mae('current'), simple_mae: mae('simple') };
}

function levelChecks(data, evidence) {
  return Object.entries(levelCases(data, evidence)).map(([aircraft, rows]) => {
    const model = data.models[aircraft];
    const anchor = rows.find(row => row.anchor);
    if (!anchor) throw Error('Missing clean drag reference for ' + aircraft);
    const cd0 = fitCleanDrag(model, anchor);
    if (!(cd0 > 0)) throw Error('Invalid inferred drag for ' + aircraft);
    const checks = rows.map(row => {
      const requiredHp = dragAt(model, row, cd0).requiredHp;
      return {
        ...row, observed: row.tasMph,
        current: round(levelSpeed(model, row, model.benchmarkPolar.cd0, 'P'), 3),
        simple: round(levelSpeed(model, row, cd0, 'A'), 3),
        implied_eta_at_reference_drag: round(requiredHp / (row.bhp * (model.ac.engineCount ?? 1)), 6),
        ...(row.chartHpSpan && { chart_reading_eta_at_reference_drag: row.chartHpSpan.toReversed().map(bhp => round(requiredHp / bhp, 6)) }),
        ...(aircraft === 'p47b' && { same_blade_curve: round(curtissLevelSpeed(model, row, cd0), 3) }),
      };
    });
    return { aircraft, cd0: round(cd0, 8), current_cd0: model.benchmarkPolar.cd0, e: model.benchmarkPolar.e, anchor,
      summary_mph: errors(checks, row => !row.anchor && !row.role.includes('inlet anchor')),
      ...(aircraft === 'p47b' && { same_blade_curve_mph: errors(checks.map(row => ({ ...row, simple: row.same_blade_curve })), row => !row.anchor) }),
      ...(aircraft === 'p51b' && { low_blower_mph: errors(checks, row => !row.anchor && row.gear === 'low' && row.rating === '67inHg') }),
      ...(aircraft === 'spitfire_lfix_bs543' && { low_blower_mph: errors(checks, row => !row.anchor && row.gear === 'low' && row.altFt <= 10800) }),
      rows: checks };
  });
}

function thunderboltLevelTransfer(data, levels) {
  const model = data.models.p47b;
  const cd0 = levels.find(row => row.aircraft === 'p47b').cd0;
  const { level, weightLb, rpm, url } = thunderboltProduction;
  const rows = level.map(([altFt, bhp, observed]) => {
    const point = { altFt, tasMph: observed, bhp, rpm, weightLb, rating: 'military', gear: 'turbo' };
    return { ...point, observed, current: round(levelSpeed(model, point, model.benchmarkPolar.cd0, 'P'), 3),
      simple: round(curtissLevelSpeed(model, point, cd0), 3) };
  });
  return { source: url, specimen: '41-5942', summary_mph: errors(rows), rows };
}

function climbAt(model, row, cd0, eta, areaM2) {
  const drag = dragAt(model, row, cd0);
  const shaftHp = row.bhp * (model.ac.engineCount ?? 1);
  const areaHp = drag.q * row.tasMph * MPH / HP;
  const fpmPerHp = HP * FPM_PER_MPS / (row.weightLb * LBF);
  const fpm = (eta * shaftHp - drag.requiredHp - areaM2 * areaHp) * fpmPerHp;
  return { fpm, areaToMatch: (fpm - row.observed) / (fpmPerHp * areaHp) + areaM2 };
}

function climbChecks(data, levels) {
  const p38Baseline = require('./p38g.cjs').run();
  const rows = {
    p47b: data.flightChecks.find(group => group.id === 'p47b').rows.map(row => ({
      ...row, current: row.after, candidateAnchor: row.altFt === 10000,
      eta: row.rpm === 2700 ? CURTISS_MILITARY_CLIMB_ETA : DEFAULT_ETA,
    })),
    spitfire_lfix_bs543: data.flightChecks.find(group => group.id === 'spitfire_lfix_bs543').rows.map(row => ({
      ...row, current: row.after, candidateAnchor: row.altFt === 10000, eta: DEFAULT_ETA, bhp: row.afterState.bhp,
    })),
    p38g: p38Baseline.climbs.map(row => ({
      altFt: row.altFt, tasMph: row.tasMph, observed: row.observedFpm, current: row.twinFpm, role: row.role,
      candidateAnchor: row.role === 'cooling-anchor', weightLb: p38.takeoffWeightLb, eta: DEFAULT_ETA, bhp: row.bhpPerEngine,
    })),
  };
  const checks = Object.entries(rows).map(([aircraft, source]) => {
    const model = data.models[aircraft];
    const level = levels.find(row => row.aircraft === aircraft);
    const anchor = source.find(row => row.candidateAnchor);
    const requiredAreaM2 = climbAt(model, anchor, level.cd0, anchor.eta, 0).areaToMatch;
    const areaM2 = Math.max(0, requiredAreaM2);
    const replay = source.map(({ altFt, tasMph, bhp, weightLb, eta, current, observed, role, candidateAnchor }) => {
      const point = { altFt, tasMph, bhp, weightLb, observed };
      return { ...point, eta, current: round(current, 2), simple: round(climbAt(model, point, level.cd0, eta, areaM2).fpm, 2),
        role, candidateAnchor };
    });
    return { aircraft, fitted_area_m2: round(areaM2, 6), unconstrained_anchor_area_m2: round(requiredAreaM2, 6),
      anchor_alt_ft: anchor.altFt, shared_check_fpm: errors(replay, row => row.role === 'check' && !row.candidateAnchor), rows: replay };
  });

  const thunderbolt = data.flightChecks.find(group => group.id === 'p47b-41-5942');
  const cd0 = levels.find(row => row.aircraft === 'p47b').cd0;
  const area = checks.find(row => row.aircraft === 'p47b').fitted_area_m2;
  const independentRows = thunderbolt.rows.map(row => {
    const point = { altFt: row.altFt, tasMph: row.tasMph, bhp: row.bhp, weightLb: thunderboltProduction.weightLb, observed: row.observed };
    return { ...point, current: round(row.after, 2),
      simple: round(climbAt(data.models.p47b, point, cd0, CURTISS_MILITARY_CLIMB_ETA, area).fpm, 2) };
  });
  return { same_airframe: checks, p47b_independent_airframe: {
    source: thunderboltProduction.url, summary_fpm: errors(independentRows), rows: independentRows,
  } };
}

function lightningPartPower(data, evidence, levels) {
  const source = evidence.equivalent_efficiency.level.find(group => group.aircraft === 'p38g').rows;
  const altitudes = [...new Set(source.map(row => row.alt_ft))];
  const model = data.models.p38g;
  const cd0 = levels.find(row => row.aircraft === 'p38g').cd0;
  return altitudes.map(altFt => {
    const rows = source.filter(row => row.alt_ft === altFt).sort((a, b) => a.shaft_hp_per_engine - b.shaft_hp_per_engine);
    const checks = rows.map((row, i) => {
      const lower = rows[i - 1], upper = rows[i + 1];
      const bhp = row.shaft_hp_per_engine;
      const caseRow = { altFt, bhp, tasMph: row.tas_mph, weightLb: row.weight_lb, rpm: row.rpm, rating: 'level', gear: 'turbo' };
      const predicted = lower && upper ? lower.tas_mph + (upper.tas_mph - lower.tas_mph) *
        (bhp - lower.shaft_hp_per_engine) / (upper.shaft_hp_per_engine - lower.shaft_hp_per_engine) : null;
      return {
        observation: row.observation, bhp_per_engine: bhp, rpm: row.rpm, weight_lb: row.weight_lb,
        observed: row.tas_mph, useful_power_hp_at_reference_eta: round(2 * bhp * DEFAULT_ETA, 2),
        current: round(levelSpeed(model, caseRow, model.benchmarkPolar.cd0, 'P'), 3),
        simple_fixed_polar: round(levelSpeed(model, caseRow, cd0, 'A'), 3),
        simple: round(predicted, 3),
      };
    });
    return { alt_ft: altFt, leave_one_out_mph: errors(checks), rows: checks };
  });
}

function workingReference(data, catalog, evidence) {
  const level = levelChecks(data, evidence);
  return {
    date: '2026-11-12',
    test_base: { version: '4.9.0-rc.2', commit: '2863e95a9fc0f571c7f5078f5ebedd3d12c82019' },
    reference_values: {
      grade: 'calculated',
      baseline_eta: DEFAULT_ETA, p47b_military_climb_eta: CURTISS_MILITARY_CLIMB_ETA,
      p47b_military_climb_donor_span: span(evidence.equivalent_efficiency.p47b.rows.filter(row => row.rpm === 2700)
        .flatMap(row => row.donor_alternatives.map(donor => donor.eta))),
      rule: 'Use 80% as the fixed shaft-to-useful-power starting value. At the documented Curtiss 714 P-47B military climb condition, use 76% and one fixed open-cooling drag area.',
      basis: '80% is Greg’s provisional constant. 76% rounds the average of the three close military-climb matches to NACA L4L07 at 5000, 10000 and 12600 ft. Values transferred to another installation are calculated reference inputs.',
      p47b_military_level_tip_mach_eta: CURTISS_HIGH_TIP,
      p47b_military_level_basis: 'The high-load Curtiss runs 24-5 and 24-2 give 0.801 and 0.759. The 41-5902 level checks support holding the rounded 0.76 through its high-altitude test points. Interpolate within the two nodes and hold the nearest endpoint over the checked P-47B domain.',
      constant_level_cases: [
        { aircraft: 'f4u4', conditions: '80765 clean level, Normal and Military chart conditions' },
        { aircraft: 'p51b', conditions: '43-24777, wing racks fitted, 67 inHg, low blower, 0–10300 ft' },
        { aircraft: 'spitfire_lfix_bs543', conditions: 'BS.543, radiator shutters closed, +18 lb, low blower, 0–10800 ft' },
      ],
    },
    flight_efficiency: directFlightCheck(data, catalog, evidence),
    level_method: 'Condition both calculations on the same shaft power and weight. The 80% model sets one clean drag coefficient from the designated speed anchor. The other rows check the transfer. Induced drag uses the existing geometry and e.',
    level,
    p47b_independent_level: thunderboltLevelTransfer(data, level),
    climb_method: 'Hold the 80% level drag reference and fit one nonnegative added drag area at the named climb anchor. In the P-47B military replay use the 76% same-blade transfer. Test on the common rows excluded from the older fit and the separate P-47B airframe.',
    climb: climbChecks(data, level),
    p38g_part_power: {
      method: 'Interpolate within each original level speed versus chart BHP series, using adjacent remaining points to check each held-out interior point. Original RPM, mass and BHP are retained. Useful power is conditional on the 80% reference value.',
      cases: lightningPartPower(data, evidence, level),
    },
  };
}

module.exports = { workingReference };
