# Next steps

## Completed cohesive packages

- [Four-aircraft stall evidence review](FOUR_AIRCRAFT_STALL_REVIEW.md): calibration gate, source audits and unresolved historical conditions.
- [Speed/climb validation](PERFORMANCE_VALIDATION.md): 69 records with separate diagnostics, fit/dependence roles and condition exclusions.
- [Climb useful-power/cooling diagnosis](CLIMB_POWER_COOLING_DIAGNOSIS.md): two Mustang inverse budgets, 21 P-47/Spitfire budgets, six inherited recorded-RPM power-required constraints, cooling sign tests and conditional mass/efficiency scenarios. Original Mustang Figures 6/7 inspected; no uncertain coordinates promoted to measurements.

The Mustang needs about 114-119 additional useful hp at the existing assumed states. Positive additional cooling drag worsens that deficit. P-47 has a compatible aggregate-loss sign; Spitfire changes sign with altitude. No isolated cooling/propeller correction is identified, and default numerical behavior remains unchanged. See [validation](CURRENT_VALIDATION.md). One cumulative PR retains the complete review history; no validated v3.0/5:1 release claim.

## Next cohesive milestone: reconstruct the P-51 original climb power and weight states

Recover the best available original Eng-47-1749-A power/weight curves and cross-check their axis, units, rating, standard-condition conventions and original source readings against Figures 4, 6 and 7. Obtain matched climb airspeed/instantaneous weight if documented. Then test one shared evidence-backed power/propeller correction, preserving the speed anchor and independent constraints, or deliver the precise remaining source limit.

Acceptance: trace each accepted coordinate to readable source pixels with justified reading limits; retain ambiguous values as missing; distinguish chart-assigned BHP from measured shaft power; do not infer actual mass from the inverse roots or convert shutter opening to drag without a calibration. Quantify any supported model change and run npm run check. Publish one complete review update with decisions and limitations. Where poor scans or conflicting power conventions require substantive interpretation, recommend High reasoning for that specific source-resolution step before changing the physical model.

Routine source/code/test/commit steps within this assignment need no repeated GO. Keep additional aircraft, Atlas/UI work, generic propeller transplants, frozen-fixture edits and unsupported uncertainty claims out of scope. Stop with the reconstructed-state/correction deliverable.
