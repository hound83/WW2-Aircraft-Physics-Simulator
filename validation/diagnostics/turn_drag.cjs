'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const Turn = require('../../src/turn-performance.js');
const Match = require('../../src/benchmark-matchup.js');
const Lift = require('../../src/turn-lift.js');
const liftSource = require('../../references/p51-turn-lift-tn1044.json');
const source = require('../../references/analysis/turn-drag-evidence-2026-11-13.json');
const frozen = require('../../references/analysis/v413-turn-drag-before.json');
const intakeFrozen = require('../../references/analysis/v413-turn-drag-intake-before.json');
const figure5 = require('../baseline/p51_power_required_source_v16.json');
const { tolerances } = require('../../scripts/fighter-value-selection.cjs');
const { browserData } = require('./shared_flight_climb.cjs');
const { addAircraftBatch } = require('../../scripts/aircraft-batch.cjs');
const { buildCatalog } = require('../../scripts/research-layer.cjs');
const { scorecard, caseSummary } = require('./operating_benchmark_v410.cjs');

const MPH = .44704;
const FPM_TO_MPS = .3048 / 60;
const LBF = 4.4482216153;
const FT2_TO_M2 = .09290304;
const HP = 745.699872;
const RHO0 = 1.225;
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const round = value => Number.isFinite(value) ? +value.toFixed(6) : null;
const sameNumbers = (a,b) => JSON.stringify(a) === JSON.stringify(b);

function inducedSlope(aircraft, polar) {
  return aircraft.wingAreaM2 / (Math.PI * polar.e * aircraft.spanM ** 2);
}

function readGlide([easMph, sinkFpm, role], { weightLb, wingAreaFt2 }) {
  const v = easMph * MPH;
  const sinGamma = sinkFpm * FPM_TO_MPS / v;
  const weightOverQS = weightLb * LBF / (.5 * RHO0 * v ** 2 * wingAreaFt2 * FT2_TO_M2);
  const cl = weightOverQS * Math.sqrt(1 - sinGamma ** 2);
  return { easMph, sinkFpm, role, weightOverQS, cl, cd: weightOverQS * sinGamma };
}

function fitPolar(rows, fixedSlope) {
  const x = mean(rows.map(r => r.cl ** 2)), y = mean(rows.map(r => r.cd));
  const k = fixedSlope ?? rows.reduce((sum,r) => sum + (r.cl ** 2 - x) * (r.cd - y), 0)
    / rows.reduce((sum,r) => sum + (r.cl ** 2 - x) ** 2, 0);
  return { k, cd0: y - k * x };
}

function glideSink({ weightOverQS: c, easMph }, { cd0, k }) {
  // c sin(gamma) = CD0 + k c² cos²(gamma). Use the positive, stable root.
  const a = cd0 / c + k * c;
  const sinGamma = 2 * a / (1 + Math.sqrt(1 + 4 * k * c * a));
  return sinGamma * easMph * MPH / FPM_TO_MPS;
}

function glideAudit(spitfire, glide = source.spitfireGlide) {
  const points = glide.observations.map(row => readGlide(row, glide));
  const fit = points.filter(r => r.role === 'fit');
  const nominalK = inducedSlope(spitfire.ac, spitfire.benchmarkPolar);
  const control = fitPolar(fit, nominalK);
  const candidate = fitPolar(fit);
  const fitOnlySlopes = fit.map((_, index) => fitPolar(fit.filter((_, i) => i !== index)).k);
  const slopeSensitivity = [Math.min(...fitOnlySlopes), Math.max(...fitOnlySlopes)];
  const clRange = [Math.min(...fit.map(r => r.cl)), Math.max(...fit.map(r => r.cl))];
  const rows = points.map(({weightOverQS, ...r}) => {
    const errors = polar => ({
      cd: polar.cd0 + polar.k * r.cl ** 2 - r.cd,
      sinkFpm: glideSink({weightOverQS, easMph:r.easMph}, polar) - r.sinkFpm
    });
    return {...r, control:errors(control), candidate:errors(candidate)};
  });
  const checks = rows.filter(r => r.role === 'check');
  const maeFpm = key => mean(checks.map(r => Math.abs(r[key].sinkFpm)));
  const transfer = { minCl:clRange[0], maxCl:clRange[1], dragFraction:candidate.k / nominalK };
  return {
    source:glide.url, fitCount:fit.length, checkCount:checks.length, control, candidate, clRange,
    slopeSensitivity, rows, checks:{controlMaeFpm:maeFpm('control'), candidateMaeFpm:maeFpm('candidate'),
      controlMeanAbsoluteErrorPct:100 * mean(checks.map(r => Math.abs(r.control.sinkFpm) / r.sinkFpm)),
      candidateMeanAbsoluteErrorPct:100 * mean(checks.map(r => Math.abs(r.candidate.sinkFpm) / r.sinkFpm))},
    transfer,
    qualification:'Same-report glide shape check. The fit-only sensitivity tests omission of a fit point. The installed Mk I slope is a provisional transfer.'
  };
}

function levelPowerCheck(model, report = figure5) {
  const { ac, benchmarkPolar:polar } = model;
  const {altitudeFt, nominalWeightLb} = report;
  const rows = report.points.map(({tasMph, testBhp, engineRpm, gear}) => {
    // Preserve the report's chart power and gear, plus the live polar and any applicable fast-flight correction.
    const replay = {...ac, powerRatings:{[ac.calibration.rating]:{gears:{[gear]:[{altFt:altitudeFt,bhp:testBhp,engineRpm}]}}}};
    const flight = M.evaluated(replay, altitudeFt, tasMph, {
      ...model.options, polar, rating:ac.calibration.rating, gear, weightLb:nominalWeightLb
    });
    const {eta} = flight.prop;
    const requiredShaftBhp = flight.power.requiredHp / eta;
    return {tasMph, testBhp, engineRpm, gear, oneGDragHp:flight.power.requiredHp,
      eta, requiredShaftBhp, errorBhp:requiredShaftBhp - testBhp, oneGCl:flight.drag.CL};
  });
  return {source:report.url, altitudeFt, nominalWeightLb, uncertainties:report.uncertainties, rows,
    maeBhp:mean(rows.map(r => Math.abs(r.errorBhp))),
    meanAbsoluteErrorPct:100 * mean(rows.map(r => Math.abs(r.errorBhp) / r.testBhp))};
}

function fixedProbe(flight, state) {
  return [flight.status, round(flight.weightLb), round(flight.tasMph), round(state?.levelHp),
    round(flight.drag?.inducedHp), round(state?.availableHp), round(state?.nLift), round(state?.nPower),
    round(state?.turn?.g), round(state?.turn?.rateDegSec), state?.limiting ?? null];
}

function matchup(data, transfer, settings = frozen.case) {
  const {altFt, ids, easMph} = settings;
  const {models,specification,turnEvidence} = data;
  const policy = turnEvidence.sensitivity;
  const turnMargin = tolerances.sustained_turn_rate.spread;
  return easMph.map(eas => {
    const flights = ids.map(id => {
      const spec = specification.aircraft[id];
      return B.evaluate(M,Lift,liftSource,models[id],spec,settings,altFt,eas,
        B.load(spec,specification.policy,settings).weightLb);
    });
    const assessments = flights.map(f => Turn.assessment(f,policy));
    const nominal = assessments.map(x => x.nominal);
    const probes = nominal.map((s,i) => fixedProbe(flights[i],s));
    const baseline = Turn.difference(...assessments);
    const sensitivity = baseline && flights.map((f,i) =>
      Turn.dragSensitivity(f, nominal[i], nominal[1-i].turn.g, policy.incrementalDragFraction));
    const dragOnly = sensitivity && Turn.difference(...sensitivity);
    const donor = Turn.boundedDragTurn(flights[1],transfer);
    const mustangRate = nominal[0]?.turn?.rateDegSec;
    return {easMph:eas, probes, baseline, dragOnly, parity:sensitivity?.map(x => x.parity) ?? null,
      dragOnlyVerdict:Match.turnVerdict(dragOnly?.range,turnMargin),
      donor, donorDeltaDegSec:donor && !donor.lowerBound && Number.isFinite(mustangRate) ? mustangRate - donor.turn.rateDegSec : null,
      modelK:ids.map(id => inducedSlope(models[id].ac,models[id].benchmarkPolar)),
      oneGCl:flights.map(f => f.drag?.CL ?? null),
      nominalTurnCl:flights.map((f,i) => nominal[i]?.turn ? f.drag.CL * nominal[i].turn.g : null)};
  });
}

function run(data = addAircraftBatch(browserData(),buildCatalog())) {
  const glide = glideAudit(data.models.spitfire_lfix_bs543);
  const sweeps = matchup(data,glide.transfer);
  const current = scorecard(data);
  const previous = new Map(frozen.scorecard.map(r => [r.id,r]));
  const earlierAircraft = current.filter(r => previous.has(r.id));
  const intakeAircraft = current.filter(r => !previous.has(r.id));
  return {
    schema:'ww2-turn-drag/v1', version:require('../../package.json').version,
    baselineCommit:frozen.commit, inputPack:frozen.inputPack, case:frozen.case, fixedColumns:frozen.fixedColumns,
    historicalPoweredTurns:source.matchedPoweredTurnRecords,
    figure5:levelPowerCheck(data.models.p51b), glide, sweeps,
    regression:{
      exactScorecardParity:sameNumbers(earlierAircraft,frozen.scorecard),
      exactFixedProbeParity:sameNumbers(sweeps.map(r => [r.easMph,...r.probes]),frozen.fixed),
      exactIntakeParity:sameNumbers(intakeAircraft,intakeFrozen.scorecard),
      intakeBaselineCommit:intakeFrozen.commit,
      aircraft:earlierAircraft.map(row => caseSummary(previous.get(row.id),row)),
      intakeAircraft:intakeAircraft.map(row => caseSummary(intakeFrozen.scorecard.find(r => r.id === row.id),row))
    }
  };
}

function browserEvidence(models) {
  const {ids,altFt,mode,fuelFraction,injection,easMph} = frozen.case;
  const glide = glideAudit(models[ids[1]]);
  const adverse = glide.rows.filter(r => r.role === 'check').reduce((a,b) =>
    Math.abs(a.candidate.sinkFpm) > Math.abs(b.candidate.sinkFpm) ? a : b);
  return {
    replay:{ids,altFt,mode,fuelFraction,injection,speedRangeMph:[easMph[0],easMph.at(-1)]},
    glide:{title:source.spitfireGlide.title,url:glide.source,transfer:glide.transfer,k:glide.candidate.k,
      checkCount:glide.checkCount,checks:glide.checks,adverse:{easMph:adverse.easMph,errorFpm:adverse.candidate.sinkFpm}},
    sources:source.related
  };
}

module.exports = { glideAudit, levelPowerCheck, matchup, run, browserEvidence };
if (require.main === module) console.log(JSON.stringify(run(),null,2));
