# Clean Physics v0.9 — lift and induced-drag sensitivity

Date: 26 October 2026. **This is not a historical calibration or a new flight-tested turn model.** Original v0.7 HTML remains untouched; the baseline `physics.js` and previous clean v0.8 amendments remain intact.

## What we implemented

- A reproducible **3 × 3 assumption grid for each of the three aircraft**, computed by the same existing solver, with Oswald `e = 0.60 / 0.78 / 0.90` and CLmax `0.85 × / 1.00 × / 1.15 ×` the existing assumed baseline value. These are exploratory settings, **not** measured lower/upper limits or statistical confidence intervals.
- All three aircraft evaluated at the **same 5,000 ft altitude and 170 mph EAS**, which fixes air-density comparison and speed definition. This is deliberately not a matched historical engine rating, pilot/airframe condition, or test weight.
- Outputs for clean-stall speed (EAS), instantaneous turn rate, sustained turn rate at 170 mph EAS, and peak instantaneous/sustained turn rates found over 90–300 mph EAS. Search resolution 1 mph. The peaks are model-derived, not measured.
- Uses the existing fixed CD0 from the original aircraft-specific speed anchor. **Changing `e` does not refit CD0 or engine power** for each scenario; consequently max-speed anchor performance can shift. This is a true one-variable sensitivity exercise, not a set of separately calibrated aircraft models.
- Adds `test_lift_v09.cjs` to verify that CLmax changes move stall/lift constraints in the right direction; higher Oswald `e` reduces induced drag and cannot lower sustained turn under frozen assumptions; original baseline remains unchanged.

Run `node lift_sensitivity.cjs` for concise results or `node lift_sensitivity.cjs --json` for all 27 scenarios.

## Preliminary results at 5,000 ft, 170 mph EAS

| Aircraft | Assumed baseline CLmax | Baseline clean-stall EAS | Baseline instantaneous turn | Baseline sustained turn | Sustained sensitivity span (9 scenarios) |
|---|---:|---:|---:|---:|---:|
| Bf 109 F-4 | 1.50 | 98.07 mph | 19.45°/s | 18.69°/s | 16.06–20.26°/s |
| P-47B | 1.30 | 112.26 mph | 14.16°/s | 14.16°/s | 11.48–15.53°/s |
| P-51B-15 | 1.60 | 98.46 mph | 19.27°/s | 16.61°/s | 14.19–18.04°/s |

These spans are the extrema across the deliberately wide **assumption scenarios**, not uncertainty-certified error bars. A 109F-vs-P51B turn ordering is not robust from this alone. No independent measured turn points were used to calibrate or validate these outputs.

## Scientific implication and next focused gate

The instantaneous turn result depends strongly on unknown clean CLmax; a max-speed-calibrated CD0 does not resolve this. Likewise, Oswald `e` changes the power-limited steady turn and can affect comparative conclusions. Next: find **matched low-speed CAS/EAS and weight** evidence to constrain clean CLmax, and seek induced-drag/propeller evidence that is genuinely independent of level-speed anchors. Until then, carry the scenario ranges visibly and avoid a definitive turn-performance ranking.

## Test commands

```
node test.mjs
node test_clean_v08.mjs
node test_stores.cjs
node test_fw190.cjs
node test_lift_v09.cjs
```

No website or Atlas repo modifications have been made.
