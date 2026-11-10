# Versioned WW2 fighter evidence and stall-speed research (2026-11-10)

**Release:** simulator v3.14.0 · **Status:** source evidence, not automatic aerodynamic calibration.

## Result: broad evidence, with original speeds and correction status intact

The source index now feeds the **working simulator build**, rather than remaining only as detached research documents. `scripts/research-layer.cjs` loads the original two report/series pairs and every compatible compact pack under `references/research/`. `npm run build` produces both `dist/research-catalog.json` and an embedded searchable **Historical research evidence** panel in `dist/model.html`.

| Metric | Pre-release | v3.14 release | Interpretation |
| --- | ---: | ---: | --- |
| Historical report/index entries | 75 | **134** | Different reports may refer to the same aircraft |
| Recorded table rows | 553 | **726** | **173 additional stall/minimum-speed conditions**, not necessarily new independent experiments |
| Historical stall/minimum-speed rows | 17 | **190** | Original 17 + US 115 + international 44 + 6 Corsair handbook + 8 NACA Hurricane II |
| Airframe *labels* | 41 | **76** | Variant/specimen/name strings, **not 76 distinct aircraft or active simulation profiles** |
| Original+independent research packs | 2 legacy pairs | 2 legacy pairs + **4 research packs** | 19 airspeed-correction curves plus original source links and SHA-256 fingerprints |

The US pack (`references/research/stall_us_2026-11-10.json`, 26 KB) contains 20 compact sets/115 rows from 22 source records. The international pack (`references/research/stall_global_2026-11-10.json`) contains 17 series/44 normalized observations from 17 sources; its extra series descriptions are audit context, **not a second set of data rows**. The two new **airspeed correction** packs provide 20 more source records, 19 calibration curve descriptions, and 14 additional original manual/NACA stall conditions. The simulator still has its own physically calibrated/research model airframe inventory. Adding a report does **not** create an aircraft model or change its fitted drag, CLmax or power curves.

### Stall findings that materially change what we know

1. **P-51B-5 43-6883**: nine USAAF Eng-47-1734-A [stall rows](https://www.wwiiaircraftperformance.com/org/p-51/p-51b-6883.html), with individual **approximate** weights **9,045–9,100 lb**. The report says the displayed IAS has **instrument error removed**. It does **not** establish that the near-stall position error was removed; these are **corrected IAS\***, not measured CAS.
2. **P-51B-15 43-24777**: nine additional [USAAF rows](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) with exact report-row stall weights. This is a distinct production block/engine from 43-6883; never merge them into one test curve.
3. **Spitfire IX/XI/XVI**: the September 1946 Air Ministry [A.P.1565J manual](https://zenoswarbirdvideos.com/Images/spit/SPIT9MANUAL.pdf), para. 42, reports 12 **engine-off IAS** configurations for **7,150 / 7,800 / 8,700 lb**, distinguishing normal from rear-view fuselages. The available near-stall correction table begins at **120 mph IAS**, above the reported 75–117 mph stalls. Do not extrapolate and do not call the pilot manual a controlled experimental CLmax test.
4. **P-38J, P-47D, F4F, FM-2, F6F-3/5, F4U and relatives**: original USAAF/USN or handbook entries add weight/configuration coverage; some sources contain **minimum speed**, not definitively power-off one-g stall speed. In particular, **P-47D** report IAS is explicitly uncorrected.
5. **F4U-4 (1948)**: four original post-war (but WWII-era aircraft) test conditions are explicitly **CAS**. They are not interchangeable with F4U-1 or F4U-1A/FG-1 installed configurations. A configuration-label ambiguity is recorded in the pack.
6. **Hurricane, Typhoon, Tempest, Bf 109, Fw 190, Zero, Ki-43 and Ki-84**: international pack preserves variant, normal/loaded weight, exact/source ranges, IAS or unknown speed status, and caveats. The **Hurricane II low-speed OCR conflict** remains disputed; it is not silently resolved as a precise number.
7. **Corsair F4U-1/F3A-1/FG-1 (1945 pilot manual)**: original [AN 01-45HA-1](https://www.vmfa251.org/pdffiles/Corsair%20Manual.pdf), printed pp. 40 and 45, gives **75 knots IAS** at **11,300 lb**, gear down, **50° flaps**, power off; its *landing* correction has **70 IAS→67 corrected** and **80 IAS→78 corrected** knots. Linearly interpolating **within** that original range yields **72.5 knots / 83.43151 mph `CAS*`**. Crucial qualifier: the original manual identifies the position error but **assumes zero instrument scale error**. The clean 87-knot stall falls *below* the clean correction table, so it stays IAS without a fabricated conversion.
8. **NACA Hurricane II Z2963**: original 1942 [flight-quality report WR-L-565](https://ntrs.nasa.gov/api/citations/19930092603/downloads/19930092603.pdf) adds **eight** IAS stall configurations at **7,014 lb**, explicitly distinguishing open versus closed gun ports and gliding/climb/landing/wave-off power. NACA original **low-speed** correction graphics for this specimen, and [Spitfire VA WR-L-353](https://digital.library.unt.edu/ark:/67531/metadc61033/m2/1/high_res_d/19930092581.pdf), are indexed with figure/page locators. Their numerical curves have **not** yet been digitized to reliable source-point precision; they cannot generate `CAS*` today.
9. **19 airspeed correction curves:** original [F6F-3/F6F-5 handbook](https://www.theshermantank.com/wp-content/uploads/2015/12/Grumman-F6F-Pilot-Manual.pdf), P-38J, P-47B/N, P-51D and other sources supply original points. F6F-3 and -5 have **different, even opposite correction directions**; treat their IAS calibration as variant-specific. P-38J, P-47B and P-51D curves start **above** their recorded stall IAS, so they are not extrapolated downward. International collection includes six Spitfire IX position-error *speed bins* (endpoint representations are derived from printed offsets, **not extra experiments**), A6M3 instrument and CAS curves, and two original NACA low-speed figure references pending digitization.

## Choosing the best available speed, without inventing CAS

This is a **quality priority**, not a blanket pass/fail that discards useful reported data. Present counts are **4 source-reported CAS, 1 source-corrected CAS\*, 15 instrument-corrected IAS\*, 109 reported IAS and 61 unknown-basis stall/minimum-speed rows**. These categories still mix original tests, manuals and repeats:

| Source and conversion evidence | Candidate shown in simulator | What is actually known |
| --- | --- | --- |
| Original report explicitly reports CAS | **CAS** | Source-reported calibrated airspeed; still inspect configuration and test quality |
| Applicable numeric IAS→CAS correction, same documented source/variant and flap/gear state, within source table | **CAS\*** | Provisional result with correction-table source and interpolated numeric value; not an independent measured CAS |
| Source explicitly says instrument error removed, no applicable position correction | **IAS corrected\*** | Better than uncorrected IAS, but **not CAS** |
| IAS without demonstrated instrument and position correction | **IAS** | Reported cockpit/indicated speed |
| Unit or basis unstated | **Unestablished** | Raw historical evidence; not converted |

The research layer computes an original and best-supported provisional candidate for **each stall row**. It can apply numerical correction curves from versioned packs when the mapping, source identities, configuration, and measured **speed interval** match. Interpolation is allowed only **between** source anchors; extrapolation is blocked. Source curves in **knots** are converted to mph using **1 kt = 1.150779448 mph**, retaining original knots in audit metadata. The engine neither converts IAS into EAS by assumption nor silently refits stall coefficients. The asterisk always signals **provisional interpretation**, not false certainty.

If a source merely *mentions* a correction without publishing values valid at stall speed, the reported corrected IAS is still preserved and preferred over raw IAS; no fictional offset is added. This is especially relevant for Mustang, Thunderbolt and Spitfire stalls. The browser also indexes the calibration curves themselves, including their original domain and unpaired source status. **Search for direct CAS/EAS remains an active priority even after usable correction charts are found**.

## Research layer and physical simulator are intentionally separate

- **Research domain:** numeric arrays have no imposed universal WW2 fighter limits. Any new scientifically sourced altitude, airspeed or gross/instantaneous weight appears automatically; the browser calculates min/max from the actual matching rows. Test fixture checks 120,000 ft, 1,800 mph and 220,000 lb *as archive-format flexibility*, not plausible propeller-fighter conditions.
- **Model domain:** the numerical solver retains its aircraft-specific engine, power, propeller, configuration and calibrated altitude/speed support limits. A newly indexed row outside those limits cannot extend valid performance prediction or change a certified comparison.
- **Fit eligibility:** all newly indexed historical rows and provisional `CAS*` estimates have `fit_eligible:false`. To activate one for physical coefficient fitting, verify actual specimen/variant, flight condition, engine/propeller, independent speed correction, **mass at the stall**, source page and holdout split. Do not transfer an IAS correction across different variants, gear/flap states or unmeasured speed ranges without an explicit provisional transfer policy.
- **Counting:** rows, report entries, specimen identities, manual estimates, and independent flight tests are different measures. Never interpret 726 source rows as 726 distinct experimental flights or an accuracy score.

## How to add the next research pack with no integration-code change

Put one small JSON file under `references/research/`, named for the project and date; use `schema: "ww2-fighter-evidence-pack/v1"`, `pack_version: "1.0.0"`, `sources: [{id, report, pdf, ...}]`, and either:

- **Compact numeric series**: `series: [{id,source_id,aircraft,quantity,speed_basis,corrections,columns:[...],rows:[[...], ...]}]`. Recommended for many points or altitudes/weights.
- **Fully qualified rows**: `observations: [{id,source_id,aircraft,quantity,value:{speed_mph,weight_lb,...},corrections:{instrument,position},notes,...}]`. Best for nuanced, mixed-specificity stall configurations and ranges (`speed_min_mph`/`speed_max_mph`).
- **Calibration tables**: `calibration_curves: [{id,source_id,applies_to_source_ids:["full-pack-id:source-id"],mapping:"IAS_to_CAS"|"instrument_corrected_IAS_to_CAS"|"IAS_to_instrument_corrected_IAS",unit:"mph"|"knots",configuration:{gear:"up",flaps:"up"},rows:[[x,y],...],source_location,notes}]`. The indicated source and *target observations* must exist in the registry. The mapping must state what the original table corrects, not an inferred equivalent. `CAS*` requires matched source/configuration and in-domain speed.

The compiler checks row widths, finite numeric values, source references, version metadata, duplicate observation identifiers, and CAS claims. Its manifest fingerprints every source pack and records a total SHA-256. `npm run check` rebuilds and checks regressions; `npm run test:browser` additionally exercises the new source explorer where a headless browser is available. Bump the **pack version** when editing existing evidence, preserve reported values in the original columns, and never put multi-megabyte scan images into Git: link to PDF, table/page, original figures and relevant cropped image URLs instead.

## Remaining research tasks

1. Acquire **source-original, low-speed IAS→CAS / position-error curves**, with matching gear, flap and power setup; plot/image digitization must include traceable calibration uncertainty and not extrapolate from 120/170 mph down to 70–100 mph.
2. Find **direct CAS/EAS** near stall for the same airframe and weight. A generic operating handbook may be valuable as a *provisional transfer* but is not the individual flight-test calibration.
3. Recover **individual instantaneous weights** where only takeoff/nominal weight was recorded, and verify which numbers are experimental stalls, manual speed recommendations, or manufacturer projections.
4. Cross-link duplicated original reports/serials across the 553 legacy and 159 newly catalogued rows before calculating source-independent validation metrics.
5. After a gate is passed, create **separate numerical simulator version(s)** that admit the fitted value, show regression/deterioration against the baseline, and require the previously declared check conditions. Keep the source registry itself updated regardless of fitting outcome.
