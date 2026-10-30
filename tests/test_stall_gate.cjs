'use strict';
const assert=require('node:assert/strict'),m=require('../src/physics.js'),d=require('../aircraft/cases.json'),data=require('../references/stall-calibration.json');
const ac=d.aircraft.p51b,raw=data.records.find(r=>r.id==='p51-closed'),copy=x=>structuredClone(x),near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
for(const r of data.records){const a=d.aircraft[r.aircraftId]||d.aircraft.p47b,out=m.resolveStallEvidence(a,r,r.id==='p47-manual'?data.calibrations.p47Manual:null);assert.equal(out.status,'unresolved',r.id);assert.equal(out.clMax,null);assert.equal(out.correctedEasMph,null);}
assert.equal(m.casFromIAS(115,data.calibrations.p47Manual),null,'manual correction must not extrapolate to stall');
assert.equal(m.casFromIAS(170,data.calibrations.p47Manual),175);
assert.equal(m.casFromIAS(185,data.calibrations.p47Manual),190.75);
assert.throws(()=>m.casFromIAS(170,{...data.calibrations.p47Manual,points:[{iasMph:170,casMph:175},{iasMph:Infinity,casMph:Infinity}]}));
// Synthetic fixtures test gate arithmetic only. They are NOT aircraft evidence.
const record={...copy(raw),source:{kind:'primary',scanVerified:true,reference:'SYNTHETIC TEST ONLY'}};
const cal={...ac.stallIdentity,source:'SYNTHETIC TEST ONLY',configuration:'synthetic',configurationId:record.configurationId,scanVerified:true,nearStallVerified:true,instrumentCorrectionIncluded:true,altitudeRangeFt:[7900,8100],points:[{iasMph:80,casMph:85},{iasMph:90,casMph:95}]};
const resolved=m.resolveStallEvidence(ac,record,cal);assert.equal(resolved.status,'derived-power-off');near(resolved.correctedCasMph,91);assert.ok(resolved.correctedEasMph<91,'compressibility CAS -> EAS at 8000 ft');
near(resolved.clMax,2*9270*4.4482216153/(1.225*ac.wingAreaM2*(resolved.correctedEasMph*.44704)**2));assert.equal(resolved.uncertainty,null,'no invented uncertainty');assert.match(resolved.turnTransfer,/unverified/);
for(const changes of [{specimen:'other'},{variant:'other'},{weightKind:'takeoff'},{weightLb:null},{wingAreaM2:16},{power:'on'},{loadFactor:2},{altFt:Infinity},{speed:{kind:'IAS',mph:NaN}}])assert.equal(m.resolveStallEvidence(ac,{...record,...changes},cal).status,'unresolved');
for(const changes of [{configurationId:'other'},{specimen:'other'},{nearStallVerified:false},{scanVerified:false},{instrumentCorrectionIncluded:false},{altitudeRangeFt:[0,7000]},{altitudeRangeFt:[NaN,9000]},{points:[{iasMph:130,casMph:135},{iasMph:170,casMph:175}]}])assert.equal(m.resolveStallEvidence(ac,record,{...cal,...changes}).status,'unresolved');
for(const kind of ['CAS','EAS']){
const r=m.resolveStallEvidence(ac,{...record,speed:{kind,mph:91,correctionVerified:true,correctionSource:'SYNTHETIC TEST ONLY'}});
assert.equal(r.status,'derived-power-off');if(kind==='EAS')near(r.correctedEasMph,91);else near(r.correctedEasMph,resolved.correctedEasMph);
}
assert.equal(m.resolveStallEvidence(ac,{...record,speed:{kind:'EAS',mph:91}}).status,'unresolved');
const scenario={label:'synthetic sensitivity',reason:'unit invariants only',testWeightLb:9270,stallEasMph:[86,91]};
const s=m.stallSensitivity(ac,scenario,5000,170),[low,high]=s.samples;assert.equal(s.status,'unverified-sensitivity');
near(low.result.limits.nLift,(170/86)**2*9270/ac.weightLb);near(high.clMax/low.clMax,(86/91)**2);
assert.ok(low.result.limits.instantDegSec>high.result.limits.instantDegSec);
near(low.result.power.requiredHp,high.result.power.requiredHp);near(low.result.power.shaftHp,high.result.power.shaftHp);
near(low.result.limits.nPower,high.result.limits.nPower,'1e-9');
const heavier=m.stallSensitivity(ac,scenario,5000,170,{weightLb:9270*1.2});near(heavier.samples[0].result.stallEasMph,86*Math.sqrt(1.2));
const capped=m.stallSensitivity(ac,scenario,5000,250,{structG:3});assert.equal(capped.samples[0].result.limits.nInst,3);
const slow=m.stallSensitivity(ac,scenario,5000,60);assert.equal(slow.samples[0].result.limits.nInst,null);assert.equal(slow.samples[0].result.limits.nSust,null);
assert.throws(()=>m.stallSensitivity(ac,{...scenario,stallEasMph:[91,86]},5000,170));assert.throws(()=>m.stallSensitivity(ac,{...scenario,testWeightLb:NaN},5000,170));assert.throws(()=>m.stallSensitivity(ac,scenario,5000,170,{clMax:1.6}));
const r=require('../validation/diagnostics/stall_gate.cjs').run();assert.equal(r.aircraft.length,4);assert.equal(r.pairs.length,6);
for(const a of r.aircraft){assert.deepEqual(a.before,a.after);assert.ok(a.peaks.instant.degSec>=a.after.instantDegSec);assert.ok(a.peaks.sustained.degSec>=a.after.sustDegSec);for(const s of a.scenario.samples)assert.ok(s.nSust<=s.nInst+1e-10);}
for(const p of r.pairs){assert.equal(p.status,'UNRESOLVED');assert.equal(p.absoluteDifferentialResidualSeconds,null);assert.equal(p.validatedCombinedErrorSeconds,null);}
console.log('PASS stall evidence blockers, IAS/CAS/EAS arithmetic, no extrapolation, weight/lift/power invariants, four-aircraft frozen parity and unresolved comparisons');
for(const c of r.speedChecks)for(const p of c.points)assert.equal(p.beforeTasMph,p.afterTasMph);
for(const c of r.mustangClimb){near(c.beforeFpm,c.afterFpm);assert.ok(c.residualFpm < -390,'Mustang climb failure stays visible');}
near(r.p47Controlled[0].at200.requiredHp,r.p47Controlled[1].at200.requiredHp);
assert.ok(r.p47Controlled[1].maxSpeedMph>r.p47Controlled[0].maxSpeedMph);
