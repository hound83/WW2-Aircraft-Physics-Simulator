# Continuous stall and usable maneuver lift (research path)

Research helper at `src/continuous-stall.js`.

## What it does
- Attaches the existing provisional stall band to an evaluation result when one exists.
- Reports whether the modeled stall EAS falls inside the provisional band (continuity check).
- Does not change the default CLmax-based stall calculation or any frozen baseline.

## Named starting cases
- p51b
- p38g
- f4u4

## Usage
```js
const { attachProvisional, continuityCheck } = require('./continuous-stall');
const annotated = attachProvisional('f4u4', result);
const check = continuityCheck('f4u4', result);
```

The chart already draws a dotted band when `provisionalStallBand` is present on the aircraft object. No solver change.
