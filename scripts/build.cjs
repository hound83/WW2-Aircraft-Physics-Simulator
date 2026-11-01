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
 if(!/^\d+\.\d+\.\d+(?:-rc\.\d+)?$/.test(version))throw Error('Invalid research release version');
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
 html=html.replace("if(conf.profile==='P'){o.e=", "if(conf.profile==='P'){if(isGreg109){const gp=M.inferredGregF4(ac,D.greg.bf109f4);o.polar={e:gp.oswald,cd0:gp.cd0,source:gp.source};return o;}o.e=");
 const panel='<section class="panel" id="release-support"><h2>Model coverage and scenario ranges</h2><p>This release candidate retains the v2.8 working calibration. A calculation inside its input domain is not historical validation. Stall and turn results remain provisional; no 5:1 accuracy claim.</p><p>100-590 mph TAS is a declared numerical scenario window, not a validated flight envelope. Engine interpolation is limited to each recorded gear domain. Source speed points remain discrete checkpoints.</p><div id="supportTable" style="overflow-x:auto"></div><div id="supportPairs" style="overflow-x:auto"></div><div id="supportRange"></div><label>Inspect exact Mustang source node <select id="supportNode"><option value="2200|67inHg">2200 ft / 67 inHg</option><option value="2200|75inHg">2200 ft / 75 inHg</option><option value="4000|75inHg">4000 ft / 75 inHg</option><option value="8000|75inHg">8000 ft / 75 inHg</option><option value="12000|75inHg">12000 ft / 75 inHg</option></select></label><p id="supportNodeRange"></p></section>';
 html=html.replace(/(<section\b[^>]*\bid="crossaudit"[^>]*>)/,panel+'$1<p class="status">Legacy A/B/C diagnostic below. With P selected this historical panel shows C; use the live coverage panel above for current-profile comparisons. These are exposed engineering checks.</p>');
 html=html.replace(/(<section\b[^>]*\bid="conditioning"[^>]*>)/,'$1<p class="status">Legacy C one-point P-47 configuration-loss experiment. This panel is retained for comparison and does not follow the working-profile selector.</p>');
 html=html.replace('render,model:M,data:D,version:"2.5"','render,model:M,data:D,conditions:key,optionsFor:optFor,version:'+JSON.stringify(version));
 const climbPanel='<section class="panel" id="v31-climb"><h2>Condition-aware climb: P-47B and Spitfire</h2><div id="v31-stats"></div><p>Fixed report climb states and reference masses. P-47 climb observations are from 41-5931; the speed/power reference is 41-5902. Its errors below are cross-specimen engineering benchmarks, not same-aircraft validation. These results use the v3.1 source-condition model and do not follow the exploratory controls above. Clean speed curves and generic power/turn scenarios retain their previous settings.</p><p>Power now uses a jointly fitted charge-density response to the recorded boost ratio, with nonnegative configuration drag. These are exposed engineering checks, not independent historical accuracy. The Spitfire 14000-ft row has no matched reference boost, so its charge correction is unavailable rather than interpolated.</p><details><summary>Inspect the recorded climb conditions and predictions</summary><div id="v31-table" style="overflow-x:auto"></div></details><p>Alternate fits improve against a linear-power control refitted on identical data. One P-47 alternate check set still favors the retained model, which previously fitted some of those points. Mass/power stress favors the new model in 9/9 P-47 and 8/9 Spitfire scenarios; this is not a universal error bound.</p></section>';
 html=html.replace(/(<section\b[^>]*\bid="crossaudit"[^>]*>)/,climbPanel+'$1');
 const conditionSources=[read('src/climb-conditions.js'),read('src/climb-conditions-ui.js'),read('references/climb-condition-states.json'),read('calibration/v3.1-climb-model.json'),read('validation/current/v31-climb-improvement.json')];
 for(const text of conditionSources)if(/<\/script/i.test(text))throw Error('Unsafe climb condition embed');
 const conditionEmbed='<script>'+conditionSources[0]+'</script><script type="application/json" id="climb-condition-states">'+conditionSources[2]+'</script><script type="application/json" id="climb-condition-model">'+conditionSources[3]+'</script><script type="application/json" id="climb-condition-report">'+conditionSources[4]+'</script><script>'+conditionSources[1]+'</script>';
 const source=read('src/support.js'),ui=read('src/support-ui.js'),audit=read('validation/current/v29-robustness.json');
 for(const text of [source,ui,audit])if(/<\/script/i.test(text))throw Error('Unsafe release support embed');
 const measuredPanel='<section class="panel" id="measured-climb"><h2>P-47B 41-5902: recorded-power climb replay</h2><p>Ten exact report states use recorded shaft horsepower, TAS and RPM from the same aircraft as the speed reference. Propeller gearing is verified in the original handbook. Gross test mass of 12,565 lb remains an explicit scenario; installed propeller efficiency and open-cooling drag remain provisional. These report states are fixed and independent of the exploratory controls above.</p><label>Configuration scenario <select id="measured-drag"><option value="transferred">Existing open-cooling drag transferred from 41-5931</option><option value="clean">Clean polar only, no extra cooling drag</option></select></label><p id="measured-status"></p><div id="measured-table" style="overflow-x:auto"></div><p>No coefficients were fitted to these rows. The 35,000-ft state is an exact recorded-power replay, not an extension of the generic engine curve. Neither scenario establishes independent historical accuracy.</p></section>';
 const measuredSources=[read('src/measured-climb.js'),read('src/measured-climb-ui.js'),read('references/p47b-measured-climb-v33.json')];
 for(const text of measuredSources)if(/<\/script/i.test(text))throw Error('Unsafe measured climb embed');
 const measuredEmbed='<script>'+measuredSources[0]+'</script><script type="application/json" id="measured-climb-source">'+measuredSources[2]+'</script><script>'+measuredSources[1]+'</script>';
 html=html.replace(/(<section\b[^>]*\bid="crossaudit"[^>]*>)/,measuredPanel+'$1');
 html=html.replace('</body>','<script>'+source+'</script><script type="application/json" id="robustness-data">'+audit+'</script><script>'+ui+'</script>'+conditionEmbed+measuredEmbed+'</body>');
 fs.mkdirSync(path.join(root,'dist'),{recursive:true});
 fs.writeFileSync(path.join(root,'dist/model.html'),html);
 const metadata={version,researchStatus:'v3.1 explicit source-climb calibration; v2.8 clean profile P and legacy C behavior retained',workingCalibration:'2.8.0',climbConditionCalibration:'3.1.0',releaseStage:'engineering-increment',workingProfile:'P',legacyProfile:'C',template:'releases/baseline-v2.5.html',physicsSha256:sha256(engine),casesSha256:sha256(cases),storesSha256:sha256(stores),htmlSha256:sha256(html),bytes:Buffer.byteLength(html),browserInteractionTested:false};
 fs.writeFileSync(path.join(root,'dist/build.json'),JSON.stringify(metadata,null,2)+'\n');
 return metadata;
}
if(require.main===module)console.log(JSON.stringify(build(),null,2));
module.exports={build,sha256};
