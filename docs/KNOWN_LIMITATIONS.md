# Known limitations

- **v3.0 is not built or historically validated.** Passing tests preserve behavior and evidence guardrails.
- No verified, aircraft-matched low-speed IAS-to-CAS correction currently supports a precise clean historical CLmax for any of the four benchmark aircraft. Sensitivity offsets are hypothetical, not measurements.
- P-51B at 2,200 ft: candidate C predicts about 3,401 and 3,979 ft/min versus reported 3,820 and 4,380, a deficit of approximately 419 and 401 ft/min. Reported climb airspeed is missing; do not silently treat optimized model speed as matched.
- Bf 109 F-4's optional/default UI scenario is conditioned on IL-2 turn specifications. It is not an independently measured historical polar.
- P-47C source run 20-1 is still 0.799 in the frozen OCR fixture; the newer handover reports 0.779 from the actual scan. The source audit and its passing coefficient-consistency assertion do not verify that OCR. Resolve the complete Table I row before changing the active reference.
- Candidate C does not reproduce the P-47C measured power-loading efficiency loss. NACA chart transfers are research options with blade-family and Cp-domain limits.
- P-47 2,600 hp remains a controlled case, not a verified P-47B rating.
- The 5:1 aircraft discrimination target is unresolved until matched historical observations and a defensible differential-error budget exist.
- The build has static JavaScript/data checks. Preserved Playwright browser tests have not been rerun in this environment.
- Two large scans and nine nested archives are excluded from Git. The per-file manifest lists their exact identity and recovery paths. Links are preserved evidence pointers; their live availability was not rechecked during setup.

See [the full inherited limitations](KNOWN_LIMITATIONS_LEGACY.md) and [stall gate](STALL_WEIGHT_GATE.md).

## Stall milestone limitations (2026-10-30)

The new source gate is executable, but no historical record passes all requirements. Verification flags are reviewed metadata, not automatic scan authentication. The +/-15% CLmax/EAS endpoint sweep is inherited exploratory sensitivity, not a confidence interval or a calibrated physical bound. Powered/accelerated transfer, stall-domain instrument/position error and observational uncertainty remain open. Comparison weights/default ratings are research states, not uniform combat loads. See STALL_SOURCE_AUDIT.md for exact inspection/access limits and STALL_CALIBRATION_RESULTS.md for measured model impact.

## P-51 targeted calibration audit

No matched near-stall correction was established within the inspected Wright Field and NACA material. The target stall table's instrument-error convention and observed pressure channel remain unknown. Earlier P-51B serials and modified NACA boom installations cannot supply that missing provenance. NACA readability/pressure-error statements do not bound target stall error. See P51_LOW_SPEED_CALIBRATION_AUDIT.md. No active P-51 CLmax or turn ranking was recalibrated.

## P-47B primary-source update

The earlier manual-only evidence description is superseded: the original 41-5902 scan records a clean 105 mph indicated power-off stall. However, nominal report weights differ by 5 lb, instantaneous stall weight/altitude and instrument convention are unstated, and calibration starts at 170 mph. This new observation does not establish stall EAS or measured CLmax. See P47B_STALL_WEIGHT_AUDIT.md. Model weight and coefficient remain unchanged.

## Bf 109 F-4 evidence limits

The original manual/test candidates remain unverified at the stall-page level; catalogs and attachment filenames do not establish F-4 applicability. No matched historical stall weight, slat state or near-stall correction was obtained. Placeholder specimen matches and undocumented F-4 slat states now fail the executable gate. See BF109F4_STALL_AUDIT.md.

## Consolidated review and Spitfire correction

The 90/93 mph pilot-note rows belong to clipped-wing reference conditions, with a 45-gallon tank in the heavier case. They are not clean full-span BS.543 observations. The inspected edition is postwar (September 1946), and PDF text inspection does not establish scan verification. The manual correction table begins at 120 mph IAS; BF.274 correction adoption in the target performance report supplies no demonstrated stall-domain coverage. All four historical stall calibrations and all six 5:1 comparisons remain unresolved. See FOUR_AIRCRAFT_STALL_REVIEW.md and SPITFIRE_IX_STALL_AUDIT.md.

## Performance validation eligibility

All 69 active performance records are explicit diagnostics or missing-evidence coverage. No current record passes every strict condition requirement; no independent validation aggregate or pairwise 5:1 pass is established. The Bf 109 climb-rate observation is absent, P-51 speed mass follows a sparsely digitized normalization curve without adopted point masses and climb TAS is unknown, P-47 per-point mass/cooling losses are unresolved, and Spitfire speed RPM differs by 5 from the nominal model while climb cooling is open. These exclusions do not prove large physics errors. Diagnostic residuals, especially Mustang climb deficits, remain visible. Original report transcriptions are not freshly verified scans, and prior model development has already seen the checkpoints. See PERFORMANCE_VALIDATION.md.

## Climb power/cooling attribution

The new inverse budgets assume the existing shaft/drag/prop model and chosen weight/TAS. They do not identify a physical correction. Positive cooling drag cannot supply missing power; negative equivalent net drag is not measured radiator thrust. The 0.83 C-formula amplitude is a code property, not a real propeller bound. Mass-only roots require roughly 680-790 lb below reported Mustang takeoff mass but do not reconstruct fuel burn. Fig.6/7 pixels were inspected without digitizing uncertain BHP/shutter coordinates. Heat recovery/exhaust and installed power errors remain possible, unquantified causes. No default numerical prediction changed.

## Mustang original-chart reconstruction

The follow-up to the earlier diagnosis retains Figure 4 and sparse native-pixel BHP/weight reading brackets. Manual boxes, approximate affine axes and a 3-pixel allowance are auditable extraction choices, not independently validated uncertainty bounds. The curve is a level-speed normalization condition; actual climb weight/TAS remain missing. Only selected low-blower power branches are digitized. Higher-blower/61-inHg intersections and shutter-force calibration remain absent. Joint C-model power/weight grids retain about 322/268 ft/min shortfalls; finite-grid ranges do not bound all continuous or historical states. The 4,000-ft power mismatch and missing source-bounded proxy beyond 7,400 ft require explicit treatment before generalizing the climb power model.
