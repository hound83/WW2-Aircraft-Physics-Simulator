(function(){'use strict';
const U=window.UniversalFourAircraftUI,S=window.UniversalModelSupport,M=U.model,D=U.data,$=id=>document.getElementById(id),audit=JSON.parse($('robustness-data').textContent);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=x=>Number.isFinite(x)?x.toLocaleString('en-US',{maximumFractionDigits:1}):'Unavailable';
function render(){
 const c=U.conditions(),ids=Object.keys(D.aircraft),validAlt=Number.isFinite(c.alt)&&c.alt>=0&&c.alt<=36089;
 const tas=validAlt?M.tasFrom(c.speed,'EAS',c.alt):NaN;
 const rows=ids.map(id=>{const ac=D.aircraft[id];let options;try{options=U.optionsFor(id,c);}catch(e){options={profile:c.profile,rating:ac.defaultRating};}
  return {id,comparisonPolicy:'native-reference-weight-and-selected-rating',...S.assess(M,ac,{altFt:c.alt,tasMph:tas,options,scenarioKind:id==='bf109f4'&&$('f4scenario').value!=='global'?'nonhistorical':'reference'})};});
 const table='<table><thead><tr><th>Aircraft / rating</th><th>Calculation coverage</th><th>Current weight</th><th>Specific excess power as ft/min</th><th>Evidence</th></tr></thead><tbody>'+rows.map(r=>'<tr data-aircraft="'+r.id+'"><td>'+esc(D.aircraft[r.id].name)+' / '+esc(r.rating)+'</td><td>'+esc(r.calculationStatus)+'<br>'+esc(r.flightStatus||'')+'<br>'+esc(r.reason)+'</td><td>'+n(r.weightLb)+' lb</td><td>'+n(r.climbFpm)+'</td><td>'+esc(r.evidenceStatus)+'</td></tr>').join('')+'</tbody></table>';
 $('supportTable').innerHTML=table;
 $('conditions').textContent='Profile '+c.profile+'; engine mode '+c.engineMode+'. Current Bf 109 scenario: '+$('f4scenario').value+'. P uses fitted aircraft e values scaled by the shared control. Each aircraft retains its reference weight scaled by the weight control. Spitfire speed reference is 7110 lb; report climb used 7485 lb. Turn/stall results remain provisional.';
 const pairwise=S.pairs(rows);$('supportPairs').innerHTML='<h3>Scenario differences, A minus B</h3><p>Same altitude and airspeed; each aircraft retains its reference weight and selected rating. Simulator/worksheet Bf 109 scenarios are excluded. These are calculated excess-power differences, not measured climb differences or 5:1 proof.</p><table><thead><tr><th>A / B</th><th>Difference, ft/min</th><th>Status</th></tr></thead><tbody>'+pairwise.map(p=>'<tr><td>'+esc(p.a)+' / '+esc(p.b)+'</td><td>'+n(p.deltaClimbFpm)+'</td><td>'+esc(p.status)+'</td></tr>').join('')+'</tbody></table>';
 const band=S.bands(audit,{altFt:c.alt,rating:$('p51mode').value});
 const bandText=band.status==='scenario-range'?n(band.minClimbFpm)+' to '+n(band.maxClimbFpm)+' ft/min across '+band.samples+' chart-power/weight scenarios at '+band.altFt+' ft and '+esc(band.rating)+'. '+esc(band.configuration)+'. '+esc(band.qualification):esc(band.reason)+'. Choose an exact P-51B source node below to inspect its range.';
 $('supportRange').innerHTML='<h3>Mustang chart-power scenario range (fixed profile P reference)</h3><p>These archived P ranges retain the v2.8 fitted settings and their own scenario masses; they do not follow the profile, e or weight sliders.</p><p>'+bandText+'</p>';
 const selected=$('supportNode').value,[altFt,rating]=selected.split('|'),named=S.bands(audit,{altFt:+altFt,rating});
 $('supportNodeRange').textContent=n(named.minClimbFpm)+' to '+n(named.maxClimbFpm)+' ft/min; assumed masses '+named.weightsLb.join('/')+' lb; lower/midpoint/upper assigned BHP. Low blower, 3000 RPM, report climb configuration. Optimized climb, not current fixed-speed power. Scenario range, not historical error bounds.';
 window.UniversalReleaseSupport={rows,pairwise,currentRange:band,selectedRange:named,render};
}
for(const el of document.querySelectorAll('input,select')){el.addEventListener('input',render);el.addEventListener('change',render);}render();
})();
