# Report investigation and source checks

Reviewed on 12 November 2026. The [Gemini extract](../analysis/full_gemini_extract_2026-11-12.json) preserves the submitted values. Original pages, report identifiers and application conditions determine the evidence grade.

## Stall readings checked against the source

| Source | Checked observation | Catalog and application |
| --- | --- | --- |
| Wright Field Eng-47-1749-A §V.E, P-51B-15 43-24777 | 86 mph IAS at 8,000 ft and 9,270 lb, power off, gear/flaps up, oil/coolant shutters closed | `stall_us_2026-11-10:US02:0001`. Figure 1 begins above the stall range. Keep the measured IAS and estimate EAS only with stated correction and loading assumptions. [Original report](https://wwiiaircraftperformance.com/org/p-51/p51b-24777.html) |
| Wright Field Eng-47-1734-A §V.F, P-51B-5 43-6883 | 94 mph IAS with instrument error removed, about 9,100 lb at stall, power off, gear/flaps up and shutters closed | All nine stall rows are already in `stall_us_2026-11-10:US01`. The position correction and stall altitude remain open. Keep the B-5 as its own condition. [Original report](https://wwiiaircraftperformance.com/org/p-51/p-51b-6883.html) |
| RAF tactical trials §31, captured Fw 190 A-3 | Approx. 110 mph gear/flaps up and 105 mph gear/flaps down | Existing `stall_global_2026-11-10:FW190-A3-RAF-1/2` retain the unestablished speed basis. A transfer to an A-4 must carry that uncertainty. [Original report](https://wwiiaircraftperformance.com/com/gb/documents/fw190a3_RAE-Test-Jul42-new.html) |

The cited 118 mph Fw 190 figure and the Rechlin 165/135 km/h stall attribution remain leads. The checked Wright Field **Eng-47-1743-A** is the **G-3 EB-104** trial. The F-4 factory material checked in the existing pack labels 135 km/h as landing speed. The original variant, test setup, meaning and speed basis are needed before using either draft span. [EB-104](https://wwiiaircraftperformance.com/org/fw190/g3/fw190-g3.html) · [Stall review](PROVISIONAL_STALL_ENVELOPE_2026-11-12.md)

## Report identifiers

- **NACA WR L-407** covers a pursuit-aircraft wing-duct wind-tunnel investigation. The XP-51 flying qualities and stall study is **WR L-566**. Use the prototype's own configuration and instrument basis if extracting a stall row. [L-407](https://ntrs.nasa.gov/citations/19930092660) · [L-566](https://ntrs.nasa.gov/citations/19930092575)
- **NACA TR 824** is the airfoil-data summary. **TR 916** is the pursuit-airplane drag correlation. **ACR 4K02** is separately indexed as the P-51B drag correlation. Verify test lineage before counting a drag value as independent. [TR 824](https://ntrs.nasa.gov/citations/19930090976) · [TR 916](https://ntrs.nasa.gov/citations/19930091981) · [4K02](https://ntrs.nasa.gov/citations/19930092458)
- The working Spitfire links and case tables are already documented for **BS.543**, **MA.648** and **JL.165**. Retain the original rating and installation for each set. [Simulator data roadmap](../../docs/research/WW2_FIGHTER_DATA_ROADMAP.md)

The review confirms the stall readings already catalogued and adds source locators for future extraction. The [NACA review](WW2_NACA_AND_PRIMARY_SOURCE_EXPANSION_2026-11-12.md) and [family leads](WW2_FULL_FAMILY_PRIMARY_SOURCE_LEADS_2026-11-12.md) preserve the remaining research paths.
