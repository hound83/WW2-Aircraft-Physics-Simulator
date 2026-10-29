"""Create page-preserving, 180-dpi readable copies of NASA's period scans.

The original bit-for-bit NASA PDFs remain untouched in original_naca_pdfs/;
all derived files and their provenance are separately recorded. Color/gray
images are downsampled to 180dpi, monochrome to 300dpi. Use primary OCR text
and original archival image for precision on plotted traces where necessary.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
import hashlib,json,re,subprocess,sys,time

ROOT=Path(__file__).resolve().parent
ORIG=ROOT/'original_naca_pdfs';DEST=ROOT/'naca_reading_copies'
DEST.mkdir(exist_ok=True)

def sha256(path):
 h=hashlib.sha256()
 with path.open('rb') as fp:
  for block in iter(lambda:fp.read(1024*1024),b''):h.update(block)
 return h.hexdigest()

def pages(path):
 try:
  p=subprocess.run(['pdfinfo',str(path)],text=True,capture_output=True,timeout=20)
  m=re.search(r'^Pages:\s+(\d+)',p.stdout,re.M)
  return int(m.group(1)) if m else None
 except Exception:return None

def convert(path):
 out=DEST/path.name
 result={'file':path.name,'source_bytes':path.stat().st_size,'source_sha256':sha256(path)}
 if not out.exists() or out.stat().st_size<10000:
  argv=['gs','-q','-dSAFER','-dBATCH','-dNOPAUSE',
        '-sDEVICE=pdfwrite','-dCompatibilityLevel=1.6','-dPDFSETTINGS=/ebook',
        '-dDownsampleColorImages=true','-dColorImageResolution=180',
        '-dGrayImageResolution=180','-dMonoImageResolution=300',
        '-sOutputFile='+str(out),str(path)]
  run=subprocess.run(argv,capture_output=True,text=True,timeout=280)
  if run.returncode!=0:
   result['status']='failed';result['error']=(run.stderr or run.stdout)[-500:]
   return result
 result['source_pages']=pages(path);result['copy_pages']=pages(out)
 result['copy_bytes']=out.stat().st_size;result['copy_sha256']=sha256(out)
 result['status']='page_verified' if result['source_pages']==result['copy_pages'] and result['copy_pages'] else 'page_mismatch'
 result['copy_type']='180dpi color/gray, 300dpi mono; Ghostscript pdfwrite /ebook'
 return result

if __name__=='__main__':
 paths=sorted(ORIG.glob('*.pdf'))
 out=[]
 with ThreadPoolExecutor(max_workers=4) as pool:
  jobs=[pool.submit(convert,p) for p in paths]
  for ix,j in enumerate(as_completed(jobs),1):
   entry=j.result();out.append(entry)
   print(f"{ix}/{len(paths)} {entry['status']} {entry['file']} "
         f"{entry.get('copy_bytes',0)/1e6:.2f} MB",flush=True)
   (ROOT/'naca_reading_copy_provenance_v23.json').write_text(json.dumps({'files':sorted(out,key=lambda x:x['file'])},indent=2)+'\n')
 print('Copied',len(out),'reports:',sum(x.get('source_bytes',0) for x in out)/1e6,
       'MB archival originals to',sum(x.get('copy_bytes',0) for x in out)/1e6,'MB reading scans')
