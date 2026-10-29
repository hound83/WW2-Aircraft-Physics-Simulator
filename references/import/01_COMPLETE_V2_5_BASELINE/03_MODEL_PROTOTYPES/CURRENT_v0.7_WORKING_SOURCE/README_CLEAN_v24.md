# European Air War — Source-first aerodynamics / propulsion v2.4

**2026-10-28.** This builds on the pre-existing v2.3 research corpus and four-aircraft engine, retains all historic model/code/source state, and adds a new explicitly conditional Mach-loss scenario with original period test accountability.

## Source-first research outcome

The v2.3 inherited index held **112 NACA report records and text extracts**, originating from an NTRS search identifying 325 candidates, with 3,874 scanned pages *reported in its acquisition logs*. The v2.3 *ZIP itself* does **not** include 112 original PDF scans or their reading copies, despite the prose in the older README. Those very large report scans are **not physically present** here. We retained the NASA report URLs, report identifiers, SHA-256 acquisition metadata, text extraction, 1941 original figure image, and 1945 source-test numeric transcriptions; the missing PDF bytes are marked absent, not recreated or represented as bundled.

A new **20-record** curated source register (`NACA_ADDITIONAL_PRIORITY_REGISTER_v24.csv` / `.json`) cross-references the most useful 1934–1947 original citations by measured variable, aircraft applicability, scientific quality and next calculation. Several overlap with v2.3's 112; this is a *ranked working subset plus findings*, not 20 new distinct experiments.

### High-impact source observations

1. **1938 NACA TR-639, Biermann/Hartman**, [19930091714](https://ntrs.nasa.gov/citations/19930091714). Full-scale propellers in takeoff/climb regime show compressibility onset at rotational tip speeds about 0.5–0.7 of speed of sound depending on blade and pitch; sometimes >20% lost thrust power around tip Mach 0.8. This invalidates a universal lossless `eta(J,Cp)` map, but the report does **not** uniquely identify losses for our four installed propellers.
2. **1945 NACA MR L5G09a, Gardner P-47D**, [19930093653](https://ntrs.nasa.gov/citations/19930093653), original report summary, and Tables I/II retained in `naca_inflight_prop_holdout_v23.cjs`. An *actual in-flight* three-blade Hamilton Standard 6507A-2 recorded about **7% improvement in η** when lowering resultant tip Mach from **1.16 to 1.06**, at **J≈2.5** and **Cp per blade≈0.08**. The report directly addresses blade loading, RPM, Mach and installed propulsive performance.
3. **1946 NACA RM E6K26, Saari/Sorin**, [20030065899](https://ntrs.nasa.gov/citations/20030065899). The SAME 6507A-2 type was investigated in three- and four-blade configurations on a *YP-47M* at free-stream Mach 0.20/0.30/0.40, Cp 0.10–1.00 for four-blade and 0.30–1.00 for three-blade at Mach 0.40. Original OCR is retained but full contour chart digitization is outstanding. Tunnel-wall constriction was not corrected in reported force efficiencies.
4. **1943 NACA ACR 3I30, Clousing/Gadeberg/Kauffman**, [19930092640](https://ntrs.nasa.gov/citations/19930092640). Actual **F2A-3** sustained-turn flights ~90–160 mph, two altitudes and three flap deflections, compared with predictions including thrust effects on `CLmax`. Flight-test airframe: 6,515 lb, 35-ft span, 208.9-sq-ft area, 10-ft-3-in three-blade propeller, R-1820-40 rated 1,200 bhp at takeoff. This is a much stronger *historical turning-method* reference than IL-2, but its flight curves must be digitized before reporting quantitative residuals. Do NOT substitute F2A results directly for Bf109F/P-51/Spitfire.
5. **1942 NACA SR-222, Wetmore**, [20090016589](https://ntrs.nasa.gov/citations/20090016589). Theoretical turning study says improved supercharging may not improve low-speed sustained turning unless the propeller also absorbs the added shaft power effectively. Supports evaluating `Pshaft`, propeller η and induced drag **simultaneously**, rather than treating rated horsepower as propulsive power.
6. **1942 NACA WR L-353**, [19930092581](https://ntrs.nasa.gov/citations/19930092581), original Spitfire **Mk VA** stall and bank tests. The authors report comparatively low aircraft `CLmax`; an observed numeric flight `CLmax` must be read at matching weight/IAS calibration, and this Mk VA cannot simply be used to set LF Mk IXc `CLmax`.
7. **1934 TN-484**, [19930081396](https://ntrs.nasa.gov/citations/19930081396); **1936 SR-55**, [20090015250](https://ntrs.nasa.gov/citations/20090015250); **1937 TR-564**, [19930091639](https://ntrs.nasa.gov/citations/19930091639). Propeller controllable pitch/diameter/RPM power-absorption tradeoffs and *installed* nacelle interaction. TR-564's particular tunnel arrangement achieved its maximum at 27° at 0.75 radius, which is **not** a universal warbird pitch selection.
8. **1947 NACA RM L7D10**, [20050019331](https://ntrs.nasa.gov/citations/20050019331). Post-period supplementary P-47D-28 flight tests with different Curtiss blades show both power loading and Mach matter. This is NOT a historical P-47B performance source.

## Model implementation: research option M

Existing `N` is the approximate 1941 NACA η(J,Cp) test-propeller chart, `C` remains the unchanged default. New **M** uses the same `N` chart and a positive Mach-related loss that is zero at and below assumed Mach **0.95**. Its one curvature parameter is fixed by treating the 1945 source's **~7%** change as relative (an assumption, not a verified percentage-point distinction) between Mach **1.16** and **1.06**; it is *not* tuned to Mustang climb, F-4 turns or the flight-table residuals.

Formula: `eta_M = eta_N × exp[-k·max(0, Mtip - 0.95)^2]`, where `k = ln(1.07) / [(1.16-.95)^2 - (1.06-.95)^2] ≈ 2.1143`.

**Critical applicability warning:** NACA TR-639's **rotational** tip-Mach onset and Gardner's **resultant** propeller tip-Mach measurements are not interchangeable. The assumed 0.95 onset is a research expedient, not a measured blade critical Mach. The report's '7 percent' is interpreted as a relative 1.07 ratio, not a seven-percentage-point change; this interpretation must be checked against the full original paired test data. The 1945 7% ratio and the twelve flight-test rows are from the **same campaign**; these row checks are not independently withheld for M (whereas they were withheld from the original 1941 N chart). High-speed engine/propeller compressibility and actual pitch distribution remain unmodeled.

### Retained 1945 in-flight P-47D numerical checks

| Source-measured case | Baseline N mean abs efficiency error | Candidate M | Interpretation |
|---|---:|---:|---|
| Six **climb** runs | 0.0141 | 0.0141 | No effect, all at low enough resultant Mach |
| Six **higher-speed** runs | 0.0579 | 0.0458 | Improves modestly in same-campaign diagnostic |
| All twelve runs | 0.0360 | 0.0300 | Not an external fitted airframe validation |
| Six runs **within 1941 Cp range** | 0.0257 | 0.0189 | Others lie below original chart range |

### The real Mustang climb shortfall remains (2,200 ft)

| P-51B-15 flight-test boost | Historical ft/min | Existing C | NACA N | New M |
|---|---:|---:|---:|---:|
| 67inHg | 3,820 | 3,401 | 3,320 | 3,320 |
| 75inHg | 4,380 | 3,979 | 3,894 | 3,894 |

M is not a remedy: the Mustang model's predicted climb tip Mach is **0.793**, below the research loss onset. We must locate **exact P-51B Hamilton Standard K-6523A-24 pitch/efficiency and installed cooling drag** before declaring a correction.


## Late high-priority discovery: exactly matching P-47B blade design

**1944 NACA ACR L4L07, Vogeley**, [19930093302](https://ntrs.nasa.gov/citations/19930093302), tested the **Curtiss 714-1C2-12 four-blade** on a **P-47C**. The historical P-47B acceptance-test aircraft used the **same 714-1C2-12 blade design** (P-47B 41-5902 original test transcription at https://wwiiaircraftperformance.com/org/p-47/p-47.html). This is a substantially better configuration bridge than the 1945 three-blade P-47D. At 165 mph IAS in climb, increasing from normal to military power reduced propeller efficiency **5–8%** in these actual flights. In high-speed flight, NACA reports compressibility losses starting when propeller tip Mach exceeded around **0.83** and high-speed losses of **10–11%** by aircraft Mach 0.7, with a reported η drop about **7% per 0.1** tip Mach in the observed regime. These are conditional measurements, not a universal 4-blade formula. This report becomes **priority #1 to digitize** before changing the P-47B default model.

Additional original flight-source constraint: the painted-production P-47D section report [19930092751](https://ntrs.nasa.gov/citations/19930092751) reports minimum *section* cd≈0.0097, whereas smooth-wing P-47D section tests [19930093001](https://ntrs.nasa.gov/citations/19930093001) report cd≈0.0062. These are **local profile coefficients**, not whole-aircraft parasite drag. They demonstrate why a universal constant wing profile drag can be misleading.

## Next source extraction before any default-model upgrade

1. **Priority A:** Transcribe numerical plotted turn points and full configuration from the 1943 F2A-3 test (report ACR 3I30). Build a **separate fifth validation fixture**, not a fifth aircraft in the user interface or a fitted Bf109 turn surrogate. Includes measured vs calculated turn with propeller-on effect on `CLmax`.
2. **Priority A:** Digitize the Curtiss 714-1C2-12 P-47C in-flight results (1944 ACR L4L07); match those against P-47B original manufacturer/USAAF propeller designation. This is the strongest blade-family transfer available to our Thunderbolt model.
3. **Priority A:** Digitize the 1946 YP-47M Hamilton Standard three-/four-blade `η(J,Cp,Mfree,β)` series from E6K26, visually verifying each graph and whether wall-constriction correction changes absolute force. Add independent 1947 P-47D Curtiss test as a genuinely new prop-family check. Keep the 1945 P-47D three-blade flight report out of further M fitting.
3. **Priority A:** Obtain source plots/tables specific to P-51B Hamilton Standard K-6523A-24, Packard V-1650-7 low-altitude rating power and actual RPM/gear/weight/radiator state. Current speed fit does not validate climb drag or efficiency. Avoid transferring Bf109/Spitfire prop maps to the Mustang.
4. **Priority B:** Reconstruct installed radiator/cowl interference power accounting from period wind tunnel and flight tests with *measured shutter settings*, rather than imposing positive Meredith-effect thrust.
5. **Priority B:** Fit realistic lift-dependent whole-aircraft parasite-plus-profile drag only when there are **multiple independent** drag/low-speed points per configuration. Keep the original four airframes and Greg's high-power P-47 counterfactual as the benchmark.

## Reproducibility and archive integrity

- Run `node --test test_*.cjs` in the model source directory, including new v2.4 regression file. Expected **27/27 script passes**.
- Run `node naca_mach_analysis_v24.cjs --write` for all individual flight rows, comparison and Mustang climb results.
- Inspect `naca_1945_mach_comparison_v24.png`; use `Universal_Four_Aircraft_Model_v2.4.html` standalone (C is default; N and M selectable).
- Both `.csv` and `.json` source registers are in the NACA evidence folder. The inherited historical data, Greg calculations, original figure/image extracts and all earlier model source are preserved.
- Original >1.5GB NACA PDF scans **were not present in the v2.3 portable ZIP** and could not be retrieved as download bytes this run. Retain unambiguous NASA official URLs and old acquisition SHA metadata; a missing scan is **not** a verified local original. Research source references with OCR need validation against original page images before using exact numerical tables.
- Atlas website and `hound83/ww2-airwar` repository are **untouched**.
