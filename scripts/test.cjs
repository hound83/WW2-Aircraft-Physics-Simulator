'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function runTests(){
 const dir=path.join(root,'tests');
 const files=fs.readdirSync(dir).filter(n=>/^test.*\.(cjs|mjs)$/.test(n)).sort();
 if(files.length===0)throw Error('No test scripts found');
 const out=spawnSync(process.execPath,['--test','--test-reporter=tap',...files],{cwd:dir,encoding:'utf8',maxBuffer:16*1024*1024});
 const log=(out.stdout||'')+(out.stderr||'');
 const statuses=log.split(/\r?\n/).flatMap(line=>{
  const m=/^(not ok|ok) \d+ - (.+)$/.exec(line);
  return m?[{script:path.basename(m[2]),status:m[1]==='ok'?'pass':'fail'}]:[];
 });
 const report={node:process.version,discoveredScripts:files.length,reportedScripts:statuses.length,passed:statuses.filter(x=>x.status==='pass').length,failed:statuses.filter(x=>x.status==='fail').length,exitCode:out.status,executionError:out.error?String(out.error):null,scripts:statuses,scope:'Node assertions and static HTML checks; not historical certification or interactive browser validation'};
 fs.mkdirSync(path.join(root,'validation/current'),{recursive:true});
 fs.writeFileSync(path.join(root,'validation/current/test-summary.json'),JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync(path.join(root,'validation/current/test-output.txt'),log);
 console.log('Regression scripts: '+report.passed+'/'+files.length+' passed; '+report.failed+' failed.');
 if(out.status!==0||statuses.length!==files.length||report.failed) {
  console.error(log.slice(-14000));
  throw Error('Regression execution failed or did not report every discovered script');
 }
 return report;
}
if(require.main===module){try{runTests();}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={runTests};
