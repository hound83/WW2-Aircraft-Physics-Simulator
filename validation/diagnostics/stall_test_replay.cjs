'use strict';
const fs = require('node:fs');
const path = require('node:path');
const physics = require('../../src/physics.js');
const {aircraft} = require('../../aircraft/cases.json');
const evidence = require('../../references/research/stall_four_track_followup_2026-11-10.json');
const traces = require('../../references/p47d30-stall-replay.json');

const midpoint = ([low, high]) => (low + high) / 2;
const sourceRows = id => evidence.series.find(series => series.id === id).rows;

function thunderbolt() {
  const proxy = aircraft.p47b;
  const geometry = {...proxy, wingAreaM2: traces.areaFt2 * 0.09290304};
  const altToEas = (cas, alt) => physics.airspeeds(physics.tasFrom(cas, 'CAS', alt), alt).eas;
  const conditions = sourceRows('p47d30-naca-figure-specific-flight-weights');
  return traces.windows.map(window => {
    const [, weightLb, altFt, cgPercentMac, state, controls] = conditions.find(row => row[0] === window.figure);
    const at = eas => physics.evaluated(geometry, altFt, physics.tasFrom(eas, 'EAS', altFt), {weightLb, profile: 'C'});
    // Only the geometric lift equation is reused. The B-series engine is not a D-series test input.
    const stall1gEas = at(170).stallEasMph;
    const requiredCas = normalG => physics.airspeeds(physics.tasFrom(stall1gEas * Math.sqrt(normalG), 'EAS', altFt), altFt).cas;
    const [lowMph, highMph] = window.indicatedMph;
    const [lowG, highG] = window.normalG;
    const apparentCn = (cas, normalG) => proxy.clMaxAssumed * normalG * (stall1gEas / altToEas(cas, altFt)) ** 2;
    const iasMid = midpoint(window.indicatedMph);
    const gMid = midpoint(window.normalG);
    return {
      ...window, weightLb, altFt, cgPercentMac, state, controls, stall1gEas,
      publishedLowAltitudePower: state === 'power-on-clean' && altFt === 5000 ? {inHg: 42.5, rpm: 2550} : null,
      modeledCasAtMidpointG: requiredCas(gMid),
      neededCasMinusIas: [requiredCas(lowG) - highMph, requiredCas(highG) - lowMph],
      scenarios: [-10, -5, 0, 5, 10].map(assumedCasMinusIas => ({
        assumedCasMinusIas,
        midpointCn: apparentCn(iasMid + assumedCasMinusIas, gMid),
        cnRange: [apparentCn(highMph + assumedCasMinusIas, lowG), apparentCn(lowMph + assumedCasMinusIas, highG)]
      })),
      historicalResidualMph: null
    };
  });
}

function spitfire() {
  const rows = sourceRows('spitfire-va-reported-stalls-and-clmax');
  const covered = [rows[0][6], rows[2][6]];
  const open = [rows[1][6], rows[3][6]];
  const mae = predicted => open.reduce((sum, observed, i) => sum + Math.abs(predicted[i] - observed), 0) / open.length;
  return {
    trainingCoveredPorts: covered,
    internalCheckOpenPorts: open,
    pooledMae: mae(open.map(() => midpoint(covered))),
    twoStateMae: mae(covered),
    cleanClimbCheck: {reportedClMax: rows[9][6], predictedFromPoweredCruise: covered[1], inHg: rows[9][7], rpm: rows[9][8]},
    role: 'Same-report check of state separation for the Spitfire VA only, not independent validation or a fitted power curve.'
  };
}

function sustainedSensitivity() {
  const ac = aircraft.p47b;
  const altFt = 5000;
  return [130, 150, 170, 200].map(easMph => ({
    altFt, easMph, weightLb: ac.weightLb,
    cases: [1.15, ac.clMaxAssumed, 1.45].map(clMax => {
      const result = physics.evaluated(ac, altFt, physics.tasFrom(easMph, 'EAS', altFt), {profile: 'P', clMax});
      const {nLift, nInst, nSust, sustDegSec} = result.limits;
      let limit = 'power';
      if (nSust === null) limit = result.status === 'below-provisional-stall' ? 'stall' : 'no-sustained-turn';
      else if (nSust === nInst) limit = nInst === nLift ? 'lift' : 'structure';
      return {clMax, nInst, nSust, sustDegSec, limit};
    })
  }));
}

function run() {
  const hellcat = sourceRows('f6f3-04776-naca-corrected-peak-cn');
  return {
    schema: 1,
    status: 'research-diagnostic-only',
    p47d30: {source: traces.sourceId, speedBasis: traces.speedBasis, instrumentLead: traces.instrumentLead,
      proxyClMax: aircraft.p47b.clMaxAssumed, windows: thunderbolt()},
    spitfireVa: spitfire(),
    f6f3: {quantity: 'source-derived CN bands with fuel-adjusted gross weight', glide: hellcat[0], poweredClimb: hellcat[1]},
    p47bSustainedSensitivity: sustainedSensitivity(),
    assumptions: 'ISA and hypothetical IAS-to-CAS offsets, not confidence bounds. Scenario CN uses body-normal acceleration and run gross weight. It does not isolate wing CL. Turn sweep uses the P-47B default weight/rating and illustrative CLmax settings, with drag and power fixed.'
  };
}

function writeReport() {
  const report = run();
  fs.writeFileSync(path.join(__dirname, '../current/stall-test-replay.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (require.main === module) writeReport();
module.exports = {run, writeReport};
