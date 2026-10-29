# Handover verification — 2026-10-29

- Original full v2.5 handover: **ZIP CRC checked and extracted**.
- Separate new v3 stall-weight gate: **ZIP CRC checked and extracted**.
- Model source **30/30 inherited Node numerical/static test scripts passed** in the packaged source directory (see `05_VERIFIED_TEST_LOG_v2_5_BASELINE.txt` for command/output). This is *baseline verification*, not a validation of historical 5:1 accuracy or a new v3 solver.
- Stall gate `build_audit.py` succeeded, producing **6 evidence records and 12 hypothetical sensitivity cases**.
- Primary original NACA 1944 P-47C scan, user-supplied charts and full Greg records are copied into this archive, with hashes in the manifest.
- The final ZIP's CRC test was also run.
- **Not tested:** live-browser UI smoke test; the original linked NACA report PDFs not included physically; verified low-speed airspeed calibrations; full independent turning 5:1 acceptance.
