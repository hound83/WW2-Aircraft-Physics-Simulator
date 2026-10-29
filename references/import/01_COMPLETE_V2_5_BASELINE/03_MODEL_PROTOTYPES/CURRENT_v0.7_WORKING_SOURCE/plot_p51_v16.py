"""Source-rpm-aware P-51B Figure 5 comparison. Reads JSON; does not fit.

Graph-reading error bars are not measured statistical confidence intervals.
"""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

root = Path(__file__).resolve().parent
v = json.loads((root / 'p51_drag_results_v16.json').read_text())
plt.rcParams.update({'font.family':'DejaVu Sans', 'axes.spines.top':False, 'axes.spines.right':False})
fig, (a, b) = plt.subplots(1, 2, figsize=(16, 6.4), gridspec_kw={'width_ratios':[1.4, 1]})
fig.patch.set_facecolor('#f6f8f8')
for ax in (a,b):
    ax.set_facecolor('white')
    ax.grid(color='#e0e7e7', linewidth=.85)
    ax.set_axisbelow(True)

rows = v['source']['points']; speed = [p['tasMph'] for p in rows]; hp = [p['testBhp'] for p in rows]
colors = {'A':'#748b9a','B':'#e3a23b','C':'#2c739b'}
a.errorbar(speed, hp, xerr=4, yerr=35, fmt='o', markersize=8, color='#213b3c',
           ecolor='#91a3a3', capsize=3, label='1944 Wright Field Fig. 5 (approx.)', zorder=5)
for series in v['scenarios']:
    p=series['profile']; modeled=[pt['modeledRequiredBhp'] for pt in series['points']]
    a.plot(speed, modeled, marker='s', markersize=5, linestyle='--', linewidth=1.9,
           color=colors[p], label=f'Candidate {p}: source test RPM')
a.set_xlim(255,443);a.set_ylim(370,1560);a.set_xlabel('True airspeed (mph TAS)')
a.set_ylabel('Shaft power (brake horsepower)')
a.set_title('Power required · 22,400 ft · P-51B 43-24777', weight='bold', pad=15)
a.legend(loc='upper left', frameon=True, fontsize=8.6)
a.text(.02,.02,'Dots are original Figure 5 readings, not fitted data.\nLine segments connect DIFFERENT engine RPM settings.',
       transform=a.transAxes, fontsize=9, color='#465c5d')

bar_width=3.8
for offset,series in zip([-bar_width,0,bar_width],v['scenarios']):
    x=[s+offset for s in speed]
    b.bar(x,[p['residualBhp'] for p in series['points']],width=3.7,
          color=colors[series['profile']],alpha=.88,label=f"{series['profile']} (MAE {series['summary']['MAEBhp']:.0f} hp)")
b.axhline(0, color='#253d3d',linewidth=1.15)
b.set_xlim(255,445);b.set_ylim(-120,160)
b.set_xlabel('Source observation (mph TAS)')
b.set_ylabel('Model minus report (bhp)')
b.set_title('Residuals · positive means too much power required',weight='bold',pad=15)
b.legend(loc='upper left',fontsize=9)
b.text(.03,.05,'Fig. 5 graph-reading uncertainty ≈ ±35 bhp.\nTrue propulsion/drag uncertainty is larger and unknown.',
       transform=b.transAxes,fontsize=8.7,color='#465c5d')
fig.suptitle('v1.6  /  A NEW LOW- AND MID-SPEED REALITY CHECK', fontsize=17,weight='bold',y=1.02,color='#143b4b')
fig.tight_layout(pad=2.0)
file=root/'p51_power_required_v16.png'
fig.savefig(file,dpi=150,bbox_inches='tight')
print('saved',file)
