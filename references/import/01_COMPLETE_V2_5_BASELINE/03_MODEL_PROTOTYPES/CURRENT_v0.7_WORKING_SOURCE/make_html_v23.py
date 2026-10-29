"""Create self-contained v2.3 app, preserving full v2.2 and prior features."""
from pathlib import Path
import base64,html,json,re

P=Path(__file__).parent
D=json.loads((P/'naca_propeller_benchmark_results_v23.json').read_text())
H=json.loads((P/'naca_inflight_prop_holdout_results_v23.json').read_text())
page=(P/'Universal_Four_Aircraft_Model_v2.2.html').read_text()
physics=(P/'physics.js').read_text()
cases=(P/'cases.json').read_text().replace('</','<\\/')
plot=base64.b64encode((P/'naca_flight_power_comparison_v23.png').read_bytes()).decode()
original=base64.b64encode((P/'naca_1941_original_fig10_12_v23.jpg').read_bytes()).decode()
dest=P/'Universal_Four_Aircraft_Model_v2.3.html'

def one(old,new,label):
 global page
 if page.count(old)!=1:raise RuntimeError(f'{label}: expected 1 match, got {page.count(old)}')
 page=page.replace(old,new,1)
def num(n,places=1):return f'{n:,.{places}f}' if isinstance(n,(int,float)) else '—'

f4=D['bf109'];m=D['mustang']
mustang=''.join('<tr><th>'+html.escape(x['rating'])+'</th>'+
  f"<td>{num(x['sourceClimbFpm'],0)}</td><td>{num(x['baselineC']['climbFpm'],0)}</td>"+
  f"<td>{num(x['nacaNWithOldFrozenDrag']['climbFpm'],0)}</td>"+
  f"<td>{num(x['nacaNWithOriginalSpeedReanchor']['climbFpm'],0)}</td>"+
  f"<td>{num(x['remainingHistoricalResidualFpm'],0)}</td></tr>"
 for x in m['sourceClimbs'])
turn=''.join(f"<tr><td>{num(x['altMeters'],0)}</td><td>{num(x['sourceIL2Seconds'],2)}</td>"+
 f"<td>{num(x['C']['seconds'],2)}</td><td>{num(x['N']['seconds'],2)}</td>"+
 f"<td>{num(x['nacaResidualSeconds'],2)}</td></tr>"
 for x in f4['sourceIL2TurnTimes'])
anchors=''.join(f"<tr><th>{html.escape(x['aircraft'])}</th><td>{num(x['sourceAnchorMph'])}</td>"+
 f"<td>{num(x['c'])}</td><td>{num(x['nFrozen'])}</td><td>{num(x['nReanchored'])}</td>"+
 f"<td>{num(x['nacaEtaAtSpeedAnchor'],3)}</td></tr>"
 for x in D['allAircraftSpeedAnchors'])
reading=''.join(f"<tr><th>{b}-blade</th><td>{num(cp,1)}</td>"+
 ''.join(f"<td>{num(next(x['eta'] for x in D['naca1941FigureCurves']['chart'] if x['blades']==b and x['Cp']==cp and x['J']==j),3)}</td>" for j in [1,2,3])+"</tr>"
 for b in [3,4] for cp in [.2,.4,.6])

panel=f'''<section class="panel" id="v23">
<h2>v2.3 / 112 ORIGINAL NACA REPORTS — source-first physics update</h2>
<p>Major 1930s–1940s archival research pass: propeller speed/loading/solidity and installation; measured XP-51 and P-47D section drag; cooling ducts and the Meredith effect; supercharger and engine power at altitude. The source archive contains <strong>112 full original NASA/NACA PDFs</strong>, source metadata and original figure scans, extracted report text, and page-verified reading copies. The new opt-in <strong>N</strong> propeller model interpolates <em>graph-read, rounded</em> η(J,Cp) curves from NACA's October 1941 Figures 10–12; it is never fitted to an aircraft's climb results.</p>
<div class="notice"><strong>How to test:</strong> use the live <strong>Propeller model → N</strong> option above. The original <strong>C</strong> model remains the default. In the model controls, examine both <em>original drag frozen</em> and <em>drag reanchored</em> cases; the latter preserves historical maximum-speed anchors. NACA's original curves are for period Hamilton Standard 3-/4-blade test shapes—not the exact installed Mustang K-6523A-24, VDM 109, Rotol Spitfire or P-47B propeller. A research transfer has an estimated ±0.03–0.05 efficiency-point reading uncertainty, plus unknown aircraft installation differences. Where Cp falls below 0.2, the simulation uses the nearest source curve and flags the limitation.</div>
<div class="statrow">
 <div class="stat"><b>112 reports</b><span>Original NACA PDFs, mostly 1934–1946 plus one contextual 1930 supercharger study</span></div>
 <div class="stat"><b>η = {D['naca1944DesignCase']['naca1941ChartApproximateEta']:.3f}</b><span>1941 graph reading at a 1944 published 4-blade design case; 1944 analysis reports 0.848</span></div>
 <div class="stat"><b>{f4['speed']['NwithGregPolar']:.1f} mph</b><span>Bf 109 F-4 + Greg drag polar + NACA research propeller; source combat speed 325 mph</span></div>
</div>
<img src="data:image/png;base64,{plot}" style="display:block;width:100%;height:auto;border-radius:8px;background:white;margin:16px 0" alt="Four-panel source-first NACA model verification: efficiency curves, Mustang climb, Bf 109 turns, F-4 top speed"/>
<h3>Exact method and source</h3>
<p><strong>Figure 10, 11, 12:</strong> Biermann and Conway, <em>The Selection of Propellers for High Thrust at Low Airspeed</em>, NACA ARR October 1941, original <a href="https://ntrs.nasa.gov/citations/19930093644">NASA full report</a>, PDF page 27. The graphs explicitly vary propeller blade number (3, 4, 6, 8), coefficient Cp=0.2/0.4/0.6, and advance ratio J. Tabulated below are approximate rounded readings at J=1, 2, and 3; the full reference nodes and all assumptions are in the attached v2.3 reproducibility code. Values are <em>not</em> claimed to three-decimal measurement accuracy.</p>
<div class="scroll"><table><thead><tr><th>Blades</th><th>Cp</th><th>η at J=1</th><th>η at J=2</th><th>η at J=3</th></tr></thead><tbody>{reading}</tbody></table></div>
<details><summary>View original unaltered NACA figure (PDF p. 27)</summary><img src="data:image/jpeg;base64,{original}" style="display:block;width:100%;height:auto;max-width:100%;background:white" alt="Original NACA 1941 graphs of three-, four-, six- and eight-blade propeller efficiency at power coefficients 0.2, 0.4 and 0.6"></details>
<p><strong>Cross-check without fitting:</strong> Crigler and Talkin's September 1944 <a href="https://ntrs.nasa.gov/citations/19930093312">NACA ACR L4I29</a> design example uses J=2.26, Cp=0.342, four blades, 2,000 hp, 425 mph at 25,000 ft. Its reported induced efficiency is 0.931 and net propulsive efficiency is <strong>0.848</strong>. The separate 1941 figure read-back yields <strong>{D['naca1944DesignCase']['naca1941ChartApproximateEta']:.3f}</strong>, close within manual graph reading error. The two reports might share some experimental underlying propeller designs; this is an <em>internal period-source consistency check</em>, not an independently measured aircraft map.</p>
<h3>Mustang: independent low-speed power problem remains</h3>
<p>May 1944 Wright Field P-51B-15, <strong>43-24777</strong>, 2,200-ft climb. The NACA profile changes the optimized climb speed and available propeller power, but does <strong>not</strong> resolve the historical rates. Notably, the new model does not assume a beneficial Meredith radiator thrust term at climb speed. At the Mustang's roughly J=1 and Cp=0.17, the chart's Cp floor of 0.20 is a real limitation, clearly marked.</p>
<div class="scroll"><table><thead><tr><th>Boost</th><th>USAAF historical fpm</th><th>Original C fpm</th><th>N, unchanged drag</th><th>N, top speed reanchored</th><th>Remaining deficit</th></tr></thead><tbody>{mustang}</tbody></table></div>
<h3>Bf 109 F-4: one change improves the speed/turn balance</h3>
<p>Combine Greg's independent drag split (CD₀ ≈ {f4['gregIndependentPolar']['cd0']:.5f}; e≈{f4['gregIndependentPolar']['e']:.3f}) with the 1941 NACA <em>three-blade</em> speed/loading curve. The turns remain almost exactly at IL-2's secondary reference, without setting the turn targets in the drag or propeller code. The independently sourced <strong>325 mph combat speed remains ~{abs(f4['speed']['nacaResidualMph']):.1f} mph faster</strong> than the predicted {f4['speed']['NwithGregPolar']:.1f} mph. We retain that discrepancy rather than tuning it away.</p>
<div class="scroll"><table><thead><tr><th>Altitude m</th><th>IL-2 turn s</th><th>Greg polar + C</th><th>Greg polar + NACA</th><th>N minus IL-2 s</th></tr></thead><tbody>{turn}</tbody></table></div>
<h3>Never lose the other three speed anchors</h3>
<div class="scroll"><table><thead><tr><th>Aircraft</th><th>Source mph</th><th>Original C</th><th>N with frozen drag</th><th>N after speed refit</th><th>N η at source speed</th></tr></thead><tbody>{anchors}</tbody></table></div>
<h3>Period research changes our priorities</h3>
<p><strong>1941 low-speed loading:</strong> more solidity helps highly loaded props, but four blades do not guarantee a uniform η improvement at all speeds. <strong>1944 cooling duct:</strong> full-scale XP-47 duct pressure recovery changed with propeller slipstream, climb attitude, inlet velocity, radiator resistance and exit flaps—not a fixed drag bonus. <strong>1939 heat-recovery trial:</strong> no practical recovered thrust up to 400 mph in the tested ducts. <strong>1943 altitude cooling:</strong> later calculations explicitly balance cooling pumping, duct drag and heat-jet recovery, including the practical-versus-ideal installation distinction. <strong>1943 XP-51 / 1945 P-47D:</strong> actual wing profile drag and transition depend on Reynolds number, lift coefficient and wing condition. <strong>1941 engine altitude methods:</strong> power-versus-altitude is supercharger/cooling/ram-specific, not simply ambient density times rated power.</p>
<p class="micro">Reference archive and method: separate report registry, full scans, original figure pages, extracted text, pages and SHA-256 hashes, source-chain follow-ups, numerical v2.3 benchmark, and 24+ automated tests. Primary originals are from <a href="https://ntrs.nasa.gov">NASA's NACA collection</a>. IL-2/DCS remain *secondary* and variant-specific. No new drag/power/low-speed coefficient has been tuned to the Mustang's historical climb or the IL-2 turn figures.</p>
</section>'''

holdout_rows=''.join('<tr>'+''.join(f'<td>{html.escape(str(c))}</td>' for c in [
 x['table'],x['run'],num(x['J'],3),num(x['Cp'],3),num(x['tipMach'],3),
 num(x['eta'],3),num(x['etaNaca1941Graph'],3),num(x['errorEta'],3)])+'</tr>'
 for x in H['measurements'])
holdout=f'''<h3>Independent flight-measured propeller η — 1945 P-47D (12 runs)</h3>
<p>A much stronger check than game performance: Gardner's <a href="https://ntrs.nasa.gov/citations/19930093653">NACA MR L5G09a</a> measured a <strong>three-blade Hamilton Standard 6507A-2</strong> on a P-47D in flight, with directly tabulated η, J, Cp, and blade-tip Mach. These 12 legible runs from Tables I and II were withheld from the 1941 curve construction. <strong>Climb-flight mean absolute η error: {H['lowSpeedClimb']['MAEEfficiency']:.3f}</strong> (six rows); <strong>high-speed error: {H['highSpeed']['MAEEfficiency']:.3f}</strong> (six rows), with high-speed bias +{H['highSpeed']['biasEfficiency']:.3f}. The chart overpredicts some high-tip-Mach points: it does <em>not</em> contain the real propeller's blade compressibility and installation model. Four source test points have Cp below the chart's measured 0.20 floor, hence source extrapolation is flagged; the aircraft is not our P-47B.</p>
<details><summary>See all 12 independent NACA flight-test efficiency checks</summary><div class="scroll"><table><thead><tr><th>Table</th><th>Run</th><th>J</th><th>Cp</th><th>Tip Mach</th><th>Measured η</th><th>1941 estimate η</th><th>Residual η</th></tr></thead><tbody>{holdout_rows}</tbody></table></div></details>'''
holdout=holdout.replace('Four source test points',f"{sum(x['outsideGraphCp'] for x in H['measurements'])} source test points")
panel=panel.replace('<h3>Period research changes our priorities</h3>',holdout+'\n<h3>Period research changes our priorities</h3>')

page=re.sub(r'(<script id="cases" type="application/json">).*?(</script>)',
            lambda m:m.group(1)+cases+m.group(2),page,count=1,flags=re.S)
page=re.sub(r'(<script>/\* Universal Model v0\.2 ).*?(</script>)',
            lambda m:'<script>'+physics+m.group(2),page,count=1,flags=re.S)
one('Universal Four-Aircraft Model · Clean Physics v2.2 | Greg Power & Turn Cross-Check',
    'Universal Four-Aircraft Model · Clean Physics v2.3 | Original NACA Propeller Evidence', 'title')
one('<a href="#v22">v2.2 Greg power-budget audit</a>',
    '<a href="#v23">v2.3 NACA archive and physics</a><a href="#v22">v2.2 Greg power-budget audit</a>', 'nav')
one('<section class="panel" id="v22">',panel+'\n<section class="panel" id="v22">','new source panel')
one('<option value="G">G · Greg P-47D worksheet speed ramp (what-if)</option>',
    '<option value="N">N · NACA 1941 graph η(J,Cp), 3/4 blades (research)</option><option value="G">G · Greg P-47D worksheet speed ramp (what-if)</option>',
    'propeller mode')
one('window.UniversalFourAircraftUI={render,model:M,data:D,version:"2.2"};',
    'window.UniversalFourAircraftUI={render,model:M,data:D,version:"2.3"};', 'embedded version')
dest.write_text(page)
print(dest,round(dest.stat().st_size/1e6,2),'MB')
