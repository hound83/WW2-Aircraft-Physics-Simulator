import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {evaluatePoint,shaftHorsepower,maxLevelSpeed,bestRateClimb,speedSweep,afterFuelBurn,timeToClimbMinutes} from "./performance_engine.mjs";
const a=JSON.parse(readFileSync(new URL("./p51b15.json",import.meta.url),"utf8"));

assert.equal(shaftHorsepower(a,{altFt:20800,rating:"67inHg",gear:"high"}).bhp,1390);
assert.equal(shaftHorsepower(a,{altFt:20800,rating:"75inHg",gear:"high"}).bhp,1572);
assert.equal(shaftHorsepower(a,{altFt:10300,rating:"67inHg",gear:"low"}).bhp,1695);
assert.throws(()=>shaftHorsepower(a,{altFt:12000,rating:"75inHg",gear:"low"}),/No extrapolation/);
assert.throws(()=>shaftHorsepower(a,{altFt:12000,rating:"75inHg",gear:"auto"}),/No extrapolation/);

const p=speedSweep(a,{altFt:10000,speedsMphTas:[150,250,350],gear:"low"});
assert(p[0].aerodynamics.dragParasiteLbf<p[1].aerodynamics.dragParasiteLbf);
assert(p[1].aerodynamics.dragParasiteLbf<p[2].aerodynamics.dragParasiteLbf);
assert(p[0].aerodynamics.dragInducedLbf>p[1].aerodynamics.dragInducedLbf);
assert(p[1].aerodynamics.dragInducedLbf>p[2].aerodynamics.dragInducedLbf);
assert(p[0].aerodynamics.inducedSharePct>p[2].aerodynamics.inducedSharePct);
for(const x of p) assert(Math.abs(x.aerodynamics.dragParasiteLbf+x.aerodynamics.dragInducedLbf-x.aerodynamics.dragTotalLbf)<1e-8);

const v0=maxLevelSpeed(a,{altFt:0,rating:"67inHg",gear:"low"});
assert(Math.abs(v0-361.5)<4);
const v10300=maxLevelSpeed(a,{altFt:10300,rating:"67inHg",gear:"low"});
assert(Math.abs(v10300-409)<5);
const v24000=maxLevelSpeed(a,{altFt:24000,rating:"67inHg",gear:"high"});
assert(Math.abs(v24000-426)<15); // Known discrepancy, not silently "corrected".

const c67=bestRateClimb(a,{altFt:2200,rating:"67inHg",gear:"low"});
const c75=bestRateClimb(a,{altFt:2200,rating:"75inHg",gear:"low"});
assert(c75.rateClimbFtMin>c67.rateClimbFtMin);
assert(Math.abs(c67.rateClimbFtMin-3820)/3820<0.13);
assert(Math.abs(c75.rateClimbFtMin-4380)/4380<0.13);

const t=evaluatePoint(a,{altFt:20800,speedMphTas:260,gear:"high"});
assert(t.maneuver.instantaneousG>=t.maneuver.sustainedG);
assert(t.maneuver.instantaneousTurn.degPerSec>=t.maneuver.sustainedTurn.degPerSec);
assert(t.engine.shaftHpPerWeightLb>0);
assert(t.atmosphere.easMph<t.input.speedMphTas);

const light=afterFuelBurn(9240,30);
assert.equal(light,9060);
const climbLight=bestRateClimb(a,{altFt:2200,weightLb:light,gear:"low"}).rateClimbFtMin;
assert(climbLight>c67.rateClimbFtMin);
const tClimb=timeToClimbMinutes(a,{fromAltFt:0,toAltFt:10000,stepFt:500});
assert(tClimb>2 && tClimb<8);
assert.throws(()=>timeToClimbMinutes(a,{fromAltFt:0,toAltFt:20000,rating:"75inHg"}),/No extrapolation/);

console.log("PASS: physics, provenance-boundary and reference-data assertions.");
