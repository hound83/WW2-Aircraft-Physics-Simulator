'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const lift = require('../../references/p51-turn-lift-tn1044.json');
const plate = require('../../references/analysis/g6-16476-climb-charts.json');

const id = 'bf109g6trop_16476';
const ftPerM = 1 / 0.3048;
const round = (value, places) => Number(value.toFixed(places));

function observations() {
  const scale = plate.calibration;
  const rows = plate.climb.rows.map(([altKm, , timeX, rateX, tasX]) => ({
    altKm,
    elapsedMin: timeX === null ? null : round((timeX - scale.zeroX) / scale.pixelsPerMinute, 1),
    rateMps: round((rateX - scale.zeroX) / scale.pixelsPerMps, 1),
    tasKmh: tasX === null ? null : Math.round(scale.tasReference.kmh +
      (tasX - scale.tasReference.x) / scale.tasReference.pixelsPerKmh),
  }));
  const symbols = plate.rateSymbols.rows.map(([x, y]) => {
    const index = plate.climb.rows.findIndex(row => row[1] < y);
    const [below, above] = plate.climb.rows.slice(index - 1, index + 1);
    const altKm = below[0] + (below[1] - y) / (below[1] - above[1]);
    return { altKm: round(altKm, 2), rateMps: round((x - scale.zeroX) / scale.pixelsPerMps, 1) };
  });
  const temperature = plate.cooling.temperatureSymbols.map(([x, y]) => ({
    altKm: round((scale.coolingAltitude.yAt0 - y) / scale.coolingAltitude.pixelsPerKm, 2),
    degC: Math.round(80 + (x - scale.coolant.xAt80C) / scale.coolant.pixelsPerC),
  }));
  const opening = plate.cooling.openingPlateaus.map(([altKm, x]) => ({
    altKm, mm: Math.round((100 + (x - scale.flap.xAt100mm) / scale.flap.pixelsPerMm) / 5) * 5,
  }));
  return { rows, symbols, temperature, opening };
}

function chartReplay(data, model = data.models[id], weightKg = plate.conditions.weightKg) {
  const readings = observations().rows.filter(row => row.tasKmh !== null);
  const schedule = readings.map(row => [1000 * row.altKm * ftPerM, row.tasKmh / 1.609344]);
  const spec = data.specification.aircraft[id];
  const asTested = { ...spec, combat: { ...spec.combat, seconds: null } };
  const climb = (from, to, stepFt = 100) => B.climb(M, T, lift, model, asTested, data.specification.policy,
    { mode: 'combat', fuelFraction: 0.5 }, from, to, { stepFt, accountForTasChange: true,
      flightCase: { weightLb: weightKg / 0.45359237, tasSchedule: schedule } });
  return { readings, schedule, climb };
}

function evidence(data) {
  const { readings, schedule, climb } = chartReplay(data);
  const top = schedule.at(-1)[0];
  const rate = [], elapsed = [];
  for (const [i, row] of readings.entries()) {
    const altFt = schedule[i][0];
    const from = Math.max(0, altFt - 50), to = Math.min(top, altFt + 50);
    const local = climb(from, to);
    const fields = { id: 'mtt-109-10-l-43-blatt7-' + row.altKm + 'km', altFt: round(altFt, 1),
      altKm: row.altKm, tasKmh: row.tasKmh };
    rate.push({ ...fields, observed: round(row.rateMps * 60 * ftPerM, 1),
      predicted: local.status === 'reached' ? round(60 * (to - from) / local.seconds, 1) : null,
      observedMps: row.rateMps, readUncertaintyFpm: round(0.2 * 60 * ftPerM, 1), status: local.status });
    if (i === 0) continue;
    const run = climb(0, altFt);
    elapsed.push({ ...fields, observed: round(row.elapsedMin * 60, 1),
      predicted: run.status === 'reached' ? round(run.seconds, 1) : null,
      observedMin: row.elapsedMin, readUncertaintySeconds: row.altKm === 10 ? 24 : 12, status: run.status });
  }
  const common = { qualifier: 'Messerschmitt WNr 16476 climb chart', grade: 'report-conditioned',
    source: plate.source.url + '#page=7',
    reference: 'One climb campaign, 3,260 kg takeoff held fixed, 1.3 ata and 2,600 rpm. Uses the plotted true climb speed and the existing estimated power and cooling. Model minus curve read. Rate and time share one trial.' };
  return { climb: { ...common, rows: rate }, elapsed: { ...common, rows: elapsed } };
}

module.exports = { id, observations, chartReplay, evidence };
