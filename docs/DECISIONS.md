# Current decisions

## 2026-10-29: GitHub-first setup

1. Use a separate physics repository, `hound83/WW2-Aircraft-Physics-Simulator`. The Atlas website remains separate.
2. Import v2.5 as a working baseline, not a completed v3.0 model. Preserve original bytes under `references/import/`; active imports use ordinary repository paths.
3. Keep the existing single engine in `src/physics.js` and input records in `aircraft/`. Move tests and diagnostics by changing paths only.
4. Keep original Greg workbook/reference material and all benchmark assertions. Store the import manifest and original SHA256 manifest.
5. Exclude duplicate ZIP archives and scans over 10 MiB from Git. Record source links, checksums and archive recovery information. Do not add a large-file service until it is needed.
6. Preserve the standalone v2.5 page. The new build command embeds active engine/data/helper modules into that unchanged UI template; it is not a v3 UI redesign.
7. Keep a frozen numerical baseline and regenerate current results with validation. Update scientific decisions and next steps with each accepted milestone.
8. Use feature branches for physics changes and stable milestone tags/releases only after documented acceptance.
9. User's GitHub-first workflow supersedes older handover instructions requesting a new ZIP after every increment.

## Existing physics decisions

The full inherited record is [ACCEPTED_MODEL_DECISIONS_LEGACY.md](ACCEPTED_MODEL_DECISIONS_LEGACY.md). Its scientific constraints remain applicable. The four-aircraft scope and v3 evidence gates are specified in [V3_PLAN_AND_ACCEPTANCE.md](V3_PLAN_AND_ACCEPTANCE.md).

No aerodynamic coefficients or historical evidence values were changed during repository setup.

## 2026-10-30: executable stall evidence gate

- Added variant/specimen identities and a structured source register, including separate P-51 closed/open/powered records and nontransferable P-47D evidence.
- Require matched instantaneous weight, geometry, configuration and near-stall calibrated speed before deriving power-off CLmax. Missing evidence returns null values and explicit blockers.
- The P-47 correction crop covers 170-310 mph IAS; never extrapolate it to 115 mph. P-51 Fig. 1 has no observed 84-86 mph coverage.
- Add an opt-in EAS/weight sensitivity pathway through the existing shared engine, with four-aircraft comparison, finite-grid peaks and unresolved 5:1 pairwise results. Scenario endpoints are assumptions, not historical bounds.
- Preserve default coefficients, frozen import/Greg fixtures and v2.5 output parity. Source-backed numerical recalibration remains blocked. See STALL_SOURCE_AUDIT.md and STALL_CALIBRATION_RESULTS.md.

## 2026-10-30: P-51B instrument installation and correction convention

The targeted P-51 audit did not establish a defensible 84-86 mph correction. Preserve explicit unknown instrument-error treatment/channel in the target records. A calibration must match the pressure installation as well as serial/configuration, and accept the observation's correction convention. Already instrument-corrected IAS requires position-only correction; reject double application. Do not transfer different P-51B installations, NACA pressure-error percentages or instrument readability as target stall uncertainty. Five inspected candidates and their limits are recorded in P51_LOW_SPEED_CALIBRATION_AUDIT.md and references/p51-low-speed-audit.json. Default numerical predictions remain unchanged.

## 2026-10-30: P-47B primary stall and loading audit

The original 41-5902 acceptance scan establishes 105 mph indicated clean power-off, with cowl closed and oil/intercooler neutral. Preserve its 12,565-lb gross-as-tested and separate 12,560-lb loaded statements without promoting either to instantaneous stall weight. Its Kollsman D-1 table includes raw indicated, water-column and calibrated speeds only from 170 mph upward. Add the primary record and correction provenance separately from generic 115 mph manual and 116 mph P-47D figures. Do not extrapolate or change CLmax. The gate reports missing altitude and out-of-range calibration independently. See P47B_STALL_WEIGHT_AUDIT.md and references/p47b-stall-weight-audit.json.

## 2026-10-30: Bf 109 F-4 bounded evidence audit

No original F-4 stall pages were verified. Preserve simulator values separately and retain default coefficients. Reject matching placeholder specimen identities for every aircraft; require documented slat state for F-4 evidence and matching IAS-calibration slat state. These guardrails do not create a historical measurement. See BF109F4_STALL_AUDIT.md.

## 2026-10-30: consolidated four-aircraft evidence review

Correct the inherited Spitfire manual rows: clipped wings, non-rear-view fuselage, and a 45-gallon drop tank in the 7,800 lb case. The available third edition is September 1946. Extracted text was read; original pixels remain unverified. Do not assign model full-span wing area or digitize ambiguous correction columns. The shared gate now matches explicit target configuration fields in observations and IAS calibration. The generated readiness register covers eight target observations plus one nontransferable P-47D reference; no measured historical CLmax or turn-comparison pass follows. Preserve all default numerical behavior.

Batch related work into cohesive end-to-end milestones, as requested by Michael. Routine source/code/test/commit steps within an agreed scope do not need a fresh GO. Consolidate the four stacked PRs into one cumulative main-targeted review; preserve their branches and commits.

## 2026-10-30: matched-condition speed and climb validation

Add a reporting gate and 69-case four-aircraft package without changing physics, fitting new points or rewriting legacy diagnostics. Anchor identity includes altitude, speed, rating and gear; another rating at the anchor altitude is not fitted evidence. All non-anchor legacy points have already been exposed during development, so they are checkpoints rather than newly independent holdouts.

Require compatible specimen, native metric/unit, standard atmosphere, actual or normalized point mass, configuration, rating/gear/RPM and sourced TAS. Optimized climb cannot substitute for missing observed climb TAS. Preserve excluded diagnostic errors and keep matched/independent scores null when no eligible cases exist. Strict Spitfire 2,995 versus nominal 3,000 RPM is an explicit unresolved input difference, not a claimed material error or an invented tolerance. P-51 9,240 lb cruise weight is not its altitude-dependent speed-weight curve.

Keep the P-47 aggregate-loss climb fit separate, and treat both Mustang memos as one dependency group. Pairwise 5:1 requires a comparison loading/rating policy, independent matched cases and validated individual error bounds in the same unit. Sum bounds conservatively; an observed residual exceeding a claimed bound cannot pass. See PERFORMANCE_VALIDATION.md and references/performance-evidence.json.

## 2026-10-30: climb useful-power and cooling diagnosis

At the existing 2,200-ft optimized Mustang states and assumed 9,335 lb, the useful-power deficit is about 114-119 hp. Eta-only, fixed-eta shaft-only, mass-only and net-drag inverse solutions are conditional explanations, not identified causes. Extra positive cooling drag has the wrong sign for this shortfall. P-47 aggregate loss has a compatible drag sign; Spitfire residuals change sign with altitude, so a blanket positive cooling increment cannot reconcile all cases. Preserve the original speed-anchor polar and default solver.

Original Mustang Figures 6 and 7 were visually inspected from the frozen scans; no new BHP/shutter nodes were digitized. No matched climb TAS, instantaneous mass, installed propeller map or independent cooling increment was established. Maintain the 22,400-ft Fig.5 constraints separately with recorded RPM and graph-reading qualifications. New NTRS candidates are catalog-only leads because PDF fetches exceeded tool limits. See CLIMB_POWER_COOLING_DIAGNOSIS.md and references/climb-power-cooling-audit.json.

## 2026-10-30: Mustang chart-state reconstruction

Retain original Figure 4 outside the frozen import. Record native-pixel boxes, hashes, approximate axis mappings and outward reading brackets for five normalization weights and five low-blower BHP states. These brackets describe scan reading, not total historical uncertainty. The speed-normalization curve must not become an instantaneous high-power climb mass. No interpolation through unknown gear/rating transitions or generic power extrapolation.

At 2,200 ft existing chart-power proxies lie within the broad source readings. Conditional joint power/weight grids using the unchanged C efficiency and original polar leave about 322/268 ft/min shortfalls. At 4,000 ft the 75-inHg proxy exceeds the reading; at 8,000/12,000 ft it has no source-bounded prediction. No default coefficient, power node, numerical weight or accuracy score is changed. See P51_CLIMB_STATE_RECONSTRUCTION.md.

## 2026-10-30: installed-propeller audit and research v2.6.0

Retain official L4L18 OCR with hash and ambiguous 6487-24 prefix, separately from scan verification. Same-blade TK589 establishes family context, not an installed eta map. Preserve the 1941 geometry/Cp limits, 1944 generic loss method and 1945 P-47D dependence/transfer limitations. A measured-installation claim requires matching geometry/installation and verified J/Cp/Mach coverage; Cp clamping cannot pass.

Evaluate C/D/N/M through the shared solver with original and candidate-anchor polars. Each candidate anchor uses only the same sea-level speed observation; no climb or Figure 5 points are fitted. D/N/M improve some excluded Figure 5 BHP diagnostics but worsen sampled climb maxima when reanchored. No default replacement is justified. Keep numerical inputs/coefficients unchanged. Version the accumulated increment 2.6.0 and label the built HTML as research; this does not establish v3.0 acceptance or deploy the separate Atlas. Michael explicitly authorized merging the completed cumulative work into current main.

## 2026-10-30: explicit source-chart climb mode, v2.7.0

Add sourceChartClimb to the shared API. Require exact source-node identity/configuration/rating/gear/RPM, explicit reading selection, polar and scenario weight. Reject missing/ambiguous nodes, placeholder specimens, mixed power methods and interpolation. Restrict speed-grid keys so they cannot override physical inputs. Chart-assigned BHP is fixed across sampled TAS as an explicit diagnostic assumption, not a new engine availability law.

Add conditional 8,000/12,000-ft calculations where the old proxy has no engine source; at 4,000 ft the source midpoint decreases climb by about 320 ft/min. This is better input traceability/coverage, not demonstrated historical accuracy. Preserve all existing default numerical values. A progress assessment separates completed source/engineering work from the unresolved scientific goal. Continue the user-authorized tested-version publishing/merge workflow.

## 2026-10-30: v2.8 practical joint calibration

Michael explicitly requested a better approximation using the existing data, without waiting for final physical identification. This supersedes the earlier default-coefficient freeze for the new profile P; it does not turn fitted coefficients into measurements. Use one momentum/loading propeller law with shared retained-power, high-tip-Mach and high-advance-ratio losses, aircraft geometry/RPM, effective aircraft drag fits and nonnegative aggregate open-configuration drag. Preserve actual shaft-power curves, all source observations, CLmax, frozen imports and legacy C behavior.

The application defaults to P; raw API defaults remain C for compatibility. P uses fitted e and recomputes CD0 from the same source speed anchor. The UI e slider scales the fitted value around 0.78 and reanchors its scenario polar. Existing Bf109 simulator/Greg branches remain separately qualified; fitted historical e is not measured turn calibration.

Reproduce the bounded grid, drag-only control, fit/check assignments, weak priors and selected parameters in calibration/v2.8-working-model.json and validation/diagnostics/joint_calibration_v28.cjs. All records were already exposed and the split evolved during development: checks are out of the parameter fit, not blind historical validation. Acceptance requires at least 30% lower two-case Mustang climb MAE; four-aircraft speed check MAE no worse than C plus max(2 mph, 10%); climb check MAE within 50 ft/min of C or, for P47, the stronger prior conditional fit. These are pragmatic regression guardrails, not uncertainty bounds.

Selected fit gives 97.7% lower conditional Mustang climb MAE and better P47 speed. Mustang speed MAE worsens about 1.2 mph, Spitfire climb remains near 103 ft/min, and P47 reserved climb MAE worsens 70.5 to 84.7 versus the prior conditional fit. Spitfire effective e=0.60 is at the search lower boundary. Keep those limitations visible; do not infer measured propeller efficiency, isolated cooling drag, turn accuracy or 5:1 proof.

## 2026-10-30: v2.9 robustness, retain v2.8 calibration

Stress the model with the existing observations rather than collecting more broad data. Repeat the original bounded objective under three explicit fit/check assignments, with an additional Spitfire e range 0.40–0.98 and finer 0.05 steps around the previous boundary. Retain source anchors, shaft-power curves, source observations and frozen fixtures. All data were already exposed; this analysis does not create independent evidence.

Use fixed original-check comparisons and own-split check comparisons. A single fixed replacement must improve P47 original-check climb MAE by at least 10 ft/min, while staying within +0.5 mph speed and +10 ft/min climb MAE of v2.8 for every eligible aircraft on every check assignment. Test split winners and original-split near-optimal families, deduplicate fixed candidates, and preserve all rejected results. None of eight tested candidates passes. This finite search does not prove no better model exists. Keep the v2.8 coefficients in v2.9 rather than silently trading climb for speed.

At 2200 ft P beats C in 27/27 paired chart-power/weight combinations: three masses and independent lower/midpoint/upper reading choices for each rating. P errors span about 20–293 ft/min, so the nominal 9 ft/min is not a general accuracy bound. Higher-altitude chart nodes have no new matched climb observations and retain null residuals. Six Figure 5 points use their recorded RPM and a 27-scenario TAS/BHP/RPM reading grid each. RPM perturbations are assumptions, not source uncertainty.

A finer Spitfire original-split search selects e=0.65 rather than 0.60; extending downward worsens performance. Moving upward trades speed against climb and configuration drag. Do not promote a coefficient merely to move off a boundary. Keep the working calibration identity 2.8.0 separately from application version 2.9.0. Add an expandable explanation in the built UI. Next: v3.0 supported-envelope release candidate.

## 2026-10-31: v3.0.0-rc.1 supported-envelope candidate

Keep the v2.8 solver, coefficient fits and aircraft records. Version the usable application 3.0.0-rc.1, not a stable/certified v3.0 tag. Separate the numerical 100–590 mph TAS scenario window and 0–36089-ft atmosphere from historical evidence. Describe each rating/gear engine interval and its existing interpolation; no new interpolation/extrapolation is introduced. Exact historical speed checkpoints retain anchor versus exposed-check roles.

Use the same options as the main cards in the live coverage panel. Scenario comparisons use equal altitude/TAS, each aircraft reference weight scaled by the shared weight control, and selected ratings. Missing power, below-assumed-stall states, modified configurations and mixed simulator/Greg states produce null pairwise differences. The displayed difference is specific excess power expressed as ft/min, not a matched historical climb-rate differential; historical error and 5:1 status stay null.

Display five exact Mustang chart-power nodes with fixed P settings and explicit 9135/9335/9535-lb scenarios, independent of profile/e/weight sliders. State clearly that the optimized-climb range does not describe the fixed-speed comparison. P51 75-inHg source-chart nodes remain distinct from its engine-law gap. Label old A/B/C and C one-point panels as legacy. Correct the Greg scenario dropdown under P to apply its named Greg polar; retain its nonhistorical status.

Run a dependency-free Chromium smoke via isolated temporary profile and loopback server, with actual browser version, application hash, checks and JavaScript errors recorded separately. Preserve all frozen tests and run npm run check. No Atlas work, new aircraft, historical accuracy certification or stable v3 tag.
