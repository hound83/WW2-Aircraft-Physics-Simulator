# Stall evidence audit - 30 October 2026

No calibrated historical CLmax is established by this milestone. `references/stall-calibration.json` records nine observations, source inspection limits and the transcribed six-node P-47 correction table. `resolveStallEvidence` requires matched variant/specimen, configuration, power-off one-g condition, contemporaneous weight, wing area, corrected airspeed provenance and valid calibration domain. It returns reasons and null corrected EAS/CLmax when blocked. Source verification flags are audit inputs, not automatic authentication of a document.

| Aircraft / engine | Measurement or citation | Stall-test weight | Correction applicability | Active CLmax assumption | Unresolved |
|---|---|---|---|---:|---|
| Bf 109 F-4 / DB 601E | IL-2 154-171 km/h IAS; simulation only | No historical matched weight; model 6,371 lb (2,890 kg reference) | No matched historical low-speed map | 1.5 | Wartime observation, slat state, mass, power, correction |
| P-47B 41-5902 / R-2800-21 | Generic B/C/D/G manual excerpt: 115 mph IAS clean; power unspecified | Missing; model 12,565 lb must not be assigned to manual stall | Manual correction crop covers 170-310 mph IAS only; specimen/configuration/issue not established | 1.3 | Exact B specimen, contemporaneous weight, low-speed correction, power |
| P-51B-15 43-24777 / V-1650-7 | 86 mph IAS, power off, gear/flaps up, oil/coolant closed, 8,000 ft; separate 84 mph IAS shutters open | 9,270 lb closed; 9,240 lb open | Fig. 1 has lowest plotted observation about 140 mph IAS; no 84-86 mph observations. Horizontal axis excludes instrument error. Dashed extrapolation cannot verify stall | 1.6 | Stall-domain position/instrument correction and uncertainty; powered-turn transfer |
| Spitfire LF IXc BS.543 / Merlin 66 | Inherited A.P.1565J citation: 90 / 93 mph IAS at reference weights, not a BS.543 test | 7,150 / 7,800 lb cited pilot-note references; model 7,110 lb is normalized speed weight, climb 7,485 lb | No verified Mk IX low-speed map; pilot-note scan not reverified | 1.6 | Exact specimen/configuration, corrected speed, direct scan verification |
| P-47D 42-26167 / R-2800-63, external only | Report V.D: 116 mph uncorrected IAS, gear/flaps up, idling, shutters closed or open | Not reported at stall; 13,230 lb is takeoff | Fig. 1 mentioned but not linked in retrieved transcription; low-speed coverage unverified | Not transferred to P-47B | Weight, altitude, correction; variant/propeller differs |

Corrected CAS, EAS and measured CLmax remain **unresolved for every row**. Do not subtract a model EAS from raw IAS to manufacture a historical residual. The generic manual does not establish a P-47B measured CLmax. A Spitfire Va NACA result is not substituted for a Merlin-66 IX.

## Sources checked and access boundaries

- [P-51B report transcription, Eng-47-1749-A, 20 May 1944](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html), sections III, V.E and IX: rechecked configuration, instantaneous weights and 233 sq ft area. Power-on clean 83 mph IAS at 9,100 lb, 46.5 inHg/2,700 rpm is separately recorded; it cannot be averaged with power-off stalls. Wing racks are reported for speed/climb; their precise stall-test presence is not independently established. Altitude is reported as 8,000 ft; its calibration uncertainty remains unspecified.
- Original P-51 Fig. 1 visually inspected using the preserved rotated scan, also identified in shared research as `libfile_29ddbd3f8dcc8191ad8ad116e066744a`. The scan shows no stall-region points. No high-speed nodes were digitized or extrapolated.
- P-47 manual section 23 correction crop visually inspected: IAS/CAS mph pairs 170/175, 200/206.5, 230/237.5, 260/268.5, 290/300.5, 310/322.5. The crop is in frozen imported user figures and shared research (`libfile_1cd5828bdd3081919d42329a7a341b25`). No exact manual issue or airframe installation is visible. Recorded nodes are evidence of what the crop says, not permission to use them on any P-47 or at 115 mph.
- Manual section 14 stall excerpt was available as Library OCR: 115 mph IAS clean and 100 mph IAS gear/flaps down. Its returned pixels were unavailable in that read. No original scan-verification flag was granted.
- [P-47D report transcription, Eng-47-1774-A, 15 July 1944](https://www.wwiiaircraftperformance.com/org/p-47/p47-26167.html), sections III and V.D: rechecked the takeoff/instantaneous-weight distinction, idling and powered observations, and explicit uncorrected-IAS warning. Its Fig. 1 was not available as a link in retrieved content. No inferred correction.
- [Bf 109 handbook catalog](https://www.museumalkmaar40-45.nl/voorschriften-manuals/d-luftt/d-luftt-2109): confirms F-1 to F-4 handbook parts, but retrieved catalog content supplies no calibrated stall test. The inherited Spitfire references remain unverified; no new historical value is claimed for either aircraft.

## Executable implementation and interpretation

`resolveStallEvidence(ac, record, calibration)` derives power-off CLmax only after the gate passes. Synthetic positive tests verify arithmetic and provenance checks; no historical record currently passes. CAS -> EAS uses the existing compressible atmosphere conversion once. Already corrected EAS is not corrected twice. No uncertainty is invented. The gate does not certify power-on or accelerated-turn transfer.

`stallSensitivity(ac, scenario, altitudeFt, speedEasMph, options)` accepts explicit positive ordered stall-EAS endpoints and their test weight. It derives CLmax and uses the existing `evaluated` solver at the requested actual weight. The diagnostic re-expresses inherited +/-15% CLmax perturbations as EAS scenarios, adds Spitfire coverage and reports envelope peaks, actual-weight changes and six pairwise turn differences. They are exploratory assumptions, **not physical confidence bounds**. Finite sampling of peak rates is 1 mph EAS; endpoint ranges do not represent a validated uncertainty distribution.

The default comparison is 5,000 ft ISA, 170 mph EAS, profile C, e=0.78, assumed 7g cap, each aircraft's documented research weight/default rating. These are matched atmosphere/speed conditions, not standardized combat loads, cooling states or engine powers. Alternate P-51 9,270 lb and Spitfire 7,485 lb examples preserve CLmax and the speed-anchored drag polar; they do not silently refit drag. All 5:1 comparisons remain UNRESOLVED because independent matched historical turns and differential error bounds are absent. Model difference/5 is explicitly illustrative.

The full imported regression set, Greg's controlled P-47 2,000/2,600 hp case and Mustang climb failures are preserved. The P-47C propeller OCR issue is outside this milestone. No Atlas changes or browser-interaction validation.


## P-47B primary-source update

The [41-5902 audit](P47B_STALL_WEIGHT_AUDIT.md) supersedes the manual-only evidence description above. The original acceptance report records 105 mph indicated clean power-off; 12,565/12,560 lb are separate nominal loading statements, not a verified instantaneous stall weight. Original calibration identifies the installation and instrument/water-column basis but only covers 170-310 mph. No verified stall EAS/CLmax is inferred.

## F-4 follow-up

The bounded F-4 source audit found candidate catalogs/documents but verified no original stall pages. Simulation values remain separate; no numerical recalibration. See [findings and exact access limits](BF109F4_STALL_AUDIT.md).
