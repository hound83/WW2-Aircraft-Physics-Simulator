"""Draw source-qualified v1.7 shared physics / F4 conditional-sim check."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

P = Path(__file__).parent
d = json.loads((P / 'joint_low_speed_results_v17.json').read_text())
plt.rcParams.update({'font.size': 10, 'axes.spines.top': False,
                     'axes.spines.right': False, 'figure.facecolor': '#f4f7f7'})
fig = plt.figure(figsize=(14, 7.1), layout='constrained')
gs = fig.add_gridspec(2, 2, width_ratios=[1.48, 1], hspace=.25)
colors = {'generic': '#bd5f5f', 'greg': '#6a8aa5', 'conditioned': '#268a77'}
names = {'generic': 'Generic e = .780', 'greg': 'Greg e = .558',
         'conditioned': f'Conditional fit e = {d["f4WorkingSimulatorConditionedE"]:.3f}'}
for j, curve in enumerate(d['f4TurnCurves']):
    ax = fig.add_subplot(gs[j, 0])
    for tag in ['generic', 'greg', 'conditioned']:
        xs = [p['kmh'] for p in curve['points']]
        ys = [p[tag] for p in curve['points']]
        ax.plot(xs, ys, color=colors[tag], lw=2.3,
                label=names[tag] if j == 0 else None)
    ax.scatter(270, curve['reportedReferenceSeconds'], marker='D', color='black',
               s=65, zorder=6, label='IL-2 in-game reference' if j == 0 else None)
    ax.axvline(270, color='#b9c0c2', lw=1, ls='--')
    ax.set(xlabel='IAS treated as CAS proxy · km/h', ylabel='Sustained 360° turn · s',
           title='Bf 109 F-4 · sea level' if j == 0 else 'Bf 109 F-4 · 3,000 m')
    ax.grid(color='#dfe5e5', alpha=.8)
    ax.set_ylim(bottom=13, top=39)
    if j == 0:
        ax.legend(frameon=False, loc='upper right', fontsize=8)

ax = fig.add_subplot(gs[:, 1])
rows = d['p51Climb']
labels = ['67 inHg', '75 inHg']
x = np.arange(2)
w = .34
b1 = ax.bar(x-w/2, [r['observedFpm'] for r in rows], width=w,
            color='#315f80', label='Wright Field, May 1944')
b2 = ax.bar(x+w/2, [r['modelFpm'] for r in rows], width=w,
            color='#b87f50', label='Shared model C (unchanged)')
ax.bar_label(b1, labels=[f'{z["observedFpm"]:,.0f}' for z in rows], padding=5, fontsize=11)
ax.bar_label(b2, labels=[f'{z["modelFpm"]:,.0f}' for z in rows], padding=5, fontsize=11)
ax.set_xticks(x, labels)
ax.set_ylim(0, 4900)
ax.set(ylabel='Climb · ft/min', title='P-51B · absolute low-speed power remains short')
ax.grid(axis='y', color='#dfe5e5', alpha=.8)
ax.set_axisbelow(True)
ax.legend(frameon=False, loc='upper left', fontsize=9)
ax.text(.5, .07, 'Source − model: 419 / 401 ft/min\n≈ 119 / 114 propulsive hp',
        ha='center', va='bottom', transform=ax.transAxes, fontsize=10,
        bbox={'boxstyle': 'round', 'facecolor': '#fff3e5', 'edgecolor': 'none', 'pad': 1.0})

fig.suptitle('v1.7 | Coupled low-speed power & sustained-turn diagnostic', fontsize=17, weight='bold')
target = P / 'joint_low_speed_v17.png'
fig.savefig(target, dpi=150, bbox_inches='tight', facecolor=fig.get_facecolor())
print('generated', target)
