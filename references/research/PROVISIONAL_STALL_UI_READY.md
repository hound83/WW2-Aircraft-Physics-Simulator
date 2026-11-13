# Provisional stall bands ready for UI (2026-11-13)

A small loader is available at `src/provisional-stall-loader.js`.

## Usage
```js
const { getProvisionalBand } = require('./provisional-stall-loader');
const band = getProvisionalBand('f4u4');
// { minEasMph, maxEasMph, n, limitation, solid: false }
```

## Aircraft with bands
- f4u4
- spitfire_lfix_bs543
- p47b
- p38g

(P-51B, Fw 190, Bf 109 bands from the earlier extract can be merged the same way.)

The chart already renders non-solid segments as dotted (`stroke-dasharray`). Attach the band as a non-solid range marker and show the limitation string in an expandable note.

No solver or baseline change.
