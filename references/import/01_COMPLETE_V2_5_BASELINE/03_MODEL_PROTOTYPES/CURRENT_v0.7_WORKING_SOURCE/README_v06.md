# Universal Three-Aircraft Model v0.6 — External Stores / Same-aircraft Evidence

**Status:** Working standalone experimental physics workbench. Base aircraft roster remains Bf 109 F-4, P-47B and P-51B-15. **P-38G and Mosquito are historical validation fixtures, not new trusted turn simulators.** Air War Atlas and GitHub were not changed.

## What changed in the working model

The original common-engine implementation and all Greg P-47 / Bf 109 arithmetic tests remain intact. `physics.js` now accepts two **independent universal inputs** in `evaluated`, `maxSpeed` and `bestClimb`:

- `storesWeightLb` — additional weight (nonnegative); changes required lift, wing loading, induced drag, stall threshold and climb performance.
- `addedDragAreaM2` — an **additional equivalent parasite drag area Δ(Cd S)** in m² (nonnegative); changes drag as `0.5 * airDensity * trueSpeed² * addedDragArea` and therefore available excess power and maximum speed. This is a drag-area addition, **NOT a replacement or reinterpretation of Cd0**. No per-aircraft aerodynamic coefficient is silently refitted when stores change.

The model uses the same bounded engine ratings and propulsion model as v0.5. It does not add an invented independent bomb engine power curve. The UI allows changing stores weight and drag area for the existing three aircraft at the selected altitude; this is **hypothetical sensitivity**, not a historically approved loadout for all three.

## New RAF same-aircraft validation fixture: Mosquito B Mk IX LR495

The online transcriptions of two primary RAF A&AEE performance reports include:

- 11 Jun 1943 **no external stores**: 393 mph TAS at 13,800 ft (MS full throttle) and 405 mph at 25,700 ft (FS); **21,910 lb reported takeoff**. Four 500-lb bombs **internally**, no external bombs or fuel tanks.
- 20 Feb 1944 **two externally mounted 500-lb bombs on faired racks**: 373 mph at 13,000 ft (MS) and 383 mph at 25,100 ft (FS), +18 boost, **22,850 lb reported takeoff**.
- The RAF explicitly assessed an external-store speed penalty of roughly **15–18 mph**, but stated it was not precisely known owing to airframe **deterioration between testing sessions**. The raw peak-speed differences are **20/22 mph**; these are not exact matched-altitude, matched-mass comparisons. Also the reported takeoff mass difference is **940 lb**, NOT automatically the bomb mass of 1000 lb. Both versions retained.

Source: https://www.wwiiaircraftperformance.com/org/mosquito/mosquito.html (later HTML transcription of period reports; original paper scans not independently checked).

### Deliberately simple Greg-style inverse drag experiment

At fixed altitude and fixed **propulsive power**, the model assumes parasite drag scales as V² and induced drag as W²/V². With `r = V_loaded/V_clean`, a clean-reference induced fraction `fi`, stores weight ratio `w`, and fractional parasite increase `delta`:

```
1 = (1-fi) * (1+delta) * r³ + fi * w² / r
```

- Fit `delta` using only the **lower-altitude** 393 vs 373 mph pair and its reported takeoff-weight ratio, with **provisional** `fi=0.11`.
- Independently evaluate the **higher-altitude** reported 405 vs 383 mph pair using the SAME `delta` and provisional `fi=0.16` (selected as physical estimates reflecting higher induced share at lower density, not measured coefficients).
- In raw-peak mode the inferred additional **parasite-drag fraction** is ~**14.85%** and the higher-altitude prediction is **383.01 mph** against 383 mph reported.
- In RAF-assessed-penalty mode, use 16.5 mph as a *hypothetical calibration midpoint* of the report's 15–18 mph range; implied parasite drag increases ~**11.83%**, predicts **386.71 mph** at high altitude, vs 383 mph raw peak. The disagreement is expected from the different reference definition and confounded tests.

**Do not treat the ~0.01 mph raw higher-altitude residual as demonstrated aircraft accuracy**. The 11/16% induced-drag shares, unchanged propulsive-power assumption, and differing max-speed peak altitudes are limitations. This is a sensitivity/reconstruction check, not an independently validated aerodynamic polar. The author-level estimate 15–18 mph remains the preferred historical statement.

## New USAAF P-38G primary-report transcription fixture

Wright Field FS-M-19-1538-A, 10 Feb 1943, P-38G-1 serial 42-12687, clean level speeds (all TAS) at 3000 rpm: 346.5 mph / 5,000 ft; 378 / 14,700; 404 / 22,600; 403 / 24,400; 396 / 30,000, accompanied by engine bhp and manifold-pressure records in `stores.json`.

Source: https://www.wwiiaircraftperformance.com/org/p-38/p-38.html . Original scan not independently checked.

**No source-authenticated P-38G-with-bombs performance series has been recovered in this pass.** The user's Greg chart is preserved as a qualitative screenshot and is not conflated with this Wright Field report, which documents a clean configuration at varying powers.

## Testing

```
node test.mjs
node test_stores.cjs
python make_html.py
python test_browser.py
```

Tests cover all prior Greg worksheet and climb benchmarks plus three-aircraft stores monotonicity (mass alone, drag alone, combined), unit-verified extra parasite drag, weight/lift effects, source completeness and nonnegative input validation. Browser tests operate at 1360 and 390 px with interactive source display and switches.

**The next actual physics improvement** should prioritize measured loadout speed differences at fixed power/rating/altitude (ideally a report with before/after runs) to replace provisional extra-drag-area assumptions, then test the same method on a second airframe. Do not add a complete P-38/Mosquito E-M simulator from these sparse source points.
