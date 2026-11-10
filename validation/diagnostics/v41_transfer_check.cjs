'use strict';
const M = require('../../src/physics.js');
const E = require('../../src/energy-configuration.js');
const ac = require('../../aircraft/cases.json').aircraft.p47b;
const source = require('../../references/independent-flight-checks.json').thunderboltProduction;
const parameters = require('../../calibration/v4.1-energy.json').configurations.p47b;
function run() {
  const target = {...ac, stallIdentity: {...ac.stallIdentity, specimen: '41-5942'}};
  const transfer = {...parameters, id: 'p47b-41-5942-cross-specimen-check', identity: target.stallIdentity,
    source: source.url, branches: [{
      rating: 'military', gear: 'turbo', minFt: 10000, maxFt: 30000, engineRpm: 2700,
      reductionRatioEnginePerProp: 2, powerBasis: 'independent report torque-meter BHP',
      powerNodes: source.climb.map(([altFt,bhp])=>({altFt,bhp})),
      loss: parameters.branches[0].loss
    }]};
  const rows = source.climb.map(([altFt,bhp,tasMph,observed])=>{
    const model={ac:target,options:{profile:'P'}};
    const predicted=E.evaluate(M,model,altFt,tasMph,'military',source.weightLb,transfer);
    const control=E.evaluate(M,model,altFt,tasMph,'military',source.weightLb,
      {...transfer,branches:transfer.branches.map(b=>({...b,loss:{areaM2:0,powerFraction:0}}))});
    return {altFt,bhp,tasMph,observed,before:control.power.climbFpm,after:predicted.power.climbFpm};
  });
  const mae=key=>rows.reduce((sum,row)=>sum+Math.abs(row[key]-row.observed),0)/rows.length;
  return {classification:'different original report and specimen; same engine/prop family, eight vs six guns',
    fitToThisReport:false, rows, beforeMae:mae('before'),afterMae:mae('after'),
    caveat:'Cross-installation check, not exact same-aircraft independent turn validation.'};
}
module.exports={run};
