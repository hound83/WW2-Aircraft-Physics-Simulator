# v4.14.0-rc.2 recorded level-acceleration replay

The provisional P-51D replay reaches 242 KIAS in **93.3 s** from 110 KIAS. The transcribed flight time is **133 s**. The calculated minus transcribed residual is **−39.7 s (−29.8%)**. This comparison uses a restored specimen and estimated installed power, mass and airspeed conversion. The full range of tested scenarios is **70.7–133.2 s**. [Flight report, Figure 8](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) · [Endpoint transcription](https://ww2aircraft.net/forum/threads/captured-aircraft-equipment-report-14.65811/?post=2043798) · [Numerical replay](../validation/current/level-acceleration.json)

Open **P-51D level-acceleration flight test** beneath **Time to accelerate**. The two open circles show the transcribed endpoints. The dotted line shows the calculated trajectory. The horizontal axis extends through the transcribed finish. The fixed replay uses its own test conditions while the two-aircraft timer follows the selected settings. [Live benchmark](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#bench-acceleration-evidence)

## Restored P-51D test and reconstruction

| Item | Flight report or transcription | Replay input |
| --- | --- | --- |
| Aircraft and installation | P-51D 45-11586, V-1650-9, four-blade Hamilton Standard Hydromatic, aft tank removed, mid CG | P-51D-15 44-15342 V-1650-7 Normal power, shared propeller calculation and wartime rack-on drag polar |
| Rating and temperature | METO, low blower, 10,000 ft MSL, 50°F | 1,140 shaft BHP, 46 inHg and 2,700 RPM as a same-family proxy. Pressure altitude assumed equal to MSL |
| Weight and cooling | 8,900 lb takeoff in Table I. Run mass, rack fit and coolant-flap opening unresolved | 8,900 lb fixed, with the wartime level-flight drag configuration |
| Airspeed and time | 110–242 KIAS in 133 s, one secondary lineage. Original calibration and intermediate samples unresolved | IAS-as-CAS central assumption. Endpoints 126.39–276.49 mph EAS and 151.08–330.51 mph TAS |

The account was published by test participants in 1990. Its Figure 8 is indexed but the numerical endpoints and any intermediate ordinates still need a direct figure read. Mirrored copies of the time summary share one lineage. The elapsed time was held outside the calculation. The replay uses the indicated speed interval to set the calculation endpoints, and the available observations supply zero independent intervals or repeat runs. [Test rules and aircraft](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) · [Figure 8](https://www.wwiiaircraftperformance.com/com/others/endingtheargument_files/figure8.jpg) · [Source record and related leads](../references/analysis/level-acceleration-evidence-2026-11-13.json)

| Scenario | Calculated time | Difference from 133 s |
| --- | ---: | ---: |
| 50°F, nominal inputs | 93.32 s | −39.68 s |
| ISA temperature, otherwise nominal | 85.63 s | −47.37 s |
| Fastest of 18 scenarios, 8,700 lb / 1,254 BHP / −4 kt CAS–IAS | 70.67 s | −62.33 s |
| Slowest of 18 scenarios, 8,900 lb / 1,026 BHP / +4 kt CAS–IAS | 133.22 s | +0.22 s |

The weight, ±10% power and ±4 kt common offset ranges illustrate input sensitivity. They do not quantify source uncertainty. At the nominal fixed mass and speed basis, the timing implies **351.5 mean excess hp** across the interval, compared with **500.9 hp** in the model. These are interval averages inferred from the same change in kinetic energy. They give no separate estimate of shaft power, propeller efficiency, cooling drag or power application at the start. The 1990 engine and installation, true IAS correction and altitude trace can all affect the comparison.

### Formula checks

- **Airspeed.** At fixed assumed pressure, convert proxy CAS to ISA TAS with the compressible pitot relation. Scale TAS by the square root of absolute temperature over ISA temperature at that pressure. Compute EAS with the corresponding density ratio. The replay uses **11,699 ft ISA density altitude** for aerodynamic forces and fixed BHP from the **10,000 ft** Normal power point. The ISA acoustic-speed approximation gives a maximum propeller tip Mach of **0.837** in the nominal run, below the modeled loss onset at **0.92**.
- **Acceleration.** At level flight, \(P_s=(P_{\text{prop}}-P_{\text{drag}})/(mg)\) and \(a=gP_s/V\). The independent force calculation \(a=(P_{\text{prop}}/V-D)/m\) agreed at **36 points** across the 12 profiles within **5.13 × 10⁻¹¹ mph/s**. These are checks of the implemented equations and unit conversions.
- **Elapsed time and energy.** The shared solver advances EAS at constant altitude using the local density ratio. The nominal time was **93.32229 s** at a 0.5 s step and **93.32111 s** at 0.125 s. Independent integration in speed space, \(t=\int dV/a\), gave **93.32085 s**. At fixed mass and altitude, the mean excess power is \(m(V_2^2 - V_1^2)/(2t)\). Changing the transcribed time changes the residual and the derived observed power while the calculated time and trace retain their values. [USAF Performance Flight Test Phase, Eq. 9.11–9.12](https://www.eaa.org/-/media/files/eaa/educationresources/sportaviation/ada320211.ashx) · [Replay code](../validation/diagnostics/level_acceleration.cjs)

## Wartime checks on the energy balance

**P-51D 44-15342.** Wright Field B.4 recorded **362 mph TAS** at 10,000 ft and 9,660 lb with wing racks and automatic coolant flaps. At 46 inHg, 2,700 RPM and low blower, the report assigns **1,140 BHP** by chart. The calculated equilibrium is **360.34 mph TAS (−1.66 mph, −0.46%)**. At the recorded speed the model has **1,028.77 propulsive hp** against **1,041.62 required hp**, or **−0.0302 mph TAS/s**. The measured speed was outside the sea-level WEP polar fit. The shaft-power input shares the report. [Wright Field B.4](https://www.wwiiaircraftperformance.org/mustang/p51d-15342.html)

**Spitfire LF Mk IX BS.543.** The A&AEE Table II climb used fully open radiator flaps at 3,000 RPM, with 7,485 lb takeoff weight. The measured rate and corrected TAS imply level-equivalent acceleration at the same speed and excess power. The vertical basis sets \(P_s=\dot h\). A second calculation adds \(V(dV/dh)\dot h/g\) from the local Table II speed schedule. The slopes use only low-blower rows. The Res/170 reduction was unavailable to verify how the report handled speed energy, so both bases are shown. [A&AEE Table II and §4](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)

| Altitude (ft) | Role | TAS (mph) | Vertical basis, source / model (mph/s) | Residual | Including schedule energy, source / model (mph/s) | Residual |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 7,000 | Reserved | 190 | 6.166 / 6.198 | +0.032 | 6.401 / 6.435 | +0.033 |
| 8,000 | Reserved | 193 | 5.890 / 5.879 | −0.011 | 6.118 / 6.107 | −0.011 |
| 10,000 | Fit | 199 | 5.361 / 5.281 | −0.081 | 5.575 / 5.492 | −0.084 |
| 12,000 | Reserved | 205 | 4.864 / 4.669 | −0.195 | 5.064 / 4.861 | −0.203 |

The 12,000 ft check has the largest residual, about **4.0%** on either basis. The 10,000 ft point was already used in the climb fit. These transformed quantities check the climb-conditioned energy budget. A level acceleration measurement would require an elapsed time at constant altitude.

## Operating benchmark regression

Baseline 4.14.0-rc.1 at [9e73e0b](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/9e73e0b07110bd1161fd61697dce943d25eb2084), Fighter Sim Inputs 1.11.0. All **144 steady cases, 72 timed acceleration runs, 24 timed climbs and 12 fixed-speed probes** match the frozen results at report precision, including numerical and availability states. At 10,000 ft and 200 mph EAS the dry Combat acceleration is **4.334 mph TAS/s** for the P-51B and **5.067 mph TAS/s** for the Spitfire LF IX. The existing turn-drag replay carries the supported range for their sustained-turn crossover. [Frozen scorecard](../references/analysis/v414-level-acceleration-before.json) · [Turn comparison](V413_TURN_DRAG.md)

Dry Combat at 50% internal fuel. The level, stall, climb and turn columns use 10,000 ft. Acceleration timing uses 180–300 mph EAS, climb timing uses 0–10,000 ft, and the local acceleration probe uses 200 mph EAS. Each shown value is both before and after.

| Profile | Stall EAS mph | Level TAS mph | Climb ft/min | Sust. turn °/s | Inst. turn °/s | Accel. TAS mph/s | Accel. s | Climb s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Spitfire LF IX BS.543 | 85.16 | 380.32 | 4,705 | 19.26 | 33.21 | 5.067 | 49.34 | 117.27 |
| Bf 109 F-4 | 95.59 | 373.55 | 4,763 | 18.76 | 29.59 | 4.710 | 56.89 | 136.85 |
| P-47B | 108.35 | 371.07 | 2,798 | 13.63 | 26.10 | 3.375 | 85.70 | 207.24 |
| P-51B-15 | 96.77 | 408.07 | 4,203 | 16.08 | 25.56 | 4.334 | 49.53 | 150.79 |
| Fw 190 A-4 | 107.30 | 379.55 | 3,569 | 14.69 | 26.36 | 3.464 | 73.81 | 154.44 |
| P-38G | 110.58 | 362.26 | 3,499 | 15.46 | 25.58 | 3.382 | 93.12 | 172.40 |
| F4U-4 | 100.37 | 369.40 | 3,400 | 14.89 | 28.18 | 3.183 | 96.16 | 159.60 |
| Spitfire HF IX BS.551 | 85.07 | 377.68 | 5,083 | Pending evidence | Pending evidence | 5.175 | 49.71 | 127.13 |
| Bf 109 G-2 MT-215 | 98.34 | 355.88 | 3,947 | Pending evidence | Pending evidence | 3.951 | 94.45 | 149.34 |
| P-51D-15 44-15342 | 101.53 | 417.39 | 3,320 | Pending evidence | Pending evidence | 4.153 | 49.81 | 154.78 |
| Spitfire F IX BF.274 | 85.13 | 359.87 | 4,498 | Pending evidence | Pending evidence | 4.433 | 75.13 | 146.12 |
| Bf 109 G-6/Trop WNr 16476 | 101.83 | 333.92 | 3,485 | Pending evidence | Pending evidence | 3.305 | Power limited | 169.03 |

## Remaining evidence

The best next lead for maneuverability is the same campaign's powered sustained-turn and wind-up tests at 10,000 ft. Recover Figures 9 and 10 with readable speed and load factor. Keep the source configuration and METO limitations explicit and calculate the corresponding turn rate only where speed basis and load permit. A matched wartime speed-time record or an independent interval would still be needed to close the timed-acceleration accuracy check. [Turn report](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html) · [Roadmap](SIMULATOR_ROADMAP.md)
