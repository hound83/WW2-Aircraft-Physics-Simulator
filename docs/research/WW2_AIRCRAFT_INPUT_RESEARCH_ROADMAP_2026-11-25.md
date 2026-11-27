# Aircraft data research roadmap

Updated 27 November 2026 for simulator 4.19.0-rc.1 and its 14 operating aircraft.

## One milestone for the current fleet

**Make the current aircraft comparable across their flight envelopes.** Work through collections that cover several aircraft, ratings or measurements at once. Finish the usable tables when a report is in hand. A missing value belongs on its source record and the rest of the batch continues. The P-51 is one family in this work. The G-6 climb discrepancy stays in the fleet comparison alongside the other aircraft’s signed errors. [4.18 fleet comparison](../V418_FLEET_COMPARISON.md) · [Results and complete data from the first intake](FLEET_COMPARATIVE_DATA_2026-11-27.md)

| Work in the same milestone | Research to do together | What the simulator team receives |
| --- | --- | --- |
| **Power, cooling, level speed and climb** | Take the original Messerschmitt/Focke-Wulf, A&AEE, USAAF and BuAer report collections by installation. Extract loading, propeller, rated power against height, RPM, blower changes, radiator state, measured airspeeds, climb schedules and times wherever they occur in the same report. Use the existing 75 climb intervals to identify common altitude or power-setting errors across the fleet. | Speed and climb curves at identified settings, paired installation comparisons and a fleet list of altitude bands where the sim leads or lags. Each result identifies the trial and the loading it can represent. |
| **Stall, acceleration and handling** | Take multi-aircraft flight trials, pilot-note families and NACA flying-quality series in batches. Collect clean and landing configurations, event weight, instrument calibration, warning and stall speeds, timed level acceleration, measured roll and longitudinal force. Keep the digitised speed trace so the same interval can be checked across several aircraft. Collect steady-turn data when the source reports steady speed, power and load. | Comparable observations for all aircraft in each trial. A handbook number with incomplete conditions is available as a provisional reference. Calibration ranges, restoration changes and missing event weights travel with it. |
| **Apply the evidence across the roster** | Join sources to all relevant profiles and distinguish an exact serial, the same mark, a related installation and a family reference. Check duplicates across translations, reprints and later compilations. When a shared physics input has evidence, replay all affected profiles and reserve other trials for comparison. | One before/after fleet result per delivery with original and provisional evidence visible, profile coverage by grade, changes by measurement and the remaining uncertainties. |

**The next research intake combines the first two rows.** Start with the A&AEE, US Navy and German manufacturer collections already linked below. Within each collection, take the usable propulsion and handling material together. Search the underlying originals for provisional rows in that same pass. Another isolated pressure, stall speed or two-minute climb discrepancy does not need its own assignment.

### Evidence already delivered

| Collection | Current use | Next archive targets for that collection |
| --- | --- | --- |
| **British and German European fighters** | Four Spitfire trial reports, German installation and altitude tables, and official-history summaries cover the early fighters and later Merlin, DB and BMW installations. The recent intake preserves ASI alongside TAS and the printed corrections at each tested speed. | A&AEE full-span V/IX low-speed calibration, event weights, propeller/cooling schedules and independent climbs. In parallel within the same intake, pursue CEMA and Messerschmitt/Rechlin configuration and climb records for E, F and G, plus Focke-Wulf cooling and control trials. [British reports](FLEET_COMPARATIVE_DATA_2026-11-27.md#collections) · [German records](WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md) · [E-3 and Va](WW2_EARLY_WAR_FLIGHT_TESTS_2026-11-14.md) |
| **US land and naval fighters** | The wartime compilations link engine ratings to altitude. The Patuxent three-aircraft trial has actual loadings, blower settings and airspeeds. The four restored aircraft provide timed acceleration, multiple stall configurations, roll and stick force from one test program. | Pull families of Wright Field, BuAer and NACA reports for Lightning, Thunderbolt, Mustang, Corsair and Hellcat. Prioritize test weights, original speed corrections, independent speed/climb runs and measured acceleration or control forces. The restored traces supply a common comparison while the wartime originals are sought. [Four-aircraft trial and wartime comparators](FLEET_COMPARATIVE_DATA_2026-11-27.md#collections) · [US trial inventory](WW2_TWELVE_FIGHTER_DUAL_LANE_RESEARCH_2026-11-10.md) |
| **Fleet comparison evidence** | The 4.18 benchmark already covers 14 profiles and 91 possible pairs. It has 75 timed climb intervals across 16 configurations. The source grades and the two Spitfire wingtip configurations stay attached to their measurements. | Use the same evidence register for shared altitude windows, stall at the documented weight, acceleration across the same measured speeds, roll by direction and control force. Record when a missing condition prevents a numerical comparison and carry on with the other profiles. [Benchmark](../V418_FLEET_COMPARISON.md) · [Climb, stall and acceleration evidence](FLEET_CLIMB_SPITFIRE_STALL_MT215_2026-11-27.md) |

Use primary reports when they are accessible. Use a traceable secondary table immediately at the level its conditions support. Record the source, locator, reported variant and units, uncertainty and which primary report would improve it. A document can be primary for its own trial and only a family comparison for a different aircraft. Give each trial one provenance chain.

## What the simulator can check today

The 4.18 comparison counts provide the baseline for these six metrics. Version 4.19 also supplies steady-turn calculations across all 14 profiles, with the historical tests graded by their conditions. Each profile counts once per metric, even when it has several test heights. The research archive also retains observations that a current model cannot yet replay under matching conditions. [Fleet scorecard](../V418_FLEET_COMPARISON.md) · [4.19 steady-turn evidence](../V419_FLEET_STEADY_TURN.md) · [Earlier 4.17 counts](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/blob/454b11272334919ff8b33d433fde792882a1f3bf/docs/research/WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md#what-the-simulator-can-check-today)

| Metric | Profiles with numerical comparisons / 14 | Profiles with linked evidence / 14 |
| --- | ---: | ---: |
| Level speed | 14 | 14 |
| Time to altitude | 14 | 14 |
| Local climb rate | 13 | 13 |
| Clean 1 g stall | 2 | 11 |
| Timed level acceleration | 1 | 3 |
| Maneuver comparison | 2 | 3 |

## New aircraft after the current-fleet intake

Prepare candidate dossiers as collections already in hand supply their measurements. New aircraft join in cohorts with loading, installation and the first supported performance ranges documented. The eight dossiers below preserve the existing intake leads. [19-dossier crosswalk](WW2_PRIORITY_COMPARATIVE_COVERAGE_2026-11-13.md)

| Cohort | Dossiers to develop together | Return from the next collection |
| --- | --- | --- |
| **European comparisons** | Spitfire I N.3171, Fw 190 D-9 WNr 210002 and A-8 WNr 733705 | The Spitfire I gives the active E-3 an early-war contemporary. The two Focke-Wulfs extend the existing A-4 comparison. Keep propeller, fuel, wing, cooling and rating identifiable for each configuration. [Spitfire I trial](https://wwiiaircraftperformance.com/org/spitcom/mk1/spitmk1_N.3171.html) · [Focke-Wulf reports](WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md) |
| **US naval and land-based fighters** | F6F-3 BuAer 04776, P-47D-30 43-3441 and P-47D-22 42-26167 | Combine instrumented US handling and stall reports with Navy/AAF level-speed, engine and climb trials. The 1944 Patuxent F6F-3 is a different serial and adds an immediate same-mark comparison. [NACA Hellcat](https://ntrs.nasa.gov/citations/19930092602) · [NACA Thunderbolt](https://ntrs.nasa.gov/citations/20090022749) · [Patuxent trial](https://www.wwiiaircraftperformance.org/fw190/ptr-1107.pdf) |
| **Additional collection leads** | P-40F 41-13635 and Ki-84-I T-2 302 | Collect the P-40’s propeller-specific test conditions and speed/climb tables. For the Ki-84, pursue a measured performance flight alongside the existing handling report. Use typed and explicitly graded secondary material while looking for those originals. [Propeller trials](WW2_FLEET_PROPELLER_INPUTS_2026-11-12.md) · [Candidate dossiers](WW2_PRIORITY_AIRCRAFT_INPUTS_V1_10.md) |

[Previous profile-specific source leads and baseline counts](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/blob/454b11272334919ff8b33d433fde792882a1f3bf/docs/research/WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md)
