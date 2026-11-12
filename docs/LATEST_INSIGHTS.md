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
   - Use the graded propeller-efficiency pack (`references/research/ww2_propeller_efficiency_benchmark_2026-11-12.json`).
   - Report shaft power, useful propeller power, and drag power at matched conditions.
   - Identify which residuals are still cooling/intake, tip-Mach, or missing German η.

3. **Seven-aircraft scorecard**
   - Level speed, climb, and (where data exist) acceleration/sustained-turn sensitivity under existing margins (6 km/h TAS, 5 % climb, 0.5 °/s turn).
   - Explicit unsupported matchups remain marked unresolved.

**Acceptance (research/beta):** before/after residuals reported; `npm run check` + browser smoke pass; four-aircraft scorecard does not regress outside tolerances; no new unsupported coefficients; residual gaps documented rather than closed by assumption. Candidate pack + scorecard under `references/research/`.

**Non-goals:** new aircraft intake, claimed 5:1, validated/stable release, untargeted stall/CLmax refits.

Status: starting. Propeller pack already committed. Climb energy term partially implemented as opt-in.

### Near-term research (parallel or follow-on)
- Propeller-efficiency pack (done 2026-11-12; residual gaps remain for Fw 190 / Bf 109).
- Mustang–Spitfire crossover for usable lift/drag above 1 G.
- Cooling / intake residual audit.
- Sustained-turn and near-stall evidence tightening where primary matched data exists.

## Current research candidate
- Version: 4.10.0-rc.2
- Commit: see main branch
- Status: research candidate; historical 5:1 and exact stall/CLmax remain unresolved

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
