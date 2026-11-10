# Stall test replay and turn sensitivity

Baseline `de7571531ea21fa5f9231ea279623775c68b444b` (v3.15). Run `node validation/diagnostics/stall_test_replay.cjs` or `npm run check` to regenerate `validation/current/stall-test-replay.json`. This is a diagnostic outside the calibration and historical accuracy score. The four benchmark profiles, including the bounded Mustang lift correction, use their existing coefficients.

## P-47D-30 43-3441

[NACA RM L8A06](https://ntrs.nasa.gov/api/citations/20090022749/downloads/20090022749.pdf), Figs. 48-51, records service indicated airspeed and body-normal acceleration on the same time axis. The [transcription](../../references/p47d30-stall-replay.json) identifies the exact windows, one-based PDF pages and exclusions. The [existing archive](../../references/research/stall_four_track_followup_2026-11-10.json) supplies original flight-run gross weight, altitude, CG and controls. The weights are caption values. Instantaneous weight and the exact first stall sample are unknown. Both 5,000-ft clean configurations have gear and flaps up and the canopy closed. The report lists 42.5 inHg/2,550 rpm for the low-altitude powered condition, rather than a time series for engine output. The high-altitude glide is a separate check.

| Fig. / condition | Source run lb / ft | Read service IAS mph / normal g | Scenario CN at zero offset, midpoint | CAS minus IAS needed for 1.30, mph |
| --- | --- | --- | ---: | ---: |
| 48 / powered clean | 12,570 / 5,000 | 98-104 / 0.80-0.94 | 1.40 | -3.5 to +10.9 |
| 49 / clean glide | 12,400 / 5,000 | 113-119 / 0.95-1.07 | 1.21 | -10.2 to +2.4 |
| 50 / clean glide, same-report repeat | 12,400 / 5,000 | 109-119 / 0.85-1.00 | 1.15 | -16.1 to +2.6 |
| 51a / high-altitude clean glide | 12,770 / 24,000 | 120-127 / 0.90-1.05 | 1.08 | -19.2 to -3.5 |

The final column inverts the lift equation for the P-47B's assumed coefficient of 1.30 using the D-30's Table I area of 300 sq ft and the caption weight. The endpoints combine the outer speed and g values, so they are conservative scenario bounds and may combine different instants. Forward scenarios evaluate assumed offsets of -10, -5, 0, +5 and +10 mph before ISA conversion from CAS to EAS. For Fig. 49 the midpoint CN goes from 1.45 to 1.03 over that sweep. CN uses the recorded body-normal load and includes effects that the wing lift coefficient alone does not capture. The difference between the low- and high-altitude windows could reflect the speed channel, Mach, handling or the chosen onset. No altitude correction was fitted. The D-30 results also cannot identify a correction for the B.

[NACA TN 2675, printed pp. 3-4](https://ntrs.nasa.gov/api/citations/19930083825/downloads/19930083825.pdf) documents a right-wingtip swiveling static head and shielded total head and low-speed formation calibration against a trailing-head reference. It defines position-corrected CAS for that report. RM L8A06 refers to the companion instrumentation but labels the plotted speeds service indicated. A numerical correction bracketing the stall readings, or confirmation that this specific channel was already corrected, remains missing. [TN 2899](https://ntrs.nasa.gov/api/citations/19930083857/downloads/19930083857.pdf) supersedes the same experiment. Figures 28-32 of RM L8A06 record control force and deflection during turns. Figs. 58-59 are accelerated stall traces. Neither group establishes a maximum sustained-turn point at known maximum power.

## What to change if the evidence improves

The [Spitfire VA](https://ntrs.nasa.gov/citations/19930092581) reported clean glide CLmax 1.15-1.18 and powered cruise 1.63-1.68. Using the covered-gunport pair to predict the open-port pair gives mean absolute coefficient error 0.040 with separate states, versus 0.265 with the mean of the same two training values. The covered-port powered climb row (1.64 at 43.9 inHg/2,850 rpm) differs by 0.01 from the powered cruise value (1.63 at 36.9 inHg/2,650 rpm). This is a same-report check of separating flight states. It cannot identify a continuous power-to-lift relationship or supply an LF IX coefficient. The independent [F6F-3 experiment](https://ntrs.nasa.gov/citations/19930092602) supports the direction of the power-state difference, with fuel-adjusted peak CN of 1.35-1.45 clean glide and 2.10-2.20 clean powered climb. The magnitudes cannot be transferred across aircraft or directly substituted for wing CLmax.

| P-47B at 5,000 ft, 12,565 lb, military rating | Sustained deg/s at CLmax 1.15 / 1.30 / 1.45 | Limit at baseline |
| --- | ---: | --- |
| 130 mph EAS | 5.73 / 8.02 / 9.98 | Lift |
| 150 mph EAS | 9.51 / 11.50 / 13.39 | Lift |
| 170 mph EAS | 12.11 / 13.95 / 13.95 | Power |
| 200 mph EAS | 12.57 / 12.57 / 12.57 | Power |

The sweep uses the current shared solver, profile P, with fixed power and drag. The bounds are engineering scenarios. A separate powered lift limit is a candidate for a specific aircraft and clean condition once corrected airspeed, mass, normal load, manifold pressure and RPM are matched at multiple points. Interpolate a qualified calibration between bracketing anchors for the same instrument and configuration. A smooth powered-lift curve needs additional measured states, preferably referenced to propeller thrust or disk loading, and an unused check. Extrapolating a high-speed instrument curve or fitting an aircraft-wide CLmax to these traces would hide the speed-channel and power-state ambiguity. At the power-limited end, validate installed propulsion and turning drag before adjusting lift. The diagnostic adds zero qualified maximum sustained-turn observations and leaves 5:1 unresolved.
