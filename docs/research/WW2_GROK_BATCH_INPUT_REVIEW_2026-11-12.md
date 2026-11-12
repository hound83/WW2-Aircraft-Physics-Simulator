# Grok batch review and input data v1.8.0

The review covers eleven transcript batches, three follow-up batches and supporting drafts, source checks and extraction queues at commit `0a3b4270b8`. The review record indexes 28 submitted artifacts by path and blob ID and identifies checked values, duplicate lineage and remaining attribution limits. [Artifact-by-artifact review](../../references/analysis/ww2_grok_batch_disposition_2026-11-12.json)

The input pack exports 96 source-linked records in 15 series from nine source entries. Twelve are from current reference specimens. The other 84 apply to separately identified cases, including five tip-Mach values calculated in the original FX.858 report. Read `batch_reference.series` for the conditions, values and observation IDs. The roster ID links a case to its research family. The aircraft field identifies the original test article. [Data pack](../../references/analysis/fighter-sim-inputs-v1.json) · [Original-source records](../../references/research/ww2_grok_batch_source_review_2026-11-12.json)

| Case | Added records | Evidence and use |
| --- | ---: | --- |
| P-51B-15 43-24777 | 2 | Racked low-blower lapse readings at 17,000 and 24,000 ft pair TAS with boost and chart-assigned shaft power. The high-blower and 20,800-ft rack-pair readings have existing IDs. [Wright Field §V.B.2](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) |
| P-47D-30 43-3441 | 10 | Figure 50 is a separate clean glide approach at 12,400 lb and 5,000 ft with all controls used. It reaches about 104 mph service IAS at 12 s with ±3 mph chart allowance. The exact stall event and CAS remain open. [NACA RM L8A06 Fig. 50](https://ntrs.nasa.gov/api/citations/20090022749/downloads/20090022749.pdf) |
| Bf 109 G-1 test 1586 | 12 | The Rechlin sheet includes 4:11 to 5 km at 1.30 ata and 2,600 rpm. The original min:sec column is preserved. MT-215 has its own measured trial and actual RPM. [Kennblatt sheet 7](https://www.wwiiaircraftperformance.org/me109/me109g-kennblatt-german.html) |
| Mustang III FX.858 | 52 | Climb, level, PEC and tip-Mach data for the Merlin 100 and +25 lb boost. The source joins separately flown climb runs across the blower change and corrects level results to 8,800 lb. PEC starts at 140 mph IAS. [A&AEE Tables I–II and §§4.1–4.4](https://www.wwiiaircraftperformance.org/mustang/fx858.html) |
| P-51B-1-NA propeller-off tests | 3 | Indexed original dives 108–110. Run 110 reached Mach 0.755. These data retain the removed propeller, flush radiator flap, sealed intake and modified tail. [NACA ACR 4K02](https://ntrs.nasa.gov/citations/19930092458) |
| P-47D smooth wing section | 3 | L-86 test envelope and two additional section coefficients. At the 63% span station, straight-flight section drag is 0.0075 at airplane CL 0.68. The later turn-series minimum is 0.0066. The earlier 0.0062 minimum retains its existing ID. [NACA WR L-86](https://ntrs.nasa.gov/citations/19930093001) |
| P-38J 42-67869 and 43-13563 | 10 | Two identified Wright Field cases, including 6.49 min to 23,400 ft for 42-67869 and six level rows for 43-13563. Induction leakage qualifies the latter. [Wright Field reports](https://www.wwiiaircraftperformance.com/org/p-38/p-38.html) |
| Fw 190 A-5 Normaljäger | 4 | Factory summary level and climb figures dated 20 October 1943. The level curve uses 1.42 ata and 2,700 rpm. The summary leaves the separate climb rating open. [Factory charts and report index](https://www.wwiiaircraftperformance.org/fw190/fw190a5.html) |

## Coverage before and after

The comparison uses the six weighted evidence dimensions and 13 reference variants from v1.7.0. The Mustang rows extend an axis already at full credit. The P-47D-30 record supplies a repeat service-IAS trace. Its exact stall event, position correction and CAS remain open. Related-case records receive coverage credit only when the relevant condition transfers to the reference specimen.

| Aircraft | Primary | With secondary | With calculations | New reference-specimen rows | Related-case rows |
| --- | ---: | ---: | ---: | ---: | ---: |
| F4U-4 80765 | 83% → 83% | 83% → 83% | 87% → 87% | 0 | 0 |
| P-51B-15 43-24777 | 72% → 72% | 73% → 73% | 78% → 78% | 2 | 55 |
| F6F-3 04776 | 79% → 79% | 79% → 79% | 82% → 82% | 0 | 0 |
| Spitfire LF IX BS.543 | 62% → 62% | 63% → 63% | 64% → 64% | 0 | 0 |
| P-47B 41-5902 | 64% → 64% | 64% → 64% | 68% → 68% | 0 | 0 |
| P-38G-1 42-12687 | 62% → 62% | 62% → 62% | 66% → 66% | 0 | 10 |
| Fw 190 D-9 WNr 210002 | 61% → 61% | 63% → 63% | 65% → 65% | 0 | 0 |
| Fw 190 A-4 WNr 783 | 63% → 63% | 65% → 65% | 68% → 68% | 0 | 4 |
| P-40F 41-13635 | 49% → 49% | 49% → 49% | 53% → 53% | 0 | 0 |
| Ki-84-I T-2 302 | 50% → 50% | 50% → 50% | 52% → 52% | 0 | 0 |
| P-47D-30 43-3441 | 64% → 64% | 64% → 64% | 66% → 66% | 10 | 3 |
| Bf 109 F-4 DB 601 E | 53% → 53% | 53% → 53% | 55% → 55% | 0 | 0 |
| Bf 109 G-2 DB 605 A | 65% → 65% | 66% → 66% | 69% → 69% | 0 | 12 |
| **Fleet** | **63.62% → 63.62%** | **64.15% → 64.15%** | **67.15% → 67.15%** | **12** | **84** |

The catalog grew from 1,914 to 2,010 observations. All six weighted dimensions reconcile to the baseline. The 156 planned slots retain five qualified GOLD agreements. [Coverage definitions](WW2_FIGHTER_SIM_INPUTS_V1.md#coverage-by-aircraft)

## Source checks that affect interpretation

- Spitfire AP 1565J §53, printed p. 32, includes +4 mph for 120–150 mph IAS. The six intervals were already cataloged. The low end remains above the selected 86 mph IAS clean stall. BS.543's flight report used BF.274's position corrections. [Handbook catalog rows](../../references/research/ww2_thirteen_fighter_source_recovery_2026-11-11.json) · [A&AEE BS.543](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)
- The Bf 109 F-4 value of 135 km/h is labeled landing speed at 2,560 kg. The 660 km/h level claim retains its secondary attribution until the original speed sheet can be checked. The Finnish, Rechlin and Soviet configurations have distinct lineages. [German source review](WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md#bf-109-f-4)
- The Ki-84 T-2 original gives 102 mph IAS clean at 8,000 ft and records no measured performance climb. The TAIC speed and climb claims need their own specimen and trial attribution. [T-2 interim report](https://www.wwiiaircraftperformance.org/japan/T-2_Report_on_Frank_I_Ki-84.pdf)
- The Corsair draft mixed units and configurations. The normal-fighter clean power-off point is 89.4 kt CAS and the clean powered point is 84.5 kt CAS. The 77.7 kt landing point converts to about 89.4 mph. [Fleet stall source review](WW2_FLEET_STALL_INPUTS_2026-11-12.md)

Regenerate with `node scripts/fighter-sim-inputs.cjs`. Verify with `node scripts/fighter-sim-inputs.cjs --check` and `npm run check`.
