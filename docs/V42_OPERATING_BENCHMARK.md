# v4.2 operational benchmark

Research candidate **4.2.0-rc.1**, implemented against main `8198a22c750c91aeb65b320ef16466e6503ce906`. This milestone implements Michael's agreed engine, load and altitude comparison policy. It does not refit the aerodynamic calibration or certify historical turn accuracy.

## Delivered behavior

The new first panel compares two independently configured aircraft. Each side selects its own aircraft, **Normal or Combat**, **25/50/75% internal fuel**, and a separate injection switch where fitted. The common altitude selector has **sea level, 10000, 20000, 30000, 35000 and 40000 ft**. Injection is disabled for unequipped aircraft and for Normal; changing one side does not change the other. Same-aircraft comparisons are allowed. The current Corsair has water/methanol injection; no MW50/GM1 or later-model Thunderbolt injection is invented for the other six profiles.

Both profiles calculate maximum sustained turn rate, speed at the peak, 360-degree time, g and radius, minimum sustained radius, an instantaneous 7g-cap scenario, maximum climb rate/Vy, rate at the recorded climb-speed schedule, and maximum steady level speed. The turn plot uses the two selected physical configurations. Instantaneous capability can consume energy; level-speed equilibrium does not include the time required to accelerate to it during a short rating.

The atmosphere now follows the ISA lapse-rate layer through 11 km and the isothermal layer above it through 40000 ft. Every tropospheric value in the old domain remains unchanged. The selectable **labelled high-altitude estimate** uses a density-lapse continuation from the final engine source node. Turning this option off returns source-power-unavailable rather than old/stale results. Estimated engine coverage is not a measured ceiling or validated historical turn envelope.

## Engine settings and provenance

| Aircraft | Normal | Dry Combat | Separate injection |
|---|---|---|---|
| Spitfire LF Mk IXc / Merlin 66 (BS.543) | Climb +12 psi / 2850 rpm; 60 min | Combat +18 psi / 3000 rpm; 5 min | not fitted |
| Bf 109 F-4 / DB 601E | Climb 1.30 ata / 2500 rpm; 30 min | Emergency 1.42 ata / 2700 rpm; 1 min | not fitted |
| P-47B / R-2800-21 (41-5902) | Normal dry / 2550 rpm; no timed limit selected | Military dry / 2700 rpm; 5 min | not fitted |
| P-51B-15 / V-1650-7 (43-24777) | Normal 46inHg / 2700 rpm; no timed limit selected | WEP 67inHg / 3000 rpm; 5 min | not fitted |
| Fw 190 A-4 W.Nr. 783 | Climb 1.32 ata / 2400 rpm; 30 min | Emergency 1.42 ata / 2700 rpm; 3 min | not fitted |
| P-38G-1 Lightning (42-12687) | Normal 37inHg / 2600 rpm; no timed limit selected | Military 44.7inHg / 3000 rpm; 5 min | not fitted |
| F4U-4 Corsair (BuNo 80765) | Normal dry / 2600 rpm; no timed limit selected | Military dry / 2800 rpm; 5 min | WEP water / 2800 rpm |

Every per-aircraft setting, source URL, loading formula and qualification is captured in [the compact operating register](../references/benchmark-operating-profiles.json). Important qualifications are also visible in the app:

- Spitfire +12/2850 and +18/3000 limits are corroborated by the matched report and pilot notes. Its lower-rating BHP is a pressure/RPM proxy, not measured installed torque.
- Mustang normal procedure is a V1650-7 manual-family transfer. The actual 43-24777 report distinguishes current 67-inHg WEP from proposed 75-inHg trials; proposed 75 is excluded from this benchmark.
- P-47B uses its dry normal/military ratings and verified 2:1 gearing. No D-model injection is transferred. The eight-gun loaded reference and original six-gun aerodynamic trial are explicitly different specimens.
- The F4 numerical rating/clearance cells were not independently recovered from the original handbook; its existing secondary rating/duration assumptions remain marked provisional. No artificial fit to an IL-2 turn is performed.
- Fw190 emergency power is a BMW801D2 manual rating transfer to the earlier trial. It does not establish the clearance of the exact 783 test on its original date.
- Early P-38G manual OCR has ambiguous minute/MAP cells. The 37-inHg/2600 normal input and five-minute military allowance require original-cell verification. No later J/L 54-inHg input is admitted. This profile is explicitly qualified, not silently labelled fully manual-verified.
- Corsair sea-level dry and injected rated powers have source support. The altitude power ratio, assumed 100-lb charged fluid reservoir and 20-lb/min flow are engineering scenarios. They do not reconstruct an original water system. The source-only gate does not validate these other transfers.

## Air-to-air loading

Standard fixed guns, full ammunition, pilot/oil/service equipment; no bombs, rockets, external tanks or optional gunpods. Removable racks are excluded. The Mustang uses its clean calibration and the source's rear-tank-empty/full-ammo combat mass, not a global subtraction of the high-speed-only rack fit. Corsair fixed standard fittings remain part of its reference clean-fighter polar. The original racked test replays remain unchanged below the benchmark.

Fuel percentage is relative to stated usable internal capacity, at 6 lb/US gal for this scenario. Normal, dry Combat and injected Combat start at identical mass for the same fuel choice; the charged injection reservoir is carried in all three cases. Full-climb replay consumes fluid only when injection is active. Full-service weight attribution is not completely verified: the P-38 reconstruction adds two guns/ammunition to an underarmed trial; P-47 full-fuel/full-ammo attribution is assumed; most other source gross masses are not recovered instantaneous combat weights. These are documented load reconstructions, not newly measured standard-load airframes. No 100% fuel option forces an unsuitable rear-tank state into a maneuvering comparison.

## Full climb and rating limits

The climb begins already airborne at the selected start height; takeoff is excluded. Normal follows its recorded routine IAS schedule, currently treated as CAS for the calculation where an exact applicable instrument correction is unavailable. Per-aircraft schedule transfers and engineering altitude extensions are stated in the source register.

Combat tests contiguous boost windows on a 1000-ft altitude grid, refines around the best window at 500 ft, then uses the quickest tested valid replay. Speeds are obtained from shared-solver maximum-climb searches at three load levels. The rates and fuel flow are re-evaluated at actual midpoint mass at every integration step. It is a bounded engineering window search, not proof of global time-optimal flight. It excludes speed-change acceleration and a dynamic temperature model. Therefore the report says quickest **tested** window rather than universal historical combat doctrine or a validated absolute minimum climb time.

Combat time and injection fluid do not reset at altitude presets. The dry and wet Combat ratings share their high-power clock. Fluid exhaustion can return to dry Combat for the remaining common allowance; power-time exhaustion returns to Normal. Where Normal has a finite duration, its clock includes the preceding higher-power time conservatively and then uses the documented lower continuous setting. No automatic cooldown replenishment is invented. Fuel exhaustion, missing source coverage and inability to climb are distinct outcomes.

Fuel consumption uses an illustrative 0.50 lb/total shaft-hp-hour. It is not a measured per-engine BSFC map. Results report the selected power schedule, combat time used/remaining, injection fluid remaining, fuel burned and arrival mass. Settings changes clear old climb results.

### Modeled climb from sea level to 20000 ft, 50% internal fuel

| Aircraft | Normal min | Combat min | Combat time used sec | Selected boost start ft |
|---|---:|---:|---:|---:|
| Spitfire LF Mk IXc / Merlin 66 (BS.543) | 5.66 | 4.22 | 253.2 | 0 |
| Bf 109 F-4 / DB 601E | 4.87 | 4.71 | 60.0 | 15500 |
| P-47B / R-2800-21 (41-5902) | 9.62 | 7.37 | 300.0 | 5000 |
| P-51B-15 / V-1650-7 (43-24777) | 8.42 | 5.46 | 300.0 | 1000 |
| Fw 190 A-4 W.Nr. 783 | 6.42 | 5.80 | 180.0 | 9500 |
| P-38G-1 Lightning (42-12687) | 8.47 | 6.02 | 300.0 | 2500 |
| F4U-4 Corsair (BuNo 80765) | 7.04 | 5.11 | 300.0 | 0 |

The Corsair Combat climb in this table uses its separate injection switch. These are scenario calculations, not historical flight-test residuals. A shorter time can arise from changed fuel/armament mass, power policy, climb-speed selection or injection rather than improved aerodynamic accuracy.

## Before and after: 15000-ft turn benchmark

| Aircraft | Earlier reference rating | Earlier reference maximum sustained deg/s | Normal, 50% fuel deg/s | Dry Combat, 50% fuel deg/s |
|---|---|---:|---:|---:|
| Spitfire LF Mk IXc / Merlin 66 (BS.543) | combat+18 | 16.66 | 14.96 | 16.47 |
| Bf 109 F-4 / DB 601E | combat | 15.00 | 15.92 | 16.75 |
| P-47B / R-2800-21 (41-5902) | military | 11.03 | 10.79 | 12.09 |
| P-51B-15 / V-1650-7 (43-24777) | 67inHg | 14.45 | 13.23 | 15.06 |
| Fw 190 A-4 W.Nr. 783 | combat | 11.51 | 12.26 | 13.07 |
| P-38G-1 Lightning (42-12687) | level | 14.76 | 12.07 | 13.79 |
| F4U-4 Corsair (BuNo 80765) | military | 12.36 | 12.16 | 13.16 |

These columns intentionally represent different scenario policies. They are **not** before/after historical turn-error scores. The old reference and its fit/check cohorts remain preserved. [Full numerical snapshot](../references/analysis/v42-operating-before-after.json). Generated `validation/current/operating-benchmark-v42.json` contains all 90 default-fuel altitude/profile combinations plus fourteen full climbs in the downloadable CI artifact.

## Verification and remaining scientific gates

Run `npm run check` and `npm run test:browser`. The added tests verify both profiles and all three fuel loads for every aircraft, instantaneous/turn kinematics, unchanged legacy atmosphere values, ISA continuity at 11 km, 40000-ft conversion, P-47 gearing, separate injection, unavailable source-only results, fuel/clock depletion, fluid-before-power exhaustion, bounded boost-window comparison and climb-step convergence. Browser checks operate the real controls, compare the untouched other side, share all six heights, exercise missing-coverage clearing and a timed full climb, invalidate stale output, and inspect mobile layout.

No original data, imported source hash, protected coefficient or frozen historical benchmark is changed. Engineering acceptance is distinct from independent historical performance accuracy. A stable turn-model or 5:1 claim is not made. Next work should replace the explicit load/rating/altitude conversions with exact same-variant sources, improve joint low-speed drag/propulsion constraints and verify historical turn capability; source-coverage percentages must not be substituted for prediction accuracy.
