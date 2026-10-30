# European Air War Physics

A separate research repository for the shared WWII flight-performance engine. The Atlas website in [hound83/ww2-airwar](https://github.com/hound83/ww2-airwar) is outside this repository's scope.

**Current version: v2.6.0 research increment; v3.0 and historical accuracy remain unresolved.** This combines the four-aircraft evidence gates, performance diagnostics, Mustang chart reconstruction and coupled propeller audit. Default coefficients and v2.5 numerical predictions remain unchanged. See [v2.6.0 release notes](releases/v2.6.0.md).

Initial benchmarks: **Bf 109 F-4, P-47B, P-51B-15 and Spitfire LF Mk IX**. Greg's worksheets and the controlled P-47 2,000/2,600 hp comparison are retained. The 2,600 hp scenario is not a verified P-47B engine rating.

[![Physics regression](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/regression.yml/badge.svg)](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/workflows/regression.yml)

GitHub setup is complete. The frozen import is on branch **baseline/v2.5-import**. See [setup verification](docs/SETUP_VERIFICATION.md).

## Start here

Read [decisions](docs/DECISIONS.md), [known limitations](docs/KNOWN_LIMITATIONS.md), [next steps](docs/NEXT_STEPS.md), [workflow](docs/WORKFLOW.md) and the [current validation report](docs/CURRENT_VALIDATION.md). Repository instructions for development agents are in [AGENTS.md](AGENTS.md).

Requires Node.js 22 or newer. No npm packages are needed.

```sh
npm run check
```

This verifies the tracked import, builds the standalone HTML and runs all regression scripts, then updates the validation report and numerical comparison against the frozen baseline. Run `npm test` for tests only, or `npm run validate` to refresh results.

Open `dist/model.html` after building. The unchanged original interface is [releases/baseline-v2.5.html](releases/baseline-v2.5.html). Browser interaction tests from the handover are preserved but have not been rerun here; static syntax and embedding checks are distinct from browser tests.

## Repository map

| Directory | Purpose |
|---|---|
| src/ | Shared physics engine |
| aircraft/ | Aircraft, engine, Greg and external-store records |
| references/ | Source register, original Greg material, research and frozen import |
| validation/ | Diagnostic scripts, baseline snapshots and current results |
| tests/ | Portable regression scripts |
| scripts/ | Build, validation and import-integrity commands |
| docs/ | Decisions, evidence gates, limitations and continuation instructions |
| releases/ | Original standalone v2.5 HTML and milestone notes |

The original archive had 378 files. A per-file [import manifest](references/IMPORT_MANIFEST.json) records all of them, including checksums and explicit exclusions. Nested release ZIPs and two scans over 10 MiB stay outside Git; their identity and recovery locations are recorded. The tracked import is frozen. Older standalone HTML snapshots remain because inherited static tests exercise their version history.

## Scientific status

Passing regressions means the imported behavior is reproducible. It does not demonstrate historical accuracy. Near-stall IAS corrections and clean CLmax remain provisional for all four aircraft. The Mustang climb shortfall, simulator-conditioned Bf 109 scenario and P-47 OCR correction are open issues.

The 5:1 separation criterion is an acceptance target, not achieved accuracy. Matchups without adequate independent, matched-condition evidence must be reported as unresolved.

## Current validation and next step

The [consolidated four-aircraft stall review](docs/FOUR_AIRCRAFT_STALL_REVIEW.md) brings the source audits, executable evidence gate, sensitivity comparisons and unresolved conditions together. The Spitfire audit corrects clipped-wing and drop-tank attribution. Default coefficients and numerical predictions are unchanged; historical stall calibration remains blocked for all four targets.

The [four-aircraft speed/climb validation package](docs/PERFORMANCE_VALIDATION.md) now covers 69 records, keeping anchor fits, diagnostic errors, condition exclusions and independent scores separate. It preserves the Mustang climb shortfall and controlled P-47 power experiment. None of these legacy checkpoints currently establishes independently matched accuracy or 5:1 separation.

The [climb power/cooling diagnosis](docs/CLIMB_POWER_COOLING_DIAGNOSIS.md) quantifies the Mustang useful-power deficit, distinguishes shaft power from propulsive power, and tests the sign of cooling-loss explanations against P-47/Spitfire conditions. It introduces no unverified drag or efficiency correction.

The [Mustang chart-state reconstruction](docs/P51_CLIMB_STATE_RECONSTRUCTION.md) retains original Figure 4, five normalization-weight brackets and five low-blower chart-power brackets. Joint sampled scenarios still leave 322/268 ft/min shortfalls at 2,200 ft under C; the source weight curve is not adopted as matched climb mass. No default correction.

The [installed-propeller audit](docs/P51_PROPELLER_EFFICIENCY_AUDIT.md) tests C/D/N/M against the speed anchor, recorded-RPM power checkpoints and chart-state climb scenarios. No measured target map is established; reanchored alternatives worsen sampled climb maxima, so C remains the default. The built HTML identifies this as research v2.6.0.

Related research, code, tests and documentation are handled as one cohesive milestone without another GO for each routine step. See [the next complete assignment](docs/NEXT_STEPS.md). No Atlas redesign or additional aircraft.
