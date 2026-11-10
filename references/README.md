# Research and imported evidence

**New 2026-11-10 four-track deepening:** The [multi-axis original-source audit](../docs/research/WW2_FIGHTERS_MULTIAXIS_PRIMARY_SOURCE_DEEPENING_2026-11-10.md) integrates 200 additional *source* observations from original P-47B six-propeller, P-40F five-propeller, F4U-4, F6F-3, P-38, Spitfire IX, P-51B-15, Bf109 and Fw190 reports, plus compact source-level quality reviews and independently cross-referenced secondary leads. The two auto-ingested, semantically versioned files are [propulsion trials](research/ww2_multiaxis_propulsion_trials_2026-11-10.json) and [low-speed and turn/calibration](research/ww2_low_speed_turn_calibration_2026-11-10.json). Catalog: **955 observations, 208 stall rows, 163 sources, 26 source-dependency groups and 11 chart reviews**. No automatic physics fit or unjustified CAS upgrade. The earlier four-track pack was patched to v1.0.1 to correct original serial and conflicting figure-altitude metadata.

The [four-track original stall follow-up](../docs/research/WW2_STALL_FOUR_TRACK_FOLLOWUP_2026-11-10.md) adds the compact, automatically ingested [`research/stall_four_track_followup_2026-11-10.json`](research/stall_four_track_followup_2026-11-10.json) with original NACA Spitfire VA stall+CLmax, P-47D-30 trial weight/turn source locators, F6F-3 fuel-adjusted CN bands, two low-speed calibration chart audits and cross-pack source lineage. These observations are **not automatic model fits**; same-document repeats do not count as independent tests.

The [stall trace replay](../docs/research/STALL_TEST_REPLAY.md) indexes [four P-47D-30 scan windows](p47d30-stall-replay.json), the companion airspeed instrumentation report and the corresponding validation scenarios.

The [Fw 190/783 graph extraction](fw190a4-783.json) retains digitized speed, climb and boost, their roles and reading tolerances, and the engine and propeller references.

The [operational climb ledger](operational-climb.json) and [aircraft intake ledger](aircraft-intake.json) capture rating limits, modelling assumptions and original Fw 190 candidate chart links.

The [climb band source ledger](climb-band-evidence.json) indexes the published times and alternate trials used in the [20,000–30,000 ft comparison](../docs/CLIMB_BAND_COMPARISON.md). It reuses the existing P-47B scans and BS.543 transcript.

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

The active per-aircraft audits and `stall-calibration.json` are summarized in [the consolidated review](../docs/FOUR_AIRCRAFT_STALL_REVIEW.md). Generated `validation/current/stall-readiness.json` retains every observation and independent blocker, including the external P-47D record. Source text inspection, original scan verification, catalog discovery and simulator values remain separate evidence levels.

`performance-evidence.json` records source-condition and dependence metadata for the active speed/climb checkpoints. The reporting gate reads aircraft data without replacing it, rejects incompatible conditions, and writes per-point residuals/exclusions to `validation/current/performance-validation.json`. No new independent observations or calibrated uncertainty bounds are implied.

`climb-power-cooling-audit.json` records original Fig.6/7 inspection paths/checksums, unchanged reading limits, candidate access failures and the evidence still needed to identify a correction. Generated inverse budgets are diagnostic explanations, not new measured cooling or propeller data.


## November 2026 archival comparisons

- [Full source audit](../docs/WW2_Three_Comparisons_Primary_Source_Audit_2026-11-06.md) and [active source register](archival-comparisons-2026-11-06.json) record condition details, source dependence and checksums for the inspected scans.
- Mosquito B Mk IX LR495: [A&AEE/767,h 4th Part](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495.pdf) and [8th Part](https://www.wwiiaircraftperformance.com/org/mosquito/mosquito_files/lr495-b.pdf). Both reports concern the same airframe. The 1943 baseline carries internal bombs. Use Part 8's related-report list to locate cooling Parts 3 and 5 and climb Part 6.
- Focke-Wulf: [W.Nr. 783 report 5](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_783_Nr5.pdf) is a clean special-rating run. [W.Nr. 619 report 2](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_619_Nr2.pdf) and [report 3](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_619_Nr3.pdf) are separate stores trials. The active [stores register](../aircraft/stores.json) also links reports 1 and 5.
- [Wright Field P-38G-1 report FS-M-19-1538-A](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf) gives the clean reference. Power is chart-derived per engine. The [P-38G transcription](p38g-42-12687.json) includes six level speeds, eight climb rows, source conditions, fit/check roles and installation references.
- Mustang Figure 5 already exists in the frozen import. The audit links the Wright Field report, A&AEE TK589 and related NACA sources. The primary Spitfire Tables II/V survive here as a historical transcription; an original table scan remains outstanding.

The wider fighter evidence from the Smithsonian NASM and Bundesarchiv is documented in [the four-benchmark source audit](../docs/research/FOUR_BENCHMARK_FIGHTERS_PRIMARY_SOURCE_AUDIT_2026-11-06.md) and [the November archive-expansion report](../docs/research/WW2_FIGHTER_ARCHIVE_EXPANSION_2026-11-06.md). The [multi-aircraft archive source register](archive_fighter_source_register.csv) tracks scan-versus-catalogue verification, exact archive locators and further fighter-family leads. These are research references, not accepted new flight-model measurements.

- [Mustang maneuver-power evidence](p51-maneuver-power.json) records the Figure 6 climb readings paired with existing Figure 7 power brackets and indexes the separate NAA, Eglin and Wright Field reports.

- [Mustang maneuver lift readings](p51-turn-lift-tn1044.json) index the preserved original TN1044 Figure 6 and the explicit application bounds. [Book, Greg and simulation comparisons](../docs/TURN_STALL_CORRECTION.md)
