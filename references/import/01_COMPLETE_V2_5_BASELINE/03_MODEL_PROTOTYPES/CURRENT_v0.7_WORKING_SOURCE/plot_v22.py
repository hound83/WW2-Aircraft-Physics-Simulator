"""Publication-sized independent-source diagnostics for the v2.2 HTML app."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

P=Path(__file__).parent
D=json.loads((P/'greg_power_budget_results_v22.json').read_text())
plt.rcParams.update({'font.size':10, 'axes.spines.top':False,
                     'axes.spines.right':False, 'savefig.dpi':150})
fig,axes=plt.subplots(2,2,figsize=(14.6,10.4),constrained_layout=True)
bg='#ffffff';fig.patch.set_facecolor(bg)
blue='#216ba4';orange='#d08a33';green='#29866c';red='#bb4a48'

ax=axes[0,0]
shapes=D['gregPowerAvailable']['normalizedComparison']
x=[n['speedMph'] for n in shapes]
ax.plot(x,[n['gregF4'] for n in shapes],'-o',color=orange,label='Greg F-4 available hp / 1,058',lw=2,ms=5)
ax.plot(x,[n['gregP47D'] for n in shapes],'-s',color=blue,label='Greg P-47D available hp / 2,210',lw=2,ms=5)
ax.set(title='1. Greg tables share almost the same normalized power curve',
       xlabel='True airspeed in Greg sheets (mph; presumed TAS)',ylabel='Fraction of high-speed power plateau',ylim=(.73,1.04))
ax.grid(alpha=.22);ax.legend(loc='lower right',fontsize=9)
ax.text(.02,.97,'0.76 percentage-point mean absolute difference\n(100–225 mph; six common nodes)',
 transform=ax.transAxes,va='top',fontsize=9,bbox={'facecolor':'#f3f7fa','edgecolor':'none','pad':7})

ax=axes[0,1]
cases=D['mustang']['cases'];xc=np.arange(len(cases));bw=.21
data=[('USAAF measured',[r['historicalClimbFpm'] for r in cases],red),
      ('Current C',[r['original']['climbFpm'] for r in cases],blue),
      ('Greg-P-47D hypothesis, fixed drag',[r['gregTransferFixedPolar']['climbFpm'] for r in cases],orange),
      ('Greg hypothesis, speed-recalibrated',[r['gregTransferRefitToOriginalSeaLevelSpeed']['climbFpm'] for r in cases],green)]
for i,(label,vals,color) in enumerate(data):
 off=(i-1.5)*bw
 ax.bar(xc+off,vals,width=bw,label=label,color=color,alpha=.93)
 for xx,yy in zip(xc+off,vals):ax.text(xx,yy+28,f'{yy:.0f}',ha='center',va='bottom',fontsize=8,rotation=0)
ax.set(title='2. Mustang climb at 2,200 ft: useful power still missing',
       xticks=xc,xticklabels=['67 inHg','75 inHg'],ylabel='Best climb ft/min',ylim=(0,5100))
ax.grid(axis='y',alpha=.2);ax.set_axisbelow(True);ax.legend(loc='upper left',fontsize=8)

ax=axes[1,0]
anc=D['anchorCrossChecks'];air=['p51b','bf109f4','p47b','spitfire_lfix_bs543']
labels=['P-51B-15','Bf 109 F-4','P-47B','Spitfire LF IXc']
delta=[anc[k]['gregMinusSourceMph'] for k in air]
ax.barh(labels[::-1],delta[::-1],color=[green,blue,orange,red][::-1],height=.52)
for j,d in enumerate(delta[::-1]):ax.text(d+.12,j,f'+{d:.1f}',va='center',fontsize=10)
ax.axvline(0,color='#333',lw=.9)
ax.set(title='3. Global Greg power transfer breaks fitted speed anchors',
       xlabel='Extra modeled level speed at original source anchor (mph)',xlim=(0,6.8))
ax.grid(axis='x',alpha=.2);ax.set_axisbelow(True)

ax=axes[1,1]
turn=D['bf109']['turns'];alts=[t['altMeters'] for t in turn]
series=[('IL-2 reference',[t['IL2Seconds'] for t in turn],red,'o-'),
 ('Generic e=.78, speed-fitted',[t['modelGenericE078Seconds'] for t in turn],blue,'s--'),
 ('Greg polar + current prop C',[t['gregPolarWithCEtaSeconds'] for t in turn],green,'^-'),
 ('Greg polar + transferred P-47D G',[t['gregPolarWithP47DTransferredEtaSeconds'] for t in turn],orange,'d-')]
for label,vals,color,style in series:ax.plot(alts,vals,style,lw=2,ms=8,label=label,color=color)
ax.set(title='4. F-4 turn: Greg drag helps, high-speed check still needed',
       xlabel='Altitude (m); 270 km/h IAS treated ≈ CAS',ylabel='360° sustained turn time (s)',ylim=(15,29),xticks=[0,3000])
ax.grid(alpha=.22);ax.legend(loc='upper left',fontsize=8)
ax.text(.04,.06,'Greg polar + current C: combat top speed 315.5 mph\nvs 325 mph reference; NOT a complete fit.',
 transform=ax.transAxes,fontsize=9,va='bottom',bbox={'facecolor':'#fff5e8','edgecolor':'none','pad':6})

fig.suptitle('EUROPEAN AIR WAR / v2.2 — Greg power & Mustang energy-budget cross-check',
             fontsize=17,fontweight='bold')
out=P/'greg_power_budget_v22.png';fig.savefig(out,bbox_inches='tight',facecolor='white')
print(out)
