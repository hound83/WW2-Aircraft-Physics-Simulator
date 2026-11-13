# Fighter Sim Inputs v1.10.0

Grok's priority-aircraft file supplied 31 structured claims across eight aircraft. The review resolved 14 as additions, six of them with explicit qualifications, linked 10 to existing observations and left seven open. The review also records four concurrent stall and propeller updates and one German performance summary. The original sources led to full tables and **164 new catalog records**, comprising 139 transcribed period-report rows, 12 primary manual IAS entries and 13 qualified source-context rows. [Candidate](priority_aircraft/all_8_aircraft_primary_secondary_v1.json) · [Claim disposition](../../references/analysis/ww2_priority_aircraft_review_2026-11-13.json) · [Reviewed evidence](../../references/research/ww2_priority_aircraft_2026-11-13.json)

| Aircraft reviewed | New catalog rows | Evidence and disposition |
| --- | ---: | --- |
| P-51D-15-NA 44-15342 | 88 | 28 distinct level points, 13 climb points, 33 loaded runs, takeoff loading, representative geometry and 12 P-51D/K manual IAS entries. |
| P-47D 42-26167 / D-30 43-3441 | 0 | Reuse the three 44-1 fuel performance points for 42-26167. The 105 mph IAS belongs to half flaps and gear down. The clean 116 mph readings have separate configurations and specimens. |
| Bf 109 G-2 MT-215 | 0 | Reuse three level and two climb points. 522 km/h uses 140 m corrected altitude, and 636 and 552 km/h use 6,420 and 10,100 m corrected. Run mass remains open. |
| Fw 190 A-8 | 11 | Six factory-sheet summary points from separate dated configurations and five WNr 733705 test points or load records. The 110 mph stall lead is the already cataloged A-3. |
| Fw 190 D-9 WNr 210001 / 210002 | 0 | Link 398 mph at 19,357 ft to 210001 and 330 mph at sea level to 210002. WNr 210002 records 4,100 kg for level and 4,300 kg for climb. |
| Spitfire I N.3171 | 31 | 11 level, 16 climb, two stall entries with unestablished speed basis, a load record and a secondary sea-level point. |
| Spitfire Va X.4922 | 29 | Nine level, 19 climb and one load record for the 6,450 lb de Havilland configuration. The separate NACA W.3119 90/91 mph glide stalls are already indexed. |
| Bf 109 E-3 WNr 1792 / V15a WNr 1774 | 5 | Traceable secondary summaries retain the separate 1.30 and 1.33 ata branches and a US E-3 comparison. Reuse the captured WNr 1304 glide IAS. |

| Metric | v1.9.0 | v1.10.0 |
| --- | ---: | ---: |
| Catalog observations | 2,562 | 2,726 |
| Catalog source entries | 324 | 336 |
| Stall observations | 274 | 288 |
| Scored research variants | 13 | 13 |
| Average primary coverage | 63.77% | 63.77% |
| Coverage with secondary evidence | 64.31% | 64.31% |
| Coverage with calculations | 67.31% | 67.31% |
| GOLD / qualified GOLD* checks | 0 / 5 of 156 | 0 / 5 of 156 |

The five dossiers with new rows expand source coverage outside the scored reference configurations. The three scored aircraft in this batch retain their applicable existing evidence. The follow-ups led to the same Mustang manual schedule and several already indexed sources. The German summary combines a factory calculation with flight data from different airframes. Its review retains those distinctions. NACA's XP-51 lift results and the A-3 low-speed figure apply to their own installations.

## Applying Greg's method

The minimum-input checklist now supports a calculated two-term drag polar from one drag anchor and an explicit split or bounded Oswald efficiency. The F-4 table's 325 mph anchor uses 1,137 lbf parasite and 81 lbf induced drag. It yields 644.5 lbf total at 200 mph versus Greg's 646 lbf, and the arithmetic replay averages 2.27 hp difference across 11 tabulated power points. The fit can guide sparse-data estimates. A lower-speed glide, timed acceleration or high-lift condition gives a stronger test of the induced term. [Minimum viable input data](MINIMUM_VIABLE_SIM_DATA.md) · [Replay](../../validation/diagnostics/greg_reconciliation_v11.cjs)

Build with `npm run build` and read `dist/fighter-sim-inputs.json` with `dist/research-catalog.json`. The canonical pack's `priority_aircraft_reference` includes the eight dispositions, source links, conditions and new or reused observation IDs. [Canonical pack](../../references/analysis/fighter-sim-inputs-v1.json) · [Full roster coverage](WW2_FIGHTER_SIM_INPUTS_V1.md#coverage-by-aircraft)
