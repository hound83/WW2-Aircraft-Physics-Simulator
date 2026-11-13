// Continuous stall and usable maneuver lift — research path.
// Uses reported provisional bands where they exist. Does not alter the default CLmax-based stall.
// Solid = source-supported; dotted = provisional band.

const { getProvisionalBand } = require('./provisional-stall-loader');

const NAMED_CASES = ['p51b', 'p38g', 'f4u4'];

function attachProvisional(aircraftId, result) {
  const band = getProvisionalBand(aircraftId);
  if (!band) return result;
  return {
    ...result,
    provisionalStallBand: band,
    stallNote: band.limitation
  };
}

function continuityCheck(aircraftId, result) {
  const band = getProvisionalBand(aircraftId);
  if (!band || !Number.isFinite(result.stallEasMph)) return null;
  const modeled = result.stallEasMph;
  const inside = modeled >= band.minEasMph && modeled <= band.maxEasMph;
  return {
    aircraftId,
    modeledEasMph: +modeled.toFixed(1),
    provisionalMin: band.minEasMph,
    provisionalMax: band.maxEasMph,
    modeledInsideBand: inside,
    solid: false
  };
}

module.exports = { attachProvisional, continuityCheck, NAMED_CASES };
