'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const old=fs.readFileSync(path.join(__dirname,'Universal_Three_Aircraft_Model_v1.9.html'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'Universal_Four_Aircraft_Model_v2.0.html'),'utf8');
let js=0,inlineData=null;
for(const s of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/type="application\/json"/i.test(s[1])){
  const obj=JSON.parse(s[2]);
  if(s[1].includes('id="cases"'))inlineData=obj;
 }else new vm.Script(s[2],{filename:'v2.0-script-'+(++js)});
}
assert.ok(js>=3,'Scripts parsed');
assert.ok(inlineData?.aircraft?.spitfire_lfix_bs543);
assert.equal(Object.keys(inlineData.aircraft).length,4);
assert.ok(html.includes('Clean Physics v2.0'));
assert.ok(html.includes('Four aircraft.'));
assert.ok(html.includes('UniversalFourAircraftUI'));
assert.ok(html.includes('id="v20"')&&html.includes('id="v19"'));
assert.ok(html.includes('id="v18"')&&html.includes('id="v17"'));
assert.ok(html.includes('spitfire_lfix_bs543'));
assert.ok(html.includes('17.7-second point')&&html.includes('20 historical level-speed checks'));
assert.ok(html.includes('id="validationAir"'));
assert.ok(html.includes('22,000 ft')&&html.includes('+13.8 psi'));
assert.ok(html.includes('data:image/png;base64,'));
assert.ok(!html.includes('__V20_PANEL__'));
assert.ok(old.includes('Clean Physics v1.9'),'Previous original unchanged');
assert.ok(html.length>old.length,'v2.0 is additive');
console.log('PASS v2.0 offline: valid embedded cases, all JS scripts parse, live Spitfire and old panels retained');
