# Supplemental research note: remaining gaps + German/Soviet deep-dive

**As of:** 2026-11-12  
**Purpose:** (1) Exact report/page pointers for stall CAS, IAS/CAS corrections, drag polars, and power-available data still locked in original PDFs. (2) Focused extraction of every available open numerical value for the weakest families (German and Soviet).

---

## Part 1 — Exact report pointers for remaining high-value data

| Report | Aircraft | What it still contains | Status in batches |
|--------|----------|------------------------|-------------------|
| NACA WR L-566 (Flying Qualities and Stalling Characteristics of XP-51) | XP-51 | Full stall CAS/EAS by configuration, mass, CG; instrument corrections | Partial (qualitative only in Batch 7) |
| NACA WR L-86 / ACR L5H11a | P-47D | Full profile-drag polar (Cd vs CL, Mach); smooth section Cd min 0.0062 | Partial (Cd min only in Batch 9) |
| NACA RM (P-47D-30 flying qualities, AAF 43-3441) | P-47D-30 | Stall time histories; buffeting ~4–5 mph above stall; controllable roll-off | Partial (Batch 9) |
| Spitfire IX/XI/XVI Pilot’s Notes AP 1565J, p. 53 | Spitfire IX series | Position error corrections (PEC) table | Not extracted |
| A&AEE reports on BS.543 / related | Spitfire IX | Measured position error as part of performance trials | Partial (Batch 3) |
| Wright Field / BuAer data sheets | Mustang, P-47, F4U, F6F | Full altitude tables of true speed, climb, power; some CAS | Partial |
| NACA ACR 4K02 / related Mustang profile-drag | P-51 | Laminar-wing profile drag points | Partial (Batch 7) |

**Highest-leverage next PDFs to open:** L-566, L-86, Spitfire Pilot’s Notes p. 53, P-47D-30 RM.

---

## Part 2 — German / Soviet focused extraction (open sources)

### Bf 109 (all marks covered in Batches 1–2)

**Stall / low-speed**
- Public Kennblätter and Kurfürst transcriptions give limited explicit stall CAS. Secondary sources and captured-aircraft notes frequently cite ~150–170 km/h IAS (flight configuration) depending on mark and mass; landing configuration lower. Exact instrument-corrected values remain sparse.
- Leading-edge slats are noted as improving low-speed handling; quantitative CLmax or stall CAS from primary flight tests is thin in open HTML.
- Finnish MT-215 and Rechlin Vergleichsfliegen focus on speed/climb, not stall.

**IAS/CAS corrections**
- German flight-test reports (Rechlin, manufacturer) typically present true or faired speeds. Explicit position-error tables for the 109 are rare in public sources.
- Pilot manuals (Bedienungsvorschrift, Finnish G-2/G-6 translations) exist and contain operational limits and some performance numbers, but detailed PEC tables are not prominent in the open excerpts.

**Drag / power available**
- Climb and speed tables already extracted (Batches 1–2). Direct useful power or propeller-efficiency curves remain sparse. Engine ratings (DB 601/605, combat/restricted settings, GM-1, MW 50) are the strongest anchors.

**Pilot manuals located**
- Bf 109 F-1 to F-4 Flugzeug-Handbuch (D.(Luft) T.2109) — technical, not performance-focused.
- Finnish Air Force Bf 109 G-2 and G-6 manuals (translations exist).
- Various Bedienungsvorschrift-Fl and Betriebs- und Rüstanleitung for E/F/G/K series (available in collections; performance tables limited in public HTML).

### Fw 190 (Batches 5–6)

**Stall / low-speed**
- Open sources give limited explicit stall CAS. Secondary notes cite higher values than the 109 (roughly 180–210 km/h range in some sim/secondary tables); primary instrument-corrected numbers are scarce.
- WNr 783 Flugbericht and A-5/A-8 tables focus on climb and level speed with cooling state, not stall.

**IAS/CAS**
- Same pattern as 109: faired true speeds common; explicit PEC tables rare in public HTML.

**Drag / power**
- Open/closed cooling climb points already extracted. Direct η or useful power still sparse. BMW 801 ratings and MW 50 effects covered.

**Pilot manuals located**
- Fw 190 A-5/A-6 Flugzeug-Handbuch and operating instructions exist in archive collections.
- A-8 and D-9 manuals noted in secondary listings.

### Soviet sources (NII VVS and related)

**On captured German aircraft**
- NII VVS tested captured Bf 109E-3 (1939–40) and later G-series. Reports contain stick-force and stability data; some speed/climb points. Explicit stall CAS and full PEC tables are limited in open extracts.
- Comparative trials (Yak-9 / La-5FN vs Bf 109G-2 / Fw 190A-4) give relative performance but sparse absolute instrument-corrected numbers.

**On Soviet fighters (Yak, La)**
- Pilot instructions (e.g., La-5 with M-82, Yak-7(b)) exist and give operational speeds (take-off ~150–165 km/h, landing ~140–155 km/h) and engine settings. Explicit instrument-corrected stall CAS and position-error tables are thin in public HTML.
- NII VVS comparative data emphasize maneuverability and relative speed/climb rather than full polar or calibrated stall curves.

**Gaps that remain largest for German/Soviet**
1. Instrument-corrected stall CAS/EAS with known mass and configuration.
2. Position-error / IAS-to-CAS correction tables.
3. Full drag polars or useful-power curves.
4. Complete page-by-page pilot-manual performance tables (most manuals are technical or operational rather than full flight-test appendices).

---

## Pilot manuals located across identified families (summary)

| Family | Manuals located | Performance content in open sources |
|--------|-----------------|-------------------------------------|
| Spitfire IX/XI/XVI | AP 1565J Pilot’s Notes | Position error corrections (p. 53); operational limits |
| Bf 109 F/G/K | Flugzeug-Handbuch, Bedienungsvorschrift, Finnish G-2/G-6 | Operational limits; limited stall/speed tables |
| Fw 190 A/D | Flugzeug-Handbuch, operating instructions | Operational; cooling and power notes stronger than stall |
| P-51 | Various USAAF / NACA | Covered in Batches 7–8 |
| P-47 | AN 01-65BC-1A Pilot’s Flight Operating Instructions | Operational; stall notes in separate NACA RM |
| F4U / F6F | BuAer data sheets + pilot notes | Partial (Batch 11) |
| Japanese (TAIC) | TAIC Manual No. 1 | Comparative speed/climb/turn (Batch 11) |
| Soviet (Yak/La) | Pilot instructions (La-5, Yak-7, etc.) | Operational speeds and engine settings |

---

## Recommendation

The weakest quantitative coverage remains **instrument-corrected stall CAS and position-error tables for German and Soviet types**. The highest-leverage next steps are:
1. Open the Spitfire Pilot’s Notes p. 53 and NACA L-566 / L-86 PDFs for the Allied side.
2. For German/Soviet, prioritize any surviving Rechlin or NII VVS appendices that list stall or instrument corrections (currently thin in public HTML).
3. Package the existing speed/climb tables into simulator-ready JSON while clearly grading the stall and PEC gaps as “missing / estimated.”

