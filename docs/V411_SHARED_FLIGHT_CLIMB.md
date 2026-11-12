# Shared flight-case climb and timed energy

**Research candidate v4.11.0-rc.1.** The Normal / Combat benchmark uses the shared timed-climb integrator and the existing Fw 190 A-4 open-cooling fit. The solver and source replay use Fighter Sim Inputs v1.7.0 for the two matched cases. The scorecard freezes the reviewed v4.10.0-rc.2 code at `636d57c5` and retains Grok’s WNr 783 and B.4 source extraction. [Before scorecard](../references/analysis/v410-shared-climb-before.json) · [v1.7 source cases](research/WW2_MATCHED_CLIMB_INPUTS_2026-11-12.md) · [Grok’s extraction](../references/research/WW2_FLIGHT_CASE_CLIMB_AFTER_EXTRACTION_2026-11-12.md)

## What changed

The timer integrates `Δt = (Δh + Δ(V²/2g)) / P_s` using midpoint available power, weight and speed. The change in TAS is signed. At 10 m/s specific excess power, a 100 m climb with a 50 m gain in kinetic-energy height takes 15 s. Constant TAS gives 10 s and a 50 m loss gives 5 s. Rating and injection limits shorten the same step, and fuel and fluid use the resulting duration. Normal follows the manual IAS schedule with IAS approximated as CAS. Combat uses one planned best-climb speed schedule across the tested boost windows so rating transitions preserve speed continuity. The source replay can supply a recorded TAS schedule at report takeoff weight. [Energy method](https://www.nasa.gov/wp-content/uploads/2014/10/563410main_ftnl_instructor_manual.pdf)

The P-47B and Spitfire report-conditioned installation fits used measured vertical rates along recorded TAS schedules. Within the supported fitted share, the timer restores the reference schedule’s speed-energy term to the rate before applying the selected schedule’s change in energy. At the original TAS schedule this recovers the original vertical-rate replay. Direct application of the term to the fitted P-47B Rated case would predict **475.63 s** against **441.00 s** observed. The rate-basis calculation gives **437.02 s**. The calculation uses the report TAS and existing fitted rate. [Installed-energy calibration](V41_ENERGY_RESULTS.md) · [P-47 and Spitfire rate checks](V43_MODEL_CHECKS.md)

The WNr 783 long-intake case uses the existing approximately **0.171 m²** equivalent drag area from the 5,000 m open/closed pair. The fit applies with open cooling at 1.32 ata and 2,400 RPM in the original 0–10,000 m climb band. It fades at the edges of the existing 130–275 mph TAS search range, which is an engineering boundary because the report gives no recorded climb TAS. The separate emergency rating and clean reference retain their own inputs. [Source calibration](V311_FW190A4.md) · [Factory graph](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_783_Nr1-climb.jpg)

## Source replays

| Case | Reference | v4.10 | v4.11 |
| --- | ---: | ---: | ---: |
| Fw 190 open-cooling rate, eight reserved points | Mean absolute error, ft/min | 220.7 | 157.3 |
| Fw 190 open-flap penalty at 5,000 m, ft/min | 206.7 | 0.0 | 167.5 |
| Fw 190 to 6,000 m, seconds from integrated factory rates | 462.33, read band 450.14–475.21 | 406.20 | 434.17 |
| Fw 190 open flaps, 1,000–9,000 m, seconds | 786, chart allowance ±30 | 720.14 | 815.11 |
| P-38G B.4 to 20,000 ft, seconds | 340.80 | 332.99 | 346.25 |
| P-38G B.4 to 35,000 ft, seconds | 748.80 | 723.21 | 756.59 |
| P-47B B.3 Military to 10,000 ft, seconds | 237.00 | 235.64 | 235.64 |
| P-47B B.3 Rated, 20,000–30,000 ft, seconds | 441.00 | 437.02 | 437.02 |
| Spitfire BS.543, 2,000–20,000 ft, seconds | 258.00 | 258.38 | 258.38 |
| P-51B 67-inHg Fig. 6 to 10,000 ft, seconds | about 159, read band 144–174 | 155.29 | 159.82 |
| P-51B 67-inHg Fig. 6 to 20,000 ft, seconds | about 348, read band 330–366 | 338.44 | 347.39 |

The Fw 190 7,000 m absolute error increases by **118 ft/min**. The 6,000 m elapsed estimate remains below the graph band. The separate 1,000–9,000 m replay uses the v1.7 estimated TAS schedule and finishes within the chart-reading allowance. The P-38G fixed-mass replay uses recorded TAS, wide-open coolers and chart-assigned shaft BHP per engine. Its 20,000 ft absolute time error falls from 7.81 to 5.45 s. Reducing altitude steps from 500 to 50 ft changes the result by about 0.001 s. These are same-report checks. The 10,000 ft climb-rate cooling anchor was used to set the existing P-38G installation loss. The Mustang times use modeled TAS and the takeoff mass. The separate-airframe P-47B 41-5942 rate replay remains part of the four-aircraft regression. [Wright Field B.4](../references/p38g-42-12687.json) · [Climb and timing sources](V410_VALIDATION_IMPROVEMENT_PLAN.md#historical-and-calculated-time-to-climb)

## Seven-aircraft regression

Sea level to 10,000 ft with 50% internal fuel and dry ratings. Values are v4.10 → v4.11.

| Aircraft | Normal time, s | Combat time, s |
| --- | ---: | ---: |
| Spitfire LF IX | 157.99 → 163.90 | 119.97 → 117.27 |
| Bf 109 F-4 | 142.65 → 146.18 | 133.55 → 136.85 |
| P-47B | 275.81 → 282.43 | 207.70 → 207.24 |
| P-51B-15 | 239.57 → 248.03 | 146.44 → 150.79 |
| Fw 190 A-4 | 179.55 → 199.99 | 152.07 → 154.44 |
| P-38G-1 | 246.07 → 253.38 | 168.80 → 172.40 |
| F4U-4 | 198.64 → 203.83 | 158.69 → 159.60 |

The replay covers Normal and Combat altitude points, 180–300 mph EAS acceleration, 14 timed climbs to 10,000 ft, and 168 fixed-speed cases across clean and open cooling. It records shaft, useful and drag horsepower at common conditions. The four core aircraft reproduce the frozen steady speed, climb, stall, turn and acceleration results at the reported resolution. The Fw 190’s Normal open-cooling change affects excess power and sustained turn where the fit applies. At 10,000 ft and 200 mph EAS the modeled open-cooling turn falls from **11.73 to 10.62°/s**. The two changed fixed-speed cases are Fw 190 Normal with open cooling. The other 166 cases reproduce the previous results. [Comparison margins](V49_TIMED_MATCHUPS.md#practical-ties-and-chart-evidence)

The Fw 190 intake/cooling split, Bf 109 F-4 rated climb, P-38G sea-level rate and part-power balance, and Corsair high-blower shaft power remain evidence gaps. Exact stall calibration and historical sustained-turn discrimination also remain open. [Known limitations](KNOWN_LIMITATIONS.md) · [Propulsion research](V410_REMAINING_PROPELLERS.md#source-checks-for-follow-up)

Run `node validation/diagnostics/shared_flight_climb.cjs` for the numerical replay. `npm run check` writes `validation/current/shared-flight-climb.json` for the CI artifact. The targeted regression checks exercise signed energy, rate basis, step clipping, fuel and fluid use, the Fw fit domain and the P-38G time.
