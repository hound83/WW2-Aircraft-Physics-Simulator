# WW2 Aircraft Physics Simulator — four-fighter primary-source research

Date: 6 November 2026. Research-only handoff. No solver changes or empirical model calibration were made in this audit. The subsequent archive expansion and repository filing are tracked in [WW2_FIGHTER_ARCHIVE_EXPANSION_2026-11-06.md](WW2_FIGHTER_ARCHIVE_EXPANSION_2026-11-06.md). Scope: P-51B-15 43-24777; P-47B 41-5902; Spitfire LF Mk IX BS.543; Bf 109 F-4 (test specimen unspecified). These four are the configurations identified in the repository's `docs/FOUR_AIRCRAFT_STALL_REVIEW.md`.

## Evidence rules

- **M** = reported historical flight/test observation (possibly atmosphere-corrected by original investigator). **T** = value transcribed from an original historical report, original image not yet independently checked. **S** = original scan independently inspected. **D** = derived from reported quantities. **A** = assumption/model value. **U** = unknown. **C** = archive catalogue only, original report not read.
- "Historically measured" does not imply raw instrument data: aircraft test reports often correct to standard atmosphere, weight and pressure-head position. A source transcription is not a second independent experiment. A manual number is not automatically a same-specimen flight measurement.
- Preserve separate `brake horsepower at crankshaft`, `propulsive power = shaft BHP * efficiency`, `power required = drag * TAS`, and `excess power`. Stall IAS must not be treated as CAS/EAS without an aircraft/configuration-matched near-stall position-error calibration.
- Do not subtract unlike observations at different engine settings, altitudes, weights or radiator positions.

## 1. P-51B-15-NA, USAAF 43-24777

### Exact contemporary flight report

**20 May 1944, Wright Field Engineering Division Eng-47-1749-A**, 43-24777, Packard V-1650-7, Hamilton Standard Hydromatic four-blade **K-6523A-24** serial **403196**, diameter **11 ft 2 in**; wing racks installed; 265 gal of fuel including 85 gal aft, 9,335 lb takeoff, 4 x .50-cal armament, flaps and gear up, auto-rich mixture and automatic coolant/oil shutters. BHP values are **read from a Packard V-1650-7 altitude performance chart dated 3 December 1943** and **are not direct engine torque readings in the tested Mustang**.

Source (original Wright Field report transcribed; report figure scans linked): https://www.wwiiaircraftperformance.org/mustang/p51b-24777.html ; additional source compilation: https://www.wwiiaircraftperformance.org/mustang/mustangtest.html (20 May 1944 subsection).

| Flight condition / reported point | Historical value | Provenance | Limit |
|---|---:|---|---|
| 18,000 ft, high blower, 67 inHg, 3,000 engine rpm, racks, automatic cooling | **1,390 BHP (shaft chart); 408 mph TAS** | T, report high-speed table | BHP inferred from external Packard chart |
| 20,800 ft, high blower, 67 inHg, 3,000 rpm | **1,390 BHP; 417 mph TAS** | T, report high-speed table | Same chart-derived shaft BHP |
| 20,800 ft, high blower, 75 inHg, 3,000 rpm | **1,572 BHP; 431 mph TAS** (with racks); **444 mph TAS** (without racks) | T, report summary/table | Racks affect drag; no low-speed propeller η measured |
| 24,000 ft, high blower, 67 inHg, 3,000 rpm | **1,390 BHP; 426 mph TAS** | T, report high-speed table | Critical altitude for 67 inHg, but test-speed high |
| Historical/old workbook, 20,800 ft, **250 mph TAS**, 67 inHg | **406 hp required, 1,112 hp propulsive available, 2.13 g sustained** | D, older Greg-format workbook, not independent in-flight point | The 250 mph point is a *model evaluation*, not measured high-speed datum |
| Current sim at same numerical point (earlier repo review) | **410 hp required, 1,227 hp available, 2.39 g** | A / simulated | Propulsive difference is +115 hp or +10.34% of historical workbook 1,112 hp; not historical error |

At 1,390 chart BHP, the old 1,112 hp corresponds to **assumed propeller η=0.8000**; current 1,227 hp corresponds to **η≈0.8827**. Note 1,227 - 1,112 = 115 hp; historical report does **not** report either efficiency at 250 mph TAS. The historical graph at **22,400 ft**, `Fig. 5` power required, is an independently useful shape check, not the identical 20,800 ft/250 mph operating point: https://www.wwiiaircraftperformance.org/mustang/P-51B_24777_Power_Required.jpg.

The old workbook provenance is **not yet proven as Greg's original authored file**: it is a Greg-format reconstruction in a historical import/baseline. Require original file chain, worksheet cell/formula references and SHA/source mapping before claiming Greg personally entered η=0.8. Historic workbook URL: https://github.com/hound83/WW2-Aircraft-Physics-Simulator/blob/main/references/import/01_COMPLETE_V2_5_BASELINE/01_GREG_ORIGINAL/Expanded/Europe_Air_War_Research_Handoff_v0.2/data/WWII_Aircraft_Complete_Data_Table_v0.2.xlsx.

### Additional first-party documentation and transferable controls

1. A&AEE **Mustang IV TK589**, British trials 1944, **same K.6523A-24 blade drawing**, explicitly lists **hub 24D-50-65, 11 ft 2 in, 0.479 reduction**, prop pitch 23°–65° and **tip Mach≈0.93 at 4,000 ft, 0.95 at 10,000 ft** under the test speed/power. Pressure error tested **120–340 mph IAS** with correction +2.5 to +4.8 mph (not valid below 120 IAS or automatically on 43-24777). Radiator duct flap deliberately **8½ in** vs nominal **7¼ in** because of overheating. **Other airplane, Mustang IV (P-51D family), other hub/installation and only low-altitude MS-gear performance**, so no direct eta at 20,800 ft: https://www.wwiiaircraftperformance.com/org/p-51/tk589.html (A&AEE §§2.1–2.5, 3.1, 4.1–4.3). [T]
2. **1943 original Packard high-altitude power curve** used in Eng-47-1749-A is the decisive missing shaft-power evidence; engine spec primary catalogue "Model Specification V-1650-7", revised **15 October 1943**: https://aircorpslibrary.com/model-specification-for-v-1650-7-packard-motor-car-company-and-packard-built-rolls-royce-engine/ [C]. Independent Rolls-Royce 1944 V-1650-7 curves cannot be directly compared without installation/ram/temp/gear matching.
3. **P-51B-1 43-12093** earlier Wright Field report **FS-M-19-1587-A** (18 May 1943), Packard **V-1650-3** and *different* HS blade **V-6487A-24**. Paired cooling manipulation at **18,000 ft**: opening coolant flap changed **349 to 325 mph IAS (-24 mph IAS)** and opening oil flap had a further **10 mph IAS** penalty, per source report; same airframe but **not** 43-24777, no simple propulsor transfer: https://www.wwiiaircraftperformance.org/mustang/mustangtest.html (early May 1943 subsection) [T].
4. NACA **ACR-4K02 / WR-A-62** (February 1945), **P-51B airframe with propeller removed**, aircraft drag from flight/dive and wind tunnel to Mach 0.755; useful airframe drag/compressibility bound but **not installed-prop η**: https://ntrs.nasa.gov/search.jsp?R=19930092458 and https://digital.library.unt.edu/ark:/67531/metadc60838/ . Later NACA **Report 916** is republication/same experiment, **not independent data**. [S/C]
5. NACA **MR-L4L18** (P-51B **43-12105**, V1650-3, HS J6487-24) has full-scale 5k/10k/20k/31k altitude polar, but different powerplant/prop/weight: https://ntrs.nasa.gov/search.jsp?R=19780078569 [C].
6. US FAA postwar primary airworthiness sheet **LTC-11 Rev.5, 18 Nov 2009**, identifies correct **K6523A-24** among approved Mustang blades with hub 24D50, pitch stops 23.2°–65.2° at 42-in station; later certification and no efficiency chart: https://storage.googleapis.com/wzukusers/user-34847957/documents/5cff040344891rhuataK/LTC-11%2C%20rev%205.pdf (pp.1–2) [S].
7. Primary period airspeed calibration **Fig 1** for 43-24777 only plots down to about **150 mph IAS**, hence **86 mph IAS stall values cannot be directly corrected by extrapolation**: https://www.wwiiaircraftperformance.org/mustang/P-51B_24777_Airspeed_Calibration.jpg [S]. Original 43-24777 reports ~**86 mph IAS coolers closed at 9,270 lb** and **84 mph IAS coolers open at 9,240 lb**, both still requiring low-speed PEC (see original text).

**Simulator-ready**: speed-vs-altitude data under matched 67/75 inHg, 3000 rpm, wing-rack/auto-cooler configuration, and form of power-required curve; the 250 mph η difference remains a model/assumption comparison. **Missing**: actual K6523A-24 thrust/η map by J, Cp and Mach with installed flow; original Packard 1943 altitude map; near-stall 43-24777 pressure-error correction; Greg authorship evidence.

## 2. P-47B, USAAF 41-5902

### Direct same-specimen Wright Field test

**PHQ-M-19-1417-A, 18 June 1942**, original four-page report, **41-5902**, P&W **R-2800-21 with direct torque meter**, four-bladed electric Curtiss **714-1C2-12** with cuffs, diameter **12 ft 2 in**, takeoff **12,565 lb**, six .50 cal guns, pointed windshield, gear/flaps up, auto-rich. Original scans: https://wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf (pp.1–4), transcript: https://wwiiaircraftperformance.com/org/p-47/p-47.html . **Scans visually verified.**

| Condition | Historic value | Page/status | Important detail |
|---|---:|---|---|
| Level speed, 5,000 ft, 2,000 torque BHP, 2700 rpm, cowl closed/oil-intercooler flush | **352 mph TAS**, MAP52.0 inHg | p.2, M/S | Closed/neutral cooling |
| Level speed, 25,000 ft, same rating/configuration | **420 mph TAS**, MAP51.7, turbo16,900 rpm | p.2, M/S | Better high-alt validation than generalized max speed |
| Level speed, 27,800 ft, same rating/configuration | **429 mph TAS**, turbo18,250 rpm | p.2, M/S | 2,000 torque BHP maximum critical |
| Climb, 20,000 ft, 1,625 torque BHP, 2550 rpm, MAP39.2, turbo13,200, all cooling **fully open** | **1,565 ft/min at 217 mph TAS** | p.2, M/S | Immediately reproducible matched climb control point |
| Climb, 25,000 ft, same 1,625 BHP, 2550 rpm, all cooling open | **1,380 ft/min at 236 mph TAS** | p.2, M/S | Mid-altitude check |
| Power off clean stall, gear/flaps up | **105 mph IAS** | p.3, M/S | Takeoff mass 12,565 lb **not guaranteed** instantaneous stall mass; altitude and PEC absent |

**USAAF Technical Order 01-65BC-1**, 25 April 1942, original Smithsonian manual scan https://www.si.edu/media/NASM/NASM-Manual-000027958.pdf : **105 mph IAS power-off clean and 98 mph IAS power-on clean** at handbook loading, **95 / 85 mph IAS** power off/on with gear and flaps down; normal power **1625 BHP/2550 rpm**, military **2000 BHP/2700 rpm**. The pilot notes state instrument position-error correction will be provided later, so handbook IAS is **not** CAS. Manual's 105 mph likely repeats original underlying type-trial information; not an independent test. [S]

### Same-aircraft controlled propeller comparisons

**FS-M-19-1523-A, 26 December 1942**, P-47B **41-5942** (not 41-5902), same R2800-21 engine design with **direct torque meter**, **12,620 lb**, eight guns, compared six propeller types; original three-page scan: https://wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5942_FS-M-19-1523-A.pdf . [M/S]

| Propeller | 25,000 ft level TAS at 2000 BHP/2700 rpm, cooling closed/neutral | 20,000 ft climb at 2000 BHP/2700 rpm, all cooling wide open |
|---|---:|---:|
| Curtiss 714-1C2-12, baseline | 419 mph | 2,180 ft/min |
| Curtiss 814-1C3-24A | 402 mph | 2,400 ft/min |
| Curtiss 814-3C3-18 | 397 mph | 2,400 ft/min |
| Hamilton Standard 6501A-0 | 414 mph | 2,460 ft/min |

**Same-airframe matched 20kft climb**: Hamilton Standard - standard Curtiss = **+280 ft/min (+12.84% vs 2180)**, showing propeller choice/operating-point dependence, not an absolute η map. Another **FS-M-19-1533-A**, 28 Jan1943, 41-5942 same-airframe **uncuffed Curtiss 826 vs uncuffed standard 714**, 20kft 2440 vs2240 ft/min at 2000 BHP; distinct configuration and second experiment; https://wwiiaircraftperformance.com/org/p-47/p-47.html .

NACA **RM E7A07** (1947) and **TN1089** on **P-47G** experimentally examine cooling pressure distribution. Relevant physical trend, but **pressure measurements are not drag penalties**, and P-47G cannot be assumed identical to P-47B. https://ntrs.nasa.gov/search.jsp?R=20090025293 ; https://ntrs.nasa.gov/citations/19930081711 . NACA **ACR-L5H11A / ACR-L6B21** P-47D wing drag survey versus Mach further *different variants*: https://ntrs.nasa.gov/citations/19930093001 and https://ntrs.nasa.gov/citations/19930092751 . [C]

**Simulator-ready**: directly matched 41-5902 climb and speed points, torque BHP and cooling configurations; useful bounded propeller sensitivity on 41-5942. **Missing**: near-stall P-47B original calibration and exact stall test mass/height, total aircraft drag polar and Curtiss 714 efficiency/thrust map; independent full-wing CLmax. Do not interchange 1625 BHP 41-5902 climb with 2000 BHP 41-5942 climb.

## 3. Spitfire LF Mk IX BS.543

**A&AEE, 4 March 1943, low/high-altitude Mk IX Merlin variants test**: BS.543 **Merlin 66**, Rotol **XH54D-RM-S5 hub EH240**, duralumin **RA10061 blades**, diameter **10 ft 9 in**, engine/prop reduction **0.477:1**, original standard Mk Vc wings, 2 x 20mm and 4 x .303, **7,485 lb takeoff**; radiator flaps **fully open for climb** and **closed for level speed**. The **speed table has a standardized 95%-weight correction to 7,110 lb**, not the actual takeoff mass. https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html , **original A&AEE Table II and Table V transcribed**, original page scans still to retrieve. [T]

| A&AEE data | Value | Test/normalization | Source location |
|---|---:|---|---|
| Table II climb, 20,000 ft | **3,560 ft/min**, **224 mph TAS**, **163 mph ASI**, PEC +1.7 mph, comp -1.2 mph | 7,485 lb takeoff, 3,000rpm, +15.8 psi boost, **radiators open** | Table II row 20k [T] |
| Table II climb, 18,000 ft | **3,860 ft/min**, **223 mph TAS** | +18.0 psi, 3,000rpm, **radiators open** | Table II row 18k [T] |
| Table V level, 20,000 ft | **399 mph TAS**, ASI304mph, PEC -5.7, comp -6.7 | 7,110 lb corrected mass, **radiators closed**, +18.5psi, ~2995rpm, FS gear | Table V row 20k [T] |
| Table V level, 22,000 ft | **407 mph TAS**, ASI300mph | 7,110 lb standardized, closed radiator, +18.5psi, ~2995rpm, FS gear, FTH | Table V row 22k [T] |

Important original methodological dependence: **BS543 climb schedule** was adopted from measured partial climbs of **BS354**, not directly determined on BS543. **BS543 PEC** is imported from **Spitfire IX BF274** (3rd part **A&AEE/692,m**), on supposedly identical pitot/static installation; original BF274 test PEC measured over **130–320 mph ASI only**. There is **no extrapolation license to ~86 mph stall**. Original BF274 primary transcript (plus graph links): https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitFmkIX_BF274.html ; A&AEE/692,m original Fig 3 must be located. [T]

Two **original Air Ministry Pilot's Notes scans**:

- **A.P.1565J—P.N., second edition August 1943, §40**, 7,445 lb normal AUW, engine off, clean **86 mph IAS**, gear/flaps down **76 mph IAS**: https://www.docdroid.com/file/download/HRosRhd/supermarine-spitfire-fix-pilots-notes-pdf.pdf [S]. Family manual, not specific BS543/PEC.
- **A.P.1565J—P.N., third edition September 1946, §42**, non-rear-view **clipped** wing, 7,150 lb and no external store **90 mph IAS** clean, at 7,800 lb **93 mph IAS** with 45gal external blister tank, and at 8,700 lb 100mph IAS with other tank load. **Full span reduces clean IAS 3–6 mph**: https://zenoswarbirdvideos.com/Images/spit/SPIT9MANUAL.pdf [S]. Full span 7,150 lb indicated 84–87 IAS; rescale by *approximate* sqrt(7445/7150) => 85.7–88.8 IAS at 7445 lb (D, conditional assumed comparable IAS position error). Includes 1943 86 within band, but same governmental manual family and no independent measured CAS.

- **Independent same-Spitfire gear/propeller comparison** A&AEE **EN524 Merlin70**: three combinations 0.477:1 + 10ft9, 0.42:1 + 10ft9, 0.42:1 + 11ft1. Original conclusions: maximum climb differences **about 200 ft/min to 24kft** and level maximum **within 3 mph up to 27kft**, larger differences at higher altitude. Cooling open climb vs closed level. https://wwiiaircraftperformance.com/org/spitcom/mk9/spitHFmkIX_EN524.html [T]. **Different Merlin70, prop and airframe**; suitable bounded physics check not direct LF BS543 fit.
- A&AEE **JL165**, 1 Feb 1944, Merlin66 **+25 psi** vs BS543 **+18 psi**, Rotol wooden blade, includes **paired radiator-open vs radiator-closed** climb at **11,400ft 4335 vs4750 ft/min**, **20kft 3130 vs3450 ft/min**. Strong same-airframe cooling differential; **not directly transplantable** to BS543: https://wwiiaircraftperformance.com/org/spitcom/mk9/spitIX_25boost_JL165.html [T].

**Simulator-ready**: four BS543 exact climb/level check rows above; separate radiators and 7,485 vs 7,110 lb. **Missing**: scans of original A&AEE tables and corrections, **BF274 A&AEE/692,m Fig3** low-speed pressure calibration (if measured below 130 IAS; present transcript does not), exact BS543 power-off stall/weight/configuration, exact Rotol RA10061 η map and matched cooled drag.

## 4. Bf 109 F-4, specimen not identified

**There is no verified full original F-4 performance scan paired with the target config yet.** The existing simulation's **154–171 km/h IAS clean stall** and 2,890 kg generic mass come from **IL-2 game specifications**, not original measured airspeed, so cannot validate (C_{L\max}\) or turn claims. https://www.openflightschool.de/mod/book/tool/print/index.php?chapterid=357&id=515 [simulation, A]. The team's audit correctly leaves F4 default **CLmax=1.5 assumed**.

### F-4 original-document leads located and status

1. **Messerschmitt/Rechlin Flugzeugtabellen GL/A Nr. 1316/42 gK (Rü/IA), Stand 1 June 1942**. The **German Federal Archives RL 3/66** official holdings finding aid lists this exact date and tables containing type, engine, equipment, weight and flying performance. Catalogue only; need original F4 leaf to verify serial, power rating and values. https://www.yumpu.com/de/document/view/5682788/bundesarchiv-militararchiv-bestand-rl-3-generalluftzeugmeister/34 [C]. The Bundesarchiv confirms RL3 holds aeronautical drawings: https://www.bundesarchiv.de/im-archiv-recherchieren/archivgut-recherchieren/nach-themen/technische-zeichnungen-militaerischer-herkunft-bis-1945/ .
2. Secondary references to **29 November 1942** F4 flown **660 km/h at 6200m at 1180PS (Kampf-/Steigleistung)**, to **3 February 1943 Messerschmitt AG Flugzeug-Daten** **670 km/h at 6300m at 1290PS (Start-/Notleistung)**, and to 1 June 1942 F4 537 km/h SL /670 km/h 6200m/625 km/h 10km at **1.42ata/2700rpm**. These are **forum transcriptions of alleged primary sheets, not primary verified numbers**; sample identity and atmospheric correction unknown; NOT three independent flight tests. Leads: https://www.flugzeugforum.de/threads/optimierte-me-109-k-4.99210/page-2 and https://forum.il2sturmovik.com/topic/14753-bf109%E2%80%99s-in-il-2-battle-of-moscow-and-battle-of-stalingrad-v2/ . [U/T secondary]
3. **Original F-1 to F-4 Flugzeug-Handbuch D.(Luft)T.2109** original parts inventory: **Teil0 March1942**, **Teil6 Triebwerksanlage Feb1942**, **Teil7A engine controls April1942**: https://www.museumalkmaar40-45.nl/voorschriften-manuals/d-luftt/d-luftt-2109 [C]. Captured US NARA technical manual microfilm scan inventory lists **Teil1 frame4579812**, **Teil2 4579838**, **Teil7A 4579918**, and **DB601 E-G handbook** starting **frame4587517**: https://www.maparchive.ru/nara-doc/Field_and_Technica_Manuals/Field_and_Technical_Manuals.pdf [C]. Still missing original near-stall IAS/correction and radiator/slat state.
4. **British A.I.2(g) report 2076, 8 July 1942**, *Description of the Messerschmitt Me 109 F-4 with Daimler-Benz DB 601E engine*, **Smithsonian NASM.XXXX.0428, box D638 folder D52.1 Messerschmitt /169**, full report physically held, not digitized here: https://www.si.edu/object/archives/components/sova-nasm-xxxx-0428-ref3849 [C]. Unknown if report contains original performance tests or only intelligence description.
5. USAAF **Combat Evaluation Report 110**, 7 Feb1943 primary **"Synoptic Estimate"** F4 **390 mph at20,000 ft; climb 3400 ft/min**: https://stephentaylorhistorian.com/wp-content/uploads/2020/04/bf-109f-evaluation.pdf (p.1). It explicitly says **estimated**, not flight-measured, so cannot serve as independent F4 scored flight test. [S, *estimated*]
6. **Messerschmitt Versuchs-Bericht 109 19 L 42, 19 Sept1942**, G‑1 prototype **W.Nr.14026** equipped with **DB601E W.Nr.777**, VDM **9-1210.31, 3m**, 1.30 ata/2500rpm, actual G-1 wing/body and special configuration, graphs Fig 5 climb, Fig 7 speed/altitude, Fig 9 radiator sensitivity. https://wwiiaircraftperformance.com/org/me109/g/me109g-14026.html [original scan/transcript]. **Do not relabel as F4**. Valuable test-method check: German results correct for ram and cooler flap position, and ignoring ram would bias apparent full-throttle altitude. [S/T]
7. Rechlin **Fw190A-2 vs Bf109F-4** comparative December1941 trial reproduced/quoted secondarily: https://falkeeins.blogspot.com/2017/07/fw-190-versus-bf-109-friedrich-rechlin.html . Need whole original Rechlin protocol and fixed power rating/weights before using numeric performance. [secondary lead]
8. **Messerschmitt Nr10905E43, 15 April1943**, Bf109F **W.Nr.9228** dive testing used **G-like wing and enlarged tail**, so a modified experimental F, **not F4 clean stall reference**: https://wwiiaircraftperformance.org/me109/Diving_Test_109F_W.Nr.9228_ger_eng.pdf [S].

**Simulator-ready**: only **conditional** F4 manufacturer performance-range diagnostics when original sheet is recovered, and separate sensitivity to cooling and ram using modified G test as a *transfer*. **Missing**: specific F4 serial and original clean speed/altitude/boost/rpm/temperature/radiator tests; original power-off near-stall IAS and F4-matched position error/slat extension and instantaneous weight; contemporary VDM exact prop map. The 1.30 vs 1.42 ata rating difference is material and cannot be ignored.

## Cross-aircraft interpretation and ready checks

| Aircraft | Historical near-term strong check | Source status | Stall CAS/EAS calibrated? |
|---|---|---|---|
| P-51B 43-24777 | 417 mph TAS at 20,800ft, high blower 67inHg, 3000rpm, with racks and auto-cooling | Primary Wright Field report **transcribed**; chart BHP *derived* | **No**, stall outside calibration |
| P-47B 41-5902 | 1565ft/min climb at 20,000ft, 217mph TAS, 1625 torque BHP, 2550rpm, all cooling open | **Original scanned and measured** | **No**, IAS stall 105 not corrected, instantaneous weight/alt uncertain |
| Spitfire LF Mk IX BS543 | 3560ft/min climb @20kft, 7485lb/open cooling; and 399mph TAS level @20k, standardized7110lb/closed cooling | Original A&AEE **tables transcribed**, no independent original scan yet | **No**, source PEC starts above stall |
| Bf109 F4 | F4 rating-/config-sensitive provisional diagnostics only; Rechlin manufacturer sheets archive lead | **Catalogue / secondary quoted numbers**, not verified test | **No**, simulator IAS not historic sample |

**Result**: the baseline model's 0/4 fully sourced historical stall-CAS/CLmax readiness is **not eliminated**. In particular, no directly measured aircraft-controlled prop η is identified at the Mustang 250mph TAS model control point, and no source proves all six historical pairwise maneuverability differences or the intended 5:1 discrimination. Fitting an assumed (C_{L\max}) to game data would disguise the remaining historical gap.

## Next document retrieval order (gaps, not permission requests)

1. **Spitfire A&AEE original BS543 Tables II and V and BF274 A&AEE/692,m Part III Fig3**, then exact near-stall PEC if extant; official UK TNA **AIR 10/2413** holds 1943 Spit notes. This is the most promising way to verify already-transcribed same-specimen results, though not necessarily the ~85 mph IAS correction.
2. **P-51 Hamilton Standard 1943 K6523A-24 blade efficiency map plus Packard V1650-7 3-Dec-1943 power curve**, airframe 43-24777 near-stall instrument calibration, then old-workbook Greg provenance and original exact formula cells. **Smithsonian Wright Field Propeller Test Reports NASM.XXXX.0417** (1921–46, 2 archival boxes) may hold relevant prop studies, but exact K6523A inclusion is **not catalog-confirmed**: https://collections.si.edu/search/detail/ead_collection:sova-nasm-xxxx-0417?print=yes [C].
3. **Bf 109 F4 primary exact manufacturer sheet** from RL3/66, **3-Feb-1943 Flugzeug-Daten**, **29-Nov-1942 performance sheet**, then Smithsonian British 2076 and F4 specific Rechlin stall/slat/cooling flight record. German original manual D.(Luft)T.2109 and engine manual for installation detail.
4. **P-47B PHQ-M-19-1417-A** post-takeoff stalled mass/pressure-head error & Curtiss 714-1C2-12 propeller polars; retain 41-5942 different prop/wing installation controlled test as independent cross-check only.

## Data stewardship / reproducibility

Record each point with original report ID, airframe serial, engine/blade/hub, actual or standardized weight and datum, atmosphere, indicated/corrected/true speed definitions, engine power source (`torquemeter` vs `engine map`), radiator and stores state; source URL plus figure/page; original scan verification; and linked independent-test provenance. Source transcriptions on wwiiaircraftperformance.org and their figure images derive from **one historic flight report**, not multiple independent samples. Never silently substitute Spitfire 1946 clipped-wing manual, P47G cooling, P51B-1 J6487 prop, or Bf109 G-1 DB601E test for the target variants.
