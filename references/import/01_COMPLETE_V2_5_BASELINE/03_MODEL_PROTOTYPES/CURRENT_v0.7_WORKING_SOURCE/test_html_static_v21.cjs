'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const older=fs.readFileSync(path.join(__dirname,'Universal_Four_Aircraft_Model_v2.0.html'),'utf8');
const page=fs.readFileSync(path.join(__dirname,'Universal_Four_Aircraft_Model_v2.1.html'),'utf8');
let scripts=0,aircraft=null,physicsScript=null,uiScript=null;
for(const match of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/type="application\/json"/i.test(match[1])){
  if(match[1].includes('id="cases"'))aircraft=JSON.parse(match[2]).aircraft;
 }else{
  new vm.Script(match[2],{filename:'v21-script-'+(++scripts)});
  if(match[2].includes('function ramManifoldAtSpeed'))physicsScript=match[2];
  if(match[2].includes('function optFor'))uiScript=match[2];
 }
}
assert.equal(Object.keys(aircraft||{}).length,4);
assert.ok(aircraft.spitfire_lfix_bs543.inletRam);
assert.ok(aircraft.p51b.inletRam);
assert.ok(aircraft.bf109f4.inletRam);
assert.equal(aircraft.p47b.inletRam,undefined,'P-47 is correctly excluded from direct-geared ram rule');
assert.ok(scripts>=3&&physicsScript&&uiScript);
assert.ok(page.includes('Clean Physics v2.1'));
assert.ok(page.includes('id="engineModel"'));
assert.ok(page.includes('value="charted" selected'));
assert.ok(page.includes('value="ram"'));
assert.ok(uiScript.includes("conf.engineMode==='ram'&&id!=='p47b'?"));
assert.ok(page.includes('0.42 psi')&&page.includes('365 → 139'));
assert.ok(page.includes('without reading the climb MAP'));
assert.ok(page.includes('id="v21"')&&page.includes('id="v20"'));
assert.ok(page.includes('id="v19"')&&page.includes('id="v18"'));
assert.ok(page.includes('id="validationAir"'));
assert.ok(page.includes('data:image/png;base64,'));
assert.ok(older.includes('Clean Physics v2.0'),'Original v2.0 unchanged');
assert.ok(page.length>older.length);
console.log('PASS v2.1 four-plane offline UI scripts parse; all data/provenance, engine toggle and prior panels retained');
