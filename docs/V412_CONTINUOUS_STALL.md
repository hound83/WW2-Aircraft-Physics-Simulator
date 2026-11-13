# Continuous stall and usable maneuver lift

**v4.12.0-rc.1 · Fighter Sim Inputs v1.11.0.** The benchmark and the four-aircraft explorer use the continuous low-speed Mustang transfer. The Normal / Combat chart shows a provisional stall band and separate report checks. At the probe speed the lift ceiling shows aerodynamic load available before power and structural limits. [Frozen v4.11 before-scorecard](../references/analysis/v411-continuous-stall-before.json) · [Prior stall research](../references/research/PROVISIONAL_STALL_ENVELOPE_2026-11-12.md)

## Mustang transition

Keep the TN 1044 low-speed lift transfer in its existing 5,100–9,300 ft window and within the recorded Mach windows. Multiply the altitude and Mach weights and interpolate the lift coefficient toward the baseline coefficient. Apply a smoothstep over the inner **650 ft** and **0.01 Mach** at the respective edges. These widths are engineering choices. The altitude width follows the existing maneuver transfer. At each edge the correction and its slope go to zero. The higher-Mach maneuver model continues to use its own report window. [Source readings](../references/p51-turn-lift-tn1044.json) · [NACA TN 1044 Figure 6](https://ntrs.nasa.gov/citations/19930084610)

At fixed configuration, \(V_{s,EAS}=\sqrt{2W/(\rho_0 S C_{L,1g})}\) and \(n_{lift}=(V_{EAS}/V_{s,EAS})^2 C_{L,maneuver}/C_{L,1g}\). The G sweep checks both directions and the square-root weight relationship where the coefficient is fixed. The plotted band transfers the TN 1044 reading spread at the selected weight. Wright Field reports 86 mph IAS at 9,270 lb, 8,000 ft, clean with shutters closed and power off. Figure 1 does not establish a near-stall correction for that instrument installation. The archive also preserves the separate 43-6883 P-51B-5 case. [Wright Field §V.E](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) · [Mustang source records](../references/research/PROVISIONAL_STALL_ENVELOPE_2026-11-12.md)

P-51B-15 at 9,270 lb and 170 mph EAS. The maximum difference between adjacent one-foot samples at the two edges falls from **4.9313 to 0.000033 mph EAS**. At 8,000 ft the transferred stall remains 103.55 mph EAS with a 102.50–105.39 mph reading range.

| Altitude (ft) | Stall before (mph EAS) | Stall after (mph EAS) | Lift limit before (G) | Lift limit after (G) |
| ---: | ---: | ---: | ---: | ---: |
| 5,099 | 98.6236 | 98.6236 | 2.9712 | 2.9712 |
| 5,100 | 103.5548 | 98.6236 | 2.4386 | 2.9712 |
| 5,101 | 103.5548 | 98.6236 | 2.4386 | 2.9712 |
| 8,000 | 103.5548 | 103.5548 | 2.4000 | 2.4000 |
| 9,299 | 103.5548 | 98.6236 | 2.3792 | 2.9712 |
| 9,300 | 103.5548 | 98.6236 | 2.3791 | 2.9712 |
| 9,301 | 98.6236 | 98.6236 | 2.9702 | 2.9702 |

## Source-condition checks

| Case | Report speed | Modeled or replay value | Interpretation |
| --- | --- | --- | --- |
| P-38G-1 42-12690, clean power-off, approx. 14,800 lb and 10,000 ft | 98 mph IAS and 112 mph CAS, **111.86 mph EAS** after conversion | **112.37 mph EAS**, +0.50 mph | Reserved sister-airframe check. Retains its own pitot installation and approximate test loading. |
| F4U-4 NATC normal fighter, clean power-off, 12,500 lb | **89.4 kt CAS** | 102.88 mph EAS at assumed sea-level density | Existing clean lift anchor. Stall-run serial and altitude open. |
| F4U-4 NATC normal fighter, clean power-on, 12,500 lb | **84.6 kt CAS** | 97.36 mph EAS at assumed sea-level density | Original report corrects the 84.5 kt transcription. Powered anchor used as a sensitivity case, with exact power and run serial open. |
| F4U-4 NACA Ames, glide, approx. 12,100 lb and 8,000 ft | **105 mph CAS**, 104.91 mph EAS | **101.22 mph EAS**, −3.69 mph | Separate report and specimen. Glide at 15 inHg and 2,150 rpm. The error exceeds the ±3 mph reading allowance. |
| F4U-4 NACA Ames, power-on clean, approx. 12,100 lb and 8,000 ft | **95 mph CAS**, 94.94 mph EAS | **95.79 mph EAS**, +0.85 mph | Separate report and specimen. 48 inHg and 2,600 rpm. |

The Navy anchors reproduce their source speeds by construction. The two Ames results check weight-scaled Navy coefficients with differing test installations and engine states. Their ±3 mph allowance is a chart-reading judgment. The P-38G and Ames data were reserved from this implementation. [P-38G Wright Field memo](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G_42-12690_FS-M-19-1492-A.pdf) · [NATC A.3](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf#page=5) · [NACA RM A7C05](https://ntrs.nasa.gov/citations/20050081862)

## Seven-aircraft regression

Dry Combat, 50% internal fuel, 10,000 ft. Lift ceiling and sustained turn sampled at 200 mph EAS. Values below reproduce the before-scorecard at the shown resolution. The full replay includes 84 steady rows, 42 timed accelerations and 14 timed climbs. It compares level speed, climb, stall, instantaneous and sustained turn, and elapsed times. It includes the four original profiles and the Mustang edge cases where the lift result intentionally changes.

| Aircraft | Load (lb) | Model stall (mph EAS) | Lift ceiling (G) | Sustained turn (°/s) | Clean reference |
| --- | ---: | ---: | ---: | ---: | --- |
| Spitfire LF Mk IX | 7179 | 85.16 | 5.52 | 15.66 | 86 mph IAS · family handbook, 7,445 lb |
| Bf 109 F-4 | 6054 | 95.59 | 4.38 | 16.57 | 159 km/h EAS · calculated, assumed lift |
| P-47B | 11705 | 108.35 | 3.41 | 11.97 | 105 mph IAS · report summary 12,565 lb |
| P-51B-15 | 8925 | 96.77 | 3.13 | 15.99 | 86 mph IAS · 43-24777, 9,270 lb, 8,000 ft |
| Fw 190 A-4 | 8117 | 107.30 | 3.47 | 13.00 | 177 km/h EAS · calculated, assumed lift |
| P-38G-1 | 14333 | 110.58 | 3.27 | 14.58 | 112 mph CAS · 42-12690, approx. 14,800 lb |
| F4U-4 | 11898 | 100.37 | 3.97 | 12.21 | 89.4 kt CAS · Navy clean power-off, 12,500 lb |

The solid portion of a performance curve still denotes a source-supported limiting input. The Mustang’s low-speed lift-limited interval is dotted. A supported power-limited interval keeps its solid style. Read the band's own source, speed basis and reading range in the tooltip. The P-38G and Corsair markers appear at their report altitudes and retain report loading in the label. Select 8,000 ft and Full envelope for the mixed Mustang example. The benchmark altitude sliders now use 1,000 ft steps, with the original 5,000 ft overview rows. [Existing graph rules](V46_CHART_DATA.md) · [Fleet stall references](research/WW2_FLEET_STALL_INPUTS_2026-11-12.md)

Run `npm run check` and `npm run test:browser`. The Physics regression artifact includes `validation/current/continuous-stall.json`, with original observation IDs, source-condition residuals and the seven-profile before/after. The sweep models quasi-steady lift. Historical powered sustained-turn accuracy and post-stall handling remain open.
