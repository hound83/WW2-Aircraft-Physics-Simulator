# WWII aircraft simulator review and second-sweep roadmap

**21 November 2026 · Proposed milestones · Simulator 4.15.0-rc.1 · Fighter Sim Inputs 1.11.0**

The first change I would make is to let each aircraft keep its own graph. The second is to test the existing physics against two readings already accessible in the archives. Both changes would make the twelve current profiles more useful before a new drag or propeller fit is attempted.

The work recorded in *W Simulator work v6* delivered the fleet-wide level 180° turn and recovery, its nine starting conditions, and the six-metric scorecard. The five newer aircraft already have speed and climb profiles and a provisional maneuver calculation. The published simulator was verified at `4f723c0f`. The reviewed main revision, `1bc5e4d8`, additionally contains the early-war evidence handoff. Its regression job passed all 90 scripts and 85 browser checks. The review below combines the saved v6 work, source inspection, the frozen numerical cases and original figures. The pairing audit was run against the selection logic and saved cases. The browser results are from that revision’s CI. [Fleet results](../V415_FLEET_MANEUVER_ENERGY.md) · [Publication](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/runs/43602800011) · [Reviewed revision](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/1bc5e4d8ef061a30f1f9085ba5ca0199e72c0089) · [Main CI](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/runs/43881560447)

## 1. Fix the missing curves first

At 10,000 ft, Combat power, dry and 50% internal fuel, all twelve profiles have a positive modeled climb rate. Seven have a sustained-turn curve admitted to the top graph. When either selected profile belongs to the five newer ones, the interface clears the turn range for **both** sides. Across all 66 distinct unordered aircraft pairs with the aircraft filter set to All, this produces the following result. [Selection logic](../../src/operating-benchmark-ui.js#L129-L163) · [Chart rendering](../../src/operating-benchmark-chart.js#L543-L595) · [Frozen cases](../../references/analysis/v414-level-acceleration-before.json)

| Pair at the reference condition | Pairs | Current sustained-turn curves | Proposed display |
| --- | ---: | --- | --- |
| Two of the original seven | 21 | Both | Keep both curves. Calculate a difference over their common valid speed range. |
| One original and one newer profile | 35 | Neither | Keep the original aircraft’s curve. Name the missing inputs for its partner and link to that aircraft’s provisional 180° result. |
| Two of the five newer profiles | 10 | Neither | Explain each aircraft’s limit and offer the existing provisional maneuver comparison. |

The five newer profiles are the Spitfire HF IX, Bf 109 G-2, P-51D-15, Spitfire F IX and Bf 109 G-6/Trop. A simple reproduction is the Spitfire LF IX against the HF IX. Both have climb output at 10,000 ft. Selecting the HF removes the LF’s sustained-turn curve. The pairwise advantage panel also gets cleared. Straight climb uses its own positive-rate check. At an altitude where neither aircraft supplies any usable curve, a separate early return clears the climb panel without an explanation. [Intake regression](../../tests/test-aircraft-intake.cjs#L38-L55) · [Advantage panel](../../src/operating-benchmark-ui.js#L177-L208) · [Climb and empty-state logic](../../src/operating-benchmark-chart.js#L543-L578)

**Acceptance.** Exercise all 66 pairings in both selector orders at the reference condition. Check two, one or zero sustained-turn curves as appropriate, and two climb curves for every pair. Exercise a source-power boundary, estimates on and off, and a switch back to a supported altitude. Each plot, altitude table and speed readout should agree. Show a reason for missing data, clear stale values and keep dotted styling on the segments that depend on provisional inputs. Existing output values provide the regression baseline.

## 2. Make the evidence behind each result visible

| Metric | Profiles with numerical source comparisons | What those comparisons establish |
| --- | ---: | --- |
| Level speed | 12/12 | Includes fit consistency, reserved speeds and shared-report inputs. |
| Climb rate | 10/12 | The G-6/Trop has a ceiling reference. The F-4 has no numerical climb-rate comparison in the fleet scorecard. |
| Elapsed climb | 11/12 | The G-6/Trop is the missing profile. Times at successive heights in a single climb share one run. |
| Clean 1 G stall | 2/12 | P-38G sister-airframe and F4U-4 transfer checks. |
| Level acceleration | 1/12 | A restored P-51D is compared with a wartime-aircraft proxy. |
| Maneuverability | 2/12 | P-51B usable lift and a G-2 360° turn check parts of the model. **0/12** have a matched historical 180° turn followed by recovery to entry speed. |

All twelve profiles calculate all six metrics at the reference condition. The current scorecard defines agreement as 100 minus mean absolute percentage error. Keep it in the detail view. Beside the plotted value, put the signed residual in the original unit, the measurement actually compared, and the number of independent reports or runs. For example, the P-51B’s 98.9% maneuver entry comes from five **lift** checks. Labeling it “usable lift” at the point of comparison makes clear what someone can infer from it. [Fleet scorecard](../V415_FLEET_MANEUVER_ENERGY.md#historical-agreement-by-aircraft) · [Scoring code](../../validation/diagnostics/fleet_validation.cjs#L35-L45)

Use the same selected flight conditions for the graph, readout and export. Show the observed points separately from the computed curve. Keep sensitivity ranges labeled with the inputs varied. Judge the 5:1 discrimination target per aircraft pair, metric and condition only where independent evidence bounds the error in the **difference**. Reproducing the sign of a difference is a weaker, separately useful result. [Model roadmap](../SIMULATOR_ROADMAP.md) · [Known limitations](../KNOWN_LIMITATIONS.md)

## 3. Second-sweep research in priority order

### A. Bf 109 G-6/Trop WNr 16476 — the quickest gap to close

Messerschmitt report 109 10 L 43 contains both **elapsed climb and rate of climb** on printed sheet 6 (PDF page 7). The axes share the horizontal grid and have different units, minutes and metres per second. Sheet 7 records radiator position and temperatures. The recorded climb starts at 3,260 kg, 260 km/h indicated, 2,600 rpm and 1.30 ata, with the sand filter. The scorecard currently has a ceiling reference for rate and a model-only elapsed time. [Original climb sheet](https://wwiiaircraftperformance.com/org/me109/g/g_files/me-109g6-16476-pg7-1400.jpg) · [Cooling sheet](https://wwiiaircraftperformance.com/org/me109/g/g_files/me-109g6-16476-pg8.jpg) · [Full report](https://wwiiaircraftperformance.com/org/me109/g/g_files/VB-109-10-L-43.pdf)

Digitize each curve against its own axis, retain chart-reading bounds and mark the visible bend near 5 km. Replay the historical climb schedule and radiator conditions separately from the player's best-climb setting. Reserve upper-altitude points before considering a fit. Report rate and time residuals by altitude with the shared run identified. One accepted replay could bring numerical coverage to **11/12 for climb rate and 12/12 for elapsed climb**.

### B. P-51D level acceleration — test the shape of the replay

Figure 8 of Ellis and Wheal’s 1990 test report plots **speed at 60 seconds** against **time to maximum level speed**. For the restored P-51D 45-11586 the symbol reads approximately **195–200 KIAS at 60 s** and the label gives **242 KIAS maximum**. The stored simulation trace gives **217.38 proxy KIAS at 60 s**, about **17–22 knots high**. It reaches 242 KIAS in 93.3 s against the transcribed 133 s. The 60-second comparison shows the discrepancy is already present before the endpoint. [Original Figure 8](https://www.wwiiaircraftperformance.com/com/others/endingtheargument_files/figure8.jpg) · [Test installation and conditions](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) · [Model trace](../../validation/current/level-acceleration.json)

Record the primary figure reading and graphical uncertainty against the existing run ID, `setp-p51d-4511586-level-acceleration-figure-8`. The 110 KIAS starting value comes from the secondary transcription. Preserve separately the authors’ time to maximum and the solver’s time to cross a specified rounded speed. The 60-second marker and the finish share a run. Show both residuals and keep the restored V-1650-9 installation distinct from wartime 44-15342. Actual run mass, installed power, cooling and IAS calibration would change the interpretation. Figures 9–10 also distinguish steady-turn observations from wind-up data for this campaign. [Existing replay assumptions](../V414_LEVEL_ACCELERATION_REPLAY.md) · [Original Figures 9–10](https://www.wwiiaircraftperformance.com/com/others/endingtheargument_files/figure9-10.jpg)

### C. HF/LF Spitfire IX — a controlled test of relative accuracy

At 30,000 ft the paired Boscombe Down level-speed trial has the HF **18 mph TAS** faster than the LF. The model gives **29.7 mph**, overstating the difference by **11.7 mph** even though it reproduces the crossover between the sampled altitudes. Replay BS.551 and BS.543 by supercharger gear. Then check the matching propeller and reduction-gear installation on a second HF airframe, EN.524, before attributing the difference to propeller efficiency. That aircraft had a reported carburettor change and its climb schedule partly draws on BS.551. Track those dependencies by metric. Report the signed HF–LF errors across altitude alongside the individual residuals. [Paired A&AEE trial](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [Modeled differences](../V413_AIRCRAFT_INTAKE.md) · [EN.524 trial, §§4–5](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitHFmkIX_EN524.html)

### D. Loaded-turn energy and stall — the longer research track

Start with Pekka Kokko’s MT-215 maneuver sheet. The two circulating accounts trace back to the same test and disagree on the date. Establish the altitude and settings of the straight acceleration intervals before pairing them with the turn. Seek a second airframe family with a recorded straight run and loaded run under overlapping conditions. The restored US campaign provides a qualified check. NACA W-6 on the F2A-3 provides an independent test of the calculation method. Preserve the actual aircraft, power, mass, speed basis, altitude history and cooling for each. Fit an added-drag term only when the straight-flight balance is constrained and a separate run or interval can test it. [MT-215 replay and source trail](../V414_POWERED_TURN_REPLAY.md) · [Finnish Air Force Museum research collections](https://airforcemuseum.fi/photo-and-research-collections/) · [NACA W-6](https://ntrs.nasa.gov/citations/19930092640)

For clean stall, seek a low-speed position-error curve and run weight for P-51B 43-24777 or LF IX BS.543. Keep the indicated speed in the source units until the correction covers the observed speed. Use a sister-airframe weight transfer only within compatible wing geometry, configuration and lift evidence. Give clipped wings their own area and lift assumptions. Keep the current finite-turn estimates available while the historical comparison is unresolved. [Stall and lift evidence](../V412_CONTINUOUS_STALL.md) · [NACA TN 1044](https://ntrs.nasa.gov/citations/19930084610)

## 4. Delivery sequence

| Milestone | Deliverable | Completion test |
| --- | --- | --- |
| **1. Repair the comparison graphs** | Per-aircraft curve availability, a useful single-curve view, and an explanation when neither curve is available. | The 66-pair matrix, reversed selectors and altitude boundary cases pass. The original four benchmark aircraft retain their numerical results. |
| **2. Replay the two accessible figures** | G-6/Trop climb and P-51D acceleration checks beside the relevant graph. | Publish signed residuals, chart-reading bounds, test settings, and run lineage. A discrepancy remains visible when the historical inputs cannot explain it. |
| **3. Test relative performance** | HF/LF IX altitude comparison and a transfer check on EN.524. Start the longer two-family energy search in parallel. | Report where ordering, magnitude, or neither is supported. Consider one physical input change at a time against reserved conditions and check the rest of the fleet for regressions. |
| **4. Expand the roster and handling by evidence** | Bring in Bf 109 E-3 WNr 1304/AE479 and Spitfire Va X.4922 for their supported metrics, followed by Mk I N.3171. Prototype roll separately using Spitfire Va W.3119. | The existing 522-row early-war handoff supplies the starting evidence. Flag the X.4922 low-altitude speed gap and E-3 run-condition gaps. Publish roll at the recorded speed, force and aileron configuration before adding roll-in time to the 180° benchmark. |

The early-war intake can proceed once the interface can express different evidence by metric. The trigger for a shared maneuver-model revision is a matched, held-back observation that distinguishes lift, useful power or added drag. A source search can also finish by documenting which of those inputs remains indeterminate. [Early-war handoff](WW2_EARLY_WAR_FLIGHT_TESTS_2026-11-14.md) · [X.4922 trial](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVa_X4922.html) · [W.3119 flight tests, NACA L-334](https://ntrs.nasa.gov/citations/19930092582)
