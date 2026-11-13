// Provisional stall bands for dotted-line display.
// Source: references/analysis/provisional_stall_envelope_2026-11-12.json
// These values are not matched corrected EAS. Mark any use as provisional.

const provisional = require('../references/analysis/provisional_stall_envelope_2026-11-12.json');

function getProvisionalBand(aircraftId) {
  const entry = provisional.aircraft?.[aircraftId];
  if (!entry?.provisionalBandEasMph) return null;
  return {
    aircraftId,
    name: entry.name,
    minEasMph: entry.provisionalBandEasMph.min,
    maxEasMph: entry.provisionalBandEasMph.max,
    n: entry.provisionalBandEasMph.n,
    limitation: entry.observations?.[0]?.limitation || 'provisional, uncorrected',
    solid: false
  };
}

function listProvisionalAircraft() {
  return Object.keys(provisional.aircraft || {});
}

module.exports = { getProvisionalBand, listProvisionalAircraft };
