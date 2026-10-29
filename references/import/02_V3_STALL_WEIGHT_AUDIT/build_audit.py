import json,csv,math,pathlib
p=pathlib.Path(__file__).parent
cases=json.load(open(p/'cases.json'))['aircraft']
rows=[
 dict(key='p51b', aircraft='P-51B-15 43-24777',config='clean, power off, shutters closed',ias_mph=86,weight_lb=9270,weight_kind='instantaneous stall-test',source='Wright Field Eng-47-1749-A 20 May 1944 §V.E',tier='primary transcription of report',cal_status='FAIL: Fig 1 calibration no observed near 86 IAS',cal_ref='https://wwiiaircraftperformance.com/org/p-51/p51b-24777.html'),
 dict(key='p47b', aircraft='P-47B (manual generic B/C/D/G)',config='clean, power unspecified in excerpt',ias_mph=115,weight_lb=None,weight_kind='no matched weight',source='AN 01-65BC-1 pilot operating instructions §14',tier='pilot manual excerpt',cal_status='FAIL: no confirmed low-speed calibration for manual conditions',cal_ref='https://app.aircorpslibrary.com/document/viewer/pfoip470165bc1'),
 dict(key='p47d', aircraft='P-47D 42-26167 (external reference)',config='clean, idling, shutters closed',ias_mph=116,weight_lb=None,weight_kind='13,230 lb takeoff; NOT proven stall weight',source='Wright Field P-47D 44-1 fuel report §V.D',tier='primary report transcription',cal_status='FAIL: uncorrected IAS explicitly, calibration coverage at stall unverified',cal_ref='https://www.wwiiaircraftperformance.com/org/p-47/p47-26167.html'),
 dict(key='spitfire',aircraft='Spitfire IX pilot notes (not specimen BS.543)',config='clean, standard canopy',ias_mph=90,weight_lb=7150,weight_kind='pilot notes reference weight',source='A.P.1565J stall table as cited in v2.5 cases',tier='pilot notes, citation requires direct scan verification',cal_status='FAIL: no Mk IX low-speed position-error chart',cal_ref='https://stephentaylorhistorian.com/wp-content/uploads/2020/04/spitfire-ix-xi-xvi.pdf'),
 dict(key='spitfire_2',aircraft='Spitfire IX pilot notes alternate weight',config='clean, standard canopy',ias_mph=93,weight_lb=7800,weight_kind='pilot notes reference weight',source='A.P.1565J stall table as cited in v2.5 cases',tier='pilot notes, citation requires direct scan verification',cal_status='FAIL: no Mk IX low-speed position-error chart',cal_ref='https://stephentaylorhistorian.com/wp-content/uploads/2020/04/spitfire-ix-xi-xvi.pdf'),
 dict(key='bf109',aircraft='Bf 109 F-4',config='flight config, mass-dependent',ias_mph=None,weight_lb=6371,weight_kind='IL-2 standard 2890 kg; not historical stall flight weight',source='IL-2 developer spec: 154–171 km/h IAS',tier='simulation only',cal_status='FAIL: historical matched IAS and low-speed calibration missing',cal_ref='https://forum.il2sturmovik.com/topic/25993-aircraft-flight-and-technical-specifications-and-operational-details/')]
S={'p51b':cases['p51b']['wingAreaM2'],'p47b':cases['p47b']['wingAreaM2'],'p47d':cases['p47b']['wingAreaM2'],'spitfire':cases['spitfire_lfix_bs543']['wingAreaM2'],'spitfire_2':cases['spitfire_lfix_bs543']['wingAreaM2'],'bf109':cases['bf109f4']['wingAreaM2']}
rho0=1.225
for r in rows:
 r['wing_m2']=S[r['key']]
 r['clmax_verified']=None
 r['reason']='Cannot derive verified CLmax without matching EAS stall and test weight'
with (p/'stall_evidence_register.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0].keys()));w.writeheader();w.writerows(rows)
scenarios=[]
for r in rows:
 if r['ias_mph'] is None or r['weight_lb'] is None: continue
 for delta in [-5,0,5,10]:
  eas=r['ias_mph']+delta
  cl=(2*r['weight_lb']*4.4482216152605)/(rho0*(eas*.44704)**2*r['wing_m2'])
  stall_at_170=(170/eas)**2
  scenarios.append(dict(aircraft=r['aircraft'],IAS_mph=r['ias_mph'],hypothetical_EAS_minus_IAS_mph=delta,EAS_mph=eas,CLmax_if_correction_valid=round(cl,4),lift_g_at_170_mph_EAS_at_test_weight=round(stall_at_170,3),classification='ILLUSTRATION_NOT_MEASUREMENT'))
with (p/'calibration_sensitivity_NOT_measured.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(scenarios[0]));w.writeheader();w.writerows(scenarios)
print('rows',len(rows),'scenarios',len(scenarios))
