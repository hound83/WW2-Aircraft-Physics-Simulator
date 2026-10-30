# v2.8 working-model results

The working HTML defaults to profile P. Profile C remains available as the legacy reference. Raw API calls retain C for compatibility; use {profile: "P"} or workingOptions for v2.8.

| Aircraft | C speed MAE mph | P speed MAE mph | C climb MAE ft/min | P climb MAE ft/min |
|---|---:|---:|---:|---:|
| p51b | 2.5 | 3.7 | 410.2 | 9.3 |
| p47b | 3.6 | 0.8 | 546.4 | 69.8 |
| spitfire_lfix_bs543 | 5.0 | 4.6 | 103.9 | 103.4 |
| bf109f4 | 3.4 | 3.1 | — | — |

P47 comparison above is against raw C. The existing v2.7 conditional configuration fit already achieved about 44.8 ft/min all-point MAE; its reserved-point MAE is 70.5, versus 84.7 for P. The new joint model improves P47 speed but does not beat that earlier climb-only fit.

Mustang: 67-inHg report 3820, P prediction 3807.8 ft/min; 75-inHg report 4380, P prediction 4386.4 ft/min. The former participated in parameter fitting. The latter was excluded from parameter fitting, but seen during development and acceptance. The two-point 97.7% error reduction is conditional agreement, not independent accuracy.

## Weight sensitivity

Same power model and weights for C and P; source report rates remain fixed.

| Weight lb | C MAE ft/min | P MAE ft/min |
|---|---:|---:|
| 9135 | 303.7 | 107.9 |
| 9335 | 410.2 | 9.3 |
| 9535 | 512.6 | 109.6 |

## Limits and reproduction

Speed anchor exact; alternating non-anchor speed rows fit/check. P-51 67-inHg climb fitted, 75-inHg checked; alternating Figure 5 points fit/check at source RPM. P-47 climb fit 15k/25k ft, remaining altitudes checked. Spitfire climb every fourth row fitted. All records already exposed during development; these are out-of-fit engineering checks, not independent blind validation.

Nonnegative aggregate CD0 increment for documented open-cooling climb states only. Not isolated measured cooling drag; no aircraft-specific climb multiplier.

Spitfire e=0.60 is a grid-boundary effective drag fit, not measured wing efficiency. Turn and stall accuracy have not been established. Bf109 climb is unavailable rather than zero error. No new independent historical data or 5:1 accuracy proof.

Run npm run check and npm run diagnose:joint-calibration. The latter repeats the bounded search, including the drag-only control and top-seven candidates. The archived fit and acceptance thresholds are in calibration/v2.8-working-model.json. The 3628-value frozen C comparison tests legacy compatibility, separately from P improvements.

Interactive browser operation was not exercised in this environment; generated inline JavaScript syntax and active engine/data parity are tested.
