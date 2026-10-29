# Frozen state before v3.0 (as of 2026-10-29)

## Current working engine

The baseline is **v2.5**, not a finished v3.0. It includes the four-aircraft runnable HTML, `physics.js`, aircraft cases, Greg numeric benchmark, NACA report index, and regression tests. The v2.5 assistant reported 28 scripts passing; see `VERIFICATION.md` for checks performed on this handover. Neither passing unit tests nor matching a fitted max-speed anchor validates historic turns.

## Known figures and their evidence class

| Benchmark | Approximate previous model / reference | What it establishes |
|---|---|---|
| P-47B level speed against five withheld points | ~3.65 mph mean absolute error (v2.1/v2.2 baseline) | Promising speed at specific ratings; not induced drag or stall evidence |
| P-51B level speed against eight withheld points | ~2.61 mph mean absolute error | Same caveat |
| P-51B climb 2,200 ft at 67 inHg | History 3820 ft/min; model ~3401 | ~419 ft/min missing; unresolved installed power/drag |
| P-51B climb 2,200 ft at 75 inHg | History 4380; model ~3979 | ~401 ft/min missing; power *difference* roughly correct |
| Bf109F4 turn comparison at 5,000 ft /170 mph EAS | Generic e=.78 ~17.9°/s vs Greg/IL-2-informed e~.55 ~14.5°/s | Severe source-parameter ambiguity, cannot rank close aircraft confidently |
| Spitfire LF Mk IX speed | ~4.99 mph mean absolute error in historical series | Provisional power-map assumptions; test-condition match matters |
| Spitfire LF Mk IX climb | Speed-dependent boost modeling improved mean error in earlier studies | Significant predictive improvement but not independent of all source calibration |
| NACA 1944 Curtiss 714-1C2-12 P-47C prop | 5–8% efficiency reduction from normal to military climb power; generic model much weaker | Measured failing power-loading behavior; do not use all propellers identically |

### IMPORTANT original P-47C PDF correction

The provided primary 1944 PDF, NACA ACR L4L07 by Vogeley, has **35 scanned pages**. Table I on PDF p.14 and table II on p.15. Original scan Table I gives normal climb run **20-1 η=0.779**, correcting earlier OCR transcription 0.799. Figures 4–6 (p.19–21), 8–10 (p.26–28) have the useful measurements/curves. A 1944 measured P-47C test with matching blade family is not a universal map for P-51, 109 or Spitfire. Document power coefficient conventions, blade angle and Mtip when implementing.

### Critical stall/weight gate

**None of the four has a fully matched, verified low-speed CAS/EAS calibration at power-off stall in the current archives.** Do not generate verified CLmax from IAS alone. Missing evidence is described item-by-item in `02_V3_STALL_WEIGHT_AUDIT/STALL_WEIGHT_GATE_v3_prework.md`.

### Meaningful 5:1 challenge

Published IL-2 simulation's sea-level best 360° turns (different optimum IAS, variant/load/rating) had roughly Spitfire IX 17.7 s, P-51B-5 19.0 s, Bf109F4 20.3 s, P-47D28 27.5 s. The 1.3 s gaps demonstrate scale, **not matched test data**. For a claimed 1.3 s gap, 5:1 requires validated pairwise differential error ≤0.26 s; wartime observations might not be precise enough to demonstrate this. Do not mistake simulated time accuracy for actual historical validation.

### Source priority

1. Actual original wartime flight measurements and instrument corrections; period test weight and clean configuration.
2. Primary manual data (make sure variant and measured conditions apply).
3. Secondary historical transcriptions with original scan audit.
4. Greg's independently supplied worksheet = method/solver regression and comparative sanity check, not primary measurement.
5. IL-2 and DCS = useful simulator sanity checks (not historical ground truth).
6. Explicit assumed coefficients and optional experimental alternatives = hypotheses.

### Do not repeat mistakes

- Do not claim a corrected CAS/EAS stall based on high-speed calibration extrapolation.
- Do not use the same generic mass across stall, climb and max-speed historical records.
- Do not force Oswald e to a turn-time fit then claim the result was independently validated by the same simulator.
- Do not use Greg's P-47D 2600 hp test as historical P-47B horsepower.
- Do not silently fix the P-51 climb deficit by generic exhaust thrust/cooling correction that breaks other aircraft.
- Do not conflate shaft power, thrust power, and propeller efficiency.
- Do not treat a completed literature search as a tested model release.
