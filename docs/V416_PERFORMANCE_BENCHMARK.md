# Fourteen-aircraft performance benchmark

Research candidate 4.16.0-rc.1 builds on simulator 4.15.0-rc.1 and the merged flight-test comparison. From **Compare flight performance**, select either aircraft, open **Compare flight tests by altitude** for the measured data, or download the same self-contained simulator. The original twelve operating profiles retain their numerical results.

## What changes in a comparison

At 10,000 ft, dry Combat power, 50% fuel, clean level cooling and high-altitude estimates off, seven aircraft have sufficient model inputs for a sustained-turn curve. Each selected aircraft retains its own curve. Both must have a supported common speed interval for the difference plot. Every pair at the reference condition displays two climb and two level-acceleration curves.

| Distinct pairs | Two turn curves | One curve | Neither curve |
| --- | ---: | ---: | ---: |
| Original 12, previously | 21 | 0 | 45 |
| Original 12, now | 21 | 35 | 10 |
| Full 14 | 21 | 49 | 21 |

The benchmark keeps the original measured altitude series, their missing values and their interpolation rules. In the 30,000-ft Boscombe Down comparison the HF IX leads the LF IX by 18.0 mph TAS. The modeled lead is 29.7 mph, an overstatement of 11.7 mph. The individual replays expose the aircraft, gear, loading and test condition. [A&AEE BS.543 and BS.551](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [88-row altitude comparison](../references/analysis/six-aircraft-flight-comparison.csv)

## New aircraft

| As-tested replay | E-3 WNr 1304 / AE479 | Spitfire Va X.4922 |
| --- | --- | --- |
| Test loading | 5,600 lb in the RAE summary, individual level-run masses unresolved | 6,450 lb, de Havilland, nominal +9 psi |
| Level-speed fits | 2,500 m open and 5,000 m closed | 10,000 ft |
| Remaining level-speed points | 10, mean absolute error **3.58 mph TAS** | 8, mean absolute error **8.20 mph TAS** |
| Climb point used to select the effective power correction | 9,850 ft, modeled **111 ft/min high** | 10,000 ft, modeled **94 ft/min high** |
| Remaining climb-rate points | 7, mean absolute error **252 ft/min** | 18, mean absolute error **170 ft/min** |
| Longest reported clock interval | 3,280–26,300 ft, **629 s modeled vs 739 s observed** | 0–37,000 ft, **1,179 s modeled vs 1,368 s observed** |

The DB 601 manual gives 990 PS near sea level and 1,020 PS at 4.5 km at 2,400 rpm and 1.30 ata. The French table gives the manifold reading for each pass. At 5,000 m it records 520 km/h open at 870 mm and 570 km/h closed at 880 mm. The level replay retains both conditions. CEMA's estimated speed uncertainty is 2–3%. The climb table gives rates and times and describes progressive radiator closure. Its speed schedule is missing. The E-3 uses 155 mph CAS as a planning assumption and a numerical lift ceiling for the E wing. The indicated British stall readings remain separate from that assumption. [CEMA table](https://www.wwiiaircraftperformance.org/me109/Me-109E3-French-3.jpg) · [RAE reproduction](https://www.wwiiaircraftperformance.org/me109/Me-109E3-French-2.jpg) · [DB 601 manual, printed p. 21](https://www.pumaszallas.hu/Private/VO101_Tom/docs/DB601_AuB_MM_1940_08.pdf) · [Independent WNr 1792 timed course, different installation](https://www.wwiiaircraftperformance.org/me109/me109e3-1792.jpg)

X.4922's measured level speeds cover 10,000–26,000 ft. NACA L-334 lists 1,200 bhp at 2,850 rpm and 15,500 ft and 1,210 bhp at 3,000 rpm and 19,250 ft for another Va, W.3119. Its rated power constrains an estimated curve for X.4922. NACA's clean-glide lift measurement on the Rotol aircraft is a provisional full-span donor for the de Havilland aircraft. The exact installed power, matched stall calibration and radiator drag remain open. IL-2's Merlin 45 **Vb** gives 480 km/h at sea level at +9 and 3,000 rpm. It is a simulator comparison for context below the Va's measured range and contributes zero fitted or reserved points. [A&AEE X.4922 report](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVa_X4922.html) · [NACA L-334](https://ntrs.nasa.gov/citations/19930092582) · [NACA L-353](https://ntrs.nasa.gov/citations/19930092581) · [1941 engine limits](https://wwiiaircraftperformance.com/org/spitcom/mk5/spitmkV_files/merlin-45-limitations.jpg) · [IL-2 technical data, Merlin 45 subsection](https://forum.il2sturmovik.com/applications/core/interface/file/attachment.php?id=39971)

For each new aircraft one climb point sets a bounded effective propulsive-power factor. At the recorded climb weight, the available power needed for the observed vertical speed equals modeled drag power plus weight times vertical speed. This implies factors of 0.878 and 0.881. The shared solver's lower bound is 0.90. The candidate uses that bound and reports the remaining fit-point errors. Level power stays on its own curve. Separate climb-rate points and clock intervals test the result within each original campaign. Both models still climb too quickly over the longest measured interval. Cooling drag and propeller efficiency cannot be identified separately from these observations. [Replay implementation](../validation/diagnostics/early_war_replay.cjs)

## G-6 factory climb and recorded maneuvers

For WNr 16476 the factory clock takes 390 s from 8 to 10 km. The operating replay takes 557 s. Substituting the measured manifold-pressure curve gives 404 s, but reaches 8 km 50 s early. Aligning the pressure plateau to the commanded setting gives 450 s for the upper interval. The factory run supplies both the pressure and the clock. The G-1 report is an independent installation comparison. The search did not establish independently measured installed torque at 2,600 rpm at 8–10 km or matched radiator drag at 4–6 km. All three remain selectable evidence in the same benchmark display. The original twelve operating inputs are preserved. [Factory report and original plates](https://wwiiaircraftperformance.com/org/me109/g/me109g-16476.html) · [G-1 factory comparison](https://www.wwiiaircraftperformance.org/me109/VB-109-19-L-42.pdf) · [Pressure digitization and sensitivity](research/BF109G6_HIGH_ALTITUDE_CLIMB_2026-11-22.md)

MT-215's 450 to 380 km/h in a 10 s half-turn survives in two secondary transcriptions of one trial. The original maneuver sheet was not recovered. Its two separate straight runs imply 16.6 s across the lost speed under uniform within-interval acceleration. The US comparison uses Ellis and Wheal's primary 1990 flight test on restored Mustang 45-11586. Their 10 s half-turn started at 220 knots, and the published table does not supply exit speed or subsequent recovery time. Separate acceleration results show about 195–200 KIAS at 60 s against 217.38 proxy KIAS. The printed 255 KIAS maximum and secondary 242 KIAS timing endpoint are different observations. The plots preserve those separate events. The 4 G command, trial-weight proxy, and IAS-to-CAS approximation are visible for each modeled turn. A continuous timed post-turn recovery remains the priority for both families. [Finnish transcription](https://forum.il2sturmovik.com/topic/6315-bf109g-2-turn-and-accelerationdeceleration-data/) · [Second account of the same test](https://www.virtualpilots.fi/feature/articles/109myths/) · [Ellis and Wheal](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) · [Printed Figure 8](https://ww2aircraft.net/forum/attachments/eta-6-jpg.469533/)

## Reference-aircraft regression

| Reference condition at 10,000 ft | Level TAS (mph), before → after | Best climb (ft/min), before → after | Time to altitude (s), before → after |
| --- | ---: | ---: | ---: |
| P-51B | 408.07 → 408.07 | 4,203.33 → 4,203.33 | 150.79 → 150.79 |
| P-47B | 371.07 → 371.07 | 2,797.59 → 2,797.59 | 207.24 → 207.24 |
| Bf 109 F-4 | 373.55 → 373.55 | 4,762.77 → 4,762.77 | 136.85 → 136.85 |
| Spitfire LF IX | 380.32 → 380.32 | 4,704.58 → 4,704.58 | 117.27 → 117.27 |

The regression verifies all six reference metrics across the original twelve profiles. The browser check exercises 182 ordered selections, including a unit change, an altitude with no supported results and a return to the reference altitude. The next independent checks are the E-3 climb schedule and per-run loading, the Va's low-altitude level speed and installed propeller performance, and recorded continuous turn-to-recovery data. [Numerical assertions](../tests/test_benchmark_history.cjs) · [Browser pair checks](../scripts/browser-fleet-matrix.cjs)
