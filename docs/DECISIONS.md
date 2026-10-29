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
