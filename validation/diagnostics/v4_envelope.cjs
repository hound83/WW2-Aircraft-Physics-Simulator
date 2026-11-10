'use strict';
const fs = require('node:fs');
const path = require('node:path');
const M = require('../../src/physics.js');
const turn = require('../../src/turn-lift.js');
const source = require('../../references/p51-turn-lift-tn1044.json');
const envelope = require('../../src/maneuver-envelope.js');
const {aircraft} = require('../../aircraft/cases.json');
const flightEnvelope = require('../../calibration/flight-envelope.json');
const corsair = require('./f4u4.cjs');
const {mustang, p47} = require('./v4_installations.cjs');
const fw190 = require('../../aircraft/fw190a4.json');

function buildData() {
  const fwReport = require('./fw190a4.cjs').run();
  const p38 = require('./p38g.cjs').model(2);
  const models = {...Object.fromEntries(Object.entries(aircraft).map(([id, ac]) =>
    [id, {ac, options: {profile: 'P', flightEnvelope}}])),
    fw190a4: {ac: fw190, options: {profile: 'P', engineModel: 'rated-inlet',
      flightEnvelope: {aircraft: {fw190a4: {identity: fw190.stallIdentity, fastFlight: fwReport.fastFlight}}}}},
    p38g: {ac: p38.ac, options: {profile: 'P'}, climbOptions: {rating: 'climb', addedDragAreaM2: p38.coolingAreaM2}},
    f4u4: {ac: corsair.ac, options: corsair.options(), poweredClMax: corsair.powered}
  };
  return {models, scorecard: {corsair: corsair.run(), thunderbolt: p47(), mustang: mustang(), il2: require('./v4_game_comparison.cjs').run()}};
}

function writeReport() {
  const {models, scorecard} = buildData();
  const comparison = [5000, 15000, 27000].flatMap(altFt => [130, 150, 170, 200, 225].map(easMph => ({
    altFt, easMph, rows: Object.entries(models).map(([id, model]) => ({id, ...envelope.state(M, turn, source,
      model, altFt, easMph, model.ac.defaultRating, model.ac.weightLb)}))
  })));
  const climb = Object.entries(models).map(([id, model]) => {
    const options = {...model, options: {...model.options, ...model.climbOptions}};
    const rating = model.climbOptions?.rating ?? model.ac.defaultRating;
    return {id, rating, constantMass: envelope.climbBand(M, options, 5000, 10000, rating, model.ac.weightLb, 0),
      fuelScenario: envelope.climbBand(M, options, 5000, 10000, rating, model.ac.weightLb, .5)};
  });
  const result = {schema: 1, baseline: '7caa9a867f7477fd31487cd0fcd29e27b2ff0c8f',
    ...scorecard, comparison, climb,
    alternatePropFits: [15000, 20000].map(alt => ({climbFitFt: alt, ...p47(alt)})),
    historicalSustainedTurn5to1: null,
    gates: {type: 'engineering checks, source-conditioned and previously exposed',
      corsairLowAltitudeSpeedKt: 2, corsairClimbBelow20000FtFpm: 200,
      heldoutInstallationMustImproveBothMetrics: true,
      unsupportedHighAltitudeResidualsRetained: true}};
  fs.writeFileSync(path.join(__dirname, '../current/v4-envelope.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}
if (require.main === module) writeReport();
module.exports = {buildData, writeReport};
