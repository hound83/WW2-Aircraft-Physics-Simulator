# Four-track original-source stall research and WW2 fighter readiness

**Date:** 2026-11-10. **Repository baseline:** merged v3.14.0 source layer, 726 historical observations; **this follow-up:** 755 observations, 139 indexed source records, 200 stall/minimum-speed observations. **Status:** source-only research advancement, **not** a new flight-model fit, a stable accuracy certification or 29 independent experiments.

All new machine-readable findings, source relationships, unresolved errors and figure locators are in [`stall_four_track_followup_2026-11-10.json`](../../references/research/stall_four_track_followup_2026-11-10.json), automatically ingested by the existing research compiler. **Both the 15 provenance groups and the two reviewed but not yet applicable original low-speed charts are compiled and browseable in the simulator's research-quality panel.** The pack adds 5 source records and 29 archive rows: **10 original Spitfire VA stall IAS/CLmax pairs**, **14 P-47D-30 figure-specific flight-run weights/configurations**, and **5 original F6F-3 coefficient bands**. It also records **15 explicit source-lineage relationships**, two inspected low-speed calibration figures and provisional figure readings without applying unverified corrections. They are separate from the pre-existing 19 original correction-curve records.

## Research line 1: Original near-stall airspeed correction, not high-speed extrapolation

| Original test | Actual correction evidence | What prevents automatic CAS* today |
| --- | --- | --- |
| [Spitfire VA, NACA WR-L-353](https://ntrs.nasa.gov/api/citations/19930092581/downloads/19930092581.pdf), **Fig. 5** | Original low-speed chart relating **pilot's meter** to **correct indicated airspeed**, separate cruise/glide/landing markers. At pilot IAS around **80 mph**, rough visual reads approximately **87 mph** (cruise), **92 mph** (glide), **86–87 mph** (landing), with **about ±2 mph image-reading uncertainty**. | The NACA stall table is labeled indicated speed, but a distinct NACA recording airspeed channel was calibrated against a formation/trailing-head reference. The graph is explicitly a **cockpit-meter** correction. Signal identity, original speed definition and the exact drawn curve must be validated before any stall IAS is converted. **These approximations are not numeric simulator correction anchors.** |
| [Hurricane II Z2963, NACA WR-L-565](https://ntrs.nasa.gov/api/citations/19930092603/downloads/19930092603.pdf), **Fig. 7** | Original low-speed cockpit correction with different configurations, derived via a Brewster XSBA-1 trailing-head reference. The report states cockpit error is small, especially at low speeds. | Dynamics were recorded by a **separate right-wingtip pressure head**, while the chart characterizes the **left-underwing cockpit installation**. Applying the cockpit correction to those measurements may **double-correct or correct the wrong channel**. Existing eight stalls remain 7,014-lb IAS; do not change them until the signal mapping is established. |
| Spitfire IX/XVI [A.P.1565J](https://zenoswarbirdvideos.com/Images/spit/SPIT9MANUAL.pdf), p.32 | Original position-error bins start at **120 mph IAS**. | The twelve pilot-note stall estimates are 75–117 mph IAS; **no downward extrapolation**. They are also **clipped-wing/loading-class** data, not matched full-span BS.543 results. |
| P-51B-15 43-24777; P-47B 41-5902 | Original correction curves exist in the prior registry. | Recorded calibration anchors are **above their relevant 67.5–86 and 105 mph IAS stalls**; matching speed-range/installation proof is missing. |

The original Spitfire VA and Hurricane low-speed images were examined at high resolution, but **a visually plausible correction is not yet a scientifically qualified mapping**. The follow-up archives those approximate Spitfire Fig. 5 readings under `approximate_figure_readings_not_for_calibration`, not under `calibration_curves`.

### What *would* permit provisional CAS*

For each near-stall point, establish which physical airspeed head and instrument channel produced the reported number, its instrument scale error, the relevant flap/gear/power installation, and at least two original correction anchors **bracketing** that reported speed. Preserve the original IAS and correction figure, document the digitization error, then compute a separate `CAS*` field. Continue to seek a report's **direct stated CAS/EAS** independently even after this gate is passed.

## Research line 2: Direct CAS/EAS, and stronger but differently named references

**No new numerically verified original near-stall CAS/EAS observation** was established by this investigation. The archival tally remains **4 explicitly reported CAS stalls** (F4U-4 BuAer 80765), **1 corrected CAS*** (1945 F4U-1-family operating manual at 11,300 lb, power-off gear+50° flaps) and **15 instrument-corrected IAS***. The Spitfire VA adds 10 original *IAS*, not CAS. Three categories must not be conflated:

1. **Direct CAS:** explicitly identified as calibrated by the original report, with its own source-condition limitations. Existing [F4U-4 BuAer 80765](https://www.wwiiaircraftperformance.org/f4u/f4u-4-80765.pdf) data are four source CAS rows; an original label ambiguity still needs verification. This 1948 test of a WWII-era variant is not an F4U-1 source.
2. **Tabulated corrected CAS\*:** original IAS plus a matched position correction, interpolated **within** its published range. The [Corsair F4U-1 handbook](https://www.vmfa251.org/pdffiles/Corsair%20Manual.pdf), pp.40 and 45: at **11,300 lb**, 50° landing flaps, gear down, power-off, 75 kt IAS; original landing correction 70→67 and 80→78 kt gives **72.5 kt / 83.43 mph CAS\***. The manual explicitly **assumes zero instrument scale error**.
3. **Position-error-free *service indicated* airspeed:** original NACA F6F-3 BuAer **04776** instrumentation in [WR-L-715 Part I](https://digital.library.unt.edu/ark:/67531/metadc61068/m1/5/) includes swiveling static and shielded total-pressure heads **one chord ahead of the wingtip**. The standardized service meter is described for a system free from position error. Its [WR-L-717 Part III](https://ntrs.nasa.gov/api/citations/19930092602/downloads/19930092602.pdf) stall curves come from that same experimental program. This is a **major CAS-equivalent candidate**, but the source calls it *service indicated*, and the exact scale/compressibility/stall-point conversions are not independently established here. **Do not label it direct CAS.**

[NACA TN 2311](https://ntrs.nasa.gov/api/citations/19930082989/downloads/19930082989.pdf) is a method-control source on near-CLmax static-pressure-error growth: a wingtip boom is not an excuse to assume error-free measurements without its own calibration. The original Bf 109E captured-aircraft British position-error estimate remains an archival lead, not verified numerical CAS for the F-4.

## Research line 3: The weight at the actual test and original lift evidence

### Spitfire VA: ten matched original IAS and CLmax pairs, at approximately 6,184 lb

NACA [WR-L-353](https://ntrs.nasa.gov/api/citations/19930092581/downloads/19930092581.pdf), printed p.7, explicitly publishes **indicated stalling speed** and derived maximum lift coefficient for each flight state. **Open/covered** indicates gunports.

| Condition | Covered gunports | Open gunports | Notes |
| --- | --- | --- | --- |
| Gliding, clean, throttle closed | **90 mph IAS / CLmax 1.18** | **91 / 1.15** | Closest clean, nominal power-off experiment |
| Cruising, clean, 36.9 inHg/2,650 rpm | 77 / 1.63 | 76 / 1.68 | Powered; do not replace power-off CLmax |
| Landing, gear/flaps down, throttle closed | 80 / 1.51 | 81 / 1.46 | High-lift and gear installed |
| Approach, gear/flaps down, 21.4 inHg/2,300 rpm | 69 / 1.99 | 75 / 1.72 | Slipstream and open gunport effect |
| Takeoff, gear down/flaps up, 43.9 inHg/2,850 rpm | 80 / 1.49 | Not reported | Original report table |
| Climbing, clean, 43.9 inHg/2,850 rpm | 76 / 1.64 | Not reported | Original report table |

These **ten** are primary historical conditions, but they refer to a **Spitfire VA**, **not** an LF/HF IX BS.543. They do not remove the BS.543 lift/turn gate. The report itself discusses the maximum coefficient in level and accelerated turns, distinguishing power-off and powered slipstream effects.

### P-47D-30 43-3441: original stall and turn figures with reported run mass

NACA [RM L8A06 (1948)](https://ntrs.nasa.gov/api/citations/20090022749/downloads/20090022749.pdf) contains individually captioned trials at **12,400–13,219 lb**, approximately **3,000–26,500 ft**, with centre of gravity, power state, gear/flaps, flight controls and turns. Figures **47–59** contain **14 separately identified traces** because Fig. 51 has panels (a) and (b). Some examples:

| Figure(s) | Source-caption gross lb | Altitude ft | Original distinction |
| --- | ---: | ---: | --- |
| 47–48 | 12,660 / 12,570 | 5,000 | Power-on clean, different control use |
| 49–50 | 12,400 / 12,400 | 5,000 | Glide clean and power-off |
| 51a/51b | 12,770 / 12,570 | 24,000 / 26,500 | Glide vs power-on clean |
| 52–53 | 12,860 / 12,860 | 5,000 | Powered landing approach |
| 54–55 | 13,170 / 13,170 | 5,000 | Gear and flaps down, power off |
| 56–57 | 13,210 / 13,219 | 5,000 | Wave-off, **complete stall not reached**; never fit as full stall |
| 58–59 | 12,690 / 12,680 | **3,000** / 5,000 | Left turn; landing-condition left turn |

**Precision boundary:** these are **figure-caption flight-run gross weights**, not demonstrated fuel-corrected mass at the exact stall instant; **no numeric stall CAS** was extracted from the traces. The source does include independent **turning-characteristic figures 28–32**, a valuable follow-up for P-47D sustained-turn validation. The related [NACA TN 2899 (1953)](https://ntrs.nasa.gov/api/citations/19930083857/downloads/19930083857.pdf) **supersedes RM L8A06** and is **the same experiment**, not a second validation cohort.

### F6F-3 BuAer 04776: original fuel-adjusted flight CN

NACA [WR-L-717 Part III](https://ntrs.nasa.gov/api/citations/19930092602/downloads/19930092602.pdf), figures **4–13**, uses gross-weight corrections for fuel consumed and flight normal acceleration to compute **peak normal-force coefficient**, labelled lift coefficient in some narrative. The original approximate bands are:

| Condition | Peak CN (approximate original range) | Original figure pair |
| --- | ---: | --- |
| Power-off glide, clean | **1.35–1.45** | 4–5 |
| Powered climb, clean, 2,550 rpm/43 inHg | 2.10–2.20 | 6–7 |
| Landing, gear/flaps down, power off | 2.15–2.25 | 8–9 |
| Approach, gear/flaps down, 2,550 rpm/23 inHg | 2.35–2.45 | 10–11 |
| Wave-off, gear/flaps down, 2,550 rpm/43 inHg | Approximately 3.0 | 12–13 |

These are valuable direct normal-force flight reductions, **not all power-off wing CLmax**. Numeric near-stall *service IAS* curves and per-trace fuel-adjusted mass still need careful original-image digitization. The same BuAer 04776 test program's Part I defines the airspeed installation; it does not constitute an independent repeat.

### Original target benchmark weights: do not conflate variants

- **P-51B-5 43-6883, USAAF Eng-47-1734-A**: nine IAS stall runs with *instrument error removed*, approximately **9,100→9,045 lb** per run, **not corrected for position error**.
- **P-51B-15 43-24777, USAAF Eng-47-1749-A**: nine rows with original **instantaneous weights 9,270→8,950 lb**, but still missing source-matched near-stall position error. Its V-1650-7 engine is not the B-5's V-1650-3.
- **P-47B 41-5902**: **12,565 lb** is a report/test mass, **not** each individual stalled-instant mass; 105 mph clean IAS power-off stall; its known PEC anchors start around 170 mph.
- **Spitfire LF IX BS.543**: **7,110 lb** is normalized level-speed weight, versus around **7,485 lb** takeoff/climb; 7,150/7,800/8,700-lb clipped-wing 1946 manual figures concern other configurations. Full-span BS.543 near-stall CAS is not obtained.
- **Bf 109 F-4**: baseline ~6,371 lb does not become a source-matched measured stall merely because a flight-model default weight exists. Slat state, original speed and pressure correction remain unresolved.

## Research line 4: Duplicate and dependent measurements

The new pack makes **15 provenance relationships explicit**, referencing **fully qualified IDs from the merged original and follow-up packs**. They distinguish a **single original report** indexed multiple times from distinct reports on the *same specimen*, and from a report's **comparison columns quoting another aircraft**.

Examples:

- `P-38G-1 42-12687`: original Wright Field **FS-M-19-1538-A** appears in both `R11` and `B01`: **one** report, not two independent checks.
- `P-51B-5 43-6883`, `P-51B-15 43-24777` and `P-47B 41-5902`: original reports and follow-up stall/correction catalogs are separate **views of the same campaigns**.
- Spitfire IX 1946 pilot notes recur in the IAS and correction catalogs: **one original manual**, not experimental repeats.
- `A6M3 EB-201` and `FM-2 15953`: multiple source tables/archives refer to the same original trial records.
- F6F-3 BuNo 40164 historical control-column values recur in later **F6F-3 42633** and **F6F-5 58310** comparison reports. **Only the repeated 40164 values** should be deduplicated; the other two specimens retain independent tests.
- F6F-3 BuNo 04776: NACA Parts I and III are **same airframe/test program**, with different instrumentation and stall outcomes, not independent validation cohorts.
- P-47D-30 43-3441: NACA RM L8A06 and superseding TN 2899 are **one experiment**. Do not double-count the 1953 text as new 1953 flight testing.

Consequently **139 sources and 755 rows are indexing/coverage counts**, not an independent N or a quality score. The broad reports from the previous 553-row library likewise include transcribed reports, repeats and original figure series. A statistically sound historical error estimate must group by test programme/specimen/setting and reserve **independent groups**, not randomly split nearly identical rows.

## Progress since Michael's parallel research request (10 November 2026, about 00:09 Amsterdam time; 9 November 23:09 UTC)

This is a **chronological GitHub milestone ledger**, not a claim each row is an independent test.

| Merged PR | Real change | Evidence / simulator effect |
| --- | --- | --- |
| [#27 v3.11](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/pull/27) | Adds **Fw 190 A-4 W.Nr. 783**, altitude-aware speed-dependent power | Five-model research comparison; separate Fw speed and climb chart references |
| [#28 archive](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/pull/28) | **61 reports, 44 series, 289 rows**, broad fighters including Japanese, RAF and USN | Original-scan/transcription distinction; first compact multi-fighter performance archive |
| [#29 v3.12](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/pull/29) | Adds **P-38G-1 42-12687**, twin-engine propulsion | Six actual simulator profiles; bounded original speed/climb checks, no independent precision certification |
| [#30 v3.13](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/pull/30) | Mustang climb/turn-power replays and attempted propulsion correction | Five chart replays, turn sensitivity; regression-producing global propeller candidate rejected; old coefficients retained |
| [#31 balanced archive](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/pull/31) | **+14 sources, +32 series, +264 rows**, stronger per-specimen balance | Historical archive **289→553 rows**, e.g. P-38, P-47, A6M3, Hurricane, FM-2, Mustang FX858 |
| [#32 external comparisons](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/pull/32) | Explicit source-conditioned IL-2/DCS comparison audit | Cross-simulator references, **not independent historic measured truth** |
| [#33 v3.14](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/pull/33) | **+173 stall/minimum-speed rows**, source-figure records and original airspeed correction research | **553→726 rows, 190 stalls, 134 sources, 19 correction records**; versioned automatic evidence ingestion and searchable simulator panel; physical coefficients unchanged |
| **This follow-up** | Four research tasks, ten Spit VA IAS+CLmax, 14 P-47D-30 figure masses, five F6F CN, 15 lineages | **726→755 rows, 190→200 stalls, 134→139 source records**, original CAS tally unchanged |

The development of an accessible *research archive* is now much further along than validation of the **sustained-turn flight model**. More indexed data and replayed speed/climb charts do not automatically provide independent turn-accuracy or a 5:1 separation guarantee.

## What is really "super good enough" by aircraft and variant?

**Strict end-to-end definition for a *historically validated* aircraft simulator profile:** source-matched altitude/rating-dependent engine and propulsive power, original speed/climb, stall **CAS/EAS or demonstrably correct near-stall mapping**, actual mass and flap/gear/slat/cooling state, retained independent manoeuvre checks, and a defensible uncertainty budget. Under that definition **none of the current six simulator profiles fully passes**. Some individual *dimensions* are much stronger and useful now:

| Exact model or test variant | Strongly supported subdomain now | Critical missing evidence | Full historic stall/turn + flight-envelope "super good enough"? |
| --- | --- | --- | --- |
| **Spitfire LF Mk IXc BS.543**, Merlin 66 | Many same-report **speed and climb** points, full-altitude RAF conditions | Original full-span BS.543 low-speed CAS/CLmax, exact climb mass/boost and independent turns | **No** |
| **P-47B 41-5902** | Same-specimen **torque/BHP, speed and climb** checkpoints, usable mid/high-altitude profile | 105 mph stall only IAS, no low-speed PEC, per-stall mass, cooling/prop uncertainty | **No** |
| **P-51B-15 43-24777** | Dense speed/performance, nine stall runs with **instantaneous weights** | Near-stall IAS position correction, independent matched powered turns/prop map | **No** |
| **Bf 109 F-4**, original specimen unverified | Limited low-altitude speed and conditional power/scenario evidence | Original F-4 calibrated stall, slat state, detailed climb/power and turn tests | **No; weakest of first four** |
| **Fw 190 A-4 W.Nr. 783** | Original **level-speed and climb charts** plus comparative installation trials | Low-speed calibrated stall and real engine/prop/turn validation | **No** |
| **P-38G-1 42-12687** | **6 level-speed + 8 climb rows**, original per-engine power chart context | Stall CAS, installed η/cooling, another independent same-variant trial | **No** |
| **P-47D-30 43-3441** (archive candidate) | NACA 14 original figure-specific stall/turn flight-run masses, maneouvre figures | Digitize actual speeds/CN and verify instrument system; same-specimen performance across altitude | **No, but strong stall/turn candidate** |
| **F6F-3 BuAer 04776** (archive candidate) | NACA **fuel-adjusted CN** for 5 power/configuration states, position-error-free service IAS system | Numeric figures and IAS/CAS equivalence, same-airframe speed/climb/engine power | **No, but unusually promising** |
| **Spitfire VA NACA 1942** (archive candidate) | Original **10 IAS/CLmax** pairs at ~6,184 lb; low-speed cockpit chart | Match airspeed recording channel to correction and independent same-variant altitude tests | **No; excellent bounded stall source** |
| **Mustang III FX858**, Merlin 100 +25 lb | **47 speed/climb/IAS/TAS/PEC rows** at source-separated weights | Original full correction/mass map, short-term rating duration; cannot represent ordinary P-51B | **No; strong special-rating speed/climb dataset** |
| **A6M3 Model 32 EB-201** | Speed, climb, original water-column/CAS calibration and stall references | Scan/IAS pressure-channel reconciliation, independent repeat and installed power | **No; good multi-dimensional intake candidate** |
| **F4U-4 BuAer 80765** | **4 explicit CAS** stall configurations, source weight ~12,500 lb | Source power label ambiguity, independent power/drag/climb across altitude | **No; strongest direct-stall-CAS anchor** |
| **Hurricane II Z2963** | Original NACA **8 IAS stall states at 7,014 lb** and low-speed cockpit figure | NACA versus cockpit airspeed channel, corrected CAS, same-specimen speed/climb | **No** |
| **Fw 190 D-9 W.Nr. 210002** | Original German speed/installation/rating tests | Low-speed calibrated stall, substantial climb, matched engine installation across states | **No** |
| **FM-2 BuAer 15953** | Multiple original minimum-speed states | Confirm actual aerodynamic stall vs minimum speed, IAS/CAS, complete altitude engine data | **No** |

**Practical use of "super good enough" for a *narrow source replay*:** Some specific bands **are** sufficiently described to replay as *bounded historical tests*: BS.543's level-speed schedule, 41-5902's torque-meter climb states, P-38G speed/climb, FX858's special-rating charts, the Spitfire VA's original reported CLmax conditions, and F6F's measured CN bands. This **does not make their full aircraft simulation super good enough** or confer independent validation on a fit to the same source.

## Priority intake: new aircraft and exact variants

| Order | Model/variant to pursue | Rationale and initial version scope | Entrance gate |
| ---: | --- | --- | --- |
| **1** | **P-47D-30 (43-3441)** | Direct B-versus-D physical comparison; NACA original stall, weight and turning figures, plus separate D-series speed/climb reports | Extract and classify RM L8A06 Fig. 28–32 and 47–59, identify speed instrumentation and retain D-10/D-30 installation differences. Do not merge 43-3441 with D 42-26167 as one identical airplane. |
| **2** | **F6F-3 Hellcat (BuAer 04776)** | Adds US naval fighter with rare original fuel-adjusted peak normal-force and position-corrected instrument research | Digitize stall traces and fuel-corrected weights, match NACA Parts I–III; obtain same-installation engine and speed/climb inputs. |
| **3** | **A6M3 Model 32 Zero / EB-201** | Strong comparative opponent for F6F-3 and broader Pacific coverage; speed/climb/stall/calibration already indexed | Obtain original scan, reconcile water-column to cockpit IAS, power and standard test weight. |
| **4** | **Spitfire VA NACA specimen** | One of the best documented primary stall/C_L records; historical early-war contrast to LF IX | Calibrate which speed head produced the reported ten IAS numbers; source same-variant speed and altitude power. |
| **5** | **Fw 190 D-9 W.Nr. 210002** | Expand German A-versus-D engine/prop and drag comparison; original W.Nr.-specific speed trials | Exact Jumo 213 installation, full climb and near-stall source. |
| **6** | **F4U-4 BuAer 80765**, then wartime **F4U-1** separately | Distinctive direct CAS anchor; Corsair 1945 IAS-to-CAS* manual calibration is a different earlier variant | Confirm 1948 source label conflict, source matched engine/power/drag and mass; never assign F4U-4 CAS to F4U-1. |
| **7** | **Tempest V JN731** and **P-40F 41-13635** | Expand British high-performance and American medium-altitude cases; P-40F has seven powerful same-specimen bracing-on/off TAS pairs | Source stall/PEC and actual climb mass, preserve special stores/cowl conditions. |
| **Longer term** | **Bf 109 G-2, Yak-3, La-5FN/La-7, Ki-84** | Broader European/Eastern and Pacific fighter diversity | Only when original source identity and performance measurement quality meet intake gates; do not treat TAIC performance estimates as measured. |

**Recommended next integrated scientific milestone:** choose a P-47D-30 and F6F-3 *paired* research-and-model package, with actual figure point digitization, identification of near-stall speed definition, closed vs open flap/gear, per-flight mass and primary engine/drag inputs. Assess the new candidates against baseline plus at least one independent holdout before revising power-off CLmax or sustained-turn rankings. In parallel, continue original **direct CAS/EAS** and **true low-speed correction** retrieval on the four original benchmark variants, prioritizing P-51B-15 and P-47B. Do not sidetrack into one-engine-out or battle-damage physics for this release.

## Acceptance and reproducibility

The source registry **automatically** embeds the new compact pack in a rebuilt simulator. It does not change physics coefficients. The new research regression verifies: exactly 10 original Spitfire VA IAS/CLmax pairs, 14 non-speed P-47D figure-caption mass records with the two uncompleted wave-offs excluded from completed-stall claims, five F6F CN bands, 15 references resolving to existing sources and retention of **4 direct CAS + 1 original CAS***. Full repository checks must also preserve historical baseline values and browser functionality. Archive scan PDFs and full-resolution images remain external hyperlinks; only compact data, explanatory notes and the provenance map go into GitHub.
