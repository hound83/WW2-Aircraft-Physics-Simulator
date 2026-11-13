# v4.14.0-rc.3 powered-turn flight-test replay

The Finnish Bf 109 G-2 MT-215 account gives **22 s** for a continuous 360° turn at **1,000 m**, with **360 km/h IAS** at entry and exit and maximum power. The simulator gives **24.0 s** with clean cooling and **26.2 s** with its open-cooling estimate. The clean-cooling model gives **2.97 G**, close to the source’s rounded **3 G**. At the assumed true airspeed, the time implies **3.21 G** and the stated **70° bank** implies **2.92 G**. The benchmark displays those three quantities together. [Turn table](https://forum.il2sturmovik.com/topic/6315-bf109g-2-turn-and-accelerationdeceleration-data/) · [Finnish Virtual Pilots Association](https://www.virtualpilots.fi/feature/articles/109myths/) · [Numerical replay](../validation/current/powered-turn.json) · [Live benchmark](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#bench-powered-turn)

## What the record supports

The two transcriptions describe the same wartime trial and attribute it to Pekka Kokko. The Virtual Pilots account dates the trial to 6 May 1943. The forum introduction gives March 1943. The original maneuver sheet, instrument error and exact date are open. The source labels the maneuver horizontal, but only entry and exit speeds are available. The 10 s 180° and 18 s 360° entries lose 70 and 120 km/h respectively and describe separate maneuvers. The 22 s time was held outside the model. There are no verified repeat turns or additional steady speeds from this table. [Turn table and pilot notes](https://forum.il2sturmovik.com/topic/6315-bf109g-2-turn-and-accelerationdeceleration-data/) · [Machine-readable source record](../references/analysis/powered-turn-evidence-2026-11-13.json)

The replay uses the existing MT-215 drag, propeller, lift and DB 605 A power model. It assumes 3,050 kg, clean flaps, fixed tailwheel, ISA pressure altitude of 1,000 m, and zero CAS minus IAS offset. The 1.30 ata and 2,540 RPM inputs are taken from the existing G-2 operating case and the separate same-specimen performance account. Shaft power, radiator opening and exact run mass remain open for the turn. The open-cooling run applies the existing 0.12 m² equivalent drag area. [MT-215 intake and conditions](V413_AIRCRAFT_INTAKE.md)

| Case | TAS (km/h) | Load factor | Turn rate (°/s) | 360° time (s) | Time difference |
| --- | ---: | ---: | ---: | ---: | ---: |
| Transcribed flight test | Unresolved | About 3.0 G | 16.36 from timing | 22.0 | — |
| Calculated from 70° bank at nominal TAS | 377.4 | 2.92 G | 14.73 | 24.45 | +2.45 s |
| Shared model, clean cooling | 377.4 | 2.97 G | 15.00 | 24.00 | +2.00 s (+9.1%) |
| Shared model, open cooling | 377.4 | 2.76 G | 13.77 | 26.15 | +4.15 s (+18.9%) |
| Shared model, alternative 360 km/h TAS interpretation | 360.0 | 2.99 G | 15.82 | 22.75 | +0.75 s (+3.4%) |

At the nominal speed the clean model’s rate is **−1.36°/s** and its load is **−0.24 G** relative to the load inferred from the stopwatch. The residual is **−0.03 G** relative to the rounded 3 G. For 70° and 22 s to describe the same steady coordinated turn, TAS would have to be **339.6 km/h**, equivalent to **323.9 km/h CAS** at assumed pressure altitude. That calculation locates the discrepancy. The source does not determine whether speed, bank, altitude or timing varied through the turn.

The 12 illustrative scenarios combine 2,900 and 3,235 kg, CAS minus IAS offsets of −10, 0 and +10 km/h, and the two modeled cooling states. They span **22.0–29.4 s** rounded to a tenth. The fastest case is 21.95 s at 2,900 kg, −10 km/h and clean cooling. The slowest is 29.37 s at 3,235 kg, +10 km/h and open cooling. These are engineering inputs with no statistical confidence attached. The TAS interpretation is a separate speed-basis sensitivity. The Finnish Virtual Pilots account supports IAS.

## Power required at the source loads

Nominal speed and weight give **1,252.3 shaft BHP** and **1,115.5 propulsive hp** in both cooling states. Straight flight requires **463.3 hp** with clean cooling and **566.3 hp** with the open-cooling estimate. The nominal model’s power limit is below its modeled 4.92 G lift ceiling at this speed.

| Target load | Clean required hp | Clean excess hp | Open required hp | Open excess hp |
| --- | ---: | ---: | ---: | ---: |
| 2.92 G from the bank angle | 1,091.7 | +23.8 | 1,194.8 | −79.2 |
| 3.00 G rounded source value | 1,129.3 | −13.7 | 1,232.3 | −116.8 |
| 3.21 G from the time at nominal TAS | 1,239.3 | −123.7 | 1,342.3 | −226.8 |

The clean model is within 14 hp of supporting the rounded 3 G. It needs another 124 hp of useful power to meet the time-implied load at the nominal speed and mass. Reducing the same amount of required power would close the same balance. The turn supplies too few independent conditions to assign this residual to cooling, engine, propeller or drag under load.

## Formula checks

For a coordinated level turn, \(n=1/\cos\phi\), \(\omega=g\sqrt{n^2-1}/V\) in rad/s and \(R=V/\omega\), with \(V\) in m/s. The independently evaluated bank-angle form \(g\tan\phi/V\) agrees with the shared solver to within \(1.5\times10^{-14}\) °/s across 15 cases. The transcribed mean rate is heading change divided by elapsed time. Its equivalent load uses the steady-turn formula at the assumed TAS.

At a fixed speed and polar, the added induced power is \(P_{i,1}(n^2-1)\). Adding it to the 1 G power agrees with the full drag calculation to within \(3\times10^{-13}\) hp across the tested cases. Available and required power at the calculated power limit agree within \(5\times10^{-13}\) hp. These checks cover the implemented arithmetic and units. The test’s 22 s is independent of the simulator fit, with one transcribed point and no independent repeat. [USAF performance flight-test manual, Chapter 9](https://www.eaa.org/-/media/files/eaa/educationresources/sportaviation/ada320211.ashx) · [Replay code](../validation/diagnostics/powered_turn.cjs)

## Aircraft regression

The before-scorecard is the one reproduced by the previous main commit, **4.14.0-rc.2** at [42b8c99](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/42b8c991ef986fa67634cd6c4678d4e7c95b707f), with Fighter Sim Inputs **1.11.0**. The validation workflow replays 144 steady cases, 72 timed acceleration runs, 24 timed climbs and 12 fixed 200 mph EAS probes. The evidence panel runs separately from the live aircraft comparison. [Baseline reference](../references/analysis/v414-powered-turn-before.json) · [Previous production verification](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/runs/43435921853)

These are the before/after results at report precision for dry Combat, 50% internal fuel. Steady cases and the 180–300 mph EAS timing use 10,000 ft. Climb timing runs from sea level to 10,000 ft. The local acceleration column uses 200 mph EAS. Pending turn values reflect the intake profiles’ evidence gate.

| Aircraft | Stall mph EAS | Level mph TAS | Climb ft/min | Sust. turn °/s | Inst. turn °/s | Accel. mph TAS/s | Accel. s | Climb s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Spitfire LF Mk IX BS.543 | 85.16 | 380.32 | 4,705 | 19.26 | 33.21 | 5.067 | 49.35 | 117.27 |
| Bf 109 F-4 | 95.59 | 373.55 | 4,763 | 18.76 | 29.59 | 4.710 | 56.89 | 136.85 |
| P-47B | 108.35 | 371.07 | 2,798 | 13.63 | 26.10 | 3.375 | 85.70 | 207.24 |
| P-51B-15 | 96.77 | 408.07 | 4,203 | 16.08 | 25.56 | 4.334 | 49.53 | 150.79 |
| Fw 190 A-4 | 107.30 | 379.55 | 3,569 | 14.69 | 26.36 | 3.464 | 73.82 | 154.44 |
| P-38G | 110.58 | 362.26 | 3,499 | 15.46 | 25.58 | 3.382 | 93.12 | 172.40 |
| F4U-4 | 100.37 | 369.40 | 3,400 | 14.90 | 28.18 | 3.183 | 96.16 | 159.60 |
| Spitfire HF Mk IX BS.551 | 85.07 | 377.68 | 5,083 | Pending | Pending | 5.175 | 49.71 | 127.13 |
| Bf 109 G-2 MT-215 | 98.34 | 355.88 | 3,947 | Pending | Pending | 3.951 | 94.45 | 149.34 |
| P-51D-15 44-15342 | 101.53 | 417.39 | 3,320 | Pending | Pending | 4.153 | 49.81 | 154.78 |
| Spitfire F Mk IX BF.274 | 85.13 | 359.87 | 4,498 | Pending | Pending | 4.433 | 75.13 | 146.12 |
| Bf 109 G-6/Trop WNr 16476 | 101.83 | 333.92 | 3,485 | Pending | Pending | 3.305 | Power limited | 169.03 |

## Remaining maneuver evidence

Ellis and Wheal describe the restored P-51D campaign’s sustained and wind-up trials at 10,000 ft MSL and METO. The numerical values in Figures 9 and 10 still need a direct read. The NACA Spitfire Va rapid turns show control response and changing load. The AFDU Mustang III–Spitfire IX comparison gives a qualitative result for other specimens and installations. The current P-51B–LF IX matchup still needs matched powered-turn observations. [Ellis and Wheal Figures 9–10](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) · [NACA WR L-334](https://ntrs.nasa.gov/citations/19930092582) · [AFDU tactical trials](https://www.wwiiaircraftperformance.org/mustang/mustang-tactical.html)

The Finnish transcription also gives 27 s for 300–440 km/h and 35 s for 440–510 km/h at maximum power. Recover the altitude and loading before pairing the first interval with the turn at 360 km/h. An instrumented straight-flight run would constrain the power available above 1 G. NACA WR W-6 offers a separate primary-source methods check on the F2A-3, including flight-test horizontal-turn points. [Finnish acceleration table](https://forum.il2sturmovik.com/topic/6315-bf109g-2-turn-and-accelerationdeceleration-data/) · [NACA WR W-6](https://ntrs.nasa.gov/citations/19930092640)
