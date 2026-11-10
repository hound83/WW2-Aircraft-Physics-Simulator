'use strict';
const fs = require('node:fs');
const path = require('node:path');
const M = require('../../src/physics.js');
const E = require('../../src/energy-configuration.js');
const V4 = require('./v4_envelope.cjs');
const {reading} = require('../lib/chart_reading.cjs');
const {models} = V4.buildData();
const baseOptions = model => M.workingOptions(model.ac);
const midpoint = values => (values[0] + values[1]) / 2;
const hpPerFpm = weight => weight * 4.4482216153 / (745.6998716 * 196.850394);

function sourceCohorts() {
  const p47 = require('../../references/p47b-measured-climb-v33.json');
  const spit = require('../../references/climb-condition-states.json').states.filter(row => row.aircraftId === 'spitfire_lfix_bs543');
  const p38 = require('../../references/p38g-42-12687.json');
  const fw = require('../../references/fw190a4-783.json');
  const p51 = require('../../references/p51-maneuver-power.json');
  const chart = require('./source_chart_climb.cjs').chart().nodes;
  const config = (id, model, weightLb, branches, source, minTasMph = 110, maxTasMph = 320) => ({
    id: id + '-energy-v41', identity: model.ac.stallIdentity, source, weightLb, branches, minTasMph, maxTasMph
  });
  const c47 = config('p47b', models.p47b, p47.mass.valueLb, ['military', 'normal'].map(rating => {
    const states = p47.states.filter(row => row.rating === rating);
    return {rating, gear: 'turbo', minFt: states[0].altFt, maxFt: states.at(-1).altFt,
      engineRpm: states[0].engineRpm, reductionRatioEnginePerProp: 2,
      powerBasis: 'report torque-meter BHP; gross test mass',
      powerNodes: states.map(row => ({altFt: row.altFt, bhp: row.shaftHp}))};
  }), p47.source.url);
  const spitNodes = spit.filter(row => row.engineCondition).map(row => ({
    ...row, bhp: M.shaftPowerAtMeasuredBoost(models.spitfire_lfix_bs543.ac, row.altFt,
      row.rating, row.gear, row.engineCondition, {chargeExponent: .75}).bhp
  }));
  const highTransition = M.shaftPower(models.spitfire_lfix_bs543.ac, 13000, 'combat+18', 'high').bhp;
  const cSpit = config('spitfire_lfix_bs543', models.spitfire_lfix_bs543, 7485, ['low', 'high'].map(gear => {
    const nodes = spitNodes.filter(row => row.gear === gear).map(row => ({altFt: row.altFt, bhp: row.bhp}));
    if (gear === 'high') nodes.unshift({altFt: 13000, bhp: highTransition});
    return {rating: 'combat+18', gear, minFt: gear === 'low' ? 2000 : 13000, maxFt: gear === 'low' ? 13000 : 30000,
      engineRpm: 3000, powerBasis: 'engine-chart BHP corrected by recorded climb/level boost ratio; transition uses native engine node',
      powerNodes: gear === 'low' ? nodes.concat([{altFt: 13000, bhp: nodes.at(-1).bhp}]) : nodes};
  }), 'https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html');
  const c38 = config('p38g', models.p38g, p38.takeoffWeightLb, [{
    rating: 'climb', gear: 'turbo', minFt: 0, maxFt: 35000, engineRpm: 3000,
    powerBasis: 'per-engine chart BHP from same trial',
    powerNodes: p38.climb.map(row => ({altFt: row[0], bhp: row[2]}))
  }], p38.url);
  const cFw = config('fw190a4', models.fw190a4, models.fw190a4.ac.weightLb, [{
    rating: 'combat', gear: 'auto', minFt: 0, maxFt: 10000 / .3048, powerBasis: 'existing speed-dependent source inlet model'
  }], fw.url, 130, 320);
  const c51 = config('p51b', models.p51b, p51.takeoffWeightLb, [{
    rating: '75inHg', gear: 'low', minFt: 2200, maxFt: 12000, engineRpm: 3000, powerBasis: 'Figure 7 chart BHP midpoint',
    powerNodes: chart.filter(row => row.rating === '75inHg').map(row => ({altFt: row.altFt, bhp: (row.lowerBhp + row.upperBhp) / 2}))
  }, {
    rating: '67inHg', gear: 'low', minFt: 2200, maxFt: 12000, engineRpm: 3000, powerBasis: 'native rating curve; withheld lower-boost condition, previously exposed'
  }], p51.url);
  const rows47 = p47.states.map((row, i) => ({...row, observed: row.observedFpm, weightLb: c47.weightLb,
    role: [0, 2, 4, 6, 8].includes(i) ? 'fit' : 'check'}));
  const rowsSpit = spit.map(row => ({...row, observed: row.observedFpm, weightLb: cSpit.weightLb,
    role: [2000, 6000, 10000, 16000, 22000, 28000].includes(row.altFt) ? 'fit' : 'check'}));
  const rows38 = p38.climb.map((row, i) => ({id: 'p38-' + row[0], altFt: row[0], tasMph: row[1],
    observed: row[3], weightLb: c38.weightLb, rating: 'climb', role: [0, 2, 4, 6].includes(i) ? 'fit' : 'check'}));
  const rowsFw = fw.climb.rows.map((row, i) => ({id: 'fw-' + row[0], altFt: row[0] / .3048,
    observed: row[1] / .3048 * 60, weightLb: cFw.weightLb, rating: 'combat',
    role: [0, 2, 4, 6].includes(i) ? 'fit' : 'check', minTasMph: 130, maxTasMph: 300}));
  const rows51 = p51.points.map((row, i) => ({id: 'p51-' + row.rating + '-' + row.altFt, ...row,
    observed: row.reportedFpm ?? midpoint(reading(p51.figure6RateAxis, [row.ratePixelBox[0], row.ratePixelBox[2]])),
    observedBand: row.ratePixelBox ? reading(p51.figure6RateAxis, [row.ratePixelBox[0], row.ratePixelBox[2]]) : null,
    weightLb: c51.weightLb, role: [1, 3, 4].includes(i) ? 'fit' : 'check'}));
  return Object.fromEntries([
    ['p47b', c47, rows47], ['spitfire_lfix_bs543', cSpit, rowsSpit], ['p38g', c38, rows38],
    ['fw190a4', cFw, rowsFw], ['p51b', c51, rows51]
  ].map(([id, configuration, rows]) => [id, {model: models[id], configuration, rows}]));
}

function samples(cohort, row, useSource) {
  const config = useSource ? cohort.configuration : undefined;
  const model = useSource ? cohort.model : {...cohort.model, options: {...cohort.model.options, ...cohort.model.climbOptions}};
  const prepared = E.prepare(M, model, row.altFt, row.rating, row.weightLb, config);
  if (!prepared) return [];
  const speeds = row.tasMph ? [row.tasMph] : Array.from({length: 96}, (_, i) => 110 + 2 * i);
  return speeds.map(tasMph => {
    const r = M.evaluated(prepared.ac, row.altFt, tasMph, prepared.options);
    if (!r.power || r.status !== 'modelled') return null;
    return {tasMph, rawFpm: r.power.climbFpm, areaHp: r.drag.q * tasMph * .44704 / 745.6998716,
      usefulHp: r.power.propulsiveHp, shaftHp: r.power.shaftHp, J: r.prop.J, Cp: r.prop.Cp};
  }).filter(Boolean);
}

function prediction(points, weightLb, areaM2 = 0, fraction = 0) {
  return points.length ? Math.max(...points.map(row =>
    row.rawFpm - (areaM2 * row.areaHp + fraction * row.usefulHp) / hpPerFpm(weightLb))) : null;
}

function fit(cohort) {
  const records = cohort.rows.map(row => ({...row, samples: samples(cohort, row, true),
    baseline: prediction(samples(cohort, row, false), row.weightLb)}));
  const train = records.filter(row => row.role === 'fit');
  let best = null;
  for (let area = 0; area <= .90001; area += .005) {
    for (let fraction = -.08; fraction <= .25001; fraction += .005) {
      const errors = train.map(row => prediction(row.samples, row.weightLb, area, fraction) - row.observed);
      const score = errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length;
      if (!best || score < best.score) best = {areaM2: +area.toFixed(4), powerFraction: +fraction.toFixed(4), score};
    }
  }
  const configuration = {...cohort.configuration, branches: cohort.configuration.branches.map(branch =>
    ({...branch, loss: {areaM2: best.areaM2, powerFraction: best.powerFraction}}))};
  const rows = records.map(row => ({...row, samples: undefined,
    sourceInputOnly: prediction(samples(cohort, row, true), row.weightLb),
    candidate: prediction(samples(cohort, row, true), row.weightLb, best.areaM2, best.powerFraction)}));
  const checks = rows.filter(row => row.role === 'check' && row.candidate !== null);
  const mae = key => checks.reduce((sum, row) => sum + Math.abs(row[key] - row.observed), 0) / checks.length;
  return {configuration, fit: best, rows, metrics: {count: checks.length,
    baselineMae: mae('baseline'), sourceInputMae: mae('sourceInputOnly'), candidateMae: mae('candidate')}};
}


function fitOffDesign(cohort) {
  const records = cohort.rows.map(row => ({...row, samples: samples(cohort, row, true),
    baseline: prediction(samples(cohort, row, false), row.weightLb)}));
  let best = null;
  const train = records.filter(row => row.role === 'fit');
  for (let center = .85; center <= 1.20001; center += .005) {
    for (let strength = 0; strength <= .80001; strength += .005) {
      for (let area = 0; area <= .10001; area += .005) {
        const predict = row => Math.max(...row.samples.map(s => s.rawFpm -
          (area * s.areaHp + strength * (s.J - center) ** 2 / s.Cp * s.usefulHp) / hpPerFpm(row.weightLb)));
        const score = train.reduce((sum, row) => sum + (predict(row) - row.observed) ** 2, 0) / train.length;
        if (!best || score < best.score) best = {center: +center.toFixed(4), strength: +strength.toFixed(4), areaM2: +area.toFixed(4), score};
      }
    }
  }
  const maxJ = Math.max(...train.flatMap(row => row.samples.map(s => s.J)));
  const offLoss = s => Math.min(.25, best.strength * (s.J - best.center) ** 2 / s.Cp *
    Math.max(0, Math.min(1, (maxJ + .05 - s.J) / .05)));
  const rows = records.map(row => ({...row, samples: undefined, candidate: Math.max(...row.samples.map(s => s.rawFpm -
    (best.areaM2 * s.areaHp + offLoss(s) * s.usefulHp) / hpPerFpm(row.weightLb)))}));
  const configuration = {...cohort.configuration, branches: cohort.configuration.branches.map(branch =>
    ({...branch, loss: {areaM2: best.areaM2, powerFraction: 0,
      offDesign: {center: best.center, strength: best.strength, maxJ, fadeJ: .05}}}))};

  const checks = rows.filter(row => row.role === 'check');
  return {configuration, fit: best, rows, metrics: {baselineMae: checks.reduce((s, r) => s + Math.abs(r.baseline-r.observed), 0)/checks.length,
    candidateMae: checks.reduce((s, r) => s + Math.abs(r.candidate-r.observed), 0)/checks.length}};
}


function fitAltitudeLoss(cohort) {
  const prepared = cohort.rows.map(row => ({...row, samples: samples(cohort, row, true),
    baseline: prediction(samples(cohort, row, false), row.weightLb)}));
  const train = prepared.filter(row => row.role === 'fit');
  const nodes = train.map(row => {
    let low = 0, high = .25;
    for (let i = 0; i < 30; i++) {
      const mid = (low + high)/2;
      if (prediction(row.samples, row.weightLb, 0, mid) > row.observed) low = mid;
      else high = mid;
    }
    return {altFt: row.altFt, fraction: (low + high)/2};
  });
  const coefficientAt = altitude => E.fractionAt(nodes, altitude);
  const rows = prepared.map(row => ({...row, samples: undefined,
    candidate: prediction(row.samples, row.weightLb, 0, coefficientAt(row.altFt))}));
  const checks = rows.filter(row => row.role === 'check');
  return {configuration: {...cohort.configuration, branches: cohort.configuration.branches.map(branch =>
    ({...branch, loss: {areaM2: 0, powerFraction: 0, fractionNodes: nodes}}))},
    fit: {type: 'bounded altitude interpolation of equivalent useful-power fraction', nodes},
    rows, metrics: {count: checks.length, baselineMae: checks.reduce((s,r)=>s+Math.abs(r.baseline-r.observed),0)/checks.length,
      candidateMae: checks.reduce((s,r)=>s+Math.abs(r.candidate-r.observed),0)/checks.length}};
}

function run() {
  return Object.fromEntries(Object.entries(sourceCohorts()).map(([id, cohort]) => {
    if (id === 'p38g') return [id, fitOffDesign(cohort)];
    if (id === 'fw190a4') return [id, fitAltitudeLoss(cohort)];
    const result = fit(cohort);
    if (id === 'p51b') {
      result.configuration.branches.find(row => row.rating === '67inHg').loss = {areaM2: 0, powerFraction: 0};
      result.rows.filter(row => row.rating === '67inHg').forEach(row => row.candidate = row.baseline);
      const checks = result.rows.filter(row => row.role === 'check');
      result.metrics.candidateMae = checks.reduce((sum,row)=>sum+Math.abs(row.candidate-row.observed),0)/checks.length;
    }
    return [id, result];
  }));
}

function calibration() {
  const results = run();
  const configurations = Object.fromEntries(Object.entries(results).map(([id, row]) => [id, row.configuration]));
  configurations.bf109f4 = {
    id: 'bf109f4-inlet-v41', identity: models.bf109f4.ac.stallIdentity, weightLb: models.bf109f4.ac.weightLb,
    source: 'Messerschmitt V.B.109 19 L42 DB601E installation, transferred from G-1 as an explicit F-4 scenario',
    minTasMph: 110, maxTasMph: 320,
    branches: [
      {rating: 'combat', gear: 'fluid', minFt: 0, maxFt: 23000,
        engineModel: 'inlet-transfer', powerBasis: 'same engine, cross-installation inlet transfer', loss: {areaM2: 0, powerFraction: 0}},
      {rating: 'emergency', gear: 'fluid', minFt: 0, maxFt: 15748,
        powerBasis: 'retained DB601E emergency reference', loss: {areaM2: 0, powerFraction: 0}}
    ]
  };
  return {schema: 1, version: '4.1.0-rc.1', baseline: '36871080678e90c47056b86de851afcf50fff64c',
    interpretation: 'Source-conditioned equivalent installed energy models. Same-report checks were exposed previously and excluded from numerical fit. No independent historical turn accuracy claim.',
    configurations};
}

function buildData() {
  const data = V4.buildData();
  const parameters = require('../../calibration/v4.1-energy.json');
  for (const [id, configuration] of Object.entries(parameters.configurations)) {
    data.models[id].energyConfiguration = configuration;
    data.models[id].energyWeightLb = configuration.weightLb;
    data.models[id].energyRating = ['p47b', 'p38g'].includes(id) ? 'source-schedule' : data.models[id].ac.defaultRating;
  }
  const f4 = require('./v41_f4_candidates.cjs').run();
  data.models.bf109f4.parameterCandidates = f4.candidates.map(({clMax,e,retained}) => ({clMax,e,retained}));
  data.scorecard.f4Candidates = f4;
  data.scorecard.energy = Object.fromEntries(Object.entries(sourceCohorts()).map(([id, cohort]) => {
    const configuration = parameters.configurations[id];
    const rows = cohort.rows.map(row => {
      const before = prediction(samples(cohort, row, false), row.weightLb);
      const r = row.tasMph ? E.evaluate(M, cohort.model, row.altFt, row.tasMph, row.rating, row.weightLb, configuration) : null;
      const candidate = r ? r.power.climbFpm : E.bestClimb(M, cohort.model, row.altFt, row.rating, row.weightLb, configuration, 2).climbFpm;
      return {id:row.id, altFt:row.altFt, role:row.role, observed:row.observed, before, candidate,
        observationKind: ['p47b','spitfire_lfix_bs543'].includes(id) || (id==='p51b'&&row.reportedFpm) ? 'historical table transcription' : 'digitized historical chart',
        observedExcessHp:row.observed*hpPerFpm(row.weightLb)};
    });
    const checks=rows.filter(row=>row.role==='check'&&Number.isFinite(row.before)&&Number.isFinite(row.candidate));
    return [id,{rows,count:checks.length,
      beforeMae:checks.reduce((sum,row)=>sum+Math.abs(row.before-row.observed),0)/checks.length,
      afterMae:checks.reduce((sum,row)=>sum+Math.abs(row.candidate-row.observed),0)/checks.length}];
  }));
  return data;
}

function writeReport() {
  const results = run();
  const {models: liveModels} = buildData();
  for (const [id, record] of Object.entries(results)) {
    const cohort = sourceCohorts()[id];
    for (const row of record.rows) {
      const model = liveModels[id];
      const exact = row.tasMph ? E.evaluate(M, model, row.altFt, row.tasMph, row.rating, row.weightLb, model.energyConfiguration)
        : null;
      const best = exact ? {climbFpm: exact.power.climbFpm} : E.bestClimb(M, model, row.altFt,
        row.rating, row.weightLb, model.energyConfiguration, 2);
      row.sharedSolverCandidate = best.climbFpm;
      row.baselineExcessHp = row.baseline === null ? null : row.baseline*hpPerFpm(row.weightLb);
      row.observedExcessHp = row.observed*hpPerFpm(row.weightLb);
      row.candidateExcessHp = row.sharedSolverCandidate*hpPerFpm(row.weightLb);
    }
  }
  const alternatives = Object.fromEntries(Object.entries(sourceCohorts()).map(([id, cohort]) => {
    const alternate = {...cohort, rows: cohort.rows.map(row => ({...row,
      role: row.role === 'fit' ? 'check' : 'fit'}))};
    // Keep the lower-boost Mustang as an unused condition in both fits.
    if (id === 'p51b') alternate.rows = alternate.rows.map(row =>
      ({...row,role:row.rating==='75inHg'&&[2200,4000,12000].includes(row.altFt)?'fit':'check'}));
    const r = id === 'p38g' ? fitOffDesign(alternate) : id === 'fw190a4' ? fitAltitudeLoss(alternate) : fit(alternate);
    if (id === 'p51b') r.rows.filter(row=>row.rating==='67inHg').forEach(row=>row.candidate=row.baseline);
    const checks=r.rows.filter(row=>row.role==='check'&&Number.isFinite(row.baseline)&&Number.isFinite(row.candidate));
    return [id,{fit:r.fit,count:checks.length,
      addedCoverage:r.rows.filter(row=>row.role==='check'&&row.baseline===null).map(row=>({id:row.id,candidate:row.candidate,observed:row.observed})),
      baselineMae:checks.reduce((sum,row)=>sum+Math.abs(row.baseline-row.observed),0)/checks.length,
      candidateMae:checks.reduce((sum,row)=>sum+Math.abs(row.candidate-row.observed),0)/checks.length}];
  }));
  const output={schema:1,version:require('../../package.json').version,results,alternatives,
    f4:require('./v41_f4_candidates.cjs').run(),
    independentReportTransfer:require('./v41_transfer_check.cjs').run(), historical5to1:null};
  fs.writeFileSync(path.join(__dirname,'../current/energy-v41.json'),JSON.stringify(output,null,2)+'\n');
  return output;
}

if (require.main === module) {
  const report = run();
  fs.writeFileSync(path.join(__dirname, '../current/energy-v41-candidate.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(Object.entries(report).map(([id, row]) => ({id, ...row.fit, ...row.metrics})));
}
module.exports = {sourceCohorts, samples, prediction, fit, fitOffDesign, run, calibration, buildData, writeReport};
