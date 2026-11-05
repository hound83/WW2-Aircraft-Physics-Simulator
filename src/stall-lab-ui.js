'use strict';
(function(){
const $=id=>document.getElementById(id),M=window.UniversalAirPhysics,F=window.UniversalStallLab,D=JSON.parse($('cases').textContent),R=JSON.parse($('stall-research-data').textContent),source=R.sources.find(s=>s.id==='naca-tn1044');
const n=v=>Number.isFinite(v)?v.toFixed(1):'Unavailable',esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const weightInputs={p51b:'stall-weight',p47b:'stall-weight-p47b',bf109f4:'stall-weight-bf109f4',spitfire_lfix_bs543:'stall-weight-spitfire_lfix_bs543'};
const inputNumber=id=>$(id).valueAsNumber;
function chart(weightLb){
 const rows=[5100,6000,7000,8000,9000,9300].map(altFt=>({altFt,samples:[1.40,1.45,1.48].map(sourceClMax=>F.p51Candidate(M,D.aircraft.p51b,source,{altFt,weightLb,sourceClMax}))}));
 const supported=rows.filter(r=>r.samples.every(s=>s.status==='source-informed-candidate'));if(!supported.length)return {rows,svg:'<p>No supported candidate curve at this weight.</p>'};
 const values=supported.flatMap(r=>r.samples.map(s=>s.air.easMph)),lo=Math.min(...values)-2,hi=Math.max(...values)+2,x=a=>60+(a-5100)/4200*640,y=v=>180-(v-lo)/(hi-lo)*140;
 let svg='<svg viewBox="0 0 760 240" role="img" aria-label="P-51B candidate EAS and CAS across the declared altitude window"><rect x="60" y="30" width="640" height="150" fill="#11232c" stroke="#46606d"/>';
 for(let j=0;j<3;j++){const pts=supported.map(r=>x(r.altFt)+','+y(r.samples[j].air.easMph));svg+='<path d="M'+pts.join(' L')+'" fill="none" stroke="'+(j===1?'#64cbf4':'#f2ba68')+'" stroke-width="'+(j===1?'3':'1.5')+'"/>';}
 const cas=supported.map(r=>x(r.altFt)+','+y(r.samples[1].air.casMph));svg+='<path d="M'+cas.join(' L')+'" fill="none" stroke="#d8e1e8" stroke-dasharray="5 4"/>';
 svg+='<g fill="#d8e1e8" font-size="13"><text x="12" y="40">'+n(hi)+'</text><text x="12" y="180">'+n(lo)+'</text><text x="60" y="201">5,100 ft</text><text x="640" y="201">9,300 ft</text><text x="60" y="227">Blue: nominal EAS; amber: bracket; dashed: nominal CAS. Speeds in mph.</text></g></svg>';
 return {rows,svg};
}
function render(){
 const altFt=inputNumber('stall-alt'),sourceClMax=Number($('stall-cl').value);
 const weightsLb=Object.fromEntries(Object.entries(weightInputs).map(([id,input])=>[id,inputNumber(input)]));
 const weightLb=weightsLb.p51b;
 const candidate=F.p51Candidate(M,D.aircraft.p51b,source,{altFt,weightLb,sourceClMax});
 const targets=F.targets(M,D,R,altFt,weightsLb);
 $('stall-input-status').textContent=targets.every(r=>r.model)?'Model estimates in mph at '+altFt.toLocaleString()+' ft.':
  'Enter an altitude from 0 to 35,000 ft and weights from 1,000 to 20,000 lb. Results for invalid inputs are unavailable.';
 $('stall-targets').innerHTML='<table><thead><tr><th scope="col">Fighter</th><th scope="col">EAS</th><th scope="col">CAS</th><th scope="col">TAS</th><th scope="col">Historical corrected stall</th></tr></thead><tbody>'+
  targets.map(r=>'<tr><th scope="row">'+esc(r.name)+'</th>'+['easMph','casMph','tasMph'].map(key=>'<td>'+n(r.model?.[key])+'</td>').join('')+
   '<td><strong>Unresolved</strong> · '+esc(r.finding)+'</td></tr>').join('')+'</tbody></table>';
 $('stall-status').className=candidate.status==='unavailable'?'stall-unavailable':'';$('stall-status').textContent=candidate.status==='unavailable'?candidate.reason:candidate.qualification;
 $('stall-metrics').innerHTML=candidate.air?[['Candidate EAS',candidate.air.easMph],['Candidate CAS',candidate.air.casMph],['Candidate TAS',candidate.air.tasMph],['Current model EAS',candidate.baselineEasMph],['Change in EAS',candidate.deltaEasMph]].map(([label,v])=>'<div><strong>'+n(v)+' mph</strong>'+label+'</div>').join(''):'<p>No candidate number is displayed outside its declared source window.</p>';
 const plot=chart(weightLb);$('stall-chart').innerHTML=plot.svg;
 const correction=F.correct(M,R,$('stall-correction').value,inputNumber('stall-ias'),inputNumber('stall-correction-alt'));
 $('stall-correction-result').textContent=correction.status==='manual-cas-conversion'?n(correction.iasMph)+' IAS → '+n(correction.casMph)+' CAS → '+n(correction.easMph)+' EAS; '+n(correction.tasMph)+' TAS (mph). '+correction.method:correction.status==='position-only'?'Position-corrected indication: '+n(correction.positionCorrectedMph)+' mph. '+correction.reason:correction.status==='band-boundary-ambiguous'?'Position-corrected range: '+correction.positionCorrectedRangeMph.map(n).join('–')+' mph. '+correction.reason:correction.reason;
 const ids=['naca-tn1044','rae-aero1106','ap2025g-mustangiii','to1f51d1','ap1565jpl-1946'];$('stall-sources').innerHTML=ids.map(id=>{const s=R.sources.find(r=>r.id===id);return '<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.title||id)+'</a>';}).join(' · ');
 window.UniversalStallLabUI={candidate,targets,correction,chartRows:plot.rows,render};
}
for(const e of $('stall-lab').querySelectorAll('input,select')){e.addEventListener('input',render);e.addEventListener('change',render);}
$('stall-reset').addEventListener('click',()=>{
 $('stall-alt').value=8000;
 for(const [id,input] of Object.entries(weightInputs))$(input).value=D.aircraft[id].weightLb;
 $('stall-cl').value=1.45;
 render();
});
render();
})();
