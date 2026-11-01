# v3.2 high-altitude validation

The v3.1 calibration is held fixed. No parameter search, source-curve extension or new coefficient correction is accepted in this release.

## Fixed-model checks

| Aircraft | Altitude ft | Source climb ft/min | Prediction | Residual | Status |
|---|---:|---:|---:|---:|---|
| spitfire_lfix_bs543 | 32000 | 1830 | 1856.6 | 26.6 | diagnostic-only |
| spitfire_lfix_bs543 | 34000 | 1550 | 1288.2 | -261.8 | qualified check |
| spitfire_lfix_bs543 | 36000 | 1260 | unavailable | unavailable | blocked: outside engine-input domain |
| spitfire_lfix_bs543 | 38000 | 800 | unavailable | unavailable | blocked: outside engine and atmosphere domains |
| spitfire_lfix_bs543 | 40000 | 300 | unavailable | unavailable | blocked: outside engine and atmosphere domains |
| p47b | 35000 | 570 | unavailable | unavailable | blocked: outside engine-input domain; different reference specimen |

Spitfire Table II has +6.7 psi at 32000 ft, above +6.6 at 30000 ft. We retain the literal transcription and flag it diagnostic-only; no guessed correction to +4.7. The 34000-ft row is a qualified, newly registered check, already seen during source review. Original Spitfire table pixels have not been inspected. Level reference is radiator closed at 2995 rpm; climb radiator open at 3000 rpm. These differences qualify every result.

The missing Spitfire 14000-ft high-gear reference boost remains missing. The level table at that altitude is low gear; it cannot supply the high-gear climb reference. No interpolation across the gear transition.

## P-47 specimen correction

Original PDF cover and climb table establish that the five previously registered climb observations belong to 41-5931, report FS-M-19-1469-A, 7 September 1942: eight guns, gross weight 12560 lb, no torque meter. The speed/power reference is 41-5902, PHQ-M-19-1417-A, 18 June 1942: six guns, 12565 lb, torque meter installed. They are not matched specimens.

The existing numerical calibration retains its 12565-lb scenario and coefficients for reproducibility. Its residual reductions are cross-specimen engineering benchmarks. Strict specimen matching now rejects this transfer. An explicit same-variant engineering policy permits the earlier scenario with its qualification visible. The observation gate also uses the per-metric source/specimen rather than inheriting the speed identity.

41-5931 climbs through 25000 ft were flown 15 mph above best climb speed for cooling, tapering to best speed by 35000 ft; report estimates about 40 ft/min loss at 25000 ft. No retrospective correction is applied. The 35000-ft observation is outside the current 34000-ft power-input domain and is blocked.

The 41-5902 original report supplies torque-measured high-altitude climb power, but those rows use 2550 rpm while the level reference uses 2700 rpm. They do not validate the constant-RPM charge law. Measured-power replay with an independently documented propeller RPM is a next step; this release does not invent an RPM transfer.

## Sources and reproduction

- [FS-M-19-1469-A, 41-5931, cover and climb table pp.1-2](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5931_FS-M-19-1469-A.pdf); original PDF pixels inspected. Local record: references/sources/p47b-41-5931-fs-m-19-1469-a.pdf; SHA256 4351e12c396754267cb26751f9c647fc6f2504247c756edd6b35ea479496f16e.
- [PHQ-M-19-1417-A, 41-5902, cover and climb table pp.1-2](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf); original PDF pixels inspected. Local record: references/sources/p47b-41-5902-phq-m-19-1417-a.pdf; SHA256 3508b0d84f46e42cef9534224d7d8839179fb04a1d5e6be0dff20a2211c9ac97.
- [BS.543, Tables II and V](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html); HTML transcription; original table pixels unverified. Local record: references/sources/spitfire-lf-hf-ix-transcription.html; SHA256 0e87414547c6747835b4f8cdf654464e5c0712a3dff62ab4671f0e3c44bea690.

Run node validation/diagnostics/high_altitude_v32.cjs or npm run check. Source hashes, blocked null outputs, fixed calibration, and specimen transfer guards have regression coverage. Historical turn/stall accuracy remains unresolved.
