"""Diagnostic v1.9: source markers vs exhaustive dimensioned scenarios.
All nonzero exhaust coefficients are hypothetical. No fit performed.
"""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
P=Path(__file__).parent
D=json.loads((P/'installed_power_results_v19.json').read_text())
rows=D['scenarios']
force=[r['p51AnchorExhaustLbf'] for r in rows]
fig,ax=plt.subplots(2,2,figsize=(14.8,9.5),facecolor='#f7f9fc')
for p in ax.flat:
    p.set_facecolor('#ffffff')
    p.grid(color='#dce4ee',alpha=.9,lw=.7)
    p.spines['top'].set_visible(False)
    p.spines['right'].set_visible(False)
a=ax[0,0]
a.plot(force,[r['p51Climb67']['fpm'] for r in rows],marker='o',color='#366b9c',label='Model 67 inHg')
a.plot(force,[r['p51Climb75']['fpm'] for r in rows],marker='s',color='#d57b48',label='Model 75 inHg')
a.axhline(3820,color='#366b9c',ls='--',lw=1.6,label='1944 actual 67: 3,820')
a.axhline(4380,color='#d57b48',ls='--',lw=1.6,label='1944 actual 75: 4,380')
a.set(title='P-51B absolute climb — 2,200 ft',xlabel='Hypothetical exhaust thrust at 67-inHg sea-level anchor (lbf)',ylabel='Rate of climb (ft/min)')
a.legend(fontsize=8,loc='lower right')
a=ax[0,1]
a.plot(force,[r['p47SpeedHoldouts']['maeMph'] for r in rows],marker='o',color='#923963',label='P-47B (5 wartime holdouts)')
a.plot(force,[r['p51SpeedHoldouts']['maeMph'] for r in rows],marker='s',color='#3e8279',label='P-51B (8 wartime holdouts)')
a.set(title='Speed evidence degrades when exhaust correction increases',xlabel='Hypothetical exhaust thrust at P-51B sea-level anchor (lbf)',ylabel='Absolute speed error MAE (mph)')
a.legend(fontsize=9)
a=ax[1,0]
a.plot(force,[r['f4SLTurnSeconds'] for r in rows],marker='o',color='#457caf',label='Model at sea level')
a.plot(force,[r['f4TurnAt3000mSeconds'] for r in rows],marker='s',color='#b26e55',label='Model at 3,000m')
a.axhline(20.3,ls='--',color='#457caf',label='IL-2 sea level: 20.3s (fit source)')
a.axhline(26.1,ls='--',color='#b26e55',label='IL-2 3,000m: 26.1s (holdout)')
a.set(title='Bf 109F-4 sustained 360° turn (simulator check)',xlabel='Hypothetical exhaust thrust at P-51B sea-level anchor (lbf)',ylabel='Time (s; lower = faster)')
a.legend(fontsize=8)
a=ax[1,1]
a.plot(force,[r['p51BoostGainFpm'] for r in rows],marker='o',color='#77549c',label='Model 75 minus 67 inHg')
a.axhline(560,color='#343e50',ls='--',label='1944 measured boost gain: 560 ft/min')
a2=a.twinx()
a2.plot(force,[r['p51Fig5']['firstFourMaeBhp'] for r in rows],color='#cb8f2b',marker='x',label='Figure 5 four-point MAE')
a.set(title='A correction improves one test while breaking another',xlabel='Hypothetical exhaust thrust at P-51B sea-level anchor (lbf)',ylabel='67→75 inHg climb-rate gain (ft/min)')
a2.set_ylabel('Fig. 5 power-required MAE (bhp)',color='#a97818')
a.legend(fontsize=8,loc='upper left')
a2.legend(fontsize=8,loc='lower right')
fig.suptitle('v1.9 | Installed-power accounting: shared scenario is NOT a validated correction',fontsize=17,fontweight='bold',color='#263543')
fig.text(.5,.015,'Zero exhaust = unchanged v1.8 candidate C. All nonzero thrust cases are deliberately hypothetical; each top-speed drag anchor is re-solved.',ha='center',fontsize=10,color='#667381')
fig.tight_layout(rect=(0,.035,1,.95),h_pad=2.1,w_pad=2.1)
fig.savefig(P/'installed_power_diagnostic_v19.png',dpi=155,bbox_inches='tight')
print(P/'installed_power_diagnostic_v19.png')
