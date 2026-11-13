'use strict';

const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const Turn = require('../src/turn-performance.js');
const { evaluate } = require('../validation/diagnostics/continuous_stall.cjs');
const { browserData } = require('../validation/diagnostics/shared_flight_climb.cjs');
const { glideAudit, levelPowerCheck, matchup } = require('../validation/diagnostics/turn_drag.cjs');
const source = require('../references/analysis/turn-drag-evidence-2026-11-13.json');
const frozen = require('../references/analysis/v413-turn-drag-before.json');

const data = browserData();
const [mustang, spitfire] = frozen.case.ids;
const close = (actual, expected, tolerance = 1e-8) => assert.ok(
  Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
const glide = glideAudit(data.models[spitfire]);

assert.equal(source.matchedPoweredTurnRecords, 0);
assert.deepEqual(glide.rows.filter(r => r.role === 'fit').map(r => r.easMph), [100,120,140,160]);
assert.deepEqual(glide.rows.filter(r => r.role === 'check').map(r => r.easMph), [110,130,156]);
const changedChecks = {...source.spitfireGlide,
  observations:source.spitfireGlide.observations.map(row => row[2] === 'check' ? [row[0],row[1]+150,row[2]] : row)};
const changed = glideAudit(data.models[spitfire],changedChecks);
for (const key of ['control','candidate','transfer','slopeSensitivity']) assert.deepEqual(glide[key],changed[key]);
assert.notDeepEqual(glide.checks,changed.checks);
close(glide.candidate.k, .078721, 1e-6);
close(glide.checks.controlMaeFpm, 45.984, .001);
close(glide.checks.candidateMaeFpm, 31.572, .001);
const adverse = glide.rows.find(r => r.easMph === 156);
assert.ok(Math.abs(adverse.candidate.sinkFpm) > Math.abs(adverse.control.sinkFpm));

const level = levelPowerCheck(data.models[mustang]);
assert.deepEqual(level.rows.map(r => r.engineRpm), [2100,2300,2700,3000,3000,3000]);
assert.deepEqual(level.rows.map(r => r.gear), ['low','low','high','low','high','high']);
close(level.maeBhp, 43.720, .001);
assert.ok(Math.max(...level.rows.map(r => r.oneGCl)) < .44);

const flights = [mustang,spitfire].map(id => evaluate(data,id,10000,200));
const nominal = flights.map(f => Turn.state(f));
for (const [i,flight] of flights.entries()) {
  const state = nominal[i], rival = nominal[1-i].turn;
  close(state.turn.g,flight.limits.nSust);
  const parity = Turn.dragSensitivity(flight,state,rival.g,[.85,1.15]).parity;
  const atParity = Turn.state(flight,{dragFraction:parity.fraction});
  close(atParity.turn.rateDegSec,rival.rateDegSec);
  assert.equal(atParity.levelHp,state.levelHp);
  assert.equal(atParity.availableHp,state.availableHp);
  assert.equal(atParity.nLift,state.nLift);
  assert.equal(atParity.nStructure,state.nStructure);
  const ac = data.models[[mustang,spitfire][i]].ac;
  const drag = M.dragBreakdown(ac,10000,flight.tasMph,flight.weightLb,flight.cd0,flight.oswald,state.turn.g);
  close(drag.requiredHp, state.levelHp + state.turnDragHp);
}

const rows = matchup(data,glide.transfer);
assert.deepEqual(rows.map(r => [r.easMph,...r.probes]),frozen.fixed);
const crossover = rows.find(r => r.easMph === 200);
close(crossover.dragOnly.range[0],-1.918846,1e-6);
close(crossover.dragOnly.range[1],1.384544,1e-6);
assert.equal(crossover.dragOnlyVerdict,'uncertain');
assert.equal(crossover.donorDeltaDegSec,null);
assert.equal(crossover.donor.lowerBound,true);
close(crossover.donor.liftCoefficient,glide.transfer.maxCl);
close(crossover.donor.turn.rateDegSec,16.349077,1e-6);
close(crossover.donor.remainingHp,85.237296,1e-6);
assert.equal(rows.find(r => r.easMph === 170).parity[0].limiting,'lift');

const at210 = evaluate(data,spitfire,10000,210);
const full = Turn.boundedDragTurn(at210,glide.transfer);
assert.equal(full.lowerBound,false);
assert.ok(full.liftCoefficient < glide.transfer.maxCl);
close(full.turnDragHp + full.levelHp,Turn.state(at210).availableHp);
assert.equal(Turn.boundedDragTurn({status:'below-provisional-stall'},glide.transfer),null);
assert.equal(Turn.boundedDragTurn(at210,{...glide.transfer,maxCl:at210.drag.CL}),null);
assert.equal(Turn.boundedDragTurn(at210,{...glide.transfer,minCl:1,maxCl:1.5}),null);
const neutral = Turn.boundedDragTurn(at210,{...glide.transfer,dragFraction:1});
close(neutral.turn.rateDegSec,Turn.state(at210).turn.rateDegSec);

console.log('Turn drag: reserved rows, source replay, same-speed parity, lift caps, 1 G power budget and bounded transfer verified.');
