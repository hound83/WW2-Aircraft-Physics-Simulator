# Fighter Sim Inputs v1.9.0

The production input pack adds **552 catalog observations** across 53 series. The last Grok integration added 96. The count includes **306 measured scale-propeller test conditions** and **246 aircraft or installation references relevant to eight of the 13 prepared aircraft**. Of the aircraft-linked rows, 128 come from handbooks that cover the applicable production blocks, 105 are variant or component comparisons, and 13 are published Ki-84 specification rows. These series contribute zero new exact-specimen flight-test observations. [Input JSON](../../references/analysis/fighter-sim-inputs-v1.json) · [Reviewed evidence](../../references/research/ww2_pdf_source_review_2026-11-12.json)

| Catalog count | v1.8.0 | v1.9.0 | Added |
| --- | ---: | ---: | ---: |
| Observations | 2,010 | 2,562 | +552 |
| Source entries | 313 | 324 | +11 |
| Qualified GOLD agreements | 5/156 | 5/156 | 0 |
| GOLD agreements | 0/156 | 0/156 | 0 |

Grok committed the source index at `99edb9f`. Its 13 family JSON files contained empty arrays. The matching populated export supplied all 5,801 candidate entries, including 96 missing entries. The published candidate archive retains the original data, grades, page numbers and extraction identifiers. The catalog uses grouped conditions from selected source tables. Repeated power settings with the same fuel rate and duration form one altitude band. [Recovered candidate files](../../references/research/local-pdf-extract-2026-11-12/README.md) · [Source and overlap review](../../references/analysis/ww2_pdf_source_disposition_2026-11-12.json)

## Prepared aircraft

| Reference aircraft | Primary | With secondary | With calculations | Added related records |
| --- | ---: | ---: | ---: | ---: |
| F4U-4 80765 | 83% | 83% | 87% | 0 |
| P-51B-15 43-24777 | 72% | 73% | 78% | 30 |
| F6F-3 04776 | 79% | 79% | 82% | 0 |
| Spitfire LF IX BS543 | 62% | 63% | 64% | 0 |
| P-47B 41-5902 | 64% | 64% | 68% | 28 |
| P-38G-1 42-12687 | 62% | 62% | 66% | 40 |
| Fw 190 D-9 210002 | 61% | 63% | 65% | 13 |
| Fw 190 A-4 783 | 63% | 65% | 68% | 27 |
| P-40F 41-13635 | 49% | 49% | 53% | 46 |
| Ki-84-I 302 | 50% | 50% | 52% | 13 |
| P-47D-30 43-3441 | 64% → 66% | 64% → 66% | 66% → 68% | 49 |
| Bf 109 F-4 DB601E | 53% | 53% | 55% | 0 |
| Bf109G-2 DB605A (research intake) | 65% | 66% | 69% | 0 |
| **Fleet average** | 63.62% → 63.77% | 64.15% → 64.31% | 67.15% → 67.31% | **246** |

The D-30 gains two documentary points in the installed engine, propeller and cooling dimension. AN 01-65BC-1A covers that block and provides manifold pressure, RPM and time limits. The test aircraft’s shaft-power curve and SPA-5 thrust measurements are still open. The scoring uses the established six dimension weights and 156 benchmark slots. The new tables preserve their source applicability and support later comparison. [Coverage rubric](WW2_FIGHTER_SIM_INPUTS_V1.md#coverage-by-aircraft)

## Source checks

- **P-47D-30.** The late-block handbook provides 18 climb conditions across 14,200, 16,000 and 18,000 lb, along with 23 grouped operating bands. It points to the engine chart without identifying a single power column for the climb table. The RAF table starts at 170 mph IAS and the handbook stalls are at 115 and 100 mph IAS. The RAF pitot installation and near-stall correction remain open. [P-47D handbook catalog](https://app.aircorpslibrary.com/document/viewer/8a857610-e349-464b-a98f-7009e073081e)
- **P-47B and P-40F/L.** The early Thunderbolt chart gives operating speed, fuel flow, manifold pressure and RPM. The Warhawk charts give climb time and rate for combat and ferry schedules, including an external-store comparison. These are planning charts with multiple aircraft and loading conditions. [P-40F/L manual](https://aviationarchives.blogspot.com/2022/01/curtiss-p-40fl-warhawk-flight.html)
- **P-51B and P-38.** The Mustang handbook applies to the B-1 with a V-1650-3. The B-15 uses the V-1650-7. The YP-38 tunnel data give local sonic-onset estimates for the original prototype and experimental changes. The P-38G flight benchmark uses its own aircraft and conditions. [YP-38 tunnel report](https://ntrs.nasa.gov/api/citations/19930092691/downloads/19930092691.pdf)
- **Fw 190 and Bf 109.** The D-9 retyped handbook gives nominal Jumo 213 A ratings and gross load cases. The A-5/A-6 handbook and BMW 801 D-2 control study give comparison data for the A-4. The G-3 handbook repeats three DB 605 A sea-level ratings already indexed for the G-2, which remain linked by their existing IDs. [BMW control study](https://ntrs.nasa.gov/api/citations/19930093290/downloads/19930093290.pdf)
- **Ki-84.** T-2 Interim Report 3 lists nominal speed and climb for normal and overload weights. Its flight section reports that no performance climb was attempted. The new specification rows retain this qualification. [T-2 report](https://www.wwiiaircraftperformance.org/japan/T-2_Report_on_Frank_I_Ki-84.pdf)
- **Propellers.** NACA TN 698 gives four blade configurations plus two spinner cases. The table contains 309 advance-ratio rows. Three coefficient discrepancies remain in the candidate archive with computed cross-checks and page locations. The other 306 enter the catalog at their original test scale. [NACA TN 698](https://ntrs.nasa.gov/citations/19930081563)

The prior 13 clean-stall selections, case recommendations and model settings are identical to v1.8.0. The input pack retains the new source references under `pdf_reference`. The compact source pack contains original page locators, hashes of inspected copies and the extraction IDs.
