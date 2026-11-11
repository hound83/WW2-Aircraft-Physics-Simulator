# v4.7 comparison controls and historical source agreement

[Open the live comparison](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#operating-benchmark). Version 4.7.0-rc.1 is a research candidate.

## Comparison

- **Altitude** is shared by both aircraft and all three comparison plots. The slider above the plots runs from sea level to 40,000 ft in 5,000-ft steps. Selecting a row in the altitude table updates the slider.
- **Airspeed** starts at the lower modeled one-G stall speed, rounded down to a 5 mph EAS increment, minus another 5 mph. This gives 5 to just under 10 mph of space below stall. Turn, climb and advantage share that axis and the speed probe.
- **Turn units** switch the sustained-turn plot, advantage, peak summaries and altitude table between degrees per second and load factor. The square marks the peak in the selected unit. The 3°/s guide maps to a speed-dependent G curve in load-factor view. Full envelope shows the aircraft's flight limits.
- **Sustained-turn advantage** uses the full common flight envelope. Beyond the slower aircraft's maximum level speed, a colored dashed segment shows the faster aircraft's remaining sustained turn rate or load above 1 G. Its sign follows the aircraft's slot. The segment reaches zero at the faster aircraft's maximum level speed.
- **Time to climb** has adjacent start and target altitude controls. Its default is sea level to 10,000 ft. Moving the comparison altitude preserves those selections and an existing climb result. A valid climb has a target above its start.

At 10,000 ft, dry Combat and 50% fuel, the F4U-4 and P-51B reach 316.8 and 350.7 mph EAS respectively. At 335 mph EAS, the Mustang can sustain 5.24°/s or 1.91 G. The advantage plot marks that speed as Mustang-only.

## Source agreement

Fighter Sim Inputs v1.1.0 reviews 12 cases and links seven planned slots. Five of 156 planned benchmarks earn **GOLD\*** (3.21%), and zero earn **GOLD**. The benchmark shows case conditions, original or converted readings, central spread, the applicable limit, source ranges and the grade explanation under **Historical source agreement (GOLD)**. The standalone evidence explorer also shows the research-only Bf 109 G-2.

| Case | Compared central readings | Mean | Full spread | Limit | Grade and qualification |
| --- | ---: | ---: | ---: | ---: | --- |
| P-47B 41-5902, sea level to 12,600 ft | 300.00 / 301.31 s | 300.65 s | 1.31 s (0.43%) | 5% | GOLD* · timing and integrated rates share a report |
| Spitfire BS.543, 20,000 to 30,000 ft | 219.00 / 216.29 s | 217.65 s | 2.71 s (1.25%) | 5% | GOLD* · timing and integrated rates share a report |
| Bf 109 F-4, 1,000 to 5,000 m | 240.00 / 240.00 s | 240.00 s | 0.00 s (0.00%) | 5% | GOLD* · RPM, boost, climb speed and Rechlin mass unresolved |
| Fw 190 A-4 WNr 783, 1,000 to 9,000 m | 786.00 / 774.85 s | 780.42 s | 11.15 s (1.43%) | 5% | GOLD* · timing and integrated rates share a report |
| Bf 109 G-2 WNF production, standardized 250 m | 518 / 519 / 520 / 518 km/h TAS | 518.75 km/h TAS | 2 km/h | 6 km/h | GOLD* · one program, actual RPM, mass and engine designation unresolved |
| P-51B-15 43-24777, 75 inHg level speed | 444 / 444 mph TAS | Open | Unscored | 6 km/h | Open · 20,600 vs 20,800 ft and different weight bases in the same test program |

The 9,000 m Fw 190 timing point retains its source-supported line style. The continuation to 10,000 m carries its calculated status. The WNF treated-surface case spans 9 km/h against a 6 km/h limit and remains open. [Data policy and source records](research/WW2_FIGHTER_SIM_INPUTS_V1.md).

## Four-aircraft regression

Dry Combat at 10,000 ft, 50% fuel, clean turn and level cooling, climb cooling for climb rate. Values show v4.6.0-rc.1 → v4.7.0-rc.1.

| Aircraft | One-G stall (mph EAS) | Peak sustained turn (°/s) | Best climb (ft/min) | Maximum level speed (mph TAS) |
| --- | ---: | ---: | ---: | ---: |
| P-51B | 96.77 → 96.77 | 16.08 → 16.08 | 4,203 → 4,203 | 408.07 → 408.07 |
| P-47B | 108.35 → 108.35 | 13.63 → 13.63 | 2,798 → 2,798 | 370.38 → 370.38 |
| Bf 109 F-4 | 95.59 → 95.59 | 18.76 → 18.76 | 4,763 → 4,763 | 373.55 → 373.55 |
| Spitfire LF Mk IX | 85.16 → 85.16 | 19.26 → 19.26 | 4,705 → 4,705 | 380.32 → 380.32 |

The locally generated four-aircraft scorecard and separate historical checks match v4.6 byte for byte. The hosted protected comparison finds zero material differences across 3,628 numerical values and reproduces v4.6’s 38 below-tolerance rounding differences exactly. A separate comparison of 252 aircraft, altitude, rating and power-domain combinations reproduced every existing metric, including 30 source-limited states. The Mustang lift calibration and withheld Mach sections and the P-47B and Spitfire climb fit/check split are recorded in their original reports. The same-report timing checks measure source agreement. Powered sustained-turn validation and 5:1 discrimination remain open. [Four-aircraft scorecard](FLIGHT_SCORECARD.md) · [Climb fit and check rows](V43_MODEL_CHECKS.md) · [Turn and lift uncertainty](V44_TURN_PERFORMANCE.md).

## Acceleration display

A linked **level acceleration vs. airspeed** plot can reuse the selected altitude and EAS probe. Divide propulsive power minus required power by mass and true airspeed to get acceleration. The zero crossing marks maximum level speed for that condition. Use mph/s or m/s² and keep the signed result. A dedicated linked plot gives both aircraft one readable acceleration scale.
