'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const old=fs.readFileSync(path.join(__dirname,'../references/import/01_COMPLETE_V2_5_BASELINE/03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/Universal_Three_Aircraft_Model_v1.8.html'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../references/import/01_COMPLETE_V2_5_BASELINE/03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/Universal_Three_Aircraft_Model_v1.9.html'),'utf8');
let js=0;
for(const s of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/type="application\/json"/i.test(s[1]))JSON.parse(s[2]);
 else new vm.Script(s[2],{filename:'v1.9-script-'+(++js)});
}
assert.ok(js>=3);
assert.ok(html.includes('Clean Physics v1.9 | Power Accounting Audit'));
assert.ok(html.includes('id="v19"'));
assert.ok(html.includes('id="v18"'));
assert.ok(html.includes('id="v17"'));
assert.ok(html.includes('id="f4scenario"'));
assert.ok(html.includes('id="profile"'));
assert.ok(html.includes('data:image/png;base64,'));
assert.ok(html.includes('re-derives')&&html.includes('level-speed anchor'));
assert.ok(html.includes('3,401')&&html.includes('4,380'));
assert.ok(!html.includes('__V19_PANEL__'));
assert.ok(old.includes('Clean Physics v1.8 Experimental'),'Previous v1.8 snapshot unmodified');
assert.ok(html.length>old.length,'v1.9 panel must add material without removing previous sections');
console.log('PASS v1.9 offline HTML: scripts parsed, v1.9 source audit visible, v1.8/v1.7/interactive model preserved');
