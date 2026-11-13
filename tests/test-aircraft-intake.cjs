'use strict';

const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const M = require('../src/physics.js');
const B = require('../src/operating-benchmark.js');
const T = require('../src/turn-lift.js');
const L = require('../references/p51-turn-lift-tn1044.json');
const { addAircraftBatch, stallReferences, HF, G2, D, FIX, G6 } = require('../scripts/aircraft-batch.cjs');
const { buildCatalog } = require('../scripts/research-layer.cjs');
const { browserData } = require('../validation/diagnostics/shared_flight_climb.cjs');
const { scorecard } = require('../validation/diagnostics/operating_benchmark_v410.cjs');
const { sourceChecks } = require('../validation/diagnostics/aircraft_intake.cjs');

const base = browserData();
const catalog = buildCatalog();
const data = addAircraftBatch(base, catalog);
const secondPack = 'ww2_g6trop_and_f_ix_2026-11-13';
assert.equal(catalog.observations.filter(row => row.pack_id === secondPack).length, 101);
assert.equal(catalog.sources.filter(row => row.pack_id === secondPack).length, 3);
const { models, specification } = data;
const { aircraft, policy } = specification;
const ids = [HF, G2, D, FIX, G6];
assert.deepEqual(Object.keys(models).slice(-5), ids);
const preceding = scorecard({ models, specification: {
  ...specification, aircraft: Object.fromEntries(Object.entries(aircraft).filter(([id]) => id !== FIX && id !== G6)),
} });
assert.equal(preceding.length, 10);
assert.equal(createHash('sha256').update(JSON.stringify(preceding)).digest('hex'),
  '36363ce6659d1de1aabccecd3b4b11fa33b1f388425a29c16ddd9fe6665285c4');
const existing = scorecard({ models, specification: {
  ...specification, aircraft: Object.fromEntries(Object.keys(base.models).map(id => [id, aircraft[id]])),
} });
assert.equal(existing.length, 7);
assert.equal(createHash('sha256').update(JSON.stringify(existing)).digest('hex'),
  'c7d7dbc3cd818a88d5ae77197fa054b3494b128c60dfe170f46e51c13f260346');

for (const id of ids) {
  for (const mode of ['normal', 'combat']) {
    const settings = { mode, fuelFraction: .5 };
    const row = B.metrics(M, T, L, models[id], aircraft[id], policy, settings, 10000);
    assert.equal(row.status, 'modelled');
    assert.ok(row.level.tasMph > 300 && row.climb.climbFpm > 1000 && row.stallEasMph > 80);
    for (const key of ['sustained', 'sustainedLoad', 'instantaneous', 'minSustainedRadius', 'turnRange']) {
      assert.equal(row[key], null, id + ' ' + key);
    }
    const climb = B.climb(M, T, L, models[id], aircraft[id], policy, settings, 0, 10000);
    assert.equal(climb.status, 'reached');
    assert.ok(climb.seconds > 0 && climb.combatSeconds <= aircraft[id].combat.seconds + 1e-6);
  }
}
assert.equal(aircraft[G2].combat.map, 1.3);
assert.equal(aircraft[G2].combat.seconds, 1800);
assert.equal(B.metrics(M, T, L, models[G2], aircraft[G2], policy, {}, 35000).status, 'source-power-unavailable');
assert.equal(B.metrics(M, T, L, models[HF], aircraft[HF], policy, {}, 40000).level, null);
assert.equal(B.phaseFor(aircraft[D], { mode: 'combat' }, 300, 300).key, 'normal');
const references = stallReferences(catalog);
assert.deepEqual(references[HF], []);
assert.deepEqual(references[D].map(row => [row.speed.value, row.speed.basis]), [[91, 'IAS'], [97, 'IAS'], [103, 'IAS']]);
assert.deepEqual(references[G2].map(row => row.speed.value), [112, 180]);
const replay = sourceChecks(base, catalog);
assert.deepEqual(replay.crossover.map(row => row.observedDifferenceMph), [-5, -7, -7, 18]);
assert.ok(replay.crossover.slice(0, 3).every(row => row.modeledDifferenceMph < 0));
assert.ok(replay.crossover[3].modeledDifferenceMph > 0);
assert.deepEqual(replay.aircraft.map(row => row.id), ids);
for (const [i, check] of replay.aircraft.slice(0, 3).entries()) {
  assert.equal(check.id, ids[i]);
  assert.deepEqual(check.level.filter(row => row.role === 'fit').map(row => row.error), [0]);
  assert.ok([...check.level, ...check.climb].every(row => Number.isFinite(row.error)));
  assert.ok(check.levelMaeMph < 8 && check.climbMaeFpm < 300);
}
assert.ok(replay.aircraft[1].climb.every(row => Number.isFinite(row.alternateRateFpm) && row.speedId));
const [, , , fix, g6] = replay.aircraft;
assert.equal(fix.level.find(row => row.role === 'fit').error, 0);
assert.equal(fix.level.length, 16);
assert.equal(fix.climb.length, 34);
assert.ok(fix.climb.every(row => Number.isFinite(row.error)));
assert.equal(fix.elapsed.length, 8);
assert.ok(fix.elapsed.every(row => Number.isFinite(row.error)));
assert.equal(fix.level.find(row => row.altFt === 20000 && row.gear === 'high').observed, 368);
assert.equal(aircraft[FIX].climbTAS.find(row => row[0] === 10000)[1], 188);
assert.equal(aircraft[FIX].combat.seconds, 300);
assert.equal(g6.level.find(row => row.role === 'fit').error, 0);
assert.equal(g6.level.filter(row => Number.isFinite(row.error)).length, 3);
assert.equal(g6.climbMaeFpm, null);
assert.equal(g6.ceiling.observedAltFt, 36515.75);
assert.ok(g6.ceiling.modeled100FpmAltFt > 33000 && g6.ceiling.modeledRateAtObservedFpm < 0);
assert.ok(g6.level.filter(row => row.role.startsWith('attachment')).every(row => row.predicted === null));
assert.ok(aircraft[G6].climbProjectionOnly);
assert.equal(aircraft[G6].combat.map, 1.3);
assert.equal(aircraft[G6].combat.seconds, 1800);
