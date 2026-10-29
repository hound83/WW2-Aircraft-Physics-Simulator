# European Air War — Clean Physics v1.6

**26 October 2026. Status: focused source-regime validation; physically honest unsolved P-51B/F-4 gates.**

## The goal, still unchanged

Build a single physically defensible aircraft-performance solver, not separate aircraft-specific curve mimics. Confirm the **absolute** outputs against original historical flight tests and Greg's independent worksheet scenarios. Preserve every historical source and tell calculated assumptions apart from measurements.

## What actually changed in v1.6

1. **Recovered four ORIGINAL 20 May 1944 Wright Field P-51B-15 43-24777 scanned charts:** Figure 1 IAS position calibration, Figure 5 engine shaft horsepower *required for level flight* at 22,400 ft, Figure 6 rate of climb versus altitude, Figure 7 power versus altitude in climb. Full-quality scan JPGs are preserved in `../../06_SOURCE_AND_SCIENTIFIC_EVIDENCE/P51B_24777_ORIGINAL_SCANS/`.
2. **Added six approximate, source-labeled Fig. 5 shaft-power markers** at different TAS and engine RPM. Original plotted circles were read by eye at approximately ±4 mph and ±35 bhp, *not* transcribed from a numeric table; uncertainties of the Packard engine-power charts, radiator position, test protocol, drag and airspeed remain unknown.
3. **Correctly use recorded RPM for each test observation** (2,100, 2,300, 2,700 or 3,000 engine RPM) through P-51 44:21 engine/prop reduction. Previously the prop-efficiency check would have silently applied the 3,000-RPM performance-speed setting to all partial-power test points. The generic solver signature now supports an explicit RPM override for an observation. Regular power-rating calculations are **numerically unchanged**.
4. **No aircraft-specific correction fitted.** We compare every source point with frozen v1.5, speed-anchor-calibrated polars A/B/C and report the residuals. We also sweep physically allowable `e` from 0.55 to 1.00 *without accepting a fit* and quantify P-51 climb as missing *propulsive power*, not a proven propeller loss.
5. Included `p51_power_required_v16.png` chart, exact JSON, executable Node diagnostic, regression test, and standalone `Universal_Three_Aircraft_Model_v1.6.html` with **both chart and original Fig. 5 scan embedded offline**. Full previous-release files remain untouched.

## Big result: the P-51B really has a lower-speed model mismatch

**Historical source:** Original USAAF Materiel Command report Eng-47-1749-A, 20 May 1944, P-51B-15 43-24777, Figure 5, 22,400 ft, ≈9,240 lb. Shaft BHP was assigned using a Packard power chart; not a torque-meter flight measurement. The source chart includes multiple RPM/gear/mixture conditions, so the following is a diagnostic **at each actual test RPM**, not one continuous fixed-RPM power curve.

| Original Fig. 5 TAS | Engine RPM | Approx source bhp | Model C required bhp | Model − source | C η at source RPM | η implied if C drag polar were exact |
|---:|---:|---:|---:|---:|---:|---:|
| 270 mph | 2,100 | 490 | 556 | +66 | .808 | .917 |
| 318 mph | 2,300 | 610 | 729 | **+119** | .792 | **.946** |
| 387 mph | 2,700 | 1,000 | 1,117 | **+117** | .781 | .873 |
| 395 mph | 3,000 | 1,090 | 1,143 | +53 | .802 | .841 |
| 415 mph | 3,000 | 1,290 | 1,310 | +20 | .790 | .802 |
| 430 mph | 3,000 | 1,440 | 1,452 | +12 | .779 | .786 |

All figure readings are approximate and the source points are **not held out from the same flight-test programme in the statistical sense**. However they cover previously untested speed/power regimes. Positive residual means our model demands too much shaft power.

At 318 mph, holding the existing v1.5 P-51B drag polar frozen would require propeller η=.946. The current heuristic is capped at .91. Treating `.946` as a measured correction or forcing a larger η into the solver would be **scientifically indefensible**.

### Comparing shared prop candidates against original Fig. 5

| Shared prop option | Figure 5 six-point MAE | First four lower/mid-speed MAE | P-51B full-altitude withheld top-speed MAE |
|---|---:|---:|---:|
| A fixed η=.8 | 57.5 bhp | 67.3 bhp | See v1.5 source results |
| B speed-linear η | **49.2 bhp** | 68.5 bhp | See v1.5 source results |
| C universal J/Cp/tip-Mach heuristic | 64.3 bhp | 88.6 bhp | **2.61 mph** |

There is **no one winner in all regimes**. C is excellent for both Allied aircraft's full-altitude top speeds; it is not validated for low/mid-speed P-51B propulsive power. B's apparently better absolute P-51B climb cannot justify making B the global solver either.

### Is the P-51B Oswald factor the cause?

Every row below **re-fits only the same originally permitted 361.5-mph sea-level anchor** for internal sensitivity, not the new Fig. 5 markers:

| Assumed e | One-speed-fitted CD₀ | First-four-source-point MAE |
|---:|---:|---:|
| .55 | .01581 | 156 bhp |
| .65 | .01603 | 121 bhp |
| .78 | .01622 | 89 bhp |
| .90 | .01635 | 67 bhp |
| 1.00 (mathematical upper bound) | .01644 | **53 bhp** |

Increasing e helps but cannot make the current model pass the source check, **even at the absolute mathematical bound**. Low/mid-speed drag-polar shape, installed prop thrust, exhaust/exit momentum and source engine BHP deserve scrutiny. They are **not separably identifiable** from one power-required curve without more evidence. NACA wartime jet-exhaust tests on a different Merlin-powered Spitfire show the relevance of exhaust installation effects, but explicitly could not distinguish exhaust thrust gains from drag changes; we cannot transfer a numerical correction to the P-51B.

## P-51B absolute climb — frozen v1.5 predictions (May 20, 1944)

| Rating at 2,200 ft, 9,335 lb takeoff | Reported climb | Model C best climb | Missing climb | Extra equivalent propulsive horsepower | C prop η | η *if only prop were wrong* |
|---|---:|---:|---:|---:|---:|---:|
| 67 inHg | 3,820 ft/min | 3,401 ft/min | **419 ft/min** | **119 hp** | .781 | .855 |
| 75 inHg | 4,380 ft/min | 3,979 ft/min | **401 ft/min** | **114 hp** | .784 | .847 |

Predicted boost delta +577 ft/min versus reported +560 (+17 error), so the **power rating increment** is believable while total usable installed excess power is not yet explained. The reported climb IAS/TAS schedule and instantaneous fuel-burn weight are unavailable. No arbitrary 115-hp thrust constant is applied. Figure 7 is a *power versus altitude* wartime source, but it does **not** supply a complete installed thrust/drag correction or flight climb-speed schedule.

## Other airplanes: the absolute benchmark still matters

Shared prop C, one per-aircraft anchor, standard weight and supported altitude/rating only.

| Aircraft | Absolute matched evidence | Reported | Model | Error |
|---|---|---:|---:|---:|
| P-47B | 5,000 ft, military level speed (fitted anchor) | 352 mph | 352 mph | 0 |
| P-47B | 27,800 ft military level speed (withheld) | 429 mph | 434.1 mph | +5.1 mph |
| P-47B | All 5 withheld level-speed points | — | — | **3.65 mph MAE** |
| P-47B | Four withheld climb altitudes, *after separate one-point configuration-loss fit* | — | — | **56 ft/min MAE** |
| P-51B | Sea level 67 inHg level speed (fitted anchor) | 361.5 mph | 361.5 mph | 0 |
| P-51B | 10,300 ft 67 inHg level speed (withheld) | 409 mph | 405.9 mph | −3.1 mph |
| P-51B | 24,000 ft 67 inHg level speed (withheld) | 426 mph | 429.8 mph | +3.8 mph |
| P-51B | All 8 withheld level-speed points | — | — | **2.61 mph MAE** |
| Bf 109 F-4 | Sea-level combat level speed (fitted anchor) | 325 mph | 325 mph | 0 |
| Bf 109 F-4 | Sea-level emergency level speed (withheld rating) | 336 mph | 339.4 mph | +3.4 mph |
| Bf 109 F-4 | Provisional 1,000–5,000 m climb time, optimized speed | 4:00 **unverified secondhand** | **3:34** e=.780; **3:50** e=.558 | Not yet independently testable |
| Bf 109 F-4 | Modeled 170 mph EAS at 5,000 ft, combat turn | **No measured original** | **17.89°/s** e=.780; **14.71°/s** e=.558 | **Unconstrained** |

**Why F-4 is not "fixed":** Greg's spreadsheet-derived `e=.558` is not observed low-speed flight data. The 1.685 DB601E engine/prop reduction correction in v1.5 remains intact. A 4:00 climb quotation without original Rechlin test-power/radiator/IAS conditions is not a substitute for a flight-test drag polar; no universal e or aircraft-specific e is fitted to a theoretical turn number.

## The next shortest path to actually closing the model

1. **P-51B low/mid-speed source reconciliation:** first validate the chart marker precision, source weight/cooling/power assumptions and 44:21 gear mapping. Obtain an installed prop performance map (not another generic η curve). Check physical speed/advance-ratio and available thrust versus Figure 5; only then determine if a measured Mach/Reynolds-dependent drag adjustment is necessary.
2. **P-51B climb reconciliation:** verify Figure 7 against the active altitude power nodes and obtain the wartime climb IAS schedule if possible; separately quantify installed exhaust/exit momentum **from a source for this installation** rather than a free additive horsepower parameter.
3. **F-4 e evidence gate:** find an original **F-4-specific** steady glide/turn power polar or sufficiently matched climb and prop data. Until then display the two sensitivity cases with their actual large spread, and do not publish precise historical sustained-turn rankings.

This narrows remaining work to actual missing physical evidence; it does not add new speculative aircraft, drag knobs, or silently narrow disagreements.

## Run and inspect

```bash
node p51_drag_validation_v16.cjs --write
node test_p51_v16.cjs
python plot_p51_v16.py
python make_html.py
node test_html_static_v16.cjs
```

Previous v1.5 and other legacy Node regression scripts remain in the source directory and should also pass. The new standalone HTML embeds chart and source scan as data URIs. A browser runtime smoke check is recommended when Chromium is available; static JS parsing is performed by `test_html_static_v16.cjs`.

## Key source IDs

- **Wright Field original May 20 1944 P-51B 43-24777 original Figure 5**: <https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Power_Required.jpg>
- **Original Figures 1, 6, 7, original wartime report HTML transcription**: <https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html>
- **NACA source on exhaust stacks in a different airframe, indicating effect but no separation from drag**: <https://ntrs.nasa.gov/api/citations/19930093540/downloads/19930093540.pdf>
- **NACA radial test indicating exhaust effects are possible at high airspeed, but not transferable to Merlin/P-51B**: <https://ntrs.nasa.gov/citations/20090014842>
- **F-4 original wartime manual indexed scan**: <https://stephentaylorhistorian.com/wp-content/uploads/2020/04/bf109f-2-f-4wa.pdf>

**Grading:** original wartime Figure 5 read directly; markers rough manual digitization; source reports transcribed on archival website; NACA documents primary but other installations; F-4 4:00 as yet secondary/unverified; Greg worksheet for independent calculation checking, not measured F-4 polar.
