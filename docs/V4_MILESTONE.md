# v4.0 research candidate: propulsion and maneuver envelopes

Baseline main commit `7caa9a867f7477fd31487cd0fcd29e27b2ff0c8f`, version 3.15.0. Delivery version **4.0.0-rc.1**. Concurrent source update `0141ad04db5660bd4bf6b64d21f9f2c3cc85c726` was integrated before delivery, including the official IL-2 reference and 979-row source archive. This is a usable major research candidate with seven interactive aircraft profiles, installation experiments, explicit turn limits and weight-changing climb integration. Historical independent sustained-turn accuracy and stable-release certification remain unresolved.

## Acceptance and fit policy

The implementation must preserve the frozen import, all existing four-aircraft scorecard values, source identities, source units and existing rating domains. Engineering acceptance checks require an added Corsair profile, working altitude/mass/rating/lift controls, paired turn curves, sensible failure states and a fuel-mass calculation. New installation candidates must improve held-out comparisons against the same control, preserve ideal-disk energy bounds and retain unfavorable residuals.

The **engineering** checks use 2 kt for Corsair source speeds below 10,000 ft and 200 ft/min for non-fit climb checks below 20,000 ft. These are provisional judgments chosen during candidate development, not historical confidence intervals or blind acceptance thresholds. All source observations were exposed before development. Held-out means excluded from numerical fitting. Same-report checks are not independent experiments.

## New F4U-4 profile

BuNo 80765, clean normal fighter, 12,500 lb, 1948 Navy inspection trial. Original source files and exact caveats are indexed in [the compact audit](../references/v4-source-audit.json). The 314 sq ft area, manufacturer 40.90 ft span, 13 ft 2 in four-blade propeller and R-2800-18W gearing/ratings have separate provenance. The model uses normal and military ratings, three supercharger branches and speed-dependent ram pressure.

The **clean** original stall anchors replay 84.5 kt CAS powered and 89.4 kt CAS power-off. At the assumed ISA sea-level reference they imply effective coefficients 1.647 and 1.471. They are calibration anchors. Exact stall pressure altitude and powered throttle setting are unknown. Powered one-g lift is available as an explicit scenario. Transfer from that anchor to an accelerated turn remains provisional. The duplicated landing power label is excluded.

The normal sea-level speed fixes clean drag. One normal sea-level maximum-climb point fits a low-J equivalent installation adjustment, bounded above by the ideal full-shaft actuator disk. Other rating/altitude climb points are reserved from numerical fitting. The adjustment does not isolate measured blade efficiency. It could include propulsion, cooling, engine-chart and model errors.

| Source-conditioned test | Control | Candidate | Observed |
| --- | ---: | ---: | ---: |
| Military sea-level maximum speed, kt TAS | 302.67 | 302.67 | 303 |
| Normal sea-level maximum climb, ft/min, **fit** | 2,618 | 2,900 | 2,900 |
| Military sea-level maximum climb, ft/min, check | approximately 3,433 | approximately 3,776 | 3,760 |
| Seven non-fit maximum-climb checks, MAE ft/min | **353.1** | **139.9** | Same report |

See `validation/current/v4-envelope.json` for exact current values, chosen model-best climb TAS, roles and high-altitude failures. Baseline figures in this table are rounded and use the manufacturer span. The original flight climb TAS, instantaneous fuel mass, cooling schedule and independent propeller map are missing.

### High-altitude result retained for v4.1

The original Appendix A Plate 3 was visually inspected. It explicitly labels **TRUE AIRSPEED - KNOTS**, qualifying the eight previously unresolved speed-basis records. Its approximate BHP values were also read with a provisional +/-50 hp reading allowance. This separate input diagnostic improves the high-altitude speed residual but leaves roughly **7-14 kt** underprediction. At the 29,000-ft military point, nominal engine/ram predicts approximately **364 kt** versus **385 kt**, while source-chart BHP raises prediction to approximately **371 kt**. The next investigation can separate high-J/tip-Mach losses, source engine power and speed-dependent installed drag. Added positive cooling drag would worsen the speed deficit.

Those BHP readings and the nominal engine-rating transfer are different inputs. Neither the level-flight BHP curve nor its ram benefit is assumed to be guaranteed at a much slower climbing/turning speed. High-altitude results remain diagnostics. Their uncertainty must accompany any pairwise ranking.

## P-47B installation comparison

The source-conditioned 41-5942 December experiment compares Hamilton Standard 6501A-0 with cuffed Curtiss 714 at measured 2,000 shaft bhp and 2,700 rpm. The shared solver supports a bounded equivalent installed-efficiency correction in advance ratio J, tapered at the declared J limits and capped by ideal disk efficiency. The fit uses the 10,000-ft climb difference and 5,000-ft speed difference. No generic multiplier is applied to other airplanes.

| Held-out same-report comparison | Control MAE | Candidate MAE |
| --- | ---: | ---: |
| Climb difference at 15,000 / 20,000 / 24,000 ft | **252.5 ft/min** | **107.6 ft/min** |
| Speed difference at 25,000 ft | **2.48 mph** | **0.10 mph** |

The actual propeller tradeoff is preserved. The Hamilton climbs better and is slower at high speed. Alternate 15,000- and 20,000-ft climb fit choices produce held-out climb MAEs approximately 116 and 109 ft/min, each better than its control. These splits contain different checks and are not directly comparable accuracy estimates. The candidate still underpredicts the measured improvement at 24,000 ft by approximately **186 ft/min**.

The active 41-5902 P-47B is a different specimen and retains its previous coefficients. The UI exposes the new 41-5942 paired experiment and its residuals. Cooling/prop-airframe interaction and source gross versus instantaneous mass are unresolved. January trials are excluded because cuffs, CG and climb-speed labels differ.

## P-51B-15 installation comparison

Use 43-24777 only, 20,800 ft, 3,000 rpm. The clean 444 mph TAS and racked 431 mph at 75 inHg define a source-conditioned equivalent rack area of **0.03885 m²**. At the held-out 67-inHg racked condition, measured 417 mph, the clean control predicts **426.46 mph** and the rack model **413.66 mph**. Absolute error improves **9.46 to 3.34 mph**, retaining the -3.34 mph residual.

Shaft power is from the Packard altitude chart, not torque measurement. Mass remains the reference-model mass because the rack-removal mass difference is unknown. The fitted area applies to this local test replay. It does not justify changing global Mustang drag at low-speed turns or other rack configurations. The bounded TN1044 maneuver-lift correction remains active in the live envelope.

## Progress across all existing aircraft

| Aircraft | Changes exposed in v4.0 | Reference physical parameters |
| --- | --- | --- |
| P-51B-15 | Seven-profile turn envelope with TN1044 maneuver-lift handling; independent weight scenario; matched rack replay and held-out check | Existing clean calibration retained; 67/75-inHg selectable |
| P-47B 41-5902 | Turn-limit/sensitivity display and fuel-changing climb; separate 41-5942 propeller experiment | Existing 41-5902 calibration retained |
| Spitfire LF IX BS.543 | Live turn curve, weight/power/lift scenario range, pairwise order and weight-changing climb | Existing calibration retained |
| Bf 109 F-4 | Same live comparisons; missing engine coverage appears as a gap, including 27,000 ft | Existing DB601E source domain retained; combat/emergency selectable |
| Fw 190 A-4 783 | Same seven-profile comparison using the installed inlet/fast-flight model; fuel-changing climb | Existing accepted installation model retained |
| P-38G-1 | Same live comparison with total twin-engine power, plus fuel-changing climb at the climb rating/cooling state | Existing symmetric propulsion/calibration retained |
| F4U-4 80765 | New source-conditioned normal/military profile, clean stall-state options, climb fit/checks and provisional maneuver envelope | New source-conditioned inputs |

All seven receive an interactive plot of sustained turn versus EAS, a selected-speed power/lift/structure limit, mass controls and a paired scenario-order conclusion. Lift changes at least +/-5%, useful power +/-3%, and the Corsair also spans its two stall anchors. These are chosen perturbations. A ranking that survives them is only robust to those scenarios. It does not establish historical 5:1 accuracy.

Climb integrates from 5,000 to 10,000 ft in ten midpoint altitude segments, split additionally at known supercharger transitions. At each segment it reoptimizes model climb speed, estimates half-step fuel consumption, updates weight and recomputes the climb rate. A 0.50 lb per shaft hp-hour scenario is compared with constant weight for each profile. This is an illustrative BSFC shared for the sensitivity study, not a historical fuel map. It preserves separate P-38 climb power/cooling options. The generic climb modes for the other aircraft are distinct from their source-specific historical climb replays.

## Bf 109 F-4 cross-simulator diagnosis

The concurrently added official IL-2 reference specifies standard mass 2,890 kg, emergency power and 270 km/h IAS, with maximum-performance turns of 20.3 s at sea level and 26.1 s at 3,000 m. The live comparison now offers the correct combat/emergency choice. The diagnostic uses that mass and rating and an explicit game-IAS-to-CAS assumption. At zero offset the current model gives **17.47 s** and **20.38 s**. A +/-5 mph correction scenario still gives faster turns in all samples.

The inverse normal-load/lift and power balance shows that matching those rates through lift alone would imply coefficients approximately **1.317** and **1.213** at the assumed speeds. Alternative power-only fits require equivalent efficiencies around **0.59-0.60**, versus the present model around **0.84-0.85**. These are competing conditional explanations. They do not identify a historical slat/wing/propeller correction. The two software comparisons remain outside the historical score and provide a concrete F-4 v4.1 source target.

## Verification and reproducibility

Run `npm run check`, `node scripts/verify-pre-pr1.cjs` and `npm run test:browser`. Generated reports include `validation/current/v4-envelope.json` and the normal scorecards. New regression checks cover clean stall replay, fit/check separation, retained high-altitude failures, both installation candidates, alternate fits, seven-aircraft scenario bands, fuel mass integration and invalid inputs. Browser checks exercise the actual seven-profile table, plots, rating/lift/mass controls, missing engine states and fuel table.

The old 69-record four-aircraft scorecard has SHA256 `4c38ffe13f74145c6649c8c4e7b9be1b93a3abed0090681e3debe6da4c50b2c7` before and after. All 3,628 frozen compatibility numbers remain identical. The published artifact contains the interactive standalone `dist/model.html` and the generated numerical scorecard.

## Priorities for v4.1

1. Corsair high-altitude power/ram versus high-J losses and drag, with original per-run RPM/boost, climb TAS, cooling and fuel mass. Use its measured level power as a diagnostic input, preserve independent checks and improve the large remaining residuals.
2. Obtain the same installed-propeller information for P-51B and P-47B 41-5902. Test whether the 41-5942 climb residual needs thrust-loading dependence rather than the present J-only equivalent correction. No automatic transfer between props or specimens.
3. BS.543 and F-4 near-stall instrument calibration and matched powered accelerated-lift data. Their scenario width is not a measured uncertainty bound. Preserve separate configurations and slat states.
4. P-38G calibrated stall and installed propulsion; Fw 190 A-4 near-stall lift/airspeed and actual turn drag. Exact-variant inputs take precedence over tempting later-variant handbook corrections.
5. Independent matched turn or maneuver power/drag data for pairwise accuracy and 5:1. One source-replayed stall does not validate an entire turn curve.
