# Matched climb inputs v1.7.0

Fighter Sim Inputs now exports both source cases under `climb_reference.cases`. The observations retain original units, source locations and IDs. The Fw 190 speed scenario and cooling fit are calculated inputs. The numerical replay uses fixed takeoff mass and ISA. Both timing comparisons use the same reports as the inputs. [Data pack](../../references/analysis/fighter-sim-inputs-v1.json) · [Full scorecard](../../references/analysis/ww2_matched_climb_scorecard_2026-11-12.json)

| Case | Source inputs | Assumptions and limits |
| --- | --- | --- |
| Fw 190 A-4 WNr 783 | Graph 2, ten open/closed rate pairs from 1,000 to 10,000 m, an additional sea-level open rate, an open-flap timing trace from 1,000 to 9,000 m and six climb manifold-pressure readings | Long external intake, 3,870 kg at takeoff, 2,400 rpm and rated 1.32 ata. The source timing ends at 9,000 m. The 10,000 m time is integrated from source rates. Source climb TAS, instantaneous weight and installed shaft power remain open. |
| P-38G-1 42-12687 | B.4, eight altitude knots with reported TAS, vertical rate, cumulative time, manifold pressure, limits and chart-assigned BHP per engine | Gear up, flaps neutral, coolant and oil shutters wide open, 3,000 rpm, auto-rich and 13,900 lb at takeoff. Replay range is sea level to 35,000 ft. Keep the separate 35,000-ft service-ceiling row and B.1 faired-shutter level case outside the B.4 schedule. |

The Fw 190 report supplies one chart for both flap conditions. The older replay and newer archive readings are two extractions of that graph. Retaining their lineage avoids counting them twice. The graph reading allowances are ±0.35 m/s and ±0.25 min per elapsed point. Referencing time to the 1,000 m read allows up to ±30 s of chart-reading difference. The original test uncertainty remains unknown. [WNr 783 report and graph](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-783-nr1.html)

Wright Field reports 2.81 min to 10,000 ft and 5.68 min to 20,000 ft. The corresponding 168.60 and 340.80 s are unit conversions. B.4 shaft power is assigned from engine charts. At 10,000 ft, 1,210 BHP per engine gives 2,420 BHP total. At 20,000 ft the carburetor temperature starts limiting the test schedule. Turbo RPM also limits the upper rows. [Wright Field report](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf)

## Fixed-mass replay

The control is pinned to the operating model at `636d57c52`. The after replay uses the existing 5,000 m WNr 783 cooling fit and applies the signed TAS energy-height increment to modeled specific excess power for both aircraft. For each interval, the time step is `(Δh + Δ(TAS²/2g)) / Ps`. Directly reported vertical rates and times retain their original meanings. The scorecard has the signed rate and time errors, cumulative and interval values and a 50-ft convergence repeat of the 100-ft midpoint integration.

| Check | Report | Before | After |
| --- | ---: | ---: | ---: |
| WNr 783, eight reserved open-flap rates, MAE | — | 220.7 ft/min | 163.6 ft/min |
| WNr 783 at 7,000 m, signed error using the existing graph read | 1,958.7 ft/min | +43.8 ft/min | −162.2 ft/min |
| WNr 783, 1,000 to 9,000 m open-flap time | 786 s | 712.35 s | 814.98 s |
| 42-12687, seven reserved steady climb-rate checks, MAE | — | 173.3 ft/min | 173.3 ft/min |
| 42-12687, sea level to 10,000 ft | 168.60 s | 163.06 s | 167.65 s |
| 42-12687, sea level to 20,000 ft | 340.80 s | 332.99 s | 346.25 s |
| 42-12687, sea level to 35,000 ft | 748.80 s | 723.21 s | 756.59 s |

The WNr 783 equivalent area is 0.1712 m² from the 1.05 m/s difference at 5,000 m, with 192 mph modeled fit TAS. The open-flap speed schedule in the export uses a 1 mph best-rate search at each altitude. Scaling that schedule by ±10% takes the 1,000-to-9,000 m time to about 831–839 s, versus 815 s at the nominal schedule. At 7,000 m the paired graph difference is 374 ft/min and the modeled penalty is 184 ft/min. Those checks support use as a bounded scenario and leave the upper-altitude installation residual open.

At sea level the P-38G steady rate remains 411 ft/min high. The fixed-mass TAS calculation improves the 20,000-ft cumulative time error from −7.81 s to +5.45 s. The 15,000-to-20,000 ft band moves from −1.77 to +3.75 s, so the cumulative improvement does not establish a better local fit. The shared flight-model integrator and its fuel and rating-duration checks belong to the simulator milestone. [Shared-climb audit](../V410_CLIMB_TURN_AND_FORMULA_AUDIT.md)

## Seven-aircraft propulsion review

These are model power budgets at the named replay conditions. BHP is total for the aircraft. The observed and chart-based evidence restricts the combined shaft, propulsive and drag balance. Grok’s 80% and 76% references retain their specific tested conditions, including the P-47B transfer from Curtiss evidence. [Grok benchmark and source leads](../../references/research/WW2_PROPELLER_EFFICIENCY_BENCHMARK_2026-11-12.md) · [Verified propeller evidence](../V410_PROPELLER_REFERENCE.md)

| Aircraft and altitude | Shaft hp | Useful propeller hp | Drag hp | Main evidence gap |
| --- | ---: | ---: | ---: | --- |
| Spitfire LF IX, 12,000 ft | 1,505 | 1,392 | 521 | Resolve open-radiator loss and metal-blade efficiency. |
| P-47B, 12,600 ft | 2,000 | 1,712 | 798 | Improve the open-cooling and propeller transfer split. The 41-5942 replay remains a separate-airframe check. |
| P-51B, 2,200 ft | 1,603 | 1,364 | 287 | Recover actual climb TAS and matched high-blower power. |
| F4U-4, 6,500 ft | 1,700 | 1,507 | 446 | Recover installed climb power and actual TAS. The 3.10 mph source replay applies to fixed-power level flight. |
| Fw 190 A-4, 5,000 m open | 1,302 | 1,056 | 410 | Recover climb TAS, exact propeller data and shaft power through the blower change. |
| P-38G, 10,000 ft open | 2,420 | 2,024 | 495 | Resolve low-altitude loading, cooler losses and direct useful power. |
| Bf 109 F-4, 10,000 ft engineering point | 1,332 | 1,145 | 295 | Matched climb-rate and installed-power evidence still needed. |

The data export links 35 original observation IDs, including four supplemental graph and table rows. Fleet evidence coverage is 63.62% primary, 64.15% with secondary evidence and 67.15% with calculations under the existing 13-variant rubric. The tested data addendum credits no new independent benchmark. [Coverage table](WW2_FIGHTER_SIM_INPUTS_V1.md)

## Regression against the starting revision

| Aircraft | Level-speed MAE, before and after (mph) | Climb-rate MAE, before → after (ft/min) |
| --- | ---: | ---: |
| Spitfire LF IX | 0.98 | 64.5 → 64.5 |
| Bf 109 F-4 | 3.56 | — |
| P-47B | 1.49 | 32.4 → 32.4 |
| P-51B | 0.38 | 188.7 → 188.7 |
| Fw 190 A-4 | 7.77 | 220.7 → 163.5 |
| P-38G | 0.88 | 173.3 → 173.3 |
| F4U-4 | 8.60 | 139.9 → 139.9 |

These are the existing implemented-model comparison groups. The four-aircraft operating scorecards match the frozen revision. The one Fw 190 live difference comes from Grok's concurrent application of the rounded 0.171 m² area on main. That application also reaches the benchmark Combat phase. The source case in this pack qualifies the area at the WNr 783 2,400 rpm / 1.32 ata condition. Wider rating use requires a source or a transfer test. [Live model change](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/compare/636d57c52...3512a9f4ad)

Run `node scripts/fighter-sim-inputs.cjs --check` to verify the export. Use `node validation/diagnostics/matched_climb_inputs.cjs` to replay the cases. The committed scorecard fixes the recorded snapshot. Replays on subsequent solver revisions can differ.
