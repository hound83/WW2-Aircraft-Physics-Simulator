'use strict';
(function (root, factory) {
  const api = factory(typeof module === 'object' && module.exports ? require('./energy-configuration.js') : root.EnergyConfiguration);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ManeuverEnvelope = api;
})(globalThis, function (Energy) {
  function limit(result) {
    const l = result.limits;
    if (!l) return result.status;
    if (l.nInst === null) return 'stall';
    if (l.nSust === null) return 'level power deficit';
    if (l.nPower <= l.nInst) return 'power';
    return l.nLift <= l.structG ? 'lift' : 'structure';
  }

  function state(M, turn, source, model, altFt, easMph, rating, weightLb) {
    const tas = M.tasFrom(easMph, 'EAS', altFt);
    const {ac} = model;
    const options = turn.optionsFor(M, ac, source, altFt, tas, {...model.options, rating, weightLb});
    const evaluate = opts => model.energyConfiguration
      ? Energy.evaluate(M, {...model, options: opts}, altFt, tas, rating, weightLb, model.energyConfiguration)
      : M.evaluated(ac, altFt, tas, opts);
    const result = evaluate(options);
    const band = [];
    if (result.limits) {
      const lift = result.limits.maneuverClMax ?? result.clMax;
      const minLift = Math.min(lift * .95, model.poweredClMax ?? Infinity);
      const maxLift = Math.max(lift * 1.05, model.poweredClMax ?? 0);
      const stallLift = options.clMax ?? ac.clMaxAssumed;
      for (const [clMax, stallCl, powerScale] of [
        [minLift, Math.min(stallLift * .95, ac.clMaxAssumed), .97],
        [maxLift, Math.max(stallLift * 1.05, model.poweredClMax ?? 0), 1.03]
      ]) {
        const sample = evaluate({...options, maneuverClMax: clMax,
          clMax: stallCl, propulsivePowerScale: powerScale});
        // A state that cannot sustain level flight contributes zero turn capability.
        band.push(sample.limits?.nSust === null ? 0 : sample.limits?.sustDegSec ?? null);
      }
    }
    if (model.parameterCandidates && result.limits) {
      const rates = [...band];
      for (const candidate of model.parameterCandidates) {
        const isolated = {...ac, propGeometry: {...ac.propGeometry,
          momentumModel: {...ac.propGeometry.momentumModel, retainedPowerFraction: candidate.retained}}};
        const opts = {...M.workingOptions(isolated, {e: candidate.e}), rating, weightLb, clMax: candidate.clMax};
        const predicted = model.energyConfiguration
          ? Energy.evaluate(M, {ac: isolated, options: opts}, altFt, tas, rating, weightLb, model.energyConfiguration)
          : M.evaluated(isolated, altFt, tas, opts);
        if (predicted.limits) rates.push(predicted.limits.sustDegSec ?? 0);
      }
      band.splice(0, band.length, Math.min(...rates), Math.max(...rates));
    }
    return {name: ac.name, weightLb, rating: result.engine?.rating ?? rating,
      configuration: model.energyFallback ? 'reference outside source range' : result.energyConfiguration?.id ?? 'reference', gear: result.engine?.gear ?? null, limit: limit(result),
      stallEasMph: result.stallEasMph ?? null, instantG: result.limits?.nInst ?? null,
      sustainedG: result.limits?.nSust ?? null, sustainedDegSec: result.limits?.sustDegSec ?? null,
      climbFpm: result.power?.climbFpm ?? null, shaftHp: result.power?.shaftHp ?? null,
      propulsiveHp: result.power?.propulsiveHp ?? null, band};
  }

  function separation(a, b) {
    if (![...a.band, ...b.band].every(Number.isFinite) || a.band.length !== 2 || b.band.length !== 2) return null;
    return {min: a.band[0] - b.band[1], max: a.band[1] - b.band[0]};
  }

  function climbBand(M, model, startFt, endFt, rating, startWeightLb, fuelPerHpHour, segments = 10) {
    if (!(segments > 0 && Number.isInteger(segments) && endFt > startFt && Number.isFinite(fuelPerHpHour) && fuelPerHpHour >= 0 && startWeightLb > 0)) throw Error("Invalid climb integration");
    const transitionFt = [...(model.ac.ratedInlet?.[rating]?.gears ?? []), ...(model.energyConfiguration?.branches ?? [])].map(gear => gear.maxFt)
      .filter(alt => alt > startFt && alt < endFt);
    const edges = [...new Set(Array.from({length: segments + 1}, (_, i) =>
      startFt + i * (endFt - startFt) / segments).concat(transitionFt))].sort((a, b) => a - b);
    let weightLb = startWeightLb;
    let minutes = 0;
    for (let i = 0; i < edges.length - 1; i++) {
      const dh = edges[i + 1] - edges[i];
      const alt = (edges[i + 1] + edges[i]) / 2;
      const options = {...model.options, rating, weightLb, stepMph: 3};
      const best = weight => model.energyConfiguration
        ? Energy.bestClimb(M, model, alt, rating, weight, model.energyConfiguration, 3)
        : M.bestClimb(model.ac, alt, {...options, weightLb: weight});
      const start = best(weightLb);
      if (!(start.climbFpm > 0)) return null;
      const halfFuel = fuelPerHpHour * start.shaftHp * dh / start.climbFpm / 120;
      if (!(weightLb - 2 * halfFuel > 0)) return null;
      const midpoint = halfFuel ? best(weightLb - halfFuel) : start;
      if (!(midpoint.climbFpm > 0)) return null;
      const dt = dh / midpoint.climbFpm;
      weightLb -= fuelPerHpHour * midpoint.shaftHp * dt / 60;
      minutes += dt;
    }
    return {minutes, endWeightLb: weightLb, fuelUsedLb: startWeightLb - weightLb};
  }
  return {state, separation, climbBand};
});
