'use strict';
// v2.5: new contemporary flight-test constraint. Historical data FIRST.
// No source-less corrections promoted to the universal solver.
const fs=require('node:fs'),path=require('node:path');
const M=require('../../src/physics.js'),D=require('../../aircraft/cases.json');
const evidence=require('../../references/import/01_COMPLETE_V2_5_BASELINE/06_SOURCE_AND_SCIENTIFIC_EVIDENCE/NACA_1934_1946_DEEP_RESEARCH/P47C_Curtiss_714_Source_Data_v25.json');
const round=(x,d=4)=>Number(x.toFixed(d));
function etaFromCoefficients(J,Ct,Cp){
 if(!(Number.isFinite(J)&&J>=0&&Ct>=0&&Cp>0))return null;
 return J*Ct/Cp;
}
function researchBaseline(J,Cp,tipMach,mode='C'){
 const base=.83*Math.exp(-.075*Math.pow((J-1.65)/.8,2)-.04*Math.pow((Cp-.36)/.85,2))*Math.exp(-.26*Math.pow(Math.max(0,tipMach-.92),2));
 if(mode==='C')return base;
 const chart=M.nacaLowSpeedPropChart(4,J,Cp);
 if(!chart||!chart.chartWithinCp)return null; // NO hidden Cp clamping in scored data
 return mode==='N'?chart.eta:M.nacaMachResearch(tipMach,chart.eta)?.eta??null;
}
const pointChecks=evidence.provisionalRunLabels.map(r=>{
 const inferred=etaFromCoefficients(r.J,r.Ct,r.Cp);
 const C=researchBaseline(r.J,r.Cp,r.tipMach,'C');
 const N=researchBaseline(r.J,r.Cp,r.tipMach,'N');
 const MM=researchBaseline(r.J,r.Cp,r.tipMach,'M');
 return {...r,etaFromReportedCoefficients:round(inferred),coefficientIdentityResidual:round(inferred-r.etaReportedOCR),
  modelC:round(C),modelN:N===null?null:round(N),modelM:MM===null?null:round(MM),
  errorC:round(C-r.etaReportedOCR),domainStatus:N===null?'1941 NACA chart Cp outside documented 0.2..0.6, N/M not scored':'inside provisional NACA 1941 grid'};
});
const p47c=JSON.parse(JSON.stringify(D.aircraft.p47b));
p47c.propGeometry={bladeCount:4,diameterFt:evidence.propeller.diameterFt,
 reductionRatioEnginePerProp:2,engineRpmByRating:{military:2700,normal:2550}};
const ladder=[];
for (const altFt of [5000,10000,15000,20000]){
 const rows=[];
 for(const [mode,rating,bhp,ias] of [['military165','military',2000,165],['normal160','normal',1625,160],['normal165','normal',1625,165]]){
  const tas=M.trueFromCAS(ias,altFt); // IAS=CAS PROXY, not observed correction!
  const C=M.propEta(p47c,altFt,tas,bhp,'C',rating);
  const N=M.propEta(p47c,altFt,tas,bhp,'N',rating);
  const Nscorable=N?.chartWithinCp?N.eta:null;
  rows.push({mode,rating,altFt,iasMph:ias,tasMphProxy:round(tas,2),bhpAssumed:bhp,
    etaC:round(C.eta),etaNStrict:Nscorable===null?null:round(Nscorable),
    chartNWithinCp:!!N?.chartWithinCp,J:round(C.J),Cp:round(C.Cp),tipMach:round(C.tipMach)});
 }
 const mil=rows[0],nor=rows[2];
 const relC=1-mil.etaC/nor.etaC;
 const relN=mil.etaNStrict===null||nor.etaNStrict===null?null:1-mil.etaNStrict/nor.etaNStrict;
 ladder.push({altFt,rows,measuredReportedLossRelativePct:[5,8],
   modeledLossRelativePctC:round(100*relC,2),
   modeledLossRelativePctNStrict:relN===null?null:round(100*relN,2),
   modelCWithinMeasured5to8Percent:relC>=.05&&relC<=.08,
   note:'Source flight-test loss reported across climb altitude, not a precise pointwise bound; this scenario uses constant representative rated BHP at every altitude and IAS=CAS.'});
}
const results={version:'v2.5 P47C source-first audit',sourceReport:evidence.source,sourceAccess:evidence.textProvenance,
 interpretation:'The P-47C has the same Curtiss 714-1C2-12 blade *design* as the P-47B test specimen; not guaranteed same installed power/drag/position error. This is NOT yet a direct flight-test match.',
 pointChecks,operatingConditionDiagnostic:ladder,
 highSpeedRowsScored:pointChecks.filter(r=>r.power==='high-speed test').length,
 criticalFindings:[
 'C power/advance curve reproduces some OCR run η better than others; generic Cp mapping is not validated for 714 blade.',
 'The measured climb efficiency loss with increased power is much larger than the difference currently produced by C in these representative power/RPM scenarios.',
 'The provisional OCR point coefficients meet eta=J*Ct/Cp to rounding, but no original graphic/PDF scan was available to validate reading.',
 '1946 E6K26 6507A-2 is a different propeller blade family and should NOT be pooled with Curtiss 714 as a single empirical propeller map.',
 'NACA 1943 F2A turning report is only a method/metadata fixture until measured curves are read from the actual report images.'
 ],
 noDefaultChanges:true};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(__dirname,'../baseline/p47c_source_audit_v25.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({points:pointChecks,ladder:ladder.map(x=>({ft:x.altFt,loss_C_pct:x.modeledLossRelativePctC,loss_N_pct:x.modeledLossRelativePctNStrict}))},null,2));
module.exports={results,etaFromCoefficients,researchBaseline};
