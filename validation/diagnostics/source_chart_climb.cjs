'use strict';
const fs=require('node:fs'),path=require('node:path'),M=require('../../src/physics.js'),D=require('../../aircraft/cases.json');
const S=require('./p51_climb_states.cjs'),L=require('../../references/p51-climb-state-reconstruction.json');
const root=path.resolve(__dirname,'../..'),ac=D.aircraft.p51b;
const configuration={gearState:'up',flaps:'up',cooling:'automatic',stores:'wing-racks'};
function chart(){
 S.verifySources();
 return {source:L.report+' Figure 7, native-pixel reading brackets',purpose:'climb',powerKind:'chart-assigned-standard-bhp',
  identity:{...ac.stallIdentity},configuration:{...configuration},
  nodes:S.readPoints().filter(p=>p.kind==='power').map(p=>({id:p.id,altFt:p.altFt,rating:p.rating,gear:p.gear,engineRpm:p.engineRpm,
   lowerBhp:p.bounds[0],upperBhp:p.bounds[1],sourceLocation:'Figure 7 p.13; '+p.box.join(',')+' native pixels; SHA256 '+L.scans.fig7.sha256}))};
}
function polar(profile){
 const p=M.cd0FromAnchor(ac,profile,.78);
 return {cd0:p.cd0,e:.78,source:'Original sea-level speed anchor; profile '+profile+'; not a climb fit'};
}
function options(profile='C',selection='midpoint'){
 return {chart:chart(),configuration:{...configuration},profile,polar:polar(profile),selection,
  rating:'75inHg',gear:'low',weight:{valueLb:9335,kind:'scenario',source:'Reported takeoff weight used only as an explicit scenario; instantaneous climb weight unknown'}};
}
function run(){
 const source=chart(),rows=[];
 for(const node of source.nodes)for(const profile of ['C','N']){
  const opts={...options(profile),chart:source,rating:node.rating,gear:node.gear};
  const samples=['lower','midpoint','upper'].map(selection=>M.sourceChartClimb(ac,node.altFt,{...opts,selection}));
  const proxy=M.bestClimb(ac,node.altFt,{profile,polar:opts.polar,rating:node.rating,gear:node.gear,weightLb:9335,engineModel:'ram-critical'});
  const observedFpm=node.altFt===2200?(node.rating==='67inHg'?3820:4380):null;
  rows.push({altFt:node.altFt,rating:node.rating,profile,polarPolicy:profile==='C'?'original C anchor':'candidate N reanchor',
   powerBhp:[node.lowerBhp,node.upperBhp],proxy:{status:proxy.status,shaftHp:proxy.shaftHp??null,climbFpm:proxy.climbFpm??null},
   samples:samples.map(s=>({selection:s.sourceChart?.selection,status:s.status,shaftHp:s.shaftHp??null,tasMph:s.tasMph??null,climbFpm:s.climbFpm??null,sourceChart:s.sourceChart})),
   reportedFpm:observedFpm,midpointResidualFpm:observedFpm===null?null:samples[1].climbFpm-observedFpm,
   midpointDeltaFromProxyFpm:proxy.climbFpm==null?null:samples[1].climbFpm-proxy.climbFpm,
   comparisonRole:'Conditional diagnostic; no historical validation score, unknown actual climb TAS/mass.'});
 }
 const a=ac.calibration;
 return {schema:1,version:require('../../package.json').version,rows,unsupportedRequests:[
  {label:'intermediate altitude 6000 ft, 75-inHg',result:M.sourceChartClimb(ac,6000,options())},
  {label:'high blower at 8000 ft',result:M.sourceChartClimb(ac,8000,{...options(),gear:'high'})}],
  levelSpeedDefaultMph:M.maxSpeed(ac,a.altFt,{rating:a.rating,gear:a.gear,profile:'C'}),
  defaultNumericalChange:false,conclusion:'Source-chart mode improves traceable power-input coverage, not demonstrated historical accuracy. It bypasses no source-domain gap and does not modify the default model.'};
}
function writeReport(){
 const r=run(),f=x=>Number.isFinite(x)?x.toFixed(1):'unavailable';
 fs.writeFileSync(path.join(root,'validation/current/source-chart-climb.json'),JSON.stringify(r,null,2)+'\n');
 const lines=['# Explicit source-chart climb-power mode','',
 'The shared API now exposes sourceChartClimb(aircraft, altitudeFt, options). Run npm run diagnose:source-chart to regenerate this report. It requires a matching specimen/configuration/rating/gear/RPM, an exact chart node, a named bracket selection, an explicit polar and a documented scenario weight. It rejects ambiguous nodes, conflicting power methods and invented interpolation.','',
 '## Before and after: C profile, 9,335 lb scenario','',
 '| Rating | Altitude ft | Source BHP bracket | Prior proxy ft/min | Chart lower / midpoint / upper ft/min | Midpoint change ft/min |','|---|---:|---:|---:|---:|---:|'];
 for(const row of r.rows.filter(x=>x.profile==='C'))lines.push('| '+row.rating+' | '+row.altFt+' | '+row.powerBhp.join('-')+' | '+f(row.proxy.climbFpm)+' | '+row.samples.map(s=>f(s.climbFpm)).join(' / ')+' | '+f(row.midpointDeltaFromProxyFpm)+' |');
 lines.push('','At 8,000 and 12,000 ft the old ram/level engine proxy has no source-bounded prediction; readable climb-chart nodes now permit explicitly conditional calculations at those exact altitudes. At 4,000 ft the lower chart power decreases the predicted climb. This is a source-input change, not proof of closer historical performance; no matching rate/airspeed/mass observation was established at those heights.','',
 '## Known 2,200-ft rate checkpoints','',
 '| Rating | Reported ft/min | C chart midpoint ft/min | Diagnostic residual ft/min |','|---|---:|---:|---:|');
 for(const row of r.rows.filter(x=>x.profile==='C'&&x.reportedFpm!==null))lines.push('| '+row.rating+' | '+row.reportedFpm+' | '+f(row.samples[1].climbFpm)+' | '+f(row.midpointResidualFpm)+' |');
 lines.push('','The new input mode does not resolve the Mustang climb shortfall. All raw C and separately reanchored N endpoints, source reading boxes, selected BHP and sampled TAS are in [JSON](../validation/current/source-chart-climb.json). N remains an unmatched generic transfer, not a validated replacement.','',
 '## Scientific and input limits','',
 'BHP is assigned from the report engine chart, not flight torque. A bracket midpoint is a reading choice, not a measured central estimate. Assigned BHP is held fixed while the solver samples 100-290 mph TAS at 1 mph; historical climb TAS remains unknown. The 9,335-lb takeoff number is explicitly a scenario, not reconstructed instantaneous mass. Reading intervals are not historical uncertainty bounds. No interpolation or extension into high blower is enabled. The API checks provenance metadata; the report additionally verifies retained scan bytes through their SHA256 hashes.','',
 'Level-flight maxSpeed continues to use its original inputs; chart power is only supplied through the separate climb entry point. No default model coefficient or default aircraft input is changed. No UI redesign or Atlas modification. See [progress assessment](PROGRESS_ASSESSMENT.md), [current validation](CURRENT_VALIDATION.md) and [release notes](../releases/v2.7.0.md).','');
 fs.writeFileSync(path.join(root,'docs/SOURCE_CHART_CLIMB_MODE.md'),lines.join('\n'));return r;
}
if(require.main===module){writeReport();console.log('Source-chart mode: 5 exact nodes, C/N diagnostics; no default change.');}
module.exports={chart,polar,options,run,writeReport};
