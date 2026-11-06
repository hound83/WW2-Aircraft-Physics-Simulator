# Spitfire LF Mk IX versus P-47B climb, 20,000–30,000 ft

The two original test programmes publish climb rates and cumulative times at both ends of the band. **Spitfire BS.543 took 3:39 and Thunderbolt 41-5902 took 7:21, a 3:42 difference (50.3% less time for the Spitfire).** This describes these test profiles. The Spitfire flew at combat power under a test concession. The P-47B used normal power above 12,600 ft after five minutes at military power.

| Quantity | Historical reports | Source-conditioned replay | Replay minus reports | Reference-state control without open-cooling term |
|---|---:|---:|---:|---:|
| Spitfire climb at 20,000 ft | 3,560 ft/min | 3,651 | +91 | 3,813 |
| P-47B climb at 20,000 ft | 1,565 ft/min | 1,544 | −21 | 2,028 |
| Spitfire lead at 20,000 ft | **1,995 ft/min** | **2,107** | **+112** | 1,785 |
| Spitfire climb at 30,000 ft | 2,120 ft/min | 1,971 | −149 | 2,095 |
| P-47B climb at 30,000 ft | 1,140 ft/min | 1,171 | +31 | 1,717 |
| Spitfire lead at 30,000 ft | **980 ft/min** | **800** | **−180** | 377 |
| Spitfire band time | 219.0 s | 218.7 | −0.3 | 207.9 |
| P-47B band time | 441.0 s | 438.1 | −2.9 | 319.0 |
| Spitfire time saved | **222.0 s** | **219.4** | **−2.6** | 111.1 |

Differences use unrounded values. Table II gives 2,120 ft/min for BS.543 at 30,000 ft, while the report summary gives 2,125. The comparison consistently uses Table II. At 30,000 ft the replay underestimates the lead by 18.4%. The close integrated time does not establish altitude-by-altitude accuracy. The control uses the same source TAS, shaft-power inputs or boost proxy, and weight assumptions as the corresponding replay, with the fitted open-cooling loss set to zero. The replay reuses the existing v3.1 Spitfire boost-conditioned model and v3.4 P-47B recorded-power model. P-47B's 20,000 and 30,000 ft observations are fit rows and 25,000 ft is a reserved engineering check. The Spitfire observations come from the previously exposed calibration programme. See the exported fit roles at every node.

## Different historical test profiles

| Spitfire | P-47B | Spitfire lead at 20,000 ft | Spitfire time saved over the band |
|---|---|---:|---:|
| BS.543 | 41-5902, normal | 1,995 ft/min | 222.0 s |
| BS.543 | 41-5931, military setting and turbo limit | 1,410 ft/min | 132.7 s |
| JL.165 | 41-5902, normal | 1,565 ft/min | 187.8 s |
| JL.165 | 41-5931, military setting and turbo limit | 980 ft/min | 98.5 s |

P-47B 41-5931 has no elapsed time or torque measurements in this report. Its time is integrated from four published rates between 20,000 and 30,000 ft. It flew 15 mph above best climb speed through 25,000 ft for cooling. JL.165 has a different propeller and was tested in F.S. gear with radiators open at full throttle. Its actual boost within the band was +14.8 to +4.6 psi. The spread is **1,015 ft/min** at 20,000 ft and **123.5 seconds** over the band. These are differences between observed test programmes, with specimen, rating and installation changes mixed together. They cannot isolate the effect of any one setting or supply a historical error bound.

## Time integration and precision

Subtract cumulative source times at the two endpoints. For the replay, integrate `60 ∫ dh / R(h)` in seconds, where altitude is in feet and climb rate is in ft/min. Use linear rate interpolation between adjacent source nodes, with no extrapolation or gear transition in this band. Applying the same integration to the published rates gives 216.3 s for BS.543 and 442.8 s for 41-5902, versus their published 219.0 and 441.0 s. The 4.5 s difference in the resulting time advantage illustrates the effect of reconstructing time from the tabulated rates. It does not bound test error.

| Result | Largest defensible differential error that would qualify at 3:1 | At 5:1 |
|---|---:|---:|
| 20,000-ft climb-rate gap | 665 ft/min | 399 ft/min |
| 30,000-ft climb-rate gap | 326.7 ft/min | 196 ft/min |
| Band time advantage | 74 s | 44.4 s |

**3:1 and 5:1 are unresolved.** A single residual on previously exposed observations cannot establish the error bound. The decisive next evidence is an independently testable climb curve for each installation, with comparable power policy, load, cooling, atmospheric reduction and a timed altitude band. Same-specimen repetition or another independently documented specimen with comparable installation would help separate measurement scatter from model error. The BS.543 original Table II pages and pointwise weight data remain outstanding.

## Sources and reproduction

- BS.543, A&AEE LF/HF Mk IX comparison, §§2.4, 3–4 and Table II. Standard atmosphere reduction, open radiators, 7,485 lb takeoff weight, 3,000 rpm, F.S. gear across the band. The speed schedule was adopted from BS.354 and the position error from BF.274. [Primary report transcription](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)
- 41-5902, Wright Field PHQ-M-19-1417-A, printed p. 2, §6. Open cowl, oil and intercooler flaps, 12,565 lb reported gross, 1,625 torque bhp and 2,550 rpm in the band. Instantaneous weight and pointwise measurement uncertainty are unreported. [Archived original report](../references/sources/p47b-41-5902-phq-m-19-1417-a.pdf)
- 41-5931, Wright Field FS-M-19-1469-A, p. 2, §2. Separate production airframe, 12,560 lb gross, 2,700 rpm, open cooling and eight guns. [Archived original report](../references/sources/p47b-41-5931-fs-m-19-1469-a.pdf)
- JL.165, A&AEE Spitfire IX +25 boost trials, Table I. 7,400 lb takeoff, radiators fully open, 3,000 rpm. [Primary report transcription](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitIX_25boost_JL165.html)

The [source ledger](../references/climb-band-evidence.json) retains cumulative times, conditions and links to existing source copies. Run `npm run diagnose:fighter-comparison` for the JSON, or use **Compare four fighters** in the browser build. The browser and CLI use the same report. The twelve fixed comparison states are reproduced against the frozen v3.9 baseline.
