"""Generate exact-data Greg-vs-engine diagnostics, no image generation/editing."""
import json
import subprocess
from pathlib import Path
import matplotlib.pyplot as plt

base=Path(__file__).resolve().parent
result=subprocess.run(['node','greg_reconciliation_v11.cjs','--json'],cwd=base,check=True,capture_output=True,text=True)
d=json.loads(result.stdout)
plt.style.use('seaborn-v0_8-whitegrid')
fig,ax=plt.subplots(1,2,figsize=(13,5.5),layout='constrained')

a=d['bf109']['rows'];x=[r['speedMph'] for r in a]
ax[0].plot(x,[r['greg']['requiredHp'] for r in a],'-o',label='Greg: required hp',color='#be3b30',lw=2,markersize=3)
ax[0].plot(x,[r['baseline']['requiredHp'] for r in a],'--',label='Current model: required hp',color='#d18079',lw=2)
ax[0].plot(x,[r['greg']['availableHp'] for r in a],'-o',label='Greg: available hp',color='#24528f',lw=2,markersize=3)
ax[0].plot(x,[r['baseline']['availableHp'] for r in a],'--',label='Current model: available hp',color='#63a0cc',lw=2)
ax[0].set(title='Bf 109 F-4 — sea level',xlabel='Speed (mph TAS)',ylabel='Power (hp)',xlim=(100,330))
ax[0].legend(fontsize=8,loc='upper left')

a=d['p47Dscenario']['rows'];x=[r['speedMph'] for r in a]
ax[1].plot(x,[r['greg']['requiredHp'] for r in a],'-o',label='Greg D-style: required hp',color='#be3b30',lw=2,markersize=3)
ax[1].plot(x,[r['baselineGeometry']['requiredHp'] for r in a],'--',label='P-47B-derived polar, D-style weight',color='#d18079',lw=2)
ax[1].plot(x,[r['greg']['availableHp'] for r in a],'-o',label='Greg: 2600-bhp scenario, delivered',color='#24528f',lw=2,markersize=3)
ax[1].plot(x,[r['baselineGeometry']['availableHpHypothetical2600'] for r in a],'--',label='Generic C prop at hypothetical 2600 bhp',color='#63a0cc',lw=2)
ax[1].set(title='P-47 D-28-style Greg scenario — sea level',xlabel='Speed (mph TAS)',ylabel='Power (hp)',xlim=(100,380))
ax[1].legend(fontsize=8,loc='upper left')

fig.suptitle('Greg worksheet vs. current universal engine — same drag equations, different input assumptions',fontsize=13,weight='bold')
fig.text(.5,-.055,'Greg spreadsheet is a calculation benchmark, NOT independent flight-test evidence. P-47D scenario is NOT P-47B engine performance.',ha='center',fontsize=9)
fig.savefig(base/'greg_comparison_v11.png',dpi=180,bbox_inches='tight',facecolor='white')
