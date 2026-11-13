'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { MPH, FT, LB, G, HP, physics, round, levelDragN } = require('./fighter-evidence-methods.cjs');
const anchors = require('../references/analysis/fighter-greg-drag-anchors-v1.json');
const cases = require('../aircraft/cases.json');

const releasePath = 'references/analysis/fighter-greg-drag-models-v1.json';
const buildFile = 'fighter-greg-drag-models.json';
const LBF = 4.4482216152605;
const PS_W = 735.49875;
const KMH_MPH = 1 / (3.6 * MPH);

function geometryFor(value) {
  if (typeof value === 'string') {
    const { wingAreaM2, spanM } = cases.aircraft[value];
    return { areaM2: wingAreaM2, spanM, basis: 'aircraft/cases.json#aircraft.' + value };
  }
  const { area, span, lengthUnit, basis } = value;
  const factor = lengthUnit === 'ft' ? FT : 1;
  return { areaM2: area * factor ** 2, spanM: span * factor, basis };
}

function flight(tasMph, altitudeFt, areaM2, massKg) {
  const v = tasMph * MPH;
  const atmosphere = physics.isa(altitudeFt);
  const qS = 0.5 * atmosphere.rho * v ** 2 * areaM2;
  return { v, qS, cl: massKg * G / qS, mach: v / atmosphere.a, densityKgM3: atmosphere.rho };
}

function terms(f, cd0, k) {
  const parasiteN = f.qS * cd0;
  const inducedN = f.qS * k * f.cl ** 2;
  const totalN = parasiteN + inducedN;
  return { parasiteN, inducedN, totalN, propulsiveHp: totalN * f.v / HP };
}

function worksheetRows({ id, speedMph }) {
  const { altFt, headers, reference } = cases.greg[id];
  return reference.map(values => {
    const row = Object.fromEntries(headers.map((header, i) => [header, values[i]]));
    const powerToForce = HP / (row.speedMph * MPH);
    return {
      tasMph: row.speedMph,
      altitudeFt: altFt,
      parasiteN: row.parasiteDragLbf === undefined ? row.parasitePowerHp * powerToForce : row.parasiteDragLbf * LBF,
      inducedN: row.inducedDragLbf === undefined ? row.inducedPowerHp * powerToForce : row.inducedDragLbf * LBF,
      totalN: row.totalDragLbf === undefined ? row.powerRequiredHp * powerToForce : row.totalDragLbf * LBF,
      role: row.speedMph === speedMph ? 'fit' : 'same-worksheet arithmetic check',
    };
  });
}

function range(values, digits) {
  return [round(Math.min(...values), digits), round(Math.max(...values), digits)];
}

function buildModel(input, label, observations) {
  const geometry = geometryFor(input.geometry);
  const { areaM2, spanM } = geometry;
  const aspectRatio = spanM ** 2 / areaM2;
  const massFactor = input.mass.unit === 'lb' ? LB : 1;
  const massKg = input.mass.nominal * massFactor;
  const worksheet = input.worksheet ? worksheetRows(input.worksheet) : [];
  const split = worksheet.find(row => row.role === 'fit');
  const speedFactor = input.speed?.unit === 'km/h' ? KMH_MPH : 1;
  const tasMph = split?.tasMph ?? input.speed.value * speedFactor;
  const altitudeFt = split?.altitudeFt ?? input.speed.altitude / (input.speed.altitudeUnit === 'm' ? FT : 1);
  const speedAllowance = (input.speed?.allowance ?? 0) * speedFactor;
  const bhpFactor = input.power?.unit === 'PS' ? PS_W / HP : 1;
  const shaftBhp = input.power ? input.power.nominal * bhpFactor : null;
  const eta = anchors.eta.nominal;
  const anchorFlight = flight(tasMph, altitudeFt, areaM2, massKg);

  function fit(speed, mass, power, efficiency, e) {
    const f = flight(speed, altitudeFt, areaM2, mass);
    if (split) return { cd0: split.parasiteN / f.qS, k: split.inducedN / (f.qS * f.cl ** 2) };
    const k = 1 / (Math.PI * e * aspectRatio);
    return { cd0: levelDragN(speed, power, efficiency) / f.qS - k * f.cl ** 2, k };
  }

  const nominal = fit(tasMph, massKg, shaftBhp, eta, anchors.oswald.nominal);
  const scenarios = [{ ...nominal, massKg }];
  for (const mass of [input.mass.min * massFactor, input.mass.max * massFactor]) {
    if (split) {
      scenarios.push({ ...fit(tasMph, mass), massKg: mass });
      continue;
    }
    for (const speed of [tasMph - speedAllowance, tasMph + speedAllowance]) {
      for (const power of [input.power.min * bhpFactor, input.power.max * bhpFactor]) {
        for (const efficiency of [anchors.eta.min, anchors.eta.max]) {
          for (const e of [anchors.oswald.min, anchors.oswald.max]) {
            scenarios.push({ ...fit(speed, mass, power, efficiency, e), massKg: mass });
          }
        }
      }
    }
  }
  if (scenarios.some(s => !(s.cd0 > 0 && s.k > 0))) throw Error('Nonpositive drag coefficients for ' + input.id);
  const evaluationMassKg = input.evaluationMassLb ? input.evaluationMassLb * LB : massKg;
  const points = [0.55, 0.65, 0.75, 0.85, 0.95, 1].map(fraction => {
    const speed = fraction * tasMph;
    const f = flight(speed, altitudeFt, areaM2, evaluationMassKg);
    const result = terms(f, nominal.cd0, nominal.k);
    const sensitivity = scenarios.map(s => {
      const state = flight(speed, altitudeFt, areaM2, input.evaluationMassLb ? evaluationMassKg : s.massKg);
      return terms(state, s.cd0, s.k);
    });
    return {
      tasMph: round(speed, 3), mach: round(f.mach, 4), cl: round(f.cl, 5),
      parasiteN: round(result.parasiteN, 2), inducedN: round(result.inducedN, 2), totalN: round(result.totalN, 2),
      propulsiveHp: round(result.propulsiveHp, 2), totalNRange: range(sensitivity.map(s => s.totalN), 2),
      propulsiveHpRange: range(sensitivity.map(s => s.propulsiveHp), 2),
    };
  });
  const historicalChecks = (input.checks ?? []).map(check => {
    if (!observations.has(check.id) || input.evidence.includes(check.id)) throw Error('Invalid reserved source ' + check.id);
    const state = flight(check.tasMph, altitudeFt, areaM2, check.massLb ? check.massLb * LB : massKg);
    const predicted = terms(state, nominal.cd0, nominal.k).totalN;
    const comparable = levelDragN(check.tasMph, check.shaftBhp, eta);
    return {
      ...check, source: observations.get(check.id),
      predictedDragN: round(predicted, 2), powerInferredDragN: round(comparable, 2),
      differenceN: round(predicted - comparable, 2), differencePct: round(100 * (predicted / comparable - 1), 2),
      role: 'reserved engineering comparison, shared power/efficiency assumptions',
    };
  });
  const anchorDrag = terms(anchorFlight, nominal.cd0, nominal.k);
  const evidence = (input.evidence ?? []).map(id => {
    if (!observations.has(id)) throw Error('Unknown drag source ' + id);
    return observations.get(id);
  });

  return {
    id: input.id, aircraft: label,
    status: input.proxy ? 'provisional proxy scenario' : 'calculated reference',
    method: split ? 'worksheet drag split' : 'level power and bounded Oswald efficiency',
    configuration: input.configuration,
    evidence, externalReferences: input.links ?? [],
    geometry: { ...geometry, aspectRatio: round(aspectRatio, 6) },
    anchor: {
      role: 'fit', tasMph: round(tasMph, 6), altitudeFt: round(altitudeFt, 6),
      sourceSpeed: input.speed ?? null, densityKgM3: round(anchorFlight.densityKgM3, 7),
      mach: round(anchorFlight.mach, 5), cl: round(anchorFlight.cl, 7),
      massKg: round(massKg, 6), sourceMass: input.mass,
      shaftBhp: shaftBhp === null ? null : round(shaftBhp, 5), sourcePower: input.power ?? null,
      propellerEfficiency: split ? null : eta,
      totalDragN: round(anchorDrag.totalN, 3), parasiteN: round(anchorDrag.parasiteN, 3),
      inducedN: round(anchorDrag.inducedN, 3), inducedFraction: round(anchorDrag.inducedN / anchorDrag.totalN, 6),
    },
    polar: {
      cd0: round(nominal.cd0, 9), k: round(nominal.k, 9), oswaldE: round(1 / (Math.PI * aspectRatio * nominal.k), 6),
      cd0Range: range(scenarios.map(s => s.cd0), 9), kRange: range(scenarios.map(s => s.k), 9),
    },
    curve: { altitudeFt: round(altitudeFt, 6), massKg: round(evaluationMassKg, 6), loadFactor: 1, points },
    checks: historicalChecks,
    worksheet: split ? {
      source: 'aircraft/cases.json#greg.' + input.worksheet.id,
      replay: worksheet.map(row => {
        const f = flight(row.tasMph, altitudeFt, areaM2, massKg);
        const calculated = terms(f, nominal.cd0, nominal.k).totalN;
        return {
          role: row.role, tasMph: row.tasMph, worksheetDragLbf: round(row.totalN / LBF, 2),
          calculatedDragLbf: round(calculated / LBF, 2), differencePct: round(100 * (calculated / row.totalN - 1), 2),
        };
      }),
    } : null,
  };
}

function buildGregDragModels(pack, catalog) {
  const roster = [...pack.coverage.rows, ...pack.priority_comparative_reference.coverage_assessment.dossiers];
  const rows = new Map(anchors.aircraft.map(input => [input.id, input]));
  if (rows.size !== anchors.aircraft.length || rows.size !== roster.length ||
      roster.some(item => !rows.has(item.id))) throw Error('Drag model roster must match the scored input dossiers');
  const observations = new Map(catalog.observations.map(row => [row.id, {
    id: row.id, sourceId: row.source_id, locator: row.source_location,
  }]));
  return {
    schema: 'fighter-greg-drag-models', version: '1.0.0', inputPackVersion: pack.version,
    model: {
      dynamicPressure: 'q = 0.5 * rho * TAS^2', lift: 'CL = n * m * g / (q * S)',
      drag: 'D = q * S * (CD0 + k * CL^2)', propulsivePowerRequired: 'P = D * TAS',
      powerFit: 'D = eta * P_shaft / TAS; k = 1 / (pi * e * (span^2 / S)); CD0 = D / (q * S) - k * CL^2',
      worksheetFit: 'CD0 = D_parasite / (q * S); k = D_induced / (q * S * CL^2)',
      assumptions: {
        atmosphere: 'Simulator ISA at source pressure altitude', residualThrustN: 0,
        propellerEfficiency: anchors.eta, oswaldEfficiency: anchors.oswald,
      },
      scope: 'Reference for each stated configuration. The single fit point anchors the polar. Other speeds are diagnostic at the listed mass, altitude and 1 g. Review stall, compressibility, trim, cooling, stores and high-load effects before any use beyond the anchor.',
      ranges: 'Engineering sensitivity extrema over listed input endpoints, with the nominal case included. Endpoints are not probability intervals. A fixed field represents an input held constant in this sweep.',
    },
    aircraft: roster.map(({ id, label }) => buildModel(rows.get(id), label, observations)),
  };
}

function encodeGregDragModels(data) {
  return JSON.stringify(data, null, 2) + '\n';
}

if (require.main === module) {
  const { buildCatalog } = require('./research-layer.cjs');
  const pack = require('../references/analysis/fighter-sim-inputs-v1.json');
  const destination = path.join(__dirname, '..', releasePath);
  fs.writeFileSync(destination, encodeGregDragModels(buildGregDragModels(pack, buildCatalog())));
}

module.exports = { buildGregDragModels, encodeGregDragModels, releasePath, buildFile };
