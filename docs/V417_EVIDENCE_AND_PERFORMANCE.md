# 4.17 evidence and performance benchmark

Research candidate 4.17.0-rc.1 combines the flight-test inventory and speed/climb validation for the 14 operating aircraft. Open **Compare flight performance → Evidence across all 14 aircraft** for the source register, observed roll points, speed and climb errors by altitude band, and the separate HF IX trial. The register includes source conditions, grades and the next data to recover for all 84 aircraft/metric combinations. The generated numerical observations and individual signed residuals are in `dist/fleet-validation.json` in the regression artifact.

## Changes supported by flight tests

| Test case | Observed | 4.16 | 4.17 | What the comparison establishes |
| --- | ---: | ---: | ---: | --- |
| BS.551 HF minus BS.543 LF at 30,000 ft, mph TAS | +18.0 | +29.7 | +18.0 | BS.551 is 412.81 versus 413 measured, and BS.543 is 394.83 versus 395. The 30,000-ft point was excluded from both fits. |
| HF IX BS.551, mean absolute speed error on the same 17 unused rows, mph TAS | — | 7.16 | 2.73 | Excludes sea level and 27,400 ft for both revisions. These are other altitudes from the calibration trial. |
| HF IX EN.524, mean absolute speed error on 13 comparable rows, mph TAS | — | 9.71 | 4.33 | Separate serial and test, comparable gear and propeller. No EN.524 row sets a parameter. Four reported gear/altitude combinations fall outside the BS.551 model range. |
| G-6/Trop WNr 16476 climb from 8 to 10 km, seconds | 390 | 557 | 404 | Error +167 → +14 s. The two chart endpoints give a combined reading allowance of ±36 s. Pressure and clock come from the same flight. |
| G-6/Trop from departure to 8 km, seconds | 636 | 596 | 586 | Early arrival grows from 40 to 50 s. Over the full climb to 10 km, error changes from +128 to −36 s. |
| Bf 109 E-3, mean absolute local climb-rate error, ft/min | — | 252 | 221 | Seven unused rate points. The clock still gives 629 versus 739 s from 3,280 to 26,300 ft. |
| Spitfire Va, mean absolute local climb-rate error, ft/min | — | 170 | 149 | Eighteen unused rate points. The clock still gives 1,179 versus 1,368 s from departure to 37,000 ft. |

**Spitfire calibration.** The sea-level BS.551 speed constrains drag in low supercharger gear. Table VI's full-throttle-height point in high gear, 416 mph at 27,400 ft, separately constrains the high-gear level-power estimate. At fixed polar, propeller model and trial rpm, the effective factor is 0.9191 (about 1,356 hp against the earlier 1,475 hp). The flight test cannot independently identify shaft power, propeller efficiency and drag. The climb and Normal power branches keep their own inputs. The measured LF/HF gap at 10,000 ft is −7 mph versus −2.9 modeled, and at 20,000 ft it is −7 versus −4.2. [A&AEE BS.543 and BS.551, Tables II, III, V and VI](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)

**Separate HF trial.** EN.524 Table IV gives 408 mph at 30,000 ft and 386 at 36,000 ft, versus 412.77 and 397.71 modeled. Table I gives 507 s to 30,000 ft versus 461 s modeled. The matched propeller is 10 ft 9 in with 0.477:1 reduction, 7,090 lb for level speed and 7,470 lb for climb. The report describes a modified carburettor setting. Use the tables consistently: the summary differs from Table IV by 1 mph at 30,000 ft and 2 mph at sea level. The climb comparison approximates indicated speed as calibrated and uses the separately modeled BS.551 power schedule. [A&AEE EN.524, Tables I and IV](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitHFmkIX_EN524.html) · [17 speed and 21 climb/time records](../references/analysis/hf-ix-en524-holdout.json)

**G-6 pressure.** The filtered 2,600-rpm Combat climb uses measured manifold pressure from the actual aircraft through 11 km. The commanded 1.30 ata caps the effective input, with proportional power scaling at the existing pressure exponent. Beyond the measurements, the pressure estimate declines with ambient pressure. The original G-2 transfer and the alternative plateau alignment remain available for comparison. The separate G-1 pressure trace supports the direction of the correction at high altitude. Its different installation prevents treating its climb clock as a G-6 repeat. A separate trial measuring installed power and cooling is still needed to bound uncertainty beyond chart-reading error. [Messerschmitt WNr 16476, sheet 7](https://www.wwiiaircraftperformance.org/me109/VB-109-10-L-43.pdf#page=7) · [Pressure digitization and sensitivity](research/BF109G6_HIGH_ALTITUDE_CLIMB_2026-11-22.md)

**E-3 and Va climb rates.** Both local comparisons now use geometric vertical speed: divide the modeled excess-power climb rate by `1 + (V/g) dV/dh`, using consistent units and the trial's climb schedule. The E-3 retains its assumed 155 mph CAS schedule. The Va uses measured TAS with interpolation. The existing clocks already account for kinetic energy. Both single-point power fits still reach the 0.90 lower bound. Further correction needs the CEMA climb speed and run weights, and the X.4922 installed propeller/power or radiator data. [CEMA trial via RAE](https://www.wwiiaircraftperformance.org/me109/Me-109E3-French-2.jpg) · [A&AEE X.4922](https://www.wwiiaircraftperformance.com/org/spitcom/mk5/spitmkVa_X4922.html)

## Source inventory

| Aircraft | Priority for the next source search |
| --- | --- |
| P-51B | Separate level-speed trial and roll rates at additional speeds with loading and block. |
| P-47B | More B-model roll measurements and clean-stall airspeed correction. The C-1-RE has a different aileron nose. |
| P-38G | G-specific lateral trials and stall-run weight. The USAAF wheel-force result concerns the J. |
| F4U-4 | Identify the stall-test aircraft and weight. Seek timed level acceleration at documented power. |
| Fw 190 A-4 | A-4 numerical roll records. British A-3 comparisons establish a qualitative lead only. |
| Bf 109 F-4 | Recover DB 601 E rate versus altitude, mass and rating. The Rechlin time-to-height data can check intervals. The US intelligence evaluation labels the plotted F-4 performance estimates. |
| Bf 109 E-3 | French climb-speed schedule, per-run loading and low-speed position-error correction. |
| Spitfire Va | Low-altitude speed for X.4922 and installed de Havilland data. NACA W.3119 provides sister-aircraft stall and roll observations. |
| Spitfire F IX | BF.274 low-speed calibration and a repeat level/climb trial. |
| Spitfire LF IX | Fresh level-speed observations outside the BS.543 fit and calibrated clean-stall data. |
| Spitfire HF IX | Installed high-altitude power and another configuration-matched climb to check the remaining error. |
| Bf 109 G-2 | Original MT-215 sheets giving mass, rating and speed calibration for timed runs. |
| P-51D-15 | Wartime rack-on timed level acceleration and low-speed calibration for 44-15342. The restored Mustang is a separate aircraft. |
| Bf 109 G-6/Trop | Independent installed power near 8–10 km and radiator drag through the middle climb. |

**Roll evidence.** The USAAF memo reports 81°/s for the P-47B and 71°/s for the P-51B at 400 mph and 10,000 ft density altitude, with 50 lb stick force. These are two type-level observations at one speed. Neither is an unrestricted maximum. The P-38J unboosted result and W.3119 Va result have their own variant and test notes. NACA L-525 Fig. 6 covers 150–405 mph indicated on the P-47C-1-RE and measures rolling effectiveness. Pilot strength is outside the model. [USAAF, Table I](https://www.wwiiaircraftperformance.org/mustang/Performance_Data_on_Fighter_Aircraft.pdf) · [NACA L-525](https://ntrs.nasa.gov/citations/19930092577) · [NACA L-334](https://ntrs.nasa.gov/citations/19930092582) · [British A-3 report](https://www.wwiiaircraftperformance.com/com/gb/documents/fw190a3_RAE-Test-Jul42-new.html) · [US evaluation of the Bf 109 F](https://stephentaylorhistorian.com/wp-content/uploads/2020/04/bf-109f-evaluation.pdf)

**Reading coverage.** Fourteen aircraft have level-speed and time-to-altitude evidence groups, and thirteen have local climb-rate groups in this scorecard. Eleven have linked clean-stall records, including uncorrected indications and sister aircraft. The three acceleration entries include separate Finnish timed segments, a restored Mustang proxy and a derived Spitfire power check. Five profiles have roll evidence or a related-variant lead. Coverage counts indicate records available, not independently validated aircraft. Each source group retains its own fit/unused/transfer status. IL-2 and DCS receive no historical validation credit.

## Protected reference condition

At 10,000 ft, dry Combat, 50% fuel and the same cooling, the source-level changes give the following results in both versions.

| Aircraft | Level speed (mph TAS) | Best climb (ft/min) | Time from departure (s) |
| --- | ---: | ---: | ---: |
| P-51B | 408.07 | 4,203.33 | 150.79 |
| P-47B | 371.07 | 2,797.59 | 207.24 |
| Bf 109 F-4 | 373.55 | 4,762.77 | 136.85 |
| Spitfire LF IX | 380.32 | 4,704.58 | 117.27 |

Use the [roadmap](SIMULATOR_ROADMAP.md) for the next clean-stall and timed-level-acceleration milestone.
