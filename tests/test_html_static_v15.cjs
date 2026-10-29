'use strict';
/* Offline HTML integration/syntax gate. Not a substitute for a real browser smoke test. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const dir=__dirname;
const html=fs.readFileSync(path.join(dir,'../references/import/01_COMPLETE_V2_5_BASELINE/03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/Universal_Three_Aircraft_Model_v1.5.html'),'utf8');
const match=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
assert(match.length>=5,'Expect embedded aircraft JSON, source data and calculation scripts');
let jsCount=0;
for(const m of match){
  const id=m[1].match(/\bid="([^"]+)"/)?.[1];
  if(/type="application\/json"/i.test(m[1])){
    const obj=JSON.parse(m[2]);
    if(id==='cases'){
      assert.equal(obj.aircraft.bf109f4.propGeometry.reductionRatioEnginePerProp,1.685);
      assert.equal(obj.aircraft.bf109f4.defaultRating,'combat');
    }
  }else{
    new vm.Script(m[2],{filename:`v1.5-inline-script-${jsCount++}`});
  }
}
assert(jsCount>=3);
assert(html.includes('id="v15"'));
assert(html.includes('P-51B May 20 absolute climb MAE'));
assert(html.includes('1,484/1,602 rpm'));
assert(html.includes('−3.214°/s'));
assert(!html.includes('__V15_AUDIT__'));
assert(html.includes('Clean Physics v1.5'));
console.log(`PASS v1.5 inline JS syntax (${jsCount} scripts), data parse, DB601E gearing, absolute benchmark panel`);
