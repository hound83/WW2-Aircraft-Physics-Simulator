'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const Turn = require('../../src/turn-performance.js');
const lift = require('../../references/p51-turn-lift-tn1044.json');
const source = require('../../references/analysis/powered-turn-evidence-2026-11-13.json');

const G = 9.80665;
const FT = .3048;
const MPH = .44704;
const KMH_PER_MPH = 1.609344;
const KG_PER_LB = .45359237;
const RAD = Math.PI / 180;

function replay(data, record = source.finnish) {
  const c = record.conditions;
  const { nominal, massRangeKg, casOffsetsKmh } = record.replay;
  const model = data.models[record.modelId];
  // The intake remains speed/climb-only in the live matchup. This fixed case
  // evaluates the same aircraft and solver at the recorded speed.
  const spec = { ...data.specification.aircraft[record.modelId], performanceIntake:false };
  const altFt = nominal.pressureAltitudeM / FT;
  const phase = { ...spec.combat, key:'combat', rpm:nominal.engineRpm, map:nominal.manifoldAta,
    powerFactor:spec.combat.powerFactor * nominal.engineRpm / spec.combat.rpm };
  if (c.startKmh !== c.endKmh) throw Error('The steady replay requires matching speed endpoints');
  const observedRate = c.headingChangeDeg / c.elapsedSeconds;
  const bankLoad = 1 / Math.cos(c.bankDeg * RAD);
  const impliedTasKmh = 3.6 * G * Math.tan(c.bankDeg * RAD) / (observedRate * RAD);
  const impliedCasKmh = M.airspeeds(impliedTasKmh / KMH_PER_MPH,altFt).cas * KMH_PER_MPH;
  const sample = ({ massKg, offsetKmh, openCooling, assumedBasis = 'CAS' }) => {
    const tasMph = M.tasFrom((c.startKmh + offsetKmh) / KMH_PER_MPH,assumedBasis,altFt);
    const easMph = M.airspeeds(tasMph,altFt).eas;
    const settings = { mode:'combat', fuelFraction:.5, openCooling };
    const weightLb = massKg / KG_PER_LB;
    const flight = B.evaluate(M,T,lift,model,spec,settings,altFt,easMph,weightLb,phase);
    const budget = Turn.state(flight);
    if (!budget?.turn) throw Error('Powered-turn replay has no supported flight state');
    const v = tasMph * MPH;
    const timeLoad = Math.hypot(1,observedRate * RAD * v / G);
    const bankTurn = Turn.turnFromLoad(bankLoad,tasMph);
    const atLoad = g => M.dragBreakdown(model.ac,altFt,tasMph,weightLb,flight.cd0,flight.oswald,g).requiredHp;
    const loads = { timeLoad, bankLoad, reportedLoad:c.reportedG };
    const powerAtLoad = Object.fromEntries(Object.entries(loads).map(([key,g]) => {
      const requiredHp = atLoad(g);
      return [key,{ g, requiredHp, excessHp:budget.availableHp - requiredHp }];
    }));
    const independentRate = G * Math.tan(budget.turn.bankDeg * RAD) / v / RAD;
    const separateDrag = budget.levelHp + flight.drag.inducedHp * (timeLoad ** 2 - 1);
    const seconds = c.headingChangeDeg / budget.turn.rateDegSec;
    return {
      massKg, offsetKmh, openCooling, assumedBasis, tasMph, easMph,
      turn:budget.turn, limiting:budget.limiting, liftLimitG:budget.nLift, seconds,
      residuals:{ seconds:seconds - c.elapsedSeconds, rateDegSec:budget.turn.rateDegSec - observedRate,
        gFromTime:budget.turn.g - timeLoad, gFromBank:budget.turn.g - bankLoad, gFromReported:budget.turn.g - c.reportedG },
      observedGeometry:{ timeLoad, bankLoad, rateAtBank:bankTurn.rateDegSec,
        secondsAtBank:c.headingChangeDeg / bankTurn.rateDegSec, impliedTasKmh, impliedCasKmh,
        radiusFromTimeM:v / (observedRate * RAD) },
      power:{ shaftBhp:flight.power.shaftHp, availableHp:budget.availableHp, levelHp:budget.levelHp,
        atModeledLimitHp:atLoad(budget.turn.g), atSourceLoads:powerAtLoad },
      formula:{ rateDifferenceDegSec:Math.abs(independentRate - budget.turn.rateDegSec),
        dragDifferenceHp:Math.abs(separateDrag - powerAtLoad.timeLoad.requiredHp),
        equilibriumDifferenceHp:Math.abs(budget.availableHp - atLoad(budget.turn.g)) }
    };
  };
  const atNominal = (openCooling,assumedBasis) => sample({
    massKg:nominal.massKg, offsetKmh:nominal.casMinusIasKmh, openCooling, assumedBasis
  });
  const clean = atNominal(false), open = atNominal(true);
  const asTas = atNominal(false,'TAS');
  const scenarios = [false,true].flatMap(openCooling => massRangeKg.flatMap(massKg =>
    casOffsetsKmh.map(offsetKmh => sample({massKg,offsetKmh,openCooling}))));
  const range = key => {
    const values = scenarios.map(row => row[key]);
    return [Math.min(...values),Math.max(...values)];
  };
  const checks = [clean,open,asTas,...scenarios];
  return { observation:record, observedRateDegSec:observedRate, clean, open, asTas,
    scenarioRanges:{ seconds:range('seconds'), count:scenarios.length },
    scenarios:scenarios.map(({ massKg, offsetKmh, openCooling, turn, seconds }) =>
      ({massKg,offsetKmh,openCooling,g:turn.g,rateDegSec:turn.rateDegSec,seconds})),
    formula:{ cases:checks.length,
      maxRateDifferenceDegSec:Math.max(...checks.map(row=>row.formula.rateDifferenceDegSec)),
      maxDragDifferenceHp:Math.max(...checks.map(row=>row.formula.dragDifferenceHp)),
      maxPowerLimitedEquilibriumDifferenceHp:Math.max(...checks.filter(row=>row.limiting==='power')
        .map(row=>row.formula.equilibriumDifferenceHp)) }
  };
}

function browserEvidence(data) {
  return { ...replay(data), related:source.related };
}

module.exports = { replay, browserEvidence };
