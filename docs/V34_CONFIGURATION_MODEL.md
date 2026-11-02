# v3.4: source-matched climb model and laboratory

Five exact P-47B 41-5902 states fit the aggregate configuration loss; five are reserved. All observations were already exposed in v3.3 before this split was registered. These are engineering checks, not blind historical validation. Candidate selection uses training MSE only. Original source values, clean coefficients, generic power curves, other aircraft and the earlier cross-specimen P47 model remain unchanged.

## Before and after

| Metric, ft/min | v3.3 transferred drag | Constant Cd0 refitted on identical rows | New shape |
|---|---:|---:|---:|
| Reserved-row MAE (5) | 130.4 | 99.5 | 34.1 |
| Fit-row MAE (5) | 97.8 | 76.4 | 42.4 |
| All-row MAE (10) | 114.1 | 87.9 | 38.3 |

Reserved-row MAE is 73.8% lower versus v3.3 and 65.7% lower versus the fair constant-drag refit. Every primary reserved row improves versus v3.3. At 35000 ft: observed 450, previous 17.8, new 366.4 ft/min. Residual improves from -432.2 to -83.6 ft/min.

## Mechanism and limits

Reuse the shared v3.1 configuration factor: factor = (1-h) + h*(P/Pref)*(rhoRef/rho)*(Vref/V)^3. Added Cd0 = referenceCd0*factor. Selected h=0.7; reference Cd0=0.01992500 at the exact sea-level 2000-BHP/172-mph reference state.

The constant-Cd term produces added drag power proportional to rho*V^3. The other term produces added drag power proportional to shaft horsepower. Both are nonnegative and use the same drag/power solver with a registered Cd0 bound. This is an aggregate loss hypothesis, not identified cooling physics. h=0.7 is NOT a measured 70% heat fraction. It may absorb imperfect installed propeller losses, gross-mass assumptions or other configuration differences. No altitude residual offsets or climb multipliers are used.

Only exact source-matched report states may use this calibration. It does not extend the generic engine curve or establish turn/stall accuracy. The 41-5931 boost-proxy package and Spitfire keep their previous calibration; new coefficients are not silently transferred into them.

## Fit/check and model selection

Primary fit IDs: p47-5902-0, p47-5902-10000, p47-5902-12600-normal, p47-5902-20000, p47-5902-30000. The other five states are reserved. Both ratings at 12600 ft remain distinct. The 35000-ft state is reserved in all three splits. The policy was recorded before this search, after the data had been exposed.

| Power-linked mixture h | Reference Cd0 | Fit RMSE ft/min |
|---|---:|---:|
| 0.7 | 0.01992500 | 51.1 |
| 0.8 | 0.02040967 | 52.2 |
| 0.6 | 0.01944306 | 52.6 |
| 0.9 | 0.02089395 | 56.4 |
| 0.5 | 0.01896639 | 56.4 |
| 0.4 | 0.01849701 | 61.6 |
| 1 | 0.02137405 | 63.2 |
| 0.3 | 0.01803653 | 67.7 |
| 0.2 | 0.01758618 | 74.3 |
| 0.1 | 0.01714686 | 81.2 |
| 0 | 0.01671923 | 88.1 |

## Alternate splits

| Split | Selected h | New reserved MAE | Fair constant control MAE |
|---|---:|---:|---:|
| alternate-interleaved | 0.6 | 62.1 | 123.7 |
| lower-altitude-training | 1 | 58.4 | 116.1 |

Alternate winners select h=0.6 and h=1.0. The lower-altitude split reaches the search boundary. Nearby primary candidates have similar training scores. The tests support a useful model form, not a uniquely identified parameter.

## Paired fixed-coefficient sensitivity

| Scenario mass lb | Propeller retained-power scale | v3.3 reserved MAE | Fair constant MAE | New reserved MAE |
|---|---:|---:|---:|---:|
| 12365 | 0.97 | 177.4 | 113.5 | 78.1 |
| 12365 | 1 | 115.0 | 122.2 | 48.8 |
| 12365 | 1.03 | 165.4 | 196.3 | 145.4 |
| 12565 | 0.97 | 232.7 | 161.7 | 135.0 |
| 12565 | 1 | 130.4 | 99.5 | 34.1 |
| 12565 | 1.03 | 123.3 | 153.7 | 85.0 |
| 12765 | 0.97 | 286.8 | 216.8 | 190.6 |
| 12765 | 1 | 178.3 | 114.7 | 82.2 |
| 12765 | 1.03 | 114.2 | 112.3 | 45.1 |

The new fit beats both controls in 9/9 paired scenarios, but its reserved MAE spans 34.1 to 190.6 ft/min. These are assumption scenarios, not measured uncertainties or confidence intervals. Recorded shaft BHP and the clean speed-anchor polar stay fixed; retained-power scaling alters the propeller model rather than engine power.

## Every report state

| Altitude / rating | Role | Previous residual | New residual | New Cd0 increment |
|---|---|---:|---:|---:|
| 0 / military | fit | 97.0 | 68.1 | 0.019925 |
| 5000 / military | reserved engineering check | 19.7 | 4.1 | 0.019417 |
| 10000 / military | fit | -12.0 | -8.2 | 0.018741 |
| 12600 / military | reserved engineering check | -27.3 | -8.8 | 0.018271 |
| 12600 / normal | fit | -122.5 | -83.1 | 0.017414 |
| 15000 / normal | reserved engineering check | -94.0 | -55.2 | 0.017433 |
| 20000 / normal | fit | -88.6 | -21.3 | 0.016569 |
| 25000 / normal | reserved engineering check | -79.0 | 19.1 | 0.015767 |
| 30000 / normal | fit | -169.0 | 31.2 | 0.013808 |
| 35000 / normal | reserved engineering check | -432.2 | -83.6 | 0.011487 |

## Application and reproduction

The climb laboratory defaults to the accepted model and retains v3.3 and clean controls. It includes source/before/selected curves, fit/check markers, mass and retained-power selectors, a reset button and a per-row comparison. Lines join exact states for display only; the prediction API never interpolates between report rows. Mobile controls wrap and the chart/table scroll within their own panel.

Run npm run diagnose:configuration, npm run check and npm run test:browser. The active model is calibration/v3.4-configuration-model.json; policy and all candidates are retained. Tests cover check-row exclusion from fitting, observation exclusion from prediction, source/configuration/reference gates, fixed BHP/polar, loss-energy scaling, mass/propeller sensitivity and browser/shared-solver parity.

Acceptance: {"primaryVsTransferred":true,"primaryVsRefittedConstant":true,"noLargeCheckDegradation":true,"highAltitude":true,"alternateSplits":true,"pairedStress":true,"pass":true,"maxCheckDegradationFpm":-15.558490943198194,"improvedStressCases":9,"highAltitudeResidualFpm":-83.58324477912743}. Source scans, hashes and mass/torque/gearing qualifications are in references/p47b-measured-climb-v33.json and docs/V33_MEASURED_POWER_CLIMB.md.

Spitfire 32000-ft boost remains diagnostic-only; its 34000-ft deficit remains unresolved. Next cohesive milestone: resolve source-bounded Spitfire high-altitude engine inputs, test the resulting correction, and review four-aircraft envelope consistency. Do not transfer P47 coefficients.
