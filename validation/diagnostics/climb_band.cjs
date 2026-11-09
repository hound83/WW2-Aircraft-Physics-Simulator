'use strict';

const physics = require('../../src/physics.js');
const conditioned = require('../../src/climb-conditions.js');
const measured = require('../../src/measured-climb.js');
const configuration = require('../../src/source-configuration.js');
const {aircraft} = require('../../aircraft/cases.json');
const source = require('../../references/climb-band-evidence.json');
const p47Ledger = require('../../references/p47b-measured-climb-v33.json');
const {states} = require('../../references/climb-condition-states.json');
const boostModel = require('../../calibration/v3.1-climb-model.json');
const coolingModel = require('../../calibration/v3.4-configuration-model.json');
const {inFit} = require('./robustness_v29.cjs');

const [lower, upper] = source.bandFt;
const inBand = row => row.altFt >= lower && row.altFt <= upper;

function integrateSeconds(rows, key) {
  if (rows.length < 2 || rows.some((row, index) =>
    !Number.isFinite(row.altFt) || !Number.isFinite(row[key]) || row[key] <= 0 ||
    (index > 0 && row.altFt <= rows[index - 1].altFt))) {
    throw Error('Climb integration requires increasing altitudes and positive finite rates');
  }
  return 60 * rows.slice(1).reduce((sum, row, index) => {
    const previous = rows[index];
    const delta = row[key] - previous[key];
    const inverseRate = delta === 0 ? 1 / previous[key] : Math.log1p(delta / previous[key]) / delta;
    return sum + (row.altFt - previous.altFt) * inverseRate;
  }, 0);
}

function replay(rows, evidence) {
  if (rows[0]?.altFt !== lower || rows.at(-1)?.altFt !== upper) {
    throw Error('Climb band requires both source endpoints');
  }
  const [startMin, endMin] = evidence.timesMin;
  return {
    ...evidence, rows,
    reportedSeconds: 60 * (endMin - startMin),
    integratedSourceSeconds: integrateSeconds(rows, 'sourceFpm'),
    modelSeconds: integrateSeconds(rows, 'modelFpm'),
    cleanControlSeconds: integrateSeconds(rows, 'cleanControlFpm')
  };
}

function spitfireReplay() {
  const ac = aircraft.spitfire_lfix_bs543;
  const rows = states.filter(row => row.aircraftId === 'spitfire_lfix_bs543' && inBand(row)).map(state => {
    const model = conditioned.evaluate(physics, ac, state, boostModel, {requireMatchedSpecimen: true});
    return {altFt: state.altFt, tasMph: state.tasMph, sourceFpm: state.observedFpm,
      modelFpm: model.predictedFpm, cleanControlFpm: model.rawFpm, engineRpm: 3000,
      shaftHp: model.shaftHp, coolingCd0: model.configurationDeltaCd0, boostPsi: state.engineCondition.observedBoostPsi,
      fitRole: inFit('climb', state.aircraftId, state.index, boostModel.split) ? 'fit' : 'reserved engineering check'};
  });
  return replay(rows, source.spitfire);
}

function thunderboltReplay() {
  const ac = aircraft.p47b;
  const rows = p47Ledger.states.filter(inBand).map(state => {
    const args = [physics, ac, p47Ledger, state.id];
    const clean = measured.evaluate(...args);
    const model = configuration.evaluate(physics, measured, conditioned, ac, p47Ledger, state.id, coolingModel);
    return {altFt: state.altFt, tasMph: state.tasMph, sourceFpm: state.observedFpm,
      modelFpm: model.predictedFpm, cleanControlFpm: clean.predictedFpm, engineRpm: state.engineRpm,
      shaftHp: state.shaftHp, fitRole: model.fitRole};
  });
  return replay(rows, {...source.thunderbolt, specimen: p47Ledger.identity.specimen,
    reference: p47Ledger.source.reference, url: p47Ledger.source.url,
    path: p47Ledger.source.path, sha256: p47Ledger.source.sha256,
    evidence: 'Original report scan; published climb rates and elapsed times.'});
}

function sourceAlternates() {
  const s = source.spitfireAlternate;
  const p = source.thunderboltAlternate;
  const pRows = states.filter(row => row.aircraftId === 'p47b' && row.sourceSpecimen === p.specimen && inBand(row))
    .map(row => ({altFt: row.altFt, sourceFpm: row.observedFpm, tasMph: row.tasMph}));
  if (pRows[0]?.altFt !== lower || pRows.at(-1)?.altFt !== upper) {
    throw Error('Alternate Thunderbolt band requires both source endpoints');
  }
  return {
    spitfire: {...s, startFpm: s.endpointFpm[0], bandSeconds: 60 * (s.timesMin[1] - s.timesMin[0])},
    thunderbolt: {...p, rows: pRows, startFpm: pRows[0].sourceFpm, bandSeconds: integrateSeconds(pRows, 'sourceFpm')}
  };
}

function precision(referenceGap, residual) {
  return {referenceGap, residual, required3to1: Math.abs(referenceGap) / 3,
    required5to1: Math.abs(referenceGap) / 5, validatedErrorBound: null,
    practical3to1: 'unresolved', highPrecision5to1: 'unresolved'};
}

function run() {
  const spitfire = spitfireReplay();
  const thunderbolt = thunderboltReplay();
  const endpoints = source.bandFt.map(altFt => {
    const s = spitfire.rows.find(row => row.altFt === altFt);
    const p = thunderbolt.rows.find(row => row.altFt === altFt);
    const sourceGapFpm = s.sourceFpm - p.sourceFpm;
    const modelGapFpm = s.modelFpm - p.modelFpm;
    return {altFt, sourceGapFpm, modelGapFpm, cleanControlGapFpm: s.cleanControlFpm - p.cleanControlFpm,
      sourcePercentOverP47: 100 * sourceGapFpm / p.sourceFpm,
      precision: precision(sourceGapFpm, modelGapFpm - sourceGapFpm)};
  });
  const sourceTimeLeadSeconds = thunderbolt.reportedSeconds - spitfire.reportedSeconds;
  const modelTimeLeadSeconds = thunderbolt.modelSeconds - spitfire.modelSeconds;
  const alternates = sourceAlternates();
  const scenarios = [
    {specimen: spitfire.specimen, startFpm: spitfire.rows[0].sourceFpm, bandSeconds: spitfire.reportedSeconds},
    alternates.spitfire
  ].flatMap(s => [
    {specimen: thunderbolt.specimen, startFpm: thunderbolt.rows[0].sourceFpm, bandSeconds: thunderbolt.reportedSeconds,
      durationEvidence: 'Published endpoint times'},
    {...alternates.thunderbolt, durationEvidence: 'Integrated reported P-47B rates'}
  ].map(p => ({spitfire: s.specimen, thunderbolt: p.specimen, sourceGapFpm: s.startFpm - p.startFpm,
    timeLeadSeconds: p.bandSeconds - s.bandSeconds, durationEvidence: p.durationEvidence})));

  return {bandFt: source.bandFt, spitfire, thunderbolt, endpoints, alternates, scenarios,
    time: {sourceTimeLeadSeconds, modelTimeLeadSeconds,
      sourcePercentLessTime: 100 * sourceTimeLeadSeconds / thunderbolt.reportedSeconds,
      cleanControlTimeLeadSeconds: thunderbolt.cleanControlSeconds - spitfire.cleanControlSeconds,
      precision: precision(sourceTimeLeadSeconds, modelTimeLeadSeconds - sourceTimeLeadSeconds)},
    method: 'Published band times subtract cumulative times. Model times integrate reciprocal climb rate over piecewise linear rates at source altitudes, without extrapolation.',
    limitation: 'Separate historical reports and different test ratings. Replays use already-exposed calibration observations. Alternate results vary specimen, installation or rating together and do not bound model error.',
    report: 'docs/CLIMB_BAND_COMPARISON.md'};
}

module.exports = {run, integrateSeconds};
