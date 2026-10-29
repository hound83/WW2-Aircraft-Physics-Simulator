"""Build v2.0 offline four-aircraft app from frozen v1.9 + current shared core.
Old v1.9 is retained unchanged; no dependency on a web server.
"""
from pathlib import Path
import json,base64,html,re

P=Path(__file__).parent
data=json.loads((P/'spitfire_results_v20.json').read_text())
cases=(P/'cases.json').read_text().replace('</','<\\/')
physics=(P/'physics.js').read_text()
source=P/'Universal_Three_Aircraft_Model_v1.9.html'
target=P/'Universal_Four_Aircraft_Model_v2.0.html'
page=source.read_text()

def once(before,after,what):
    global page
    if page.count(before)!=1:raise RuntimeError(f'Expected one {what}, got {page.count(before)}')
    page=page.replace(before,after,1)

def cell(value):return '<td>'+html.escape(str(value))+'</td>'
def row(items):return '<tr>'+''.join(cell(x) for x in items)+'</tr>'
def f(v,precision=0):return '—' if v is None else f'{v:,.{precision}f}'

chart=base64.b64encode((P/'four_aircraft_diagnostic_v20.png').read_bytes()).decode()
climb=[]
for x in data['climb']:
    climb.append(row([f(x['altFt']),f(x['tasMph'],1),
      f(x['sourceBoostAtLevelSpeedPsi'],1),f(x['reportedBoostPsi'],1),
      f(x['fpm']),f(x['predAtReportedSpeedFpm']),f(x['conditionAwareFpm']),
      f(x['conditionAwareResidualFpm'])]))
speed=[]
for x in data['speed']['rows']:
    speed.append(row([f(x['altFt']),x['gear'].upper(),f(x['mphTas'],1),
      f(x['modelTasMph'],1),f(x['residualMph'],1),f(x['shaftBhpProxy']),
      'FITTED' if x['altFt']==0 and x['gear']=='low' else 'CHECK']))
turn=[]
for baseline,modified in zip(data['il2Turns'],data['optionalSimulatorConditionedE']['levels']):
    turn.append(row([f(baseline['altMeters']),f(baseline['iasKmh']),
      f(baseline['turnSeconds'],2),f(baseline['modelAtTakeoffWeight']['turnSeconds'],2),
      f(modified['modelSeconds'],2),'Simulator fit' if baseline['altMeters']==0 else 'WITHHELD simulator check']))
boost=data['boostPowerComparison']; sim=data['optionalSimulatorConditionedE']

panel=f'''<section class="panel" id="v20">
<h2>v2.0 / Add Spitfire LF Mk IXc &amp; discover the missing low-speed engine-pressure effect</h2>
<p><strong>A fourth independent aircraft type is now selectable in every live speed/turn/energy chart.</strong>
Source airframe: <strong>RAF Spitfire BS.543</strong>, Merlin 66, standard Mk Vc/IXc wings,
Rotol <strong>RA10061 four-blade propeller, 10 ft 9 in</strong>, +18 lb boost, 3,000 rpm.
This is <em>not</em> the same specimen/configuration as the IL-2 IXe or every DCS LF Mk IX.</p>
<div class="statrow">
  <div class="stat"><b>{data['speed']['maeMph']:.2f} mph</b><span>20 unfitted primary level-speed checks, shared C model</span></div>
  <div class="stat"><b>{boost['rawClimbMaeFpm']:.0f} → {boost['sourceBoostConditionedClimbMaeFpm']:.0f}</b><span>Climb MAE ft/min using source-observed MAP</span></div>
  <div class="stat"><b>{100*(1-boost['sourceBoostConditionedClimbMaeFpm']/boost['rawClimbMaeFpm']):.1f}%</b><span>Climb error reduction at identical measured TAS</span></div>
</div>
<p><strong>Why it matters:</strong> historic A&amp;AEE Table V recorded manifold pressure in maximum-speed flight, and Table II recorded its pressure in the slower climb. At <strong>22,000 ft</strong> the Merlin 66 gave <strong>+18.5 psi</strong> at 407 mph TAS versus <strong>+13.8 psi</strong> at 225 mph TAS. We now have an <em>optional general-purpose</em> <code>shaftPowerAtMeasuredBoost</code> calculation: convert gauge boost to absolute manifold pressure, then proportionally reduce <em>estimated</em> constant-RPM shaft power. It is applied ONLY where the original report measures the two boost values; no arbitrary P-51, 109 or P-47 coefficient is added.</p>
<img src="data:image/png;base64,{chart}" style="display:block;width:100%;height:auto;background:#f7f9fc;border-radius:8px;margin:14px 0" alt="Four-panel v2.0 audit of primary Spitfire speed and climb, matched manifold pressure, and separate IL-2 turn checks" />
<h3>Historical test configurations: never merge these weights or radiator states</h3>
<div class="layout">
  <div><p><strong>Maximum level speed:</strong> reported speeds normalized to <strong>7,110 lb</strong> (95% of test takeoff mass); cooling radiator shutters <strong>closed</strong>. This is the anchor mass of the interactive Spitfire speed polar.</p></div>
  <div><p><strong>Climb:</strong> test takeoff mass <strong>7,485 lb</strong>; radiator shutters <strong>fully open</strong>; 170 mph <em>indicated</em> up to high blower. A&amp;AEE gives TAS at every climb point, so no guessed IAS correction is necessary.</p></div>
</div>
<h3>Climb at exact A&amp;AEE measured airspeed, without fitting to the climb rate</h3>
<div class="scroll"><table><thead><tr><th>Altitude ft</th><th>Reported TAS</th><th>Level boost psi</th><th>Climb boost psi</th><th>RAF climb fpm</th><th>Same level BHP</th><th>Condition-corrected BHP</th><th>Residual fpm</th></tr></thead><tbody>{''.join(climb)}</tbody></table></div>
<p class="micro">At 14,000 ft the high-supercharger level-speed table has no directly reported comparable pressure; the condition-aware result is left unavailable instead of inventing one. Across the other 15 points, source-observed boost is an engine INPUT; measured ft/min remains an unfitted target. A pressure-ratio horsepower approximation, missing cooling drag, uncertain propeller η and differences in engine chart/rated horsepower still contribute error.</p>
<h3>20 historical level-speed checks (plus one 336-mph anchor)</h3>
<div class="scroll"><table><thead><tr><th>Altitude ft</th><th>Gear</th><th>RAF TAS</th><th>Model TAS</th><th>Residual mph</th><th>BHP used*</th><th>Role</th></tr></thead><tbody>{''.join(speed)}</tbody></table></div>
<p class="micro">*Only Merlin 66 <strong>1,705 BHP MS at 5,750 ft</strong> and <strong>1,580 BHP FS at 16,000 ft</strong> are backed by published engine critical ratings. Other BHP values are declared provisional altitude/boost proxies, and the 1,600-BHP +18-psi sea-level estimate is an <em>input assumption</em>. The 10,800/22,000-ft airplane full-throttle heights are observed <em>in flight</em> with ram; do not confuse these with static engine bench heights. Consequently these 20 holdouts are unfit speed targets, but the power interpolation is partly informed by the SAME primary report's boost history.</p>
<h3>Low-speed turning: a genuine fourth shape test, not an imposed aircraft role</h3>
<p>With the standard assumed <strong>e=0.78</strong>, our 7,485-lb Spitfire model is <strong>too optimistic</strong> versus the developer's IL-2 Mk IXe turn figures. As a deliberately <em>secondary-simulator-conditioned experiment</em>, fitting e to <em>only</em> the game’s sea-level 17.7-second point gives <strong>e={sim['fittedE']:.3f}</strong>; the withheld 3,000-m game point then misses by <strong>{sim['levels'][1]['residualSeconds']:+.2f} s</strong>. This fit is <strong>NOT</strong> a verified historical Oswald factor or an excuse to assume the Spitfire is a turn fighter; actual IXe armament/mass and IAS corrections are unmatched. Live charts retain the adjustable global e, unless you explicitly change it.</p>
<div class="scroll"><table><thead><tr><th>Altitude m</th><th>IL-2 IAS km/h</th><th>IL-2 turn s</th><th>Base model s</th><th>Game-conditioned e s</th><th>Scenario role</th></tr></thead><tbody>{''.join(turn)}</tbody></table></div>
<p><strong>Next genuine physics step:</strong> find the installed <em>Hamilton Standard K-6523A-24</em> blade/pitch J/Cp/η data for the Mustang and the comparable Rotol map; without them, the common heuristic η is a placeholder. Now we also know to investigate **speed-dependent manifold pressure / supercharger ram recovery** on the P-51 and Bf 109 before trying more power multipliers. The four-aircraft solver is implemented; no unverified engine-ram law has been enabled by default.</p>
<p class="micro"><strong>Period documents:</strong> <a href="https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html">A&amp;AEE original BS.543, Tables II and V</a>, <a href="https://stephentaylorhistorian.com/wp-content/uploads/2020/04/spitfire-ix-xi-xvi.pdf">RAF original pilot notes A.P.1565J</a>, <a href="https://ntrs.nasa.gov/citations/19930093312">NACA 1944 propeller efficiency charts</a>. <strong>Simulator cross-checks:</strong> <a href="https://forum.il2sturmovik.com/topic/25993-aircraft-flight-and-technical-specifications-and-operational-details/">IL-2 developer Mk IXe figures</a> and <a href="https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-spitfire_flight_manual_en/">DCS LF Mk IX manual</a>. Reproduce with <code>node spitfire_audit_v20.cjs --write</code> and <code>node test_spitfire_v20.cjs</code>.</p>
</section>'''

page=re.sub(r'(<script id="cases" type="application/json">).*?(</script>)',
            lambda m:m.group(1)+cases+m.group(2),page,count=1,flags=re.S)
page=re.sub(r'(<script>/\* Universal Model v0\.2 ).*?(</script>)',
            lambda m:'<script>'+physics+m.group(2),page,count=1,flags=re.S)
once('Universal Three-Aircraft Model · Clean Physics v1.9 | Power Accounting Audit',
     'Universal Four-Aircraft Model · Clean Physics v2.0 | Spitfire & Speed-Sensitive Boost', 'browser title')
once('<h1>Three aircraft.<br/>One calculation engine.</h1>',
     '<h1>Four aircraft.<br/>One calculation engine.</h1>','hero')
once('Bf 109 F-4 • P-47B • P-51B-15. Shared physics',
     'Bf 109 F-4 • P-47B • P-51B-15 • Spitfire LF Mk IXc. Shared physics','tagline')
once('<nav><a href="#v19">','<nav><a href="#v20">v2.0 Spitfire &amp; manifold-pressure discovery</a><a href="#v19">','nav')
once('<section class="panel" id="v19">',panel+'\n<section class="panel" id="v19">','audit panel')
once("colors={bf109f4:'#f2c47c',p47b:'#88bcdf',p51b:'#a6dab3'},ids=['bf109f4','p47b','p51b']",
     "colors={bf109f4:'#f2c47c',p47b:'#88bcdf',p51b:'#a6dab3',spitfire_lfix_bs543:'#e5a9be'},ids=['bf109f4','p47b','p51b','spitfire_lfix_bs543']",'live 4-plane lists')
once('<option value="bf109f4">Bf 109 F-4 · Rechlin-based published synthesis</option></select>',
     '<option value="bf109f4">Bf 109 F-4 · Rechlin-based published synthesis</option><option value="spitfire_lfix_bs543">Spitfire LF Mk IXc · BS.543 (A&amp;AEE)</option></select>',
     'validation report selector')
once('P-47B/P-51B keep the global exploratory e setting.',
     'P-47B/P-51B/Spitfire keep the global exploratory e setting. Spitfire speed reference is 7,110 lb; RAF climb test was 7,485 lb.',
     'fourth airframe condition footer')
once('.cols3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}',
     '.cols3{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}',
     'responsive 4-plane cards')
once('window.UniversalThreeAircraftUI={render,model:M,data:D};',
     'window.UniversalFourAircraftUI={render,model:M,data:D};window.UniversalThreeAircraftUI=window.UniversalFourAircraftUI;',
     'UI public name')
target.write_text(page)
print(target,target.stat().st_size)
