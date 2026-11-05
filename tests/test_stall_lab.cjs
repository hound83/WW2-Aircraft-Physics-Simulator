'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const M=require('../src/physics.js'),D=require('../aircraft/cases.json'),F=require('../src/stall-lab.js'),R=require('../references/stall-calibration-research-2026-11-02.json'),S=R.sources.find(s=>s.id==='naca-tn1044');
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`),original=JSON.stringify(D);
const c=F.p51Candidate(M,D.aircraft.p51b,S);assert.equal(c.status,'source-informed-candidate');near(c.air.easMph,103.3871410243,1e-7);near(c.sharedSolverStallEasMph,c.air.easMph);near(c.clMax*233,1.45*233.2);assert.equal(c.correctedIasMph,null);assert.equal(c.historicalResidualMph,null);
assert.equal(F.p51Candidate(M,D.aircraft.p47b,S).status,'unavailable');
// Independently evaluate SI dynamic pressure and area-normalised lift.
const rho=M.isa(8000).rho,q=.5*rho*(c.air.tasMph*.44704)**2;near(q*D.aircraft.p51b.wingAreaM2*c.clMax,9240*4.4482216153,1e-6);
for(const altFt of [0,5000,10000,20000,35000,NaN,Infinity])assert.equal(F.p51Candidate(M,D.aircraft.p51b,S,{altFt}).status,'unavailable');
for(const weightLb of [-1,0,NaN,Infinity,100,100000])assert.equal(F.p51Candidate(M,D.aircraft.p51b,S,{weightLb}).status,'unavailable');
assert.equal(F.p51Candidate(M,D.aircraft.p51b,S,{sourceClMax:1.6}).status,'unavailable');assert.equal(F.p51Candidate(M,D.aircraft.p51b,{...S,geometry:{areaFt2:235}}).status,'unavailable');
for(const altFt of [5100,8000,9300])for(const weightLb of [8800,9240,9270,9600])for(const sourceClMax of [1.4,1.45,1.48]){const r=F.p51Candidate(M,D.aircraft.p51b,S,{altFt,weightLb,sourceClMax});assert.equal(r.status,'source-informed-candidate');near(r.sharedSolverStallEasMph,r.air.easMph);assert.ok(r.air.mach>=.14&&r.air.mach<=.18);}
// Table example comes from the D manual, not an inferred B stall correction.
for(const altFt of [0,8000,20000,30000]){const r=F.correct(M,R,'to1f51d1',100,altFt);assert.equal(r.status,'manual-cas-conversion');near(r.casMph,105);near(M.casFromTrue(r.tasMph,altFt),105);assert.ok(r.easMph<=r.casMph+1e-5);}
for(const speed of [90,99,401])assert.equal(F.correct(M,R,'to1f51d1',speed,8000).status,'unavailable');
assert.equal(F.correct(M,R,'ap2025g-mustangiii',90,8000).status,'unavailable');assert.equal(F.correct(M,R,'ap1565jpl-1946',90,8000).status,'unavailable');
const boundary=F.correct(M,R,'ap2025g-mustangiii',150,8000);assert.equal(boundary.status,'band-boundary-ambiguous');assert.deepEqual(boundary.positionCorrectedRangeMph,[153,156]);assert.equal(boundary.casMph,null);
const position=F.correct(M,R,'ap2025g-mustangiii',130,8000);assert.equal(position.positionCorrectedMph,136);assert.equal(position.casMph,null);assert.equal(position.easMph,null);
assert.equal(F.correct(M,R,'to1f51d1',100,40000).status,'unavailable');
assert.ok(F.targets(M,D,R).every(r=>r.historicalStallEasMph===null&&r.historicalStallCasMph===null));assert.equal(JSON.stringify(D),original);
// A pure lift comparison stays available when an engine source does not.
for(const altFt of [0,8000,20000,35000]){
 for(const row of F.targets(M,D,R,altFt)){
  const ac=D.aircraft[row.id];
  const lift=.5*M.isa(altFt).rho*(row.model.tasMph*.44704)**2*ac.wingAreaM2*row.assumedClMax;
  near(lift,ac.weightLb*4.4482216153,1e-6);
  const working=M.evaluated(ac,altFt,row.model.tasMph,{profile:'P'});
  if(Number.isFinite(working.stallEasMph))near(row.model.easMph,working.stallEasMph);
  near(M.trueFromCAS(row.model.casMph,altFt),row.model.tasMph,1e-6);
 }
}
const [stock]=F.targets(M,D,R);
const [lighter]=F.targets(M,D,R,8000,{p51b:stock.weightLb*.81});
near(lighter.model.easMph,stock.model.easMph*.9);
assert.equal(F.targets(M,D,R,8000,{p51b:NaN})[0].model,null);
assert.ok(F.targets(M,D,R,8000,{p51b:NaN}).slice(1).every(r=>r.model));
for(const altitude of [NaN,-1,35001])assert.ok(F.targets(M,D,R,altitude).every(r=>r.model===null));
const manifest=require('../references/sources/stall-2026-11-02/manifest.json');for(const s of manifest.excerpts){const bytes=fs.readFileSync(path.join(__dirname,'..',s.excerptFile));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),s.excerptSha256,s.sourceId);}
const diagnostics=require('../validation/diagnostics/stall_research_20261102.cjs').run();assert.ok(diagnostics.conversionExample.every(r=>Number.isFinite(r.easMph)));
console.log('PASS source-area lift balance, 36 conditional mass/altitude/lift cases, no extrapolation, correction boundaries, IAS separation, source hashes and unchanged inputs');
