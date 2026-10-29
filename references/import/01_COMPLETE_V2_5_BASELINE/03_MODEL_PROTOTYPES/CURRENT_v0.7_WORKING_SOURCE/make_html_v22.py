"""Add opt-in Greg transfer & F-4 source-derived polar, retain full v2.1 app."""
from pathlib import Path
import base64,json,html,re

P=Path(__file__).parent
data=json.loads((P/'greg_power_budget_results_v22.json').read_text())
physics=(P/'physics.js').read_text()
cases=(P/'cases.json').read_text().replace('</','<\\/')
page=(P/'Universal_Four_Aircraft_Model_v2.1.html').read_text()
target=P/'Universal_Four_Aircraft_Model_v2.2.html'

def once(old,new,why):
 global page
 count=page.count(old)
 if count!=1:raise RuntimeError(f'{why}: expected 1 occurrence, found {count}')
 page=page.replace(old,new,1)
def num(v,d=0):return f'{v:,.{d}f}' if v is not None else '—'
def esc(v):return html.escape(str(v))
image=base64.b64encode((P/'greg_power_budget_v22.png').read_bytes()).decode()

shape=''.join(f'<tr><td>{num(r["speedMph"])}</td><td>{num(100*r["gregF4"],1)}%</td>'
              f'<td>{num(100*r["gregP47D"],1)}%</td>'
              f'<td>{num(r["propHypothesisEta"],3)}</td>'
              f'<td>{num(r["modelP51CEta"],3)}</td></tr>'
              for r in data['gregPowerAvailable']['normalizedComparison'])
mustang=''.join(f'<tr><th>{esc(r["rating"])}</th><td>{num(r["historicalClimbFpm"])}</td>'
                f'<td>{num(r["original"]["climbFpm"])}</td>'
                f'<td>{num(r["gregTransferFixedPolar"]["climbFpm"])}</td>'
                f'<td>{num(r["gregTransferRefitToOriginalSeaLevelSpeed"]["climbFpm"])}</td>'
                f'<td>{num(r["deficitUsefulHp"],1)}</td>'
                f'<td>{num(r["etaRequiredAtOriginalOptimumIfOnlyPropChanged"],3)}</td></tr>'
                for r in data['mustang']['cases'])
anchors=''.join(f'<tr><td>{esc(name)}</td><td>{num(data["anchorCrossChecks"][id]["sourceAnchorMph"],1)}</td>'
                f'<td>{num(data["anchorCrossChecks"][id]["baselineMph"],1)}</td>'
                f'<td>{num(data["anchorCrossChecks"][id]["gregTransferMph"],1)}</td>'
                f'<td>{num(data["anchorCrossChecks"][id]["gregRefitMph"],1)}</td></tr>'
                for id,name in [('p51b','P-51B-15'),('bf109f4','Bf 109 F-4'),
                                ('p47b','P-47B'),('spitfire_lfix_bs543','Spitfire LF IXc')])
turns=''.join(f'<tr><td>{num(r["altMeters"])}</td><td>{num(r["IL2Seconds"],2)}</td>'
              f'<td>{num(r["modelGenericE078Seconds"],2)}</td>'
              f'<td>{num(r["modelSimulatorConditionedSeconds"],2)}</td>'
              f'<td>{num(r["gregPolarWithCEtaSeconds"],2)}</td>'
              f'<td>{num(r["gregPolarWithP47DTransferredEtaSeconds"],2)}</td></tr>'
              for r in data['bf109']['turns'])
f4=data['bf109']['seaLevelSpeedCrossCheck'];f4polar=data['bf109']['gregInferredPolar']

panel=f'''<section class="panel" id="v22">
<h2>v2.2 / Greg's power curves tested against the real Mustang and F-4</h2>
<p><strong>Direct improvement:</strong> we can now reproduce and compare both Greg speed-dependent available-power tables. Rather than asserting a universal 85% propeller efficiency, the new opt-in <strong>G</strong> propeller mode uses the <em>speed-shaped</em> power fraction from Greg's high-power <strong>P-47D</strong> worksheet (85% only at and above 225 mph TAS). It is an explicit cross-aircraft hypothesis, <strong>not</strong> a measured P-51B, 109, or Spitfire propeller map.</p>
<div class="notice">Use the live <strong>Propeller model → G</strong> option above to explore this source-shaped hypothesis. Keep <strong>Fixed C/0.78 calibrated drag</strong> to see how it breaks independently measured top speed; choose <strong>Refit drag</strong> to restore the same source speed, noting that this eats into the apparent climb improvement. For the F-4, a new independent <strong>Greg polar</strong> turn scenario is also available; it is intentionally separate from the IL-2-conditioned scenario.</div>
<div class="statrow">
 <div class="stat"><b>{data['gregPowerAvailable']['sharedShapeMeanAbsoluteDifferencePct']:.2f} pp</b><span>Mean normalized power-curve gap between Greg F-4 and P-47D tables, six matched speeds 100–225 mph</span></div>
 <div class="stat"><b>{num(data['mustang']['cases'][0]['deficitUsefulHp'],0)}–{num(data['mustang']['cases'][1]['deficitUsefulHp'],0)} hp</b><span>Unexplained useful excess power at 2,200 ft, original 9,335-lb weight</span></div>
 <div class="stat"><b>+{num(data['anchorCrossChecks']['p51b']['gregMinusSourceMph'],1)} mph</b><span>P-51B sea-level speed overshoot if Greg's P-47D profile is transferred without refitting drag</span></div>
</div>
<img src="data:image/png;base64,{image}" style="display:block;width:100%;height:auto;background:#fff;border-radius:8px;margin:14px 0" alt="Four-panel Greg source validation chart: shared normalized power shape, P-51 original climb mismatch, speed anchor overprediction, F-4 turn comparison"/>
<h3>Original Greg numbers, preserved at source</h3>
<p>The F-4 worksheet has <strong>1,058 hp propulsive available</strong> at and above 225 mph; the high-power P-47D worksheet has <strong>2,210 hp</strong> there, consistent with its <strong>2,600 bhp × 0.85</strong> assumption. Their normalized low-speed ramps are almost identical, suggesting a shared spreadsheet propeller assumption. That makes them <em>strong internal arithmetic checks</em>, but not two independent flight-test validations of a real propeller.</p>
<div class="scroll"><table><thead><tr><th>Greg speed mph*</th><th>F-4 power / 1,058</th><th>P-47D power / 2,210</th><th>Hypothetical η = .85 × P-47D ratio</th><th>Current P-51 model η at 2,200 ft</th></tr></thead><tbody>{shape}</tbody></table></div>
<p class="micro">*Greg spreadsheet axis is treated as TAS pending a documented speed definition; it is <strong>not</strong> indiscriminately compared to an IAS or CAS plot. P-47D is a different variant from our source-anchored P-47B; its 2,600-bhp shaft power must not be copied into P-47B.</p>
<h3>Mustang: does Greg actually fix the climb?</h3>
<p>Original May 1944 USAAF data, airframe <strong>43-24777</strong>, 2,200 ft, documented <strong>9,335-lb takeoff weight</strong>. The report does not state the actual TAS or weight at this precise climb point. We therefore retain the same weight and calculate a <em>model optimum climb speed</em> as a comparative sensitivity. Neither source climb target is used to tune the drag or propeller curve.</p>
<div class="scroll"><table><thead><tr><th>MAP</th><th>Historical fpm</th><th>C model fpm</th><th>G, unchanged drag fpm</th><th>G, sea-speed-refit fpm</th><th>Missing useful hp under C</th><th>η needed at C optimum if only prop changes</th></tr></thead><tbody>{mustang}</tbody></table></div>
<p><strong>Finding:</strong> G raises modeled climb by ~96/116 fpm with the old drag, or ~74/91 fpm if we recalibrate the same 361.5-mph original speed point. It still misses by hundreds of ft/min. A standalone 85% constant-η claim is not what Greg's 175-mph worksheet says: its P-47D curve implies <strong>η≈0.80 at 175 mph</strong>. The missing useful power is <strong>not a confirmed missing shaft horsepower</strong>. The 67-inHg rated shaft curve already yields about 1,603 bhp at this altitude; 75 inHg yields about 1,811 bhp.</p>
<h3>Protect the four original flight-speed anchors</h3>
<div class="scroll"><table><thead><tr><th>Aircraft</th><th>Original anchor mph TAS</th><th>C default model</th><th>G with frozen drag</th><th>G after speed refit</th></tr></thead><tbody>{anchors}</tbody></table></div>
<h3>Bf 109 F-4: drag and power must BOTH agree</h3>
<p>From Greg's F-4 <strong>drag</strong> table at 325 mph and a provisional 6,371-lb mass: <strong>e≈{f4polar['oswald']:.3f}</strong> and <strong>CD₀≈{f4polar['cd0']:.5f}</strong>. This is independently inferred from Greg's worksheet, not IL-2-fitted. It gives encouraging turn predictions—but paired with our C propeller model it yields only <strong>{f4['gregPolarWithC']['combat']:.1f} mph</strong> maximum speed at combat rating, below the separate <strong>325 mph</strong> source reference. With G it reaches <strong>{f4['gregPolarWithTransferredP47DShape']['combat']:.1f} mph</strong>; still short. Do not claim independent validation from turn time alone.</p>
<div class="scroll"><table><thead><tr><th>Altitude m</th><th>IL-2 sustained turn</th><th>Generic e=.78</th><th>Earlier IL-2-conditioned e</th><th>Greg polar + C</th><th>Greg polar + G</th></tr></thead><tbody>{turns}</tbody></table></div>
<p>Greg lists 1,058 <em>propulsive</em> hp for the F-4 at 325 mph, but the screenshot does not identify which DB 601E shaft-power rating it was divided by. The same 1,058 hp implies <strong>η≈{data['bf109']['impliedPeakEtaIfCombatPowerRating']:.3f}</strong> with our 1,184-bhp <em>combat</em> shaft curve, or <strong>η≈{data['bf109']['impliedPeakEtaIfEmergencyPowerRating']:.3f}</strong> with our 1,332-bhp <em>emergency</em> shaft curve. Selecting one without that missing context would make a misleadingly precise model. The IL-2 IAS≈CAS conversion, configuration and weight remain limitations.</p>
<p><strong>What is NOT changed:</strong> no Meredith-effect low-speed drag coefficient, no invented NACA propeller map, no secretly tuned F-4 lift coefficient, and no changes to default C physics. The Spitfire stays in the four-aircraft cross-check. The research profile and source-derived F-4 polar are visible, optional and reversible.</p>
<p class="micro"><strong>Sources:</strong> Greg original F-4/P-47D screenshots and supplied worksheets in the attached full handover; <a href="https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html">May 1944 Wright Field P-51B-15 test</a>; <a href="https://il2sturmovik.com/museum/fighters/bf-109-f-4/">IL-2 documented F-4 performance</a> as secondary only; <a href="https://ntrs.nasa.gov/citations/19930093312">original NACA propeller method</a> does not contain a matched installed K-6523A-24 map. Reproduce with <code>node greg_power_budget_v22.cjs --write</code>; the raw figure/worksheet sources and all older tests are included.</p>
</section>'''

page=re.sub(r'(<script id="cases" type="application/json">).*?(</script>)',
            lambda m:m.group(1)+cases+m.group(2),page,count=1,flags=re.S)
page=re.sub(r'(<script>/\* Universal Model v0\.2 ).*?(</script>)',
            lambda m:'<script>'+physics+m.group(2),page,count=1,flags=re.S)
once('Universal Four-Aircraft Model · Clean Physics v2.1 | Predictive Installed Power',
     'Universal Four-Aircraft Model · Clean Physics v2.2 | Greg Power & Turn Cross-Check','title')
once('<a href="#v21">v2.1 Predictive inlet ram</a>',
     '<a href="#v22">v2.2 Greg power-budget audit</a><a href="#v21">v2.1 Predictive inlet ram</a>','navigation')
once('<section class="panel" id="v21">',panel+'\n<section class="panel" id="v21">','panel')
once('<option value="D">D · ideal momentum disk (unvalidated)</option>',
     '<option value="G">G · Greg P-47D worksheet speed ramp (what-if)</option><option value="D">D · ideal momentum disk (unvalidated)</option>','prop control')
once('<option value="global">Use exploratory shared e slider</option>',
     '<option value="greg">Greg F-4 drag polar · e≈0.558, CD₀≈0.02437 (source-derived, still speed-short)</option><option value="global">Use exploratory shared e slider</option>','F-4 control')
old="function optFor(id,conf){const ac=D.aircraft[id],isSim109=id==='bf109f4'&&$('f4scenario').value==='sim';return {profile:conf.profile,e:isSim109?F4_SIM_E:conf.e,weightLb:ac.weightLb*conf.weight,refit:isSim109||conf.refit||conf.profile==='D',rating:id==='bf109f4'?$('bfmode').value:id==='p51b'?$('p51mode').value:ac.defaultRating,engineModel:conf.engineMode==='ram'&&id!=='p47b'?'ram-critical':undefined};}"
new="function optFor(id,conf){const ac=D.aircraft[id],isSim109=id==='bf109f4'&&$('f4scenario').value==='sim',isGreg109=id==='bf109f4'&&$('f4scenario').value==='greg';const o={profile:conf.profile,weightLb:ac.weightLb*conf.weight,rating:id==='bf109f4'?$('bfmode').value:id==='p51b'?$('p51mode').value:ac.defaultRating,engineModel:conf.engineMode==='ram'&&id!=='p47b'?'ram-critical':undefined};if(isGreg109){const gp=M.inferredGregF4(ac,D.greg.bf109f4);o.polar={e:gp.oswald,cd0:gp.cd0,source:gp.source};}else{o.e=isSim109?F4_SIM_E:conf.e;o.refit=isSim109||conf.refit||conf.profile==='D';}return o;}"
once(old,new,'F-4 Greg option in live solver')
once("const result=window.UniversalClimbAudit.run(M,D),active=$('profile').value,rows=['A','B','C'].map(profile=>({profile,...result.profiles[profile]})),selected=result.profiles[active];",
     "const result=window.UniversalClimbAudit.run(M,D),active=['A','B','C'].includes($('profile').value)?$('profile').value:'C',rows=['A','B','C'].map(profile=>({profile,...result.profiles[profile]})),selected=result.profiles[active];",
     'static historical audit fallback for what-if mode')
once("const chosen=rows.find(x=>x.profile===$('profile').value);",
     "const chosen=rows.find(x=>x.profile===$('profile').value)||rows.find(x=>x.profile==='C');",
     'historical boost audit fallback')
once("window.UniversalFourAircraftUI={render,model:M,data:D,version:\"2.1\"};",
     "window.UniversalFourAircraftUI={render,model:M,data:D,version:\"2.2\"};",
     'embedded version')
target.write_text(page)
print(target,target.stat().st_size)
