'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');

function patchWorkingUI(html){
 const once=(pattern,replacement,label)=>{
  let n=0;html=html.replace(pattern,(...args)=>{n++;return typeof replacement==='function'?replacement(...args):replacement;});
  if(n!==1)throw Error('v2.8 UI patch '+label+': expected one match; got '+n);
 };
 once(/<option value="C" selected>C[^<]*<\/option>/,'<option value="P" selected>P · v2.8 joint-calibrated working model</option><option value="C">C · legacy v2.7 reference</option>','profile');
 once(/function optFor\(id,conf\)\{[\s\S]*?if\(isGreg109\)\{/,
  m=>m.replace('if(isGreg109){',"if(conf.profile==='P'){o.e=Math.min(1,(isSim109?F4_SIM_E:ac.workingModel.e)*conf.e/.78);return M.workingOptions(ac,o);}\nif(isGreg109){"),'working options');
 once(/M\.maxSpeed\(a,row\.altFt,\{profile:c\.profile,e:c\.e,refit:c\.refit,rating:row\.rating,gear:row\.gear,weightLb:a\.weightLb\*c\.weight\}\)/,
  "M.maxSpeed(a,row.altFt,c.profile==='P'?M.workingOptions(a,{e:Math.min(1,a.workingModel.e*c.e/.78),rating:row.rating,gear:row.gear,weightLb:a.weightLb*c.weight}):{profile:c.profile,e:c.e,refit:c.refit,rating:row.rating,gear:row.gear,weightLb:a.weightLb*c.weight})",'cross audit');
 once(/profiles=\['A','B','C'\]/,"profiles=['A','B','C','P']",'Mustang comparison');
 html=html.replace('Generic Oswald','Effective scenario Oswald');
 html=html.replace('weightLb:src.reportedTakeoffWeightLb,stepMph:1', "engineModel:profile==='P'?'ram-critical':undefined,weightLb:src.reportedTakeoffWeightLb,stepMph:1");
 html=html.replace('Fixed C/0.78 calibrated drag','Source-anchor drag (P uses joint fitted e)');
 html=html.replaceAll('Uses unchanged drag fit and prop profile','P uses joint-calibrated drag and propeller settings; legacy profiles retain their original fit');
 html=html.replaceAll('Not adjusted or tuned using climb numbers','P: 67-inHg climb fitted; 75-inHg excluded from parameter fit. All data seen during development');
 const audit=require('../validation/current/v29-robustness.json');
 const notice='<details id="v29-robustness"><summary>How stable is this model?</summary><p>The working model matches the two Mustang climb report rates more closely than the legacy reference in '+audit.chart.improves+' of '+audit.chart.total+' tested power/weight scenarios. Results remain sensitive to assumed test conditions. These scenarios are not historical accuracy bounds. The v2.9 review retains the v2.8 working calibration.</p></details>';
 html=html.replace('</header>',notice+'</header>');
 return html;
}

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
 html=html.replace('<header>','<header><p class="status" id="research-version">Research v'+version+' · Historical accuracy remains unresolved</p><p class="status">Profile P: the e slider at 0.78 uses each aircraft’s fitted base e. Moving it changes an effective-drag scenario and reanchors speed drag; this is not measured wing efficiency.</p>');
 html=patchWorkingUI(html);
 fs.mkdirSync(path.join(root,'dist'),{recursive:true});
 fs.writeFileSync(path.join(root,'dist/model.html'),html);
 const metadata={version,researchStatus:'v2.8 joint-calibrated working profile P; legacy C compatibility preserved',workingProfile:'P',legacyProfile:'C',template:'releases/baseline-v2.5.html',physicsSha256:sha256(engine),casesSha256:sha256(cases),storesSha256:sha256(stores),htmlSha256:sha256(html),bytes:Buffer.byteLength(html),browserInteractionTested:false};
 fs.writeFileSync(path.join(root,'dist/build.json'),JSON.stringify(metadata,null,2)+'\n');
 return metadata;
}
if(require.main===module)console.log(JSON.stringify(build(),null,2));
module.exports={build,sha256};
