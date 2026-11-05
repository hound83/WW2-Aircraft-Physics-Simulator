# Condition-aware flight envelope

Baseline v3.7 ([846dca5](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/846dca504983e846804302119fd8c154f6c541e4)). The working profile uses the existing common lift, drag, propeller and energy solver. Forced gear and rating remain selectable for source comparisons. Automatic gear selection compares net power at the selected flight state.

## Results

| Aircraft | Level-speed MAE outside anchor, mph TAS | Power and climb |
|---|---:|---|
| P-51B | 3.72 → 0.79, 11 checks | 32,000 ft: 418.0 → 409.4 mph against 410.0. The reserved 75-inHg rating improves at both high-blower points. |
| P-47B | 0.81 → 0.81, 5 checks | Seven additional recorded rating/altitude states available in the main solver. Normal power includes the 35,000-ft point. |
| Bf 109 F-4 | 3.10 → 3.10, one secondary check | Both 7,000 m speed leads remain outside the working engine domain. |
| Spitfire LF Mk IX | 4.63 → 0.98, 20 checks | 34,000 ft: 387.8 → 382.2 mph against 381.0. Both blower branches improve on held altitude blocks. |

The level errors include source-condition mismatches listed in the [four-aircraft scorecard](FLIGHT_SCORECARD.md). In the P-47B source replay, the main solver now accepts the 41-5902 military rating from sea level and normal rating from 12,600 to 35,000 ft. The propeller runs at 1,350 and 1,275 rpm respectively. The normal branch interpolates adjacent same-rating nodes and is unavailable outside them. The military supplement joins the existing 2,000 hp level-power curve at 5,000 ft.

With the previously accepted open-shutter model and the same recorded shaft power, TAS and mass assumptions, P-47B climb MAE on five reserved engineering checks is **34.1 ft/min**, versus **501.1 ft/min** for the clean scenario. At 35,000 ft the clean and open predictions are 909 and 366 ft/min against 450 recorded. The 34.1 ft/min result reproduces the earlier dedicated replay in the normal flight solver. The open-shutter switch also exposes the accepted BS.543 cooling-loss scenario in its observed altitude/TAS ranges. The switch applies drag; a recorded boost correction is still a separate input. At the 21 inherited fixed-TAS climb checkpoints the fast-flight correction changes the result by zero.

## Calibration and checks

The level-speed residual is represented as an effective parasite-drag term. It can absorb errors in installed power, propulsive efficiency or drag. The core model keeps separate power and drag bookkeeping, preserves all four original speed anchors, and holds the correction at zero through Mach 0.36 before a smooth ramp to Mach 0.46. The altitude dependence is blower-specific, with a 2,000-ft fade outside the level observation band when the engine branch itself is available. It carries into simple store-load sensitivities as part of clean installation drag. Explicit ram/boost and open-shutter scenarios use their own inputs.

The first anchored linear trial worsened one contiguous altitude holdout on both the P-51B and Spitfire low branches. The final low branches use the first Mustang non-anchor altitude and the Spitfire published low-blower engine peak as ramp landmarks. The selected shapes improve on both interleaved and both contiguous holdouts in all four fitted branches. The Mustang's 75-inHg data were excluded from fitting. High-blower residuals improve from 4.0 to 2.0 mph and 6.4 to 3.1 mph. Four paired ±2% mass and ±4% effective-efficiency stress cases improve both fitted aircraft and reproduce the other two speed curves. The initial P-47B fast-flight fit increased held-out error, so the installed correction is omitted there.

The Bf 109 pressure-ratio continuation misses the 7,000 m secondary speeds by 226 and 271 propulsive hp at combat and emergency settings, respectively, with the existing polar. This rejects that particular continuation under the current assumptions. It does not determine which of shaft power, propeller efficiency, drag or source conditions explains the gap. The German F-series manual catalogue locates the February 1942 engine installation and the operating-system volumes. The 9228 primary test concerns dives and cannot establish a matched F-4 level-power curve. [Manual catalogue](https://www.museumalkmaar40-45.nl/voorschriften-manuals/d-luftt/d-luftt-2109) · [Diving report](https://wwiiaircraftperformance.org/me109/Diving_Test_109F_W.Nr.9228_ger_eng.pdf)

All these observations were available during development. Reserved rows test transfer within the available reports. The results leave independent accuracy, the 5:1 criterion, exact clean stall calibration and the missing F-4 and Mustang engine domains open.

Run `npm run diagnose:flight-envelope` for the individual before/after observations, folds, load sensitivity, RPM and power checks. `npm run check` also writes the report. [Frozen calibration](../calibration/flight-envelope.json) · [Scorecard](FLIGHT_SCORECARD.md)
