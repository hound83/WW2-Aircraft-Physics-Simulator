# Greg-method drag reference

13 November 2026. Covers the 19 scored dossiers in Fighter Sim Inputs v1.11.0. The [machine-readable models](../../references/analysis/fighter-greg-drag-models-v1.json) use the dossier IDs from the input pack. The build exports the same JSON as `dist/fighter-greg-drag-models.json`, with its SHA-256 in `dist/build.json`. [Source anchors and engineering ranges](../../references/analysis/fighter-greg-drag-anchors-v1.json)

For a specified wing, loading and density, calculate dynamic pressure from TAS and compute the 1g lift coefficient from weight. The polar gives drag as `q * S * (CD0 + k * CL^2)` and the required propulsive power as drag times TAS. Greg's F-4 worksheet supplies the two drag components directly. The D-30 scenario uses Greg's D-family worksheet, likely for a D-28, using its component power divided by TAS to recover force. The other 17 rows calculate total drag from level speed and effective power, with residual thrust set to zero. They use estimated propeller efficiency 0.80 (0.70–0.88) and estimated Oswald efficiency 0.80 (0.70–0.90). The P-38G level case uses total BHP from both engines. [Method](MINIMUM_VIABLE_SIM_DATA.md#calculating-drag-from-sparse-evidence) · [NASA induced drag relation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/induced-drag-coefficient/)

| Dossier | Anchor TAS (mph) | Pressure altitude (ft) | CD0 | k | Anchor |
| --- | ---: | ---: | ---: | ---: | --- |
| F4U-4 80765 | 348.7 | 0 | 0.01729 | 0.07432 | Level speed and power |
| P-51B-15 43-24777 | 426.0 | 22,400 | 0.01649 | 0.06772 | Level speed and power |
| F6F-3 04776 | 377.5 | 22,300 | 0.01918 | 0.07243 | Provisional power or specimen proxy |
| Spitfire LF IX BS543 | 363.0 | 6,000 | 0.01991 | 0.07097 | Level speed and power |
| P-47B 41-5902 | 352.0 | 5,000 | 0.01913 | 0.07181 | Level speed and power |
| P-38G-1 42-12687 | 346.5 | 5,000 | 0.02321 | 0.04819 | Level speed and power |
| Fw 190 D-9 210002 | 330.0 | 0 | 0.02437 | 0.06604 | Level speed and power |
| Fw 190 A-4 783 | 326.2 | 0 | 0.02405 | 0.06604 | Level speed and power |
| P-40F 41-13635 | 374.0 | 18,100 | 0.01629 | 0.06737 | Level speed and power |
| Ki-84-I 302 | 412.0 | 20,000 | 0.02209 | 0.06616 | Provisional power or specimen proxy |
| P-47D-30 43-3441 | 350.0 | 0 | 0.02275 | 0.07312 | Greg worksheet transfer |
| Bf 109 F-4 DB601E | 325.0 | 0 | 0.02437 | 0.09309 | Greg worksheet |
| Bf109G-2 DB605A (research intake) | 324.4 | 459 | 0.02467 | 0.06490 | Level speed and power |
| P-51D-15-NA 44-15342 | 375.0 | 0 | 0.01453 | 0.06830 | Level speed and power |
| P-47D-22-RE 42-26167 | 444.0 | 23,200 | 0.02193 | 0.07181 | Provisional power or specimen proxy |
| Fw 190 A-8 WNr 733705 | 320.6 | 0 | 0.02496 | 0.06604 | Level speed and power |
| Spitfire I N.3171 | 320.5 | 10,000 | 0.01797 | 0.07097 | Provisional power or specimen proxy |
| Spitfire Va X.4922 | 375.0 | 20,800 | 0.02001 | 0.07097 | Level speed and power |
| Bf 109 E WNr 1304 (AE479) | 290.0 | 0 | 0.02567 | 0.06617 | Provisional power or specimen proxy |

The curve samples are at fixed altitude and 1g, between 55% and 100% of the anchor TAS. The F6F-3 and D-30 curves use their dossier reference mass after fitting at the donor scenario mass. Pointwise bands cover the endpoints of the listed efficiency, power, mass and speed allowances. The bands describe the effects of those assumptions. The A-8 VwKC and Ki-84 reported mph each have an explicit speed-basis qualification. No uncertainty range is inferred where a worksheet input is held fixed.

The F-4 worksheet replay gives **644.47 lbf at 200 mph**, versus **646 lbf** in the sheet. The reserved level checks predict drag **0.14% lower** for the F4U-4, **2.56% higher** for the P-51B, **0.51% lower** for the P-47B, **5.45% higher** for the P-38G, and **0.64% lower** for the P-51D than the effective-power comparison. Each comparison shares at least the assumed efficiency and some share a chart or test campaign. The check results are stored alongside the fit, including the P-38G disagreement.

### Using the models

- Select the dossier and its recorded configuration. Use TAS, density, wing area and mass in consistent units. The sample curve reports parasite and induced drag in newtons and useful propulsive power in mechanical horsepower. Engine shaft power required additionally depends on efficiency at the evaluation point.
- Use these as preliminary reference polars, or as starting values for scenario comparisons. The build exports them separately from the runtime aircraft calibrations. Take extra care with the F6F-3 and Bf 109 E specimen transfers, the D-30 worksheet transfer, the P-47D-22 and Spitfire I power proxies, and the Ki-84 nominal schedule.
- Prioritize a second observation at substantially different lift coefficient, with power, speed, mass and cooling matched. This is the main missing check for sustained turns. Also check compressibility, exhaust/radiator thrust and cooling state before extending the fast-flight polar across altitude or configuration. Near-stall and high-load behavior need their own evidence.

To regenerate after editing a source anchor, run `node scripts/fighter-greg-drag-models.cjs` and `npm run check`. The build checks exact agreement with the committed output.
