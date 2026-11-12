# Propeller-efficiency research pack — seven-aircraft Normal/Combat benchmark

**As of:** 2026-11-12  
**Status:** research candidate (no solver change)  
**Purpose:** graded, condition-matched propeller efficiency observations and residual gaps for the seven-aircraft benchmark. Every number is tagged observed / derived / estimated / missing.

## Scope
F4U-4 (80765), P-47B (41-5902 / 41-5942), P-51B-15 (43-24777), Spitfire LF IX (BS.543), P-38G (42-12687), Fw 190 A-4 (WNr 783), Bf 109 F-4.

Focus: useful propeller efficiency (η) under matched mass, rating, RPM, gear, cooling/intake, and airspeed basis. Supports 1v1 energy and maneuver comparisons. Shaft power is treated as relatively better constrained.

## Working references (existing, graded)
- **80 %** — common starting value (Greg Mustang workbook constant; calculated reference). Supported on F4U-4 clean level, P-51B low-blower 67 inHg, Spitfire LF IX +18 lb closed radiators, and as a conversion baseline for P-38G part-power.
- **76 %** — Curtiss P-47B military-climb and high-tip-Mach level value (derived from NACA L4L07 military climb series; mean of close matches ≈ 0.75–0.76). Pair with matched open-cooling area.
- Tip-Mach interpolation for P-47B level: 80 % through helical tip Mach 0.979 → 76 % at 1.035 (observed on high-load Curtiss runs; hold endpoints over tested domain).

Primary series already recorded in `references/analysis/fighter-propeller-efficiency-v1.json` (NACA L4L07 Tables I–II, RAE RM 2357, etc.).

## Per-aircraft status (summary)

| Aircraft | Recommended starting η | Grade of recommendation | Key matched condition | Residual gap |
| --- | --- | --- | --- | --- |
| F4U-4 80765 | 80 % | derived (level replay) | Clean Normal/Military level, chart power | High-blower shaft-power / climb plates still open |
| P-47B 41-5902 | 76 % (military climb) / tip-Mach curve (level) | observed/derived (NACA L4L07) | 2700 rpm military climb + open cooling; 2700 rpm level | Separate-airframe transfer (41-5942) checked; installation loss split still coarse |
| P-51B 43-24777 | 80 % | derived (level checks) | Low-blower, 67 inHg, racks, 0–10 300 ft | High-blower own test condition; Fig. 5 power-required still diagnostic |
| Spitfire LF IX BS.543 | 80 % | derived (level checks) | +18 lb low-blower, closed radiators | Open-radiator climb schedule and metal-blade (RA.10061) transfer still open; wooden Rotol tunnel data not directly transferable |
| P-38G 42-12687 | 80 % (as conversion) | estimated from part-power replay | Recorded TAS/BHP/RPM at 5 000 and 24 400 ft, faired shutters | Full-power level and open-shutter climb still need joint power/drag check |
| Fw 190 A-4 WNr 783 | — | missing (installation evidence only) | Combat 2400 rpm, closed flaps, internal vs long intake | Need matched boost/RPM/intake + measured useful power or thrust; gear and cooling split unresolved |
| Bf 109 F-4 | — | missing (installation evidence only) | DB 601 E 1.30 ata / 2500 rpm combat schedule | Original power-by-altitude curve and rated F-4 run still required; VDM 9-12010 A geometry known but efficiency not measured in situ |

## Residual gaps (explicit)
1. Direct measured η for Fw 190 A-4 and Bf 109 F-4 under combat ratings (missing).
2. High-blower / high-altitude tip-Mach and installation losses for P-51B, Spitfire, F4U-4 (partial).
3. Joint cooling + propulsive power on open-radiator / open-shutter climbs (P-47B, Spitfire, P-38G).
4. Separate-airframe or independent-report checks beyond the ones already used (41-5942, etc.).
5. Tip-Mach corrections for non-Curtiss installations (estimated or missing).

## Sources (primary leads already in repo)
- NACA L4L07 (P-47 / Curtiss 714) — Tables I–II, Figures 4–6.
- NACA L5G09a, L7D10 (related Curtiss / military-climb).
- Wright Field / A&AEE / Rechlin specimen reports linked in existing scorecards.
- RAE RM 2357 (Rotol wooden — source-installation-only).
- Existing packs: `fighter-propeller-efficiency-v1.json`, `WW2_PROPELLER_REFERENCE_VALUES_2026-11-12.md`, `V410_PROPELLER_REFERENCE.md`, `V410_REMAINING_PROPELLERS.md`.

## Next research actions
- Digitize or confirm any additional direct η points from L4L07 / L7D10 not yet graded.
- Retrieve DB 601 E combat power curve and any F-4 rated run with boost/RPM.
- Pair WNr 783 measured boost with intake/cooling configuration for a first useful-power estimate (clearly label estimated).
- Keep all new points in the same graded JSON schema.

**Do not treat 80 % / 76 % as universal.** Apply only inside the recorded condition envelope. Mark transfers as derived or estimated.
