"""Render the numeric v1.5 diagnostic, never inferring historical turn figures."""
from pathlib import Path
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE=Path(__file__).parent
data=json.loads((HERE/'cross_aircraft_results_v15.json').read_text())
rows=data['profiles']
names=[p['profile'] for p in rows]
blue='#216ca5'; orange='#d46c3c'; green='#267a65'; grey='#677888'; ink='#203448'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':9.8})
fig,axes=plt.subplots(2,2,figsize=(15.5,10.5),facecolor='#fcfcfd')
fig.subplots_adjust(left=.075,right=.96,bottom=.12,top=.83,wspace=.27,hspace=.44)
ax1,ax2,ax3,ax4=axes.flatten()
x=np.arange(3)

# 1: deliberately identical single-point calibrations, different withheld curves.
speed47=[p['p47']['speed']['holdoutMAEMph'] for p in rows]
speed51=[p['p51']['speed']['holdoutMAEMph'] for p in rows]
bars1=ax1.bar(x-.18,speed47,width=.35,color=blue,label='P-47B (5 withheld speeds)')
bars2=ax1.bar(x+.18,speed51,width=.35,color=orange,label='P-51B (8 withheld speeds)')
for bar in [*bars1,*bars2]:
    ax1.text(bar.get_x()+bar.get_width()/2,bar.get_height()+.15,f'{bar.get_height():.2f}',
             ha='center',va='bottom',fontsize=9,weight='bold')
ax1.set_ylim(0,12)
ax1.set_xticks(x,['A: fixed η','B: simple η(V)','C: J/Cp/tip Mach'])
ax1.set_ylabel('Mean absolute speed error (mph TAS)')
ax1.set_title('A   Cross-aircraft speed holds favor candidate C',loc='left',weight='bold',color=ink)
ax1.legend(loc='upper right',frameon=False,fontsize=8.4)

# 2: clarify that a good boost delta coexists with poor P51 absolute climb.
climb47=[p['p47']['climb']['withheldMAEFpm'] for p in rows]
p51Boost=[abs(p['p51']['climb']['boostGain']['residualFpm']) for p in rows]
p51Absolute=[p['p51']['climb']['reports'][0]['MAEFpm'] for p in rows]
for i,(vals,color,name) in enumerate([(climb47,blue,'P-47B climb MAE (4 withheld)'),
                                     (p51Boost,green,'P-51B boost-gain error'),
                                     (p51Absolute,orange,'P-51B absolute climb MAE')]):
    group=ax2.bar(x+(i-1)*.24,vals,width=.22,label=name,color=color)
    for bar in group:
        ax2.text(bar.get_x()+bar.get_width()/2,bar.get_height()+7,
                 f'{bar.get_height():.0f}',ha='center',va='bottom',fontsize=8.1)
ax2.set_xticks(x,['A','B','C'])
ax2.set_ylim(0,max(p51Absolute)*1.18)
ax2.set_ylabel('Absolute climb discrepancy (ft/min)')
ax2.set_title('B   Climb evidence: real success AND a failure',loc='left',weight='bold',color=ink)
ax2.legend(loc='upper left',frameon=False,fontsize=8)

# 3: historical 4:00 has lower provenance, never treated as a fit.
generic=[p['f4']['generic']['climb']['seconds'] for p in rows]
greg=[p['f4']['greg']['climb']['seconds'] for p in rows]
bar3=ax3.bar(x-.17,generic,width=.32,color=blue,label='e = 0.78 generic')
bar4=ax3.bar(x+.17,greg,width=.32,color=orange,label='e = 0.558 Greg-derived')
for bar in [*bar3,*bar4]:
    ax3.text(bar.get_x()+bar.get_width()/2,bar.get_height()+2,f'{bar.get_height():.1f}s',
             ha='center',va='bottom',fontsize=8.6)
ax3.axhline(240,color=ink,linestyle='--',linewidth=1.6,label='Reported 4:00* (secondary)')
ax3.set_ylim(0,305)
ax3.set_xticks(x,['A','B','C'])
ax3.set_ylabel('Climb time, 1,000 to 5,000 m (seconds)')
ax3.set_title('C   F-4 gearing correction breaks the 3:59 match',loc='left',weight='bold',color=ink)
ax3.legend(loc='upper left',frameon=False,fontsize=8.3)

# 4: show the actual and additive e/CD0 decomposition (not a historical turn observation).
s=data['turnSensitivity']['decomposition']
genericTurn=data['turnSensitivity']['generic']['degSec']
gregTurn=data['turnSensitivity']['greg']['degSec']
labels=['e=.78 baseline','Change e only','Re-fit CD0','e=.558 result']
xs=np.arange(4)
ax4.bar(0,genericTurn,color=blue,width=.60)
ax4.bar(1,s['eChangeAtFrozenCd0DegSec'],bottom=genericTurn,color=orange,width=.60)
ax4.bar(2,s['followOnCd0RefitDegSec'],bottom=genericTurn+s['eChangeAtFrozenCd0DegSec'],
        color=green,width=.60)
ax4.bar(3,gregTurn,color=orange,width=.60)
ax4.plot([0,1,2,3],
         [genericTurn,genericTurn+s['eChangeAtFrozenCd0DegSec'],gregTurn,gregTurn],
         color=grey,linewidth=1.2,linestyle=':',zorder=0)
for i,v in [(0,genericTurn),(3,gregTurn)]:
    ax4.text(i,v+.21,f'{v:.2f}°/s',ha='center',weight='bold',fontsize=9.3)
ax4.text(1,16.5,f'{s["eChangeAtFrozenCd0DegSec"]:+.2f}',ha='center',color=ink,weight='bold')
ax4.text(2,15.5,f'{s["followOnCd0RefitDegSec"]:+.3f}',ha='center',color=ink,weight='bold')
ax4.set_xticks(xs,labels)
ax4.set_ylim(0,20)
ax4.set_ylabel('Calculated sustained turn (degrees/second)')
ax4.set_title('D   Turn spread is induced drag, not anchor CD0',loc='left',weight='bold',color=ink)

for ax in axes.flat:
    ax.grid(axis='y',color='#e6edf3',linewidth=.75)
    ax.set_axisbelow(True)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

fig.suptitle('European Air War | Clean physics v1.5',x=.075,y=.963,ha='left',
             fontsize=21,weight='bold',color=ink)
fig.text(.075,.909,'Correct DB601E propeller gearing • shared propeller candidates • held-out flight tests • explicit missing turn-polar evidence',color=grey,fontsize=10.1)
fig.text(.075,.063,'* F-4 four-minute Rechlin climb is still an unverified secondary numerical quotation. The real F-4 sustained-turn polar is NOT measured.',color='#a1572c',fontsize=9.7)
fig.text(.075,.035,'Every prop candidate is fitted to exactly one speed anchor per aircraft. P-47B cooling/configuration loss is fitted to one separate climb point.',color=grey,fontsize=9.4)
target=HERE/'cross_aircraft_v15.png'
fig.savefig(target,dpi=165,facecolor=fig.get_facecolor())
print(target)
