# Next steps

## Completed cohesive packages

Four-aircraft stall evidence, matched speed/climb reporting and climb power/cooling diagnosis remain in the cumulative review PR. The [Mustang original-chart reconstruction](P51_CLIMB_STATE_RECONSTRUCTION.md) now adds five normalization-weight and five low-blower power brackets with source pixels/hashes, and a joint fixed-polar sensitivity grid. No default physics change or historical accuracy claim.

At 2,200 ft the C-model shortfall persists at about 322/268 ft/min even at the best sampled chart-power/weight scenarios. The source weight curve is not a matched high-power climb mass. The 4,000-ft power proxy is high relative to its chart reading, and the 8,000/12,000-ft proxy is source-domain blocked. Read the report and validation before changing inputs.

## Next cohesive milestone: source-backed installed Mustang propeller efficiency

Audit K-6523A-24 / Hamilton Standard installed-efficiency evidence in the climb and Figure 5 regimes. Evaluate an evidence-backed shared-solver candidate against the retained original speed anchor, recorded-RPM level-flight power constraints and reconstructed climb chart states. Quantify joint power/polar/efficiency effects rather than fitting the missing climb horsepower into eta. Retain actual climb TAS/weight, high-blower ambiguities and current shaft-power-domain gaps as explicit exclusions.

Acceptance: original applicable geometry/RPM/J/Cp coverage, separate calibration/checkpoints, source-bounded transfer rules, before/after diagnostics and npm run check. If no applicable installed map is obtained, deliver the source/domain limit and quantified candidate failures. Do not transplant a different propeller as measured Mustang data or claim validated 5:1 accuracy. Keep Atlas/UI/additional aircraft out of scope. Routine research/code/test/commit steps need no separate GO. Stop with one complete review update.
