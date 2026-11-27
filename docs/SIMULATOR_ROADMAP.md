# Simulator development roadmap

**Fleet accuracy · 4.20.0-rc.1.** Across 15 campaigns and 95 climb intervals, the largest remaining deviations concentrate at altitude. The next 80/20 milestone is the shared power-versus-altitude and cooling schedule. Recover shaft power, blower state and climb TAS for the large residuals, fit only on development flights, and reuse the whole-report reserve and acceleration checks. [Results and acceptance criteria](V420_FLEET_ACCURACY.md)

## M4 · Fleet sustained level turns

4.19.0-rc.1 compares all 14 profiles at a shared speed, altitude and rating. It also compares equal gross weights when both profiles support the selected mass. Primary restored-aircraft measurements, a secondary wartime turn record and external simulation results retain their test conditions and source grades. Roster expansion follows validation of the current fleet. [M4 fleet scorecard](V419_FLEET_STEADY_TURN.md)

## M3 · One fleet-wide comparison milestone

4.18.0-rc.1 combines common-height climb, clean stall at selected weight, common-speed level acceleration, measured lead and uncertainty, and achieved roll rate. One release covers all 14 profiles. The earlier ten-session estimate described the relative effort. Implementation, evidence intake, browser testing, integration and publication belong to the same assignment. [Fleet results, before/after scorecard and sources](V418_FLEET_COMPARISON.md)

### First acceptance examples

| Pair and interval | Measured lead | 4.17 modeled lead | What a change must explain |
| --- | ---: | ---: | --- |
| Bf 109 G-2 over G-6/Trop, 5–8 km | **90 s** | **32 s** | The G-2 takes 210 s measured and about 238 s modeled. The G-6 takes 300 s measured and about 269 s modeled. A blanket climb adjustment moves one farther from its trial. |
| Spitfire Va over Bf 109 E-3, 3,280–19,750 ft | **64 s** | **26 s** | The model gets the ordering right and understates the lead. Interpolate the Va clock at the E-3's recorded heights and check the lower and upper bands separately. |

These are comparisons at the respective test conditions. The G-2 and G-6 trials had different loadings and the G-2 altitude alignment is uncertain. Keep a user-selected, equal-condition simulation distinct from an as-tested replay. [4.17 numerical report](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/runs/45638227636) · [E-3 and Va band analysis](research/M3_STALL_ACCELERATION_CLIMB.md#climb-time-on-the-417-replay)

### Sim Data Input handoff

Sim Data Input owns source discovery, transcription and grading. The simulator consumes each supplied observation with its aircraft configuration, test conditions, units, source and uncertainty. A traceable secondary observation can appear immediately with its provisional grade and primary-source follow-up. A later source revision updates the same observation. M3 incorporates the reviewed fleet-climb, Spitfire IX stall and Finnish G-2 batch. The subsequent comparative intake adds 332 source rows covering the current roster, with the original trials, secondary compilations and profile matches available together. [Comparative flight data](research/FLEET_COMPARATIVE_DATA_2026-11-27.md) · [Sim Data Input research roadmap](research/WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md)

### Fleet release check

The [release scorecard](V418_FLEET_COMPARISON.md) covers **14 aircraft × 3 performance metrics**. Include predictions, measured errors where available, changes to aircraft ordering and material regressions. Run the four reference speed/climb checks and test accepted physics changes against observations reserved from fitting. If the evidence cannot distinguish a cause, ship the replay and its measured discrepancy. Confirm that the comparison screen and numerical report agree on the two examples above.

## After M4

- **M5 · New profiles through the same comparison workflow.** When Sim Data Input supplies suitable configurations, integrate the best-supported batch, starting with the Spitfire I/E-3 comparison and F6F-3 candidate. Require each new profile to work with the same controls, comparisons and fleet regression. [Candidate readiness criteria](research/WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md)
