# Explicit source-chart climb-power mode

The shared API now exposes sourceChartClimb(aircraft, altitudeFt, options). Run npm run diagnose:source-chart to regenerate this report. It requires a matching specimen/configuration/rating/gear/RPM, an exact chart node, a named bracket selection, an explicit polar and a documented scenario weight. It rejects ambiguous nodes, conflicting power methods and invented interpolation.

## Before and after: C profile, 9,335 lb scenario

| Rating | Altitude ft | Source BHP bracket | Prior proxy ft/min | Chart lower / midpoint / upper ft/min | Midpoint change ft/min |
|---|---:|---:|---:|---:|---:|
| 67inHg | 2200 | 1520-1630 | 3401.1 | 3171.0 / 3323.2 / 3475.7 | -77.8 |
| 75inHg | 2200 | 1760-1850 | 3978.5 | 3836.5 / 3961.6 / 4086.8 | -17.0 |
| 75inHg | 4000 | 1590-1700 | 3829.6 | 3356.2 / 3509.2 / 3662.3 | -320.5 |
| 75inHg | 8000 | 1390-1510 | unavailable | 2773.8 / 2941.6 / 3109.5 | unavailable |
| 75inHg | 12000 | 1220-1340 | unavailable | 2263.1 / 2431.7 / 2600.6 | unavailable |

At 8,000 and 12,000 ft the old ram/level engine proxy has no source-bounded prediction; readable climb-chart nodes now permit explicitly conditional calculations at those exact altitudes. At 4,000 ft the lower chart power decreases the predicted climb. This is a source-input change, not proof of closer historical performance; no matching rate/airspeed/mass observation was established at those heights.

## Known 2,200-ft rate checkpoints

| Rating | Reported ft/min | C chart midpoint ft/min | Diagnostic residual ft/min |
|---|---:|---:|---:|
| 67inHg | 3820 | 3323.2 | -496.8 |
| 75inHg | 4380 | 3961.6 | -418.4 |

The new input mode does not resolve the Mustang climb shortfall. All raw C and separately reanchored N endpoints, source reading boxes, selected BHP and sampled TAS are in [JSON](../validation/current/source-chart-climb.json). N remains an unmatched generic transfer, not a validated replacement.

## Scientific and input limits

BHP is assigned from the report engine chart, not flight torque. A bracket midpoint is a reading choice, not a measured central estimate. Assigned BHP is held fixed while the solver samples 100-290 mph TAS at 1 mph; historical climb TAS remains unknown. The 9,335-lb takeoff number is explicitly a scenario, not reconstructed instantaneous mass. Reading intervals are not historical uncertainty bounds. No interpolation or extension into high blower is enabled. The API checks provenance metadata; the report additionally verifies retained scan bytes through their SHA256 hashes.

Level-flight maxSpeed continues to use its original inputs; chart power is only supplied through the separate climb entry point. No default model coefficient or default aircraft input is changed. No UI redesign or Atlas modification. See [progress assessment](PROGRESS_ASSESSMENT.md), [current validation](CURRENT_VALIDATION.md) and [release notes](../releases/v2.7.0.md).
