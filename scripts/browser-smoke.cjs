'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'validation/current/browser-smoke.json');
const candidates=[process.env.BROWSER_PATH,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
const executable=candidates.find(p=>fs.existsSync(p)),checks=[],errors=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=25000){const start=Date.now();while(Date.now()-start<ms){const x=await fn();if(x)return x;await delay(100);}throw Error('Timeout: '+label);}
async function run(){
 let browser,server,socket,dir,version;const record={status:'failed',version:require('../package.json').version,browser:null,checks,errors,scope:'Headless Chromium interactive smoke; not cross-browser or historical validation'};
 try{
  if(!executable)throw Error('No headless Chrome/Edge executable; set BROWSER_PATH');
  console.log('Smoke: opening isolated loopback test server');
  const html=fs.readFileSync(path.join(root,'dist/model.html'));record.htmlSha256=require('node:crypto').createHash('sha256').update(html).digest('hex');
  server=http.createServer((req,res)=>{if(req.url!=='/model.html'){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));dir=fs.mkdtempSync(path.join(os.tmpdir(),'eaw-browser-'));
  console.log('Smoke: launching headless browser');
  browser=spawn(executable,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+dir,'about:blank'],{windowsHide:true,stdio:'ignore'});
  browser.on('error',e=>errors.push(e.message));
  const port=await until(()=>{try{return Number(fs.readFileSync(path.join(dir,'DevToolsActivePort'),'utf8').split(/\r?\n/)[0]);}catch{return null;}},'browser debug port');
  const tabs=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json(),target=tabs.find(t=>t.type==='page');
  socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});let serial=0;const pending=new Map();
  socket.onmessage=evt=>{const m=JSON.parse(evt.data);if(m.method==='Runtime.exceptionThrown')errors.push(JSON.stringify(m.params.exceptionDetails));if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}};
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},90000);pending.set(id,{resolve:x=>{clearTimeout(timer);resolve(x);},reject:e=>{clearTimeout(timer);reject(e);}});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  console.log('Smoke: CDP connected');
  version=await send('Browser.getVersion');record.browser=version.product;
  await send('Runtime.enable');await send('Page.enable');await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/model.html'});
  await until(()=>evaluate('!!window.UniversalReleaseSupport'),'release support startup');
  const change=async(id,value)=>{console.log('Smoke control: '+id+'='+value);return await evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));return e.value;})()`);};
  const state=()=>evaluate('({profile:document.getElementById("profile").value,rows:UniversalReleaseSupport.rows,pairs:UniversalReleaseSupport.pairwise,range:UniversalReleaseSupport.currentRange,selected:UniversalReleaseSupport.selectedRange,version:UniversalFourAircraftUI.version,errorsVisible:document.getElementById("errors").style.display!=="none"})');
  let s=await state();assert.equal(s.profile,'P');assert.equal(s.version,record.version);assert.equal(s.rows.length,4);assert.equal(s.errorsVisible,false);checks.push('P default, current UI version, four live rows, no render error');
  const climb=await evaluate('({rows:UniversalConditionedClimbUI.rows.map(x=>({id:x.state.id,pred:x.result.predictedFpm,observed:x.state.observedFpm})),model:UniversalConditionedClimbUI.model})');assert.equal(climb.rows.length,21);assert.equal(climb.model.chargeExponent,.75);const published=require('../validation/current/v31-climb-improvement.json');for(const r of climb.rows){const expected=published.selected.rows.find(x=>x.stateId===r.id);assert.ok(Math.abs(r.pred-expected.predictedFpm)<1e-6);}checks.push('21 source-climb states reproduce active v3.1 model');
  const provenance=await evaluate('({labels:document.getElementById("v31-climb").textContent,rows:UniversalConditionedClimbUI.rows.filter(x=>x.state.aircraftId==="p47b").map(x=>x.result.validationEligibility)})');assert.ok(provenance.labels.includes('41-5931'));assert.ok(provenance.labels.includes('cross-specimen'));assert.equal(provenance.rows.length,5);assert.ok(provenance.rows.every(x=>x==='cross-specimen engineering only'));checks.push('P47 source specimen and cross-specimen qualification are visible and computed');
  const measured=await evaluate('({rows:UniversalMeasuredClimbUI.rows,mode:UniversalMeasuredClimbUI.mode,text:document.getElementById("measured-climb").textContent})');
  assert.equal(measured.rows.length,10);assert.equal(measured.mode,'calibrated');assert.equal(measured.rows.at(-1).propRpm,1275);assert.equal(measured.rows.at(-1).shaftHp,1365);assert.ok(measured.rows.at(-1).errorFpm<0&&measured.rows.at(-1).errorFpm>-200);assert.ok(measured.text.includes('41-5902'));const configurationReport=require('../validation/current/v34-configuration.json');for(const row of measured.rows)assert.ok(Math.abs(row.predictedFpm-configurationReport.selected.rows.find(r=>r.stateId===row.stateId).predictedFpm)<1e-6);checks.push('Ten calibrated source states reproduce accepted model with correct BHP/RPM and retained residual');
  const select=async(id,value)=>evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  const comparisonReport=require('../validation/current/fighter-comparison.json');
  const embeddedComparison=await evaluate('JSON.parse(document.getElementById("fighter-comparison-data").textContent)');
  assert.deepEqual(embeddedComparison,comparisonReport);
  const fwTable=()=>evaluate('document.getElementById("comparison-fw-flight").textContent');
  assert.ok((await fwTable()).includes('Fw 190 A-4'));
  await select('comparison-fw-altitude','6000');
  assert.ok((await fwTable()).includes('633.2'));
  await select('comparison-fw-eas','225');
  assert.ok((await fwTable()).includes('225 mph EAS'));
  assert.ok((await fwTable()).includes('633.2'));
  assert.equal(await evaluate('document.querySelectorAll("#comparison-fw-speed tbody tr").length'),10);
  await select('comparison-fw-eas','175');
  await select('comparison-fw-altitude','0');
  checks.push('Fw 190 is selectable by altitude and EAS with reserved evidence and separate level speed');
  const band=await evaluate(`(()=>({
    summary:document.getElementById("comparison-climb-summary").textContent,
    metrics:document.getElementById("comparison-climb-band").textContent,
    rates:document.querySelectorAll("#comparison-climb-rates tbody tr").length,
    alternatives:document.querySelectorAll("#comparison-climb-alternates tbody tr").length,
    sources:document.querySelectorAll("#comparison-climb-sources a").length
  }))()`);
  assert.ok(band.summary.includes('3:39')&&band.summary.includes('7:21'));
  assert.ok(band.metrics.includes('+1,995 ft/min')&&band.metrics.includes('219.4 s'));
  assert.deepEqual([band.rates,band.alternatives,band.sources],[9,4,4]);
  checks.push('Climb band reports published durations, conditioned replay, alternatives and source links');
  const operationalText=()=>evaluate('document.getElementById("comparison-operational-summary").textContent');
  assert.ok((await operationalText()).includes('193.7 s'));
  await select('comparison-climb-budget','120');
  const switchTable=await evaluate('document.getElementById("comparison-operational-times").textContent');
  assert.ok(switchTable.includes('26,248 ft')&&switchTable.includes('24,394 ft'));
  await select('comparison-climb-budget','300');
  assert.ok((await operationalText()).includes('106.4 s'));
  await select('comparison-climb-budget','0');
  assert.ok((await operationalText()).includes('193.7 s'));
  checks.push('Operational climb budget switches both aircraft at their own altitudes and resets');
  const archival=await evaluate(`(()=>({
    rows:document.querySelectorAll("#comparison-archival tbody tr").length,
    linkedSources:document.querySelectorAll("#comparison-archival tbody a").length,
    details:document.getElementById("comparison-archival").textContent,
    summary:document.getElementById("comparison-archival-summary").textContent,
    exclusions:document.getElementById("comparison-archival-exclusions").textContent
  }))()`);
  assert.equal(archival.rows,28);
  assert.equal(archival.linkedSources,28);
  assert.ok(archival.details.includes("wing racks installed"));
  assert.ok(archival.details.includes("Required propulsive power divided by efficiency at that test state"));
  assert.ok(archival.summary.includes("8 qualified replays")&&archival.summary.includes("5:1 are unresolved"));
  assert.ok(archival.exclusions.includes("2 × 1,100 lb"));
  checks.push('Archival points and original source links render with qualified replays, load correction and unresolved precision');

  assert.equal(await evaluate('document.querySelectorAll("#comparison-fighters tbody tr").length'),4);
  assert.ok((await evaluate('document.getElementById("comparison-mustang").textContent')).includes('+114.7'));
  checks.push('Browser and CLI share the complete four-fighter scorecard and exact Mustang workbook comparison');
  const comparisonRows=()=>evaluate('Array.from(document.querySelectorAll("#comparison-fighters tbody tr"), r=>r.textContent)');
  const initialComparison=await comparisonRows();
  await select('comparison-altitude','15000');
  assert.ok((await comparisonRows())[0].includes('3,243'));
  assert.equal(await evaluate('document.querySelectorAll("#comparison-historical tbody tr").length'),4);
  await select('comparison-altitude','27000');
  assert.ok((await comparisonRows())[2].includes('No source-bounded engine power'));
  assert.ok((await comparisonRows())[2].includes('98.1'));
  await select('comparison-altitude','8000');
  assert.deepEqual(await comparisonRows(),initialComparison);
  checks.push('Three altitude presets redraw the four fighters and preserve the F-4 stall estimate when power is unavailable');
  assert.ok((await evaluate('document.getElementById("comparison-greg-errors").textContent')).includes('0.191'));
  await select('comparison-greg-axis','EAS');
  assert.ok((await evaluate('document.getElementById("comparison-greg-errors").textContent')).includes('0.142'));
  assert.equal(await evaluate('document.querySelectorAll("#comparison-greg tbody tr").length'),7);
  assert.equal(await evaluate('document.querySelectorAll("#comparison-greg-plot path").length'),4);
  assert.equal(await evaluate('/NaN|Infinity/.test(document.getElementById("comparison-greg-plot").innerHTML)'),false);
  await select('comparison-greg-axis','CAS');
  checks.push('Greg chart, seven rows and diagnostic residuals respond to the CAS/EAS interpretation');
  const download=await evaluate(`(async()=>{
    const originalUrl=URL.createObjectURL, originalClick=HTMLAnchorElement.prototype.click;
    let blob, filename;
    URL.createObjectURL=value=>{blob=value;return originalUrl.call(URL,value);};
    HTMLAnchorElement.prototype.click=function(){filename=this.download;};
    try{document.getElementById("comparison-export").click();return {filename,data:JSON.parse(await blob.text())};}
    finally{URL.createObjectURL=originalUrl;HTMLAnchorElement.prototype.click=originalClick;}
  })()`);
  assert.equal(download.filename,'fighter-comparison.json');
  assert.deepEqual(download.data,comparisonReport);
  checks.push('JSON download exports the entire scorecard');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const comparisonMobile=await evaluate(`(()=>{
    const panel=document.getElementById("fighter-comparison"),table=document.getElementById("comparison-fighters");
    return {width:panel.getBoundingClientRect().width,scroll:getComputedStyle(table).overflowX,
      content:table.scrollWidth,available:table.clientWidth};
  })()`);
  assert.ok(comparisonMobile.width<=390);
  assert.equal(comparisonMobile.scroll,'auto');
  assert.ok(comparisonMobile.content>comparisonMobile.available);
  await send('Emulation.clearDeviceMetricsOverride');
  checks.push('Comparison controls fit mobile width and wide data scrolls inside its own region');
  await select('measured-drag','transferred');const previous=await evaluate('UniversalMeasuredClimbUI.rows');const measuredReport=require('../validation/current/v33-measured-climb.json');for(const row of previous)assert.ok(Math.abs(row.predictedFpm-measuredReport.rows.find(r=>r.id===row.stateId).transferred.predictedFpm)<1e-6);assert.ok(previous.at(-1).errorFpm<-400);checks.push('Previous v3.3 control remains reproducible, including its high-altitude failure');
  await select('measured-drag','clean');const measuredClean=await evaluate('UniversalMeasuredClimbUI.rows');assert.ok(measuredClean.at(-1).predictedFpm>measured.rows.at(-1).predictedFpm);assert.equal(await evaluate('UniversalMeasuredClimbUI.mode'),'clean');await select('measured-drag','calibrated');checks.push('Three model choices recalculate the live report');
  for(const sample of configurationReport.scenarios){await select('measured-weight',String(sample.weightLb));await select('measured-prop',String(sample.retainedPowerScale));const actual=await evaluate('({mae:UniversalMeasuredClimbUI.checkMae,bhp:UniversalMeasuredClimbUI.rows.at(-1).shaftHp})');assert.ok(Math.abs(actual.mae-sample.selected.check.mae)<1e-6);assert.equal(actual.bhp,1365);}checks.push('All nine mass/retained-power browser scenarios match shared-solver validation and preserve shaft BHP');
  await evaluate('document.getElementById("measured-reset").click()');assert.equal(await evaluate('UniversalMeasuredClimbUI.scenario.weightLb'),12565);assert.equal(await evaluate('UniversalMeasuredClimbUI.scenario.retainedPowerScale'),1);assert.equal(await evaluate('UniversalMeasuredClimbUI.mode'),'calibrated');checks.push('Reset restores the accepted nominal comparison');
  const plot=await evaluate('({paths:document.querySelectorAll("#measured-chart path").length,fit:document.querySelectorAll("#measured-chart circle").length,checks:document.querySelectorAll("#measured-chart rect").length,invalid:/NaN|Infinity/.test(document.getElementById("measured-chart").innerHTML)})');assert.equal(plot.paths,3);assert.equal(plot.fit,5);assert.equal(plot.checks,5);assert.equal(plot.invalid,false);checks.push('Report/before/selected curves and five fit/five check markers render with finite coordinates');
  const row=s.rows.find(r=>r.id==='p51b');const direct=await evaluate('(()=>{const u=UniversalFourAircraftUI,c=u.conditions(),a=u.data.aircraft.p51b;return u.model.evaluated(a,c.alt,u.model.tasFrom(c.speed,"EAS",c.alt),u.optionsFor("p51b",c)).power.climbFpm;})()');assert.ok(Math.abs(row.climbFpm-direct)<1e-9);checks.push('Coverage uses exact card engine/options');
  assert.ok(s.pairs.filter(p=>p.a==='bf109f4'||p.b==='bf109f4').every(p=>p.deltaClimbFpm===null));checks.push('Simulator Bf109 excluded from historical-style pairwise output');
  await change('alt','0');s=await state();
  assert.equal(s.rows.find(r=>r.id==='p47b').calculationStatus,'within-input-domain');
  checks.push('P-47B military power now covers sea level in the working profile');
  await change('p47rating','normal');await change('flightCooling','open');await change('alt','35000');
  const high=await evaluate('(()=>{const u=UniversalFourAircraftUI,c=u.conditions(),r=u.model.evaluated(u.data.aircraft.p47b,c.alt,305,u.optionsFor("p47b",c));return {rpm:r.prop.propRpm,hp:r.engine.bhp,climb:r.power.climbFpm};})()');
  assert.equal(high.rpm,1275);assert.equal(high.hp,1365);assert.ok(Math.abs(high.climb-366.4167552209)<1e-6);
  assert.equal((await state()).errorsVisible,false);
  checks.push('P-47B normal-power cooling controls reproduce the 35,000-ft source state through the live solver');
  await change('p47rating','military');await change('flightCooling','reference');
  const speed=await evaluate('(()=>{const u=UniversalFourAircraftUI,o=u.optionsFor("p51b",u.conditions());return u.model.maxSpeed(u.data.aircraft.p51b,32000,{...o,gear:"high"});})()');
  assert.ok(Math.abs(speed-410)<2);
  checks.push('The active working profile applies the fast-flight installation fit');
  await change('alt','8000');await change('p51mode','75inHg');s=await state();assert.equal(s.rows.find(r=>r.id==='p51b').calculationStatus,'unavailable');assert.equal(s.range.status,'scenario-range');checks.push('75-inHg engine gap remains distinct from exact 8000-ft chart diagnostic');
  await change('supportNode','2200|67inHg');s=await state();assert.equal(s.selected.samples,9);assert.ok(s.selected.maxClimbFpm>s.selected.minClimbFpm);checks.push('Exact-node selector displays chart scenario range');
  await change('alt','5000');await change('p51mode','67inHg');await change('profile','C');const legacy=await state();await change('profile','P');s=await state();assert.notEqual(s.rows.find(r=>r.id==='p51b').climbFpm,legacy.rows.find(r=>r.id==='p51b').climbFpm);checks.push('P/C control changes live model and coverage together');
  await change('f4scenario','greg');const greg=await evaluate('(()=>{const u=UniversalFourAircraftUI,o=u.optionsFor("bf109f4",u.conditions()),g=u.model.inferredGregF4(u.data.aircraft.bf109f4,u.data.greg.bf109f4);return {actual:o.polar,expected:g};})()');assert.equal(greg.actual.e,greg.expected.oswald);assert.equal(greg.actual.cd0,greg.expected.cd0);checks.push('Greg selection honors named polar under profile P');
  await change('f4scenario','global');s=await state();assert.ok(s.pairs.filter(p=>p.a==='bf109f4'||p.b==='bf109f4').every(p=>p.status==='scenario-comparison'));checks.push('Reference Bf109 enables qualified scenario comparison');
  await change('f4scenario','db601e');await change('bfmode','combat');await change('alt','23000');s=await state();
  const transferred=s.rows.find(r=>r.id==='bf109f4');
  assert.equal(transferred.calculationStatus,'within-input-domain');
  assert.equal(transferred.scenarioKind,'source-transfer');
  assert.ok(transferred.evidenceStatus.includes('G-1'));
  assert.ok(s.pairs.filter(p=>p.a==='bf109f4'||p.b==='bf109f4').every(p=>p.status==='not-comparable'));
  await change('bfmode','emergency');s=await state();
  assert.equal(s.rows.find(r=>r.id==='bf109f4').calculationStatus,'unavailable');
  assert.equal(s.errorsVisible,false);
  await change('bfmode','combat');await change('alt','5000');await change('profile','C');
  assert.equal((await state()).rows.find(r=>r.id==='bf109f4').calculationStatus,'unavailable');
  await change('profile','P');
  await change('f4scenario','global');await change('bfmode','combat');await change('alt','5000');
  checks.push('The archival DB 601 E option exposes combat-only power and retains its transfer qualification');
  await change('weight','105');await change('e','0.80');await change('speed','250');s=await state();assert.ok(s.rows.every(r=>Number.isFinite(r.weightLb)));assert.equal(s.errorsVisible,false);checks.push('Weight/e/EAS controls render without exceptions');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await evaluate('document.documentElement.style.scrollBehavior="auto";document.getElementById("release-support").scrollIntoView({behavior:"instant",block:"start"})');
  const fixed=await evaluate('UniversalConditionedClimbUI.rows.map(x=>x.result.predictedFpm)');assert.deepEqual(fixed,climb.rows.map(x=>x.pred));checks.push('Source-climb report states remain fixed when exploratory controls change');
  const measuredFixed=await evaluate('UniversalMeasuredClimbUI.rows.map(x=>x.predictedFpm)');assert.deepEqual(measuredFixed,measured.rows.map(x=>x.predictedFpm));checks.push('Measured-power report states remain independent of exploratory controls');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const mobile=await evaluate('(()=>{const p=document.getElementById("measured-climb"),r=p.getBoundingClientRect();return {width:r.width,controls:[...p.querySelectorAll("select")].every(x=>x.getBoundingClientRect().width<=r.width),tableOverflow:document.getElementById("measured-table").style.overflowX};})()');assert.ok(mobile.width<=390);assert.equal(mobile.controls,true);assert.equal(mobile.tableOverflow,'auto');checks.push('Climb laboratory controls fit mobile width and the detailed table scrolls locally');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});await evaluate('document.getElementById("measured-climb").scrollIntoView({behavior:"instant",block:"start"})');
  const screenshot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(root,'validation/current/browser-smoke.png'),Buffer.from(screenshot.data,'base64'));
  const stall=()=>evaluate('({candidate:UniversalStallLabUI.candidate,correction:UniversalStallLabUI.correction,targets:UniversalStallLabUI.targets,chart:document.getElementById("stall-chart").innerHTML})');
  let t=await stall();assert.equal(t.candidate.status,'source-informed-candidate');assert.ok(Math.abs(t.candidate.air.easMph-103.3871410243)<1e-7);assert.equal(t.targets.length,4);assert.ok(t.targets.every(x=>x.historicalStallEasMph===null));assert.equal(t.correction.status,'unavailable');checks.push('Stall laboratory shows four unresolved targets, nominal source-lift candidate and blocked 90-IAS extrapolation');
  const initialTargets=t.targets;
  const initialMustang=initialTargets.find(r=>r.id==='p51b');
  assert.equal(initialMustang.liftBasis,'source-informed-transfer');
  assert.deepEqual(initialMustang.model,t.candidate.air);
  assert.ok(initialMustang.model.easMph>initialMustang.baseline.easMph+4);
  assert.ok(initialTargets.filter(r=>r.id!=='p51b').every(r=>r.liftBasis==='provisional-lift'));
  checks.push('Clean stall table applies the bounded Mustang lift and labels the three provisional models');
  await change('stall-weight-p47b','10178');t=await stall();
  assert.equal(t.targets.find(x=>x.id==='p47b').weightLb,10178);
  assert.ok(t.targets.find(x=>x.id==='p47b').model.easMph<initialTargets.find(x=>x.id==='p47b').model.easMph);
  assert.deepEqual(t.targets.filter(x=>x.id!=='p47b'),initialTargets.filter(x=>x.id!=='p47b'));
  await change('stall-alt','');t=await stall();assert.ok(t.targets.every(x=>x.model===null));
  await evaluate('document.getElementById("stall-reset").click()');t=await stall();assert.deepEqual(t.targets,initialTargets);
  checks.push('Separate loaded weights, empty altitude handling and four-fighter reset');
  await change('stall-alt','20000');t=await stall();assert.equal(t.candidate.status,'unavailable');assert.equal(t.candidate.air,null);assert.ok((await evaluate('document.getElementById("stall-metrics").textContent')).includes('No candidate'));checks.push('Candidate altitude extension is blocked and stale numerical values are removed');
  assert.ok(t.targets.every((row,i)=>row.liftBasis==='provisional-lift'&&row.model.easMph===initialTargets[i].baseline.easMph&&row.model.tasMph>initialTargets[i].baseline.tasMph));
  checks.push('Outside the Mustang transfer window, the table falls back to provisional lift and converts to TAS at altitude');
  await change('stall-alt','8000');await change('stall-weight','9270');await change('stall-cl','1.40');t=await stall();assert.ok(t.candidate.air.easMph>105);assert.ok(Math.abs(t.candidate.clMax*233-1.4*233.2)<1e-8);checks.push('Mass/lift controls recalculate shared-solver candidate with source-area normalization');
  await select('stall-correction','to1f51d1');await change('stall-ias','100');t=await stall();assert.equal(t.correction.casMph,105);assert.ok(Number.isFinite(t.correction.easMph));await change('stall-ias','90');assert.equal((await stall()).correction.status,'unavailable');checks.push('D-manual 100 IAS becomes 105 CAS and rejects correction below table');
  await select('stall-correction','ap2025g-mustangiii');await change('stall-ias','150');assert.equal((await stall()).correction.status,'band-boundary-ambiguous');await change('stall-ias','130');t=await stall();assert.equal(t.correction.positionCorrectedMph,136);assert.equal(t.correction.casMph,null);checks.push('Band boundaries remain ambiguous and position-only correction is not promoted to CAS');
  await evaluate('document.getElementById("stall-reset").click()');t=await stall();assert.ok(Math.abs(t.candidate.air.easMph-103.3871410243)<1e-7);assert.equal(/NaN|Infinity/.test(t.chart),false);assert.equal(await evaluate('document.querySelectorAll("#stall-chart path").length'),4);checks.push('Stall reset and finite EAS/CAS bracket plot render');
  assert.deepEqual(await evaluate('UniversalMeasuredClimbUI.rows.map(x=>x.predictedFpm)'),measuredFixed);checks.push('Stall research controls preserve accepted climb predictions');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});const stallMobile=await evaluate('(()=>{const p=document.getElementById("stall-lab"),w=p.getBoundingClientRect().width;return {w,controls:[...p.querySelectorAll("input,select,button")].every(e=>e.getBoundingClientRect().width<=w),scroll:getComputedStyle(document.getElementById("stall-targets")).overflowX};})()');assert.ok(stallMobile.w<=390);assert.equal(stallMobile.controls,true);assert.equal(stallMobile.scroll,'auto');checks.push('Stall controls fit mobile width with locally scrolling evidence table');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});await evaluate('document.getElementById("stall-lab").scrollIntoView({behavior:"instant",block:"start"})');const stallImage=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(root,'validation/current/stall-lab-browser.png'),Buffer.from(stallImage.data,'base64'));
  assert.equal(errors.length,0,'Browser JavaScript exceptions');record.status='passed';
  for(const file of ['dist/build.json','validation/current/build.json']){const p=path.join(root,file),info=JSON.parse(fs.readFileSync(p,'utf8'));assert.equal(info.htmlSha256,record.htmlSha256);info.browserInteractionTested=true;fs.writeFileSync(p,JSON.stringify(info,null,2)+'\n');}
  const doc=path.join(root,'docs/CURRENT_VALIDATION.md');fs.writeFileSync(doc,fs.readFileSync(doc,'utf8').replace('| Interactive browser tests | See browser-smoke.json; run separately on the current build |','| Interactive browser tests | Passed '+checks.length+' headless checks; see browser-smoke.json |'));
 }catch(e){record.failure=String(e.stack||e);throw e;}finally{
  fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n');if(socket)socket.close();if(browser)browser.kill();if(server)server.close();
  // Only remove this test's own generated temporary profile, after path verification.
  if(dir&&path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(dir).startsWith('eaw-browser-')){await delay(500);try{fs.rmSync(dir,{recursive:true,force:true,maxRetries:3});}catch{}}
 }
 console.log('Browser smoke: '+checks.length+' interactive checks passed ('+version.product+').');
}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
