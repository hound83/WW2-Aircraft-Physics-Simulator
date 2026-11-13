# v4.14.0-rc.1 G-6/Trop and F Mk IX intake

The Normal / Combat benchmark has 12 profiles. This intake adds **Bf 109 G-6/Trop WNr 16476** with its sand filter, wing gun pods and wheel covers, and **Spitfire F Mk IXc BF.274** with the Merlin 61, full-span Vc wing and no external tank. Both use the shared engine, drag, lift and timer calculations for level flight and straight climb. Stall is provisional and turn rankings are unavailable for these two profiles. [Accepted roster](DECISIONS.md#aircraft-roster-expansion)

## Flight-test conditions and replay

| Profile | Level fit and checks | Climb source and checks |
| --- | --- | --- |
| **F IX BF.274** | Table IV fit at 6,000 ft and 338 mph TAS in M.S. gear. Clean takeoff weight 7,480 lb, closed radiator flaps, sealed gun muzzles and Rotol R3/4F5/3 dural RA.10061 blades. The 15 remaining speed rows have 5.25 mph TAS mean absolute error. The largest miss is +14.75 mph in F.S. gear at 20,000 ft. | Tables I and II use fully open radiator flaps at 7,480 lb takeoff. The 34 rate checks give 181.75 ft/min mean absolute error. The largest miss is +570 ft/min at 20,000 ft Combat. The fixed-weight, recorded-TAS replay reaches 20,000 ft in 399 s Normal versus 390 s observed, and 324 s Combat versus 336 s observed. [A&AEE report](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitFmkIX_BF274.html) |
| **G-6/Trop WNr 16476** | German report 109 10 L 43, Tafel I run 3b at 3,260 kg and 492 km/h TAS reduced to sea level. The two unfitted checks give 6.48 mph TAS mean absolute error. The 3,100-kg run 3a is +2.46 mph. The model is −10.50 mph at the filtered 6,420 m critical altitude. Timed level runs had fuselage guns removed and the hand-closed radiator flaps pushed open 45 mm. | The report gives 3,260 kg at takeoff, a 260 km/h IAS climb schedule, 1.30 ata at 2,600 rpm, and a 100 °C cooling target. The reported ceiling is 11,130 m (36,516 ft). At that height the transferred model gives −207 ft/min. Its own 100 ft/min ceiling is 34,571 ft. The summary leaves the report’s ceiling criterion unstated. The climb figure was unavailable as readable numeric data. [German report](https://www.wwiiaircraftperformance.org/me109/me109g-16476german.html) · [Climb figure](https://wwiiaircraftperformance.com/org/me109/g/g_files/me-109g6-16476-pg7-1400.jpg) |

BF.274 planning uses the Merlin 61 1,290 bhp takeoff anchor, 1,570/1,390 bhp combat anchors, boost and RPM scaling, and a 0.09 m² open-radiator drag area assumption. Level operation below 6,000 ft is estimated. Normal climb uses the recorded TAS schedule with a 162 mph TAS departure estimate. The modeled gear shifts are at 18,700 ft Normal and 18,500 ft Combat. The historical full-Combat climb used a test concession. The operating timer applies a five-minute Combat allowance. The Table II heading says Normal, but the table’s RPM, boost and report summary identify Combat. [Merlin 61 ratings](https://www.wwiiaircraftperformance.org/Aircraft_Engines_of_the_World_Rolls-Royce_Merlin.pdf) · [BF.274 Tables I–II](https://wwiiaircraftperformance.com/org/spitcom/mk9/spitFmkIX_BF274.html)

The G-6 uses DB 605 A book ratings and a 3 m VDM 9-12087a with the shared propeller model. Level power uses the filtered critical altitude. Climb uses the Finnish G-2 absolute boost schedule, joined to ambient-pressure lapse beyond its last node, and a 0.12 m² cooling-area assumption. IAS is approximated as CAS for the climb schedule. The Combat rating stays at 1.30 ata for 30 minutes, and Normal is 1.15 ata at 2,300 rpm. The 3,260 kg planning load assumes 400 L at departure. The level-speed comparison above 6,420 m is a modeled projection. [DB 605 A and Finnish trial evidence](research/WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md#bf-109-g-2)

The archive retains BF.274’s separate 30 Imperial gal tank runs at 7,775 lb, including the two RPM conditions at 30,000 ft, and the G-6’s attachment and separate cowling tests. Tafel I shows 511 km/h for G-6 run 7 reduced to sea level. The corresponding unfiltered critical altitude of 6,600 m is indexed separately. [101 source records](../references/research/ww2_g6trop_and_f_ix_2026-11-13.json) · [WNr 16476 cowling report](https://www.wwiiaircraftperformance.com/org/me109/g/me109g-16476-b.html)

## Drag references and stall

The first clean level point for each selected installation sets the drag polar with Oswald efficiency 0.80. The Greg estimate uses `CD0 = (η Pshaft/V − Dinduced)/(q S)` at fixed propeller efficiency 0.80. The runtime fits the same point using the shared momentum propeller model. The difference between the coefficients reflects the propeller assumption. The stored sensitivity columns use fixed efficiency 0.75 and 0.85 and hold other inputs fixed.

| Profile | Greg CD₀ | Greg CD₀ at η 0.75–0.85 | Runtime CD₀ |
| --- | ---: | ---: | ---: |
| BF.274 | 0.020438 | 0.019089–0.021786 | 0.023425 |
| WNr 16476 | 0.028749 | 0.026830–0.030669 | 0.033027 |

BF.274 uses the full-span LF IX lift prior at its own loading. The measured position-error range of 130–320 mph IAS ends above the modeled stall. WNr 16476 uses the F-4 lift prior with G-series wing geometry, and the pods and tropical installation introduce additional uncertainty. Both stall values are conditional on the lift prior and scale with square-root weight within that model. [BF.274 correction audit](../references/research/ww2_low_speed_turn_calibration_2026-11-10.json) · [Family donor audit](../references/research/STALL_DONOR_SHORTLIST_2026-11-13.md)

## Reproduction

The ten previously selectable profiles reproduce all 120 steady cases, 60 timed acceleration cases and 20 timed climbs from base `f13e6071a9659ef9276269d0932d8a2bc2e24382`. The scorecard JSON SHA-256 is `36363ce6659d1de1aabccecd3b4b11fa33b1f388425a29c16ddd9fe6665285c4`. The earlier turn-drag regression still checks the aircraft in its frozen cohorts.

`npm run check` generates `validation/current/aircraft-intake.json`, with row IDs, observed and modeled values, role, conditions, elapsed replay and both new drag references. The checks share report inputs and therefore do not establish independent historical accuracy. Fighter Sim Inputs remains v1.11.0. The 101 added records are in the source catalog. The next roster entry is Bf 109 E WNr 1304 and Spitfire Va X.4922, followed by Mk I N.3171.
