'use strict';
const M = require('../../src/physics.js');
const {aircraft} = require('../../aircraft/cases.json');
const flightEnvelope = require('../../calibration/flight-envelope.json');
const comparator = require('./v4_game_comparison.cjs').run();
function run() {
  const ac = aircraft.bf109f4;
  const candidates = [];
  for (const clMax of [1.2, 1.35, 1.5]) for (const e of [.65, .78, .9]) for (const retained of [.85, .93, .98]) {
    const a = {...ac, propGeometry: {...ac.propGeometry,
      momentumModel: {...ac.propGeometry.momentumModel, retainedPowerFraction: retained}}};
    const options = M.workingOptions(a, {e});
    const turns = comparator.rows.map(row => {
      const tas = M.tasFrom(row.iasKmh/1.609344, 'CAS', row.altM/.3048);
      const r = M.evaluated(a, row.altM/.3048, tas, {...options, clMax,
        rating: row.rating, weightLb: row.weightKg/.45359237});
      return {altM: row.altM, seconds: 360/r.limits.sustDegSec};
    });
    const levelAt20000 = M.maxSpeed(a, 20000, {...options, clMax, rating: 'combat',
      engineModel: 'inlet-transfer', flightEnvelope});
    candidates.push({clMax, e, retained, turns, levelAt20000});
  }
  return {status: 'physical candidate ensemble; no numerical fit to software benchmarks', candidates,
    conclusion: 'Source-matched shaft ratings constrain power. Lift, drag efficiency and installed propeller losses remain identifiable only as competing candidates. Every candidate keeps its original level-speed anchor through explicit drag reanchoring. The 20,000-ft inlet calculation is a documented DB601E cross-installation sensitivity. IL-2 turns do not select the default.',
    originalReport: {url: 'https://stephentaylorhistorian.com/wp-content/uploads/2020/04/bf-109f-evaluation.pdf',
      sha256: 'db43c5e8f8be5fe1bb61657878aee8fe073e8ada00b2e237ad3f06046fbd4dac',
      pagesReviewed: 'All 8 pages, including original engine flight-calibration plate and synoptic estimate',
      reportedF4NormalWeightLb: 6200, estimatedF4ClimbFpm: 3400, estimatedF4TimeTo15000Min: 4.8,
      qualification: 'USAAF Report 110 is an intelligence compilation. Its speed chart explicitly says estimated performance. No serial, flown loading or calibrated stall is identified. Engine plate is a useful original prior but no numerically qualified altitude map was admitted from the small axis labels.'}};
}
module.exports = {run};
