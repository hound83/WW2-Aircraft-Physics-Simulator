"""v1.8 plot: source-typed historical vs simulator tests, no variant conflation."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

P = Path(__file__).parent
data = json.loads((P/'prop_sim_results_v18.json').read_text())
c, d = (data['candidates'][k] for k in ('C','D'))
plt.rcParams.update({'figure.facecolor':'#f6f8fb','axes.facecolor':'#ffffff',
 'font.size':10,'axes.spines.top':False,'axes.spines.right':False})
fig,axes=plt.subplots(2,2,figsize=(15.2,9.7),layout='constrained')
blue='#356ab4'; orange='#d78325'; green='#287f60'; gray='#525d69'

ax=axes[0,0]
labels=['P-47B (5)','P-51B (8)']; x=np.arange(2)
cy=[c['p47bSpeed']['holdoutMAEMph'],c['p51bSpeed']['holdoutMAEMph']]
dy=[d['p47bSpeed']['holdoutMAEMph'],d['p51bSpeed']['holdoutMAEMph']]
ax.bar(x-.2,cy,.38,color=blue,label='C: working model')
ax.bar(x+.2,dy,.38,color=orange,label='D: physical disk trial')
for i,(v,w) in enumerate(zip(cy,dy)):
 ax.text(i-.2,v+.16,f'{v:.2f}',ha='center',fontweight='bold')
 ax.text(i+.2,w+.16,f'{w:.2f}',ha='center',fontweight='bold')
ax.set_xticks(x,labels);ax.set_ylim(0,12.7);ax.set_ylabel('Mean absolute held-out speed error (mph)')
ax.set_title('A · Genuine 1940s speed data — smaller is better',fontweight='bold');ax.legend(frameon=False,fontsize=9)

ax=axes[0,1]
r=c['p51bPowerRequired']['rows']; rr=d['p51bPowerRequired']['rows']; xx=[v['tasMph'] for v in r]
ax.plot(xx,[v['sourceBhp'] for v in r],'-o',color=green,label='1944 Wright Field test (source)')
ax.plot(xx,[v['predictedRequiredShaftBhp'] for v in r],'--s',color=blue,label='C model')
ax.plot(xx,[v['predictedRequiredShaftBhp'] for v in rr],'-.^',color=orange,label='D trial')
ax.set_xlabel('True airspeed (mph), 22,400 ft');ax.set_ylabel('Shaft bhp required');ax.legend(frameon=False,fontsize=9)
ax.set_title('B · P-51B historical Fig. 5 — absolute horsepower',fontweight='bold')
ax.text(.04,.96,'Digitized markers approximate ±35 bhp',transform=ax.transAxes,va='top',color=gray,fontsize=9)

ax=axes[1,0]
labs=['67 inHg','75 inHg']; x=np.arange(2)
historic=[3820,4380]; cy=[q['modelFpm'] for q in c['p51bClimb']];dy=[q['modelFpm'] for q in d['p51bClimb']]
for i,v in enumerate(historic):
 ax.scatter(i,v,color=green,marker='D',s=70,zorder=5,label='Original 1944 climb' if i==0 else None)
ax.plot(x,cy,'-o',color=blue,lw=2,label='C model')
ax.plot(x,dy,'-.s',color=orange,lw=2,label='D trial')
for i,(v,y,z) in enumerate(zip(historic,cy,dy)):
 ax.annotate(f'{v:,.0f}',(i,v),xytext=(9,5),textcoords='offset points',color=green,fontweight='bold')
 ax.annotate(f'C {y:,.0f}',(i,y),xytext=(-4,-15),textcoords='offset points',color=blue,ha='right')
 ax.annotate(f'D {z:,.0f}',(i,z),xytext=(5,-15),textcoords='offset points',color=orange)
ax.set_xticks(x,labs);ax.set_xlim(-.3,1.3);ax.set_ylim(3200,4650)
ax.set_ylabel('Climb (ft/min) at 2,200 ft');ax.legend(frameon=False,fontsize=9)
ax.set_title('C · P-51B historical climb — still missing power',fontweight='bold')

ax=axes[1,1]
labs=['Sea level','3,000 m']; x=np.arange(2)
il=[20.3,26.1];cy=[q['turnSeconds'] for q in c['bf109f4AtHeldE']];dy=[q['turnSeconds'] for q in d['bf109f4AtHeldE']]
ax.plot(x,il,'-D',color=green,label='IL-2 F-4 simulator')
ax.plot(x,cy,'--o',color=blue,label='C model, fixed e')
ax.plot(x,dy,'-.s',color=orange,label='D trial, same fixed e')
for i,(v,y,z) in enumerate(zip(il,cy,dy)):
 ax.annotate(f'IL-2 {v:.2f}s',(i,v),xytext=(-42,16),textcoords='offset points',color=green)
 ax.annotate(f'C {y:.2f}s',(i,y),xytext=(-22,-26),textcoords='offset points',color=blue)
 ax.annotate(f'D {z:.2f}s',(i,z),xytext=(8,3),textcoords='offset points',color=orange)
ax.set_xticks(x,labs);ax.set_xlim(-.15,1.15);ax.set_ylim(19.4,27.1)
ax.set_ylabel('Sustained 360° turn time (seconds)')
ax.set_title('D · Bf 109 F-4 — simulation sanity check ONLY',fontweight='bold')
ax.text(.04,.08,'270 km/h simulator IAS approximated as model CAS\ne fixed by C at sea level; NOT a historical turn test',transform=ax.transAxes,color=gray,fontsize=9,va='bottom')

fig.suptitle('European Air War · Clean Physics v1.8 | Controlled propeller-model experiment',fontsize=19,fontweight='bold')
fig.savefig(P/'prop_sim_diagnostic_v18.png',dpi=160,bbox_inches='tight')
print('generated',P/'prop_sim_diagnostic_v18.png')
