# Calculated evidence for 13 WWII fighters

The third coverage score combines the previous augmented score with limited credit for newly usable calculations. Average coverage rises from **71.46% to 74.31%**, a gain of **2.85 percentage points**. The German average rises from **70.25% to 72.75%**, a gain of **2.50 points**. The two historical columns preserve the previous scorecard, including the derivations already credited there. Coverage scores reflect the breadth and quality of the available inputs and include analyst judgment.

The [machine-readable evidence pack](../../references/analysis/fighter-derived-evidence-2026-11-11.json) includes 23 plots, 10 calculation tables, 138 calculated curve points, 94 scenario curve points and 95 checks or source comparisons. These counts describe data products. Several estimates reuse the same historical trial. The evidence pack sits outside the simulator’s calibration inputs.

| Aircraft and reference specimen | Primary | Historical augmented | With calculations | Gain | Most useful new constraint |
| --- | ---: | ---: | ---: | ---: | --- |
| F4U-4 80765 | 83% | 88% | 91% | +3 pp | Clean accelerated lift bound from a CAS anchor and a sea-level normal/military net-power comparison |
| P-51B-15 43-24777 | 72% | 79% | 84% | +5 pp | Actual-weight IAS sensitivity and matched rack drag at three altitudes |
| F6F-3 04776 | 79% | 84% | 87% | +3 pp | Clean and landing EAS envelopes using NACA’s fuel-corrected normal-force coefficients |
| Spitfire LF IX BS543 | 62% | 73% | 74% | +1 pp | Blower-specific climb power and a check against the published elapsed time |
| P-47B 41-5902 | 64% | 68% | 71% | +3 pp | Effective drag for five measured cooling configurations |
| P-38G-1 42-12687 | 62% | 69% | 73% | +4 pp | Effective drag and L/D at 13 part-power operating points |
| Fw 190 D-9 WNr 210002 | 61% | 73% | 75% | +2 pp | Exact-specimen net climb power and a separately identified Rechlin cooling comparison |
| Fw 190 A-4 WNr 783 | 63% | 70% | 73% | +3 pp | Open/closed cooling-flap power and missing elapsed climb |
| P-40F 41-13635 | 49% | 58% | 62% | +4 pp | Seven matched belly-brace drag cases and three standard-spinner propeller curves |
| Ki-84-I T-2 302 | 50% | 54% | 56% | +2 pp | Indicated stall sensitivity, turn-geometry cross-check and period handbook climb timing |
| P-47D-30 43-3441 | 64% | 75% | 77% | +2 pp | Matched left/right controls and two interpretations of the unknown turn-speed basis |
| Bf 109 F-4 DB 601 E | 53% | 64% | 66% | +2 pp | Factory landing coefficient versus mass and an independent elapsed-climb comparison |
| Bf 109 G-2 DB 605 A | 65% | 74% | 77% | +3 pp | Original Finnish climb chart, captured-airframe low-speed sensitivity and a family drag reference |
| **Fleet** | **63.62%** | **71.46%** | **74.31%** | **+2.85 pp** | |
| **German aircraft** | **60.50%** | **70.25%** | **72.75%** | **+2.50 pp** | |

## Findings that affect how the data should be used

- **Finnish G-2, 10,000 m.** The previous mapping of the English table gave 2.1 m/s and 10.9 min at 10 km. That mapping implies 252 s from 9 to 10 km by integrating the rates, compared with 90 s from its elapsed column. Page 16’s original curves give approximately **5.3 ±0.5 m/s** and **12.0 ±0.2 min** at 10 km. The original graph’s rates imply **154 s** from 9 to 10 km, compared with **156 s** from the original elapsed curve. The six digitized samples cover 5–10 km. The underlying original table is still needed to settle the HTML alignment. Use the original curve for the upper climb schedule and keep the conflicting secondary table values visible. The actual 2,540 rpm comes from the trial narrative. The level-speed trace retains the recorded 1.30–1.32 ata branch and the falling-boost branch. [Original Finnish curves](https://wwiiaircraftperformance.com/org/me109/g/g_files/me-109g2-finn.pdf) · [Original page 16 image](http://kurfurst.org/Performance_tests/109G_MT215/MT-215_climb.jpg) · [Scan hashes and retrieval record](../../references/source-recovery-manifest-2026-11-11.json)
- **Fw 190 A-4, WNr 783.** With open cooling flaps, the digitized elapsed trace ends at 9,000 m. Integrating the documented open-flap rates gives about **5:00** more to 10,000 m. The 9,000 m point is shared by the solid original trace and the dotted continuation. The original compared open and shut cooling flaps at 2,400 rpm on the same installation. [Fw 190/783 report 1, chart 2](https://www.wwiiaircraftperformance.com/org/fw190/a4/a4_files/Fw_190_783_Nr1.pdf)
- **Bf 109 F-4.** Interpolating the November 1941 factory sheet yields **4:00 from 1,000 to 5,000 m**. The independent December Rechlin report gives **4:00** as well. Both leave the boost and RPM open. The factory’s later landing coefficient implies **139.5 km/h EAS** at 2,560 kg. The 1941 landing figure at that mass is **135 km/h** on an unresolved speed basis. The comparison preserves that 4.5 km/h difference and keeps the two speed definitions visible. [1941 factory sheet](https://web.archive.org/web/20141110152256im_/http://www.beim-zeugmeister.de/zeugmeister/uploads/pics/_LW_A0001_B015.jpg) · [Rechlin comparison](https://web.archive.org/web/20160323022642im_/http://www.beim-zeugmeister.de/zeugmeister/uploads/pics/_LW_A0001_B008.jpg) · [German source register](../../references/research/ww2_german_fighter_archive_2026-11-11.json)
- **F4U-4.** The source’s **89.4 kt CAS** clean power-off anchor at 12,500 lb is **102.88 mph CAS**. The research catalog now converts its mph field while preserving the original knot value. The lift envelope gives **126.5 kt CAS at 2 g**, with **123.4–129.8 kt** under the stated altitude and effective-lift sensitivity. This constrains instantaneous lift onset. The duplicated power label on the landing rows stays ambiguous. [BIS 2157 original trial](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf)
- **Hellcat and Spitfire.** At 11,000 lb the Hellcat’s documented coefficient bands give **94.3–97.7 mph EAS** clean and **75.7–77.4 mph EAS** in power-off landing configuration. The trace comparisons use indicated speeds and reported departure mass, so their closeness is a scale check. The Spitfire’s integrated 20,000–30,000 ft time is **216.3 s** versus **219.0 s** in the same A&AEE report. [NACA WR L-717](https://ntrs.nasa.gov/citations/19930092602) · [F6F-3 geometry reference](https://www.aviatorsdatabase.com/wp-content/uploads/2013/07/F6F-Hellcat.pdf) · [A&AEE Table II transcription](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)
- **Drag and cooling.** At 5,000 ft and 284 mph TAS, the P-38G level-flight case gives **L/D 9.38–13.11** across the stated weight, chart power and propeller-efficiency scenarios. The P-47B’s paired test gives **+14.2%** central effective drag area with both oil and intercooler flaps wide open versus neutral. The three Mustang rack pairs give **+6.4% to +9.3%** central effective drag area at 75 inHg. These estimates include the installation and induced drag at their respective points. [P-38G Wright Field report](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf) · [P-47B Wright Field report](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf) · [Mustang Wright Field trials](https://www.wwiiaircraftperformance.org/mustang/mustangtest.html)
- **Ki-84.** The captured aircraft’s estimated 60° bank and 3 g describe incompatible coordinated level-turn conditions. The separate Japanese handbook gives **160 s** from 7 to 8 km. Integration of its published rates gives **138 s**. The plausible stall and climb estimates retain their assumptions. A completed serial 302 climb trial and its actual stall mass remain unverified. [Captured T-2 report](https://www.wwiiaircraftperformance.org/japan/T-2_Report_on_Frank_I_Ki-84.pdf) · [Japanese handbook, PACMIRS No. 8](https://www.si.edu/media/NASM/NASM-Manual-000033269.pdf)
- **Me 109 G family drag.** Hoerner’s component and thrust estimates imply effective L/D around **5.9** near his stated maximum-speed condition. The source prints DB 601A while identifying a 1944 Me 109 G. The family-level sensitivity retains this discrepancy and carries limited coverage credit. The Finnish G-2 remains tied to its own performance trials. [Hoerner, Fluid-Dynamic Drag, chapter XIV](https://wwiiaircraftperformance.com/org/me109/g/g_files/Hoerner-Me_109.pdf)

## Calculation and graph conventions

| Method | Evidence and interpretation |
| --- | --- |
| Weight and load factor | EAS scales as the square root of weight times normal load at fixed effective lift coefficient. CAS transfers use the project’s compressible ISA conversion. Raw IAS transfers stay on the indicated scale with an explicit calibration scenario. |
| Elapsed climb | Integrate the reciprocal of the piecewise linear climb rate inside supported altitude bands. Use published elapsed differences as checks where available. Compare rate and elapsed from the same program as dependent observations. |
| Net climb power | Multiply the rate by weight at the stated loading or loading bracket. This approximates quasi-steady excess power and leaves kinetic-energy changes along the climb schedule unresolved. |
| Drag and L/D | In steady level flight, drag is propulsive power divided by TAS. L/D is weight divided by drag. Paired speed runs use the ratio of speed cubed to compare effective drag area under a bounded propulsive-power ratio. |
| Interpolation | Withhold an interior knot, predict from its neighbors and compare against a declared engineering tolerance. Use the local worst residual and reading allowance for the plotted envelope. Keep separate series across incompatible blower, power and hardware settings. |

Reference equations and quick manual checks are available in [NASA’s lift equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/), [NASA’s drag equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-equation/), [Aerodynamics for Naval Aviators](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf) and the [AeroToolbox stall-speed calculator](https://aerotoolbox.com/stall-speed-calculator/).

Across the quantitative checks, **77 met their declared allowance and 8 exceeded it**. A further **10 comparisons** retain differences without a match tolerance. These include independent reports whose test conditions differ or are incomplete. The tolerances and shaded ranges describe the modeled sensitivities and source reading precision. Statistical confidence remains unquantified.

Solid lines identify digitized primary traces. Primary tables have solid markers with calculated segments between supported anchors. Dashes show calculated segments. Dots show weaker scenarios. A band is available where the inputs justify a stated range. Each line style meets at the same plotted coordinate when the test condition is shared. The chart leaves gaps at incompatible condition changes.

This command generates the JSON and the self-contained explorer.

```sh
node scripts/derive-fighter-evidence.cjs
```

The HTML is generated at `dist/fighter-evidence-curves.html` and included in the Physics regression workflow’s `physics-validation` artifact. The original [coverage baseline](../../references/aircraft-readiness-german-archive-2026-11-11.json), detailed per-axis credits and retained source observations are available for review.
