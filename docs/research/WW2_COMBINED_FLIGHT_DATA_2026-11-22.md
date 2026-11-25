# Six-aircraft flight performance and measured maneuver recovery

> **Source correction, 25 November 2026.** The printed Figure 8 gives continuous speed versus time. The Mustang reads about 213 KIAS at 60 seconds. The 242 KIAS / 133 s transcription has separate provenance. See the [corrected chart readings and replay](M3_STALL_ACCELERATION_CLIMB.md#timed-level-acceleration) when using the historical results below.

22 November 2026 · Research against simulator 4.15.0-rc.1 and Fighter Sim Inputs 1.11.0 · [Starting revision](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/9a2177e439de10e9cdf4f498cb8e86bb824e0476)

The G-6 climb chart fills the last elapsed-climb gap in the 12-profile fleet scorecard. It also exposes a sign change in the model error. The LF and HF Spitfires exchange the lead three times in the measured level-speed tables. For turn and recovery, five families now have an explicit account of the phases measured. A continuous 180° turn, exit speed and timed recovery to the entry speed remain open in all five. [Six-aircraft comparison CSV](../../references/analysis/six-aircraft-flight-comparison.csv) · [Additional source transcriptions](../../references/analysis/combined-flight-comparison-sources.json)

## Bf 109 E-3 and Spitfire Va

WNr 1304 and X.4922 have different test loads, engine settings and cooling schedules. The table compares their recorded configurations at common heights. X.4922 used a de Havilland propeller at 6,450 lb and nominal +9 lb/in². Its level-speed measurements begin at 10,000 ft. The French test used 2,400 rpm for the level runs. The RAE gives 5,600 lb for the French climb. [CEMA level table, p. 4](https://www.wwiiaircraftperformance.org/me109/Me-109E3-French-3.jpg) · [RAE reproduction of the French climb](https://www.wwiiaircraftperformance.org/me109/Me-109E3-French-2.jpg) · [A&AEE X.4922 speed and climb](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVa_X4922.html)

| Height | E-3 radiator | E-3 speed | Va speed at same height | Va minus E-3 |
| --- | --- | ---: | ---: | ---: |
| 4,500 m | Open | 530 km/h | 354.1 mph | +24.8 mph |
| 5,000 m | Open | 520 km/h | 359.7 mph | +36.6 mph |
| 5,000 m | Closed | 570 km/h | 359.7 mph | +5.5 mph |
| 5,300 m | Closed | 570 km/h | 361.8 mph | +7.6 mph |
| 6,000 m | Closed | 565 km/h | 371.0 mph | +19.9 mph |

The Va column interpolates its adjacent measured TAS values. At 5,000 m the French pressure readings were 870 mm open and 880 mm closed. CEMA quoted about ±15 km/h near peak speed, roughly ±9 mph. The 5.5 mph closed-radiator difference falls inside that allowance. The open-radiator comparison is much larger. The original table places the second 570 km/h reading at 5,300 m. Drix gives 5,500 m. Rocher also describes separate CEAM comparative tests on the captured aircraft. [Original and secondary evidence ledger](WW2_EARLY_WAR_FLIGHT_TESTS_2026-11-14.md) · [Drix](https://aviadrix.blogspot.com/2012/09/messerschmitt-109-emile-maitre-de-la.html)

Using 3,280 ft as a common clock origin avoids assuming how the French stopwatch was started. From there to 19,750 ft, the Va took around 64 seconds less. At that height the French point rate was 1,860 ft/min and the interpolated Va rate was about 2,319 ft/min. The E-3 radiators progressively closed above 13,000 ft. The dataset preserves the original French point rates and the distinct secondary interval averages. The E-3 and Va have source-only dossiers in this comparison. [Climb rows and provenance](../../references/analysis/ww2_early_war_flight_tests_2026-11-14.json)

## Bf 109 G-6/Trop and the three Mk IXs

| As-tested quantity | G-6/Trop WNr 16476 | F IX BF.274 | LF IX BS.543 | HF IX BS.551 |
| --- | ---: | ---: | ---: | ---: |
| Level speed at 6,420 m, mph TAS | 379.0 | 379.1 | 403.3 | 393.7 |
| Climb rate at 10,000 ft, ft/min | ~2,765 | 3,820 | 4,280 | 4,570 |
| Time to 10,000 ft, s | ~190 | 162 | 129 | 132 |
| Climb rate at 20,000 ft, ft/min | ~2,212 | 2,930 | 3,560 | 3,500 |
| Time to 20,000 ft, s | ~435 | 336 | 285 | 285 |
| Climb rate at 30,000 ft, ft/min | ~1,032 | 2,280 | 2,120 | 2,600 |
| Time to 30,000 ft, s | ~821 | 552 | 504 | 468 |

The G-6 level value is the fully equipped report anchor. The three Spitfire speeds at that height interpolate the tabulated blower-gear curves separately, taking the higher supported speed. A tenth of a mph between G-6 and F IX is below the available precision. At the English heights the G-6 climb values interpolate the chart, while the Spitfire values come directly from the tables. The British Combat climbs used the test concession for continuous power. These are source-clock times and different flight-test installations. [Messerschmitt report](https://wwiiaircraftperformance.com/org/me109/g/me109g-16476.html) · [BF.274 Tables I, II and IV](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitFmkIX_BF274.html) · [LF/HF Tables II, III, V and VI](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)

**The HF minus LF level-speed difference changes sign between 12,000–14,000 ft, 18,000–20,000 ft and 24,000–26,000 ft.** These bands use heights where both aircraft have tabulated measurements. The low and high blower curves overlap. At 30,000 ft, BS.551 recorded 413 mph versus 395 for BS.543. The model gives 424.54 and 394.83 mph, which overstates the separation by 11.71 mph. In the full-rating climb, the HF reached 30,000 ft 36 seconds earlier. The two profiles had distinct climb speeds, RPM and gear-change heights. Both campaigns used the BF.274 pressure-head correction. [Paired A&AEE trial](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)

**A separate HF IX gives a check on the direction of that error.** EN.524 at the standard 0.477:1 reduction and 10 ft 9 in propeller recorded 408 mph at 30,000 ft in Table IV, or 407 mph in the summary. That is 5–6 mph below BS.551. The BS.551 model prediction sits about 17 mph above EN.524. A&AEE suspected a modified carburettor setting on EN.524, reused the earlier climb-speed schedule, and recorded a higher ultimate ceiling. It reports a spread of up to 3 mph among its three propeller/gear combinations through 27,000 ft, increasing to a maximum 18 mph at 39,000 ft. The surviving online comparison omits the alternate numerical tables at 30,000 ft. The evidence cannot assign a specific share of the 11.71 mph discrepancy to the propeller. The new data include all 22 rows of Table I and 17 of Table IV. [EN.524 report, §§4–5, Tables I and IV](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitHFmkIX_EN524.html)

## What the G-6 replay checks

The [high-altitude climb investigation](BF109G6_HIGH_ALTITUDE_CLIMB_2026-11-22.md) replays the G-6 manifold-pressure trace, tests the conflicting departure weights and compares a separate G-1 test. It localizes the largest error to the last kilometre.

The German report prose calls the charts pages 6 and 7. Their printed headings and PDF positions are Blatt 7 and 8. The first chart has a nonuniform height grid. Its speed line is labelled true climb speed. The report separately specifies 260 km/h indicated. The falling pressure curves use a separate scale. The 3,260 kg trial used the sand filter, 1.30 ata and 2,600 rpm. The source file records the PDF hash, rendering size, grid calibration, curve readings, five visible climb-rate symbols, 23 coolant-temperature symbols and 11 radiator-opening readings. The plotted openings range from about 55 to 270 mm. The symbols and curves come from one campaign. [Original plates, PDF pp. 7–8](https://wwiiaircraftperformance.com/org/me109/g/g_files/VB-109-10-L-43.pdf#page=7) · [Chart coordinates and uncertainties](../../references/analysis/g6-16476-climb-charts.json)

| Height | Source time | Model time | Model minus source | Source rate | Model rate |
| --- | ---: | ---: | ---: | ---: | ---: |
| 5 km | 336 s | 317 s | −19 s | 2,441 ft/min | 2,821 ft/min |
| 8 km | 636 s | 596 s | −40 s | 1,496 ft/min | 1,401 ft/min |
| 10 km | 1,026 s | 1,154 s | +128 s | 610 ft/min | 307 ft/min |

The model follows the digitized true-speed line at fixed takeoff weight and includes the change in kinetic energy with height. A local 100 ft interval, shortened at the endpoints, supplies modeled vertical rate. The chart-read allowance is ±0.2 m/s and ±12 s through 9 km, rising to ±24 s for the 10 km time. Integrating the ten measured rate bands reproduces the chart's 10 km time within 7 seconds. This is an internal check on the transcription. No independent repeat climb has been identified. At 11 km the low rate is readable, and the true-speed curve ends below that level. The scored replay ends at 10 km. [Replay implementation](../../validation/diagnostics/g6_archival_climb.cjs)

| Operating aircraft | Mean signed level error | Mean signed rate error | Mean signed elapsed error |
| --- | ---: | ---: | ---: |
| G-6/Trop | −4.0 mph, 2 checks outside fit | +117 ft/min, 11 | −2.0 s, 10 |
| F IX BF.274 | +4.1 mph, 15 outside fit | +161 ft/min, 34 Normal and Combat | −2.9 s Normal, −29.6 s Combat, 4 each |
| LF IX BS.543 | +0.1 mph, 17 fit points | −26 ft/min, 10 reserved within report | +0.4 s, 1 interval from 2,000 ft |
| HF IX BS.551 | +7.4 mph, 18 outside fit | +106 ft/min, 21 | −1.5 s, 3 intervals from 2,000 ft |

The G-6 mean elapsed error combines sizeable errors of opposite signs. Climb-rate comparison coverage rises from 10/12 to **11/12** and elapsed-climb coverage from 11/12 to **12/12**. Level speed stays at 12/12, clean stall at 2/12, straight acceleration at 1/12 and partial maneuver comparisons at 2/12. Those counts include fitted, same-report, proxy and transferred values at their documented grades. The F-4 still lacks a scored pointwise rate. [Fleet scorecard](../../validation/diagnostics/fleet_validation.cjs)

## Turn exit, acceleration and low-speed evidence

| Aircraft and test | Measured turn | Straight acceleration or low-speed evidence | Post-turn recovery |
| --- | --- | --- | --- |
| Finnish Bf 109 G-2 MT-215, Kokko | 180° in 10 s, 450 to 380 km/h. A separate 360° run took 18 s, 450 to 330 km/h. | Separate maximum-power segments give 300–440 km/h in 27 s and 440–510 km/h in 35 s. | Unrecorded. Piecewise linear interpolation of those separate runs gives 16.6 s for 380–450 km/h. Their altitude, exact power, mass and speed correction remain unresolved. |
| Restored P-51D 45-11586 | 180° in 10.0 s from 220 knots | Printed Figure 8 reads 195–200 KIAS at 60 s. The wartime-profile proxy produces 217.38, around 17–22 knots high. | Exit speed and recovery time unreported. |
| Restored P-47D-40 45-49181 | 180° in 9.7 s | Figure 8 reads about 169–175 KIAS at 60 s. Turbocharger removed. | Unreported. |
| Restored FG-1D Bu 92509 | 180° in 8.5 s | Figure 8 reads about 167–172 KIAS at 60 s. | Unreported. |
| Restored F6F-5 Bu 79683 | 180° in 9.9 s | Figure 8 reads about 177–183 KIAS at 60 s. | Unreported. |

The Finnish accounts disagree on the test date. They describe the same specimen and pilot. The 16.6 s reconstruction uses 60/140 of the first straight interval and 10/70 of the second. Its uncertainty includes the unknown acceleration shape inside each interval. No measured stopwatch interval connects the turn exit to the end of recovery. [Finnish table transcription](https://forum.il2sturmovik.com/topic/6315-bf109g-2-turn-and-accelerationdeceleration-data/) · [Second published account](https://www.virtualpilots.fi/feature/articles/109myths/) · [Finnish Aviation Museum archive](https://ilmailumuseo.fi/en/kirjasto-arkisto/)

Ellis and Wheal tested the four restored types at 10,000 ft MSL and METO. In printed Figure 8 each marker has two coordinates, indicated speed at 60 seconds and time to maximum speed. The Mustang marker is labelled 255 KIAS maximum. A secondary transcription supplies 110–242 KIAS in 133 s. The existing model reaches that particular 242-KIAS target in 93.32 s, 39.68 s early. Its engine, event weight and calibration differ or remain uncertain. Figure 8, the secondary endpoint, the clean and decelerating 3 g stalls in Table II and the heading change in Table VI retain separate field definitions. [Printed Figure 8, p. 52](https://ww2aircraft.net/forum/attachments/eta-6-jpg.469533/) · [Test conditions and Tables I, II and VI](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) · [Secondary endpoint](https://ww2aircraft.net/forum/threads/captured-aircraft-equipment-report-14.65811/?post=2043798)

A separate wartime P-47D-30, 43-3441, supplies two recorded glide-stall approaches at 12,400 lb and 5,000 ft. Figure 49 shows about 114–117 mph service indicated around the late roll/pitch break. Figure 50 contains repeated troughs under control input, including about 103 mph at 12 s. Both speed traces have been sampled with a ±3 mph graphical allowance. The related NACA lateral/directional report describes low-speed position calibration of a right-wing boom against a trailing-head reference. The longitudinal figures retain their printed channel name. A numeric correction applicable to the stall was not recovered. For the Mustang 43-24777 the 86 mph observation is below its published calibration plot, and BF.274's sweep begins at 130 mph. These records support near-stall checks in their stated units. Exact corrected clean-stall checks for the two target families remain open. [P-47 Figs. 49–50, PDF pp. 72–73](https://ntrs.nasa.gov/api/citations/20090022749/downloads/20090022749.pdf#page=72) · [NACA TN 2675, instrumentation](https://ntrs.nasa.gov/api/citations/19930083825/downloads/19930083825.pdf) · [P-51B-15 trial](https://www.wwiiaircraftperformance.org/mustang/p51b-24777.html) · [BF.274 position-error trial](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitFmkIX_BF274.html)

## Source reconciliation and reproduction

All 78 early-war series and 522 rows have a documented use. **70 rows match all transcribed fields** after explicit column and vocabulary mapping. The links comprise 28 X.4922 rows, 29 primary N.3171 rows, one N.3171 secondary summary, ten W.3119 stall cases and two W.3119 engine-rating rows. X.4922's extra zero-time row is an origin. W.3119's takeoff rating has an unreported altitude in one source and an explicit zero in the other. The ledger also identifies alternate readings, related trials, derived transfers and ten source records without numerical series. An unlinked row makes no claim to a new independent trial. [November handoff](../../references/analysis/ww2_early_war_flight_tests_2026-11-14.json) · [Field matching and all series dispositions](../../validation/diagnostics/early_war_series_crosswalk.cjs)

Run `npm run check`. The resulting `validation/current/flight-data-comparison.json` contains source row IDs, interpolation brackets, all four operating profiles' signed residuals, chart readings in their source units, the two P-47 traces and the complete row crosswalk. The same run generates the [CSV](../../references/analysis/six-aircraft-flight-comparison.csv) and checks the public copy for drift. Both generated comparisons are included in the repository's physics-validation artifact. [Comparison builder](../../validation/diagnostics/historical_flight_comparison.cjs)

The highest-value follow-up is the original MT-215 maneuver sheet or another instrumented run that continues through rollout and recovery. For altitude performance, seek installed DB 605 A power and radiator-drag measurements around 8–10 km and the omitted EN.524 propeller curves at 30,000 ft. Those records would distinguish competing explanations for errors already visible in the replay.
