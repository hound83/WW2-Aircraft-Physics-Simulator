"""Source-honest four-panel visualization of the predictive ram power experiment."""
import json
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

P=Path(__file__).parent
d=json.loads((P/'ram_predictive_results_v21.json').read_text())
sp=d['spitfire']['ideal']['rows']
alt=np.array([x['altFt'] for x in sp])/1000
boost_meas=np.array([x['measuredBoostPsi'] for x in sp])
boost_pred=np.array([x['predictedBoostPsi'] for x in sp])
boost_part=np.array([x['predictedBoostPsi'] for x in d['spitfire']['recovery07']['rows']])
fpm_ref=np.array([x['historicalClimbFpm'] for x in sp])
fpm_original=np.array([x['originalClimbFpm'] for x in sp])
fpm_pred=np.array([x['predictedClimbFpm'] for x in sp])

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':9,
    'axes.spines.top':False,'axes.spines.right':False})
fig,axs=plt.subplots(2,2,figsize=(14,9.2),dpi=150)
fig.patch.set_facecolor('#f5f8fc')
for ax in axs.ravel():
    ax.set_facecolor('white');ax.grid(alpha=.16)

ax=axs[0,0]
ax.scatter(alt,boost_meas,s=36,color='#283b6a',label='1943 A&AEE measured CLIMB boost',zorder=4)
ax.plot(alt,boost_pred,color='#168b96',lw=2,label='PREDICTED: ideal recovered inlet pressure')
ax.plot(alt,boost_part,color='#e59b39',lw=1.5,ls='--',label='Sensitivity: 70% pressure recovery')
ax.axvline(13,color='#9caabb',alpha=.7,linestyle=':',lw=1)
ax.set(xlabel='Altitude (thousands ft)',ylabel='Gauge boost (psi)',title='1. Measured vs predicted Spitfire MAP')
ax.text(.02,.06,f"Ideal recovery MAP MAE: {d['spitfire']['ideal']['pressureMaePsi']:.2f} psi\n16 withheld climb-pressure points",
        transform=ax.transAxes,bbox=dict(fc='#e9f6f5',ec='none',alpha=.92),fontsize=8)
ax.legend(fontsize=7,loc='upper right')

ax=axs[0,1]
ax.plot(alt,fpm_ref,marker='o',markersize=4,lw=2.2,color='#283b6a',label='1943 A&AEE measured climb')
ax.plot(alt,fpm_original,marker='s',markersize=3,lw=1.5,color='#bf7566',ls='--',label='Previous chart-power model')
ax.plot(alt,fpm_pred,marker='d',markersize=3.5,lw=2,color='#168b96',label='v2.1 predicted inlet power')
ax.set(xlabel='Altitude (thousands ft)',ylabel='Climb rate (ft/min)',title='2. Climb-rate check, exact measured TAS')
ax.text(.02,.06,f"Historical climb MAE: {d['spitfire']['ideal']['originalClimbMaeFpm']:.0f} → {d['spitfire']['ideal']['predictedClimbMaeFpm']:.0f} ft/min",
        transform=ax.transAxes,bbox=dict(fc='#e9f6f5',ec='none',alpha=.92),fontsize=8)
ax.legend(fontsize=7,loc='upper right')

ax=axs[1,0]
colors=['#168b96','#334e86','#687aaa','#be8852']
for sw,c in zip(d['lowSpeedSweeps'],colors):
    speeds=[p['tasMph'] for p in sw['points']]
    fractions=[p['relativeShaftPower'] for p in sw['points']]
    ax.plot(speeds,fractions,lw=2,marker='.' if 'Spitfire' in sw['label'] else None,
            color=c,label=sw['label'])
ax.set(xlabel='True airspeed (mph)',ylabel='Available shaft BHP / level-chart BHP',
       title='3. Low-speed installed-power prediction')
ax.set_ylim(.73,1.035);ax.legend(fontsize=7,loc='lower right')

ax=axs[1,1]
x=np.array([r['altMeters'] for r in d['bf109Turns']])
w=.20
ax.bar(x/1000-w,[r['simSeconds'] for r in d['bf109Turns']],width=w,color='#334e86',label='IL-2 F-4 turn benchmark')
ax.bar(x/1000,[r['baselineTurnSeconds'] for r in d['bf109Turns']],width=w,color='#d0aa68',label='Existing model (simulator e)')
ax.bar(x/1000+w,[r['predictedTurnSeconds'] for r in d['bf109Turns']],width=w,color='#168b96',label='New ram model (same e)')
ax.set(xlabel='Altitude (km)',ylabel='Sustained turn time (seconds)',title='4. Bf 109: regulated power does not change turn')
ax.set_xticks([0,3]);ax.set_ylim(0,31);ax.legend(fontsize=7,loc='upper left')
ax.text(.03,.12,'109 turn uses IL-2-conditioned e≈0.547, not a measured wartime polar',
        ha='left',transform=ax.transAxes,fontsize=7,color='#606a79')

fig.suptitle('EUROPEAN AIR WAR v2.1  /  Speed-dependent installed power',fontsize=17,
             fontweight='bold',x=.06,ha='left',color='#202e43')
fig.text(.06,.945,'Source-critical full-throttle pressure model. No climb boost is used as an input. Pressure recovery = ideal upper-bound assumption.',
         fontsize=9,color='#556579')
fig.text(.06,.017,'Sources: A&AEE Spitfire BS.543 (1943); USAAF P-51B flight tests; IL-2 developer Bf 109 F-4. P-47B turbo unchanged.',
         fontsize=8,color='#64748b')
plt.tight_layout(rect=[.035,.045,.985,.926],h_pad=2.1,w_pad=2.0)
dest=P/'predictive_installed_power_v21.png';fig.savefig(dest,dpi=150,facecolor=fig.get_facecolor())
print(dest)
