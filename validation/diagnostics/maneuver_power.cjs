'use strict';

const M = require('../../src/physics.js');
const {p51b, p47b} = require('../../aircraft/cases.json').aircraft;
const flightEnvelope = require('../../calibration/flight-envelope.json');
const propPolicy = require('../../calibration/v2.9-robustness-policy.json');
const figure5 = require('../baseline/p51_power_required_source_v16.json');
const reconstruction = require('./p51_climb_states.cjs');
const {reading} = require('../lib/chart_reading.cjs');
const source = require('../../references/p51-maneuver-power.json');
const donor = require('../../references/independent-flight-checks.json').thunderboltProduction;

const midpoint = ([lo, hi]) => (lo + hi) / 2;
const range = values => [Math.min(...values), Math.max(...values)];
const mae = values => values.reduce((sum, value) => sum + Math.abs(value), 0) / values.length;

function retained(aircraft, fraction) {
  return {...aircraft, propGeometry: {...aircraft.propGeometry,
    momentumModel: {...aircraft.propGeometry.momentumModel, retainedPowerFraction: fraction}}};
}

function recordedPower(aircraft, rating, gear, altFt, bhp) {
  return {...aircraft, powerRatings: {[rating]: {gears: {[gear]: [{altFt, bhp}]}}}};
}

function reportStates() {
  reconstruction.verifySources();
  const readings = reconstruction.readPoints();
  return source.points.map(point => {
    const power = readings.find(row => row.kind === 'power' && row.altFt === point.altFt && row.rating === point.rating);
    const observedFpm = point.reportedFpm === undefined
      ? reading(source.figure6RateAxis, [point.ratePixelBox[0], point.ratePixelBox[2]])
      : [point.reportedFpm, point.reportedFpm];
    return {...point, observedFpm, shaftBhp: power.bounds, powerReadingId: power.id,
      evidence: point.ratePixelBox ? 'digitized faired climb curve' : 'reported climb rate'};
  });
}

function budget(result) {
  return {shaftHp: result.power?.shaftHp ?? null, propulsiveHp: result.power?.propulsiveHp ?? null,
    requiredHp: result.power?.requiredHp ?? null, excessHp: result.power?.excessHp ?? null,
    eta: result.prop?.eta ?? null, climbFpm: result.power?.climbFpm ?? null,
    sustainedG: result.limits?.nSust ?? null, sustainedDegSec: result.limits?.sustDegSec ?? null};
}

function climbAt(aircraft, state, easMph, bhp) {
  const {altFt, rating} = state;
  const opts = {...M.workingOptions(aircraft), rating, gear: 'low', weightLb: source.takeoffWeightLb};
  const tasMph = M.tasFrom(easMph, 'EAS', altFt);
  const ac = bhp === undefined ? aircraft : recordedPower(aircraft, rating, 'low', altFt, bhp);
  const result = M.evaluated(ac, altFt, tasMph, opts);
  return {easMph, tasMph, ...budget(result)};
}

function bestClimb(aircraft, state, useChart) {
  const opts = {...M.workingOptions(aircraft), rating: state.rating, gear: 'low',
    weightLb: source.takeoffWeightLb, minTasMph: M.tasFrom(135, 'EAS', state.altFt),
    maxTasMph: M.tasFrom(185, 'EAS', state.altFt), stepMph: 1};
  const ac = useChart
    ? recordedPower(aircraft, state.rating, 'low', state.altFt, midpoint(state.shaftBhp))
    : aircraft;
  return M.bestClimb(ac, state.altFt, opts).climbFpm ?? null;
}

function powerRequiredChecks(aircraft) {
  const {polar} = M.workingOptions(aircraft);
  return figure5.points.map(({tasMph, testBhp, engineRpm}) => {
    const drag = M.dragBreakdown(aircraft, figure5.altitudeFt, tasMph, figure5.nominalWeightLb, polar.cd0, polar.e);
    const prop = M.propEta(aircraft, figure5.altitudeFt, tasMph, testBhp, 'P', '67inHg', {engineRpmOverride: engineRpm});
    return {tasMph, engineRpm, chartBhp: testBhp, predictedBhp: drag.requiredHp / prop.eta};
  });
}

function donorChecks(aircraft) {
  const opts = {...M.workingOptions(aircraft), rating: 'military', gear: 'turbo', weightLb: donor.weightLb};
  return {
    climb: donor.climb.map(([altFt, bhp, tasMph, observedFpm]) => {
      const ac = recordedPower(aircraft, 'military', 'turbo', altFt, bhp);
      return {altFt, tasMph, observedFpm, ...budget(M.evaluated(ac, altFt, tasMph,
        {...opts, flightEnvelope, flightCooling: true}))};
    }),
    speed: donor.level.map(([altFt, bhp, observedMph]) => ({
      altFt, bhp, observedMph,
      predictedMph: M.maxSpeed(recordedPower(aircraft, 'military', 'turbo', altFt, bhp), altFt, opts)
    }))
  };
}

function candidateSweep(states) {
  // Keep altitude clusters together in each split. Figure 5 and the P-47B donor never fit.
  const fractions = propPolicy.retainedPowerFraction;
  const baseline = p51b.propGeometry.momentumModel.retainedPowerFraction;
  const trials = fractions.map(fraction => {
    const aircraft = retained(p51b, fraction);
    const rows = states.map(state => bestClimb(aircraft, state, true) - midpoint(state.observedFpm));
    return {fraction, residualFpm: rows};
  });
  const base = trials.find(row => row.fraction === baseline);
  const splits = [...new Set(states.map(s => s.altFt))].map(altFt => {
    const scored = (trial, held) => mae(trial.residualFpm.filter((_, i) => (states[i].altFt === altFt) === held));
    const selected = [...trials].sort((a, b) => scored(a, false) - scored(b, false))[0];
    return {altFt, fraction: selected.fraction, baselineMae: scored(base, true), candidateMae: scored(selected, true)};
  });
  const challenger = [...trials].sort((a, b) => mae(a.residualFpm) - mae(b.residualFpm))[0];
  const figure = trial => powerRequiredChecks(retained(p51b, trial.fraction));
  const heldPower = {baseline: figure(base), challenger: figure(challenger)};
  const speedPoints = p51b.observedSpeed.filter(row =>
    !(row.altFt === p51b.calibration.altFt && row.rating === p51b.calibration.rating && row.gear === p51b.calibration.gear));
  const heldSpeed = Object.fromEntries([['baseline', base], ['challenger', challenger]].map(([key, trial]) => {
    const ac = retained(p51b, trial.fraction);
    const opts = M.workingOptions(ac, {flightEnvelope});
    const rows = speedPoints.map(row => ({...row, predictedMph: M.maxSpeed(ac, row.altFt,
      {...opts, rating: row.rating, gear: row.gear})})).filter(row => Number.isFinite(row.predictedMph));
    return [key, {rows, maeMph: mae(rows.map(row => row.predictedMph - row.mphTas))}];
  }));
  const baselineDonor = donorChecks(p47b);
  const p47Fraction = p47b.propGeometry.momentumModel.retainedPowerFraction;
  const transfer = p47Fraction + challenger.fraction - baseline;
  const challengerDonor = donorChecks(retained(p47b, transfer));
  const summarize = rows => ({
    climbMaeFpm: mae(rows.climb.map(row => row.climbFpm - row.observedFpm)),
    speedMaeMph: mae(rows.speed.map(row => row.predictedMph - row.observedMph))
  });
  const donorBaseline = summarize(baselineDonor), donorChallenger = summarize(challengerDonor);
  const powerMaeBhp = Object.fromEntries(Object.entries(heldPower).map(([key, rows]) =>
    [key, mae(rows.map(row => row.predictedBhp - row.chartBhp))]));
  const checks = {
    everyAltitudeFoldImproves: splits.every(row => row.candidateMae < row.baselineMae),
    figure5NoRegression: powerMaeBhp.challenger <= powerMaeBhp.baseline,
    mustangSpeedNoRegression: heldSpeed.challenger.rows.length === heldSpeed.baseline.rows.length &&
      heldSpeed.challenger.maeMph <= heldSpeed.baseline.maeMph,
    donorNoRegression: donorChallenger.climbMaeFpm <= donorBaseline.climbMaeFpm &&
      donorChallenger.speedMaeMph <= donorBaseline.speedMaeMph
  };
  return {trials, splits, challenger: challenger.fraction, heldPower, heldSpeed, checks,
    decision: Object.values(checks).every(Boolean) ? 'passes engineering checks only' : 'retain v3.12 propulsion',
    powerMaeBhp,
    donor: {source: donor.report, url: donor.url, qualification: donor.qualification, transferFraction: transfer,
      baseline: donorBaseline, challenger: donorChallenger,
      baselineRows: baselineDonor, challengerRows: challengerDonor}};
}

function turnScenarios() {
  const stations = [{altFt: 8000, gear: 'low'}, {altFt: 15000, gear: 'low'}, {altFt: 20800, gear: 'high'}];
  const speeds = [150, 175, 200, 225];
  // The established robustness grid is an engineering sensitivity, not an installed propeller map.
  return stations.map(({altFt, gear}) => ({
    altFt, gear, rows: [
      ...speeds.map(easMph => M.tasFrom(easMph, 'EAS', altFt)),
      ...(altFt === 20800 ? [250] : [])
    ].sort((a, b) => a - b).map(tasMph => {
      const easMph = M.airspeeds(tasMph, altFt).eas;
      const opts = {profile: 'P', rating: '67inHg', gear, flightEnvelope};
      const nominal = budget(M.evaluated(p51b, altFt, tasMph, opts));
      const samples = propPolicy.retainedPowerFraction.map(fraction => ({
        fraction, ...budget(M.evaluated(retained(p51b, fraction), altFt, tasMph, opts))
      }));
      const g = samples.map(row => row.sustainedG);
      const rate = samples.map(row => row.sustainedDegSec);
      return {easMph, tasMph, nominal, samples, sustainedG: g.every(Number.isFinite) ? range(g) : null,
        sustainedDegSec: rate.every(Number.isFinite) ? range(rate) : null};
    })
  }));
}

function run() {
  const states = reportStates();
  const climbs = states.map(state => ({
    ...state,
    speeds: [135, 160, 185].map(easMph => ({
      nominal: climbAt(p51b, state, easMph),
      chart: climbAt(p51b, state, easMph, midpoint(state.shaftBhp)),
      chartClimbFpm: range(state.shaftBhp.map(bhp => climbAt(p51b, state, easMph, bhp).climbFpm))
    })),
    bestGenericClimbFpm: bestClimb(p51b, state, false),
    bestChartClimbFpm: bestClimb(p51b, state, true)
  }));
  const common = climbs.filter(row => Number.isFinite(row.bestGenericClimbFpm));
  const coverage = {genericCount: common.length, chartCount: climbs.length,
    genericMaeFpm: mae(common.map(row => row.bestGenericClimbFpm - midpoint(row.observedFpm))),
    chartMaeFpm: mae(common.map(row => row.bestChartClimbFpm - midpoint(row.observedFpm)))};
  return {source, climbs, coverage, turn: turnScenarios(), sensitivityFractions: propPolicy.retainedPowerFraction,
    candidate: candidateSweep(states),
    report: 'docs/V313_MANEUVER_POWER.md'};
}

module.exports = {run};
