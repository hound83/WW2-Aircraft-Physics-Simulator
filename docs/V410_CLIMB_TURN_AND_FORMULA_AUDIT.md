# Climb, maneuverability and formula audit

The two propeller passes preserve open-cooling climb and peak turn results across the sampled envelope. The Corsair, Thunderbolt and Lightning have changes in parts of their clean sustained-turn curves. The largest negative change occurs on the Lightning near its high-altitude speed limit. The audit also found two climb-model priorities. The Fw 190 live benchmark omits an existing cooling term, and timed climbs omit the energy required when the speed schedule calls for increasing TAS.

Audit baseline is v4.9.0-rc.2 with Fighter Sim Inputs v1.5. The published candidate is [v4.10.0-rc.2 at 52369812](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/52369812a7ed40ec8fed1cde42354023aec407f0). Both frozen operating scorecards reproduced exactly before the envelope sweep. [Corsair and Thunderbolt pass](V410_PROPELLER_REFERENCE.md) · [Lightning pass](V410_REMAINING_PROPELLERS.md)

## Climb and maneuverability after both passes

The sweep covers **422,460 flight conditions** across seven aircraft, 51 altitudes from sea level to 40,000 ft, three fuel presets, dry Normal and Combat, and fitted Corsair injection. It samples each condition with clean and climb cooling at 2 mph EAS intervals from 65 mph to the benchmark's 590 mph TAS ceiling. The comparison uses the same weight, altitude, power phase and EAS at each point.

- Open-cooling climb and open-cooling sustained turn reproduced the baseline at every sampled speed. All **14** timed sea-level-to-10,000-ft climbs matched. The new references are selected by the clean, high-speed calculation. The climb path retains its existing power and cooling cases.
- One-G stall, instantaneous turn, peak sustained turn rate and minimum sustained radius reproduced the baseline. Peak sustained load moved by at most **0.016 G**, on the Corsair at 30,000 ft and 25% fuel. The four aircraft outside the adopted propeller changes reproduced their entire sampled clean turn curves.
- The clean sustained curves gained and lost capability in different speed bands. These are effects on the model. Matched powered-turn tests would be needed to judge the historical direction of each change.

### Best climb and peak turns at 10,000 ft

Dry Combat, 50% internal fuel. The comparison starts with a fresh rating allowance, including the Bf 109 emergency rating. Best climb uses the climb-cooling path. Turns use the clean path. Values are **the same before and after both propeller passes**.

| Aircraft | Best climb, ft/min | Peak sustained, °/s | Peak instantaneous, °/s |
| --- | ---: | ---: | ---: |
| Spitfire LF IX | 4,705 | 19.26 | 33.21 |
| Bf 109 F-4 | 4,763 | 18.76 | 29.59 |
| P-51B | 4,203 | 16.08 | 25.56 |
| P-38G | 3,499 | 15.46 | 25.58 |
| F4U-4 | 3,400 | 14.89 | 28.18 |
| Fw 190 A-4 | 3,569 | 14.69 | 26.36 |
| P-47B | 2,798 | 13.63 | 26.10 |

### Changes at a fixed speed

Each example uses 50% fuel, with clean cooling and both versions able to sustain level flight.

| Aircraft and condition | Sustained turn before | Sustained turn after |
| --- | ---: | ---: |
| P-38G Combat, 30,000 ft and 240 mph EAS | 2.43°/s | **1.10°/s** |
| F4U-4 Normal, 10,000 ft and 260 mph EAS | 7.26°/s | **6.96°/s** |
| P-47B Combat, 10,000 ft and 290 mph EAS | 5.93°/s | **5.57°/s** |

The Lightning's positive-turn upper limit moves from **247.16 to 241.37 mph EAS** in that 30,000-ft case. Its peak stays at **8.42°/s** and its best climb at **2,341 ft/min**. At 22,600 ft, 277 mph EAS and 75% fuel, the same correction raises sustained turn from **0.77 to 2.14°/s**. The upper edge moves because the new level shaft schedule and tip loss change excess power at high TAS.

Among sampled speeds with sustained flight on both versions, **327 Lightning, 152 Corsair and 12 Thunderbolt points** change by at least the 0.5°/s practical comparison margin. The sweep also finds positive turn gained or lost at the edges.

| Aircraft | Largest increase at a common speed | Largest decrease at a common speed | Gained / lost positive-turn samples |
| --- | ---: | ---: | ---: |
| P-38G | +1.37°/s | −1.69°/s | 46 / 30 |
| F4U-4 | +1.36°/s | −0.34°/s | 217 / 0 |
| P-47B | +0.88°/s | −0.75°/s | 36 / 12 |

At 10,000 ft the modeled 180–300 mph EAS acceleration takes **9.21 s longer** for the Corsair in Normal, **4.48 s longer** for the Corsair in Combat, **4.42 s longer** for the Thunderbolt in Combat and **2.05 s less** for the Lightning in Combat. Historical time-to-speed checks for these conditions remain open. [Benchmark comparison margins](V49_TIMED_MATCHUPS.md#practical-ties-and-chart-evidence)

## What the flight tests support

Climb residuals are mean absolute error in ft/min. Same-report checks exclude designated fit points. These series exercise the climb power and cooling paths.

| Aircraft and series | Scored | Before and after the propeller passes | Evidence |
| --- | ---: | ---: | --- |
| P-47B 41-5902 | 5 | 32.4 → 32.4 | Reserved points at recorded TAS, RPM and torque-meter BHP. The open-cooling setup uses the existing fit. |
| P-47B 41-5942 | 5 | 77.9 in the existing transfer replay | Separate aircraft and report at recorded TAS, RPM and BHP. Its equivalent loss comes from 41-5902. |
| Spitfire LF IX BS.543 | 10 | 64.5 → 64.5 | Table II open radiators and recorded TAS. Power is boost-conditioned chart BHP. The original climb used a test concession. |
| P-38G-1 42-12687 | 7 | 173.3 → 173.3 | Wright Field B.4, recorded TAS and chart BHP per engine, open coolers and report takeoff weight. Sea-level residual is about +411 ft/min. |
| F4U-4 BuNo 80765 | 7 | 139.9 → 139.9 | Same-report maximum-climb diagnostics at reported weight. The solver chooses its own best-rate TAS. The 25,500-ft Military residual is −371 ft/min. |
| P-51B-15 43-24777 | 5 scored in the existing scorecard | 105.6 below 10,000 ft, 333.2 on one point above | Conditional historical diagnostics for racked climbs at reported ratings. One 75-inHg point is outside the modeled domain. |
| Fw 190 A-4 WNr 783 | 8 | 220.7 in the live benchmark | Long external intake, open cowl flaps, 2,400 rpm, 1.32 ata and 3,870 kg takeoff mass. The climb curve lacks test TAS. The diagnostic below uses modeled best-rate TAS. |
| Bf 109 F-4 | 0 | Unscored | The available test times and rates leave rating, installation or loading unresolved for a matched climb replay. |

[Thunderbolt and Spitfire original report conditions](V43_MODEL_CHECKS.md#known-climb-results) · [Wright Field P-38G B.4](https://www.wwiiaircraftperformance.com/org/p-38/p-38.html) · [Corsair Navy climb chart](https://www.wwiiaircraftperformance.com/org/f4u/f4u_files/80765-climb.jpg) · [Four-aircraft flight scorecard](FLIGHT_SCORECARD.md)

For maneuvering, NACA TN 1044 Figure 6 supplies accelerated-stall lift evidence on a carefully finished P-51B with throttle closed and propeller in high pitch. The model reproduces the read bands on five reserved Mach sections. The sections share the source chart. The AFDU Spitfire IX tactical report describes turning in a different installation, and the Eglin P-38G/F comparison includes maneuver flap use. The recorded evidence does not give a matched, powered turn rate or radius for the three affected simulator profiles. The current turn curves and 5:1 comparisons remain engineering estimates. Instantaneous turn is the lift and G-cap result at one state. Roll rate, control force and energy loss through a transient maneuver require separate models and evidence. [NACA TN 1044](https://ntrs.nasa.gov/citations/19930084610) · [Mustang lift replay](V44_TURN_PERFORMANCE.md#mustang-flight-evidence) · [AFDU tactical trials](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitIX_Tactical_Trials.html) · [Eglin P-38G report](https://www.wwiiaircraftperformance.com/org/p-38/p-38.html)

## Formula verification

The independent audit compared **513** numerical and boundary checks with published equations, closed-form solutions, hand-worked reference values and a different numerical solver for the propeller disk. The arithmetic checks passed for the modeled cases. The diagnostics in the next section show where a valid equation is being used with incomplete configuration inputs or simplified time integration.

| Formula family | Checks passed | Result and scope |
| --- | ---: | --- |
| Atmosphere and airspeed | 115 | Standard atmosphere at 0, 5, 11 and 12 km. Subsonic Pitot CAS, density-based EAS and Mach agree with an independent pressure inversion. IAS needs a matched instrument and position correction. The manual climb schedule currently uses IAS≈CAS. |
| Shaft power and inlet | 10 | Altitude/gear interpolation, absolute MAP, pressure recovery, critical-height cap and domain guards agree with independent examples. Boost and RPM to BHP ratios and above-source extensions are engineering inputs. |
| Propeller and power | 75 | Independent Newton iteration checks the actuator-disk root. RPM gearing, $J=V/(nD)$, power coefficient and helical tip Mach agree. The eight propeller profiles reproduce their specified arithmetic. The P-38G sums the useful output of two separately loaded disks and applies the same clean-flight fade to shaft power and tip loss. |
| Lift, stall, drag, climb and turns | 289 | $L=qSC_L$, 1 G stall and mass scaling, $C_{D_i}=C_L^2/(\pi AR e)$, $P_\mathrm{req}=DV$, steady climb from excess power, level acceleration and turn load/rate/radius agree. Synthetic constant-power cases verify the top-speed root and the minimum-power climb optimum. |
| Cooling, installation and stores | 10 | Added drag area gives $q\,\Delta A\,V$. Equivalent power losses and gains, the climb cooling proxy, Mach-gated drag, store mass and inverse fit arithmetic agree. Several installation coefficients come from fits that combine more than one physical effect. |
| Timed runs and comparison logic | 14 | Constant-power acceleration matches the closed-form result to 0.001 s. Fuel units, rating and injection transition limits, the published climb integrator's steady-rate approximation and practical ties reproduce their specifications. |

For one independent 8,000 lb example at 10,000 ft and 210 mph EAS, 1,350 shaft hp at 80% gives **1,080 useful hp**. The polar requires **468.75 hp**, yielding **2,521 ft/min** steady climb and **2.629 G**, **12.51°/s** and **501 m** in a power-limited turn. In a steady turn the solver first pays the one-G power requirement. The remaining power pays the incremental induced drag proportional to $n^2-1$. The available load is capped by lift and the model's G limit. Aircraft-specific powered lift, extra drag above one G, compressibility and control authority still need evidence. [NASA atmosphere tables](https://ntrs.nasa.gov/archive/nasa%20/casi.ntrs.nasa.gov/19770009539.pdf) · [NASA TM 104316 on airdata](https://ntrs.nasa.gov/citations/19990063780) · [NASA propeller momentum theory](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/propeller-thrust/) · [NASA induced drag](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/induced-drag-coefficient/) · [FAA aerodynamics, Chapter 5](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/phak/07_phak_ch5.pdf)

## Issues to address next

1. **Connect the Fw 190 cooling case to the live climb.** The current benchmark uses 0 m² of added cooling area. The WNr 783 replay uses an equivalent **0.171 m²** fitted from the 5,000 m open/closed pair. Supplying that existing term to the benchmark lowers reserved MAE from **220.7 to 163.6 ft/min**. Sea-level error falls by **184 ft/min** and the 7,000 m absolute error grows by **118 ft/min**. That trade-off favors a condition-bounded integration and additional checks of cooling, power and intake. [Original open/closed test](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-783-nr1.html) · [WNr 783 replay](V311_FW190A4.md)
2. **Budget for TAS changes in timed climbs.** At steady TAS, $\dot h=P_s$. Along a speed schedule, $P_s=\dot h+(V/g)\dot V$. The timed benchmark currently integrates $\dot h=P_s$ as TAS changes. In the Normal 0–20,000 ft simulations, accounting for TAS change along the same altitude and fuel trajectory adds **19.25 s on the Mustang**, **18.71 s on the Lightning** and **15.85 s on the Spitfire**. On the separate P-38G report-schedule replay, the source elapsed time is **340.80 s**, the steady-rate integration gives **332.99 s**, and including speed energy gives **346.25 s**. This diagnostic holds the test's takeoff mass and power schedule fixed. Halving the current altitude step changes the three operational times by at most **0.011 s**. Halving the acceleration time step changes the seven 10,000-ft runs by at most **0.0021 s**. The climb timing difference comes from the energy balance. [NASA Flight Testing Newton's Laws, session 7 §5](https://www.nasa.gov/wp-content/uploads/2014/10/563410main_ftnl_instructor_manual.pdf) · [P-38G B.4](https://www.wwiiaircraftperformance.com/org/p-38/p-38.html)
3. **Require a flyable root in the shared speed helper.** A low-power synthetic test gives a 137.67 mph TAS power-balance crossing with a 165.92 mph one-G stall at sea level. The standalone `maxSpeed()` returns the below-stall root. The live benchmark correctly reports that the aircraft cannot sustain level flight. Use the live feasibility gate in the shared helper and cover the edge case when consolidating solver entry points. [Shared solver](../src/physics.js) · [Live benchmark](../src/operating-benchmark.js)

**Next milestone.** Use the Fw 190 open-cooling case and P-38G timed report to prove the roadmap's shared flight-case and climb calculation. Resolve airspeed basis, test mass, cooling, boost, RPM and gear once, then feed the same state into the historical replay and the live benchmark. Keep the current propeller references in their supported bands. After that, work on usable lift and drag above one G, starting with the Mustang–Spitfire crossover at 10,000 ft. Compare at equal EAS and use powered-turn or matched-load drag evidence to choose any new coefficient. [Simulator roadmap](SIMULATOR_ROADMAP.md)

## Reproduce the audit

```sh
node validation/diagnostics/propeller_climb_turn_audit.cjs
node validation/diagnostics/flight_formula_audit.cjs
```

The first command emits the frozen comparisons, per-aircraft curve deltas, availability and timed results. The second emits formula checks, historical climb residuals, timing and cooling diagnostics. The source identities, fit roles and physical assumptions are retained in the output and linked above.
