'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const lift = require('../../references/p51-turn-lift-tn1044.json');
const propeller = require('./operating_benchmark_v410.cjs');
const remaining = require('./remaining_fighter_propellers.cjs');
const before = require('./operating_benchmark_v46.cjs').browserData();
const first = propeller.browserData(before);
const after = remaining.browserData(first);
const rc0 = require('../../references/analysis/v410-propeller-before.json');
const rc1 = require('../../references/analysis/v410-rc1-operating-baseline.json');
const { specification: { policy, aircraft } } = after;
const round = (value, digits = 4) => Number.isFinite(value) ? +value.toFixed(digits) : null;
const EPS = 1e-8;
const altitudeNodes = [...new Set([
  ...Array.from({ length: 41 }, (_, i) => 1000 * i),
  4600, 5000, 8700, 14700, 22600, 23100, 24400, 24600, 27800, 29000, 31900, 34000, 36089,
])].sort((a, b) => a - b);
const fuelNodes = [.25, .5, .75];
const levels = ['normal', 'combat'];

const turn = f => f.limits?.sustDegSec;
const instant = f => f.limits?.instantDegSec;
const sustG = f => f.limits?.nSust;
const climb = f => f.power?.climbFpm;
const stall = f => f.stallEasMph;
const rateFloor = value => Number.isFinite(value) && value > EPS;
const radius = f => rateFloor(turn(f)) ? f.tasMph * .44704 / (turn(f) * Math.PI / 180) : null;

function delta() {
  return { changed: 0, introduced: 0, lost: 0, maximumIncrease: null, maximumDecrease: null };
}
function record(summary, before, after, point) {
  const a = Number.isFinite(before), b = Number.isFinite(after);
  if (!a || !b) {
    if (a) summary.lost++;
    if (b) summary.introduced++;
    return;
  }
  const change = after - before;
  if (Math.abs(change) <= EPS) return;
  summary.changed++;
  const direction = change > 0 ? 'maximumIncrease' : 'maximumDecrease';
  const existing = summary[direction];
  if (!existing || Math.abs(change) > Math.abs(existing.after - existing.before)) {
    summary[direction] = { ...point, before, after };
  }
}
function counters() {
  return {
    cleanSustainedTurn: delta(), cleanSustainedG: delta(), instantaneousTurn: delta(), stall: delta(),
    cleanSpecificExcessPowerFpm: delta(), openClimb: delta(), openSustainedTurn: delta(),
    peakSustainedTurn: delta(), peakSustainedG: delta(), minimumSustainedRadiusM: delta(),
    peakOpenClimb: delta(), positiveTurnLost: 0, positiveTurnIntroduced: 0, commonTurnChangesOverHalfDegree: 0,
  };
}

function peak(current, value, minimize = false) {
  if (!Number.isFinite(value)) return current;
  if (current === null || (minimize ? value < current : value > current)) return value;
  return current;
}
function peaks() {
  return { peakSustainedTurn: null, peakSustainedG: null, minimumSustainedRadiusM: null, peakOpenClimb: null };
}

function comparisons(pass, left, right, openLeft, openRight, state) {
  record(pass.cleanSustainedTurn, turn(left), turn(right), state);
  record(pass.cleanSustainedG, sustG(left), sustG(right), state);
  record(pass.instantaneousTurn, instant(left), instant(right), state);
  record(pass.stall, stall(left), stall(right), state);
  record(pass.cleanSpecificExcessPowerFpm, climb(left), climb(right), state);
  record(pass.openClimb, climb(openLeft), climb(openRight), state);
  record(pass.openSustainedTurn, turn(openLeft), turn(openRight), state);
  const a = turn(left), b = turn(right);
  if (rateFloor(a) && !rateFloor(b)) pass.positiveTurnLost++;
  if (!rateFloor(a) && rateFloor(b)) pass.positiveTurnIntroduced++;
  if (Number.isFinite(a) && Number.isFinite(b) && Math.abs(b - a) >= .5) pass.commonTurnChangesOverHalfDegree++;
}

function scanAircraft(id, spec) {
  const runs = { firstPass: counters(), secondPass: counters(), cumulative: counters() };
  const stagePairs = [[0, 1, runs.firstPass], [1, 2, runs.secondPass], [0, 2, runs.cumulative]];
  const models = [before, first, after].map(stage => stage.models[id]);
  const conditions = [];
  for (const mode of levels) {
    for (const fuelFraction of fuelNodes) {
      conditions.push({ mode, fuelFraction, injection: false });
      if (mode === 'combat' && B.fittedInjection(models[2], spec)) conditions.push({ mode, fuelFraction, injection: true });
    }
  }
  let sampledConditions = 0;
  for (const settings of conditions) {
    const { weightLb } = B.load(spec, policy, settings);
    const phase = B.phaseFor(spec, settings);
    for (const altFt of altitudeNodes) {
      const byStage = models.map(peaks);
      const ceiling = M.airspeeds(590, altFt).eas;
      for (let easMph = 65; easMph <= ceiling; easMph += 2) {
        const condition = { ...settings, altFt, easMph };
        const clean = models.map(model => B.evaluate(M, T, lift, model, spec, settings, altFt, easMph, weightLb, phase));
        const open = models.map(model => B.evaluate(M, T, lift, model, spec, settings, altFt, easMph, weightLb, phase, true));
        sampledConditions++;
        for (const [a, b, summary] of stagePairs) comparisons(summary, clean[a], clean[b], open[a], open[b], condition);
        for (let i = 0; i < models.length; i++) {
          const row = byStage[i];
          row.peakSustainedTurn = peak(row.peakSustainedTurn, turn(clean[i]));
          row.peakSustainedG = peak(row.peakSustainedG, sustG(clean[i]));
          row.minimumSustainedRadiusM = peak(row.minimumSustainedRadiusM, radius(clean[i]), true);
          row.peakOpenClimb = peak(row.peakOpenClimb, climb(open[i]));
        }
      }
      for (const [a, b, summary] of stagePairs) {
        for (const key of Object.keys(byStage[0])) record(summary[key], byStage[a][key], byStage[b][key], { ...settings, altFt });
      }
    }
  }
  return { id, sampledConditions, ...runs };
}

function benchmarkAt(id, altFt, mode, fuelFraction, probeEas) {
  const spec = aircraft[id], settings = { mode, fuelFraction };
  const { weightLb } = B.load(spec, policy, settings);
  return {
    id, altFt, mode, fuelFraction, probeEas,
    stages: [before, first, after].map(data => {
      const model = data.models[id];
      const m = B.metrics(M, T, lift, model, spec, policy, settings, altFt);
      const at = B.evaluate(M, T, lift, model, spec, settings, altFt, probeEas, weightLb);
      return {
        bestClimbFpm: round(m.climb?.climbFpm),
        manualClimbFpm: round(m.manualClimb?.climbFpm),
        stallEas: round(m.stallEasMph),
        peakSustDegSec: round(m.sustained?.rateDegSec),
        instantDegSec: round(m.instantaneous?.rateDegSec),
        maxSustG: round(m.sustainedLoad?.g),
        minSustRadiusM: round(m.minSustainedRadius?.radiusM),
        maxSustEas: round(m.turnRange?.maxEasMph),
        sustainedAtProbe: round(turn(at)),
        sustainedGAtProbe: round(sustG(at)),
        propEtaAtProbe: round(at.prop?.eta),
      };
    }),
  };
}

function freezeDiff(expected, actual, key) {
  return expected.flatMap((a, i) => a[key].flatMap((row, j) => {
    const actualRow = actual[i]?.[key][j];
    return JSON.stringify(row) === JSON.stringify(actualRow) ? [] : [{ id: a.id, before: row, replay: actualRow }];
  }));
}

function run() {
  const baselines = [rc0.aircraft, rc1.aircraft, propeller.scorecard(after)];
  const anchors = Object.keys(aircraft).map(id => benchmarkAt(id, 10000, 'combat', .5, 250));
  return {
    schema: 'ww2-v410-propeller-climb-turn-audit/v1',
    revisions: ['v4.9.0-rc.2 pre-propeller snapshot', 'v4.10.0-rc.1', 'v4.10.0-rc.2'],
    auditedCommit: '52369812a7ed40ec8fed1cde42354023aec407f0',
    domain: { altitudeNodes, fuelNodes, fromEasMph: 65, stepEasMph: 2, maxTasMph: 590,
      note: 'Source-bounded power, both dry ratings, fitted Corsair injection, and separate clean and climb-cooling calls.' },
    frozenReproduction: [before, first].map((data, i) => {
      const replay = propeller.scorecard(data);
      return Object.fromEntries(['cases', 'timed', 'climb'].map(key => [key, freezeDiff(baselines[i], replay, key)]));
    }),
    anchors,
    pointwise: Object.entries(aircraft).map(([id, spec]) => scanAircraft(id, spec)),
    representativeEdges: [
      benchmarkAt('p38g', 30000, 'combat', .5, 240),
      benchmarkAt('f4u4', 10000, 'normal', .5, 260),
      benchmarkAt('p47b', 10000, 'combat', .5, 290),
    ],
    timedAcceleration: baselines.map(stage => stage.map(({ id, timed }) => ({ id, timed }))),
    timedClimb: baselines.map(stage => stage.map(({ id, climb }) => ({ id, climb }))),
  };
}

module.exports = { run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
