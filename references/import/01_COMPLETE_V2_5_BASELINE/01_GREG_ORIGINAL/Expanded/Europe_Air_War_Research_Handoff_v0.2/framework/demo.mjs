import {readFileSync} from "node:fs";
import {atmosphereISA,evaluatePoint,maxLevelSpeed,bestRateClimb,speedSweep,afterFuelBurn} from "./performance_engine.mjs";

const aircraft=JSON.parse(readFileSync(new URL("./p51b15.json",import.meta.url),"utf8"));
const f=(x)=>Number(x).toFixed(1);
console.log("P-51B-15 43-24777, May 1944; 9240 lb; 67 inHg / 3000 RPM");
console.log("Speed sweep at 22,400 ft (all drag outputs CALCULATED, NOT measured):");
console.log("TAS   EAS    parasite-lb  induced-lb  %parasite  shaft HP needed  excess HP  ROC ft/min");
for(const p of speedSweep(aircraft,{altFt:22400,speedsMphTas:[150,200,250,300,350,400,425],gear:"high"})){
  console.log(
    String(p.input.speedMphTas).padStart(3),
    f(p.atmosphere.easMph).padStart(6),
    f(p.aerodynamics.dragParasiteLbf).padStart(12),
    f(p.aerodynamics.dragInducedLbf).padStart(11),
    f(p.aerodynamics.parasiteSharePct).padStart(10),
    f(p.power.requiredShaftHp).padStart(15),
    f(p.power.excessPropulsiveHp).padStart(10),
    f(p.power.rateClimbFtMin).padStart(12)
  );
}
console.log("\nHistorical measured versus CALCULATED maximum level speeds (not independent validation: model parameters were chosen with knowledge of the speed data):");
console.log("Altitude   Gear    historic TAS   model TAS   delta");
let errors=[];
for(const m of aircraft.measuredLevelSpeeds.filter(x=>x.rating==="67inHg")){
  const predicted=maxLevelSpeed(aircraft,{altFt:m.altFt,gear:m.gear});
  const delta=predicted-m.mphTas;
  errors.push(delta);
  console.log(String(m.altFt).padStart(7),m.gear.padStart(6),f(m.mphTas).padStart(13),f(predicted).padStart(11),f(delta).padStart(7));
}
console.log("Mean absolute error:",f(errors.reduce((a,x)=>a+Math.abs(x),0)/errors.length),"mph");
console.log("\nHistorical vs illustrative climb, both at 2,200 ft:");
for(const rating of ["67inHg","75inHg"]){
  const hist=aircraft.measuredClimb.find(x=>x.rating===rating);
  const b=bestRateClimb(aircraft,{altFt:2200,rating,gear:"low"});
  console.log(rating,"historical",hist.ftMin,"ft/min; model",f(b.rateClimbFtMin),"ft/min at",b.speedMphTas,"mph TAS");
}
const at20=evaluatePoint(aircraft,{altFt:20800,speedMphTas:300,gear:"high"});
console.log("\nAt 20,800 ft / 300 mph: BHP",f(at20.engine.bhp),"power-to-weight",f(at20.engine.shaftHpPerWeightLb*1000),"hp/1000 lb");
const lighter=afterFuelBurn(9240,30);
console.log("30 US gal burned (6 lb/gal assumed):",lighter,"lb; sample max ROC at 20,800 ft",f(bestRateClimb(aircraft,{altFt:20800,gear:"high",weightLb:lighter}).rateClimbFtMin),"ft/min");
console.log("\nModel caveats: provisional CD0, Oswald e, prop efficiency and CLmax; no Mach/Re correction; no real power duration, roll-rate, control-force or ballistic data.");
