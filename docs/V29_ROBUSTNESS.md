# v2.9 robustness results

Existing-data sensitivity analysis; working calibration remains separately identified. All checks were already exposed. Scenario envelopes are not confidence intervals.

## Decision

No cross-split gain passes every documented guardrail; retain working coefficients.

## Fixed v2.8 check rows after refitting

Every split winner is compared on the same original check rows. Some original check rows enter alternate fits; these comparisons are diagnostics, not blind validation.

| Split | Retained fraction | High-J loss | P51 speed / climb MAE | P47 speed / climb MAE | Spitfire speed / climb MAE |
|---|---:|---:|---:|---:|---:|
| Retained v2.8 | 0.93 | 0.06 | 4.2 mph / 6.4 ft/min | 0.8 mph / 84.7 ft/min | 5.0 mph / 110.2 ft/min |
| original | 0.93 | 0.06 | 4.2 mph / 6.4 ft/min | 0.8 mph / 84.7 ft/min | 5.0 mph / 110.2 ft/min |
| alternate | 0.93 | 0.12 | 2.8 mph / 38.4 ft/min | 0.3 mph / 101.5 ft/min | 4.7 mph / 95.1 ft/min |
| rotated | 0.93 | 0.12 | 2.8 mph / 38.4 ft/min | 0.3 mph / 107.3 ft/min | 4.7 mph / 102.0 ft/min |
| original extended e | 0.93 | 0.06 | 4.2 mph / 6.4 ft/min | 0.8 mph / 84.7 ft/min | 5.3 mph / 100.1 ft/min |
| alternate extended e | 0.93 | 0.12 | 2.8 mph / 38.4 ft/min | 0.3 mph / 101.5 ft/min | 4.7 mph / 95.1 ft/min |
| rotated extended e | 0.93 | 0.12 | 2.8 mph / 38.4 ft/min | 0.3 mph / 107.3 ft/min | 4.7 mph / 102.0 ft/min |

Own-split check counts and errors, all near-optimal families within 0.02 objective units, raw residuals and clipping flags are retained in [JSON](../validation/current/v29-robustness.json). Bf109 speed is included there; no Bf109 climb score is invented.

## Candidate selection limits

8 distinct fixed candidates were checked: the three original-grid split winners, three extended-grid winners, and original-split near-optimal families, with duplicates removed. None is a global optimization claim. Alternative fit splits change which observations contribute to fitting; the same observations are still exposed engineering data. Only this finite search was evaluated.

## Mustang chart power and weight stress

Two 2200-ft report rates, same source-chart BHP/weight choices for both models. Five exact chart nodes were calculated; higher-altitude predictions without observed matched rates carry null residuals.

| Weight lb | 67 / 75-inHg BHP readings | C climb MAE ft/min | P climb MAE ft/min |
|---|---|---:|---:|
| 9135 | lower / lower | 493.7 | 82.8 |
| 9135 | lower / midpoint | 429.9 | 125.0 |
| 9135 | lower / upper | 366.0 | 188.7 |
| 9135 | midpoint / lower | 416.0 | 17.1 |
| 9135 | midpoint / midpoint | 352.1 | 59.3 |
| 9135 | midpoint / upper | 288.2 | 123.0 |
| 9135 | upper / lower | 338.2 | 95.4 |
| 9135 | upper / midpoint | 274.3 | 137.6 |
| 9135 | upper / upper | 210.4 | 201.3 |
| 9335 | lower / lower | 596.3 | 189.8 |
| 9335 | lower / midpoint | 533.7 | 127.3 |
| 9335 | lower / upper | 471.1 | 179.2 |
| 9335 | midpoint / lower | 520.1 | 113.1 |
| 9335 | midpoint / midpoint | 457.6 | 50.6 |
| 9335 | midpoint / upper | 395.0 | 102.5 |
| 9335 | upper / lower | 443.9 | 99.1 |
| 9335 | upper / midpoint | 381.4 | 36.6 |
| 9335 | upper / upper | 318.8 | 88.5 |
| 9535 | lower / lower | 694.9 | 292.7 |
| 9535 | lower / midpoint | 633.6 | 231.5 |
| 9535 | lower / upper | 572.3 | 170.3 |
| 9535 | midpoint / lower | 620.3 | 217.5 |
| 9535 | midpoint / midpoint | 559.0 | 156.3 |
| 9535 | midpoint / upper | 497.7 | 95.1 |
| 9535 | upper / lower | 545.6 | 142.4 |
| 9535 | upper / midpoint | 484.3 | 81.1 |
| 9535 | upper / upper | 423.0 | 19.9 |

P improves 27 of 27 paired power/weight scenarios. Source graph brackets are not measured torque uncertainty. No interpolation across altitude, rating or gear.

## Spitfire lower-bound profile

Shared propeller parameters held at v2.8 while effective e and aggregate open-state drag refit. Lower e is only a model scenario.

| Effective e | Training objective | Config delta CD0 | Speed check MAE mph | Climb check MAE ft/min |
|---|---:|---:|---:|---:|
| 0.4 | 1.1303 | 0.00000 | 4.6 | 336.8 |
| 0.45 | 0.6788 | 0.00000 | 3.8 | 213.9 |
| 0.5 | 0.4969 | 0.00000 | 4.0 | 143.0 |
| 0.55 | 0.4568 | 0.00089 | 4.6 | 123.0 |
| 0.6 | 0.4454 | 0.00244 | 5.0 | 110.2 |
| 0.65 | 0.4452 | 0.00376 | 5.3 | 100.1 |
| 0.7 | 0.4534 | 0.00489 | 5.6 | 91.8 |
| 0.78 | 0.4802 | 0.00640 | 6.0 | 81.6 |
| 0.85 | 0.5151 | 0.00748 | 6.3 | 75.3 |
| 0.92 | 0.5598 | 0.00840 | 6.5 | 70.6 |
| 0.98 | 0.6054 | 0.00909 | 6.6 | 69.6 |

## Figure 5 reading and RPM stress

Six source points retain their recorded 2100/2300/2700/3000 RPM. Each uses a 27-case Cartesian grid: TAS ±4 mph, BHP ±35, and assumed RPM ±100. These offsets are not independent historical observations or probabilities.

| Source point | Source RPM | Nominal BHP residual | Scenario residual min / max BHP |
|---|---:|---:|---:|
| 0 | 2100 | 11.2 | -36.8 / 61.3 |
| 1 | 2300 | 65.6 | 8.7 / 125.3 |
| 2 | 2700 | 65.8 | -3.9 / 139.8 |
| 3 | 3000 | 27.9 | -37.5 / 97.6 |
| 4 | 3000 | -3.8 | -73.9 / 71.5 |
| 5 | 3000 | -11.2 | -85.3 / 68.6 |

## Interpretation

The small fitted Mustang residual is not a reliable uncertainty estimate. Mass and assigned power perturbations change it substantially; compare the full scenario ranges rather than retaining the nominal 9 ft/min as a prediction guarantee. Spitfire boundary movement can trade induced drag against aggregate configuration loss and shared propeller losses. A lower training score alone does not identify the physical cause.

P47 is compared with both v2.8 and its earlier conditional climb fit (70.5 ft/min on original reserved points), not just raw C. No measured historical turn/stall or 5:1 accuracy result follows. The existing Bf109 simulator scenario remains distinct. Source observations, shaft-power curves, historical speed anchors and frozen baselines are untouched.

Reproduce with npm run diagnose:robustness and npm run check. Policy is recorded in calibration/v2.9-robustness-policy.json. Interactive browser testing is reported separately in CURRENT_VALIDATION.md.
