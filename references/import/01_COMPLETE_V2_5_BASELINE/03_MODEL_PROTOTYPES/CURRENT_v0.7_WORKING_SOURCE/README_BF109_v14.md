# European Air War — Clean Physics v1.4

**26 October 2026. This is the current scientific baseline for the Bf 109F-4.** v1.3 remains in the handover as a reproducible hypothesis audit but has been superseded as the live case setting.

## Outcome

The historical attribution of the F-4's **325 mph sea-level maximum TAS** has been corrected from an unfounded *emergency* assumption to **combat power (approximately 1200 PS, 30-minute rating)**. The historical **336 mph emergency-power (1350 PS, 1-minute rating)** figure is now a genuinely **unfitted different-power check**. Both figures are reported in published historical research citing Baumgartl's Rechlin-based tables; the exact original wartime report and aircraft configuration have **not** been independently inspected. The two speed values therefore do **not** constitute two statistically independent test campaigns.

The emergency-power default has also been changed to the **combat-power default**. This avoids using a 1-minute power setting for the baseline *sustained-turn* plot. Emergency power remains available through an explicit `rating:'emergency'` option, but a power-balanced turn modeled at this setting is **not maintainable indefinitely**.

## Bf 109F-4: every relevant absolute figure

Same aircraft, 6,371 lb assumed, 16.05 m² wing and 9.92 m span; unchanged generic propeller candidate C, installed DB601E rating curves, assumed `CLmax=1.50`. One and only one coefficient (`CD0`) is refitted at **325 mph combat at sea level**, separately for each `e` hypothesis.

| Metric | Historical / test | Generic `e=0.78` | Greg-derived `e=0.55767` |
|---|---:|---:|---:|
| Sea-level combat top TAS | **325 mph** (fit) | 325.00 | 325.00 |
| Sea-level emergency top TAS | **336 mph** (withheld) | **338.85** | **339.23** |
| Emergency deviation | — | **+2.85 mph** | **+3.23 mph** |
| 5,000-ft combat maximum TAS | not sourced | 340.79 | 340.50 |
| 5,000-ft emergency maximum TAS | not sourced | 354.35 | 354.47 |
| Fitted `CD0` | no measured polar | 0.022979 | 0.022484 |
| Sea-level best combat climb | no exact matched trial | 3,598 ft/min | 3,384 ft/min |
| Climb 1,000–5,000 m | **4:00** (secondary Rechlin quotation) | **3:42** | **3:59** |
| 5,000-ft, 170-mph-EAS **combat** turn | no measured F4 point | **17.56 °/s** | **14.43 °/s** |
| 5,000-ft, 170-mph-EAS emergency turn | no measured F4 point | **18.92 °/s** | **15.60 °/s** |

The climb comparison is interesting: Greg's lower `e` is within ~1 second of the claimed four minutes, whereas `e=.78` is ~18 seconds faster. However, the four-minute datum comes from a later forum transcription of a wartime Rechlin comparison of **standard-weight F-4 vs Fw 190A-2**, rather than a checked original numeric table. Actual test climb manifold pressure, engine settings, cooling/radiator drag, airspeed schedule and installation efficiency are unresolved. These errors can also change the calculated climb time; therefore **do not choose `e=.558` solely because it matches 4:00**.

The **3.14°/s difference in 30-minute combat-turn predictions** is larger than the turn-rate differences we want to resolve between many aircraft. We have narrowed one issue (rating labels) and exposed another (the low-speed polar). Both `e` values and the assumed CLmax remain open; do not present one as a validated aerodynamic result.

## Allied aircraft: absolute speed report vs model

The Bf 109 correction did not alter the P-47B or P-51B source curves, engine power maps or aerodynamic fits. Their withheld-speed regressions were recomputed with the changed live case configuration.

| Airframe | Altitude ft | Historical mph TAS | Model mph TAS | Model minus report mph | Role |
|---|---:|---:|---:|---:|---|
| P-47B 41-5902 | 5,000 | 352.0 | 352.00 | 0.00 | Calibration |
| P-47B | 15,000 | 386.0 | 386.05 | +0.05 | Holdout |
| P-47B | 25,000 | 420.0 | 423.26 | +3.26 | Holdout |
| P-47B | 27,800 | 429.0 | 434.10 | +5.10 | Holdout |
| P-47B | 30,000 | 426.0 | 429.89 | +3.89 | Holdout |
| P-47B | 34,000 | 412.0 | 417.94 | +5.94 | Holdout |
| P-51B-15, 67-inHg | 0 | 361.5 | 361.50 | 0.00 | Calibration |
| P-51B-15, 67-inHg | 4,000 | 380.0 | 377.99 | -2.01 | Holdout |
| P-51B-15, 67-inHg | 7,400 | 395.5 | 392.73 | -2.77 | Holdout |
| P-51B-15, 67-inHg | 10,300 | 409.0 | 405.90 | -3.10 | Holdout |
| P-51B-15, 67-inHg | 18,000 | 408.0 | 407.12 | -0.88 | Holdout |
| P-51B-15, 67-inHg | 20,800 | 417.0 | 417.61 | +0.61 | Holdout |
| P-51B-15, 67-inHg | 24,000 | 426.0 | 429.84 | +3.84 | Holdout |
| P-51B-15, 67-inHg | 28,000 | 419.0 | 422.85 | +3.85 | Holdout |
| P-51B-15, 67-inHg | 32,000 | 410.0 | 413.82 | +3.82 | Holdout |

Withheld **speed** MAE: **P-47B 3.65 mph** (5 points), **P-51B 2.61 mph** (8 points). These are real but limited speed-curve checks; neither proves an accurate turn polar or universal propeller efficiency.

## Evidence provenance and caveats

1. **Published historical analysis:** Jan Bobek, *Info EDUARD* June 2023, [Friedrich article](https://info.eduard.com/en/06-2023-1/rufe); cites M. Baumgartl's performance tables based on E-Stelle Rechlin records: **523 km/h at combat setting**, **540 km/h at sea level at emergency setting**. H.H. Vogt also gives 540 km/h. No inspected original scan, hence confidence in rating attribution **moderate-to-high**, confidence in exact test setup **limited**.
2. **Original trial existence contextualized in a secondary article:** [Rechlin F-4 vs Fw190A-2, dated 10 December 1941](https://falkeeins.blogspot.com/2017/07/fw-190-versus-bf-109-friedrich-rechlin.html). Series aircraft loaded for combat. The author notes DB601E's early emergency restriction; a historical comparison's specific engine rating must not be assumed from a modern simulator.
3. **Secondary quotation, provisional only:** [2008 forum transcription](https://www.whq-forum.de/invisionboard/index.php?showtopic=27166): F-4 4:00 vs Fw 190A-2 4:50 from 1,000 to 5,000m, purportedly from Rechlin. The underlying numerical test page is **not in hand**. The four-minute result is a cross-check, NOT a second fitting anchor.
4. **Game specifications** such as [IL-2](https://il2sturmovik.com/museum/fighters/bf-109-f-4/) are useful for inspecting plausible DB601E power schedules and mode durations, not independent original speed, sustained-turn or stall tests. The prototype still uses a generic modeled propeller and the IL-2-derived BHP schedule.
5. **Greg's worksheet** implies `e=0.55767` under our assumed 6,371-lb conversion, but that is reconstruction of user-supplied power/drag arithmetic rather than measured F-4 coefficients.
6. **Limit:** modeled F-4 emergency power stops at 15,748ft and combat stops at 16,076ft; no extrapolation above these nodes. IAS is never silently equated to CAS/EAS. Historical G-2 clean-stall IAS cannot be used as F-4 CLmax.

## Changes and verification

- `cases.json`: combat becomes F4 calibration and default, 336-mph emergency added as a *withheld different-rating check* with explicit source grade. Other airframes untouched.
- `bf109_rating_resolution_v14.cjs` + generated `bf109_rating_results_v14.json`: exact numbers, drag candidates, speed/turn curves, integrated climb segments and complete P-47/P-51 speed residuals.
- `plot_bf109_rating_v14.py` + generated `bf109_rating_v14.png`: speed power modes, climb sensitivity, turn-polar divergence, P-47/P-51 absolute errors.
- `test_bf109_rating_v14.cjs`: test 325 anchor, 336 holdout, 4-minute provisional clue, rating caps, unchanged Allies, all evidence guardrails.
- All ten core scripts (`test.mjs`, `test_clean_v08.mjs`, `test_lift_v09.cjs`, `test_comparison_v10.cjs`, `test_greg_v11.cjs`, `test_control_v12.cjs`, `test_bf109_anchor_v13.cjs`, `test_bf109_rating_v14.cjs`, `test_stores.cjs`, `test_fw190.cjs`) pass on the corrected source.

### Replicate

```bash
node bf109_rating_resolution_v14.cjs --write
node test_bf109_rating_v14.cjs
python3 plot_bf109_rating_v14.py
```

**Next useful investigation (not required for v1.4):** Obtain the original Rechlin F4 1,000–5,000m climb numeric page and actual power/climb IAS, then cross-check cooling and propeller models; ideally an original F4 glide or calibrated low-speed drag/turn series. These are separate from the now-resolved 325-mph *rating label*.
