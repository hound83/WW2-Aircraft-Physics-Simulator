'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.UniversalTurnLift = api;
})(globalThis, function () {
  const FT2 = .09290304;

  function lookup(nodes, mach) {
    const i = nodes.findIndex(row => row[0] >= mach);
    if (i < 0 || mach < nodes[0][0]) return null;
    const hi = nodes[i];
    if (hi[0] === mach) return hi.slice(1);
    const lo = nodes[i - 1];
    const fraction = (mach - lo[0]) / (hi[0] - lo[0]);
    return lo.slice(1).map((value, k) => value + fraction * (hi[k + 1] - value));
  }

  function scenario(M, aircraft, source, altFt, tasMph, options = {}) {
    if (options.profile !== 'P' || aircraft.stallIdentity?.aircraftId !== 'p51b' ||
        aircraft.stallIdentity.specimen !== '43-24777' ||
        options.clMax !== undefined || options.maneuverClMax !== undefined ||
        options.storesWeightLb || options.addedDragAreaM2) return null;
    const [minAlt, maxAlt] = source.altitudeWindowFt;
    if (!(altFt >= minAlt && altFt <= maxAlt)) return null;
    const weightLb = options.weightLb ?? aircraft.weightLb;
    const stallEas = Math.sqrt(2 * weightLb * 4.4482216153 /
      (1.225 * source.sourceAreaFt2 * FT2 * source.cleanStallClMax)) / .44704;
    const stallMach = M.airspeeds(M.tasFrom(stallEas, 'EAS', altFt), altFt).mach;
    const [minMach, maxMach] = source.cleanStallMachWindow;
    if (!(stallMach >= minMach && stallMach <= maxMach)) return null;
    const sample = lookup(source.nodes, M.airspeeds(tasMph, altFt).mach);
    const scale = source.sourceAreaFt2 * FT2 / aircraft.wingAreaM2;
    return {clMax: source.cleanStallClMax * scale,
      maneuverClMax: sample ? sample[0] * scale : null,
      maneuverBracket: sample ? sample.slice(1).map(value => value * scale) : null};
  }

  function optionsFor(M, aircraft, source, altFt, tasMph, options) {
    const result = scenario(M, aircraft, source, altFt, tasMph, options);
    if (!result) return options;
    return {...options, clMax: result.clMax,
      maneuverClMax: result.maneuverClMax ?? aircraft.clMaxAssumed};
  }

  return Object.freeze({scenario, optionsFor});
});
