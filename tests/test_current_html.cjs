'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {build}=require('../scripts/build.cjs'),root=path.resolve(__dirname,'..');
const info=build(),html=fs.readFileSync(path.join(root,'dist/model.html'),'utf8');
let scripts=0,engine=null,cases=null,stores=null;
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/type="application\/json"/.test(m[1])){
  const value=JSON.parse(m[2]);
  if(/\bid="cases"/.test(m[1]))cases=value;
  if(/\bid="stores-data"/.test(m[1]))stores=value;
 }else{
  new vm.Script(m[2],{filename:'current-inline-'+(++scripts)});
  if(m[2].includes('root.UniversalAirPhysics=api'))engine=m[2];
 }
}
assert.ok(scripts>=4,'shared engine, helpers and UI must all be present');
assert.equal(engine,fs.readFileSync(path.join(root,'src/physics.js'),'utf8'),'HTML must embed active engine exactly');
assert.deepEqual(cases,require('../aircraft/cases.json'),'HTML must use current aircraft data');
assert.deepEqual(stores,require('../aircraft/stores.json'),'HTML must use current stores data');
assert.equal(Object.keys(cases.aircraft).length,4,'scope stays at four benchmark aircraft');
assert.ok(info.bytes>100000,'standalone template must not be accidentally truncated');
assert.equal(info.version,require('../package.json').version);
assert.ok(html.includes('id="research-version">Research v'+info.version));
assert.ok(html.includes('<title>European Air War Physics v'+info.version));
assert.equal((html.match(/id="research-version"/g)||[]).length,1);
console.log('PASS current standalone: active engine/data parity, inline JavaScript syntax, four-aircraft scope');
