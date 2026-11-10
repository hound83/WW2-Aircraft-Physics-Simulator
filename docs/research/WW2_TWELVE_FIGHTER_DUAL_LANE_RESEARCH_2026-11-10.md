# Twelve-fighter evidence expansion: two independently constrained readiness rankings

**Research freeze:** 2026-11-10. **Scope:** source discovery, critical source inspection, conditional digitization, and provenance-aware research-layer import for twelve exact variants; **no flight-physics / simulator solver changes**. Companion machine-readable files:

- [`references/research/ww2_twelve_fighter_dual_lane_2026-11-10.json`](../../references/research/ww2_twelve_fighter_dual_lane_2026-11-10.json), source-by-source provenance and 74 new evidence/condition rows.
- [`references/aircraft-readiness-dual-lane-2026-11-10.json`](../../references/aircraft-readiness-dual-lane-2026-11-10.json), two per-aircraft six-category evidence-readiness rankings.
- Earlier baseline [`references/aircraft-supergoodenough-readiness-2026-11-10.json`](../../references/aircraft-supergoodenough-readiness-2026-11-10.json), unchanged to preserve score-version history.

## Executive determination

The user-proposed ambition of **at least +10 percentage points for every aircraft** and **at least 80% directly primary, or 80% augmented if primary sources remain scarce** is recorded as a **target, not an achieved result**. Crediting unavailable measured CAS, 1g stall weight, or historical sustained-turn would create the exact false confidence this project is meant to eliminate.

**Result:** a substantive research intake of **23 source records and 74 individual new evidence/condition rows**. The cumulative research catalog grows from **168 to 191 source entries**, from **979 to 1,053 observations**, and from **208 to 235 stall-speed observations**. **None of the 27 newly imported stalls is a newly proven CAS point**: they belong to other airframes or have explicitly unestablished speed calibration. **No directly measured historical maximum sustained-turn rate was found** in this tranche. The new 74 rows also include negative source audits and derived scenarios; they are not 74 distinct historical flight-test measurements, and source entries should not be interpreted as 23 all-new independent period test programs.

### Versioned scorecard (coverage %, not prediction accuracy)

| Exact subject | Previous primary | Re-audited primary | With secondary / derived | Primary change | Augmented change | Primary to 80 | Augmented to 80 |
|---|---:|---:|---:|---:|---:|---:|---:|
| F4U-4 **BuNo 80765** | 78 | **80** | **84** | +2 | +6 | 0 | 0 |
| P-51B-15 **43-24777** | 66 | **69** | **75** | +3 | +9 | 11 | 5 |
| F6F-3 **BuNo 04776** | 59 | **67** | **72** | +8 | +13 | 13 | 8 |
| Spitfire LF IX **BS543** | 58 | **60** | **65** | +2 | +7 | 20 | 15 |
| P-47B **41-5902** | 57 | **57** | **61** | 0 | +4 | 23 | 19 |
| P-38G-1 **42-12687** | 53 | **53** | **59** | 0 | +6 | 27 | 21 |
| Fw 190 D-9 **210002** | 46 | **48** | **53** | +2 | +7 | 32 | 27 |
| Fw 190 A-4 **783** | 43 | **47** | **53** | +4 | **+10** | 33 | 27 |
| P-40F **41-13635** | 40 | **41** | **48** | +1 | +8 | 39 | 32 |
| Ki-84-I **T-2 302** | 40 | **40** | **44** | 0 | +4 | 40 | 36 |
| P-47D-30 **43-3441** | 39 | **45** | **54** | +6 | **+15** | 35 | 26 |
| Bf 109 F-4 **representative DB601E** | 34 | **34** | **42** | 0 | +8 | 46 | 38 |

**Count at or above 80:** primary **1/12**, augmented **1/12**. **At least +10 percentage points:** primary **0/12**, augmented **3/12** (F6F-3, Fw 190 A-4, P-47D-30). Eleven aircraft therefore still fail the proposed 80 coverage target, and **all twelve** retain at least one of the stricter *super good enough* historical evidence gates (85 checklist threshold plus verified applicable low-speed calibration and bounded sustained turn). The percentages are deliberately expert-audited historical evidence coverage, not 80% physical accuracy. Scores on another date are not directly comparable unless definitions and source-exactness rules match.

Scoring columns: **identity** (10); **source-matched stall speed, weight, lift** (25); **CAS or genuinely corrected* instrument+position speed in the measured stall domain** (20); **installed power, propeller, cooling** (15); **measured independent speed/climb** (10); **sustained-turn/drag** (20). A secondary source may improve contextual coverage without fulfilling a direct-measurement hard gate. Derived (V_s\propto\sqrt W) curves are mathematical scenarios, not additional primary speed points. Where no verified better numerical data exist, zero primary increase is the honest outcome.

## Detailed source results and unresolved gaps

### 1. F4U-4, BuNo 80765 — primary 80 / augmented 84

**Period originals:** US Naval Air Test Center **BIS 2157**, 25 March 1948, has **89.4 kt CAS clean, power off at 12,500 lb**. [Original Navy report](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf). Chance Vought **Report 7289**, 21 May 1947, gives original **manufacturer design** stall estimates **78.3/81.7/84.6 kt at 12,405/13,529/14,562 lb** in its nominal load classes; [Vought design report transcript](https://www.wwiiaircraftperformance.com/org/f4u/f4u.html).

**Critical discrepancy:** 78.3 kt (design, 12,405 lb) vs 89.4 kt CAS (measured, 12,500 lb) differ ~**14.2%** in speed. The source labels, airspeed bases, and flap definitions are not demonstrated to match. Do **not** average or fit the two as measured identical clean 1g stalls. A separate seven-point **derived scenario** scales only the measured clean 89.4 kt CAS anchor over hypothetical masses **10,000–15,000 lb**, with fixed lift coefficient and unchanged power/geometry. These are calculations, not seven trials. **Missing:** precise measured stall CAS versus actual different weights and historical sustained-turn/installed drag proof.

### 2. P-51B-15, AAF 43-24777 — primary 69 / augmented 75

**Direct original** USAAF Eng-47-1749-A (20 May 1944), Fig.1, was plotted/digitized into **seven approximate position-error anchors at 140–330 mph IAS**, reading error ~±1.5 mph. The position-error graph and serial identity are original, see [original performance report](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) and locally preserved source scan `references/import/04_ADDITIONAL_USER_SUPPLIED_FIGURES/P51B_airspeed_calibration_rotated.png`.

**Limits:** the same aircraft's 1g stalls are ~**67–86 mph IAS**, **well below** the measured Fig.1 anchors; dashed extensions cannot become measured near-stall CAS. The printed chart excludes Kollsman D-1 instrument error. **Missing:** instrument+position correction at 67–86 mph, source-matched low-speed installed propulsive power, drag and independent sustained-turn envelope. Do not promote the different 43-6883 Mustang trial to direct 43-24777 calibration.

### 3. F6F-3, reference NACA BuNo 04776 — primary 67 / augmented 72

Three original **different-airframe** US Navy reports add four 1g stall points apiece:

| Primary Navy subject | Nominal report weight | Clean power ON/OFF | Landing power ON/OFF | Speed basis |
|---|---:|---:|---:|---|
| [BuNo 40164, March 1944](https://wwiiaircraftperformance.com/org/f6f/f6f_files/f6f-3-40164.pdf) | 12,243 lb | 97 / 98.5 mph | 79.5 / 85.5 mph | IAS or CAS **not established** |
| [BuNo 42633, September 1944](https://wwiiaircraftperformance.com/org/f6f/f6f_files/f6f-3-42633.pdf) | 12,416 lb | 98 / 100.5 mph | 80 / 84.5 mph | **not established** |
| [BuNo 02982, November 1944](https://wwiiaircraftperformance.com/org/f6f/f6f.html) | 11,364 lb | 91.5 / 93.5 mph | 76 / 80 mph | **not established**; locate original PDF |

These are useful **bounded multiweight comparison anchors**, not flight-moment fuel-burn-adjusted weights or calibrated NACA 04776 data. For illustration, (93.5\sqrt{12,243/11,364}=97.05\) mph compared with 98.5 observed; and (93.5\sqrt{12,416/11,364}=97.73\) vs 100.5 observed. The **1.45 and 2.77 mph residuals** could reflect weight timing, airframe or measurement differences, not proof of a generalized CLmax curve. Original US Navy [PTR-1107](https://www.wwiiaircraftperformance.org/fw190/ptr-1107.pdf) adds comparable turn *conditions* against an A-4, but no measured maximum sustained rate. **Missing:** original BuNo 04776 numeric near-stall IAS→CAS with pitot/instrument errors and exact 04776 stall-run weight.

### 4. Spitfire LF Mk IX, BS543 (Merlin 66) — primary 60 / augmented 65

Original A&AEE BS543 speed/climb evidence already established; BF274 position-error transfer only justified where the same pressure head was measured, from about **130 mph IAS upward**. Newly cross-checked [Air Ministry A.P.1565 P&L 1946 Mk IX/XI/XVI pilot notes](https://stephentaylorhistorian.com/wp-content/uploads/2020/04/spitfire-ix-xi-xvi.pdf) provide **Merlin 66 +18 lb boost / 3,000 RPM** and operational stall warnings, but cover a **family**, not exact BS543 stall CAS. **Missing:** measured lower-speed corrected*, exact stall mass, independently measured steady turn/drag. A 1946 manual is period original operational guidance, not another BS543 1943 flight-test series.

### 5. P-47B, AAF 41-5902 — primary 57 / augmented 61

Original **41-5902** [USAAF acceptance/performance trial](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html) documents **~105 mph IAS** clean stall, **12,565 lb/32% MAC** test context, and **IAS calibration 170–310 mph only**. This new pass reconfirmed, but did not fill, the low-speed gap; no new points awarded for primary. [Secondary RAF flight-test synthesis](https://erenow.org/ww/flying-limit-testing-world-war-ii-single-engined-fighter-aircraft/16.php) describes P-47/Fw190 relative advantage reversing at roughly 250 mph IAS, but references different aircraft and does not provide a maximum sustained rate. **Missing:** original 41-5902 105 mph near-stall correction, valid low-speed prop efficiency and original sustained turn/drag. Separate P-47B **41-5942** torque-prop trials still may help a *constrained* cross-check, not same-airframe calibration.

### 6. P-38G-1, AAF 42-12687 — primary 53 / augmented 59

Original USAAF **T.O. 01-75F-1**, covering **P-38D through G**, explicitly indexes an **Airspeed Correction Table on printed p.28** and G operating/weight instructions; [original manual scan/index](https://www.scribd.com/document/456916773/Pilot-s-Flight-Operating-Instructions-for-Army-Models-P-38D-through-P-38G-Series-F-4-F-4A-and-F-5A-Series-Airplanes-T-O-NO-01-75F-1-Revised-30-Se). The **numerical table was not retrieved/read**; the primary ranking therefore stays **53**. A distinct digitized [P-38 H/J/L manual](https://stephentaylorhistorian.com/wp-content/uploads/2020/04/lockheed-p-38-lightning-pilot-flight-operation.pdf) includes true calibration anchors at lower IAS, but **does not cover the G installation** and cannot be imposed on 42-12687. **Highest retrieval priority:** original D–G page28 + instrument-error footnote + applicable G-1 gross-weight/stall table, then measured installed prop/turn.

### 7. Fw 190 D-9, WNr 210002 — primary 48 / augmented 53

German [Flugbericht Nr.1](https://www.wwiiaircraftperformance.org/fw190/Fw_190_D-9_210002_FB_Nr1.pdf) records an approximately **+2 m/s rate-of-climb change at 9,000 m** from radiator flap position and ~**700 m** shift in critical full-throttle height; actual stated **4,300 kg** is for the climb configuration, **not automatically every speed or stall run**. Modern [IL-2 model specifications](https://ravensystem.github.io/il2_specs/planes/fw190d9.ger.html) quote **20s sea level and 29s at 3,000 m** at 300 km/h IAS, and 174–197 km/h IAS stall range, useful only as **simulation checks**. **Missing:** original correction-chart actual low-speed measured domain, exact-weight 1g stall CAS and period sustained-turn evidence.

### 8. Fw 190 A-4, WNr 783 — primary 47 / augmented 53

[US Navy TED PTR-1107 original comparative trial](https://www.wwiiaircraftperformance.org/fw190/ptr-1107.pdf): captured A-4 fighter-bomber **8,690 lb**, versus **F6F-3 12,406 lb** and **F4U-1 11,988 lb**, comparisons at **10,000/15,000 ft** and approximately **140/160/180/200 kt IAS**. The two American fighters were reported able to turn inside captured Fw190, but no maximum sustained rate/deg-s curve or comparable F4U-4 result follows. Independent [AAF Eng-47-1658-D](https://www.wwiiaircraftperformance.org/fw190/Fw_190_Eng-47-1658-D.pdf) reports **118 mph IAS clean / 105 mph IAS landing power-off** on another captured Fw190. These add valuable historical *variant envelope* but neither is exact **WNr783** or proven CAS. **Missing:** WNr783 low-speed corrected speed/weight and BMW801D power-prop-drag steady-turn curve.

### 9. P-40F, AAF 41-13635 — primary 41 / augmented 48

Original [A&AEE/783a Part 4 Kittyhawk II FL220](https://www.p40warhawk.com/Models/Technical/MikeHalbrook/AVIA_734_Report_783a_Part_04.pdf) gives **8,910 lb departure** and **2,020 fpm at 10,200 ft (MS)**, **1,620 fpm at 17,000 ft (FS)**, full-open climb radiators. FL220 is a **different specimen** and it **borrowed its PEC from Allison Kittyhawk I AK672**. An original [NACA flight report on P-40F/F-1 rudder/tail response](https://ntrs.nasa.gov/citations/19930092648) establishes P40F-family test documentation, but **not wing CLmax or sustained turn**. Exact 41-13635 five-propeller trials and seven brace-on/off TAS pairs were already in the project before this tranche and **were not counted again as novel findings**. **Missing:** any direct 41-13635 stall at actual weight, measured IAS→CAS at stall and sustained-turn drag/power curve.

### 10. Ki-84-I, captured T-2 specimen 302 — primary 40 / augmented 44

Reinspection of original [T-2 interim trial](https://www.wwiiaircraftperformance.org/japan/T-2_Report_on_Frank_I_Ki-84.pdf) confirms already-recorded IAS 1g stalls **102/90/79 mph**, rough **7,900 lb** departure weight and **NO performance climb flown** during 11.5 hr of handling checks. **There is no airspeed-correction graph on printed p.8.** The previous graph claim was retracted; do not assign improved measured CAS or measured flight climb from a published specification. [Separate original TSFTE-2001 memorandum](https://www.wwiiaircraftperformance.org/japan/Ki-84-TSFTE-2001.pdf) and TAIC 156A must be investigated for *new numerical test coverage*, not treated as independent observed speed merely because listed. **Missing:** near-stall instrument and position error, actual per-stall fuel mass, original flown climb/speed and independent maximum sustained turn. Primary score **unchanged**.

### 11. P-47D-30, AAF 43-3441 — primary 45 / augmented 54

Same-serial original [NACA RM L8A06](https://ntrs.nasa.gov/api/citations/20090022749/downloads/20090022749.pdf?attachment=true), **figures 47–51 and 53–55**, now yields **nine figure-specific test conditions** with **12,400–13,170 lb**, **26.3–29% MAC**, **5,000–26,500 ft**, and power/flap/control status. This materially narrows stall mass uncertainty *for those plotted accelerated stalls*, and identifies exactly where original Figure 52's mass text remains unreadable. Separate original [AAF 42-26167 trial](https://www.wwiiaircraftperformance.com/org/p-47/p47-26167.html) adds **13 uncorrected IAS** stalls across flaps, cowl and power, but serial and installed prop are different. Neither supplies **43-3441 calibrated 1g stall**. NACA **stick-force per g** and elevator travel are emphatically **not maximum sustained rate**. **Missing:** matching clean 1g CAS, full low-speed correction and installed R2800/prop/turn-drag envelope.

### 12. Bf 109 F-4, DB601E representative — primary 34 / augmented 42

Historical [secondary transcription](https://www.flugzeugforum.de/threads/optimierte-me-109-k-4.99210/page-2) cites Messerschmitt AG data sheets with **635 km/h@6,000 m / 1,185 PS (calculated)**, **660 km/h@6,200 m / 1,180 PS (claimed flown)** and **670 km/h@6,300 m / 1,290 PS (claimed flown)**. **Original sheets have not been inspected**; differing power and status cannot be combined as one flight-test curve. [Captured Axis aircraft register](https://www.joebaugher.com/usaf_serials/captured_axis_aircraft.html) points toward F-4 **WNr7640**, US Wright Field/Eglin **EB-1/EB-100**, potentially an F4/Z configuration requiring confirmation; **no original US flight test found**. A critical source-lineage check shows commonly repeated **~19.6–20.5 s Soviet turns** trace to a separate **Bf 109 F-2 WNr9209 DB601N**, **not a demonstrated F-4 DB601E trial**; see [wartime-history analysis](https://litresp.ru/chitat/ru/%D0%A1/sobolev-dmitrij-alekseevich/nemeckij-sled-v-istorii-otechestvennoj-aviacii/16). IL-2 F-4 turn speeds are **simulated**, no historical-primary upgrade. **Missing:** direct original F-4 1g stall mass/IAS/CAS, Messerschmitt data sheets, EB100 original flight test, independent period steady-turn evidence. Primary **unchanged**.

## What the research layer does and does not do

- The new JSON pack is **auto-ingested** by `scripts/research-layer.cjs`; it expands the catalog without artificial upper bounds on test speed, altitude, or weight. Version number and period source/airframe/configuration are retained for later follow-up.
- Source rows specify `speed_basis=IAS`, `CAS`, or `unestablished`. **Original position error is not necessarily complete CAS**: source instrument error must be treated separately, as must unmeasured speed domains. Asterisk `corrected*` means provisional installation-corrected with named limitations, never silent measured CAS.
- The F4U-4 derived CAS-versus-weight series is marked **not measured** in every row (including repeated anchor). Engineering interpretation needs lift-config assumptions; never count points as historical test replicates.
- Source scans containing only **gross/departure weight** must not be portrayed as instantaneous weight at each stall. **Exact NACA 43-3441 figure-caption weights** are different: they are individual test-run contextual mass, but still not calibrated clean 1g stalls.
- Historical qualitative wartime tighter-turn statements and modern IL-2/DCS comparisons must **not be converted into invented sustained-turn deg/s or seconds**. Avoid using these to calibrate a solver to reproduce a game as if independently historical.
- No fit, model constant, dataset preferred CAS curve, flight roster, solver code, app or deployed release was changed in this **research-only** milestone; the companion sim-development thread should review the added evidence and select justified physics changes.

## Priority source-recovery agenda (highest information gain)

1. **Near-stall corrected speed for exact aircraft**, prioritizing P-38G T.O.01-75F-1 p28 with G-series instrument-error notes; original P-51B 43-24777 sub-140 mph PEC/instrument calibration; Spitfire BS543 and P-47B 41-5902 near 1g stalls; Fw190A-4 WNr783 and D9 210002 graph measured-domain verification; Ki84 T2 original instrument check. Historical 1g CAS/`corrected*` has the highest turn-model leverage.
2. **F6F-3 NACA 04776 Part III actual stall-run weight/CG and correction**, plus original scans of 02982, 40164 and 42633, whose report figures can establish IAS/CAS basis. Investigate NASA/NACA record series for calibrated near-stall pressure-head results. Never auto-transfer serial numbers.
3. **P-47D-30 NACA Fig52 legibility and original 1g CAS**. Pair with serial-matched P-47D prop/power notes; isolate 42-26167 to only secondary/variant cross-checks.
4. **Bf109 F-4 original Messerschmitt 1942/43 Datenblatt scans and Wright Field EB100 original flight-performance report**. Confirm DB601E boost, radiator/cowl/VDM, WNr7640 subtype and 1g stall measurement. Explicitly quarantine F-2 WNr9209 Soviet turning claims.
5. **Ki84 original TSFTE-2001 and TAIC 156A**: locate pages containing actual flight-verified speeds and methods rather than published type characteristics; investigate captured US test instrumentation/engine output. No high primary credit until this distinction is closed.
6. **Sustained-turn direct constraint for all twelve** via measured horizontal turning/energy data, backed by actual weight, altitude, IAS/CAS, engine state and induced/profile drag; search original comparative British A&AEE and USAAF/NACA tests before substituting book reconstructions.

**Suggested next research milestone:** recover and digitize the **G-series P-38 original airspeed correction** together with **one F6F-3 near-stall verified calibration** and **one Bf109 F-4 primary performance sheet**. That would improve three qualitatively different gaps and could move the second lane toward the 80 target honestly. Keep the all-twelve search open and archive every useful original or secondary branch, but preserve strict provenance and source-vintage distinctions.
