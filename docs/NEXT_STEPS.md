# Next steps

## v2.9 completed: robustness of the working approximation

Three split assignments, a finer and wider Spitfire effective-e search, near-optimal parameter families, 27 paired Mustang chart-power/weight scenarios, and 162 Figure 5 reading/RPM scenarios are reproducible in [v2.9 results](V29_ROBUSTNESS.md). None of eight distinct fixed candidate models passes every documented replacement limit. Retain the v2.8 working calibration; the application/report version is 2.9.0.

## Next cohesive milestone: v3.0 supported-envelope release candidate

Define the usable altitude/speed/rating/configuration envelope of the current four-aircraft speed/climb model, including explicit unsupported gaps. Surface scenario ranges and source/configuration caveats where users compare aircraft, and compare absolute speed/climb residuals and pairwise differences only under compatible assumptions. Keep turn/stall comparisons explicitly provisional. Target any new source work at the precise weakest constraint revealed here, rather than beginning another broad collection exercise.

Acceptance: documented supported conditions, no invented interpolation or missing-data scores, visible distinction between fitted agreement and exposed checks, reproducible scenario ranges, npm run check, and an interactive smoke test of the built application. A practical release candidate may preserve unresolved science. Do not claim independent historical accuracy, validated turn/stall behavior or 5:1 discrimination without evidence. Finish the release candidate without Atlas changes or additional aircraft.
