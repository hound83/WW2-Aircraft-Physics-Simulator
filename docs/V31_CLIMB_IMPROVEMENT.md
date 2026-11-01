# v3.1 condition-aware climb improvement

A shared charge-density power proxy improves P47 and Spitfire matched-source climb calculations. The new API is UniversalClimbConditions.evaluate(physics, aircraft, sourceState, calibration, optionalScenario). The application computes these same fixed report-state predictions. Generic clean speed/power/turn controls retain their previous calibration.

## Before and after, original reserved rows

| Aircraft | Previous climb MAE ft/min | v3.1 climb MAE ft/min | Reduction |
|---|---:|---:|---:|
| p47b | 84.7 | 51.3 | 39.5% |
| spitfire_lfix_bs543 | 110.2 | 77.9 | 29.3% |

These are 3 P47 and 12 Spitfire already-exposed check points, excluded from this parameter fit; not independent historical validation. P47 earlier conditional experiment scored 70.5 ft/min on the same original reserved altitudes; v3.1 also improves that baseline.

Clean speed maximum change: 0 mph. Mustang maximum change: 0 ft/min. Bf109 climb remains unavailable, not zero error.

## Mechanism and fit

The previous model scaled shaft power by absolute MAP ratio. The candidate raises that ratio to a shared fitted exponent 0.75, capped at 1. Both targets use the same law; no aircraft-specific climb multiplier or altitude correction curve. Per-aircraft nonnegative configuration drag is refitted using only the original fit altitudes, with the clean speed-anchor polar retained. The engine-power-dependent cooling-loss alternative was tested but rejected by training score; the selected heat fraction is 0.

NASA Glenn derives pressure/density coupling for ideal isentropic flow: [derivation](https://www.grc.nasa.gov/www/k-12/rocket/isndrv.html). That relation motivates a charge-density hypothesis; it does not establish this installed engine net-shaft-power law. The selected 0.75 is empirical. The wider 2/3 search endpoint is an exploratory sensitivity, not an air-specific thermodynamic bound. Charge temperature, intercooler response, friction and mixture effects are not identified.

P47 uses recorded absolute inHg boost converted consistently for the common ratio calculation. Spitfire uses the existing same-gear level/climb boost records at the 7485-lb scenario. The 14000-ft Spitfire row lacks reference boost, so its engine power is left uncorrected; no source interpolation is invented. Source-assumed masses and flight conditions retain their earlier qualifications.

## Split checks, with controls fitted on identical rows

The initial sensitivity compared alternate refits against retained v2.8 coefficients, which had already fitted some of those alternate check points. Both the linear-power control and candidate are therefore refitted on identical rows for a fair model-form comparison. This design correction was made after the first probe and is recorded in the policy. The stricter retained-coefficient results remain visible below.

| Split | Aircraft | Refitted linear control MAE | Candidate MAE | Retained coefficients MAE |
|---|---|---:|---:|---:|
| alternate | p47b | 121.5 | 59.2 | 45.2 |
| alternate | spitfire_lfix_bs543 | 101.1 | 84.8 | 104.3 |
| rotated | p47b | 135.8 | 54.8 | 85.0 |
| rotated | spitfire_lfix_bs543 | 103.6 | 77.2 | 98.6 |

One P47 alternate check set favors the retained model (45.2 versus 59.2 ft/min). The candidate improves both alternate model-form comparisons when the controls use identical fit rows, but does not dominate every comparison. Alternate fits select the stronger-response search boundary, indicating parameter uncertainty.

## Mass and power stress

Assumed level power +/-3% and mass +/-2%, same perturbations for old/new, nine combinations. The calibrated drag polar is held fixed; source inputs are copied, never mutated. These are scenarios, not measured uncertainty bounds.

| Aircraft | Scenarios improved | Total |
|---|---:|---:|
| p47b | 9 | 9 |
| spitfire_lfix_bs543 | 8 | 9 |

The high-power/light-mass Spitfire scenario worsens (224.7 to 252.4 ft/min check MAE). Do not advertise a universal improvement or use these ranges as confidence intervals.

## Residuals by source state

| Aircraft | Altitude | Gear | Role | Old residual ft/min | New residual ft/min |
|---|---:|---|---|---:|---:|
| p47b | 15000 | turbo | fit | 53.5 | 28.7 |
| p47b | 20000 | turbo | check | -3.4 | -33.3 |
| p47b | 23400 | turbo | check | 40.7 | 9.7 |
| p47b | 25000 | turbo | fit | -41.6 | -22.3 |
| p47b | 30000 | turbo | check | -210.0 | -110.8 |
| spitfire_lfix_bs543 | 2000 | low | fit | -70.4 | -118.5 |
| spitfire_lfix_bs543 | 4000 | low | check | 2.3 | -47.5 |
| spitfire_lfix_bs543 | 6000 | low | check | 51.1 | 0.3 |
| spitfire_lfix_bs543 | 7000 | low | check | 22.7 | -28.9 |
| spitfire_lfix_bs543 | 8000 | low | fit | -37.3 | -44.9 |
| spitfire_lfix_bs543 | 10000 | low | check | -143.7 | -69.4 |
| spitfire_lfix_bs543 | 12000 | low | check | -218.5 | -131.8 |
| spitfire_lfix_bs543 | 14000 | high | check | 165.9 | 108.8 |
| spitfire_lfix_bs543 | 16000 | high | fit | 151.2 | 113.2 |
| spitfire_lfix_bs543 | 18000 | high | check | 119.6 | 81.9 |
| spitfire_lfix_bs543 | 20000 | high | check | 35.7 | 90.7 |
| spitfire_lfix_bs543 | 22000 | high | check | -30.0 | 105.1 |
| spitfire_lfix_bs543 | 24000 | high | fit | -71.9 | 27.8 |
| spitfire_lfix_bs543 | 26000 | high | check | -136.5 | -42.1 |
| spitfire_lfix_bs543 | 28000 | high | check | -164.6 | -79.7 |
| spitfire_lfix_bs543 | 30000 | high | check | -232.2 | -148.7 |

Policy and all 12 model candidates are retained in calibration/v3.1-policy.json and validation/current/v31-climb-improvement.json. The active manifest is calibration/v3.1-climb-model.json. Original observations, frozen imports, default clean coefficients, CLmax and engine curves are unchanged. The small baseline-reproduction tolerance (0.00001 ft/min) accommodates the two legacy feet/minute conversion constants; it does not relax performance targets.

Reproduce with npm run diagnose:conditioned-climb and npm run check. The browser smoke also verifies the live condition-model table and that it remains fixed when exploratory sliders change. Historical turn/stall and 5:1 accuracy remain unresolved.
