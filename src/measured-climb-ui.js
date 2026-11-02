(function(){'use strict';
const $=id=>document.getElementById(id),M=window.UniversalAirPhysics,F=window.UniversalMeasuredClimb,C=window.UniversalClimbConditions,Q=window.UniversalSourceConfiguration,D=window.UniversalFourAircraftUI.data;
const L=JSON.parse($('measured-climb-source').textContent),old=JSON.parse($('climb-condition-model').textContent),model=JSON.parse($('source-configuration-model').textContent),report=JSON.parse($('source-configuration-report').textContent);
const n=x=>Number.isFinite(x)?x.toFixed(1):'Unavailable',esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function chart(rows,before){
 const observed=L.states.map(s=>({altFt:s.altFt,predictedFpm:s.observedFpm})),all=[...rows,...before,...observed],ceiling=Math.ceil(Math.max(...all.map(r=>r.predictedFpm))/500)*500,floor=Math.min(0,Math.floor(Math.min(...all.map(r=>r.predictedFpm))/500)*500),h=300,x=a=>60+a/35000*810,y=v=>h-40-(v-floor)/(ceiling-floor)*(h-65);
 const path=points=>points.map((r,i)=>(i?'L':'M')+x(r.altFt).toFixed(1)+','+y(r.predictedFpm).toFixed(1)).join(' ');
 let svg='<svg viewBox="0 0 900 300" role="img" aria-label="Reported climb, previous model and selected model at exact report altitudes" style="width:100%;height:auto;min-width:520px;color:inherit">';
 for(let value=floor;value<=ceiling;value+=500)svg+='<line x1="60" x2="870" y1="'+y(value)+'" y2="'+y(value)+'" stroke="currentColor" opacity=".15"/><text x="50" y="'+(y(value)+4)+'" fill="currentColor" text-anchor="end" font-size="12">'+value+'</text>';
 for(const alt of [0,10000,20000,30000,35000])svg+='<text x="'+x(alt)+'" y="282" fill="currentColor" text-anchor="middle" font-size="12">'+alt.toLocaleString('en-US')+'</text>';
 svg+='<text x="65" y="14" fill="currentColor" font-size="12">Climb ft/min</text><text x="870" y="298" fill="currentColor" text-anchor="end" font-size="12">Altitude ft</text>';
 for(const [points,color,dash] of [[before,'#f2ba68','6 4'],[observed,'#d8e1e8',''],[rows,'#64cbf4','']])svg+='<path d="'+path(points)+'" fill="none" stroke="'+color+'" stroke-width="2.5" stroke-dasharray="'+dash+'"/>';
 for(const r of rows){const xx=x(r.altFt),yy=y(r.predictedFpm),fit=model.fitStateIds.includes(r.stateId);svg+=(fit?'<circle cx="'+xx+'" cy="'+yy+'" r="4" fill="#11232c" stroke="#64cbf4" stroke-width="2"/>':'<rect x="'+(xx-4)+'" y="'+(yy-4)+'" width="8" height="8" fill="#64cbf4"/>');}
 return svg+'</svg>';
}
function render(){
 const mode=$('measured-drag').value,scenario={weightLb:Number($('measured-weight').value),retainedPowerScale:Number($('measured-prop').value)},a=D.aircraft.p47b;
 const before=L.states.map(s=>F.evaluate(M,a,L,s.id,{...scenario,deltaCd0:old.aircraft.p47b.deltaCd0}));
 const rows=L.states.map(s=>mode==='calibrated'?Q.evaluate(M,F,C,a,L,s.id,model,scenario):F.evaluate(M,a,L,s.id,{...scenario,deltaCd0:mode==='transferred'?old.aircraft.p47b.deltaCd0:0}));
 const checks=rows.filter(r=>!model.fitStateIds.includes(r.stateId)),oldChecks=before.filter(r=>!model.fitStateIds.includes(r.stateId)),mae=rs=>rs.reduce((s,r)=>s+Math.abs(r.errorFpm),0)/rs.length;
 const currentMae=mae(checks),previousMae=mae(oldChecks),high=rows.at(-1),nominal=scenario.weightLb===12565&&scenario.retainedPowerScale===1;
 $('measured-status').textContent=(mode==='calibrated'?'New source-matched configuration model.':mode==='transferred'?'v3.3 drag transferred from aircraft 41-5931.':'Clean polar only: omits extra open-cooling drag.')+' '+(nominal?'Nominal gross-test-mass scenario.':'Sensitivity scenario; fixed coefficients, not a source correction.');
 $('measured-metrics').innerHTML='<div><strong>'+n(previousMae)+' → '+n(currentMae)+'</strong><span>Reserved-row mean error, ft/min</span></div><div><strong>'+n(high.predictedFpm)+' / '+high.observedFpm+'</strong><span>35,000-ft model / report, ft/min</span></div><div><strong>'+report.acceptance.improvedStressCases+' / 9</strong><span>Paired scenarios improved by the accepted model</span></div>';
 $('measured-chart').innerHTML=chart(rows,before);
 $('measured-table').innerHTML='<table><thead><tr><th>Altitude / rating</th><th>BHP / engine RPM</th><th>Report climb</th><th>v3.3</th><th>Selected model</th><th>Residual</th><th>Role</th></tr></thead><tbody>'+rows.map((r,i)=>'<tr><td>'+r.altFt.toLocaleString('en-US')+' ft / '+esc(L.states[i].rating)+'</td><td>'+r.shaftHp+' / '+r.engineRpm+'</td><td>'+n(r.observedFpm)+'</td><td>'+n(before[i].predictedFpm)+'</td><td>'+n(r.predictedFpm)+'</td><td>'+n(r.errorFpm)+'</td><td>'+(model.fitStateIds.includes(r.stateId)?'Fitted':'Reserved check')+'</td></tr>').join('')+'</tbody></table>';
 window.UniversalMeasuredClimbUI={rows,before,mode,scenario,checkMae:currentMae,model,render};
}
for(const id of ['measured-drag','measured-weight','measured-prop'])$(id).addEventListener('change',render);
$('measured-reset').addEventListener('click',()=>{$('measured-drag').value='calibrated';$('measured-weight').value='12565';$('measured-prop').value='1';render();});render();
})();
