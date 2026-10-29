"""Generate an exact model-output chart; no artistic/inferred curves."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

HERE=Path(__file__).parent
d=json.loads((HERE/'bf109_anchor_results_v13.json').read_text())
variants=d['variants']
colors={'combat_anchor_generic_e':'#206dbc',
        'combat_anchor_greg_e':'#d55324',
        'emergency_anchor_generic_e':'#206dbc',
        'emergency_anchor_greg_e':'#d55324'}
desc={'combat_anchor_generic_e':'325 mph = combat | e = 0.78',
      'combat_anchor_greg_e':'325 mph = combat | Greg e = 0.558',
      'emergency_anchor_generic_e':'325 mph = emergency | e = 0.78',
      'emergency_anchor_greg_e':'325 mph = emergency | Greg e = 0.558'}

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10.5})
fig=plt.figure(figsize=(14,10),facecolor='#fbfcfe')
gs=fig.add_gridspec(2,2,left=.085,right=.98,bottom=.115,top=.775,wspace=.20,hspace=.40)
ax_a=fig.add_subplot(gs[0,0]);ax_b=fig.add_subplot(gs[0,1]);ax_c=fig.add_subplot(gs[1,:])
for v in variants:
  col=colors[v['id']]
  style='-' if v['anchorRating']=='combat' else '--'
  label=desc[v['id']]
  ax_a.plot(['Combat','Emergency'],[v['seaLevel']['combatMph'],v['seaLevel']['emergencyMph']],
            color=col,linestyle=style,linewidth=2.4,marker='o',markersize=7,label=label)
  ax_b.plot([x['altFt'] for x in v['emergencySpeedCurve']],
            [x['vmaxMph'] for x in v['emergencySpeedCurve']],
            color=col,linestyle=style,linewidth=2.3,label=label)
  ax_c.plot([x['easMph'] for x in v['turnCurveAt5000ft']],
            [np.nan if x['sustainedDegSec'] is None else x['sustainedDegSec']
             for x in v['turnCurveAt5000ft']],
            color=col,linestyle=style,linewidth=2.3,label=label)
ax_a.axhline(325,color='#555a64',linestyle=':',linewidth=1.6)
ax_a.text(.03,325.9,'325 mph source figure (power mode ambiguous)',color='#555a64',fontsize=9)
ax_a.set_ylabel('Predicted maximum TAS (mph)')
ax_a.set_ylim(302,348)
ax_a.set_title('A   Power-mode identification comes first',loc='left',fontweight='bold')
ax_b.set_xlabel('Altitude (ft)')
ax_b.set_ylabel('Emergency-power maximum TAS (mph)')
ax_b.set_title('B   Same e, different anchor power mode',loc='left',fontweight='bold')
ax_b.set_xlim(0,15000)
ax_c.set_xlim(100,300)
ax_c.axvline(170,color='#777777',linestyle=':',linewidth=1.3)
ax_c.set_xlabel('Equivalent airspeed (mph EAS) | 5,000 ft')
ax_c.set_ylabel('Calculated sustained turn (deg/s)')
ax_c.set_title('C   Turn output is highly sensitive to e, not constrained by Vmax',loc='left',fontweight='bold')
for ax in (ax_a,ax_b,ax_c):
  ax.grid(color='#e6ebf2',linewidth=.8)
  ax.spines['top'].set_visible(False);ax.spines['right'].set_visible(False)
for v in variants:
  point=v['turnAt5000ft170mphEAS']['sustainedDegSec']
  ax_c.scatter(170,point,color=colors[v['id']],edgecolors='white',linewidth=.8,zorder=4,s=55)
fig.suptitle('Bf 109F-4  |  325-mph calibration audit',x=.083,y=.958,ha='left',fontsize=20,fontweight='bold')
fig.text(.085,.903,'Four conditional cases. Same airframe, weight, engine curves and propeller model; only anchor power-mode label and Oswald e vary.',fontsize=10.6,color='#475569')
handles,labels=ax_a.get_legend_handles_labels()
fig.legend(handles,labels,loc='upper center',bbox_to_anchor=(.53,.859),ncol=2,frameon=False,fontsize=9.7)
fig.text(.085,.052,'Important: 325 mph is not confirmed as an independently measured F-4 speed at either rating. Greg e is inferred from a worksheet, not a flight-test polar.',fontsize=10,color='#a14929')
fig.text(.085,.027,'The F-4 engine-power data stop at 15,748 ft; P-47B and P-51B speed regressions are unchanged.  CLmax remains assumed.',fontsize=9.8,color='#465065')
out=HERE/'bf109_anchor_v13.png'
fig.savefig(out,dpi=175,facecolor=fig.get_facecolor())
print(out)
