# European Air War — complete v3.0 STARTER handover

**Prepared:** 2026-10-29. **State:** v2.5 working four-aircraft engine + v3 stall/weight evidence gate; **v3.0 engine not yet built**.

## Read order

1. **`00_COPY_PASTE_THIS_TO_NEW_CHAT.md`** — complete continuation prompt.
2. **`V3_PLAN_AND_ACCEPTANCE.md`** — exact objective, five steps and 5:1 accuracy rule.
3. **`03_CURRENT_STATE_AND_KNOWN_GAPS.md`** — established results, evidence gaps, and errors not to hide.
4. **`02_V3_STALL_WEIGHT_AUDIT/STALL_WEIGHT_GATE_v3_prework.md`**, then `stall_evidence_register.csv` — newest direct stall/weight finding; corrected calibration NOT yet obtained.
5. **`01_COMPLETE_V2_5_BASELINE/00_READ_ME_FIRST.md`** and **`01_COMPLETE_V2_5_BASELINE/07_DECISIONS_AND_HANDOVER/ACCEPTED_MODEL_DECISIONS.md`** — prior constraints and original full research framework.
6. **`01_COMPLETE_V2_5_BASELINE/03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/`** — the latest working source, tests, JSONs, and v2.5 HTML, despite the inherited directory name.
7. **`03_PRIMARY_SOURCE_PDF/NACA_ACR_L4L07_Vogeley_1944_P47C_Curtiss714_propeller.pdf`** — original flight-test scan, tables and graphs. Compare with earlier v2.5 OCR-derived numbers.

## Quick pointers

- **Runnable offline interface:** `01_COMPLETE_V2_5_BASELINE/03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/Universal_Four_Aircraft_Model_v2.5.html`.
- **Core code:** `.../physics.js`, `cases.json`; regression scripts `test_*.cjs`, `test*.mjs` in the same directory.
- **Greg:** `01_COMPLETE_V2_5_BASELINE/01_GREG_ORIGINAL/` contains original unmodified archive and expanded workbook/reference material; `02_GREG_DIAGNOSTIC/` for diagnostic calculation.
- **Primary sources / NACA index:** `01_COMPLETE_V2_5_BASELINE/06_SOURCE_AND_SCIENTIFIC_EVIDENCE/`; many report links/extracted text, but do NOT assume all linked originals are physically bundled.
- **Stall gate:** `02_V3_STALL_WEIGHT_AUDIT` includes frozen source register, audit code and illustrative (NOT measured) low-speed correction sensitivity.
- **User-provided images:** `04_ADDITIONAL_USER_SUPPLIED_FIGURES/` for the P-51B chart, P-47 manual and primary table scans. Related Greg charts remain inside v2.5 baseline.
- **All files:** `FILE_SHA256_MANIFEST.csv` generated after assembly; read `VERIFICATION.md` for verification scope.

## What is / isn't claimed

This zip is **complete for project continuity**: working model plus original Greg input, latest audit, original NACA P-47C scan and provided chart images. It does **not** contain verified low-speed CAS/EAS calibrations for the four aircraft, a validated CLmax or a new v3 physics engine; do not claim otherwise. Historical and simulator data are different evidentiary tiers.

The Atlas GitHub site must NOT be edited as part of building v3 without user request.
