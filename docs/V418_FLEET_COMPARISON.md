# M3 fleet comparison · 4.18.0-rc.1

The selected aircraft share one climb-height band and one operating acceleration interval. The screen also shows clean stall at each selected load and achieved roll at the recorded speeds. All 14 profiles use the same controls. Flight-test replays retain the settings in their own reports.

## Climb gaps at the trial settings

| Leading aircraft and height band | Measured lead | Replayed lead | Understatement |
| --- | ---: | ---: | ---: |
| Bf 109 G-2 over G-6/Trop, 5–8 km | 90.0 s | 31.7 s | 58.3 s |
| Spitfire Va over Bf 109 E-3, 3,280–19,750 ft | 63.6 s | 26.2 s | 37.4 s |

The Finnish speed schedule indexing sensitivity changes the G-2 result by 0.29 s. Reintegrating both trials from their recorded rates gives an 80 s lead. The E-3 speed-schedule sensitivity spans 352–382 s against a 405 s clock. These checks support showing the discrepancy and seeking configuration evidence before changing shared power or cooling. A five-percent practical tie margin and source reading bounds answer different questions. Unknown test uncertainty stays visible. [Sensitivity runs and flight reports](research/FLEET_CLIMB_SPITFIRE_STALL_MT215_2026-11-27.md)

## Before and after across the fleet

The 4.17.0-rc.1 baseline and 4.18.0-rc.1 produce the same values in all 42 operating cases below. Each value applies to both revisions. The comparison uses half fuel, Combat, dry and clean cooling. Climb is sea level to 10,000 ft. Stall and level acceleration (180–250 mph EAS) use 10,000 ft. The last column gives the mean absolute elapsed-time error across comparable flight-test rows at their own conditions. Multiple heights on the same flight are correlated.

| Aircraft | Climb (s) | Clean stall (mph EAS) | Acceleration (s) | Clock MAE (s), rows |
| --- | ---: | ---: | ---: | ---: |
| Spitfire LF Mk IXc | 117.3 | 85.2 | 19.0 | 0.4 (1) |
| Bf 109 F-4 | 136.9 | 95.6 | 20.6 | 20.1 (3) |
| P-47B Thunderbolt | 207.2 | 108.4 | 28.7 | 2.7 (2) |
| P-51B-15 Mustang | 150.8 | 96.8 | 21.5 | 0.7 (2) |
| Fw 190 A-4 | 154.4 | 107.3 | 28.7 | 16.3 (3) |
| P-38G-1 Lightning | 172.4 | 110.6 | 29.3 | 3.6 (7) |
| F4U-4 Corsair | 159.6 | 100.4 | 31.3 | 21.3 (2) |
| Spitfire HF Mk IXc | 127.1 | 85.1 | 18.6 | 3.0 (3) |
| Bf 109 G-2 | 149.3 | 98.3 | 25.3 | 26.2 (5) |
| P-51D-15 Mustang | 154.8 | 101.5 | 22.2 | 15.4 (3) |
| Spitfire F Mk IXc | 146.1 | 85.1 | 22.4 | 21.5 (8) |
| Bf 109 G-6/Trop | 169.0 | 101.8 | 32.4 | 24.7 (10) |
| Bf 109 E-3 | 178.2 | 93.7 | 28.1 | 41.1 (7) |
| Spitfire Va | 190.1 | 91.7 | 30.0 | 28.8 (19) |

The operating-model rankings are identical in both builds. A trial ordering can still disagree with that model. The Va leads the F4U-4 by 18 s in the sea-level to 10,000 ft records, while the Corsair leads by 2 s in the replays. The Corsair figure is a specification. The 75 clock checks span 16 configurations and 14 aircraft.

## What the sources support

- **Clean stall.** Correctable P-38 sister-aircraft and F4U-4 transfer checks show the model at the reference weight. Raw indicated speeds, estimated wingtip corrections, and readings with unknown event weights retain those qualifications. The June 1943 Mk IX handbook and September 1946 wingtip note apply across the three IX profiles with their respective conditions. [Stall and wing evidence](research/FLEET_CLIMB_SPITFIRE_STALL_MT215_2026-11-27.md)
- **Level acceleration.** The restored Mustang took about 31.5 and 40.0 s through 160–200 and 200–230 KIAS. The wartime proxy gives 24.4 and 29.8 s. The two comparisons share one flight. The chart readings have a ±2 kt reading allowance. MT-215 has four transcribed straight intervals. The two maximum-power intervals have conditional replays spanning several possible altitudes and speed conventions. [Ellis Figure 8](https://www.wwiiaircraftperformance.com/com/others/endingtheargument_files/figure8.jpg) · [Finnish source and scenarios](research/FLEET_CLIMB_SPITFIRE_STALL_MT215_2026-11-27.md)
- **Roll.** At the reported 400 mph and 10,000 ft density altitude, the USAAF gives 81°/s for the P-47B and 71°/s for the P-51B. Each tested configuration contributes a point. The P-38J and Va W.3119 are clearly marked transfers when viewing the G and X.4922. [Period comparison, paragraph 2 and Table I](https://www.wwiiaircraftperformance.org/mustang/Performance_Data_on_Fighter_Aircraft.pdf)

## Four reference aircraft and independent evidence

These errors use only scored rows outside explicit fit-consistency groups in the current fleet report. They include same-report checks and qualified sources. Both the 4.17 and 4.18 absolute errors are shown by the single value in each cell. Different altitudes in a calibration trial share the same flight and installation.

| Reference aircraft | Level-speed MAE (mph TAS) | Climb-rate MAE (ft/min) |
| --- | ---: | ---: |
| P-51B-15 Mustang | Unscored | 188.7 (3 rows) |
| Bf 109 F-4 | 3.6 (1 row) | Unscored |
| P-47B Thunderbolt | 1.7 (8 rows) | 55.1 (10 rows) |
| Spitfire LF Mk IXc | Unscored | 64.5 (10 rows) |

The separate HF IX EN.524 level-speed test retains its 4.33 mph TAS mean absolute error across 13 comparable rows. None of its points tuned this release. The other research comparisons and the two Mustang speed bands add no independent test flights. [Holdout record](V417_EVIDENCE_AND_PERFORMANCE.md)

Build with `npm run check`. The two reference pairs are in `dist/fleet-validation.json` under `climbIntervals.focus`. The corrected matched-speed times are under `restoredAcceleration`. The browser regression checks both against the selected-pair screen.
