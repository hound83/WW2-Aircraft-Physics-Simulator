# v4.4 sustained-turn performance and flight evidence

**4.4.0-rc.1** adds a bounded Mustang maneuver-lift transfer and a speed-by-speed turn comparison. The comparison plots the nominal difference between the aircraft and the range produced by varying the Mustang and Spitfire inputs.

## Mustang flight evidence

[NACA TN 1044](https://ntrs.nasa.gov/citations/19930084610), Figure 6, middle panel, right-hand ordinate, shows usable lift from gradual accelerated stalls in a carefully finished P-51B with the throttle closed and the propeller in high pitch. The figure spans eight test altitudes from 5,100 to 33,300 ft. The plotted traces overlap. The new ledger records rounded ranges across the curves at each sampled Mach. It uses the trace spread to qualify the transfer and leaves the individual altitude traces unresolved.

Six Mach sections set the piecewise linear midpoint curve. Five other Mach sections check the interpolation. The previous model outside its narrower altitude gate corresponds to about 1.60 on the source wing-area convention.

| Mach | Range read from the flight-test chart | v4.3 reference | v4.4 interpolation |
|---:|---:|---:|---:|
| 0.23 | 1.26–1.40 | 1.60 | 1.33 |
| 0.29 | 1.11–1.30 | 1.60 | 1.21 |
| 0.35 | 1.06–1.23 | 1.60 | 1.15 |
| 0.41 | 1.04–1.19 | 1.60 | 1.11 |
| 0.46 | 1.01–1.17 | 1.60 | 1.09 |

The v4.4 curve falls within all five reserved bands. Mean distance outside the bands goes from 0.341 to zero in lift coefficient. The comparisons come from different sections of the same published chart. The rounded reading bands are wider than the interpolation residuals. These checks establish shape agreement for the NACA maneuver-lift data. Independent powered-turn evidence for 43-24777 remains open.

The wider lift transfer applies to clean P-51B-15 43-24777 benchmark turns inside 9,300–33,300 ft and the admitted Mach interval. Its lower Mach boundary rises from 0.20 to 0.31 with height. The upper bound is Mach 0.48. The calculation blends over 0.022 Mach and 650 ft at the boundaries. The report's 233.2 ft² wing-area convention is scaled to the modeled wing area. The separate one-G stall input defines the aerodynamic stall marker. [Numerical source and limits](../references/v44-turn-evidence.json) · [Archived scan excerpt](../references/sources/stall-2026-11-02/naca-tn1044-excerpts.pdf)

## Operational replay

The frozen v4.3 snapshot and v4.4 replay cover 90 power and altitude combinations at 50% internal fuel. The numerical regression checks stall, climb, climb speed and level speed across all 90. The [four-aircraft scorecard](FLIGHT_SCORECARD.md) and [v4.3 flight-test replays](V43_MODEL_CHECKS.md) cover the separate speed and climb evidence. Below are the changes to the Mustang peak sustained turn in the comparison.

| Altitude | Power | Peak turn v4.3 → v4.4 (°/s) | Speed at peak v4.3 → v4.4 (mph EAS) |
|---|---|---:|---:|
| 10,000 ft | Normal | 15.16 → 13.91 | 146 → 171 |
| 10,000 ft | Combat | 18.06 → 16.08 | 166 → 201 |
| 20,000 ft | Normal | 10.56 → 9.91 | 130 → 126 |
| 20,000 ft | Combat | 13.06 → 11.62 | 148 → 180 |
| 30,000 ft | Combat | 8.81 → 7.89 | 129 → 160 |

At 10,000 ft, Combat and 50% fuel on both aircraft, the 150 mph EAS point gives 12.20°/s for the Mustang and 18.68°/s for the Spitfire. The Spitfire's lead is 3.03–10.38°/s over the tested inputs. At 200 mph EAS, the Mustang leads by 0.33°/s at nominal inputs. The tested difference spans −3.40 to +3.70°/s, so either aircraft can lead. These values use different coordinates from the peak comparison because the probe holds airspeed equal.

## Turn ranges and the power budget

The range varies each aircraft's maneuver lift by ±10%, available propulsive power by ±5% and incremental drag above one G by ±15%. The lift range includes the NACA trace spread where the Mustang transfer applies. These are engineering perturbations. They have no probability interpretation. The difference interval uses the lowest and highest opposing combinations. If an endpoint is outside sustained flight, the band has a gap. Establishing a historical ranking requires matched powered turns and a defensible uncertainty budget.

The limit view shows usable lift, power-limited G and the model G cap. It breaks the power requirement into level flight and the incremental drag at the sustained load. The multiplier on added drag preserves the one-G power requirement. The shared EAS axis starts at the lower one-G stall in Full envelope mode. The 3°/s focus uses the outer speeds where at least one aircraft reaches that rate. The turn, advantage and climb views use the same bounds and cursor.

## Additional evidence and controls

- The AFDU AB.505 trial reports qualitative turning comparisons for a different Spitfire IX installation. The 4K02 Mustang drag study used propeller-removed flight and tunnel tests. R&M 2535 Part I used a Spitfire I scale model. Their conditions limit quantitative transfer into this powered-turn model. [AFDU trial](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitIX_Tactical_Trials.html) · [NACA ACR 4K02](https://ntrs.nasa.gov/citations/19930092458) · [RAE R&M 2535](https://reports.aerade.cranfield.ac.uk/handle/1826.2/3821)
- The separate MA.648 level-speed replays have 4.71 mph mean absolute error over 16 points using the working model. Its S.U. pump and propeller differ from BS.543. The JL.165 paired radiator tests use +25 boost. The matched BS.543 climb checks give 64.52 ft/min mean absolute error under the v4.3 report-conditioned model. These replays constrain straight-flight behavior. [MA.648](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLFMkIX_MA648.html) · [JL.165](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitIX_25boost_JL165.html) · [BS.543](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)
- Comparison labels use aircraft variants. The Aircraft 2 choices filter precedes both aircraft selectors. The desktop rows align the controls, summaries and results. The current injection profile matches the F4U-4 with the R-2800-18W. Its installed rating is documented. Fuel and fluid use and the altitude-dependent power transfer carry the qualifications in the operating profile. [US Navy characteristics](https://www.aahs-online.org/images/Navy_SAC/F4U-4.pdf) · [Vought specifications](https://www.vought.org/products/html/f4u-4spec.html)

Run `npm run diagnose:turn-performance` to regenerate the [numerical comparison](../validation/current/turn-performance-v44.json). The [frozen v4.3 snapshot](../references/analysis/v44-operating-before.json) records the reference commit and per-aircraft values. The historical sustained-turn and 5:1 gates remain open.
