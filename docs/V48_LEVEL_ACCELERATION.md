# v4.8 level acceleration

[Open the live comparison](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#operating-benchmark). Version 4.8.0-rc.1 is a research candidate.

The **Level acceleration** plot follows the selected altitude, aircraft, Normal or Combat power, fuel load, injection and turn/level cooling. The airspeed axis and hover or locked probe are shared with turn, advantage and climb. The horizontal coordinate is equivalent airspeed. The vertical coordinate is change in true airspeed per second, displayed in mph/s, km/h/s or kn/s with the selected speed units.

The existing level-flight solver supplies specific excess power, in metres per second. Multiplying that value by standard gravity and dividing by true airspeed in metres per second gives longitudinal acceleration in m/s². This is equivalent to dividing excess propulsive power by mass and true airspeed. A ring marks each aircraft’s high-speed zero crossing. The curve can extend into negative acceleration beyond that point. Samples below the modeled one-G stall or without available power data leave a gap. Power extrapolations carry the benchmark’s estimate label.

At 10,000 ft, dry Combat, 50% fuel and clean cooling, the **P-51B** gains **0.46 mph/s** at **335 mph EAS** while the **F4U-4** loses **0.50 mph/s**. Their maximum level speeds are 350.7 and 316.8 mph EAS respectively.

## Four-aircraft check

At 10,000 ft, dry Combat and 50% fuel, both versions reproduce the stall, peak sustained turn, climb and level-speed results below. The acceleration column uses 200 mph EAS, clean cooling and the same selected load and rating.

| Aircraft | One-G stall (mph EAS) | Peak turn (°/s) | Best climb (ft/min) | Max level (mph TAS) | v4.8 acceleration (mph/s) |
| --- | ---: | ---: | ---: | ---: | ---: |
| P-51B | 96.77 | 16.08 | 4,203 | 408.07 | +4.33 |
| P-47B | 108.35 | 13.63 | 2,798 | 370.38 | +3.37 |
| Bf 109 F-4 | 95.59 | 18.76 | 4,763 | 373.55 | +4.71 |
| Spitfire LF Mk IX | 85.16 | 19.26 | 4,705 | 380.32 | +5.07 |

The local replay compared 252 aircraft, altitude, rating and power-domain scenarios with v4.7. Every existing benchmark result matched. Acceleration at the solved level equilibria had an absolute residual under 0.000001 mph/s. The Node regressions compare the specific-power calculation against the net-force calculation and exercise cooling, stall and source-power gaps. The Chromium checks cover the shared axes and cursor, positive and negative values, unit conversion, equilibrium markers and pinned source links.

Each plotted value describes an instant at the selected level-flight state. Measured speed-time traces at matched loading, cooling and power are needed to assess historical acceleration error. The existing lift and climb fit and check splits are documented separately. Powered-turn validation and the historical 5:1 criterion remain open. [Four-aircraft scorecard](FLIGHT_SCORECARD.md) · [Climb fit and check rows](V43_MODEL_CHECKS.md) · [Turn evidence and sensitivity](V44_TURN_PERFORMANCE.md).

## Proposed major milestone

Build a timed acceleration run alongside timed climb. A useful first comparison is 180 to 300 mph EAS at 10,000 ft, with a power schedule that carries Combat and injection allowance through the run. Show elapsed time and whether each aircraft can reach the target. Use condition-matched historical speed-time intervals and powered steady-turn points to check the four benchmark profiles wherever the evidence permits. Start with the Mustang and Spitfire near 200 mph EAS, where the estimated turn lead can change across the current input bounds. The matchup view can then show which speed bands support a lead in acceleration, climb or sustained turn and where the evidence leaves the ranking open.
