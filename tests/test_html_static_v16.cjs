'use strict';
/* Offline HTML syntax/data gate; browser smoke test is a separate check. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../references/import/01_COMPLETE_V2_5_BASELINE/03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/Universal_Three_Aircraft_Model_v1.6.html'),'utf8');
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let js=0;
for(const match of scripts){
  if(/type="application\/json"/i.test(match[1])){
    const obj=JSON.parse(match[2]);
    if(match[1].includes('id="cases"')){
      assert.equal(obj.aircraft.bf109f4.propGeometry.reductionRatioEnginePerProp,1.685);
      assert.equal(obj.aircraft.p51b.propGeometry.reductionRatioEnginePerProp,44/21);
    }
  } else new vm.Script(match[2],{filename:`v1.6-inline-${++js}`});
}
assert.ok(js>=3);
assert.ok(html.includes('id="v16"'));
assert.ok(html.includes('id="v15"'));
assert.ok(html.includes('src="data:image/png;base64,'));
assert.ok(html.includes('src="data:image/jpeg;base64,'));
assert.ok(html.includes('318'));
assert.ok(html.includes('0.946'));
assert.ok(html.includes('Clean Physics v1.6'));
assert.ok(!html.includes('__V16_PANEL__'));
console.log('PASS v1.6 HTML: embedded graph+original scan, chart audit, source-rated gearing, inline JS syntax');
