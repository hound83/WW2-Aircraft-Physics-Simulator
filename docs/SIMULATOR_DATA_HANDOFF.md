# Simulator data handoff

**Fighter Sim Inputs v1.2.0**, dated **11 November 2026**, is the current pack. It covers 13 aircraft variants. The JSON's `version` field identifies the pack on each branch. [Canonical data pack](../references/analysis/fighter-sim-inputs-v1.json) · [Coverage and data contract](research/WW2_FIGHTER_SIM_INPUTS_V1.md)

| File in the build | Use |
| --- | --- |
| `dist/fighter-sim-inputs.json` | Reviewed cases, preferred values, original observation IDs, GOLD and GOLD* agreement, and curve styles and bounds |
| `dist/fighter-propeller-efficiency.json` | Original efficiency series, conditional flight replays and the seven-aircraft sensitivity sweep |
| `dist/research-catalog.json` | Original observations, conditions, source links and report lineage |
| `dist/fighter-evidence-curves.html` | Standalone evidence viewer for the full research roster |

A local build produces the three JSON files. The **physics-validation** artifact from a successful `main` run also includes the standalone viewer. [Physics regression builds](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/regression.yml)

## Suggested aircraft

The Normal / Combat benchmark currently has seven modeled aircraft. They are the Bf 109 F-4, Fw 190 A-4, Spitfire LF Mk IX, P-47B, P-51B, P-38G and F4U-4. The six candidates below have research data available for a future flight profile. [Current benchmark profiles](../references/benchmark-operating-profiles.json)

| Candidate and reference aircraft | Primary | With calculations | Best-supported starting point and remaining data gap |
| --- | ---: | ---: | --- |
| **Bf 109 G-2, MT-215 / WNr 14783** | **65%** | **69%** | **Suggested first addition.** The Finnish level-speed and climb trials give a starting point. Installed DB 605 A power by altitude and actual run loading are the most useful leads. |
| **F6F-3, BuAer 04776** | **79%** | **82%** | **Strongest remaining candidate by coverage.** NACA provides detailed low-speed and lift evidence. The correction and mass at stall need clarification, alongside configuration-matched power and performance. |
| Fw 190 D-9, WNr 210002 | 61% | 65% | Original speed and climb records cover distinct dry and MW 50 cases. Installed power and clean low-speed data would help a German follow-up. |
| P-47D-30, 43-3441 | 64% | 66% | Original NACA maneuver and stall traces give a starting point. The recorded airspeed channel and configuration-matched speed, climb and propulsion data are open. |
| P-40F, 41-13635 | 49% | 53% | Original propeller comparisons give several installations to choose from. A clean stall point with corrected airspeed and actual test mass would strengthen the dossier. |
| Ki-84-I, T-2 302 | 50% | 52% | Captured-aircraft handling and documented ratings are available. Measured speed and climb with known engine settings and loading would move this candidate forward. |

Coverage measures available evidence for the research dossier. The source conditions and supported metrics give a better guide to the initial comparison range. [Full coverage table](research/WW2_FIGHTER_SIM_INPUTS_V1.md#coverage-by-aircraft) · [Variant dossiers and retrieval targets](research/WW2_THIRTEEN_FIGHTER_DATA_2026-11-11.md)

## Notes for Simulator Work

- The propeller study could support a paired replay of P-47B measured shaft power and open-cooling drag, a high-blower check for the F4U-4, and a part-power chart and drag check for the P-38G. The source brackets are scoped to each test condition. The fleet sweep gives separately labeled efficiency scenarios for graph comparisons. [Propeller-efficiency findings](research/WW2_PROPELLER_EFFICIENCY_2026-11-11.md)

- An initial G-2 comparison could focus on level TAS and climb. MT-215 flew at about 2,540 rpm actual, with 1.30–1.32 ata on the documented level-speed branch below full-throttle height. The original Finnish graph covers upper climb from 5 to 10 km. The pack identifies service rating limits, the WNF standardized speed runs and the Soviet gun-pod test as separate evidence. [Finnish trial and climb chart](research/WW2_FIGHTER_CALCULATED_EVIDENCE_2026-11-11.md#findings-that-affect-how-the-data-should-be-used) · [G-2 rating and configuration records](research/WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md#bf-109-g-2)
- The pack's accepted cases carry preferred values, conditions, source grades, original observation IDs and uncertainty. Connecting a new profile to its research ID would bring its source-agreement records into the comparison. The existing references describe profile intake and the graph conventions. [Aircraft intake](../references/aircraft-intake.json) · [Data contract](research/WW2_FIGHTER_SIM_INPUTS_V1.md#simulator-handoff)
