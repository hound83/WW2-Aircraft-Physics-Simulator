# Simulator development roadmap · 27 November 2026

**M3 delivers one fleet-wide improvement to the aircraft comparison screen and its underlying calculations.** A user selects two of the 14 aircraft and a flight condition. The simulator shows who leads, by how much, and how closely the model reproduces a comparable flight test. The first implementation is climb: the existing 4.17 report already has 75 elapsed-time comparisons across the roster. [Fleet baseline](research/M3_STALL_ACCELERATION_CLIMB.md#417-baseline-for-all-14-aircraft)

## M3 · Next ten simulator development sessions

Eight sessions go to flight behavior and replay, and two to presenting the comparisons. Each pass uses all applicable profiles in one build. The estimates are planning allocations.

| Priority | Sessions | Simulator work | Check from the user's comparison screen |
| --- | ---: | --- | --- |
| **1. Climb between common heights** | **4** | Extend the existing trial replays so a supported aircraft pair can be compared over the same altitude interval. Reuse each trial's weight, rating and climb-speed schedule. Use the resulting errors to test the strongest shared explanation, such as a schedule mismatch or a power or cooling transition. | For each aircraft show seconds between the selected heights. Show the difference between aircraft in the simulation and in the trials. Label interpolation and preserve a single reported interval when finer splits are unavailable. [Fleet timing code](../validation/diagnostics/fleet_source_timing.cjs) |
| **2. Clean stall at the selected weight** | **2** | Apply the existing stall calculation consistently to the selected wing configuration and aircraft loading. Compare against test records at their event weights. Use same-wing scaling only within its supported range and keep clipped wings separate. | Changing weight updates the modeled stall speed. The measured point stays at its test weight and in its reported units. Transferred or uncorrected readings are visibly identified. [Stall calculation and checks](../validation/diagnostics/continuous_stall.cjs) |
| **3. Level acceleration through common speeds** | **2** | Extend the existing timer to replay accepted records across aircraft at their documented altitude and power. Compare elapsed time between the same two speeds, accounting for the reported airspeed basis. Apply the corrected Figure 8 readings in this batch. | Both aircraft can run the same speed interval. Show predicted seconds, measured seconds where available, and an explicit result if either aircraft cannot reach the end speed. Keep separate intervals from a single flight linked. [Replay code](../validation/diagnostics/level_acceleration.cjs) · [Corrected Figure 8 readings](research/M3_STALL_ACCELERATION_CLIMB.md#timed-level-acceleration) |
| **4. Make the size of the difference visible** | **1** | Add the observed gap and model error to the existing comparison view. Reuse the fleet results and existing comparison margins. | The selected pair shows the lead in seconds or speed, the matching test conditions, and whether uncertainty could reverse the ordering. Unsupported conditions show the model prediction with its evidence status. [Comparison logic](../src/benchmark-matchup.js) |
| **5. Achieved roll rate** | **1** | Connect the existing roll observations to the selected pair and airspeed. Plot degrees per second, identify the tested wing and direction, and retain any stated test force as context. | A single measured speed appears as one point. Additional comparable speeds can extend the plot. Pilot-strength modeling is deferred. [Roll observations](../references/analysis/fleet-roll-evidence.json) |

### First acceptance examples

| Pair and interval | Measured lead | 4.17 modeled lead | What a change must explain |
| --- | ---: | ---: | --- |
| Bf 109 G-2 over G-6/Trop, 5–8 km | **90 s** | **32 s** | The G-2 takes 210 s measured and about 238 s modeled. The G-6 takes 300 s measured and about 269 s modeled. A blanket climb adjustment moves one farther from its trial. |
| Spitfire Va over Bf 109 E-3, 3,280–19,750 ft | **64 s** | **26 s** | The model gets the ordering right and understates the lead. Interpolate the Va clock at the E-3's recorded heights and check the lower and upper bands separately. |

These are comparisons at the respective test conditions. The G-2 and G-6 trials had different loadings and the G-2 altitude alignment is uncertain. Keep a user-selected, equal-condition simulation distinct from an as-tested replay. [4.17 numerical report](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/runs/45638227636) · [E-3 and Va band analysis](research/M3_STALL_ACCELERATION_CLIMB.md#climb-time-on-the-417-replay)

### Sim Data Input handoff

Sim Data Input owns source discovery, transcription and grading. Its current work covers the fleet climb records, full-span Spitfire IX stall and Finnish G-2 timed acceleration. The simulator consumes each supplied observation with its aircraft configuration, test conditions, units, source and uncertainty. A traceable secondary observation can appear immediately with its provisional grade and primary-source follow-up. A later source revision updates the same observation. M3 starts with the existing pack and incorporates reviewed batches as they arrive. [Sim Data Input research roadmap](research/WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md)

### Fleet release check

Publish one before/after scorecard covering **14 aircraft × 3 performance metrics**. Include predictions, measured errors where available, changes to aircraft ordering and material regressions. Run the four reference speed/climb checks and test accepted physics changes against observations reserved from fitting. If the evidence cannot distinguish a cause, ship the replay and its measured discrepancy. Confirm that the comparison screen and numerical report agree on the two examples above.

## After M3

- **M4 · Sustained level turn.** Use the accepted lift and power calculations to compare steady turn rate or time at a common speed, altitude, weight and rating. Run it across the roster and show which differences hold up against suitable steady-turn measurements. [Existing turn model and evidence](V415_FLEET_MANEUVER_ENERGY.md)
- **M5 · New profiles through the same comparison workflow.** When Sim Data Input supplies suitable configurations, integrate the best-supported batch, starting with the Spitfire I/E-3 comparison and F6F-3 candidate. Require each new profile to work with the same controls, comparisons and fleet regression. [Candidate readiness criteria](research/WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md)
