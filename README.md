# European Air War Physics

A separate research repository for the shared WWII flight-performance engine. The Atlas website in [hound83/ww2-airwar](https://github.com/hound83/ww2-airwar) is outside this repository's scope.

**Current state: imported v2.5 working baseline; v3.0 is in development and is not validated.** The stall-calibration milestone adds an executable source gate and four-aircraft scenario sensitivity. Default coefficients and v2.5 numerical predictions remain unchanged.

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

## Next milestone

The first bounded stall milestone is implemented: see [source audit](docs/STALL_SOURCE_AUDIT.md) and [generated comparison](docs/STALL_CALIBRATION_RESULTS.md). The [P-51B source audit](docs/P51_LOW_SPEED_CALIBRATION_AUDIT.md) found no matched near-stall correction; calibration now checks installation identity and instrument-correction convention. Next, audit the P-47B contemporaneous stall weight. Do not add aircraft or redesign the Atlas. See [NEXT_STEPS.md](docs/NEXT_STEPS.md).
