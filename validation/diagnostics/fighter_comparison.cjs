'use strict';

const fs = require('node:fs');
const path = require('node:path');
const M = require('../../src/physics.js');
const Stall = require('../../src/stall-lab.js');
const D = require('../../aircraft/cases.json');
const flightEnvelope = require('../../calibration/flight-envelope.json');
const historical = require('./flight_scorecard.cjs');
const archival = require('./archival_comparisons.cjs');
const climbBand = require('./climb_band.cjs');
const operational = require('./operational_climb.cjs');
const fw190a4 = require('./fw190a4.cjs');
const p38g = require('./p38g.cjs');
const maneuverPower = require('./maneuver_power.cjs');
const intake = require('../../references/aircraft-intake.json');

const root = path.resolve(__dirname, '../..');
const baseline = require('../baseline/v39-fighter-comparison.json');
const sourceRoot = 'references/import/01_COMPLETE_V2_5_BASELINE/';
const ids = ['p51b', 'p47b', 'bf109f4', 'spitfire_lfix_bs543'];
const profile = 'P';

function referenceOptions(ac) {
  return {profile, flightEnvelope, weightLb: ac.weightLb, rating: ac.defaultRating};
}

function turnLimit(result) {
  const limits = result.limits;
  if (!limits) return null;
  if (limits.nInst === null) return 'Below modeled stall';
  if (limits.nSust === null) return 'Insufficient level-flight power';
  if (limits.nPower <= limits.nInst) return 'Power';
  return limits.nLift <= limits.structG ? 'Lift' : 'Structure';
}

function flightAt(ac, altFt, air, options) {
  const result = M.evaluated(ac, altFt, air.tas, options);
  return {
    status: result.status, reason: result.reason ?? null,
    gear: result.engine?.gear ?? null, engineRpm: result.prop?.engineRpm ?? null,
    shaftHp: result.power?.shaftHp ?? null,
    propulsiveHp: result.power?.propulsiveHp ?? null,
    requiredHp: result.power?.requiredHp ?? null,
    excessHp: result.power?.excessHp ?? null,
    climbFpm: result.power?.climbFpm ?? null,
    propEta: result.prop?.eta ?? null,
    instantG: result.limits?.nInst ?? null,
    liftG: result.limits?.nLift ?? null,
    structuralG: result.limits?.structG ?? null,
    sustainedG: result.limits?.nSust ?? null,
    powerG: result.limits?.nPower ?? null,
    sustainedDegSec: result.limits?.sustDegSec ?? null,
    sustainedLimit: turnLimit(result)
  };
}

function scenarios() {
  return [8000, 15000, 27000].map((altFt, index) => {
    const air = M.airspeeds(M.tasFrom(175, 'EAS', altFt), altFt);
    const rows = ids.map(id => {
      const ac = D.aircraft[id];
      const options = referenceOptions(ac);
      const stallEasMph = Stall.eas(ac.weightLb, ac.wingAreaM2 / 0.09290304, ac.clMaxAssumed);
      return {
        id, name: ac.name, weightLb: ac.weightLb, rating: options.rating,
        stall: Stall.air(M, stallEasMph, altFt), clMax: ac.clMaxAssumed,
        ...flightAt(ac, altFt, air, options),
        maxLevelTasMph: M.maxSpeed(ac, altFt, options)
      };
    });
    return {altFt, historicalBand: ['0–10,000', '>10,000–25,000', '>25,000'][index], air, rows};
  });
}

function mustang() {
  const ac = D.aircraft.p51b;
  const altFt = 20800;
  const air = M.airspeeds(250, altFt);
  const options = {...referenceOptions(ac), gear: 'high'};
  const working = flightAt(ac, altFt, air, options);
  // Cached values in Greg Speed Table row 31 of the frozen workbook.
  const workbook = {shaftHp: 1390, propEta: 0.8, propulsiveHp: 1112,
    requiredHp: 405.58141158419545, sustainedG: 2.130192192956999};
  const delta = Object.fromEntries(Object.entries(workbook).map(([key, value]) => [
    key, Number.isFinite(working[key]) ? working[key] - value : null
  ]));
  return {
    source: sourceRoot + '01_GREG_ORIGINAL/Expanded/Europe_Air_War_Research_Handoff_v0.2/data/WWII_Aircraft_Complete_Data_Table_v0.2.xlsx',
    sourceLocation: 'Greg Speed Table, row 31 (AC–AF, AN)',
    evidence: 'Later engineering reconstruction in Greg format. Its fixed efficiency is an assumption.',
    altFt, air, weightLb: options.weightLb, rating: options.rating, gear: options.gear,
    workbook, working, delta
  };
}

function gregP47() {
  const ac = D.aircraft.p47b;
  const {altFt, readings} = D.greg.p47b27k;
  const options = referenceOptions(ac);
  const stallEasMph = 120;
  const nominalStall = Stall.eas(ac.weightLb, ac.wingAreaM2 / 0.09290304, ac.clMaxAssumed);
  const gregOptions = {...options, clMax: ac.clMaxAssumed * (nominalStall / stallEasMph) ** 2};
  const cases = ['CAS', 'EAS'].map(basis => {
    const rows = readings.map(([axisMph, graphG]) => {
      const air = M.airspeeds(M.tasFrom(axisMph, basis, altFt), altFt);
      const working = flightAt(ac, altFt, air, options);
      const replay = flightAt(ac, altFt, air, gregOptions);
      return {axisMph, air, graphG, workingG: working.sustainedG,
        gregStallG: replay.sustainedG, powerG: working.powerG};
    });
    const errors = Object.fromEntries(['workingG', 'gregStallG', 'powerG'].map(key => {
      const paired = rows.filter(row => Number.isFinite(row[key]));
      const mae = paired.length
        ? paired.reduce((sum, row) => sum + Math.abs(row[key] - row.graphG), 0) / paired.length
        : null;
      return [key, {paired: paired.length, mae}];
    }));
    return {basis, rows, errors};
  });
  const images = sourceRoot + '04_USER_IMAGES_AND_GREG_CHARTS/';
  return {
    altFt, weightLb: options.weightLb, rating: options.rating, stallEasMph,
    source: images + '20261026-122239__greg_p47_109_27000ft_chart.png',
    stallSource: images + '20261026-122155__greg_p47_g_limits_plot.png',
    evidence: 'Seven approximate screenshot readings. The altitude chart labels speed only as mph. Its low-speed values may represent the power limit before applying the lift limit.',
    cases
  };
}

function baselineDifferences(current) {
  return baseline.scenarios.flatMap(scenario => scenario.rows.flatMap(before => {
    const after = current.find(row => row.altFt === scenario.altFt).rows.find(row => row.id === before.id);
    return Object.entries(before).flatMap(([metric, value]) => {
      const next = after[metric];
      const equal = Number.isFinite(value) && Number.isFinite(next) ? Math.abs(next - value) <= 1e-8 : value === next;
      return equal ? [] : [{altFt: scenario.altFt, aircraftId: before.id, metric, before: value, after: next}];
    });
  }));
}

function run() {
  const flightScenarios = scenarios();
  const historicalClimb = climbBand.run();
  return {
    schema: 1, baselineCommit: baseline.commit, profile,
    scenario: 'ISA, reference configurations and model weights, nominal default ratings. IAS requires a matched instrument correction.',
    pairwise5to1: 'unresolved',
    scenarios: flightScenarios, differencesFromV39: baselineDifferences(flightScenarios),
    mustang: mustang(), gregP47: gregP47(),
    archival: archival.run(), climbBand: historicalClimb,
    operationalClimb: operational.run(historicalClimb), intake, fw190a4: fw190a4.run(), p38g: p38g.run(), maneuverPower: maneuverPower.run(),
    historical: {
      policy: 'Non-anchor speed and climb checkpoints from already exposed sources. Condition mismatches make residuals diagnostic. No historical ranking follows from the scenario rows.',
      summary: historical.run().summary,
      scorecard: 'docs/FLIGHT_SCORECARD.md',
      separateChecks: 'docs/INDEPENDENT_FLIGHT_CHECKS.md'
    }
  };
}

function writeReport() {
  const report = run();
  const filename = path.join(root, 'validation/current/fighter-comparison.json');
  fs.mkdirSync(path.dirname(filename), {recursive: true});
  fs.writeFileSync(filename, JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log('Fighter comparison: 12 model states, one Mustang workbook row and seven Greg readings under two axis assumptions.');
  console.log('Fixed-state differences from v3.9.0: ' + report.differencesFromV39.length + '.');
  console.log('Historical pairwise 5:1: ' + report.pairwise5to1 + '.');
}
module.exports = {run, writeReport, scenarios, mustang, gregP47};
