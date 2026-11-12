# After-extraction note — flight-case climb residual (research)

**As of:** 2026-11-12  
**Baseline:** before-scorecard in `ww2_flight_case_climb_residual_table_2026-11-12.json`  
**Status:** extraction of available source numbers and blocked paths. No new coefficients. No solver change.

## 1. Fw 190 A-4 WNr 783 open-cooling climb

### Source observations (graded)
From `references/fw190a4-783.json` (Flugbericht 190/783 Nr. 1 climb graph):

| Altitude m | Open climb m/s | Closed m/s | Role | Grade |
| ---: | ---: | ---: | --- | --- |
| 0 | 14.55 | — | check | observed |
| 2000 | 13.7 | — | check | observed |
| 4000 | 12.1 | — | check | observed |
| 5000 | 12.1 | 13.15 | cooling-anchor | observed |
| 6000 | 12.05 | — | check | observed |
| 7000 | 9.95 | — | check | observed |
| 8000 | 7.3 | — | check | observed |
| 9000 | 4.8 | — | check | observed |
| 10000 | 2.15 | — | check | observed |

Reading tolerance: 0.35 m/s. Combat 2400 rpm, ~3870 kg takeoff. Internal vs long intake must be matched separately.

### Live path status
- `aircraft/fw190a4.json` does **not** contain `climbCoolingAreaM2`.
- `src/operating-benchmark.js` applies `addedDragAreaM2` only when `model.climbCoolingAreaM2` is present (line ~129).
- Therefore the matched open-cooling input cannot be applied on the live path without first supplying the area from an existing source-bounded fit.
- **Residual after extraction:** still blocked. Do not invent an area.  
  Residual class remains: omitted cooling term + missing direct η.

### What would close it
Supply a graded `climbCoolingAreaM2` taken from an existing same-installation fit (or clearly label any estimate), then re-score the open rows above. Until then the before residual stands.

## 2. P-38G 42-12687 timed-climb energy term

### Source
- Wright Field FS-M-19-1538-A §B.4.
- Source elapsed cited in audits: **340.80 s**.
- Current open-cooling climb MAE: **173.3 ft/min** (7 points; 10 000 ft cooling anchor excluded).
- Sea-level residual ≈ **+411 ft/min**.

### Code status
- Kinetic-energy debit for increasing TAS is implemented as opt-in `options.accountForTasChange` in the timed-climb integrator (`src/operating-benchmark.js` ~354–368).
- Existing baselines are unchanged when the flag is off.
- Enabling the flag increases required power (reduces available climb rate) whenever the speed schedule calls for higher TAS; elapsed time lengthens.

### After residual
- Not re-scored here (requires running the integrator with the flag and the exact speed schedule).
- Expected direction: elapsed time increases relative to the current baseline; residual vs 340.80 s will change by the KE debit magnitude.
- **Residual after extraction:** still the before value until the opt-in is exercised and the after elapsed time is recorded.  
  Residual class: missing TAS-energy term (code present, not applied to baseline) + aggregate cooling/power.

## 3. Seven-aircraft climb residual (unchanged)
Propeller passes did not alter climb MAE. No new numbers from this extraction:

| Aircraft | Climb MAE ft/min | η grade | Notes |
| --- | ---: | --- | --- |
| P-47B 41-5902 | 32.4 | derived | existing open-cooling fit |
| P-47B 41-5942 | 77.9 | derived | transfer |
| Spitfire LF IX | 64.5 | derived | open radiators |
| P-38G | 173.3 | estimated | sea-level ~+411 |
| F4U-4 | 139.9 | derived | 25 500 ft Military −371 |
| P-51B | 105.6 (<10k) | derived | one point above 333.2 |
| Fw 190 WNr 783 | — | missing | open path blocked |
| Bf 109 F-4 | — | missing | no supported climb score |

## 4. Propulsion residual classification (after extraction)

| Driver | Status after this extraction | Next action |
| --- | --- | --- |
| Omitted open-cooling term (Fw 190) | Blocked — no `climbCoolingAreaM2` on model | Supply graded area from existing fit, then re-score |
| Missing TAS-energy term (P-38G) | Code present as opt-in; baseline unchanged | Run integrator with flag; record after elapsed time |
| Aggregate cooling/intake | Unchanged | Report shaft/useful/drag; do not refit |
| Missing direct η (Fw 190, Bf 109) | Unchanged | Leave missing |
| High-blower / tip-Mach | Unchanged | Hold graded bands |

## Freeze
This is the after-extraction note. It records the source open-climb numbers for WNr 783 and confirms both priority residuals remain open until the cooling area is supplied and the TAS-energy flag is exercised. No coefficients were added.

## Lineage
- `references/fw190a4-783.json`
- `references/p38g-42-12687.json`
- `src/operating-benchmark.js` (cooling apply + accountForTasChange)
- Before-scorecard residual table (2026-11-12)
- Propeller-efficiency pack (2026-11-12)
