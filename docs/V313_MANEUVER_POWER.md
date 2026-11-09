# v3.13 research build | Mustang climb and sustained-turn power

The browser and JSON scorecard add five exact climb report states for P-51B-15 43-24777 and a turn sensitivity at 8,000, 15,000 and 20,800 ft. All production flight-model coefficients remain at v3.12. The experimental propeller change was rejected.

## Climb at several heights and speeds

[Wright Field Eng-47-1749-A, section V.D and Figures 6-7](../references/p51-maneuver-power.json) covers the V-1650-7 and Hamilton Standard K-6523A-24 at 3,000 engine rpm. The report gives climb rates, takeoff weight of 9,335 lb, wing racks and automatic shutters. It supplies no climb TAS or instantaneous mass. Figure 7 uses chart-assigned standard BHP. The existing Figure 7 pixel brackets are reused. Three Figure 6 readings are new, with pixel coordinates and coarse reading brackets recorded separately from the two rates transcribed from the report summary.

At each exact chart node, the fixed-speed replay evaluates 135, 160 or 185 mph EAS with the original reference polar and takeoff mass. The table reports the chart BHP bracket and calculated propulsive, required and excess hp. The climb range at the selected speed varies chart BHP only. The best-climb column searches the same 135-185 mph EAS interval in 1 mph TAS steps and uses chart midpoint BHP in the chart replay. It holds those BHP fixed over the speed grid. No source state is extrapolated and no historical TAS is inferred. The generic schedule comparison uses the same weight, speed grid, propeller model and polar.

| Altitude ft | Test schedule | Report / reading ft/min | Generic best ft/min | Chart replay best ft/min |
|---|---|---:|---:|---:|
| 2,200 | 67 inHg | 3,820 | 3,808 | 3,729 |
| 2,200 | 75 inHg | 4,380 | 4,386 | 4,369 |
| 4,000 | 75 inHg | 4,000-4,225 | 4,421 | 3,907 |
| 8,000 | 75 inHg | 3,400-3,650 | unavailable | 3,317 |
| 12,000 | 75 inHg | 2,925-3,175 | unavailable | 2,788 |

The 75 inHg label identifies the test schedule. Actual manifold pressure fell after critical altitude. In the three shared states, average absolute residual to the report value or chart midpoint moves from 109 to 102 ft/min. Both 2,200 ft residuals worsen. The new replays extend comparison coverage from three to five states without changing the generic schedule. They do not establish more accurate physical coefficients.

The source ledger retains Eglin's independent same-engine aggregate climb-time comparison, NAA's 8,460-lb preliminary test and Wright Field 43-6883 with a V-1650-3. Differences in loading, power, atmosphere or operating detail keep those reports separate. No installed K-6523A-24 efficiency surface was established.

## Sustained turns

Vary the propeller retained-power parameter from 0.85 to 0.97 on the existing v2.9 engineering grid. Each scenario reanchors the drag polar to the same level-speed reference and retains the same span efficiency, weight, engine rating and lift limits. The parameter is distinct from propeller efficiency, which the solver calculates at each speed. The sample range reflects the coupled propeller and drag-anchor assumption. It omits uncertainties in lift, engine output and configuration. It is neither a historical confidence interval nor a ranking rule.

At 20,800 ft and 250 mph TAS, the nominal result remains 2.388 g. Sampled efficiency is 81.0%-91.9% and sustained turn is 2.289-2.435 g (10.35-11.16 deg/s). The frozen workbook point of 2.130 g uses 80% propeller efficiency and its own drag assumptions. It is a separate engineering scenario.

The 4.27 mph modeled P-38G/P-47B level-speed gap illustrates the precision issue. The nominal 5:1 combined budget for that gap would be 0.85 mph. Historical ranking remains unresolved. The scorecard still requires matched independent evidence and a validated error bound for 5:1.

## Propulsion candidate and guards

The candidate varies one parameter from the established grid. Each fold holds out an entire altitude, including both ratings at 2,200 ft. The remaining chart midpoint rates select the candidate under the same source-conditioned climb setup. These folds share a test programme and can test model behavior without supplying an independent historical error bound. The all-altitude challenger selects 0.97 versus 0.93 nominal. It is evaluated separately against the six Figure 5 power markers at reported TAS and RPM, the 11 non-anchor Mustang level-speed observations and the P-47B 41-5942 donor. None enters this candidate fit. The P-47B test applies the same parameter increment to its own baseline with the reference anchor and open-cooling model preserved. The donor has a distinct airframe with the same engine/propeller installation, and reports torque BHP, TAS and rpm.

| Check | Baseline MAE | Challenger MAE |
|---|---:|---:|
| Mustang, withheld 2,200 ft (0.97) | 51 ft/min | 127 ft/min |
| Mustang, withheld 4,000 ft (0.95) | 206 ft/min | 119 ft/min |
| Mustang, withheld 8,000 ft (0.95) | 208 ft/min | 131 ft/min |
| Mustang, withheld 12,000 ft (0.97) | 262 ft/min | 127 ft/min |
| Mustang Figure 5, full challenger | 30.9 bhp | 28.5 bhp |
| Mustang non-anchor level speed | 0.79 mph TAS | 0.92 mph TAS |
| P-47B donor climb, five points | 77 ft/min | 219 ft/min |
| P-47B donor level speed, three points | 2.37 mph TAS | 2.66 mph TAS |

The same change fails the low-altitude reserved check, the Mustang level-speed guard and the separate P-47B control. Keep it as a reported candidate and retain v3.12 physics. Better measurements of climb TAS, actual mass, torque and installed propeller efficiency are needed to distinguish propeller losses from other effects.

Run `npm run diagnose:fighter-comparison` and inspect `maneuverPower` in `validation/current/fighter-comparison.json`. The export contains source metadata, all samples and signed candidate residuals. `npm run check` verifies the frozen import and prior benchmarks. Browser smoke tests exercise the climb-speed and turn-altitude controls and check parity with the CLI export.
