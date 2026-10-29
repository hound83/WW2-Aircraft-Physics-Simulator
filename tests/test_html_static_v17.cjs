'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../references/import/01_COMPLETE_V2_5_BASELINE/03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/Universal_Three_Aircraft_Model_v1.7.html'),'utf8');
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let js=0;
for(const script of scripts){
  if(/type="application\/json"/i.test(script[1]))JSON.parse(script[2]);
  else new vm.Script(script[2],{filename:`v1.7-script-${++js}`});
}
assert.ok(js>=3);
assert.ok(html.includes('Clean Physics v1.7 Experimental'));
assert.ok(html.includes('id="v17"'));
assert.ok(html.includes('id="f4scenario"'));
assert.ok(html.includes('IL-2 Great Battles in-game data'));
assert.ok(html.includes('source'));
assert.ok(html.includes('26.10 s'));
assert.ok(html.includes('id="v16"'));
assert.ok(html.includes('id="v15"'));
assert.ok(html.includes('src="data:image/png;base64,'));
assert.ok(html.includes('src="data:image/jpeg;base64,'));
assert.ok(!/__V1[567]_/.test(html));
assert.ok(html.includes('F4_SIM_E=0.546'));
console.log('PASS v1.7 HTML: JS parsed, interactive F4 simulator-conditioned scenario, both joint charts and historical P51 source retained');
