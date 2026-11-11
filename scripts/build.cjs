'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');

function patchWorkingUI(html){
 const once=(pattern,replacement,label)=>{
  let n=0;html=html.replace(pattern,(...args)=>{n++;return typeof replacement==='function'?replacement(...args):replacement;});
  if(n!==1)throw Error('v2.8 UI patch '+label+': expected one match; got '+n);
 };
 once(/<option value="C" selected>C[^<]*<\/option>/,'<option value="P" selected>P · Condition-aware working model</option><option value="C">C · legacy v2.7 reference</option>','profile');
 once(/function optFor\(id,conf\)\{[\s\S]*?if\(isGreg109\)\{/,
  m=>m.replace('if(isGreg109){',"if(conf.profile==='P'){o.e=Math.min(1,(isSim109?F4_SIM_E:ac.workingModel.e)*conf.e/.78);return M.workingOptions(ac,o);}\nif(isGreg109){"),'working options');
 once(/M\.maxSpeed\(a,row\.altFt,\{profile:c\.profile,e:c\.e,refit:c\.refit,rating:row\.rating,gear:row\.gear,weightLb:a\.weightLb\*c\.weight\}\)/,
  "M.maxSpeed(a,row.altFt,c.profile==='P'?M.workingOptions(a,{e:Math.min(1,a.workingModel.e*c.e/.78),rating:row.rating,gear:row.gear,weightLb:a.weightLb*c.weight,flightEnvelope:flightEnvelope}):{profile:c.profile,e:c.e,refit:c.refit,rating:row.rating,gear:row.gear,weightLb:a.weightLb*c.weight})",'cross audit');
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
 const researchCatalog=require('./research-layer.cjs').buildCatalog({root,version});
 const researchData=JSON.stringify(researchCatalog),researchUI=read('src/research-explorer-ui.js');
 if([researchData,researchUI].some(value=>/<\/script/i.test(value)))throw Error('Unsafe research catalog embed');
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
 html=html.replace('<header>','<header><p class="status" id="research-version">Research v'+version+' · Historical accuracy remains unresolved</p><p><a href="#historical-evidence">Historical evidence library</a> · <a href="#fighter-comparison">Compare four fighters</a> · <a href="#fw190-comparison">Fw 190 A-4 vs Spitfire</a> · <a href="#p38g-comparison">P-38G vs P-47B</a> &middot; <a href="#mustang-maneuver-power">Mustang climb and turn power</a> &middot; <a href="#turn-stall-correction">Turn and stall correction</a> &middot; <a href="#stall-lab">Compare clean stall speeds</a> · <a href="#measured-climb">Inspect the P-47B climb test</a></p><p class="status">Profile P: the e slider at 0.78 uses each aircraft’s fitted base e. Moving it changes an effective-drag scenario and reanchors speed drag; this is not measured wing efficiency.</p>');
 html=patchWorkingUI(html);
 html=html.replace("if(conf.profile==='P'){o.e=", "if(conf.profile==='P'){if(isGreg109){const gp=M.inferredGregF4(ac,D.greg.bf109f4);o.polar={e:gp.oswald,cd0:gp.cd0,source:gp.source};return o;}o.e=");
 const flightEnvelope=read('calibration/flight-envelope.json');
 if(/<\/script/i.test(flightEnvelope))throw Error('Unsafe flight envelope embed');
 html=html.replace('</header>','</header><script type="application/json" id="flight-envelope-data">'+flightEnvelope+'</script>');
 html=html.replace('function optFor(id,conf){','const flightEnvelope=JSON.parse(document.getElementById("flight-envelope-data").textContent);\nfunction optFor(id,conf){');
 html=html.replace('o.e=Math.min(1,(isSim109?', "if(!isSim109){o.flightEnvelope=flightEnvelope;if(id==='p47b')o.rating=$('p47rating').value;if(id==='p47b'||id==='spitfire_lfix_bs543')o.flightCooling=$('flightCooling').value==='open';}o.e=Math.min(1,(isSim109?");
 html=html.replace("if(conf.profile==='P'){if(isGreg109)", "if(id==='bf109f4'&&$('f4scenario').value==='db601e')o.engineModel='inlet-transfer';if(conf.profile==='P'){if(isGreg109)");
 html=html.replace('Bf 109 F-4 induced-drag scenario','Bf 109 F-4 model basis');
 html=html.replace('<option value="global">Use exploratory shared e slider</option>',
  '<option value="global">Use exploratory shared e slider</option><option value="db601e">DB 601 E inlet transfer · combat only (P)</option>');
 html=html.replace('id="alt" type="range" min="0" max="34000"', 'id="alt" type="range" min="0" max="35000"');
 html=html.replace('<div class="control"><label for="p51mode">','<div class="control"><label for="p47rating">P-47B rating (profile P)</label><select id="p47rating"><option value="military">Military · 2,700 rpm</option><option value="normal">Normal · 2,550 rpm</option></select></div><div class="control"><label for="flightCooling">P-47B / Spitfire cooling (profile P)</label><select id="flightCooling"><option value="reference">Reference configuration</option><option value="open">Open-shutter climb drag</option></select></div><div class="control"><label for="p51mode">');
 html=html.replace("const invalid=r.status==='no-engine-source'||r.status==='no-credible-drag-anchor';","const invalid=!r.power;");
 html=html.replace('CD₀ (anchor-fit) / e','Effective CD₀ / e');
 const panel='<section class="panel" id="release-support"><h2>Model coverage and scenario ranges</h2><p>Profile P adds source-bounded P-47B power and open-shutter scenarios, fast-flight calibration and net-power gear selection. A calculation inside its input domain is not historical validation. Stall and turn results remain provisional; no 5:1 accuracy claim.</p><p>100-590 mph TAS is a declared numerical scenario window, not a validated flight envelope. Engine interpolation is limited to each recorded gear domain. Source speed points remain discrete checkpoints.</p><div id="supportTable" style="overflow-x:auto"></div><div id="supportPairs" style="overflow-x:auto"></div><div id="supportRange"></div><label>Inspect exact Mustang source node <select id="supportNode"><option value="2200|67inHg">2200 ft / 67 inHg</option><option value="2200|75inHg">2200 ft / 75 inHg</option><option value="4000|75inHg">4000 ft / 75 inHg</option><option value="8000|75inHg">8000 ft / 75 inHg</option><option value="12000|75inHg">12000 ft / 75 inHg</option></select></label><p id="supportNodeRange"></p></section>';
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
 const measuredPanel='<section class="panel" id="measured-climb"><style>#measured-climb .measured-controls{display:flex;flex-wrap:wrap;gap:16px;align-items:end}#measured-climb label{display:flex;flex-direction:column;gap:6px}#measured-climb select,#measured-climb button{font:inherit;padding:8px;max-width:100%;border-radius:6px}#measured-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:18px 0}#measured-metrics div{border:1px solid #46606d;border-radius:8px;padding:16px;background:#19303a}#measured-metrics strong{display:block;font-size:1.65rem;color:#8cddfb}#measured-metrics span{display:block;margin-top:8px;font-size:.9rem}#measured-climb .chart-key{display:flex;flex-wrap:wrap;gap:20px;font-size:.9rem}#measured-climb summary{cursor:pointer;padding:12px 0}</style><h2>Climb laboratory: P-47B 41-5902</h2><p>Compare the report, the previous model and the new configuration model at ten exact test states. Five states fit the model; five check it. The checks were already exposed during research, so they are engineering comparisons rather than independent accuracy proof.</p><div class="measured-controls"><label>Model<select id="measured-drag"><option value="calibrated">v3.4 source-matched configuration model</option><option value="transferred">v3.3 drag transferred from 41-5931</option><option value="clean">Clean polar only, no extra cooling drag</option></select></label><label>Test-mass scenario<select id="measured-weight"><option value="12365">12,365 lb</option><option value="12565" selected>12,565 lb, report gross weight</option><option value="12765">12,765 lb</option></select></label><label>Propeller retained-power assumption<select id="measured-prop"><option value="0.97">3% lower</option><option value="1" selected>Nominal</option><option value="1.03">3% higher</option></select></label><button type="button" id="measured-reset">Reset comparison</button></div><p id="measured-status" aria-live="polite"></p><div id="measured-metrics"></div><div class="chart-key"><span style="color:#d8e1e8">Report</span><span style="color:#f2ba68">Previous v3.3, dashed</span><span style="color:#64cbf4">Selected model</span><span>Open circles: fit; filled squares: reserved checks</span></div><div id="measured-chart" style="overflow-x:auto"></div><p>Lines connect exact report states for display; the solver does not interpolate between them. The two 12,600-ft states show the military-to-normal power transition.</p><details><summary>Inspect all report states, predictions and fit/check roles</summary><div id="measured-table" style="overflow-x:auto"></div></details><details><summary>What this comparison assumes</summary><p>Recorded shaft BHP, TAS and engine RPM come from the same aircraft as the speed reference. Original handbook gearing gives 1,275 propeller RPM at 2,550 engine RPM. Gross test mass is a scenario, not instantaneous climb mass. The new configuration model is an aggregate loss fit; it does not isolate measured cooling heat or installed propeller efficiency. The clean option omits extra open-cooling drag.</p><p>The 35,000-ft state is an exact recorded-power replay, not an extension of the generic engine curve. Generic flight controls and earlier aircraft calibrations remain separate. Spitfire high-altitude source uncertainty remains open.</p></details></section>';
 const measuredSources=[read('src/measured-climb.js'),read('src/measured-climb-ui.js'),read('references/p47b-measured-climb-v33.json'),read('src/source-configuration.js'),read('calibration/v3.4-configuration-model.json'),read('validation/current/v34-configuration.json')];
 for(const text of measuredSources)if(/<\/script/i.test(text))throw Error('Unsafe measured climb embed');
 const measuredEmbed='<script>'+measuredSources[0]+'</script><script>'+measuredSources[3]+'</script><script type="application/json" id="measured-climb-source">'+measuredSources[2]+'</script><script type="application/json" id="source-configuration-model">'+measuredSources[4]+'</script><script type="application/json" id="source-configuration-report">'+measuredSources[5]+'</script><script>'+measuredSources[1]+'</script>';
 html=html.replace(/(<section\b[^>]*\bid="release-support"[^>]*>)/,measuredPanel+'$1');
 const stallParts=[read('src/stall-lab.js'),read('src/stall-lab-ui.js'),read('references/stall-calibration-research-2026-11-02.json')];
 for(const text of stallParts)if(/<\/script/i.test(text))throw Error('Unsafe stall laboratory embed');
 const stallPanel=read('src/stall-lab-panel.html');
 html=html.replace(/(<section\b[^>]*\bid="release-support"[^>]*>)/,stallPanel+'$1');
 html=html.replace("for(const input of document.querySelectorAll('input,select'))input.addEventListener('input',render)","for(const input of document.querySelectorAll('input,select'))if(!input.closest('#stall-lab, #fighter-comparison, #historical-evidence, #maneuver-envelope'))input.addEventListener('input',render)");
 const stallEmbed='<script>'+stallParts[0]+'</script><script type="application/json" id="stall-research-data">'+stallParts[2]+'</script><script>'+stallParts[1]+'</script>';
 const turnLift=read('src/turn-lift.js'),turnLiftSource=read('references/p51-turn-lift-tn1044.json');
 if([turnLift,turnLiftSource].some(value=>/<\/script/i.test(value)))throw Error('Unsafe turn lift embed');
 html=html.replace('</header>', '</header><script>'+turnLift+'</script><script type="application/json" id="turn-lift-source">'+turnLiftSource+'</script>');
 html=html.replace('function optFor(id,conf){','const turnLiftSource=JSON.parse(document.getElementById("turn-lift-source").textContent);\nfunction optFor(id,conf){');
 html=html.replace('return M.workingOptions(ac,o);}', 'return UniversalTurnLift.optionsFor(M,ac,turnLiftSource,conf.alt,M.tasFrom(conf.speed,"EAS",conf.alt),M.workingOptions(ac,o));}');
 html=html.replace("M.tasFrom(eas,'EAS',alt),optFor(id,c)", "M.tasFrom(eas,'EAS',alt),optFor(id,{...c,speed:eas})");
 html=html.replace('<span>Assumed CLmax</span>', '<span>Stall / maneuver CLmax</span>');
 html=html.replace('n(r.clMax,2)', 'n(r.clMax,2)+" / "+n(r.limits.maneuverClMax??r.clMax,2)');
 const comparisonPanel=read('src/fighter-comparison-panel.html');
 const comparisonUI=read('src/fighter-comparison-ui.js');
 const comparisonData=JSON.stringify(require('../validation/diagnostics/fighter_comparison.cjs').run());
 if([comparisonUI,comparisonData].some(text=>/<\/script/i.test(text)))throw Error('Unsafe fighter comparison embed');
 const comparisonEmbed='<script type="application/json" id="fighter-comparison-data">'+comparisonData+'</script><script>'+comparisonUI+'</script>';
 const evidencePanel='<section class="panel" id="historical-evidence"><style>#historical-evidence .research-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr));gap:12px;margin:16px 0}#historical-evidence label{display:flex;flex-direction:column;gap:6px}#historical-evidence select,#historical-evidence button{font:inherit;max-width:100%;padding:8px;border-radius:6px}#historical-evidence #historical-ranges{margin:14px 0;overflow-wrap:anywhere}#historical-evidence .research-table{overflow-x:auto}#historical-evidence table{border-collapse:collapse;width:100%;min-width:750px}#historical-evidence td,#historical-evidence th{padding:8px;border-bottom:1px solid #46606d;vertical-align:top;text-align:left;font-size:.9rem}#historical-evidence td small{display:block;color:#92a7b1;font-size:.7rem;margin-top:4px;overflow-wrap:anywhere}</style><h2>Historical research evidence: searchable source data</h2><p>Original reports, aircraft performance measurements and published test figures are available here as versioned, traceable evidence. <strong>IAS is not CAS.</strong> Speed priority: reported CAS; CAS* where a matched source correction can be applied; instrument-corrected IAS* otherwise; then plain IAS or unidentified units. The asterisk marks a provisional source-conditioned candidate, not measured CAS. Test weight and configuration matter; no source row automatically tunes the flight model.</p><p id="historical-summary" aria-live="polite"></p><div class="research-controls"><label>Aircraft and test specimen<select id="historical-aircraft"></select></label><label>Measured or reported quantity<select id="historical-quantity"></select></label><label>Airspeed identification<select id="historical-basis"><option value="all">All (including unknown)</option><option value="CAS">Published CAS</option><option value="CAS*">Corrected CAS* (provisional)</option><option value="IAS corrected*">Instrument-corrected IAS*</option><option value="IAS">All reported IAS</option><option value="EAS">EAS only</option><option value="TAS">TAS only</option><option value="unestablished">Not established</option></select></label></div><p id="historical-ranges"></p><div class="research-table"><table><thead><tr><th>Aircraft</th><th>Evidence type</th><th>Speed/correction status</th><th>Original numbers</th><th>Test state and caveats</th><th>Report and provenance</th></tr></thead><tbody id="historical-rows"></tbody></table></div><p><button id="historical-more" type="button">Show more source rows</button></p><p class="status">Displayed numerical ranges expand automatically with each new source pack. They do not imply the aircraft solver itself has been validated at those extremes. Source links resolve to original scans where available; some reports have only indexed transcripts.</p></section>';
 const calibrationPanel='<section class="panel" id="historical-corrections"><h2>Original airspeed correction tables</h2><p>IAS-to-corrected-speed curves remain visible even when the original calibration does not cover the airplane’s stall speed or configuration. A correction is only applied within source anchors, for explicitly linked source conditions, with provisional CAS* labeling.</p><p id="historical-correction-count"></p><details><summary>Inspect source curves, calibration ranges and blocked transfers</summary><div style="overflow-x:auto"><table style="min-width:760px;width:100%"><thead><tr><th>Airframe</th><th>Correction type</th><th>Supported input range</th><th>Source pairing</th><th>Limitations and assumptions</th><th>Original source</th></tr></thead><tbody id="historical-correction-rows"></tbody></table></div></details></section>';
 const lineagePanel='<section class="panel" id="historical-audit"><h2>Research quality: original charts and source independence</h2><p>Original low-speed calibration charts are reviewed even when their measurement channel cannot yet be matched to stall runs. Document identities and repeated comparison data are tracked explicitly to prevent false independent validations. These audits never change aircraft physics by themselves.</p><p id="historical-audit-count"></p><details><summary>Inspect original near-stall chart reviews</summary><div style="overflow-x:auto"><table style="min-width:760px;width:100%"><thead><tr><th>Original figure</th><th>Evidence quality</th><th>Current conclusion</th><th>Next verification</th><th>Scan or catalog</th></tr></thead><tbody id="historical-review-rows"></tbody></table></div></details><details><summary>Inspect related reports, specimens and duplicate experiments</summary><div style="overflow-x:auto"><table style="min-width:760px;width:100%"><thead><tr><th>Historical group</th><th>Relationship</th><th>Reports and specimens</th><th>Independent test groups</th><th>Caution</th></tr></thead><tbody id="historical-lineage-rows"></tbody></table></div></details></section>';
 // The archived stores panel predates the scan audit and Greg's correction.
 html=html.replace('Higher-altitude independent reported curve NOT used in the drag fit',
  'Higher-altitude comparison within the same aircraft programme; diagnostic only');
 html=html.replace('High-alt model error','High-alt diagnostic difference');
 html=html.replace('RAF A&amp;AEE Mosquito LR495 1943/1944 report transcriptions','RAF A&amp;AEE Mosquito LR495 report index');
 html=html.replace("<strong>We have not recovered the underlying report for Greg's bomb-loaded P-38 curve</strong>, so it is not added as measured performance.",
  'Greg corrected the bomb load to two 1,100-lb bombs excluding racks and said his Mosquito FB Mk VI curve was too fast. The scorecard preserves LR495 B Mk IX as a separate aircraft and records the P-38G loaded curve as unverified.');
 html=html.replace('<main>',()=>'<main>'+evidencePanel+calibrationPanel+lineagePanel+comparisonPanel);
 const maneuverParts=[read('src/maneuver-envelope.js'),read('src/maneuver-envelope-ui.js'),
  JSON.stringify(require('../validation/diagnostics/energy_v41.cjs').buildData())];
 if(maneuverParts.some(text=>/<\/script/i.test(text)))throw Error('Unsafe maneuver envelope embed');
 const maneuverEmbed='<script>'+read('src/energy-configuration.js')+'</script><script>'+maneuverParts[0]+'</script><script type="application/json" id="v4-envelope-data">'+
  maneuverParts[2]+'</script><script>'+maneuverParts[1]+'</script>';
 html=html.replace('<main>',()=>'<main>'+read('src/maneuver-envelope-panel.html'));
 html=html.replace('<a href="#historical-evidence">','<a href="#maneuver-envelope">Seven-aircraft maneuver envelope</a> · <a href="#historical-evidence">');
 html=html.replace('</body>','<script>'+source+'</script><script type="application/json" id="robustness-data">'+audit+'</script><script>'+ui+'</script>'+conditionEmbed+measuredEmbed+stallEmbed+comparisonEmbed+'<script type="application/json" id="historical-research-data">'+researchData+'</script><script>'+researchUI+'</script>'+maneuverEmbed+'</body>');
 const benchmark=require('../validation/diagnostics/operating_benchmark_v46.cjs').browserData();
 const inputs=JSON.parse(read('references/analysis/fighter-sim-inputs-v1.json'));
 const observationIds=new Set(inputs.cases.flatMap(item=>item.candidates.flatMap(row=>row.observation_ids)));
 const observations=Object.fromEntries([...observationIds].map(id=>[id,inputs.observations[id]]));
 const sources=Object.fromEntries([...new Set(Object.values(observations).map(row=>row.source))].map(id=>[id,inputs.sources[id]]));
 const coverage=inputs.coverage.rows.map(({id,gold_count,gold_qualified_count,planned_count})=>({id,gold_count,gold_qualified_count,planned_count}));
 const benchmarkData=JSON.stringify({...benchmark,sourceGrades:{cases:inputs.cases,coverage,observations,sources,tolerances:inputs.tolerances}});
 const turnPerformance=read('src/turn-performance.js');
 const turnComparison=read('src/operating-turn-comparison.js');
 const benchmarkSource=read('src/operating-benchmark.js');
 const graphEvidence=read('src/benchmark-graph-evidence.js');
 const benchmarkChart=read('src/operating-benchmark-chart.js');
 const benchmarkService=read('src/benchmark-service-context.js');
 const benchmarkUI=read('src/operating-benchmark-ui.js');
 if([benchmarkData,turnPerformance,turnComparison,benchmarkSource,graphEvidence,benchmarkChart,benchmarkService,benchmarkUI].some(text=>/<\/script/i.test(text)))throw Error('Unsafe operating benchmark embed');
 html=html.replace('<main>',()=>'<main>'+read('src/operating-benchmark-panel.html'));
 html=html.replace('<a href="#maneuver-envelope">','<a href="#operating-benchmark">Normal / Combat benchmark</a> &middot; <a href="#maneuver-envelope">');
 html=html.replace('#stall-lab, #fighter-comparison, #historical-evidence, #maneuver-envelope','#stall-lab, #fighter-comparison, #historical-evidence, #maneuver-envelope, #operating-benchmark');
 html=html.replace('</body>',()=>'<script>'+turnPerformance+'</script><script>'+benchmarkSource+'</script><script type="application/json" id="benchmark-operating-data">'+benchmarkData+'</script><script>'+graphEvidence+'</script><script>'+benchmarkChart+'</script><script>'+benchmarkService+'</script><script>'+turnComparison+'</script><script>'+benchmarkUI+'</script></body>');
 fs.mkdirSync(path.join(root,'dist'),{recursive:true});
 fs.writeFileSync(path.join(root,'dist/model.html'),html);
 fs.writeFileSync(path.join(root,'dist/research-catalog.json'),researchData+'\n');
 fs.copyFileSync(path.join(root,'references/analysis/fighter-sim-inputs-v1.json'),path.join(root,'dist/fighter-sim-inputs.json'));
 const metadata={version,researchStatus:'v4.7 altitude controls, turn comparison and source agreement',workingCalibration:'2.8.0',climbConditionCalibration:'3.1.0',sourceConfigurationCalibration:'3.4.0',releaseStage:'research-candidate',workingProfile:'P',legacyProfile:'C',template:'releases/baseline-v2.5.html',researchSchema:researchCatalog.schema,researchFingerprint:researchCatalog.fingerprint,researchObservations:researchCatalog.summary.observation_count,researchSources:researchCatalog.summary.source_count,flightEnvelopeSha256:sha256(flightEnvelope),physicsSha256:sha256(engine),casesSha256:sha256(cases),storesSha256:sha256(stores),htmlSha256:sha256(html),bytes:Buffer.byteLength(html),browserInteractionTested:false};
 fs.writeFileSync(path.join(root,'dist/build.json'),JSON.stringify(metadata,null,2)+'\n');
 return metadata;
}
if(require.main===module)console.log(JSON.stringify(build(),null,2));
module.exports={build,sha256};
