# WW2 fighter archival expansion: Smithsonian NASM, Bundesarchiv and original control tests

**Research date:** 6 November 2026. **Scope:** original four simulator benchmarks plus reusable leads for other WWII fighters, with a special cross-reference to the earlier P-38/Mosquito external-bomb comparison. **Research-only:** no solver code, empirical coefficients or validation thresholds were changed. The complete four-aircraft baseline audit is [the companion report](FOUR_BENCHMARK_FIGHTERS_PRIMARY_SOURCE_AUDIT_2026-11-06.md); the durable machine-readable source list is [`references/archive_fighter_source_register.csv`](../../references/archive_fighter_source_register.csv).

## Verification levels and source count

- `inspected_original_scan`: original report/manuscript scanned, and relevant page/graph actually read; values can be transcribed with explicit conditions and caveats.
- `original_scan_linked`: source scan exists, but current research did not verify all of its contents; source ready for page-level inspection.
- `catalogue_item`: archival finding aid or an institutional item record identifies a title and a box/folder; **the report's results are not known**.
- `catalogue_item_digital_listed`: institutional media record claims a digitized object, but the content was not successfully retrieved and read.
- `catalogue_collection`: collection-level existence; **no assertion that a particular propeller/aircraft is covered**.
- `secondary_locator_only`: forum or independent index proposes an archival signature; the corresponding official record and scan were not opened, and the claim remains provisional.

The current catalogue has **36 specifically tracked entries**, encompassing **2 institutional archives (NASM and Bundesarchiv), additional NACA primary material and historic Wright Field scans**. Each row is a *document or collection lead*, **not** an independent flight experiment or a simulator validation point. An item can concern multiple variants; a broad source containing thirteen fighters is one report, not thirteen independently verified aircraft. We deliberately include a few research-only leads for P-38 and Mosquito because they resolve adjacent controlled-store questions. Do **not** infer from the register that all listed fighters are now scientifically calibrated.

## Smithsonian NASM: what is actually available

1. [Wright Field Technical Documents Library, NASM.XXXX.0428](https://sova.si.edu/record/nasm.xxxx.0428). The huge type-ordered archive contains wartime American manufacturer, USAAF, US Navy, Royal Air Force and A&AEE reports, including intelligence translations and operational handbooks. It is **not** a homogeneous set of measured curves. For every retrieval record both its wartime source and the SOVA box/folder. The same A&AEE or Wright Field trial reported here and on a transcription site remains *one* experiment.
2. [Wright Field Propeller Test Reports, NASM.XXXX.0417](https://sova.si.edu/record/nasm.xxxx.0417), physical two-box collection, 1921–1946 (bulk 1935–1943). Collection scope explicitly covers Wright Field Engineering/Material Division propeller tests. This is a **lead**, not proof that Hamilton Standard K-6523A-24 or Curtiss 714-1C2-12 performance maps are inside it. The collection is physically accessible under museum terms, but its contents were not obtained.
3. [Curtiss-Wright Corporation Records, NASM.XXXX.0067 (institutional finding-aid PDF)](https://sirismm.si.edu/EADpdfs/NASM.XXXX.0067.pdf), *Series 2: Technical Reports*, **Box 84 folders 11–19**, holds many named P-40 Wright Field flight reports. The list is unusually useful because it contains exact wartime report IDs that can be matched to surviving scans. It also contains a proven cataloguing discrepancy: the Box 84/Folder 19 entry says **P-40E**, but the actual 11 July 1942 **PHQ-M-19-1440-A** original scan unambiguously identifies **P-40F 41-13601**. Do not carry the finding-aid airframe type into test data.
4. [United States Navy Engineering Drawings on Microfilm, NASM.1994.0058](https://sova.si.edu/record/nasm.1994.0058): original design-drawing microfilm is catalogued for **F4F, F6F, F8F, F4U and F2G** families. Drawings can resolve wing planform, propeller hub and accessories but do not by themselves provide measured stall or drag tests. This additional collection is a follow-up route, not a source of numerical performance records in this audit.

### High-priority NASM reading queue

| Airframe family | Original wartime report/title | Archive locator and direct URL | What it could resolve | Current evidence |
|---|---|---|---|---|
| **Bf 109 F-4** | British A.I.2(g) **2076**, 8 Jul 1942, description with DB601E | **D638, Messerschmitt /169**; [item](https://www.si.edu/object/archives/components/sova-nasm-xxxx-0428-ref3849) | Exact captured-F installation, if detail extends beyond description | Catalogue only; not a Rechlin flight measurement |
| **P-47B/C/D** | T.O. **01-65BG-4** parts catalogue, 1 Jun 1942 | **D658, Republic /01-65BG-4**; [item](https://www.si.edu/object/archives/components/sova-nasm-xxxx-0428-ref4547) | Installations and the Curtiss propeller/gear chain | Catalogue only |
| **P-47C and Fw 190** | AFDU tactical trials and RAF Wittering addendum to Report **66**, 16 Jun 1943 | **D659, Republic /140** [report](https://www.si.edu/object/archives/components/sova-nasm-xxxx-0428-ref4560); **/161** [addendum](https://www.si.edu/object/archives/components/sova-nasm-xxxx-0428-ref4561) | Historical comparative turning/handling statements | Two **associated documents**, not two established independent flight trials |
| **P-38 family** | Wright Field **ENG-57-523-261** coolant radiator design, 6 Apr 1944 | **D630, Lockheed /391**; [catalogue item](https://sova.si.edu/record/nasm.xxxx.0428/ref3636) | Hardware sizing, installation and pressure-flow evidence | Catalogue only; **not** net cooling drag |
| **Fw 190, Spitfire IX, Mustang** | M.I.D. England **48,392** comparative performance, 13 Jun 1942 | **D681, Misc /203**; [item](https://sova.si.edu/record/nasm.xxxx.0428/ref5574) | Contemporary comparative claims | Catalogue only; identify test origin / possible estimates |
| **Hawker Typhoon** | A&AEE **761a part 38**, 25 Aug 1943, asymmetrical 500-lb wing bomb jettison | **D624, Hawker /S-10**; [item](https://sova.si.edu/record/nasm.xxxx.0428/ref3332) | Load/handling asymmetry, not clean vs bomb drag | Catalogue only |
| **F6F Hellcat** | A&AEE **809 part 13**, 3 Jan 1944, engine cooling in level flight | **D614, F6F group**; [finding-aid search](https://sova.si.edu/record/nasm-xxxx-0428/search?n=100&q=Technical+documents&s=2200&t=W) | Cooling operation at speed | Catalogue only; specimen and cooling-deflection values missing |
| **F4U Corsair** | British Corsair R-2800-10 pilots' notes, May 1943; USN external tank flight tests on F4U-1D | **D613, F4U/1** and **F4U-1/4**; [finding aid](https://sova.si.edu/record/nasm-xxxx-0428/search?n=100&q=Technical+documents&s=2200&t=W) | Installation/cooling and stores | Catalogue only; not same P-51/P-38 conditions |
| **Ki-84** | **PACMIRS air translation 8**, 26 Jul 1945, operating instructions | **D641, Nakajima /21**; [Smithsonian object with PDF-media marker](https://www.si.edu/object/archives/components/sova-nasm-xxxx-0428-ref4016) | Captured Japanese fighter operating envelope | Digital object indexed but embedded PDF inaccessible to us; no numeric claims |
| **Mosquito B family** | A&AEE **767h part 8**, 20 Feb 1944, level speed with **two external 500-lb bombs** | **D589, Mosquito /28**; [Smithsonian original-report holding](https://sova.si.edu/record/nasm.xxxx.0428/ref2147) | **Direct archive location for the earlier LR495 bomb-load comparison** | Catalogue only; title/date match, **LR495 identity not yet reverified from its pages** |
| **Mosquito family** | A&AEE **767e part 12**, 1 Feb 1944, normal vs increased boost; A&AEE static-vent PEC, 3 Jan 1944 | **D589, Mosquito /27** [boost](https://sova.si.edu/record/nasm.xxxx.0428/ref2146) and **/25** [PEC](https://sova.si.edu/record/nasm.xxxx.0428/ref2145) | Needed common operating envelope / IAS correction | Both catalogue only; not evidence of a paired bomb-on/off run |

Other officially indexed families worth targeted reading: P-39 and P-63, P-40D/E/F/N, F4F Wildcat, F6F-3/5 Hellcat, F8F Bearcat, Hawker Tempest, Hawker Hornet, Spitfire I/IX/XIV, Mustang III/P-51, Nakajima Ki-27/Ki-84, and the captured "Zeke 52" instruction. Those **family names are research coverage**, not a claim of individual original test reports for each variant. In particular, SOVA's "Zeke" folder is filed under **Nakajima** although the A6M Zero was built by **Mitsubishi**; do not infer manufacturer from its catalogue hierarchy.

## Bundesarchiv: confirmed catalogue signatures, not yet original performance tables

The [Bundesarchiv's RL 3 series](https://www.bundesarchiv.de/im-archiv-recherchieren/archivgut-recherchieren/nach-themen/technische-zeichnungen-militaerischer-herkunft-bis-1945/) is relevant for authentic aircraft specifications. Through **Deutsche Digitale Bibliothek**, an institutional aggregator of Federal Archives metadata, the following are verified **item-level** catalogue records:

| Aircraft | Direct catalogue record | Signature | Period | What it establishes |
|---|---|---|---|---|
| Fw 190 family | [L.Dv. T 2190 exercise card](https://www.deutsche-digitale-bibliothek.de/item/AL4UOJGFWI4IW7BMWHXZDP24WXIHKCEP) | **BArch RL 3/7777** | Dec 1942 | Original manual/document in a known archival file |
| Fw 190 **A-1/A-2/A-3** | [L.Dv. T 2190 flight operating instructions](https://www.deutsche-digitale-bibliothek.de/item/NMNI2VW3XVPOYDAFLLJPUYQM7GCISDM4) | **BArch RL 3/7779** | Aug 1942 | Variant-specific instructions exist |
| Fw 190 **A-1 to A-8** plus F-series appendix | [L.Dv. T 2190 instructions](https://www.deutsche-digitale-bibliothek.de/item/LZ2IYLFKLOZPPHSL2DUHLEH4NILSDFYQ) | **BArch RL 3/7781** | Feb 1944 | Later variant and external-store installation material exists |

The pre-existing [**RL 3/66** finding-aid lead](https://www.yumpu.com/de/document/view/5682788/bundesarchiv-militararchiv-bestand-rl-3-generalluftzeugmeister/34) to **GL/A Nr 1316/42 gK**, stand 1 June 1942, remains the best identifiable route to the **Bf 109 F-4** performance tables. The original **F-4 leaf** with specimen, weight, boost, rpm, cooling and speed correction remains unread. A forum quotes possible Bf109F performance; those figures are **not upgraded** by the archive locator alone.

Two extra German research leads were found by third-party archival references, **not confirmed on official item pages here**:

- **BArch RL 3/6350:** Heinkel **He 219 A-0**, *Werkschrift 2219 Flugzeug-Handbuch* (1944). [Third-party scan index](https://www.festungsbauten.de/Archiv.htm). The type is a night fighter; archive signature and original pages still need direct verification.
- **BArch RL 3/7914:** purported November 1944 Messerschmitt **Me 262** variant brochure; a forum supplies an [Invenio direct-link](https://invenio.bundesarchiv.de/invenio/direktlink/b48be25b-7977-4c09-9071-8904ec2aa042/). This viewer link could **not** be opened in the research environment. Its identity, original page count and data are not verified.

Do not treat a manual or a variant-development sketch as a measured drag polar. German primary-report retrieval must still distinguish engine intake ram, cooler flap, *Start- und Notleistung* vs *Kampf-/Steigleistung*, full-throttle height, serial number and field modifications.

## Newly inspected, multi-speed physics control: P-40F with empty external braces

**Primary original scan**: USAAF Wright Field **FS-M-19-1578-A**, **3 April 1943**, P-40F **41-13635**, Packard **V-1650-1**, three-blade propeller **drawing 101344-24** and standard spinner; airframe with six .50-cal wing guns without ammunition, full initial fuel/oil, wing flaps neutral, gear up, carburetor cold, auto-rich, boost-auto **off**. Neutral radiator flaps for level speed; fully open for climb. Test compares **belly tank sway braces left installed, with no tank**, against **the braces removed**. [Original scan pp.1–2](https://www.wwiiaircraftperformance.com/org/p-40/p-40_files/P-40F_41-13635_FS-M-19-1578-A.pdf); image pages 1 and 2 independently inspected. Power values are **read from engine charts**, not torque-meter readings. [Transcribed report section](https://www.wwiiaircraftperformance.com/org/p-40/p-40.html). Do not add power from braces: it is **airframe drag**, not shaft BHP.

| 18,100 ft, high blower, engine BHP / rpm | With empty sway braces, mph **TAS** | Braces removed, mph **TAS** | Braces penalty in original units and relative to clean speed | Evidence |
|---|---:|---:|---:|---|
| 1,100 BHP / 2,950 rpm | 365.5 | 374.0 | **−8.5 mph (−2.27%)** | Original report p.1, measured flight speeds, inspected |
| 890 BHP / 2,650 rpm | 336.0 | 342.0 | **−6.0 mph (−1.75%)** | Same |
| 760 BHP / 2,400 rpm | 311.0 | 317.5 | **−6.5 mph (−2.05%)** | Same |
| 635 BHP / 2,200 rpm | 283.5 | 291.5 | **−8.0 mph (−2.74%)** | Same |
| 530 BHP / 2,000 rpm | 258.0 | 266.0 | **−8.0 mph (−3.01%)** | Same |
| 445 BHP / 2,000 rpm | 233.0 | 240.0 | **−7.0 mph (−2.92%)** | Same |
| 360 BHP / 2,000 rpm | 194.0 | 200.0 | **−6.0 mph (−3.00%)** | Same |

**Why this is useful:** seven *paired* flight-speed measurements change only the installed empty-brace state, at a common reported altitude and matching BHP/rpm for each pair. The penalty is measured as speed, **not direct drag force**: deriving extra drag needs a propeller model and the engine/airframe balance, with uncertainty. It applies to *this P-40F* with these braces. It cannot be assigned to P-38G bomb racks, P-51B wing racks, other propellers or a single airspeed without independent matching evidence. No per-run actual aircraft mass, atmosphere scatter or complete uncertainty covariance is given in the short report; treat percentages as arithmetic ratios, not an estimate of experimental precision.

**Complementary primary records (same P-40F family, different test purpose):**

1. **P-40F 41-13601, PHQ-M-19-1440-A, 11 Jul 1942**: Packard V-1650-1 and Curtiss blade 89301-3; **8,450 lb** test gross mass; wing bomb shackles and sway braces installed, radiator shutters *flush* for level flight / *wide open* for climb. At **19,270 ft, high blower, 3,000 rpm, 1,105 chart BHP** the test reports **364.5 mph TAS**; at **20,000 ft, 2,850 rpm, 980 chart BHP**, climb **1,480 ft/min at 205 mph TAS**. [Original three-page scan](https://www.wwiiaircraftperformance.com/org/p-40/p-40_files/P-40F_41-13601_PHQ-M-19-1440-A.pdf), p.1 inspected. The Smithsonian **Box84/Folder19** catalogue falsely calls this **P-40E**. **Do not treat these numbers as a matched brace-removal test against 41-13635.**
2. **P-40F 41-13635, FS-M-19-1549-A, 18 Feb 1943**, five-propeller comparison at the same airframe with fixed RPM/BHP controls and prop-specific hardware. [Four-page original scan](https://www.wwiiaircraftperformance.com/org/p-40/p-40_files/P-40F_41-13635_FS-M-19-1549-A.pdf) indexed, not independently page-digitized here. This can constrain *propeller selection effects*, but separate hubs/spinners and slight BHP/speed differences need matched-test review. **FS-M-19-1578-A explicitly refers back to this companion prop test.**

## Wider fighter coverage from one original NACA synthesis

NACA [**Report 868, *Summary of Lateral-Control Research***](https://ntrs.nasa.gov/api/citations/19930090943/downloads/19930090943.pdf) (Langley Research Staff, compiled by Thomas A. Toll, 1947), **Figures 46 and 47, printed pp.39–41**, gives rolling rate/roll helix angle versus **indicated airspeed in mph, 160–380 mph IAS**, at **10,000 ft** with a **50-lb stick force** condition. Its plotted family includes **Spitfire normal wing, Spitfire clipped wing, Fw 190, P-63A-1-BE, P-40F, P-51B-1-NA, XP-51, P-47C-1-RE, F4F-3, P-39D-1-BE, F6F-3, Hawker Typhoon and Japanese Zero**; the report itself flags the Zero's force limit as unknown. **Original published report PDF and figure descriptions inspected.**

This is a high-leverage original synthesis for future **roll response**, *not* a new observation of sustained turn g, a clean drag polar, or stall CAS. Several curves are redrawn from earlier reports and require the report's own referenced tests before they can become independent validation rows. Its minimum plotted IAS (~160 mph) does not license near-stall extrapolation for the four benchmark fighters.

## Which comparison is now better supported, and what is still missing?

| Question | Newly concrete lead | Present result | Still missing before a historical simulator score |
|---|---|---|---|
| P-51B 115 hp η difference | NASM prop-report archive; Fw190/Mustang comparison; P-40F matched propeller tests as a *different-aircraft* sensitivity | Old η=.8 vs simulated ~.883 remains an assumption difference | **Exact K6523A-24 η(J,Cp,Mtip)** and 1943 Packard altitude map; exact workbook formula provenance |
| P-47B climb/stall | Period P-47B/C/D parts and RAF P-47C/Fw190 tactical holdings | Existing original 41-5902 torquemeter climb control remains valid; no new near-stall CAS | P-47B near-stall airspeed position error and actual stall mass |
| Spitfire LF IX BS543 vs Fw190 | NASM Fw190/Spit IX/Mustang 1942 comparative intelligence note; Bundesarchiv original Fw190 A manuals | Additional document route, **not Greg graph provenance** | Greg original variant/axes + BS543 original A&AEE scans and Fw190 matched polar |
| Bf 109 F-4 | RL3/66 and British A.I.2(g) 2076 item | At least one concrete original F4 archive address, no direct flight curve read | Original F-4 performance leaf and Rechlin stall/PEC test |
| P-38G vs Mosquito external bombs | **NASM /28 A&AEE 767h part8** (the actual 2×500lb trial title) plus /27 boost and /25 PEC | Original report location, not measured load penalty yet | LR495 serial confirmation in original, same-power clean/loaded paired curves, empty racks, full internal load |
| Generic external stores / drag | **P-40F FS-M-19-1578-A seven measured pairs** | Strong new independent physics shape check for *P-40F empty braces* | Aircraft-specific transfer tests for other fighters; propulsive power to calculate force |
| Other WWII fighters | NASM multi-aircraft folders, original P-40 performance/propeller runs, NACA 868 roll compilation, Bundesarchiv Fw190 manual signatures | Indexed future source options, some specific measured data | Original reports + matched conditions for each aircraft before entering scored benchmarks |

## Provenance and follow-up discipline

- Preserve **one historical test per flight**, even if Smithsonian finding aid, NACA synthesis, a later reprint, several figure JPGs and a transcription all point to it. The archive *holding* and its scan mirror are corroboration of document identity, not repeated experiments.
- The P-40F `41-13601` original is *not* the same physical test as P-40F `41-13635`; the two 41-13635 reports (FS-M-19-1549-A and -1578-A) concern different measurements of the same specimen. No unrelated P-40 measurement is used to numerically fit the four active benchmark aircraft in this research-only milestone.
- Check NASA/NACA PDFs, original RAF/A&AEE reports and manufacturer manuals before assigning *measured* status. Mark accepted speed definition (IAS/CAS/EAS/TAS), altitude, weight, boost/BHP origin, propeller/hub, stores, cooler and atmosphere explicitly in every eventual numeric dataset.
- The next source retrieval should request a **targeted copy of NASM D589 /28, /27, /25** and **D638 Messerschmitt /169**, and seek the exact Hamilton Standard and Curtiss prop reports in **NASM.XXXX.0417** without claiming unverified contents. In parallel use official Bundesarchiv finding aids and Invenio to retrieve **RL3/66** leaf and **RL3/7779 /7781** performance-relevant manual pages. These are clear archival objectives, not authorization to adjust the scientific solver.

**Research outcome:** a preserved, searchable queue of archival source identities; a confirmed same-airframe, seven-speed original empty-brace experiment on a new fighter; a confirmed Smithsonian holding for the Mosquito 2×500lb original test; and primary roll-response coverage for thirteen fighter configurations. No claim of a validated new P-51 η, F-4 clean stall, Spit/Fw drag minimum or P-38 bomb drag is justified yet.
