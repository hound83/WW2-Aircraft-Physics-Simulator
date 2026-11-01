'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),M=require('../src/physics.js'),F=require('../src/measured-climb.js'),D=require('../aircraft/cases.json'),L=require('../references/p47b-measured-climb-v33.json');
const R=require('../validation/diagnostics/measured_climb_v33.cjs'),a=D.aircraft.p47b,before=JSON.stringify({D,L});
const state=L.states.at(-1),base=F.evaluate(M,a,L,state.id);
assert.equal(base.status,'qualified-measured-power-scenario');assert.equal(base.propRpm,1275);assert.equal(base.shaftHp,1365);
assert.equal(base.historicalAccuracy,null);assert.equal(M.shaftPower(a,35000,'military','turbo'),null);
assert.equal(base.polar.cd0,M.workingOptions(a).polar.cd0,'recorded climb power must not reanchor clean drag');
const altered=structuredClone(L);altered.states.at(-1).observedFpm+=10000;assert.equal(F.evaluate(M,a,altered,state.id).predictedFpm,base.predictedFpm,'observation does not drive prediction');
altered.states.at(-1).engineRpm=2700;const rpm=F.evaluate(M,a,altered,state.id);assert.equal(rpm.propRpm,1350);assert.notEqual(rpm.predictedFpm,base.predictedFpm,'RPM enters shared propeller model');
const drag=F.evaluate(M,a,L,state.id,{deltaCd0:.01});assert.ok(drag.predictedFpm<base.predictedFpm);assert.ok(F.evaluate(M,a,L,state.id,{weightLb:12765}).predictedFpm<base.predictedFpm);
const directAc={...a,propGeometry:{...a.propGeometry,propRpm:1275},powerRatings:{normal:{gears:{turbo:[{altFt:35000,bhp:1365}]}}}};
const direct=M.evaluated(directAc,35000,305,{profile:'P',polar:base.polar,rating:'normal',gear:'turbo',weightLb:12565});assert.ok(Math.abs(direct.power.climbFpm-base.predictedFpm)<1e-8,'shared-solver reproduction');
const reject=(ledger=L,id=state.id,aircraft=a,scenario={})=>assert.equal(F.evaluate(M,aircraft,ledger,id,scenario).status,'blocked-measured-climb');
reject(L,'35001');reject(L,state.id,D.aircraft.p51b);reject(L,state.id,a,{powerScale:2});reject(L,state.id,a,{deltaCd0:-.01});reject(L,state.id,a,{weightLb:Infinity});
for(const change of [{engineRpm:0},{shaftHp:0},{altFt:36090},{tasMph:NaN},{sourceLocation:''}]){const l=structuredClone(L);Object.assign(l.states.at(-1),change);reject(l);}
for(const key of ['specimen','variant','aircraftId']){const l=structuredClone(L);l.identity[key]='unknown';reject(l);}
const duplicate=structuredClone(L);duplicate.states.push({...state});reject(duplicate);
const config=structuredClone(L);config.configuration.gearState='down';reject(config);const gear=structuredClone(L);gear.gearing.propPerEngine=0;reject(gear);
const report=R.run();assert.equal(report.rows.length,10);assert.equal(report.sourceHashesVerified,true);assert.equal(report.coefficientChanges,0);
assert.equal(report.rows.filter(x=>x.clean.altFt===12600).length,2,'distinct military/normal states');assert.ok(report.rows.at(-1).transferred.errorFpm<-400,'retain unfavorable high-altitude result');
assert.equal(JSON.stringify({D,L}),before,'no mutation of source or aircraft');
const html=fs.readFileSync(require('node:path').join(__dirname,'../dist/model.html'),'utf8');assert.ok(html.includes('id="measured-drag"'));assert.ok(html.includes('UniversalMeasuredClimbUI'));assert.ok(html.includes('not an extension of the generic engine curve'));
console.log('PASS measured-power exact states, original hashes, observation exclusion, correct RPM, fixed polar, source isolation and high-altitude failure retention');
