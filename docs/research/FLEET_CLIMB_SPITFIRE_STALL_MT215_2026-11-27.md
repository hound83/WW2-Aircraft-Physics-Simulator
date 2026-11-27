# Fleet climb, Spitfire IX stall and Finnish G-2 acceleration

27 November 2026 · Compared with the 4.17 fleet report at `25c9505`.

The two Bf 109s have a 90-second measured climb gap from 5 to 8 km. The simulator reproduces 32 seconds. Reading the vertical-rate curves on the same sheets yields an 80-second gap, so the discrepancy survives a second way of reading the source. The best new stall constraint spans three Spitfires. The best new acceleration finding is how much a single missing field, the Finnish airspeed convention, matters near the upper endpoint.

## Climb at each aircraft’s test settings

All 75 existing clock comparisons across 14 profiles now have explicit start and end heights. Consecutive readings are subtracted only within one trial, rating, weight and clock origin. For example, the P-47B's combat 0–10,000 ft and normal 20,000–30,000 ft records stay separate. The LF IX's single 2,000–20,000 ft clock stays intact. The browser also compares 92 intervals bounded by heights present on both source series. They reuse observations from 16 trial/rating series. A pair describes these two tested configurations. [All 75 intervals, conditions, sources and reading allowances](../../references/analysis/fleet-climb-bands-2026-11-27.csv)

| Pair and interval | Source times | Model times | What to investigate |
| --- | --- | --- | --- |
| Bf 109 G-2 / G-6/Trop, 5–8 km | 210 / 300 s | 237.6 / 269.3 s | The G-2 is 27.6 s slow and the G-6 is 30.7 s fast. Complementary errors remove 58.3 s from the gap. |
| Spitfire Va / Bf 109 E-3, 3,280–19,750 ft | 341.4 / 405.0 s | 337.6 / 363.9 s | The E-3 accounts for 41.1 s of early arrival. The Va contributes 3.7 s early. Only the Va clock was interpolated, between readings bracketing each endpoint. |
| Spitfire Va / F4U-4, sea level–10,000 ft | 216 / 234 s | 214.2 / 212.2 s | The Va leads by 18 s in the records and the Corsair by 2.0 s in the model. The Corsair figure is a Vought specification with unspecified test derivation. Seek the actual flight clock and speed schedule. |

**G-2 and G-6.** Integrating the reciprocal of each chart’s vertical rates at the kilometre marks gives 216.7 s for the G-2 and 296.9 s for the G-6. Each rate and clock comes from the same campaign. Through 8 km the G-6 clock is read to about ±12 s per endpoint (at most ±24 s for the difference). Indexing the G-2’s plotted TAS by corrected altitude gives 237.55 s. Indexing the identical TAS values by the Finnish altimeter column gives 237.26 s. This particular alignment choice changes the answer by 0.29 s. A matched installed-power record, cooling drag and the G-2’s actual loading are higher-value leads. The initial G-6 0–10 km error was +128 s. The previous adoption of its own pressure trace put it at −36 s overall, including +14 s from 8 to 10 km and −50 s on arrival at 8 km. [Finnish sheets, printed pp. 15–16](https://wwiiaircraftperformance.com/org/me109/g/g_files/me-109g2-finn.pdf) · [G-6 factory plate, Blatt 7](https://www.wwiiaircraftperformance.org/me109/VB-109-10-L-43.pdf#page=7) · [Earlier pressure comparison](BF109G6_HIGH_ALTITUDE_CLIMB_2026-11-22.md)

**E-3 and Va.** Holding the E-3 power, modeled radiator schedule and 5,600 lb comparison weight fixed, assumed climb speeds of 145, 155 and 165 mph CAS give 352.0, 363.9 and 382.1 s. The source clock is 405 s. The tested speed variation matters, yet even the slowest of these modeled times arrives 22.9 s early. Retrieve CEMA’s climb speed and radiator positions before changing the E-3. The Va’s separate high-altitude problem peaks in the last measured 1,000 ft, where it gains 68 s versus the chart. The A&AEE reference to K.9788 gives a second airframe to pursue. [RAE reproduction of the French E-3 climb](https://www.wwiiaircraftperformance.org/me109/Me-109E3-French-2.jpg) · [A&AEE X.4922 climb, Table I](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVa_X4922.html)

Four of the 92 exact-endpoint comparisons change order. Besides the Corsair/Va case, the source leads are 1.8 s (P-38G versus F IX combat, 10,000–20,000 ft), 6 s (F IX normal versus Va, 10,000–20,000 ft) and 3 s (P-51B versus F IX combat, 0–10,000 ft). The F IX normal/Va modeled gap is just 0.03 s. Those margins warrant attention to source rounding and differing test conditions before any adjustment.

## Coverage by operating aircraft

Each row shows the interval with the largest absolute time error for that profile. A negative signed error means the simulator arrived early. Stall and acceleration describe the type of linked evidence. The 14 sets of operational predictions and all existing scored speed, rate and climb-time comparisons reproduce the pre-sweep values.

| Aircraft | Clock bands | Largest-error band (ft) | Source / model (s) | Error (s) | Clean stall | Level acceleration |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Bf 109 E-3 | 7 | 23,000–26,300 | 213.0 / 154.0 | -59.0 | IAS only | Open |
| Bf 109 F-4 | 3 | 13,123–19,685 | 132.0 / 110.3 | -21.7 | Weight transfer | Open |
| Bf 109 G-2 | 5 | 16,404–19,685 | 54.0 / 69.6 | +15.6 | IAS / related aircraft | Four secondary intervals |
| Bf 109 G-6/Trop | 10 | 16,404–19,685 | 90.0 / 72.0 | -18.0 | Open | Open |
| F4U-4 Corsair | 2 | 0–10,000 | 234.0 / 212.2 | -21.8 | Scored NACA transfer | Open |
| Fw 190 A-4 | 3 | 19,685–26,247 | 246.0 / 293.4 | +47.4 | Weight transfer | Open |
| P-38G-1 Lightning | 7 | 30,000–35,000 | 181.2 / 192.2 | +11.0 | Scored sister aircraft | Open |
| P-47B Thunderbolt | 2 | 20,000–30,000 | 441.0 / 437.0 | -4.0 | IAS only | Open |
| P-51B-15 Mustang | 2 | 10,000–20,000 | 189.0 / 187.6 | -1.4 | IAS only | Open |
| P-51D-15 Mustang | 3 | 20,000–30,000 | 258.0 / 298.2 | +40.2 | Handbook IAS | Restored-aircraft proxy |
| Spitfire F Mk IXc | 8 | 30,000–40,000 | 444.0 / 405.1 | -39.0 | IX handbook IAS and full-span estimate | Open |
| Spitfire HF Mk IXc | 3 | 10,000–20,000 | 153.0 / 149.0 | -4.0 | IX handbook IAS and full-span estimate | Open |
| Spitfire LF Mk IXc | 1 | 2,000–20,000 | 258.0 / 258.4 | +0.4 | IX handbook IAS and full-span estimate | Derived from climb |
| Spitfire Va | 19 | 36,000–37,000 | 156.0 / 87.8 | -68.2 | Sister-aircraft lift | Open |

The browser evidence register now links clean-stall records on **13 of 14** profiles, up from 11. The fleet report’s narrower count rises from 9 to 11 because the E-3 and Va links live in the additional browser research register. The count with numerical corrected-stall comparisons stays at two, both transfers. Timed level acceleration still has one scored proxy. The Finnish comparisons below have explicit assumptions and sit outside that score.

## Spitfire IX stall at known loading

| Evidence | Gear and flaps up | Loading and interpretation |
| --- | --- | --- |
| June 1943 Air Ministry handbook, second edition, §40, printed p. 17 (PDF p. 11) | **86 mph IAS**, engine off | Normal all-up **7,445 lb**. Gear and flaps down gives **76 mph IAS**. The edition covers Merlin 61, 63, 66 and 70. Paragraph 40 leaves the wing tips, specimen and individual run mass unspecified. One family reference is linked to F, LF and HF IX. [Scan](https://www.docdroid.com/file/download/HRosRhd/supermarine-spitfire-fix-pilots-notes-pdf.pdf#page=11) |
| September 1946 Air Ministry handbook, §42(i), printed p. 24 (PDF p. 16) | **84–87 mph IAS**, approximate standard wing | **7,150 lb** with full main tanks, no ammunition and no external stores. The table gives **90 mph** clipped and says standard wings reduce the stall about **3–6 mph**. The 7,800 lb row gives **93 mph** clipped and therefore about **87–90 mph** standard, with ammunition and a 45-gallon blister tank. Both ranges come from the handbook’s adjustment. [Scan](https://zenoswarbirdvideos.com/Images/spit/SPIT9MANUAL.pdf#page=16) |
| UK Defence Safety Authority, MK356 particulars, §1.3.A.6 and Table 1.3.A.1 | **65 ±3 kt** | Secondary performance evidence in an official inquiry. This restored IX had a full-span E wing and conventional spine. The table also gives **56 ±3 kt** gear/flaps down and **6,816 lb** all-up. Its source does not identify the stall-run mass, power or calibration. The modeled wartime aircraft have C wings. [Inquiry, Annex A to Part 1.3](https://assets.publishing.service.gov.uk/media/6abb7d80fceb6fb3a6501316/Service_Inquiry_into_the_death_of_a_service_person_in_an_air_accident_near_RAF_Coningsby_on_25_May_2024.pdf) |

Both handbook correction tables start at **120 mph IAS**, above these stalls. BF.274’s performance report covers position corrections from **130 to 320 mph**. The BS.543/BS.551 report expressly adopted the same head installation. That transfer only covers the documented speeds. The full-span estimate is available for comparisons at its stated loading. To establish a wartime corrected stall and derive a lift coefficient, seek a full-span C-wing stall sheet with indicated and calibrated speed through stall, serial, run weight, configuration, altitude and power. For MK356 the open primary lead is the underlying BBMF aircrew or test record. [BF.274 report](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitFmkIX_BF274.html) · [BS.543 and BS.551 report](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [Machine-readable sources and outstanding searches](../../references/spitfire-ix-stall-audit.json)

## Finnish Bf 109 G-2 MT-215 straight runs

The Finnish test transcription labels four horizontal intervals. The following averages are changes in the reported speed channel. The transcription’s 1,000 m statement applies to the turn table. The horizontal section does not specify altitude or IAS/TAS. These four rows have one timing source. [LLv34_Flanker’s transcription, 8 May 2014](https://forum.il2sturmovik.com/topic/6315-bf109g-2-turn-and-accelerationdeceleration-data/)

| Reported run | Speed interval | Reported time | Mean speed change |
| --- | --- | ---: | ---: |
| Maximum power | 300 → 440 km/h | 27 s | +1.44 m/s² |
| Maximum power | 440 → 510 km/h | 35 s | +0.56 m/s² |
| Idle | 510 → 440 km/h | 9 s | −2.16 m/s² |
| Idle | 440 → 300 km/h | 33 s | −1.18 m/s² |

**Scenario results.** Each case uses constant 3,050 kg and the 1.30 ata curve scaled to 2,540 rpm. Mass is nominal. The RPM and boost are drawn from separate MT-215 performance data. All altitudes, speed interpretations and radiator positions below are assumptions. “Power limited” means the model reaches zero excess power before the endpoint.

| Assumed pressure altitude | Interpreted speed | Modeled radiator state | 300 → 440 km/h | 440 → 510 km/h |
| ---: | --- | --- | ---: | ---: |
| Sea level | CAS | Clean setting | 27.1 s | 55.1 s |
| 1,000 m | CAS | Clean setting | 31.4 s | 134.9 s |
| 2,000 m | CAS | Clean setting | 36.7 s | Power limited |
| 1,000 m | TAS | Clean setting | 26.0 s | 38.3 s |
| 1,000 m | CAS | Open | 42.9 s | Power limited |

At 1,000 m the modeled second interval changes by **96.6 s** when the same numbers are interpreted as CAS or TAS. A close match under the TAS assumption cannot identify how Kokko measured speed. The idle entries preserve otherwise useful secondary data and provide a future check of a propeller/engine model at closed throttle.

**Primary search still open.** Look for Captain Pekka Kokko’s MT-215 (WNr 14783) horizontal acceleration/deceleration sheet from the Malmi / Lentolaivue 34 trials in spring 1943. The transcription describes March. The Finnish Virtual Pilots Association refers to a report dated 6 May. It corroborates the aircraft and pilot, and supplies departure-loading context. It does not independently give these four times. The Finnish speed/climb sheets dated 5 April on the speed page survive, but the two accessible pages are marked 16 (climb) and 15 (level speed and climb speed). Request the page containing start/end speeds, height, speed basis, engine settings, mass and radiator position from the Finnish Aviation Museum archive. [Finnish Virtual Pilots Association](https://www.virtualpilots.fi/feature/articles/109myths/) · [Source register and archive leads](../../references/analysis/powered-turn-evidence-2026-11-13.json) · [Finnish Aviation Museum archive](https://ilmailumuseo.fi/en/kirjasto-arkisto/)

## Reproduce

Run `npm run build` and open `dist/model.html`. The fleet evidence register contains the common-height comparisons, absolute and signed interval results, and MT-215 scenarios. Export the 75 rows with `node validation/diagnostics/fleet_climb_intervals.cjs dist/fleet-validation.json`. The full JSON preserves each source series, the two focus comparisons, the sensitivity trials and each conditional acceleration result. [Interval calculation](../../validation/diagnostics/fleet_climb_intervals.cjs) · [Climb sensitivity](../../validation/diagnostics/fleet_climb_sensitivity.cjs)
