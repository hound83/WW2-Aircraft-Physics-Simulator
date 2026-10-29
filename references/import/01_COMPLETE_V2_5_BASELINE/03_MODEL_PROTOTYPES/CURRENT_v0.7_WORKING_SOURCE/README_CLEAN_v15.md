# European Air War — Clean Physics v1.5

**26 October 2026 · current research decision and handover.** The solver now uses the documented Bf 109 F-4 DB 601E reduction gearing, tests three *shared* propeller hypotheses against the P-47B and P-51B, and quantifies the F-4 turn-rate spread. **This is an experimental calculation engine, not independently validated sustained-turn performance.**

## Decision, in four sentences

1. **Keep the shared propeller candidate C provisionally.** After exactly one parasite-drag (`CD0`) refit per aircraft/candidate against one historical level-speed anchor, C has the lowest withheld level-speed mean absolute error on *both* Allied aircraft and the best P-47B withheld climb error.
2. **Do not select an F-4 Oswald-efficiency `e` from the current climb clue.** The two plausible-by-construction interpretations, generic `e=.780` and Greg-derived `e=.55767`, still differ by **3.180°/s** in one modeled sustained turn, far larger than the performance differences we eventually wish to resolve.
3. **The former close F-4 3:59-versus-4:00 climb match was an input error coincidence.** Correcting the actual DB 601E gearing changes Greg-polar candidate C's prediction to **3:50**, while generic `e=.78` predicts **3:34**. The 4:00 comparison remains an **unverified secondary numeric quote**.
4. **The P-51B is not solved for absolute climb.** Candidate C is **410 ft/min low in mean absolute error** for the two May 20 1944 report figures, even though the **boost-related gain** is modeled within **17 ft/min**. Candidate B achieves ~105 ft/min absolute error but performs less well across the other checks. Preserve this failure visibly; do not invent a per-aircraft propeller correction.

## What changed physically

The earlier `propGeometry.propRpm ≈ 1741.5` came from a DB 601N-like reduction of **~1.55 engine revolutions per propeller revolution**, the wrong gearbox for the **DB 601E** used in the Bf 109 F-3/F-4. The wartime F-2/F-4 German manual instead identifies **1.685:1** for the E. The new common `propEta(...)` accepts a *rating* and calculates rated propeller RPM (when source input exists) from engine RPM and reduction ratio:

| F-4 engine setting | Engine rpm | Gear ratio | Calculated propeller rpm |
|---|---:|---:|---:|
| Combat (1.30 ata, 30-minute rating) | 2,500 | 1.685 | **1,483.68** |
| Emergency (limited-duration setting) | 2,700 | 1.685 | **1,602.37** |

An original 19 September 1942 Messerschmitt report inspected in scanned form documents **2,500 engine rpm / 1.30 ata** for the DB 601E, but that engine is fitted to a **Bf 109 G-1** in that report: it supports an engine operating condition, **not an F-4 measured climb polar**. The manual is independently indexed and identifiable but its full scan was **not saved or page-inspected** in this handover; treat the reduction figure as transcribed from the original manual's search text, pending direct page audit. No aircraft `e`, `CLmax`, profile C heuristic or covert aircraft-specific multiplier was modified.

## Three common propeller candidates: real held-out diagnostics

Exactly **one aircraft-specific CD0** is solved at the speed anchor for each prop candidate: F-4 combat 325 mph sea level, P-47B 352 mph at 5,000 ft, P-51B 361.5 mph sea level. The remaining speed points **are not fitted**. P-47B additionally fits **one aggregate climb-configuration loss** to its 15,000-ft test; four other climb altitudes are withheld. This separate configuration fit is **not transferred** to the Mustang.

| Shared candidate | P-47B withheld speed MAE, mph (5) | P-51B withheld speed MAE, mph (8) | P-47B climb MAE, ft/min (4) | P-51B May 20 absolute climb MAE, ft/min (2) | P-51B 67→75-inHg climb-gain error, ft/min |
|---|---:|---:|---:|---:|---:|
| A: constant η=.80 | 10.23 | 5.54 | 114 | 231 | **+28** |
| B: simple η(speed) | 5.25 | 3.39 | 229 | **105** | **+70** |
| **C: J / Cp / tip-Mach heuristic** | **3.65** | **2.61** | **56** | 410 | **+17** |

Here *error* is model minus report for boost gain, and mean **absolute** deviation for other metrics; none represents a confidence interval. The shared profile C is still a **heuristic, not a measured NACA propeller map**. The P-51 historical absolute-climb ratings and the 67→75 inHg comparison come from the **same 1944 test program**, not independent campaigns. P-47's good climb score presupposes the 15,000-ft configuration-loss calibration.

## Absolute F-4 numbers, all cases

F-4 has a nominal 6,371-lb model weight, 16.05 m² wing, 9.92 m span, assumed `CLmax=1.50`. Every row separately re-fits `CD0` using the same 325-mph combat calibration; 336-mph emergency is a withheld *rating* check. Turn is **combat**, 5,000 ft, **170 mph EAS** (183.14 mph TAS), gear/flaps clean; it has **no independent F-4 measured counterpart**.

| Prop candidate | Assumed F-4 e | Fitted CD0 | Combat SL speed mph (fit) | Emergency SL speed mph (reported 336) | 1,000–5,000 m climb time (claimed 240 s*) | Sustained turn deg/s |
|---|---:|---:|---:|---:|---:|---:|
| A | .780 | .02218 | 325.0 | 338.94 | 206.6 s | 17.93 |
| A | .55767 Greg | .02168 | 325.0 | 339.35 | 224.5 s | 14.74 |
| B | .780 | .02213 | 325.0 | 338.34 | 189.6 s | 18.54 |
| B | .55767 Greg | .02164 | 325.0 | 338.71 | 206.0 s | 15.27 |
| **C** | **.780** | **.02275** | **325.0** | **339.37** | **213.9 s = 3:34** | **17.89** |
| **C** | **.55767 Greg** | **.02226** | **325.0** | **339.77** | **229.9 s = 3:50** | **14.71** |

*The purported four-minute F-4 1,000–5,000 m climb from the Dec 1941 Rechlin comparison has **not** been checked against the original tabulated flight report. Integration uses an optimized best-climb TAS at every 250-m step and omits acceleration; its timing is therefore optimistic. It is emphatically **not a matched 1941 test-condition comparison**. The 325 and 336 mph figures come from the same historical published synthesis, so their calibration/holdout split is computational, not statistical independence.

### Exactly where the turn spread comes from

With candidate C and 170-mph EAS / 5,000 ft / combat mode:

| Calculated path | Change, deg/s | Result, deg/s |
|---|---:|---:|
| Generic `e=.780`, CD0=.022751 | — | **17.8915** |
| Change only `e` to Greg-derived `.55767`, freeze original CD0 | **−3.2137** | 14.6778 |
| Then re-fit CD0 once to preserve 325-mph combat-speed anchor | **+0.0342** | **14.7120** |

This establishes that **induced drag is the source of the computed difference**, *not* a measured physical cause of any real aircraft's turn rate. Greg's inferred `e=.55767` is reconstructed from his supplied drag spreadsheet at a particular assumed mass, not a wind-tunnel or flight-measured span efficiency. The shared default `e=.78` remains a provisional simulation input, **not** an endorsed golden number.

Sensitivity at the same generic case (diagnostic perturbations, **not historical uncertainty bars**):

| Parameter perturbation | Lower assumption: deg/s | Baseline: deg/s | Upper assumption: deg/s |
|---|---:|---:|---:|
| `e` ±10% (CD0 re-fitted per case) | 16.84 | 17.89 | 18.88 |
| Test mass ±5% | 18.97 at −5% mass | 17.89 | 16.91 at +5% mass |
| Assumed `CLmax` ±10% | 17.25 | 17.89 | 17.89 |
| Propulsive power ±5% | 17.28 | 17.89 | 18.49 |

## Absolute Allied speed numbers: shared candidate C

**P-47B 41-5902**, historic vs calculated TAS mph (one 5,000-ft fit, remaining five withheld):

| Altitude ft | Report mph | Calculated mph | Model minus test mph | Status |
|---:|---:|---:|---:|---|
| 5,000 | 352 | 352.00 | 0.00 | Calibration |
| 15,000 | 386 | 386.05 | +0.05 | Held out |
| 25,000 | 420 | 423.26 | +3.26 | Held out |
| 27,800 | 429 | 434.10 | +5.10 | Held out |
| 30,000 | 426 | 429.89 | +3.89 | Held out |
| 34,000 | 412 | 417.94 | +5.94 | Held out |

**P-51B-15 43-24777**, 67-inHg, historic vs calculated TAS mph (sea-level fit, remaining eight withheld):

| Altitude ft | Report mph | Calculated mph | Model minus test mph | Status |
|---:|---:|---:|---:|---|
| 0 | 361.5 | 361.50 | 0.00 | Calibration |
| 4,000 | 380.0 | 377.99 | −2.01 | Held out |
| 7,400 | 395.5 | 392.73 | −2.77 | Held out |
| 10,300 | 409.0 | 405.90 | −3.10 | Held out |
| 18,000 | 408.0 | 407.12 | −0.88 | Held out |
| 20,800 | 417.0 | 417.61 | +0.61 | Held out |
| 24,000 | 426.0 | 429.84 | +3.84 | Held out |
| 28,000 | 419.0 | 422.85 | +3.85 | Held out |
| 32,000 | 410.0 | 413.82 | +3.82 | Held out |

## Absolute Allied climb numbers: the good and the bad

**P-47B military power**, candidate C, reported climb MAP conditioned and aggregate open-cowl/configuration loss fit **only at 15,000 ft**:

| Altitude ft | Report ft/min | Model ft/min | Error ft/min | Role |
|---:|---:|---:|---:|---|
| 15,000 | 2,330 | 2,330 | 0 | One config-loss fit |
| 20,000 | 2,150 | 2,136 | −14 | Withheld |
| 23,400 | 2,000 | 2,058 | +58 | Withheld |
| 25,000 | 1,810 | 1,797 | −13 | Withheld |
| 30,000 | 1,190 | 1,050 | −140 | Withheld |

**P-51B**, candidate C with the level-speed polar *frozen* and no climb-specific refit. Historical climb IAS and exact mass airborne were not independently measured in the cited text; each report's *takeoff* mass is used as scenario mass. The May 15 and May 20 memos concern **the same 43-24777**, not independent aircraft.

| Wright Field memo | Altitude ft | Setting | Source takeoff lb | Report ft/min | Model ft/min | Error ft/min |
|---|---:|---|---:|---:|---:|---:|
| 20 May 1944 | 2,200 | 67 inHg | 9,335 | **3,820** | **3,401** | **−419** |
| 20 May 1944 | 2,200 | 75 inHg | 9,335 | **4,380** | **3,979** | **−401** |
| 15 May 1944 | 5,600 | 67 inHg | 9,680 | 3,920 | 3,317 | −603 |
| 15 May 1944 | 2,300 | 75 inHg | 9,680 | 4,380 | 3,797 | −583 |
| 15 May 1944 | 19,200 | 67 inHg | 9,680 | 3,170 | 2,510 | −660 |
| 15 May 1944 | 15,700 | 75 inHg | 9,680 | 3,700 | **Unavailable** | — |

The 15,700-ft 75-inHg point is **outside our source-supported high-blower power map**; we do not extrapolate it. May 20 67→75 inHg boost gain: **reported +560 ft/min**, candidate C **+577 ft/min**, difference **+17 ft/min**. That good delta does not fix the roughly 400-ft/min absolute offset.

## Evidence classification

| Evidence | Type and what it can establish |
|---|---|
| [German Bf109 F-2/F-4 technical manual](https://stephentaylorhistorian.com/wp-content/uploads/2020/04/bf109f-2-f-4wa.pdf) | **Original wartime manual facsimile, only indexed text inspected** for 1.685:1 DB 601E gear; original page not independently verified in current package |
| [Messerschmitt 19 September 1942 flight trial](https://www.wwiiaircraftperformance.org/me109/VB-109-19-L-42.pdf) | **Inspected original report scan**; DB601E engine 2,500 rpm / 1.30 ata on **G-1**, not F-4 aerodynamic evidence |
| [Jan Bobek / EDUARD historical synthesis](https://info.eduard.com/en/06-2023-1/rufe) | **Secondary synthesis** of Rechlin/Baumgartl-derived 325-mph combat / 336-mph emergency values; same synthesis, not independent test programs |
| [F-4 vs Fw190 Rechlin four-minute clue](https://www.whq-forum.de/invisionboard/index.php?showtopic=27166) | **Unverified secondary numeric quotation** of an original test; do not fit to it |
| [Wright Field P-47B report transcriptions](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html) and [P-51B 43-24777 tests](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) | **Period primary-report HTML transcriptions**, not separately audited original scanned numerics here; speed/climb benchmark inputs |
| Greg's original worksheet, screenshots and provided simulator | **User-provided reconstructed calculations**, not measured historical coefficients |
| `CD0`, `e`, `CLmax`, prop A/B/C, cooling/config loss | **Assumed or calibrated model parameters**, not measurements; each fitting/withholding role recorded |

IAS is **not** CAS or EAS: all plotted maneuver speeds explicitly use EAS, level-speed checks use reported TAS, and no absent IAS→CAS aircraft correction is invented. The separate Greg **2,000 vs 2,600 hp** Thunderbolt experiment deliberately holds the same drag/polar/geometry fixed and changes *only power*. It is a controlled power calculation, **not** a validated historical P-47B/D performance pairing.

## Exact files and repeatable tests

- `physics.js` and `cases.json` — live solver and historical/assumed input, including documented DB 601E gear and rated prop RPM.
- `cross_aircraft_diagnostic_v15.cjs` — reruns the **three candidate × two F-4 e** analyses and Allied withheld checks, with independent one-point per-candidate drag fits.
- `cross_aircraft_results_v15.json` — full unrounded values, each original and modeled point, source grades, separate turn sensitivities, source bounded failures. **This file is the machine-readable authority for the tables above.**
- `plot_cross_aircraft_v15.py` / `cross_aircraft_v15.png` — interpretable four-panel evidence, including the negative P-51 climb result.
- `test_cross_aircraft_v15.cjs` — regression and evidence guardrails. Older `bf109_rating_results_v14.json`, `bf109_rating_v14.png`, `README_BF109_v14.md` are **historical v1.4 snapshots only**, explicitly superseded; do not rewrite them against the corrected gearing.
- `make_html.py` / `Universal_Three_Aircraft_Model_v1.5.html` — updated offline graphical interface with absolute v1.5 report panel.

From `CURRENT_v0.7_WORKING_SOURCE`, run:

```bash
node cross_aircraft_diagnostic_v15.cjs --write
node test_cross_aircraft_v15.cjs
python3 plot_cross_aircraft_v15.py
python3 make_html.py
```

Also run the original regression suite as documented in the handover. Optional Playwright/Chromium browser check is **not installed** in the current runtime; a standalone HTML JS-syntax sanity check can run, but it is *not* a browser interaction test.

### The immediate next move — keep eyes on the ball

1. **F-4 low-speed gate:** obtain an original F-4 **measured** steady glide/drag, accurate turning point, or reproducible climb test with actual IAS/CAS, weight, rating, prop and radiator settings. Only that can distinguish F-4 `e`/installed low-speed polar without choosing whichever arbitrary assumption matches 4:00.
2. **P-51 absolute climb gate:** inspect the original Wright Field power-versus-altitude and climb-speed schedule (figures / engineering memo) for 43-24777; audit altitude-specific power, airframe cooling, weight and actual climbing IAS before altering candidate C. In particular the profile C predicted *optimal TAS* around 171–175 mph at 2,200 ft is model-derived, not a recorded test speed.
3. **Cross-aircraft verification:** with either independent constraint, rerun exactly these cases and compare **absolute values and relative gaps**. Change a shared equation/input only if it explains failures across aircraft while preserving previously withheld checks. No wider arbitrary e-bands, no new unrelated types.

**Bottom line:** v1.5 identifies a real 109 mechanical input error and discriminates a better **shared speed/prop candidate** across aircraft. We now know why the turn predictions differ; we do **not yet know which F-4 turn prediction is right**, and we have an explicit unsolved P-51 climb offset. This is the honest clean baseline from which to progress.
