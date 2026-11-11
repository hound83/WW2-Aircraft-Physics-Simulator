# v4.9 timed performance and practical comparisons

[Open the comparison](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#operating-benchmark). This is a research candidate.

## Equal-start runs

**Time to accelerate** uses one altitude and one EAS interval for both aircraft. Each starts at its selected fuel load and rating. The level-flight solver supplies the speed gain from available propulsive power minus drag. The midpoint integration consumes fuel and injection fluid and carries the selected rating time forward. Combat begins at the start of the run. When injection runs out, dry Combat uses the remaining shared allowance. Normal or continuous power takes over when the higher rating expires. The plot marks rating changes and the last reached speed.

**Time to climb** opens by default and plots altitude against elapsed time from the winning solver replay. The separate start and target altitudes and fuel and rating readouts remain available. Its original numerical regression uses the same solver results.

## Practical ties and chart evidence

The comparison uses 0.5°/s for sustained turn, 5% of the two values’ mean for climb rate and elapsed time, and 6 km/h for level TAS. The G plot uses the turn-rate margin at the shared speed. For peak G across altitude, the two load factors are expressed as turn rates at the mean of the speeds of their peaks for the tie check. A named, coloured lead appears outside the margin. The comparison strip checks the complete tested difference against the same margin and indicates whether the outcome can change. The plotted engineering bounds carry their documented input assumptions.

The solid style denotes a source-backed operating input, with primary values and independently combined secondary values eligible. The dotted style denotes calculated or provisional operating inputs. For example, the Mustang’s source-backed 67 inHg power branch appears solid on the clean acceleration plot. The Spitfire uses boost-derived shaft power. In climb, open circles identify original observations and the tooltip describes the boost-derived input and report-adjusted range. The BS.543 test point at 10,000 ft is 4,280 ft/min at 199 mph TAS, 7,485 lb takeoff mass and open radiator flaps. [A&AEE Table II](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)

## Four-aircraft replay

Clean, dry Combat at 10,000 ft and 50% internal fuel. Existing stall, turn, climb and speed values below are reproduced from v4.8. Timed runs go from 180 to 300 mph EAS.

| Aircraft | Stall (mph EAS) | Peak sustained turn (°/s) | Best climb (ft/min) | Max level (mph TAS) | Time (s) |
| --- | ---: | ---: | ---: | ---: | ---: |
| P-51B | 96.77 | 16.08 | 4,203 | 408.07 | 49.53 |
| P-47B | 108.35 | 13.63 | 2,798 | 370.38 | 81.28 |
| Bf 109 F-4 | 95.59 | 18.76 | 4,763 | 373.55 | 56.89 |
| Spitfire LF Mk IX | 85.16 | 19.26 | 4,705 | 380.32 | 49.34 |

The Mustang and Spitfire times differ by 0.18 s, or 0.37% of their mean. Reducing the integration step from 0.5 s to 0.25 s changes each result by under 0.003 s. The regression also exercises rating and fluid exhaustion, source gaps, a below-stall start, and a target beyond the usable power range.

## Historical checks

The archived 43-24777 Wright Field report supplies level equilibrium and climb under stated racks and ratings. The BS.543 A&AEE report supplies elapsed altitude changes on an open-radiator climb. These observations support their original conditions. A matched constant-altitude speed-time record for the 180 to 300 mph EAS replay remains an open source requirement. NACA TN 1044 supplies maneuver-lift inputs and held-out sections of the same chart. The separate P-47B and Spitfire report checks retain their fit and held-out roles. Powered-turn validation and 5:1 discrimination remain open. [Wright Field report](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) · [BS.543 test](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [Lift and turn checks](V44_TURN_PERFORMANCE.md) · [Climb validation](V43_MODEL_CHECKS.md).
