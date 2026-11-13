# Latest insights

Pointer file for agents starting a new milestone. Not a second model of record. Prefer the merged state on `main` plus any open PRs.

## Shared research / implementation roadmap (2026-11-12)

### Delivered in v4.14.0-rc.3

The benchmark displays the Finnish MT-215 turn transcription and the calculated replay at the reported speed. Clean-cooling time is 24.0 s versus 22 s transcribed. The model’s 2.97 G is close to the rounded 3 G in the source, while the timing at assumed TAS implies 3.21 G. [Powered-turn results](V414_POWERED_TURN_REPLAY.md)

### Delivered in v4.14.0-rc.2

The benchmark plots the restored P-51D's transcribed endpoints and the dotted replay. The nominal elapsed-time residual is −39.7 s with unresolved installed power and IAS calibration. The wartime comparison uses the P-51D Normal level test and calculated Spitfire LF IX energy from recorded climb. [Report and scorecard](V414_LEVEL_ACCELERATION_REPLAY.md)

### Delivered in v4.14.0-rc.1

The benchmark adds G-6/Trop WNr 16476 and F Mk IX BF.274. The source replay shows the G-6 attachment cases and ceiling, and BF.274’s clean level, climb-rate and elapsed-time results. The roster next queues Bf 109 E WNr 1304 and Spitfire Va X.4922, followed by Mk I N.3171. [Second aircraft intake](V414_AIRCRAFT_INTAKE.md)

### Delivered in v4.13.0-rc.2

The benchmark now shows how much extra turn drag would change the Mustang–Spitfire order. At 200 mph EAS the nominal gap is 0.33°/s, and the drag-only sweep spans both outcomes. The earlier Spitfire glide replay checks three reserved speeds and reaches the source lift boundary at the crossover. [Turn-drag results](V413_TURN_DRAG.md)

### Delivered in v4.13.0-rc.1

The Normal / Combat benchmark adds the HF IX, G-2 and P-51D for source-bounded speed and climb. The HF/LF test crossover is reproduced with an overstated high-altitude advantage. The new profiles carry provisional stalls and await drag-under-load and lift evidence for turn comparisons. [Aircraft intake and source replay](V413_AIRCRAFT_INTAKE.md)

### Delivered in v4.11.0-rc.1

The shared timer now applies signed TAS energy, and the live Fw 190 WNr 783 climb uses the source-bounded open-cooling fit. The seven-aircraft replay reports the power budgets, adverse residuals and matched comparisons. The direct P-47B and Spitfire elapsed checks keep their vertical-rate calibration basis. [Climb implementation and results](V411_SHARED_FLIGHT_CLIMB.md) · [Grok’s source extraction](../references/research/WW2_FLIGHT_CASE_CLIMB_AFTER_EXTRACTION_2026-11-12.md)

### Input-data milestones

Fighter Sim Inputs **v1.11.0** reviews Grok’s comparative summaries, adds 21 catalog rows and scores 19 dossiers. The resulting HF Mk IX BS.551, G-2 MT-215 and P-51D-15-NA 44-15342 profiles are available for speed and climb. [Accepted aircraft roster](DECISIONS.md#aircraft-roster-expansion) [Comparative intake and scores](research/WW2_PRIORITY_COMPARATIVE_COVERAGE_2026-11-13.md)

Use the existing climb residual table as a starting scorecard. Confirm each baseline value against its source and keep the P-38G B.4 elapsed-time check at sea level to 20,000 ft. [Before-scorecard](../references/research/WW2_FLIGHT_CASE_CLIMB_RESIDUAL_TABLE_2026-11-12.md)

Fighter Sim Inputs **v1.10.0** adds 164 records from the eight-aircraft candidate review, including full P-51D and Spitfire trial tables. The checklist now supports Greg's first drag polar from a matched anchor and a documented split. [Priority-aircraft release](research/WW2_PRIORITY_AIRCRAFT_INPUTS_V1_10.md) · [Minimum viable inputs](research/MINIMUM_VIABLE_SIM_DATA.md)

The pack retains the 96 earlier Grok records and exports the matched WNr 783 and 42-12687 climb cases and clean-stall references for all 13 variants. [Climb case handoff and scorecard](research/WW2_MATCHED_CLIMB_INPUTS_2026-11-12.md) The stall references include two reported CAS values, eight source-indicated speeds and three calculated EAS values. The propeller companion already carries installation references for all 13 variants and includes a seven-profile sensitivity sweep. Build the next data increment on these records and their checked conditions. [Data handoff](SIMULATOR_DATA_HANDOFF.md) · [Fleet stall references](research/WW2_FLEET_STALL_INPUTS_2026-11-12.md) · [Fleet propeller references](research/WW2_FLEET_PROPELLER_INPUTS_2026-11-12.md)

1. **Delivered · Climb case handoff for WNr 783 and 42-12687.** The input pack carries the original observation IDs, bounded Fw 190 TAS estimate and replay residuals. The Fw 190 open-cooling chart has source timing through 9,000 m. The P-38G B.4 elapsed-time replay uses the reported TAS and chart power.
   - **Fw 190 A-4 WNr 783.** Match the long external intake, open/closed cooling-flap pair, 3,870 kg takeoff load and 2,400 rpm / 1.32 ata rating. Keep the 0.171 m² equivalent cooling area tied to its 5,000 m fit and check other altitude bands, including the adverse 7,000 m result in the existing replay. Recorded climb TAS remains open. Give any modeled speed schedule its own estimate label and bounds. [WNr 783 replay](V311_FW190A4.md) · [Climb audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md#issues-to-address-next)
   - **P-38G-1 42-12687.** Use B.4's open-cooling climb TAS, chart-assigned BHP per engine, climb rates and elapsed times, including the 340.80 s sea-level to 20,000 ft check. Retain loading and rating limits and keep the B.1 faired-cooling level-power schedule with its own case. Report rate and time residuals by altitude band, including sea level. Identify shared-report checks and independent tests by lineage. [Wright Field transcription](../references/p38g-42-12687.json) · [Validation plan](V410_VALIDATION_IMPROVEMENT_PLAN.md#historical-and-calculated-time-to-climb)
2. **Corrected stall and maneuver evidence for the Mustang–Spitfire crossover.** Start with P-51B-15 43-24777 and Spitfire LF IX BS.543. Seek near-stall airspeed corrections, test loading and configuration for one-G lift. Keep the TN 1044 maneuver-lift transfer within its measured Mach and test-condition range. For sustained-turn drag above one G, seek a matched high-lift drag polar, powered turn, or energy-loss trace with known load, speed, altitude and power. Deliver a bounded comparison at matched EAS and altitude with declared loading and power. Report lift and sustained-turn support separately, with unresolved comparisons flagged. [Input roadmap](research/WW2_FIGHTER_DATA_ROADMAP.md#next--corrected-stall-and-drag-under-load) · [Maneuver evidence](V44_TURN_PERFORMANCE.md)
3. **Targeted propulsion and timed acceleration evidence.** Extend the existing companion at named gaps. Prioritize the WNr 783 installed BMW 801 D-2 power schedule through the blower transition and the exact blade drawing. Check cooling and intake against their matched pairs before attributing a residual to propeller efficiency. For timed acceleration, start with the Mustang–Spitfire comparison and seek a constant-altitude speed–time trace with known speed basis, loading and power. Record the endpoints and elapsed time for any usable case. [Propulsion source leads](V410_REMAINING_PROPELLERS.md#source-checks-for-follow-up) · [Timed comparison evidence](V49_TIMED_MATCHUPS.md#historical-checks)
   - **Review the seven-aircraft benchmark pack as a source index.** Link any proposed input to its original observation IDs and match the operating conditions. The F4U-4 row's 3.10 mph replay uses Navy 80765 inspection-trial data. The P-47B 76% reference is a derived transfer from the Curtiss measurements. Carry those distinctions into any selected inputs. [Benchmark research pack](../references/research/WW2_PROPELLER_EFFICIENCY_BENCHMARK_2026-11-12.md) · [Verified propeller replays](V410_PROPELLER_REFERENCE.md)
4. **Follow up the aircraft intake.** Constrain installed power at altitude for the HF IX and G-2 and qualify matched stall readings. The accepted roster queues Bf 109 E WNr 1304 and Spitfire Va X.4922 next. Seek the G-6 climb chart and matched stall evidence for BF.274 and WNr 16476. [Accepted aircraft roster](DECISIONS.md#aircraft-roster-expansion) · [Candidate data handoff](SIMULATOR_DATA_HANDOFF.md#suggested-aircraft)

Use the existing observation IDs, pack and compact research notes for each increment. Record original units, conditions, source locator and evidence grade. For calculated inputs, include the formula, cited inputs, assumptions and bounds. Keep measured, calculated and unresolved values visible and distinguish fit points, reserved checks and independent runs. Keep well-sourced observations in the catalog even when their immediate simulator use is open. Hand off each usable case with its remaining gaps. [Candidate handoff](WORKFLOW.md#candidate-handoff)

## Reviewed source batches

The input pack includes Rechlin G-1 timing, the P-47D-30 Fig. 50 IAS trace, two P-51B-15 low-blower lapse points and related FX.858, P-38J and A-5 references. [Batch dispositions and coverage matrix](research/WW2_GROK_BATCH_INPUT_REVIEW_2026-11-12.md)

## Reviewed stall research

Grok’s expanded stall draft and 21-variant extract are available as research inputs. The two Mustang readings and captured A-3 results link to the existing catalog rows. The verified NACA report identities and remaining archive leads are recorded for reuse. The Bf 109 F-4 leads Grok’s parallel primary-extraction queue. [Stall handoff](../references/research/PROVISIONAL_STALL_ENVELOPE_2026-11-12.md) · [Report checks](../references/research/REPORT_INVESTIGATION_2026-11-12.md) · [NACA source review](../references/research/WW2_NACA_AND_PRIMARY_SOURCE_EXPANSION_2026-11-12.md) · [Family extraction review](../references/research/WW2_FAMILY_PRIMARY_EXTRACTION_v1_2026-11-12.md#review-for-simulator-use) · [Extraction queue](../references/research/WW2_EXTRACTION_BATCH_LIST_EXPANDED_2026-11-12.md)

## Delivered simulator milestone

**Continuous stall and usable maneuver lift.** The Mustang transitions continuously across the two low-speed altitude edges. The benchmark shows condition-specific stall references and joins the dotted lift-dependent interval to the supported solid interval on the same chart. The calibrated P-38G and the separate Corsair glide and powered cases are recorded in the seven-aircraft replay. [v4.12 results](V412_CONTINUOUS_STALL.md)

## Next simulator milestone

**Compare straight-flight and turn energy on one aircraft.** Recover the original MT-215 maneuver sheet and the altitude, rating, loading and airspeed basis for its timed acceleration runs. A straight-flight acceleration at the turn’s speed and power can constrain the extra drag above 1 G. Keep the Mustang–Spitfire crossover open while their matched powered-turn evidence is recovered. [Turn and acceleration leads](V414_POWERED_TURN_REPLAY.md)

## Current research candidate
- Simulator research candidate [v4.14.0-rc.3](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/). [Release verification](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/publish-simulator.yml)
- Input pack · [Fighter Sim Inputs v1.11.0](research/WW2_FIGHTER_SIM_INPUTS_V1.md)
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
