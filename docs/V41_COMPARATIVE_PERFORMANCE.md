# v4.1 comparative performance audit and proposed v4.2 milestone

Calculated 11 November 2026 from main commit `c9a7ff67bce7b70405d6a8b7a28cc8786c1a0f80`, version 4.1.0-rc.1. This is a performance audit, not a new model fit or historical accuracy certification.

The user priority is maximum sustained turn performance first, then climb rate, best climb speed and maximum level speed, always matched by altitude. Climb-rate error alone does not answer this comparison.

## Method and configurations

ISA atmosphere, coordinated level turns, existing 7g cap, each current reference mass and selected rating, Corsair power-off clean stall anchor, existing Mustang bounded maneuver-lift handling. Peaks are searched over 80–450 mph EAS at 0.5 mph steps and locally refined to 0.01 mph; reported precision is much coarser. Turn time is 360/rate. Radius is TAS/angular rate. Vy maximizes modeled excess power divided by weight, and is not a measured pilot climb schedule. Maximum level speed is the upper zero-excess-power crossing, refined by bisection. No aircraft parameters were fitted.

Reference results use one matching reference configuration across turn, climb and level speed for each aircraft. They do not constitute equal-mission-load or equal-rating-duration comparisons. In particular the P-38 reference uses its native level rating, not the separate report climb schedule. Reference mode largely preserves v4.0 behavior. Source mode uses the live v4.1 report masses and source rating schedule, including fallbacks. Source-mode results must not be called universal combat capability.

| Aircraft | Reference mass lb | Selected reference rating |
|---|---:|---|
| Spitfire LF IX | 7110 | combat+18 |
| Bf 109 F-4 | 6371 | combat |
| P-47B | 12565 | military |
| P-51B-15 | 9240 | 67inHg |
| Fw 190 A-4 | 8532 | combat |
| P-38G-1 | 13550 | level |
| F4U-4 | 12500 | military |

## Reference configuration

### 5,000 ft

| Aircraft | Sustained °/s | 360° sec | Turn mph EAS | Sustained g | Radius at max rate m | Climb ft/min | Vy mph EAS / TAS | Level mph TAS | Fallback |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Spitfire LF IX | 21.7 | 16.6 | 143 | 2.83 | 182 | 5145 | 161 / 173 | 359 | no |
| Bf 109 F-4 | 18.8 | 19.1 | 166 | 2.85 | 243 | 3937 | 155 / 167 | 340 | no |
| P-47B | 14.0 | 25.7 | 169 | 2.26 | 332 | 3101 | 167 / 180 | 352 | no |
| P-51B-15 | 19.1 | 18.9 | 169 | 2.94 | 244 | 3914 | 168 / 181 | 385 | no |
| Fw 190 A-4 | 15.3 | 23.5 | 173 | 2.48 | 313 | 3254 | 163 / 175 | 349 | no |
| P-38G-1 | 18.4 | 19.5 | 192 | 3.20 | 288 | 3890 | 150 / 162 | 346 | no |
| F4U-4 | 16.5 | 21.8 | 163 | 2.52 | 273 | 3720 | 164 / 177 | 365 | no |

### 15,000 ft

| Aircraft | Sustained °/s | 360° sec | Turn mph EAS | Sustained g | Radius at max rate m | Climb ft/min | Vy mph EAS / TAS | Level mph TAS | Fallback |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Spitfire LF IX | 16.7 | 21.6 | 132 | 2.42 | 255 | 4539 | 152 / 192 | 383 | no |
| Bf 109 F-4 | 15.0 | 24.0 | 157 | 2.57 | 338 | 3801 | 149 / 188 | 375 | no |
| P-47B | 11.0 | 32.6 | 160 | 2.03 | 469 | 2925 | 162 / 204 | 386 | no |
| P-51B-15 | 14.5 | 24.9 | 154 | 2.45 | 344 | 3282 | 158 / 199 | 404 | no |
| Fw 190 A-4 | 11.5 | 31.3 | 159 | 2.09 | 446 | 2710 | 149 / 188 | 377 | no |
| P-38G-1 | 14.8 | 24.4 | 182 | 2.88 | 399 | 3774 | 145 / 183 | 381 | no |
| F4U-4 | 12.4 | 29.1 | 149 | 2.10 | 390 | 3040 | 143 / 181 | 385 | no |

### 27,000 ft

| Aircraft | Sustained °/s | 360° sec | Turn mph EAS | Sustained g | Radius at max rate m | Climb ft/min | Vy mph EAS / TAS | Level mph TAS | Fallback |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Spitfire LF IX | 11.1 | 32.6 | 116 | 1.87 | 415 | 3337 | 140 / 217 | 400 | no |
| Bf 109 F-4 | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable / unavailable | unavailable | no |
| P-47B | 8.0 | 45.2 | 150 | 1.77 | 745 | 2640 | 156 / 242 | 428 | no |
| P-51B-15 | 9.8 | 36.8 | 137 | 1.93 | 554 | 2490 | 148 / 228 | 422 | no |
| Fw 190 A-4 | 6.5 | 55.1 | 133 | 1.47 | 808 | 1370 | 144 / 224 | 393 | no |
| P-38G-1 | 10.4 | 34.8 | 164 | 2.31 | 626 | 3061 | 135 / 209 | 409 | no |
| F4U-4 | 8.1 | 44.3 | 133 | 1.66 | 647 | 2180 | 144 / 224 | 412 | no |



## v4.1 source climb configuration

The P-47 changes from military to normal power above 12,600 ft; P-38 uses the report climb schedule. Mustang 67-inHg has zero transferred energy correction and falls back above 12,000 ft; its report mass remains selected. Bf 109 has no engine coverage at 27,000 ft. Source level-speed outputs below are diagnostic applications of the climb configuration: do not treat them as validated clean-speed improvements. The energy evaluator does not enforce the configuration min/max climb-search TAS window on every call.

### 5,000 ft

| Aircraft | Sustained °/s | 360° sec | Turn mph EAS | Sustained g | Radius at max rate m | Climb ft/min | Vy mph EAS / TAS | Level mph TAS | Fallback |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Spitfire LF IX | 20.6 | 17.5 | 144 | 2.73 | 192 | 4870 | 146 / 158 | 311 | no |
| Bf 109 F-4 | 18.8 | 19.1 | 166 | 2.85 | 243 | 3937 | 155 / 167 | 340 | no |
| P-47B | 13.1 | 27.6 | 161 | 2.06 | 341 | 2575 | 157 / 169 | 315 | no |
| P-51B-15 | 18.9 | 19.1 | 169 | 2.91 | 247 | 3863 | 168 / 181 | 384 | no |
| Fw 190 A-4 | 14.3 | 25.1 | 166 | 2.26 | 319 | 2714 | 159 / 172 | 333 | no |
| P-38G-1 | 17.7 | 20.3 | 191 | 3.07 | 297 | 3624 | 170 / 183 | 342 | no |
| F4U-4 | 16.5 | 21.8 | 163 | 2.52 | 273 | 3720 | 164 / 177 | 365 | no |

### 15,000 ft

| Aircraft | Sustained °/s | 360° sec | Turn mph EAS | Sustained g | Radius at max rate m | Climb ft/min | Vy mph EAS / TAS | Level mph TAS | Fallback |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Spitfire LF IX | 15.8 | 22.8 | 132 | 2.32 | 271 | 4217 | 138 / 174 | 331 | no |
| Bf 109 F-4 | 15.0 | 24.0 | 157 | 2.57 | 338 | 3801 | 149 / 188 | 375 | no |
| P-47B | 8.9 | 40.6 | 143 | 1.62 | 519 | 1692 | 147 / 186 | 318 | no |
| P-51B-15 | 14.3 | 25.2 | 154 | 2.42 | 348 | 3236 | 158 / 199 | 404 | yes |
| Fw 190 A-4 | 11.0 | 32.8 | 155 | 1.98 | 454 | 2397 | 148 / 187 | 366 | no |
| P-38G-1 | 14.0 | 25.8 | 179 | 2.70 | 413 | 3589 | 150 / 189 | 376 | no |
| F4U-4 | 12.4 | 29.1 | 149 | 2.10 | 390 | 3040 | 143 / 181 | 385 | no |

### 27,000 ft

| Aircraft | Sustained °/s | 360° sec | Turn mph EAS | Sustained g | Radius at max rate m | Climb ft/min | Vy mph EAS / TAS | Level mph TAS | Fallback |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Spitfire LF IX | 9.8 | 36.9 | 113 | 1.69 | 459 | 2598 | 126 / 194 | 336 | no |
| Bf 109 F-4 | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable | unavailable / unavailable | unavailable | yes |
| P-47B | 6.1 | 59.4 | 133 | 1.41 | 873 | 1379 | 143 / 222 | 354 | no |
| P-51B-15 | 9.6 | 37.3 | 137 | 1.91 | 562 | 2448 | 148 / 229 | 421 | yes |
| Fw 190 A-4 | 6.5 | 55.7 | 133 | 1.45 | 814 | 1335 | 144 / 223 | 390 | no |
| P-38G-1 | 9.7 | 37.3 | 165 | 2.20 | 679 | 2784 | 128 / 199 | 400 | no |
| F4U-4 | 8.1 | 44.3 | 133 | 1.66 | 647 | 2180 | 144 / 224 | 412 | no |

## What v4.1 actually changes in maximum sustained turn

Same mass and named rating on both sides; old reference inputs versus new source-installed configuration. These are prediction changes, not turn-accuracy improvements. The source engine/cooling inputs can differ. No new independent matched historical sustained-turn validation was obtained.

| Aircraft | Altitude ft | Selected rating | Mass lb | Reference °/s | Source °/s |
|---|---:|---|---:|---:|---:|
| Spitfire LF IX | 5000 | combat+18 | 7485 | 20.43 | 20.62 |
| Bf 109 F-4 | 5000 | combat | 6371 | 18.81 | 18.81 |
| P-47B | 5000 | military | 12565 | 14.01 | 13.05 |
| P-51B-15 | 5000 | 67inHg | 9335 | 18.87 | 18.87 |
| Fw 190 A-4 | 5000 | combat | 8532 | 15.30 | 14.32 |
| P-38G-1 | 5000 | climb | 13900 | 17.85 | 17.74 |
| Spitfire LF IX | 15000 | combat+18 | 7485 | 15.65 | 15.76 |
| Bf 109 F-4 | 15000 | combat | 6371 | 15.00 | 15.00 |
| P-47B | 15000 | normal | 12565 | 9.76 | 8.88 |
| Fw 190 A-4 | 15000 | combat | 8532 | 11.51 | 10.99 |
| P-38G-1 | 15000 | climb | 13900 | 14.28 | 13.97 |
| Spitfire LF IX | 27000 | combat+18 | 7485 | 10.27 | 9.76 |
| P-47B | 27000 | normal | 12565 | 6.85 | 6.06 |
| Fw 190 A-4 | 27000 | combat | 8532 | 6.54 | 6.46 |
| P-38G-1 | 27000 | climb | 13900 | 9.87 | 9.65 |

The Mustang's 67-inHg case is unchanged at equal mass. Its new positive useful-power correction is confined to the 75-inHg branch through 12,000 ft. Bf 109's central result is unchanged; v4.1 broadens its engineering candidate display. Corsair is unchanged. A slower predicted turn can be a justified correction of overpredicted power; it is not evidence of better historical turn accuracy without an appropriate check.

At 15,000 ft, simply toggling modes changes the P-47 maximum sustained rate from about 11.03 to 8.88°/s, but also changes military to normal power. Matching normal power on both sides instead gives 9.76 to 8.88°/s. This distinction must survive the next UI and report changes.

## Proposed major milestone: v4.2 combat performance benchmark

Deliver a coherent seven-aircraft comparison whose first acceptance measures are sustained-turn curve shape, peak sustained rate, speed at peak, 360° time, sustained g and radius. Add a separately labelled minimum sustained radius and instantaneous envelope; the radius at peak rate is not necessarily the minimum radius. Display climb rate/Vy, band climb times, level maximum speed and fixed-speed excess energy from the same physical setup.

1. Define explicit combat comparison configurations: gear/flaps up, named propeller and cooling state, full ammunition and a common stated internal-fuel fraction within each aircraft's loading limits. Keep archival replay configurations. Separate documented sustained/combat and time-limited emergency ratings; zero energy loss does not remove an engine time limit.
2. Constrain power and the low-speed drag/lift model jointly. Use matched level speed or power-required observations, multiple climb rates AND recorded climb speeds, source-qualified stalls/accelerated lift, glide/polar or actual turn measurements where available. Source-level BHP/ram cannot automatically transfer to slow flight. The shared candidate must retain source speed and climb checks while predicting the turn curve.
3. Work across every existing live aircraft. P-47: retain military capability above report normal-power transition; constrain same-prop low-speed losses. Spitfire: reconcile reference/report masses and joint drag/installed-power effects without exporting open-climb drag into clean speed. Mustang: constrain the maneuver-power/low-speed-lift envelope across altitude and retain the 20,800-ft control. Bf 109: reduce the 27-candidate ambiguity using actual lift/drag/power evidence and extend engine coverage only where supported. Fw 190: jointly constrain induced drag, actual climb speed and altitude power. P-38: reduce sparse-fit and low-speed installed-power sensitivity under matched ratings/masses. Corsair: solve the high-altitude speed/climb deficit and retain its powered/power-off lift scenarios.
4. Publish altitude curves and repeatable before/after scorecards for all seven, using at least the existing 5,000/15,000/27,000-ft scenarios plus source transition/check heights. Quantify plausible parameter/input ranges and report reversals or overlapping rankings. Numerical gaps are computational coverage gaps, not zero capability.
5. Acceptance: every aircraft has all requested metrics in a documented configuration, optimizer convergence checks, visible fit/check/source-family separation, guarded transfers, and retained regressions. For supported source conditions the accepted candidate must improve the stated target metric and preserve speed/climb within justified source tolerances. Those tolerances must be recorded before candidate selection. A turn accuracy claim additionally requires a matched turn/low-speed aerodynamic constraint; engineering scenario width alone cannot supply it. Report improvements in supported turn prediction/bounds for every aircraft rather than implying unchanged aircraft improved. Run engineering/browser checks on the exact revision. Historical 5:1 is a later discrimination gate, not a prerequisite for making and reporting useful bounded progress.

No new aircraft is necessary to make this a major milestone; the seven existing live profiles should first have a coherent, useful combat envelope. Research coverage for twelve aircraft is separate from the seven flyable profiles.

## Reproduction and checks

Run `node validation/diagnostics/comparative_metrics_v41.cjs output.json` on the pinned commit plus this analysis-only script. The stored JSON includes reference/source modes, same-mass/rating comparisons, maximum instantaneous-turn predictions and extra Mustang 75-inHg scenarios. Data fields named withinClimbTasWindow are numeric search-window membership only, not proof of historical applicability.

Verification on the pinned code: 20 clean-reference level-speed roots agreed with the existing M.maxSpeed implementation within 2.9e-11 mph; 40 turn-rate/time results passed independent kinematic consistency checks. These check calculation consistency, not historical truth. Main's pre-existing CI is passing; this analysis adds no solver fit or historical accuracy certification.
