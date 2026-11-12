# European Air War Physics

**Data collection update, 11 November 2026:** [thirteen-aircraft source recovery](docs/research/WW2_THIRTEEN_FIGHTER_DATA_2026-11-11.md) adds152 evidence/condition records and the research-only Bf109G-2. Catalog:1,205 records,214 source entries. Fixed-rubric primary80/augmented90 targets remain unmet for most aircraft; this is a data checkpoint, with no solver or flyable-roster change.

The [live simulator](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#operating-benchmark) runs the **4.10.0-rc.2 research candidate**. The Lightning uses the report's Military level shaft-power schedule with a bounded high-speed propeller loss. [Five-aircraft propeller follow-up](docs/V410_REMAINING_PROPELLERS.md) · [Corsair and Thunderbolt](docs/V410_PROPELLER_REFERENCE.md). Timed climb and acceleration compare equal-start runs, and the altitude table and turn plot show practical tie and lead results. Line styles follow operating-input provenance. [Timed runs and four-aircraft replay](docs/V49_TIMED_MATCHUPS.md).

The [v4.1 installed-energy candidate](docs/V41_ENERGY_RESULTS.md) improves matched-source climb checks for P-47B, Spitfire IX, P-38G, Fw 190 A-4 and P-51B in the live comparison. Source/reference switching, 48 energy checks and a separate-report P-47 transfer make the changes inspectable. Version 4.1.0-rc.1 remains a research candidate; historical sustained-turn 5:1 accuracy is unresolved.

The [v4.0 research candidate](docs/V4_MILESTONE.md) adds a live seven-aircraft maneuver envelope, F4U-4 Corsair profile, paired P-47B propeller and P-51B rack checks, and climb-time integration with changing fuel mass. Download the main CI artifact and open `dist/model.html`. Full historical sustained-turn accuracy remains unresolved.

The [v3.15 turn/stall correction](docs/TURN_STALL_CORRECTION.md) adds bounded Mustang lift to the live explorer.

A separate research repository for the shared WWII flight-performance engine. The Atlas website in [hound83/ww2-airwar](https://github.com/hound83/ww2-airwar) is outside this repository's scope.

**Current research version v3.14.0**, plus a separately versioned [four-track original-source follow-up](docs/research/WW2_STALL_FOUR_TRACK_FOLLOWUP_2026-11-10.md). The historical research layer now ingests **755 source-linked rows**, including **200 stall/minimum-speed observations**, **139 indexed source records** and **19 calibration-curve records**. New original NACA Spitfire VA IAS/CLmax pairs, P-47D-30 test-specific run weights and F6F-3 fuel-adjusted normal-force coefficients are source-linked and explicitly separated from validated CAS; no unsafe near-stall conversion or model refit was introduced. The [v3.14 release baseline](docs/research/WW2_STALL_EVIDENCE_LAYER_2026-11-10.md) had 726 rows / 190 stalls. [Mustang climb and sustained-turn power](docs/V313_MANEUVER_POWER.md) remains the v3.13 physical-model baseline. In v3.12, [P-38G-1 and symmetric multi-engine propulsion](docs/V312_P38G.md) add a sixth aircraft, a clean P-38G vs P-47B comparison and Wright Field replays. In v3.11, [Fw 190 A-4 and the new altitude-power model](docs/V311_FW190A4.md) are available in the fifth-aircraft comparison. In v3.10, [Operational climb and aircraft intake](docs/V310_OPERATIONAL_CLIMB.md) add matched rating policies and prepare the Fw 190 A-4. Separate flight reports check the P-47B, Spitfire and Mustang models without refitting them. See [external checks](docs/INDEPENDENT_FLIGHT_CHECKS.md) and the [four-aircraft scorecard](docs/FLIGHT_SCORECARD.md).

Initial benchmarks: **Bf 109 F-4, P-47B, P-51B-15 and Spitfire LF Mk IX**. Greg's worksheets and the controlled P-47 2,000/2,600 hp comparison are retained. The 2,600 hp scenario is not a verified P-47B engine rating.

[![Physics regression](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/regression.yml/badge.svg)](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/regression.yml)

GitHub setup is complete. The frozen import is on branch **baseline/v2.5-import**. See [setup verification](docs/SETUP_VERIFICATION.md).

## Start here

Open the [live simulator](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/) and start with **Normal / Combat benchmark**. Choose **Historical evidence library** to filter source data and IAS/CAS status or **Compare clean stall speeds** for exploratory stall calculations. For offline use, download the **physics-validation** artifact from a successful [Physics regression](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/regression.yml) run on `main`, extract the ZIP and open `dist/model.html`. GitHub requires sign-in for Actions artifact downloads.

For a local build with Node.js 22 or newer, run `npm run build` and open `dist/model.html`. For development and validation, follow the instructions below.

Read [decisions](docs/DECISIONS.md), [known limitations](docs/KNOWN_LIMITATIONS.md), [next steps](docs/NEXT_STEPS.md), [workflow](docs/WORKFLOW.md) and the [current validation report](docs/CURRENT_VALIDATION.md). Repository instructions for development agents are in [AGENTS.md](AGENTS.md).

Requires Node.js 22 or newer. No npm packages are needed. The separate interactive smoke test uses an installed headless Chrome or Edge executable; set BROWSER_PATH if it is not in a standard location.

```sh
npm run check
```

This verifies the tracked import, builds the standalone HTML and runs all regression scripts, then updates the validation report and numerical comparison against the frozen baseline. Run `npm test` for tests only, or `npm run validate` to refresh results. Run `npm run test:browser` after building to exercise the controls and record browser errors.

Open `dist/model.html` after building. The unchanged original interface is [releases/baseline-v2.5.html](releases/baseline-v2.5.html). The new headless Chromium smoke test exercises the current application separately from inherited assertions; see validation/current/browser-smoke.json for the actual result, tested version and scope.

## Repository map

| Directory | Purpose |
|---|---|
| src/ | Shared physics engine |
| aircraft/ | Aircraft, engine, Greg and external-store records |
| references/ | Source registers, compact versioned `research/*.json` packs and frozen import |
| validation/ | Diagnostic scripts, baseline snapshots and current results |
| tests/ | Portable regression scripts |
| scripts/ | Build, validation and import-integrity commands |
| docs/ | Decisions, evidence gates, limitations and continuation instructions |
| releases/ | Original standalone v2.5 HTML and milestone notes |

The original archive had 378 files. A per-file [import manifest](references/IMPORT_MANIFEST.json) records all of them, including checksums and explicit exclusions. Nested release ZIPs and two scans over 10 MiB stay outside Git; their identity and recovery locations are recorded. The tracked import is frozen. Older standalone HTML snapshots remain because inherited static tests exercise their version history.

## Scientific status

Passing regressions means the imported behavior is reproducible. It does not demonstrate historical accuracy. Near-stall IAS corrections and clean CLmax remain provisional for all four aircraft. The P profile greatly reduces the two conditional Mustang climb residuals. Instantaneous mass/airspeed, simulator-conditioned Bf 109 assumptions and the P-47 OCR correction remain open.

The 5:1 separation criterion is an acceptance target, not achieved accuracy. Matchups without adequate independent, matched-condition evidence must be reported as unresolved.

## Earlier validation and current next step

**v2.8 supersedes the default-model decisions in the earlier milestones below.** C compatibility tests still retain all 3628 legacy numbers within numeric tolerance; P deliberately changes working predictions. The [v2.8 results](docs/V28_RESULTS.md) show gains, regressions, weight sensitivity and the prior P-47 conditional baseline. Use `npm run diagnose:joint-calibration` to repeat the bounded fit. Raw API calls keep C for compatibility; request `{profile:'P'}` for the new fit. The UI e control is a scenario scale around each fitted e at slider value 0.78; it is not a new measurement. The existing simulator/Greg Bf 109 scenarios remain separate from historical evidence.

Next: [high-altitude source-condition validation](docs/NEXT_STEPS.md).

The following paragraphs document previous milestones and their decisions at that time.

The [consolidated four-aircraft stall review](docs/FOUR_AIRCRAFT_STALL_REVIEW.md) brings the source audits, executable evidence gate, sensitivity comparisons and unresolved conditions together. The Spitfire audit corrects clipped-wing and drop-tank attribution. Default coefficients and numerical predictions are unchanged; historical stall calibration remains blocked for all four targets.

The [four-aircraft speed/climb validation package](docs/PERFORMANCE_VALIDATION.md) now covers 69 records, keeping anchor fits, diagnostic errors, condition exclusions and independent scores separate. It preserves the Mustang climb shortfall and controlled P-47 power experiment. None of these legacy checkpoints currently establishes independently matched accuracy or 5:1 separation.

The [climb power/cooling diagnosis](docs/CLIMB_POWER_COOLING_DIAGNOSIS.md) quantifies the Mustang useful-power deficit, distinguishes shaft power from propulsive power, and tests the sign of cooling-loss explanations against P-47/Spitfire conditions. It introduces no unverified drag or efficiency correction.

The [Mustang chart-state reconstruction](docs/P51_CLIMB_STATE_RECONSTRUCTION.md) retains original Figure 4, five normalization-weight brackets and five low-blower chart-power brackets. Joint sampled scenarios still leave 322/268 ft/min shortfalls at 2,200 ft under C; the source weight curve is not adopted as matched climb mass. No default correction.

The [installed-propeller audit](docs/P51_PROPELLER_EFFICIENCY_AUDIT.md) tests C/D/N/M against the speed anchor, recorded-RPM power checkpoints and chart-state climb scenarios. No measured target map is established; reanchored alternatives worsen sampled climb maxima, so C remained the default until the v2.8 joint engineering fit. The built HTML identifies this as the current research version.

The [source-chart climb mode](docs/SOURCE_CHART_CLIMB_MODE.md) adds exact-node chart-power diagnostics through the shared solver. Run `npm run diagnose:source-chart`; no implicit weight, interpolation or default numerical change. See [what has improved so far](docs/PROGRESS_ASSESSMENT.md) for the distinction between evidence/engineering gains and unresolved historical accuracy.

Related research, code, tests and documentation are handled as one cohesive milestone without another GO for each routine step. See [the next complete assignment](docs/NEXT_STEPS.md). No Atlas redesign or additional aircraft.
