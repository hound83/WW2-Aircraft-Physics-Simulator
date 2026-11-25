'use strict';
const {levelSpeed}=require('./aircraft_intake.cjs');
const {E3,VA,rows,germanPower,mmPerAta,sources,climbFlight,scheduledTas,energyHeightFactor}=require('../../scripts/early-war-batch.cjs');
const ft=.3048, kmh=1.609344;
const round=n=>Number.isFinite(n)?Number(n.toFixed(2)):null;
const error=(pred,obs)=>Number.isFinite(pred)&&Number.isFinite(obs)?round(pred-obs):null;
function check(row,altFt,weightLb,observed,predicted,role,configuration,source) {
  return {id:row.id,altFt,weightLb,observed:round(observed),predicted:round(predicted),error:error(predicted,observed),role,configuration,source};
}
function run(data,id) {
  const german=id===E3,model=data.models[id],spec=data.specification.aircraft[id],weightLb=model.ac.weightLb;
  const root=spec.sources[0];
  const level=rows(german?'1304-cema-p4-level':'x4922-level').map((r,i)=>{
    const altFt=german?r.altitude_m/ft:r.altitude_ft;
    let trial=model;
    if(german){
      const bhp=germanPower('rated',altFt,r.manifold_pressure_mm/mmPerAta);
      const open=r.radiator==='open';
      trial={...model,ac:{...model.ac,powerRatings:{combat:{gears:{single:[{altFt,bhp}]}}}},
        benchmarkPolar:{...model.benchmarkPolar,cd0:model.benchmarkPolar.cd0+(open?model.climbCoolingAreaM2/model.ac.wingAreaM2:0)}};
    }
    const condition=german?r.radiator+' radiator, '+r.manifold_pressure_mm+' mm, '+r.rpm+' rpm':
      'de Havilland, +'+r.boost_gauge_psi+' psi, '+r.rpm+' rpm';
    return check(r,altFt,weightLb,german?r.speed_kmh/kmh:r.tas_mph,levelSpeed(trial,spec,{altFt,weightLb,rpm:r.rpm}),
      i===0||(german&&i===7)?'fit':'reserved speed, same trial',condition,sources[root].url);
  });
  const series=rows(german?'1304-cema-rae-climb':'x4922-climb').sort((a,b)=>a.altitude_ft-b.altitude_ft);
  const height=r=>r.altitude_ft;
  const tasAt=h=>scheduledTas(id,spec,h);
  const clockRow=series[0];
  let seconds=0,previous;
  const climb=[],elapsed=[];
  for(const r of series){
    const h=height(r),tas=tasAt(h),roc=climbFlight(id,model,spec,r).power?.climbFpm;
    const condition=german?'RAE French trial; estimated 155 mph CAS, progressive cooling closure':
      'A&AEE cooling climb, '+r.rpm+' rpm; reported TAS or within-schedule interpolation';
    const src=sources[german?'cema-rae':'aaee-va'].url;
    const obs=german?r.point_roc_fpm:r.roc_ft_min;
    if(Number.isFinite(obs))climb.push(check(r,h,weightLb,obs,roc/energyHeightFactor(id,spec,h),r.id===model.climbPowerFit.source?'fit':'same-report climb check',condition,src));
    if(previous){
      const energyFt=(h-previous.h)+(tas*tas-previous.tas*previous.tas)*.44704**2/(2*9.80665*ft);
      seconds=Number.isFinite(seconds)&&roc>0&&previous.roc>0?seconds+energyFt*30*(1/roc+1/previous.roc):null;
    }
    elapsed.push(check(r,h,weightLb,german?r.french_elapsed_s-clockRow.french_elapsed_s:r.elapsed_min*60,seconds,
      previous?'reserved clock; integrated modeled rates':'clock datum',german?'Interval from 3,280 ft; French clock origin unknown':'Interval from report zero',src));
    previous={h,tas,roc};
  }
  const mae=rs=>{const keep=rs.filter(r=>r.role!=='fit'&&Number.isFinite(r.error));return round(keep.reduce((n,r)=>n+Math.abs(r.error),0)/keep.length);};
  return {id,label:model.ac.name,level,climb,elapsed,levelMaeMph:mae(level),climbMaeFpm:mae(climb),
    scope:german?'5,600 lb comparison weight. CEMA cites 2–3% speed uncertainty. Closed 5,000 m and open 2,500 m set the two effective drag areas. DB 601 manual power is transferred to the recorded pressures.':
    '6,450 lb test weight. Fit uses only 10,000 ft level speed. W.3119 supplies rated engine power and provisional clean-glide lift. Climb cooling area is assumed.'};
}
module.exports={run,dataChecks:data=>[E3,VA].map(id=>run(data,id))};
