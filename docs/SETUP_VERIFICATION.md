# Setup verification

## Imported baseline

The original handover contained 378 files. Of these, 367 unmodified files are tracked under `references/import/`, with SHA256 checks passing. Nine nested ZIPs and two PDF scans over 10 MiB are excluded explicitly; the manifest records their original paths, byte lengths, hashes and original-source links where identified.

Original Greg workbook/reference material, the source/evidence registers, earlier model snapshots and negative tests are retained.

## Reproducibility

- Untouched original source: 30/30 Node regression scripts pass.
- Reorganized active source: those same 30 scripts pass after path changes.
- Added current standalone engine/data embedding and JavaScript syntax check: pass.
- Complete repository suite: 31/31 scripts pass.
- Frozen baseline generated from original modules versus active diagnostics: 3,628 numerical values compared; zero changed, missing or added.
- Shared `physics.js` and `cases.json` were copied without equation, coefficient or evidence changes.
- Full local Git tree equals the published import tree.
- GitHub-hosted Node 22 regression workflow succeeded for the main import commit.

These are reproducibility checks. Historical stall/CLmax and 5:1 turn-comparison validation remain unresolved. The imported OCR discrepancy and Mustang climb deficit remain visible.

## Workflow

The project now has a single check command, standalone build, automated CI, versioned validation output, decisions, known limitations, next steps and agent instructions including adaptive reasoning preferences. The baseline branch is `baseline/v2.5-import`.

No browser interaction validation, aerodynamic recalibration, Atlas changes or stable v3.0 release were performed during setup.
