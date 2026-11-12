# Fighter sim inputs v1.6.0

The data pack covers 13 variants and 24 evidence plots. It carries preferred readings and uncertainty for reviewed cases, pointers to the original observations, and the support level of each curve segment. The simulator can use it to look up a specific test case and draw the evidence behind it. [Versioned JSON](../../references/analysis/fighter-sim-inputs-v1.json) · [Underlying calculations and source checks](WW2_FIGHTER_CALCULATED_EVIDENCE_2026-11-11.md)

v1.2 links 67 new propeller-test readings, source-conditioned replays, and a seven-aircraft efficiency-only sweep. The new companion is available as `dist/fighter-propeller-efficiency.json`. The table shows the 13-variant coverage and GOLD scorecard, with a v1.2 delta of zero in each column. [Propeller report and data contract](WW2_PROPELLER_EFFICIENCY_2026-11-11.md)

The v1.3 propeller companion carries checked efficiency values, reference drag and the P-38G part-power tables. [Propeller reference values](WW2_PROPELLER_REFERENCE_VALUES_2026-11-12.md)

v1.4 adds source-checked power anchors, installation-specific speed and boost, and an independent NACA propeller climb check. The `engine_reference` section links each value back to the original catalog row. [Fighter input reference](WW2_FIGHTER_INPUT_REFERENCE_2026-11-12.md)

v1.5 adds the 13-aircraft `fleet_reference` in the propeller companion, 126 original-source records and the paired Fw 190 A-4 intake plot. The coverage and GOLD delta from v1.4 is zero. [Fleet inputs and original report index](WW2_FLEET_PROPELLER_INPUTS_2026-11-12.md)

v1.6.0 exports a clean-stall reference for each of the 13 variants in `stall_reference.variants[].clean_stall`. It selects source-reported CAS or EAS, source-indicated speed, a documented calculation, or an empty entry flagged `emergency research needed`. The section retains the 37 catalog additions and P-38G calibration references. Reviewed benchmark cases and evidence coverage continue to use the criteria below. [Fleet stall evidence and data contract](WW2_FLEET_STALL_INPUTS_2026-11-12.md)

## Coverage by aircraft

The three coverage columns use the existing six weighted dimensions. The primary score carries forward the documented checklist, including original documentary evidence such as operating limits. The second column credits identifiable secondary evidence. The third adds attributable calculations under their stated conditions. The earlier total also included original tests from other specimens and legacy credits with mixed or unspecified attribution. Those points remain in the reconciliation fields. The P-40F brace-pair sensitivity and its successor cover the same installation cases, so the clean total counts that contribution once.

| Aircraft and reference specimen | Primary | + Secondary | + Calculations | Previous total | Δ total (pp) | GOLD | GOLD* |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| F4U-4 80765 | 83% | 83% | 87% | 91% | −4 | 0/12 | 0/12 |
| P-51B-15 43-24777 | 72% | 73% | 78% | 84% | −6 | 0/12 | 0/12 |
| F6F-3 04776 | 79% | 79% | 82% | 87% | −5 | 0/12 | 0/12 |
| Spitfire LF IX BS543 | 62% | 63% | 64% | 74% | −10 | 0/12 | 1/12 |
| P-47B 41-5902 | 64% | 64% | 68% | 71% | −3 | 0/12 | 1/12 |
| P-38G-1 42-12687 | 62% | 62% | 66% | 73% | −7 | 0/12 | 0/12 |
| Fw 190 D-9 WNr 210002 | 61% | 63% | 65% | 75% | −10 | 0/12 | 0/12 |
| Fw 190 A-4 WNr 783 | 63% | 65% | 68% | 73% | −5 | 0/12 | 1/12 |
| P-40F 41-13635 | 49% | 49% | 53% | 62% | −9 | 0/12 | 0/12 |
| Ki-84-I T-2 302 | 50% | 50% | 52% | 56% | −4 | 0/12 | 0/12 |
| P-47D-30 43-3441 | 64% | 64% | 66% | 77% | −11 | 0/12 | 0/12 |
| Bf 109 F-4 DB 601 E | 53% | 53% | 55% | 66% | −11 | 0/12 | 1/12 |
| Bf 109 G-2 DB 605 A | 65% | 66% | 69% | 77% | −8 | 0/12 | 1/12 |
| **Fleet average** | **63.62%** | **64.15%** | **67.15%** | **74.31%** | **−7.15** | **0/156** | **5/156** |
| **German average** | **60.50%** | **61.75%** | **64.25%** | **72.75%** | **−8.50** | **0/48** | **3/48** |

The delta uses unrounded scores. The fleet reconciliation assigns 6.92 percentage points to legacy context and 0.23 to overlapping calculation credit. The former 71.46% middle column used the earlier augmented definition. The 64.15% middle column applies the new primary-plus-secondary definition. [Previous scorecard](../../references/analysis/fighter-derived-evidence-2026-11-11.json)

## Selection and GOLD

Match the aircraft, installation, metric, speed basis, altitude, load and rating before comparing numbers. Use the original reading or transparent unit conversion for a single value. For comparable replicates, use the equal-weight mean when the full spread fits the limit. The mean retains its source grade and member IDs. Prior published averages and repeated transcriptions remain visible. Rebuild a mean from its original readings when the membership changes. For a dispute at the highest available grade, the case returns a conflict with the individual values still accessible.

| Quantity at matched conditions | Accuracy goal | Maximum full spread for combining |
| --- | ---: | ---: |
| Clean 1 g stall CAS or EAS at known mass | ±2 km/h | 3 km/h |
| Level TAS | ±3 km/h | 6 km/h |
| Climb rate at matched schedule | ±3% | 5% |
| Climb or acceleration time over identical endpoints | ±3% | 5% |
| Sustained turn rate | ±0.3°/s | 0.5°/s |
| Measured shaft power | ±2% | 3% |
| Comparable drag or L/D | ±3% | 5% |

For a source range without a stated central reading, use its midpoint. The full spread is the highest minus the lowest comparable central value. Percentage spread uses the magnitude of their mean. The accuracy goals guide further research. Retain the reported ranges with their provenance.

**GOLD** records central agreement within the limit when a reviewed primary reading agrees with an independent result. Independent original readings can meet this rule directly. **GOLD*** records agreement with a reviewed qualification, such as missing engine settings or a calculation and measurement that share a report. A source reprint keeps its original lineage. Material differences in conditions leave a case open.

The pack counts each of the 12 planned benchmarks per variant once. A reviewed case can have several readings or related graph samples. Five slots have GOLD* agreement, including three among the German variants. Level TAS retains the inclusive 6 km/h limit from v1.0.1 and timed climb uses 5%. [Case-by-case readings and qualifications](../V47_BENCHMARK_AND_GOLD.md#source-agreement).

The WNF Bf 109 G-2 production runs at standardized 250 m yield **518.75 km/h Vnk**, a combined primary value. The four original readings span **518–520 km/h**. The report estimates **±7 km/h** absolute tolerance, so the pack uses **511–527 km/h** as the envelope of the four reported readings and their allowance. The original rounded 519 km/h summary is still available. The separately normalized Vn series gives **517.25 km/h**, also primary. The treated-surface Vnk runs span **520–529 km/h** after retaining the repeat as provenance and counting that airframe once. That spread leaves the treated case unresolved for selection. [WNF 109 11 L 42](https://wwiiaircraftperformance.com/org/me109/g/g_files/VB-109-11-L-42.pdf)

## Simulator handoff

- Build with `npm run build`. Read `dist/fighter-sim-inputs.json` alongside `dist/research-catalog.json`. Join original observation IDs to catalog observations and their source IDs. The pack records input paths and SHA-256 hashes for source files and carries the original report locators.
- For reviewed lookups, select the case by `id` and confirm its `conditions`, `metric` and `unit`. Read `preferred` when the case status is `accepted`. Preference is primary mean, primary original, secondary mean, secondary original, calculated mean, then calculated individual value. `by_grade` retains the reviewed alternatives, and `candidates` retains all inputs to that decision.
- For curves, preserve each chart’s separate series. Draw the indexed `segments` with their declared styles. Solid includes traceable secondary data and checked interpolation inside a supported branch. Dots indicate weaker support. The Finnish MT-215 140–5,120 m secondary speed branch is solid within its checked interpolation envelope. The 6,420–7,110 m break stays open. The WNr 783 climb-time tail joins the primary series at 9,000 m.
- Shade only segments with `band: true` using each endpoint’s lower and upper `range`. These ranges can be asymmetric. `range_kind` distinguishes source reading allowance, estimate sensitivity and a defined zero origin. A null range means the source and method leave it open. Show the observed span separately for combined values.
- Use `grade`, `method`, `gold_status` and `agreement` in the tooltip or table. The existing `gold` boolean represents unqualified GOLD. Comparison curves, incomplete conditions and engineering scenarios carry their stated scope. The standalone evidence explorer in the Physics regression artifact renders the same segment and range metadata.

Run `node scripts/fighter-sim-inputs.cjs --check` to verify the published JSON from the source catalog. Run `node scripts/derive-fighter-evidence.cjs --check` to rebuild the standalone explorer and verify the preceding evidence pack.
