'use strict';
const fs=require('node:fs'),path=require('node:path'),M=require('../../src/physics.js'),D=require('../../aircraft/cases.json');
const F=require('../../calibration/v2.8-working-model.json'),S=require('./joint_calibration_v28.cjs');
function run(){
 const archived=require('../current/v28-calibration.json');
 const model={profile:'P',params:F.sharedPropeller,fits:Object.entries(F.aircraft).map(([id,f])=>({id,e:f.e,delta:f.openCoolingDeltaCd0,profile:'P',params:F.sharedPropeller}))};
 const current=S.evaluate(model),a=D.aircraft.p51b,sensitivity=[];
 for(const weightLb of [9135,9335,9535]){
  for(const profile of ['C','P']){
   const options={profile,weightLb,engineModel:'ram-critical',minTasMph:120,maxTasMph:260,stepMph:1};
   const rows=['67inHg','75inHg'].map((rating,i)=>{const p=M.bestClimb(a,2200,{...options,rating});return {rating,predicted:p.climbFpm,observed:i?4380:3820,error:p.climbFpm-(i?4380:3820)};});
   sensitivity.push({weightLb,profile,mae:S.average(rows.map(r=>Math.abs(r.error))),rows});
  }
 }
 return {version:F.version,current,sensitivity,baseline:archived.baseline.summary,acceptance:archived.acceptance,
  qualification:F.fitPolicy,limits:['Spitfire effective e is at the search lower bound.','No Bf109 climb observation in this fit.','P47 earlier conditional climb fit is stronger than raw C; reserved error 70.48 versus current 84.69 fpm.','Weight sensitivity is a scenario test, not new historical validation.']};
}
function writeReport(){
 const out=run(),root=path.resolve(__dirname,'../..');
 fs.writeFileSync(path.join(root,'validation/current/v28-working.json'),JSON.stringify(out,null,2)+'\n');
 const fmt=n=>n===null?'—':n.toFixed(1);
 const lines=['# v2.8 working-model results','','The working HTML defaults to profile P. Profile C remains available as the legacy reference. Raw API calls retain C for compatibility; use {profile: "P"} or workingOptions for v2.8.','','| Aircraft | C speed MAE mph | P speed MAE mph | C climb MAE ft/min | P climb MAE ft/min |','|---|---:|---:|---:|---:|'];
 for(const s of out.current.summary){const b=out.baseline.find(x=>x.id===s.id);lines.push('| '+s.id+' | '+fmt(b.speedMae)+' | '+fmt(s.speedMae)+' | '+fmt(b.climbMae)+' | '+fmt(s.climbMae)+' |');}
 lines.push('','P47 comparison above is against raw C. The existing v2.7 conditional configuration fit already achieved about 44.8 ft/min all-point MAE; its reserved-point MAE is 70.5, versus 84.7 for P. The new joint model improves P47 speed but does not beat that earlier climb-only fit.','','Mustang: 67-inHg report 3820, P prediction 3807.8 ft/min; 75-inHg report 4380, P prediction 4386.4 ft/min. The former participated in parameter fitting. The latter was excluded from parameter fitting, but seen during development and acceptance. The two-point 97.7% error reduction is conditional agreement, not independent accuracy.','','## Weight sensitivity','','Same power model and weights for C and P; source report rates remain fixed.','','| Weight lb | C MAE ft/min | P MAE ft/min |','|---|---:|---:|');
 for(const w of [9135,9335,9535])lines.push('| '+w+' | '+fmt(out.sensitivity.find(x=>x.weightLb===w&&x.profile==='C').mae)+' | '+fmt(out.sensitivity.find(x=>x.weightLb===w&&x.profile==='P').mae)+' |');
 lines.push('','## Limits and reproduction','',F.fitPolicy,'',F.configurationPolicy,'','Spitfire e=0.60 is a grid-boundary effective drag fit, not measured wing efficiency. Turn and stall accuracy have not been established. Bf109 climb is unavailable rather than zero error. No new independent historical data or 5:1 accuracy proof.','','Run npm run check and npm run diagnose:joint-calibration. The latter repeats the bounded search, including the drag-only control and top-seven candidates. The archived fit and acceptance thresholds are in calibration/v2.8-working-model.json. The 3628-value frozen C comparison tests legacy compatibility, separately from P improvements.','','Interactive browser operation was not exercised in this environment; generated inline JavaScript syntax and active engine/data parity are tested.');
 fs.writeFileSync(path.join(root,'docs/V28_RESULTS.md'),lines.join('\n')+'\n');
 console.log('V28_WORKING '+JSON.stringify({summary:out.current.summary,sensitivity:out.sensitivity}));
 return out;
}
if(require.main===module)writeReport();
module.exports={run,writeReport};
