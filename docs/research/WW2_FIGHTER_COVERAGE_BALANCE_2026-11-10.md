# WW2 fighter evidence: coverage balancing and specimen-resolved trials (2026-11-10)

**Status:** historical research archive, **not** an approved simulator fit, validation threshold or physics-model change. The numbers below are transcribed from named period trials, with references to PDFs where located. Keep originals external; store compact source metadata and reported observations in Git.

## Deliverable and scope

- [`references/ww2_fighter_balanced_reports_2026-11-10.json`](../../references/ww2_fighter_balanced_reports_2026-11-10.json): 14 source entries identifying **13 individual test airframes** (Fw 190 D-9 WNr 210002 occurs in two separate Flugberichte). One source (P-38G report B01) was already catalogued as R11; P-38J-15 serial 43-28392 also appears in the previous catalog under a distinct report, R12. **Do not count source entries as independent trials or airframes.**
- [`references/ww2_fighter_balanced_observations_2026-11-10.json`](../../references/ww2_fighter_balanced_observations_2026-11-10.json): **32 additional compact numeric series, 264 reported conditions**. Each series records units, aircraft serial, report location and equipment/power constraints.
- The previous historical dataset was 44 series / 289 rows from 61 source records. The **combined reference library** now holds **76 series / 553 observation rows** (+32 series, +264 rows, **+91.3% rows**), pending source-image rechecks. These are cumulative historical-record counts, not 553 independent test flights and not 553 accepted solver validation points.
- No simulator numerical coefficients, model code, acceptance gates, site UI, source PDFs or scanned figures were modified/committed.

## Coverage: before vs after

The first milestone concentrated on Spitfire IX (83 rows), Typhoon IB (48), P-51 family (45), Corsair family (47), Hellcat family (26), Bf 109 G (19), and a few one-off records. This milestone selectively fills formerly empty or sparse **speed, climb, stall and airspeed-correction** categories.

| Fighter family / specimen group | Prior rows | Newly transcribed | Combined rows | Main new dimensions |
| --- | ---: | ---: | ---: | --- |
| P-38G / P-38J | 0 | **24** | **24** | 15 level-speed, 9 climb, power **per engine**, MP / turbo data |
| P-47B / P-47D | 2* | **36** | **38*** | 11 speed, 14 climb, 11 stall IAS with flap/gear states |
| A6M3 Zero/Hamp | 0 | **32** | **32** | 10 IAS/CAS calibration, 10 speed, 10 climb, 2 stalls |
| Hurricane Mk I / IIB | 0 | **83** | **83** | IAS/TAS/boost, two weights (different engine), compressor settings, ROC |
| F4F/FM-2 Wildcat | 3* | **26** | **29*** | 10 speeds, 8 climbs, 8 minimum-speed configuration rows |
| Fw 190 A-5 / D-9 | 4* | **16** | **20*** | WNr 210001/210002 speed at combat/takeoff/MW50, equipment states |
| Mustang III / P-51 family | 45* | **47** | **92*** | 22 climb/time, 21 paired TAS/IAS, four PEC anchors; +25 boost |
| **All pre-existing + new types** | **289** | **264** | **553** | **44 → 76 series** |

* Prior row counts shown for a **related aircraft family** (P-47D drag-section data, F4F-3 roll, Fw 190 A-5, early P-51s), **not an identical subvariant, operating point or aircraft**. These cannot be blended into a single speed/climb curve. The table deliberately distinguishes archival breadth from true per-variant completeness.

### New observations by specimen (not source-document count)

| Aircraft / original serial | New rows | Source identifier | Primary-reference situation |
| --- | ---: | --- | --- |
| P-38G-1 42-12687 | 13 | B01 | Original 1943 Wright Field [PDF](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38G-1_42-12687_FS-M-19-1538-A.pdf) |
| P-38J 43-13563 | 6 | B02 | Original Wright Field [PDF](https://www.wwiiaircraftperformance.com/org/p-38/p-38_files/P-38J_43-13563_Eng-47-1656-A.pdf), leaky induction |
| P-38J-15 43-28392 | 5 | B03 | [Transcribed USAAF memo](https://www.wwiiaircraftperformance.com/org/p-38/p-38-28392.html) |
| P-47B 41-5902 | 16 | B04 | Original 1942 [PDF](https://wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf) |
| P-47D 42-26167 | 20 | B05 | [Transcribed 44-1 fuel flight test](https://www.wwiiaircraftperformance.com/org/p-47/p47-26167.html) |
| A6M3 captured EB-201 | 32 | B06 | [1944 test transcription](https://www.wwiiaircraftperformance.com/org/japan/hamp-eb201.html), scanned original not linked |
| Hurricane I L2026 | 51 | B07 | [RAF A&AEE detailed tables](https://www.wwiiaircraftperformance.org/hurricane/l2026.html), normal/overload |
| Hurricane IIB Z3564 | 32 | B08 | [RAF A&AEE detailed tables](https://www.wwiiaircraftperformance.org/hurricane/z3564.html), all performance on Z3564 |
| FM-2 BuAer 16169 | 14 | B09 | Original Patuxent [PDF](https://www.wwiiaircraftperformance.org/f4f/fm-2-16169.pdf) |
| FM-2 BuAer 15953 | 12 | B10 | Original Patuxent [PDF](https://www.wwiiaircraftperformance.org/f4f/fm-2-15953.pdf) |
| Fw 190 D-9 WNr 210001 | 4 | B11 | Original German [Flugbericht PDF](https://www.wwiiaircraftperformance.org/fw190/Fw_190_D-9_210001_FB_Nr1.pdf) |
| Fw 190 D-9 WNr 210002 | 12 | B12 + B14 | Original German [Nr 1](https://www.wwiiaircraftperformance.org/fw190/Fw_190_D-9_210002_FB_Nr1.pdf), [Nr 2](https://www.wwiiaircraftperformance.org/fw190/Fw_190_D-9_210002_FB_Nr2.pdf) |
| Mustang III FX858 | 47 | B13 | [RAF +25lb Merlin-100 trials](https://www.wwiiaircraftperformance.org/mustang/fx858.html) and linked original figure images |

## Stronger dataset used as quality reference: Mustang III FX858

The FX858 RAF trials are unusually useful because Table I gives **22 climb-rate/time-to-height rows** and Table II gives **21 altitude-specific speed pairs with TAS and IAS**; section 4.1 adds **four position-error calibration anchors**. This is *not* an exact stand-in for the P-51B-5 standard fuel/boost configuration already simulated:

1. FX858 uses a Merlin 100, **150-grade fuel**, 3000rpm and a short-duration **+25 lb/in²** combat setting; ordinary V-1650-7 conditions are different.
2. The climb table is standardized at **9,260lb**, radiator and oil-cooler flaps **fully open**; the speed table is corrected to **8,800lb** (95% of takeoff weight), coolant/oil exit flaps at **minimum opening**. Combining these directly for a drag/power fit would create artificial contradictions.
3. The source itself marks 4,600ft (climb) and 9,000ft (speed) as blower transitions; no single exact boost number was invented at these split points.
4. Original HTML fractional-glyph corruption affects the detailed PEC/CEC columns. The original report's **IAS/TAS pairs** and prose PEC anchors are preserved, but precise conversion analysis should verify the original graph images before use.
5. Table I extends beyond the **five-minute operating limit**: historical standardized performance beyond 5 minutes is not automatically a permissible sustained combat climb.

## Research integrity / documented anomalies

- **P-38G/J:** brake horsepower values are **per engine**; neither data source licenses simply doubling reported power and plugging it into a single-engine calibration. P-38J 43-13563 induction leakage depresses measured performance and must not set a typical P-38J envelope.
- **P-47B:** the climb presentation changes from military 2700rpm/2000BHP to rated 2550rpm/1625BHP at 12,600ft. The paired points at the transition are two settings, not contradictory duplicate tests. **P-47D** 31,400ft summary / 31,900ft section V differs for the 412mph point: BS08 marks it disputed rather than normalizing it away.
- **A6M3 EB-201:** the original reported airspeed *position* correction is CAS minus the water-column reading, **not** necessarily CAS minus cockpit IAS. The dataset preserves all columns; low-airspeed stall IAS cannot be converted to CAS by extrapolating a 120–300mph calibration table. The wartime report explicitly could not reconcile engine horsepower charts and therefore provided no BHP.
- **Hurricane I:** L2026's 6,316lb vs 6,750lb runs used different engine installations, so the nominal weight delta does not isolate mass effects. The normal-loading **57mph stall is IAS** but incompletely described; must not replace the P-51 or Bf 109 calibrated stall tests. **Hurricane II:** an abbreviated summary prints 8.8 min at 25,000ft, inconsistent with its detailed table giving 12.7 min at 26,000ft. Detailed source conditions are retained; suspect summary is excluded. Z2346 only supplied handling trials.
- **FM-2 original-scan correction:** the online HTML transcription prints **2,430ft/min** at 2,600rpm military, vs 3,480ft/min at 2,700rpm. The actual **Patuxent PDF, first page** shows **3,430ft/min**, resolving the discrepancy. BS23 preserves **3,430 as the scanned primary source's value**, explicitly documenting this significant HTML transcription error. BuAer 15953 'minimum speed' does **not** explicitly establish IAS or CAS, so it remains basis-unknown.
- **Fw 190 D-9:** WNr 210001 had repeated engine replacements; WNr 210002's with/without ETC rack comparison also changes wheel doors, preventing isolation of rack drag. In the latter airframe's separate Nr 2 report, increased boost and MW50 are not routine combat power.
- **Source status:** scans are linked when located; transcribed historic reports are clearly labeled as such and warrant scan-to-table review before physics validation. Digital OCR errors and period-report arithmetic errors are *recorded*, not silently fixed.
- **Ki-84 archival trap:** original USAAF [F-IM-1119C-NDT-2](https://www.wwiiaircraftperformance.org/japan/T-2_Report_on_Frank_I_Ki-84.pdf) contains a full performance summary near its front, but the headings/normal-vs-overload speed relationship require provenance verification; earlier archival audit R48 explicitly separated **measured handling/stall** from **performance predictions**. Those summary speed and climb figures are deliberately *not* added as flight-tested rows to improve coverage artificially.

## Coverage matrix for next milestone (genuine gaps, not filler counts)

| Aircraft group | Speed | Climb | IAS/CAS or stall | Priority gap |
| --- | --- | --- | --- | --- |
| P-38G/J | Yes | G, J-15 selected | Missing | P-38J climb and power/airspeed correction, ideally unmodified representative J specimen |
| P-47B/D | Yes | Yes | D IAS, not CAS | Original P-47D IAS-CAS figures and full climb/drag curves; scan 412mph altitude dispute |
| A6M3 | Yes | Yes | 10-point calibration + 2 IAS stalls | Original PDF or independent Japanese trials; A6M2/A6M5 same rigor |
| Hurricanes I/II | Yes | Yes | Limited Mk I stall, others missing | Airspeed correction figures; Hurricane II stall by loading and configuration |
| FM-2/F4F | Critical points | Critical points | 8 minimum-speed states, basis uncertain | Continuous altitude curves and actual IAS/CAS classification |
| Fw 190 A/D | D-9 critical points | A/D sparse | Missing | A-series and D-series independent climb/stall and fuller altitude curves |
| Ki-84, Ki-43, Ki-61, J2M/N1K | Sparse or catalog-only | Sparse or catalog-only | Ki-84 3 IAS stalls only | Primary captured-aircraft full performance tables; do not substitute TAIC estimates for flight results |
| P-51 series | Several | Several | FX858 PEC anchors | Original FX858 scan and controlled standard-fuel P-51B comparison |

**Next meaningful step:** preferentially fill missing *dimensions per variant*, not just add reports from already well-covered families. Target original Japanese captured-aircraft tests and full **Fw 190 A-series / P-38J / FM-2** altitude curves, scan-page verification, then construct matched **condition-specific** speed/climb/stall benchmarks. Maintain a separate label for measured, calculated, estimated and disputed data. No automatic version bump just for archive growth.
