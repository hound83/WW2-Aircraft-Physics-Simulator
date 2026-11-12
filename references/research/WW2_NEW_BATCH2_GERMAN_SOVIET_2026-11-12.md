# New Batch 2 — Part 2 German / Soviet focused extraction

**As of:** 2026-11-12  
**Scope:** Extraction of available public and open-source content for German (Bf 109, Fw 190) and Soviet (NII VVS, Yak, La) types, focusing on stall, IAS/CAS, drag, and power available.  
**Method:** Same approach as New Batch 1 — pull full available PDF/HTML content where accessible.  
**Note:** Full original Rechlin and NII VVS PDFs with instrument-corrected stall CAS and position-error tables are not freely extractable in open sources. Public transcriptions (Kurfürst, secondary NII VVS summaries) supply the quantitative data below.

---

## 1. German sources (Bf 109 / Fw 190)

### Rechlin Kennblätter and Vergleichsfliegen
- Public Kennblatt transcriptions (e.g., Bf 109 G-1, Erprobungsnummer 1586) give speed and climb tables at defined power settings and masses. These were already fully extracted in Batches 1–2.
- Vergleichsfliegen (F-4 vs A-2, etc.) give relative speed and climb comparisons. Absolute instrument-corrected stall values are not present in the open transcriptions.
- Explicit position-error / IAS-to-CAS correction tables for the 109 or 190 are rare in public HTML. Reports typically present true or faired speeds.

### Stall / low-speed data (open sources)
- Captured-aircraft and secondary notes frequently cite approximate stall ranges:
  - Bf 109: ~150–170 km/h IAS (flight configuration), lower with flaps and slats.
  - Fw 190: higher than the 109 (secondary tables often ~180–210 km/h range).
- Primary instrument-corrected CAS/EAS with known mass and configuration remain sparse in open sources.
- Leading-edge slats on the 109 are noted as improving low-speed handling; quantitative CLmax from primary flight tests is thin.

### Pilot manuals
- Flugzeug-Handbuch and Bedienungsvorschrift for F/G/K series exist in archive collections.
- Finnish Air Force G-2 and G-6 manuals (translations available) contain operational limits and some performance numbers.
- These manuals are stronger on operations and engine limits than on full flight-test appendices or stall CAS tables.

---

## 2. Soviet sources (NII VVS and related)

### Comparative trials (mid-1943)
Public summaries of NII VVS joint tests (Yak-9 / La-5FN vs Bf 109G-2 / Fw 190A-4) give the following quantitative points (flight weights and speeds as reported):

| Aircraft | Flight weight (kg) | Max speed sea level (km/h) | Max speed at altitude (km/h) | Altitude (m) |
|----------|--------------------|----------------------------|------------------------------|--------------|
| Yak-9 | 2873 | 520 | 599 | 4300 |
| La-5FN | 3148 | 562 / 595 (forced) | 648 | 6300 |
| Bf 109G-2 | 3023 | 524 | 666 | 7000 |
| Fw 190A-4 | 3989 | 510 | 610 | 6000 |

- Turn times at 1000 m and other relative maneuverability notes are also present in secondary extracts.
- Explicit instrument-corrected stall CAS and position-error tables for the captured German aircraft or for Soviet fighters are limited in open sources.

### Soviet fighter pilot instructions
- La-5 (M-82) and Yak-7(b) pilot instructions give operational speeds:
  - Take-off: ~150–165 km/h
  - Landing: ~140–155 km/h
- Engine settings and supercharger changeover altitudes are documented.
- Full calibrated stall curves or PEC tables are not present in the public extracts.

---

## 3. Extraction status for this batch

| Source type | Extracted now | Still locked |
|-------------|---------------|--------------|
| Rechlin Kennblätter / Vergleichsfliegen | Speed/climb tables (already in Batches 1–2) | Instrument-corrected stall CAS, PEC |
| NII VVS comparative trials | Relative speed, climb, weight points | Full original report tables, stall CAS |
| German pilot manuals | Operational limits located | Full performance appendices |
| Soviet pilot instructions | Operational speeds | Calibrated stall and PEC |

---

## Recommendation

The quantitative coverage for German and Soviet types remains strongest on speed, climb, and engine ratings (already transcribed in earlier batches). Instrument-corrected stall CAS and position-error tables continue to be the largest gaps. Full original PDFs of Rechlin and NII VVS reports are not freely extractable in the same way as the NACA wartime reports.

**Next options:**
- Proceed to the third new batch (pilot manuals across all identified families), or
- Package existing speed/climb data into graded JSON while clearly marking stall and PEC as “missing / estimated.”

---

## Lineage
- Kurfürst transcriptions
- NII VVS comparative trial summaries (open secondary sources)
- Finnish and German manual listings
- Supplemental research note (2026-11-12)
