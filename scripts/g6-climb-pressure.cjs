'use strict';
const M = require('../src/physics.js');
const B = require('../src/operating-benchmark.js');
const sources = require('../references/analysis/g6-16476-climb-pressure.json');
const feet = km => 1000 * km / .3048;
const round = (n, digits) => Number(n.toFixed(digits));

function readPressure(source) {
  const scale = source.calibration;
  return source.rows.map(([altKm, , x]) => ({
    altKm, ata: round(scale.referenceAta + (x - scale.referenceX) / scale.pixelsPerAta, 3),
    readAllowanceAta: scale.readAllowanceAta,
  }));
}

// Only the manifold-pressure input changes. Preserve the baseline power at its
// own pressure, the DB rating, pressure exponent, RPM, propeller, polar and cooling.
function withMeasuredPressure(model, spec, readings, offsetAta) {
  const old = model.climbPowerRatings.combat.gears.hydraulic;
  const pressure = readings.map(r => [feet(r.altKm), r.ata + offsetAta]);
  const top = pressure.at(-1)[0];
  const heights = new Set([...old.map(n => n.altFt), ...pressure.map(p => p[0])]);
  const curve = [...heights].sort((a, b) => a - b).map(altFt => {
    // Beyond the last plate reading, retain the previous pressure lapse relative
    // to the measured endpoint. The operating profile labels this extrapolation.
    const measuredAta = altFt <= top ? B.interpolate(pressure, altFt, 1) :
      pressure.at(-1)[1] * M.isa(altFt).p / M.isa(top).p;
    const previous = M.shaftPower({ powerRatings: { combat: model.climbPowerRatings.combat } }, altFt, 'combat', 'hydraulic');
    const ata = Math.min(spec.combat.map, measuredAta);
    return { altFt, mapInHg: ata, engineRpm: spec.combat.rpm,
      bhp: previous.bhp * (ata / previous.mapInHg) ** spec.pressureExponent };
  });
  return { ...model, climbPowerRatings: { ...model.climbPowerRatings, combat: { gears: { hydraulic: curve } } } };
}

module.exports = { readPressure, withMeasuredPressure, sources };
