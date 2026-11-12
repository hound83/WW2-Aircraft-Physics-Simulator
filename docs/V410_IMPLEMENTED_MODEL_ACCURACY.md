# Implemented simulator accuracy by metric

The published **v4.10.0-rc.2** level-speed results agree with the scored historical curves by about **98.0–99.9%**. Climb-rate agreement spans **87.9–97.8%**. The P-38G clean stall is about half a mile per hour of a separate airframe, while its part-power shaft requirement has **21.1% mean error**. The Fw 190 live calculation gives the same climb with its cooling flaps open and closed at the checked condition. Sustained and instantaneous turn performance still need matched powered tests. [Published build commit](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/52369812a7ed40ec8fed1cde42354023aec407f0)

## Aircraft scorecard

Each percentage is **100% minus mean absolute percentage error** over the listed observations. Every observation is divided by its own historical value. The count is in parentheses. Each percentage describes the listed cases and conditions. Cells without a percentage describe the available source or calculation. The [validation improvement plan](V410_VALIDATION_IMPROVEMENT_PLAN.md) gives numeric model outputs for all seven aircraft, the additional historical timing and stall evidence, and the next solver priorities.

| Aircraft | Level speed | Climb rate | Elapsed climb | Clean stall | Maneuver lift | Evidence |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Spitfire LF Mk IX | 99.7% (17) | 97.8% (10) | 98.9% (3) | Pilot's Notes transfer | Model lift limit | Level speeds helped establish the fitted model. Open-radiator climb points are reserved within BS.543. |
| P-47B | 99.6% (5) | 95.7% (5) | 99.3% (2 bands) | 105 mph IAS | Model lift limit | Reserved 41-5902 cases. Separate 41-5942 power-conditioned results below. |
| P-51B-15 | 99.9% (8) | 94.5% (3) | Fig. 6 read bands (2) | 86 mph IAS | 98.9% (5) | 67-inHg racked reference for level and climb. The maneuver-lift curve uses separate NACA figure sections. |
| P-38G-1 | 99.8% (3) | 93.0% (7) | 96.6% (4) | 99.5% (1) | Model lift limit | 42-12687 performance and the separately tested 42-12690 clean stall. |
| F4U-4 | 98.0% (7) | 94.5% (7) | Integrated trial rates | Anchor and NACA comparison | NACA turning-stall traces | NATC 12,500 lb. Both speed and climb use the benchmark's own power. Clean stall is a lift anchor. |
| Fw 190 A-4 | 98.0% (7) | 87.9% (8) | Integrated factory curve | A-3 transfer | Model lift limit | W.Nr. 783 long intake. Open-flap historical climb compared with the live Normal configuration. |
| Bf 109 F-4 | 98.9% (1) | Same-engine G-1 donor | DB 601 E donor | Simulation comparison | Model lift limit | One sea-level emergency speed from a secondary source. Original trial conditions unresolved. |

- **Same-report checks** leave out the selected fit anchors. Some of the same observations or reports supply the power curves or informed earlier tuning. The Spitfire and Mustang level rows quantify fit consistency. The P-51B live configuration excludes removable racks and uses a model calibrated with a racked reference. The close match to that reference alone leaves the rack-free performance unverified. [BS.543 Tables II and V](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [43-24777 Sections III and V](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html)
- **Separate-airframe checks** use a test specimen excluded from the corresponding performance fit. For the P-47B, recorded torque-meter BHP is an input, so these comparisons test the drag, propeller and cooling solution with the test power supplied. The P-38G stall check uses the deployed lift threshold and approximate source test mass. [P-47B 41-5942, FS-M-19-1523-A](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html) · [P-38G 42-12690, FS-M-19-1492-A, B.1](https://wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G_42-12690_FS-M-19-1492-A.pdf)
- **Climb tests** use the historical speed schedule where recorded and the live best-rate search where climb TAS is absent. The Mustang comparison uses reported takeoff weights and includes the related Wright Field May 15 comparison. The Bf 109 speed uses the original secondary value of 540 km/h at emergency power. [Wright Field comparison](https://www.wwiiaircraftperformance.org/mustang/mustangtest.html) · [Bobek, Info Eduard, June 2023](https://info.eduard.com/en/06-2023-1/page-12)

## Power, cooling and maneuver evidence

| Comparison | Agreement (checks) | Mean absolute error | Test basis |
| --- | ---: | ---: | --- |
| P-47B level speed with test shaft power | 99.5% (3) | 2.1 mph TAS | 41-5942 separate airframe and report |
| P-47B climb with test shaft power | 95.5% (5) | 77.9 ft/min | 41-5942 separate airframe and report |
| F4U-4 level speed with chart shaft power | 99.3% (7) | 3.1 mph TAS | Same seven speed points as the main table |
| P-38G part-power shaft requirement | 78.9% (13) | 104.9 bhp per engine | 42-12687 at 5,000 and 24,400 ft, chart BHP per engine |
| Fw 190 A-4 flap-opening climb penalty | 0.0% (1) | 206.7 ft/min | One open/closed pair at 5,000 m, also used for the existing research cooling fit |
| Fw 190 A-4 inlet pressure, level | 96.0% (3) | 0.039 ata | Above full-throttle height, using reported level TAS |
| Fw 190 A-4 inlet pressure, climb | 93.7% (3) | 0.057 ata | Above full-throttle height, using model best-climb TAS |

- **P-38G stall.** At approximately 14,800 lb and 10,000 ft with gear and flaps up, 42-12690 stalled at 112 mph CAS, equivalent to 111.86 mph EAS. The live model gives 112.37 mph EAS. The report also gives 98 mph raw IAS. It gives no load-factor trace or test uncertainty, so this is a one-point check of the assumed one-G threshold. The F4U-4 89.4 kt CAS figure was already used as a lift anchor under an assumed reference atmosphere. [P-38G stall report](https://wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G_42-12690_FS-M-19-1492-A.pdf) · [F4U-4 FT-C-140, printed p. 5](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf)
- **P-51B maneuver lift.** All five Mach 0.23–0.46 predictions are inside the held-out NACA trace bands, with 1.06% mean error against their midpoints. The live curve fades toward the base lift limit near Mach 0.46, where the point is 4.0% above its midpoint and remains inside the band. The NACA traces were throttle-closed. These data constrain available lift in an accelerated maneuver. A powered turn also depends on drag above one G, available power, load limits and control authority. [NACA TN 1044, Fig. 6](https://ntrs.nasa.gov/citations/19930084610) · [Turn evidence and limitations](V44_TURN_PERFORMANCE.md)
- **Fw 190 A-4 cooling.** The factory pair at 5,000 m gives about 207 ft/min less climb with open flaps. The live open and closed states both give 2,683 ft/min at the model's 192 mph TAS and the trial rating. The missing response is a configuration issue. The live climb is also high at all eight reserved points, including 3,513 versus 2,864 ft/min at sea level. The upper-altitude level-speed and boost errors point to an additional inlet/power issue. [Factory report 783/1, Graphs 1 and 2](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-783-nr1.html) · [Cooling audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md)
- **P-38G part power.** At 5,000 ft, 236 mph TAS and 1,600 rpm, the model needs 457 bhp per engine versus 290 chart bhp in the flight report. At the current drag, six of 13 runs would require more useful power than their chart shaft power. The source horsepower is chart-derived and the reports supply estimated masses. Reconcile the power readings, installed drag and exhaust/cooling effects before assigning the discrepancy to propeller efficiency. [FS-M-19-1538-A, printed p. 2, B.2–3](https://wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf#page=2)
- **F4U-4 high altitude.** At 23,100 ft in Military, the live model gives 403.4 mph versus 423.5 mph in the report. Using the digitized chart shaft power at the same condition gives 421.2 mph. The test-power replay narrows the error to 2.3 mph, directing the investigation to the engine deck and blower selection. [NATC FT-C-140, printed pp. 4–5 and level chart](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf)

## Timing and turn coverage

The elapsed-climb scores replay the recorded TAS schedules at fixed takeoff mass and the test rating with open cooling. They integrate the live steady climb rate in 100-ft increments. Spitfire BS.543 takes **258.4 s modeled and 258.0 s observed** from 2,000 to 20,000 ft. Lightning 42-12687 takes **333.0 s modeled and 340.8 s observed** from sea level to 20,000 ft. Endpoints within each series share a start and a flight report. The replay exercises the steady climb calculation and approximates the test schedule. The user-facing combat timer and fuel trajectory require separately matched tests. The current time integration omits the energy that goes into increasing TAS during the climb. [Spitfire Table II](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [P-38G B.4](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf)

| Area | Current validation coverage |
| --- | --- |
| Powered sustained and instantaneous turn rate, radius, and energy loss | Unscored for all seven. The available evidence covers one maneuver-lift component, sensitivity sweeps and qualitative tactical comparisons. |
| Timed level acceleration | Unscored. Numerical integration passed its analytic checks. The retrieved reports lack a usable time interval with both airspeed endpoints, mass, altitude and rating for a modeled variant. |
| Fuel burn and endurance | Unscored. Timed comparisons use a single engineering fuel-flow coefficient. A matching fuel-flow trace or engine map is needed. |
| Roll, transient control response and dive behavior | Outside this benchmark's implemented metrics. |
| Relative aircraft rankings and 5:1 discrimination | Unresolved. Small differences need uncertainty on the historical pairwise difference as well as the model error. |

The formula audit passed **513 arithmetic and boundary checks** across airspeed, shaft power, propulsion, drag, lift, stall, climb, turn geometry, timing and comparison logic. It also found simplified climb energy accounting and an omitted live cooling input. The prior 422,460-condition comparison found unchanged open-cooling climb, one-G stall, peak turn rate and minimum sustained radius after the propeller changes. Some clean high-speed sustained turns did move. The P-38G at 30,000 ft and 240 mph EAS went from 2.43 to 1.10 degrees/s in dry Combat at 50% fuel. The historical direction of that change remains open. [Formula and maneuver audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md)

The next maneuver-validation milestone is a powered load-factor and energy-loss test series at matched mass, altitude, EAS and power. Start with the P-51B and Spitfire crossover, which exercises both usable lift and drag above one G. Use the Fw 190 cooling pair and the P-38G timed climb as concrete fixes to the shared climb calculation. Keep the high-blower F4U-4 and part-power P-38G investigations tied to their own test regimes.

## Absolute errors and reproduction

Signed bias is model minus historical observation. The worst point is selected by absolute percentage error. Percentages grow when the observed climb rate is small. For example, the P-47B 41-5902 at 35,000 ft is 74 ft/min low against 450 ft/min, a 16.5% point error.

| Aircraft | Metric | Checks | Mean % error | Mean absolute error | Mean signed bias | Worst point | Unit |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| Spitfire LF Mk IX | level speed | 17 | 0.25% | 1.0 | +0.1 | −0.8% at 24,000 ft | mph TAS |
| Bf 109 F-4 | level speed | 1 | 1.06% | 3.6 | +3.6 | +1.1% at 0 ft | mph TAS |
| P-47B | level speed | 5 | 0.36% | 1.5 | +0.5 | +0.7% at 27,800 ft | mph TAS |
| P-47B | level speed (41-5942) | 3 | 0.51% | 2.1 | +1.4 | +1.1% at 28,000 ft | mph TAS |
| P-51B-15 | level speed | 8 | 0.09% | 0.4 | +0.0 | +0.3% at 24,000 ft | mph TAS |
| Fw 190 A-4 | level speed | 7 | 2.02% | 7.8 | −3.7 | −5.2% at 32,808 ft | mph TAS |
| P-38G-1 | level speed | 3 | 0.22% | 0.9 | +0.9 | +0.3% at 24,400 ft | mph TAS |
| F4U-4 | level speed | 7 | 2.03% | 8.6 | −8.6 | −4.7% at 23,100 ft | mph TAS |
| F4U-4 | level speed (test power) | 7 | 0.74% | 3.1 | −3.1 | −1.9% at 31,900 ft | mph TAS |
| P-47B | climb rate | 5 | 4.32% | 32.4 | −22.5 | −16.5% at 35,000 ft | ft/min |
| Spitfire LF Mk IX | climb rate | 10 | 2.16% | 64.5 | −26.3 | −9.3% at 30,000 ft | ft/min |
| P-47B | climb rate (41-5942) | 5 | 4.46% | 77.9 | +77.9 | +8.8% at 24,000 ft | ft/min |
| P-51B-15 | climb rate | 3 | 5.49% | 188.7 | −188.7 | −10.5% at 19,200 ft | ft/min |
| Fw 190 A-4 | climb rate | 8 | 12.14% | 220.7 | +220.7 | +29.0% at 10,000 m | ft/min |
| P-38G-1 | climb rate | 7 | 7.00% | 173.3 | +141.9 | +13.6% at 30,000 ft | ft/min |
| F4U-4 | climb rate | 7 | 5.51% | 139.9 | −127.8 | −13.7% at 25,500 ft | ft/min |
| Spitfire LF Mk IX | elapsed climb | 3 | 1.07% | 2.1 | +2.1 | +2.3% at 10,000 ft | s |
| P-38G-1 | elapsed climb | 4 | 3.37% | 16.1 | −16.1 | −4.5% at 30,000 ft | s |
| P-47B | elapsed climb (41-5902) | 2 | 0.74% | 2.7 | −2.7 | −0.9% in 20,000–30,000 ft band | s |
| P-38G-1 | clean one-g stall speed | 1 | 0.45% | 0.5 | +0.5 | +0.5% at 10,000 ft | mph EAS |
| P-51B-15 | maneuver lift curve | 5 | 1.06% | 0.012 | +0.009 | +4.0% at Mach 0.46 | CLmax |
| P-38G-1 | part-power shaft requirement | 13 | 21.13% | 104.9 | +98.2 | +57.5% at 5,000 ft | bhp per engine |
| Fw 190 A-4 | climb penalty from cooling flaps | 1 | 100.00% | 206.7 | −206.7 | −100.0% at 5,000 m | ft/min |
| Fw 190 A-4 | post-critical inlet pressure in level flight | 3 | 4.05% | 0.039 | −0.039 | −7.7% at 10,000 m | ata |
| Fw 190 A-4 | post-critical inlet pressure in climb | 3 | 6.26% | 0.057 | −0.057 | −7.2% at 9,000 m | ata |

Reproduce the historical scores and the additional comparisons from the report revision.

```sh
node validation/diagnostics/implemented_model_accuracy.cjs
node validation/diagnostics/validation_backfill_v410.cjs
```

The JSON includes source, conditions, test role, inputs, observed value, prediction and signed error for every scored point. The diagnostic uses the deployed benchmark model configuration and its existing source replays. The verified Pages HTML SHA-256 is `724ac05c59da0de2d7413eca917ade12645d0ef96e0012918e60aeb7497fc908`.
