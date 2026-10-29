"""Reproducible primary/secondary four-aircraft source-condition audit graphic."""
from pathlib import Path
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

P=Path(__file__).parent
D=json.loads((P/'spitfire_results_v20.json').read_text())
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':9,
                     'axes.titlesize':11,'axes.titleweight':'bold'})
fig,axes=plt.subplots(2,2,figsize=(14.4,8.4),dpi=150)
fig.set_facecolor('#f2f5f8')
for ax in axes.flat:
    ax.set_facecolor('white')
    ax.grid(alpha=.22)
    ax.spines[['top','right']].set_visible(False)
speed=D['speed']['rows'];climb=D['climb']

# 1: primary test rate compared to two different BHP assumptions
ax=axes[0,0]
x=[r['altFt']/1000 for r in climb]
ax.plot(x,[r['fpm'] for r in climb],color='#203c5e',linewidth=2.3,marker='o',ms=4,label='RAF A&AEE measured climb')
ax.plot(x,[r['predAtReportedSpeedFpm'] for r in climb],color='#d66e4b',linewidth=1.7,marker='^',ms=3,
        label='Original level-speed BHP at climb speed')
ax.plot(x,[np.nan if r['conditionAwareFpm'] is None else r['conditionAwareFpm'] for r in climb],
        color='#1c9476',linewidth=2,marker='s',ms=3,label='Same-rpm, measured climb MAP proxy')
ax.set_title('Spitfire IX BS.543: same-airframe climb / engine boost')
ax.set_xlabel('Altitude (thousand feet)')
ax.set_ylabel('Climb, ft/min')
ax.legend(fontsize=8,loc='lower left',frameon=False)
ax.annotate('14k: no measured level-FS boost reference',xy=(14,3860),xytext=(3,3120),
            fontsize=8,arrowprops={'arrowstyle':'->','color':'#8c929a'},color='#777')

# 2: period level-speed holdout residual, distinguish supercharger gear
ax=axes[0,1]
for gear,color,marker in [('low','#bd7140','o'),('high','#496fa9','D')]:
    rows=[r for r in speed if r['gear']==gear and r['altFt']!=0]
    ax.plot([r['altFt']/1000 for r in rows],[r['residualMph'] for r in rows],
            color=color,marker=marker,ms=4,linewidth=1.4,
            label=('M.S. low gear' if gear=='low' else 'F.S. high gear'))
ax.axhline(0,color='#203c5e',linewidth=1)
ax.set_xlabel('Altitude (thousand feet)')
ax.set_ylabel('Model − period speed, mph TAS')
ax.set_title(f"20 period speed checks: MAE {D['speed']['maeMph']:.2f} mph")
ax.legend(fontsize=8,frameon=False)

# 3: engineering mechanism: source recorded MAP shifts as speed falls
ax=axes[1,0]
xs=np.array([r['altFt']/1000 for r in climb])
ref=np.array([np.nan if r['sourceBoostAtLevelSpeedPsi'] is None else r['sourceBoostAtLevelSpeedPsi'] for r in climb])
cl=np.array([r['reportedBoostPsi'] for r in climb]);
ax.plot(xs,ref,color='#384b66',linewidth=1.7,marker='o',label='Level speed: reported gauge boost')
ax.plot(xs,cl,color='#c6603c',linewidth=1.7,marker='o',label='Slower climb: reported gauge boost')
ax.fill_between(xs,cl,ref,where=np.isfinite(ref)&(ref>cl),color='#ead2c0',alpha=.8)
ax.set_xlabel('Altitude (thousand feet)')
ax.set_ylabel('Boost (lb/in² above ambient)')
ax.set_title('Why top-speed BHP overstates slow-speed power')
ax.legend(fontsize=8,loc='lower left',frameon=False)

# 4: IL-2 is a separate variant and only a secondary turn check
ax=axes[1,1]
r=D['il2Turns'];cs=D['optionalSimulatorConditionedE']['levels']
x=np.arange(2);width=.23
ax.bar(x-width,[z['turnSeconds'] for z in r],width,color='#374d6a',label='IL-2 Mk IXe specification')
ax.bar(x,[z['modelAtTakeoffWeight']['turnSeconds'] for z in r],width,color='#d99557',label='Current common e=0.78')
ax.bar(x+width,[z['modelSeconds'] for z in cs],width,color='#43937b',label='Experimental e fit at 0 m only')
ax.set_xticks(x,['Sea level · 270 km/h IAS','3,000 m · 260 km/h IAS'])
ax.set_ylabel('Seconds for 360° sustained turn')
ax.set_ylim(0,25)
ax.set_title('Turn sanity check — variant/IAS mismatch remains')
ax.legend(fontsize=7.7,frameon=False,loc='upper left')
ax.text(.5,21.9,'3 km point withheld from the e scenario fit',ha='center',fontsize=8,color='#435565')

fig.suptitle('EUROPEAN AIR WAR  ·  CLEAN PHYSICS v2.0  ·  FOUR-AIRCRAFT PRESSURE/PROP AUDIT',
             fontsize=14,fontweight='bold',color='#15334b')
fig.text(.5,.017,
  'Sources: A&AEE Spitfire BS.543 Tables II & V (+18, 3000 rpm), 1946 Rolls-Royce Merlin 66 critical BHP; IL-2 developer Mk IXe turn data.\n'
  'Original engine BHP profile and Oswald e remain provisional. MAP scaling is a proxy; radiator OPEN climb versus CLOSED speed is not modeled.',
  ha='center',fontsize=8,color='#506578')
fig.tight_layout(rect=(0,.064,1,.946),w_pad=2,h_pad=2.4)
path=P/'four_aircraft_diagnostic_v20.png'
fig.savefig(path,bbox_inches='tight')
print(path,path.stat().st_size)
