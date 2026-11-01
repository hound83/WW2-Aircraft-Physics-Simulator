# v3.3: same-specimen recorded-power climb replay

Ten exact states from P-47B 41-5902 now replay through the shared physical solver using report BHP, TAS and engine RPM. The independent original P-47B handbook scan establishes a propeller/crankshaft ratio of 0.5, so 2550 engine RPM means 1275 propeller RPM. No coefficient or generic-flight output changes.

## Fixed-input comparison

The zero-additional-drag column isolates the clean polar and is not an open-cooling prediction. The transferred column applies the existing v3.1 P47 aggregate drag, fitted earlier with 41-5931 observations; this remains a transfer assumption. These new 41-5902 climb observations are never fitted.

| Altitude ft | Engine / prop RPM | Report BHP | Report climb | Clean polar only | Transferred open drag | Residual ft/min | RPM correction ft/min |
|---|---|---|---|---|---|---|---|
| 0 | 2700 / 1350 | 2000 | 2560 | 3172.7 | 2657.0 | 97.0 | 0.0 |
| 5000 | 2700 / 1350 | 2000 | 2545 | 3099.9 | 2564.7 | 19.7 | 0.0 |
| 10000 | 2700 / 1350 | 2000 | 2465 | 3016.5 | 2453.0 | -12.0 | 0.0 |
| 12600 | 2700 / 1350 | 2000 | 2410 | 2967.8 | 2382.7 | -27.3 | 0.0 |
| 12600 | 2550 / 1275 | 1625 | 1800 | 2188.5 | 1677.5 | -122.5 | 0.0 |
| 15000 | 2550 / 1275 | 1625 | 1725 | 2141.2 | 1631.0 | -94.0 | 0.0 |
| 20000 | 2550 / 1275 | 1625 | 1565 | 2028.2 | 1476.4 | -88.6 | 0.0 |
| 25000 | 2550 / 1275 | 1625 | 1380 | 1897.9 | 1301.0 | -79.0 | 0.0 |
| 30000 | 2550 / 1275 | 1625 | 1140 | 1717.4 | 971.0 | -169.0 | 7.6 |
| 35000 | 2550 / 1275 | 1365 | 450 | 908.9 | 17.8 | -432.2 | 28.9 |

Across ten exact rows, MAE is 509.9 ft/min with the clean polar and 114.1 ft/min with transferred configuration drag. This compares two scenarios, not a before/after historical-accuracy claim. The fixed-2700-RPM control changes only propeller RPM, holding each recorded BHP fixed.

The 35000-ft record supplies an exact 1365-BHP/2550-RPM state beyond the old 34000-ft generic power domain. This does not fill any intermediate altitude or extend the generic engine curve. Its observed 450 ft/min versus the transferred scenario reveals a substantial remaining configuration/propeller mismatch. Keep that failure visible. Mass scenarios of 12365/12565/12765 lb are assumptions, not measured uncertainty.

## Evidence and limits

[PHQ-M-19-1417-A](https://www.wwiiaircraftperformance.com/org/p-47/p-47_files/P-47B_41-5902_PHQ-M-19-1417-A.pdf), printed p.2 section 6; original table and cover inspected. Existing archived PDF SHA256 3508b0d84f46e42cef9534224d7d8839179fb04a1d5e6be0dff20a2211c9ac97. Report BHP is from a torque-meter-equipped specimen; pointwise torque calibration and standard-atmosphere corrections are not established. Gross 12565-lb test weight is not instantaneous climb mass.

[Preliminary P-47B handbook](https://www.si.edu/media/NASM/NASM-Manual-000027958.pdf), 25 April 1942, Section V.1.a, printed p.16 / PDF p.18; original pixels inspected. Original PDF SHA256 451fd7aed91419dabc1bf78c872993d0ad5c9ed0d4f8352c8ddb902ffbc1c36b. The rendered page is archived at references/sources/p47b-manual-gearing-18.jpg with SHA256 b892ca4c2c875cebfb10cfd365f5b2c4bec33a9d26bf3096ab75d564e986119e.

## Spitfire source audit

The mirrored BS.543 HTML repeats +6.7 psi at 32000 ft. Its linked original header and climb graph do not show the Table II row. The original spitfireperformance.com report endpoint timed out; a targeted original-report search found no accessible table scan. No +4.7 guess, new coefficient, or eligibility promotion is accepted. The 32000-ft row remains diagnostic-only and the 34000-ft -261.8 ft/min discrepancy stays exposed.

## Reproduction and next milestone

Run npm run diagnose:measured-climb or npm run check. The application adds a fixed report replay and an explicit clean/transferred-drag selector, independent of exploratory controls. Tests require exact identity/node/configuration, observed-rate exclusion, source hashes, correct RPM response, fixed polar, immutable inputs and unchanged generic outputs.

Next: test a source-bounded open-cooling drag shape against these newly exposed same-specimen rows, with explicit fit/check assignment and retained high-altitude failures. Do not present these already-inspected rows as blind validation. Spitfire source verification remains open.
