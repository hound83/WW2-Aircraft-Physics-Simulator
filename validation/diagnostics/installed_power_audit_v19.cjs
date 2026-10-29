/* v1.9: installed-power/exhaust/weight audit. Nothing here changes the
 * production C solver. Exhaust force is a dimensioned sensitivity ONLY;
 * no P-51B/109/47 aircraft-specific thrust magnitude has been established.
 * Crucially, every sensitivity case re-derives Cd0 from its ORIGINAL
 * full-speed anchor. Adding exhaust to low speed only would be invalid.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const M=require('../../src/physics.js');
const D=require('../../aircraft/cases.json');
const fig=require('../baseline/p51_power_required_source_v16.json');
const old109=require('./joint_low_speed_v17.cjs');
const MPH=.44704, HP=745.6998716, LBF=4.4482216153, FPM=196.8503937;
const P51=D.aircraft.p51b,P47=D.aircraft.p47b,F4=D.aircraft.bf109f4;
const F4_E=old109.solveSeaLevelE();

function anchoredPolar(ac,coefficient=0,e=.78){
 const a=ac.calibration,p=M.shaftPower(ac,a.altFt,a.rating,a.gear);
 const prop=M.propEta(ac,a.altFt,a.tasMph,p.bhp,'C',a.rating);
 const v=a.tasMph*MPH, q=.5*M.isa(a.altFt).rho*v*v;
 const induced=(ac.weightLb*LBF)**2/(q*Math.PI*e*ac.spanM**2);
 const thrust=prop.eta*p.bhp*HP/v+coefficient*p.bhp*LBF;
 const cd0=(thrust-induced)/(q*ac.wingAreaM2);
 if(!(cd0>.005&&cd0<.085))throw Error('Invalid anchor polar: '+ac.name+', '+coefficient);
 return {cd0,e,source:'one-source-speed reanchoring; dimensioned exhaust force sensitivity only',
   exhaustLbfPerBhp:coefficient,anchorExhaustLbf:coefficient*p.bhp,anchorSpeedMph:a.tasMph,
   anchorHorsepower:p.bhp};
}
function sample(ac,alt,tas,rating,polar,weightLb=ac.weightLb,bhpOverride=null,rpmOverride=null){
 const shaft=M.shaftPower(ac,alt,rating,'auto');
 if(!shaft)return null;
 const hp=bhpOverride??shaft.bhp;
 const eta=M.propEta(ac,alt,tas,hp,'C',rating,rpmOverride?{engineRpmOverride:rpmOverride}:{});
 const drag=M.dragBreakdown(ac,alt,tas,weightLb,polar.cd0,polar.e);
 const v=tas*MPH,exhaustLbf=polar.exhaustLbfPerBhp*hp;
 const propulsiveHp=eta.eta*hp+exhaustLbf*LBF*v/HP;
 const excessHp=propulsiveHp-drag.requiredHp;
 const climbFpm=excessHp*HP/(weightLb*LBF)*FPM;
 const maxN2=(propulsiveHp/drag.requiredHp*drag.totalLbf-drag.parasiteLbf)/drag.inducedLbf;
 const q=drag.q, maxLiftN=q*ac.wingAreaM2*ac.clMaxAssumed/(weightLb*LBF);
 const n=maxN2>=1&&maxLiftN>=1?Math.min(Math.sqrt(maxN2),maxLiftN,7):null;
 const degSec=n!=null?9.80665*Math.sqrt(n*n-1)/v*180/Math.PI:null;
 return {tasMph:tas,altFt:alt,rating,shaftHp:hp,eta:eta.eta,
   exhaustLbf,exhaustHp:exhaustLbf*LBF*v/HP,
   propulsiveHp,requiredHp:drag.requiredHp,excessHp,climbFpm,turnDegSec:degSec,
   sustainedTurnSec:degSec>0?360/degSec:null,drag};
}
function maxSpeed(ac,alt,rating,pol){
 let last=null,bracket=null;
 for(let tas=100;tas<=580;tas+=2){const now=sample(ac,alt,tas,rating,pol);
  if(!now)return null;
  if(last&&last.excessHp>=0&&now.excessHp<0){bracket=[tas-2,tas];break;}
  last=now;
 }
 if(!bracket)return null;
 let [lo,hi]=bracket;
 for(let i=0;i<35;i++){let mid=(lo+hi)/2;if(sample(ac,alt,mid,rating,pol).excessHp>=0)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
function bestClimb(ac,alt,rating,pol,weightLb){
 let best=null;
 for(let tas=100;tas<=290;tas++){
  const r=sample(ac,alt,tas,rating,pol,weightLb);
  if(!r)continue;
  const minSpeed=Math.sqrt(2*weightLb*LBF/(1.225*ac.wingAreaM2*ac.clMaxAssumed))/.44704;
  if(M.airspeeds(tas,alt).eas<minSpeed)continue;
  if(!best||best.climbFpm<r.climbFpm)best=r;
 }
 return best;
}
function holdouts(ac,pol){
 const obs=ac.observedSpeed.filter(r=>r.rating===ac.calibration.rating&&r.altFt!==ac.calibration.altFt);
 const rows=obs.map(r=>({altFt:r.altFt,sourceMph:r.mphTas,
    modeledMph:maxSpeed(ac,r.altFt,r.rating,pol),rating:r.rating}));
 for(const row of rows)row.errorMph=row.modeledMph-row.sourceMph;
 return {count:rows.length,maeMph:rows.reduce((s,r)=>s+Math.abs(r.errorMph),0)/rows.length,rows};
}
function fig5(pol){
 const rows=fig.points.map(p=>{
  const r=sample(P51,fig.altitudeFt,p.tasMph,'67inHg',pol,fig.nominalWeightLb,p.testBhp,p.engineRpm);
  // η(J,Cp) is evaluated at the period chart's BHP value. This is a
  // one-step evaluation, not an implicit inversion of the prop map.
  const predictedBhp=r.requiredHp/(r.eta+pol.exhaustLbfPerBhp*LBF*p.tasMph*MPH/HP);
  return {tasMph:p.tasMph,sourceBhp:p.testBhp,engineRpm:p.engineRpm,
    predictedBhp,deltaBhp:predictedBhp-p.testBhp};
 });
 return {rows,firstFourMaeBhp:rows.slice(0,4).reduce((s,r)=>s+Math.abs(r.deltaBhp),0)/4,
    fullMaeBhp:rows.reduce((s,r)=>s+Math.abs(r.deltaBhp),0)/rows.length};
}
function f4turn(pol,altMeters){
 const altFt=altMeters/.3048, speedTasMph=M.trueFromCAS(270/1.609344,altFt);
 return sample(F4,altFt,speedTasMph,'emergency',pol,F4.weightLb);
}
function caseRow(coefficient,e=.78){
 const p51=anchoredPolar(P51,coefficient,e),p47=anchoredPolar(P47,coefficient,.78),
       f4=anchoredPolar(F4,coefficient,F4_E);
 const climb67=bestClimb(P51,2200,'67inHg',p51,9335),
       climb75=bestClimb(P51,2200,'75inHg',p51,9335);
 const turn0=f4turn(f4,0),turn3=f4turn(f4,3000);
 return {coefficientLbfPerBhp:coefficient,p51AnchorExhaustLbf:p51.anchorExhaustLbf,
   p51CD0:p51.cd0,p51E:e,p51Climb67:{fpm:climb67.climbFpm,tasMph:climb67.tasMph,
     exhaustHp:climb67.exhaustHp,shaftHp:climb67.shaftHp,eta:climb67.eta},
   p51Climb75:{fpm:climb75.climbFpm,tasMph:climb75.tasMph,
     exhaustHp:climb75.exhaustHp,shaftHp:climb75.shaftHp,eta:climb75.eta},
   p51BoostGainFpm:climb75.climbFpm-climb67.climbFpm,
   p51SpeedHoldouts:holdouts(P51,p51),p47SpeedHoldouts:holdouts(P47,p47),
   p51Fig5:fig5(p51),
   f4E:F4_E,f4SLTurnSeconds:turn0?.sustainedTurnSec,
   f4TurnAt3000mSeconds:turn3?.sustainedTurnSec,
   f4TurnSpeedTasMph:{seaLevel:turn0.tasMph,at3000m:turn3.tasMph}};
}
function run(){
 const scenarios=[0,.025,.05,.1,.15,.2,.225,.25].map(x=>caseRow(x));
 const weight=[9335,9285,9235,9135].map(w=>{
  const pol=anchoredPolar(P51,0,.78),a=bestClimb(P51,2200,'67inHg',pol,w),
    b=bestClimb(P51,2200,'75inHg',pol,w);
  return {weightLb:w,deltaFromTakeoffLb:9335-w,climb67Fpm:a.climbFpm,
    climb75Fpm:b.climbFpm,sourceWeightStatus:w===9335?'documented takeoff weight':'HYPOTHETICAL fuel/weight change; actual 2200-ft flight weight unknown'};
 });
 const eSweep=[.78,.85,.92,1].map(e=>{
  const pol=anchoredPolar(P51,0,e),a=bestClimb(P51,2200,'67inHg',pol,9335),
    b=bestClimb(P51,2200,'75inHg',pol,9335);
  return {e,cd0:pol.cd0,climb67Fpm:a.climbFpm,climb75Fpm:b.climbFpm,
    fig5FourMaeBhp:fig5(pol).firstFourMaeBhp};
 });
 const zero=scenarios[0];
 const crossCheck={p51Ref:{observed67Fpm:3820,observed75Fpm:4380,observedGainFpm:560},
   zeroResidual67Fpm:zero.p51Climb67.fpm-3820,
   zeroResidual75Fpm:zero.p51Climb75.fpm-4380,
   zeroBoostGainResidualFpm:zero.p51BoostGainFpm-560,
   scenarioForceToClose67Lbf:interpolateRoot(scenarios,'p51Climb67',3820),
   scenarioForceToClose75Lbf:interpolateRoot(scenarios,'p51Climb75',4380)};
 return {version:'v1.9-power-accounting-not-fitted',date:'2026-10-26',
  method:'Candidate C unchanged by default. Hypothetical exhaust F=coefficient*engine BHP (force, NOT propeller horsepower); source-speed CD0 reanchored separately per scenario/aircraft; SAME coefficient shared across all three. Flight weight is separate sensitivity. Not an identification or a correction to flight-data results.',
  modelState:'C live; no exhaust term promoted; historical speed holdouts left unaltered',
  sources:{p51May1944:'https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html',
   propTheory1944:'https://ntrs.nasa.gov/citations/19930093312',
   exhaustTest1940:'https://ntrs.nasa.gov/citations/20090014842',
   independentP51BPropTest:'https://ntrs.nasa.gov/citations/19780078569'},
  keyCaveats:['Packard chart is SOURCE of P-51 BHP, not an onboard torque transducer; uncertainties not quantified.',
   'The reported 9,335 lb is TAKEOFF gross; figure 5 level flight is explicitly weight-corrected to 9,240 lb at 22,400 ft.',
   '1940 NACA exhaust test was a different RADIAL engine at 550 mph; its 18% figure is NOT a P-51 thrust coefficient.',
   'F4 e still conditioned on IL-2 sea-level turn, not a wartime flight drag measurement.',
   'P-47B and P-51B speed constraints share the airplane used for engine-climb results; avoid false independence.',
   'All nonzero exhaust forces here are HYPOTHETICAL with no source-backed upper bound for the three installed exhaust systems.',
   'A necessary thrust-force magnitude is not proof exhaust caused the discrepancy.'],
  scenarios,weightSensitivity:weight,oswaldSensitivity:eSweep,crossCheck};
}
function interpolateRoot(rows,key,target){
 for(let i=1;i<rows.length;i++){
  const a=rows[i-1],b=rows[i],ya=a[key].fpm,yb=b[key].fpm;
  if((ya-target)*(yb-target)<=0){const c=a.coefficientLbfPerBhp+(target-ya)/(yb-ya)*(b.coefficientLbfPerBhp-a.coefficientLbfPerBhp);
   return {coefficientLbfPerBhp:c,approxSeaLevelForceLbf:c*1580,bracket:[a.coefficientLbfPerBhp,b.coefficientLbfPerBhp],note:'linear interpolation of exploratory force scenario; NOT source-observed exhaust thrust'};
  }
 }
 return {status:'outside-tested-range'};
}
if(require.main===module){const result=run();
 if(process.argv.includes('--write')){const p=path.join(__dirname,'../baseline/installed_power_results_v19.json');
   fs.writeFileSync(p,JSON.stringify(result,null,2)+'\n');console.log('Wrote '+p);}
 console.log('v1.9 C baseline 67/75',result.scenarios[0].p51Climb67.fpm.toFixed(1),result.scenarios[0].p51Climb75.fpm.toFixed(1));
 for(const r of result.scenarios)console.log('force %.3f'.replace('%.3f',r.coefficientLbfPerBhp.toFixed(3)),
  'P51 67/75',r.p51Climb67.fpm.toFixed(0),r.p51Climb75.fpm.toFixed(0),
  'Fig5',r.p51Fig5.firstFourMaeBhp.toFixed(1),
  'P47/P51 MAE',r.p47SpeedHoldouts.maeMph.toFixed(2),r.p51SpeedHoldouts.maeMph.toFixed(2),
  'F4 turn',r.f4SLTurnSeconds.toFixed(2),r.f4TurnAt3000mSeconds.toFixed(2));
}
module.exports={run,anchoredPolar,sample,maxSpeed,bestClimb,holdouts,fig5,caseRow};
