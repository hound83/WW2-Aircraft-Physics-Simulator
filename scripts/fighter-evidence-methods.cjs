'use strict';

const physics = require('../src/physics.js');
const MPH = 0.44704;
const FT = 0.3048;
const LB = 0.45359237;
const HP = 745.6998716;
const G = 9.80665;
const RHO0 = 1.225;
const KNOT_MPH = 1852 / 1609.344;

const round = (x, places = 3) => Number(x.toFixed(places));
const mix = (a, b, fraction) => a + (b - a) * fraction;
const between = (a, b, x) => mix(a.y, b.y, (x - a.x) / (b.x - a.x));

function bracket(rows, x) {
  const index = rows.findIndex(row => row.x >= x);
  if (index < 1 || rows[index - 1].x > x) throw Error('Target outside source bracket: ' + x);
  return [rows[index - 1], rows[index]];
}

// Exact integral of the reciprocal of a linearly varying climb rate.
function climbSeconds(height, initialRate, finalRate) {
  if (!(height > 0 && initialRate > 0 && finalRate > 0)) throw Error('Invalid climb integration interval');
  const change = (finalRate - initialRate) / initialRate;
  return Math.abs(change) < 1e-8
    ? height / initialRate
    : height * Math.log1p(change) / (finalRate - initialRate);
}

function loadScaledCasKnots(casKnots, altitudeFt, loadRatio, coefficientRatio = 1) {
  const anchor = physics.resolveAirspeed(casKnots * KNOT_MPH, 'CAS', altitudeFt);
  const targetEas = anchor.eas * Math.sqrt(loadRatio / coefficientRatio);
  return physics.resolveAirspeed(targetEas, 'EAS', altitudeFt).cas / KNOT_MPH;
}

function liftEasMps(massKg, areaM2, coefficient, normalLoad = 1) {
  if (!(massKg > 0 && areaM2 > 0 && coefficient > 0 && normalLoad > 0)) throw Error('Invalid lift inputs');
  return Math.sqrt(2 * massKg * G * normalLoad / (RHO0 * areaM2 * coefficient));
}

function ratioSpeed(anchorSpeed, massRatio, calibrationRatio = 1) {
  return anchorSpeed * Math.sqrt(massRatio) * calibrationRatio;
}

function effectiveAreaRatio(speedReference, speedChanged, propulsivePowerRatio = 1) {
  return propulsivePowerRatio * (speedReference / speedChanged) ** 3;
}

function levelDragN(tasMph, totalShaftHp, efficiency) {
  return efficiency * totalShaftHp * HP / (tasMph * MPH);
}

function excessPowerKw(massKg, rateMps) {
  return massKg * G * rateMps / 1000;
}

module.exports = {
  MPH, FT, LB, G, HP, RHO0, KNOT_MPH, physics, round, mix, between, bracket,
  climbSeconds, loadScaledCasKnots, liftEasMps, ratioSpeed, effectiveAreaRatio, levelDragN, excessPowerKw,
};
