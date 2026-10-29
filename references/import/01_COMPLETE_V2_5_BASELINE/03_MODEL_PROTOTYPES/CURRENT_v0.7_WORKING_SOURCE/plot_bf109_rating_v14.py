"""Render exact v1.4 model outputs; chart values are read from generated JSON."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

HERE=Path(__file__).parent
d=json.loads((HERE/'bf109_rating_results_v14.json').read_text())
generic,greg=d['variants']
blue='#2469a8'
orange='#d36335'
dark='#233449'
grey='#697789'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10})
fig, axes=plt.subplots(2,2,figsize=(15,10),facecolor='#fbfcfe')
fig.subplots_adjust(left=.08,right=.965,bottom=.11,top=.825,wspace=.25,hspace=.45)
(a,b),(c,e)=axes

# A: 325-mph combat anchor, an honest 336-mph emergency withheld check.
positions=[0,1]
for v,color,label in [(generic,blue,'Generic e = 0.78'),(greg,orange,'Greg-derived e = 0.558')]:
  speeds=[v['seaLevel']['combatMph'],v['seaLevel']['emergencyMph']]
  a.plot(positions,speeds,marker='o',markersize=7,linewidth=2.6,color=color,label=label)
a.scatter([0,1],[325,336],color=dark,marker='D',s=62,zorder=5,label='Published 325 / 336 mph')
a.annotate('Unfitted: 336 mph',xy=(1,336),xytext=(.61,330.6),color=dark,
           arrowprops={'arrowstyle':'->','color':dark},fontsize=9.3)
a.set_xticks(positions,['Combat (30 min)','Emergency (1 min)'])
a.set_ylim(319,346)
a.set_ylabel('Maximum true airspeed (mph)')
a.set_title('A   Source power setting resolved',loc='left',fontweight='bold',color=dark)
a.legend(loc='upper left',fontsize=8.6,frameon=False)

# B: a second observable, but only weakly authenticated.
for i,(v,color,label) in enumerate([(generic,blue,'Generic e = 0.78'),(greg,orange,'Greg e = 0.558')]):
  minutes=v['combatClimbTime1000to5000m']['elapsedS']/60
  b.barh(i,minutes,color=color,height=.42,label=label)
  b.text(minutes-.04,i,f'{minutes:.2f} min',va='center',ha='right',fontweight='bold',color='white')
b.axvline(4.0,color=dark,linestyle='--',linewidth=1.5)
b.text(4.025,1.25,'Reported F-4: 4:00*',color=dark,fontsize=9)
b.set_yticks([0,1],['Generic e = .78','Greg e = .558'])
b.invert_yaxis()
b.set_xlim(0,4.5)
b.set_xlabel('Integrated climb 1,000 to 5,000 m (minutes)')
b.set_title('B   Climb sensitivity (combat power)',loc='left',fontweight='bold',color=dark)

# C: two polar hypotheses still lead to materially different turn rates.
for v,color in [(generic,blue),(greg,orange)]:
  for key,style,label in [('combatTurn','-','combat 30 min'),('emergencyTurn','--','emergency 1 min')]:
    rows=v['curves'][key]
    c.plot([p['easMph'] for p in rows],
           [np.nan if p['turnDegSec'] is None else p['turnDegSec'] for p in rows],
           color=color,linestyle=style,linewidth=2.2,
           label=('e=.78' if color==blue else 'e=.558')+' / '+label)
c.axvline(170,color=grey,linestyle=':',linewidth=1.1)
c.set_xlim(110,270)
c.set_xlabel('Equivalent airspeed (mph EAS), 5,000 ft')
c.set_ylabel('Calculated power-balanced turn (degrees/s)')
c.set_title('C   Low-speed polar remains unverified',loc='left',fontweight='bold',color=dark)
c.legend(loc='upper right',fontsize=8.2,frameon=False,ncol=2)

# D: show the ABSOLUTE P47/P51 withheld flight-test residuals.
for key,color,label in [('p47b',blue,'P-47B / 5 withheld'),('p51b',orange,'P-51B / 8 withheld')]:
  reg=d['otherAircraftRegression'][key]
  rows=[r for r in reg['rows'] if r['altFt']!=reg['calibration']['altFt']]
  e.plot([p['altFt']/1000 for p in rows],[p['residualMph'] for p in rows],
         color=color,linewidth=1.7,marker='o',markersize=5,label=label)
e.axhline(0,color=grey,linewidth=1)
e.set_xlim(0,35)
e.set_ylabel('Model minus flight report (mph TAS)')
e.set_xlabel('Altitude (thousand feet)')
e.set_title('D   Withheld speed tests (P-47B and P-51B)',loc='left',fontweight='bold',color=dark)
e.legend(loc='upper left',fontsize=8.8,frameon=False)

for ax in axes.flat:
  ax.grid(axis='y',color='#e8edf3',linewidth=.75)
  ax.spines['top'].set_visible(False)
  ax.spines['right'].set_visible(False)
  ax.set_axisbelow(True)

fig.suptitle('European Air War | Clean physics v1.4',x=.08,y=.96,ha='left',fontsize=22,fontweight='bold',color=dark)
fig.text(.08,.907,'Bf 109F-4 combat-power correction + unfitted emergency-speed check + climb sensitivity + unchanged Allied regressions',color=grey,fontsize=10.3)
fig.text(.08,.062,'* 4:00 climb comes from a later transcription of a 1941 Rechlin comparison; original numeric table has not been inspected. Not used to fit e.',color='#a65a31',fontsize=9.2)
fig.text(.08,.034,'Only the Bf 109F-4 CD0 was refitted at its corrected combat anchor. Propeller efficiency, e and CLmax remain assumptions; never extend power beyond sourced altitude.',color=grey,fontsize=9)
out=HERE/'bf109_rating_v14.png'
fig.savefig(out,dpi=168,facecolor=fig.get_facecolor())
print(out)
