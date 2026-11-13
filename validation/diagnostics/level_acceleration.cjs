'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const { browserData } = require('./shared_flight_climb.cjs');
const { addAircraftBatch } = require('../../scripts/aircraft-batch.cjs');
const { buildCatalog } = require('../../scripts/research-layer.cjs');
const { scorecard, caseSummary } = require('./operating_benchmark_v410.cjs');
const source = require('../../references/analysis/level-acceleration-evidence-2026-11-13.json');
const frozen = require('../../references/analysis/v414-level-acceleration-before.json');

const MPH = .44704;
const KNOT = 1852 / 3600;
const FT = .3048;
const HP = 745.6998716;
const LB = .45359237;
const G = 9.80665;
const R = 287.05287;
const round = n => Number.isFinite(n) ? +n.toFixed(6) : null;
const fixed = { mode:'normal', fuelFraction:.5 };

function densityAltitude(pressureAltitudeFt, temperatureK) {
  const density = M.isa(pressureAltitudeFt).p / (R * temperatureK);
  let low = 0, high = 40000;
  if (density > M.isa(low).rho || density < M.isa(high).rho) {
    throw Error('Report density is outside the shared ISA solver domain');
  }
  for (let i = 0; i < 45; i++) {
    const mid = (low + high) / 2;
    if (M.isa(mid).rho > density) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

function directAcceleration(flight) {
  // Independent form of the shared specific-energy equation, using force and mass.
  const speedMps = flight.tasMph * MPH;
  return (flight.power.propulsiveHp * HP / speedMps - flight.drag.drag) /
    (flight.weightLb * LB * MPH);
}

function timerQuadrature(at, from, to, easPerTas) {
  // Integrate dt = dV / a in speed space, independently of the time stepper.
  const panels = 512, width = (to - from) / panels;
  let seconds = 0;
  for (let i = 0; i < panels; i++) {
    const point = at(from + (i + .5) * width);
    const rate = point.status === 'modelled' ? directAcceleration(point) * easPerTas : 0;
    if (!(rate > 0)) return null;
    seconds += width / rate;
  }
  return seconds;
}

function replay(data, assumptions = {}, report = source.restoredMustang) {
  const { endpoints, conditions } = report;
  const donor = source.wartimeMustang;
  const { pressureAltitudeFt, weightLb, commonCasMinusIasKnots } = { ...source.proxy.nominal, ...assumptions };
  const { outsideAirTempF = conditions.outsideAirTempF, shaftPowerFactor = 1, audit = false } = assumptions;
  const { rpm, gear, mapInHg } = donor.conditions;
  const shaftBhp = donor.point.shaftBhp * shaftPowerFactor;
  const temperatureK = (outsideAirTempF - 32) * 5 / 9 + 273.15;
  const temperatureFactor = Math.sqrt(temperatureK / M.isa(pressureAltitudeFt).T);
  const densityAltitudeFt = densityAltitude(pressureAltitudeFt,temperatureK);
  const atDensity = M.isa(densityAltitudeFt);
  const easPerTas = Math.sqrt(atDensity.sigma);
  const easFor = knots => M.tasFrom((knots + commonCasMinusIasKnots) * KNOT / MPH,'CAS',pressureAltitudeFt) *
    temperatureFactor * easPerTas;
  const toProxyKnots = eas => M.airspeeds(eas / (easPerTas * temperatureFactor),pressureAltitudeFt).cas * MPH / KNOT -
    commonCasMinusIasKnots;
  const endpointsEasMph = [endpoints.startKnots,endpoints.endKnots].map(easFor);
  const endpointsTasMph = endpointsEasMph.map(eas => eas / easPerTas);

  // Use a fixed report-case mass and fixed pressure-altitude power at the
  // equivalent density. The regular aircraft profile stays outside this case.
  const { models, specification } = data;
  const base = models[donor.modelId], original = specification.aircraft[donor.modelId];
  const spec = { ...original, referenceWeightLb:weightLb, serviceLoadDeltaLb:0, injection:undefined,
    referenceFuelUSGal:original.fuelCapacityUSGal * fixed.fuelFraction,
    normal:{ ...original.normal, gear, rpm, map:mapInHg, nativeRating:'normal', powerFactor:1, seconds:null } };
  const ac = { ...base.ac, ratedInlet:undefined, powerRatings:{ normal:{ gears:{ [gear]:[
    { altFt:densityAltitudeFt, bhp:shaftBhp, engineRpm:rpm, mapInHg }
  ] } } } };
  const model = { ...base, ac, cleanLevelPropellers:undefined };
  const policy = { ...specification.policy, bsfcLbPerHpHour:0 };
  const integrate = stepSeconds => B.accelerate(M,T,L,model,spec,policy,fixed,densityAltitudeFt,
    ...endpointsEasMph,{ stepSeconds });
  const timed = integrate(.5);
  const at = eas => B.evaluate(M,T,L,model,spec,fixed,densityAltitudeFt,eas,weightLb);
  const target = at(endpointsEasMph[1]);
  const energyJ = .5 * weightLb * LB * ((endpointsTasMph[1] * MPH) ** 2 - (endpointsTasMph[0] * MPH) ** 2);
  const meanExcessHp = seconds => seconds > 0 ? round(energyJ / (seconds * HP)) : null;

  const residualSeconds = timed.seconds === null ? null : timed.seconds - endpoints.elapsedSeconds;
  const result = {
    status:timed.status, seconds:round(timed.seconds), residualSeconds:round(residualSeconds),
    residualPct:residualSeconds === null ? null : round(100 * residualSeconds / endpoints.elapsedSeconds),
    pressureAltitudeFt, outsideAirTempF, densityAltitudeFt:round(densityAltitudeFt),
    temperatureFactor:round(temperatureFactor), weightLb, shaftBhp, rpm, mapInHg, gear,
    commonCasMinusIasKnots, endpointsEasMph:endpointsEasMph.map(round), endpointsTasMph:endpointsTasMph.map(round),
    observedEquivalentMeanExcessHp:meanExcessHp(endpoints.elapsedSeconds), modeledMeanExcessHp:meanExcessHp(timed.seconds),
    maxTipMach:round(target.prop?.tipMach), tipLossOnset:ac.propGeometry.momentumModel.machOnset,
    trace:timed.trace.filter((_,i,rows) => i % 4 === 0 || i === rows.length - 1).map(point =>
      ({ seconds:round(point.seconds), value:round(toProxyKnots(point.easMph)), phase:point.phase, covered:false })),
  };
  if (audit) result.timerCheck = {
    stepSeconds:.5, fineStepSeconds:.125, fineSeconds:round(integrate(.125).seconds),
    speedQuadratureSeconds:round(timerQuadrature(at,...endpointsEasMph,easPerTas)),
  };
  return result;
}

function wartimeEquilibrium(data, intakeChecks) {
  const { modelId, point, conditions, ...evidence } = source.wartimeMustang;
  const spec = data.specification.aircraft[modelId];
  const { altFt, tasMph, weightLb } = point;
  const state = B.evaluate(M,T,L,data.models[modelId],spec,fixed,altFt,M.airspeeds(tasMph,altFt).eas,weightLb,
    { ...spec.normal, key:'normal', gear:conditions.gear });
  const check = intakeChecks.aircraft.find(row => row.id === modelId).level.find(row => row.mode === 'normal' && row.altFt === altFt);
  if (state.power?.shaftHp !== point.shaftBhp || check.observed !== tasMph) {
    throw Error('Wartime Normal power or speed no longer matches the source record');
  }
  return { ...evidence, conditions, point, observationId:check.id,
    equilibriumTasMph:check.predicted, equilibriumErrorMph:check.error,
    propulsiveHp:round(state.power.propulsiveHp), requiredHp:round(state.power.requiredHp),
    excessHp:round(state.power.excessHp), tasAccelerationMphPerSecond:round(B.levelAccelerationMphPerSecond(state)),
  };
}

function climbEquivalent(data) {
  const { modelId, rows, ...evidence } = source.spitfire;
  const points = data.flightChecks.find(check => check.id === modelId).rows;
  return { ...evidence, rows:rows.map(({ altFt, boostPsi, slopeFromFt, slopeToFt }) => {
    const row = points.find(point => point.altFt === altFt);
    const from = points.find(point => point.altFt === slopeFromFt);
    const to = points.find(point => point.altFt === slopeToFt);
    const tasMphPerKft = 1000 * (to.tasMph - from.tasMph) / (slopeToFt - slopeFromFt);
    const kineticMultiplier = 1 + row.tasMph * MPH * tasMphPerKft * MPH / (G * 1000 * FT);
    const equivalent = (fpm,multiplier = 1) => B.levelAccelerationMphPerSecond({
      status:'modelled',tasMph:row.tasMph,power:{ psMps:fpm * FT / 60 * multiplier },
    });
    const observed = equivalent(row.observed), modeled = equivalent(row.after);
    return {
      altFt, boostPsi, role:row.role, tasMph:row.tasMph, easMph:round(M.airspeeds(row.tasMph,altFt).eas),
      observedFpm:row.observed, modeledFpm:round(row.after), tasMphPerKft:round(tasMphPerKft),
      slopeFromFt, slopeToFt, verticalOnly:{ observed:round(observed),modeled:round(modeled),residual:round(modeled - observed) },
      withScheduleEnergy:{
        observed:round(equivalent(row.observed,kineticMultiplier)),modeled:round(equivalent(row.after,kineticMultiplier)),
        residual:round((modeled - observed) * kineticMultiplier),
      },
    };
  }) };
}

function browserEvidence(data, intakeChecks) {
  const nominal = replay(data,{ audit:true });
  const { weightLb, shaftPowerFactors, commonCasMinusIasKnots } = source.proxy.scenarios;
  const scenarios = weightLb.flatMap(weight => shaftPowerFactors.flatMap(shaftPowerFactor =>
    commonCasMinusIasKnots.map(offset => {
      const run = replay(data,{ weightLb:weight, shaftPowerFactor, commonCasMinusIasKnots:offset });
      return { weightLb:weight, shaftBhp:run.shaftBhp, commonCasMinusIasKnots:offset,
        status:run.status, seconds:run.seconds };
    })));
  const completed = scenarios.flatMap(row => row.status === 'reached' ? [row.seconds] : []);
  const scenarioRangeSeconds = completed.length ? [Math.min(...completed),Math.max(...completed)] : null;
  return { observation:source.restoredMustang, nominal, scenarios, scenarioRangeSeconds, scenarioInputs:source.proxy.scenarios,
    assumptions:source.proxy.assumptions, wartime:wartimeEquilibrium(data,intakeChecks), spitfire:climbEquivalent(data) };
}

function run(data, intakeChecks) {
  const beforeById = new Map(frozen.scorecard.map(row => [row.id,row]));
  const current = scorecard(data).filter(row => beforeById.has(row.id));
  const { altFt, probeEasMph, mode, fuelFraction, injection, openCooling } = frozen.condition;
  const settings = { mode, fuelFraction, injection, openCooling };
  const probe = [], formulaErrors = [];
  for (const { id } of current) {
    const model = data.models[id], spec = data.specification.aircraft[id];
    const weight = B.load(spec,data.specification.policy,settings).weightLb;
    const at = (alt,eas) => B.evaluate(M,T,L,model,spec,settings,alt,eas,weight);
    const flight = at(altFt,probeEasMph);
    probe.push([id,flight.status,round(flight.tasMph),round(flight.power?.shaftHp),
      round(flight.power?.propulsiveHp),round(flight.power?.requiredHp),round(B.levelAccelerationMphPerSecond(flight))]);
    for (const [alt,eas] of [[0,200],[altFt,probeEasMph],[20000,250]]) {
      const sample = at(alt,eas);
      const acceleration = B.levelAccelerationMphPerSecond(sample);
      if (acceleration !== null) formulaErrors.push(Math.abs(acceleration - directAcceleration(sample)));
    }
  }
  const evidence = browserEvidence(data,intakeChecks);
  const pressureISA = M.isa(evidence.nominal.pressureAltitudeFt);
  const standard = replay(data,{ outsideAirTempF:(pressureISA.T - 273.15) * 9 / 5 + 32 });
  const { trace, ...standardSummary } = standard;
  return {
    schema:'ww2-level-acceleration-replay/v1', version:require('../../package.json').version,
    baselineCommit:frozen.commit, inputPack:frozen.inputPack, condition:frozen.condition, probeColumns:frozen.probeColumns, probe,
    ...evidence, standardAtmosphereSensitivity:standardSummary, related:source.related,
    formulaCheck:{ checkedForceBalancePoints:formulaErrors.length, maxDifferenceMphPerSecond:Math.max(...formulaErrors) },
    regression:{
      exactScorecardParity:JSON.stringify(current) === JSON.stringify(frozen.scorecard),
      exactFixedProbeParity:JSON.stringify(probe) === JSON.stringify(frozen.probe),
      steadyPoints:current.reduce((count,row) => count + row.cases.length,0),
      timedAccelerations:current.reduce((count,row) => count + row.timed.length,0),
      timedClimbs:current.reduce((count,row) => count + row.climb.length,0),
      aircraft:current.map(row => caseSummary(beforeById.get(row.id),row)),
    },
  };
}

module.exports = { replay, browserEvidence, run };
if (require.main === module) {
  const base = browserData(), catalog = buildCatalog();
  const intake = require('./aircraft_intake.cjs').sourceChecks(base,catalog);
  console.log(JSON.stringify(run(addAircraftBatch(base,catalog),intake),null,2));
}
