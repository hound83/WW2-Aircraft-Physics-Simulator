"""Build an auditable, primary-source NACA technical-report corpus (1934-1946).

The script queries the OFFICIAL NASA NTRS public API; saves source metadata;
downloads only public PDF originals; records SHA-256, PDF page count and local
text extraction; never treats a report summary or an inferred number as a
directly measured aircraft efficiency map. Run --discover, then --download.
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
from pathlib import Path
import re
import subprocess
import time
from urllib.request import urlopen,Request
from urllib.parse import urlencode
from urllib.error import HTTPError,URLError

ROOT=Path(__file__).resolve().parent
PDFS=ROOT/'original_naca_pdfs'
TEXTS=ROOT/'extracted_text'
API='https://ntrs.nasa.gov/api/citations'
QUERIES={
 'propeller':[
  'propeller efficiency', 'full-scale propeller',
  'propeller operating charts', 'propeller tunnel efficiency',
  'propeller thrust power', 'propeller induced loss',
  'propeller high speed compressibility', 'propeller advance ratio',
  'variable pitch propeller', 'propeller blade sections',
  'Hamilton Standard propeller', 'propeller slipstream wing',
  'propeller spinner nacelle', 'propeller static thrust',
  'propeller power coefficient', 'propeller performance flight'
 ],
 'cooling':[
  'radiator drag', 'cooling-air duct',
  'radiator pressure recovery', 'radiator heat drag',
  'cooling-air inlet outlet', 'airplane cooling installation',
  'radiator duct cooling', 'radiator full scale',
  'power-plant cooling drag'
 ],
 'drag':[
  'induced drag efficiency', 'wing fuselage interference drag',
  'laminar airfoil drag', 'high speed airfoil drag',
  'airplane drag polar', 'compressibility drag airplane',
  'wing profile drag', 'cooling cowling drag'
 ],
 'engine':[
  'supercharger power altitude', 'engine power altitude',
  'aircraft turbo supercharger', 'engine induction air ram',
  'altitude engine performance', 'supercharged engine power',
  'engine supercharger testing', 'aircraft power plant installation'
 ],
}
# IDs obtained from official NASA NTRS search. Seeds prevent the relevance
# ranker from dropping known foundational papers because of imperfect OCR.
SEEDS={
 '19930093312':'propeller',  # 1944 ACR L4I29 / Crigler & Talkin
 '19930091110':'propeller',  # 1943 ARR 3I25 / 20-ft PRT charts
 '19930091761':'propeller',  # 1940 TR684 full-scale static
 '19930091790':'propeller',  # 1941 TR712 blade force integration
 '19930093329':'propeller',  # 1941 different 10-ft prop sections
 '19930093330':'propeller',  # 1945 TE blade extension
 '19930093324':'propeller',  # 1944 multi-blade tests
 '20090014884':'propeller',  # 1940 NACA special prop report
 '20090015250':'propeller',  # 1936 SR55 takeoff efficiency
 '20090015108':'propeller',  # 1941 high-speed propeller design
 '19930081338':'propeller',  # 1936 TN579 constant RPM
 '19930094485':'cooling',   # 1940 TM932 installed radiator drag
 '19930091458':'engine',    # 1932 TR384 supercharger (slightly early)
 '19930094435':'engine',    # 1941 TM981 supercharged altitude power
 '19630039634':'engine',    # 1937 TM839 supercharger design
 '19930094577':'engine',    # alternate 1937 entry
 '19930091397':'engine',    # 1930 TR327 critical altitude (early)
 '19930093644':'propeller', # 1941 high thrust / low airspeed
 '19930093331':'propeller', # Hamilton Standard NACA-16 blade sections
 '19930093336':'propeller', # low blade angles / propeller performance
 '19930091718':'propeller', # 1938 full-scale blade planform comparison
 '19930091803':'propeller', # propulsive efficiency of nose/propeller unit
 '19930091521':'propeller', # early static propeller thrust
 '19930093163':'cooling', # 1943 Meredith heat/jet power/altitude
 '19930093107':'engine', # 1944 aftercooling/ram altitude
 '19930091844':'engine', # 1943 NACA TR765 exhaust-jet thrust
 '19930093198':'cooling', # R-2800 engine cooling
 '19930093282':'cooling', # 1941 XP-42 cooling/cowling
 '20150019418':'cooling', # P-63 pressure recovery
 '19930092667':'cooling', # 1944 full-scale XP-47 cooling ducts
 '19930093174':'cooling', # 1944 high altitude cowling / ducting
 '20090015245':'cooling', # waste heat cooling-duct recovery
 '20090014786':'cooling', # propeller slipstream on cooling ducts
 '19930092825':'drag', # XP-51 wing drag test
 '19930092751':'drag', # P-47D flight wing-profile drag
 '19930093001':'drag', # P-47D flight wing-profile drag
 '19930094521':'engine', # power at altitude 1939
 '20090016337':'engine', # engine with exhaust turbine supercharger
 '20150017973':'engine', # Allison V-1710 supercharger altitude maps
 '20030063262':'propeller', # real YP-47M propeller at high blade loading
}
YEAR_LO,YEAR_HI=1934,1947
MAXIMUM={"propeller":32,"cooling":18,"drag":18,"engine":17}
EXPANSION={
 'propeller':['low airspeed propeller high thrust','propeller tip speed efficiency',
              'propeller slipstream lift drag','propeller wind tunnel high altitude',
              'P-47 propeller altitude','P-51 propeller','Bf 109 propeller'],
 'cooling':['P-51 radiator cooling','Meredith effect radiator',
            'P-47 cooling drag','radiator heat energy recovery','liquid cooling air duct'],
 'drag':['XP-51 drag','P-51B flight test drag','P-47D profile drag',
         'airplane drag power required','full-scale airplane drag polar',
         'low speed turn induced drag','high lift airplane wing drag'],
 'engine':['Merlin engine altitude performance','V-1650 supercharger',
           'Allison V-1710 altitude horsepower','R-2800 power altitude',
           'exhaust turbine supercharger power altitude','engine ram pressure altitude',
           'supercharger power curve engine']}

BAD_TITLES=['jet-propulsion','gas turbine-propeller engine','tg-100a','jet engine',
            '24c jet','19b-2','combustor','jet-propulsion','turbine engine','xr-4360-8',
            'turbofan','carburetor icing','laboratory investigation of icing',
            'torsional and bending deflection','wind-tunnel vibration',
            'oil-system performance']
GREAT_TITLES=['low airspeed','low speed','high blade load','p-51','xp-51',
              'p-47','xp-47','supercharg','altitude performance','waste heat',
              'induced drag','profile drag','cooling-air','aircraft engine',
              'propeller efficiency','efficiencies','charts','full-scale',
              'meredith','power at altitude','radiator']
SOURCE_CHAIN_SUPPLEMENTS={
 '19930091825':'propeller', # NACA TR747, direct ref in 1941 low-speed study
 '19930093315':'propeller', # static NACA16-series blade vs Clark Y
 '19930093336':'propeller', # low blade angle experimental tests
 '19930094520':'cooling', # radiator drag with heat addition
 '19930094547':'cooling', # radiator thermal energy conversion
 '20090016325':'cooling', # radiator design/installation part II
 '20090015029':'cooling', # radiator design/installation part I
 '19930092660':'cooling', # pursuit airplane wing duct
 '19930093163':'cooling', # cooling altitude and jet-power terms
 '19930093107':'engine', # heat rejection/aftercooler and shaft loss
 '19930091844':'engine', # exhaust gas jet recovery NACA TR765
 '19930094542':'propeller', # verified report candidate
 '19930091803':'propeller', # body nose/propeller effects
 '19930091753':'drag', # interference drag from tail wing fuselage
}
USER_AGENT='EuropeanAirWarHistoricalNACAPhysicsResearch/2.3 (NASA Public STI documents)'

def fetch_bytes(url,params=None,timeout=80):
 if params:url+='?'+urlencode(params)
 req=Request(url,headers={'User-Agent':USER_AGENT})
 with urlopen(req,timeout=timeout) as resp:return resp.read()

def fetch_json(url,params=None):
 for attempt in range(3):
  try:
   return json.loads(fetch_bytes(url,params,timeout=50))
  except (HTTPError,URLError,TimeoutError,ValueError) as exc:
   if attempt==2:raise RuntimeError(f'{url}: {exc}') from exc
   time.sleep(2+attempt*2)

def year(record):
 years=[]
 for p in record.get('publications') or []:
  s=p.get('publicationDate') or ''
  m=re.match(r'^(\d{4})',s)
  if m:years.append(int(m.group(1)))
 return min(years) if years else None

def slim(record):
 ident=str(record.get('id',''))
 return {'id':ident,'title':record.get('title',''),
         'year':year(record),'date':((record.get('publications') or [{}])[0].get('publicationDate') or '')[:10],
         'reports':[s for s in (record.get('otherReportNumbers') or []) if not s.lower().startswith('report number:')],
         'abstract':record.get('abstract') or '',
         'authors':[a.get('meta',{}).get('author',{}).get('name','') for a in (record.get('authorAffiliations') or [])],
         'keywords':record.get('keywords') or [],
         'downloads':[{'filename':d.get('name'),'type':d.get('mimetype'),
                       'url':API+'/'+ident+'/downloads/'+d.get('name','')} for d in record.get('downloads') or []
                      if (d.get('mimetype') or '').lower()=='application/pdf'],
         'citation':'https://ntrs.nasa.gov/citations/'+ident,
         'government_primary':True if 'NACA' in ' '.join(record.get('otherReportNumbers') or []).upper() else False}

def category_and_score(r):
 title=r['title'].lower();description=r['abstract'].lower();q=' '.join(r['keywords']).lower()
 scores={'propeller':0,'cooling':0,'drag':0,'engine':0}
 for name,terms in {
   'propeller':['propeller','propulsion','blade','pitch','thrust','slipstream','windmill'],
   'cooling':['radiator','cooling','coolant','duct','heat exchanger','cowl'],
   'drag':['drag','laminar','induced','interference','airfoil','wing'],
   'engine':['supercharg','turbocharg','altitude','engine','manifold','carburetor']
 }.items():
  for t in terms:
   scores[name]+=(5 if t in title else 0)+(1 if t in description else 0)+(.3 if t in q else 0)
 for name in ['propeller','cooling','drag','engine']:
  if name in r.get('query_categories',[]):scores[name]+=3
 s=max(scores.values());category=max(scores,key=scores.get)
 if any(term in title for term in ['full-scale','full scale','flight tests','operating charts','efficiency','wind-tunnel']):s+=5
 if any(term in title for term in ['airplane','aircraft','performance']):s+=1
 if any(term in title for term in ['turbojet','rotorcraft','helicopter','supersonic jet']):s-=10
 if not r.get('downloads'):s-=15
 if not r.get('government_primary'):s-=15
 return category,round(s,2)

def discover():
 records={};log=[]
 for group,qs in QUERIES.items():
  for phrase in qs:
   try:
    data=fetch_json(API+'/search',{'q':phrase,'page.size':100})
    log.append({'query':phrase,'group':group,'total':data.get('stats',{}).get('total'),
                'returned':len(data.get('results',[]))})
    for rec in data.get('results',[]):
     r=slim(rec)
     if r['year'] is None or not (YEAR_LO<=r['year']<=YEAR_HI):continue
     if not r['government_primary']:continue
     if r['id'] not in records:records[r['id']]=r
     rr=records[r['id']]
     rr.setdefault('query_categories',[])
     if group not in rr['query_categories']:rr['query_categories'].append(group)
   except Exception as ex:
    log.append({'query':phrase,'group':group,'error':str(ex)})
   print('Search',group,phrase,log[-1].get('returned','FAILED'),'results',flush=True)
 for ident,group in SEEDS.items():
  if ident not in records:
   try:records[ident]=slim(fetch_json(API+'/'+ident))
   except Exception as ex:
    log.append({'seed':ident,'error':str(ex)});continue
  records[ident]['seed']=True
  records[ident].setdefault('query_categories',[])
  if group not in records[ident]['query_categories']:records[ident]['query_categories'].append(group)
 for r in records.values():
  r['category'],r['relevance_score']=category_and_score(r)
 ranked=sorted(records.values(),key=lambda r:(not r.get('seed',False),-r['relevance_score'],r['id']))
 selected=[];count={k:0 for k in MAXIMUM}
 for r in ranked:
  c=r['category']
  if r.get('seed') or (count[c]<MAXIMUM[c] and r.get('downloads') and r['relevance_score']>=8):
   r['selected']=True;selected.append(r);count[c]+=1
  else:r['selected']=False
 (ROOT/'ntrs_catalog_v23.json').write_text(json.dumps({'search_log':log,'all':ranked},indent=2)+'\n')
 with (ROOT/'ntrs_ranked_register_v23.csv').open('w',newline='',encoding='utf8') as fp:
  writer=csv.writer(fp)
  writer.writerow(['selected','id','year','category','score','report','title','url','pdf_count','seed'])
  for r in ranked:
   writer.writerow([r['selected'],r['id'],r['year'],r['category'],r['relevance_score'],
                    ' '.join(r['reports']),r['title'],r['citation'],len(r['downloads']),r.get('seed',False)])
 print('Ranked',len(ranked),'period NACA report candidates; selected',len(selected),
       'by categories',count,'catalog search errors',sum(bool('error' in a) for a in log))

def expand_and_curate():
 """Focused source-chaining round; preserve broad initial discovery and annotate priorities."""
 original=json.loads((ROOT/'ntrs_catalog_v23.json').read_text())
 records={r['id']:r for r in original['all']};log=original['search_log']
 for group,qs in EXPANSION.items():
  for phrase in qs:
   try:
    raw=fetch_json(API+'/search',{'q':phrase,'page.size':100})
    entries=raw.get('results') or []
    log.append({'query':phrase,'group':group,'focus':True,'returned':len(entries)})
    for item in entries:
     r=slim(item)
     if r['year'] is None or not YEAR_LO<=r['year']<=YEAR_HI or not r['government_primary']:continue
     previous=records.get(r['id'])
     if previous:r=previous
     r.setdefault('query_categories',[])
     if group not in r['query_categories']:r['query_categories'].append(group)
     records[r['id']]=r
   except Exception as exc:log.append({'query':phrase,'focus':True,'error':str(exc)})
   print('Focused search',group,phrase,len(entries) if 'entries' in locals() else 'FAILED',flush=True)
 for ident,group in SEEDS.items():
  if ident not in records:
   try:records[ident]=slim(fetch_json(API+'/'+ident))
   except Exception as exc:log.append({'seed':ident,'error':str(exc)});continue
  records[ident]['seed']=True
  records[ident].setdefault('query_categories',[])
  if group not in records[ident]['query_categories']:records[ident]['query_categories'].append(group)
 seen_reports=set();ranked=[]
 for r in records.values():
  category,score=category_and_score(r)
  title=r['title'].lower()
  score+=sum(3 for term in GREAT_TITLES if term in title)
  score-=sum(50 for term in BAD_TITLES if term in title)
  if r['year']>=1947:score-=50
  if r['year']<1934:score-=5
  if any(x in title for x in ['pusher','dual-rotating','counterrotating']):score-=10
  r['category']=SEEDS.get(r['id'],category)
  r['relevance_score']=round(score,2)
  ranked.append(r)
 ranked.sort(key=lambda r:(-r['relevance_score'],not r.get('seed',False),r['id']))
 selected_count={k:0 for k in MAXIMUM}
 # 100 focused archival originals, breadth is intentional and all selections auditable.
 caps={'propeller':39,'cooling':24,'drag':21,'engine':21}
 for r in ranked:
  c=r['category'];number=(r['reports'] or [r['id']])[0].upper()
  duplicate=number in seen_reports
  should=(r.get('downloads') and not duplicate and r['relevance_score']>=13 and
          (selected_count[c]<caps[c] or r.get('seed')) and
          not any(term in r['title'].lower() for term in BAD_TITLES) and r['year']<=1946)
  r['selected']=bool(should)
  if should:selected_count[c]+=1;seen_reports.add(number)
 original['all']=ranked;original['search_log']=log
 (ROOT/'ntrs_catalog_v23.json').write_text(json.dumps(original,indent=2)+'\n')
 with (ROOT/'ntrs_ranked_register_v23.csv').open('w',newline='',encoding='utf8') as fp:
  writer=csv.writer(fp)
  writer.writerow(['selected','id','year','category','score','report','title','url','pdf_count','seed'])
  for r in ranked:
   writer.writerow([r['selected'],r['id'],r['year'],r['category'],r['relevance_score'],
                   ' '.join(r['reports']),r['title'],r['citation'],len(r['downloads']),r.get('seed',False)])
 print('Expanded to',len(ranked),'NACA reports; CURATED',sum(selected_count.values()),
       selected_count,'query_errors',sum('error' in e for e in log),flush=True)

def select_supplements():
 """Follow citation chains without rerunning/overwriting the broad search."""
 source=json.loads((ROOT/'ntrs_catalog_v23.json').read_text())
 by_id={r['id']:r for r in source['all']}
 for ident,group in SOURCE_CHAIN_SUPPLEMENTS.items():
  if ident not in by_id:
   try:
    r=slim(fetch_json(API+'/'+ident))
    r['category']=group;r['relevance_score']=30;r['seed']=True
    source['all'].append(r);by_id[ident]=r
   except Exception as exc:
    source['search_log'].append({'seed_supplement':ident,'error':str(exc)})
    continue
  by_id[ident]['selected']=True
  by_id[ident]['source_chain_followup']=True
  by_id[ident]['category']=group
 (ROOT/'ntrs_catalog_v23.json').write_text(json.dumps(source,indent=2)+'\n')
 with (ROOT/'ntrs_ranked_register_v23.csv').open('w',newline='',encoding='utf8') as fp:
  writer=csv.writer(fp)
  writer.writerow(['selected','id','year','category','score','report','title','url','pdf_count','seed'])
  for r in source['all']:
   writer.writerow([r['selected'],r['id'],r['year'],r['category'],r['relevance_score'],
                   ' '.join(r['reports']),r['title'],r['citation'],len(r['downloads']),r.get('seed',False)])
 print('Supplemented',sum(r['selected'] for r in source['all']),'selected from',len(source['all']))

def command_output(args):
 try:return subprocess.run(args,capture_output=True,text=True,timeout=35).stdout
 except (OSError,subprocess.TimeoutExpired):return ''

def download(max_files=None,retry_failed=False):
 data=json.loads((ROOT/'ntrs_catalog_v23.json').read_text())
 selected=[r for r in data['all'] if r.get('selected') and r.get('downloads')]
 PDFS.mkdir(parents=True,exist_ok=True);TEXTS.mkdir(parents=True,exist_ok=True)
 old={}
 p=ROOT/'naca_acquisition_log_v23.json'
 if p.exists():old={r['id']:r for r in json.loads(p.read_text())['files']}
 if retry_failed:
  selected=[r for r in selected if old.get(r['id'],{}).get('status')!='downloaded']
 attempted=0
 for i,r in enumerate(selected):
  if max_files is not None and attempted>=max_files:break
  attempted+=1
  ident=r['id'];report=(r['reports'] or [f'NACA_{ident}'])[0]
  report=re.sub('[^A-Za-z0-9_-]','_',report)[:35]
  filename=f'{r["year"]}_{report}_{ident}.pdf';dest=PDFS/filename
  txt=TEXTS/(dest.stem+'.txt')
  status={'id':ident,'title':r['title'],'report':r['reports'],
    'year':r['year'],'category':r['category'],'pdf':str(dest.relative_to(ROOT)),
    'extracted_text':str(txt.relative_to(ROOT)),
    'url':r['downloads'][0]['url'],'citation':r['citation']}
  if not dest.exists() or dest.stat().st_size<10000:
   try:
    data_bytes=fetch_bytes(r['downloads'][0]['url'],timeout=80)
    if not data_bytes.startswith(b'%PDF'):
     # Some 1990s NASA digitizations are served through NTRS wrapped in an
     # opaque 436-byte binary transfer header, *despite* MIME application/pdf.
     # The PDF itself is intact and starts with %PDF. Recover it losslessly.
     offset=data_bytes.find(b'%PDF',0,8192)
     if offset<0:
      raise ValueError(f'No PDF header within 8192 bytes; prefix={data_bytes[:20].hex()}')
     status['ntrs_removed_binary_wrapper_bytes']=offset
     data_bytes=data_bytes[offset:]
    dest.write_bytes(data_bytes)
   except Exception as exc:
    status.update({'status':'download_failed','error':str(exc)})
    old[ident]=status
    print('FAILED',ident,str(exc)[:100],flush=True);continue
  data=dest.read_bytes();status.update({'status':'downloaded','bytes':len(data),
      'sha256':hashlib.sha256(data).hexdigest()})
  info=command_output(['pdfinfo',str(dest)])
  m=re.search(r'^Pages:\s+(\d+)',info,re.M)
  if m:status['pages']=int(m.group(1))
  if not txt.exists():
   subprocess.run(['pdftotext','-layout',str(dest),str(txt)],timeout=90,check=False)
  if txt.exists():
   content=txt.read_text(errors='replace')
   status['extracted_text_chars']=len(content.strip())
   status['ocr_needed']=len(content.strip())<800
  old[ident]=status
  p.write_text(json.dumps({'files':list(old.values())},indent=2)+'\n')
  print('SAVED',i+1,'of',len(selected),r['category'],ident,
        status['bytes'],'bytes',status.get('pages','?'),'pages',flush=True)
 p.write_text(json.dumps({'files':list(old.values())},indent=2)+'\n')
 print('Download registry:',len(old),'sources',sum(v.get('bytes',0) for v in old.values())/1e6,'MB')

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--discover',action='store_true');parser.add_argument('--download',action='store_true')
 parser.add_argument('--expand',action='store_true')
 parser.add_argument('--supplement',action='store_true')
 parser.add_argument('--retry-failed',action='store_true')
 parser.add_argument('--max-files',type=int)
 args=parser.parse_args()
 if args.discover:discover()
 if args.expand:expand_and_curate()
 if args.supplement:select_supplements()
 if args.download:download(args.max_files,args.retry_failed)
