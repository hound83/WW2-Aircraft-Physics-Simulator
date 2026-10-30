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

## Propeller milestone and v2.6.0 scope

No inspected source establishes a target-installed K-6523A-24 efficiency surface. The official NACA 43-12105 OCR has an ambiguous blade-prefix character and concerns a different specimen/engine; no original-pixel verification or numerical eta transfer is claimed. TK589 shares a blade drawing but differs in installation/loading/cooling. Existing N/M use other geometry, Cp-floor clamping and incomplete Mach applicability; D retains an assumed global loss fraction. Lower excluded Figure 5 residuals are insufficient evidence, especially while reanchored climb results worsen. C remains heuristic. The new release label is not new historical validation. Browser interaction tests remain unrun.

## Source-chart mode

The new API exposes an optional exact-node climb diagnostic. It holds chart-assigned BHP constant across the speed grid; actual climb TAS, instantaneous mass and shaft torque remain unknown. Source metadata are input assertions, not automatic document authentication; the report separately checks retained scan hashes. Reading bounds are extraction choices, not historical uncertainty. No interpolation/high-blower extension or interactive UI selector is supplied. This improves diagnostic coverage, not established accuracy; the default model and known failures remain unchanged.

## v2.8 working approximation

P is an empirical joint engineering fit, using already-exposed observations. Its source speed anchors, Figure 5 power rows and selected climb rows participate in calibration. Reserved rows were seen during development and acceptance. Near-zero Mustang residuals do not imply near-zero prediction uncertainty.

Effective e and aggregate open-configuration CD0 can absorb shaft-power, propeller, cooling and exhaust errors. Spitfire e=0.60 lies at the search boundary; Bf109 has no climb observations in this fit. Do not transfer fitted drag to validated turn claims. P47 reserved climb error is 84.7 ft/min versus 70.5 for the prior conditional experiment. Historical mass, climb TAS, source reading and engine installation remain qualified. See V28_RESULTS.md.

The UI uses P; direct API callers must request it explicitly. The e slider at 0.78 uses the aircraft-specific fitted e and reanchors the scenario. P cooling/configuration loss applies only when explicit source-climb state or a documented open climb observation is requested. Interactive browser tests have not been run for v2.8.

## v2.9 robustness limits

Existing-data split checks and graph-reading scenarios do not certify historical accuracy. The 27 paired Mustang scenarios use three assumed masses (9135/9335/9535 lb) and independent lower/midpoint/upper chart-power readings at two ratings. They are a finite scenario set, not probability distributions or validated uncertainty bounds. The smallest winning margin is modest in the light/high-power corner; 27/27 is not a guarantee outside the tested set. Nominal residuals near 9 ft/min under the engine proxy become roughly 20–293 ft/min under these chart-power/weight choices.

The original Spitfire e=0.60 grid boundary was coarse: a finer original-split fit favors 0.65, while alternate splits favor 0.70. Neither value is measured wing efficiency. Eight fixed candidate models were tested against documented cross-condition limits; none qualified for replacement. This is not exhaustive physical-model optimization. v2.9 retains v2.8 predictions, and v3.0 historical stall/turn and independent pairwise discrimination remain unresolved.

## v3 release-candidate scope

Calculation coverage is not a validated flight envelope. Engine-input intervals include documented proxies and assumptions; the propeller map remains an empirical working law. Numerical speed/altitude limits do not certify physical accuracy. Source speed checkpoints are discrete and already exposed.

Pairwise differences are fixed-speed specific-excess-power scenarios using native reference masses/selected ratings; the shared weight percentage is not an equal-combat-load policy. They are not measured historical climb-rate comparisons. Modified configurations, unsupported inputs, below-assumed-stall states and mixed simulator/Greg states cannot generate a qualified pairwise value. Turn/stall and 5:1 historical accuracy remain unresolved.

The five Mustang chart-power ranges retain the fitted P calibration and their own assumed masses; they do not follow e, weight or profile sliders and do not predict the current fixed-speed state. Graph-reading brackets are not confidence intervals. Headless Chromium smoke is a targeted interaction check, not exhaustive UI or cross-browser testing.

The local Windows Edge CDP automation timed out while changing altitude and did not complete. The same smoke completed all ten interactions in hosted Chrome CI with no JavaScript exceptions. Edge compatibility is not certified by that Chrome result.
