'use strict';
const assert = require('node:assert/strict');
const M = require('../src/physics.js');
const Energy = require('../src/energy-configuration.js');
const Envelope = require('../src/maneuver-envelope.js');
const turn = require('../src/turn-lift.js');
const lift = require('../references/p51-turn-lift-tn1044.json');
const diagnostic = require('../validation/diagnostics/energy_v41.cjs');
const parameters = require('../calibration/v4.1-energy.json');
const {models, scorecard} = diagnostic.buildData();

assert.deepEqual(diagnostic.calibration(), parameters, 'Runtime parameters reproduce the declared fit inputs');
for (const [id, report] of Object.entries(scorecard.energy)) {
  assert.ok(report.count >= 2, id + ' has held-out existing coverage');
  assert.ok(report.afterMae < report.beforeMae * .85, id + ' materially improves same-condition checks');
  for (const row of report.rows) assert.ok(Number.isFinite(row.candidate));
}
const p47 = models.p47b;
const beforeInputs = JSON.stringify(p47);
const r = Energy.evaluate(M,p47,5000,183,'source-schedule',12565,p47.energyConfiguration);
assert.ok(Math.abs(r.power.climbFpm-2545)<15);
assert.equal(r.engine.engineRpm,2700);
const high = Energy.evaluate(M,p47,15000,200,'source-schedule',12565,p47.energyConfiguration);
assert.equal(high.engine.rating,'normal');
assert.equal(high.engine.engineRpm,2550);
assert.equal(high.power.shaftHp,1625);
assert.equal(JSON.stringify(p47),beforeInputs,'Live calls do not mutate source or model');
assert.equal(Energy.evaluate(M,{...p47,ac:models.p51b.ac},5000,183,'source-schedule',12565,p47.energyConfiguration).status,'outside-energy-configuration');
assert.equal(Energy.prepare(M,p47,NaN,'military',12565,p47.energyConfiguration),null);
assert.equal(Energy.prepare(M,p47,5000,'military',12565,{...p47.energyConfiguration,branches:null}),null);
assert.ok(Math.abs(Energy.fractionAt([{altFt:0,fraction:.1},{altFt:10,fraction:.06},{altFt:20,fraction:.02}],15)-.04)<1e-12);

for (const [id,model] of Object.entries(models)) {
  const weight = model.energyWeightLb ?? model.ac.weightLb;
  const rating = model.energyRating ?? model.ac.defaultRating;
  for (const alt of [5000,10000,15000,27000]) for (const eas of [130,170,225]) {
    const row = Envelope.state(M,turn,lift,model,alt,eas,rating,weight);
    assert.ok(row.band.every(Number.isFinite),id+' finite band');
    if (row.band.length) assert.ok(row.band[0]<=row.band[1],id+' ordered band');
    const result = Energy.evaluate(M,model,alt,M.tasFrom(eas,'EAS',alt),rating,weight,model.energyConfiguration);
    if (!result.power) continue;
    assert.ok(result.power.propulsiveHp<=result.power.shaftHp+1e-8,id+' energy conservation');
    assert.ok(Math.abs(result.power.excessHp-result.power.propulsiveHp+result.power.requiredHp)<1e-8);
  }
}
const source = Envelope.state(M,turn,lift,p47,5000,170,'source-schedule',12565);
const reference = Envelope.state(M,turn,lift,{...p47,energyConfiguration:undefined},5000,170,'military',12565);
assert.ok(source.climbFpm<reference.climbFpm-400,'Correction affects the normal live entry point');
assert.ok(source.sustainedG<reference.sustainedG,'Same energy model constrains sustained turn');
const fixed = Envelope.climbBand(M,p47,5000,10000,'source-schedule',12565,0);
const burned = Envelope.climbBand(M,p47,5000,10000,'source-schedule',12565,.5);
assert.ok(burned.minutes<fixed.minutes && burned.endWeightLb<12565);
assert.equal(scorecard.f4Candidates.candidates.length,27);
assert.ok(scorecard.f4Candidates.originalReport.qualification.includes('intelligence compilation'));


const transfer = require('../validation/diagnostics/v41_transfer_check.cjs').run();
assert.equal(transfer.fitToThisReport,false);
assert.ok(transfer.afterMae < transfer.beforeMae*.2);
assert.ok(Energy.prepare(M,models.spitfire_lfix_bs543,13000,'combat+18',7485,models.spitfire_lfix_bs543.energyConfiguration).branch.gear==='high');

const frozen = require('../validation/baseline/v40-energy-checks.json');
for (const [id, rows] of Object.entries(frozen.rows)) for (const old of rows) {
  const now=scorecard.energy[id].rows.find(row=>row.id===old.id);
  assert.equal(now.observed,old.observed,'Original observations stay frozen');
  assert.equal(now.role,old.role,'Declared split stays frozen');
  if(old.before===null) assert.equal(now.before,null);
  else assert.ok(Math.abs(now.before-old.before)<1e-8,'Same-condition v4.0 before-scorecard stays frozen');
}
