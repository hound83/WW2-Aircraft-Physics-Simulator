"""Controlled P-47 numerical diagnostics; plots exact calculated data only."""
import json
import subprocess
from pathlib import Path
import matplotlib.pyplot as plt

path=Path(__file__).resolve().parent
r=subprocess.run(['node','p47_control_v12.cjs','--json'],cwd=path,check=True,text=True,capture_output=True)
d=json.loads(r.stdout)
plt.style.use('seaborn-v0_8-whitegrid')
fig,ax=plt.subplots(1,2,figsize=(13,5.5),layout='constrained')

# No import from the solver required: the source values below are generated
# from the 4, source-labelled scenario rows in the machine-readable result.
speeds=[100,125,150,175,200,225,250,275,300,325,350,375]
greg_rows=json.loads((path/'cases.json').read_text())['greg']['p47d28']['reference']
etas=[r[4]/2600 for r in greg_rows]
# Required-power curves derived from unchanged qSCD0 and induced terms. Use
# a known 200-mph reference with P_par~V^3 and P_ind~1/V for any speed.
def required(reference,speed):
 return reference['parasiteHp']*(speed/200)**3+reference['inducedHp']*(200/speed)

greg_point=next(s['at200'] for s in d['scenarios'] if s['polarName']=='Greg_D')
b_point=next(s['at200'] for s in d['scenarios'] if s['polarName']=='B_anchor')
ax[0].plot(speeds,[required(greg_point,v) for v in speeds],color='#b23e3b',lw=2,label='Greg D-style polar: required hp')
ax[0].plot(speeds,[required(b_point,v) for v in speeds],color='#df8983',lw=2,linestyle='--',label='P-47B-derived polar: required hp')
ax[0].plot(speeds,[eta*2000 for eta in etas],color='#315e99',lw=2,label='2,000 bhp delivered')
ax[0].plot(speeds,[eta*2600 for eta in etas],color='#83a9d1',lw=2,linestyle='--',label='2,600 bhp delivered')
for scene in d['scenarios']:
 x=scene['maxSpeedMph']
 y=required(greg_point if scene['polarName']=='Greg_D' else b_point,x)
 ax[0].scatter([x],[y],s=25,color='#222222',zorder=4)
ax[0].set(xlabel='Speed (mph TAS)',ylabel='Power (hp)',title='Same geometry + propeller curve; separate drag and power effects',xlim=(100,380),ylim=(0,3100))
ax[0].legend(loc='upper left',fontsize=8)

obs=d['historicalP47BCheck']['observations']
alt=[p['altFt']/1000 for p in obs]
ax[1].plot(alt,[p['observedTasMph'] for p in obs],'-o',color='#222222',label='Historical P-47B TAS reference',lw=2,markersize=5)
ax[1].plot(alt,[p['baselineTasMph'] for p in obs],'-s',color='#2b8a6e',label='B-anchored polar',lw=2,markersize=4)
ax[1].plot(alt,[p['gregPolarTransferredTasMph'] for p in obs],'-^',color='#ba5743',label='Greg D-polar direct transfer',lw=2,markersize=4)
ax[1].set(xlabel='Altitude (thousand ft)',ylabel='Maximum speed (mph TAS)',title='P-47B test challenge: drag-polars with same engine',xlim=(3,35))
ax[1].legend(loc='upper left',fontsize=8)

fig.suptitle('Thunderbolt control experiment: isolate +600 hp from drag-polar selection',fontsize=14,weight='bold')
fig.text(.5,-.052,'All 2000/2600-bhp power scenarios use identical 13,065-lb weight, shared P-47 geometry and Greg eta(speed). No historic B-vs-D flight test is implied.',ha='center',fontsize=9)
fig.savefig(path/'p47_control_v12.png',dpi=180,bbox_inches='tight',facecolor='white')
