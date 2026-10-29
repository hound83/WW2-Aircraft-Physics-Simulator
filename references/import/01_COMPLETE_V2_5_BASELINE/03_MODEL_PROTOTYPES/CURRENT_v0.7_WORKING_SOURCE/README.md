# CURRENT RELEASE: v0.7

Open **Universal_Three_Aircraft_Model_v0.7.html**. For the new independent Fw 190 A-4 stored-load validation and IAS correction, see **README_v07.md**. The text below documents inherited earlier prototype versions.

---

# Universal Three-Aircraft Performance Model — v0.4 (research prototype)

## v0.4: cross-aircraft climb test — completed, without tuning P-51 coefficients

The shared solver now computes *best steady climb* by scanning feasible true airspeeds using exactly the same airplane geometry, atmosphere, drag polar and installed propeller candidates as the existing maximum-speed / maneuver model. It honors each engine rating's available power curve; there is **no fit to P-51 climb results**. The observed climb speeds are not transcribed, so model-optimum speeds are predictions rather than known test conditions.

**Actual 20 May 1944 P-51B-15 (43-24777) Wright Field report**, 2,200 ft, 3,000 engine RPM, 67 vs 75 inHg (HTML transcription of original document): **3,820 vs 4,380 ft/min, increase +560 ft/min**. [Source](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html). The airplane was tested with wing racks; climb power is from Packard altitude-performance charts and published flight-test curves, not measured in-flight torque.

| Propeller candidate (unchanged drag fit) | Model 67 inHg | Model 75 inHg | Model improvement | Improvement residual vs +560 | Absolute climb residuals |
| --- | ---: | ---: | ---: | ---: | ---: |
| A constant η=0.80 | 3,621 | 4,215 | +594 | +34 | −199 / −165 |
| B simple speed-dependent η | 3,939 | 4,576 | +637 | +77 | +119 / +196 |
| C heuristic J/Cp/tip Mach | 3,448 | 4,031 | **+583** | **+23** | −372 / −349 |

Units are **ft/min**. None of these three assumptions was retuned using this P-51 test. Candidate C gives the closest *power-induced difference*; B gives a closer absolute climb prediction, although its increased climb is less accurate. This is the reason to retain and compare multiple whole-aircraft candidates, not to simply declare C the winner.

**Cross-aircraft falsification:** copying the P-47B's one-point-fitted equivalent `ΔCD0≈+0.015819` cooling/configuration loss unchanged to the P-51B (candidate C) makes its already-low 67-inHg prediction fall from ~3,448 to ~3,141 ft/min. That correction is **not generalizable as a universal number**; only the method of representing distinct test configurations transfers. The 67/75 difference remains roughly right because the identical assumed configuration loss mostly cancels.

**Sensitivity checkpoint, not an accuracy tolerance:** for candidate C at e = 0.60–0.90 and mass 95–105% of its reference weight, the predicted boost-induced climb improvement runs from ~555 to ~616 ft/min. Absolute rates vary more. This supports the importance of comparing *differences and absolute values separately*, including correlated assumptions.

The original report also states a **+580 ft/min** improvement at 15,700 ft. That higher-altitude rating comparison is recorded as an unresolved future holdout: the imported **75-inHg high blower curve does not cover 15,700 ft**; do not extrapolate or claim validation there. The report's climb-airspeed values are not provided in the HTML prose (see original graph Fig. 6), so direct matched-speed validation remains outstanding.

**Build & QA:** `node test.mjs`, `node write_results.mjs`, `python make_html.py`, `python test_browser.py` passed (Chromium 1360px and 390px). All Greg worksheet and P-47B regression checks remain present. `results.json` now records historical/model P-51 rates and both absolute and delta residuals. No GitHub repository or website was changed.

---

**Aircraft:** Messerschmitt Bf 109 F-4, Republic P-47B (41-5902), North American P-51B-15 (43-24777). All three use **exactly the same atmosphere, aerodynamic drag, propeller model and power/energy/maneuver solver**. The aircraft registry supplies only dimensions, reference mass, engine power schedule, propeller-geometry guesses, assumptions, and reported source observations.

**Important:** This is an *exploratory calculation model*, **not a validated reconstruction of sustained turns or historical combat performance**. Do not quote its absolute turn results as wartime flight-test facts, or treat one aircraft as the historical winner under incompatible ratings. Original-period flight-test transcriptions and Greg's screenshots serve fundamentally different roles.

## Open and use

- **`Universal_Three_Aircraft_Model_v0.4.html`**: open locally in any modern browser. It is a single standalone file with embedded inputs/calculation engine and requires **no Internet connection**.
- Start at **5,000 ft / 200 mph EAS** to compare all three with bounded altitude-power sources. Select propeller profile A, B or C, Oswald factor, reference weight, BF109/P51 rating, and fixed versus re-fitted drag.
- View **Greg worksheet reconstruction** and switch Bf109 F-4 sea-level drag sheet or the separate high-power P-47 D-28-style table. Below it, compare Greg's approximate P-47B/109F **27,000-ft** plot against the prototype, treating the unknown chart-speed definition provisionally as CAS. The 109 result stays *unavailable* there because its power curve is not documented that high.
- Inspect **wartime flight test** predicted vs reported speeds and note the single speed point per aircraft used as a calibration anchor. All other points are held out *from the CD₀ fit*, but the heuristic propeller profiles were designed with prior knowledge of the data: not an independent blind validation.

Developer checks (Node.js 20+ and optional Python 3):

```bash
node test.mjs
node write_results.mjs
python make_html.py
python test_browser.py  # requires Playwright + Chromium; optional
```

`results.json` stores machine-readable calculations and validation residuals.

## What changed in v0.3 (retained) — three advances, no new aircraft names

**1. P-47B engine power is different in climb.** The original Wright Field acceptance report PHQ-M-19-1417-A has separate high-speed and climb tables. At 30,000 ft, level flight used **47.5 inHg / 1,845 bhp**, whereas climbing achieved only **41.0 inHg** with the turbo at its limit. v0.2 erroneously reused 1,845 bhp. v0.3 records each original MAP and estimates climb power by scaling level BHP using the climb/level MAP ratio at the same altitude and RPM, capped by the historical rating. This is a first-order **power estimate, not a measured climb torque output**. It is not extrapolated across aircraft.

**2. We can now check climb configuration with actual observations.** The speed-test had closed/flush cooling flaps, whereas climb-test flaps were wide open. We use *one* P-47B climb observation (15,000 ft) to fit an **aggregate equivalent change in parasite CD0**, approximately **+0.015819**. Importantly, this is NOT a measured cooling-drag coefficient: it lumps unmodeled cooling drag, propeller efficiency, engine/test differences. The other four climb observations are kept out of the fit, and retained as tests. The original mean absolute error over those four altitudes was **753 ft/min**. With estimated climb BHP and the single equivalent loss term it becomes **56 ft/min**. This is a large improvement on one test series, but cannot yet be generalized to other aircraft or flight regimes.

**3. A genuinely controlled 2,000 vs 2,600 hp test.** The Greg high-power P-47 worksheet now gets a power-only sensitivity view: identical Greg drag curve, wing/mass scenario (13,065 lb), and identical inferred prop-efficiency schedule. Raising shaft HP from 2,000 to 2,600 changes the worksheet's predicted maximum level speed from about **322.8 to 355.4 mph**, and its power-limited 200-mph maneuver from **2.42 to 2.86 g**. Those are calculations, not verified P-47B or P-47D-28 historical figures. Physical configuration differences are not silently ignored.

**Why this is progress:** Two systematic missing elements, engine RAM / turbo-limited climb power and climb configuration, now have actual inputs and separate tests. We did not alter the aircraft drag-anchor fits for maximum speed, change the Spitfire/Bf109/P51 unknown stall numbers, or tune a separate drag coefficient at every altitude. Greg's arithmetic tests remain intact. There are still no historically validated sustained-turn rankings.

**Next decision, kept deliberately small:** (1) Check the source figures and actual weight/MAP conventions against the original PDF; (2) obtain one genuinely independent low-speed/stall calibration per aircraft; (3) challenge the inferred climb-configuration loss against another airframe/test series before calling it a reusable fallback. No need to add another aircraft yet.

## The model in one equation

Classical steady-flight parabolic polar:

\[D(V,n)=\frac12\rho V^2 S C_{D0}+\frac{2(nW)^2}{\rho V^2\pi e b^2}\]

with shaft power \(P_s(h,\text{rating,gear})\), an illustrative installed efficiency \(\eta(V,n_{prop},D_{prop},h,P_s)\), and \(P_{available}=\eta P_s\). A feasible sustained turn must satisfy **all** limits: available power at least as great as required power, lift coefficient at or below assumed clean \(C_{L\max}\), and structural-G cap. Curves stop rather than showing impossible sustained turns. Excess power is negative where the aircraft loses energy.

- The aerodynamic equations are universal; their coefficients are not universal.
- `CD0` is inferred from exactly **one** speed/power anchor per aircraft using default profile C and assumed `e = .78`. That is a fitting operation, **not independently measured drag**. The UI optionally re-fits after an assumption change, making parameter non-identifiability visible.
- Alternative propeller models: A: constant η=0.80; B: simplified speed curve; C: *exploratory* function of advance ratio, power coefficient and tip Mach, **not** a digitized NACA map. Switching profiles with the fixed-drag option causes independently visible speed differences.
- Wing \(C_{L\max}\) assumed: F-4 **1.50**, P-47B **1.30**, P-51B **1.60**. These are **not measured** for the displayed airframes. Each can yield significant stall/turn uncertainty. The calculated stall EAS is a scenario limit, **not the IAS stall speed quoted in a wartime manual**.
- `e = 0.78` is an explicit common initial scenario assumption; the Greg F-4 screenshot's drag split at 325 mph implies `e ≈ 0.558` **if** reference mass is 6,371 lb. The high-power P-47 screenshot implies `e ≈ .784` using 13,065 lb. These strongly different implications are worth further research, not numbers to average.
- Engine curves are strictly interpolated within source nodes and gear/rating; no silent extrapolation. F-4 emergency **0–15,748 ft** (secondary power points), P-47B military **5,000–34,000 ft**, P-51B-15 67 inHg low **0–24,000 ft**, high **18,000–32,000 ft**. P-51B 75 inHg has only sparse rating-specific nodes.
- 109 early full DB 601E power approval varies over wartime; the emergency rating shown may not represent a 1941 operational F-4. 109 source power figures are secondary/simulator-linked; they are not matched original flight test horsepower curves. Comparing ratings must be explicit.
- ISA, compressible subsonic CAS↔TAS and density-based EAS↔TAS are calculated. **IAS not calculated**, lacking specimen-specific instrument/position calibration, especially near high-angle-of-attack stall.

## Greg screenshot numerical reconciliation

1. **Bf 109 F-4 sea-level worksheet:** at 325 mph, parasite drag 1,137 lbf and induced drag 81 lbf; total drag 1,218 lbf, required/available propulsive power ~1,058 hp. Scaling drag ∝V² and 1/V² reconstructs the 100–325 mph rows. A few rows deviate by up to ~6 hp due to screenshot rounding/worksheet approximations, which the test suite explicitly tolerates and retains instead of altering history.
2. **High-power P-47 sea-level worksheet:** parasite power 2,453 hp and induced power 116 hp at 375 mph. The screenshot shows propulsive power plateau 2,210 hp. This is compatible with a high-power 2,600 hp shaft ×0.85 η case, **not** the independently documented P-47B's 2,000 bhp. We keep it as a separate Greg D-28-style calculation control.
3. **Greg P-47B versus F-4 at 27,000 ft screenshot:** approximate P-47B sustained g (at chart MPH 125/150/175/200/225/250/275) = 1.5/1.7/1.8/1.7/1.7/1.5/1.0. Chart speed type unknown; **CAS is an unverified interpretation**. The model predicts corresponding approximate values of 1.22/1.75/1.92/1.93/1.86/1.68/1.31 g on that assumption. This *does not establish* 0.3 g historical error. Greg's F-4 line likewise cannot be recomputed from the available 109 power source at 27,000 ft.

## Wartime source observations and status

| Airplane | Period report/data | Input confidence and major caveat |
|---|---|---|
| Bf 109 F-4 | Greg screenshot 325 mph sea-level + [published 325 mph secondary specifications](https://www.yumpu.com/de/document/view/12139943/messerschmitt-bf-109-f-2-4) + [secondary IL-2 DB601E power reference](https://il2sturmovik.com/museum/fighters/bf-109-f-4/) | No exact original F-4 engine chart/test configuration through 27k ft; standard mass 2,890 kg and 1.35k PS are preliminary. Higher confidence needed before any historical 109 turn comparison. |
| P-47B 41-5902 | [USAAF PHQ-M-19-1417-A](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html) | Test weight 12,565 lb; measured torque-meter BHP, speed points and cooling-flap differences. Engine 2,000 bhp up to 27,800ft in source. Prop rpm reduction and full blade map still lack specimen audit. |
| P-51B-15 43-24777 | [USAAF Eng-47-1749-A](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) | 67/75-inHg blower tables and NACA-standard-corrected TAS, Packard-chart BHP (not a specimen torquemeter). Some 75-inHg table rows and carburetor issues unresolved. |
| Greg high-power P-47 | User-supplied sea-level screenshot | **Not** used as P-47B horsepower. Explains why output plateaus at 2,210 propulsive hp in a D-28-style 2600 ×0.85 interpretation. |

The package contains screenshots supplied by the user for independent audit. Neither Greg calculation nor the IL-2 power model should be treated as an independently measured RLM/USAAF flight test. Source **provenance** and measurement **method** must remain two separate metadata fields if integrated into the Atlas.

## Default exploratory result: shared 5,000 ft and 200 mph EAS

See `results.json` for exact numbers. With profile C, common e=0.78, source-bounded engine power and *provisional* per-aircraft CLmax:

- Bf 109 F-4 **~3.01 g** sustained; source quality insufficient to call it a validated figure.
- P-47B **~2.41 g** sustained.
- P-51B-15 **~2.77 g** sustained.

These figures **must not be interpreted as a historical ranking** because the 109 emergency rating, P-47 military and P-51 67-inHg ratings have different restrictions and fuel/test contexts, and the induced-drag/lift parameters are largely unconstrained. The model predicts the feasibility of a hypothetical *same environmental condition* scenario, not the outcome of combat.

## Observed versus calculated maximum speed (profile C baseline)

CD0 fitted at *one* speed point per aircraft: Bf 109 at 0ft/325mph (Greg/secondary), P-47B at 5000ft/352mph (USAAF), P-51B at 0ft/361.5mph (USAAF).

- P-47B other test altitudes: held-out-from-CD0-fit MAE **3.65 mph** across 5 points; absolute maximum error approx **5.94 mph**.
- P-51B 67-inHg other test altitudes: held-out-from-CD0-fit MAE **2.61 mph** across 8 points; maximum ~**3.85 mph**.
- Bf 109 F-4: **no independent source-qualified holdout points in the loaded power envelope**, so there is NO performance validation result for that variant.

**Scientific caveat:** these low residuals do not establish blind accuracy: profile C was inspired by already-known aircraft data, and the method uses one speed fit per plane. Stable held-out climb and controlled component-swap tests are needed. Profile C of the previous v0.1 prototype **failed** the six-propeller P-47 swap, so the propeller approximation is still suspect even when speed residuals look good.

## Next tasks — in order

- [ ] Audit original report images and exact Bf109 F-4 DB601E power, including test variant, emergency rating dates, altitude and corrected CAS/TAS.
- [ ] Source weight-normalized clean stalls with low-speed IAS→CAS calibration; constrain actual CLmax for each test configuration.
- [ ] Validate predicted climb at **reported test speed and cooling configuration**, not merely max-level speed. Include additional cooling drag where appropriate.
- [ ] Re-evaluate generic propeller map with historical same-aircraft propeller swaps; stop fitting hidden per-aircraft corrections until the model reproduces direction and magnitude.
- [ ] Compare drag induced factor `e` from Greg's screenshots to defensible estimates from wings, report CL/CD polars, and holdout climb/turn observations.
- [ ] Propagate correlated parameter uncertainty and plot intervals on differential performance (not just absolute outputs). Only rank airplanes if uncertainties support it.
- [ ] Add more independent aircraft test configurations only after the universal method is shown to generalize; later Atlas integration remains a separate approval.

**No GitHub commit or website deployment was performed.**
