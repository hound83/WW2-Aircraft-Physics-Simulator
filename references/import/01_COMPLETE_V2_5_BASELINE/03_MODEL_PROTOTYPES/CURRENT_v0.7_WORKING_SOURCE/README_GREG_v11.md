# Clean Physics v1.1 — Greg reconciliation

26 October 2026. This increment compares the **actual Greg tables** with our original three-aircraft solver rather than layering another arbitrary sensitivity grid over it. The baseline simulator physics is unchanged; Greg-derived coefficients remain explicit alternative scenarios until independently supported.

## Files

- `greg_reconciliation_v11.cjs` — reproduces the full Greg Bf109F and high-power P-47 worksheet rows, using our common SI drag equations, then contrasts the existing model.
- `greg_reconciliation_results_v11.json` — detailed row-by-row numerical outputs and residuals.
- `greg_comparison_v11.png` — matched-condition power curves with clear Bf109 versus P-47D scenario separation.
- `plot_greg_v11.py` — reproducible chart code.
- `test_greg_v11.cjs` — roundoff-tolerant regression tests; no redefinition of original historical validation.

## Bf 109F-4 — Greg sea-level worksheet

Same nominal 6,371-lb mass, original Greg 325-mph sea-level reference point.

| Input/output | Current speed-fitted model | Greg worksheet inferred |
|---|---:|---:|
| Oswald `e` | **0.780** (generic assumption) | **0.558** (derived from Greg induced drag) |
| Parasite `CD0` | 0.02602 | 0.02437 |
| Propulsive horsepower at 325 mph | 1102.1 hp | 1058 hp |
| Implied prop efficiency at 325 mph, **if using our current 1331.5-bhp shaft input** | 0.8277 | 0.7946 |
| Power required at 200 mph | 326.7 hp | 345 hp |
| Power required at 250 mph | 544.0 hp | 543 hp |
| Power required at 325 mph | 1102.1 hp | 1058 hp |

The similar 325-mph speed at which available and required power cross does **not** imply a matched drag polar. Our `e = .78` reduces induced drag at medium/low speeds compared with Greg, while a larger inferred CD0 raises parasite drag at high speed. Our generic prop efficiency supplies additional power.

### Direct turn consequence

Under the **same model shaft power, propeller function, CLmax and 325-mph level-speed calibration**, changing only the Bf109F Oswald factor from `0.78` to Greg's derived `0.55767` and re-solving CD0 to preserve that speed anchor changes the 5,000-ft, 170-mph-EAS **modeled** sustained turn from **18.69 to 15.41 degrees/second**. This is a −3.28°/s sensitivity — greater than our previous baseline 109/P51B difference of +2.08°/s. It shows **why using a universal 0.78 Oswald assumption to rank these fighters is not defensible**. It does not establish Greg's `e` as historically measured or prove the P-51B historically turns faster.

## P-47 — Greg D-28-style high-power **scenario**, NOT P-47B historical performance

Greg worksheet: 13,065-lb airframe, 2,600 bhp reference, 0.85 propulsive efficiency at medium/high speed and a sea-level geometry/drag polar. Our existing aircraft data represent a distinct **P-47B** tested at 5,000 ft, with its own power/cooling, speed anchor, mass and propeller. We compare aerodynamic formulation only, substituting 13,065 lb for the geometry check.

| Input/output | Current P-47B-derived polar transplanted into 13,065-lb scenario | Greg D-style worksheet |
|---|---:|---:|
| Oswald `e` | 0.780 | 0.784 |
| Parasite `CD0` | **0.01968** | **0.02274** |
| Power required, 200 mph | 540.6 hp | 590 hp |
| Power required, 300 mph | 1232.6 hp | 1401 hp |
| Power required, 350 mph | 1850.9 hp | 2120 hp |
| Propeller efficiency at 350 mph | 0.8239 in hypothetical 2600-bhp case | 0.85 |

The inferred **induced-drag component nearly agrees** when evaluated at the same mass and geometry. The major difference is the roughly **15.6% higher Greg CD0**, leading to a ~12.7% difference in required horsepower at 350 mph. That discrepancy may reflect variant, engine and cooling/airframe configurations, weight, propeller assumptions or the different speed-anchor fitting methods. Do **not** simply replace the P-47B CD0 with the D-style worksheet value.

## Greg P-47B 27,000-ft sustained-g screenshot

The **approximate** screenshot readout versus current model at 125–275 mph produces mean absolute residual **0.19 g** (seven sampled values). It is encouraging that the curves are in the same ballpark, but the screenshot's speed axis is not authenticated as IAS/CAS/TAS, and the seven Greg readings are not primary flight-test points. The Bf 109F engine data do not extend to 27,000 ft, so its comparison properly remains unavailable.

## Reconciliation quality and how to use it

Using Greg-implied `e` and CD0 in the shared drag law reproduces each Greg worksheet's parasite/induced/total power within the original rounded transcription's ~1% precision. This checks our **mathematical equivalence to Greg**, not historical predictive accuracy: the same worksheet was used to infer the coefficients.

The useful outcome is **not** a new universal correction factor. It is an actionable next stage:

1. For **Bf109F**, challenge `.78` Oswald directly against Greg's `.558` reconstruction, with engine/propeller schedule and aerodynamic polar treated as different source categories. Look for independent, matched low-speed or climb constraints that discriminate the candidates.
2. For **P-47**, keep Greg's D-style polar as an independent **calculation fixture** while auditing B-versus-D configuration and sea-level versus 5,000-ft engine/cooling effects before attempting parameter transfer.
3. For **P-51B**, there is **no comparable Greg full drag/power table** in the supplied screenshot set; it remains a historic-report speed/climb reference until an appropriate lower-speed constraint is available.

## Reproduce

```
node greg_reconciliation_v11.cjs
node greg_reconciliation_v11.cjs --json
node test_greg_v11.cjs
python3 plot_greg_v11.py
```

The original Greg handover spreadsheet, previous sources, v0.7 UI, and all prior tests remain unchanged. No Site/Atlas deployment has been made.
