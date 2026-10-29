"""Layer a reproducible v1.9 diagnosis onto frozen functional v1.8 HTML.
No re-save or overwrite of the v1.8 application; no changed default physics.
"""
from pathlib import Path
import json, base64, html

P=Path(__file__).parent
D=json.loads((P/'installed_power_results_v19.json').read_text())
src=P/'Universal_Three_Aircraft_Model_v1.8.html'
out=P/'Universal_Three_Aircraft_Model_v1.9.html'
page=src.read_text()

def td(value):
    return '<td>'+html.escape(str(value))+'</td>'
def row(values):
    return '<tr>'+''.join(td(v) for v in values)+'</tr>'
scenarios=[]
for s in D['scenarios']:
    scenarios.append(row([
        f"{s['p51AnchorExhaustLbf']:.0f}",
        f"{s['p51Climb67']['fpm']:.0f}",
        f"{s['p51Climb75']['fpm']:.0f}",
        f"{s['p51BoostGainFpm']:.0f}",
        f"{s['p51Fig5']['firstFourMaeBhp']:.1f}",
        f"{s['p47SpeedHoldouts']['maeMph']:.2f}",
        f"{s['p51SpeedHoldouts']['maeMph']:.2f}",
        f"{s['f4SLTurnSeconds']:.2f}",
        f"{s['f4TurnAt3000mSeconds']:.2f}"]))
weight=[]
for r in D['weightSensitivity']:
    weight.append(row([f"{r['weightLb']:,}",f"{r['deltaFromTakeoffLb']:,}",
        f"{r['climb67Fpm']:.0f}",f"{r['climb75Fpm']:.0f}"]))
es=[]
for r in D['oswaldSensitivity']:
    es.append(row([f"{r['e']:.2f}",f"{r['cd0']:.5f}",
        f"{r['climb67Fpm']:.0f}",f"{r['climb75Fpm']:.0f}",
        f"{r['fig5FourMaeBhp']:.1f}"]))
chart=base64.b64encode((P/'installed_power_diagnostic_v19.png').read_bytes()).decode()
cross=D['crossCheck']
f67=cross['scenarioForceToClose67Lbf']['approxSeaLevelForceLbf']
f75=cross['scenarioForceToClose75Lbf']['approxSeaLevelForceLbf']
panel=f'''<section class="panel" id="v19">
<h2>v1.9 / Why a shared exhaust-power fix fails — original P-51B climb + P-47B + Bf 109F-4</h2>
<p><strong>Outcome: baseline C retained, no magic correction installed.</strong> This is an engineering investigation of the reported 1944 P-51B <strong>3,820/4,380 ft/min</strong> maximum climb at 2,200 ft. Our unchanged model gives <strong>3,401/3,979 ft/min</strong>. The measured 67→75-inHg boost gain is <strong>560 ft/min</strong>, versus our <strong>577 ft/min</strong> — almost correct.</p>
<p><strong>Primary-source power accounting:</strong> The 20 May 1944 Wright Field report says the BHP values were <em>taken from a 3 December 1943 Packard altitude-performance chart</em>, not an in-flight torque meter. Its 9,335-lb mass is at <em>takeoff</em>, not a recorded instantaneous mass at 2,200 ft. Figure 5 cruise data are separately corrected to <strong>9,240 lb at 22,400 ft</strong>. The original Figure 5 horsepower-versus-speed data are based on part-throttle 2,100–3,000 rpm operation — they do not measure propulsive thrust.</p>
<img src="data:image/png;base64,{chart}" style="display:block;width:100%;height:auto;background:#f7f9fc;border-radius:8px;margin:12px 0" alt="v1.9: four-panel diagnostics showing why hypothetical common exhaust thrust fails across wartime Mustang climb, P-47B/P-51B speed holdouts and IL-2 Bf 109 turns"/>
<h3 style="margin-top:20px">One dimensional hypothesis: exhaust *force*, not extra shaft horsepower</h3>
<p>Trial formula: <code>usable HP = η · chart BHP + exhaust force · TAS</code>. Every row applies the <em>same force per rated BHP</em> to all three aircraft and re-derives <code>CD₀</code> from each plane's original level-speed anchor before comparing independent points. <strong>Every nonzero exhaust number below is hypothetical — none is a measured Mustang exhaust thrust.</strong> Zero is exactly the old v1.8 working C solver.</p>
<div class="scroll"><table><thead><tr><th>Trial P-51 sea-level exhaust (lbf)</th><th>P-51 67 climb fpm</th><th>P-51 75 climb fpm</th><th>Boost gain fpm (1944: 560)</th><th>P-51 Fig.5 MAE bhp</th><th>P-47 speed MAE mph</th><th>P-51 speed MAE mph</th><th>F-4 SL turn s</th><th>F-4 3km turn s</th></tr></thead><tbody>{''.join(scenarios)}</tbody></table></div>
<p>To close <em>only</em> the 67-inHg climb by this model requires about <strong>{f67:.0f} lbf</strong> source-anchored sea-level exhaust thrust; the 75-inHg case needs about <strong>{f75:.0f} lbf</strong>. They do <strong>not</strong> agree. At the 67-inch fix, the 75-inch climb overshoots; the historical 560-ft/min gain gets overstated. Meanwhile the five P-47B speed holdouts degrade from <strong>3.65</strong> to roughly <strong>14 mph MAE</strong>, and the Bf 109 turns move away from the IL-2 reference. <strong>Reject a common coefficient of this form.</strong></p>
<h3 style="margin-top:18px">Can fuel weight or induced drag close the discrepancy independently?</h3>
<div class="layout"><div><h3>Unmeasured 2,200-ft weight sensitivity</h3><div class="scroll"><table><thead><tr><th>Flight weight lb</th><th>Below takeoff lb</th><th>67 fpm</th><th>75 fpm</th></tr></thead><tbody>{''.join(weight)}</tbody></table></div></div>
<div><h3>Source-speed-reanchored Oswald-e sensitivity</h3><div class="scroll"><table><thead><tr><th>e</th><th>Cd₀</th><th>67 fpm</th><th>75 fpm</th><th>Fig5 MAE bhp</th></tr></thead><tbody>{''.join(es)}</tbody></table></div></div></div>
<p>Even hypothetically subtracting <strong>200 lb</strong> by 2,200 ft improves the 67-inch climb to just <strong>3,501 ft/min</strong>; increasing e all the way to the idealized <strong>1.00</strong> yields only <strong>3,529 ft/min</strong>. Neither is a documented physical correction, nor solves the problem.</p>
<p><strong>Where we go next:</strong> reconstruct the source-specific Hamilton Standard four-bladed propeller's installed <em>J/Cp/η</em> map and the Merlin exhaust/cooling contributions with traceable source limits. NACA's 1944 propeller-efficiency charts are a useful method, but without the applicable blade geometry and pitch schedule do not deliver an aircraft-specific numerical η. Our current four low/mid 22,400-ft Figure 5 markers require more power than the model predicts, and the derived η at 318 mph would be implausibly high if the old polar were assumed exact. That is a coupled drag-and-installation question, not proof that simply turning up η fixes it.</p>
<p class="micro"><strong>Historical sources:</strong> <a href="https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html">Wright Field Eng-47-1749-A, 20 May 1944</a>, especially sections III/VC/VD; <a href="https://ntrs.nasa.gov/citations/19930093312">NACA ACR L4I29, September 1944: Charts for Determining Propeller Efficiency</a>; <a href="https://ntrs.nasa.gov/citations/20090014842">NACA SR-139, 1940: radial-engine exhaust thrust experiment</a> — DIFFERENT engine, its numeric thrust benefit cannot be transferred to the Mustang. <strong>Sim:</strong> IL-2 109F-4 20.3/26.1s points, one fitted at SL, 3km withheld; not wartime flight data. Reproduce from <code>node installed_power_audit_v19.cjs --write</code> and <code>node test_installed_power_v19.cjs</code>.</p>
</section>'''
page=page.replace('Clean Physics v1.8 Experimental','Clean Physics v1.9 | Power Accounting Audit')
page=page.replace('v1.8 physics trial + IL-2/DCS comparison', 'v1.8 physics trial + IL-2/DCS comparison')
page=page.replace('<nav><a href="#v18">','<nav><a href="#v19">v1.9 installed-power audit</a><a href="#v18">',1)
needle='<section class="panel" id="v18">'
if needle not in page: raise SystemExit('Missing v1.8 insertion anchor')
page=page.replace(needle,panel+'\n'+needle,1)
out.write_text(page)
print(f'{out}: {out.stat().st_size/1024/1024:.2f} MiB')
