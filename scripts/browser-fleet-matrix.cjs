'use strict';
// This function runs inside the released page through Chromium's Runtime.evaluate.
module.exports=function fleetRow(left){
 const $=id=>document.getElementById(id);
 function select(id,value){
  const n=$(id);if(n.value===value)return;n.value=value;
  if(n.value!==value)throw Error('Missing '+id+' option '+value);
  n.dispatchEvent(new Event('change',{bubbles:true}));
 }
 function check(id,v){const n=$(id);if(n.checked!==v){n.checked=v;n.dispatchEvent(new Event('change',{bubbles:true}));}}
 select('bench-aircraft-filter','all');select('bench-altitude','10000');
 for(const s of ['a','b']){select('bench-power-'+s,'combat');select('bench-fuel-'+s,'0.5');select('bench-cooling-'+s,'clean');check('bench-injection-'+s,false);}
 check('bench-extension',false);select('bench-aircraft-a',left);
 const specs=globalThis.OperatingBenchmarkUI.data.specification.aircraft,checks=[];
 function sides(kind,attr){return [...$('bench-'+kind+'-plot').querySelectorAll('g['+attr+']')]
  .filter(g=>[...g.querySelectorAll('path[d]')].some(p=>p.getAttribute('d').includes('L'))).map(g=>g.getAttribute(attr)).sort().join('');}
 for(const right of Object.keys(specs).filter(id=>id!==left)){
  select('bench-aircraft-b',right);
  const target=(specs[left].performanceIntake?'':'a')+(specs[right].performanceIntake?'':'b');
  const turn=sides('turn','data-bench-curve'),climb=sides('climb','data-bench-climb-curve'),acc=sides('acceleration','data-bench-acceleration-curve');
  const advantage=Boolean($('bench-advantage-plot').querySelector('svg'));
  if(turn!==target||climb!=='ab'||acc!=='ab'||advantage!==(target==='ab'))
   throw Error([left,right,'turn',turn,'expected',target,'climb',climb,'acceleration',acc,'advantage',advantage].join(' '));
  checks.push({left,right,turn:turn.length});
 }
 return checks;
};
