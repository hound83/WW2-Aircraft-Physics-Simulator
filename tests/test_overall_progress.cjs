'use strict';
const assert=require('node:assert/strict'),R=require('../validation/diagnostics/overall_progress.cjs'),B=require('../validation/baseline/pre-pr1-comparison.json');
const out=R.run(),row=(id,metric)=>out.rows.find(r=>r.id===id&&r.metric===metric);
assert.equal(out.baselineCommit,'1400a07cf715b474a645ee48e49bb9e445c356ce');
for(const b of B.summary){const common=B.rows.filter(r=>r.id===b.id&&r.kind==='speed');assert.equal(common.length,b.speedCount);assert.ok(Math.abs(common.reduce((s,r)=>s+Math.abs(r.error),0)/common.length-b.speedMae)<1e-10);}
assert.equal(row('p47b','climb').before,B.summary.find(s=>s.id==='p47b').conditionalClimbMae,'stronger pre-existing configuration fit is the comparison');
assert.ok(row('p47b','climb').reductionPercent<10);assert.ok(row('p51b','speed').reductionPercent<0,'worsened speed retained');
assert.ok(row('p51b','climb').reductionPercent>97);assert.equal(row('bf109f4','climb').now,null);assert.equal(row('bf109f4','climb').reductionPercent,null);
assert.equal(out.independentHistoricalAccuracy,null);assert.equal(out.turnStallAccuracyGain,null);
console.log('PASS overall progress: exact baseline identity, common observations, prior best P47 fit, unfavorable Mustang speed and unsupported metrics');
