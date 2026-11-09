'use strict';

const M = require('../../src/physics.js');
const airframe = require('../../aircraft/p38g.json');
const p47 = require('../../aircraft/cases.json').aircraft.p47b;
const envelope = require('../../calibration/flight-envelope.json');
const source = require('../../references/p38g-42-12687.json');

const highRating = row => row[5] === 'separate-rating-check';
const ordinary = source.level.filter(row => !highRating(row));
const alternate = source.level.filter(highRating);
const makeRating = (rows, multiplier, climb = false) => ({
  notes: 'Wright Field 42-12687, chart-derived shaft hp; linear interpolation within report domain',
  gears: {turbo: rows.map(row => ({altFt: row[0], bhp: row[2] * multiplier, mapInHg: row[climb ? 5 : 4]}))}
});

function model(engineCount, coolingAnchor = source.climb.find(row => row[6] === 'cooling-anchor')) {
  const multiplier = airframe.engineCount / engineCount;
  const ac = {...airframe, engineCount,
    powerRatings: {level: makeRating(ordinary, multiplier), 'level-48': makeRating(alternate, multiplier),
      climb: makeRating(source.climb, multiplier, true)}};
  const base = M.workingOptions(ac);
  const [altFt, tasMph, , climbFpm] = coolingAnchor;
  const clean = M.evaluated(ac, altFt, tasMph, {...base, rating: 'climb', weightLb: source.takeoffWeightLb});
  const v = tasMph * 0.44704;
  const requestedCoolingAreaM2 = (clean.power.climbFpm - climbFpm) / 196.850394 *
    source.takeoffWeightLb * 4.4482216153 / (clean.drag.q * v);
  const coolingAreaM2 = Math.max(0, requestedCoolingAreaM2);
  if (!Number.isFinite(requestedCoolingAreaM2) || coolingAreaM2 >= 0.5) throw Error('Unsupported P-38 cooling fit');
  const level = (altFt, weightLb, rating = 'level') => M.maxSpeed(ac, altFt, {...base, rating, weightLb});
  const climb = (altFt, tasMph) => M.evaluated(ac, altFt, tasMph, {...base, rating: 'climb',
    weightLb: source.takeoffWeightLb, addedDragAreaM2: coolingAreaM2});
  return {ac, base, coolingAreaM2, requestedCoolingAreaM2, level, climb};
}

function run() {
  const twin = model(2);
  const single = model(1);
  const level = source.level.map(([altFt, observedMph, bhpPerEngine, weightLb, mapInHg, role]) => {
    const rating = role === 'separate-rating-check' ? 'level-48' : 'level';
    return {altFt, observedMph, bhpPerEngine, weightLb, mapInHg, role,
      twinMph: twin.level(altFt, weightLb, rating), singleMph: single.level(altFt, weightLb, rating)};
  });
  const climbs = source.climb.map(([altFt, tasMph, bhpPerEngine, observedFpm, elapsedMin, mapInHg, role]) => ({
    altFt, tasMph, bhpPerEngine, observedFpm, elapsedMin, mapInHg, role,
    twinFpm: twin.climb(altFt, tasMph).power?.climbFpm ?? null,
    singleFpm: single.climb(altFt, tasMph).power?.climbFpm ?? null
  }));
  function errors(rows, observed, a, b) {
    const reserved = rows.filter(row => row.role === 'check');
    if (reserved.some(row => !Number.isFinite(row[a]) || !Number.isFinite(row[b]))) {
      throw Error('Missing P-38G reserved prediction');
    }
    const mae = key => reserved.reduce((sum, row) => sum + Math.abs(row[key] - row[observed]), 0) / reserved.length;
    return {count: reserved.length, twin: mae(a), single: mae(b)};
  }
  const comparison = [5000, 10000, 15000, 20000, 25000, 30000].map(altFt => {
    const tasMph = M.tasFrom(175, 'EAS', altFt);
    const lightning = twin.climb(altFt, tasMph);
    const thunderbolt = M.evaluated(p47, altFt, tasMph, {profile: 'P', rating: 'military',
      flightEnvelope: envelope, flightCooling: true});
    return {altFt, tasMph,
      lightning: {speedMph: twin.level(altFt, twin.ac.weightLb), climbFpm: lightning.power?.climbFpm ?? null,
        levelWeightLb: twin.ac.weightLb, climbWeightLb: source.takeoffWeightLb,
        totalShaftHp: lightning.power?.shaftHp ?? null, shaftHpPerEngine: lightning.power?.shaftHpPerEngine ?? null,
        propRpm: lightning.prop?.propRpm ?? null, propEta: lightning.prop?.eta ?? null},
      thunderbolt: {speedMph: M.maxSpeed(p47, altFt, {profile: 'P', rating: 'military', flightEnvelope: envelope}),
        climbFpm: thunderbolt.power?.climbFpm ?? null, totalShaftHp: thunderbolt.power?.shaftHp ?? null,
        shaftHpPerEngine: thunderbolt.power?.shaftHp ?? null, levelWeightLb: p47.weightLb, climbWeightLb: p47.weightLb,
        propRpm: thunderbolt.prop?.propRpm ?? null, propEta: thunderbolt.prop?.eta ?? null}};
  });
  // A common scoring set excludes every point used by any of these fits.
  const coolingAnchorsFt = [6000, 10000, 15000];
  const commonClimbs = climbs.filter(row => !coolingAnchorsFt.includes(row.altFt));
  const coolingSensitivity = coolingAnchorsFt.map(altFt => {
    const alternate = model(2, source.climb.find(row => row[0] === altFt));
    const maeFpm = commonClimbs.reduce((sum, row) => sum +
      Math.abs(alternate.climb(row.altFt, row.tasMph).power.climbFpm - row.observedFpm), 0) / commonClimbs.length;
    return {altFt, coolingAreaM2: alternate.coolingAreaM2, commonCheckCount: commonClimbs.length, maeFpm,
      climbAt20000FtAnd175EasFpm: alternate.climb(20000, M.tasFrom(175, 'EAS', 20000)).power.climbFpm};
  });
  return {aircraft: airframe.name, source, level, climbs, comparison, coolingSensitivity,
    calibration: {twin: {cd0: twin.base.polar.cd0, coolingAreaM2: twin.coolingAreaM2},
      single: {cd0: single.base.polar.cd0, coolingAreaM2: single.coolingAreaM2, requestedCoolingAreaM2: single.requestedCoolingAreaM2}},
    metrics: {levelMph: errors(level, 'observedMph', 'twinMph', 'singleMph'),
      climbFpm: errors(climbs, 'observedFpm', 'twinFpm', 'singleFpm')},
    validation: 'Same-report reserved speeds and climb rates, conditional on report BHP and climb TAS. No independent accuracy bound.',
    report: 'docs/V312_P38G.md'};
}

module.exports = {run, model};
