'use strict';

const M = require('../../src/physics.js');
const defaultAircraft = require('../../aircraft/fw190a4.json');
const spitfire = require('../../aircraft/cases.json').aircraft.spitfire_lfix_bs543;
const envelope = require('../../calibration/flight-envelope.json');
const source = require('../../references/fw190a4-783.json');

const KPH = 1.609344;
const FT = 1 / 0.3048;
const FPM = 60 * FT;
const fit = source.climb.rows.find(row => row[3] === 'cooling-anchor');
const speedKmh = (ac, altFt, options) => {
  const speed = M.maxSpeed(ac, altFt, options);
  return Number.isFinite(speed) ? speed * KPH : null;
};

function evaluate(aircraft) {
  const base = M.workingOptions(aircraft);
  const options = mode => ({...base, engineModel: mode});
  const inletOnly = options('rated-inlet');
  const fastFlight = Object.fromEntries(source.speed.rows.filter(row => row[2].endsWith('inlet anchor'))
    .map(([altM, kmh, role]) => {
      const gear = role.split('-')[0];
      const altFt = altM * FT;
      const point = M.evaluated(aircraft, altFt, kmh / KPH, inletOnly);
      const v = kmh / 3.6;
      const delta = point.power.excessHp * 745.6998716 / (point.drag.q * aircraft.wingAreaM2 * v);
      if (Math.abs(delta) > 0.005) throw Error('Excessive W.Nr. 783 fast-flight installation correction');
      return [gear, {ratings: ['combat'], shape: gear === 'low' ? 'anchored-ramp' : 'constant',
        minAltFt: gear === 'low' ? 0 : 3000 * FT, maxAltFt: (gear === 'low' ? 3000 : 10000) * FT,
        originFt: 0, spanFt: altFt, offset: gear === 'high' ? delta : 0, slope: gear === 'low' ? delta : 0,
        machStart: 0.39, machFull: 0.46, machFade: 0.59, machEnd: 0.65, edgeFt: 1}];
    }));
  // Give the static control the same installation correction and polar.
  const flightEnvelope = {aircraft: {fw190a4: {identity: aircraft.stallIdentity, fastFlight}}};
  const installed = {...inletOnly, flightEnvelope};
  const control = {...options('rated-static'), flightEnvelope};
  const climb = (m, opts) => M.bestClimb(aircraft, m * FT, {...opts, minTasMph: 130, maxTasMph: 275});
  const cleanAnchor = climb(fit[0], installed);
  const coolingAreaM2 = (fit[2] - fit[1]) * aircraft.weightLb * 4.4482216153 /
    (0.5 * M.isa(fit[0] * FT).rho * (cleanAnchor.tasMph * 0.44704) ** 3);
  const speed = source.speed.rows.map(([altM, observed, role]) => ({
    altM, observed, role,
    installed: speedKmh(aircraft, altM * FT, installed),
    inletOnly: speedKmh(aircraft, altM * FT, inletOnly),
    static: speedKmh(aircraft, altM * FT, control)
  }));
  const climbs = source.climb.rows.map(([altM, observed, , role]) => {
    const active = climb(altM, {...installed, addedDragAreaM2: coolingAreaM2});
    const baseline = climb(altM, {...control, addedDragAreaM2: coolingAreaM2});
    return {altM, observed, role, installed: active.climbFpm / FPM, static: baseline.climbFpm / FPM,
      modelTasKmh: active.tasMph * KPH};
  });
  const boost = source.boost.rows.map(([altM, level, climbBoost]) => {
    const speedKmh = speed.find(row => row.altM === altM).installed;
    const climbKmh = climbs.find(row => row.altM === altM).modelTasKmh;
    const at = (kmh, mode) => M.ratedInletPower(aircraft, altM * FT, kmh / KPH, 'combat', 'auto', mode).estimatedManifoldAta;
    return {altM, observedLevelAta: level, observedClimbAta: climbBoost,
      installedLevelAta: at(speedKmh, 'rated-inlet'), installedClimbAta: at(climbKmh, 'rated-inlet'),
      staticAta: at(speedKmh, 'rated-static')};
  });
  const mae = (rows, key) => {
    const checks = rows.filter(r => r.role === 'check');
    if (checks.some(row => !Number.isFinite(row[key]))) throw Error('Missing Fw 190 reserved prediction');
    return checks.reduce((sum, r) => sum + Math.abs(r[key] - r.observed), 0) / checks.length;
  };
  const comparison = [0, 4000, 6000, 8000, 10000].map(altM => {
    const altFt = altM * FT;
    const spitOptions = {profile: 'P', flightEnvelope: envelope};
    const configurations = [[aircraft, installed], [spitfire, spitOptions]].map(([ac, opts]) =>
      ({ac, opts, levelSpeedKmh: speedKmh(ac, altFt, opts)}));
    const speeds = [150, 175, 225].map(easMph => {
      const tasMph = M.tasFrom(easMph, 'EAS', altFt);
      const aircraft = configurations.map(({ac, opts, levelSpeedKmh}) => {
        const r = M.evaluated(ac, altFt, tasMph, opts);
        return {name: ac.name, speedKmh: levelSpeedKmh, weightLb: ac.weightLb,
          fixedSpeedClimbFpm: r.power?.climbFpm ?? null, shaftHp: r.power?.shaftHp ?? null,
          gear: r.engine?.gear ?? null, sustainedG: r.limits?.nSust ?? null};
      });
      return {easMph, tasMph, aircraft};
    });
    return {altM, altFt, speeds};
  });
  return {aircraft: aircraft.name, source, fastFlight, coolingAreaM2, speed, climbs, boost, comparison,
    metrics: {speedKmh: {static: mae(speed, 'static'), installed: mae(speed, 'installed'), inletOnly: mae(speed, 'inletOnly')},
      climbFpm: {static: FPM * mae(climbs, 'static'), installed: FPM * mae(climbs, 'installed')}},
    validation: 'Same-report reserved checkpoints. No independent historical accuracy bound.',
    report: 'docs/V311_FW190A4.md'};
}

function run() {
  const nominal = evaluate(defaultAircraft);
  const sensitivity = [2/3, 0.85].map(exponent => {
    const combat = {...defaultAircraft.ratedInlet.combat, chargeExponent: exponent};
    const alternative = evaluate({...defaultAircraft, ratedInlet: {combat}});
    return {exponent, metrics: alternative.metrics, speedAt10000: alternative.speed.at(-1).installed,
      climbFpmAt10000: alternative.climbs.at(-1).installed * FPM};
  });
  return {...nominal, sensitivity};
}

module.exports = {run};
