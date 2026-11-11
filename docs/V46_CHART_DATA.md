# v4.6 chart data and pinned tooltips

[Open the benchmark](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#operating-benchmark).

- **Speed axis** starts at zero and ends at the next multiple of 10 above the highest modeled level speed in the selected EAS unit. Turn, climb and advantage share that axis. The default turn lines begin and end at 3°/s. Full envelope extends them to their physical endpoints. Squares mark peak turn rate and Vy.
- **Line styles** describe the evidence for the calculation. A solid turn segment uses the applicable NACA maneuver-lift input when lift limits the turn, or a table-supported engine branch when power limits it. The power coverage includes Mustang WEP, Thunderbolt military and rated power in their tabulated domains, Lightning military power and the Corsair’s dry normal and military lower blower branches. The Corsair high-blower speed residual and the Spitfire boost-to-BHP proxy keep those turn sections dotted. Solid climb segments follow the matching open-cooling test schedule. Sustained-turn rates still use modeled propeller, lift and drag behavior.
- **Shading** shows the Mustang and Spitfire turn input sensitivities with any opponent. The advantage band needs bounded inputs for both aircraft. Choose Mustang vs Corsair at 10,000 ft, dry Combat, 50% fuel to see the Mustang’s turn band and the two evidence styles.
- **Pinned tooltip** stays visible with clickable sources. Click the plot again or drag at least 16 CSS pixels on a plot to resume hover. The Unlock speed button and Escape also release it.

## Climb bands from the 13-fighter pack

The graph matches the original P-47B and Spitfire rows by aircraft, altitude, rate and applicable climb branch. The source bounds keep the reported cooling and power schedule. At each covered airspeed, the graph adds the difference between the current climb estimate and the model replay at the reported load and speed to both source bounds. The plotted line remains the model estimate and the tooltip flags a residual outside the projected band.

At 10,000 ft, dry Combat, 50% fuel and 170 mph EAS, the P-47B and Spitfire both display a report-adjusted climb range.

| Aircraft | Original test rate and load | Modeled climb at selected conditions | Report-adjusted range |
| --- | ---: | ---: | ---: |
| P-47B 41-5902 | 2,465 ft/min at 12,565 lb | 2,745 ft/min | 2,728–2,778 ft/min |
| Spitfire BS.543 | 4,280 ft/min at 7,485 lb | 4,469 ft/min | 4,508–4,558 ft/min |

The ranges carry the table reading or local interpolation margin through the model’s load and speed correction. They cover part of the uncertainty. The source pack’s power-off stall, cooling-drag and elapsed-climb calculations retain their original conditions. [Source data and qualifications](research/WW2_FIGHTER_CALCULATED_EVIDENCE_2026-11-11.md) · [Fit and held-out flight checks](V43_MODEL_CHECKS.md) · [Sustained-turn assessment](V44_TURN_PERFORMANCE.md).
