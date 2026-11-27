# Fleet climb and acceleration accuracy

**4.20.0-rc.1 keeps the 4.19 operating calibration.** The extra-loss experiment reduced reserved climb error by 0.31 seconds per altitude interval. Both priority aircraft pairs still had much smaller climb leads in the model than in their trials. The four measured acceleration traces are now comparable at user-selected speeds, and the separate HF IX EN.524 climb is available in the flight-test selector.

## Experiment design

The control is v4.19 (f67443c). Compare a single shared induced-power factor of 1.10 to the ideal-disk factor of 1.00 in Profile P, holding input power, installations, drag, mass, and engine ratings fixed. The factor is an illustrative sensitivity, chosen before scoring. A nonideal disk requires more shaft power for the same thrust. Existing installed losses may already absorb some of this effect.

Reserve every P-38G B.4, P-47B B.3 and Spitfire HF IX clock, including the separate EN.524 transfer. Use all remaining matched aircraft clocks as the development set. Group the two P-47B power settings and the two BF.274 power settings within their respective reports. Score adjacent altitude intervals in seconds, then average the mean absolute errors of whole campaigns with equal weight. The selected flights were withheld from this experiment. Earlier simulator development had access to them.

Check the restored Mustang speed-time trace as a separate powered-flight proxy and the Finnish straight runs across all documented assumption scenarios. Score comparative results from the new multi-aircraft intake only when the specimens, ratings, units and flight phase permit it. The restored tests share one publication and several readings repeat earlier extractions.

Accept the factor only if both climb partitions improve, the acceleration proxy improves, previously reached comparison intervals remain attainable, and separate-airframe level speed and sustained-turn evidence support the change. Examine all 14 operating profiles at identical settings and report any pair reversals. Keep the existing operating solver when the evidence is mixed.

For the sensitivity run, disk thrust is 2ρA vᵢ(V + vᵢ) and retained shaft power is thrust times (V + κvᵢ). At κ = 1 the original disk equation is recovered. Finite-blade and wake losses motivate the direction of the test. The fixed 1.10 value is an assumption. Earlier empirical installation fits can already include induced losses. [NASA Contractor Report 3887, section 7](https://ntrs.nasa.gov/citations/19850014058)

## What the simulator now measures

The comparative intake contains 332 observations in 91 series from 12 publications linked across all 14 profiles. Figure 8 contributes 52 points across four aircraft. Sixteen readings overlap an earlier extraction, including the Mustang curve. The new comparison uses interpolation only between measured crossings and propagates the ±2 kt reading allowance at both ends. The report lists 10,000 ft MSL, 50 °F and maximum except takeoff power. All four traces come from the same investigation. [Comparative intake and coverage](research/FLEET_COMPARATIVE_DATA_2026-11-27.md) · [Ellis and Wheal, original Figure 8](https://www.wwiiaircraftperformance.com/com/others/endingtheargument_files/figure8.jpg)

| Restored test aircraft | 160–200 KIAS | Chart reading range | 200–230 KIAS |
| --- | ---: | ---: | ---: |
| P-51D 45-11586 | 31.5 s | 28.7–34.0 s | 40.0 s |
| F6F-5 BuNo 79683 | 37.2 s | 32.8–41.7 s | Outside the recorded trace |
| P-47D-40 45-49181 | 42.1 s | 34.3–50.0 s | Outside the recorded trace |
| FG-1D BuNo 92509 | 45.3 s | 40.0–50.7 s | 84.3 s |

The restored Mustang has a wartime power proxy, with allowances for unknown event mass and IAS error. The P-47D-40 had its turbocharger removed. The FG-1D has a different engine installation from the modeled F4U-4. The F6F-5 has no operating profile. The latter three traces provide direct measurements of those specimens. [Original study and conditions](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html)

## Whole-flight results

Each climb error below is the mean absolute deviation of adjacent interval times. The development and reserve totals average across campaigns, so a report with many chart points cannot dominate. EN.524 adds 20 usable intervals to the original 75. BS.551 and EN.524 are separate specimens with similar installations. Corrected airspeed at climb speed and exact engine power remain uncertain. [A&AEE EN.524, Table I](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitHFmkIX_EN524.html)

| Check | Points or intervals | Operating model | Extra loss test |
| --- | ---: | ---: | ---: |
| Climb, 11 development campaigns | 63 | 11.268 s | 11.081 s |
| Climb, 4 reserved campaigns | 32 | 4.591 s | 4.277 s |
| Mustang acceleration, two intervals from one flight | 2 | 8.677 s | 8.535 s |
| EN.524 level speed | 13 | 4.332 mph TAS | 4.158 mph TAS |
| Three earlier same-serial speeds quoted by A&AEE | 3 | 3.633 mph TAS | 3.585 mph TAS |
| Restored Mustang sustained load, one matched point | 1 | 0.942 g | 0.950 g |
| Finnish G-2 continuous turn, conditional transcription | 1 | 1.996 s | 2.079 s |

Nine campaigns improved and six regressed. Neither turn regression by itself resolves the aerodynamic cause. The change in the Mustang load error was 0.008 g against a ±0.1 g chart-reading allowance. The candidate also increased the Finnish 440–510 km/h acceleration error under all three scenarios with a completed interval. At 1,000 m, closed cooling and CAS, its time went from 134.91 to 154.04 s against 35 s reported. At the same height with speeds interpreted as TAS, it went from 38.27 to 38.63 s. The straight run's height and speed basis are unknown. This sensitivity and the small improvement in the primary climb comparisons argue against fleet adoption.

The Mustang proxy still accelerates too quickly. At 160–200 KIAS the model took 24.38 s, the candidate took 24.51 s and the chart gave 31.5 s. At 200–230 KIAS the corresponding times were 29.77, 29.92 and 40.0 s. The chart-reading allowance does not include uncertainty in the wartime-to-restored power and weight transfer.

The A&AEE summary checks replay X.4922 at 6,450 lb and BS.543 at 7,100 lb in the specified gears. X.4922 measured 375 mph TAS at 20,800 ft against 385.67 mph in the control. BS.543 measured 384 and 407 mph at its two full-throttle heights against 383.96 and 407.19 mph. They corroborate the earlier trial identities and carry no additional independent-flight count. [W.3134 report quoting X.4922](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVb_W3134.html) · [MA.648 report quoting BS.543](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLFMkIX_MA648.html)

## Aircraft scorecard

The first pair is flight-clock mean absolute error in seconds. The next two pairs are operating simulations at half fuel and dry Combat, sea level to 10,000 ft for climb and 180–250 mph EAS at 10,000 ft for acceleration. Each pair reads operating / experiment. The shipped values are the first numbers. The operating JSON includes all six metrics and the signed changes for every pair reversal.

| Aircraft | Clock bands | Clock error, s | Operating climb, s | Operating acceleration, s |
| --- | ---: | ---: | ---: | ---: |
| Spitfire LF Mk IXc | 1 | 0.38 / 3.33 | 117.3 / 118.9 | 19.0 / 19.1 |
| Bf 109 F-4 | 3 | 13.22 / 12.25 | 136.9 / 137.8 | 20.6 / 20.7 |
| P-47B Thunderbolt | 2 | 2.67 / 2.05 | 207.2 / 209.2 | 28.7 / 28.9 |
| P-51B-15 Mustang | 2 | 1.13 / 1.46 | 150.8 / 152.4 | 21.5 / 21.6 |
| Fw 190 A-4 | 3 | 22.94 / 21.87 | 154.4 / 156.0 | 28.7 / 28.9 |
| P-38G-1 Lightning | 7 | 4.33 / 4.47 | 172.4 / 173.2 | 29.3 / 29.5 |
| F4U-4 Corsair | 2 | 11.35 / 11.69 | 159.6 / 161.0 | 31.3 / 31.5 |
| Spitfire HF Mk IXc | 3 | 3.13 / 2.39 | 127.1 / 128.1 | 18.6 / 18.7 |
| Bf 109 G-2 | 5 | 7.01 / 7.66 | 149.3 / 152.2 | 25.3 / 25.5 |
| P-51D-15 Mustang | 3 | 17.66 / 17.34 | 154.8 / 156.2 | 22.2 / 22.3 |
| Spitfire F Mk IXc | 8 | 15.34 / 12.81 | 146.1 / 148.0 | 22.4 / 22.6 |
| Bf 109 G-6/Trop | 10 | 7.39 / 7.46 | 169.0 / 171.7 | 32.4 / 32.6 |
| Bf 109 E-3 | 7 | 15.69 / 14.79 | 178.2 / 181.6 | 28.1 / 28.2 |
| Spitfire Va | 19 | 11.84 / 11.23 | 190.1 / 192.6 | 30.0 / 30.2 |

The HF IX aircraft row uses BS.551. Its separate-aircraft EN.524 transfer gives 8.24 / 8.20 s across 20 intervals. All 91 aircraft pairs retained their numerical ordering for each of the six operating metrics at the reference settings. Stall speeds were identical. A difference smaller than source uncertainty cannot establish a historical ranking. The generated fleet-validation.json records each campaign, both Mustang proxy interval times, Finnish assumption scenarios, source URLs and missing coverage.

## Next 80/20 milestone

**Resolve the high-altitude climb errors across the fleet.** Of the 95 intervals, 34 start at or above 20,000 ft and account for 61% of summed absolute timing error. The largest 19 intervals account for 63%. This prioritizes observable time differences. Interval lengths and speeds vary, and the totals are distinct from the campaign-weighted score.

Start with separate climb and level power above full-throttle height, the actual supercharger gear-change height, open-radiator loss and the reported climb airspeed. Test one shared reconstruction on the existing roster. The Va reaches 36,000–37,000 ft in 87.84 s against 156 s observed. The EN.524 transfer takes 198.57 s from 38,000–40,000 ft against 147 s observed. Opposite errors make a common altitude multiplier a poor explanation. A&AEE reports actual boost, RPM, gear and airspeed by altitude, including three installations on the same EN.524. Those contrasts can distinguish a change in power schedule from a change in propeller losses. [EN.524 trial](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitHFmkIX_EN524.html) · [Four LF IX specimens and their throttle heights](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLFMkIX_MA648.html)

Keep both measured climb leads in the acceptance report. The Va led the E-3 by 63.63 s over 3,280–19,750 ft against 26.23 / 26.72 s. The G-2 led the G-6/Trop by 90 s over 5–8 km against 31.75 / 32.78 s. Acquire an additional wartime level-acceleration trace with recorded altitude, start and end speed basis, engine settings, cooling and mass. Give the original chart precedence, use secondary transcriptions for unresolved conditions, and keep IL-2/DCS comparisons in their own evidence grade. Report held-out improvement, changes in pair gaps and losses of coverage for the whole fleet in one release.
