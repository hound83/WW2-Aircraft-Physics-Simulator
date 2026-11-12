'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),{runTests}=require('./test.cjs'),{build,sha256}=require('./build.cjs'),{collect}=require('./numerics.cjs');
function flatten(x,p='',o={}){
 if(typeof x==='number'&&Number.isFinite(x))o[p]=x;
 else if(x&&typeof x==='object')for(const [k,v]of Object.entries(x))flatten(v,p?p+'.'+k:k,o);
 return o;
}
try{
 const buildInfo=build(),report=runTests();
 const current=collect(path.join(root,'validation/diagnostics'));
 const baseline=require('../validation/baseline/setup-numerics.json');
 const a=flatten(baseline),b=flatten(current);
 const changes=Object.entries(b).flatMap(([key,value])=>key in a&&value!==a[key]?[{key,baseline:a[key],current:value,delta:value-a[key]}]:[]);
 const missing=Object.keys(a).filter(k=>!(k in b)),added=Object.keys(b).filter(k=>!(k in a));
 const materialChanges=changes.filter(r=>Math.abs(r.delta)>1e-9+1e-12*Math.abs(r.baseline));
 const difference={comparedNumericValues:Object.keys(a).filter(k=>k in b).length,changed:changes.length,materialChanged:materialChanges.length,materialChanges,tolerance:{absolute:1e-9,relative:1e-12},missing,added,changes,meaning:'Legacy C comparison with frozen v2.5 setup; exact differences include cross-runtime floating-point rounding. Material threshold: abs(delta) > 1e-9 + 1e-12*abs(baseline). Not a historical accuracy score.'};
 const write=(p,obj)=>fs.writeFileSync(path.join(root,p),JSON.stringify(obj,null,2)+'\n');
 write('validation/current/numerics.json',current);
 write('validation/current/baseline-diff.json',difference);
 if(materialChanges.length||missing.length)throw Error('Legacy C compatibility regression; inspect baseline-diff.json');
 write('validation/current/build.json',buildInfo);
 const rows=changes.map(r=>[r.key,r.baseline,r.current,r.delta].join(','));
 fs.writeFileSync(path.join(root,'validation/current/numerical-differences.csv'),'metric,baseline,current,delta\n'+rows.join('\n')+(rows.length?'\n':''));
 const digest=sha256(JSON.stringify(current));
 const stall=require('../validation/diagnostics/stall_gate.cjs').writeReport();
 require('../validation/diagnostics/stall_readiness.cjs').writeReport(stall);
 require('../validation/diagnostics/stall_test_replay.cjs').writeReport();
 require('../validation/diagnostics/performance_validation.cjs').writeReport();
 require('../validation/diagnostics/climb_power_cooling.cjs').writeReport();
 require('../validation/diagnostics/p51_climb_states.cjs').writeReport();
 require('../validation/diagnostics/p51_propeller_audit.cjs').writeReport();
 require('../validation/diagnostics/source_chart_climb.cjs').writeReport();
 require('../validation/diagnostics/working_validation_v28.cjs').writeReport();
 require('../validation/diagnostics/robustness_v29.cjs').writeReport();
 require('../validation/diagnostics/coverage_v3.cjs').writeReport();
 require('../validation/diagnostics/climb_improvement_v31.cjs').writeReport();
 require('../validation/diagnostics/high_altitude_v32.cjs').writeReport();
 require('../validation/diagnostics/overall_progress.cjs').writeReport();
 require('../validation/diagnostics/measured_climb_v33.cjs').writeReport();
 require('../validation/diagnostics/configuration_v34.cjs').writeReport();
 require('../validation/diagnostics/stall_lab_v35.cjs').writeReport();
 require('../validation/diagnostics/flight_scorecard.cjs').writeReport();
 require('../validation/diagnostics/flight_envelope.cjs').writeReport();
 require('../validation/diagnostics/independent_flight_checks.cjs').writeReport();
 require('../validation/diagnostics/fighter_comparison.cjs').writeReport();
 require('../validation/diagnostics/v4_envelope.cjs').writeReport();
 require('../validation/diagnostics/energy_v41.cjs').writeReport();
 require('../validation/diagnostics/operating_benchmark_v42.cjs').writeReport();
 const turn=require('../validation/diagnostics/turn_performance_v44.cjs').writeReport();
 console.log('Mustang maneuver lift: '+turn.lift.rows.length+' reserved Mach sections, mean distance outside the read bands '+turn.lift.meanOutsideBefore.toFixed(3)+' -> '+turn.lift.meanOutsideAfter.toFixed(3)+' CL.');
 const benchmark=require('../validation/diagnostics/operating_benchmark_v43.cjs').writeReport();
 for(const trial of benchmark.flightChecks){
  console.log(trial.name+' climb check MAE '+trial.checks.beforeMae.toFixed(2)+' -> '+trial.checks.afterMae.toFixed(2)+' ft/min ('+trial.checks.count+' points).');
 }
 write('validation/current/propeller-reference-v410.json',require('../validation/diagnostics/operating_benchmark_v410.cjs').run());
 write('validation/current/remaining-fighter-propellers.json',require('../validation/diagnostics/remaining_fighter_propellers.cjs').run());
 require('./write-v42-report.cjs');
 const md=[
 '# Current validation',
 '',
 'v4.10-rc.2 [Lightning military-power propeller reference and five-aircraft assessment](V410_REMAINING_PROPELLERS.md). The numerical replay is included in the Physics regression artifact.',
 '',
 'v4.10-rc.1 [Bounded clean-flight propeller references and seven-aircraft replay](V410_PROPELLER_REFERENCE.md). The numerical replay is included in the Physics regression artifact.',
 '',
 'v4.9 [Timed runs, practical comparison margins and four-aircraft replay](V49_TIMED_MATCHUPS.md).',
 '',
 'v4.8 [Level acceleration, the four-aircraft replay and current evidence gaps](V48_LEVEL_ACCELERATION.md).',
 '',
 'v4.7 [Comparison controls, historical source agreement and four-aircraft regression](V47_BENCHMARK_AND_GOLD.md).',
 '',
 'v4.6 [Table-supported curves, climb ranges and pinned tooltips](V46_CHART_DATA.md).',
 '',
 'v4.5 [Graph evidence, country colours and speed lock](V45_GRAPH_EVIDENCE.md).',
 '',
 'v4.4 [Sustained-turn performance and flight evidence](V44_TURN_PERFORMANCE.md). [Numerical replay](../validation/current/turn-performance-v44.json).',
 '',
 'v4.3 [Report-conditioned operating benchmark checks](V43_MODEL_CHECKS.md). [Full numeric replays](../validation/current/operating-benchmark-v43.json).',
 '',
 '',
 '[v4.2 Normal/Combat benchmark, independent fuel/injection controls and altitude presets](V42_OPERATING_BENCHMARK.md).',
 '',
 '[v4.1 live energy correction and results](V41_ENERGY_RESULTS.md).',
 '',
 '[v4.0 maneuver and propulsion milestone](V4_MILESTONE.md).',
 '',
 'Fixed browser scenarios and downloadable evidence comparisons: [four-fighter comparison](FOUR_FIGHTER_COMPARISON.md).',
 '',
 'Historical climb rates and band times: [Spitfire and P-47B comparison](CLIMB_BAND_COMPARISON.md).',
 '',
 'v3.10: [Operational climb policies and intake criteria](V310_OPERATIONAL_CLIMB.md).',
 '',
 '[Turn and stall correction](TURN_STALL_CORRECTION.md).',
 '',
 'v3.13: [Mustang climb and sustained-turn power](V313_MANEUVER_POWER.md).',
 '',
 'v3.14: [Versioned evidence and international stall archive](research/WW2_STALL_EVIDENCE_LAYER_2026-11-10.md). '+buildInfo.researchObservations+' source-backed rows are available in the simulator research explorer, linked through '+buildInfo.researchSources+' source records. Fingerprint: `'+buildInfo.researchFingerprint+'`. Evidence ingestion does not fit physics; see the current v4 milestone for solver changes and accuracy qualifications.',
 '',
 'v3.12: [P-38G and symmetric multi-engine propulsion](V312_P38G.md).',
 '',
 'v3.11: [Fw 190 A-4 and speed-dependent rated power](V311_FW190A4.md).',
 '',
 'v3.9: [archival flight checks](INDEPENDENT_FLIGHT_CHECKS.md) and [four-aircraft scorecard](FLIGHT_SCORECARD.md).',
 '',
 'Generated by npm run validate from active repository code.',
 '',
 '| Check | Result |',
 '|---|---|',
 '| Research version | '+buildInfo.version+' |',
 '| Node regression scripts | '+report.passed+'/'+report.discoveredScripts+' pass |',
 '| Numeric values compared with v2.5 setup | '+difference.comparedNumericValues+' |',
 '| Exact floating-point differences | '+difference.changed+' |',
 '| Legacy C changes above numeric tolerance | '+difference.materialChanged+' |',
 '| Missing / added numeric paths | '+missing.length+' / '+added.length+' |',
 '| Engine SHA256 | '+buildInfo.physicsSha256+' |',
 '| Numerical result SHA256 | '+digest+' |',
 '| Interactive browser tests | See browser-smoke.json; run separately on the current build |',
 '| Historical stall/CLmax validation | Unresolved; executable source gate and four-aircraft sensitivity tested |',
 '| 5:1 comparative accuracy | Unresolved |',
 '',
 'v3.1 climb model: [condition-aware source-climb gains and tradeoffs](V31_CLIMB_IMPROVEMENT.md); clean and Mustang predictions retained.',
 '',
 'v3.0 release candidate: [calculation domains, source nodes and scenario ranges](V3_RELEASE_CANDIDATE.md); historical accuracy unresolved.',
 '',
 'v2.9 robustness: [power, mass, RPM and split sensitivity](V29_ROBUSTNESS.md); v2.8 working coefficients retained.',
 '',
 'v2.8 working model: [joint calibration results](V28_RESULTS.md); P is the application default. Legacy C numerical compatibility is reported separately.',
 '',
 'Chart-power mode: [explicit source-chart climb input](SOURCE_CHART_CLIMB_MODE.md); [progress assessment](PROGRESS_ASSESSMENT.md); legacy C predictions unchanged; P is the new working profile.',
 '',
 'Propeller milestone: [coupled source/candidate audit](P51_PROPELLER_EFFICIENCY_AUDIT.md); retained as earlier research; superseded for the working profile by the v2.8 joint engineering fit.',
 '',
 'Mustang reconstruction: [original chart power/weight states](P51_CLIMB_STATE_RECONSTRUCTION.md); sparse pixel-reading brackets and joint sensitivities, no default correction.',
 '',
 'Climb diagnosis: [useful-power and cooling budget](CLIMB_POWER_COOLING_DIAGNOSIS.md); inverse sensitivities separated from measured corrections; default solver unchanged.',
 '',
 'Speed/climb validation: [69 source-conditioned checkpoints](PERFORMANCE_VALIDATION.md); fitted, diagnostic and independently matched scores separated; no new historical accuracy claim.',
 '',
 'Consolidated evidence review: [four-aircraft readiness](FOUR_AIRCRAFT_STALL_REVIEW.md), including the [Spitfire configuration audit](SPITFIRE_IX_STALL_AUDIT.md).',
 '',
 'Bf 109 F-4 source milestone: [bounded audit](BF109F4_STALL_AUDIT.md); original stall pages unverified, specimen/slat gate tightened.',
 '',
 'P-47B source milestone: [primary stall/loading audit](P47B_STALL_WEIGHT_AUDIT.md); 105 mph IAS observation added, corrected EAS/CLmax unresolved.',
 '',
 'P-51 source milestone: [installation and low-speed audit](P51_LOW_SPEED_CALIBRATION_AUDIT.md); no supported coefficient change.',
 '',
 'Stall milestone: [source audit](STALL_SOURCE_AUDIT.md), [comparison tables](STALL_CALIBRATION_RESULTS.md), [machine-readable results](../validation/current/stall-gate.json).',
 '',
 'Full records: [test summary](../validation/current/test-summary.json), [numerics](../validation/current/numerics.json), [baseline differences](../validation/current/baseline-diff.json).',
 '',
 'The setup baseline and current output include the same known scientific failures and provisional evidence. Zero numerical change establishes import parity, not historical accuracy. The original 30 regression scripts are preserved; additional scripts check current standalone embedding, stall-evidence/sensitivity and matched-performance scoring guardrails.',
 '',
 'The P-47C 20-1 fixture still carries the original 0.799 OCR value; the handover reports 0.779 from the scan. This is an open evidence correction, not a setup regression failure. See [known limitations](KNOWN_LIMITATIONS.md).',
 '',
 'README, scientific decisions, limitations and next priorities must be reviewed when accepting each milestone. This report is generated; it does not decide whether a physics change is scientifically justified.',
 ''
 ].join('\n');
 fs.writeFileSync(path.join(root,'docs/CURRENT_VALIDATION.md'),md);
 console.log('Baseline comparison: '+difference.comparedNumericValues+' numeric values, '+difference.changed+' changed, '+missing.length+' missing, '+added.length+' added.');
}catch(e){fs.writeFileSync(path.join(root,'docs/CURRENT_VALIDATION.md'),'# Current validation\n\nThe latest validation attempt failed. Review validation/current/test-summary.json and the local test-output.txt. Previously generated numerical results have not been refreshed and must not be treated as results of this failed attempt.\n');console.error(e.stack);process.exitCode=1;}
