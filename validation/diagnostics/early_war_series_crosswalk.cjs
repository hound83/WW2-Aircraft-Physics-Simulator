'use strict';

const early = require('../../references/analysis/ww2_early_war_flight_tests_2026-11-14.json');

const priority = 'ww2_priority_aircraft_2026-11-13:';
const stall = 'stall_four_track_followup_2026-11-10:spitfire-va-reported-stalls-and-clmax';
const engine = 'ww2_low_speed_turn_calibration_2026-11-10:spitva-w3119-original-engine-ratings';
const aliases = {
  'x4922-level': priority + 'spitfire-va-x4922-level',
  'x4922-climb': priority + 'spitfire-va-x4922-climb',
  'n3171-level': priority + 'spitfire1-n3171-level',
  'n3171-climb': priority + 'spitfire1-n3171-climb',
  'n3171-stall': priority + 'spitfire1-n3171-stall',
  'n3171-secondary-low': priority + 'spitfire1-n3171-sea-level-summary',
  'w3119-naca-stall': stall,
  'w3119-engine': engine,
};
const fieldNames = {
  altitude_ft: 'standard_altitude_ft', roc_ft_min: 'roc_fpm', boost_gauge_psi: 'boost_lb_sq_in',
  case: 'power', manifold_inHg: 'manifold_inhg', reported_indicated_mph: 'speed_mph', reported_clmax: 'clmax_reported',
};
const roles = {
  'catalog alias or documented field difference': Object.keys(aliases),
  'primary evidence for the six specimens': ['1304-cema-p4-level','1304-aaee-stall','1304-aaee-handling'],
  'period reproduction of the same French test': ['1304-cema-rae-climb','1304-cema-rae-summary','1304-cema-chart-level'],
  'alternate account or compilation': ['1304-cema-vertical','1304-cema-level','1304-fana-cema','1304-french-compiled-peak',
    '1304-raf-glide','1304-k9791-rae','emil-secondary-speed','emil-context-level','emil-secondary-narrow-margin',
    'r6774-n3171-july','spitfire-naca-comparison-roll'],
  'additional source information from the same trial': ['x4922-field','x4922-ceiling','x4922-ground','x4922-k9788-comparison',
    'x4922-summary-25000','1304-cema-endurance','n3171-prop-climb','n3171-field','n3171-load','n3171-conditions',
    'n3171-engine-note','n3171-comparison-field','n3171-summary-15000','w3119-naca-turn','w3119-geometry','w3119-roll-fig27','w3119-roll-report'],
  'other aircraft, specimen, or separately reported test': ['w3134-climb','w3134-level-removed','w3134-level-fitted','k9788-report-comparison',
    '1304-fana-ceam','1304-ceam-other-trials','1792-factory-level','spit-i-12lb-separate','mk-v-rae-speeds',
    'aa873-climb','aa873-level','aa873-handling','k9787-aa873-reference','aa878-combat-climb','aa878-normal-climb',
    'aa878-combat-level','aa878-normal-level','aa878-cooling','ab320-climb-no-tank','ab320-climb-tank','ab320-level-no-tank','ab320-level-tank'],
  'documentary, family or handbook reference': ['db601a-book','merlin-iii-notes','k9942-museum-context','emil-sheet-load','emil-e1-sheet-level',
    'merlin45-1941-ratings','merlin45-1941-cooling','merlin45-map83','mk-v-handbook-stall','emil-handbook-climb-asi',
    'emil-handbook-ratings','emil-handbook-airframe-limits','db601-oct40-rated-settings'],
  'derived transfer': ['w3119-stall-donor'],
};
const notes = {
  'x4922-climb': 'The zero-time origin is additional. All 19 non-origin rows match the existing source fields.',
  'n3171-secondary-low': 'All four numerical fields agree with the cataloged sea-level summary. The secondary account leaves the speed basis less explicit.',
  'n3171-load': 'Gross weight, fuel gallons, propeller diameter and blade count are also recorded in ' + priority + 'spitfire1-n3171-loading:0001.',
  'w3119-engine': 'Takeoff altitude is unreported in the handoff and 0 ft in the catalog. All three nameplate powers and RPMs agree.',
  'w3119-naca-stall': 'Same ten original cases. The catalog also records the 6,184 lb trial weight.',
  '1304-cema-vertical': 'Secondary interval means differ in definition from the point rates reproduced by the RAE.',
  '1304-cema-level': 'The secondary 5,500 m closed point is at 5,300 m in the original table.',
  '1304-cema-chart-level': 'Approximate curve readings from the same campaign. Use the tabulated points where available.',
  '1304-raf-glide': 'The 75 mph reproduction has a different test context from the A&AEE 81 mph ASIR.',
  '1792-factory-level': 'Four individual course runs. The catalog summarizes 290 mph at 1.3 ata; the new table resolves dates and wing state.',
  'emil-secondary-speed': 'Contains a rounded WNr 1792 value along with separate airframes and unresolved serials.',
  '1304-fana-ceam': 'French CEAM comparative work is distinct from the CEMA performance trial on the same captured airframe.',
  'w3119-stall-donor': 'X.4922 projection from W.3119 lift coefficients, not an X.4922 stall observation.',
};

function normalizedFields(series, row) {
  const values = {};
  for (const [i, field] of series.columns.entries()) {
    let name = fieldNames[field] || field, value = row[i];
    if (series.id === 'n3171-secondary-low') {
      name = { altitude_ft:'altitude_ft', speed_mph_as_reported:'tas_mph', boost_gauge_psi:'nominal_boost_lb_sq_in', rpm:'engine_rpm' }[field];
    } else if (series.id === 'w3119-engine') {
      name = { rating:'rating', bhp:'bhp_nameplate', rpm:'rpm', altitude_ft:'alt_ft' }[field];
    } else if (series.id === 'w3119-naca-stall' && field === 'case') {
      value = { glide:'gliding-throttle-closed', cruise:'cruising', landing:'landing-throttle-closed',
        'landing approach':'landing-approach', takeoff:'takeoff', climb:'climbing' }[value];
    }
    values[name] = value;
  }
  return values;
}

function reconcile(catalog) {
  const role = new Map(Object.entries(roles).flatMap(([label, ids]) => ids.map(id => [id, label])));
  if (role.size !== early.series.length) throw Error('Review the disposition of every early-war series');
  const sources = new Map(early.sources.map(s => [s.id, s]));
  const series = early.series.map(s => {
    if (!role.has(s.id)) throw Error('Missing disposition for ' + s.id);
    const prefix = aliases[s.id];
    const candidates = prefix ? catalog.observations.filter(r => r.id.startsWith(prefix + ':')) : [];
    const matches = [];
    if (prefix) {
      for (const [i, row] of s.rows.entries()) {
        const fields = normalizedFields(s, row);
        const exact = candidates.filter(r => Object.entries(fields).every(([k, v]) => r.values[k] === v));
        if (exact.length === 1) matches.push({ row: i + 1, catalogId: exact[0].id });
        else if (!(s.id === 'x4922-climb' && row[0] === 0 || s.id === 'w3119-engine' && row[0] === 'takeoff'))
          throw Error('Ambiguous or missing source alias: ' + s.id + ' row ' + (i + 1));
      }
    }
    return { id:s.id, source:s.source, url:sources.get(s.source).url, airframe:s.aircraft, locator:s.locator,
      role:role.get(s.id), rows:s.rows.length, matches, note:notes[s.id] ?? null };
  });
  const used = new Set(series.map(s => s.source));
  return { seriesCount:series.length, rowCount:series.reduce((n, s) => n + s.rows, 0),
    linkedRowCount:series.reduce((n, s) => n + s.matches.length, 0), series,
    sourceLeads:early.sources.filter(s => !used.has(s.id)).map(({id,title,url}) => ({id,title,url})),
    interpretation:'A match compares every transcribed column after the named field and vocabulary normalization. Cross-references describe additional overlaps; unlinked rows are not counted as new independent trials.' };
}

module.exports = { reconcile };
