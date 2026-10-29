# European Air War — v1.9 power-accounting investigation (26 October 2026)

**Decision: keep candidate C as the running physics model.** No aircraft-specific power multiplier or global exhaust-thrust coefficient has been fitted or added to `physics.js`. This version rigorously tests the Mustang's absolute-climb shortfall against the P-47B and 109F-4 constraints, instead of treating any one performance number as decisive. All earlier v1.8 assets remain intact.

## What original evidence actually says

Source: USAAF Wright Field `Eng-47-1749-A`, *Flight Tests on the North American P-51B-15 Airplane, AAF No. 43-24777*, 20 May 1944. [Full contemporaneous transcription and Figure 1–8 links](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html).

- The **Packard V-1650-7 power figures are estimates from Packard's altitude performance chart dated 3 December 1943** (section III C), not torque-meter measurements made on the flying P-51B. The P-47B historical power source is an onboard flight torquemeter. These are different quality levels.
- **9,335 lb was the takeoff mass** (section III A). The airplane's mass at **2,200 ft climb peak is not directly given**. Figure 5 at 22,400 ft uses a separate published **9,240-lb corrected cruise weight** (section V C). Do not apply 9,240 lb uncritically to the 2,200-ft climb.
- The 1944 climb peaks (section II): **3,820 ft/min at 67 inHg** and **4,380 ft/min at 75 inHg** at **2,200 ft**. Their **gain of 560 ft/min** is an exceptionally useful power-slope check.
- Figure 5's *level-flight engine horsepower* observations at 22,400 ft are at **different engine RPMs (2,100–3,000)** and mixture/blower settings. They are estimates of **test BHP**, not measurements of shaft-to-air thrust or a universal efficiency map. Figure 5's `testBhp` numbers are visually digitized ±35 BHP reading (additional systematic uncertainties unquantified).
- Same report notes inconsistent high-blower power due to carburetor malfunction (section V B), and separate 1944 NACA P-51B report also finds engine-power uncertainty sufficient to defeat some small flight-test speed comparisons; other airplane/specimen.

## What we calculated — actual source observations versus common-model predictions

| 2,200-ft P-51B test | Wright Field actual | Working C, no correction | Error |
|---|---:|---:|---:|
| 67-inHg maximum climb | 3,820 ft/min | 3,401 ft/min | −419 ft/min |
| 75-inHg maximum climb | 4,380 ft/min | 3,979 ft/min | −401 ft/min |
| Boost gain 75 minus 67 | **560 ft/min** | **577 ft/min** | **+17 ft/min** |

This requires ~115–119 **useful propulsive** horsepower beyond current model at the climb optimum **if all other values are held fixed**; it does not prove engine BHP is wrong or propeller efficiency is too low. An important clue is that the two *absolute* gaps are similar even though the boost *difference* nearly matches.

### Does exhaust thrust fix it?

The physical sensitivity tested is `net thrust = η × chart_BHP × 745.7 / TAS + exhaust_force`, with `exhaust_force = k (lbf / BHP) × test_BHP`. For every hypothetical `k`, the code **re-solves Cd₀ from the aircraft's original maximum-speed anchor** before independently testing other speeds, climbs and turns. An exhaust force added at low speed but not at the speed anchor is a logically inconsistent improvement and is explicitly rejected.

| Common sensitivity | P-51B 67 climb fpm | P-51B 75 climb fpm | 67→75 gain fpm | P-47B speed MAE mph | P-51B speed MAE mph | F-4 3km turn seconds |
|---|---:|---:|---:|---:|---:|---:|
| Zero exhaust (working C) | 3,401 | 3,979 | **577** | **3.65** | **2.61** | **25.89** |
| `k=0.05 lbf/BHP` (79-lbf at 67in/SL) | 3,504 | 4,100 | 596 | 6.45 | 3.68 | 25.45 |
| `k=0.10` (158 lbf) | 3,607 | 4,221 | 614 | 9.04 | 4.88 | 25.04 |
| `k=0.20` (316 lbf) | 3,815 | **4,467** | **652** | **13.67** | **7.38** | **24.26** |

With the frozen model, matching 67 alone demands **~320-lbf** assumed source-anchored exhaust force; matching 75 alone needs **~260 lbf**. The required forces differ and the boost gain becomes too large, while the **five P-47B speed holdouts deteriorate sharply** and the F-4's *withheld* simulator turn deviates more. The same nonzero coefficient applied to all three aircraft is **not defensible as the solution**. These trial forces are **hypothetical, NOT measured**, and the fact that the NACA independently measured measurable radial-engine exhaust thrust does **not** establish any absolute force for the Merlin, DB601E, or R-2800 install.

### Could weight or e alone solve it?

All values rerun with the original speed anchor retained:

- **−50 lb** from P-51B takeoff weight at 2,200 ft gives **3,426/4,006** ft/min at 67/75. **−100 lb** gives **3,451/4,034**. An extreme hypothetical **−200 lb** gives **3,501/4,091**. Actual 2,200-ft mass is not known, and none closes the gap.
- Raising P-51B Oswald efficiency from **e = 0.78 to 0.92**, speed-reanchored, gives **3,489/4,065** ft/min. Even idealized **e=1.0** gives only **3,529/4,104**. Source Figure 5 four low/mid-speed markers improve with higher e but still require unrealistically high implied prop η under the current drag polar.
- Any η fit solely to P-51 climb would fail the independent-Figure-5 gate; a generic η adjustment must also preserve the P-47B speed holdouts and 109F-4 low-speed consistency, not just those climb figures.

## Source priority for next actual model improvement

1. Find period **Hamilton Standard K-6523A-24** four-blade performance / pitch & rotational blade-loading curves for the **11ft 2in P-51B** prop; use **NACA ACR L4I29, Crigler and Talkin (Sept 1944)** to calculate independent induced *and* profile losses. NASA primary: https://ntrs.nasa.gov/citations/19930093312 (original PDF). This is a mathematical method, not a source of a P-51B calibration constant.
2. For **Packard V-1650-7**, obtain the **3 Dec 1943 altitude-performance chart** cited by 43-24777. Distinguish **calculated standard BHP, actual installed BHP, propeller delivered thrust and exhaust force**; do not treat them interchangeably. NACA 1940 **exhaust gas thrust experiment** https://ntrs.nasa.gov/citations/20090014842 tested an unrelated radial engine; it establishes that exhaust can add thrust, **not** P-51B magnitude.
3. Apply **one shared physical solver** to P-51B Fig 5, 1944 boost climb, P-47B five speed holds and P-47B climb holds and (separate evidence grade) 109F-4 IL-2 emergency turning at 0 and 3,000m. Reject any improvement that breaks held-out tests. Until a wartime 109F-4 low-speed polar is found, e≈0.547 remains **simulator-conditioned only**, not a historical aerodynamic measurement.

## New files / reproducibility

| File | Purpose |
|---|---|
| `installed_power_audit_v19.cjs` | Independent common-model exhaust *force* sensitivity, reanchoring, weight/e cases, all three aircraft |
| `installed_power_results_v19.json` | Full exact per-scenario values including 5/8 speed holdout residuals, 109 turns and Figure 5 |
| `plot_v19.py` → `installed_power_diagnostic_v19.png` | Four-panel absolute-number comparison |
| `test_installed_power_v19.cjs` | 10 checks: v1.8 exact continuity, reanchoring, heldouts, non-identifiability |
| `make_html_v19.py` → `Universal_Three_Aircraft_Model_v1.9.html` | New first audit panel in *offline* simulator, old v1.8 file preserved |

Run from this folder:

```bash
node installed_power_audit_v19.cjs --write
node test_installed_power_v19.cjs
python plot_v19.py
python make_html_v19.py
```

**Bottom line:** significant forward progress in eliminating an attractive but inadequate fix; no false declaration of closure. Candidate C remains the best available **working** model and should be replaced only when another explanation improves multiple source checks together.
