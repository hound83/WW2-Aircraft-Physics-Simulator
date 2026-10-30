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
