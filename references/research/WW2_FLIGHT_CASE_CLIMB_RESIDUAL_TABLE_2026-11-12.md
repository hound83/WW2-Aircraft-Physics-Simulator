# Before-scorecard residual table — flight-case climb + seven-aircraft propulsion

**As of:** 2026-11-12  
**Baseline:** v4.9.0-rc.2 / v4.10.0-rc.2 research candidate (propeller passes applied; climb path largely unchanged)  
**Status:** frozen before-scorecard for the major milestone. Research only.

The machine-readable before-scorecard is archived with the analysis records. [Residual table JSON](../analysis/ww2_flight_case_climb_residual_table_2026-11-12.json)

## Two priority climb cases

### 1. Fw 190 A-4 WNr 783 open-cooling climb
- Source: Focke-Wulf Flugbericht 190/783 Nr. 1 (and related Nr. 2/5), combat 2400 rpm, ~3870 kg takeoff.
- Live path currently omits an existing matched open-cooling term.
- Recorded climb rates exist (open vs closed); exact live residual against open-cooling schedule is the item to re-score.
- Propeller efficiency: **missing** (installation evidence only). Do not invent η.
- Residual class: cooling/intake + missing useful-power observation.

### 2. P-38G 42-12687 timed climb (Wright Field FS-M-19-1538-A §B.4)
- Source elapsed: **340.80 s** from sea level to 20,000 ft. The report gives **168.60 s** to 10,000 ft. [Wright Field B.4 transcription](../p38g-42-12687.json)
- Seven open-cooling climb checks: **173.3 ft/min** mean absolute error (unchanged by propeller passes; 10 000 ft cooling anchor excluded).
- Sea-level residual ≈ **+411 ft/min**.
- Timed-climb path currently omits kinetic-energy term for increasing TAS. Opt-in `accountForTasChange` exists; baselines unchanged.
- Propeller efficiency: **estimated** (80 % conversion on part-power; full-power joint check still open).
- Residual class: missing TAS-energy term + aggregate cooling/power balance.

## Seven-aircraft climb residual snapshot (existing scorecard, post-propeller passes)

Climb residuals are mean absolute error in ft/min. Same-report checks exclude designated fit points. Propeller passes did not change these climb numbers.

| Aircraft | Series | Points | Before → After (prop passes) | Notes / residual class |
| --- | ---: | ---: | --- | --- |
| P-47B 41-5902 | open-cooling climb | 5 | 32.4 → 32.4 | Reserved points; existing open-cooling fit. η 76 % derived. |
| P-47B 41-5942 | transfer | 5 | 77.9 (transfer) | Separate airframe. |
| Spitfire LF IX BS.543 | Table II open radiators | 10 | 64.5 → 64.5 | Boost-conditioned chart BHP. η 80 % derived (closed). |
| P-38G 42-12687 | open coolers | 7 | 173.3 → 173.3 | Sea-level ~+411 ft/min. η estimated. |
| F4U-4 80765 | max-climb diagnostics | 7 | 139.9 → 139.9 | Solver chooses TAS. 25 500 ft Military −371 ft/min. η 80 % derived. |
| P-51B 43-24777 | racked climbs | 5 | 105.6 (<10k ft); 333.2 (one point above) | Conditional. η 80 % derived (low-blower). |
| Fw 190 A-4 WNr 783 | open-cooling (live path omits term) | — | not re-scored on open path | η missing. |
| Bf 109 F-4 | — | — | no supported climb score | η missing. |

## Propulsion residual classification (using graded η pack)

| Residual driver | Affected cases | Grade of current η | Action for this milestone |
| --- | --- | --- | --- |
| Missing TAS-energy term | P-38G timed climb | estimated | Apply opt-in; re-score elapsed time |
| Omitted open-cooling term | Fw 190 WNr 783 live path | missing | Apply matched area; re-score climb |
| Aggregate cooling / intake fit | P-47B, Spitfire, P-38G climbs | derived/estimated | Report shaft / useful / drag; do not refit |
| High-blower / tip-Mach | P-51B, Spitfire, F4U-4 | derived (partial) | Hold existing bands; flag |
| Missing direct η | Fw 190 A-4, Bf 109 F-4 | missing | Leave unresolved; no estimate without labeled basis |

## Practical margins (unchanged)
- 6 km/h TAS
- 5 % climb or timed-run
- 0.5 °/s sustained turn

## Freeze statement
This table is the before-scorecard. Next step is to apply the matched open-cooling input on WNr 783 and the TAS-energy term on the P-38G timed climb, then produce the after table. No new coefficients. Propeller references stay inside graded envelopes.

## Sources
- `docs/V410_CLIMB_TURN_AND_FORMULA_AUDIT.md`
- `docs/V410_REMAINING_PROPELLERS.md`
- `docs/CLIMB_POWER_COOLING_DIAGNOSIS.md`
- `references/fw190a4-783.json`
- `references/p38g-42-12687.json`
- Propeller-efficiency pack (2026-11-12)
