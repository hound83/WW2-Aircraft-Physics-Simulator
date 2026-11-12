# New Batch 3 — Pilot manuals across identified families

**As of:** 2026-11-12  
**Scope:** Extraction of available public content from pilot manuals for the identified aircraft families, focusing on performance data, stall notes, IAS/CAS corrections, flying limitations, and operational speeds.  
**Method:** Same approach as previous new batches — pull full available text from open PDFs and HTML.

---

## 1. Spitfire IX / XI / XVI — AP 1565J Pilot’s Notes (3rd Edition)

**Document:** Air Publication 1565J, P & L — Pilot’s Notes.

### Position error corrections (extracted from open PDF text)
From the operating data section:

| IAS (mph) | Correction |
|-----------|------------|
| 150–170   | Add 2 mph |
| 170–210   | 0 |
| 210–240   | Subtract 2 mph |
| 240–290   | Subtract 4 mph |
| 290–350   | Subtract 6 mph |

(Approximate reconstruction from the partial OCR table in open extracts; original table on p. 53.)

### Climb speeds for maximum rate of climb
- S.L. to 26 000 ft: 160 mph IAS
- 26 000–30 000 ft: 150 mph IAS
- 30 000–33 000 ft: 140 mph IAS
- 33 000–37 000 ft: 130 mph IAS
- 37 000–40 000 ft: 120 mph IAS
- Above 40 000 ft: 110 mph IAS

### Flying limitations (examples)
- Diving: 450 mph IAS (typical limit cited)
- Undercarriage down: 160 mph IAS
- Flaps down: 160 mph IAS
- Restrictions with external tanks and bombs noted (straight flying only until jettisoned).

**Status:** Position-error table and climb-speed schedule extracted from open PDF text. Full clean table remains in the original notes.

---

## 2. P-47D — AN 01-65BC-1A Pilot’s Flight Operating Instructions (25 January 1945)

**Document:** AN 01-65BC-1A for P-47D-25 through D-35.

**Publicly available content:**
- Operational manual covering systems, engine limits, emergency procedures.
- Stall notes appear in related training manuals (AAF Manual 50-5 and sim-derived extracts): power-off stalls mild; power-on tendency for left wing drop; recovery straightforward.
- Explicit instrument-corrected stall CAS tables are not prominent in the open operating instructions; stall behavior is described qualitatively.
- Engine and airspeed limitations are present but full performance appendices are limited in free extracts.

**Status:** Operational and qualitative stall notes extracted; full numerical stall CAS tables remain thin in open sources.

---

## 3. Bf 109 (F/G/K) — Flugzeug-Handbuch and Bedienungsvorschrift

**Sources located:**
- Finnish Air Force Bf 109 G-2 and G-6 manuals (translations exist).
- Various Bedienungsvorschrift-Fl and Flugzeug-Handbuch for E/F/G/K series (archive collections).
- Armament-specific manuals (e.g., L.Dv.T. 2109 G-6/U4) available on archive.org.

**Performance content in open sources:**
- Operational speeds (take-off ~150–180 km/h, landing ~130–150 km/h range in secondary extracts).
- Engine settings and limitations.
- Full instrument-corrected stall CAS or position-error tables are not present in the public manual extracts.

**Status:** Manuals located and operational limits noted; quantitative stall/PEC data remains sparse.

---

## 4. Fw 190 (A/D) — Flugzeug-Handbuch and operating instructions

**Sources located:**
- Fw 190 A-5/A-6 Flugzeug-Handbuch and Bedienungsvorschrift (archive collections).
- A-8 and D-9 manuals noted in secondary listings.

**Performance content:**
- Operational and cooling notes stronger than stall data.
- Explicit stall CAS and PEC tables thin in open extracts.

**Status:** Located; quantitative low-speed data limited.

---

## 5. Other families (summary)

| Family | Manual | Performance content extracted |
|--------|--------|-------------------------------|
| P-51 | USAAF / NACA notes | Covered in earlier batches |
| F4U / F6F | BuAer data sheets | Partial (Batch 11) |
| Japanese | TAIC Manual No. 1 | Comparative speed/climb/turn (Batch 11) |
| Soviet (Yak/La) | Pilot instructions | Operational speeds (~150–165 km/h take-off, ~140–155 km/h landing) |

---

## Extraction status for this batch

| Manual | Extracted now | Still locked |
|--------|---------------|--------------|
| Spitfire AP 1565J | Position-error table (approx.), climb speeds, limitations | Clean original table |
| P-47D AN 01-65BC-1A | Operational limits, qualitative stall | Full stall CAS |
| Bf 109 manuals | Operational speeds, engine limits | Stall CAS, PEC |
| Fw 190 manuals | Located; operational notes | Stall CAS, PEC |
| Soviet pilot instructions | Operational speeds | Calibrated stall |

---

## Recommendation

The Spitfire Pilot’s Notes yielded the most useful quantitative extraction in this batch (position-error corrections and climb-speed schedule). German and Soviet manuals remain stronger on operations and engine limits than on instrument-corrected stall or position-error data.

**Next options:**
- Package existing speed/climb + the new Spitfire PEC data into graded JSON, or
- Continue targeted PDF pulls on any remaining high-value manuals if specific ones are prioritized.

---

## Lineage
- Spitfire IX/XI/XVI Pilot’s Notes AP 1565J (open PDF extracts)
- P-47D AN 01-65BC-1A and related training notes
- Finnish and German manual listings
- Soviet pilot instruction extracts
- Supplemental research note (2026-11-12)
