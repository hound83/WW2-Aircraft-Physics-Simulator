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
