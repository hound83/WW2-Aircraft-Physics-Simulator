# Next steps

## Data-only collection objective: thirteen variants, primary80 / augmented90

[Current checkpoint and per-aircraft retrieval tasks](research/WW2_THIRTEEN_FIGHTER_DATA_2026-11-11.md). The agreed objective remains open:1/13 reaches80 primary;0/13 reaches90 augmented under the unchanged rubric. Prioritize F6F04776 original stall time-history digitization with matched fuel/mass; P47D30 recorder-channel qualification and existing paired near-stall traces; then original F4 performance/EB100 files and Ki84 actual measured performance/calibration records. Continue all thirteen dossiers, retaining same-variant transfer bounds and source-level independence. G2 verification requires actual RPM/MAP and separate clean/gunpod/radiator configurations. This thread authorizes data collection only; simulator settings, physics and aircraft admission belong to the separate implementation milestone.

## After v4.1 energy integration

Five existing profiles now improve in the live source-configuration comparison. [Results, regressions and next scientific gate](V41_ENERGY_RESULTS.md) supersede the earlier v4.1 wish list. Prioritize independent joint speed/climb/power constraints, the Corsair high-altitude deficit, P-38 sparse-fit sensitivity and exact low-speed polar/stall conditions. Preserve achieved source-check reductions; do not treat a newly fitted climb as independent turn validation.

## v4.0 implementation and v4.1 priorities

The major research candidate adds seven-profile live maneuver curves, Corsair normal/military/stall-state choices, bounded P-47B prop and P-51B rack tests and fuel-changing climb integration. Follow the [v4.0 report](V4_MILESTONE.md) for exact fit/check roles and remaining failures. Prioritize Corsair high-altitude propulsion/drag separation, P-47 installed thrust-loading residuals, source-matched Mustang propellers, and calibrated BS.543/F-4/P-38G/Fw190 near-stall evidence before comparative accuracy claims.

## 2026-11-10 four-track source deepening: 200 verified/qualified source rows (research completed)

The [complete new audit and variant-readiness matrix](research/WW2_FIGHTERS_MULTIAXIS_PRIMARY_SOURCE_DEEPENING_2026-11-10.md) records a **955-row / 208-stall / 163-source** catalog (previously 755 / 200 / 139), original torque-meter P-47B prop comparisons, F4U-4 direct-CAS companion speed/climb, five-prop P-40F tests, original Spitfire IX BF274→BS543 position-error transfer, 17 P-38 installation-only corrections and three clearly **corrected* (not CAS)** derived clean-stall candidates, independent F6F-3 IAS stalls, actual P-51B-15 source boost/rack comparisons, and new variants with explicit source exclusions. Existing CAS gate remains four direct plus one provisional CAS*. Historical full sustained-turn evidence is still missing for every modeled variant. Read this **current** report rather than interpreting old 755-row/15-lineage counts below as live.

**Priority of the next research pass:** seek DIRECT near-stall CAS/EAS *and* source-specific low-speed correction tables for the exact six modeled variants, digitize original low-speed charts only within verified axis and instrumentation domains, characterize simultaneous engine/prop/cooling/weight for sustained turns, and continue adding source-qualified F4U-4, F6F-3, P-47D-30, P-40F, Fw190D-9 and Ki-84. Keep data gathering in the research stream separate from the parallel v3.15+ simulator correction and validation effort. The original P-47D-30 figure 58 altitude conflict and Spitfire VA W3119 specimen correction were fixed in existing pack v1.0.1.

## Four-track original stall follow-up and six-profile readiness (research-only)

The [primary-source follow-up](research/WW2_STALL_FOUR_TRACK_FOLLOWUP_2026-11-10.md) adds ten **Spitfire VA** IAS/CLmax pairs, fourteen **P-47D-30 43-3441** flight-run gross masses and configurations, five **F6F-3 04776** fuel-adjusted original peak-normal-force coefficient bands, and fifteen explicit duplicate/dependency groups. Source registry now counts **755 rows / 200 stalls / 139 source records**. The one confirmed in-range `CAS*` remains the original Corsair handbook correction; four F4U-4 source-direct CAS rows remain four. Original NACA low-speed cockpit figures are promising, but the NACA stall recorders' airspeed instrument channel differs, so no unqualified correction is applied.

**Next data/physics gate:** (1) instrument-channel-correct original **near-stall CAS/EAS**, prioritizing P-51B-15, P-47B, Spitfire BS.543 and F4; (2) original stall figure digitization on NACA F6F-3 04776 and P-47D-30 43-3441 with per-test gross mass and configuration and retained visual error; (3) verify original F6F service IAS position-error-free definition and P-47D original instrument report; (4) independent source family splits, not row-random fit/check; (5) source-bounded new model candidate(s), especially P-47D-30 and F6F-3, after engine, propeller, drag and speed/climb intake. **No existing aircraft is yet full historical stall+sustained-turn "super good enough".** Keep hunting direct CAS as actively as correction charts. Changes in this research-only pack do not establish v3.15 physical-model validity.

## v3.14: source-ingesting historical research layer (completed)

[Source and stall evidence release](research/WW2_STALL_EVIDENCE_LAYER_2026-11-10.md) makes 726 primary/secondary-corroborated historical rows and 19 correction-curve records browsable within the sim, with six source packs, preserved original IAS/CAS, varied tested weights and automatic future ingestion. The best available airspeed candidate is labelled CAS, CAS*, corrected IAS*, plain IAS or unestablished. User priority: **continue searching for direct near-stall CAS/EAS just as aggressively as for source-original low-speed IAS correction tables**; provisional corrections are not a reason to stop looking. No historic CLmax refit has been made on these mixed-source rows.

The next complete milestone should (a) recover near-stall numeric position-error charts and source-matched engine-off tests for several additional fighter variants, (b) use the evidence registry to identify same-variant/same-configuration comparisons and correctable IAS ranges, (c) admit only scientifically validated source-conditioned inputs into the physical solver and score them against prior/withheld benchmarks, and (d) bring another genuinely sourced aircraft profile into the simulation if its power/drag/lift envelopes are adequate. Never silently extend model validity to every archival speed/altitude/weight; those ranges are unconstrained **only in the evidence layer**.

## v3.13: Mustang maneuver power

The [climb and turn-power report](V313_MANEUVER_POWER.md) extends exact chart replays and rejects the global propeller change. Seek climb TAS, in-flight weight, installed efficiency or thrust and comparable independent climb/turn observations before refitting. Keep 5:1 separate from the practical size of the performance difference and leave close historical rankings unresolved without valid bounds.

## v3.12: prepare the first twin-engine aircraft

v3.12 adds the clean P-38G-1 at full engine count and a reusable per-engine propulsion calculation. Next, seek an independent P-38G speed/climb trial with matched installation, a better installed propeller model and climb weight/cooling data. These are prerequisites to a historical error bound for the clean comparison. For fleet expansion, [aircraft intake](../references/aircraft-intake.json) lists the P-47D as a candidate pending exact specimen and configuration. [v3.12 results](V312_P38G.md)


## Climb comparison follow-up

The [20,000–30,000 ft Spitfire and Thunderbolt comparison](CLIMB_BAND_COMPARISON.md) establishes the measured test-profile difference and a reproducible replay. Seek independent curves with comparable rating policy, mass and cooling to bound the differential error. Prioritise original BS.543 Table II and independent same-installation climbs at comparable settings.

## Four-fighter comparison milestone

The [fixed scenario comparison](FOUR_FIGHTER_COMPARISON.md) is the baseline for incoming evidence. Use the isolated Mustang power budget to test source-backed engine or propeller inputs, and the P-47B turn comparison to keep power and stall limitations distinct. Retain the 12-state comparison and original archival checks when evaluating future candidates.

## Archival comparison follow-up

The [archival supplement](FOUR_FIGHTER_COMPARISON.md#november-archival-supplement) now exposes the Mustang Figure 5 power replays, BS.543 test conditions and separate external-aircraft references. Prioritize installed K.6523A-24 efficiency or thrust and cooling measurements, the original BS.543 table pages, and matched independent climb and turn evidence. The LR495 cooling reports and matched P-38G loaded trial remain separate stores research.

## Next release milestone

Recover an original F-4 flight or engine sheet for the DB 601 E above rated altitude, including the 1.42-ata setting and inlet/installation state. Check it separately against the combat-only archival transfer. For the other aircraft, prioritise independent matched-specimen runs over transferring the fast-flight corrections to different engines, intakes or cooling installations. Establish corrected clean stall points with documented CAS/EAS, weight and aircraft configuration. See [separate archival checks](INDEPENDENT_FLIGHT_CHECKS.md).

## v3.4 completed: model improvement plus interactive climb laboratory

Same-specimen P47 reserved-row MAE improves 130.4 to 34.1 ft/min; refitting constant Cd0 on identical training rows scores 99.5. The 35000-ft residual improves -432.2 to -83.6 ft/min. Both alternate splits and 9/9 paired mass/retention scenarios improve versus fair controls. The application integrates the accepted shape, report/previous/current curves, per-row fit/check roles, mass/retention controls, reset and a responsive layout. Original clean solver, source values, generic power domains and earlier aircraft calibrations are preserved. See V34_CONFIGURATION_MODEL.md for failures, parameter ambiguity and assumption ranges.

## Next complete milestone: Spitfire high-altitude power and envelope consistency

Resolve the source-bounded BS.543 high-altitude engine/boost inputs, test a correction against explicitly declared fit/check conditions, integrate it if supported, and review the four-aircraft input envelope and comparison consistency. Reuse existing source indexes; retrieve only the missing original table/engine records needed for this assignment. Keep the suspect 32000-ft boost diagnostic-only until verified; do not invent +4.7 or transfer P47 configuration coefficients.

Acceptance: a meaningful source-supported reserved-point improvement with retained unfavorable cases, matched source identity/RPM/configuration, fixed clean-speed guardrails, mass/propeller sensitivity and fair alternate splits, application integration, npm run check and browser tests. One PR and merge for the whole tested milestone. No Atlas work, additional aircraft, broad unrelated research or unsupported turn/stall claims. Michael requested larger end-to-end milestones, not another chain of small audit releases.

## v3.3 completed: same-specimen recorded-power climb replay

Ten exact 41-5902 states use report BHP/TAS/RPM and independently verified 0.5 propeller gearing. The app exposes clean versus transferred open-cooling drag. No coefficient changes. Transferred-drag scenario MAE is 114.1 ft/min; at 35000 ft it underpredicts by 432.2 ft/min. These are newly exposed conditional checks with gross-as-tested mass, not certified historical accuracy. Spitfire Table II pixels remain unavailable; 32000 ft stays diagnostic-only.

## Next cohesive milestone: source-bounded configuration drag

Test a bounded cooling/configuration-drag shape against the recorded-power 41-5902 states. Declare fit/check rows before searching; retain the 35000-ft failure and compare against the fixed transferred-drag control on identical conditions. Require a material reserved-row gain, preserved clean speed and existing source-climb regressions, and sensitivity to mass/installed propeller assumptions. All new rows are already exposed, not blind evidence. Keep the Spitfire boost-source blocker separate. No additional aircraft, Atlas work, broad data collection or turn/stall accuracy claims.

Acceptance: source hashes, exact RPM/BHP state isolation, no observed-rate use in prediction, no unsupported altitude extension, npm run check and hosted browser smoke. Stop after the tested milestone and one PR.

## v3.2 completed: high-altitude validation and overall progress

The fixed model underpredicts the new Spitfire 34000-ft observation by 261.8 ft/min. The 32000-ft row remains diagnostic-only pending scan verification; higher unsupported observations are blocked. Original P47 scans establish different climb and speed/power specimens. Strict matching rejects this transfer while earlier engineering scenarios remain reproducible and qualified. See V32_HIGH_ALTITUDE_VALIDATION.md and OVERALL_PROGRESS_PRE_PR1_TO_NOW.md.

## Next cohesive milestone: resolve high-altitude power inputs

Verify Spitfire BS.543 Table II 32000-ft boost against original pixels, and establish source-matched P47 climb engine/propeller RPM before testing a power-law replacement. Prioritize these missing conditions rather than more unrelated observations. Use the new 34000-ft residual as an exposed engineering check, not an unseen holdout. Do not refit until inputs support a fair comparison.

Acceptance: source-matched identities, rating/gear, actual or explicitly qualified mass, airspeed and cooling state; before/after residuals and unresolved input gaps; no invented source interpolation; npm run check and the conditioned-climb browser smoke. No Atlas work, new aircraft or unsupported turn/stall claims.
