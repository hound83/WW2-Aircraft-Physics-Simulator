# v4.13.0-rc.1 aircraft intake

The Normal / Combat benchmark has ten selectable profiles. This batch adds the full-span Spitfire HF Mk IXc BS.551, Bf 109 G-2 MT-215 / WNr 14783 and P-51D-15-NA 44-15342. Level speed, 1 G acceleration and straight and timed climb use the shared solver and selected fuel load. Acceleration and timed climb are planning estimates. The three profiles have provisional clean stall estimates and no instantaneous or sustained turn output. The aircraft data pack is Fighter Sim Inputs v1.11.0. [Accepted roster](DECISIONS.md#aircraft-roster-expansion)

## Model and source boundaries

| Aircraft | Runtime model and exact report conditions | Provisional stall |
| --- | --- | --- |
| **Spitfire HF Mk IXc BS.551** | Merlin 70 and 10 ft 9 in Rotol R5/4F5/4 with wooden RA10046 blades. The sea-level fit uses Table VI's 331 mph TAS at 7,090 lb, +18.5 psi and 2,960 rpm. The Merlin 70 rating anchors and the report's boost lapse supply estimated installed power. Table III climb uses 7,470 lb, its recorded TAS, 2,980 rpm, separate gear branches at 18,600 ft and an estimated 0.09 m² open-radiator drag area. Combat and Normal use the +18/3,000 and +12/2,850 policies. [A&AEE Tables III and VI](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) · [Merlin ratings, p. 205](https://www.wwiiaircraftperformance.org/Aircraft_Engines_of_the_World_Rolls-Royce_Merlin.pdf) | Uses the LF IX lift prior at the selected weight. The pair has full-span Vc wings and the same reported CG. A calibrated BS.551 stall observation remains open. |
| **Bf 109 G-2 MT-215** | DB 605 A, hydraulic supercharger and representative 3 m VDM. Operational Combat is 1.30 ata at 2,600 rpm for 30 min. Normal is 1.15 ata at 2,300 rpm. The Finnish replay uses measured 2,540 rpm and corrected TAS. Power interpolates rated PS and follows reported boost lapse with an exponent of 0.88. The report's 400 L departure and representative 3,050 kg mass define the load scenario. The climb cooling drag area is an assumed 0.12 m². [Finnish scan](https://wwiiaircraftperformance.com/org/me109/g/g_files/me-109g2-finn.pdf) · [Engine and trial evidence](research/WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md#bf-109-g-2) | Uses the F-4 lift prior and G-2 geometry. The G-2/Trop's 112 mph IAS and WNr 14513's 180 km/h indicated minimum control speed are displayed at their own source conditions. Neither supplies a calibrated G-2 stall anchor. [Donor audit](../references/research/STALL_DONOR_SHORTLIST_2026-11-13.md) |
| **P-51D-15-NA 44-15342** | V-1650-7 and 11 ft 2 in Hamilton Standard K6523A-24, wing racks and no external load. Wright Field chart BHP supplies Normal, Military and WEP level replay. Its distinct WEP climb curve and 15,500-ft shift apply to Combat climb. Normal climb uses the Normal level schedule as a power proxy. Timed Combat uses one five-minute WEP window and Normal outside it under the benchmark's two-setting policy. The trial took off at 9,760 lb and 209 US gal. Planning presets use the 269-US-gal installation. [Wright Field Tables A–D](https://wwiiaircraftperformance.com/org/p-51/p51d-15342.html) | The D/K rack-on clean IAS schedule is 91, 97 and 103 mph at 7,500, 8,500 and 9,500 lb. The provisional EAS estimate assumes IAS approximates EAS at the center point and scales as √weight. The UI flags loading beyond that weight range. [D/K instructions, p. 21](https://data.ntsb.gov/Docket/Document/docBLOB?FileExtension=.PDF&FileName=P51D+Normal+Operating+Instructions-Master.PDF&ID=40206631) |

### Drag and power

For each aircraft, use the selected level anchor, the shared momentum propeller estimate, Oswald efficiency 0.80 and the usual level balance `CD₀ = (η Pshaft/V − W²/(q π e b²))/(q S)`. One speed at one loading constrains the combined installed power and drag. The two Greg references use fixed 80% efficiency, while the runtime uses the shared propeller at the trial RPM. The original Greg values and sensitivity bounds remain in the reference file. The runtime fits for G-2 and P-51D stay within those bounds. The HF, G-2 and D propeller efficiency shapes are engineering transfers from the LF IX, F-4 and P-51B respectively. They use the target installation geometry. [Greg method and source anchors](research/WW2_GREG_DRAG_MODELS_2026-11-13.md) · [Implementation](../scripts/aircraft-batch.cjs)

| Aircraft | Level fit | Runtime CD₀ | Greg reference CD₀ |
| --- | --- | ---: | ---: |
| HF IX | 331 mph TAS, sea level, Table VI | 0.02239 | Separate HF profile fit |
| G-2 | 522 km/h corrected TAS, 140 m, Finnish speed table | 0.02757 | 0.02467 |
| P-51D | 375 mph TAS, sea level, Wright Field WEP | 0.01667 | 0.01453 |

## Historical replay

The level MAE excludes the one fitted speed per aircraft. Other speeds and all climb rates are checks on the same source reports, with boost, chart BHP or speed used as model inputs where indicated. Climb checks evaluate the shared balance at the recorded speed, with instrument-corrected P-51D IAS treated as CAS. They do not apply the model's best-climb speed or establish independent historical accuracy. Residuals are model minus observation.

| Aircraft | Level MAE | Climb MAE | Largest absolute level and climb residuals |
| --- | ---: | ---: | --- |
| HF IX BS.551 | 7.41 mph TAS (18) | 147 ft/min (21) | +20.3 mph at 36,000 ft and +332 ft/min at 38,000 ft |
| G-2 MT-215 | 6.44 mph TAS (11) | 290 ft/min (6) | +18.3 mph at 10,100 m corrected and −478 ft/min near 6,000 m |
| P-51D 44-15342 | 4.03 mph TAS (26) | 176 ft/min (12) | −10.6 mph at 35,000 ft Normal and +437 ft/min at sea level WEP |

The Finnish scan gives 3,091 ft/min at 6,000 m CINA, the secondary transcription gives 2,854 ft/min, and the replay at the nearby corrected speed-table height gives 2,613 ft/min. Both source readings and their altitudes appear in the replay. The HF Table III 40,000-ft boost entry of −2.5 psi is retained as transcribed. The HF upper-altitude speed error and G-2 upper-climb residuals constrain use for comparisons. The data cover the HF level model through 36,000 ft, G-2 level through 10,100 m, and P-51D level through 35,000 ft, with separate climb limits. The existing optional pressure-lapse estimate is labeled where enabled.

### HF versus LF IX

| Altitude | A&AEE HF / LF (mph TAS) | Modeled HF / LF (mph TAS) | Observed / modeled HF lead (mph) |
| ---: | ---: | ---: | ---: |
| Sea level | 331 / 336 | 331.0 / 336.0 | −5 / −5.0 |
| 10,000 ft | 373 / 380 | 377.5 / 380.4 | −7 / −2.9 |
| 20,000 ft | 392 / 399 | 398.0 / 399.6 | −7 / −1.7 |
| 30,000 ft | 413 / 395 | 424.5 / 394.8 | +18 / +29.7 |

The trial and simulation show the HF overtaking the LF between the sampled 20,000 and 30,000 ft. The model overstates the advantage by 11.7 mph at 30,000 ft. The sea-level HF point set its drag fit. The LF uses its existing runtime model and the report's 7,110-lb level weight. [A&AEE Tables V and VI](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)

## Regression and reproducibility

The pre-intake benchmark scorecard was frozen at commit `2d7c4f8680c1e0e3c5abb3b352d2c8c9239986ed`. Reproduce it by passing the existing seven-aircraft `shared_flight_climb.cjs.browserData()` through `operating_benchmark_v410.cjs.scorecard()` and hashing its JSON. The candidate produces the same digest `c7d7dbc3cd818a88d5ae77197fa054b3494b128c60dfe170f46e51c13f260346`.

| Profiles checked before and after | Steady cases | Timed acceleration | Timed climb |
| --- | ---: | ---: | ---: |
| LF IX, Bf 109 F-4, P-47B, P-51B, Fw 190 A-4, P-38G and F4U-4 | 84 identical | 42 identical | 14 identical |

Run `npm run check` to generate `validation/current/aircraft-intake.json` with source observation IDs, weights, role, modeled values and signed residuals. Run `npm run test:browser` to exercise the selectors, stall and turn scope and timed climbs. The model remains a research candidate. Exact corrected stalls, independent installed-power and propeller checks, and drag under maneuver load remain open for the intake.
