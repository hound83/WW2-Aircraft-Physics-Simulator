'use strict';

const M = require('../../src/physics.js');
const Climb = require('../../src/climb-conditions.js');
const A = require('../../aircraft/cases.json').aircraft;
const stores = require('../../aircraft/stores.json');
const archive = require('../../references/archival-comparisons-2026-11-06.json');
const figure = require('../baseline/p51_power_required_source_v16.json');
const climbStates = require('../../references/climb-condition-states.json');
const climbModel = require('../../calibration/v3.1-climb-model.json');

function observation(id, label, sourceId, location, altFt, value, unit, conditions, qualification, evidence = 'measured') {
  return {id, label, sourceId, location, altFt, value, unit, conditions, qualification,
    evidence, model: null, difference: null, status: 'source-only', fitRole: 'exposed',
    historicalValidationEligible: false};
}

function replay(row, model, method) {
  if (!Number.isFinite(model)) return row;
  return {...row, model, difference: model - row.value, status: 'qualified replay', method};
}

function mustangRows() {
  const ac = A.p51b;
  const {polar} = M.workingOptions(ac);
  const speed = archive.p51Speed;
  const published = speed.altitudesFt.map(altFt => {
    const point = ac.observedSpeed.find(p => p.altFt === altFt && p.rating === '67inHg' && p.gear === 'high');
    return observation('p51-speed-' + altFt, 'P-51B 43-24777 level speed', 'wright-p51', '§V.B.2, 67 inHg',
      altFt, point.mphTas, 'mph TAS', {...speed, gear: point.gear, shaftPowerEvidence: 'derived'}, speed.qualification);
  });
  const digitized = figure.points.map((point, index) => {
    const {tasMph, testBhp, engineRpm} = point;
    const drag = M.dragBreakdown(ac, figure.altitudeFt, tasMph, figure.nominalWeightLb, polar.cd0, polar.e);
    const prop = M.propEta(ac, figure.altitudeFt, tasMph, testBhp, 'P', '67inHg', {engineRpmOverride: engineRpm});
    const row = observation('p51-fig5-' + (index + 1), 'P-51B 43-24777 required shaft power', 'wright-p51-figure5',
      'Figure 5, circle ' + (index + 1), figure.altitudeFt, testBhp, 'bhp', {...point,
        speedBasis: 'TAS', weightLb: figure.nominalWeightLb, weightKind: 'source nominal',
        configuration: 'Level flight; point-specific cooling setting unknown',
        shaftPowerEvidence: 'derived from Packard chart, then digitized'}, figure.uncertainties, 'digitized');
    return replay(row, prop && drag.requiredHp / prop.eta,
      'Reference polar and profile P propeller at chart BHP and RPM. Required propulsive power divided by efficiency at that test state; no independent propeller calibration or fast-flight correction.');
  });
  return [...published, ...digitized];
}

function spitfireRows() {
  const ac = A.spitfire_lfix_bs543;
  const level = archive.spitfireLevel;
  const point = ac.observedSpeed.find(p => p.altFt === level.altFt && p.gear === 'high');
  const speed = observation('bs543-level-22000', 'Spitfire BS.543 level speed', 'aaee-bs543', 'Table V',
    level.altFt, point.mphTas, 'mph TAS', level, level.qualification);
  const climbs = archive.spitfireClimbAltitudesFt.map(altFt => {
    const state = climbStates.states.find(p => p.aircraftId === 'spitfire_lfix_bs543' && p.altFt === altFt);
    const result = Climb.evaluate(M, ac, state, climbModel, {requireMatchedSpecimen:true});
    const row = observation('bs543-climb-' + altFt, 'Spitfire BS.543 climb', 'aaee-bs543', 'Table II',
      altFt, state.observedFpm, 'ft/min', {tasMph:state.tasMph, engineRpm:3000, gear:state.gear,
        boostPsi:state.engineCondition.observedBoostPsi, weightLb:state.weightLb, weightKind:'takeoff proxy',
        configuration:'Radiator flaps open'}, 'Takeoff weight used as a proxy; boost-conditioned power and cooling loss are modeled. Existing exposed calibration states, not independent tests.');
    return {...replay(row, result.predictedFpm, 'Existing v3.1 source-climb replay at reported TAS, boost and gear.'),
      fitRole: 'exposed calibration programme'};
  });
  return [speed, ...climbs];
}

function externalReferences() {
  const p38 = archive.p38g;
  const p = stores.p38g.cleanLevelSpeed.find(row => row.altFt === 22600);
  const p38g = observation('p38g-clean-22600', 'P-38G-1 42-12687 clean speed', 'wright-p38g', 'p. 1, level flight speeds',
    p.altFt, p.tasMph, 'mph TAS', {...p38, manifoldInHg:p.mapInHg, bhpPerEngine:p.bhpPerEngine, engineCount:2,
      shaftPowerEvidence:'derived'}, p38.qualification);
  const mosquito = archive.mosquito;
  const mosquitoRows = ['clean', 'loaded'].flatMap((state, index) => {
    const sourceId = index ? 'lr495-8' : 'lr495-4';
    const reference = mosquito[state];
    const label = 'Mosquito B Mk IX LR495 · ' + (index ? 'internal + external' : 'internal only');
    const peaks = stores.mosquito.gears.map((row, i) => ({...row[state], gear:row.gear, boostPsi:reference.boostPsi[i],
      location:!index || i ? 'Table II, p. 4' : 'Table I, p. 3'}));
    const fs = mosquito.sameAltitude.map(row => ({altFt:row.altFt, tasMph:row[state + 'Mph'],
      gear:'FS', boostPsi:reference.boostPsi[1], location:'Table II, p. 4'}));
    return [...peaks, ...fs].map(row => observation('lr495-' + state + '-' + row.altFt, label, sourceId,
      row.location, row.altFt, row.tasMph, 'mph TAS', {...reference, weightKind:'normalized', gear:row.gear,
        boostPsi:row.boostPsi, engineRpm:mosquito.engineRpm, internalBombsLb:mosquito.internalBombsLb}, mosquito.qualification));
  });
  const fw = archive.fw190;
  const fw190 = observation('fw190-783-special-sl', 'Fw 190 A-4 W.Nr. 783 clean speed', 'fw783-5', 'Ergebnisse',
    fw.altFt, fw.speedKph, 'km/h', fw, fw.qualification);
  const fwStores = stores.fw190a4.furtherControl;
  const fw619 = fwStores.lossesKmH.map((value, index) => observation('fw190-619-stores-' + (index + 1),
    'Fw 190 A-4 W.Nr. 619 speed loss', 'fw619-3', 'Ergebnisse 1, stage ' + ['b', 'c', 'd'][index],
    0, value, 'km/h loss', {configuration:fwStores.configurations[index], rating:'combat'},
    'Reported differences within W.Nr. 619. Test mass, RPM and absolute speed basis are not matched for a solver replay.'));
  return [p38g, ...mosquitoRows, fw190, ...fw619];
}

function run() {
  const rows = [...mustangRows(), ...spitfireRows(), ...externalReferences()];
  return {
    audit: archive.audit, sources: archive.sources, rows,
    comparisonInputs: {mustangWorkbookPropEta:'assumed', gregSpitfireAxis:'unknown', gregP38SpeedBasis:'unknown'},
    sourceAssessment: {sourceId:'lr495-8', rangeMph:stores.mosquito.reportedSourcePenaltyMph,
      evidence:'derived', qualification:archive.mosquito.qualification},
    exclusions: {
      spitfireFw190: 'Greg drag minima excluded. Speed basis, vertical axis, altitude and exact variants are unknown.',
      p38Mosquito: 'Greg corrected the P-38G to 2 × 1,100 lb of bombs excluding racks, and the FB Mk VI speed was overstated. LR495 is a B Mk IX. No matched loaded P-38G trial.',
      fw190: 'W.Nr. 619 rack, tank and bomb trials are separate from W.Nr. 783 at 1.70 ata.'
    },
    precision: {historicalEligibleCount:0, differentialBound:null, practical3to1:'UNRESOLVED', highPrecision5to1:'UNRESOLVED',
      reason:'No independent matched cross-aircraft observations with validated differential error bounds in this evidence set.'}
  };
}

module.exports = {run};
