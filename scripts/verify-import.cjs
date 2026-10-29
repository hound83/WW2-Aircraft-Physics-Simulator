'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=require('../references/IMPORT_MANIFEST.json');
let checked=0,external=0;
for(const item of manifest.files){
 if(item.storage!=='git'){external++;continue;}
 const p=path.resolve(root,item.repositoryPath);
 if(!p.startsWith(root+path.sep))throw Error('Manifest path outside repository');
 const bytes=fs.readFileSync(p),actual=crypto.createHash('sha256').update(bytes).digest('hex');
 if(bytes.length!==item.bytes||actual!==item.sha256)throw Error('Frozen import mismatch: '+item.originalPath);
 checked++;
}
if(!checked)throw Error('No imported files verified');
console.log('Frozen import: '+checked+' SHA256 checks passed; '+external+' explicitly external files.');
