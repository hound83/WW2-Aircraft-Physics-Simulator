# v4.3 operating benchmark checks

**4.3.0-rc.1** is a research candidate. The operating benchmark applies the v4.1 open-cooling climb model to the P-47B and Spitfire LF IXc when specimen identity, power phase, MAP, RPM, height and airspeed match the modeled report conditions. The comparison groups variants by approximate WWII service period, shows six shared altitudes at a glance and links turn and straight-climb curves at the same equivalent airspeed.

## Known climb results

The comparison replays the same weights, rating requests and airspeeds before and after. The P-47B 41-5902 report provides torque-meter BHP and TAS. Its mass is the reported gross weight. BS.543 supplies the open-radiator climb rates and boost readings. The replay uses the reported Table II TAS and a boost-conditioned engine chart for shaft BHP. The report transferred the climb speed schedule from BS.354 and applied BF.274 airspeed corrections. The 41-5942 replay holds the separate report's recorded BHP, TAS and RPM fixed in both models and transfers only the equivalent installed loss. Both Thunderbolt replays use the documented 2:1 reduction gearing.

| Report and cohort | Rows | v4.2 MAE (ft/min) | v4.3 MAE (ft/min) | Largest increase in absolute error (ft/min) |
|---|---:|---:|---:|---:|
| P-47B 41-5902 · fit | 5 | 87 | 43 | 0 |
| P-47B 41-5902 · held out | 5 | 112 | 32 | 7 |
| Spitfire LF IXc BS.543 · fit | 6 | 314 | 75 | 9 |
| Spitfire LF IXc BS.543 · held out | 10 | 270 | 65 | 10 |
| P-47B 41-5942 · separate airframe and report | 5 | 94 | 78 | 66 |

The v4.1 fits had previously seen the report datasets. The held-out rows were excluded from numerical fitting. The eight-gun 41-5942 test is a separate flight-test report and installation. Its 30,000-ft point has the largest worsening on transfer, from 32 to 98 ft/min absolute error. The provisional engineering gate requires each held-out or transfer cohort to improve on average and sets 100 ft/min as the maximum acceptable worsening for an individual row at the matched speed.

When each model searches 110–320 mph TAS for its own best climb at the Spitfire test weight, the ten held-out rows improve from **317 to 198 ft/min MAE**. The 7,000-ft prediction worsens by **135 ft/min**. This sensitivity uses the same measured climb-rate target and shows the sensitivity to modeled Vy. The original climb used the reported schedule under a test concession that permitted more than five minutes of Combat power.

[41-5902 original report, printed p. 2 §6](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf) · [BS.543, Tables II and V](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [41-5942, FS-M-19-1523-A §B.1–2](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html) · [BS.543 original plot and correction review](research/WW2_THIRTEEN_FIGHTER_DATA_2026-11-11.md)

## Operational replay at 50% fuel

The six-altitude replay covers 90 Normal, Combat and fitted-injection scenarios. Values below are operational model outputs. They use a standard air-to-air configuration and reconstructed fuel load. The clean results use the same aerodynamic polars and source power model as v4.2. Turning with climb cooling is an optional modeled scenario. It uses the aggregate fit where qualified and the previous cooling estimate outside those conditions. The match uses the report's rating and RPM and interpolates only between same-branch power nodes. The outer 15 mph at each end of the 110–320 mph TAS study window blend into the previous open-cooling estimate. Altitude and gear handovers follow the source branch boundaries.

### Combat at 10,000 ft

| Aircraft | Clean peak turn (°/s) | 1 G stall (mph EAS) | Max level speed (mph TAS) | Best climb (ft/min) |
|---|---:|---:|---:|---:|
| Spitfire LF IXc | 19.26 | 85.2 | 380.3 | 4,979 → 4,705 |
| Bf 109 F-4 | 18.76 | 95.6 | 373.6 | 4,763 |
| P-47B | 13.63 | 108.4 | 370.4 | 2,946 → 2,798 |
| P-51B-15 | 18.06 | 96.8 | 408.1 | 4,203 |
| Fw 190 A-4 | 14.69 | 107.3 | 379.6 | 3,569 |
| P-38G-1 | 15.46 | 110.6 | 361.5 | 3,499 |
| F4U-4 | 14.89 | 100.4 | 368.6 | 3,400 |

### Changed climb presets

| Aircraft | Power | Altitude | Best climb v4.2 → v4.3 (ft/min) | Vy v4.2 → v4.3 (mph EAS) |
|---|---|---:|---:|---:|
| Spitfire LF IXc | Combat | 10,000 ft | 4,979 → 4,705 | 155 → 141 |
| Spitfire LF IXc | Combat | 20,000 ft | 4,364 → 4,118 | 147 → 134 |
| Spitfire LF IXc | Combat | 30,000 ft | 2,630 → 2,237 | 133 → 120 |
| P-47B | Combat | Sea level | 3,113 → 2,953 | 146 → 157 |
| P-47B | Combat | 10,000 ft | 2,946 → 2,798 | 141 → 153 |
| P-47B | Normal | 20,000 ft | 1,934 → 1,849 | 131 → 143 |
| P-47B | Normal | 30,000 ft | 1,634 → 1,573 | 128 → 139 |
| P-47B | Normal | 35,000 ft | 878 → 866 | 124 → 135 |

The climb integration checks include sea level to 30,000 ft at 50% fuel for both updated aircraft. Combat use is limited to 300 seconds, with the remaining climb at Normal. The 250-ft replay step changes the time by less than 0.1 second compared with the 500-ft step in these two scenarios. Thermal state, acceleration between climb speeds and instantaneous historical fuel mass remain unresolved.

[Original v4.2 scenario snapshot](../references/analysis/v43-benchmark-before.json) · [Generated v4.3 full replay](../validation/current/operating-benchmark-v43.json) · [Four-aircraft historical scorecard and evidence gaps](FLIGHT_SCORECARD.md)

## Additional diagnostic results

**Spitfire above 30,000 ft.** Table II provides five further points through 40,000 ft. At 40,000 ft it gives 300 ft/min at 237.5 mph reported TAS and 17.55 minutes elapsed under the test concession. At the reported TAS and gross weight the existing high-altitude estimate gives 522 ft/min. These rows stay outside the adopted fit. The upper rows retain the original report's low-speed correction, whose independently verified range starts at 130 mph IAS. [Table II and test conditions](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [Recorded high-altitude rows](../references/bs543-high-altitude-climb-check.json)

**Thunderbolt cooling sweep.** New same-specimen data holds 1,605 BHP and 2,700 RPM at 5,000 ft. Opening the oil-cooler and intercooler flaps from neutral to wide open reduces observed TAS from 323 to 309 mph. At modeled propulsive efficiency, the pair implies about 0.082 m² of equivalent added drag area. The climb fit combines broader cooling and propulsion effects. The sweep therefore constrains a future cooling model and remains outside this fit. [Printed p. 2 §B.2](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf) · [Measured conditions archive](research/WW2_FIGHTER_MEASURED_CONDITIONS_2026-11-11.md)

**Corsair high-altitude speed.** The 1948 USN BuNo 80765 trial recorded 385 kt TAS at 29,000 ft at military power. The rated-inlet model gives 364.1 kt. Chart BHP gives 371.1 kt. Halving the modeled advance and tip-Mach losses yields 376.2 kt at the chart midpoint and 372.1–380.1 kt over its ±50 BHP reading range. Removing both modeled losses yields 382.1 kt at the midpoint. Four high-altitude speed errors average 10.6 kt with chart BHP and 7.0 kt with the half-loss scenario. Across seven same-report climb checks, the half-loss assumption changes mean error from 139.9 to 140.0 ft/min. The propeller change stays diagnostic. It lacks a supported efficiency measurement and leaves a material speed residual. [Original speed chart](https://www.wwiiaircraftperformance.com/org/f4u/f4u_files/80765-level.jpg) · [Original climb chart](https://www.wwiiaircraftperformance.com/org/f4u/f4u_files/80765-climb.jpg)

## Service context and remaining accuracy work

The picker uses approximate variant-level periods and representative theatres, including a test/training group for the P-47B. Overlapping periods indicate a useful comparison window. Establishing an actual encounter needs unit-level historical evidence. The application exposes its own provisional sustained-turn envelope. Independent same-condition turn accuracy and the historical 5:1 discrimination criterion remain unresolved.

Run `npm run diagnose:operating-benchmark` for the individual residuals, source states, full preset replay and rejected Corsair sensitivities. `npm run check` runs the operating-benchmark regression and regenerates the report. `npm run test:browser` tests the served HTML and the controls.
