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
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},45000);pending.set(id,{resolve:x=>{clearTimeout(timer);resolve(x);},reject:e=>{clearTimeout(timer);reject(e);}});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  console.log('Smoke: CDP connected');
  version=await send('Browser.getVersion');record.browser=version.product;
  await send('Runtime.enable');await send('Page.enable');await send('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/model.html'});
  await until(()=>evaluate('!!window.UniversalReleaseSupport'),'release support startup');
  const change=async(id,value)=>{console.log('Smoke control: '+id+'='+value);return await evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));return e.value;})()`);};
  const state=()=>evaluate('({profile:document.getElementById("profile").value,rows:UniversalReleaseSupport.rows,pairs:UniversalReleaseSupport.pairwise,range:UniversalReleaseSupport.currentRange,selected:UniversalReleaseSupport.selectedRange,version:UniversalFourAircraftUI.version,errorsVisible:document.getElementById("errors").style.display!=="none"})');
  let s=await state();assert.equal(s.profile,'P');assert.equal(s.version,record.version);assert.equal(s.rows.length,4);assert.equal(s.errorsVisible,false);checks.push('P default, current UI version, four live rows, no render error');
  const row=s.rows.find(r=>r.id==='p51b');const direct=await evaluate('(()=>{const u=UniversalFourAircraftUI,c=u.conditions(),a=u.data.aircraft.p51b;return u.model.evaluated(a,c.alt,u.model.tasFrom(c.speed,"EAS",c.alt),u.optionsFor("p51b",c)).power.climbFpm;})()');assert.ok(Math.abs(row.climbFpm-direct)<1e-9);checks.push('Coverage uses exact card engine/options');
  assert.ok(s.pairs.filter(p=>p.a==='bf109f4'||p.b==='bf109f4').every(p=>p.deltaClimbFpm===null));checks.push('Simulator Bf109 excluded from historical-style pairwise output');
  await change('alt','0');s=await state();assert.equal(s.rows.find(r=>r.id==='p47b').calculationStatus,'unavailable');assert.ok(s.pairs.filter(p=>p.a==='p47b'||p.b==='p47b').every(p=>p.deltaClimbFpm===null));checks.push('P47 sea-level gap returns unavailable/null');
  await change('alt','8000');await change('p51mode','75inHg');s=await state();assert.equal(s.rows.find(r=>r.id==='p51b').calculationStatus,'unavailable');assert.equal(s.range.status,'scenario-range');checks.push('75-inHg engine gap remains distinct from exact 8000-ft chart diagnostic');
  await change('supportNode','2200|67inHg');s=await state();assert.equal(s.selected.samples,9);assert.ok(s.selected.maxClimbFpm>s.selected.minClimbFpm);checks.push('Exact-node selector displays chart scenario range');
  await change('alt','5000');await change('p51mode','67inHg');await change('profile','C');const legacy=await state();await change('profile','P');s=await state();assert.notEqual(s.rows.find(r=>r.id==='p51b').climbFpm,legacy.rows.find(r=>r.id==='p51b').climbFpm);checks.push('P/C control changes live model and coverage together');
  await change('f4scenario','greg');const greg=await evaluate('(()=>{const u=UniversalFourAircraftUI,o=u.optionsFor("bf109f4",u.conditions()),g=u.model.inferredGregF4(u.data.aircraft.bf109f4,u.data.greg.bf109f4);return {actual:o.polar,expected:g};})()');assert.equal(greg.actual.e,greg.expected.oswald);assert.equal(greg.actual.cd0,greg.expected.cd0);checks.push('Greg selection honors named polar under profile P');
  await change('f4scenario','global');s=await state();assert.ok(s.pairs.filter(p=>p.a==='bf109f4'||p.b==='bf109f4').every(p=>p.status==='scenario-comparison'));checks.push('Reference Bf109 enables qualified scenario comparison');
  await change('weight','105');await change('e','0.80');await change('speed','250');s=await state();assert.ok(s.rows.every(r=>Number.isFinite(r.weightLb)));assert.equal(s.errorsVisible,false);checks.push('Weight/e/EAS controls render without exceptions');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await evaluate('document.getElementById("release-support").scrollIntoView()');
  const screenshot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(root,'validation/current/browser-smoke.png'),Buffer.from(screenshot.data,'base64'));
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
