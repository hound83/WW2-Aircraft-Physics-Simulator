# NACA report extraction + broader primary-source expansion

**As of:** 2026-11-12  
**Scope:** Relevant data from the previously cited NACA reports, plus expanded primary-source leads across full families (Spitfire, Bf 109, Fw 190, Mustang, P-47, and related).  
**Status:** Research only. Graded where numbers are available. No solver changes.

## 1. Extracted NACA data (usable for future packs)

### NACA ACR L4L07 / WR L-177 — Curtiss 714-1C2-12 on P-47C
- **Source:** Vogeley, December 1944. Climb and high-speed tests.
- **Key quantitative (from available summaries):** Loss in efficiency from normal to military power of 5–8 % in climbs at 165 mph IAS, attributed primarily to reduced section L/D at higher operating CL. Compressibility losses in high-speed flight started below airplane Mach 0.4 and reached ~10–11 % at airplane Mach 0.7 whenever tip Mach exceeded ~0.83. Efficiency decreased at roughly 7 % per 0.1 tip-Mach increase in the high-speed regime.
- **Grade:** Observed (flight). Already core to existing propeller packs; retain for cross-check.
- **Future use:** Tip-Mach onset and power-loading sensitivity for other Curtiss-equipped P-47 variants.

### NACA MR L5G09a / WR L-594 — Hamilton Standard 6507A-2 on P-47D
- **Source:** Gardner, July 1945. Effect of blade loading on climb and high-speed performance.
- **Key:** Normal and military power climb efficiencies approximately equal below ~16 000 ft. Useful for blade-loading comparisons against the four-blade Curtiss data.
- **Grade:** Observed (flight).

### NACA ACR 5D20 — 0.3-scale P-47D high-speed wind tunnel
- **Source:** Hamilton & Boddy, May 1945.
- **Key quantitative:** No diving tendency below Mach 0.78 at 20 000 ft or Mach 0.72 at 40 000 ft (level-flight CL). Divergence of lift/drag/pitching-moment coefficients occurs ~0.15 above critical Mach. Unusually large margin.
- **Grade:** Observed (model). Useful compressibility bound separate from prop tip losses.
- **Future use:** High-Mach drag-rise envelope for P-47D-30 and later.

### NACA ACR 4K02 — P-51B drag correlation (propeller removed)
- **Source:** Nissen, Gadeberg, Hamilton, February 1945 (originally ACR 4K02).
- **Conditions:** Propeller removed. Flight dives (towed by P-61A) to Mach 0.755 at ~28 000 ft pressure altitude. Wind-tunnel 1/3-scale model in Ames 16-ft tunnel to Mach 0.825. Reynolds numbers (tunnel) 4.5–8.3 × 10⁶.
- **Key quantitative:** Satisfactory agreement of drag characteristics between flight and tunnel from Mach 0.30 to 0.755. Flight Cd slightly higher than tunnel above drag divergence. Drag divergence ~Mach 0.70–0.75. Minimum Cd affected by surface dust (flight data fall between smooth and roughened model). Pull-out Cd higher (possible Re, CL, or shock hysteresis effects).
- **Grade:** Observed (flight + tunnel). Clean-drag polar anchor for Mustang family.
- **Future use:** Baseline Cd0 / drag-rise for P-51B/C/D comparisons when prop is present.

### NACA WR L-86 / ACR L5H11a — P-47D wing profile drag
- **Source:** Zalovcik, October 1945.
- **Conditions:** Mach 0.25–0.69, CL 0.15–0.68, Re 7.7–19.7 × 10⁶. Boundary-layer at 25 % semi-span (slipstream), pressure and wake surveys at 63 % semi-span.
- **Key quantitative:** Minimum profile-drag coefficient 0.0062 for smooth section at 63 % semi-span. Critical Mach exceeded by at least 0.04 with no compressibility shock evidence (no wake widening or Cd rise). Transition as far back as 20 % chord in slipstream at low CL.
- **Grade:** Observed (flight). Direct profile-drag measurement.
- **Future use:** Wing-section Cd contribution for P-47 family polar.

### NACA WR L-566 — XP-51 flying qualities and stalling
- **Source:** White, Hoover, Garris, April 1943 (originally Memorandum Report).
- **Scope:** First Langley test of a low-drag wing airplane. Flying qualities and stalling characteristics.
- **Grade:** Observed (flight). Useful for early Mustang stall/handling; mass and configuration still need matching to later B/C/D specimens.
- **Future use:** Near-stall CAS/EAS and CLmax bounds for P-51 family.

## 2. Expanded non-NACA primary-source leads (full families)

### Spitfire family (all marks)
- **A&AEE Boscombe Down** performance trials: BS.543 (LF/HF IX, Tables II/V), MA.648 (LF IX, Table I), JL.165 (+25 lb), EN409 (RAE high-Mach), K5054 (prototype). 
- **RAE Farnborough:** High-speed wind-tunnel models (ARC R&M 2535 covers Spitfire, Spiteful, Attacker, Mustang). Aileron and compressibility work.
- **Key numbers already public:** BS.543 climbs (e.g., ~4620 ft/min SL for Merlin 66), MA.648 379 mph at 9400 ft MS, etc. Keep specimen and boost separate.
- **Priority gap:** Near-stall CAS/EAS with instrument correction and run mass for the marks used in 1v1 comparisons.

### Bf 109 family (all variants)
- **Erprobungsstelle Rechlin:** Kennblätter (G-1 with DB 605A, Erprobungsnummer 1586, early 1943), Vergleichsfliegen Bf 109 F-4 vs Fw 190 A-2 (10 December 1941 — climb inferiority of A-2 by ~6 min to 10 000 m, speed parity or slight deficit), GM-1 trials (E-series, up to +60–105 km/h at 8–11 km).
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
1. NACA ACR 4K02 and WR L-86 (clean drag anchors for Mustang and P-47).
2. A&AEE BS.543 / MA.648 full tables (Spitfire IX family).
3. Rechlin Kennblatt G-1 and Vergleichsfliegen F-4 vs A-2 (Bf 109 / Fw 190).
4. Finnish MT-215 original curves (G-2).
5. Additional Wright Field and BuAer series for later Mustang, P-47, and naval types.

## 4. Notes
- All numbers above are graded observed where extracted from the reports. Secondary summaries are flagged as leads only.
- Matching specimen, boost, cooling, mass, and intake remains mandatory before any number enters a data pack.
- This expands the search beyond the current 13 variants while preserving the existing evidence standards.

## Lineage
- NTRS citations for ACR L4L07, ACR 5D20, ACR 4K02, WR L-86, WR L-566.
- wwiiaircraftperformance.org (Spitfire, Mustang, P-47, Fw 190, P-38).
- Kurfürst archive (Bf 109).
- A&AEE / RAE report index leads.
