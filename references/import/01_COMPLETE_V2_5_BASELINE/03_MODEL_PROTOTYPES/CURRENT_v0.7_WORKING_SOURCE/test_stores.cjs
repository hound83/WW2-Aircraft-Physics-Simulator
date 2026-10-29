'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs'),dir=__dirname;
const M=require('./physics.js'),S=require('./stores_validation.js');
const D=JSON.parse(fs.readFileSync(path.join(dir,'cases.json'),'utf8'));
const historical=JSON.parse(fs.readFileSync(path.join(dir,'stores.json'),'utf8'));
const nearly=(x,y,tol=.000001)=>assert.ok(Math.abs(x-y)<tol,`${x} not ${y}`);
// Mosquito RAF independent reporting conditions. Low-alt peak-speed pair used for inverse fit;
// high-alt peak-speed pair withheld. Historical test conditions are not identical.
const raw=S.audit(historical,{mode:'raw'}),author=S.audit(historical,{mode:'raf-corrected'});
nearly(raw.fit.parasiteDragIncrease,.14853617069,1e-8);
nearly(raw.hold.loadedMph,383.00780544,.005);
assert.ok(Math.abs(raw.highResidualMph)<.1);
assert.ok(author.hold.loadedMph>raw.hold.loadedMph,'author 15–18 mph estimate is less penalty than raw peak differences');
assert.ok(author.hold.lossMph>15&&author.hold.lossMph<20);
assert.equal(historical.p38g.bombLoadedSpeed,null,'P38 Greg source screenshot NOT a measured bomb-loaded test');
assert.equal(historical.sources.greg_p38_chart.provenance,'user_supplied_secondary_graph');
assert.equal(historical.mosquito.gears.length,2);
// Frozen generic solver: added drag OR stores mass may not INCREASE maximum level speed.
for(const [id,at] of [['bf109f4',5000],['p47b',15000],['p51b',10000]]){
 const ac=D.aircraft[id],defaultConfig={profile:'C',e:.78};
 const clean=M.maxSpeed(ac,at,defaultConfig);
 const drag=M.maxSpeed(ac,at,{...defaultConfig,addedDragAreaM2:.2});
 const mass=M.maxSpeed(ac,at,{...defaultConfig,storesWeightLb:1000});
 const combined=M.maxSpeed(ac,at,{...defaultConfig,addedDragAreaM2:.2,storesWeightLb:1000});
 assert.ok(clean!=null&&drag!=null&&mass!=null&&combined!=null,id+' engine has valid samples');
 assert.ok(drag<clean,id+' extra parasite area slows aircraft');
 assert.ok(mass<clean,id+' extra mass increases induced drag');
 assert.ok(combined<Math.min(drag,mass),id+' combined effects decrease speed more');
 const r=M.evaluated(ac,at,200,{...defaultConfig,storesWeightLb:1000,addedDragAreaM2:.2});
 assert.equal(r.status,'modelled');
 assert.equal(r.weightLb,ac.weightLb+1000);
 nearly(r.cd0-r.cleanCd0,.2/ac.wingAreaM2,1e-12);
 const cleanr=M.evaluated(ac,at,200,defaultConfig);
 const rho=M.isa(at).rho,V=200*.44704;
 nearly(r.drag.dParasite-cleanr.drag.dParasite,.5*rho*V*V*.2,1e-7);
 assert.ok(r.drag.dInd>cleanr.drag.dInd,'weight increases induced drag');
 assert.ok(r.power.excessHp<cleanr.power.excessHp,'extra stores reduce available excess power');
}
const invalid=M.evaluated(D.aircraft.p47b,5000,250,{storesWeightLb:-1});
assert.equal(invalid.status,'invalid-input');
const invalid2=M.evaluated(D.aircraft.p47b,5000,250,{addedDragAreaM2:-.1});
assert.equal(invalid2.status,'invalid-input');
const belowLimit=S.predictLoaded(393,1.05,.12,18);
assert.equal(belowLimit.status,'no-supported-level-speed','no fabricated solution for absurd stores penalty');
console.log('PASS v0.6 RAF Mosquito stores benchmark, P-38G evidence separation, universal P-47/P-51/Bf109 drag-area and mass invariants');
