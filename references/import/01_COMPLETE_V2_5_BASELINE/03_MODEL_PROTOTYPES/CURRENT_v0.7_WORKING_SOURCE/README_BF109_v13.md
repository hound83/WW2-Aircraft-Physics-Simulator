# Clean Physics v1.3 — Bf 109F-4 rating/drag-polar audit

26 October 2026. **A clean separation of engine power-setting identification from Oswald-factor inference.** This is an audit of the existing universal model, not a new historical F-4 flight-test claim.

## Result in one sentence

Changing which engine rating the 325-mph sea-level figure is assigned to moves the **predicted emergency maximum speed by ~13.85 mph**; changing Oswald efficiency from **0.78 to Greg's 0.55767** moves it only **~0.39 mph**, yet changes the 5,000-ft/170-mph-EAS modeled sustained-turn rate by **~3.32°/s**. **Maximum-speed matching cannot resolve the low-speed drag polar.**

## Frozen inputs and cases

- Bf109F-4 at 6,371 lb, 16.05 m² wing area and 9.92 m span.
- Same DB601E two-rating power curves and same provisional geometric propeller efficiency profile C.
- Same 325-mph reference speed and 1940s atmospheric/drag formulae; in each hypothesis refit ONLY the parasitic-drag `CD0` once at the anchor, not at every altitude or turn speed.
- Two possible labels for 325 mph: combat (~1,184 bhp) or emergency (~1,332 bhp). Historical labeling is **not established**; combat labeling is supported as a useful **hypothesis** by the IL-2 specification (522 km/h sea level at combat rating), but that source is a simulator developer specification, NOT a historical independent measurement.
- Two possible Oswald coefficients: generic **0.78** versus **0.55767**, algebraically reconstructed from Greg's screenshot, NOT from a wartime aerodynamic drag polar.

| Hypothesis for 325-mph anchor | `e` | Fitted `CD0` | Combat SL TAS | Emergency SL TAS | Emergency 5,000-ft TAS | Sustained turn 5,000 ft, 170 mph EAS |
|---|---:|---:|---:|---:|---:|---:|
| Combat power | 0.78000 | 0.022979 | 325.00 mph | **338.85 mph** | 354.35 mph | **18.92°/s** |
| Combat power | Greg 0.55767 | 0.022484 | 325.00 mph | **339.23 mph** | 354.47 mph | **15.60°/s** |
| Emergency power (legacy) | 0.78000 | 0.026017 | 311.55 mph | **325.00 mph** | 340.02 mph | **18.69°/s** |
| Emergency power (legacy) | Greg 0.55767 | 0.025522 | 311.17 mph | **325.00 mph** | 339.75 mph | **15.41°/s** |

Turn outputs remain **unvalidated scenarios**; `CLmax=1.50` is assumed. With the **same** 325-mph speed and power setting, one can fit two different `CD0/e` combinations that give nearly identical speed predictions but substantially different low-speed induced drag.

## Historical sources and strict evidence gate

We located the following, but **none measures a suitable F-4 low-speed drag polar or well-matched steady-turn series**:

1. **Original document series identified:** *D.(Luft)T. 2109 F-1 bis F-4, Teil 0*, March 1942, F-1/F-4 aircraft handbook. The index establishes existence; full aerodynamic pages not accessed. [Handbook index](https://www.museumalkmaar40-45.nl/voorschriften-manuals/d-luftt/d-luftt-2109).
2. **Primary test with an altered airframe:** Messerschmitt report 109 05 E43, April 1943, aircraft W.Nr. 9228, a 109F **with G-series wings**, in high-speed dives. This source cannot be reclassified as a standard F-4's low-speed steady drag coefficient. [Original scan with translation](https://www.wwiiaircraftperformance.org/me109/Diving_Test_109F_W.Nr.9228_ger_eng.pdf).
3. **Independent primary trial, but a different aircraft:** British March 1943 Bf 109G-2(trop) test: 112 mph **IAS** clean stall; different G airframe/DB605 power/test weight, calibration unknown. It does not directly determine the F-4's `CLmax`. [Wartime British trial transcript](https://www.wwiiaircraftperformance.org/me109/me-109g2-trop.html).
4. **Possible but not authenticated low-speed constraint:** Finnish Bf109 **G-2** report (attributed to Captain Pekka Kokko, 1943) discussed in a later enthusiast compilation: level 3-g turning at 360 km/h **IAS**, ~1000m, 30-minute power. Without original report/installation, speed calibration and variant matching, this remains an *unverified lead*, not a numerical fitting target. [Later compilation](https://www.virtualpilots.fi/feature/articles/109myths/).
5. **Nonindependent cross-check:** IL-2 developers publish 522 km/h TAS at sea level at **combat power**, ~1,200 PS, and a stall range of 154–171 km/h **IAS**. Useful for investigating the power setting, **not** measured independent F-4 evidence. [IL-2 aircraft page](https://il2sturmovik.com/museum/fighters/bf-109-f-4/).
6. **Original German performance sheets, secondary summaries:** F-4 635 km/h at 6000m (combat), approximately 670 km/h at 6300m (emergency), source represented in aviation archival summaries. The current DB601E engine map ends at 15,748ft (~4800m), so ***the model must not predict at 6000m by extrapolating that map***. [German comparative test discussion](https://falkeeins.blogspot.com/2017/07/).

The P-47B source-fit and P-51B source-fit speed curves remain unchanged. Re-run the withheld speed observations to confirm:

| Aircraft | Speed fit point | Withheld test points | Withheld MAE |
|---|---|---:|---:|
| P-47B 41-5902 | 5,000 ft / 352 mph | 5 | **3.65 mph** |
| P-51B-15 67-inHg | Sea level / existing anchor | 8 | **2.61 mph** |

These residuals validate portions of the **level-speed model** under its prop/power assumptions; they do not validate sustained-turn behavior.

## What changed

1. `bf109_anchor_audit_v13.cjs` generates four conditional cross-checks with the same physics engine, reporting speeds, turn-speed curves and held-out P-47B/P-51B regression.
2. `bf109_anchor_results_v13.json` records every numerical output and the source/evidence status.
3. `bf109_anchor_v13.png` + `plot_bf109_anchor_v13.py` visualize power-label ambiguity vs drag-polar ambiguity, including **the sustained-turn divergence**.
4. `test_bf109_anchor_v13.cjs` guards all four anchor scenarios, P-47/P-51 regressions and evidence classification.
5. `cases.json` now **explicitly marks** the existing 109 325-mph emergency-power label as an ambiguous *legacy scenario*; this documentation change does not silently alter any numeric model output.

No default drag coefficients, CLmax, engine curves, or shared flight physics were changed. In particular, we **did not** adopt the simulator's speed as if it were a wartime independent measurement.

## Next truly resolving measurement

Priority: obtain a Bf 109F-4 **low-speed** source with power and configuration simultaneously known—for example a measured IAS/CAS-calibrated sustained-turn point, low-speed drag-polar/glide measurements, or multiple level speeds across demonstrably identical power/prop settings but different weights. A useful source must distinguish lift-dependent drag from parasitic drag and installed propeller power. The F-4 **rated-power label** on the 325-mph test also needs an original citation. Until that happens, retain **both polar candidates**, do not select one by maximum-speed fit.

## Reproduce

```bash
node bf109_anchor_audit_v13.cjs --write
node test_bf109_anchor_v13.cjs
python3 plot_bf109_anchor_v13.py
```

The source code, inputs, tests, results and graph travel together in the ZIP handover. The Atlas website was not modified.
