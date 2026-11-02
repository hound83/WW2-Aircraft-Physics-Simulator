'use strict';
const fs=require('node:fs'),path=require('node:path'),M=require('../../src/physics.js'),D=require('../../aircraft/cases.json'),F=require('../../src/stall-lab.js'),R=require('../../references/stall-calibration-research-2026-11-02.json');
function run(){
 const source=R.sources.find(s=>s.id==='naca-tn1044'),rows=[];
 for(const altFt of [0,5100,8000,9300,15000,25000,35000])for(const weightLb of [8800,9240,9270,9600])for(const sourceClMax of [1.4,1.45,1.48])rows.push(F.p51Candidate(M,D.aircraft.p51b,source,{altFt,weightLb,sourceClMax}));
 const valid=rows.filter(r=>r.status==='source-informed-candidate');
 const nominal=F.p51Candidate(M,D.aircraft.p51b,source);
 return {version:'3.5.0',method:'Source-informed low-Mach lift transfer; no parameter fitting, withheld historical observations or independent historical accuracy score.',nominal,rows,accepted:valid.length,blocked:rows.length-valid.length,sharedSolverMaxDiscrepancyMph:Math.max(...valid.map(r=>Math.abs(r.air.easMph-r.sharedSolverStallEasMph))),targets:F.targets(M,D,R),conversions:[F.correct(M,R,'to1f51d1',100,8000),F.correct(M,R,'ap2025g-mustangiii',90,8000),F.correct(M,R,'ap2025g-mustangiii',150,8000)],activeDefaultInputsChanged:false,exactTargetStallCalibrationsCompleted:0};
}
function writeReport(){const r=run();fs.writeFileSync(path.join(__dirname,'../current/v35-stall-lab.json'),JSON.stringify(r,null,2)+'\n');const old=require('./stall_research_20261102.cjs').run();fs.mkdirSync(path.join(__dirname,'../research'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../research/stall-2026-11-02.json'),JSON.stringify(old,null,2)+'\n');return r;}
if(require.main===module){const r=writeReport();console.log(JSON.stringify({nominal:r.nominal,accepted:r.accepted,blocked:r.blocked,sharedSolverMaxDiscrepancyMph:r.sharedSolverMaxDiscrepancyMph},null,2));}
module.exports={run,writeReport};
