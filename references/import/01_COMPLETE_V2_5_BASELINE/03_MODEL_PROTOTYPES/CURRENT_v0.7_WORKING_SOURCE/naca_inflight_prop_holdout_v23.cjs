// Unfitted OUT-OF-SAMPLE flight-propeller check; separate P-47D from modeled P-47B.
// NACA MR L5G09a, Gardner, July 1945, original Table I/II:
// https://ntrs.nasa.gov/citations/19930093653
// Measurements are P-47D Hamilton Standard 6507A-2 THREE-blade (12'10"),
// not P-47B four-blade; no tuning or corrections are based on these points.
const fs=require('fs'), path=require('path'), M=require('./physics.js');
const rows=[
  {table:'I climb',run:'3-1',J:.920,Cp:.107,eta:.778,tipMach:.811},
  {table:'I climb',run:'3-10',J:1.128,Cp:.171,eta:.795,tipMach:.869},
  {table:'I climb',run:'3-14',J:1.239,Cp:.205,eta:.799,tipMach:.901},
  {table:'I climb',run:'5-1',J:.974,Cp:.150,eta:.786,tipMach:.869},
  {table:'I climb',run:'5-4',J:1.128,Cp:.200,eta:.791,tipMach:.912},
  {table:'I climb',run:'5-8',J:1.273,Cp:.250,eta:.798,tipMach:.948},
  {table:'II fast',run:'5-29',J:1.152,Cp:.184,eta:.761,tipMach:.910},
  {table:'II fast',run:'5-26',J:1.945,Cp:.185,eta:.814,tipMach:.996},
  {table:'II fast',run:'5-24',J:2.486,Cp:.175,eta:.664,tipMach:1.079},
  {table:'II fast',run:'5-12',J:2.252,Cp:.245,eta:.760,tipMach:1.084},
  {table:'II fast',run:'15-24',J:1.694,Cp:.246,eta:.819,tipMach:1.052},
  {table:'II fast',run:'17-19',J:1.845,Cp:.256,eta:.852,tipMach:1.020}
];
const readings=rows.map(p=>{
  const n=M.nacaLowSpeedPropChart(3,p.J,p.Cp),pred=n?.eta;
  return {...p,etaNaca1941Graph:pred,errorEta:pred-p.eta,
    outsideGraphCp:!n?.chartWithinCp,highTipMachUnmodeled:p.tipMach>.92,
    provenance:'NACA MR L5G09a, original table '+p.table.slice(0,2)+', run '+p.run};
});
const calc=list=>({count:list.length,MAEEfficiency:list.reduce((s,p)=>s+Math.abs(p.errorEta),0)/list.length,
   biasEfficiency:list.reduce((s,p)=>s+p.errorEta,0)/list.length});
const result={report:'https://ntrs.nasa.gov/citations/19930093653',
  period:'July 1945',variant:'P-47D three-bladed Hamilton Standard 6507A-2 (NOT P-47B)',
  scientificStatus:'INDEPENDENT AIRCRAFT FLIGHT TEST HOLDOUT, not a simulation target or a model fit',
  originalMeasurements:'J, Cp, eta, tip Mach from published Table I/II; selected 12 legible runs',
  tested1941Chart:'1941 low-speed research charts only; NO Mach-dependent compressibility, actual blade geometry or spinner/installation correction',
  overall:calc(readings),lowSpeedClimb:calc(readings.filter(x=>x.table==='I climb')),
  highSpeed:calc(readings.filter(x=>x.table==='II fast')),
  withinGraphPowerDomain:calc(readings.filter(x=>!x.outsideGraphCp)),
  measurements:readings};
if(require.main===module){
 if(process.argv.includes('--write'))fs.writeFileSync(path.join(__dirname,'naca_inflight_prop_holdout_results_v23.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({overall:result.overall,climb:result.lowSpeedClimb,fast:result.highSpeed,withinCp:result.withinGraphPowerDomain,
 examples:readings.slice(0,6).map(r=>({run:r.run,etaObserved:r.eta,eta1941:r.etaNaca1941Graph,tipMach:r.tipMach}))},null,2));
}
module.exports=result;
