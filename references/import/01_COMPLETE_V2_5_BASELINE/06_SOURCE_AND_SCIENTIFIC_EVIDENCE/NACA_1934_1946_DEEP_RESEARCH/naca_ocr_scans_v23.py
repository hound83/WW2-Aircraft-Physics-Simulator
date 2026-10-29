"""OCR the eight otherwise image-only historical NACA reports; no originals altered."""
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
INDEX = json.loads((ROOT / 'naca_acquisition_log_v23.json').read_text())['files']
DEST = ROOT / 'ocr_scanned_reports_v23'
DEST.mkdir(exist_ok=True)

def convert(record):
    original = ROOT / record['pdf']
    output = DEST / (original.stem + '_OCR.txt')
    if output.exists():
        return {'id':record['id'], 'status':'already exists','pages':record['pages'],'text_bytes':output.stat().st_size}
    pages = []
    with tempfile.TemporaryDirectory(prefix='naca_ocr_') as temp:
        img = Path(temp) / 'page'
        for page in range(1, record['pages'] + 1):
            subprocess.run(['pdftoppm','-f',str(page),'-l',str(page),'-singlefile',
                            '-scale-to','1450','-gray','-png',str(original),str(img)],
                           stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,check=True)
            ocr = subprocess.run(['tesseract',str(img)+'.png','stdout','--psm','3'],
                                 stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
            pages.append(f'\n\n===== ORIGINAL PDF PAGE {page} =====\n'+ocr.stdout.decode('utf8','replace'))
            img.with_suffix('.png').unlink()
        output.write_text(''.join(pages))
    return {'id':record['id'],'status':'completed','pages':record['pages'],
            'text_bytes':output.stat().st_size,
            'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
            'source':record['citation'],'pdf_sha256':record['sha256'],
            'ocr_method':'tesseract eng psm 3, 1450px page, gray; unverified transcription; original PDF authoritative'}

def main():
    needed = [x for x in INDEX if x.get('ocr_needed')]
    results=[]
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobs={pool.submit(convert,x):x for x in needed}
        for fut in as_completed(jobs):
            try:r=fut.result()
            except Exception as e:r={'id':jobs[fut]['id'],'status':'error','error':str(e)}
            results.append(r)
            print(r['id'],r['status'],r.get('pages',''),flush=True)
            (DEST/'ocr_provenance_v23.json').write_text(json.dumps(results,indent=2)+'\n')

if __name__=='__main__':main()
