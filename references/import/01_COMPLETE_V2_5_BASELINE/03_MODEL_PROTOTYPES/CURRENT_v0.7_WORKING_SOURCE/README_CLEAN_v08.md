# Clean physics increment v0.8 — 26 October 2026

This is a **core-engine cleanup of the v0.7 research prototype**, not a newly validated aircraft model or a website release. The original v0.7 HTML is intentionally unchanged. `physics.js` remains compatible with that UI.

## Implemented

1. `casFromIAS(iasMph, calibration)` accepts a source-identified, configuration-specific set of `{iasMph, casMph}` pairs. It linearly interpolates inside the supplied range and refuses to extrapolate. Monotonicity and positivity are checked. No historic corrections are fabricated.
2. `resolveAirspeed(valueMph, kind, altitudeFt, calibration?)` resolves IAS/CAS/EAS/TAS into a consistent output. IAS is corrected to CAS exactly once, then CAS is converted to TAS through compressible pitot physics. The output identifies the original reported quantity, source and correction path.
3. `climbPrediction` and `equivalentClimbDrag` now consistently account for `storesWeightLb`, both in induced drag and in converting excess power to rate of climb. Existing clean calculations are unchanged.
4. Added `test_clean_v08.mjs` with a **synthetic** position-error table (not asserted to be a P-47 measurement), reversibility checks, out-of-range protection and loaded-climb regression checks.

## Tests

All four test commands are passing:

```
node test.mjs
node test_stores.cjs
node test_fw190.cjs
node test_clean_v08.mjs
```

The fourth command is the new v0.8 suite; `test.mjs` also contains multiple preexisting test sections.

## Not claimed

- The user-supplied P-47 manual's 115 mph IAS clean stall is **not** converted to CAS/EAS, because the available correction graph starts at 170 mph IAS. Extrapolation is prohibited.
- No new historical CLmax, Oswald factor, or propeller map was fitted.
- No revised Bf 109F / P-47B / P-51B turn ranking is asserted. The known negative Mosquito-to-Fw190 stores transfer result still stands.
- Source-backed climb operating states and airspeed definitions remain unresolved for some report observations.

## Next focused model gate

Integrate real, traceable low-speed IAS-to-CAS calibration **when found**; otherwise run CLmax / Oswald sensitivity ranges with clearly assumed stall limits. Separately compare climb power accounting at matched report conditions and maintain withheld validation points. Do not claim historical turn accuracy until those gates are passed.
