# v3.5: stall and airspeed calibration laboratory

The simulator now offers a source-bounded P-51B lift candidate and a manual correction checker. At 9240 lb and 8000 ft, the candidate predicts **103.4 mph EAS / 103.5 CAS / 116.6 TAS**, compared with the retained model's 98.5 EAS. The 102.3-105.2 EAS bracket reflects engineering readings/transfer assumptions, not a historical confidence interval. No exact target aircraft has acquired a verified cockpit stall correction.

## Delivered behavior

- Four-aircraft table separates current assumed-model stall EAS from unresolved historical corrected stall values.
- P-51B altitude, mass and lift-bracket controls evaluate the candidate with the shared physical solver. Source CL times source area is preserved when reconciling 233.2 sqft with the model's 233 sqft.
- Candidate is limited to 5100-9300 ft and solved Mach 0.14-0.18. The source's changing lift at higher Mach is handled by rejection rather than an unsupported constant extension. This is a declared engineering transfer window between test altitudes, not measured continuous coverage.
- Candidate EAS bracket and nominal CAS are plotted over that restricted window. Reset restores the nominal comparison. The panel is independent of generic-flight and climb controls.
- D-manual installation table converts 100 IAS to 105 CAS, then EAS/TAS at the chosen pressure altitude. Interpolation between table nodes is explicit. Below 100 or above 400 IAS is blocked.
- Mustang III and Spitfire position-correction bands never extrapolate to stall. Shared band edges with different corrections are ambiguous. Position-only results are not silently accepted as CAS when independent instrument-error state is missing.
- All ten recovered source excerpts are retained with hashes and original page mapping. The Spitfire notes reproduction is labelled as such, rather than original-print verification.

## Source and model separation

The candidate uses NACA TN1044's P-51B gradual stalls, throttled engine, high-pitch propeller and exceptionally smooth finish. Its identity is not established as 43-24777. There is no fitted cockpit correction and no independent historical residual to score. No reserved-point MAE is reported because no matched independent corrected stall observations exist. These checks establish arithmetic, source boundaries and behavior, not historical accuracy.

The RAE Spitfire I coefficient remains an older-mark sensitivity only. P47B's calibration still begins at 170 IAS, above its 105 IAS stall. F1/F2 landing indications remain separate from a clean Bf109F4 stall. New targeted primary/secondary searches did not close those gaps; simulator manuals and reprinted values are not promoted to primary calibration.

The active general flight-model coefficients, aircraft inputs, frozen import, v3.4 climb fit and all previous source gates are retained. This research panel does not inject a low-Mach coefficient into unrestricted turn calculations.

## Validation and reproduction

Run `npm run check`, `npm run test:browser`, and `node validation/diagnostics/stall_lab_v35.cjs`.

The test suite checks independent SI lift balance, source/model area reconciliation, source identity, invalid inputs, 36 supported mass/altitude/lift cases and out-of-window refusal. The full sweep records 36 accepted and 48 blocked cases, with zero discrepancy between candidate stall EAS and the shared solver. Tests verify D-table conversion, no extrapolation, band-boundary ambiguity, source excerpt hashes and immutable aircraft inputs.

Browser checks cover candidate controls, removal of stale numbers on rejection, reset, finite plot paths, correction outcomes, retained climb predictions and mobile layout. Final verification: **50/50 regression scripts, 29 headless browser checks, 3628 unchanged legacy numeric values, and 65 original-engine fixture predictions verified**. Exact results are recorded in [current validation](CURRENT_VALIDATION.md), [browser report](../validation/current/browser-smoke.json), and [stall sweep](../validation/current/v35-stall-lab.json). A first browser attempt exceeded its 45-second CDP response limit during the existing profile switch; subsequent verification uses a 90-second response limit. Stall inputs are excluded from unrelated global calculation listeners.

## Sources and next milestone

See [the detailed primary-source research](STALL_ACTUAL_AIRSPEED_RESEARCH.md), [structured register](../references/stall-calibration-research-2026-11-02.json), and [excerpts/hash manifest](../references/sources/stall-2026-11-02/manifest.json).

Next complete milestone: recover a matching low-speed correction or direct calibrated lift dataset for the remaining F4/P47B/IX targets, then test an altitude/Mach-dependent lift model against applicable measurements. Prioritise those specific gaps before unrelated climb fits. The current laboratory makes the usable Mustang candidate concrete while preserving the unresolved cases.
