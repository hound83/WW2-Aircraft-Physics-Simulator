# v4.1: installed energy in the live comparison

Version **4.1.0-rc.1** is a research candidate. It improves five existing aircraft configurations, carries the same energy balance into sustained-turn and fuel-changing climb calculations, and preserves the v4.0 reference configuration for comparison. It does not certify historical turn accuracy.

## What changes in the simulator

The seven-aircraft panel defaults to **v4.1 source climb configuration**. Its table and curves use report masses, recorded engine settings and a bounded equivalent installation model through the shared solver. Select **v4.0 reference configuration** to reproduce the earlier configuration. The configuration column identifies source mode and explicit reference fallback outside its altitude/rating domain. The 48-row energy scorecard includes original observations, predictions, fit/check roles and derived excess horsepower. The existing historical evidence browser and frozen four-aircraft scorecard remain available.

Net useful excess power follows weight times vertical velocity. The installed adjustment is an equivalent drag-area term plus a fraction of useful propulsive power. These terms constrain the combined installation; they do not separately measure propeller efficiency, cooling drag or engine loss. A small positive useful-power correction for the Mustang is confined to the 75-inHg chart branch. No historical CLmax was refitted.

## Matched-condition results

Errors are mean absolute climb-rate errors in ft/min. Both versions use the same observation, mass, altitude, rating and recorded TAS where available. For the Fw 190 and Mustang the historical optimum TAS is unknown; both calculations search the same model speed envelope. Source gross/takeoff masses are scenarios, not recovered instantaneous weights.

| Aircraft / report | Excluded-from-fit checks | v4.0 error | v4.1 error | Reduction |
|---|---:|---:|---:|---:|
| P-47B 41-5902 | 5 | 501.15 | 32.41 | 93.5% |
| Spitfire IX BS.543 | 10 | 369.90 | 64.52 | 82.6% |
| P-38G-1 42-12687 | 4 | 103.20 | 76.62 | 25.8% |
| Fw 190 A-4 W.Nr.783 | 5 | 164.28 | 91.17 | 44.5% |
| P-51B-15 43-24777 | 2 comparable | 160.55 | 34.90 | 78.3% |

All observations were previously exposed. Excluding a row from numerical fitting does not make it an independent historical test. These errors are not confidence bounds.

The P-47 correction transferred unchanged to the separate **41-5942** report: five-point error **615.68 → 77.86 ft/min**. That report was excluded from this fit, but was also previously exposed. Its aircraft, gun installation and gross mass differ; the transfer therefore supports a qualified family-level check rather than exact specimen identity or historical sustained-turn certification.

The P-38's worst single-point increase in absolute error is **66.67 ft/min**; the Fw 190's is **21.73 ft/min**. These remain in the scorecard. The other three primary check sets have no worsened comparable check. Reversing the numerical fit/check split still improves the four multi-altitude sets: P-47 **518.66 → 44.22**, Spitfire **388.93 → 79.77**, P-38 **200.10 → 175.23**, Fw 190 **311.24 → 103.50**. P-38's weaker alternative result exposes sensitivity to sparse data. The alternate Mustang split preserves the lower-boost result and predicts the omitted 8,000-ft 75-inHg observation within about 76 ft/min; the old model lacks that matching chart-power branch, so no before/after improvement is claimed for it.

## Aircraft-specific physical changes

- **P-47B:** original torque-meter BHP and 2:1 engine/prop gearing; 2,700 RPM military below the report transition and 2,550 RPM normal above it. Gross trial mass 12,565 lb, open cooling. The configuration changes climb and sustained turn together, rather than replacing a displayed climb number.
- **Spitfire:** 7,485-lb BS.543 radiator-open trial, recorded boost-conditioned engine power and 13,000-ft high-gear change. Correct source inputs alone reduce check error to about 141 ft/min; the bounded installed residual reduces it further. The power conversion uses an engineering exponent of 0.75. The transition node and flat 12,000–13,000-ft low-gear extension are assumptions.
- **P-38G:** 13,900-lb takeoff scenario and original per-engine chart BHP at 3,000 RPM. A constant-loss candidate was rejected after worsening checks. The accepted bounded advance-ratio/loading candidate retains a high-J taper instead of exporting its low-speed penalty unboundedly to 35,000 ft.
- **Fw 190:** clean W.Nr.783 open-cooling climb curve and existing source inlet model; equivalent useful-power loss interpolates between fit altitudes. The 8–10-km extension is bounded extrapolation, checked at 9/10 km. Exact historical climb TAS remains unknown.
- **P-51B:** Figure 7 power-interval midpoints make the 75-inHg source climb branch computable through 12,000 ft at the 9,335-lb takeoff scenario. A 3% net useful-power candidate is supported by several chart conditions. The 67-inHg native branch is retained with zero transferred correction. This does not identify an installed Hamilton Standard efficiency map.

## Other aircraft, turn and external simulators

The **Bf 109 F-4** gains an explicit combat inlet-transfer configuration and a live 27-candidate lift/drag/propulsion ensemble. Its assumed CLmax, drag efficiency and retained-power alternatives are evaluated physically and do not select parameters from IL-2. Their turn scenarios span about 17.47–22.70 s at sea level and 20.35–26.45 s at 3,000 m under the comparator's assumptions. The official IL-2 values lie inside those scenario ranges, which does not establish historical accuracy.

All eight pages of USAAF **Report 110** were inspected. Its F-4 figures (6,200-lb normal weight, 3,400-ft/min climb and 4.8 min to 15,000 ft) are intelligence estimates, not an identified calibrated flight trial. The original DB601E flight-calibration plate is retained as a source lead; its small altitude labels were not qualified for numerical extraction. No engine curve was reconstructed from them. The earlier G-1-to-F-4 inlet transfer remains explicit, not an F-4 measurement.

The **F4U-4** retains its v4.0 source-conditioned model and both stall scenarios. No new physical accuracy improvement is claimed for it. Its high-altitude deficit remains the next installation problem to solve.

The original 69-record four-aircraft scorecard stays available unchanged. Source-mode turn predictions change where useful excess power changes, but climb does not by itself identify the low-speed polar or CLmax. Model scenario ranges are not empirical uncertainty intervals. IL-2/DCS remain secondary behavior comparisons; no new matched DCS trial or independent historical sustained-turn test was obtained.

The subsequently merged [twelve-fighter research tranche](research/WW2_TWELVE_FIGHTER_DUAL_LANE_RESEARCH_2026-11-10.md) is included in this build and its evidence browser. Its additional stall/position-error rows preserve their variant and speed-domain limits; they do not supply new same-variant calibrated stall coefficients for these five corrections. No evidence-coverage percentage is treated as a performance-accuracy percentage.

A final live-band check found that the F-4 candidate calls initially omitted the inlet-transfer source context and were skipped. The corrected shared calls preserve that context. At 5,000 ft and 170 mph EAS the resulting engineering band is approximately **15.00–19.45 deg/s**, versus **18.14–18.89 deg/s** for the narrow central perturbations. The central prediction is unchanged. Both regression and browser checks now require the wider physical ensemble to reach the live panel.

## Evidence and reproducibility

The [source audit](../references/v4.1-energy-audit.json) links existing original registers rather than duplicating scans. The [parameters](../calibration/v4.1-energy.json), [before-scorecard](../validation/baseline/v40-energy-checks.json) and executable diagnostics preserve source identities, observed/derived inputs, fit roles, alternatives and negative results. Generated numerical details are in `validation/current/energy-v41.json` in the CI artifact.

Run `npm run check`, `node scripts/verify-pre-pr1.cjs` and `npm run test:browser`. The new regression checks reproduce parameter fitting, verify separate-report transfer, source identity/domain guards, engine gearing/RPM, energy conservation, live sustained-turn effects, seven-aircraft finite scenario grids and fuel-dependent mass integration. Browser tests exercise source/reference switching, source masses, actual live rates, 48 scorecard rows and labelled fallback. The original 367 import hashes and 3,628 legacy values remain protected.

## Next scientific gate

For v4.2, test installation candidates against joint speed/climb measurements from separate reports and measured power, starting with the Corsair's high-altitude deficit and P-38 candidate sensitivity. Tighten low-speed polar and calibrated stall bounds using exact variant/configuration observations. Preserve the current five-aircraft gains as repeatable acceptance checks. A 5:1 aircraft-difference claim still requires an independent uncertainty bound relative to a meaningful performance gap; neither small top-speed residuals nor these same-report climb checks provide it.
