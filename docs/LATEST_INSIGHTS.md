# Latest insights

Pointer file for agents starting a new milestone. Not a second model of record. Prefer the merged state on `main` plus any open PRs.

## Shared research / implementation roadmap (2026-11-12)

### Immediate next major milestone
**Shared flight-case climb + seven-aircraft propulsion residual closure**

Combines the climb calculation with a bounded residual audit so the same matched cases improve both climb accuracy and energy/maneuver comparisons.

1. **Flight-case climb** (data-ready)
   - Apply matched open-cooling input to the Fw 190 A-4 WNr 783 live benchmark climb.
   - Account for changing TAS in the timed-climb energy budget (P-38G Wright Field B.4, source elapsed 340.80 s).
   - Keep current v4.10 propeller references in their supported bands.
   - Freeze before-scorecard; re-score both cases.

2. **Propulsion residual audit on the same cases**
   - Use the [graded propeller-efficiency research pack](../references/analysis/ww2_propeller_efficiency_benchmark_2026-11-12.json).
   - Report shaft power, useful propeller power, and drag power at matched conditions.
   - Identify which residuals are still cooling/intake, tip-Mach, or missing German η.

3. **Seven-aircraft scorecard**
   - Level speed, climb, and (where data exist) acceleration/sustained-turn sensitivity under existing margins (6 km/h TAS, 5 % climb, 0.5 °/s turn).
   - Explicit unsupported matchups remain marked unresolved.

**Acceptance (research/beta):** before/after residuals reported; `npm run check` + browser smoke pass; four-aircraft scorecard does not regress outside tolerances; no new unsupported coefficients; residual gaps documented rather than closed by assumption. Use the existing catalog schemas for observations and link any analysis scorecard.

**Non-goals:** new aircraft intake, claimed 5:1, validated/stable release, untargeted stall/CLmax refits.

Status: research and an opt-in climb prototype are on `main`. Live integration and formula verification remain open.

### Near-term research (parallel or follow-on)
- Propeller-efficiency pack (done 2026-11-12; residual gaps remain for Fw 190 / Bf 109).
- Mustang–Spitfire crossover for usable lift/drag above 1 G.
- Cooling / intake residual audit.
- Sustained-turn and near-stall evidence tightening where primary matched data exists.

## Codex review and proposed simulator milestone

**Keep shared climb as the next solver change.** Use one resolved flight case for the live benchmark and the historical replay. Compare the seven power budgets as diagnostics and carry forward residuals whose causes remain uncertain. At matched settings, the WNr 783 open-flap replay should show a climb penalty. Check the existing 0.171 m² equivalent area across the reserved bands, including the larger 7,000 m residual, and report sensitivity to the unrecorded test TAS. Re-score elapsed time by band for the P-38G, Spitfire, P-47B and P-51B with the original rating schedules. Integrate observed vertical rates as recorded. [Climb evidence and adverse result](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md#issues-to-address-next) · [Elapsed-time references](V410_VALIDATION_IMPROVEMENT_PLAN.md#historical-and-calculated-time-to-climb)

**Correct and test the timed-climb step before enabling it.** The [opt-in prototype](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/3a20176c4910b2d8ce07bbb73bba9abf5bf14808) computes the kinetic-energy rate using the old step duration and then changes that duration. With 100 m of altitude gain, 50 m of kinetic energy height gain and 10 m/s of specific excess power, it gives 20 s. Energy balance gives 15 s using `Δt = (Δh + Δ(V²/2g)) / P_s` at constant `P_s`. Check increasing, constant and decreasing TAS schedules, step convergence, and fuel and rating expiry using the final step time. The P-38G fixed-mass diagnostic gives 332.99 s before and 346.25 s with the energy term against 340.80 s reported. Keep the signed error visible and repeat the check through the live timed-climb path. [Formula audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md#issues-to-address-next)

**Check maneuver performance across the curves.** The propeller audit reproduced open-cooling climb and peak turn but moved the P-38G clean sustained turn from 2.43 to 1.10°/s at 30,000 ft and 240 mph EAS in the sampled Combat case. Freeze the four-aircraft scorecard and compare all seven profiles at matched speed and altitude for climb time, stall, instantaneous and sustained turn, and timed acceleration. Report adverse changes and flag sensitive rankings using the existing practical comparison margins. Pursue further propulsion research where a plausible input change can move a source replay or a matchup. Use the new benchmark pack as a source index. The F4U-4 3.10 mph replay comes from Navy BuNo 80765 inspection trials, and the P-47B 76% is a derived Curtiss transfer. Use original observations and case conditions before selecting either value. [Envelope audit](V410_CLIMB_TURN_AND_FORMULA_AUDIT.md#changes-at-a-fixed-speed) · [Comparison margins](V49_TIMED_MATCHUPS.md#practical-ties-and-chart-evidence) · [Checked propeller references](research/WW2_PROPELLER_REFERENCE_VALUES_2026-11-12.md)

### Proposed follow-on · Continuous stall and usable maneuver lift

After the shared-climb candidate passes its gates, correct the Mustang lift input and demonstrate what the existing stall evidence supports in the live comparison.

1. **Fix the P-51B-15 stall boundary.** At 9,270 lb its predicted one-G stall falls from 103.55 to 98.62 mph EAS between 9,300 and 9,301 ft. Check continuity at both altitude edges and the applicable Mach limits. Verify that the same inputs give the same lift limit in the replay and the live app, and that stall EAS scales with the square root of weight at fixed lift coefficient and wing area. Preserve the TN 1044 maneuver-lift check bands. [Stall and lift diagnostics](V410_VALIDATION_IMPROVEMENT_PLAN.md#maneuvering-priorities) · [Mustang maneuver replay](V44_TURN_PERFORMANCE.md#mustang-flight-evidence)
2. **Use the available flight tests.** Replay the F4U-4 BuNo 91028 glide and powered stall conditions to bound effective lift with power and configuration. Reserve the corrected P-38G sister-airframe stall as a transfer check. For IAS without a matched correction, carry an explicit correction range and weight assumptions into the lift estimate. Apply the existing 2 km/h stall goal where the test conditions and uncertainty support it. [Stall test conditions and sensitivity](V410_VALIDATION_IMPROVEMENT_PLAN.md#stall-and-lift-from-usable-inputs) · [Fleet stall references](research/WW2_FLEET_STALL_INPUTS_2026-11-12.md)
3. **Deliver a seven-profile scorecard.** Show the modeled and best supported reference stall speeds, the speed basis and evidence grade, the inferred one-G lift and the available maneuver load at 200 mph EAS and 10,000 ft under the declared load and rating. A derived reference that reuses the model's lift input is a consistency check. Run the four-aircraft regression and browser checks. Use the Mustang–Spitfire crossover as a sensitivity check here. Constrain drag above one G in the subsequent powered-turn candidate with measured load and drag or energy loss. A historical 5:1 claim requires independent matched cases and bounded comparison uncertainty. [Maneuver and comparison evidence](V44_TURN_PERFORMANCE.md) · [Release criteria](../AGENTS.md#git-autonomous-merge-scientific-release-and-delivery)

Grok can check the airspeed and lift derivations and look for powered-turn evidence in parallel. Codex owns the solver candidate, verification and production integration. [Candidate handoff](WORKFLOW.md#candidate-handoff) · [Input-data roadmap](research/WW2_FIGHTER_DATA_ROADMAP.md)

## Current research candidate
- Published simulator: [v4.10.0-rc.2](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/) at [`52369812`](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/52369812a7ed40ec8fed1cde42354023aec407f0). [Verified deployment](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/runs/43192337527)
- Input pack on `main`: [Fighter Sim Inputs v1.6.0](research/WW2_FLEET_STALL_INPUTS_2026-11-12.md)
- Status: research candidate. Exact corrected stall, sustained-turn accuracy and historical 5:1 remain unresolved.

## Open gaps to respect
- Sustained-turn and near-stall accuracy unresolved
- Cooling is an aggregate installed-energy fit
- P-38G sea-level residual and Fw 190 missing recorded climb TAS remain open
- Exact corrected stalls for most aircraft remain open (see STALL_WEIGHT_GATE.md)
- Direct measured propeller efficiency missing for Fw 190 A-4 and Bf 109 F-4

## Recent research notes
- Propeller-efficiency benchmark pack: `references/research/WW2_PROPELLER_EFFICIENCY_BENCHMARK_2026-11-12.md`
- See `docs/research/` and the v4.10 propeller and climb-turn audit documents.

Last updated: 2026-11-12
