# Simulator model roadmap

The shared steady-flight solver calculates stall, speed, climb, acceleration, and instantaneous and sustained turn. The v4.10 propeller passes and v4.11 shared climb replay now provide matched power and cooling checks. The v4.12 milestone adds continuous stall and usable lift with condition-linked graph evidence. The v4.13 benchmark adds the first intake profiles and shows drag sensitivity for the Mustang–Spitfire comparison. [Solver](../src/physics.js) · [Shared climb results](V411_SHARED_FLIGHT_CLIMB.md) · [Normal / Combat comparison](V49_TIMED_MATCHUPS.md)

## Next implementation milestone

**Check energy retention across aircraft families.** Recover MT-215's original maneuver sheet and one British or US source with paired timed straight-flight and loaded-turn measurements. Compare speed change at matched mass, altitude, airspeed basis and rating. Reserve an interval or independent trial for checking the result. Use corrected, weight-matched stall observations to constrain the near-stall boundary. [Turn and acceleration leads](V414_POWERED_TURN_REPLAY.md)

**Delivered · Fleet turn and recovery.** A shared flight case now runs the 180° maneuver and straight recovery for both aircraft across the roster. The scorecard gives six calculated metrics per profile and attaches available historical comparisons with signed residuals and qualifications. [Fleet report](V415_FLEET_MANEUVER_ENERGY.md)

**Delivered · Recorded powered-turn replay.** The Bf 109 G-2 MT-215 case compares 22 s transcribed with 24.0 s modeled under the clean-cooling assumptions. The published timing, bank and speed imply different loads. [Replay and fleet regression](V414_POWERED_TURN_REPLAY.md)

**Delivered · Provisional level-acceleration replay.** The restored P-51D report and secondary timing endpoints give a 93.3 s nominal calculation versus 133 s transcribed. Wartime P-51D level speed and Spitfire climb provide separate power-balance checks. The original Figure 8 ordinates, a matched wartime speed-time record and an independent timed interval remain open. [Replay and twelve-profile regression](V414_LEVEL_ACCELERATION_REPLAY.md)

**Delivered · Drag above 1 G.** The matchup reports the drag-only range and the drag change needed to reach parity. The Mk I glide fit provides a provisional scenario with a measured lift boundary. The matched historical turn ranking remains open. [Results](V413_TURN_DRAG.md)

**Delivered · Continuous stall and usable maneuver lift.** The seven-aircraft replay records the Mustang transition, P-38G calibrated check and distinct Corsair glide and powered cases. [Results](V412_CONTINUOUS_STALL.md)

Grok’s parallel source work starts with the Bf 109 F-4. Its family summaries are discovery leads with specific reviewed rows linked to existing evidence. Carry new rows into the input pack after checking the source, condition and grade. [Family extraction review](../references/research/WW2_FAMILY_PRIMARY_EXTRACTION_v1_2026-11-12.md#review-for-simulator-use) · [Extraction queue](../references/research/WW2_EXTRACTION_BATCH_LIST_EXPANDED_2026-11-12.md)

## What the three files contribute

| Reference | Apply to the simulator |
| --- | --- |
| Performance framework | Use its power balance as the common check for level flight, climb and sustained turn. The existing solver already implements the main equations. The framework helps expose where one assumption affects several outputs, especially when changes to shaft power, propeller efficiency or drag can all reproduce the same top speed. |
| Variant dataset in Markdown | Use the rows as a guide to geometry, engine installations, load and later variants. The Fw 190 D-9 is a useful future lead because original tests already distinguish dry and MW 50 operation on WNr 210002. [German source register](research/WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md#fw-190-a-4-and-d-9) |
| Machine-readable dataset | Use its 21 rows across six families as leads for candidate records. Keep useful fields such as propeller geometry, rating-specific full-throttle height and explicit per-engine and total power where present. Verify selected fields against the original test, figure and installation before using them in the live comparison. [Existing evidence and source-selection contract](research/WW2_FIGHTER_SIM_INPUTS_V1.md) |

The Fw 190 A-5 is listed at 4,000 kg and a zero-lift drag coefficient of 0.0265 in the Markdown, and 4,106 kg and 0.0245 in the JSON. Establish the load and test configuration behind each value before selecting it. The JSON also groups the A-5 low-blower emergency rating with a high-blower combat rating. Gear comparisons need a common rating. For an active-profile example, the JSON’s Mustang B/C entry uses a V-1650-3, while the current benchmark uses the B-15 43-24777 with a V-1650-7. [Current aircraft cases](../aircraft/cases.json) · [Wright Field 43-24777](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html)

Two examples belong in the input checks. First, verify the report identifier and figure for a promoted value. The JSON link labelled NACA 916 opens NACA 1239. NASA indexes the P-51B drag study named in the Markdown under ACR 4K02. Second, check power across each full-throttle height. Applying the framework’s sea-level-density lapse formula directly to power rated at a 6,000 m full-throttle height would leave about 48% of rated power immediately above it. Use the original power curve and explicit gear domain first. Anchor any necessary estimated continuation at the end of its own branch. [Linked NASA report](https://ntrs.nasa.gov/citations/19930092244) · [P-51B drag study](https://ntrs.nasa.gov/citations/19930092458) · [Existing engine and installation inputs](research/WW2_FIGHTER_INPUT_REFERENCE_2026-11-12.md)

## 1. Propeller efficiency and follow-ups

The first pass is v4.10.0-rc.1. The seven-aircraft replay and the independent P-47B transfer are recorded in the [propeller milestone results](V410_PROPELLER_REFERENCE.md). The largest remaining Corsair level-speed discrepancy points to high-altitude shaft power and blower selection.

The first pass used v4.9.0-rc.2 as its baseline and replayed the F4U-4 80765 case and the P-47B Curtiss case. For future matched data, use one reference drag anchor per candidate installation and the observed power, RPM and cooling. Score all seven aircraft at matched conditions, including held-back speed and climb observations. Check how the plausible propeller range moves acceleration and sustained-turn comparisons.

The second pass is v4.10.0-rc.2. It pairs the Lightning's Military faired-shutter shaft-power schedule with a bounded high-speed tip loss and records the decision for each of the other four fighters. Remaining source gaps include the Fw 190 A-4 installation and gear, the Bf 109 F-4 combat power curve and the P-38G part-power balance. [Second-pass scorecard](V410_REMAINING_PROPELLERS.md) · [Propeller plan](NEXT_STEPS.md#next-milestone-for-propeller-efficiency)

## 2. Consolidate how a flight case reaches the solver

Today the build sends operating profiles and model inputs to the benchmark, and attaches reviewed cases for source grades. The benchmark chooses power and cooling in its calculation, while the source panel keeps its own aircraft-to-specimen lookup. Use the existing profiles and evidence catalog to prepare the flight case once, then use that same case in the live calculation and the historical replay. Put the specimen link on the profile. [Build](../scripts/build.cjs) · [Benchmark calculation](../src/operating-benchmark.js) · [Source panel](../src/operating-benchmark-ui.js)

- A case identifies the variant, engine and propeller installation, weight or fuel, stores, cooling, boost, RPM, gear, altitude and airspeed basis. Retain the original units with their source locators, and normalize once at the calculation boundary. Treat fuel, boost, injection and rating duration as operating settings on the relevant installation.
- Carry the basis and applicable range for each selected input. Reuse the existing observation IDs and source grades. Record when shaft power comes from an engine chart, propeller efficiency is inferred, or a drag value was fitted. Give a source limit or a reason when a case uses an estimate.
- Start with F4U-4 and P-47B, then exercise an Fw 190 A-4 gear/intake case and the P-38G per-engine calculation. Reproduce the previous scores when replaying the same inputs and record the effects of each intentional input change. Extend the existing flight-check and turn-power readouts so a selected source case can show observed performance, computed performance, shaft power, useful power and drag power together. [Operating profiles](../references/benchmark-operating-profiles.json) · [Current data handoff](SIMULATOR_DATA_HANDOFF.md)

## 3. Remodel the power required in a turn

Use the accepted propulsion inputs to constrain one aerodynamic problem at a time. Start with the Mustang–Spitfire crossover near 200 mph EAS at 10,000 ft in dry Combat and 50% internal fuel on both aircraft. The existing replay already shows that reasonable changes in available power, maneuver lift and incremental drag can change the lead there. Reuse the Mustang Figure 5 power-required replay to check the one-G baseline at its reported altitude and RPM, with chart-derived shaft power. Constrain the added drag above one G with powered-turn observations or drag evidence at matched load. Bound usable lift with matched stall and accelerated-lift evidence. The induced term grows with the square of load factor in the current polar. [Mustang Figure 5 diagnostics](P51_PROPELLER_EFFICIENCY_AUDIT.md) · [Turn validation and sensitivity](V44_TURN_PERFORMANCE.md) · [NACA TN 1044](https://ntrs.nasa.gov/citations/19930084610) · [NACA ACR 4K02](https://ntrs.nasa.gov/citations/19930092458)

Make the comparison say which aircraft leads across the supported input range and where the lead remains sensitive. Use the existing **6 km/h TAS**, **5% for climb or elapsed time**, and **0.5°/s sustained turn** as practical comparison margins. Report speed and climb accuracy against matched observations and their allowances. Acceleration and powered-turn accuracy need their own matched historical checks. Apply the 5:1 discrimination goal where independent evidence supports estimating the difference and its uncertainty. [Comparison margins](V49_TIMED_MATCHUPS.md#practical-ties-and-chart-evidence) · [Historical accuracy goals](research/WW2_FIGHTER_SIM_INPUTS_V1.md#selection-and-gold)

## 4. Expand the benchmark roster

The first intake delivered HF Mk IX BS.551, G-2 MT-215 and P-51D-15-NA 44-15342 for speed and climb. The second intake added G-6/Trop WNr 16476 and F Mk IX BF.274. The roster next queues Bf 109 E WNr 1304 and Spitfire Va X.4922, followed by Mk I N.3171. [Second intake results](V414_AIRCRAFT_INTAKE.md). Follow each report’s own load, power and configuration when introducing a new profile. [Aircraft intake results](V413_AIRCRAFT_INTAKE.md) · [Accepted roster](DECISIONS.md#aircraft-roster-expansion) · [Minimum input data](research/MINIMUM_VIABLE_SIM_DATA.md)

## 5. Add handling features when the evidence supports them

Start roll rate with a source-backed steady roll comparison at stated speed, altitude, stick force and aileron and wing configuration. NACA Report 868 Figure 47 provides the first comparison. Investigate airframe compressibility with matched high-Mach drag evidence when it affects an intended comparison. Treat airframe drag rise and propeller tip losses as separate terms in the power balance. [Roll-rate plan](NEXT_STEPS.md#later-roll-rate-comparison) · [NACA Report 868](https://ntrs.nasa.gov/api/citations/19930090943/downloads/19930090943.pdf) · [P-51B high-speed drag tests](https://ntrs.nasa.gov/citations/19930092458)
