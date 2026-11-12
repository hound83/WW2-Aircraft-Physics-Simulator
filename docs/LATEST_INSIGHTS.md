# Latest insights

Pointer file for agents starting a new milestone. Not a second model of record. Prefer the merged state on `main` plus any open PRs.

## Shared research / implementation roadmap (2026-11-12)

### Delivered in v4.11.0-rc.1

The shared timer now applies signed TAS energy, and the live Fw 190 WNr 783 climb uses the source-bounded open-cooling fit. The seven-aircraft replay reports the power budgets, adverse residuals and matched comparisons. The direct P-47B and Spitfire elapsed checks keep their vertical-rate calibration basis. [Climb implementation and results](V411_SHARED_FLIGHT_CLIMB.md) · [Grok’s source extraction](../references/research/WW2_FLIGHT_CASE_CLIMB_AFTER_EXTRACTION_2026-11-12.md)

### Input-data milestones

Use the existing climb residual table as a starting scorecard. Confirm each baseline value against its source and keep the P-38G B.4 elapsed-time check at sea level to 20,000 ft. [Before-scorecard](../references/research/WW2_FLIGHT_CASE_CLIMB_RESIDUAL_TABLE_2026-11-12.md)

Fighter Sim Inputs **v1.7.0** exports the matched WNr 783 and 42-12687 climb cases and clean-stall references for all 13 variants. [Climb case handoff and scorecard](research/WW2_MATCHED_CLIMB_INPUTS_2026-11-12.md) The stall references include two reported CAS values, eight source-indicated speeds and three calculated EAS values. The propeller companion already carries installation references for all 13 variants and includes a seven-profile sensitivity sweep. Build the next data increment on these records and their checked conditions. [Data handoff](SIMULATOR_DATA_HANDOFF.md) · [Fleet stall references](research/WW2_FLEET_STALL_INPUTS_2026-11-12.md) · [Fleet propeller references](research/WW2_FLEET_PROPELLER_INPUTS_2026-11-12.md)

1. **Delivered · Climb case handoff for WNr 783 and 42-12687.** The input pack carries the original observation IDs, bounded Fw 190 TAS estimate and replay residuals. The Fw 190 open-cooling chart has source timing through 9,000 m. The P-38G B.4 elapsed-time replay uses the reported TAS and chart power.
   - **Fw 190 A-4 WNr 783.** Match the long external intake, open/closed cooling-flap pair, 3,870 kg takeoff load and 2,400 rpm / 1.32 ata rating. Keep the 0.171 m² equivalent cooling area tied to its 5,000 m fit and check other altitude bands, including the adverse 7,000 m result in the existing replay. Recorded climb TAS remains open. Give any modeled speed schedule its own estimate label and bounds. [WNr 783 replay](V311_FW190A4.md) · [Climb audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md#issues-to-address-next)
   - **P-38G-1 42-12687.** Use B.4's open-cooling climb TAS, chart-assigned BHP per engine, climb rates and elapsed times, including the 340.80 s sea-level to 20,000 ft check. Retain loading and rating limits and keep the B.1 faired-cooling level-power schedule with its own case. Report rate and time residuals by altitude band, including sea level. Identify shared-report checks and independent tests by lineage. [Wright Field transcription](../references/p38g-42-12687.json) · [Validation plan](V410_VALIDATION_IMPROVEMENT_PLAN.md#historical-and-calculated-time-to-climb)
2. **Corrected stall and maneuver evidence for the Mustang–Spitfire crossover.** Start with P-51B-15 43-24777 and Spitfire LF IX BS.543. Seek near-stall airspeed corrections, test loading and configuration for one-G lift. Keep the TN 1044 maneuver-lift transfer within its measured Mach and test-condition range. For sustained-turn drag above one G, seek a matched high-lift drag polar, powered turn, or energy-loss trace with known load, speed, altitude and power. Deliver a bounded comparison at matched EAS and altitude with declared loading and power. Report lift and sustained-turn support separately, with unresolved comparisons flagged. [Input roadmap v1.8](research/WW2_FIGHTER_DATA_ROADMAP.md) · [Maneuver evidence](V44_TURN_PERFORMANCE.md)
3. **Targeted propulsion and timed acceleration evidence.** Extend the existing companion at named gaps. Prioritize the WNr 783 installed BMW 801 D-2 power schedule through the blower transition and the exact blade drawing. Check cooling and intake against their matched pairs before attributing a residual to propeller efficiency. For timed acceleration, start with the Mustang–Spitfire comparison and seek a constant-altitude speed–time trace with known speed basis, loading and power. Record the endpoints and elapsed time for any usable case. [Propulsion source leads](V410_REMAINING_PROPELLERS.md#source-checks-for-follow-up) · [Timed comparison evidence](V49_TIMED_MATCHUPS.md#historical-checks)
   - **Review the seven-aircraft benchmark pack as a source index.** Link any proposed input to its original observation IDs and match the operating conditions. The F4U-4 row's 3.10 mph replay uses Navy 80765 inspection-trial data. The P-47B 76% reference is a derived transfer from the Curtiss measurements. Carry those distinctions into any selected inputs. [Benchmark research pack](../references/research/WW2_PROPELLER_EFFICIENCY_BENCHMARK_2026-11-12.md) · [Verified propeller replays](V410_PROPELLER_REFERENCE.md)
4. **Qualify the next airframe.** Prepare the Bf 109 G-2 MT-215 level-speed and climb dossier after the current comparison priorities. Recover run loading, airspeed corrections and installed DB 605 A power for the Finnish trial. Keep the donor installations as separate cases. [Candidate data handoff](SIMULATOR_DATA_HANDOFF.md#suggested-aircraft) · [Input roadmap v1.9](research/WW2_FIGHTER_DATA_ROADMAP.md)

Use the existing observation IDs, pack and compact research notes for each increment. Record original units, conditions, source locator and evidence grade. For calculated inputs, include the formula, cited inputs, assumptions and bounds. Keep measured, calculated and unresolved values visible and distinguish fit points, reserved checks and independent runs. Keep well-sourced observations in the catalog even when their immediate simulator use is open. Hand off each usable case with its remaining gaps. [Candidate handoff](WORKFLOW.md#candidate-handoff)

## Reviewed stall research

Grok’s expanded stall draft and 21-variant extract are available as research inputs. The two Mustang readings and captured A-3 results link to the existing catalog rows. The verified NACA report identities and remaining archive leads are recorded for reuse. The Bf 109 F-4 leads Grok’s parallel primary-extraction queue. [Stall handoff](../references/research/PROVISIONAL_STALL_ENVELOPE_2026-11-12.md) · [Report checks](../references/research/REPORT_INVESTIGATION_2026-11-12.md) · [NACA source review](../references/research/WW2_NACA_AND_PRIMARY_SOURCE_EXPANSION_2026-11-12.md) · [Family extraction review](../references/research/WW2_FAMILY_PRIMARY_EXTRACTION_v1_2026-11-12.md#review-for-simulator-use) · [Extraction queue](../references/research/WW2_EXTRACTION_BATCH_LIST_EXPANDED_2026-11-12.md)

## Next simulator milestone

### Continuous stall and usable maneuver lift

Deliver a speed sweep and graph evidence for the P-51B-15 stall boundary, with the P-38G calibrated case as a check and Corsair glide and powered cases kept at their own conditions.

1. **Select case-matched stall inputs.** Preserve the raw IAS/CAS and the source conditions. Calculate EAS or a range where a documented correction or defensible assumption is available. Record the source ID, airspeed basis, altitude, loading, power and configuration. Use the B-5 and B-15 Mustang stall tables as separate specimens. Keep the existing clean-stall references as the comparison baseline. [Reviewed candidates](../references/research/PROVISIONAL_STALL_ENVELOPE_2026-11-12.md)
2. **Check the speed sweep and remove the artificial boundary.** Sweep the 9,270 lb P-51B-15 model across both altitude edges, 5,100 ft and 9,300 ft. Reserve the 42-12690 P-38G IAS/CAS pair as a check. Verify continuity across the altitude and Mach edges, square-root weight scaling at fixed lift coefficient, and the lift ceiling across EAS in both directions. Use the applicable maneuver lift where the source provides it. Under a fixed lift coefficient the speed sweep follows `n = (EAS / 1-G stall EAS)^2`. Carry any provisional stall range into the dependent lift calculation. [Stall and lift diagnostics](V410_VALIDATION_IMPROVEMENT_PLAN.md#maneuvering-priorities) · [Mustang maneuver replay](V44_TURN_PERFORMANCE.md#mustang-flight-evidence)
3. **Verify mixed evidence styles on one graph.** Show the calculated stall marker or band in the graph’s speed units. Split the curve where the supporting inputs change. Dot only the calculated boundary extension or the portion controlled by a provisional lift input. Preserve supported solid sections. The tooltip carries the source, assumption and range. A single point or band can stand on its own when the connecting interval has no applicable evidence. [Graph evidence](V46_CHART_DATA.md)
4. **Compare the seven profiles.** Report clean-stall and usable-G values, evidence and gaps across the seven-aircraft benchmark. Reproduce the four-aircraft regression and cover the mixed line style in the browser. Keep historical sustained-turn drag as a follow-up requiring matched powered-turn or energy-loss evidence. [Maneuver evidence](V44_TURN_PERFORMANCE.md) · [Release criteria](../AGENTS.md#git-autonomous-merge-scientific-release-and-delivery)

Grok can check source rows and calculation assumptions in a candidate. Codex verifies the graph and shared solver integration. [Candidate handoff](WORKFLOW.md#candidate-handoff) · [Input-data roadmap](research/WW2_FIGHTER_DATA_ROADMAP.md)

## Current research candidate
- Simulator research candidate [v4.11.0-rc.1](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/). [Release verification](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/publish-simulator.yml)
- Input pack on main · [Fighter Sim Inputs v1.7.0](research/WW2_FIGHTER_SIM_INPUTS_V1.md)
- Status: research candidate. Exact corrected stall, sustained-turn accuracy and historical 5:1 remain unresolved.

## Open gaps to respect
- Sustained-turn and near-stall accuracy unresolved
- Cooling is an aggregate installed-energy fit
- P-38G sea-level residual and Fw 190 missing recorded climb TAS remain open
- Exact corrected stalls for most aircraft remain open (see STALL_WEIGHT_GATE.md)
- Direct measured propeller efficiency missing for Fw 190 A-4 and Bf 109 F-4

## Recent research notes
- Graded seven-aircraft propeller benchmark and archive leads. [Research note](../references/research/WW2_PROPELLER_EFFICIENCY_BENCHMARK_2026-11-12.md)
- See `docs/research/` and the v4.10 propeller and climb-turn audit documents.

Last updated: 2026-11-12
