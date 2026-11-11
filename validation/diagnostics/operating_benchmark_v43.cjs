'use strict';
const fs=require('node:fs');
const path=require('node:path');
const M=require('../../src/physics.js');
const T=require('../../src/turn-lift.js');
const B=require('../../src/operating-benchmark.js');
const E=require('../../src/energy-configuration.js');
const V42=require('./operating_benchmark_v42.cjs');
const L=require('../../references/p51-turn-lift-tn1044.json');
const calibration=require('../../calibration/v4.3-benchmark.json');
const energy=require('../../calibration/v4.1-energy.json').configurations;
const p47=require('../../references/p47b-measured-climb-v33.json');
const spit=require('../../references/climb-condition-states.json').states.filter(row=>row.aircraftId==='spitfire_lfix_bs543');
const spitCeiling=require('../../references/bs543-high-altitude-climb-check.json');
const donor=require('../../references/independent-flight-checks.json').thunderboltProduction;
const service=require('../../references/benchmark-service-context.json');
const baseline=require('../../references/analysis/v43-benchmark-before.json');

function buildData(){
 const data=V42.buildData();
 for(const [id,ratings] of Object.entries(calibration.ratings)){
  data.models[id].benchmarkCooling={...energy[id],ratings,fadeTasMph:calibration.fadeTasMph};
 }
 return {...data,service};
}

function errors(rows){
 const difference=(row,key)=>Math.abs(row[key]-row.observed);
 const mae=key=>rows.reduce((sum,row)=>sum+difference(row,key),0)/rows.length;
 return {count:rows.length,beforeMae:mae('before'),afterMae:mae('after'),
  largestRegression:Math.max(0,...rows.map(row=>difference(row,'after')-difference(row,'before')))};
}

function reportClimbs(data=buildData(),searchSpitfireSpeed=false){
 const p47Fit=new Set([0,2,4,6,8]);
 const spitFit=new Set([2000,6000,10000,16000,22000,28000]);
 const cases=[
  {id:'p47b',name:'P-47B 41-5902',url:p47.source.url,
   condition:'12,565 lb gross, cooling flaps wide open, recorded TAS and torque-meter BHP.',
   rows:p47.states.map((row,i)=>({altFt:row.altFt,observed:row.observedFpm,weightLb:p47.mass.valueLb,
    tasMph:row.tasMph,bhp:row.shaftHp,rpm:row.engineRpm,
    mode:row.rating==='military'?'combat':'normal',role:p47Fit.has(i)?'fit':'check'}))},
  {id:'spitfire_lfix_bs543',name:'Spitfire LF IXc BS.543',url:energy.spitfire_lfix_bs543.source,
   condition:'7,485 lb gross, radiator flaps open, +18 rating. Uses Table II TAS at the flight-test schedule and boost-conditioned chart BHP. The report adopted the BS.354 climb schedule and had permission to exceed the routine five-minute Combat limit.',
   rows:spit.map(row=>({altFt:row.altFt,observed:row.observedFpm,weightLb:row.weightLb,
    tasMph:row.tasMph,mode:'combat',role:spitFit.has(row.altFt)?'fit':'check'}))}
 ];
 return cases.map(check=>{
  const {models,specification}=data;
  const model=models[check.id],spec=specification.aircraft[check.id];
  const control={...model,benchmarkCooling:undefined};
  const rows=check.rows.map(row=>{
   const settings={mode:row.mode,extension:false},phase=B.phaseFor(spec,settings);
   const at=(current,tas)=>{
    const r=B.evaluate(M,T,L,current,spec,settings,row.altFt,M.airspeeds(tas,row.altFt).eas,row.weightLb,phase,true);
    return r.status==='modelled'?{tasMph:tas,climbFpm:r.power.climbFpm,bhp:r.power.shaftHp,cooling:r.benchmark.cooling}:null;
   };
   const speeds=searchSpitfireSpeed&&check.id==='spitfire_lfix_bs543'?Array.from({length:106},(_,i)=>110+2*i):[row.tasMph];
   const best=current=>speeds.map(tas=>at(current,tas)).filter(Boolean).reduce((a,b)=>a.climbFpm>=b.climbFpm?a:b);
   const before=best(control),after=best(model);
   return {...row,before:before.climbFpm,after:after.climbFpm,beforeState:before,afterState:after};
  });
  return {...check,rows,fit:errors(rows.filter(row=>row.role==='fit')),checks:errors(rows.filter(row=>row.role==='check'))};
 });
}

function independentThunderbolt(data=buildData()){
 const model=data.models.p47b;
 const ac={...model.ac,stallIdentity:{...model.ac.stallIdentity,specimen:'41-5942'}};
 const configuration={...energy.p47b,id:'p47b-41-5942-v43-transfer',identity:ac.stallIdentity,source:donor.url,
  branches:[{rating:'military',gear:'turbo',minFt:10000,maxFt:30000,engineRpm:donor.rpm,
   reductionRatioEnginePerProp:2,powerBasis:'41-5942 torque-meter BHP',
   powerNodes:donor.climb.map(([altFt,bhp])=>({altFt,bhp})),loss:energy.p47b.branches[0].loss}]};
 const control={...configuration,branches:configuration.branches.map(branch=>({...branch,
  loss:{areaM2:model.climbCoolingAreaM2,powerFraction:0}}))};
 const rows=donor.climb.map(([altFt,bhp,tasMph,observed])=>{
  const installed={ac,options:{profile:'P',polar:model.benchmarkPolar}};
  const rate=cfg=>E.evaluate(M,installed,altFt,tasMph,'military',donor.weightLb,cfg).power.climbFpm;
  return {altFt,bhp,tasMph,observed,before:rate(control),after:rate(configuration),role:'transfer'};
 });
 return {id:'p47b-41-5942',name:'P-47B 41-5942',url:donor.url,
  condition:'Separate report and airframe, 12,620 lb gross and eight guns. Both predictions use recorded TAS, RPM and torque-meter BHP. This report was excluded from fitting.',
  checks:errors(rows),rows};
}

function corsairChecks(){
 const corsair=require('./f4u4.cjs'),{speed,chartConditioned,climb}=corsair.run();
 const audit=require('../../references/v4-source-audit.json').corsair;
 const ac=corsair.ac,mphPerKnot=1.150779448;
 const propWithLoss=factor=>({...ac.propGeometry,momentumModel:{...ac.propGeometry.momentumModel,
  machPenalty:ac.propGeometry.momentumModel.machPenalty*factor,advanceLoss:ac.propGeometry.momentumModel.advanceLoss*factor}});
 const speedRows=chartConditioned.map((row,i)=>{
  const replay=(factor,bhp=row.chartBhp)=>{
   const test={...ac,defaultGear:'test',propGeometry:propWithLoss(factor),powerRatings:{...ac.powerRatings,
    [row.rating]:{gears:{test:[{altFt:row.altFt,bhp}]}}}};
   return M.maxSpeed(test,row.altFt,{...M.workingOptions(ac),gear:'test',rating:row.rating})/mphPerKnot;
  };
  const margin=audit.originalLevelChart.bhpReadingUncertainty;
  return {...row,native:speed[i].predicted,before:row.predicted,after:replay(.5),zeroLoss:replay(0),
   halfLossPowerBand:[replay(.5,row.chartBhp-margin),replay(.5,row.chartBhp+margin)]};
 });
 const climbRows=climb.map(row=>({...row,before:row.predicted,
  after:M.bestClimb({...ac,propGeometry:propWithLoss(.5)},row.altFt,corsair.options(row.rating)).climbFpm??null}));
 return {accepted:false,levelSource:audit.originalLevelChart.url,climbSource:audit.originalClimbChart.url,
  interpretation:'Frozen polar, reduced modeled tip-Mach and advance losses. Speed is conditioned on digitized chart BHP. Climb uses the original rated-inlet power in both cases.',
  lowSpeed:errors(speedRows.filter(row=>row.altFt<10000)),highSpeed:errors(speedRows.filter(row=>row.altFt>=20000)),
  climb:errors(climbRows.filter(row=>row.role!=='climb fit')),speedRows,climbRows};
}

function coolingFlapCheck(data=buildData()){
 const archive=require('../../references/research/ww2_fighter_measured_conditions_2026-11-11.json');
 const series=archive.series.find(item=>item.id==='p47b-cooling-flap-speed');
 const model=data.models.p47b,base=energy.p47b,branch=base.branches[0];
 const neutral=series.rows[0],altFt=neutral[0],bhp=neutral[1];
 const cfg={...base,branches:[{...branch,powerNodes:[{altFt,bhp}]}]};
 const {ac,options}=E.prepare(M,model,altFt,'military',p47.mass.valueLb,cfg);
 const areaAt=tas=>{
  const r=M.evaluated(ac,altFt,tas,options);
  return r.power.excessHp*745.6998716/(r.drag.q*tas*.44704);
 };
 const areaNeutral=areaAt(neutral[5]);
 const rows=series.rows.map(([, , ,oil,intercooler,tasMph])=>({
  oil,intercooler,tasMph,areaDeltaM2:areaAt(tasMph)-areaNeutral
 }));
 return {source:p47.source.url,location:series.source_location,altFt,bhp,rpm:neutral[2],rows,
  qualification:'Equivalent area change inferred with the model propeller and test gross mass. The paired oil and intercooler flap sweep does not isolate the cowl-flap or propulsion changes in the climb fits.'};
}

function ceilingCheck(data=buildData()){
 const {models,specification}=data,id=spitCeiling.aircraftId;
 const model=models[id],spec=specification.aircraft[id],settings={mode:'combat',extension:true};
 const rows=spitCeiling.rows.map(([altFt,minutes,observed,tasMph,iasMph, , ,boostPsi])=>{
  const r=B.evaluate(M,T,L,model,spec,settings,altFt,M.airspeeds(tasMph,altFt).eas,spitCeiling.condition.grossWeightLb,undefined,true);
  return {altFt,minutes,observed,tasMph,iasMph,boostPsi,predicted:r.power?.climbFpm??null,
   cooling:r.benchmark?.cooling,estimatedPower:r.benchmark?.estimated};
 });
 return {source:spitCeiling.source,condition:spitCeiling.condition,qualification:spitCeiling.qualification,rows};
}

function browserData(){
 const data=buildData();
 return {...data,flightChecks:[...reportClimbs(data),independentThunderbolt(data)],
  spitfireBestSpeedSensitivity:reportClimbs(data,true)[1].checks,
  spitfireCeiling:ceilingCheck(data).rows.at(-1)};
}

function scenarioMetrics(row){
 return {stallEasMph:row.stallEasMph,turnDegSec:row.sustained?.rateDegSec??null,
  turnEasMph:row.sustained?.easMph??null,turnG:row.sustained?.g??null,
  climbFpm:row.climb?.climbFpm??null,vyEasMph:row.climb?.easMph??null,levelTasMph:row.level?.tasMph??null};
}

function run(){
 const data=buildData(),{models,specification}=data;
 const scenario=(row,openCooling)=>scenarioMetrics(B.metrics(M,T,L,models[row.id],specification.aircraft[row.id],
  specification.policy,{mode:row.mode,injection:row.injection,fuelFraction:.5,extension:true,openCooling},row.altFt));
 const rows=baseline.rows.map(({id,altFt,mode,injection,...before})=>{
  const selection={id,altFt,mode,injection};
  return {...selection,before,after:scenario(selection,false),
   ...(models[id].benchmarkCooling?{shuttersOpen:scenario(selection,true)}:{})};
 });
 return {version:require('../../package.json').version,baseline:baseline.commit,
  flightChecks:[...reportClimbs(data),independentThunderbolt(data)],
  spitfireBestSpeedSensitivity:reportClimbs(data,true).find(check=>check.id==='spitfire_lfix_bs543'),
  corsair:corsairChecks(),coolingFlapCheck:coolingFlapCheck(data),spitfireCeiling:ceilingCheck(data),rows,
  interpretation:'Report-conditioned climbs and operational model scenarios at 50% fuel. Historical sustained-turn discrimination remains unresolved.'};
}
function writeReport(){
 const report=run();
 fs.writeFileSync(path.join(__dirname,'../current/operating-benchmark-v43.json'),JSON.stringify(report,null,2)+'\n');
 return report;
}
if(require.main===module){
 const report=writeReport();
 console.log(JSON.stringify({version:report.version,states:report.rows.length,
  climbChecks:report.flightChecks.map(row=>({name:row.name,...row.checks})),
  corsairHighSpeed:report.corsair.highSpeed,corsairClimb:report.corsair.climb},null,2));
}
module.exports={buildData,browserData,reportClimbs,independentThunderbolt,corsairChecks,run,writeReport};
