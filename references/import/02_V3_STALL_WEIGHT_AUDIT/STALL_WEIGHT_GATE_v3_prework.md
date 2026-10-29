# European Air War — v3 stall and weight validation gate (2026-10-29)

## Decision
Do **not** infer aircraft-specific clean CLmax from an indicated stall speed without the low-speed position/instrument correction and matched test weight. Keep v2.5 flight-physics coefficients intact, and mark all four clean CLmax values provisional. This is an evidence audit and validation gate, NOT a validated recalibration or complete v3 model.

## Directly supported observations

1. **P-51B-15 (AAF 43-24777)**: Wright Field Eng-47-1749-A, 20 May 1944, §V.E, reports **86 mph IAS** at 8,000 ft, **9,270 lb instantaneous weight**, power off, flaps/gear up, coolant and oil shutters closed. A second power-off clean observation is **84 mph IAS** at **9,240 lb**, cooling shutters open. Figure 1 documents flight airspeed calibration, but it does not measure position error in the neighborhood of 84–86 mph. Thus neither value is 84/86 mph EAS. The change between two cooling states is also NOT a measurement of their separate CLmax values. Report: https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html . Original Figure 1 is in the v2.5 handover, and `/mnt/data/Fig_1_airspeed_calibration.jpg`.
2. **P-47B/C/D/G pilot notes**: manual excerpt §14 provides **115 mph IAS** clean gear/flaps up, and **100 mph IAS** gear/flaps down; it does not record the P-47B test specimen's contemporaneous weight or low-speed position correction. Period manual AN 01-65BC-1 (20 November 1943) is catalogued by AirCorps: https://app.aircorpslibrary.com/document/viewer/pfoip470165bc1 . Do not assign the 115 mph IAS generic manual value directly to a 12,565-lb P-47B test case.
3. **P-47D (AAF 42-26167)**: separate Wright Field report has **116 mph indicated**, flaps/gear up and engine idling, explicitly notes *uncorrected* IAS subject to attitude and balance of airspeed lines. 13,230 lb is its **takeoff** test weight, not securely the weight at stall. Separate type and configuration from P-47B: https://www.wwiiaircraftperformance.com/org/p-47/p47-26167.html . Figure 1 position-error chart must be audited for low-speed coverage before correction.
4. **Spitfire LF Mk IX BS.543**: A&AEE speed observations use **7,110 lb normalized speed weight** while its climb test weight is **7,485 lb**. Air Ministry pilot-note claims of **90 mph IAS at 7,150 lb**, **93 mph IAS at 7,800 lb** (clean) have not been validated here with a low-speed IAS→CAS map for a Merlin-66 Mk IX. A 1942 NACA *Spitfire Va* stalling investigation (NACA-WR-L-353 / NASA 19930092581) is excellent calibration-method evidence, with **6,184 lb** reported test weight, but **is not a Mk IX CLmax measurement**. https://ntrs.nasa.gov/citations/19930092581 . BS.543 performance: https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html .
5. **Bf 109 F-4**: IL-2 reports **154–171 km/h IAS** clean/flight configuration across possible masses and **2,890 kg** standard mass, but this is simulator evidence, not a wartime measured stall at a documented weight. Original German handbook D.(Luft)T.2109 for Bf 109 F-1 to F-4 is indexed at https://www.museumalkmaar40-45.nl/voorschriften-manuals/d-luftt/d-luftt-2109 . Obtain a directly applicable flight-test or manual stall and low-speed calibration, with slat condition, before deriving F-4 CLmax.

## The five agreed steps — audited status

| Step | Status | Evidence gate |
|---|---|---|
| 1. Clean power-off stall and test mass | **Partial** | P-51B matched IAS+weight; generic P-47 manual and P-47D separate data; Mk IX notes not matched to BS.543; F-4 simulator only |
| 2. IAS→CAS→EAS at stall | **Not yet possible** | None of the four currently has a verified low-speed pitot/static correction at its exact stall condition. Never extrapolate from a high-speed calibration without independent support. |
| 3. Infer measured CLmax | **Blocked for all four** | Compute only when step 2, configuration and weight are resolved. The CSV of illustrative offsets is *not measurements*. |
| 4. Recalculate comparable stall/turn envelopes | **Formula and diagnostic available; validated recalculation blocked** | For a fixed aircraft: `Vs_EAS = sqrt(2 W/(rho0*S*CLmax))`; lift-limited `n = (V_EAS/Vs_EAS)^2`, subject to structural limit. Sustained turns also require drag and available power. |
| 5. 5:1 comparison validation | **Not met / not measurable** | Need reference turn data at matched conditions, uncertainties and independent checks. For 1.3 s difference, 5:1 requires ≤0.26 s total worst-case differential-error budget, or ±0.13 s per airplane if independent opposite-sign errors of equal magnitude. |

## Relative-error insight

If the true stall EAS is 5 mph higher than one assumed at 86 mph, at fixed weight and wing area the inferred CLmax is multiplied by `(86/91)^2 = 0.893`, a **10.7% reduction**. At 170 mph EAS the corresponding lift-limit changes from `3.908 g` to `3.490 g` at that same test mass, a difference of 0.418 g. This is **sensitivity, not evidence of a +5 mph position error**. Some current airspeed/angle-of-attack effects may be strongly nonlinear at stall.

## Work not performed, by design

No P-51B/Thunderbolt/109/Spitfire aerodynamic coefficient was silently altered; there is no credible validated low-speed CAS to apply. The latest full v2.5 handover remains the calculation baseline. `stall_evidence_register.csv` is the source-identity and applicability table; `calibration_sensitivity_NOT_measured.csv` quantifies *hypothetical* corrections only.

## Highest-value documents to obtain next

- Original P-51B test flight pitot/static calibration **below 100 mph** or a matching rig/test calibration near stall, not just Fig. 1 at higher speeds.
- P-47B flight-test stall at measured weight and instrument calibration; confirm whether P-47D Fig. 1 covers the 116 mph position-error range.
- A&AEE / Air Ministry Mk IX low-speed position-error curves with configuration, canopy and weight recorded.
- Bf 109F-4 original flight manual/stall chart with calibrated speed, F-4 weight, automatic leading-edge slat behavior and power setting.

**Acceptance rule:** retain the generic CLmax assumptions for *research comparisons* with explicit warning; do not label a turn result validated until the source gates above are satisfied and 5:1 differential error is tested independently.
