# Research and imported evidence

- `IMPORT_MANIFEST.json`: every original handover file, byte length, SHA256, storage decision and recovery information.
- `import/`: frozen unmodified handover contents, except the explicit exclusions. Preserve these as provenance; active code lives elsewhere.
- `stall_evidence_register.csv`: active copy of the latest stall/weight evidence gate; update with future source-backed findings.
- Original Greg workbook, calculations and charts are under `import/01_COMPLETE_V2_5_BASELINE/01_GREG_ORIGINAL/` and `02_GREG_DIAGNOSTIC/`.
- Curated historical and NACA source registers are under `import/01_COMPLETE_V2_5_BASELINE/06_SOURCE_AND_SCIENTIFIC_EVIDENCE/`.

Large original scans:
- NACA ACR L4L07, Curtiss 714 P-47C propeller: https://ntrs.nasa.gov/citations/19930093302
- NACA ACR 4K02, different propeller-off P-51B drag test: https://ntrs.nasa.gov/citations/19930092458

Those two PDFs remain available in the original handover and local imported archive, but are not duplicated in Git. Preserve their checksums and applicability caveats. Newly downloaded large scans belong in the ignored `references/downloads/` directory.

The handover's OCR/transcriptions and secondary/simulator material are not automatically verified primary measurements. Source links and rights remain with their original authors; no new blanket license is granted for third-party material.
