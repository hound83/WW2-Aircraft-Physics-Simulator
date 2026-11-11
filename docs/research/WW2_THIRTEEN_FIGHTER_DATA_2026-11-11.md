# Thirteen-fighter data collection: source recovery checkpoint

11 November 2026. Data and provenance only; the flight solver, aircraft parameters and flyable roster are unchanged. The Bf 109 G-2 is included as the thirteenth research variant.

The requested target is at least **80 primary / 90 primary plus secondary evidence points for every variant**. This collection pass has not achieved that target: **1 of 13 reaches 80 primary; 0 of 13 reaches 90 augmented**. This is a substantial completed source-recovery checkpoint, not completion of the overall coverage objective.

The existing six-dimension rubric is retained: identity 10, stall and actual mass 25, near-stall calibration 20, installed engine/propeller/cooling 15, independent speed/climb 10, sustained turn/drag 20. These are judgment-based evidence-coverage points, not a literal percentage of all surviving documents, statistical confidence or flight-model accuracy. Recovering the same report twice does not improve independence.

## Captured evidence

- **152 additional records in 32 series, linked to 23 source records.** The catalog grows from 1,053 to **1,205 records**, with **214 source entries**. Source entries include rediscovered/qualified documents and are not 214 independent trials.
- Record-level classification: **10 newly transcribed flight measurements**, **9 period performance-summary rows**, **14 original period-calculation rows**, **50 secondary-transcription/synthesis rows**, and **69 condition/documentary records**. A row can contain several quantities; this count is not a scalar measurement count.
- Five previously undigitized NACA F4U-4 corrected stall speeds increase the catalog from four to **nine reported CAS or CAS-equivalent stall rows**. The new serial is unmatched to BuNo 80765 and its mass is approximate. The single earlier provisional CAS* row remains provisional.
- **19 correction-curve records remain unchanged**: no unqualified correction curve was activated. Nine new source-dependency links bring lineage groups to 35; five new calibration reviews bring reviews to 16.
- Compact source/data JSON, source locations, qualifications, failed leads and **25 download hashes** are retained. Bulky scans and page renders are not committed. Inspected pages are listed explicitly; a downloaded 177-page manual is not represented as 177 verified pages.

## Per-aircraft coverage

Primary and augmented scores use the same rubric before and after. Augmented includes primary; the two columns must not be added.

| Research benchmark | Primary before → now | Augmented before → now | Meets 80 / 90? |
|---|---:|---:|---|
| F4U-4 80765 | 80 → **83** | 84 → **88** | yes / no |
| P-51B-15 43-24777 | 69 → **72** | 75 → **79** | no / no |
| F6F-3 04776 | 67 → **78** | 72 → **83** | no / no |
| Spitfire LF IX BS543 | 60 → **62** | 65 → **70** | no / no |
| P-47B 41-5902 | 57 → **60** | 61 → **64** | no / no |
| P-38G-1 42-12687 | 53 → **57** | 59 → **64** | no / no |
| Fw 190 D-9 210002 | 48 → **49** | 53 → **58** | no / no |
| Fw 190 A-4 783 | 47 → **49** | 53 → **56** | no / no |
| P-40F 41-13635 | 41 → **42** | 48 → **49** | no / no |
| Ki-84-I 302 | 40 → **42** | 44 → **46** | no / no |
| P-47D-30 43-3441 | 45 → **50** | 54 → **60** | no / no |
| Bf 109 F-4 DB601E | 34 → **37** | 42 → **45** | no / no |
| Bf109G-2 DB605A (research intake) | new → **47** | new → **59** | no / no |

## G-2 selection and known engine settings

The useful benchmark is a **DB 605A G-2 at documented restricted combat settings**, keeping each actual trial separate. “G-2 performance” without its engine settings is insufficient.

- The contemporary British translation of the **18 June 1942 technical sheet** prohibits 1.42 ata / 2,800 rpm. Older engines also restrict 1.30 ata / 2,600 rpm to operational necessity; even reinforced pistons did not automatically authorize emergency power under that order. No universal restoration date is assumed.
- The Finnish **MT-215 / WNr 14783, 5 April 1943** transcription records **actual 2,540 rpm versus 2,580 indicated**, and about **1.30–1.32 ata below critical height**, with altitude-dependent boost reduction. Those actual values are retained. The original speed/climb curves were inspected, but the exact numerical tables remain secondary transcription until their originals are recovered.
- Finnish speed runs used closed radiators; climb used thermostat cycling, with the first full opening at 2,500 m and deliberately higher climb speed for cooling. The report had no special flight-test instrumentation. Fuel was 400 litres at departure; exact run mass and static-pressure accuracy remain unqualified.
- The Finnish time table contains **no 11,000 m rate**: the apparent “0.8” belongs to the **1,000 m elapsed time in minutes**. Blank end cells remain blank.
- The original Soviet WNr **14513** test was a **gunpod configuration**: 3,206 kg loaded **excluding 29 kg test instruments**. Its minimum controlled IAS values are not certified clean stall CAS. The separate 1944 compilation lists clean 3,023 kg and gunpod 3,235 kg configurations. Their nominal engine description does not establish per-run turn-test power.
- Soviet 20.0 / 21.5 s clean versus 22.6 / 22.8 s gunpod turn times are preserved as a period compilation, with **per-run power and constant-altitude/energy criteria unresolved**. They cannot be accepted as maximum sustained-turn verification yet.

This establishes a useful, explicitly qualified G-2 research intake. It does not admit a G-2 model into the simulator.

## Recovered material and remaining work

### F4U-4 80765

Five newly transcribed, position-corrected CAS-equivalent stall speeds from NACA at~12100lb (unmatched serial), plus Navy1948 flight-based installed critical altitudes and explicit capped-pylon/clean/launcher conditions. Partial stall/engine/configuration credit; no independent sustained-turn test.

Next primary-source work: Find an identified80765 independent powered turn/polar at known mass, RPM/MAP, altitude and cooling. Resolve1947 Vought design stall versus1948 Navy80765 measured stall discrepancy; keep NACA unmatched serial distinct.

Secondary/derived route: Use source-traced service-family drag bounds; the pylon speed comparison alone is not a complete polar.

### P-51B-15 43-24777

Recovered original1943 AAF calculated thrust-power curves and e/f labels for V1650-3 at8600lb. Benchmark is V1650-7 atothermass: no exact-specimen claim. Lednicer1999 gives a separately sourced drag synthesis. Calculated curves receive limited drag coverage, not flight-test replication.

Next primary-source work: Recover43-24777 position/instrument correction below140mphIAS, covering67-86mph stall runs. ReconcileAAF calculated f3.35 versus Lednicer f4.61 and their engine/weight/finish/cooling definitions; seek same-variant measured high-CL polar.

Secondary/derived route: Maintain alternate drag assumptions instead of averaging conflicting f values.

### F6F-3 04776

Original PartI documents low-speed formation/trailing-bomb position calibration and pressure-derived standard sea-level compressible speed; PartIII gives fuel-corrected coefficients and five exact power/configuration cases. Near-stall method and engine-condition coverage improve substantially. Untranscribed figure speeds are not newly measured CAS rows.

Next primary-source work: DigitizePartIII first-stall time windows with speed, normal acceleration, actual mass/fuel and visual uncertainty, preserving transient versus steady results. Recover independently measuredF6F-3 speed/climb or high-CL polar matching04776 engine/prop/cooling; keep40164/42633 separate.

Secondary/derived route: Use same-variant independent serials with explicit transfer bounds; poweredCN2.1-2.2 is not clean wingCLmax.

### Spitfire LF IX BS543

Original manualPEC intervals120-350mph, Merlin66 continuous/climb/combat limits, delayed normal-power gear-change rule and climbIAS schedule. Near-stall correction still absent. Secondary SpitfireIX drag synthesis is configuration-unmatched.

Next primary-source work: RecoverBS543 or demonstrably equivalent full-spanLFIX near-stall pitot calibration and actual stall mass. Recover originalBS543 TableII climb schedule/conditions and independent high-CL drag/turn evidence.

Secondary/derived route: Keep full-span versus clipped-wing and Merlin66 versus61/63/70 schedules separate; do not transferSpitVA correctedCLmax as an observation onIX.

### P-47B 41-5902

OriginalP47B manual establishes2000bhp2700RPM military5min and high-altitudeMAP reduction, with blankMAP cells retained. AAF1943 calculated curve suppliesP47B R2800-21 e/f/mass context, without declaring41-5902 identity. No new near-stallCAS.

Next primary-source work: Retrieve41-5902 low-speed correction below170mphIAS and distinguish flight-instant mass from gross test load. Trace original calculatedP47B drag assumptions and obtain measured turn/polar or independent low-J efficiency with known shaftpower.

Secondary/derived route: Use original1943 calculated curve as a conditional constraint; RAF different-P47 comparisons stay qualitative.

### P-38G-1 42-12687

Recovered22 numeric D-G manual installation-correction rows including wing/nose pitots and threegear/flap states. Corrected earlier page28 search lead to actualprinted32B. Clean domain begins125mph, still above target clean stall; instrument-error qualification and1943installationmatch remain open.

Next primary-source work: Verify42-12687 wing/nose pitot and revision applicability; recoverclean correction below125mph or independently corrected stall. Find G-specific actual stall mass and independent installed two-engine propulsive/turn data; H/J/L remain separate.

Secondary/derived route: Use D-G manual within its measured rows only; do not extrapolate or substitute laterH/J/L corrections.

### Fw 190 D-9 210002

OriginalNr2 scan qualifies existing speed points with actual1.70ata dry versus1.80ataMW50, incorrect early runs and~35C charge-temperature change. This is engine-condition enrichment, not new independent speed tests. Lednicer provides secondary D9 drag synthesis.

Next primary-source work: Recover full low-speed correction domain, exact mass and original1gstall forD9. Obtain original known-RPM high-CL polar or constant-altitude sustained-turn test; MW50 and dryboost must stay separate.

Secondary/derived route: UseD9 f4.77ft2 as a source-traced conditional parasite estimate; no induced/high-CL drag or maximum turn is supplied.

### Fw 190 A-4 783

Recovered originalNr2 fixed3870kg/2400RPM intake comparison, full-throttle/climb-height differences and8-9% cooling-pressure effect. Not higher2700RPMNr5. FwA8 modern drag synthesis is distant family context, with only small augmented credit.

Next primary-source work: Find783 same-installation low-speed correction and mass-matchedstall;619 orcapturedjaboare different specimens. Recover cleanA4 full-armament powered polar or sustained-turn trial; current783 intake trials used reducedarmament.

Secondary/derived route: A8 geometry/drag cannot be silently madeA4; use only a sensitivity bound until configuration differences are quantified.

### P-40F 41-13635

OriginalP40F41-14119 flight roll/helix points now digitized with7870lb meanmass,CG28%,production pitot position calibration and108-304mph testdomain. Valuable same-variant handling data, limited near-stall-method credit; not41-13635 stall evidence.

Next primary-source work: Recover41-13635 or matchedF-family original stall data and numericlow-speed position/instrument correction. Retrieve originalMerlinP40F manual from a working archival mirror; formerp40warhawk PDF currently redirects to unrelatedretailHTML. Seek independent F-family polar.

Secondary/derived route: Keep AllisonE assumptions and FL220 borrowedAllisonPEC out of exact F-variant calibration.

### Ki-84-I 302

OriginalTSFTE confirms powered low-speed rudder81mph andaileron74mph control limits, NOTstalls. MATSC177-page technical compilation adds rated1970/2050hp,3000RPM,49.6inHg context. TAICMarch1945 performance and1946handlingprogram are not independent measuredspeed/climb.

Next primary-source work: Locate original302 instrumentation/correction records and flight-instantstallmass. Find actual measured performance trial with knownengine/fuel/boost/RPM; publishedTAICdesign/estimatedcurves cannot close this gap.

Secondary/derived route: Treat US high-octane426mph folklore as unverified unless the actual trial and measurement basis are recovered.

### P-47D-30 43-3441

OriginalFigure52now legible:12860lb,CG28.9%,5000ft,approach21inHg2550RPM. PairedNACA/service traces near80-100mph recovered but not digitized/qualifiedasCAS. Wing-section drag domain enriched; existing0.0097minimum not counted again.

Next primary-source work: ResolveRM/NACAvsservice channel mapping usingTN2675 and originalinstrumentation; digitize matchedstall windows withoutdoublecorrection. Recover43-3441 independent speed/climb and installedR2800-59/SPA-5propeller data; sectiondrag is not whole-aircraftpolar.

Secondary/derived route: A D30 family speed/climb transfer must identifypropeller,waterinjection,storeloadandcooling before augmented-performance credit.

### Bf 109 F-4 DB601E

Inspected originalFebruary1942 DB601E manual table1.42/2700,1.30/2500(30min),1.15/2300. Performance sheets still only secondarytranscription; correctedflownsheetdate29Nov1941 andpreservedcalculatedvsclaimedflown/ram/compressibilityambiguity.

Next primary-source work: Recover originalMesserschmitt IV/43/42 flownsheet and1942calculatedsheet, plusEB100/WNr7640 originalUS report; resolveserial/configuration. Recover actualmass cleanstall, near-stallcorrection and F4-specific high-CL/turn data. SovietF2WNr9209 isnotF4.

Secondary/derived route: Use transcribedmanufacturerperformance conditionally; do not upgrade toprimaryuntil originalsheetisread.

### Bf109G-2 DB605A (research intake)

New researchvariant. Originalgunpod14513loading/controlreport and1944clean/gunpodsummary, restrictionorder andFinnishprimarycurves recovered. Finnish numericaltables remainsecondarybutexplicitly recordactual2540RPM and1.30-1.32ata. Sovietcompiledturntimeshaveunknownper-runpowerandarenotacceptedmaximumsustainedturnbenchmarks.

Next primary-source work: Recover originalMT215numeric/instrumenttables and actualrunmass; calibratepitotstatic ratherthanassumingsecondaryTASisfullyqualified. Recover originalcleanG2 low-speed andturntrial with per-runRPM/MAP,cooling,mass,speeddefinitionandlevel-energycriterion. Gunpod14513cannot be defaultclean.

Secondary/derived route: Use MT215 table atactual2540RPM as a disclosedconditionalcheck. Keep1.42/2800 initialrestrictionseparate; do not assumeall1943G2wereunrestricted.

## Corrections, disagreements and rejected shortcuts

- **P-38 D–G:** the numeric table is actual printed **32B**, PDF pages 37–38, not the earlier OCR contents lead “page 28”. Duplicate scan pages count once. Clean correction begins at 125 mph wing-pitot IAS; landing configurations do not extend the clean curve down to 100 mph.
- **Spitfire IX:** manual PEC is an interval instruction from 120 to 350 mph IAS, not a measured low-speed curve below stall. Merlin 66: normal continuous 2,650 rpm / +7 lb; maximum climb 2,850 / +12 for one hour; combat 3,000 / +18 for five minutes. The 61/63 footnotes are different engines.
- **P-47D-30:** Figure 52 mass is visually confirmed as **12,860 lb**, CG 28.9%, at 5,000 ft, approach 21 inHg / 2,550 rpm. The companion TN 2675 footnote identifies original **L6L31**; the L8A06 reference transposes it to L6L13, an unrelated flying-boat report. TN 2675 defines pressure-derived corrected CAS, but mapping both L8A06 “service” and “NACA” plotted channels remains open. No double correction or automatic CAS relabeling.
- **P-47 wing drag:** section minimum cd 0.0097 was already recorded. Newly recovered test domain and Reynolds/Mach context are enrichment, not a new experiment or a whole-aircraft CD0.
- **Bf 109 F-4:** flown sheet date is transcribed **29 November 1941**. The later calculated sheet contains inconsistent identifiers. Original engine-manual ratings are primary; the performance-sheet transcription remains secondary.
- **Fw 190 A-4:** original Nr 2 is **15 March 1943**, 2,400 rpm, reduced armament and known intake configuration. Do not mix it with Nr 5 at 2,700 rpm. D-9 Nr 2 is **19 October 1944**, with incorrect early boost runs explicitly distinguished.
- **AAF power curves:** the 11 December 1943 memo explicitly calls them **calculated**, using drag characteristics, chart BHP and calculated propeller efficiency. Thrust horsepower is not shaft horsepower. Its P-51B f=3.35 disagrees materially with Lednicer’s secondary f=4.61; conditions and definitions must be reconciled rather than averaged.
- **Ki-84:** the TSFTE handling report explicitly says no performance was obtained. The MATSC technical ratings and TAIC performance card do not establish a measured 302 speed/climb trial. Already recorded 160/130 mph turn-abort data are not duplicated.
- **P-40F:** the former manual PDF URL currently redirects to unrelated retail HTML. Cached text is retained as a lead, not promoted to an inspected original. P-40F roll helix pb/2V is dimensionless and is not itself degrees per second.
- The 26 June 1944 AAF fighter comparison explicitly says its computed 4g turn radii need not represent constant-altitude turns. A period calculated turn radius does not close maximum sustained-turn validation.

## Verification and delivery

Local checks after integrating main commit756301f23730acaca1ac568d2148740224951196 (the independently developedv4.2 operating-settings update): **71/71 regression scripts passed; 367 frozen-import SHA256 checks passed; all 3,628 baseline numerical values unchanged; 53 interactive browser checks passed** in headless Edge. This validates ingestion, provenance safeguards, unchanged model outputs and research-explorer behavior. It does not prove historical flight accuracy.

The separate pre-PR1 Git-history check cannot run in this local archive extraction because its historical commit objects are absent; the required CI checkout uses full history and runs that check before merge.

Only catalog totals and source-layer tests changed. Frozen source packs, baseline snapshots, solver parameters, physics and the flyable aircraft roster are preserved. GitHub CI and PR status are recorded in the PR; this checkpoint is not a flight-model release.

## Files

- [Versioned numeric evidence](../../references/research/ww2_thirteen_fighter_source_recovery_2026-11-11.json)
- [Fixed-rubric scorecard and exact remaining tasks](../../references/aircraft-readiness-thirteen-2026-11-11.json)
- [Download hashes, inspected pages and unsuccessful leads](../../references/source-recovery-manifest-2026-11-11.json)
- [Prior twelve-aircraft scorecard](../../references/aircraft-readiness-dual-lane-2026-11-10.json)

The 80/90 objective remains open. The highest-value next extraction is the Hellcat original stall time histories with matched fuel/mass, followed by P-47D-30 recorder-channel qualification. F-4 and Ki-84 need original missing test records; another design table or game comparison cannot replace them.
