# NACA report extraction + broader primary-source expansion

**As of:** 2026-11-12  
**Scope:** Relevant data from the previously cited NACA reports, plus expanded primary-source leads across full families (Spitfire, Bf 109, Fw 190, Mustang, P-47, and related).  
**Status:** Research only. Graded where numbers are available. No solver changes.

## 1. Checked NACA reports and use

| Report | Verified scope and next use |
| --- | --- |
| ACR L4L07 / WR L-177 | Flight tests of the Curtiss 714-1C2-12 four-blade propeller on a P-47C. The existing replay already uses the relevant tabulated efficiency rows. Use those operating points for matched transfers. The broader summary figures need their own table or figure check. [NACA report](https://ntrs.nasa.gov/citations/19930093302) · [Existing propeller replay](../../docs/research/WW2_PROPELLER_REFERENCE_VALUES_2026-11-12.md) |
| MR L5G09a / WR L-594 | Gardner tested the three-blade Hamilton Standard 6507A-2 on a P-47D. Normal and Military climb efficiencies were similar below about 16,000 ft for that installation. Keep this result tied to the tested propeller and loading. [NACA report and original PDF](https://ntrs.nasa.gov/citations/19930093653) |
| ACR 5D20 | Hamilton and Boddy tested a 0.3-scale P-47D in a wind tunnel. The reported pitch limits at level-flight lift coefficients are model results at the specified Mach, lift and altitude mapping. Keep them as a future high-speed airframe check. [NACA report](https://ntrs.nasa.gov/citations/20150011311) |
| ACR 4K02 / WR A-62 | The drag study compares propeller-removed P-51B flight measurements through Mach 0.755 with a scale model. Match configuration and surface condition before transferring drag values. Check lineage with TR 916. [NACA report](https://ntrs.nasa.gov/citations/19930092458) · [Primary report reproduction](https://digital.library.unt.edu/ark:/67531/metadc60838/) |
| ARR L5H11a / WR L-86 | Zalovcik reports a minimum profile drag coefficient of 0.0062 for a smooth **wing section** at 63% semispan. Keep this as section evidence with its stated measurement conditions. [NACA report](https://ntrs.nasa.gov/citations/19930093001) |
| WR L-566 | NACA records flight tests of XP-51 flying qualities and stalling. The prototype configuration and low-speed instrument basis need review before transferring any numerical results to a P-51B case. [NACA report](https://ntrs.nasa.gov/citations/19930092575) · [UNT archive](https://digital.library.unt.edu/ark:/67531/metadc61027/) |

## 2. Expanded non-NACA primary-source leads (full families)

### Spitfire family (all marks)
- **A&AEE Boscombe Down** performance trials: BS.543 (LF/HF IX, Tables II/V), MA.648 (LF IX, Table I), JL.165 (+25 lb), EN409 (RAE high-Mach), K5054 (prototype). 
- **RAE Farnborough:** High-speed wind-tunnel models (ARC R&M 2535 covers Spitfire, Spiteful, Attacker, Mustang). Aileron and compressibility work.
- Use the original BS.543 and MA.648 tables at their own specimen, rating and blower settings.
- **Priority gap:** Near-stall CAS/EAS with instrument correction and run mass for the marks used in 1v1 comparisons.

### Bf 109 family (all variants)
- **Erprobungsstelle Rechlin:** Kennblätter (G-1 with DB 605A, Erprobungsnummer 1586, early 1943), Vergleichsfliegen Bf 109 F-4 vs Fw 190 A-2 (10 December 1941, paired conditions to review), GM-1 trials (E-series, up to +60–105 km/h at 8–11 km).
- **Finnish trials:** MT-215 / WNr 14783 (5 April 1943) — actual 2540 rpm vs 2580 indicated, 1.30–1.32 ata below critical height. Climb from 5–10 km.
- **Soviet NII VVS:** WNr 14513 gun-pod configuration; 1944 compilation (clean vs gunpod masses).
- **Kurfürst archive** consolidates many of the above with original transcriptions.
- **Priority gap:** Installed DB 601 E / DB 605 A power-by-altitude at documented restricted combat settings; matched run mass.

### Fw 190 family (all variants)
- **Focke-Wulf Flugberichte:** WNr 783 series (Nr. 1 long external intake, combat 2400 rpm / 1.32 ata, open/closed cooling climb rows already extracted).
- **Rechlin Vergleichsfliegen:** A-2 vs Bf 109 F-4 (speed, climb, dive).
- **Manufacturer and E-Stelle:** BMW 801 D power anchors, internal vs external intake curves.
- **Priority gap:** Direct propeller efficiency or useful-power measurements; graded cooling area for open-flap path; D-9 dry / MW 50 separate campaigns.

### Mustang family (all variants)
- **Wright Field:** 43-24777 (B-15) level and climb (already used). Additional P-51B/C/D and H reports on wwiiaircraftperformance.org.
- **NACA:** ACR 4K02 (prop-off drag), WR L-566 (XP-51 stall).
- **A&AEE / RAE:** Mustang I AG393 high-Mach trials with Spitfire XI.
- **Priority gap:** High-blower matched power and near-stall corrections for the B/C specimens used in comparisons.

### P-47 family (all variants)
- **Wright Field / NACA:** Already strong on B/C propeller efficiency (L4L07, L5G09a). Additional: ACR 5D20 (D model compressibility), WR L-86 (profile drag), P-47D-30 stall RM.
- **AFDU / Eglin:** Tactical trials (P-47C).
- **Priority gap:** D-30 and later military-power climb and high-speed with matched cooling and tip-Mach.

### Other families (for expansion beyond 13)
- **P-38:** Wright Field FS-M-19-1538-A (42-12687) already used; additional G/J/L power and propeller comparison memoranda.
- **F4U / F6F:** BuAer production inspection and NACA stall/handling; A&AEE Hellcat and Corsair trials.
- **P-40:** Manufacturer and AAF trials; limited NACA performance.
- **Japanese (Ki-84, etc.):** TAIC Summary Reports and captured-aircraft tests.

## 3. Practical next extraction order
1. NACA ACR 4K02 for Mustang propeller-off drag and WR L-86 for P-47 wing-section profile drag.
2. A&AEE BS.543 / MA.648 full tables (Spitfire IX family).
3. Rechlin Kennblatt G-1 and Vergleichsfliegen F-4 vs A-2 (Bf 109 / Fw 190).
4. Finnish MT-215 original curves (G-2).
5. Additional Wright Field and BuAer series for later Mustang, P-47, and naval types.

## 4. Notes
- The checked NACA table identifies the report scope and applicable findings. The family leads below that table require row-level review before numerical use.
- Matching specimen, boost, cooling, mass, and intake remains mandatory before any number enters a data pack.
- This expands the search beyond the current 13 variants while preserving the existing evidence standards.

## Lineage
- NTRS citations for ACR L4L07, ACR 5D20, ACR 4K02, WR L-86, WR L-566.
- wwiiaircraftperformance.org (Spitfire, Mustang, P-47, Fw 190, P-38).
- Kurfürst archive (Bf 109).
- A&AEE / RAE report index leads.
