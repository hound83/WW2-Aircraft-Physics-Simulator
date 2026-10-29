# European Air War — Clean Physics v1.7

**26 October 2026. Joint F-4 sustained-turn / P-51B low-speed installed-power audit.**

## Outcome — eyes on the ball

1. **The excessive Bf 109 F-4 sustained-turn performance in the generic scenario is real.** Its assumed `e=.780` gives 17.47 seconds for a 360-degree sustained turn at sea level and 270 km/h CAS proxy, versus **20.3 seconds in the IL-2 Great Battles specification**. At 3,000 m the gap increases: **21.06 vs 26.1 seconds**. This is an apples-to-apples *simulator-to-simulator* conditional check of standard mass/emergency rating/speed, **NOT a historic flight-test validation**.
2. **One F-4 conditional e=.54698**, fitted ONLY to IL-2's sea-level 20.3-second turn and with `CD0` reanchored to our existing 325 mph combat level-speed datum, predicts **25.89 seconds** at IL-2's **withheld 3,000-m 26.10-second** turn. It is close to Greg's independently inferred **e=.55767**. The original Bf 109F-specific low-speed polar and IAS→CAS instrument/position calibration are **still missing**. Do not report the .547 number as a flight-measured or narrow historical uncertainty interval.
3. **The P-51B power mismatch is still not fixed**, and the same shared propulsive-power issue can shift both aircraft's low-speed E-M predictions. On the original 1944 Mustang engine shaft-power curve at 22,400 ft, model C requires ≈729 bhp versus ≈610 bhp at 318 mph (+119), and 1,117 vs 1,000 bhp at 387 mph (+117), despite exceptionally good top-speed holdouts. Absolute P-51B climb at 2,200 ft remains **3,401 / 3,979 ft/min model** vs **3,820 / 4,380 historical**.
4. **No synthetic prop/drag correction was added to the shared physics.** We narrowed the F-4 *operational simulator-comparison scenario* now and made it selectable/default in the offline HTML, without changing P-47B/P-51B performance coefficients or historical benchmarks. You can toggle back to the generic e slider. The earlier v1.6, v1.5 artifacts and all Greg files are preserved.

## F-4: absolute same-condition turns (IL-2 Great Battles, another simulation)

At 270 km/h **IAS reported by IL-2**, modeled as 270 km/h **CAS proxy** pending actual airspeed calibration, emergency 1,350 PS, standard mass ≈2,890 kg/6,371 lb, ISA. Source: [IL-2 Great Battles Bf 109 F-4 specs](https://www.openflightschool.de/mod/book/view.php?chapterid=357&id=515).

| Altitude | IL-2 game | Generic `e=.78` | Greg `e=.55767` | Conditional `e=.54698` | Conditional residual |
|---|---:|---:|---:|---:|---:|
| Sea level | 20.30 s | 17.47 s | 20.07 s | **20.30 s** | Fitted, 0.00 s |
| 3,000 m | 26.10 s | 21.06 s | 25.59 s | **25.89 s** | **−0.21 s, withheld** |

The v1.7 fit adjusts **one scalar e**, not an unseen set of airframe parameters. For each e, `CD0` is refitted exclusively to the same independent, provisional 325-mph combat *level-speed* anchor to maintain the high-speed constraint. Source 270-km/h turns specify **emergency**, while the standard 170-mph EAS v1.5 comparison specifies **combat**. Mixing engine modes artificially changes the turn result.

At **5,000 ft, 170 mph EAS, combat power**, using unchanged shared candidate C:

| Bf 109 F-4 case | Sustained turn rate | Predicted emergency sea-level top speed |
|---|---:|---:|
| Generic e=.780 | **17.89 deg/s** | 339.37 mph |
| Greg inferred e=.55767 | **14.71 deg/s** | 339.77 mph |
| Provisional simulator-conditioned e=.54698 | **14.54 deg/s** | 339.79 mph |

All still overpredict the secondary-reported F-4 emergency top speed of ~336 mph by 3–4 mph (rating holdout, same disputed source provenance). A historically reliable sustained-turn ranking is **not** established. In particular, do not misdescribe the IL-2 data as captured original 1941 turn tests; it explicitly describes its **in-game** F-4 specification.

### Robustness: speed correction versus actual power

- Treating CAS as 265 / 270 / 275 km/h at 270 IAS gives **fitted e=.5377 / .5470 / .5566**, respectively; all predict withheld 3,000-m IL-2 time ≈25.89 s if the same correction is assumed at both altitudes. ±5 km/h is a **hypothetical sensitivity**, *not a measured IAS calibration*.
- At frozen e=.54698, hypothetical usable-power factors **.95 / 1.00 / 1.05** change sea-level turn to **21.01 / 20.30 / 19.65 seconds**, respectively; 3,000 m to **26.85 / 25.89 / 25.03 seconds**.
- Refitting the game sea-level time after those power changes moves inferred e to **.5803 / .5470 / .5173**. Thus uncertainty in installed propulsive power affects e far more than our hypothetical ±5-km/h airspeed correction.
- These are *sensitivity probes*, not new power model coefficients and not empirical ±5% performance claims.

## P-51B: preserve the absolute power gap

Historical original Wright Field P-51B-15 43-24777, 20 May 1944. See `README_CLEAN_v16.md` and original scan `../../06_SOURCE_AND_SCIENTIFIC_EVIDENCE/P51B_24777_ORIGINAL_SCANS/Fig_5_power_required.jpg`.

| Source test | Original flight report | Shared model C | Model error |
|---|---:|---:|---:|
| Shaft BHP needed, 22,400 ft / 318 mph TAS, 2,300 engine RPM | ≈610 bhp | ≈729 bhp | +119 bhp |
| Shaft BHP needed, 22,400 ft / 387 mph TAS, 2,700 engine RPM | ≈1,000 bhp | ≈1,117 bhp | +117 bhp |
| Best climb at 2,200 ft / 67 inHg / 9,335 lb | 3,820 ft/min | 3,401 ft/min | −419 ft/min |
| Best climb at 2,200 ft / 75 inHg / 9,335 lb | 4,380 ft/min | 3,979 ft/min | −401 ft/min |

Fig. 5 marker uncertainty ≈±4 mph and ±35 bhp by visual read, *plus unknown source BHP-chart/test-condition errors*. Missing P-51 propulsive equivalent ≈119/114 hp, but there is **no evidence it is 100% propeller efficiency**. Forcing the high-speed-constrained model to match Fig. 5's 318-mph point using propeller-only correction requires impossible-to-justify η=.946, above existing .91 heuristic cap. Changing e all the way to its mathematical bound 1.00 still leaves ~53 bhp average low/mid-speed figure mismatch. Don't conceal it.

A hypothetical ±5% gain/loss in usable propulsive power moves predicted P-51 climbs by ≈+221/+251 or −221/−251 ft/min near the current modeled optimum-speed point. This does **not** make the source checks pass and is **not an accepted correction**.

## A new common-physics warning from original NACA research

[NACA TN 2022, Hammack & Vogeley, 1950, original report](https://ntrs.nasa.gov/citations/19930082679) measured propeller thrust and engine torque on **three-bladed, radial-engine fighters**. At 165 mph IAS climb, raising blade power loading *decreased* propeller efficiency due to induced losses. At Mach 0.7, the trend reversed from profile-loss reductions. Our *candidate C heuristic*, evaluated at the P-51 and F-4 low-speed climb operating conditions, instead gives a **small positive** d(η)/d(power); its power-loading dependence isn't convincing as an installed low-speed prop model.

This does not authorize importing NACA's **different propeller's magnitude** to a P-51 four-blader or Bf 109 installation. A legitimate next step is a historically appropriate Hamilton Standard K-6523A-24 (this Wright Field P-51B specimen) or Messerschmitt VDM efficiency/advance-ratio/power-loading map, with the proper installation and engine-RPM range. Then rerun **both** airplanes before accepting an aircraft-specific performance adjustment.

## Three-aircraft absolute guardrails — frozen physics engine

| Aircraft | Absolute historical cross-check | Observed | Model C | Uncertainty |
|---|---|---:|---:|---|
| P-47B | 27,800-ft military level TAS, withheld | 429 mph | 434.1 mph | +5.1 mph; 5 speed holdout MAE 3.65 mph |
| P-47B | After a *one-point* cooling/configuration-loss fit, 4 climb holdouts | — | — | 56 ft/min MAE, **conditioned fit** |
| P-51B | 10,300-ft 67-inHg TAS, withheld | 409 mph | 405.9 mph | −3.1 mph; 8 speed holdout MAE 2.61 mph |
| Bf 109 F-4 | Sea-level combat TAS, calibration | 325 mph | 325 mph | **Fit**, not withheld |
| Bf 109 F-4 | Sea-level emergency TAS, independent rating | ≈336 mph | 339.79 mph | ≈+3.8 mph; preliminary secondary provenance |
| Bf 109 F-4 | Sustained turn at 3,000 m / 270 km/h IAS | 26.1 s **IL-2 game** | 25.89 s at conditional e | −0.21 s; cross-simulation only |

The physical equations remain **the same** for all three aircraft; e is an airframe-specific aerodynamic input, not necessarily a universal constant. Selecting an F-4 conditional input is distinct from inventing an F-4 thrust bonus. The P-47D-28-style 2,600-hp Greg power trial remains separate from the historically fitted P-47B aircraft.

## Run/reproduce

```bash
node joint_low_speed_v17.cjs --write
node test_joint_v17.cjs
python plot_joint_v17.py
python make_html.py
node test_html_static_v17.cjs
node test_p51_v16.cjs
node test_cross_aircraft_v15.cjs
```

### Deliverables

- `joint_low_speed_v17.cjs` and `joint_low_speed_results_v17.json`: reproducible paired audit, independent-turn benchmark train/test partition, full absolute values, CAS and power sensitivities, NACA qualitative slope diagnostic.
- `joint_low_speed_v17.png`: original F-4/P-51 comparison chart, no image-model-synthesized figures.
- `Universal_Three_Aircraft_Model_v1.7.html`: self-contained offline interactive simulator with F-4 provisional scenario **on by default**, alternative global e scenario, charts, original Wright Field P-51 Figure 5 and preserved v1.5/v1.6 audits.
- `README_CLEAN_v16.md` + original scans/Greg data retained unchanged for provenance.

**Next two validation gates:** (1) original F-4-specific low-speed polar or calibrated flight-test IAS+prop power, (2) installed P-51B/F-4 propeller performance map applicable to tested RPM/J/Cp and measured climb conditions. No more unsourced universal efficiency tweaks.
