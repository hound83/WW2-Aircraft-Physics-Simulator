"""Graph-read NACA propeller research and unmodified four-aircraft validation."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

P=Path(__file__).parent
D=json.loads((P/'naca_propeller_benchmark_results_v23.json').read_text())
plt.rcParams.update({'font.size':10,'axes.spines.top':False,
                     'axes.spines.right':False,'savefig.dpi':145})
fig,axes=plt.subplots(2,2,figsize=(14.6,10),constrained_layout=True)
blue='#2471a3';orange='#c68a2e';green='#268e72';red='#b04d50'

ax=axes[0,0]
for blade,col in [(3,orange),(4,blue)]:
 for cp,sty in [(.2,'-'),(.4,'--'),(.6,':')]:
  rows=[r for r in D['naca1941FigureCurves']['chart'] if r['blades']==blade and r['Cp']==cp]
  ax.plot([r['J'] for r in rows],[r['eta'] for r in rows],sty,color=col,linewidth=2,
          marker='o',markersize=3,label=f'{blade}-blade, Cp {cp:.1f}')
ax.axvline(1,color='#999',lw=1,alpha=.65)
ax.set(title='1. Original 1941 NACA Figure 10–12 digitization (approximate)',
       xlabel='J = true speed / (prop revolutions/s × diameter)',
       ylabel='Propulsive efficiency η',xlim=(.25,3.55),ylim=(0,1))
ax.grid(alpha=.18);ax.legend(ncol=2,fontsize=8,loc='lower right')
ax.text(.03,.03,'Read from source figures; ±0.03–0.05 η point uncertainty.\nNo VDM / Rotol / Mustang installed-blade calibration.',
 transform=ax.transAxes,fontsize=8,va='bottom',bbox={'facecolor':'#f6f8fa','edgecolor':'none','pad':5})

ax=axes[0,1]
rows=D['mustang']['sourceClimbs'];x=np.arange(2);width=.245
for i,(lab,vals,col) in enumerate([
 ('Wright Field 1944',[r['sourceClimbFpm'] for r in rows],red),
 ('Original C',[r['baselineC']['climbFpm'] for r in rows],blue),
 ('NACA N, speed-reanchored',[r['nacaNWithOriginalSpeedReanchor']['climbFpm'] for r in rows],green),
]):
 pos=x+(i-1)*width;ax.bar(pos,vals,width,color=col,label=lab)
 for px,py in zip(pos,vals):ax.text(px,py+65,f'{py:.0f}',ha='center',fontsize=8)
ax.set(title='2. Mustang: source-informed propeller does NOT fix climb',
       xticks=x,xticklabels=['67 inHg','75 inHg'],ylabel='Best climb at 2,200 ft (ft/min)',
       ylim=(0,5100))
ax.grid(axis='y',alpha=.18);ax.set_axisbelow(True);ax.legend(loc='upper left',fontsize=8)

ax=axes[1,0]
turn=D['bf109']['sourceIL2TurnTimes'];alt=[r['altMeters'] for r in turn]
for lab,series,col,sty in [
 ('IL-2 F-4 reference',[r['sourceIL2Seconds'] for r in turn],red,'o-'),
 ('Greg drag polar + C',[r['C']['seconds'] for r in turn],blue,'s--'),
 ('Greg drag polar + NACA N',[r['N']['seconds'] for r in turn],green,'d-')]:
 ax.plot(alt,series,sty,color=col,lw=2,ms=7,label=lab)
ax.set(title='3. F-4 sustained 360° turns at 270 km/h IAS≈CAS',
       xlabel='Altitude (m)',ylabel='Turn time (seconds)',xticks=[0,3000],ylim=(18,28))
ax.grid(alpha=.18);ax.legend(fontsize=9)
ax.text(.03,.03,'NACA N: 20.33 / 26.01 s\nIL-2: 20.30 / 26.10 s (secondary).',
 transform=ax.transAxes,va='bottom',fontsize=9,bbox={'facecolor':'#e9f6f0','edgecolor':'none','pad':5})

ax=axes[1,1]
speed=D['bf109']['speed'];xs=np.arange(3)
vals=[speed['CwithGregPolar'],speed['NwithGregPolar'],speed['historicalCombatTasMph']]
ax.bar(xs,vals,color=[blue,green,red],width=.57)
for x0,y0 in zip(xs,vals):ax.text(x0,y0+2,f'{y0:.1f}',ha='center',fontsize=11)
ax.set(title='4. F-4 top speed check remains independent of turn fit',
       xticks=xs,xticklabels=['C + Greg polar','NACA N + Greg polar','Rechlin combat source'],
       ylabel='Sea-level combat top speed (mph TAS)',ylim=(0,360))
ax.grid(axis='y',alpha=.18);ax.set_axisbelow(True)
ax.text(.03,.05,'NACA N closes ~5 of 9.5 mph gap but still\nmisses 325 mph. No CD₀/engine rating tuned.',
 transform=ax.transAxes,va='bottom',fontsize=9,bbox={'facecolor':'#fff3df','edgecolor':'none','pad':5})
fig.patch.set_facecolor('white')
fig.suptitle('EUROPEAN AIR WAR v2.3 / NACA original propeller curves — source-first audit',
 fontsize=16,fontweight='bold')
out=P/'naca_flight_power_comparison_v23.png';fig.savefig(out,bbox_inches='tight',facecolor='white')
print(out)
