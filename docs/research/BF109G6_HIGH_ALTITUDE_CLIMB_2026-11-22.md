# Why the Bf 109 G-6/Trop loses two minutes by 10 km

22 November 2026 · WNr 16476 · Simulator 4.15.0-rc.1, Fighter Sim Inputs 1.11.0 · [Baseline revision](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/2675e7f5b1162124845e1a1005c909299e750c26)

**The replay loses 167 s from 8 to 10 km. About 138 s of that comes in the last kilometre.** The simulator transfers the Finnish G-2's climb manifold pressure to the G-6. At 10 km that input is 0.69 ata, while the G-6's own chart reads about 0.78 ata. Substituting the measured pressure through the climb reduces the 8–10 km error to **14 s**. The resulting climb still reaches 8 km **50 s early**. The factory trial supports two separate investigations, one into upper-altitude engine power and one into the surplus climb performance lower down. [Messerschmitt 109 10 L 43, Blatt 7](https://www.wwiiaircraftperformance.org/me109/VB-109-10-L-43.pdf#page=7) · [Raw coordinates and source identities](../../references/analysis/g6-16476-climb-pressure.json)

## Where the time goes

Positive error means the replay took longer than the aircraft. Both replays use the same indicated-speed instruction, plotted true airspeed, 2,600 rpm, fixed 3,260 kg departure weight, propeller, drag polar and cooling assumption. The pressure substitution uses the existing pressure-to-shaft-power relation and caps manifold pressure at the commanded 1.30 ata. It uses no climb-rate or time targets to set the pressure or its conversion.

| Interval | Factory time | Current replay | Current error | G-6 pressure replay | Error | Chart-reading allowance |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 0–5 km | 336 s | 317 s | −19 s | 317 s | −19 s | ±12 s |
| 0–8 km | 636 s | 596 s | −40 s | 586 s | −50 s | ±12 s |
| 8–9 km | 150 s | 180 s | +30 s | 155 s | +5 s | ±24 s |
| 9–10 km | 240 s | 378 s | +138 s | 249 s | +9 s | ±36 s |
| **8–10 km** | **390 s** | **557 s** | **+167 s** | **404 s** | **+14 s** | **±36 s** |
| 0–10 km | 1,026 s | 1,154 s | +128 s | 990 s | −36 s | ±24 s |

The chart gives both accumulated time and local rate. Integrating a linearly interpolated rate between each pair of kilometre marks gives 389.2 s from 8 to 10 km and 1,032.8 s from departure to 10 km. The agreement with the 390 s and 1,026 s time readings checks the axis interpretation. These curves come from the same flight campaign. The interval allowances add the two endpoint reading allowances, with zero at the timing origin. They cover graphical reading precision only. [Original time, rate and TAS coordinates](../../references/analysis/g6-16476-climb-charts.json)

## What the pressure and power measurements establish

The original records manifold pressure (*Ladedruck*) and blower discharge pressure (*Gebläsedruck*) separately. The manifold trace carries open circles, stays nearly flat through about 5.5 km, then falls. The second factory test below used G-1 WNr 14026, a different DB 605 A, 2,600 rpm and the same 260 km/h indicated climb instruction. At 10 km this independent installation also recorded more manifold pressure than the Finnish transfer supplies here. The G-1 had a different propeller variant and radiator control. Its climb times are ineligible as a repeat of the G-6/Trop test. [G-6 chart](https://www.wwiiaircraftperformance.org/me109/VB-109-10-L-43.pdf#page=7) · [G-1 chart, Blatt 6](https://www.wwiiaircraftperformance.org/me109/VB-109-19-L-42.pdf#page=6) · [G-1 specimen and procedure](https://www.wwiiaircraftperformance.com/org/me109/g/me109g-14026.html)

| Height | G-2 transfer in G-6 | G-6 manifold trace | Separate G-1 trace | Factory G-6 climb rate | Current calculated rate | With G-6 pressure |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 km | 1.30 ata | 1.33 ata | — | 12.4 m/s | 14.33 m/s | 14.33 m/s |
| 8 km | 0.96 ata | 1.00 ata | 0.95 ata | 7.6 m/s | 7.12 m/s | 7.74 m/s |
| 9 km | 0.82 ata | 0.88 ata | 0.84 ata | 5.6 m/s | 4.24 m/s | 5.30 m/s |
| 10 km | 0.69 ata | 0.78 ata | 0.75 ata | 3.1 m/s | 1.54 m/s | 2.98 m/s |

Rates in this table use the local slope of the plotted TAS schedule. The budget divides excess useful power by mass times `g + V·dV/dh`. At 10 km and 447 km/h TAS, the pressure change raises modeled shaft power from 708 to 786 mechanical hp. Useful propeller power rises from 633 to 700 hp against the same 561 hp of calculated drag power. The implied useful-power shortfall against the observed rate falls from 54.5 to 4.2 kW. At 5 km the same calculation shows a **64.6 kW surplus**. The G-6 report measured pressure and climb. Shaft power and propeller efficiency in this calculation are inferred.

Daimler-Benz gives 1,310 PS at sea level and 1,250 PS at 5.8 km for the tested climb setting. Its 10 km entry is 790 PS (779 mechanical hp) at **2,800 rpm and 0.85 ata**, an emergency rating. The 786 hp inferred from the G-6 pressure is close to, and slightly above, that different-rating sheet value. An installed 2,600-rpm power curve remains a material check on the conversion. [Daimler-Benz Leistungsblatt, April 1943, PDF p. 12](https://www.degnans.com/markd/DB605.pdf#page=12)

## How sensitive is the diagnosis?

| Diagnostic case | 0–8 km error | 8–10 km error | 0–10 km error |
| --- | ---: | ---: | ---: |
| Current replay | −40 s | +167 s | +128 s |
| G-6 chart pressure, central reading | −50 s | +14 s | −36 s |
| G-6 chart pressure, common shift of −0.02 to +0.02 ata | −56 to −43 s | −12 to +44 s | −69 to +1 s |
| G-6 pressure trace shifted to align its low-altitude plateau to the written 1.30 ata setting | −40 s | +60 s | +20 s |
| Chart's 3,250 kg departure label, original pressure | −43 s | +161 s | +118 s |
| Estimated fuel burn, original pressure | −47 s | +129 s | +83 s |
| G-6 pressure plus estimated fuel burn | −57 s | −5 s | −62 s |
| Remove all modeled additional climb-cooling drag, original pressure | −86 s | +2 s | −84 s |

- **Pressure reading.** The legible G-6 pressure ticks give a plateau near 1.33 ata. The report specifies a command of 1.30. The absolute-axis case preserves the measured upper curve and limits the low-altitude power to the written setting. Aligning the entire trace to the command shifts the pressure down by 0.029 ata and still removes 108 s of the upper-band error. The common ±0.02 ata shift represents reading precision, and the plateau alignment tests a separate systematic interpretation. The G-1 pressure readings carry a ±0.03 ata allowance. [Pressure ticks, trace coordinates and reading method](../../references/analysis/g6-16476-climb-pressure.json)
- **Weight and fuel.** The original prose gives 3,260 kg at departure. The handwritten label on Blatt 7 reads 3,250 kg. The 10 kg difference explains 7 s of the upper-band error. The sheet gives 220 + 10 g/(PS h) at the two documented climb-power points. Continuing 220 across the climb gives about 69 kg burned in the original replay and 64 kg with G-6 pressure. With G-6 pressure, continuing 230 instead gives 66 kg burned and a −6 s upper-band error. The missing flight fuel log and the assumed high-altitude consumption limit the interpretation of these cases. [Report prose, Blatt 3](https://www.wwiiaircraftperformance.org/me109/VB-109-10-L-43.pdf#page=3) · [Engine fuel figures, p. 12](https://www.degnans.com/markd/DB605.pdf#page=12)
- **Cooling drag.** The model applies a constant extra 0.12 m². Its corresponding power at 10 km is 47.4 kW. Removing it also closes most of the upper timing gap, but makes the 8 km result 86 s early. The G-6 pilot varied the radiator opening from roughly 55 to 270 mm. Near the upper band the opening drops to about 55 mm near 9.95 km, then rises to 140 mm near 10.4 km. A related G-1 test at 2,050 m shows that increasing the opening from 100 to 300 mm reduces high-speed level performance by roughly 40–45 km/h across its two plotted engine curves. Those nonstandard radiators, the level-flight speed and the different aircraft preclude a direct conversion from G-6 flap travel to climb drag. [G-6 radiator schedule, Blatt 8](https://www.wwiiaircraftperformance.org/me109/VB-109-10-L-43.pdf#page=8) · [G-1 opening and speed, Blatt 9](https://www.wwiiaircraftperformance.org/me109/VB-109-19-L-42.pdf#page=9)

## Model decision and next research

Use the G-6's own manifold-pressure curve as the first candidate for this filtered, 2,600-rpm installation. Keep the 0–8 and 8–10 km interval errors visible separately. The present data support a deficient upper-altitude pressure input. The original chart alone cannot assign all the remaining error among installed shaft power, propeller efficiency and radiator drag.

1. For the upper band, obtain a DB 605 A installed power or torque measurement at 2,600 rpm with actual pressure, climb speed and altitude, or an independently flown filtered G-6/Trop climb with those channels. Compare at 8, 9 and 10 km before promoting a new operational curve. The G-1 provides one external pressure check. The secondary source points to the same G-6 and G-1 plates. Its other lead, WNr 26108, actually flew a DB 605 **AS**. [Secondary source and chart cross-references](https://forum.il2sturmovik.com/topic/60714-bf-109-g-db605a-and-am-engine-full-throttle-height-volldruckh%C3%B6he/) · [WNr 26108 factory report](https://www.wwiiaircraftperformance.com/org/me109/g/me109g-26108.html)
2. For the lower band, target the 4–6 km part of the filtered climb. The model overclimbs by 1.9 m/s at 5 km while the commanded pressure still holds. Match the G-6's radiator position and actual climb speed to an independent radiator-drag or propeller-efficiency measurement. Retest both bands and the observed level-speed points. A single whole-climb time can hide an error of the opposite sign below 8 km.

Run `npm run check` to reproduce `validation/current/g6-high-altitude-climb.json` in the physics-validation artifact. The archived replay and the controlled zero-burn path agree to 0.1 s at the reporting precision. Halving the altitude step from 100 to 50 ft changes the reported intervals by at most 0.1 s. The operating model and level-speed calibration retain their prior inputs. [Replay calculation](../../validation/diagnostics/g6_high_altitude_climb.cjs) · [Historical comparison](WW2_COMBINED_FLIGHT_DATA_2026-11-22.md)
