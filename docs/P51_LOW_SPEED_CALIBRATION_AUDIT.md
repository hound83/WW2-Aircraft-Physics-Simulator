# P-51B near-stall calibration audit

30 October 2026. Scope: determine whether the 84-86 mph IAS stalls of P-51B-15 43-24777 can be converted to defensible EAS/CLmax. **No matched correction was established within the sources inspected.** This does not establish that no archival calibration exists. Default coefficients and predicted speed, climb and turn results remain unchanged.

## Target and accepted observations

Wright Field report Eng-47-1749-A, 20 May 1944, V.E records power-off stalls at 8,000 ft: 86 mph IAS / 9,270 lb with gear/flaps up and cooling shutters closed; 84 mph IAS / 9,240 lb with shutters open. Instrument-error removal is unstated in this table. The report's Fig. 1 identifies a Kollsman D-1 wing installation and uses IAS without instrument error on its abscissa. Its lowest plotted observation is approximately 140 mph IAS; the dashed continuation is not a stall calibration. The stall-table indication has not been independently linked to that calibrated pressure/instrument channel. No low-speed nodes were digitized.

[Report and Fig. 1](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html). The original figure is preserved in the imported source and shared research. The table is a report transcription, not a newly authenticated stall-log scan. Neither CAS/EAS nor stall-domain uncertainty is established by the figure.

## Candidate-source audit

| Candidate | What was established | Why it cannot correct the target stalls |
|---|---|---|
| Eng-47-1749-A, 43-24777, Fig. 1 | Exact target serial; instrument-corrected IAS abscissa; observed calibration starts about 140 mph | No 84-86 mph observations, unstated stall instrument basis, no quantified stall-domain error |
| Eng-47-1734-A, 43-6883, VI.A/F | P-51B-5 / V-1650-3; flush-static system; clean power-off 94 mph IAS at 9,100 lb closed / 9,095 lb open; instrument error removed | Different serial/block/installation. Referenced calibration Figs. 1/2 were not linked in inspected page; no matched position correction or stall altitude established |
| FS-M-19-1587-A, 43-12093, B.5/6 | P-51B-1; Kollsman D-2 underwing system; table spans 230-365 mph indicated, with additional altitude dependence | Different serial/pressure installation and no stall-region points. Source's True Indicated label must not be silently renamed CAS |
| NACA RB L5K29a / WR L-43, pp. 2-4 | Kollsman 651B on boom 0.95 chord ahead of wing; level calibration M=0.24-0.43, plus high-speed dives/pullouts | Exact target serial not established; different installation; no matched stall-AoA calibration. Low-speed refers to the dive investigation, not verified coverage of these stalls |
| NACA ACR 4K02, pp. 4-6 | Modified P-51B-1-NA, propeller removed; independent swiveling heads about 0.8 chord ahead of each wingtip, plus a separate service total-head/fuselage-static system | Multiple channels and modified configuration; no target linkage. Instrument readability of +/-2 mph is not a transferable stall calibration uncertainty |

[43-6883 report](https://www.wwiiaircraftperformance.com/org/p-51/p-51b-6883.html), [43-12093 report](https://www.wwiiaircraftperformance.com/org/p-51/p51b-12093.html), [NASA original L5K29a](https://ntrs.nasa.gov/citations/19930093491). NACA 4K02 was read from the original shared-research PDF, Library ID `libfile_a6898caa37188191bcf729b46918b0c3`, PDF pages 5-7. These were text inspections; no new plot-digitization or scan-authentication claim is made. Prior visual inspection of the preserved 43-24777 Fig. 1 is retained.

The NASA L5K29a level-flight result is a static-pressure error equal to 1.3% of impact pressure over its test conditions. Its approximately 1% change over the investigated Mach range is not a target stall-speed confidence bound. Survey flights at 175 mph IAS over about 15,000-26,000 ft do not establish the altitude domain of every calibration point. Neither number is imported into the target correction. 4K02's readout resolution likewise stays attached to that report's apparatus.

## Concrete implementation

`resolveStallEvidence` now requires an explicit matching `airspeedInstallationId` for IAS calibration, as well as aircraft, serial and configuration. IAS observations state whether instrument error is `not-removed`, `removed` or `unknown`; calibration records declare the input convention they accept. Raw IAS requires a total correction; instrument-corrected IAS requires position-only correction. Unknown state, different channel, or applying an instrument correction twice returns unresolved with null EAS/CLmax.

Tests use synthetic raw 86 -> CAS 91 and instrument-corrected 88 -> CAS 91 pathways to verify correction composition only. These values are not historical correction estimates. New negative tests cover same-serial/different-installation and double-correction mistakes. Already corrected CAS/EAS retain their separate provenance pathway.

`references/p51-low-speed-audit.json` preserves five source candidates, their numerical observations, applicability and unresolved uncertainty. The main register explicitly preserves the target table's unknown instrument state/channel. No other aircraft inputs, Greg fixture or frozen source changed.

## Finish and reopening condition

This milestone completes the bounded source audit and closes two calibration-applicability gaps in code. It does not complete historical P-51 CLmax calibration. To reopen numerical calibration, obtain the original 43-24777 stall-test log and instrument/position calibration sheets identifying the observed channel, correction convention, stall-domain coverage/configuration and uncertainty. Repeating the same published high-speed figure cannot resolve the gate.
