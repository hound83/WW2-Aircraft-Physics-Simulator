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

  // Taper the transfer inside the measured envelope. Smoothstep keeps both
  // the value and its slope continuous where the default takes over.
  function windowShare(value, [min, max], fade) {
    const t = Math.max(0, Math.min(1, (value - min) / fade, (max - value) / fade));
    return t * t * (3 - 2 * t);
  }

  function scenario(M, aircraft, source, altFt, tasMph, options = {}) {
    if (options.profile !== 'P' || aircraft.stallIdentity?.aircraftId !== 'p51b' ||
        aircraft.stallIdentity.specimen !== '43-24777' ||
        options.clMax !== undefined || options.maneuverClMax !== undefined ||
        options.storesWeightLb || options.addedDragAreaM2) return null;
    const {altitudeFadeFt=650,machFade=.01} = source;
    const altitudeShare = windowShare(altFt, source.altitudeWindowFt, altitudeFadeFt);
    const weightLb = options.weightLb ?? aircraft.weightLb;
    if (!(altitudeShare > 0 && Number.isFinite(weightLb) && weightLb > 0)) return null;
    const scale = source.sourceAreaFt2 * FT2 / aircraft.wingAreaM2;
    const defaultCl = aircraft.clMaxAssumed;
    const easForCl = cl => Math.sqrt(2 * weightLb * 4.4482216153 /
      (1.225 * aircraft.wingAreaM2 * cl)) / .44704;
    const stallEas = easForCl(source.cleanStallClMax * scale);
    const stallMach = M.airspeeds(M.tasFrom(stallEas, 'EAS', altFt), altFt).mach;
    const stallShare = altitudeShare * windowShare(stallMach, source.cleanStallMachWindow, machFade);
    if (!(stallShare > 0)) return null;
    const mach = M.airspeeds(tasMph, altFt).mach;
    const sample = lookup(source.nodes, mach);
    const maneuverShare = stallShare *
      windowShare(mach, [source.nodes[0][0], source.nodes.at(-1)[0]], machFade);
    const mix = (cl, share) => defaultCl + (cl * scale - defaultCl) * share;
    return {
      clMax: mix(source.cleanStallClMax, stallShare),
      maneuverClMax: sample && maneuverShare > 0 ? mix(sample[0], maneuverShare) : null,
      maneuverBracket: sample && maneuverShare > 0 ?
        sample.slice(1).map(cl => mix(cl, maneuverShare)) : null,
      stallEasRange: source.cleanStallBracket.map(cl => easForCl(mix(cl, stallShare))).reverse(),
    };
  }

  function optionsFor(M, aircraft, source, altFt, tasMph, options) {
    const result = scenario(M, aircraft, source, altFt, tasMph, options);
    if (!result) return options;
    return {...options, clMax: result.clMax,
      maneuverClMax: result.maneuverClMax ?? aircraft.clMaxAssumed,
      stallLiftEvidence: {range: result.stallEasRange, maneuver: result.maneuverClMax !== null}};
  }

  return Object.freeze({scenario, optionsFor});
});
