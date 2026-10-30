# Next steps

## Completed cohesive milestones

- [Four-aircraft stall evidence review](FOUR_AIRCRAFT_STALL_REVIEW.md): source audits, executable acceptance gate, sensitivities and explicit unresolved calibration conditions.
- [Four-aircraft speed/climb validation](PERFORMANCE_VALIDATION.md): 69 records (including the explicit absent Bf 109 climb-rate record), four speed anchors, native-unit diagnostic errors, condition exclusions, dependence/fit roles and twelve unresolved aircraft/metric comparisons. [Machine-readable results](../validation/current/performance-validation.json).

Default physics, weights and coefficients are unchanged. [Current validation](CURRENT_VALIDATION.md) reports numerical parity, not historical accuracy. The open cumulative review PR includes both packages; no v3.0 release or historical 5:1 claim follows.

## Next cohesive milestone: source-bounded climb power and cooling diagnosis

Use the new exclusion register to evaluate the P-51 climb shortfall and the P-47/Spitfire open-cooling mismatch as one shared power-budget assignment. Trace source-backed shaft power, propeller efficiency/RPM and cooling/stores effects separately. Reuse existing primary source and power-required registers. Implement a shared correction only where independent evidence supports it; otherwise deliver a quantified limit and specific missing evidence. Preserve the fitted drag anchor and distinguish conditional sensitivities from validation.

Acceptance: explain the measured/model useful-power deficit at reported conditions or explicitly label the missing conditions; preserve known failures and the controlled P-47 case; quantify every numerical change; run npm run check; publish one complete review update with source/decision/limitation records. Routine research, code, tests and commits within that scope do not require repeated GO requests. If substantive model design or conflicting historical evidence warrants High reasoning, explain the concrete benefit before proceeding.

Do not reopen blocked stall searches without new evidence, add aircraft, redesign the Atlas/UI, infer uncertainty from residuals or alter frozen fixtures. Stop with the power/cooling deliverable.
