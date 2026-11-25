# Milestone 3 · First flight-test results

25 November 2026 · [Combined milestone and acceptance criteria](../SIMULATOR_ROADMAP.md) · [4.17 starting revision](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/17461d9ac7a6eee7452a83af5c3ff82845764536)

## Timed level acceleration

Ellis and Wheal's printed Figure 8 plots **elapsed seconds horizontally and indicated knots vertically**. On the restored P-51D, downward triangles give about **213 KIAS at 60 s**. The round P-47D marker at that time is about 198 KIAS. The earlier 195–200 KIAS reading in the 4.16 report misidentified the Mustang point. The final visible Mustang marker is about **238 KIAS at 130 s**. Figure 8 does not label a 255 KIAS maximum. The separately transcribed 110–242 KIAS in 133 s remains a lower-confidence account. [Printed magazine page 52](https://ww2aircraft.net/forum/attachments/eta-6-jpg.469533/) · [Second copy of Figure 8](https://www.wwiiaircraftperformance.com/com/others/endingtheargument_files/figure8.jpg) · [Authors' test conditions](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) · [Secondary endpoint](https://ww2aircraft.net/forum/threads/captured-aircraft-equipment-report-14.65811/?post=2043798)

| Restored P-51D observation | Figure 8, approximately | Existing wartime-profile proxy | Difference |
| --- | ---: | ---: | ---: |
| Speed at 60 s | 213 KIAS | 217.4 KIAS | +4 kt |
| Time from 160 to 200 KIAS | 31.5 s | 24.4 s | 7 s early |
| Time from 200 to 230 KIAS | 40 s | 29.8 s | 10 s early |

The matched-speed intervals remove the differing initial speeds from the comparison. The high-speed interval is usable as a same-flight check of any future fit to the lower-speed interval. The test used maximum except takeoff (METO) power at 10,000 ft MSL and 50°F. The restored aircraft had a V-1650-9 engine and weighed 8,900 lb at takeoff. The proxy uses a V-1650-7, assumes 8,900 lb during the run, 1,140 shaft hp and IAS equal to CAS. Run weight, installed power, cooling and airspeed correction limit how far this result transfers. Seek a separate wartime trial or the Finnish MT-215 original sheet, indexed under conflicting dates in the two secondary accounts. [Replay inputs and time history](../../validation/current/level-acceleration.json) · [Finnish source leads](../../references/analysis/powered-turn-evidence-2026-11-13.json)

**Reproducing the readings.** The two images show the same printed figure and count as one source. Read marker centers against the labeled 20 s and 20 kt ticks. The extraction allowance of ±2 kt describes reading the image. Instrument error is separate. At the upper interval's finish 2 kt is roughly 4–5 seconds on the curve. Interpolate time at each target speed between adjacent readings, then subtract, using the same operation on the nominal model trace. The displayed 31.5 s interpolates rounded readings and is best read as about 32 s. The model's 160, 200 and 230 KIAS crossings are 20.40, 44.78 and 74.55 s. The live 4.17 benchmark still contains the prior figure interpretation. Replacing those labels and records belongs to M3. [All 16 chart readings](../../references/analysis/m3-figure8-readings.csv) · [4.17 benchmark source](../../references/analysis/combined-flight-comparison-sources.json)

## Clean stall

| Primary record | What the measurement establishes | Remaining use or gap |
| --- | --- | --- |
| Wright Field, P-51B-5 **43-6883**, Eng-47-1734-A, stalling-speed table | Clean, power off, gear and flaps up. **94 mph IAS** at approximately **9,100 lb** with shutters closed and **94 mph** at **9,095 lb** with shutters open. The table removes instrument error. | Two observations on one airframe make a useful check at the trial weights. Seek Figs. 1–2 and check whether the position correction covers 94 mph. The roster B-15 is another serial. [Wright Field report and table](https://www.wwiiaircraftperformance.com/org/p-51/p-51b-6883.html) |
| NACA, **XP-51 41-38**, printed pp. 6–7 and 31–32 | The calibration used formation flight against an aircraft referenced to a trailing static head. NACA reports a maximum lift coefficient of **1.5** in clean-wing gliding flight and **1.6** in clean-wing cruising flight. The glide used gear and flaps up, closed throttle and closed scoop, with deflector down. | A corrected wartime Mustang-family lift check. It belongs to the Allison prototype. Use the gliding value as a cross-check and retain the exact B-series or LF IX low-speed correction as the priority for a two-aircraft comparison. [NACA L-566, printed p. 32](https://ntrs.nasa.gov/api/citations/19930092575/downloads/19930092575.pdf#page=34) · [NASA catalog](https://ntrs.nasa.gov/citations/19930092575) |

## Climb time on the 4.17 replay

| Flight-test interval | Observed | Model | What it explains |
| --- | ---: | ---: | --- |
| Bf 109 E-3 WNr 1304, 23,000–26,300 ft | 213 s | 154 s | 59 s early, 54% of its 110 s total error |
| Spitfire Va X.4922, 33,000–37,000 ft | 432 s | 307 s | 125 s early, 66% of its 189 s total error |
| Va, 36,000–37,000 ft alone | 156 s | 88 s | The last 1,000 ft contributes 68 s of the total |
| E-3, shared 3,280–19,750 ft interval | 405 s | 364 s | 41 s early |
| Va, same 3,280–19,750 ft interval | 341 s | 338 s | 4 s early, interpolating the Va clock at both boundaries |

**The Va climbs the shared interval about 64 seconds quicker in the trial records. The simulator gives it only 26 seconds.** The ordering survives, but the model understates the measured gap by about 37 seconds using unrounded times. The E-3 already climbs too quickly well below the top of its trial. For the Va, a blanket climb-power reduction would also affect the climb to 20,000 ft, where it is already within about 8 s. The two trials used their own aircraft, ratings and loading. The RAE summary gives 5,600 lb for the E-3 and A&AEE gives 6,450 lb for the Va. [French E-3 table](https://www.wwiiaircraftperformance.org/me109/Me-109E3-French-3.jpg) · [RAE summary](https://www.wwiiaircraftperformance.org/me109/Me-109E3-French-2.jpg) · [A&AEE X.4922 report and Table I](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVa_X4922.html)

The Va report already supplies three operating conditions inside the worst band. At 33,000, 36,000 and 37,000 ft, X.4922 held 3,000 rpm. Boost fell from −1.8 to −3.4 to −3.8 lb/in², and indicated speed from 122 to 116 to 110 mph. Use those settings when checking installed power and propeller performance. The same report identifies **A&AEE/692,i, part 1, Spitfire V K.9788** as the earlier trial to seek for a second airframe. [X.4922 introduction and climbing trials](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVa_X4922.html)

The 26 consecutive intervals come from subtracting successive cumulative clocks in the 4.17 build's benchmark data, under `intakeChecks.aircraft[].elapsed` for these two profiles. Negative residuals mean the model arrived early. For the shared interval alone, interpolate the Va's cumulative times linearly at the E-3's recorded heights. Search first for CEMA's climb-speed schedule and radiator positions and for X.4922 high-altitude installed power or propeller data. These timings locate the discrepancy, but power, propeller efficiency and cooling drag can produce similar effects. [All climb intervals](../../references/analysis/m3-climb-intervals.csv) · [4.17 replay implementation](../../validation/diagnostics/early_war_replay.cjs)
