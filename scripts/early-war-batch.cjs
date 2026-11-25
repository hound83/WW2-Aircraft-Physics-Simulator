'use strict';
const M = require('../src/physics.js');
const B = require('../src/operating-benchmark.js');
const T = require('../src/turn-lift.js');
const L = require('../references/p51-turn-lift-tn1044.json');
const pack = require('../references/analysis/ww2_early_war_flight_tests_2026-11-14.json');
const E3 = 'bf109e3_1304', VA = 'spitfire_va_x4922';
const ft = .3048, kmh = 1.609344, psToHp = 735.49875 / 745.6998716;
const pressurePsi = 14.6959, mmPerAta = 735.55924;
function rows(id) {
  const series = pack.series.find(s => s.id === id);
  return series.rows.map((r,i) => ({ id: id + ':' + String(i+1).padStart(4,'0'),
    ...Object.fromEntries(series.columns.map((k,j) => [k,r[j]])) }));
}
const source = id => {
  const s = pack.sources.find(s => s.id === id);
  return { title:s.title, url:s.url, kind:s.type, facts:s.title };
};
const sources = Object.fromEntries(['cema-p4','cema-rae','db601','aaee-va','merlin45-1941-limits','factory1792'].map(id=>[id,source(id)]));
sources.w3119 = { title:'NACA L-334, W.3119, aircraft specifications', url:'https://ntrs.nasa.gov/citations/19930092582',
  kind:'period flight report, sister aircraft', facts:'Merlin XLV rated brake horsepower and full-span geometry on W.3119.' };
function powerCurve(points) {
  return { gears:{ single:points.sort((a,b)=>a.altFt-b.altFt) } };
}
function datum(altFt,bhp) { return {altFt,bhp}; }
function germanPower(condition,altFt,measuredAta) {
  const [sea,peak]=rows('db601a-book').filter(r=>r.condition===condition);
  const fraction=Math.min(1,altFt*ft/peak.altitude_m);
  const map=measuredAta??sea.boost_ata*Math.min(1,M.isa(altFt).p/M.isa(peak.altitude_m/ft).p);
  return (sea.power_ps+(peak.power_ps-sea.power_ps)*fraction)*psToHp*map/sea.boost_ata;
}
function scheduledTas(id, spec, altFt) {
  return id === E3 ? M.tasFrom(155, 'CAS', altFt) : B.interpolate(spec.climbTAS, altFt, 1);
}

// Height rate = specific excess power / (1 + V/g * dV/dh).
// Use a centered local gradient inside the schedule and one-sided endpoint gradients.
function energyHeightFactor(id, spec, altFt) {
  const minFt = id === E3 ? spec.climbIAS[0][0] : spec.climbTAS[0][0];
  const maxFt = id === E3 ? spec.climbIAS.at(-1)[0] : spec.climbTAS.at(-1)[0];
  const low = Math.max(minFt, altFt - 10), high = Math.min(maxFt, altFt + 10);
  const a = scheduledTas(id, spec, low), b = scheduledTas(id, spec, high);
  return 1 + (b * b - a * a) * .44704 ** 2 / (2 * 9.80665 * ft * (high - low));
}
function climbFlight(id,model,spec,row) {
  const german=id===E3,altFt=row.altitude_ft,rpm=row.rpm,mode=german?'combat':'normal';
  const tas=scheduledTas(id,spec,altFt);
  let trial=model;
  if(german){
    const ata=(pressurePsi+row.boost_gauge_psi)/14.22334;
    const bhp=germanPower('rated',altFt,ata)*rpm/2400;
    const share=Math.max(0,Math.min(1,(26000-altFt)/13000));
    trial={...model,climbCoolingAreaM2:model.climbCoolingAreaM2*share,
      climbPowerRatings:{combat:powerCurve([datum(altFt,bhp)])}};
  }
  const phase={...spec[mode],key:mode,rpm};
  return B.evaluate(M,T,L,trial,spec,{mode,fuelFraction:.5},altFt,M.airspeeds(tas,altFt).eas,model.ac.weightLb,phase,true);
}
function fitClimb(id,model,spec,row) {
  const test=climbFlight(id,model,spec,row),rate=row.point_roc_fpm??row.roc_ft_min;
  const requiredHp=test.power.requiredHp+rate*energyHeightFactor(id,spec,row.altitude_ft)*.3048/60*model.ac.weightLb*4.4482216153/745.6998716;
  const requestedFactor=requiredHp/test.power.propulsiveHp;
  if(!(requestedFactor>0&&requestedFactor<=1))throw Error('Unsupported climb power correction for '+row.id);
  const factor=Math.max(.90,requestedFactor); // Lower limit of the shared propulsive-power scenario.
  model.climbPowerFit={factor,requestedFactor,source:row.id,altFt:row.altitude_ft};
  spec.ratingEvidence+=' Climb uses an effective propulsive-power factor of '+factor.toFixed(3)+' bounded by the shared scenario. The '+row.altitude_ft.toLocaleString('en-US')+' ft observation implies '+requestedFactor.toFixed(3)+'. Cooling and propulsion are unresolved.';
}
function make(base, helpers) {
  const {aircraft,prop,phase,levelPolar}=helpers;
  const level=rows('1304-cema-p4-level'), climb=rows('1304-cema-rae-climb');
  const closed=level.filter(r=>r.radiator==='closed'), opened=level.filter(r=>r.radiator==='open');
  // The recorded pressures belong to distinct passes. Below the closed series the
  // open-run pressure is an explicit installation proxy, including at the open fit.
  const eLevel=[...opened.filter(r=>r.altitude_m<5000),...closed].map(r=>datum(r.altitude_m/ft,
    germanPower('rated',r.altitude_m/ft,r.manifold_pressure_mm/mmPerAta)));
  const eCurve=condition=>powerCurve([0,2500,4500,4900,5000,6000,7000,8000].map(h=>datum(h/ft,germanPower(condition,h/ft))));
  const eWeight=5600, normal=phase('Raised continuous 1.23 ata / 2300 rpm',2300,1.23,'normal',1800);
  const combat=phase('Rated 1.30 ata / 2400 rpm',2400,1.3,'combat',300);
  const eAc=aircraft(E3,'Bf 109 E-3 · WNr 1304','DB 601 A','Luftwaffe',{wingAreaM2:16.2,spanM:9.87},
    prop(base.models.bf109f4.ac,3.1/ft,1.55,3,'VDM three-blade; E-series geometry assumption'),eWeight,
    1.35,{normal:eCurve('raised continuous'),continuous:eCurve('continuous'),
      combat:powerCurve([datum(0,germanPower('rated',0)),...eLevel,datum(8000/ft,germanPower('rated',8000/ft))])},'combat');
  const anchor=(r)=>({altFt:r.altitude_m/ft,tasMph:r.speed_kmh/kmh,rpm:r.rpm,gear:'single'});
  const openPolar=levelPolar(eAc,anchor(opened[0]),'CEMA open, 2500 m');
  const ePolar=levelPolar(eAc,anchor(closed[0]),'CEMA closed, 5000 m');
  const area=(openPolar.cd0-ePolar.cd0)*eAc.wingAreaM2;
  if(!(area>0))throw Error('E-3 radiator fit has a nonpositive area');
  const eModel={ac:eAc,options:{},timedClimbEnergy:true,benchmarkPolar:ePolar,climbCoolingAreaM2:area};
  const eSpec={sources:['cema-p4','cema-rae','db601','factory1792'],referenceWeightLb:eWeight,
    fuelCapacityUSGal:400/3.785411784,referenceFuelUSGal:400/3.785411784,armament:'French trial airframe, full-span E wing.',
    baseRating:'combat',baseRpm:2400,baseMap:1.3,mapUnit:'ata',pressureExponent:1,normal,combat,
    continuous:phase('Continuous 1.15 ata / 2200 rpm',2200,1.15,'continuous',null),
    climbIAS:[[0,155],[26300,155]],levelObservationFloorFt:2500/ft,levelObservationCeilingFt:7000/ft,
    loadQualification:'RAE quotes 5,600 lb for the trial. Full internal fuel at reference loading is an assumption.',
    speedQualification:'155 mph IAS is a planning assumption. CEMA did not give a climb-speed schedule.',
    ratingEvidence:'Book ratings and CEMA pressure. Closed level and open cooling have separate drag anchors.',
    stallQualification:'Numerical lift assumption CLmax 1.35. The two British indicated stall reports lack a compatible correction for this E wing.'};
  const vaLevel=rows('x4922-level'),vaClimb=rows('x4922-climb').sort((a,b)=>a.altitude_ft-b.altitude_ft);
  // W.3119 engine ratings are transferred. Scale sea-level takeoff power from
  // +12 to +9 by absolute pressure and rpm; use the tested X.4922 boost above FTH.
  function merlin(h,rpm,boost,critical) {
    const sea=1170*(pressurePsi+9)/(pressurePsi+12)*rpm/3000;
    const rated=rpm===3000?1210:1200;
    return (sea+(rated-sea)*Math.min(h/critical,1))*(pressurePsi+boost)/(pressurePsi+9);
  }
  const vaCurve=(rr,rpm,critical)=>powerCurve([datum(0,merlin(0,rpm,9,critical)),...rr.filter(r=>r.altitude_ft>0)
    .map(r=>datum(r.altitude_ft,merlin(r.altitude_ft,r.rpm,r.boost_gauge_psi,critical)))]);
  const vaPower=vaCurve(vaLevel,3000,20800), vaClimbPower=vaCurve(vaClimb,2850,14400);
  const vaAc=aircraft(VA,'Spitfire Va · X.4922','Merlin XLV','RAF',{wingAreaM2:242*.09290304,spanM:443*.0254},
    prop(base.models.spitfire_lfix_bs543.ac,10.75,1/.477,3,'de Havilland, 34°–54° stops; diameter is a family estimate'),
    6450,1.18,{combat:vaPower,normal:vaClimbPower},'combat');
  const vaModel={ac:vaAc,options:{},timedClimbEnergy:true,climbCoolingAreaM2:.06,
    climbPowerRatings:{combat:vaClimbPower,normal:vaClimbPower},
    benchmarkPolar:levelPolar(vaAc,{altFt:10000,tasMph:vaLevel[0].tas_mph,gear:'single',rpm:3000},'X.4922 level test at 10,000 ft')};
  const scheduled=vaClimb.filter(r=>Number.isFinite(r.tas_mph));
  const vaNormal=phase('Climb +9 psi / 2850 rpm',2850,pressurePsi+9,'normal',1800);
  const vaSpec={sources:['aaee-va','merlin45-1941-limits','w3119'],referenceWeightLb:6450,
    fuelCapacityUSGal:85*1.20095,referenceFuelUSGal:85*1.20095,armament:'Full-span Va trial configuration with de Havilland propeller.',
    baseRating:'combat',baseRpm:3000,baseMap:pressurePsi+9,mapUnit:'psi abs',pressureExponent:1,normal:vaNormal,
    combat:phase('All-out level +9 psi / 3000 rpm',3000,pressurePsi+9,'combat',300),
    continuous:{...phase('Rich cruise +7 psi / 2650 rpm',2650,pressurePsi+7,'normal',null),powerFactor:(pressurePsi+7)/(pressurePsi+9)*2650/2850},
    climbIAS:[[0,170],...scheduled.map(r=>[r.altitude_ft,r.asi_mph])],
    climbTAS:[[0,170],...scheduled.map(r=>[r.altitude_ft,r.tas_mph])],
    levelObservationFloorFt:10000,levelObservationCeilingFt:26000,
    loadQualification:'A&AEE X.4922 test weight 6,450 lb. Full internal fuel at reference loading is assumed.',
    speedQualification:'Measured climb TAS schedule; departure speed is estimated. Level speed below 10,000 ft is extrapolated.',
    ratingEvidence:'1941 limits; W.3119 engine ratings transferred. Installed power and open radiator drag area are provisional.',
    stallQualification:'W.3119 clean-glide CLmax 1.18 with covered ports. Same-mark transfer with different propeller and loading.'};
  fitClimb(E3,eModel,eSpec,climb.find(r=>r.altitude_ft===9850));
  fitClimb(VA,vaModel,vaSpec,vaClimb.find(r=>r.altitude_ft===10000));
  const service=(ac,country,years,s)=>({displayName:ac.name.split(' · ')[0],country,group:'early',years,theatres:['Western Europe'],source:s.url});
  return {[E3]:{model:eModel,spec:eSpec,service:service(eAc,'germany',[1939,1941],sources['cema-p4'])},
    [VA]:{model:vaModel,spec:vaSpec,service:service(vaAc,'uk',[1941,1943],sources['aaee-va'])}};
}
module.exports={make,rows,sources,E3,VA,germanPower,mmPerAta,climbFlight,scheduledTas,energyHeightFactor};
