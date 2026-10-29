"""Regenerate the full handover's integrity manifest after a model revision."""
from pathlib import Path
import csv
import hashlib

root=Path(__file__).resolve().parent
dest=root/'FILE_MANIFEST_SHA256.csv'
records=[]
for path in sorted(root.rglob('*')):
    if not path.is_file() or path==dest:
        continue
    digest=hashlib.sha256()
    with path.open('rb') as fp:
        while block:=fp.read(1024*1024):
            digest.update(block)
    records.append((str(path.relative_to(root)),path.stat().st_size,digest.hexdigest()))
with dest.open('w',newline='',encoding='utf-8') as fp:
    writer=csv.writer(fp)
    writer.writerow(['path','bytes','sha256'])
    writer.writerows(records)
print(f'Updated SHA256 manifest: {len(records)} files')
