# Next steps

## First priority: actual stall calibration, v3.5 laboratory delivered

Michael prioritises actual corrected stall speed ahead of the prior Spitfire climb assignment. The simulator now evaluates a conditional P51B calibrated-lift candidate and manual airspeed corrections with no extrapolation. Preserve its source bounds and the four unresolved exact-target gates.

Next complete milestone: retrieve the remaining F4/P47B/IX low-speed correction or direct calibrated lift records, then build and validate applicable Mach/altitude lift dependence. Follow the specific primary leads in STALL_ACTUAL_AIRSPEED_RESEARCH.md. Do not substitute simulator specifications, landing speed or a different pitot installation. The default full-envelope coefficients remain provisional.

## v3.4 completed: model improvement plus interactive climb laboratory

Same-specimen P47 reserved-row MAE improves 130.4 to 34.1 ft/min; refitting constant Cd0 on identical training rows scores 99.5. The 35000-ft residual improves -432.2 to -83.6 ft/min. Both alternate splits and 9/9 paired mass/retention scenarios improve versus fair controls. The application integrates the accepted shape, report/previous/current curves, per-row fit/check roles, mass/retention controls, reset and a responsive layout. Original clean solver, source values, generic power domains and earlier aircraft calibrations are preserved. See V34_CONFIGURATION_MODEL.md for failures, parameter ambiguity and assumption ranges.

## Next complete milestone: Spitfire high-altitude power and envelope consistency

Resolve the source-bounded BS.543 high-altitude engine/boost inputs, test a correction against explicitly declared fit/check conditions, integrate it if supported, and review the four-aircraft input envelope and comparison consistency. Reuse existing source indexes; retrieve only the missing original table/engine records needed for this assignment. Keep the suspect 32000-ft boost diagnostic-only until verified; do not invent +4.7 or transfer P47 configuration coefficients.

Acceptance: a meaningful source-supported reserved-point improvement with retained unfavorable cases, matched source identity/RPM/configuration, fixed clean-speed guardrails, mass/propeller sensitivity and fair alternate splits, application integration, npm run check and browser tests. One PR and merge for the whole tested milestone. No Atlas work, additional aircraft, broad unrelated research or unsupported turn/stall claims. Michael requested larger end-to-end milestones, not another chain of small audit releases.

## v3.3 completed: same-specimen recorded-power climb replay

Ten exact 41-5902 states use report BHP/TAS/RPM and independently verified 0.5 propeller gearing. The app exposes clean versus transferred open-cooling drag. No coefficient changes. Transferred-drag scenario MAE is 114.1 ft/min; at 35000 ft it underpredicts by 432.2 ft/min. These are newly exposed conditional checks with gross-as-tested mass, not certified historical accuracy. Spitfire Table II pixels remain unavailable; 32000 ft stays diagnostic-only.

## Next cohesive milestone: source-bounded configuration drag

Test a bounded cooling/configuration-drag shape against the recorded-power 41-5902 states. Declare fit/check rows before searching; retain the 35000-ft failure and compare against the fixed transferred-drag control on identical conditions. Require a material reserved-row gain, preserved clean speed and existing source-climb regressions, and sensitivity to mass/installed propeller assumptions. All new rows are already exposed, not blind evidence. Keep the Spitfire boost-source blocker separate. No additional aircraft, Atlas work, broad data collection or turn/stall accuracy claims.

Acceptance: source hashes, exact RPM/BHP state isolation, no observed-rate use in prediction, no unsupported altitude extension, npm run check and hosted browser smoke. Stop after the tested milestone and one PR.

## v3.2 completed: high-altitude validation and overall progress

The fixed model underpredicts the new Spitfire 34000-ft observation by 261.8 ft/min. The 32000-ft row remains diagnostic-only pending scan verification; higher unsupported observations are blocked. Original P47 scans establish different climb and speed/power specimens. Strict matching rejects this transfer while earlier engineering scenarios remain reproducible and qualified. See V32_HIGH_ALTITUDE_VALIDATION.md and OVERALL_PROGRESS_PRE_PR1_TO_NOW.md.

## Next cohesive milestone: resolve high-altitude power inputs

Verify Spitfire BS.543 Table II 32000-ft boost against original pixels, and establish source-matched P47 climb engine/propeller RPM before testing a power-law replacement. Prioritize these missing conditions rather than more unrelated observations. Use the new 34000-ft residual as an exposed engineering check, not an unseen holdout. Do not refit until inputs support a fair comparison.

Acceptance: source-matched identities, rating/gear, actual or explicitly qualified mass, airspeed and cooling state; before/after residuals and unresolved input gaps; no invented source interpolation; npm run check and the conditioned-climb browser smoke. No Atlas work, new aircraft or unsupported turn/stall claims.
