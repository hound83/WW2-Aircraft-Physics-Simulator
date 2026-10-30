# v3.0 release-candidate coverage

Version 3.0.0-rc.1; working calibration 2.8.0. The solver and aircraft inputs retain v2.8 behavior. This is a usable working approximation with explicit gaps, not historical accuracy certification.

## Calculation domain versus evidence

The atmosphere law accepts 0–36089 ft. The release interface declares a numerical scenario window of 100–590 mph TAS; it is not a validated speed envelope. An EAS slider value is converted to TAS at its selected altitude before checking this window.

Power-input coverage and exposed checkpoints are separate. Calculable states do not establish a validated flight envelope. Source chart nodes are exact; existing engine interpolation stays inside each rating/gear interval.

## Rating/gear input domains

| Aircraft | Rating | Gear | Altitude interval ft |
|---|---|---|---:|
| spitfire_lfix_bs543 | combat+18 | low | 0–18000 |
| spitfire_lfix_bs543 | combat+18 | high | 13000–34000 |
| bf109f4 | combat | fluid | 0–16076 |
| bf109f4 | emergency | fluid | 0–15748 |
| p47b | military | turbo | 5000–34000 |
| p51b | 67inHg | low | 0–24000 |
| p51b | 67inHg | high | 18000–32000 |
| p51b | 75inHg | low | 0–7400 |
| p51b | 75inHg | high | 18000–20800 |

All intervals describe the existing piecewise engine inputs, including source-qualified proxies. Each full note, source node and exposed speed checkpoint is preserved in [JSON](../validation/current/v3-coverage.json). Auto gear selects the best available power among covered gears; it does not fill gaps. Ram-critical mode must also satisfy its source-dependent pressure inputs at the selected speed.

Examples: P47 military power is unavailable below 5000 ft. P51 75-inHg engine power has a 7400–18000-ft gap; exact source-chart climb nodes at 8000/12000 ft are a separate diagnostic power method. Bf109 combat coverage ends at 16076 ft; emergency ends at 15748 ft. No extrapolation into those gaps is added.

## Exact Mustang chart-power scenario ranges

Fixed profile P calibration, 9135/9335/9535 lb, lower/midpoint/upper assigned BHP at each node, 3000 engine RPM and low blower. Gear/flaps up, automatic cooling, wing racks. Optimized climb; these ranges do not describe the fixed-speed comparison slider, nor follow the e/weight/profile controls.

| Altitude ft | Rating | Scenario climb range ft/min | Samples |
|---|---|---:|---:|
| 2200 | 67inHg | 3480–3989 | 9 |
| 2200 | 75inHg | 4135–4613 | 9 |
| 4000 | 75inHg | 3653–4171 | 9 |
| 8000 | 75inHg | 3059–3586 | 9 |
| 12000 | 75inHg | 2537–3050 | 9 |

Reading brackets and assumed mass changes are not confidence intervals or total historical error bounds. No chart-power interpolation is permitted. Higher-altitude source nodes have no new matched climb-rate observations.

## Comparisons and the application

The live coverage panel follows the same options as the main cards: current profile, weight, effective e, rating, engine mode and Bf109 scenario. Its pairwise values subtract specific-excess-power equivalents at the same altitude/TAS under an explicit native-reference-weight/selected-rating policy. They are not source-matched historical climb-rate comparisons or validated 5:1 discrimination. Mixed simulator/worksheet Bf109 states and unavailable inputs return null pairwise differences.

Source observations remain discrete checkpoints: anchor fits and exposed checks are labeled separately, and historical turn/stall accuracy is unresolved. The older A/B/C audit and C one-point P47 experiment are labeled as legacy panels. The named Greg Bf109 polar is now honored when profile P is selected; it remains a worksheet scenario and does not enter historical pairwise comparisons.

Reproduce with npm run diagnose:coverage, npm run check and npm run test:browser. The browser smoke record reports actual runtime, controls exercised and JavaScript errors separately. No stable v3.0 tag or accuracy certification is created by this release candidate.
