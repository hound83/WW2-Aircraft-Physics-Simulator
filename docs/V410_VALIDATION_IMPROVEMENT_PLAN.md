# Flight-model validation improvement plan

The original scorecard left cells empty when a historical accuracy percentage was unavailable. It missed the P-47B elapsed-time table, the P-51B time curves in Figure 6 and the separate F4U-4 stall test. This review gives all seven aircraft a numerical model output for each metric and identifies the best usable historical input for the comparison. [Revised accuracy scorecard](V410_IMPLEMENTED_MODEL_ACCURACY.md)

## Current simulator outputs

**v4.10.0-rc.2**, clean configuration, 50% internal fuel and dry Combat. Time runs from sea level to 10,000 ft using the current rating limits and fuel burn. Level speed, best climb, stall and maneuver results are at 10,000 ft. Maneuvering is sampled at 200 mph EAS, Mach 0.317, with a fresh rating allowance. The lift-only limit is the G available from the lift equation. Sustained turn also depends on power and drag.

| Aircraft | Weight (lb) | Level speed (mph TAS) | Best climb (ft/min) | Climb to 10,000 ft (s) | Clean stall (mph EAS) | Maneuver lift coefficient / lift-only G | Sustained turn (°/s) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Spitfire LF Mk IX | 7,179 | 380.3 | 4,705 | 120.0 | 85.2 | 1.600 / 5.52 | 15.66 |
| P-47B | 11,705 | 371.1 | 2,798 | 207.7 | 108.4 | 1.300 / 3.41 | 11.97 |
| P-51B-15 | 8,925 | 408.1 | 4,203 | 146.4 | 96.8 | 1.171 / 3.13 | 15.99 |
| P-38G-1 | 14,333 | 362.3 | 3,499 | 168.8 | 110.6 | 1.400 / 3.27 | 14.58 |
| F4U-4 | 11,898 | 369.4 | 3,400 | 158.7 | 100.4 | 1.471 / 3.97 | 12.21 |
| Fw 190 A-4 | 8,117 | 379.6 | 3,569 | 152.1 | 107.3 | 1.400 / 3.47 | 13.00 |
| Bf 109 F-4 | 6,054 | 373.6 | 4,763 | 133.5 | 95.6 | 1.500 / 4.38 | 16.57 |

At this condition six models use their one-G lift coefficient for the maneuver calculation. The Mustang uses its Mach-dependent NACA curve. Combat selects each aircraft's configured rating, including emergency power for the Bf 109. The historical replays use their own loadings, ratings and configurations. [Maneuver model](V44_TURN_PERFORMANCE.md)

## Historical and calculated time to climb

Four aircraft have published elapsed times or a time curve. Two more have historical rates that can be integrated into a time estimate. The Bf 109 F-4 has a same-engine donor comparison. The read bands reflect chart reading and interpolation assumptions.

| Aircraft | Altitude band | Source time or estimate (s) | Current model replay (s) | Model minus reference | Evidence |
| --- | --- | ---: | ---: | ---: | --- |
| Spitfire LF Mk IX | 2,000–20,000 ft | 258.0 | 258.4 | +0.4 s | [Published time](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) |
| P-47B | 0–10,000 ft | 237.0 | 235.6 | −1.4 s | [Published time](https://wwiiaircraftperformance.com/org/p-47/p-47.html) |
| P-47B | 20,000–30,000 ft | 441.0 | 437.0 | −4.0 s | [Published time](https://wwiiaircraftperformance.com/org/p-47/p-47.html) |
| P-47B | 10,000–24,000 ft | 374.4 | 364.5 | −9.9 s | [Integrated published rates](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html) |
| P-51B-15 | 0–10,000 ft | 159.0 (144–174 s read band) | 155.3 | −3.7 s | [Digitized time curve](https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Climb.jpg) |
| P-51B-15 | 0–20,000 ft | 348.0 (330–366 s read band) | 338.2 | −9.8 s | [Digitized time curve](https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Climb.jpg) |
| P-38G-1 | 0–20,000 ft | 340.8 | 333.0 | −7.8 s | [Published time](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf) |
| F4U-4 | 0–19,000 ft | 333.1 | 347.3 | +14.2 s | [Integrated published rates](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf) |
| Fw 190 A-4 | 0–6,000 m | 462.3 (450–475 s read band) | 407.0 | −55.3 s | [Integrated factory graph](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_783_Nr1-climb.jpg) |
| Bf 109 F-4 | 0–6,000 m | 423.0 (408–438 s read band) | 308.5 | −114.5 s | [Same-engine donor airframe](https://wwiiaircraftperformance.com/org/me109/g/me109g-14026.html) |

- **P-47B.** The 41-5902 report switches from Military to 2,550-rpm Rated after five minutes. Each selected timed band stays within one rating, with report TAS and wide-open cooling used in the replay. The two timed bands average **0.74% absolute error**. The 41-5942 comparison integrates the two rate series at the same altitude nodes with 2,000 measured shaft bhp supplied to the model. [41-5902 §B.3 and 41-5942 §B.2](https://wwiiaircraftperformance.com/org/p-47/p-47.html)
- **P-51B.** The middle time trace in Figure 6 gives about 2.65 and 5.8 min at 10,000 and 20,000 ft for 67 inHg and 3,000 rpm. Both replays fall within the reading bands. The report used wing racks and automatic shutters. The replay uses the 9,335-lb takeoff mass and modeled best-rate TAS because climb TAS and instantaneous mass are unavailable. [Wright Field §V.D](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) · [Original Figure 6](https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Climb.jpg)
- **F4U-4 and Fw 190.** The Corsair estimate uses three Military climb-rate points across a sparsely sampled blower transition. Read the full curve before tightening the estimate. The Fw 190 uses the W.Nr. 783 long-inlet open-cooling graph at 1.32 ata and 2,400 rpm. Its 55-s gap exceeds the graph-reading band. Recheck the residual after connecting the existing cooling correction. [FT-C-140](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf) · [Fw 190 factory climb report](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-783-nr1.html)
- **Bf 109.** The donor is W.Nr. 14026, a G-1 with a DB 601 E and the F-series VDM propeller at 1.30 ata and 2,500 rpm. The donor graph is uncorrected and the airframe and radiator installation differ. The F-4 replay uses its 2,890-kg reference mass and manual climb schedule. The original F-4 timing and test configuration remain the targets for source recovery. [Messerschmitt V.B. 109 19 L 42 Blatt 5](https://wwiiaircraftperformance.com/org/me109/g/me109g-14026.html)

For published rates, calculate $t=\int dh/R(h)$ with linear rate interpolation inside supported bands. The current timer uses steady specific excess power as vertical rate. For a changing TAS schedule the energy balance is $P_s=\dot h+V\dot V/g$, so the step uses $dt=(dh+d(V^2/2g))/P_s$. Measured vertical rates already include the speed schedule flown in the test. [NASA energy method](https://www.nasa.gov/pdf/563410main_FTNL_Instructor_Manual.pdf) · [Formula audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md)

## Stall and lift from usable inputs

Retain the original indicated, calibrated or equivalent speed with the reported load and configuration. Apply a matched IAS correction where available, then use $C_{L,\mathrm{eff}}=2nW/(\rho_0 S V_\mathrm{EAS}^2)$. For a steady one-G stall, $n=1$. This also supports weight normalization because stall EAS scales with $\sqrt{W/S}$ at fixed lift coefficient. When an airspeed correction is missing, calculate explicit sensitivity cases. [NASA lift equation](https://www.grc.nasa.gov/www/k-12/VirtualAero/BottleRocket/airplane/lifteq.html)

| Aircraft | What the existing stall evidence supports | Next evidence or input |
| --- | --- | --- |
| Spitfire LF Mk IX | The clipped-wing pilot's notes give 90 mph IAS at 7,150 lb. The approximate full-span reduction gives **84–87 mph IAS**, implying **1.53–1.64** in a sea-level CAS-equals-IAS scenario. | Recover a near-stall correction and matched full-span loading. The manual correction starts at 120 mph IAS. [A.P.1565J §§42 and 53](https://zenoswarbirdvideos.com/Images/spit/SPIT9MANUAL.pdf) |
| P-47B | 41-5902 reports **105 mph IAS** clean and power off. At general report gross weight, agreement would require roughly **+7.3 mph** IAS-to-CAS correction at sea level. | Recover stall altitude, instantaneous loading and the low-speed instrument channel. The available calibration starts at 170 mph IAS. [41-5902 stall audit](P47B_STALL_WEIGHT_AUDIT.md) |
| P-51B-15 | 43-24777 reports **86 mph IAS** at 8,000 ft and 9,270 lb, clean with shutters closed. Agreement with the live model would require **+17.6 mph** correction at that condition. | Check the original stall channel and low-speed correction. Review the model's altitude boundary below. [Wright Field §V.E](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) · [Calibration audit](P51_LOW_SPEED_CALIBRATION_AUDIT.md) |
| P-38G-1 | 42-12690 reports **98 mph IAS / 112 mph CAS**. This gives **111.86 mph EAS** and lift coefficient **1.413** at approximately 14,800 lb and 10,000 ft, versus **1.400** in the model. | Retain this separate-airframe check and keep its powered stalls as a distinct condition. [FS-M-19-1492-A §B.1](https://wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G_42-12690_FS-M-19-1492-A.pdf) |
| F4U-4 | 80765's **89.4 kt CAS** clean power-off stall is the fitted reference. Separate BuNo 91028 gives about **105 mph corrected CAS in glide** and **95 mph under power**. These imply effective lift coefficients **1.37 and 1.67** on the simulator's 314-ft² reference area. | Digitize synchronized onset airspeed and normal acceleration in NACA Figs. 29 and 30(a)/(b). Preserve the report's coefficient-area convention. [FT-C-140 p. 5](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf) · [NACA A7C05](https://ntrs.nasa.gov/citations/20050081862) |
| Fw 190 A-4 | The captured A-3 trial gives about **110 mph** at roughly 8,600 lb with unspecified speed basis. Treating it as CAS near sea level on A-4 geometry gives a conditional **1.41**. | Find an A-4 clean stall with defined speed basis and loading. Use Navy PTR-1107 for qualitative maneuver corroboration. [RAF A-3 source record](../references/research/stall_global_2026-11-10.json) · [Navy PTR-1107](https://www.wwiiaircraftperformance.org/fw190/ptr-1107.pdf) |
| Bf 109 F-4 | The current one-G model uses **1.50**. IL-2's **154–171 km/h IAS** across its load range is a simulator comparison. | Find an original F-4 handbook or test sheet giving slat state, stall convention and weight. Keep E/G observations as transfers. [F-4 stall source audit](BF109F4_STALL_AUDIT.md) · [IL-2 specification](https://lcappuccio.github.io/il2/planes/bf109f4.html) |

The NACA Corsair's general test conditions were about 12,100 lb and 8,000 ft. Glide used 15 inHg and 2,150 rpm. The powered clean case used 48 inHg and 2,600 rpm with partly open cowl flaps. The approximate source speeds reduce to **104.9 and 94.9 mph EAS**, with the current model giving **101.2 mph EAS** at the same load in both cases. The observed speed change implies about **22%** more effective lift across those test configurations, including power and installation effects. [NACA A7C05 pp. 7–8](https://ntrs.nasa.gov/citations/20050081862)

| Aircraft | Example altitude | Model stall CAS (mph) | Correction needed to match | Implied lift with +0 mph | +5 mph | +10 mph | +15 mph |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| P-51B-15 | 8,000 ft | 103.6 | +17.6 mph | 2.11 | 1.88 | 1.69 | 1.53 |
| P-47B | 0 ft | 112.3 | +7.3 mph | 1.49 | 1.35 | 1.24 | 1.14 |
| P-47B | 10,000 ft | 112.4 | +7.4 mph | 1.49 | 1.36 | 1.24 | 1.14 |

The assumed correction columns are engineering scenarios. P-47B examples use reported general gross weight because the exact stall loading and altitude are unavailable. The P-38G's measured correction belongs to its own airspeed installation.

## Maneuvering priorities

**Fix the Mustang lift boundary.** At 9,270 lb the one-G stall prediction jumps from **103.55 to 98.62 mph EAS** between 9,300 and 9,301 ft. It jumps in the opposite direction at 5,100 ft. The older NACA gate switches between a transferred coefficient of 1.451 and the default 1.600. Preserve the evidence window and make the modeled transition continuous. [Live lift gate](../src/turn-lift.js) · [NACA TN 1044](https://ntrs.nasa.gov/citations/19930084610)

**Use stall for a first lift ceiling.** At constant coefficient, $n_{\mathrm{lift}}=(V_\mathrm{EAS}/V_{s,\mathrm{EAS}})^2$. A 100 mph EAS stall implies 4.00 G at 200 mph EAS. The 95–105 mph sensitivity gives 4.43–3.63 G. Recorded accelerated stalls allow a normal-force calculation from synchronized airspeed and G. Account for flight path, attitude and thrust before using that as aerodynamic lift. Match the same speed, altitude and power to infer added drag from load factor or energy loss, using $D=(P_\mathrm{prop}-WP_s)/V$. [Maneuver calculation](../src/turn-performance.js) · [NACA Corsair Fig. 30](https://ntrs.nasa.gov/citations/20050081862)

**Check the Bf 109 and Spitfire ranking against drag evidence.** At the 10,000-ft reference point the Bf 109 sustains **16.57°/s** and the Spitfire **15.66°/s**. Increasing only the Bf 109's incremental drag above one G by **11.9%** ties them. A 15% increase gives the Bf 109 **15.45°/s**. This sensitivity identifies the historical drag measurement needed to judge the ranking.

## Implementation sequence

| Priority | Work | Verification |
| --- | --- | --- |
| 1. Climb and elapsed time | Wire the W.Nr. 783 cooling correction into the live climb path. Include scheduled kinetic energy in timed climbs, retaining rating transitions and fuel accounting. Add the recovered P-47B and P-51B timing cases to the standard benchmark. | Check integration step size, open/closed Fw 190 penalty, original rating changes and time residuals for the Spitfire, P-38G, P-47B and P-51B. Retain source grades for the integrated and donor cases. |
| 2. Stall and lift | Fix the Mustang boundary and build a condition-aware lift input for Mach, power and configuration. Use the Corsair glide/power pair first. Carry uncertain IAS in the data view with explicit assumptions and the P-38G sister-airframe case reserved. | Verify continuity, mass scaling, airspeed basis and residuals against independent stall cases. Show a measured or derived value, its assumptions and the model value for each fighter. |
| 3. Maneuver lift and drag | Digitize the Corsair's synchronized speed and G traces and check the Mustang/Spitfire crossover. Use matched powered turn or energy-loss traces to constrain drag above one G. | Use fit and reserved points for lift and measured turn performance. Report sensitivity of the Bf 109/Spitfire ranking. Apply existing comparison goals of 2 km/h for stall, 3% for elapsed time and 0.3°/s for sustained turn when the evidence supports them. [Input-pack tolerances](../references/analysis/fighter-sim-inputs-v1.json) |

Reproduce these values from the repository root.

```sh
node validation/diagnostics/validation_backfill_v410.cjs
```

The diagnostic retains the source rates, elapsed-time bands, correction assumptions and model replays. The imported Mustang Fig. 6 scan is printed p. 12, 1200 × 1594 pixels, SHA-256 `3be7ddb992591651c516c5e05b13b44196ae274ad8a2d30e4a2847a468b49bff`. The minute axis is about 14.4 px/min, with the 67-inHg trace read near y=1115 and y=823. The Bf 109 time trace comes from Blatt 5 of V.B. 109 19 L 42, inspected PDF SHA-256 `a14753051c9e175bb44f9a94f138b2423a1833ec77bcce1a086ebeee035cd995`.
