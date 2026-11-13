'use strict';

(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BenchmarkStallReferences=api;
})(globalThis,function(){
 const variantByAircraft = Object.freeze({
  p51b:'p51b_4324777', p38g:'p38g_4212687', f4u4:'f4u4_80765',
  spitfire_lfix_bs543:'spitfire_lfix_bs543', p47b:'p47b_415902',
  fw190a4:'fw190a4_783', bf109f4:'bf109f4_representative'
 });

 const corsairChecks = [
  'ww2_fleet_stall_2026-11-12:f4u4-clean-powered',
  'ww2_thirteen_fighter_source_recovery_2026-11-11:f4u4-naca-corrected-stalls:0001',
  'ww2_thirteen_fighter_source_recovery_2026-11-11:f4u4-naca-corrected-stalls:0002'
 ];

 function referencesFor(pack,catalog){
  const sources=new Map(catalog.sources.map(row=>[row.id,row]));
  const observations=new Map(catalog.observations.map(row=>[row.id,row]));
  return Object.fromEntries(Object.entries(variantByAircraft).map(([aircraft,variant])=>{
   const clean=pack.stall_reference.variants.find(row=>row.id===variant)?.clean_stall;
   const rows=[];
   if(clean?.speed){
    const id=clean.observation_ids[0];
    const link=pack.sources[pack.observations[id]?.source];
    if(!link)throw Error('Missing clean stall source for '+variant);
    const calculation=clean.calculation;
    const weightLb=clean.conditions.weight_lb??(calculation?calculation.mass_kg/.45359237:null);
    rows.push({id,speed:clean.speed,weightLb,altFt:clean.conditions.altitude_ft??null,
     aircraft:clean.source_aircraft,power:clean.conditions.power,grade:clean.grade,
     source:{title:link.name,url:link.url},qualification:clean.qualification,
     ...(calculation?{calculation}:{}),role:aircraft==='p38g'?'Reserved sister-airframe check':'Clean reference'});
   }
   for(const id of aircraft==='f4u4'?corsairChecks:[]){
    const row=observations.get(id),source=sources.get(row?.source_id);
    if(!source||row.quantity!=='stall_speed'||row.speed_basis!=='CAS')throw Error('Missing Corsair stall case: '+id);
    const v=row.values;
    const navy=Number.isFinite(v.speed_kt);
    const glide=v.condition==='glide_clean';
    if(!navy&&!['glide_clean','power_on_clean'].includes(v.condition))throw Error('Expected a clean Corsair case: '+id);
    rows.push({id,speed:{value:navy?v.speed_kt:v.speed_mph,unit:navy?'kt':'mph',basis:'CAS'},
     weightLb:v.weight_lb??v.approx_test_weight_lb,altFt:v.alt_ft??v.pressure_altitude_ft??null,
     aircraft:row.aircraft,power:navy?'on':glide?'glide':'on',grade:'primary',
     source:{title:source.report,url:source.primary_url},qualification:navy?row.notes:
      'NACA Ames, approximate loading. '+v.map_inhg+' inHg / '+v.rpm+' RPM. CAS reading allowance ±3 mph.',
     role:navy?'Powered reference':'Separate NACA configuration check',
     ...(!navy?{readingAllowanceMph:3}:{})});
   }
   return [aircraft,rows];
  }));
 }

 function referenceEas(M,row){
  const {value,unit,basis}=row.speed;
  const factor=unit==='kt'?1852/1609.344:unit==='km/h'?1/1.609344:1;
  if(basis==='EAS')return value*factor;
  if(basis!=='CAS'||!Number.isFinite(row.altFt))return null;
  return M.airspeeds(M.tasFrom(value*factor,'CAS',row.altFt),row.altFt).eas;
 }

 return Object.freeze({referencesFor,referenceEas});
});
