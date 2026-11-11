'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildCatalog } = require('../../scripts/research-layer.cjs');
const { browserData } = require('./operating_benchmark_v46.cjs');
const { runSweep } = require('./propeller_efficiency_sweep.cjs');
const { sourceEvidence } = require('./propeller_efficiency_evidence.cjs');

const root = path.resolve(__dirname, '../..');
const outputPath = 'references/analysis/fighter-propeller-efficiency-v1.json';
const baselineCommit = '079d955d58425637cffcd84540198dde7f2a0a5d';

function buildEfficiencyData(full = false) {
  const data = browserData();
  return {
    schema: 'ww2-fighter-propeller-efficiency/v1',
    version: '1.0.0',
    replay_base: { version: '4.9.0-rc.1', commit: baselineCommit },
    as_of: '2026-11-11',
    ...sourceEvidence(data, buildCatalog()),
    sweep: runSweep(data, full),
  };
}

function encode(data) {
  const { cases, unavailable, ...sweep } = data.sweep;
  const header = JSON.stringify({ ...data, sweep }, null, 2);
  const rows = (key, items) => '    "' + key + '": [\n' + items.map(row => '      ' + JSON.stringify(row)).join(',\n') + '\n    ]';
  return header.slice(0, -6) + ',\n' + rows('unavailable', unavailable) + ',\n' + rows('cases', cases) + '\n  }\n}\n';
}

if (require.main === module) {
  const full = process.argv.includes('--full');
  const data = buildEfficiencyData(full);
  const encoded = encode(data);
  if (full) {
    const index = process.argv.indexOf('--output');
    if (index < 0 || !process.argv[index + 1]) throw Error('Provide --output for the full sweep');
    fs.writeFileSync(process.argv[index + 1], encoded);
  } else if (process.argv.includes('--check')) {
    if (fs.readFileSync(path.join(root, outputPath), 'utf8') !== encoded) throw Error('Propeller efficiency data changed on replay');
  } else {
    fs.writeFileSync(path.join(root, outputPath), encoded);
  }
  console.log(JSON.stringify(data.sweep.counts, null, 2));
}

module.exports = { outputPath, baselineCommit };
