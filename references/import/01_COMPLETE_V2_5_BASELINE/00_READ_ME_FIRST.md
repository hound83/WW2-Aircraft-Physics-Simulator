# European Air War — COMPLETE Physics/Research Model Handover
**Updated 27 October 2026 through Clean Physics v2.3 and a 112-report original NACA archival deep dive.** The complete archive includes original Greg research, primary wartime scans, four-aircraft Spitfire/109/P47B/Mustang model, predictive manifold pressure, independently derived Greg power/drag evidence, **1941 NACA propeller performance curves** and a newly found **1945 real P-47D in-flight propeller efficiency test**. **No unmeasured power correction has been promoted to the default.** Older v2.2 and v1.9 sections below are preserved for research history; start at v2.3.

## Three files to open first
1. `00_PASTE_IN_NEXT_CHAT.md` — paste this with the ZIP into a fresh conversation.
2. `03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/README_CLEAN_v23.md` — **current** numerical results, 1945 *independent real-flight propeller test* and the scientific next steps. Earlier Greg and engine audit details remain in v2.2.
3. `03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/Universal_Four_Aircraft_Model_v2.3.html` — **latest complete offline app**; the opt-in NACA `N` η(J,Cp) propeller mode and its NACA source evidence, plus all earlier Greg/F-4/cooling/ram panels. Prior HTML versions preserved.
4. `06_SOURCE_AND_SCIENTIFIC_EVIDENCE/NACA_1934_1946_DEEP_RESEARCH/NACA_DEEP_RESEARCH_v23.md` — **source-first index** to 112 original NACA PDFs (3,874 pages), original/reading copies, scanned figure, graph readings, NASA provenance, 8 newly OCRed reports, and precise applicability of each study.

## Where everything lives
- `01_GREG_ORIGINAL/` — user's unmodified original Greg handoff ZIP **and every extracted file**: 142-field workbook, 46-field Greg-style table, reference renderer, P-51B-15 input, JS calculator, four-phase framework, picture, source notes and tests.
- `02_GREG_DIAGNOSTIC/` — v0.3 Greg model source/boost/stall diagnostic, including code, inputs, tests, report.
- `03_MODEL_PROTOTYPES/Complete_Previous_Releases/` — *all seven original downloadable ZIP archives* from universal-model v0.1 through v0.7 (including repeated earlier files within archives for reproducibility).
- `03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/` — latest expanded source (historical directory name retained), with **v2.3** NACA propeller option and independent P-47D flight check, v2.2 Greg power accounting, v2.1 predictive induction, four-aircraft data, and all earlier scripts and offline HTML snapshots.
- `04_USER_IMAGES_AND_GREG_CHARTS/` — dated and descriptively named user screenshots: Greg's 109/47 drag/power/turn, Spitfire/Fw190, P-38/Mosquito, weight/stall scaling and P-47 manual airspeed corrections.
- `05_ATLAS_REPOSITORY/` — pinned GitHub v7.5 file references, original website and compatibility note.
- `06_SOURCE_AND_SCIENTIFIC_EVIDENCE/` — curated NACA/Wright Field/RAF/Focke-Wulf archive references, automatically extracted links, original Wright Field P-51B 1944 scans, plus **112 NACA report originals, 112 verified reading copies and 8 OCR'd report transcriptions** in a distinct 1934–46 research subdirectory.
- `07_DECISIONS_AND_HANDOVER/` — accepted modeling philosophy, unresolved checks, strict source and confidence policy and prioritized continuation tasks.
- `FILE_MANIFEST_SHA256.csv` — content hashes for every source/reference file in this handover (except itself).

## Latest scientific state (v2.3)

- **112 original NASA/NACA report PDFs, 3,874 pages** from 1934–1946 (plus one contextual 1930 original) acquired and hash-provenanced; originals preserved at full archival size (~1.54 GB), reading copies separately page verified (~575 MB). Many source charts concern blade loading, propeller geometry, nacelle/spinner drag, altitude engine power and cooling duct pressure recovery. The master NASA metadata catalog has 325 candidates; sources can include duplicate reprints and ancillary tests, so 112 does **not** mean 112 distinct fighter validations.
- NACA 1941 3-/4-blade η(J,Cp) is opt-in **N**, not fitted to aircraft performance; original **C remains default**. It agrees with a 1944 calculated four-blade NACA example **η=.844 vs .848 published** and independent *actual 1945 P-47D three-blade flight* efficiencies to **.0141 mean absolute η on six climb points**; high-speed flight difference **.0579** reveals unmodeled tip-Mach compressibility.
- **Greg-derived 109 F-4 polar with NACA 3-blade option** predicts IL-2 reference turns **20.33/26.01 s** vs simulated 20.30/26.10 s, and a separate historical combat speed of **320.5 mph** vs 325 mph. Those are simultaneous cross-checks without fitting IL-2 turn inputs. IL-2 is **not a real flight test**.
- **P-51B** historical 3820/4380 fpm still mismatched: experimental N model **3320/3894** when max-speed reanchored; do not invent Meredith thrust or universal efficiency fudge to hide the ~500-fpm discrepancy. The engine/drag/weight/installed propeller conditions need further original evidence.
- Run all Node regressions and consult `README_CLEAN_v23.md`. **Legacy v2.2 discussion follows only as historical background.**

## Previous scientific state (v2.2)

- **Greg's F-4 and P-47D source speed-dependent available-power tables normalize to within 0.76 percentage points on average** at 100–225 mph. His P-47D worksheet's 85% propeller efficiency is the **high-speed plateau**; at 175 mph it implies **80%**.
- With the actual 1944 P-51B-15 **3820/4380 fpm** climb anchors at 2200 ft, C predicts **3401/3979**. Transferring Greg's P-47D curve predicts **3497/4094**, but also pushes the originally calibrated 361.5-mph maximum speed to **366.7 mph**. Recalibrating speed reduces projected climbs to **3475/4070**. The issue remains open.
- Greg F-4 source drag polar e≈.558/CD₀≈.02437 produces IL-2 (secondary) 0/3-km 270-km/h IAS turn times ~**20.23/25.83s** vs **20.3/26.1s** reference, **without fitting the turns**. Yet with current C prop assumption its combat top speed is only **315.5 mph** vs a separately quoted 325-mph source. Both turn **and** speed constraints matter.
- Spitfire LF IXc is now part of the shared four-aircraft model. Source-derived ram modeling cuts its RAF measured 16-point climb-rate MAE from **365 to 139 fpm**, and inferred climb boost differs by **0.42 psi** from measured pressure; see v2.1 for input and independence caveats.
- **Read `README_CLEAN_v22.md` for the complete current results, scientific limits and immediate work.** The rest of this handover document records the previous v1.9-era work and remains valid only with its version/context.

## Historical research snapshot (v1.9)
The v0.7 three-plane (Bf 109 F-4, P-47B, P-51B-15) simulator is experimental. It reproduces Greg's Bf109/P47 worksheet power-balance calculations and imports report-based speed/climb constraints; it has **NOT passed an independent full aircraft E-M validation**.

- **v1.9 newly finds that a universal exhaust-force/BHP correction does NOT resolve the Mustang's 400-ft/min climb gap**. The old model correctly predicts 577 vs historical 560 ft/min for the 67→75-inHg boost gain. For a common dimensioned exhaust-force scenario (source-speed CD₀ recalibrated each time), 67-inHg climb alone needs ~320-lbf hypothetical force and 75 alone ~260-lbf; the two disagree, the boost gain overshoots, P-47B held-out speed MAE increases from 3.65 to ~14 mph, and the simulator-conditioned 109F-4 turn worsens. This is a diagnostic **rejection** of that shared assumption, not a claim that exhaust thrust is zero.
- **v1.9 confirms historical source power is chart-derived, not in-flight torque** for the P-51B-15; 9,335 lb is **takeoff** weight, 9,240 lb is a separate corrected **22,400-ft** cruise mass. A hypothetical −200-lb reduction at 2,200 ft only raises 67-inch climb from 3,401 to ~3,501 ft/min; setting e to the mathematical ideal 1.0 only reaches ~3,529. Neither alone fills the absolute gap. Read `README_CLEAN_v19.md` and reproduce with `installed_power_audit_v19.cjs`/`test_installed_power_v19.cjs`.
- **v1.8 (still preserved):** actual IL-2 and DCS comparisons and a physical momentum-disk alternative D were tested. D improved one P-51B Fig.5 sub-score but failed Allied historical holdouts, so **C remains the operational candidate**. Different P-47B/D-28/D-30 and P-51B-15/B-5/D variants are explicitly separate.

The historical notes below summarize older v1.7-and-earlier investigations; do not interpret their older artifact labels as the current handover version.

- **v1.7: F-4 large turn spread assessed immediately.** Original F-4 measured turn/polar still missing, but the independent IL-2 Great Battles *SIMULATOR* technical specification quotes 20.3 s at sea level and 26.1 s at 3,000 m at 270 km/h IAS, standard weight, emergency rating. A one-scalar e≈.547 *simulation-conditioned* scenario fits only the sea-level value and predicts **25.89 s at 3,000 m**, within .21 s of the withheld IL-2 game figure. The generic e=.78 turns **17.47 s / 21.06 s**, excessively fast relative to that reference. Greg's worksheet-derived e=.558 is close. The v1.7 UI defaults only the F-4 to that **explicitly provisional game-consistency scenario**, and exposes a switch to generic e. This is NOT a wartime flight-test validation or proof of true Oswald e.
- **v1.7: integrated power sensitivity for F-4 and P-51.** An illustrative ±5% installed-power shift changes the F-4 sea-level game-fitted implied e between .517 and .580, and P-51B near-optimal climb predictions by ≈220–250 ft/min. Original [NACA TN 2022](https://ntrs.nasa.gov/citations/19930082679) shows a qualitatively different efficiency trend under higher blade loading at climb speed than our candidate C heuristic (tested on a different three-bladed radial-fighter propeller). **No unmeasured propeller correction is fitted**; seek installation-relevant prop maps for both types.
- **v1.6: new unfitted original wartime low/mid-speed P-51B test.** At 22,400 ft the source Figure 5 records *test shaft horsepower versus true airspeed* at varying engine RPM. The model now converts original 2100/2300/2700/3000 engine-RPM observations correctly via P51 44:21 gearing. Candidate C requires **~729 bhp at 318 mph vs ~610 bhp in the graph (+119 bhp)**, despite just 2.61-mph MAE on withheld top-speed altitudes. At the current polar this would imply impossible-to-justify **.946 prop efficiency**. Increasing e to its theoretical cap 1.00 still leaves ~53 bhp lower/mid-point average absolute error. **No coefficient or synthetic thrust boost is fitted**; this is a clear, new falsification gate.
- **v1.6 preserves the failed absolute Mustang climb**, historical 3820/4380 vs modeled 3401/3979 ft/min at 2200 ft; each is short by ~114–119 propulsive hp. Its 67→75inHg increment remains close (+577 modeled vs +560 reported). These numbers do not uniquely identify installed prop efficiency/exhaust/radiator/engine chart errors.
- **v1.7: F4 *historical* validation still unresolved**. There is now a third **simulation-conditioned operational scenario** beside generic e=.78 and Greg e=.558. No original F4 low-speed glide/turn polar found. Previous source-backed DB601E gearing correction is preserved.

- **v1.5: physically corrected Bf 109 F-4 DB601E propeller reduction from a misapplied DB601N-like ratio to 1.685:1**. Combat 2500 engine RPM → **1484 prop RPM**; emergency 2700 engine RPM → **1602 prop RPM**. Original period manual text supports the gearbox; an inspected wartime Messerschmitt scan supports 2500 engine RPM but tests DB601E installed in **G-1**, not an F-4 climb polar. Shared propeller solver now responds to engine rating.
- **v1.5: the former ~3:59 apparent F4 climb match was spurious after the gearing correction.** Candidate C predicts **3:34 at e=.78** and **3:50 at Greg-derived e=.558** from 1000–5000m, compared to a still **unverified secondary quote** of 4:00. The original Rechlin numerical page and matched power/IAS/radiator conditions remain missing; neither e is validated.
- **v1.5: F4 turn-rate spread quantified**, not hidden: **17.89 vs 14.71 deg/sec** at 5000 ft / 170 mph EAS combat, a **3.18 deg/sec** difference. Changing e alone drives **3.214 deg/sec**; re-anchoring parasite CD0 adds just **0.034 deg/sec** in the opposite direction. A measured F4 low-speed polar is required to select a case.
- **v1.5: one shared prop candidate C survives both Allied level-speed holdouts**: **P-47B 3.65 mph MAE (5)** and **P-51B 2.61 mph MAE (8)**. P-47B withheld climb residuals total **56 ft/min MAE (4)** after one 15000-ft configuration fit. But **P-51B candidate C absolute climb misses by ~410 ft/min MAE** in a two-point 1944 Wright Field memo, even while a same-aircraft 67→75-inHg climb-gain delta is within 17 ft/min. This failure is unsolved; candidate B is closer on Mustang absolute climb.
- `cross_aircraft_diagnostic_v15.cjs`, `cross_aircraft_results_v15.json`, `cross_aircraft_v15.png`, `README_CLEAN_v15.md` reproduce the experiment and show every absolute value. The older v1.4 `.json`, `.png`, and README are intentionally retained as **superseded snapshots**, not the current equations/results.

- v0.3 corrected different P-47B climb versus high-speed engine/cooling assumptions; reported held-out climb residuals improved, but configuration loss fit is not universal.
- v0.4/0.5 compare P-51B-15 67/75-inHg climb rates with unchanged shared solver. Propeller candidate B was best for absolute P-51 climb, C for some P-47 and P-51 boost differences. **No generic efficiency candidate has been selected as validated.**
- v0.6 adds separate external stores mass and equivalent drag area, preserves an RAF Mosquito LR495 source caveat and imports clean P-38G tests as historical references (not simulated entries).
- v0.7 tests transfer of Mosquito stores penalty to Fw190 A-4 WNr619 and **fails**, requiring a future store/rack-specific drag-area fallback, not one universal +percent coefficient. Fw190 Report 5 identifies IAS error affected by external stores.

**Source caution:** v1.6 directly inspected original period P-51B Figures 1,5,6,7 (and labels six manually approximated graph reads as approximations), while other accessible HTML pages are primary-report *transcriptions*. **New v1.7 F-4 game technical specifications are NOT measured historical flight-test data**. The Messerschmitt G-1 report was inspected as a wartime scan; the Bf109 F manual reduction ratio was checked in indexed original-manual text but its page scan not downloaded. The alleged F-4 four-minute climb is unverified secondary numeric text. Every grade and limit is recorded in the v1.7 and v1.6 READMEs/results.

## Verification at packaging
All older physics/regression tests through `test_cross_aircraft_v15.cjs`, `test_p51_v16.cjs`, and the **new `test_joint_v17.cjs`/`test_html_static_v17.cjs`** are required to pass. A full-browser smoke test is optional where available; packaging checks ZIP CRCs and writes a SHA256 manifest. Do not interpret arithmetic unit tests as historical accuracy.

## Run locally from CURRENT_v0.7_WORKING_SOURCE
```
node test.mjs
node test_stores.cjs
node test_fw190.cjs
node cross_aircraft_diagnostic_v15.cjs --write # frozen three-aircraft baseline
node p51_drag_validation_v16.cjs --write
node test_p51_v16.cjs
node joint_low_speed_v17.cjs --write
node test_joint_v17.cjs
python plot_joint_v17.py
node test_html_static_v16.cjs
node test_html_static_v17.cjs
python test_browser.py       # optional Playwright/Chromium installed environment
python make_html.py         # rebuild standalone HTML after changing source
```
The latest `Universal_Three_Aircraft_Model_v1.7.html` works offline, including the new joint F4/P51 graph, original Figure 5 scan and selectable F4 operating scenario. Older v1.6/v1.5/v1.4/v0.7 HTML snapshots remain for reproducibility. The older external Greg screenshot section needs its companion local image to display, but main model/data/table calculations do not.
