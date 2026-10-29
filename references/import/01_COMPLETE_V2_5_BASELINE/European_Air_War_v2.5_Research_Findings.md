# European Air War v2.5 — P-47C original test constraint

**Source-first research checkpoint, 28 October 2026.** Adds three provisional *original-report OCR* flight-run records, four historical efficiency constraints, an auditable dimensionless comparison, a four-aircraft baseline regression guard, and a 1946 figure locator. **It does not alter the default physics or claim the original scans were digitized.**

## Principal finding: power loading must be modeled

NACA ACR L4L07 (December 1944), Republic P-47C fitted with **Curtiss 714-1C2-12 four-blade propeller**, says that at 165 mph IAS increasing engine power from normal to military reduced propeller efficiency by **5–8%**. Its discussion gives approximate efficiencies around **76% at military climb**, **80% at normal power 160 mph IAS**, and **around 85% at normal power 165 mph IAS**. These descriptions are rounded and need review of the original figure; the percent/percentage-point distinction remains unresolved.

At **representative** ISA 5,000–20,000-ft scenarios, using the source’s approximate 2,000/1,625 bhp and 2,700/2,550 engine RPM, and **IAS = CAS only as a stated proxy** (not a validated calibration), the existing shared model C gives:

| Altitude | Model-C relative efficiency loss, normal→military at 165 IAS | Report general flight result |
|---|---:|---:|
| 5,000 ft | 0.86% | 5–8% (not a per-altitude pointwise value) |
| 10,000 ft | 0.83% | 5–8% (not a per-altitude pointwise value) |
| 15,000 ft | 0.76% | 5–8% (not a per-altitude pointwise value) |
| 20,000 ft | 0.67% | 5–8% (not a per-altitude pointwise value) |

The mismatch is larger than its single-case speed fit would suggest. The NACA 1941 generic chart **also does not directly solve the full discrepancy** and clamps Cp below 0.2 in the old model. v2.5 now refuses to score a datum outside that chart's documented Cp range. Do not infer the Curtiss installed efficiency from generic three- or four-blade assumptions.

## Provisional numerical 1944 records (visually unverified)

The original 1944 report PDF was identified in NASA NTRS, but its large scanned bytes were unavailable for visual review in this runtime. The figures/table values below are reconstructed from an OCR text rendering of the original report on Scribd. **These rows are plausible and internally consistent, not independently certified figure digitization.**

| Run / figure | J | Cp | Ct | Source OCR η | J·Ct/Cp | Current C η | Residual C−source |
|---|---:|---:|---:|---:|---:|---:|---:|
| 20-1 / 7a | 1.00 | 0.165 | 0.132 | 0.799 | 0.800 | 0.788 | -0.011 |
| 24-6 / 11a | 1.59 | 0.343 | 0.171 | 0.792 | 0.793 | 0.829 | +0.037 |
| 24-5 / 11b | 1.84 | 0.347 | 0.151 | 0.801 | 0.801 | 0.826 | +0.025 |

**New physical insight:** tip-Mach correction alone cannot explain a significant efficiency loss across climb power settings while the corresponding tip Mach is low. Blade-section loading, blade pitch distribution and induced/profile losses have to be represented before promoting a source-backed propeller mode. The generic model’s `eta(J,Cp,Mtip)` function is underidentified; adding a fitted loss for one named aircraft would be a step backward.

## Two other NASA reports preserved as next validation fixtures

- **NACA RM E6K26 (1946)**: on the YP-47M, Hamilton Standard **6507A-2**, with four-blade Cp 0.1–1.0 and free-stream Mach 0.2/0.3/0.4; three-blade Cp 0.3–1.0 at Mach 0.4. Original OCR is archived and a *PDF-figure page locator* has been generated. Charts still require visual verification. Authors warn that absolute force efficiencies are uncorrected for tunnel wall constriction. This is a *different blade family* and not the P-47B Curtiss map.
- **NACA ACR 3I30 (1943)**: a *measured-turn* F2A-3 methodology validation case, about 90–160 mph over two altitudes and flap conditions. Its original scan exists online, but no verified plotted numeric turn points were available here. It is explicitly NOT a Bf109/P-51/Spitfire aerodynamic substitute.

## Source status / reproducibility

- NASA P-47C primary report metadata: https://ntrs.nasa.gov/citations/19930093302 ; report text OCR: https://www.scribd.com/document/187787145/NACA-ACR-L4L07-Tests-of-a-Curtiss-Propeller-on-P47C
- NASA 1946 tunnel report: https://ntrs.nasa.gov/citations/20030065899
- NASA 1943 turning report: https://ntrs.nasa.gov/citations/19930092640
- File-level evidence: `P47C_Curtiss_714_Source_Data_v25.json`, `SOURCE_VERIFICATION_MATRIX_v25.csv`, `YP47M_E6K26_FIGURE_LOCATOR_v25.csv`.
- Run: `node p47c_source_audit_v25.cjs --write` then `node test_p47c_source_v25.cjs` in the source folder. Graph is `European_Air_War_P47C_1944_v2.5.png`.

## Model decision

**Do not promote an inaccurate four-aircraft model revision yet.** v2.5 is the new *historical falsification benchmark* and evidence-domain guard; prior `C`, `N`, and `M` numerical outputs remain unchanged. Priority next: obtain page images of P-47C NACA figs 4–6, 8–11 and tables I/II; digitize complete η(J,Cp,β,Mtip) runs; then construct an interpolated Curtiss-specific map with strictly bounded domain and test against the original climb/level-speed validations. In parallel the F2A turn scan can yield a genuine historical sustained-turn benchmark.
