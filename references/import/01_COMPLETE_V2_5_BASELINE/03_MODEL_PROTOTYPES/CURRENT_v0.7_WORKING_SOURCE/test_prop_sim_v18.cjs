'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const M=require('./physics.js');
const D=require('./cases.json');
const audit=require('./prop_sim_sanity_v18.cjs');
const R=audit.run();
const C=R.candidates.C,trial=R.candidates.D;

// Absolute historic source test totals: v1.7 data MUST stay unchanged.
assert.equal(C.p47bSpeed.withheldCount,5);
assert.equal(C.p51bSpeed.withheldCount,8);
assert.ok(Math.abs(C.p47bSpeed.holdoutMAEMph-3.6493563)<.001);
assert.ok(Math.abs(C.p51bSpeed.holdoutMAEMph-2.609901)<.001);
assert.ok(Math.abs(C.p51bClimb[0].modelFpm-3401.086)<.01);
assert.ok(Math.abs(C.p51bClimb[1].modelFpm-3978.538)<.01);
assert.ok(Math.abs(R.bf109ConditionalEFromV17-.54698)<.0001);
assert.ok(Math.abs(C.bf109f4AtHeldE[1].turnSeconds-25.89169)<.01);

// Physics trial: induced disk loss increases with higher power demand, unlike C.
for(const ac of [D.aircraft.p51b,D.aircraft.bf109f4,D.aircraft.p47b]){
 const rating=ac.defaultRating;
 const s=M.shaftPower(ac,ac.calibration.altFt,rating,'auto');
 const lo=M.propEta(ac,ac.calibration.altFt,180,s.bhp*.9,'D',rating);
 const hi=M.propEta(ac,ac.calibration.altFt,180,s.bhp*1.1,'D',rating);
 assert.ok(lo.eta>hi.eta,'disk power loading should reduce prop efficiency');
 assert.ok(lo.eta>0&&hi.eta<.85);
 assert.ok(lo.idealInducedEfficiency<1);
}
assert.ok(trial.p51bPowerRequired.lowMidMAEBhp<C.p51bPowerRequired.lowMidMAEBhp);
assert.ok(trial.p47bSpeed.holdoutMAEMph>C.p47bSpeed.holdoutMAEMph);
assert.ok(trial.p51bSpeed.holdoutMAEMph>C.p51bSpeed.holdoutMAEMph);
assert.ok(trial.p51bClimb[0].modelFpm<C.p51bClimb[0].modelFpm);

// Explicitly differentiated variants, weights and power settings.
const refs=require('./simulator_reference_v18.json').aircraft;
const ref=id=>refs.find(x=>x.id===id);
assert.equal(ref('il2_p51b5_v1650_7').engine.includes('V-1650-7'),true);
assert.equal(ref('il2_p47d28').engine.includes('64 inHg'),true);
assert.equal(ref('dcs_p47d30_2020_user_test').engine.includes('71 inHg'),true);
assert.equal(ref('il2_p51d15').speed[0].kmhTAS,ref('dcs_p51d_2020_user_test').speed[0].kmhTAS);
assert.equal(ref('dcs_p51d_tacview2022').confidenceByAuthor,'LOW');
assert.notEqual(D.aircraft.p47b.weightLb,ref('il2_p47d28').weightKg*2.20462262185);

// The regenerated off-line app includes complete, parsed JS, v1.8 panel,
// v1.7/v1.6 frozen panels, selectable D and the default C setting.
const html=fs.readFileSync(path.join(__dirname,'Universal_Three_Aircraft_Model_v1.8.html'),'utf8');
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let js=0;
for(const script of scripts){
 if(/type="application\/json"/i.test(script[1]))JSON.parse(script[2]);
 else new vm.Script(script[2],{filename:`v1.8-script-${++js}`});
}
assert.ok(js>=3);
for(const s of ['Clean Physics v1.8 Experimental','id="v18"','id="v17"',
 'id="v16"','id="v15"','IL-2 P-47D-28','DCS P-47D-30','NACA','<option value="C" selected>',
 '<option value="D">','src="data:image/png;base64,'])assert.ok(html.includes(s),'missing '+s);
assert.ok(!/__V1[5678]_/.test(html));
console.log('PASS v1.8: 1940s source comparisons frozen, candidate D induced loading and failures exposed, simulator variant/rating gates, standalone HTML scripts parsed');
