# Latest insights

Pointer file for agents starting a new milestone. Not a second model of record. Prefer the merged state on `main` plus any open PRs.

## Shared research / implementation roadmap (2026-11-12)

### Near-term (research-first)
1. **Propeller-efficiency data pack** for the seven-aircraft Normal/Combat benchmark  
   Graded observations (observed / derived / estimated / missing), matched conditions (mass, rating, RPM, gear, cooling/intake, airspeed basis), tip-Mach corrections, and installation notes.  
   Output: compact JSON + short Markdown research note under `references/research/`.  
   Status: highest-leverage next research milestone. Existing scorecards and NACA leads already available.

### Next implementation candidate
2. **Shared flight-case climb calculation**  
   - Apply matched open-cooling input for the Fw 190 A-4 WNr 783 live benchmark climb.  
   - Account for changing TAS in the timed-climb energy budget (starting with the P-38G Wright Field report).  
   - Keep current propeller references in their supported bands.  
   Status: next agreed implementation milestone after the prop pack (or in parallel if data is ready).

### Parallel / follow-on
3. Cooling / intake residual audit (still listed as unresolved).  
4. Mustang–Spitfire crossover for usable lift/drag above 1 G.  
5. Sustained-turn and near-stall evidence tightening where primary data exists.

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
