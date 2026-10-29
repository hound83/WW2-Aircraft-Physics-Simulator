"""Build self-contained v2.1 app from immutable v2.0 and updated shared solver.
The live controls expose opt-in predictive inlet-ram power vs baseline chart BHP.
"""
from pathlib import Path
import base64,json,html,re

P=Path(__file__).parent
data=json.loads((P/'ram_predictive_results_v21.json').read_text())
physics=(P/'physics.js').read_text()
cases=(P/'cases.json').read_text().replace('</','<\\/')
page=(P/'Universal_Four_Aircraft_Model_v2.0.html').read_text()
target=P/'Universal_Four_Aircraft_Model_v2.1.html'

def once(old,new,why):
 global page
 count=page.count(old)
 if count!=1:raise RuntimeError(f'{why}: expected 1 occurrence; got {count}')
 page=page.replace(old,new,1)

png=base64.b64encode((P/'predictive_installed_power_v21.png').read_bytes()).decode()
def f(x,d=0):return '—' if x is None else f'{x:,.{d}f}'
def esc(x):return html.escape(str(x))
sp=data['spitfire']['ideal']
climb_rows=''.join(f'<tr><td>{f(r["altFt"])}</td><td>{esc(r["gear"])}</td><td>{f(r["historicalTasMph"],1)}</td>'
    f'<td>{f(r["measuredBoostPsi"],1)}</td><td>{f(r["predictedBoostPsi"],2)}</td>'
    f'<td>{f(r["historicalClimbFpm"])}</td><td>{f(r["originalClimbFpm"])}</td>'
    f'<td>{f(r["predictedClimbFpm"])}</td></tr>' for r in sp['rows'])
mustang_rows=''.join(f'<tr><td>{esc(r["rating"])}</td><td>{f(r["sourceMeasuredClimbFpm"])}</td>'
    f'<td>{f(r["modeledBestClimbFpm"])}</td><td>{f(r["historicalMinusModelClimbFpm"])}</td>'
    f'<td>{f(r["manifoldAbsoluteInHg"],1)}</td><td>{"YES" if r["regulated"] else "NO"}</td>'
    f'<td>{f(r["ramPowerRatio"],3)}</td></tr>' for r in data['mustang2200Ft'])
f4_rows=''.join(f'<tr><td>{f(r["altMeters"])}</td><td>{f(r["simSeconds"],1)}</td>'
    f'<td>{f(r["baselineTurnSeconds"],2)}</td><td>{f(r["predictedTurnSeconds"],2)}</td>'
    f'<td>{"YES" if r["boostRegulated"] else "NO"}</td></tr>' for r in data['bf109Turns'])

panel=f'''<section class="panel" id="v21">
<h2>v2.1 / Predictive installed engine power at actual flight speed</h2>
<p><strong>New opt-in physics:</strong> pressure available at the air inlet changes with TAS; a boost regulator holds the selected manifold pressure whenever the supercharger has enough capacity. At each historically identified <em>maximum-speed full-throttle height</em>, the limit is set by the aircraft's recorded speed and engine boost. The engine model predicts boost at a different airspeed without reading the climb MAP.</p>
<div class="notice"><strong>Select “Predictive inlet ram” above to apply v2.1 in the live aircraft cards and energy/turn curves.</strong> Default remains the previously verified altitude-chart power. P-47B stays on its torquemeter/turbo chart because a direct-geared supercharger rule is not justified for its turbo system. Bf 109 full-throttle inputs come from IL-2 developer data and are secondary-only.</div>
<div class="statrow">
  <div class="stat"><b>{sp['pressureMaePsi']:.2f} psi</b><span>Spitfire historic climb MAP prediction MAE across all 16 points</span></div>
  <div class="stat"><b>{sp['originalClimbMaeFpm']:.0f} → {sp['predictedClimbMaeFpm']:.0f}</b><span>Spitfire climb MAE, ft/min, no observed climb pressure input</span></div>
  <div class="stat"><b>{data['spitfire']['speed']['predictiveHoldoutMaeMph']:.2f} mph</b><span>20 withheld original level speeds, predictive mode</span></div>
</div>
<img src="data:image/png;base64,{png}" style="display:block;width:100%;height:auto;background:#f7f9fc;border-radius:8px;margin:14px 0" alt="Four physics diagnostics: Spitfire predicted versus recorded manifold pressure and climbs, low-speed power profiles, and Bf 109 turning unaffected by regulated boost" />
<h3>What is computed?</h3>
<p><code>p₀ = p · (1 + 0.2 M²)^3.5</code> for subsonic inlet stagnation pressure, ideal pressure recovery assumption. Below full-throttle limit, the regulator keeps MAP at its rating. Above the limit, available MAP falls according to the source critical-pressure ratio. At the same altitude, the solver compares MAP at actual TAS to MAP at reported maximum-level TAS and applies a <strong>provisional constant-RPM BHP ∝ absolute MAP</strong> ratio. No new aircraft-specific low-speed drag or propeller coefficient is fitted.</p>
<p class="micro"><strong>Important limitation:</strong> “100% recovered” is the best-case ideal intake, NOT a measured efficiency. A separate 70% sensitivity curve is shown. We still lack installed induction-system pressure and measured propeller blade-pitch/η maps. Input critical points are source specific and Bf 109 has only secondary-source critical speed.</p>
<h3>Spitfire historical climb: predictions without using historical climb boost</h3>
<div class="scroll"><table><thead><tr><th>Altitude ft</th><th>Gear</th><th>RAF climb TAS</th><th>Measured MAP psi</th><th>Predicted MAP psi</th><th>RAF climb fpm</th><th>Old model fpm</th><th>v2.1 fpm</th></tr></thead><tbody>{climb_rows}</tbody></table></div>
<p>At 22,000 ft the model predicts about <strong>+13.68 psi</strong> climbing manifold pressure; the 1943 RAF flight test recorded <strong>+13.8 psi</strong>. This tests the predicted pressure directly, separately from a climb-rate fit. The large remaining mid-altitude climb offsets, especially with cooling radiator shutters open, still require explanation.</p>
<h3>P-51B and Bf 109: an equally important negative result</h3>
<p>The original USAAF report specifies a <strong>2,200-ft 75-inHg climb-critical altitude</strong>; in maximum-speed <em>level flight</em>, its critical altitude is <strong>7,400 ft</strong>. These are different because ram pressure changes with airspeed. The illustrative <strong>195 mph TAS</strong> point retains full boost at 2,200 ft in the model. The original report does <strong>not</strong> give climb TAS; 195 mph is a sensitivity check, not a measured flight speed.</p>
<div class="scroll"><table><thead><tr><th>Mustang rating</th><th>USAAF climb fpm</th><th>v2.1 best climb fpm</th><th>Deficit fpm</th><th>MAP inHg at 195 TAS</th><th>Regulated?</th><th>Power ratio</th></tr></thead><tbody>{mustang_rows}</tbody></table></div>
<p>The P-51B-15 still falls short of the measured absolute climb: <strong>{f(data['mustang2200Ft'][0]['historicalMinusModelClimbFpm'])} fpm</strong> at 67 inHg and <strong>{f(data['mustang2200Ft'][1]['historicalMinusModelClimbFpm'])} fpm</strong> at 75 inHg, using the original 9,335-lb <em>takeoff</em> weight as the modeled 2,200-ft weight and maximizing climb over 100–290 mph TAS. Those are about <strong>{f(data['mustang2200Ft'][0]['remainingUsefulPowerEquivalentHp'])}–{f(data['mustang2200Ft'][1]['remainingUsefulPowerEquivalentHp'])} useful hp</strong> short, not an observed engine shaft-power deficit. Neither actual climb airspeed nor the precise reduced weight at altitude was published in the textual report.</p>
<p class="micro"><strong>Source inconsistency:</strong> the original level-speed table prints 395.5 mph at 7,400 ft for <em>both</em> 67 and 75 inHg, while its conclusion explicitly claims 75 inHg adds 16 mph there. The prototype's 75-inHg low-gear 411.5 mph critical speed is inferred from that prose, <em>not independently measured</em>. Treat the Mustang speed sensitivity as provisional.</p>
<p>Similarly the Bf 109 F-4's predicted emergency boost is held at 0 and 3 km for its IL-2 reference turn speeds. Changing the engine-ram model cannot fix an unrelated turning mismatch there; actual low-speed propeller performance, wing drag and correct IAS/CAS matter more. At the previously simulator-conditioned <em>e ≈ 0.547</em>:</p>
<div class="scroll"><table><thead><tr><th>Altitude m</th><th>IL-2 turn s</th><th>Baseline s</th><th>Ram s</th><th>Boost regulated?</th></tr></thead><tbody>{f4_rows}</tbody></table></div>
<p><strong>What still needs work:</strong> the old P-51B 2,200-ft power residual is <em>not resolved</em> by this mechanism; neither is independent validation of the 109's Oswald e or true low-speed propeller efficiency. The Spitfire's climb radiator drag is not modeled. Real Hamilton Standard K/J-6523A-24, Rotol RA10061 and VDM 9-12010A efficiency-vs-J/Cp maps remain unlocated; NACA 1944 general chart methods are not an installed aircraft map.</p>
<p class="micro"><strong>Primary sources:</strong> <a href="https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html">1943 A&amp;AEE Spitfire BS.543 Tables II/V</a>, <a href="https://www.wwiiaircraftperformance.com/org/p-51/mustangtest.html">1943 USAAF P-51B-1 boost/ROC comparison (separate model)</a>, <a href="https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html">1944 USAAF P-51B-15 43-24777</a>, and <a href="https://ntrs.nasa.gov/citations/19930093312">1944 NACA propeller efficiency chart method</a>. <strong>Secondary:</strong> <a href="https://il2sturmovik.com/museum/fighters/bf-109-f-4/">IL-2 F-4 documented operating modes and turn performance</a>. All values reproducible with <code>node ram_predictive_audit_v21.cjs --write</code>.</p>
</section>'''

page=re.sub(r'(<script id="cases" type="application/json">).*?(</script>)',
            lambda m:m.group(1)+cases+m.group(2),page,count=1,flags=re.S)
page=re.sub(r'(<script>/\* Universal Model v0\.2 ).*?(</script>)',
            lambda m:'<script>'+physics+m.group(2),page,count=1,flags=re.S)

once('Universal Four-Aircraft Model · Clean Physics v2.0 | Spitfire & Speed-Sensitive Boost',
     'Universal Four-Aircraft Model · Clean Physics v2.1 | Predictive Installed Power','title')
once('<a href="#v20">v2.0 Spitfire &amp; manifold-pressure discovery</a>',
     '<a href="#v21">v2.1 Predictive inlet ram</a><a href="#v20">v2.0 Spitfire &amp; manifold-pressure discovery</a>','nav')
once('<section class="panel" id="v20">',panel+'\n<section class="panel" id="v20">','physics panel')
once('<div class="control"><label for="e">Assumed Oswald e',
     '<div class="control"><label for="engineModel">Engine power versus airspeed</label><select id="engineModel"><option value="charted" selected>Altitude-chart BHP · v2.0 baseline</option><option value="ram">Predictive inlet ram · v2.1 (research)</option></select></div>\n<div class="control"><label for="e">Assumed Oswald e',
     'interactive engine selector')
once("refit:$('calibration').value==='refit'});",
     "refit:$('calibration').value==='refit',engineMode:$('engineModel').value});",
     'interactive key')
old="return {profile:conf.profile,e:isSim109?F4_SIM_E:conf.e,weightLb:ac.weightLb*conf.weight,refit:isSim109||conf.refit||conf.profile==='D',rating:id==='bf109f4'?$('bfmode').value:id==='p51b'?$('p51mode').value:ac.defaultRating};"
new="return {profile:conf.profile,e:isSim109?F4_SIM_E:conf.e,weightLb:ac.weightLb*conf.weight,refit:isSim109||conf.refit||conf.profile==='D',rating:id==='bf109f4'?$('bfmode').value:id==='p51b'?$('p51mode').value:ac.defaultRating,engineModel:conf.engineMode==='ram'&&id!=='p47b'?'ram-critical':undefined};"
once(old,new,'engine option')
once("$('conditions').textContent='All output curves use identical equations.",
     "$('conditions').textContent=(c.engineMode==='ram'?'PREDICTIVE inlet ram selected for Spitfire/P-51B/Bf 109; turbo P-47B keeps previous chart-power model. ':'Altitude-chart BHP baseline selected. ')+'All output curves use identical equations.",
     'live conditions provenance')
once('window.UniversalFourAircraftUI={render,model:M,data:D};',
     'window.UniversalFourAircraftUI={render,model:M,data:D,version:"2.1"};',
     'version')
target.write_text(page)
print(target,target.stat().st_size)
