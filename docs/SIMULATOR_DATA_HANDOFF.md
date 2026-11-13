# Simulator data handoff

**Fighter Sim Inputs v1.11.0** adds 21 records and coverage for six new priority dossiers alongside the 13 existing reference variants. [All 19 scores and the eight-aircraft crosswalk](research/WW2_PRIORITY_COMPARATIVE_COVERAGE_2026-11-13.md). The JSON's `version` field identifies the pack on each branch. [Canonical data pack](../references/analysis/fighter-sim-inputs-v1.json) · [Coverage and data contract](research/WW2_FIGHTER_SIM_INPUTS_V1.md) · [Priority-aircraft import](research/WW2_PRIORITY_AIRCRAFT_INPUTS_V1_10.md)

[Data milestones and original-source research priorities](research/WW2_FIGHTER_DATA_ROADMAP.md)

| File in the build | Use |
| --- | --- |
| `dist/fighter-sim-inputs.json` | Reviewed priority-aircraft, PDF and batch inputs, matched climbs, fleet stall reference, original observation IDs, GOLD and GOLD* agreement, and curve styles and bounds |
| `dist/fighter-propeller-efficiency.json` | Propeller and installation references for all 13 variants, original efficiency series, conditional flight replays and the seven-aircraft sensitivity sweep |
| `dist/fighter-greg-drag-models.json` | Greg-method drag polars for all 19 dossiers, with source conditions, assumptions, sensitivity and check residuals |
| `dist/research-catalog.json` | Original observations, conditions, source links and report lineage |
| `dist/fighter-evidence-curves.html` | Standalone evidence viewer for the full research roster |

A local build produces these JSON files. See the [Greg drag reference and usage notes](research/WW2_GREG_DRAG_MODELS_2026-11-13.md) for the calculation, conditions and source quality. The **physics-validation** artifact from a successful `main` run also includes the standalone viewer. [Physics regression builds](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/regression.yml)

## Suggested aircraft

The Normal / Combat benchmark currently has seven modeled aircraft. They are the Bf 109 F-4, Fw 190 A-4, Spitfire LF Mk IX, P-47B, P-51B, P-38G and F4U-4. The candidates below have research data available for future flight profiles. The coverage columns refer to the scored research roster. [Current benchmark profiles](../references/benchmark-operating-profiles.json)

| Candidate and reference aircraft | Primary | With calculations | Best-supported starting point and remaining data gap |
| --- | ---: | ---: | --- |
| **Bf 109 G-2, MT-215 / WNr 14783** | **65%** | **69%** | **Suggested first addition.** The Finnish level-speed and climb trials give a starting point. Installed DB 605 A power by altitude and actual run loading are the most useful leads. |
| P-51D-15-NA 44-15342 | 48% | 51% | Prepare in parallel. Wright Field provides three level ratings, WEP climb and stores runs. The D/K manual has weight-indexed IAS. Seek matched near-stall correction and propeller constraints. |
| **F6F-3, BuAer 04776** | **79%** | **82%** | **Strongest remaining candidate by coverage.** NACA provides detailed low-speed and lift evidence. The correction and mass at stall need clarification, alongside configuration-matched power and performance. |
| Fw 190 D-9, WNr 210002 | 61% | 65% | Original speed and climb records cover distinct dry and MW 50 cases. Installed power and clean low-speed data would help a German follow-up. |
| P-47D-30, 43-3441 | 66% | 68% | The block handbook supplies operating settings and climb schedules. NACA traces give maneuver and stall references for 43-3441. The installed power curve and exact low-speed calibration are open. |
| P-40F, 41-13635 | 49% | 53% | Original propeller comparisons give several installations to choose from. A clean stall point with corrected airspeed and actual test mass would strengthen the dossier. |
| Ki-84-I, T-2 302 | 50% | 52% | Captured-aircraft handling and documented ratings are available. Measured speed and climb with known engine settings and loading would move this candidate forward. |

Coverage measures available evidence for the research dossier. The source conditions and supported metrics give a better guide to the initial comparison range. [Full coverage table](research/WW2_FIGHTER_SIM_INPUTS_V1.md#coverage-by-aircraft) · [Variant dossiers and retrieval targets](research/WW2_THIRTEEN_FIGHTER_DATA_2026-11-11.md)

## Notes for Simulator Work

- Read `pdf_reference.series` for the 552 reviewed PDF records. Use the roster link, application and source conditions to select a comparison. [PDF input release](research/WW2_PDF_INPUT_DATA_V1_9.md)

- Read `batch_reference.series` for 96 new source-linked records. Twelve apply to exact roster specimens. Related cases carry their own aircraft, conditions and use. [Batch dispositions and coverage matrix](research/WW2_GROK_BATCH_INPUT_REVIEW_2026-11-12.md)

- Read `climb_reference.cases` for the two matched climb input sets. WNr 783 includes paired cooling rates and a source timing trace. Its modeled TAS is an explicitly calculated scenario. The P-38G B.4 input includes reported TAS and time, chart-assigned BHP per engine and the altitude limits. B.1 remains a separate level-flight case. [Climb handoff and scorecard](research/WW2_MATCHED_CLIMB_INPUTS_2026-11-12.md)

- Read `stall_reference.variants[].clean_stall` for the 13 selected clean-stall references. Two use reported CAS, eight use source-indicated speeds and three use documented EAS calculations. The speed basis, evidence grade, conditions, observation IDs and assumptions travel with each row. The P-38G carries both 98 mph IAS and 112 mph CAS for the 42-12690 test. [Stall data and source limits](research/WW2_FLEET_STALL_INPUTS_2026-11-12.md)

- The v1.5 companion's `fleet_reference` gives each research variant its original reports and the conditions for using the data. The Fw 190 A-4 has separate combat-power curves for both intakes. The P-38G high-power comparison, Mustang and Spitfire high-blower readings, and P-40F propeller trials are ready for source-conditioned comparisons. [Fleet propeller reference and report index](research/WW2_FLEET_PROPELLER_INPUTS_2026-11-12.md)

- The v1.4 engine reference is in `engine_reference` in `fighter-sim-inputs.json`. Use the G-2 DB 605 A anchors at **1.30 ata / 2,600 rpm** and the separate BMW 801 D low- and high-gear anchors. WNr 783 has distinct internal and external intake cases. The original 622 km/h DB 601 E reading belongs to the G-1 installation comparison. [Fighter input reference](research/WW2_FIGHTER_INPUT_REFERENCE_2026-11-12.md)

- The v1.3 propeller reference uses **80%** as the starting value. The tested applications are F4U-4 clean level speed, the low-blower Mustang and Spitfire conditions, and the P-47B military-speed branch with a change to **76%** at higher tip Mach. For P-47B military climb, the **76%** reference pairs with one **0.136 m²** open-cooling drag area. The P-38G part-power replay uses the two original speed and power tables. [Reference numbers and checked conditions](research/WW2_PROPELLER_REFERENCE_VALUES_2026-11-12.md)

- An initial G-2 comparison could focus on level TAS and climb. MT-215 flew at about 2,540 rpm actual, with 1.30–1.32 ata on the documented level-speed branch below full-throttle height. The original Finnish graph covers upper climb from 5 to 10 km. The pack identifies service rating limits, the WNF standardized speed runs and the Soviet gun-pod test as separate evidence. [Finnish trial and climb chart](research/WW2_FIGHTER_CALCULATED_EVIDENCE_2026-11-11.md#findings-that-affect-how-the-data-should-be-used) · [G-2 rating and configuration records](research/WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md#bf-109-g-2)
- The pack's accepted cases carry preferred values, conditions, source grades, original observation IDs and uncertainty. Connecting a new profile to its research ID would bring its source-agreement records into the comparison. The existing references describe profile intake and the graph conventions. [Aircraft intake](../references/aircraft-intake.json) · [Data contract](research/WW2_FIGHTER_SIM_INPUTS_V1.md#simulator-handoff)
