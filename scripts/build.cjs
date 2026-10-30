'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
function build(){
 const version=require('../package.json').version;
 if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Invalid research release version');
 const template=fs.readFileSync(path.join(root,'releases/baseline-v2.5.html'),'utf8');
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const engine=read('src/physics.js'),cases=read('aircraft/cases.json'),stores=read('aircraft/stores.json');
 const climb=read('validation/diagnostics/climb_audit.js'),storeHelper=read('validation/diagnostics/stores_validation.js');
 const replacements={cases:0,stores:0,engine:0,climb:0,storeHelper:0};
 let html=template.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(whole,attrs,body)=>{
  let next;
  if(/\bid="cases"/.test(attrs)){next=cases;replacements.cases++;}
  else if(/\bid="stores-data"/.test(attrs)){next=stores;replacements.stores++;}
  else if(body.includes('root.UniversalAirPhysics=api')){next=engine;replacements.engine++;}
  else if(body.includes('root.UniversalClimbAudit=api')){next=climb;replacements.climb++;}
  else if(body.includes('root.UniversalStoresValidation=api')){next=storeHelper;replacements.storeHelper++;}
  else return whole;
  if(/<\/script/i.test(next))throw Error('Embedded source contains an unsafe closing script tag');
  return '<script'+attrs+'>'+next+'</script>';
 });
 for(const [key,n]of Object.entries(replacements))if(n!==1)throw Error('Expected one '+key+' block; got '+n);
 html=html.replace(/<title>[^<]*<\/title>/,'<title>European Air War Physics v'+version+' | Research</title>');
 html=html.replace('<header>','<header><p class="status" id="research-version">Research v'+version+' · Historical accuracy remains unresolved</p>');
 fs.mkdirSync(path.join(root,'dist'),{recursive:true});
 fs.writeFileSync(path.join(root,'dist/model.html'),html);
 const metadata={version,researchStatus:'Historical accuracy unresolved; default v2.5 numerical behavior preserved',template:'releases/baseline-v2.5.html',physicsSha256:sha256(engine),casesSha256:sha256(cases),storesSha256:sha256(stores),htmlSha256:sha256(html),bytes:Buffer.byteLength(html),browserInteractionTested:false};
 fs.writeFileSync(path.join(root,'dist/build.json'),JSON.stringify(metadata,null,2)+'\n');
 return metadata;
}
if(require.main===module)console.log(JSON.stringify(build(),null,2));
module.exports={build,sha256};
