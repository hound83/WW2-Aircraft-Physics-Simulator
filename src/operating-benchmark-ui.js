'use strict';
(()=>{
 const $=id=>document.getElementById(id),B=OperatingBenchmark,M=UniversalAirPhysics,T=UniversalTurnLift,L=JSON.parse($('turn-lift-source').textContent);
 const data=JSON.parse($('benchmark-operating-data').textContent),{models,specification:specs}=data;
 const fmt=(x,n=1)=>Number.isFinite(x)?x.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n}):'—';
 const Chart=OperatingBenchmarkChart;
 const api=globalThis.OperatingBenchmarkUI={data,settings:{},rows:{},climbs:null,probe:null};
 const speed=(value,kind)=>Chart.speed(value,$('bench-speed-unit').value,kind);
 for(const side of ['a','b'])for(const [id,m]of Object.entries(models))$('bench-aircraft-'+side).add(new Option(m.ac.name.split(' / ')[0],id));
 $('bench-aircraft-a').value='p51b';$('bench-aircraft-b').value='spitfire_lfix_bs543';
 const text=(tag,value,className)=>{const e=document.createElement(tag);e.textContent=value;if(className)e.className=className;return e;};
 function read(side){const id=$('bench-aircraft-'+side).value,spec=specs.aircraft[id],input=$('bench-injection-'+side),combat=$('bench-power-'+side).value==='combat';
  input.disabled=!spec.injection||!combat;if(input.disabled)input.checked=false;
  $('bench-injection-label-'+side).textContent=spec.injection?(spec.injection.type+(combat?'':' · Combat only')):'Injection not fitted';
  return {id,settings:{mode:combat?'combat':'normal',fuelFraction:Number($('bench-fuel-'+side).value),injection:input.checked,extension:$('bench-extension').checked}};
 }
 function number(label,value,detail){const e=document.createElement('div');e.className='bench-number';e.append(text('span',label),text('strong',value),text('small',detail));return e;}
 function renderSide(side){
  const chosen=api.settings[side],spec=specs.aircraft[chosen.id],r=api.rows[side];
  $('bench-title-'+side).textContent='Aircraft '+(side==='a'?'1':'2')+' · '+fmt(r.altFt,0)+' ft';
  $('bench-setting-'+side).textContent=(chosen.settings.mode==='combat'?'COMBAT':'NORMAL')+' · '+fmt(chosen.settings.fuelFraction*100,0)+'% FUEL · '+(chosen.settings.injection?spec.injection.type.toUpperCase():'DRY');
  const box=$('bench-result-'+side);box.replaceChildren();
  box.append(text('p',r.phase.label+' · '+(r.phase.seconds?fmt(r.phase.seconds/60,1)+' min limit':'no timed limit in selected profile')));
  box.append(text('p',fmt(r.loading.weightLb,0)+' lb · '+fmt(r.loading.fuelUSGal,1)+' US gal internal · '+spec.armament,'bench-note'));
  box.append(text('p',spec.ratingEvidence??'Source-based settings; installed-power and load reconstruction remain model estimates.','bench-note'));
  if(r.status==='source-power-unavailable'){box.append(text('p','Power source does not cover this altitude. Enable labelled estimates to inspect a pressure-lapse scenario.','bench-warning'));return;}
  if(r.status!=='modelled')box.append(text('p','This model cannot sustain level flight at this load, power and altitude.','bench-warning'));
  if(r.sustained?.estimatedPower||r.level?.estimatedPower||r.climb?.estimatedPower)box.append(text('p','High-altitude power estimate beyond the last source node.','bench-warning'));
  const grid=document.createElement('div');grid.className='bench-numbers';
  grid.append(number('Maximum sustained turn',fmt(r.sustained?.rateDegSec)+'°/s',fmt(r.sustained?.seconds360)+' s / 360° · '+speed(r.sustained?.easMph,'EAS')),
   number('Sustained load / radius',fmt(r.sustained?.g,2)+' g',fmt(r.sustained?.radiusM,0)+' m radius at peak rate'),
   number('Best climb rate',fmt(r.climb?.climbFpm,0)+' ft/min','Vy '+speed(r.climb?.easMph,'EAS')+' / '+speed(r.climb?.tasMph,'TAS')),
   number('Maximum level speed',speed(r.level?.tasMph,'TAS'),speed(r.level?.easMph,'EAS')+' · steady equilibrium'),
   number('Minimum sustained radius',fmt(r.minSustainedRadius?.radiusM,0)+' m','At '+speed(r.minSustainedRadius?.easMph,'EAS')),
   number('Instantaneous turn scenario',fmt(r.instantaneous?.rateDegSec)+'°/s',fmt(r.instantaneous?.seconds360)+' s / 360° at '+speed(r.instantaneous?.easMph,'EAS')+' · 7 G cap · may lose energy'));
  box.append(grid,text('p','At the scheduled climb speed of '+speed(r.manualClimb?.iasMph,'IAS≈CAS')+', the climb rate is '+fmt(r.manualClimb?.climbFpm,0)+' ft/min.','bench-note'));
 }
 function plot(alt){
  const series=['a','b'].map(side=>{
   const row=api.rows[side],model=models[api.settings[side].id];
   return {
    side,
    name:'Aircraft '+(side==='a'?'1':'2')+' · '+model.ac.name.split(' / ')[0],
    range:row.turnRange,
    stallEasMph:row.stallEasMph,
    levelEasMph:row.level?.easMph??null,
    peakEasMph:row.sustained?.easMph
   };
  });
  Chart.render({
   chart:$('bench-turn-plot'),slider:$('bench-probe-speed'),value:$('bench-probe-value'),
   results:$('bench-probe-results'),unit:$('bench-speed-unit').value,altFt:alt,series,
   selectedEasMph:api.probe?.easMph,
   evaluateAt(side,eas,climbing){
    const chosen=api.settings[side],row=api.rows[side];
    return B.evaluate(M,T,L,models[chosen.id],specs.aircraft[chosen.id],chosen.settings,
     alt,eas,row.loading.weightLb,row.phase,climbing);
   },
   onProbe(probe){api.probe=probe;}
  });
 }
 function sourceDetails(){const box=$('bench-sources');box.replaceChildren();for(const side of ['a','b']){const c=api.settings[side],sp=specs.aircraft[c.id];box.append(text('h3',models[c.id].ac.name),text('p',sp.loadQualification),text('p',api.rows[side].powerQualification),text('p',sp.speedQualification));for(const id of sp.sources){const src=specs.sources[id],p=document.createElement('p'),a=document.createElement('a');a.href=src.url;a.textContent=src.title;a.target='_blank';a.rel='noopener';p.append(a,text('small',' · '+src.kind+' · '+src.facts));box.append(p);}}}
 function render(){
  const alt=Number($('bench-altitude').value);
  for(const side of ['a','b']){
   const chosen=read(side);
   api.settings[side]=chosen;
   api.rows[side]=B.metrics(M,T,L,models[chosen.id],specs.aircraft[chosen.id],specs.policy,chosen.settings,alt);
   renderSide(side);
  }
  plot(alt);sourceDetails();api.climbs=null;$('bench-climb-result').replaceChildren(text('p','Settings updated. Calculate both climbs for the current choices.'));
  const a=api.rows.a.sustained?.rateDegSec,b=api.rows.b.sustained?.rateDegSec;
  $('bench-comparison').textContent=Number.isFinite(a)&&Number.isFinite(b)?'Modeled sustained-turn difference (aircraft 1 − aircraft 2): '+fmt(a-b,2)+'°/s. Historical ranking uncertainty remains unresolved.':'A sustained-turn comparison is unavailable for one or both selected states.';
 }
 for(const id of ['bench-altitude','bench-extension',...['a','b'].flatMap(s=>['aircraft','power','fuel','injection'].map(k=>'bench-'+k+'-'+s))])$(id).addEventListener('change',render);
 $('bench-speed-unit').addEventListener('change',()=>{
  for(const side of ['a','b'])renderSide(side);
  plot(Number($('bench-altitude').value));
 });
 $('bench-climb-from').addEventListener('change',()=>{api.climbs=null;$('bench-climb-result').textContent='Start altitude changed. Recalculate both climbs.';});
 $('bench-climb-calculate').addEventListener('click',()=>{const from=Number($('bench-climb-from').value),to=Number($('bench-altitude').value),box=$('bench-climb-result');box.replaceChildren();if(to<=from){box.append(text('p','Choose a target altitude above the climb start.'));return;}
  const results={};for(const side of ['a','b']){const c=api.settings[side];results[side]=B.climb(M,T,L,models[c.id],specs.aircraft[c.id],specs.policy,c.settings,from,to);const r=results[side];
   box.append(text('h3','Aircraft '+(side==='a'?'1':'2')+' · '+models[c.id].ac.name),text('p',r.status==='reached'?'Time to '+fmt(to,0)+' ft: '+fmt(r.seconds/60,2)+' min':'Target not reached: '+r.status+' at '+fmt(r.reachedFt,0)+' ft'),text('p','Combat used '+fmt(r.combatSeconds/60,2)+' min · remaining '+fmt(r.combatRemainingSeconds/60,2)+' min · fuel used '+fmt(r.fuelUsedLb,1)+' lb · arrival mass '+fmt(r.endWeightLb,0)+' lb · injection fluid remaining '+fmt(r.injectionRemainingLb,1)+' lb'));
   for(const p of r.schedule)box.append(text('p',p.label+': '+fmt(p.fromFt,0)+' → '+fmt(p.toFt,0)+' ft · '+fmt(p.seconds/60,2)+' min','bench-note'));
   box.append(text('p',r.policy,'bench-note'));
  }api.climbs=results;
 });
 render();
})();
