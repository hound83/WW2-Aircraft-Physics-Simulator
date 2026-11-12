# Fighter Sim Inputs v1.6 fleet stall checkpoint

The review covers all 13 research variants. Six dossiers gained numerical evidence, including two aircraft-family handbook sources. One variant gained a new calibrated clean power-off comparison against a target of three. The pack is **1.6.0-rc.1** while two further comparisons remain open. [Versioned data](../../references/analysis/fighter-sim-inputs-v1.json) · [Original rows, corrections and archive gaps](../../references/research/ww2_fleet_stall_2026-11-12.json)

| Measure | v1.5 baseline | v1.6 checkpoint |
| --- | ---: | ---: |
| Research variants reviewed | 13 in roster | 13 reviewed for stall data |
| Variants with new numerical stall evidence in this milestone | 0 | 6 |
| Newly usable calibrated clean power-off variants | 0 | 1 |
| Research catalog observations | 1,873 | 1,910 |
| Research catalog source entries | 295 | 302 |
| Primary / with secondary / with calculations | 63.62% / 64.15% / 67.15% | 63.62% / 64.15% / 67.15% |
| GOLD / GOLD* agreements | 0 / 5 | 0 / 5 |

The 37 rows comprise 23 stall readings or corrected transcriptions and 14 calibration anchors. Some handbook values repeat values from other loads, editions or reports. The old evidence remains linked in `stall_reference.variants[].prior_ids`. Source conditions and original units appear in `stall_reference.observations`. The catalog carries each source locator and the three installation-specific curves.

## P-38G flight test

The 22 October 1942 Wright Field memorandum FS-M-19-1492-A identifies **P-38G-1-LO 42-12690**. All runs were around **14,800 lb gross weight and 10,000 ft**, with oil-cooler and intercooler flaps neutral. This is a sister-airframe comparison for the P-38G dossier associated with 42-12687. The report gives approximate trial weight and altitude, and leaves the exact break criterion, load factor and measurement uncertainty open. [FS-M-19-1492-A §§B.1–B.2](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G_42-12690_FS-M-19-1492-A.pdf)

| Flaps / gear | Power | RPM | Original IAS (mph) | Reported CAS (mph) | CAS from bracketing table anchors (mph) |
| --- | --- | ---: | ---: | ---: | ---: |
| Up / up | Off | 1,700 | 98 | **112** | 112.4 |
| Down / up | Off | 1,300 | 76 | 86 | 86.2 |
| Down / down | Off | 1,350 | 78 | 88 | 87.4 |
| Up / up | 25 inHg | 2,000 | 92 | 107 | Below table range |
| Down / down | 25 inHg | 2,000 | 62 | 75 | Below table range |

The indicated, water-column and calibrated columns give the instrument and installation effects for the left-wing Kollsman D-2. For the clean stall the IAS-to-CAS difference is **14 mph**. Interpolation of the bracketing same-installation rows agrees within 0.4 mph with the report. That residual measures internal agreement. The two powered CAS values come directly from the stall table. The report prints zero in the manifold-pressure column for each power-off case. [FS-M-19-1492-A calibration and station description](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G_42-12690_FS-M-19-1492-A.pdf#page=1)

## Variant findings

| Variant | Evidence added and remaining work |
| --- | --- |
| F4U-4, 80765 dossier | The original normal-fighter table reads **84.6 kt CAS** clean power-on, replacing 84.5, and identifies **77.7 kt CAS** as landing power-off. The 89.4 kt CAS clean power-off figure was already in v1.5. The project lists three serials and the stall table gives no run serial. [NATC FT-C-140, printed pp. 3–5](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf#page=5) |
| P-51B-15, 43-24777 | The nine 67.5–86 mph IAS stalls have instantaneous weights. Figure 1's measured gear-up calibration begins near 150 mph. The matching low-speed correction remains open. [Eng-47-1749-A §V.E and Figure 1](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) |
| F6F-3, 04776 | Three active-control runs add first-departure reads of **93–97 mph** clean idle, **63–69 mph** powered climb at 43 inHg and 2,550 rpm, and **76–80 mph** landing idle. These are visual reading and event windows in the figures' indicated channel. The companion documents calibration of the head. Part III uses fuel-adjusted weight in its coefficient calculations and publishes only approximate takeoff weight of 11,200 lb. Run loading and confirmation of the speed reduction remain open. [L-717 Figs. 5, 7 and 9](https://ntrs.nasa.gov/citations/19930092602) · [L-715 instrumentation](https://ntrs.nasa.gov/citations/19930092600) |
| Spitfire LF IX, BS.543 dossier | The second-edition Mk IX handbook covers the Merlin 66 LF IX and gives **86 mph IAS** clean and **76 mph IAS** landing, engine off, at **7,445 lb normal all-up weight**. These are family values. Wingtip details, identified test airframe and low-speed calibration remain open. [A.P. 1565J—P.N. Part II §40](https://www.docdroid.com/file/download/HRosRhd/supermarine-spitfire-fix-pilots-notes-pdf.pdf) |
| P-47B, 41-5902 dossier | The April 1942 handbook adds approximate **98 mph** powered clean, **85 mph** powered landing and **95 mph** power-off landing. Its 105 mph clean off repeats the separate flight-test figure. The handbook uses normal load and omits numerical test loading and speed basis. The 41-5902 report's clean correction begins at 170 mph IAS. [T.O. 01-65BC-1 §IV.1(e)](https://www.si.edu/media/NASM/NASM-Manual-000027958.pdf#page=18) · [PHQ-M-19-1417-A p. 4](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf#page=4) |
| P-38G, 42-12687 dossier | Five paired stalls and 14 calibration anchors on 42-12690. The early D–G handbook additionally gives IAS by weight at 15,000, 17,000 and 19,000 lb. Its numbers repeat in later H/J/L notes and the early table's power state is unspecified. The memorandum calibration applies to the documented 42-12690 installation. [Wright Field memorandum](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G_42-12690_FS-M-19-1492-A.pdf) · [T.O. 01-75F-1 §II.15](https://drive.google.com/file/d/0Bw4FNWq6qRgqek5WMngzdG13UDA/view) |
| Fw 190 D-9, WNr 210002 | The Eltron correction is available from 360 to 550 km/h. A clean stall, low-speed correction and run mass remain open. FE-120/WNr 601088 would be a separate test. [German source register](WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md) |
| Fw 190 A-4, WNr 783 | Available WNr 783 tests concern speed, climb, intake and cooling. Seek a named A-4 low-speed report. The cited Soviet WNr 2310 number describes landing speed. [German source register](WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md) |
| P-40F, 41-13635 | Family manual values of 92 and 82 mph IAS were already in the catalog. The 8,500 lb normal gross-weight reference in the manual is an operating limit context. Stall-run weight, power and correction remain open. [T.O. 01-25CH-1, stalling and landing paragraphs](https://www.p40warhawk.com/Models/Technical/MikeHalbrook/33143169-Pilot-s-Flight-Operating-Instructions-for-Army-Model-P-40F-and-P-40L.pdf) |
| Ki-84-I, T-2 302 | The catalog already carries 102/90/79 mph IAS. The original identifies **7,900 lb as takeoff weight**. Run weight and airspeed calibration remain open. [T-2 Interim Report No. 3 pp. 5 and 9](https://www.wwiiaircraftperformance.org/japan/p5016.pdf) |
| P-47D-30, 43-3441 | Added an accelerated power-off landing stall in Figure 59 at **170–176 mph service indicated**, around **2.8–3.1 g**, 12,680 lb and 5,000 ft. The earlier clean Fig. 49–51a trace windows remain available. TN 2899 reprints the traces and retains the same speed label. TN 2675 supplies the calibration method. The reduction applied to the stall channel remains open. [L8A06 Fig. 59](https://ntrs.nasa.gov/api/citations/20090022749/downloads/20090022749.pdf#page=82) · [TN 2675](https://ntrs.nasa.gov/citations/19930083825) · [Existing clean windows](STALL_TEST_REPLAY.md#p-47d-30-43-3441) |
| Bf 109 F-4 | The flown 2,560 kg and calculated 2,570 kg sheets both give 135 km/h as landing speed. A separate clean stall event and low-speed correction remain open. [German source register](WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md) |
| Bf 109 G-2 | NII VVS Table 2 gives 180/170/165 km/h indicated and 186/176/171 in its Vᵢ column for gun-pod WNr 14513. The source method descends to loss of control. The correction definition, gear, engine state and run loading for the glide remain open. [NII VVS pp. 43–44](https://www.wwiiaircraftperformance.com/org/me109/g/g_files/Me-109_G2_14513_Russian.pdf#page=43) |

The next two clean cases need either the P-47D-30 stall channel reduction, the F6F-3 recorder reduction and per-run loading, or the 43-24777 near-stall position error. The P-38G comparison uses the original reported CAS and approximate campaign gross weight. Use it at the documented source condition. A fit or a cross-specimen calibration requires additional evidence.
