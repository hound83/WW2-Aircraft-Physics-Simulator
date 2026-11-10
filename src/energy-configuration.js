'use strict';
(function(root, factory) {
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  else root.EnergyConfiguration = api;
})(globalThis, function() {
  const HP = 745.6998716;
  const MPH = .44704;

  function interpolate(nodes, altitude) {
    if (!nodes?.length || altitude < nodes[0].altFt || altitude > nodes.at(-1).altFt) return null;
    const highIndex = nodes.findIndex(row => row.altFt >= altitude);
    const high = nodes[highIndex];
    if (high.altFt === altitude) return {...high};
    const low = nodes[highIndex - 1];
    const fraction = (altitude - low.altFt) / (high.altFt - low.altFt);
    return Object.fromEntries(Object.keys(low).map(key => [key,
      typeof low[key] === 'number' && typeof high[key] === 'number'
        ? low[key] + fraction * (high[key] - low[key]) : low[key]]));
  }


  function fractionAt(nodes, altitude) {
    const high = nodes.findIndex(row => row.altFt >= altitude);
    const index = high < 0 ? nodes.length - 1 : Math.max(1, high);
    const low = nodes[index - 1], upper = nodes[index];
    return Math.max(0, Math.min(.25, low.fraction + (upper.fraction-low.fraction) *
      (altitude-low.altFt)/(upper.altFt-low.altFt)));
  }

  function prepare(M, model, altFt, rating, weightLb, configuration) {
    if (!(Number.isFinite(altFt) && altFt >= 0 && altFt <= 36089 && Number.isFinite(weightLb) && weightLb > 0)) return null;
    const base = {...model.options, profile: 'P', rating, weightLb};
    if (!configuration) return {ac: model.ac, options: base, status: 'reference'};
    if (!configuration.id || !configuration.source || !Array.isArray(configuration.branches)) return null;
    if (configuration.identity && Object.entries(configuration.identity).some(([key, value]) =>
      model.ac.stallIdentity?.[key] !== value)) return null;
    const branch = configuration.branches.findLast(row =>
      (rating === 'source-schedule' || row.rating === rating) && altFt >= row.minFt && altFt <= row.maxFt);
    if (!branch) return null;
    const selected = branch.rating;
    const options = {...M.workingOptions(model.ac), ...base, rating: selected, gear: branch.gear};
    delete options.flightCooling;
    if (branch.engineModel) options.engineModel = branch.engineModel;
    let ac = model.ac;
    if (branch.powerNodes) {
      const power = interpolate(branch.powerNodes, altFt);
      if (!power || !(power.bhp > 0 && Number.isFinite(power.bhp) && branch.engineRpm > 0)) return null;
      ac = {...ac, propGeometry: {...ac.propGeometry,
        ...(branch.reductionRatioEnginePerProp ? {reductionRatioEnginePerProp: branch.reductionRatioEnginePerProp} : {}),
        engineRpmByRating: {...ac.propGeometry.engineRpmByRating, [selected]: branch.engineRpm}},
        powerRatings: {[selected]: {gears: {[branch.gear]: [{altFt, bhp: power.bhp, engineRpm: branch.engineRpm}]}}}};
      delete options.engineModel;
      delete options.engineCondition;
    }
    if (model.options.polar) options.polar = model.options.polar;
    return {ac, options, branch, status: 'energy-configuration'};
  }

  function evaluate(M, model, altFt, tasMph, rating, weightLb, configuration) {
    const prepared = prepare(M, model, altFt, rating, weightLb, configuration);
    if (!prepared) return {status: 'outside-energy-configuration'};
    const {ac, options, branch} = prepared;
    const raw = M.evaluated(ac, altFt, tasMph, options);
    if (!raw.power || !branch?.loss) return raw;
    const {areaM2, offDesign, fractionNodes} = branch.loss;
    let powerFraction = branch.loss.powerFraction;
    if (fractionNodes && (fractionNodes.length < 2 || fractionNodes.some((row,i)=>!Number.isFinite(row.fraction)||!Number.isFinite(row.altFt)||(i>0&&row.altFt<=fractionNodes[i-1].altFt)))) return {status: 'invalid-energy-loss'};
    if (fractionNodes) powerFraction = fractionAt(fractionNodes, altFt);
    if (offDesign) powerFraction += Math.min(.25,offDesign.strength*(raw.prop.J-offDesign.center)**2/raw.prop.Cp*
      Math.max(0,Math.min(1,(offDesign.maxJ+offDesign.fadeJ-raw.prop.J)/offDesign.fadeJ)));
    if (!(Number.isFinite(areaM2) && areaM2 >= 0 && areaM2 <= .9 &&
      Number.isFinite(powerFraction) && powerFraction >= -.08 && powerFraction <= .25)) return {status: 'invalid-energy-loss'};
    const areaLoss = Math.max(0, powerFraction) * raw.power.propulsiveHp * HP / (raw.drag.q * tasMph * MPH);
    const result = M.evaluated(ac, altFt, tasMph, {...options,
      addedDragAreaM2: (options.addedDragAreaM2 ?? 0) + areaM2 + areaLoss,
      propulsivePowerScale: (options.propulsivePowerScale ?? 1) * (1 - Math.min(0, powerFraction))});
    return {...result, energyConfiguration: {id: configuration.id, source: configuration.source,
      interpretation: 'Equivalent installed energy adjustment, physical contributions not individually identified',
      areaM2, powerFraction, powerBasis: branch.powerBasis}};
  }

  function bestClimb(M, model, altFt, rating, weightLb, configuration, stepMph = 2) {
    let best = null;
    const low = configuration?.minTasMph ?? 110;
    const high = configuration?.maxTasMph ?? 320;
    for (let tas = low; tas <= high; tas += stepMph) {
      const r = evaluate(M, model, altFt, tas, rating, weightLb, configuration);
      if (r.status !== 'modelled' || !Number.isFinite(r.power?.climbFpm)) continue;
      if (!best || r.power.climbFpm > best.climbFpm) best = {tasMph: tas,
        climbFpm: r.power.climbFpm, shaftHp: r.power.shaftHp};
    }
    return best ?? {status: 'outside-energy-configuration'};
  }
  return Object.freeze({interpolate, fractionAt, prepare, evaluate, bestClimb});
});
