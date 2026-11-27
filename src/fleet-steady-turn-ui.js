'use strict';

const FleetSteadyTurnUI=(()=>{
 function setup({M,T,L,data,api,text,appendTable,shortName,fmt}){
  const $=id=>document.getElementById(id),S=FleetSteadyTurn;
  const speed=$('steady-speed'),weight=$('steady-weight'),loading=$('steady-loading'),rating=$('steady-rating');
  const results=$('steady-results'),sources=$('steady-evidence'),sides=['a','b'];
  const fleetDetails=$('steady-fleet'),fleetTable=$('steady-fleet-table');
  let fleetKey='';
  let lastPair='',eas=210,lastUnit='';
  const link=(title,url)=>{const a=text('a',title);a.href=url;a.target='_blank';a.rel='noopener';return a;};
  const uncertainty={a:'Aircraft 1 leads throughout the tested ranges.',b:'Aircraft 2 leads throughout the tested ranges.',
   tie:'Both remain inside the practical tie margin.',uncertain:'The tested ranges do not establish a clear lead.',
   boundary:'At least one sensitivity case cannot sustain this turn.'};
  const status={'below-stall':'Below the modeled stall','no-sustained-turn':'Insufficient power or lift for a steady turn',
   'source-power-unavailable':'Power data unavailable','speed-domain-unavailable':'Outside the modeled speed range',
   'rating-time-exhausted':'Rating unavailable','invalid-condition':'Enter a positive airspeed','invalid-weight':'Enter a valid gross weight'};
  function sourceView(ids){
   sources.replaceChildren();
   const {ellis,finnish,simulation}=data.steadyEvidence;
   if(ids[0]!==ids[1]){
    const [left,right]=ids.map(id=>ellis.specimens.find(s=>s.profile===id));
    if(left&&right){
     const rows=left.points.flatMap(([kias,g])=>{
      const match=right.points.find(p=>p[0]===kias);
      return match?[[kias+' KIAS',fmt(g,1)+' g',fmt(match[1],1)+' g',fmt(g-match[1],1)+' g']]:[];
     });
     if(rows.length){
      sources.append(text('h4','Common speeds in the restored-aircraft flight test'));
      appendTable(sources,['Figure 9',left.name,right.name,'First minus second'],rows);
      sources.append(text('p','Measured normal loads at 10,000 ft MSL and METO. The authors report too much scatter to distinguish the P-47D, P-51D and FG-1D confidently. Each selected wartime profile differs from its test specimen.','bench-note'));
     }
    }
    const [first,second]=ids.map(id=>simulation.find(r=>r.profile===id));
    if(first?.replay&&second?.replay){
     const rows=first.replay.flatMap(a=>{
      const b=second.replay.find(b=>a.altM===b.altM&&a.iasKmh===b.iasKmh);
      return b?[[a.altM+' m',a.iasKmh+' km/h IAS',fmt(b.seconds-a.seconds,1)+' s',fmt(b.modelSeconds-a.modelSeconds,1)+' s']]:[];
     });
     sources.append(text('h4','Turn-time gap at the two published IL-2 conditions'));
     appendTable(sources,['Altitude','Airspeed','IL-2 (aircraft 2 − 1)','Model (aircraft 2 − 1)'],rows);
     sources.append(text('p','Positive seconds mean aircraft 1 completed the circle sooner. Each aircraft uses its own reported standard weight and rating.','bench-note'));
    }
   }
   for(const id of new Set(ids)){
    const card=text('details');card.append(text('summary',shortName(id)+' · evidence'));
    const specimen=ellis.specimens.find(s=>s.profile===id);
    if(specimen){
     const intro=text('p',specimen.name+' '+specimen.serial+', 10,000 ft MSL, METO. '+specimen.relation+'. ');intro.append(link('Ellis & Wheal, Figure 9',ellis.source));card.append(intro);
     appendTable(card,['Test speed','Measured normal load'],specimen.points.map(([kias,g])=>[kias+' KIAS',fmt(g)+' g']));
     card.append(text('p','Chart reading allowance ±2 kt and ±0.1 g. The authors report substantial scatter across three of the four aircraft.','bench-note'));
     if(id===ellis.proxyId){
      for(const row of ellis.proxy)card.append(text('p','At '+row.kias+' KIAS the model gives '+fmt(row.modeled.g,2)+' g versus '+fmt(row.g,1)+' g read. Assumptions: '+fmt(row.weightLb,0)+' lb takeoff mass, Normal power, standard atmosphere and IAS equal to CAS. Event weight and the installation differ or are unknown.'));
     }
    }
    if(id===finnish.id){
     const c=finnish.conditions;
     const p=text('p','MT-215 · '+c.headingChangeDeg+'° in '+c.elapsedSeconds+' s at '+c.altitudeM+' m, '+c.startKmh+' km/h IAS at entry and exit. A secondary transcription supplies the clock. The source-conditioned model gives '+fmt(finnish.cleanSeconds)+' s clean and '+fmt(finnish.openSeconds)+' s with open cooling. Intermediate speed and run mass are unknown. ');
     p.append(link('Finnish turn record',finnish.source[0].url));card.append(p);
    }
    if(!specimen&&id!==finnish.id)card.append(text('p','No quantitative powered steady-turn flight test linked to this profile.'));
    for(const sim of simulation.filter(r=>r.profile===id)){
     const p=text('p','External simulation · '+sim.aircraft+' · '+sim.relation+'. '+sim.rating+' power, '+sim.loading+'. ');p.append(link('IL-2 published specifications',sim.source));card.append(p);
     appendTable(card,['Altitude','Reported IAS','IL-2 turn time',...(sim.replay?['Model at test mass']:[])],sim.points.map(([h,v,s],i)=>[
      h+' m',v+' km/h',fmt(s)+' s',...(sim.replay?[fmt(sim.replay[i].modelSeconds)+' s']:[])]));
     if(sim.replay)card.append(text('p','Model uses '+sim.standardKg+' kg and '+sim.replay[0].rating+', with IAS approximated as CAS. External simulator comparisons share possible input sources.','bench-note'));
    }
    sources.append(card);
   }
  }
  function renderFleet(alt){
   if(!fleetDetails.open)return;
   const mode=rating.value==='normal'?'normal':'combat';
   const extension=$('bench-extension').checked;
   const key=[alt,eas,mode,extension].join('|');
   if(fleetKey===key)return;
   fleetKey=key;fleetTable.replaceChildren();
   if(!(Number.isFinite(eas)&&eas>0)){fleetTable.append(text('p','Enter a positive common speed.'));return;}
   fleetTable.append(text('p',fmt(alt,0)+' ft · '+fmt(eas)+' mph EAS · '+mode+' rating, 50% internal fuel, dry, clean cooling for every aircraft.'));
   appendTable(fleetTable,['Aircraft','Gross weight','Rate','360° time','Lift and drag inputs'],Object.keys(data.models).map(id=>{
    const r=S.point(M,T,L,data,id,{mode,fuelFraction:.5,extension},alt,eas);
    return [shortName(id),fmt(r.weightLb,0)+' lb',r.status==='steady'?fmt(r.rate,2)+'°/s':'—',
     r.status==='steady'?fmt(r.seconds)+' s':status[r.status]??r.status,
     (r.provisionalInputs?'Provisional intake':'Operating model')+(r.estimatedPower?' · extrapolated power':'')];
   }));
  }
  fleetDetails.addEventListener('toggle',()=>renderFleet(Number($('bench-altitude').value)));
  function render(){
   const selected=sides.map(side=>api.settings[side]),ids=selected.map(c=>c.id),key=ids.join('|');
   const unit=$('bench-speed-unit').value,factor=OperatingBenchmarkChart.speedFactor(unit);
   if(lastUnit!==unit){speed.value=Number.isFinite(eas)?Number((eas*factor).toFixed(2)):'';lastUnit=unit;}
   $('steady-speed-label').textContent='Common speed ('+({mph:'mph',kph:'km/h',knots:'kt'})[unit]+' EAS)';
   const specs=data.specification,alt=Number($('bench-altitude').value);
   renderFleet(alt);
   const range=S.commonRange(...ids.map(id=>S.loadingRange(specs.aircraft[id],specs.policy)));
   if(key!==lastPair){
    sourceView(ids);
    if(range)weight.value=Number(((range[0]+range[1])/2).toFixed(2));
    else weight.value='';
    lastPair=key;
   }
   const equal=loading.value==='equal';
   $('steady-weight-control').hidden=!equal;weight.disabled=!equal||!range;
   const low=range?Math.ceil(range[0]*100)/100:null,high=range?Math.floor(range[1]*100)/100:null;
   if(range){weight.min=low;weight.max=high;}
   const mass=equal?weight.valueAsNumber:undefined;
   $('steady-weight-note').textContent=equal?(range?'Shared gross-weight range '+fmt(low,2)+'–'+fmt(high,2)+' lb with 25–75% internal fuel in each profile.':'These aircraft have no overlapping gross weight with 25–75% internal fuel.'):'Each aircraft uses its selected fuel load. Gross weights are shown below.';
   results.replaceChildren();api.steadyTurn=null;
   if(equal&&(!range||!(mass>=range[0]&&mass<=range[1]))){results.append(text('p',range?'Choose a weight inside the shared range.':'An equal-weight comparison is unavailable.'));return;}
   if(!(Number.isFinite(eas)&&eas>0)){results.append(text('p','Enter a positive common speed.'));return;}
   const rows=selected.map(c=>{
    const settings=rating.value==='selected'?c.settings:{...c.settings,mode:rating.value,injection:false};
    return S.point(M,T,L,data,c.id,settings,alt,eas,mass);
   });
   const verdict=S.compare(...rows,data.sourceGrades.tolerances);
   api.steadyTurn={ids,rows,verdict,altFt:alt,easMph:eas};
   appendTable(results,['Aircraft','Gross weight','Power setting','Turn rate','360° time','Load','Limit'],rows.map((r,i)=>{
    const valid=r.status==='steady';
    return [shortName(ids[i]),fmt(r.weightLb,0)+' lb',r.rating??'—',valid?fmt(r.rate,2)+'°/s':'—',
     valid?fmt(r.seconds,1)+' s':'—',valid?fmt(r.g,2)+' g':'—',valid?r.limiting:status[r.status]??r.status];
   }));
   if(verdict.status==='compared'){
    const leader=verdict.lead==='tie'?'Within the practical tie margin':shortName(ids[verdict.lead==='a'?0:1])+' leads';
    results.prepend(text('p',leader+' · '+fmt(Math.abs(verdict.rateGap),2)+'°/s apart, '+fmt(Math.abs(verdict.secondsGap),1)+' s per 360°.','bench-time-verdict'));
    results.append(text('p',uncertainty[verdict.ordering]+' The practical margin is '+fmt(verdict.margin)+'°/s.'+
     (verdict.bounds?' Aircraft 1 minus aircraft 2 spans '+fmt(verdict.bounds[0],2)+' to '+fmt(verdict.bounds[1],2)+'°/s.':''),'bench-note'));
   }
   if(rows.some(r=>r.provisionalInputs))results.append(text('p','Includes a profile with provisional maneuver lift or drag.','bench-note'));
   if(rows.some(r=>r.estimatedPower))results.append(text('p','Includes extrapolated engine power.','bench-note'));
   if(rows.some(r=>r.wholeCircleAtRating===false))results.append(text('p','A rating expires before a full circle. Its 360° time is an equivalent time at the initial rate.','bench-note'));
  }
  speed.addEventListener('input',()=>{eas=speed.valueAsNumber/OperatingBenchmarkChart.speedFactor($('bench-speed-unit').value);render();});
  weight.addEventListener('input',render);
  loading.addEventListener('change',render);rating.addEventListener('change',render);
  return {render};
 }
 return {setup};
})();
