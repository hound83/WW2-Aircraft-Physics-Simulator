# Twelve WWII fighters: source-gap audit and transparent evidence-readiness ranking

**As of 10 November 2026. Research-only milestone; no simulator physics, aircraft defaults or application roster changed.** This follows the [four-track multiaxis report](WW2_FIGHTERS_MULTIAXIS_PRIMARY_SOURCE_DEEPENING_2026-11-10.md) and addresses *every one of the six modeled variants*, plus the *six proposed new variants*. The six newcomers have been added to the versioned [candidate intake](../../references/aircraft-intake.json), **not** activated in the solver.

## Executive verdict

- All **12 exact variants** have now been separately investigated and have explicit, source-linked gap dossiers and a common numeric [readiness register](../../references/aircraft-supergoodenough-readiness-2026-11-10.json).
- **0/12** meet our full historical *super good enough* gate. **F4U-4 BuNo80765** leads because its four stall speeds are explicitly **calibrated airspeeds** at 12,500lb; its installed power/turn-drag envelope still fails the gate.
- **955 → 979** versioned research observations (**+24**), **163 → 168** source entries (**+5**), **208** stall entries (**unchanged**), **26** lineage groups unchanged, **11** calibration reviews unchanged, **19** approved original correction curves unchanged, **4** published direct-CAS stall observations plus **1** provisional CAS\* unchanged. No original flight has been relabelled or double-counted merely to increase the data count.
- Strongest additions: **8 complete original P-38J cockpit-IAS/water-column/CAS/installation/altimeter calibration rows** (only 150–360mph; not near the stall, not a G); **Fw190A-4 WNr619** original 6–7km/h auxiliary-tank *additional* under-reading and speed-loss comparison (not same WNr783); official **IL-2 Bf109F-4** turn 20.3/26.1s at stated standard mass and speed (modern model **only**); **Ki84 T-2** test-vs-nominal mass and seven original *nominal* Ha45 power ratings, not torque flights; independent NACA F4U-4 handling review.
- **Important source correction:** the earlier file described a Ki84 T-2 p.8 *airspeed calibration chart*. Reinspection of the cited original shows **no such chart**: printed p.8 is a textual stall/handling discussion. Previous finding has been explicitly retracted in the existing source pack, version **1.0.1**. Printed p.7 states **no performance climb was attempted**. Three original T-2 IAS stalls **already existed** in two linked source representations, so there are **no three new independent Ki84 stalls**.

### What exactly does a percentage mean?

The score is **historical evidence coverage**, **not** model accuracy, a source-truth probability, or a confidence interval. It is an expert-applied, declared **0–100 weighted checklist** of how well *the exact serial/variant* is constrained for the intended energy-maneuvering simulator:

| Dimension | Weight | Maximum requires |
| --- | ---: | --- |
| Airframe, configuration, flight mass | 10 | Original specimen/engine/prop/stores/cooling and actual flight weight distinguishable from takeoff |
| Stall, loading, lift/CLmax | **25** | Original, relevant 1g stall/CLmax at known weights and multiple power/configuration states |
| Low-speed CAS/EAS and corrections | **20** | Direct CAS or fully auditable IAS+instrument+position correction at **actual stall speed**; CAS\* explicitly provisional |
| Installed engine, propeller, cooling | 15 | Sourced rating, power versus height, measured or well-bounded shaft/propulsive chain and cooling |
| Independent speed and climb | 10 | Original test speed and climb curves across multiple altitudes, conditions and held-out comparisons |
| Sustained turn and independent drag | **20** | Measured sustained-turn rate / Ps / load versus speed/altitude/mass or separately verified CD/power-required/prop efficiency sufficient to bound it |
| **Total** | **100** | All dimensions, with independently meaningful evidence |

The numerical allocation for each exact specimen is preserved in `points` in the register, in this category order. **A provisional target of ≥85/100 does not waive the hard gates**: measured near-stall airspeed basis, actual flight mass/configuration, installed power, and constrained **sustained** turn. A modern sim's published turn time is a *cross-check*, not a historical sustained-turn measurement. Reported **IAS ≠ CAS**, installation-only corrected\* ≠ full CAS, takeoff weight ≠ weight at the turn, accelerated or aborted turn ≠ steady sustained maximum.

## Full 12-aircraft ranking

| Rank | Aircraft and exact specimen | State | Score | Points: identity/stall/CAS/power/speed/turn | Dominant missing evidence |
| ---: | --- | --- | ---: | --- | --- |
| 1 | **F4U-4 BuNo80765** | Proposed | **78%** | 10/22/20/11/10/5 | Source-independent sustained turn, shaft/prop/drag, multiple stall weights |
| 2 | **P-51B-15 AAF 43-24777** | Modeled | **66%** | 10/21/8/12/10/5 | Exact 67–86mph IAS→CAS chart, low-speed power/turn drag |
| 3 | **F6F-3 NACA 04776** (+ separately documented 25820) | Proposed | **59%** | 9/20/10/8/5/7 | Same-flight mass and real CAS for NACA stall data; turn/prop |
| 4 | **Spitfire LF IX BS543** | Modeled | **58%** | 10/13/10/11/10/4 | PEC below 130mph and original stall at weight, turn drag |
| 5 | **P-47B AAF 41-5902** (+ independent 41-5942 prop trials) | Modeled | **57%** | 10/14/4/14/10/5 | IAS→CAS below 170mph, exact-specimen low-speed prop and turn |
| 6 | **P-38G-1 AAF 42-12687** | Modeled | **53%** | 10/11/3/12/10/7 | G-series original low-speed correction/1g mass; full turn drag |
| 7 | **Fw190 D-9 WNr210002** | Proposed | **46%** | 10/3/11/11/9/2 | Digitize graph with low-speed coverage, original stall/turn |
| 8 | **Fw190 A-4 WNr783** | Modeled | **43%** | 10/6/3/10/10/4 | Matched near-stall correction/CLmax and turn; 619≠783 |
| 9= | **P-40F AAF 41-13635** | Proposed | **40%** | 10/2/2/14/10/2 | Exact 1g stall/CAS and sustained turn despite excellent prop trial |
| 9= | **Ki-84-I captured T-2 302** | Proposed | **40%** | 10/15/1/9/2/3 | Real calibration missing; historical climb **not measured** in T-2 program |
| 11 | **P-47D-30 AAF 43-3441** | Proposed | **39%** | 10/12/1/7/1/8 | NACA steady-turn lb/g is not deg/s; missing 1g CAS and power |
| 12 | **Bf109 F-4 DB601E representative** | Modeled | **34%** | 9/4/0/9/7/5 | Serial-specific original stall/CAS, DB601E installation and historical turn |

**Zero greenlights.** A high percentage indicates richer *historical documentation*, not permission to use unmeasured CLmax, claimed turn rates or another variant's calibration. The largest common blocker is **independent sustained-turn/induced drag**, followed by **near-stall CAS**.

## Dossiers: all six currently modeled variants

### 1. P-51B-15, AAF 43-24777, 66%

**Established:** Wright Field [Eng-47-1749-A](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) from 20 May 1944 identifies 43-24777/V-1650-7, original nine individual *IAS* stall observations with test weights and a same-serial [Fig.1 airspeed-calibration image](https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Airspeed_Calibration.jpg). 9,335lb is explicitly **takeoff** mass. Original speed/critical-altitude/rack and 67/75inHg figures and cooling state are good. The BHP reported was determined from Packard's altitude chart, **not a measured flight torque meter**.

**Specific failure to close:** no audited Fig.1 *measured original range at 67–86mph IAS*; no assumption that a 1944 high-speed curve carries safely into 1g stall; independent low-speed propulsive power/drag and steady turn remain absent. [Different B-5 43-6883](https://www.wwiiaircraftperformance.org/mustang/p-51b-6883.html) is a *cross-check*, not the same installation.

**Next retrieval:** source image axis/pixel audit with signed position correction and instrument method, original P-51B low-speed wind-tunnel/performance charts, measured installed prop output versus airspeed; reserve unfit speed/altitude/weight rows for model verification.

### 2. P-47B, AAF 41-5902, 57%

**Established:** [18 June 1942 acceptance test](https://wwiiaircraftperformance.com/org/p-47/p-47.html), 12,565lb, R-2800-21, original approximate 105mph clean **IAS** stall; speed/climb. Original instrument/position calibration table is **170–310mph**, not 105. The separate AAF **41-5942** has valuable 68 controlled [six-prop/torque meter source rows](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5942_FS-M-19-1523-A.pdf).

**Gap:** exactly 41-5902's sub-170mph IAS→CAS; its own rated power/prop speed/cooling at stall/turn; independent steady-turn envelope. Six 41-5942 prop combinations do *not* imply six independent 41-5902 low-speed aerodynamics observations.

**Next retrieval:** PHQ-M-19-1417-A complete calibration appendices and original measured run dates; 1942/43 R-2800 torque/prop thrust/drag curves with the exact 714-1C2-12 propeller; test gross weight at altitude.

### 3. Spitfire LF IX, BS.543, 58%

**Established:** [A&AEE LF/HF Mk IX report](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html) explicitly used the [BF.274 PEC](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitFmkIX_BF274.html) because pressure head make, location and setting matched. BS.543 tested 7,485lb *takeoff*, Merlin66/Rotol, measured speed and climb. This is historically **sanctioned method transfer**.

**Gap:** the BF.274 correction is actually measured at **130–320mph cockpit IAS**; corrections printed for **109–127mph** were *historically applied extrapolations* and do not establish 75–90mph stall CAS. No same-condition stall test/CLmax at actual BS.543 flight mass and independent prop/turn drag. Best climb speed was borrowed from BS.354 by the test authors, so source-method transfer also affects that figure.

**Next retrieval:** 692/m Part III source graph plus any A&AEE stall appendix below 130mph, same pressure-head zero/bottom-end characterization; Merlin66/Rotol independent prop maps and combat-mass sustained turn.

### 4. Bf109 F-4 DB601E, representative, 34%

**Established:** F-series original [WNr9228 dive report](https://wwiiaircraftperformance.org/me109/Diving_Test_109F_W.Nr.9228_ger_eng.pdf) and German family engine history; no same-serial flight-test stall identified in this search. [Official IL-2 F-4 publication](https://il2sturmovik.com/museum/fighters/bf-109-f-4/) specifies **154–171km/h indicated clean stall range** over variant mass states, emergency **20.3s sustained-turn at sea level / 26.1s at 3,000m**, both at 270km/h IAS and 2,890kg reference weight.

**Critically:** IL-2 numbers are **a modern independent *simulation* comparator**, not a measured historic F-4 CLmax, original CAS or verified drag polar. G-1 WNr14026 DB601E/DB605A combined engine-and-prop tests are **not** an F-4 installation test. Do not score the game numbers as primary experimental evidence.

**Next retrieval:** original Bf109 F-1–F-4 Handbuch speed-indication table / Rechlin wartime stall-measurements at specific loading, F-series DB601E + VDM 9-12010 installed power, slats/radiator states and powered-turn flight trial.

### 5. Fw190 A-4 WNr783, 43%

**Established:** [German original WNr783 Flugbericht](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-783-nr1.html) level/climb, BMW 801D, roughly 3,870kg *takeoff*. Three unspecified original airspeed checks showed no error at their tested speeds, **not an all-speed/stall guarantee**. **New corroborating WNr619 source** [Flugbericht Nr5](https://www.wwiiaircraftperformance.org/fw190/fw190-619-nr5.html) documents that auxiliary tanks below pitot increased speed under-reading by **6–7km/h** and changed speed by **22–24km/h** with racks, **54–59km/h** with tanks+racks at the stated power/altitudes.

**Gap:** that is **different WNr619 / different load**, so the correction must **not** be transferred as a single 783 CAS offset. Need original 783 near-stall PEC, 1g stall/weight and independent BMW 801D fitted prop/turn drag. A captured RAF Fw190A-4 stall around 110mph cannot establish the WNr783 calibration.

**Next retrieval:** Flugbericht WNr783 additional reports with actual low-speed calibration points; A&AEE captured A-4 original stall speed basis, then classify transfer uncertainty; BMW801 prop settings.

### 6. P-38G-1 AAF 42-12687, 53%

**Established:** [Feb 1943 FS-M-19-1538-A](https://www.wwiiaircraftperformance.com/org/p-38/p-38.html) serial-matched speed/climb, 13,900lb takeoff and V-1710-51/-55, prop part IDs, cooler shutter conditions. [May 1943 P-38G versus P-38F tactical trial](https://wwiiaircraftperformance.com/org/p-38/p-38g-tactical-trials.html) gives approximately **110mph versus 145mph IAS at 25,000ft in a maneuver-flap *turn-stall***, not a straight 1g stall and not measured sustained turn rate.

**New original measurement-channel cross-check:** [P-38J AAF 42-67869 Eng-47-1706-A](https://wwiiaircraftperformance.com/org/p-38/p-38-67869.html), Part VI.A, eight fully tabulated cockpit IAS → water-column IAS → **CAS** and installation error pairs from **150 to 360mph**. E.g. 150 cockpit IAS / 151.5 water-column / 158 CAS; 360 /361 /347. This establishes an *original method*, **not G-series CAS** or valid J clean-stall CAS near 99mph. Its P-38J recorded stall speeds are **instrument-error-corrected IAS**, still not position-corrected near stall. Existing P-38H/J/L handbook 83–106mph correction* likewise covers **different G installation** and excludes field-test instrument error.

**Next retrieval:** original **G-series** T.O. 01-75F-1 speed calibration/instrument documentation, original G clean straight stalls vs mass/CG, exact Curtiss 3-blade torque/drag and flight-condition turn rate.

## Dossiers: all six newly included research-intake variants

### 7. F4U-4 BuNo80765, 78%: priority **#1**

The original [25 March 1948 Patuxent River production inspection](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf) gives **four direct CAS** stalls, in knots, at **12,500lb**: **84.5** clean/on, **89.4** clean/off, **64.2** landing/on and **77.7** labelled *landing/on again* (report ambiguity preserved; we must not silently rename as off). Same-airframe 16 normal/military speed/ROC anchors and 31.5%MAC are excellent. Some critical heights are **author-extrapolated**. A *different* F4U-4 [NACA RM A7C05 (1947)](https://ntrs.nasa.gov/citations/20050081862) gives independent stall-handling observations and poor warning in straight/turning stalls, but no corresponding independently matched 80765 sustained-turn numbers.

**Still needed:** same-airframe CAS vs **multiple exact weights**, real R-2800 propulsive-power/cooling versus speed, original independent *steady maximum turn* or power-required. **Ready for bounded model candidate research, not super-good-enough release gate**. The 1948 evidence cannot be labelled a wartime F4U-4 1944 trial.

### 8. F6F-3 NACA BuAer04776, 59%: priority **#2**

The NACA **three-part matched series** [Part I airspeed and longitudinal control](https://ntrs.nasa.gov/citations/19930092600), [Part II lateral control](https://ntrs.nasa.gov/citations/19930092601), [Part III stalling characteristics](https://ntrs.nasa.gov/citations/19930092602) is particularly valuable. Original position-error-free service IAS and approximately fuel-adjusted 11,200lb Part III stall context must be reconciled with Part I initial 10,600/11,303/11,500lb loading and 24.4/28.5/31.2%MAC. [Separate 25820 Navy airplane](https://www.wwiiaircraftperformance.org/f6f/f6f-3-25820.pdf) has **65/60/52/45kt IAS** in clean/landing power-off/on, but its weight is **unknown**; those are not 04776 measurements.

**Still needed:** Part I original measurement-channel error chain at stall so the NACA coefficient values can be compared on **CAS/EAS**, the actual Part III test mass per fuel state, installed R-2800/prop/heat schedule and independent sustained-turn. Combining unrelated BuNos without uncertainty is not allowed.

### 9. P-47D-30 AAF43-3441, 39%: priority **#3**

[NACA RM L8A06](https://ntrs.nasa.gov/citations/20090022749), also separately [preserved by UNT](https://digital.library.unt.edu/ark:/67531/metadc65259/), contains detailed CG/aircraft-condition and turning **control-stick force** (about 7.5lb/g at 200mph, 11lb/g at 350mph in one configuration) plus accelerated stalls. **Those are NOT maximum sustainable load, rate deg/s, or specific excess power.** Some stall illustrations are incomplete; Figure 58's **3,000 versus 5,000ft** original labels conflict and remain `null` in the prior source pack.

**Still needed:** complete original **1g** stalls with CAS and *actual weight*, matched P-47D-30 engine/prop performance, independently validated speed/climb and proper steady-state power/drag turn. Different P-47D and earlier B results are *cross-checks*, not direct calibration.

### 10. P-40F AAF41-13635, 40%: priority **#4**

Original [AAF FS-M-19-1549-A](https://www.wwiiaircraftperformance.com/org/p-40/p-40_files/P-40F_41-13635_FS-M-19-1549-A.pdf) has **25 same-airframe original speed/climb entries for five propeller configurations**, V-1650-1 at **18,000–28,000ft**. It has *no validated same-test low-speed stall/CAS*. Printed prop blade IDs **89303-23W versus 89303-24W** conflict; retain both. A&AEE Kittyhawk II **FL220** is another aircraft. The secondary book [*Flying to the Limit*, Kittyhawk chapter](https://erenow.org/ww/flying-limit-testing-world-war-ii-single-engined-fighter-aircraft/14.php) identifies potential original British tests, but no primary same-serial flight-stall/position-error sheet was verified in this source pass. Do **not** reassign a different Kittyhawk's 92/80mph IAS stalls to 41-13635.

**Still needed:** exact 1g IAS with matched mass and calibration, source-verified 1942 A&AEE FL220 stall annex as separate specimen, and a fully independent low-speed Merlin prop/turn envelope.

### 11. Fw190 D-9 WNr210002, 46%: priority **#5**

Original [German Flugbericht Nr1](https://www.wwiiaircraftperformance.org/fw190/Fw_190_D-9_210002_FB_Nr1.pdf), [Nr2](https://www.wwiiaircraftperformance.org/fw190/Fw_190_D-9_210002_FB_Nr2.pdf) and [Nr3](https://www.wwiiaircraftperformance.org/fw190/Fw_190_D-9_210002_FB_Nr3.pdf) contain period engine/boost, speeds with/without ETC and sealing differences, a **Fahrtmesserkorrektur** image and climb chart. **4,300kg** was quoted for *the climb*, not assumed as every level-speed or turn point. The image-only p.4 correction has not passed exact stall-speed axis/range audit.

**Still needed:** faithful point-digitization of original near-stall measured correction **only where shown**, actual original stall/weight, Jumo213/VS9 cooling/prop power, digitized full climb, and independent turn. Do not substitute a WNr210001 trial by accident.

### 12. Ki-84-I T-2 serial302, 40%: priority **#6**

The [AAF original interim report](https://www.wwiiaircraftperformance.org/japan/T-2_Report_on_Frank_I_Ki-84.pdf) actually reports **three 1g IAS** stalls at known **pressure altitude**: 102mph clean/off at **8,000ft** (warning 108), 90mph gear/flaps down/off at **8,500ft** (warning 92), 79mph landing/on at **8,000ft** (warning 81). It also says a **60° bank, estimated 3g power-on turn** was abandoned at **130mph IAS**, with buffet worsening below 160mph: **not a completed turning stall** and definitely not maximum sustainable rate. Actual test **departure 7,900lb**, separate nominal normal 7,940lb / overload 9,194lb, with instantaneous stall mass not proved. The seven Ha-45 horsepower nodes in the new data are **published engine specifications**, not installed shaft measurements.

**Critical retraction:** this same report *does not* contain the previously claimed p.8 airspeed-calibration curve. [Separate original TSFTE-2001](https://www.wwiiaircraftperformance.org/japan/Ki-84-TSFTE-2001.pdf) exists as another source-search lead, not a verified calibration table. Most importantly, the interim report **explicitly says no performance climb was flown** in its roughly 11.5-hour handling program: do not score the spectacular page-2 performance summary as independent T-2 flight measurements.

**Still needed:** real original low-speed IAS→CAS, flight fuel/CG and stall mass, independently *measured* speed/climb/Ha45 shaft power, prop/cooling and a true sustained turn.

## Reproducible research intake and safe handoff to parallel simulator work

1. [12-aircraft scoring register](../../references/aircraft-supergoodenough-readiness-2026-11-10.json): immutable variant/specimen IDs, category weights and points, audited source links, exact missing information, hard-gate status. Version `1.0.0`.
2. [Six new variants added to research intake](../../references/aircraft-intake.json): priority order F4U-4 → F6F-3 → P-47D-30 → P-40F → Fw190D-9 → Ki84. Every entry is **research-only** until physics workstream makes independent admission decision.
3. [New compact 24-row primary-source/benchmark follow-up](../../references/research/ww2_twelve_fighter_gap_followup_2026-11-10.json): source identity, exact configurations, calibration basis, test-vs-spec status, linkage, and `pack_version`. It is automatically consumed by `research-layer.cjs` and recorded in built catalog hashes. The research axes have **no arbitrary max for speed, altitude or weight**, so future source observations can extend them.
4. [Ki84 source correction](../../references/research/ww2_low_speed_turn_calibration_2026-11-10.json) now versioned `1.0.1`. It does not invent numerical corrections or modify original three IAS stall measurements.
5. On simulator integration: **source ID + exact serial + measured status + basis (IAS, CAS, CAS\*, EAS/TAS) + instrument/installation corrections + original domain + test flight weight + engine/prop/cooling + independent validation rows**. A chart with no demonstrated low-speed anchors remains `unestablished`. Never add an absent original curve to the CAS registry just to improve a ranking. Report deltas using a new model release, not this source-only commit.

### Prioritization after these findings

- **First:** audit/obtain the true near-stall IAS→CAS for original **P-51B-15 43-24777, P-47B 41-5902, Spit LF IX BS543/BF274, P-38G 42-12687**, and F6F3 Part I/III. Continue looking for *both* direct CAS and author-applied corrected\* data; they have distinct statuses and both can improve the simulator.
- **Second:** find actual mass-linked 1g stalls and measurement basis for **Bf109F-4, Fw190A4/D9, P40F, P47D30**; **Ki84** already has IAS stalls and needs the original correction chain more urgently than extra generic stall counts.
- **Third (just as important for 5:1):** historic **maximum sustained-turn/drag and installed propulsion**, not just control feel, accelerated stalls, nominal nameplate power, game timings, or manufacturer topspeed. Require credible speed-altitude-weight domains and independent holdouts.
- **Fourth:** exploit F4U4's verified 12,500lb CAS as a high-quality *test-bed* for the shared physics once power/turn uncertainty is made explicit; it is not yet a globally validated aircraft.

These percentages are **repeatable audit judgments**, not fixed truths: a genuinely measured P-51 low-speed CAS curve, for example, can raise its airspeed category *without* quietly revising any other category, while a new contradictory original can lower a score. Every change should carry a source-linked dated register revision and a compare-to-prior table.
