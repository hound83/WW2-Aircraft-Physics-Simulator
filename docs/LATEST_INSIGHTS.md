# Latest insights

Pointer file for agents starting a new milestone. Not a second model of record. Prefer the merged state on `main` plus any open PRs.

## Shared research / implementation roadmap (2026-11-12)

### Immediate next implementation

**Shared flight-case climb calculation.** Apply the existing matched open-cooling input to the Fw 190 A-4 WNr 783 live benchmark climb. Account for changing TAS in the timed-climb energy budget, starting with the P-38G Wright Field B.4 report. Keep current v4.10 propeller references within their supported bands.

Freeze the before-scorecard and re-score both cases. Check time-step sensitivity, rate and elapsed-time residuals, and four-aircraft regressions against the existing tolerances. Run the regression and browser checks and update validation and limitations. The existing evidence supports starting a bounded implementation candidate while research continues. [Next steps](NEXT_STEPS.md#after-v410-propeller-integration) · [Climb audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md#issues-to-address-next)

### Input-data milestones

Fighter Sim Inputs **v1.6.0** exports clean-stall references for all 13 variants. Two use reported CAS, eight use source-indicated speeds, and three use calculated EAS. The propeller companion already carries installation references for all 13 variants and includes a seven-profile sensitivity sweep. Build the next data increment on these records and their checked conditions. [Data handoff](SIMULATOR_DATA_HANDOFF.md) · [Fleet stall references](research/WW2_FLEET_STALL_INPUTS_2026-11-12.md) · [Fleet propeller references](research/WW2_FLEET_PROPELLER_INPUTS_2026-11-12.md)

1. **Climb case handoff for WNr 783 and 42-12687.** Package the existing test rows into two reusable climb cases with their source IDs, input limits and baseline residuals.
   - **Fw 190 A-4 WNr 783.** Match the long external intake, open/closed cooling-flap pair, 3,870 kg takeoff load and 2,400 rpm / 1.32 ata rating. Keep the 0.171 m² equivalent cooling area tied to its 5,000 m fit and check other altitude bands, including the adverse 7,000 m result in the existing replay. Recorded climb TAS remains open. Give any modeled speed schedule its own estimate label and bounds. [WNr 783 replay](V311_FW190A4.md) · [Climb audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md#issues-to-address-next)
   - **P-38G-1 42-12687.** Use B.4's open-cooling climb TAS, chart-assigned BHP per engine, climb rates and elapsed times, including the 340.80 s sea-level to 20,000 ft check. Retain loading and rating limits and keep the B.1 faired-cooling level-power schedule with its own case. Report rate and time residuals by altitude band, including sea level. Identify shared-report checks and independent tests by lineage. [Wright Field transcription](../references/p38g-42-12687.json) · [Validation plan](V410_VALIDATION_IMPROVEMENT_PLAN.md#historical-and-calculated-time-to-climb)
2. **Corrected stall and maneuver evidence for the Mustang–Spitfire crossover.** Start with P-51B-15 43-24777 and Spitfire LF IX BS.543. Seek near-stall airspeed corrections, test loading and configuration for one-G lift. Keep the TN 1044 maneuver-lift transfer within its measured Mach and test-condition range. For sustained-turn drag above one G, seek a matched high-lift drag polar, powered turn, or energy-loss trace with known load, speed, altitude and power. Deliver a bounded comparison at matched EAS and altitude with declared loading and power. Report lift and sustained-turn support separately, with unresolved comparisons flagged. [Input roadmap v1.7](research/WW2_FIGHTER_DATA_ROADMAP.md) · [Maneuver evidence](V44_TURN_PERFORMANCE.md)
3. **Targeted propulsion and timed acceleration evidence.** Extend the existing companion at named gaps. Prioritize the WNr 783 installed BMW 801 D-2 power schedule through the blower transition and the exact blade drawing. Check cooling and intake against their matched pairs before attributing a residual to propeller efficiency. For timed acceleration, start with the Mustang–Spitfire comparison and seek a constant-altitude speed–time trace with known speed basis, loading and power. Record the endpoints and elapsed time for any usable case. [Propulsion source leads](V410_REMAINING_PROPELLERS.md#source-checks-for-follow-up) · [Timed comparison evidence](V49_TIMED_MATCHUPS.md#historical-checks)
   - **Review the seven-aircraft benchmark pack as a source index.** Link any proposed input to its original observation IDs and match the operating conditions. The F4U-4 row's 3.10 mph replay uses Navy 80765 inspection-trial data. The P-47B 76% reference is a derived transfer from the Curtiss measurements. Carry those distinctions into any selected inputs. [Benchmark research pack](../references/research/WW2_PROPELLER_EFFICIENCY_BENCHMARK_2026-11-12.md) · [Verified propeller replays](V410_PROPELLER_REFERENCE.md)
4. **Qualify the next airframe.** Prepare the Bf 109 G-2 MT-215 level-speed and climb dossier after the current comparison priorities. Recover run loading, airspeed corrections and installed DB 605 A power for the Finnish trial. Keep the donor installations as separate cases. [Candidate data handoff](SIMULATOR_DATA_HANDOFF.md#suggested-aircraft) · [Input roadmap v1.8](research/WW2_FIGHTER_DATA_ROADMAP.md)

Use the existing observation IDs, pack and compact research notes for each increment. Record original units, conditions, source locator and evidence grade. For calculated inputs, include the formula, cited inputs, assumptions and bounds. Keep measured, calculated and unresolved values visible and distinguish fit points, reserved checks and independent runs. Keep well-sourced observations in the catalog even when their immediate simulator use is open. Hand off each usable case with its remaining gaps. [Candidate handoff](WORKFLOW.md#candidate-handoff)

## Current research candidate
- Version: 4.10.0-rc.2
- Commit: see main branch
- Status: research candidate; historical 5:1 and exact stall/CLmax remain unresolved

## Open gaps to respect
- Sustained-turn and near-stall accuracy unresolved
- Cooling is an aggregate installed-energy fit
- P-38G sea-level residual and Fw 190 missing recorded climb TAS remain open
- Exact corrected stalls for most aircraft remain open (see STALL_WEIGHT_GATE.md)

## Recent research notes
See `docs/research/` and the v4.10 propeller and climb-turn audit documents.

Last updated: 2026-11-12
