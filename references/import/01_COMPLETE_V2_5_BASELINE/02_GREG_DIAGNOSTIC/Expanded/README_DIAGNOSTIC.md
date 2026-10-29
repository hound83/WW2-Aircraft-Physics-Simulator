# Greg / P-51B Physics — isolated diagnostic patch v0.3

**Status: engineering correctness patch + source audit. NOT historically calibrated.**
**No GitHub repository, v7.5, or original v0.2 handoff file was modified.**

The aircraft is **North American P-51B-15, 43-24777, Packard V-1650-7**, in the exact configuration defined in `p51b15.json`. It is separate from the Atlas's P-51B-5 43-6883.

## Applied corrections

1. Corrected Wright Field report identifier from **Eng-47-1715-A** to **Eng-47-1749-A**, dated 20 May 1944, based on the published wartime-report transcription. Data uncertainties remain explicit.
2. Added historically reported actual/manifold-pressure nodes by rating, altitude and supercharger gear, with separate **requested/available MAP** in the solver output. At 28,000 ft, 67 inHg requested in high blower corresponds to only **57.3 inHg** actually achieved in the report; at 32,000 ft it is **48.4 inHg**. The source-reported BHP remains unchanged. This is a table-based MAP interpolation, **not** a compressor-engine physics model.
3. Recorded distinct **critical altitudes**: 67 low 10,300 ft; 67 high 24,000 ft; 75 low 7,400 ft; 75 high 20,800 ft. The 16,000-ft automatic shift remains an illustrative convenience and **is not a verified operating schedule**.
4. Invalidated *achieved* Ps / ROC / level acceleration / sustained and instantaneous turns **below the illustrative CLmax stall boundary**. The mathematical unconstrained power-balance result stays available **only** in a separately named diagnostic property. At 20,800 ft and 130 mph TAS, the old output misleadingly showed **+2,496.6 ft/min**; the new achieved climb is `null` and the status is `below_model_stall_speed`. `CLmax=1.6` itself remains provisional; historic stall observations are IAS, not uncorrected EAS.
5. Added source and physical boundary tests, retaining existing numerical speed model outputs so that no unsourced drag or propeller adjustment slips in.

## High-altitude discrepancy: now quantified, NOT yet solved

Provisional constants: `CD0=0.016`, Oswald `e=0.80`, installed propeller efficiency `eta=0.80`; assume corrected weight 9,240 lb at all heights for **diagnostics only**. These numbers are NOT measured installed P-51B-15 coefficients.

| 67-inHg high-blower altitude | Source max TAS | Current model max TAS | Residual | Implied effective eta if CD0=0.016 | Alternative effective CD0 if eta=0.80 |
|---|---:|---:|---:|---:|---:|
| 18,000 ft | 408 mph | 410.4 mph | +2.4 mph | 0.788 | 0.01628 |
| 20,800 ft | 417 mph | 422.5 mph | +5.5 mph | 0.774 | 0.01662 |
| 24,000 ft | 426 mph | 437.0 mph | +11.0 mph | 0.750 | 0.01721 |
| 28,000 ft | 419 mph | 429.5 mph | +10.5 mph | 0.755 | 0.01715 |
| 32,000 ft | 410 mph | 419.8 mph | +9.8 mph | 0.761 | 0.01706 |

**These are inverse-model equivalents, NOT measurements of actual propeller efficiency or actual parasite drag.** The speed and reported BHP cannot identify eta and drag separately. The same issue appears with experimental 75-inHg high blower at 20,800 ft: predicted 442.9 versus reported 431 mph, a +11.9-mph residual. That points to an **unmodeled altitude/speed/configuration effect**, not primarily a missing 67-inHg power node. The shaft-power curve is a period manufacturer's chart reported by the Wright Field authors, not an independent flight dynamometer measurement.

### Hypotheses — do not choose yet

- Installed propeller efficiency varies with advance ratio, blade pitch/RPM, local Mach and propeller tip compressibility; constant 0.80 is unsupported over the full envelope.
- Aerodynamic `CD0`, radiator/cooling flap drag, racks/armament, surface condition, Reynolds or Mach effects depend on flight condition. NACA ACR 4K02 is directly relevant **methodologically** but tested a different P-51B with propeller removed: it cannot be copied as installed drag for this 43-24777 aircraft.
- Correct test weight changes with fuel burn and report corrections; fixed 9,240 lb at all altitudes is inconsistent with the original 9,335-lb take-off / altitude-dependent corrections.
- Sources themselves contain apparent HTML transcription errors (75-inHg speed at 4,000/7,400 ft duplicates 67-inHg despite stated +16 mph increase; duplicate 28,000-ft high-gear rows). Preserve as pending original-scan audit, not invented fixes.

## Research gates before full high-altitude model correction

1. Reconcile original scanned Wright Field **Eng-47-1749-A** Table V.B and Figures 3–7 (particularly **Figure 5 power required at 22,400 ft**, Figure 4 power vs altitude and the IAS calibration). Audit historical corrections, temperature, weight, boost, cooling flaps, speeds and the anomalous HTML rows.
2. Obtain installed **Hamilton Standard K-6523A-24** propeller efficiency or thrust/power map at the flight rpm, diameter and altitude, with installation and tip-Mach corrections, rather than fitting eta to the same reported speed observations.
3. Independently constrain airframe drag with an appropriate powered-P-51B polar, cooling drag and external rack drag. Check NACA ACR 4K02 (different *propeller-off* test setup) and original NACA high-speed P-51B polar data but do **not** transplant coefficients without corrections and error bars.
4. Calibrate with a declared subset of flight observations, then validate using **withheld** speeds and **independent** climb/power-required observations and cross-airframe tests (for example the 15 May 1944 summary and Eglin service trials, only with matched conditions).
5. Permit a historical aircraft in the selectable **simulator** only when measured power/drag/propeller inputs, mode, altitude coverage, stall, and independent residual limits pass review. Otherwise it remains a historical **test explorer** or research placeholder.

## User-approved release contract (to apply AFTER the model work)

- Complete **v7.5** as a substantial four-air-force historical Atlas, plus the Greg methodology/experimental lab, with clearly separated recorded/interpolated/scenario states.
- Expand to real multi-aircraft E-M physics in **v7.6**. Start with a **small confidently validated subset**, not all 89 placeholders; then expand across relevant WW2 types/variants.
- Fix this model scientifically before integrating. Keep source conflicts and unverified parameters open. Defer the nine homepage images until their dedicated visual pass. Preserve v7.4 fallback and existing repository work.

## Files and tests

- `p51b15.json`: exact conditions, report-ID correction, actual MAP nodes, critical altitude metadata.
- `performance_engine.mjs`: corrected source-based pressure reporting and invalid flight-state gates. **Original aerodynamic model remains unchanged.**
- `test.mjs`: unchanged original regression suite.
- `test_diagnostic.mjs`: dedicated tests for source ID, boost/critical altitude, no extrapolation and stall invalidation.
- `demo.mjs`: unchanged demo program.

Run with Node: `node test.mjs && node test_diagnostic.mjs`. The resulting v0.3 files are an isolated engineering diagnostic, not a validated production-ready aircraft simulation.

## References

- Wright Field, *Flight Tests on North American P-51B-15 43-24777 Using 44-1 Fuel*, Eng-47-1749-A (20 May 1944), [report transcription](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html).
- [NACA ACR 4K02, original report metadata](https://ntrs.nasa.gov/citations/19930092458) (February 1945), P-51B propeller-off wind-tunnel/flight correlation.
- [NACA P-51B high-speed polar tests, wartime record](https://wartimearchive.com/document/flight-tests-of-the-high-speed-performance-of-a-p-51b-no-43), performed with a different aircraft, engine and propeller.
- [NASA Aviary Hamilton Standard propulsion model](https://openmdao.github.io/Aviary/user_guide_unreviewed/subsystems/hamilton_standard.html), useful for identifying advance ratio, installation and tip-Mach variables, **not proof of exact historic K-6523 efficiency**.
