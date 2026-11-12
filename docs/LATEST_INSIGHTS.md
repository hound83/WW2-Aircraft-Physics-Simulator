# Latest insights

Pointer file for agents starting a new milestone. Not a second model of record. Prefer the merged state on `main` plus any open PRs.

## Shared research / implementation roadmap (2026-11-12)

### Immediate next implementation
1. **Shared flight-case climb calculation** (highest-priority implementation)
   - Apply the existing matched open-cooling input to the Fw 190 A-4 WNr 783 live benchmark climb (currently omitted in the live path).
   - Add the kinetic-energy term for changing TAS in the timed-climb energy budget, starting with the P-38G Wright Field B.4 report (source elapsed 340.80 s).
   - Keep current v4.10 propeller references in their supported bands.
   - Freeze before-scorecard, re-score both cases, run `npm run check` + browser smoke, confirm four-aircraft scorecard does not regress outside accepted tolerances, update validation/limitations/next-steps.
   - Status: next agreed implementation milestone. Data already present; no new model invention required.
   - Refs: `docs/NEXT_STEPS.md`, `docs/V410_CLIMB_TURN_AND_FORMULA_AUDIT.md`, `docs/LATEST_INSIGHTS.md`.

### Near-term research (can run in parallel)
2. **Propeller-efficiency data pack** for the seven-aircraft Normal/Combat benchmark
   Graded observations (observed / derived / estimated / missing), matched conditions (mass, rating, RPM, gear, cooling/intake, airspeed basis), tip-Mach corrections, and installation notes.
   Output: compact JSON + short Markdown research note under `references/research/`.
   Status: high-leverage research; existing scorecards and NACA leads already available. Do not block the climb milestone.

### Follow-on (after climb calculation is stable)
3. **Mustang–Spitfire crossover** for usable lift and drag above 1 G at equal EAS.
   Use existing NACA TN 1044 and report evidence; constrain any new coefficient with powered-turn or matched-load drag data.
4. Cooling / intake residual audit (still listed as unresolved).
5. Sustained-turn and near-stall evidence tightening where primary matched data exists (do not invent CLmax).

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
