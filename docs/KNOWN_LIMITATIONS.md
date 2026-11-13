# Known limitations

## v4.13-rc.2 turn drag

The Mk I fit combines airframe and engine-off windmilling effects. One of the three reserved glide points has a larger residual than the control. No matched powered-turn records were recovered for the live pair. The 200 mph EAS comparison allows either order when drag varies, and the donor replay stops at its measured lift limit while the Spitfire still has surplus power. Historical sustained-turn accuracy and 5:1 remain unresolved. [Results and source gaps](V413_TURN_DRAG.md)

## v4.13-rc.1 aircraft intake

The new level and climb checks share reports with some of the power inputs. High-altitude HF level speed and G-2 upper climb retain material residuals. The P-51D climb rate also runs high near sea level. Clean stall uses provisional lift or IAS inputs. Maneuver comparisons require drag-under-load and lift evidence. [Aircraft intake residuals and source bounds](V413_AIRCRAFT_INTAKE.md)

## v4.12-rc.1 continuous stall

The Mustang taper and its transfer of pooled TN 1044 readings are engineering assumptions. The exact 43-24777 near-stall IAS correction remains open. The Corsair Navy stall-run serial, altitude and powered setting are unspecified. The separate Ames glide comparison has a −3.69 mph EAS residual at approximate loading. The lift ceiling and the power-supported turn remain steady calculations. [Stall and lift results](V412_CONTINUOUS_STALL.md)

## v4.11-rc.1 shared climb

The WNr 783 equivalent cooling area comes from one open/closed fit with modeled TAS. The 7,000 m residual worsens and the derived 6,000 m time remains below the factory read band. The P-38G time check uses the same report’s TAS and chart BHP at fixed takeoff weight. Timing of the operational runs also depends on the assumed fuel flow and the planned speed schedule. The P-47B and Spitfire report-conditioned fits restore reference speed energy inside their supported calibration. Historical sustained turn, exact corrected stall and 5:1 evidence remain open. [Source residuals and scorecard](V411_SHARED_FLIGHT_CLIMB.md)

## v4.10-rc.2 Lightning propeller evidence

The P-38G's additional high-speed loss is fitted at one altitude with chart-derived shaft power and the existing drag polar. The three reserved checks share the report. Part-power speed and the cooling or shaft-power discrepancy remain open, as do separate-airframe accuracy, measured acceleration, and powered-turn checks. [Flight-test residuals](V410_REMAINING_PROPELLERS.md).

## v4.10-rc.1 propeller evidence

The Corsair reference is a fitted installed efficiency/drag pair. High-altitude shaft power still differs from the report chart. The P-47B transfer improves the separate-airframe speed replay by 0.26 mph and adds 0.68 mph to mean error on 41-5902. The altered clean-flight acceleration times and the 29,000-ft Corsair/Thunderbolt sensitivity are model results. [Flight-test residuals and comparison scope](V410_PROPELLER_REFERENCE.md).

## v4.9 timed run evidence

The timed acceleration replay uses steady level-flight states at the selected altitude. Its elapsed times depend on the documented power schedule and estimated installed power and drag. Matched historical speed-time and powered-turn records remain open. [Historical checks](V49_TIMED_MATCHUPS.md#historical-checks).

## v4.8 acceleration evidence

Level acceleration inherits the installed-power, propeller and drag assumptions of the selected state. Near maximum level speed, small differences in those inputs can change its sign. Historical validation requires matched speed-time observations, and a timed run also needs to track changing speed and rating allowance. [Acceleration method and comparison](V48_LEVEL_ACCELERATION.md).

## v4.7 source and comparison scope

The dashed high-speed continuation shows remaining sustained capability at the selected rating and load. GOLD* records central agreement with stated source or test-condition qualifications. Same-report elapsed time and rate integration can share trials. The current exact stall and powered-turn evidence gaps still constrain historical rankings. [Source grades and four-aircraft regression](V47_BENCHMARK_AND_GOLD.md).

## v4.6 graph inputs

The power-supported turn curves still use modeled lift, propeller efficiency and drag. Report-adjusted climb bands incorporate the model’s correction for the selected weight and speed near the matched test schedule. The bands describe the source reading or interpolation margin carried through that correction. [Graph coverage and the 10,000 ft example](V46_CHART_DATA.md).

## v4.5 graph evidence

Solid climb sections show calculations near a matched report schedule at the selected altitude and engine branch. The selected load can differ from the test load. The sustained-turn curves are model calculations, and the shaded Mustang–Spitfire range shows sensitivity to the declared input bounds. [Coverage and graph controls](V45_GRAPH_EVIDENCE.md).

## v4.4 maneuver lift and sensitivity

The P-51B lift transfer uses a throttled, carefully finished NACA aircraft and pooled chart readings. The power and incremental drag tests describe declared engineering perturbations. The displayed range has no probability interpretation. Historical powered sustained-turn validation and the five-to-one discrimination target require matched reports. A performance state can also lie outside the recorded power envelope. [Flight evidence and bounds](V44_TURN_PERFORMANCE.md).

## v4.3 operating benchmark research candidate

The improved climb replay uses gross test masses. BS.543's Table II TAS uses the report's airspeed corrections. Shaft power comes from a boost-conditioned chart. Searching each model's best climb speed gives a weaker improvement and a larger individual regression. Cooling losses are aggregate installed-energy fits. The cooling selector models that scenario for turns and level flight. Service labels describe approximate main WWII periods and theatre tags. The Corsair has a high-altitude speed residual. Independent historical sustained-turn accuracy remains unresolved. [v4.3 results and diagnostic limits](V43_MODEL_CHECKS.md).

## 11 November 2026 data-collection checkpoint

[Thirteen-aircraft source recovery](research/WW2_THIRTEEN_FIGHTER_DATA_2026-11-11.md) supersedes older source-count and retrieval-status statements below, without changing physics. The80/90 targets are evidence-coverage judgments and remain unmet for most aircraft. P38D-G printed32B is now numeric, but clean correction starts125mph and excludes unestablished instrument error. F6F04776 pressure-derived speed/calibration method is now confirmed, but its figure speeds remain undigitized. Five new NACA F4U4 CAS-equivalent stalls have approximate12100lb mass and an unmatched serial. P47D30 Figure52 mass12860lb is now legible; NACA/service trace mapping remains unqualified. G2 MT215 numeric data are secondary at actual2540RPM and1.30-1.32ata; Soviet compiled turn times have unknown per-run power/energy criteria. No complete sustained-turn validation or aircraft admission follows from this source update.

## v4.2 operating benchmark

Independent power/fuel/injection settings are calculation scenarios, not historical accuracy certification. Routine-climb rating definitions differ by type. Some lower-power curves use a pressure/RPM proxy; F-4 numerical manual cells and early P-38G MAP/duration remain provisional. Fw190 emergency clearance is transferred from its engine/manual family. Service-load masses, ammunition deltas and internal-fuel attribution include explicit reconstruction assumptions. Fuel burn uses a common illustrative BSFC, and the Corsair's fluid quantity/flow and injected altitude curve are engineering inputs. The optional 40000-ft engine continuation is a density-lapse estimate beyond source coverage; disabling it does not validate other transfers.

Peak turn, maximum ROC and level-speed equilibrium do not model the time required to reach their speed within a short rating. Full climb respects common power time and fuel/fluid use, but tests only a bounded set of contiguous boost windows, approximates indicated climb speed as CAS, and excludes speed-change acceleration and dynamic thermal/cooldown behavior. The new panel retains existing low-speed aerodynamic uncertainty, including the unresolved historical sustained-turn and 5:1 gates. [Full qualifications and per-aircraft before/after scenarios](V42_OPERATING_BENCHMARK.md).

## v4.1 energy configuration

Five configurations improve source-matched climb; corrections represent aggregate installed energy, not separately measured propeller/cooling/drag components. Source masses, derived Spitfire boost power, graph readings and unknown optimum TAS retain their uncertainty. P-38 and Fw190 each have a worsened individual check, and P-38 alternate fits are sensitive. F-4 gains a conditional inlet/parameter ensemble, while Corsair accuracy is unchanged. Source/reference modes expose different physical configurations. Historical stall/turn and 5:1 remain unresolved. [Exact bounds and regressions](V41_ENERGY_RESULTS.md).

## v4.0 candidate scope

The F4U-4 uses a 1948 trial, static engine-rating transfer, assumed gear scheduling/inlet recovery, and a source-fitted equivalent low-J correction. Its high-altitude speed and climb deficits remain. P-47B 41-5942 prop and P-51B rack changes are bounded source-conditioned experiments. Existing Spitfire, F-4, Fw190 A-4 and P-38G parameters retain their earlier qualifications. Seven-aircraft turn bands use selected perturbations and an assumed 7g structural cap. Fuel burn uses illustrative 0.50 lb/hp-hour. [Exact limitations and v4.1 gaps](V4_MILESTONE.md).

## 2026-11-10 four-track multiaxis research: source quality, not a solver accuracy certificate

The [200-row multiaxis evidence update](research/WW2_FIGHTERS_MULTIAXIS_PRIMARY_SOURCE_DEEPENING_2026-11-10.md) adds distinct original-speed, altitude, torque, propeller, weight, turn-control and correctly labelled IAS stall *observations*, but cannot claim 200 independent flight tests or a new physically verified turn/drag fit. The original P-38 H/J/L correction says **installation errors only**; its three within-chart corrected* stall estimates **exclude instrument error and do not count as newly measured CAS**. The January P-47B 41-5942 report contradicts its own December predecessor in the climb speed header (IAS vs TAS); January climb-speed basis therefore remains unestablished. The original Fw 190 D-9 and Ki-84 calibration graphics are cataloged **as undigitized leads**, not fitted numbers; Spitfire BF274 actual measured PEC starts at 130mph IAS and does not certify LF IX stalls below it. Original F6F-3 BuNo25820 records IAS knots with **unknown test mass**. Bf109 G-2 and Tempest V added secondary-level IAS rows cannot serve as fitted CAS or verified independent experimental checks. Original P-47D-30 figure 58 captions disagree on altitude 3000/5000ft (archived as `null`); the Spitfire VA NACA companion proves W3119, not test-identity from an R7347 photograph. The four source-original CAS F4U-4 points and single provisional CAS* Corsair point remain unchanged. **No modeled aircraft has full historically verified 1g stall, installed-power, sustained-turn, independent-validation evidence at present**; application physics is unchanged by these research packs.

## 2026-11-10 original-source stall follow-up

The [four-track research report](research/WW2_STALL_FOUR_TRACK_FOLLOWUP_2026-11-10.md) documents 29 additional archive rows, **not** 29 new independently qualified CAS stall speeds. Spitfire VA's ten original IAS/CLmax measurements are **not Spitfire LF IX BS.543** stall tests. Its Fig. 5, and the Hurricane II Z2963 Fig. 7, describe cockpit-airspeed corrections, while NACA stall instrumentation uses separately documented recording heads; reapplying those figures to the stall table without the signal mapping risks wrong or double correction. New P-47D-30 source-caption weights characterize test flight runs but do not prove mass at the exact stall instant; the 1953 report supersedes the 1948 test, and the two wave-off figures did not reach full stall. F6F-3 BuAer 04776 normal-force coefficient depends on slipstream/configuration and is not automatically power-off wing CLmax; the report's position-error-free *service indicated* reference does not justify reporting its untranscribed stall figure speeds as original direct CAS/EAS. No baseline model coefficients, 5:1 or historical sustained-turn certification changed.

The [Spitfire and Thunderbolt climb-band report](CLIMB_BAND_COMPARISON.md) compares independent historical reports at different test ratings. The replays use already-exposed observations. The alternate profile spread does not bound prediction error.

The fixed four-fighter comparison uses default reference ratings and weights and provisional lift. The F-4 default engine domain omits the 27,000-ft state. The Mustang workbook and Greg graph have their own evidence qualifications. The numeric comparisons do not change the historical stall or 5:1 status. [Scenario definitions](FOUR_FIGHTER_COMPARISON.md).

The DB 601 E inlet option is a G-1-to-F-4 installation transfer at 1.3 ata, using an assumed pressure recovery and charge law. The translated critical speed conflicts with the scan OCR. Independent production P-47B checks cover one propeller and defined flight states. The Spitfire and Mustang specimen transfers show material discrepancies. See [archival checks](INDEPENDENT_FLIGHT_CHECKS.md).

The v3.8 fast-flight term corrects a net installation residual. The data do not isolate propeller losses, shaft power or airframe drag. The fitted cases and reserved checks share previously exposed historical reports. Open-shutter scenarios are bounded by the report altitude and speed ranges. The Bf 109 F-4 rated-altitude power gap and independent four-aircraft accuracy remain open. [Results and controls](FLIGHT_ENVELOPE.md)

The v3.7 flight scorecard compares the working profile with already-exposed historical records. Its error figures include condition mismatches. There are zero independent matched checks in the frozen cohort. The P-51B lift transfer applies to clean, steady, throttled one-g estimates inside 5,100–9,300 ft and Mach 0.14–0.18. Exact corrected stall and 5:1 comparative accuracy remain open. [Scorecard](FLIGHT_SCORECARD.md)

The v3.6 stall comparison covers pressure altitudes 0–35,000 ft and user-entered weights from 1,000 to 20,000 lb. These are input limits for the one-g calculation. Each aircraft's real loading envelope and attainable altitudes depend on its configuration and available power. Fixed model CLmax gives constant EAS at fixed weight. Conversion to CAS and TAS changes with altitude. The TN1044 candidate remains bounded, and calibrated historical stalls for the four target cases remain unresolved.

- **v3.5 lift candidate is conditional:** the new P51B laboratory transfers calibrated low-Mach NACA lift measurements, not a recovered cockpit correction on 43-24777. Its altitude/Mach limits and smooth finish/high-pitch propeller condition matter. The engineering bracket is not a confidence interval. No exact F4/P47B/P51B15/BS543 historical stall gate has been closed.

- **v3.4 is a conditional configuration-loss fit:** five 41-5902 fit states and five reserved states were all exposed in v3.3 before the new split. A 34.1-ft/min nominal check MAE is not an accuracy bound: paired mass/retention scenarios span 34.1-190.6 ft/min. The 0.7 power-linked mixture is not measured cooling heat; alternate fits choose 0.6-1.0. Gross test mass, installed propeller losses, torque calibration and atmosphere corrections remain qualified. The 35000-ft residual is still -83.6 ft/min. Coefficients apply only to exact matched report states, not generic flight or other aircraft.

- **v3.3 recorded-power replay is conditional:** same-specimen 41-5902 report BHP/RPM/TAS with verified gearing improves input identity, but 12565-lb gross weight is not instantaneous climb mass, installed propeller eta remains fitted, and pointwise torque/atmosphere correction uncertainty is unknown. Existing open-cooling drag transfers from 41-5931. The 35000-ft residual is -432 ft/min; do not interpret scenario MAE as a validated historical accuracy bound. Spitfire original Table II remains unavailable.

- **v3.2 new high-altitude check:** Spitfire 34000 ft predicts 1288 vs 1550 ft/min. The 32000-ft boost is a suspect transcription and diagnostic-only. Original Spitfire pixels remain unverified; 14000-ft high-gear reference boost remains absent. Higher engine-domain gaps are not extrapolated.
- **P47 climb provenance corrected:** 41-5931 climb versus 41-5902 speed/power reference, different guns, equipment and source gross weights. Existing 12565-lb calibration is an explicitly qualified transfer scenario. Earlier numerical gains are not same-specimen historical validation. Original same-specimen 41-5902 high-altitude torque points use 2550 rpm rather than level 2700 rpm; an RPM transfer remains unresolved.

- **v3.0 is not built or historically validated.** Passing tests preserve behavior and evidence guardrails.
- No verified, aircraft-matched low-speed IAS-to-CAS correction currently supports a precise clean historical CLmax for any of the four benchmark aircraft. Sensitivity offsets are hypothetical, not measurements.
- P-51B at 2,200 ft: candidate C predicts about 3,401 and 3,979 ft/min versus reported 3,820 and 4,380, a deficit of approximately 419 and 401 ft/min. Reported climb airspeed is missing; do not silently treat optimized model speed as matched.
- Bf 109 F-4's optional/default UI scenario is conditioned on IL-2 turn specifications. It is not an independently measured historical polar.
- P-47C source run 20-1 is still 0.799 in the frozen OCR fixture; the newer handover reports 0.779 from the actual scan. The source audit and its passing coefficient-consistency assertion do not verify that OCR. Resolve the complete Table I row before changing the active reference.
- Candidate C does not reproduce the P-47C measured power-loading efficiency loss. NACA chart transfers are research options with blade-family and Cp-domain limits.
- P-47 2,600 hp remains a controlled case, not a verified P-47B rating.
- The 5:1 aircraft discrimination target is unresolved until matched historical observations and a defensible differential-error budget exist.
- The build has static JavaScript/data checks. Preserved Playwright browser tests have not been rerun in this environment.
- Two large scans and nine nested archives are excluded from Git. The per-file manifest lists their exact identity and recovery paths. Links are preserved evidence pointers; their live availability was not rechecked during setup.

See [the full inherited limitations](KNOWN_LIMITATIONS_LEGACY.md) and [stall gate](STALL_WEIGHT_GATE.md).

## Stall milestone limitations (2026-10-30)

The new source gate is executable, but no historical record passes all requirements. Verification flags are reviewed metadata, not automatic scan authentication. The +/-15% CLmax/EAS endpoint sweep is inherited exploratory sensitivity, not a confidence interval or a calibrated physical bound. Powered/accelerated transfer, stall-domain instrument/position error and observational uncertainty remain open. Comparison weights/default ratings are research states, not uniform combat loads. See STALL_SOURCE_AUDIT.md for exact inspection/access limits and STALL_CALIBRATION_RESULTS.md for measured model impact.

## P-51 targeted calibration audit

No matched near-stall correction was established within the inspected Wright Field and NACA material. The target stall table's instrument-error convention and observed pressure channel remain unknown. Earlier P-51B serials and modified NACA boom installations cannot supply that missing provenance. NACA readability/pressure-error statements do not bound target stall error. See P51_LOW_SPEED_CALIBRATION_AUDIT.md. No active P-51 CLmax or turn ranking was recalibrated.

## P-47B primary-source update

The earlier manual-only evidence description is superseded: the original 41-5902 scan records a clean 105 mph indicated power-off stall. However, nominal report weights differ by 5 lb, instantaneous stall weight/altitude and instrument convention are unstated, and calibration starts at 170 mph. This new observation does not establish stall EAS or measured CLmax. See P47B_STALL_WEIGHT_AUDIT.md. Model weight and coefficient remain unchanged.

## Bf 109 F-4 evidence limits

The original manual/test candidates remain unverified at the stall-page level; catalogs and attachment filenames do not establish F-4 applicability. No matched historical stall weight, slat state or near-stall correction was obtained. Placeholder specimen matches and undocumented F-4 slat states now fail the executable gate. See BF109F4_STALL_AUDIT.md.

## Consolidated review and Spitfire correction

The 90/93 mph pilot-note rows belong to clipped-wing reference conditions, with a 45-gallon tank in the heavier case. They are not clean full-span BS.543 observations. The inspected edition is postwar (September 1946), and PDF text inspection does not establish scan verification. The manual correction table begins at 120 mph IAS; BF.274 correction adoption in the target performance report supplies no demonstrated stall-domain coverage. All four historical stall calibrations and all six 5:1 comparisons remain unresolved. See FOUR_AIRCRAFT_STALL_REVIEW.md and SPITFIRE_IX_STALL_AUDIT.md.

## Performance validation eligibility

All 69 active performance records are explicit diagnostics or missing-evidence coverage. No current record passes every strict condition requirement; no independent validation aggregate or pairwise 5:1 pass is established. The Bf 109 climb-rate observation is absent, P-51 speed mass follows a sparsely digitized normalization curve without adopted point masses and climb TAS is unknown, P-47 per-point mass/cooling losses are unresolved, and Spitfire speed RPM differs by 5 from the nominal model while climb cooling is open. These exclusions do not prove large physics errors. Diagnostic residuals, especially Mustang climb deficits, remain visible. Original report transcriptions are not freshly verified scans, and prior model development has already seen the checkpoints. See PERFORMANCE_VALIDATION.md.

## Climb power/cooling attribution

The new inverse budgets assume the existing shaft/drag/prop model and chosen weight/TAS. They do not identify a physical correction. Positive cooling drag cannot supply missing power; negative equivalent net drag is not measured radiator thrust. The 0.83 C-formula amplitude is a code property, not a real propeller bound. Mass-only roots require roughly 680-790 lb below reported Mustang takeoff mass but do not reconstruct fuel burn. Fig.6/7 pixels were inspected without digitizing uncertain BHP/shutter coordinates. Heat recovery/exhaust and installed power errors remain possible, unquantified causes. No default numerical prediction changed.

## Mustang original-chart reconstruction

The follow-up to the earlier diagnosis retains Figure 4 and sparse native-pixel BHP/weight reading brackets. Manual boxes, approximate affine axes and a 3-pixel allowance are auditable extraction choices, not independently validated uncertainty bounds. The curve is a level-speed normalization condition; actual climb weight/TAS remain missing. Only selected low-blower power branches are digitized. Higher-blower/61-inHg intersections and shutter-force calibration remain absent. Joint C-model power/weight grids retain about 322/268 ft/min shortfalls; finite-grid ranges do not bound all continuous or historical states. The 4,000-ft power mismatch and missing source-bounded proxy beyond 7,400 ft require explicit treatment before generalizing the climb power model.

## Propeller milestone and v2.6.0 scope

No inspected source establishes a target-installed K-6523A-24 efficiency surface. The official NACA 43-12105 OCR has an ambiguous blade-prefix character and concerns a different specimen/engine; no original-pixel verification or numerical eta transfer is claimed. TK589 shares a blade drawing but differs in installation/loading/cooling. Existing N/M use other geometry, Cp-floor clamping and incomplete Mach applicability; D retains an assumed global loss fraction. Lower excluded Figure 5 residuals are insufficient evidence, especially while reanchored climb results worsen. C remains heuristic. The new release label is not new historical validation. Browser interaction tests remain unrun.

## Source-chart mode

The new API exposes an optional exact-node climb diagnostic. It holds chart-assigned BHP constant across the speed grid; actual climb TAS, instantaneous mass and shaft torque remain unknown. Source metadata are input assertions, not automatic document authentication; the report separately checks retained scan hashes. Reading bounds are extraction choices, not historical uncertainty. No interpolation/high-blower extension or interactive UI selector is supplied. This improves diagnostic coverage, not established accuracy; the default model and known failures remain unchanged.

## v2.8 working approximation

P is an empirical joint engineering fit, using already-exposed observations. Its source speed anchors, Figure 5 power rows and selected climb rows participate in calibration. Reserved rows were seen during development and acceptance. Near-zero Mustang residuals do not imply near-zero prediction uncertainty.

Effective e and aggregate open-configuration CD0 can absorb shaft-power, propeller, cooling and exhaust errors. Spitfire e=0.60 lies at the search boundary; Bf109 has no climb observations in this fit. Do not transfer fitted drag to validated turn claims. P47 reserved climb error is 84.7 ft/min versus 70.5 for the prior conditional experiment. Historical mass, climb TAS, source reading and engine installation remain qualified. See V28_RESULTS.md.

The UI uses P; direct API callers must request it explicitly. The e slider at 0.78 uses the aircraft-specific fitted e and reanchors the scenario. P cooling/configuration loss applies only when explicit source-climb state or a documented open climb observation is requested. Interactive browser tests have not been run for v2.8.

## v2.9 robustness limits

Existing-data split checks and graph-reading scenarios do not certify historical accuracy. The 27 paired Mustang scenarios use three assumed masses (9135/9335/9535 lb) and independent lower/midpoint/upper chart-power readings at two ratings. They are a finite scenario set, not probability distributions or validated uncertainty bounds. The smallest winning margin is modest in the light/high-power corner; 27/27 is not a guarantee outside the tested set. Nominal residuals near 9 ft/min under the engine proxy become roughly 20–293 ft/min under these chart-power/weight choices.

The original Spitfire e=0.60 grid boundary was coarse: a finer original-split fit favors 0.65, while alternate splits favor 0.70. Neither value is measured wing efficiency. Eight fixed candidate models were tested against documented cross-condition limits; none qualified for replacement. This is not exhaustive physical-model optimization. v2.9 retains v2.8 predictions, and v3.0 historical stall/turn and independent pairwise discrimination remain unresolved.

## v3 release-candidate scope

Calculation coverage is not a validated flight envelope. Engine-input intervals include documented proxies and assumptions; the propeller map remains an empirical working law. Numerical speed/altitude limits do not certify physical accuracy. Source speed checkpoints are discrete and already exposed.

Pairwise differences are fixed-speed specific-excess-power scenarios using native reference masses/selected ratings; the shared weight percentage is not an equal-combat-load policy. They are not measured historical climb-rate comparisons. Modified configurations, unsupported inputs, below-assumed-stall states and mixed simulator/Greg states cannot generate a qualified pairwise value. Turn/stall and 5:1 historical accuracy remain unresolved.

The five Mustang chart-power ranges retain the fitted P calibration and their own assumed masses; they do not follow e, weight or profile sliders and do not predict the current fixed-speed state. Graph-reading brackets are not confidence intervals. Headless Chromium smoke is a targeted interaction check, not exhaustive UI or cross-browser testing.

The local Windows Edge CDP automation timed out while changing altitude and did not complete. The same smoke completed all ten interactions in hosted Chrome CI with no JavaScript exceptions. Edge compatibility is not certified by that Chrome result.

## v3.1 condition-aware climb limits

The fitted 0.75 MAP-ratio exponent is an engineering proxy for net shaft-power availability under documented climb boost, not an identified engine temperature, volumetric-efficiency or intercooler model. It is active for explicit matched source-climb states; it does not improve arbitrary clean-flight power or turn curves. Configuration drag is aggregate and fitted, not measured isolated cooling drag.

Targets pass on the original reserved data and fair same-training-data refits. All observations were already exposed. One alternate P47 comparison against retained coefficients is worse, and Spitfire improves in 8 of 9 assumed power/mass stress scenarios. Parameter fits can move to the exploratory search boundary. The missing Spitfire 14000-ft reference boost is not filled. Source-weight and airspeed qualifications remain. No independent historical accuracy, measured turn/stall or 5:1 proof follows.

## P-38G-1 42-12687

The clean all-engine comparison uses chart-derived per-engine BHP, assumed propeller efficiency and effective cooling drag fitted at one climb point. The reserved rows share the fitting report and are not independent evidence. No historical bound supports 5:1 discrimination against the P-47B. Climb rates are replayed at reported TAS and takeoff weight. Historical lift and turn remain open. [v3.12 report](V312_P38G.md)

## Mustang maneuver power

Figures 6-7 do not identify climb TAS or instantaneous mass, and their shaft BHP comes from engine charts. Chart replay uses the takeoff mass and modeled speeds. The sampled sustained-turn range is sensitivity to propeller assumptions and speed-anchor reanchoring. It does not bound historical turn accuracy. [v3.13 report](V313_MANEUVER_POWER.md)
