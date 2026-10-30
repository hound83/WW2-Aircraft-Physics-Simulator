'use strict';
const assert=require('node:assert/strict'),E=require('../validation/lib/climb_energy.cjs'),M=require('../src/physics.js'),D=require('../aircraft/cases.json');
const near=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const x={weightLb:33000,shaftHp:1000,eta:.5,requiredHp:300,qPa:1000,wingAreaM2:20,tasMph:150,observedClimbFpm:100};
const b=E.budget(x);near(b.hpPerFpm,1);near(b.modelClimbFpm,200);near(b.gapUsefulHp,-100);near(b.extraShaftHpAtFixedEta,-200);near(b.etaIfPropOnly,.4);assert.ok(b.equivalentNetCd0Delta>0);assert.equal(b.additionalPositiveDragCanCloseGap,true);
near(E.withExtraDragHp(b,100),x.observedClimbFpm);assert.ok(E.withExtraDragHp(b,50)<b.modelClimbFpm);assert.throws(()=>E.withExtraDragHp(b,-1));
const deficit=E.budget({...x,observedClimbFpm:400});near(deficit.gapUsefulHp,200);near(deficit.extraShaftHpAtFixedEta,400);assert.ok(deficit.equivalentNetCd0Delta<0);assert.equal(deficit.additionalPositiveDragCanCloseGap,false);
near(deficit.requiredUsefulHp,deficit.etaIfPropOnly*deficit.shaftHp);near(deficit.requiredUsefulHp,deficit.eta*(deficit.shaftHp+deficit.extraShaftHpAtFixedEta));
assert.equal(E.budget({...x,observedClimbFpm:1200}).propOnlyWithinEnergyConservation,false);
for(const change of [{weightLb:0},{shaftHp:NaN},{eta:0},{eta:1.1},{tasMph:Infinity},{qPa:-1},{requiredHp:-1},{observedClimbFpm:NaN}])assert.throws(()=>E.budget({...x,...change}));
const ledger=require('../references/climb-power-cooling-audit.json');assert.equal(ledger.acceptedNumericalCorrection,null);assert.equal(ledger.sources[0].scans.length,2);for(const scan of ledger.sources[0].scans)assert.deepEqual(scan.numericNodesDigitized,[]);
const r=require('../validation/diagnostics/climb_power_cooling.cjs').run();assert.equal(r.p51.length,2);assert.equal(r.otherAircraft.length,21);assert.equal(r.powerRequiredCheck.rows.length,6);
for(const p of r.p51){
 const b=p.budget;assert.ok(b.gapUsefulHp>110&&b.gapUsefulHp<125);assert.ok(b.etaIfPropOnly>.83&&b.etaIfPropOnly<1);assert.equal(b.additionalPositiveDragCanCloseGap,false);assert.ok(p.withAdditional50HpCoolingLossFpm<b.modelClimbFpm);
 const ac=D.aircraft.p51b,opts={profile:'C',e:.78,rating:p.rating,gear:'low',engineModel:'ram-critical',weightLb:9335};
 const unchanged=M.bestClimb(ac,2200,opts);near(b.modelClimbFpm,unchanged.climbFpm,1e-5);near(b.availableUsefulHp,unchanged.shaftHp*unchanged.propEta);
 near(M.bestClimb(ac,2200,{...opts,weightLb:p.massOnly.weightLb}).climbFpm,b.observedClimbFpm,1e-5);
 assert.ok(p.massOnly.takeoffMinusRequiredLb>600&&p.massOnly.takeoffMinusRequiredLb<900);
 assert.ok(p.cFormulaAmplitudeEnvelope.climbFpm<b.observedClimbFpm);assert.ok(p.losslessUsefulPowerScenario.climbFpm>p.cFormulaAmplitudeEnvelope.climbFpm);
}
const p47=r.otherAircraft.filter(x=>x.aircraftId==='p47b');assert.equal(p47.length,5);assert.ok(p47.every(x=>x.budget.equivalentNetCd0Delta>0));
near(p47[0].budget.equivalentNetCd0Delta,M.equivalentClimbDrag(D.aircraft.p47b,D.aircraft.p47b.observedClimb[0],{profile:'C',e:.78}).addedCd0,1e-10);
const spit=r.otherAircraft.filter(x=>x.aircraftId==='spitfire_lfix_bs543');assert.ok(spit.some(x=>x.budget.gapUsefulHp>0));assert.ok(spit.some(x=>x.budget.gapUsefulHp<0));
for(const x of r.otherAircraft){assert.ok(x.conditionExclusions.length>0);assert.ok(E.withExtraDragHp(x.budget,50)<x.budget.modelClimbFpm);}
assert.equal(D.aircraft.p51b.weightLb,9240);assert.equal(D.aircraft.p51b.clMaxAssumed,1.6);
console.log('PASS climb energy units/sign, useful-vs-shaft distinction, cooling monotonicity, mass inversions, frozen-polar parity and source access limits');
