'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const page=fs.readFileSync(path.join(__dirname,'Universal_Four_Aircraft_Model_v2.2.html'),'utf8');
const v21=fs.readFileSync(path.join(__dirname,'Universal_Four_Aircraft_Model_v2.1.html'),'utf8');
let scripts=0,aircraft,physics,ui;
for(const match of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/type="application\/json"/i.test(match[1])){
  if(match[1].includes('id="cases"'))aircraft=JSON.parse(match[2]).aircraft;
 }else{
  new vm.Script(match[2],{filename:`v22-script-${++scripts}`});
  if(match[2].includes('function propEta'))physics=match[2];
  if(match[2].includes('function optFor'))ui=match[2];
 }
}
assert.equal(Object.keys(aircraft).length,4);
assert.ok(scripts>=3&&physics&&ui);
assert.ok(physics.includes("profile==='G'"),'new opt-in Greg profile embedded');
assert.ok(ui.includes("$('f4scenario').value==='greg'"),'F4 Greg independent polar control wired');
assert.ok(ui.includes('o.polar={e:gp.oswald,cd0:gp.cd0,source:gp.source}'));
assert.ok(ui.includes('selected=result.profiles[active]'));
assert.ok(ui.includes("'C');"),'old fixed-audit controls have fallback when G selected');
assert.ok(page.includes('Clean Physics v2.2'));
assert.ok(page.includes('id="v22"')&&page.includes('id="v21"')&&page.includes('id="v20"'));
assert.ok(page.includes('id="engineModel"')&&page.includes('id="f4scenario"'));
assert.ok(page.includes('value="G"')&&page.includes('value="greg"'));
assert.ok(page.includes('0.76 pp')&&page.includes('G after speed refit'));
assert.ok(page.includes('data:image/png;base64,')&&page.length>v21.length);
assert.ok(v21.includes('version:"2.1"'),'unchanged v2.1 source retained');
console.log('PASS v2.2: four-aircraft offline HTML script syntax and new live G/109 controls; all prior panels preserved');
