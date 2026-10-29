# Clean Physics v1.0 — evidence-gated turn comparison

26 October 2026. **This is a diagnostic correction of the comparison methodology**, not a historical aerodynamic validation or a new published Atlas release. The original three-aircraft UI stays on its v0.7 presentation; all computations continue using the same shared physics engine with v0.8 fixes.

## Why the previous apparent turn-rate ranges were too broad

The v0.9 display combined the extremes of a deliberately wide 3×3 grid of assumed Oswald efficiency (`e = 0.60 / 0.78 / 0.90`) and CLmax multipliers (`0.85 / 1 / 1.15`) **independently for each airframe**. The differences within a single aircraft were sometimes larger than the baseline aircraft-to-aircraft differences. Those ranges were valid exploratory outputs but **not evidence-based error bars**. Neither a 90% confidence interval nor a historically constrained range can be inferred from them.

Critically, one level-flight maximum-speed anchor only constrains the **total power balance**:

```
eta × shaft_power / TAS = q × S × CD0 + weight² / (q × pi × e × span²)
```

Several CD0/e combinations fit the exact same speed anchor. Fitting max speed therefore does **not identify the induced-drag polar at turning speed**. The new audit explicitly exhibits this non-identifiability rather than hiding it in an aircraft turn ranking.

## New method

- `evidence_gates_v10.json` records exactly which low-speed/turn inputs are measured, derived from Greg's worksheet, related-variant only, or simply assumed. **None of the current aircraft has a credible specimen-matched low-speed CLmax constraint.**
- `comparison_audit_v10.cjs` reports separately: (a) **the frozen baseline comparison**, (b) **one input varied at a time** at fixed conditions, (c) a shared-parameter-change thought experiment, and (d) independently varying all assumptions (extreme stress test only).
- Same observation conditions for all comparisons: **5,000 ft ISA and 170 mph EAS**. Each uses its documented current model engine-power curve and current provisional test weight; this is **not** a matched historic combat power comparison.
- The shared change applies identical `e` and CLmax multiplier settings to all three aircraft, showing how a systematic model-input bias *might* cancel in a relative difference. **It must not be interpreted as a real correlation in unknown aircraft parameters.**
- Previous v0.9 nine-scenario records remain available; no coefficient bounds were silently narrowed.

## Numerical audit — sustained turn at 5,000 ft / 170 mph EAS

| Aircraft | Baseline | Vary only `e` | Vary only CLmax |
|---|---:|---:|---:|
| Bf 109 F-4 | 18.69°/s | 16.06–19.45°/s | 16.13–18.69°/s |
| P-47B | 14.16°/s | 12.05–14.16°/s | 11.48–14.24°/s |
| P-51B-15 | 16.61°/s | 14.19–18.04°/s | 15.98–16.61°/s |

| Difference (first minus second) | Frozen baseline | Shared-change hypothetical | Fully independent extremes |
|---|---:|---:|---:|
| Bf 109F − P-47B | +4.53°/s | +4.01 to +5.29°/s | +0.53 to +8.77°/s |
| Bf 109F − P-51B | +2.08°/s | +0.15 to +2.22°/s | −1.98 to +6.07°/s |
| P-47B − P-51B | −2.44°/s | −4.49 to −2.14°/s | −6.56 to +1.35°/s |

Each numerical range is a deterministic *what-if* range across specified assumptions. **None is an estimated historical uncertainty interval.** In particular, the common-shift scenario cannot certify which airplane actually turns faster.

## Primary historical evidence checked in this increment

1. **P-51B-15, AAF 43-24777, Wright Field Eng-47-1749-A, 20 May 1944**: direct historical report transcription reports a power-off, gear-up, flaps-up stall of **86 mph IAS** at 8,000 ft, 9,270 lb, coolant and oil shutters closed. Its **same-specimen airspeed-calibration chart** is reproduced in `references_v10/P51B_24777_original_report_airspeed_calibration.jpg`. The position-error curve begins at substantially higher IAS; it does not supply a measured 86-mph correction. We do **not** silently treat this stall IAS as EAS or extrapolate the chart. [Report transcription](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) / [report image](https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Airspeed_Calibration.jpg).
2. **NACA ACR 4K02 (1945)**, original PDF `references_v10/NACA_ACR_4K02_P51B_drag.pdf`: primary research on a **different P-51B-1** tested with the propeller removed and altered surfaces/trim; it contains drag vs lift data and high-speed comparison with a wind-tunnel model. Valuable methodological evidence, **not a directly transferable powered P-51B-15 low-speed induced-drag calibration**. [NASA original](https://ntrs.nasa.gov/citations/19930092458).
3. **NACA TN-622 (1937)** found flight-determined CLmax could vary considerably with test conditions, reinforcing why an apparently precise stall-derived CLmax requires weight, propeller and procedure matching. It does *not* supply any of the three aircraft's specific CLmax. [NASA original](https://ntrs.nasa.gov/citations/19930081417).
4. Existing P-47 manual correction chart begins at 170 mph IAS, higher than the quoted 115 mph IAS clean stall. Greg's inferred e values for Bf 109F and P-47D-28 remain **worksheet reconstructions**, not independent aerodynamic observations.

## What we can and cannot conclude

We can now present a clear frozen scenario and its *actual sensitivity mechanisms* without pretending the extremes are historical uncertainty. We **cannot yet certify** a 109F/P51B sustained-turn ordering or meaningful aircraft-specific numerical error bars. A genuine tightening requires a primary specimen-matched stall **CAS/EAS** measurement (or an independently obtained low-speed drag polar), plus properly matched weight, configuration, propeller and engine condition. Merely selecting a smaller plausible input interval would fabricate accuracy.

The v1.0 next development gate is therefore narrow: obtain or digitize genuinely applicable low-speed lift/drag evidence, replace a provisional input **only if source-match criteria pass**, then rerun the comparison without other refitting. No additional aircraft or website work is proposed in this increment.

## Reproduce

```
node comparison_audit_v10.cjs
node comparison_audit_v10.cjs --json
node test_comparison_v10.cjs
node test_lift_v09.cjs
node test_clean_v08.mjs
node test.mjs
node test_stores.cjs
node test_fw190.cjs
```

The first source chart is a wartime report **scan reproduced by a historical website**, not a separately checked archive scan; the NACA PDF is from NASA's official archival record. None of the figures in the reported tables are independent historical validation of our turn model.
