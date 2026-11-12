# Latest insights

Pointer file for agents starting a new milestone. Not a second model of record. Prefer the merged state on `main` plus any open PRs.

## Current research candidate
- Version: 4.10.0-rc.2
- Commit: see main branch
- Status: research candidate; historical 5:1 and exact stall/CLmax remain unresolved

## Next agreed milestone
Shared flight-case climb calculation:
- Apply matched open-cooling input for the Fw 190 A-4 WNr 783 live benchmark climb
- Account for changing TAS in the timed-climb energy budget (starting with the P-38G Wright Field B.4 report)
- Keep current propeller references in their supported bands
- After this, Mustang–Spitfire crossover for usable lift/drag above 1 G

## Open gaps to respect
- Sustained-turn and near-stall accuracy unresolved
- Cooling is an aggregate installed-energy fit
- P-38G sea-level residual and Fw 190 missing recorded climb TAS remain open
- Exact corrected stalls for most aircraft remain open (see STALL_WEIGHT_GATE.md)

## Recent research notes
See `docs/research/` and the v4.10 propeller and climb-turn audit documents.

Last updated: 2026-11-12
