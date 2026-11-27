'use strict';

const fs = require('node:fs');
const path = require('node:path');
const pack = require('../references/research/fleet_comparative_flight_data_2026-11-27.json');

function asCsv(pack) {
  const sources = new Map(pack.sources.map(source => [source.id, source]));
  const metadata = [
    'series_id', 'source_row', 'test_aircraft', 'quantity', 'current_profiles',
    'applicability', 'source_grade', 'speed_basis', 'source_id', 'source_location',
    'url', 'test_conditions', 'notes', 'primary_followup'
  ];
  const measurements = [...new Set(pack.series.flatMap(series => series.columns))];
  const header = [...metadata, ...measurements];
  const csvCell = value => {
    const field = String(value ?? '');
    return /[",\r\n]/.test(field) ? '"' + field.replaceAll('"', '""') + '"' : field;
  };
  const lines = [header.map(csvCell).join(',')];
  for (const series of pack.series) {
    const source = sources.get(series.source_id);
    const { profile_ids, applicability, ...conditions } = series.conditions;
    for (const [index, row] of series.rows.entries()) {
      const byColumn = Object.fromEntries(series.columns.map((column, i) => [column, row[i]]));
      const fields = [series.id, index + 1, series.aircraft, series.quantity, profile_ids.join('|'),
        applicability, series.source_class, series.speed_basis, source.id, series.source_location,
        source.url, JSON.stringify(conditions), series.notes, source.primary_followup];
      lines.push([...fields, ...measurements.map(column => byColumn[column])].map(csvCell).join(','));
    }
  }
  return lines.join('\n') + '\n';
}

if (require.main === module) {
  const destination = path.join(__dirname, '../references/analysis/fleet-comparative-flight-data-2026-11-27.csv');
  fs.writeFileSync(destination, asCsv(pack));
}

module.exports = { asCsv };
