'use strict';
(()=>{
 const $=id=>document.getElementById(id),B=OperatingBenchmark,M=UniversalAirPhysics,T=UniversalTurnLift,L=JSON.parse($('turn-lift-source').textContent);
 const data=JSON.parse($('benchmark-operating-data').textContent),{models,specification:specs}=data;
 const fmt=(x,n=1)=>Number.isFinite(x)?x.toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n}):'—';
 const api=globalThis.OperatingBenchmarkUI={data,settings:{},rows:{},climbs:null};
 for(const side of ['a','b'])for(const [id,m]of Object.entries(models))$('bench-aircraft-'+side).add(new Option(m.ac.name.split(' / ')[0],id));
 $('bench-aircraft-a').value='p51b';$('bench-aircraft-b').value='spitfire_lfix_bs543';
 const text=(tag,value,className)=>{const e=document.createElement(tag);e.textContent=value;if(className)e.className=className;return e;};
 function read(side){const id=$('bench-aircraft-'+side).value,spec=specs.aircraft[id],input=$('bench-injection-'+side),combat=$('bench-power-'+side).value==='combat';
  input.disabled=!spec.injection||!combat;if(input.disabled)input.checked=false;
  $('bench-injection-label-'+side).textContent=spec.injection?(spec.injection.type+(combat?'':' · Combat only')):'Injection not fitted';
  return {id,settings:{mode:combat?'combat':'normal',fuelFraction:Number($('bench-fuel-'+side).value),injection:input.checked,extension:$('bench-extension').checked}};
 }
 function number(label,value,detail){const e=document.createElement('div');e.className='bench-number';e.append(text('span',label),text('strong',value),text('small',detail));return e;}
 function renderSide(side,chosen,alt){const model=models[chosen.id],spec=specs.aircraft[chosen.id],r=B.metrics(M,T,L,model,spec,specs.policy,chosen.settings,alt);
  api.rows[side]=r;api.settings[side]=chosen;
  $('bench-title-'+side).textContent='Aircraft '+(side==='a'?'1':'2')+' · '+fmt(alt,0)+' ft';
  $('bench-setting-'+side).textContent=(chosen.settings.mode==='combat'?'COMBAT':'NORMAL')+' · '+fmt(chosen.settings.fuelFraction*100,0)+'% FUEL · '+(chosen.settings.injection?spec.injection.type.toUpperCase():'DRY');
  const box=$('bench-result-'+side);box.replaceChildren();
  box.append(text('p',r.phase.label+' · '+(r.phase.seconds?fmt(r.phase.seconds/60,1)+' min limit':'no timed limit in selected profile')));
  box.append(text('p',fmt(r.loading.weightLb,0)+' lb · '+fmt(r.loading.fuelUSGal,1)+' US gal internal · '+spec.armament,'bench-note'));
  box.append(text('p',spec.ratingEvidence??'Source-based settings; installed-power and load reconstruction remain model estimates.','bench-note'));
  if(r.status==='source-power-unavailable'){box.append(text('p','Power source does not cover this altitude. Enable labelled estimates to inspect a pressure-lapse scenario.','bench-warning'));return;}
  if(r.status!=='modelled')box.append(text('p','This model cannot sustain level flight at this load, power and altitude.','bench-warning'));
  if(r.sustained?.estimatedPower||r.level?.estimatedPower||r.climb?.estimatedPower)box.append(text('p','High-altitude power estimate beyond the last source node.','bench-warning'));
  const grid=document.createElement('div');grid.className='bench-numbers';
  grid.append(number('Maximum sustained turn',fmt(r.sustained?.rateDegSec)+'°/s',fmt(r.sustained?.seconds360)+' s / 360° · '+fmt(r.sustained?.easMph,0)+' mph EAS'),
   number('Sustained load / radius',fmt(r.sustained?.g,2)+' g',fmt(r.sustained?.radiusM,0)+' m radius at peak rate'),
   number('Best climb rate',fmt(r.climb?.climbFpm,0)+' ft/min','Vy '+fmt(r.climb?.easMph,0)+' mph EAS / '+fmt(r.climb?.tasMph,0)+' TAS'),
   number('Maximum level speed',fmt(r.level?.tasMph,0)+' mph TAS',fmt(r.level?.easMph,0)+' mph EAS · steady equilibrium'),
   number('Minimum sustained radius',fmt(r.minSustainedRadius?.radiusM,0)+' m','At '+fmt(r.minSustainedRadius?.easMph,0)+' mph EAS'),
   number('Instantaneous turn scenario',fmt(r.instantaneous?.rateDegSec)+'°/s',fmt(r.instantaneous?.seconds360)+' s / 360° at '+fmt(r.instantaneous?.easMph,0)+' mph EAS; 7g cap, energy may be lost'));
  box.append(grid,text('p','At scheduled climb speed: '+fmt(r.manualClimb?.climbFpm,0)+' ft/min at '+fmt(r.manualClimb?.iasMph,0)+' mph IAS≈CAS.','bench-note'));
 }
 function plot(alt){const colors=['#75dbff','#ffc077'],sets=['a','b'].map(side=>{const c=api.settings[side],m=models[c.id],sp=specs.aircraft[c.id],w=api.rows[side].loading.weightLb,p=api.rows[side].phase;
   return Array.from({length:39},(_,i)=>{const eas=90+i*5,r=B.evaluate(M,T,L,m,sp,c.settings,alt,eas,w,p);return {eas,rate:r.status==='modelled'?r.limits?.sustDegSec:null};});});
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 780 280');svg.setAttribute('role','img');svg.setAttribute('aria-label','Sustained turn at the shared altitude, with independent aircraft power and fuel');
  const peak=Math.max(10,...sets.flatMap(s=>s.map(p=>p.rate).filter(Number.isFinite))),x=v=>55+(v-90)*680/190,y=v=>230-v/peak*190;
  const add=(tag,attrs,value)=>{const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(value)e.textContent=value;svg.append(e);};
  for(const speed of [100,150,200,250]){add('line',{x1:x(speed),x2:x(speed),y1:30,y2:230,stroke:'#425b6b'});add('text',{x:x(speed),y:250,fill:'currentColor','text-anchor':'middle'},String(speed));}
  for(const rate of [0,peak/2,peak])add('text',{x:42,y:y(rate)+4,fill:'currentColor','text-anchor':'end'},fmt(rate));
  sets.forEach((set,i)=>{let path='',move=true;for(const p of set){if(!Number.isFinite(p.rate)){move=true;continue;}path+=(move?'M':'L')+x(p.eas)+','+y(p.rate);move=false;}add('path',{d:path,fill:'none',stroke:colors[i],'stroke-width':3});});
  add('text',{x:55,y:20,fill:'currentColor'},'Sustained turn °/s at '+fmt(alt,0)+' ft');add('text',{x:390,y:275,fill:'currentColor','text-anchor':'middle'},'Speed · mph EAS');$('bench-turn-plot').replaceChildren(svg);
 }
 function sourceDetails(){const box=$('bench-sources');box.replaceChildren();for(const side of ['a','b']){const c=api.settings[side],sp=specs.aircraft[c.id];box.append(text('h3',models[c.id].ac.name),text('p',sp.loadQualification),text('p',api.rows[side].powerQualification),text('p',sp.speedQualification));for(const id of sp.sources){const src=specs.sources[id],p=document.createElement('p'),a=document.createElement('a');a.href=src.url;a.textContent=src.title;a.target='_blank';a.rel='noopener';p.append(a,text('small',' · '+src.kind+' · '+src.facts));box.append(p);}}}
 function render(){const alt=Number($('bench-altitude').value);for(const side of ['a','b'])renderSide(side,read(side),alt);plot(alt);sourceDetails();api.climbs=null;$('bench-climb-result').replaceChildren(text('p','Settings updated. Calculate both climbs for the current choices.'));
  const a=api.rows.a.sustained?.rateDegSec,b=api.rows.b.sustained?.rateDegSec;
  $('bench-comparison').textContent=Number.isFinite(a)&&Number.isFinite(b)?'Modeled sustained-turn difference (aircraft 1 − aircraft 2): '+fmt(a-b,2)+'°/s. Historical ranking uncertainty remains unresolved.':'A sustained-turn comparison is unavailable for one or both selected states.';
 }
 for(const id of ['bench-altitude','bench-extension',...['a','b'].flatMap(s=>['aircraft','power','fuel','injection'].map(k=>'bench-'+k+'-'+s))])$(id).addEventListener('change',render);
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
