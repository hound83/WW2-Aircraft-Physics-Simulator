'use strict';
const assert=require('node:assert/strict');
const M=require('./physics.js');
const D=require('./cases.json');
const audit=require('./naca_propeller_benchmark_v23.cjs');

const low=M.nacaLowSpeedPropChart(4,1,.2),heavy=M.nacaLowSpeedPropChart(4,1,.6);
assert.ok(low.eta>heavy.eta,'Loading Cp must matter independently of true speed');
assert.ok(Math.abs(low.eta-.78)<.0001,'Read-back of Figure 10 4-blade node');
assert.ok(!M.nacaLowSpeedPropChart(4,4,.2),'Beyond original plotted advance ratio must not extrapolate');
assert.ok(!M.nacaLowSpeedPropChart(5,1,.2),'No fabricated five-blade map');
assert.ok(!M.nacaLowSpeedPropChart(4,1,0),'No nonpositive Cp');
assert.equal(M.nacaLowSpeedPropChart(4,1,.15).chartWithinCp,false,
 'Cp below source range must be disclosed as bounded extrapolation');

const sample=audit.naca1944DesignCase;
assert.ok(Math.abs(sample.naca1941ChartApproximateEta-sample.reportedInstalledTestCaseEta)<.02,
 '1941 approximate graph readings should agree with the 1944 original design example within graph reading error');
for(const a of audit.allAircraftSpeedAnchors){
 assert.ok(Math.abs(a.nReanchored-a.sourceAnchorMph)<.05,
  `${a.id} must preserve the flight-speed anchor after explicit drag reanchoring`);
 assert.ok(a.nacaEtaAtSpeedAnchor>0&&a.nacaEtaAtSpeedAnchor<.9);
}
const turn=audit.bf109.sourceIL2TurnTimes;
for(const x of turn)assert.ok(Math.abs(x.N.seconds-x.sourceIL2Seconds)<.5,
 'Source-derived Greg polar + NACA chart must stay near 109 reference turns');
assert.ok(audit.bf109.speed.NwithGregPolar>audit.bf109.speed.CwithGregPolar,
 'Period prop chart should close some F-4 high speed gap');
assert.ok(audit.bf109.speed.NwithGregPolar<325,
 'Still missing a few mph: no false exact independent match');
for(const x of audit.mustang.sourceClimbs){
 assert.ok(x.nacaNWithOriginalSpeedReanchor.climbFpm<x.sourceClimbFpm,
 'Do not calibrate historic Mustang climb from its own target');
 assert.ok(x.nacaNWithOriginalSpeedReanchor.climbFpm>3000);
}
console.log('NACA v2.3 research transfer passes six source-traceable model guardrails');
