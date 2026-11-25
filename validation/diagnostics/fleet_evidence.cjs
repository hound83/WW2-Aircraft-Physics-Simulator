'use strict';
const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const lift = require('../../references/p51-turn-lift-tn1044.json');
const { levelSpeed } = require('./aircraft_intake.cjs');
const en = require('../../references/analysis/hf-ix-en524-holdout.json');
const roll = require('../../references/analysis/fleet-roll-evidence.json');
const early = require('../../references/analysis/ww2_early_war_flight_tests_2026-11-14.json');

const metrics = ['level', 'climb', 'elapsed', 'stall', 'acceleration', 'roll'];
const round = value => Number.isFinite(value) ? Number(value.toFixed(2)) : null;
const rollLead = {
  p51b:'North American / Wright Field P-51B aileron trials',
  p47b:'Republic P-47B aileron trials at additional speeds',
  p38g:'Lockheed P-38G unboosted-wheel trials',
  f4u4:'BuAer F4U-4 service trials and lateral-control records',
  fw190a4:'WNr 783 or other instrumented A-4 lateral trials',
  bf109f4:'Rechlin F-4 lateral-control trials',
  bf109e3_1304:'RAE AE479 lateral trials and airspeed calibration',
  spitfire_va_x4922:'A&AEE X.4922 lateral trial or original aileron calibration',
  spitfire_lfix_bs543:'A&AEE full-span LF IX aileron runs',
  spitfire_hfix_bs551:'A&AEE full-span HF IX aileron runs',
  spitfire_fix_bf274:'A&AEE BF.274 lateral-control runs',
  bf109g2_db605a:'Original Finnish MT-215 handling records',
  bf109g6trop_16476:'Messerschmitt or Rechlin filtered G-6 lateral trials',
  p51d15_4415342:'Wright Field or NACA P-51D lateral-control records',
};

function previousHFModel(model) {
  const combat = model.ac.powerRatings.combat;
  return { ...model, ac: { ...model.ac, powerRatings: { ...model.ac.powerRatings,
    combat: { ...combat, gears: { ...combat.gears,
      high: combat.gears.high.map(row => ({ ...row, bhp: row.bhp / model.hfLevelFit.factor })) } } } } };
}
function replayEN524(data) {
  const id = 'spitfire_hfix_bs551', model = data.models[id], spec = data.specification.aircraft[id];
  const previous = previousHFModel(model);
  const level = en.level.map(([altFt, observed, gear, boostPsi]) => {
    const state = { altFt, rpm: en.rpm, gear, weightLb: en.levelWeightLb, scaleForRpm: false };
    const before = levelSpeed(previous, spec, state), after = levelSpeed(model, spec, state);
    return { altFt, gear, boostPsi, observed, before: round(before), after: round(after),
      error: Number.isFinite(after) ? round(after - observed) : null };
  });
  const tasSchedule = [[0, M.tasFrom(en.climb[0][3], 'CAS', 0)], ...en.climb.filter(([h]) => h <= 40000).map(([h,,,ias]) => [h, M.tasFrom(ias, 'CAS', h)])];
  const asTested = { ...spec, combat: { ...spec.combat, seconds: null, rpm: en.rpm } };
  const timed = (from, to) => {
    if (to > 40000) return null;
    const run = B.climb(M, T, lift, model, asTested, data.specification.policy,
      { mode: 'combat', fuelFraction: .5 }, from, to, { stepFt: 100, accountForTasChange: true,
        flightCase: { weightLb: en.climbWeightLb, tasSchedule } });
    return run.status === 'reached' && run.seconds > 0 ? run.seconds : null;
  };
  const climb = en.climb.map(([altFt, elapsedMin, rateFpm, iasMph, gear, boostPsi]) => {
    const from = altFt - 50, to = Math.min(altFt + 50, 40000);
    const local = altFt <= 40000 ? timed(from, to) : null, seconds = timed(0, altFt);
    const rate = local === null ? null : 60 * (to - from) / local;
    return { altFt, gear, boostPsi, iasMph, observedRate: rateFpm, rate: round(rate), observedSeconds: round(elapsedMin * 60),
      seconds: round(seconds), rateError: rate === null ? null : round(rate - rateFpm),
      secondsError: seconds === null ? null : round(seconds - elapsedMin * 60) };
  });
  return { source: en.url, level, climb, conditions: en.conditions + ' ' + en.role + ' ' + en.reading +
    ' For the climb replay IAS is approximated as CAS and the first reported IAS is carried down to departure. EN.524 boost is displayed as an observed condition. The predicted power uses BS.551 inputs.' };
}

function bandResults(groups) {
  return groups.flatMap(group => {
    const bands = new Map();
    for (const row of group.checks) {
      const h = row.toFt ?? row.altFt;
      if (!Number.isFinite(h) || !Number.isFinite(row.error)) continue;
      const band = h < 10000 ? 'Below 10,000 ft' : h < 20000 ? '10,000–19,999 ft' : '20,000 ft and above';
      if (!bands.has(band)) bands.set(band, []);
      bands.get(band).push(row.error);
    }
    return [...bands].map(([band, errors]) => ({ band, qualifier: group.qualifier, grade: group.grade,
      source: group.source, unit: group.unit, count: errors.length,
      signedMean: round(errors.reduce((a,b) => a+b, 0) / errors.length),
      absoluteMean: round(errors.reduce((a,b) => a+Math.abs(b), 0) / errors.length) }));
  });
}
function build(data, fleet) {
  const holdout = replayEN524(data);
  const aircraft = fleet.aircraft.map(a => {
    const cells = {};
    for (const metric of metrics) {
      if (metric === 'roll') {
        const records = roll.filter(r => r.ids.includes(a.id));
        cells.roll = { groups: records.map(r => ({ grade: r.grade, source: r.source, reference: r.condition,
          qualifier: r.locator, count: r.points.filter(p => r.ids.length === 1 || p.aircraft.toLowerCase().replace(/-/g,'') === a.id).length })),
          next: rollLead[a.id] };
        continue;
      }
      const groups = a.evidence[metric].map(g => ({ grade: g.grade, qualifier: g.qualifier, source: g.source,
        reference: g.reference, count: g.count, available: g.available }));
      if (metric === 'stall' && ['bf109e3_1304','spitfire_va_x4922'].includes(a.id)) {
        const series = early.series.find(s => s.id === (a.id === 'bf109e3_1304' ? '1304-aaee-stall' : 'w3119-naca-stall'));
        const original = early.sources.find(s => s.id === series.source);
        groups.push({ grade: a.id === 'bf109e3_1304' ? 'indicated only' : 'sister-airframe transfer', source: original.url,
          qualifier: original.title, reference: a.gaps.stall, count: 0, available: a.id === 'bf109e3_1304' ? 1 : 2 });
      }
      if (a.id === 'spitfire_hfix_bs551' && ['level','climb','elapsed'].includes(metric)) {
        const rows = metric === 'level' ? holdout.level : holdout.climb;
        const field = {level:'after',climb:'rate',elapsed:'seconds'}[metric];
        groups.push({ grade:'separate aircraft', qualifier:en.report, source:en.url, reference:en.role,
          count: rows.filter(r => Number.isFinite(r[field])).length, available: rows.length });
      }
      const fallback = metric === 'climb' && a.id === 'bf109f4' ? 'Recover a rate-versus-height chart for a DB 601 E F-4 at documented weight and rating.' :
        'Seek a separate test of this variant at matched loading and rating.';
      cells[metric] = { groups, next: a.gaps[metric] || fallback };
    }
    return { id: a.id, name: a.name, cells, bands: Object.fromEntries(['level','climb','elapsed'].map(k => [k,bandResults(a.evidence[k])])) };
  });
  return { metrics, aircraft, roll, holdout };
}
module.exports = { build, previousHFModel };
