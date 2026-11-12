# Shared flight-case climb + seven-aircraft propulsion residual closure

**As of:** 2026-11-12  
**Status:** research candidate / starting implementation evidence  
**Milestone:** larger than the propeller-efficiency pack. Combines the agreed climb calculation with a bounded residual audit.

## Goal
Same matched flight cases improve both climb accuracy and the energy/maneuver comparisons without new unsupported coefficients.

## 1. Flight-case climb (data-ready items)

### Fw 190 A-4 WNr 783 open-cooling climb
- Live benchmark currently omits an existing cooling term.
- Matched open-cooling input is already identified in prior audits.
- Action: apply the matched open-cooling area on the live path; re-score against the source climb.
- Propeller references stay inside their graded envelopes (see propeller-efficiency pack).

### P-38G timed-climb energy budget
- Wright Field B.4 report: source elapsed 340.80 s.
- Timed climbs currently omit the energy required when the speed schedule calls for increasing TAS.
- Action: include the kinetic-energy term for changing TAS; re-score the timed climb.
- Note: TAS-energy debit has been implemented as an opt-in (`options.accountForTasChange`). Existing baselines unchanged.

## 2. Propulsion residual audit on the same cases
Use the graded propeller-efficiency pack:
`references/research/ww2_propeller_efficiency_benchmark_2026-11-12.json`

At each matched condition report:
- Shaft power (source or chart)
- Useful propeller power (η × shaft, with grade)
- Drag power
- Residual (speed or climb)

Identify which residuals remain:
- Cooling / intake (aggregate installed-energy fit)
- Tip-Mach / high-blower
- Missing direct η (Fw 190 A-4, Bf 109 F-4)

## 3. Seven-aircraft scorecard
- Level speed, climb, and (where data exist) acceleration / sustained-turn sensitivity.
- Existing practical margins: 6 km/h TAS, 5 % climb or timed-run, 0.5 °/s sustained turn.
- Unsupported matchups stay marked unresolved.
- Four-aircraft regression must not regress outside accepted tolerances.

## Acceptance (research/beta only)
- Before/after residuals reported for the two climb cases and the seven-aircraft set.
- `npm run check` and browser smoke pass.
- No new unsupported coefficients; propeller references stay inside graded envelopes.
- Residual gaps documented rather than closed by assumption.
- Candidate pack + scorecard under `references/research/`.

## Non-goals
- New aircraft intake.
- Claimed historical 5:1 or validated/stable release.
- Untargeted stall / CLmax refits.

## Current open gaps that this milestone respects
- Sustained-turn and near-stall accuracy unresolved.
- Cooling is an aggregate installed-energy fit.
- P-38G sea-level residual and Fw 190 missing recorded climb TAS remain open.
- Direct measured propeller efficiency missing for Fw 190 A-4 and Bf 109 F-4.
- Exact corrected stalls for most aircraft remain open.

## Lineage
- `docs/V410_CLIMB_TURN_AND_FORMULA_AUDIT.md`
- `docs/CLIMB_POWER_COOLING_DIAGNOSIS.md`
- `docs/NEXT_STEPS.md`
- Propeller-efficiency pack (2026-11-12)
- Existing cooling and climb-condition JSON packs under `references/`

## Next concrete actions
1. Freeze before-scorecard for WNr 783 open-cooling climb and P-38G timed climb.
2. Apply matched cooling input and TAS-energy term; re-score.
3. Produce residual table (shaft / useful / drag / residual) for the seven-aircraft set using the graded η pack.
4. Commit scorecard and residual note under `references/research/`.
5. Hand off for Codex integration or joint review; do not claim stable release.
