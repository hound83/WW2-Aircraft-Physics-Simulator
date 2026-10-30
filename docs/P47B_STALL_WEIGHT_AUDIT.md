# P-47B stall weight and measurement audit

30 October 2026. Scope: original P-47B 41-5902 clean power-off stall, contemporaneous loading and airspeed provenance. **A specimen-specific 105 mph indicated observation is now established. A defensible corrected EAS/CLmax is not.** No aerodynamic coefficient or default loading changed.

## Original source and observations

The four-page Wright Field acceptance report PHQ-M-19-1417-A, 18 June 1942, was visually inspected in the browser before the user's upload. The uploaded original is now retained as [P-47B acceptance report](https://chatgpt.com/library?file_id=libfile_4553541e8458819188d6320a069c6914&account_id=personal). [Public source](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf). Numerical entries below were read from the scan, rather than inferred from forum comments or browser OCR. Local byte download was unavailable; no uploaded-byte identity comparison or local rendering is claimed.

| Report location | Established evidence | Remaining limit |
|---|---|---|
| Page 1, A.1 | 41-5902; R-2800-21; Curtiss 714-1C2-12 with cuffs; gross as tested 12,565 lb, CG 32% MAC; six wing guns and pointed windshield | General test loading, not a separate stall-time weighing |
| Page 3, paragraph 10(a) | 105 mph indicated in level flight, power off; gear/flaps up, cowl closed, oil/intercooler neutral | Stall altitude, instrument-error convention and instantaneous mass unstated |
| Page 4, paragraph 12 | Tests loaded to 12,560 lb; some wing-ammunition load replaced by rear-fuselage fuel and baggage-compartment test equipment; CG about 3.5 percentage points aft of standard loading | Preserve the 5-lb discrepancy with page 1; do not call the two values a measured uncertainty interval |
| Page 4, paragraph 13 | Kollsman D-1; static holes 67 3/8 in ahead of left-wing leading edge, 43 in from tip, approximately 1 in above chord line | Exact stall indication/correction convention and calibration configuration need confirmation |

Additional paragraph-10 IAS observations are retained separately: 108 mph gear down/flaps up; 97 mph gear down/half flaps; 88 mph gear/full flaps down; 90 mph gear up/flaps down. They share the stated power-off/cooling condition, but are not substituted for the clean observation.

The generic B/C/D/G manual's 115 mph and P-47D 42-26167's 116 mph remain distinct records. Neither is rewritten as a 41-5902 measurement. The old manual-only description of available P-47B evidence is superseded by this audit.

## Correction-table transcription

| Indicated mph | Water-column mph | Calibrated mph |
|---:|---:|---:|
| 170 | 170.5 | 175.0 |
| 200 | 201.0 | 206.5 |
| 230 | 230.0 | 237.5 |
| 260 | 260.0 | 268.5 |
| 290 | 290.5 | 300.5 |
| 310 | 311.5 | 322.5 |

The intermediate column matters: at 200 indicated the full correction is +6.5 mph, whereas water-column to calibrated is +5.5 mph. The report's installation-error column uses the latter basis/sign. Applying the complete raw-IAS correction to an already instrument-corrected observation would double-correct it. The active raw-IAS mapping therefore retains the intermediate values and the explicit correction convention.

No node exists below 170 mph; neither interpolation nor a manually asserted near-stall verification flag can turn this table into a 105 mph correction. A landing altimeter observation at 100 mph/full flaps does not establish a clean-stall airspeed calibration. No altitude domain or uncertainty is invented.

## Implementation and measured impact

- Added the primary 105 mph record to both active evidence registers, alongside the generic manual and P-47D entries. `references/p47b-stall-weight-audit.json` retains all five stall configurations, both loading statements, apparatus and all six three-column calibration rows.
- Updated aircraft evidence/status text while retaining model weight 12,565 lb and assumed CLmax 1.3. These remain research inputs, not a newly measured stall calibration.
- The source gate now reports a speed outside calibration coverage even when altitude is missing. Independent blockers remain visible together. The new record is included in the generated four-aircraft report with its actual calibration candidate.
- New tests verify source separation, mass semantics, calibration range rejection and equivalent raw/water-column paths. A test deliberately supplying guessed mass/altitude still cannot extrapolate the original nodes.

See [current validation](CURRENT_VALIDATION.md) for tests actually run and [comparison tables](STALL_CALIBRATION_RESULTS.md) for before/after predictions. Historical stall EAS/CLmax and 5:1 comparison accuracy remain unresolved. The controlled Greg P-47 power case, Mustang climb deficits, frozen import and Atlas are preserved.

To reopen numerical calibration, obtain the original stall-run weight/fuel/altitude record and matching near-stall airspeed calibration. Reusing the same 170-310 mph table is insufficient.
