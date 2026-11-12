# v4.10 clean-flight propeller reference

The **4.10.0-rc.1 research candidate** applies the Fighter Sim Inputs v1.5 clean-level reference in the shared Normal / Combat calculation. The solver resolves shaft power as before, then blends the paired useful-power fraction and clean drag coefficient over the relevant high-speed envelope. Pinned turn and acceleration readouts link to the source when the reference is active. [Live comparison](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#operating-benchmark) · [Input research](research/WW2_FLEET_PROPELLER_INPUTS_2026-11-12.md)

| Application | Useful-power fraction | Drag anchor and full reference range |
| --- | --- | --- |
| F4U-4 BuNo 80765, dry Normal and Military | 80% | Sea-level Normal at 12,500 lb, 322.22 mph TAS and 1,700 chart BHP. The inferred clean CD0 is 0.01726788. Normal spans 0–31,900 ft at 2,600 rpm and Military spans 0–29,000 ft at 2,800 rpm, with advance ratio 1.80–2.50. |
| P-47B 41-5902, dry Military | 80% at tip Mach 0.979 through 76% at 1.035, linear between the two nodes | 5,000 ft at 12,565 lb, 352 mph TAS and 2,000 measured BHP. The inferred clean CD0 is 0.01888452. The scope is 5,000–34,000 ft at 2,700 rpm, with advance ratio 1.85–2.35. |

The 1,000-ft and 0.25-advance-ratio edge widths are smooth engineering transitions. The prior model supplies low-speed, open-cooling and water-injected states. Each CD0 is a single-point power-balance fit. The Corsair 80% value is a working installed estimate. The Thunderbolt curve transfers the two rounded Curtiss 714 readings on the same blade family. [Navy F4U-4 production inspection trials, pp. 8–11](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf) · [NACA L4L07 Table II](https://ntrs.nasa.gov/citations/19930093302) · [Wright Field 41-5902 and 41-5942](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html)

## Flight-test checks

All speed errors below are mean absolute error in mph TAS at reported gross weight and RPM. The fixed-shaft replay uses the corresponding report BHP. The native-power replay uses the live shaft-power schedule. Fit points are excluded. The same-report rows were already available during the research and remain out of the single-point drag fit. 41-5942 is a separate aircraft and report.

| Series | Points | Before | After |
| --- | ---: | ---: | ---: |
| F4U-4 BuNo 80765, fixed chart power | 7 | 7.38 | 3.10 |
| F4U-4 BuNo 80765, live shaft power | 7 | 12.37 | 8.60 |
| P-47B 41-5902, torque-meter power | 5 | 0.81 | 1.49 |
| P-47B 41-5942, independent speed replay | 3 | 2.37 | 2.11 |

At 29,000 ft Military power the Corsair report gives 443.05 mph. The fixed-chart result improves from 427.02 to 438.08 mph. The live power schedule improves from 419.00 to 428.52 mph and uses 1,710 BHP at that state against about 1,800 BHP in the chart. At 23,100 ft the model also uses 1,710 BHP against about 1,900 in the chart. The two readings carry roughly ±50 BHP digitization allowances. The remaining high-altitude errors motivate a targeted power and gear review.

The P-47B same-airframe speed error rises by 0.68 mph. The separate-airframe score improves by 0.26 mph. The positive case for the update rests on the same-blade measurements and comparable speed residuals. The 76% military-climb alternative scored 69 versus 32 ft/min on the five 41-5902 climb checks, and 88 versus 78 ft/min on the five independent 41-5942 climb checks. The published climb calculation uses the existing report-conditioned fit. The eight Corsair maximum-climb diagnostics reproduce their previous values, including a 371 ft/min shortfall at 25,500 ft Military. Those Corsair replays use the model's best-rate speed at the report's gross weight. [Propeller and climb replay details](research/WW2_PROPELLER_REFERENCE_VALUES_2026-11-12.md)

## Seven-aircraft operating replay

The baseline is `67ba5573bc5aa2cec55b547305e9c72fef38bb50` and data version 1.5. The scorecard runs 84 dry steady cases, 42 timed accelerations from 180 to 300 mph EAS and 14 timed climbs from sea level to 10,000 ft, all at 50% internal fuel. The four original benchmark aircraft are included.

| Aircraft | Largest level-speed change in grid | Largest change in a completed timed acceleration |
| --- | --- | --- |
| F4U-4 | 411.45 → 417.94 mph TAS at 30,000 ft Normal | 150.49 → 159.70 s at 10,000 ft Normal |
| P-47B | 429.83 → 431.38 mph TAS at 30,000 ft Combat | 81.28 → 85.70 s at 10,000 ft Combat |
| Bf 109 F-4, Fw 190 A-4, P-51B, P-38G and Spitfire LF IX | 0.00 mph | 0.00 s |

The grid produces zero changes in stall EAS, maximum climb, timed climb, peak instantaneous turn, peak sustained turn or availability. At 10,000 ft the Corsair Combat acceleration changes from 91.68 to 96.16 s. At 335 mph EAS the same Combat model decelerates at 0.415 mph/s, compared with 0.499 mph/s before. The paired power and drag fit changes the excess power along the run, including below maximum speed. These elapsed times are model results. Matched historical speed-time and powered-turn validation remain open.

At 29,000 ft Combat the nominal Corsair/Thunderbolt result is a practical tie at 431.54 and 433.78 mph TAS. Shifting each reference by ±2 efficiency points at fixed fitted drag gives 426.93–436.03 and 428.89–438.55 mph respectively. Either aircraft can lead under the tested opposing assumptions. The engineering range provides a sensitivity check for this comparison. Historical 5:1 discrimination remains unresolved. [Practical matchup margins](V49_TIMED_MATCHUPS.md#practical-ties-and-chart-evidence)

## Reproduce the checks

Run `npm run check` and `npm run test:browser`. The numeric replay is `validation/current/propeller-reference-v410.json` in the Physics regression artifact. It includes before-and-after per-aircraft rows, separate fit/check roles, the matched shaft/useful/drag power at the reported speeds and the tested sensitivity. The [frozen comparison](../references/analysis/v410-propeller-before.json) records the baseline and column definitions.
