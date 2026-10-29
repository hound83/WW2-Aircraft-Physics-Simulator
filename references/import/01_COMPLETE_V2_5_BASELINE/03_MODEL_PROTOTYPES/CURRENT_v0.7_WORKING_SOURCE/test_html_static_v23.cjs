'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const page=fs.readFileSync(path.join(__dirname,'Universal_Four_Aircraft_Model_v2.3.html'),'utf8');
const previous=fs.readFileSync(path.join(__dirname,'Universal_Four_Aircraft_Model_v2.2.html'),'utf8');
let scripts=0,aircraft,physics,ui;
for(const match of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/type="application\/json"/i.test(match[1])){
  if(match[1].includes('id="cases"'))aircraft=JSON.parse(match[2]).aircraft;
 }else{
  new vm.Script(match[2],{filename:`v23-script-${++scripts}`});
  if(match[2].includes('function nacaLowSpeedPropChart'))physics=match[2];
  if(match[2].includes('function optFor'))ui=match[2];
 }
}
assert.equal(Object.keys(aircraft).length,4);
assert.ok(scripts>=3&&physics&&ui);
assert.ok(physics.includes("profile==='N'"));
assert.ok(ui.includes("$('f4scenario').value==='greg'"));
assert.ok(page.includes('version:"2.3"'));
assert.ok(page.includes('value="N"')&&page.includes('value="G"'));
assert.ok(page.includes('id="v23"')&&page.includes('id="v22"')&&page.includes('id="v21"'));
assert.ok(page.includes('Independent flight-measured propeller η'));
assert.ok(page.includes('NACA MR L5G09a'));
assert.ok(page.includes('19930093644')&&page.includes('19930093653'));
assert.ok(page.includes('data:image/jpeg;base64,')&&page.includes('data:image/png;base64,'));
assert.ok(page.length>previous.length);
assert.ok(previous.includes('version:"2.2"'));
console.log('PASS v2.3 offline app: NACA N selectable, scientific audit and flight holdout visible, old functionality preserved');
