# Comparative flight data for the current fleet

27 November 2026 · Integrated with simulator 4.19.0-rc.1 · Flight-input pack 1.11.0

This intake adds **332 source rows** in **91 series** from **12 publications**. It covers engine ratings, test loading, speed by altitude, climb schedules, five stall conditions, acceleration, roll and longitudinal control force. The archive grows from 2,848 to **3,180 observations**. Thirteen source entries represent the twelve publications because the official RAF history has separate British and German appendices. Each data row identifies its source, test aircraft, conditions and applicability. [All 332 rows in CSV](../../references/analysis/fleet-comparative-flight-data-2026-11-27.csv) · [Canonical data with sources and profile links](../../references/research/fleet_comparative_flight_data_2026-11-27.json) · [Fleet roadmap](WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md)

## Collections

| Collection | Rows | What is available for comparison |
| --- | ---: | --- |
| TAIC, the official RAF history and the USAAF Hoyt memorandum | 68 | Altitude, weight, level speed, climb, ceiling and service-specific low-speed definitions. The TAIC extract includes 45 rating-and-altitude rows across 12 aircraft types or variants. The USAAF comparison gives six US maximum-power climb rates at 10,000 ft with reported fuel fractions. [TAIC, pp. 1–3, 8, 10, 16–17](https://cgsc.contentdm.oclc.org/digital/api/collection/p4013coll8/id/4104/download) · [Richards, Appendix VI](https://www.ibiblio.org/hyperwar/UN/UK/UK-RAF-I/UK-RAF-I-VI.html) · [Appendix VII](https://www.ibiblio.org/hyperwar/UN/UK/UK-RAF-I/UK-RAF-I-VII.html) · [Hoyt, p. 2](https://www.wwiiaircraftperformance.org/mustang/Performance_Data_on_Fighter_Aircraft.pdf#page=2) |
| Four A&AEE Spitfire reports | 93 | 66 level-speed rows with instrument readings, 20 climb rows and seven comparative summaries. The Vb trials compare its intake snowguard fitted and removed. The IX trials cover Merlin 61, 66 and 70, blower changes and pressure-head corrections. The four-aircraft LF IX comparison includes the modeled BS.543 at its stated weight and propeller. [W.3134](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVb_W3134.html) · [BS.428](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitFMkIX_BS428.html) · [MA.648](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLFMkIX_MA648.html) · [EN.524](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitHFmkIX_EN524.html) |
| Bf 109 E, F and G | 24 | An E-3 museum compilation supplies two weight contexts, altitude speeds and climb times. The 1941 F-1/F-2 data sheet pairs true and indicated speeds, climb rate and time from sea level to 11 km at two ratings. A same-airframe G-1 test compares two engine and propeller installations. [E-3 specification, p. 8](https://www.saam.org.au/history_group_docs/SAAM%20Biography%20-%20MESSERSCHMITT%20Willy%20%26%20Bf109-E.pdf#page=8) · [F-1/F-2 sheet 6](https://stephentaylorhistorian.com/wp-content/uploads/2020/04/109_f1f2_kennblatt.pdf#page=6) · [G-1 installation trial](https://www.wwiiaircraftperformance.org/me109/VB-109-19-L-42.pdf) |
| Patuxent River Fw 190 A-4, F4U-1 and F6F-3 trial | 35 | 18 true-airspeed readings at six shared altitudes, three best-climb airspeeds and 14 engine and blower settings. The 8,690, 11,988 and 12,406 lb test aircraft flew two-minute speed runs. Those readings support comparisons over that duration. The Navy cautions that some runs may have ended before top speed. [Flight report, pp. 1–2 and enclosures 1 and 3](https://www.wwiiaircraftperformance.org/fw190/ptr-1107.pdf) |
| Ellis and Wheal, four restored US fighters | 112 | Four takeoff records, 20 stall configurations with warning, terminal speed and height loss, 16 directional roll results, 52 speed-time readings, four climb endpoints and 16 longitudinal stick-force points. Each row retains the restored airframe identity. The authors estimated the Mustang’s two highest pitch forces after exceeding the instrument range. [Test report and figures](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) |

## What matches the 14 operating aircraft

Each profile appears once below at its closest available relationship in this intake. The crosswalk in the JSON also lists its more distant comparisons.

| Closest relationship | Current profiles | How to use these rows |
| --- | --- | --- |
| **2 exact serials quoted by another report** | Spitfire Va X.4922 and LF IX BS.543 | W.3134 and MA.648 quote earlier trials of the modeled aircraft. Compare the other tested installations beside them. Count each quoted trial once. |
| **7 with a same-mark source** | Bf 109 E-3, Fw 190 A-4, Spitfire F IX, Spitfire HF IX, P-51B, P-51D and F4U-4 | Fw 190 A-4 and the two IX marks have other test specimens. The E-3, P-51B, P-51D and F4U-4 have mark-level entries at stated or partly known conditions. The P-51D same-mark addition is the published V-1650-7 engine ratings. Its acceleration trace belongs to a separately identified restored D. |
| **5 with related-family or installation references** | Bf 109 F-4, G-2, G-6/Trop, P-47B and P-38G | The F-1/F-2 has a DB 601 N, and the G-1 trial held the airframe constant across two installations. The P-47 and P-38 sources here are later variants. These rows give comparison ranges and original-report leads. Their numbers cannot settle an exact-profile climb or stall error. |

The archive includes F6F-3, F6F-3N, F6F-5, Spitfire I and P-40N material for future cohorts. The wartime F6F-3, the F6F-3N specification and the restored F6F-5 have distinct configurations. The table counts a source row once even when it supplies several profiles.

## A four-aircraft comparison made possible by the intake

The four restored aircraft have readable Figure 8 markers bracketing **180 to 205 KIAS** at 10,000 ft MSL, METO power and 50 °F. Interpolating each trace over that same 25-knot interval gives the times below. The former extract had a Mustang trace and one 60-second reading for each of the other three. This intake preserves those 16 readings and adds 36 markers. [Previous extract](../../references/analysis/m3-figure8-readings.csv) · [Figure 8](https://www.wwiiaircraftperformance.com/com/others/endingtheargument_files/figure8.jpg)

| Aircraft as tested | Seconds to gain 25 kt | Sensitivity to reading the plot |
| --- | ---: | ---: |
| P-51D 45-11586 | 25 | 23–28 s |
| F6F-5 BuNo 79683 | 33 | 28–38 s |
| P-47D-40 45-49181 | 34 | 27–38 s |
| FG-1D BuNo 92509 | 41 | 35–48 s |

For each crossing, linearly interpolate between the adjacent speed markers on that aircraft’s own trace. Subtract the time at 180 kt from the time at 205 kt. To show graph sensitivity, repeat using 182 to 203 kt and 178 to 207 kt. These are rounded reading bounds under a ±2 kt allowance. The Hellcat and Thunderbolt ranges overlap substantially. The trial used 100LL, the Thunderbolt had its turbocharger removed, and the Mustang used a V-1650-9 with the rear tank removed. In-flight weights are unavailable. The results describe these four aircraft in that test. [Test conditions](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html)

## Provenance and open originals

- **Secondary evidence is usable now.** TAIC combines guaranteed, measured and calculated figures. Its original-source lead is the relevant BuAer or Army characteristics sheet or the German summary identified in its front matter. The E-3 museum profile stays available with a search for its underlying Messerschmitt sheet. Its printed 3,280 ft/min and 17.83 m/s disagree, so the disputed rate is flagged in its own row. The altitude speeds and clock readings remain usable at the published grade.
- **Test definitions matter.** TAIC’s Navy low-speed entries are power-on stalls at normal gross weight. Its Army entries are typical landing speeds reported by pilots. The F-1/F-2 emergency column carries a three-minute rating limit, and its normal climb time repeats at 10 and 11 km. The Patuxent F6F-3 at 15,000 ft prints 310 kt beside 369 mph, which disagree. The extract retains the scan’s knots column and flags the discrepancy.
- **Several records extend an existing trial.** The EN.524 speeds were already available. This intake adds ASI and its correction channels. The MA.648, G-1 WNr 14026 and Patuxent source entries link to earlier records of those trials. The four-aircraft tests include previously published weights, some stalls and the 16 earlier Figure 8 readings. The overlapping German speed, climb and ceiling figures in Richards and TAIC count as one benchmark. [EN.524 holdout](../../references/analysis/hf-ix-en524-holdout.json) · [Earlier Patuxent extract](../../references/research/ww2_twelve_fighter_dual_lane_2026-11-10.json)
- **Application to the simulator.** The new data enter the built research catalog. The operating model and its 14-aircraft numerical scorecard use the existing flight inputs. The highest-value follow-up is to match operating conditions across the original report collections, then test shared input changes against the fleet. [Operating scorecard](../V418_FLEET_COMPARISON.md) · [4.19 steady-turn coverage](../V419_FLEET_STEADY_TURN.md) · [Research roadmap](WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md)

To regenerate the CSV from the canonical JSON, run `node scripts/export-fleet-research.cjs`. Its first columns identify the aircraft, grade, source, measurement and conditions. Filter by quantity to see the relevant native-unit columns. Empty cells preserve unreported or inapplicable quantities.
