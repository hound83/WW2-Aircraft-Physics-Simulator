const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { buildCatalog } = require('../scripts/research-layer.cjs');

const archive = path.resolve(__dirname, '../references/research/local-pdf-extract-2026-11-12');
const index = require(path.join(archive, 'extraction-index.json'));
const disposition = require('../references/analysis/ww2_pdf_source_disposition_2026-11-12.json');
const { pdf_reference: pdf, coverage } = require('../references/analysis/fighter-sim-inputs-v1.json');
const catalog = buildCatalog();
const sha256 = data => createHash('sha256').update(data).digest('hex');

const fields = ['source_file', 'source_doc', 'source_type'];
const rows = index.files.flatMap(entry => {
  const content = fs.readFileSync(path.join(archive, entry.file), 'utf8');
  assert.equal(sha256(content), entry.sha256);
  const records = JSON.parse(content).flatMap(document => document.rows.map(row => {
    assert.equal(row.length, index.row_fields.length);
    return {
      ...Object.fromEntries(fields.map(field => [field, document[field]])),
      ...Object.fromEntries(index.row_fields.map((field, i) => [
        field, (document.dictionaries[field] ? document.dictionaries[field][row[i]] : row[i]) ?? null,
      ])),
    };
  }));
  assert.equal(records.length, entry.raw_rows);
  return records;
});
assert.equal(index.files.length, 13);
assert.equal(rows.length, 5801);
assert.equal(pdf.raw_record_count, rows.length);
assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
assert.equal(new Set(rows.map(row => row.source_file)).size, index.source_file_count);
for (const [grade, count] of Object.entries(index.grade_counts)) {
  assert.equal(rows.filter(row => row.grade === grade).length, count);
}
assert.equal(sha256(JSON.stringify(rows.sort((a, b) => a.id.localeCompare(b.id)))), index.canonical_records_sha256);

const originals = new Map(catalog.observations.map(row => [row.id, row]));
const rawIds = new Set(rows.map(row => row.id));
const pdfSeries = id => pdf.series.find(series => series.id === id);
assert.equal(pdf.observation_count, 552);
assert.equal(pdf.reference_specimen_observation_count, 0);
assert.equal(pdf.series.length, 53);
assert.equal(new Set(pdf.observation_ids).size, pdf.observation_count);
assert.equal(pdf.series.filter(series => series.roster_id).reduce((total, series) => total + series.rows.length, 0), 246);
assert.equal(new Set(pdf.series.map(series => series.roster_id).filter(Boolean)).size, 8);
for (const series of pdf.series) {
  const original = series.observation_ids.map(id => originals.get(id));
  assert.deepEqual(series.rows, original.map(row => series.fields.map(field => row.values[field])));
  assert.ok(original.flatMap(row => row.values.extraction_ids).every(id => rawIds.has(id)));
}
for (const overlap of disposition.known_overlaps) {
  assert.ok(catalog.sources.some(source => source.id === overlap.catalog_source_id));
}
assert.ok(pdf.existing_observation_ids.every(id => originals.has(id)));
const propeller = pdf.series.filter(series => series.quantity === 'propeller_wind_tunnel_coefficients');
assert.equal(propeller.reduce((n, series) => n + series.rows.length, 0), 306);
for (const { rows: points } of propeller) {
  for (const [advance, thrust, power, speedPower, efficiency] of points) {
    assert.ok(Math.abs(efficiency - advance * thrust / power) <= .004);
    assert.ok(Math.abs(speedPower - advance / power ** .2) <= .007);
  }
}
assert.deepEqual(pdf.unresolved_source_rows.map(row => row.extraction_id), ['NACA-TN698-066', 'NACA-TN698-084', 'NACA-TN698-190']);
assert.deepEqual(pdfSeries('p47d-manual-power-wet').rows[0].slice(0, 5), [0, 22000, 64, 2700, 4.16]);
assert.deepEqual(pdfSeries('raf-thunderbolt-pec').rows[0].slice(0, 2), [170, 5]);
assert.equal(pdfSeries('raf-thunderbolt-stall').application, 'variant-comparison');
assert.equal(pdfSeries('ki84-ir3-nominal-level-speed').source_class, 'original-report-specification');
assert.equal(coverage.rows.filter(row => row.source_review_points).length, 1);
assert.equal(coverage.rows.find(row => row.id === 'p47d30_433441').primary_percent, 66);
console.log('PASS staged PDF archive, grouped evidence, source limits and coverage');
