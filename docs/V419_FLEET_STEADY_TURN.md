# Fleet sustained level turns · 4.19.0-rc.1

At 10,000 ft and 210 mph EAS, 13 of the 91 aircraft pairings retain a lead above 0.5°/s under the existing lift, power and drag sensitivity assumptions. The other 78 have overlapping or practically indistinguishable results. This is a calculation at a flight condition. A different speed, altitude, weight or rating can change the ordering. [Open the simulator](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#bench-steady-turn)

## Comparing aircraft

Choose a common equivalent airspeed and altitude. Choose both Normal, both dry Combat, or the two aircraft’s existing settings. Each engine has its own RPM, boost and shaft output at the selected rating. The default uses the selected fuel load in each aircraft. “Same gross weight” uses the intersection of the two supported 25–75% fuel ranges. For example, 9,120 lb is available to both Mustangs. The P-47B and P-51B have no intersection. The fleet table compares all fourteen aircraft at half fuel and the same speed, altitude and rating.

The model checks power available against drag in a level turn, then applies the lift and structural limits. At a power-limited equilibrium the excess power is zero. At a lift or structural limit the engine can retain a power margin. The displayed time is 360° divided by the steady rate at the fixed weight. A rating shorter than a full circle is flagged. The envelope uses ±10% maneuver lift, ±5% useful power and ±15% drag added above 1 g, expanded by an existing source lift bracket where applicable. These are engineering perturbations. They carry no probability or historical accuracy percentage. [Existing force balance](../src/turn-performance.js)

## Fleet acceptance

Half internal fuel, clean cooling, dry Combat, standard atmosphere. The original seven operating profiles and seven provisional intake profiles use the same equilibrium calculation. Each row gives the 4.18 fleet diagnostic and the 4.19 comparison at the same condition. Different model inputs can give a wider range than the printed precision.

| At 10,000 ft and 210 mph EAS | 4.18 °/s | 4.19 °/s | 360° (s) | Input sensitivity (°/s) | Limiting factor |
| --- | ---: | ---: | ---: | ---: | --- |
| Spitfire LF Mk IXc | 15.01 | 15.01 | 24.0 | 13.5–16.9 | power |
| Bf 109 F-4 | 15.85 | 15.85 | 22.7 | 14.2–17.8 | power |
| P-47B Thunderbolt | 11.46 | 11.46 | 31.4 | 10.2–12.9 | power |
| P-51B-15 Mustang | 15.58 | 15.58 | 23.1 | 14.0–17.5 | power |
| Fw 190 A-4 | 12.37 | 12.37 | 29.1 | 11.0–14.0 | power |
| P-38G-1 Lightning | 13.88 | 13.88 | 25.9 | 12.4–15.7 | power |
| F4U-4 Corsair | 11.59 | 11.59 | 31.1 | 10.4–13.1 | power |
| Spitfire HF Mk IXc | 17.52 | 17.52 | 20.5 | 15.7–19.7 | power |
| Bf 109 G-2 | 14.21 | 14.21 | 25.3 | 12.7–16.0 | power |
| P-51D-15 Mustang | 13.95 | 13.95 | 25.8 | 12.5–15.7 | power |
| Spitfire F Mk IXc | 16.11 | 16.11 | 22.3 | 14.4–18.2 | power |
| Bf 109 G-6/Trop | 12.42 | 12.42 | 29.0 | 11.0–14.1 | power |
| Bf 109 E-3 | 14.99 | 14.99 | 24.0 | 13.4–16.9 | power |
| Spitfire Va | 15.41 | 15.41 | 23.4 | 13.7–17.4 | power |

Across sea level, 10,000 and 20,000 ft and 150, 210 and 270 mph EAS, 124 of 126 aircraft conditions sustain a turn. In the 20,000 ft / 270 mph case the E-3 and G-6/Trop lack sufficient power. Across 819 pair/condition combinations, 149 leads clear the engineering ranges, 645 remain uncertain and 25 include an unavailable aircraft. The selected point for all 14, all 84 established fleet output cells and the separate HF IX EN.524 speed holdout retain their 4.18 results. [Four reference-aircraft speed and climb checks](V418_FLEET_COMPARISON.md#four-reference-aircraft-and-independent-evidence)

## Evidence and comparisons

**Primary flight test.** Ellis and Wheal tested four restored aircraft at 10,000 ft MSL and METO. Figure 9 plots normal load against indicated knots. Read the centers of the distinct markers against 50-knot and 1 g grid steps. Use ±2 kt and ±0.1 g for reading precision. Seven loaded markers can be associated with individual symbols without resolving the overlapping cluster at 180 KIAS. The remaining markers were not used. Figure 10 describes a different, wind-up maneuver. [Figure 9 and Figure 10](https://www.wwiiaircraftperformance.com/com/others/endingtheargument_files/figure9-10.jpg) · [Test account and configurations](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html)

| Restored aircraft | Figure 9 marker readings (KIAS, g) | Use in the simulator |
| --- | --- | --- |
| P-47D-40 45-49181 | 130 kt / 2.8 g, 180 kt / 2.2 g, 200 kt / 2.0 g | different variant; turbocharger removed and pylons fitted |
| FG-1D Bu 92509 | 150 kt / 2.4 g, 210 kt / 2.7 g | different Corsair variant; pylons fitted |
| F6F-5 Bu 79683 | 150 kt / 3.5 g | outside operating roster |
| P-51D 45-11586 | 130 kt / 3.1 g | related restored D, V-1650-9; wartime profile uses V-1650-7 |

At 130 KIAS the chart places the restored Mustang at approximately 3.1 g and the Thunderbolt at 2.8 g. The authors describe enough scatter that they could not confidently rank the Mustang, Thunderbolt and Corsair overall. The wartime Mustang proxy returns 2.16 g at 8,900 lb, using Normal 46 inHg / 2,700 rpm, ISA and IAS approximated by CAS. Its nominal shortfall is 0.94 g. The run mass, engine installation and instrument correction limit attribution. This result was reserved from fitting.

**Secondary wartime account.** MT-215 completes a reported horizontal 360° in 22 s at 1,000 m, with 360 km/h IAS at entry and exit. Under the source-specific assumptions, the model gives 24.0 s with clean cooling and 26.2 s with open cooling. Two accounts share one trial. Intermediate speeds, actual mass, cooling and exact rating remain open. [Transcribed test](https://forum.il2sturmovik.com/topic/6315-bf109g-2-turn-and-accelerationdeceleration-data/) · [Earlier residual and sensitivity analysis](V414_POWERED_TURN_REPLAY.md)

**External simulation.** The source register holds 24 published IL-2 speed/time points associated with 12 roster profiles. Ten records use the publisher’s aircraft museum and two use a community mirror of the IXe specifications. Different variants retain their own names. For the F-4 and G-2 we can also match the published standard mass, RPM and manifold setting and approximate IAS as CAS. Their gap can be compared on the selected-pair screen. Existing F-4 assumptions include game-derived information. These comparisons do not supply independent flight-test validation. [F-4](https://il2sturmovik.com/museum/fighters/bf-109-f-4/) · [G-2](https://il2sturmovik.com/museum/fighters/bf-109-g-2/) · [Full source register](../references/analysis/m4-steady-turn-sources.json)

| At 270 km/h IAS | F-4, IL-2 / model | G-2, IL-2 / model | F-4 lead, IL-2 / model |
| --- | ---: | ---: | ---: |
| 0 m | 20.3 / 17.5 s | 22.2 / 18.2 s | 1.9 / 0.7 s |
| 3,000 m | 26.1 / 20.3 s | 28.3 / 21.6 s | 2.2 / 1.3 s |

**Research priority.** Seek powered, level, constant-speed load or clock series covering several aircraft, with run mass, speed basis and installed power. The restored Mustang proxy turns too slowly against its Figure 9 marker, while the two German profiles turn more quickly than their external simulation equivalents. A common drag change has no independent support from these comparisons. NACA’s F2A-3 report supplies a primary example of multi-speed comparisons across flap settings and altitudes on a type outside this roster. [NACA WR W-6](https://ntrs.nasa.gov/citations/19930092640)

The interactive comparison and generated scorecard call the same point solver. Run `npm run check` and `npm run test:browser`. The fleet grid, source conditions and model replays are under `steadyTurn` in `dist/fleet-validation.json`.
