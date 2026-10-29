# Clean Physics v1.2 — controlled P-47 airframe and power experiment

26 October 2026. This increment acts directly on the user's request to exploit Greg's **2,600 bhp Thunderbolt worksheet** while using the same airframe geometry and aerodynamic formulation when changing shaft power. It also challenges alternative drag polars against the P-47B historical speed-versus-altitude fixtures.

## The key modeling distinction

**Power-only experiment:** identical 13,065-lb weight, P-47 shared wing geometry, complete drag polar, fixed Greg propeller-efficiency-versus-speed schedule, ISA sea level. The ONLY change is engine shaft power from 2,000 to 2,600 bhp. This is a controlled hypothetical, not a P-47B versus D-28 flight trial.

**Polar experiment:** hold the same weight, wing, propeller curve and shaft horsepower, change ONLY the drag polar between:

- **P-47B speed-anchor candidate** — `CD0=0.0196832`, `e=0.78`, calibrated at the P-47B 5,000-ft 352-mph observation using the generic-C propeller candidate and 2,000-bhp test source.
- **Greg D-28-style worksheet** — `CD0=0.0227442`, `e=0.7838`, inferred from Greg's 13,065-lb high-power sheet, not independently flight-measured.

Although P-47B and D-28 share the broad wing geometry and drag-law structure, installed drag can differ with canopy, cooling, propeller, airframe condition and test setup. For **this controlled simulation** treating them aerodynamically identical is precisely what allows isolation of power changes. Do not assert that equality as a separate historical measurement.

## Four results — maximum speed at sea level

| Shared airframe polar | 2,000 bhp | 2,600 bhp | Effect of +600 bhp |
|---|---:|---:|---:|
| Greg D-style aerodynamic polar | **322.85 mph** | **355.37 mph** | **+32.52 mph** |
| P-47B speed-anchor polar | **339.20 mph** | **373.23 mph** | **+34.02 mph** |

At the same 2,000-bhp power the polar choice alone changes maximum speed by **16.36 mph**. At 2,600 bhp the polar difference is **17.86 mph**. The clean controlled horsepower gain is approximately **33–34 mph** at either fixed polar.

Greg's original worksheet max speeds, computed using the existing reference implementation, match the new *independent shared-law Greg-polar solver* to **less than 0.01 mph** at both 2,000 and 2,600 bhp. This is a precise regression of Greg's arithmetic and inputs, **not** historical proof.

### Turn sensitivity in this controlled setup

At **200 mph TAS, sea level**, with the existing **unverified** P-47B clean CLmax=1.30, the 2,600-bhp Greg-polar example yields about **2.86 sustained g / 16.81°/s**, versus **2.42 g / 13.88°/s** for 2,000 bhp. CLmax, pilot/control limits, and thermal rating sustainability still require independent historical checks before interpreting these as real aircraft turn performances.

## Historical P-47B challenge (not a D-28 trial)

We also inserted both polars directly into the normal **2,000-bhp P-47B speed/altitude solver**, preserving the B's altitude-dependent engine-power curve and the same generic propeller model for both candidates. No point-by-point refitting was allowed.

The 5,000-ft P-47B 352-mph observation is the **fit point** for the baseline polar, so it is excluded from the five higher-altitude comparisons.

| Altitude | Historical P-47B TAS | B-anchored prediction | Greg D-polar direct transfer |
|---|---:|---:|---:|
| 5,000 ft (fit) | 352 | 352.0 | 335.5 |
| 15,000 ft | 386 | 386.1 | 368.5 |
| 25,000 ft | 420 | 423.3 | 404.7 |
| 27,800 ft | 429 | 434.1 | 415.3 |
| 30,000 ft | 426 | 429.9 | 411.1 |
| 34,000 ft | 412 | 417.9 | 399.0 |

**Held-out mean absolute speed residual:** baseline B-polar **3.65 mph**, directly transplanted Greg D-style polar **14.89 mph**. The B-polar is much closer to the P-47B report's observed speed curve under these specific model assumptions. Note that the P-47B engine-power curve and observed speeds come from the same historical test series; these are not wholly independent experimental datasets.

The mismatch is useful: **a P-47D worksheet CD0 cannot be copied unchanged into the P-47B installed-speed model without reconciling test/propeller/cooling conditions.** This does not reject Greg's aerodynamic math or negate the validity of the identical-airframe +600-bhp control.

## Bf 109F alternative polar

The original Greg Bf109F polar is also now selectable through the shared engine's explicit `opts.polar` input (`{cd0,e,source}`). With Greg's `CD0≈.024373`, `e≈.55767` and the current engine/prop power, the original 325-mph sea-level maximum becomes ~330.12 mph; the ~5.1-mph increase reflects the different model power-available curve. If CD0 is re-anchored to preserve 325 mph while using Greg's `e`, the 5,000-ft, 170-mph-EAS modeled sustained turn remains ~15.41°/s rather than the baseline 18.69°/s. There is only a single Bf109 sea-level speed fixture, so this does **not** independently select either polar.

## Source and solver discipline

- `physics.js` now accepts `opts.polar={cd0,e,source}`. Invalid or source-less polars and simultaneous re-fitting are rejected. Existing defaults remain intact; the external candidate is not automatically adopted.
- Climb uses the selected polar's Oswald factor consistently; the earlier v0.8 stores-weight correction is preserved.
- `p47_control_v12.cjs`, `p47_control_results_v12.json`, `test_control_v12.cjs`, `plot_p47_control_v12.py`, and `p47_control_v12.png` reproduce the experiment and historical challenge.
- All previous Greg-v1.1 arithmetic tests, source gating, and historical caveats remain. The Atlas website was not modified.

## Next gate (small and concrete)

Audit **why** the speed-anchored P-47B and Greg D-style effective `CD0` differ under their reference conditions: atmospheric/propulsive-power bookkeeping, nacelle/cooling/canopy/racks, reported weight and speed definitions. The goal is to reconcile a common clean aerodynamic geometry plus explicit **configuration** terms, not arbitrarily average the two inferred `CD0` values.

Run:

```
node p47_control_v12.cjs
node p47_control_v12.cjs --json
node test_control_v12.cjs
python3 plot_p47_control_v12.py
```
