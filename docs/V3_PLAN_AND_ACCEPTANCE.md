# v3.0 plan — meaningful accuracy improvement before scaling

## Model objective

One shared engine for P-51B-15, P-47B, Bf 109F-4 and Spitfire LF Mk IX, capable of growing to many aircraft without introducing aircraft-specific performance fudge factors. Airframe geometry, drag, propeller family, engine/boost schedule, configuration and loading are specific inputs, not separate physics solvers.

## 5:1 resolution criterion — target, not established capability

For two aircraft compared in matched conditions and whose reference performance gap is Δ, require a validated upper bound on the absolute *pairwise error of the difference* **≤ |Δ|/5**. If two individual absolute errors each bounded by `E` can oppose, conservative worst-case pair error is `2 E`; for Δ=1.3 s, total allowed 0.26 s and individual equal bound 0.13 s. Evaluate error correlations using evidence, not assumed cancellation. Independently check the conditions, observed spread and uncertainties in the historical reference (measurement error may already exceed this). A model can validly report 'unresolved' if 5:1 cannot be demonstrated. Speed/climb and non-turn comparisons need corresponding metric-dependent differential budgets, not a blanket ±5%.

## Five steps (do in this order)

### 1 — Matched stall/weight data gate
- Search primary aircraft test or period pilot manual for aircraft **variant, serial/condition, power off vs power on, flap/gear/cooling/slats, configuration, altitude and contemporaneous mass**, not just a generic IAS stall.
- Record wing reference area, slat state for 109, test weight versus published normal/max takeoff. Preserve source scan location and exact date/rating.
- P-51B test has 86 mph IAS / 9270 lb clean at 8,000 ft (shutters closed) and a separate 84 mph IAS/9240 lb (shutters open): avoid mixing configurations.
- P-47 manual 115 mph IAS is generic; P-47D 116 mph IAS / 13230 lb is takeoff, not matched stall weight.
- Spitfire IX pilot figures have weights but no verified low-speed correction and are not BS.543 direct measurements.
- Bf109 F4 IL-2 154–171 km/h IAS is simulator output, not historic calibration.

### 2 — Airspeed audit
- Preserve raw IAS; obtain aircraft/configuration-specific position/instrument correction valid in stall AoA neighborhood; `IAS -> CAS -> EAS` (compressibility corrections where meaningful), and `EAS -> TAS` with atmosphere for power/drag.
- Mark chart coverage, calibration domain, extrapolation status, instrument/static position setup. Never use high-speed calibration extrapolated to 86/115 mph as verified, nor apply conversion twice.

### 3 — CLmax audit
- Use `CLmax = 2W / (rho0 * S * Vs_EAS^2)`, with consistent units and matched test mass/configuration.
- If genuine EAS unavailable, retain clearly labeled provisional CLmax and compute physically bounded sensitivity without pretending to have observational confidence intervals.
- Check whether clean *power-off* CLmax transfers to powered/accelerated turning (propeller flow and slat dynamics differ).

### 4 — Consolidate shared solver
- Use a single density, lift, drag, engine shaft power, prop efficiency/thrust and specific excess power calculation across all four airplanes.
- Lift envelope `n_L=(V_EAS/Vs_EAS)^2` for same weight/config; incorporate structural/limit G and power-limited sustained turns; instant turn and sustained turn must not be conflated.
- Apply tested engine-speed/boost/altitude effects and source-bounded P-47 prop characteristics; leave corrections optional until independently substantiated.
- Maintain Greg arithmetic and controlled P-47 2000/2600 hp same-geometry test, and the P-51 climb discrepancy as known failure unless genuinely resolved.

### 5 — Independent validation and 5:1 scoring
- Produce standardized test cases (altitude, speed EAS/TAS/IAS, atmospheric model, power, engine RPM/MAP, wing geometry, actual/test/combat weight, cooling and stores).
- Full table: historical vs prediction, error in native unit and %, source class, fit/withheld status; chart available versus required power, Ps and sustained/instant turn curves.
- Run same baseline tests for P-47B, P-51B, 109F4 and Spitfire IX; separate historical measurements from Greg, NACA prop test, IL-2 and DCS developer/player checks.
- Score individual and pairwise differences at matched conditions, report 5:1 PASS / FAIL / UNRESOLVED honestly.

## Stop criteria / scope

Don't add 20 new planes, don't redesign the UI or Atlas website, don't tune to simulator turns then call it independent verification, and don't claim a 5:1 pass without matching historical observations and realistic validation error. Preserve prior negative tests. Return a runnable v3.0 increment, verified tests, transparent failure list, measured before/after numerical changes, and a new handover.
