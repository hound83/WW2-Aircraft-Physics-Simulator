# Four-aircraft flight model scorecard

Baseline [v3.6](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/992bd3054fdd42842fa93f653e376240f9bc5118). Errors are calculated against the recorded observations at their listed test altitudes. These records were already available during development. They include condition mismatches, so the numerical residuals are diagnostics.

## Clean one-g stall at 8,000 ft

| Aircraft | Weight lb | v3.6 EAS mph | Working EAS mph | NACA-derived EAS bracket mph | Exact corrected stall |
|---|---:|---:|---:|---:|---|
| P-51B | 9240 | 98.5 | 103.4 | 102.3–105.2 | Unresolved |
| P-47B | 12565 | 112.3 | 112.3 | — | Unresolved |
| Bf 109 F-4 | 6371 | 98.1 | 98.1 | — | Unresolved |
| Spitfire LF Mk IX | 7110 | 84.8 | 84.8 | — | Unresolved |

At this weight and altitude the v3.6 Mustang prediction lies 3.9 mph below the TN1044 transfer bracket. The working prediction falls inside it. The bracket comes from the same measured lift evidence used to choose the coefficient, so this is an agreement check against calibration evidence. The exact cockpit correction for 43-24777 remains open.

## Working profile versus historical speed and climb

The table excludes speed anchor rows. Counts show scored pairs and available observations. Empty cells mark missing or unscored evidence. Speed uses mph TAS and climb uses ft/min. One Mustang climb observation at 15,700 ft and 75 inHg falls outside the working power domain. The machine-readable report includes every point, source reference, signed residual and condition exclusion.

| Aircraft | Metric | Altitude ft | Paired / observed | v3.6 MAE | Working MAE |
|---|---|---|---:|---:|---:|
| P-51B | level-speed | 0–10,000 | 3 / 3 | 1.2 | 1.2 |
| P-51B | level-speed | >10,000–25,000 | 6 / 6 | 3.7 | 3.7 |
| P-51B | level-speed | >25,000 | 2 / 2 | 7.4 | 7.4 |
| P-51B | climb-rate | 0–10,000 | 4 / 4 | 105.6 | 105.6 |
| P-51B | climb-rate | >10,000–25,000 | 1 / 2 | 333.2 | 333.2 |
| P-51B | climb-rate | >25,000 | 0 / 0 | — | — |
| P-47B | level-speed | 0–10,000 | 0 / 0 | — | — |
| P-47B | level-speed | >10,000–25,000 | 2 / 2 | 0.8 | 0.8 |
| P-47B | level-speed | >25,000 | 3 / 3 | 0.8 | 0.8 |
| P-47B | climb-rate | 0–10,000 | 0 / 0 | — | — |
| P-47B | climb-rate | >10,000–25,000 | 4 / 4 | 34.8 | 34.8 |
| P-47B | climb-rate | >25,000 | 1 / 1 | 210.0 | 210.0 |
| Bf 109 F-4 | level-speed | 0–10,000 | 1 / 1 | 3.1 | 3.1 |
| Bf 109 F-4 | level-speed | >10,000–25,000 | 0 / 0 | — | — |
| Bf 109 F-4 | level-speed | >25,000 | 0 / 0 | — | — |
| Bf 109 F-4 | climb-rate | 0–10,000 | 0 / 0 | — | — |
| Bf 109 F-4 | climb-rate | >10,000–25,000 | 0 / 0 | — | — |
| Bf 109 F-4 | climb-rate | >25,000 | 0 / 0 | — | — |
| Spitfire LF Mk IX | level-speed | 0–10,000 | 5 / 5 | 1.2 | 1.2 |
| Spitfire LF Mk IX | level-speed | >10,000–25,000 | 10 / 10 | 6.1 | 6.1 |
| Spitfire LF Mk IX | level-speed | >25,000 | 5 / 5 | 5.2 | 5.2 |
| Spitfire LF Mk IX | climb-rate | 0–10,000 | 6 / 6 | 82.1 | 82.1 |
| Spitfire LF Mk IX | climb-rate | >10,000–25,000 | 7 / 7 | 160.0 | 160.0 |
| Spitfire LF Mk IX | climb-rate | >25,000 | 3 / 3 | 92.2 | 92.2 |

## Power and comparison coverage

The P-47B 41-5902 replay uses ten reported shaft-power states with measured TAS and RPM. Shaft power is a model input there. Propulsive power is calculated. Five previously exposed check rows give 34.1 ft/min climb MAE with the accepted configuration model.
The Spitfire high-altitude replay retains the 32,000 ft boost discrepancy as diagnostic and blocks the 36,000 ft point outside the engine domain. The 34,000 ft residual is -261.8 ft/min.
The Mustang has separately documented [power-required and propeller audits](P51_PROPELLER_EFFICIENCY_AUDIT.md). Bf 109 F-4 climb is missing from the established benchmark. Full-envelope independent power-required and propulsive-power validation is open for the four aircraft.

No aircraft pair has independently validated uncertainty bounds under a common comparison policy. All 5:1 claims remain unresolved.

See the [source-condition ledger](../references/performance-evidence.json), [stall research](STALL_ACTUAL_AIRSPEED_RESEARCH.md), [machine-readable v3.6 baseline](../validation/baseline/v36-flight-scorecard.json) and [validation workflow](CURRENT_VALIDATION.md). The full JSON report is produced by `npm run diagnose:flight-scorecard` and included in the GitHub Actions validation artifact.
