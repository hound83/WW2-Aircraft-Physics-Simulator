# European Air War: original NACA source-first research, 1934–1946

**27 October 2026 — v2.3 source archive and first unfitted physics transfer**

## What was actually acquired

- **325** candidate NASA NTRS citation records found through broad and follow-on searches; **112** period-relevant report records selected and **112 original NACA/NASA-hosted PDF scans downloaded**; **3,874 PDF pages** across the selected records.
- Original scans: **1,537,504,495 bytes**, each tracked by SHA-256, page count, NASA NTRS URL, report identifier, year, source category, and text-extraction status.
- **112/112 page-verified readable copies** made without modifying originals (574,709,281 bytes); figure resolution can still be lower in a reading copy than in the untouched original.
- **45 propeller / 30 cooling / 22 drag / 15 engine** records. Some duplicate period papers have separately cataloged NASA reprints; do **not** treat the number 112 as 112 independent experiments. Some records are ancillary (propeller noise, icing, unusual configurations) kept for completeness, not for calibrating our fighters.
- **104** originals have usable automatic text layers/extraction and **8** are image-only as acquired (prior to supplemental OCR). `naca_ocr_scans_v23.py` produces separate explicitly *machine-unverified* transcriptions; the report scans are authoritative.
- Core files: `ntrs_catalog_v23.json` (NASA API metadata/search trail), `ntrs_ranked_register_v23.csv` (all ranked candidates), `naca_acquisition_log_v23.json` (byte/page/hash/provenance per acquired report), `naca_reading_copy_provenance_v23.json`, `original_naca_pdfs/`, `naca_reading_copies/`, `extracted_text/` and `ocr_scanned_reports_v23/`.
- Acquired original NACA scans are public-domain source documents and should remain separate from our interpretation and model calibration.

## Hard measurement / modeling rules

1. **No generic 'golden' propeller efficiency.** Period efficiency is a function of advance ratio `J=V/(nD)`, shaft-power coefficient `Cp=P/(ρn³D⁵)`, blade count, blade geometry, pitch, propeller-tip section Mach, and installation/slipstream. The 1941 curves are a transferable *research approximation*, not P-51/Bf 109/Spitfire/P-47 maps measured on their exact propellers.
2. **Do not call a wing section Cd an airplane CD0.** Local profile drag is not the whole-aircraft polar; cooling, fuselage, tail, guns, prop slipstream, Mach and lift-dependent profile drag matter.
3. **An engine's 'sea-level rated power × atmospheric density ratio' is inadequate.** Period superchargers, turbocharger exhaust energy, gear selection, engine RPM, maximum boost limits, carb/induction losses and intake temperature all matter; published source horsepower should be attached to a particular rating, altitude, engine/configuration and test condition.
4. **Radiator thermal thrust is not a universal credit.** Full duct thermodynamics require mass flow, pressure losses, heat transfer, outlet velocity, scoop/spillage, exit flap, altitude and prop wash. Do not grant the Mustang low-speed excess power via arbitrary Meredith gain.
5. **Source hierarchy:** actual contemporary measured flight-engine-aircraft data > contemporary full-scale tunnel or engine bench results with matching configuration > NACA theoretical/experimental charts transferable with explicit uncertainty > Greg's arithmetic/graphs and IL-2/DCS comparison as cross-checks. No blending of P-47B, P-47D, YP-47M or P-51B/D variants.

## Prioritized primary-report discoveries

| Priority | NACA report / year | Original source | Measured or calculated quantity | Physical lesson / limitation |
|---|---|---|---|---|
| **A1** | ARR Oct 1941, *The Selection of Propellers for High Thrust at Low Airspeed* (Biermann & Conway), source PDF **p. 27 Figs. 10–12** | [19930093644](https://ntrs.nasa.gov/citations/19930093644) | Three-/four-/six-/eight-blade efficiency vs J at Cp 0.2, 0.4, 0.6; shown against ideal | 3-/4-blade approximate hand-read curves are v2.3 **N**; high-tip-Mach and exact aircraft-blade installations not represented. Reading uncertainty roughly ±0.03–0.05 in η. |
| **A1** | Gardner, **1945 MR L5G09a**, P-47D 6507A-2 **three-blade** in-flight propeller tests | [19930093653](https://ntrs.nasa.gov/citations/19930093653) | Original **Table I**, normal and military 165-mph indicated climbs, J, Cp, CT, η, prop RPM, Mach, tip Mach; original Tables II/III high-speed and reduced RPM | Strong *unfitted independent flight-test holdout*. 12 hand-transcribed legible rows: NACA 1941 η mean abs error **0.014** (six climb points), **0.058** (six higher-speed points). High-Mach positive bias signals missing compressibility/installed blade physics. Aircraft is **not** P-47B. |
| **A1** | Crigler & Talkin, **1944 ACR L4I29**, *Charts for determining propeller efficiency* | [19930093312](https://ntrs.nasa.gov/citations/19930093312) | 4 blades, 2,000 bhp at 25,000 ft, 425 mph, 12 ft, 23 rps, J 2.26, Cp 0.342, η induced 0.931, **η propulsive 0.848** | Unfitted 1941 curve gives **0.844** for this example. Authors discuss profile losses, blade shanks, blade-angle and induced losses; older NACA reports may share underlying blade data, so not fully independent. |
| **A1** | **1943 ARR 3I25** *Representative operating charts of propellers tested in the NACA 20-foot propeller-research tunnel* | [19930091110](https://ntrs.nasa.gov/citations/19930091110) | Actual 3-, 4- and 6-blade operating `Cp/J/η` contour charts with different wing/nacelle combinations | Expand v2.3 simple interpolant into propeller-family/installation-dependent tables. Its 4-blade Figure 6 has been visually inspected. |
| **A1** | **1938 TR 642** *Five Full-Scale Propellers in Presence of Radial and Liquid-Cooled Nacelle; Two Spinners* | [19930091719](https://ntrs.nasa.gov/citations/19930091719) | Comparative tests of blades, propeller+nacelle interaction and spinners | Liquid-cooled spinner arrangement improved efficiency by **up to 6%** in tested high blade-angle regime, smaller at low blade angle. **Not** a flat +6% for a Mustang or 109. |
| **A1** | **1944 ARR L4H15** *Full-Scale Wind-Tunnel Investigation of Forward Underslung Cooling-Air Ducts* (XP-47 test) | [19930092667](https://ntrs.nasa.gov/citations/19930092667) | Duct pressure recovery and propeller slipstream effects | >90% free-stream q recovered in certain regimes; additional recovery roughly **0.07q at high speed, 0.45q at climb** in specified setup. **XP-47 duct, not a P-47B performance map**. |
| **A1** | **1939 SR 111** Silverstein, *Experiments on the Recovery of Waste Heat in Cooling Ducts* | [20090015245](https://ntrs.nasa.gov/citations/20090015245) | Full-scale duct/heat-recovery experiments | Investigators report waste-heat recovery not practically important **up to 400 mph in tested arrangements**. Heating changes cooling drag, especially at lower speeds. No default Meredith thrust subsidy at P-51 climb speed. |
| **A1** | **1943 ARR**, *The Effect of Altitude on Cooling* | [19930093163](https://ntrs.nasa.gov/citations/19930093163) | Pressure, heat jet, altitude and cooling-air drag accounting | A well-designed example's cooling penalty can be 2–2.5% of shaft power in modeled conditions. Engine and installation specific; not proof of a generic coefficient. |
| **A1** | **1943 XP-51 wind-tunnel wing section** | [19930092825](https://ntrs.nasa.gov/citations/19930092825) | Wing section profile drag, Reynolds roughly 6–13 million; beveled vs contoured aileron section drag delta ~0.0003 | Useful *section* polar/aileron effect. **Not complete P-51B airplane parasite CD0**. |
| **A1** | **1945 P-47D wing flight** *Smooth Wing Sections* | [19930093001](https://ntrs.nasa.gov/citations/19930093001) | In-flight local section `cd_min ≈ 0.0062` at 63% semispan, M ~0.25–0.69 and tests with lift coefficient up to ~0.68 | Relevance for profile drag rise in turns; never copy .0062 into whole-aircraft CD0. |
| **A1** | **1944 Allison V-1710-93 with two-stage supercharger**, simulated 17k and 29k ft bench tests | [20150017973](https://ntrs.nasa.gov/citations/20150017973) | Direct BHP, fuel/air flow, induction-system pressure and temperature per stage, charge-air cooling | Demonstrates altitude-power calculation methodology. Actual Allison **V-1710-93** is not Merlin V-1650-3, DB601E or P-47 R-2800. The 1944 test targeted **1,840 bhp at 17,000 ft** and **1,200 bhp at 29,000 ft**; targets are not asserted achieved. |
| **A1** | **1939 TM 895**, *Power of Aircraft Engines at Altitude* | [19930094521](https://ntrs.nasa.gov/citations/19930094521) | Supercharger/altitude power-law derivation and limits | Warns of simplified altitude power rules at high supercharged altitudes. Requires engine-specific charts at each rating. |
| **A2** | **1940 SR 168** | [20090014838](https://ntrs.nasa.gov/citations/20090014838) | Prop spinner/cuff/round shank/NACA 16 blade section comparisons | Blade geometry and reduction of blade-root losses important; tunnel test speed not sufficient to infer high-speed compressibility. |
| **A2** | **1940 TR 684** | [19930091761](https://ntrs.nasa.gov/citations/19930091761) | Static thrust/power from **six full-size props** | Takeoff/near-stationary prop behavior, absent from cruising-efficiency-only curve. |
| **A2** | **1942 TR 747** | [19930091825](https://ntrs.nasa.gov/citations/19930091825) | 4-/6-blade single/dual rotation propeller wind-tunnel evidence | Blade count, solidity and rotation type jointly affect η; not an automatic four-blade boost. |
| **A2** | **1944 ARR 4B04** | [19930093324](https://ntrs.nasa.gov/citations/19930093324) | Predicted vs measured 4-/6-/8-blade single-rotation propellers | Direct model-form validation and extrapolation limits. |
| **A2** | **1941 TR 725** | [19930091803](https://ntrs.nasa.gov/citations/19930091803) | Body-nose influence on propulsive efficiency | Propeller+nose+cowling are coupled, not independent coefficients. |
| **A2** | **1943 TR 765** | [19930091844](https://ntrs.nasa.gov/citations/19930091844) | Cylinder exhaust-jet nozzle gas reaction calculations | Exhaust momentum can recover useful thrust but depends on engine/exhaust geometry, temperature and back pressure. The previous universal +force assumption was empirically rejected. |
| **A2** | **1940 TM 932 / 1939 TM 896 / 1938 TM 869** | [932](https://ntrs.nasa.gov/citations/19930094485), [896](https://ntrs.nasa.gov/citations/19930094520), [869](https://ntrs.nasa.gov/citations/19930094547) | Thermal and aerodynamic interaction of heated radiators | Model explicitly inlet/outlet pressure, momentum, heat addition rather than a generic 'Meredith on/off' flag. |
| **A2** | **1939 SR 112 / 1942 SR 213** | [112](https://ntrs.nasa.gov/citations/20090015029), [213](https://ntrs.nasa.gov/citations/20090016325) | Radiator design and integration procedures | Primary design theory and practical losses, especially at climb and altitude. |
| **A2** | **1944 high-altitude cooling III/V** | [Radiators](https://ntrs.nasa.gov/citations/19930093172), [Cowling and ducting](https://ntrs.nasa.gov/citations/19930093174) | Pressure/duct/cooling design tradeoffs with altitude | Useful to replace fixed cooling-drag guesses after matched aircraft coolant/airflow inputs exist. |
| **A2** | **1945 P-47D production wing paint/roughness** | [19930092751](https://ntrs.nasa.gov/citations/19930092751) | In-flight wing profile drag of painted production surface | Camouflage/finish/transition materially affect real polar; not same as polished 1945 P-47D section tests. |
| **A2** | **1946 YP-47M altitude-wind-tunnel series** | [6507A-2](https://ntrs.nasa.gov/citations/20030065899), [Curtiss 836](https://ntrs.nasa.gov/citations/20030063262), [Aeroproducts](https://ntrs.nasa.gov/citations/20030063991) | Full actual propeller families at high blade loading, multiple altitudes | High value for power, compressibility, solidity and `J/Cp` validation; **YP-47M, not P-47B/D**. All previously image-only originals have now been separately OCRed. |
| **A2** | **1941 TM 981**, *Calculating Power at Altitude with Superchargers from Sea-Level Tests* | [19930094435](https://ntrs.nasa.gov/citations/19930094435) | Prediction with explicit compressor ratings/thermal efficiencies | Structural component of next rating-specific BHP-vs-altitude model; not an aircraft source power curve by itself. |

## New independent direct-flight validation: 1945 P-47D propeller

It is unusually valuable that Gardner's [period report](https://ntrs.nasa.gov/citations/19930093653) published **in-flight measured** propeller efficiencies at precisely the variables the 1941 figures use. We selected six clear Table I 165-mph indicated climb rows and six Table II higher-speed rows, manually transcribed **before comparing** them with NACA profile N. See `naca_inflight_prop_holdout_v23.cjs` and `naca_inflight_prop_holdout_results_v23.json` for full source row IDs and each prediction.

| Independent sample | Points | Mean abs η difference | Mean model η bias | Important limitation |
|---|---:|---:|---:|---|
| 1945 P-47D 6507A-2 climb | 6 | **0.0141** | +0.0108 | Some Cp below 1941 graph's 0.20 floor, clamped and marked |
| 1945 P-47D higher speed | 6 | **0.0579** | **+0.0574** | Tip Mach ~0.91–1.08; original 1941 proxy has **no** compressibility loss |
| All selected runs | 12 | **0.0360** | +0.0341 | Only one period propeller design; installation and sampling bias remain |

Illustrative original source rows: climb run 3-1 `J=.920`, `Cp=.107`, **η=.778 measured**, 1941 curve **.768**; run 5-8 `J=1.273`, `Cp=.250`, **η=.798**, curve **.807**. High-speed run 5-24 `J=2.486`, `Cp=.175`, **η=.664**, where positive bias becomes significant and tip Mach **1.079**. No efficiency fudge or source-to-model fit was applied.

This is the **best current argument** for treating N's low-speed propeller behavior as plausible rather than inventing a climb multiplier, and for making tip-Mach/airfoil-dependent compressibility the next distinct physical term. Do not merge the real P-47D three-blade geometry with our separate P-47B configuration.

### One more direct 1946 clue from the successfully OCRed YP-47M scans

The original 1946 [RM E6K26 summary, PDF p. 2–4](https://ntrs.nasa.gov/citations/20030065899), explicitly tested the Hamilton Standard **6507A-2 in both three- and four-blade forms on a YP-47M**. Four-blade tunnel `Cp=0.10–1.00` at free-stream `Mach=0.20/0.30/0.40`; three blades `Cp=0.30–1.00` at Mach 0.40, with tests as high as 45,000 ft. The four-blade efficiency dropped as Cp increased across the studied advance-ratio ranges, whereas the three-blade variant maintained approximately constant *maximum* efficiencies over `Cp=0.32–0.63`, `J=1.90–3.00`. Beyond stall/critical tip Mach, outboard blade thrust failed and shifted inboard. **The authors warn their measured force efficiencies were not corrected for wind-tunnel-wall constriction**, so these are *trend and geometry checks*, not absolute free-flight calibration points. This is an excellent next dataset for the high-loading/compressibility submodel. The separate OCR is machine-generated; verify any numeric data against the untouched original PDF image before using it as a table input.

## First v2.3 modeling implementation

`03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/` now contains:

- `physics.js` opt-in **NACA profile N**, 1941 3-/4-blade research η(J,Cp) surface, interpolation and out-of-domain warning. Profile **C** remains default. No changes to source horsepower curves or original historical benchmarks.
- `cases.json` explicit 3-blade Bf 109 F-4 versus 4-blade P-47B/P-51B/Spitfire metadata.
- `naca_propeller_benchmark_v23.cjs` and JSON results, all-aircraft speed/turn/climb checks.
- `naca_inflight_prop_holdout_v23.cjs` and JSON; completely separate 1945 in-flight P-47D external validation of generic **three-blade** curves.
- `plot_naca_v23.py` and four-panel graph with visible historical references.
- `make_html_v23.py` makes **self-contained, offline** `Universal_Four_Aircraft_Model_v2.3.html` with new N mode, source figures, limitations, full climb/turn comparison and independent in-flight P-47D efficiency holdout.
- Existing tests remain, plus two new v2.3 physics/source holdout regressions. The PDF archive and read-only source evidence are not overwritten by model operations.

### Numerically quantified retained failures/successes

| Metric | Pre-NACA candidate C | New NACA N + appropriate source scenario | Historical / secondary target |
|---|---:|---:|---:|
| 1944 4-blade calculation η at `J=2.26, Cp=.342` | not applicable | **.844** | **.848** NACA 1944 |
| Bf109F4 270-km/h IAS 360-degree turn 0m, Greg polar | 20.23 s | **20.33 s** | **20.30 s** IL-2 (secondary) |
| Bf109F4 corresponding turn 3000m | 25.83 s | **26.01 s** | **26.10 s** IL-2 (secondary) |
| Bf109F4 combat max TAS, Greg independently inferred polar | 315.5 mph | **320.5 mph** | **325 mph** separately sourced historical |
| P51B-15 Wright Field 2200ft 67-inHg steady climb, speed reanchored | 3401 fpm | **3320 fpm** | **3820 fpm** flight report |
| P51B-15 same at 75-inHg | 3979 fpm | **3894 fpm** | **4380 fpm** flight report |

This is **not** evidence that the F-4's real historical turn is known to one-hundredth of a second; IL-2 is a game simulation. It is evidence the physical propeller source is consistent with multiple distinct constraints. The Mustang absolute-climb deficit **increases** under N; it cannot be repaired scientifically by assuming that any plausible efficiency improvement is free.

## Next *large* modeling phase, ordered by independent source value

1. **Separate propeller geometry, pitch schedule, and compressibility**: digitize 1939–1945 NACA high-blade-loading curves and source 1945/1946 in-flight/altitude-tunnel `η(J,Cp,Mtip)` for 3-/4-blade propellers. Train **none** on the 1945 independent P-47D six climb/fast holdouts; reserve them. Seek exact P-51B Hamilton Standard K-6523A-24, Bf109F4 VDM, Spitfire LF IXc Rotol and P-47B type data. Keep model N experimental until per-aircraft mappings are defensible.
2. **Power at altitude, by engine and gear**: NACA 1939 TM895, 1941 TM981, turbo/ram studies, then explicit Merlin V-1650-3, DB601E, R-2800-21/P-47B, Merlin 66/Spitfire LF IXc. Separate military/wartime emergency/high-octane boost and critical heights, temperature/ram/induction loss. The NACA Allison V-1710-93 examples are methodological, not direct replacement engine curves.
3. **Complete drag and turn power budget**: use wing section data for profile-lift/nonlinear CD, airframe/nacelle cooling/stores drag separately, interference effects, `C_Lmax` vs Mach/altitude, realistic indicated/calibrated airspeed. Retain P-51B cruise and 67/75 climb as simultaneous unfitted holdouts; retain Bf109F4 both historical speed and secondary game turn checks.
4. **Cooling and Meredith as measured net force/power**, not a simple positive heat-thrust term: ambient inlet, duct/radiator pressure drops, airflow/heat, nozzle/exit flap, blower and prop slipstream. Constrain from actual aircraft test images/data only.
5. **Honest uncertainty and provenance**: per measurement original scan/page/table/variant/rating/weight; graph digitization error, model-form limitations and no claims of validation merely because spreadsheet tests pass.

**Overall research status:** this is a substantial first physical-data integration and deep archival corpus, **not** a final truth-model. Its clearest new empiricism is the direct 1945 P-47D flight propeller test, while the Mustang's absolute climb remains a documented unresolved historical discrepancy.
