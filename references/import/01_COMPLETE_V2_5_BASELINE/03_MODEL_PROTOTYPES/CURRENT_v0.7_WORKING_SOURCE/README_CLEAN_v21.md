# European Air War — Clean Physics v2.1 — 26 October 2026

## Outcome: a working speed-dependent installed-power model

**Open `Universal_Four_Aircraft_Model_v2.1.html` for the complete offline interactive prototype.** Use the new **Engine power versus airspeed** selector. The v2.0 charted-shaft-power behavior remains default; v2.1 **Predictive inlet ram** is optional for the P-51B-15, Bf 109 F-4 and Spitfire LF IXc. P-47B remains on the v2.0 turbo-power chart; we do not impose a mechanical two-speed-supercharger formula on its turbocharger. The four aircraft still use shared lift/drag, propeller and excess-power equations.

**What changed:** Instead of reading RAF climb manifold pressure as an input, the solver now *predicts* it from historically identified full-throttle altitude, airspeed and MAP points. We use ISA pressure, Mach number, an ideal-recovery ram pressure `p0 = p(1 + 0.2 M²)^3.5`, a MAP regulator, and a provisional fixed-RPM linear relationship between absolute MAP and BHP. When the pressure regulator can hold requested MAP, chart horsepower is unchanged. When unable, BHP is reduced relative to the **sourced maximum-level-speed condition**, or to an explicitly recorded **rated-MAP engine chart** if no same-altitude level-speed anchor is available. No aerodynamic penalty or low-speed propeller multiplier was fitted to climb targets.

The **intake-pressure recovery parameter = 1.0 is an ideal upper bound**, not measured efficiency. Recovery 0.7 and 0.0 are sensitivity controls, not alternate source measurements. The ratio across the two flight states partially cancels the unknown blower capacity but **cannot reconstruct** its full RPM/compression map. The P-51 and F-4 turn/flight-specific MAP predictions are still provisional.

## Hard numeric checks, no new drag or prop coefficients

| Check | Original chart power / target | v2.1 predictive power / target | What it establishes |
|---|---:|---:|---|
| Spitfire A&AEE BS.543 manifold pressure, 16 climb TAS/altitude nodes | Historical measured pressures withheld | **0.42 psi mean absolute difference** | Independent pressure prediction at *climb* speed, from original max-level critical points |
| Spitfire original 16 steady-climb results | **365 ft/min MAE** | **139 ft/min MAE** | **62% lower climb error** without reading climb MAP |
| Spitfire measured original level-speed points, outside initial sea-level CD₀ fit | Existing level-speed model | **5.22 mph MAE** | Preserves the original speed scale; engine inputs are not wholly independent of speed points |
| P-51B-15 43-24777 2,200-ft 67 inHg ROC | Historical **3,820 ft/min** | **3,401 ft/min** modeled best climb | Deficit **419 ft/min**; boost remains regulated at illustrative 195 mph TAS |
| P-51B-15 43-24777 2,200-ft 75 inHg ROC | Historical **4,380 ft/min** | **3,979 ft/min** modeled best climb | Deficit **401 ft/min**; boost remains regulated at illustrative 195 mph TAS |
| Bf 109 F-4 IL-2 emergency 270 km/h IAS turns | IL-2 **20.3 s** at sea level, **26.1 s** at 3,000 m | Model **20.34 s** and **25.95 s** | Low-alt turn result essentially unchanged: full MAP at both conditions |

**Comparability warnings:** The USAAF Mustang report states a **9,335-lb takeoff mass**, used throughout the modeled best-climb comparison; the precise instant mass at 2,200 ft and historical climb TAS are **not published** in the report text. The Mustang's approx. 400 fpm residual corresponds to **113–118 hp additional *useful excess power*** at this assumed weight. It cannot by itself identify whether shaft BHP, cooling/airframe drag, actual weight, the climb airspeed, or propulsive efficiency accounts for the discrepancy. The F-4 `e≈0.54698` in this turn check is explicitly **simulator-conditioned**, not measured Oswald efficiency. Its 270 km/h **IAS≈CAS** convention is an explicit approximation.

### Especially important: P-51B's two different full-throttle altitudes

From the **same May 20, 1944 USAAF report**, P-51B-15 43-24777, with 75 inHg at 3,000 rpm:

- **In climb**, low-blower critical altitude **2,200 ft**; the recorded climb at this height was **4,380 ft/min**.
- **In fast level flight**, low-blower critical altitude **7,400 ft**. The extra airspeed gives intake ram pressure, enabling rated MAP higher up.
- The report's table **inconsistently prints 395.5 mph for *both* 67 and 75 inHg at 7,400 ft**, even though its written conclusion claims **+16 mph** for 75 inHg over 67 through this height. This version assumes **411.5 mph = 395.5 + 16**, explicitly marked as an *inferred input* rather than a directly measured level speed. Any P-51 ram sensitivity relying on it is therefore lower-confidence.
- **The 67/75-inHg climb rates are not model calibration inputs.** We use them only as independent targets at the report's original rating and nominal weight.

This is why simply reducing Mustang power at low speed to correct the remaining climb discrepancy would be physically suspect: the original **climb-critical height** is exactly the test altitude. Any proposed loss must be backed by aircraft-specific climb MAP, propeller data or other evidence; it must not be copied over from the Spitfire's **22,000-ft** full-throttle-limited climb.

## Source hierarchy and aircraft-specific limits

1. **Primary RAF 1943**, original A&AEE Spitfire **BS.543** same airframe, original level and climb TAS and manifold-pressure tables: <https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html>. Crucially, original measured climb MAP is **withheld** from predictive model, used only for audit. **Climb radiator shutters fully open vs level speed shutters closed**; this remaining configuration-dependent drag is not newly fitted.
2. **Primary USAAF May 20, 1944**, original P-51B-15 **43-24777** <https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html>. Source gives propeller **Hamilton Standard K-6523A-24**, 11 ft 2 in, and Packard motor-chart power. The independent **P-51B-1 43-12093** 1943 experiment maintained commanded MAP at several low-altitude climb heights: <https://www.wwiiaircraftperformance.com/org/p-51/mustangtest.html>. That second airframe is a *qualitative pressure-regulation check*, **not mixed into the B-15 power curve**.
3. **Secondary simulator, not period measurement:** [IL-2 Bf 109 F-4 developer data](https://il2sturmovik.com/museum/fighters/bf-109-f-4/) gives 270 km/h IAS turn times at both altitudes and F-4 boost/rpm operating modes. The IL-2 source is an excellent sanity check but is insufficient to establish actual DB 601E intake recovery or wartime Oswald factor. DCS aircraft variants remain explicitly separated; there is no numerical DCS telemetry masquerading as a primary flight test.
4. **Propellers:** [NACA original 1944 *Charts for Determining Propeller Efficiency*](https://ntrs.nasa.gov/citations/19930093312) provides a general calculation method, **not** installed airframe maps for K-6523A-24 (P-51), Rotol RA10061 (Spitfire), or VDM (F-4). The propeller `C` mode is the existing **heuristic**, and its low-speed accuracy remains unproven. The P-47B turbo installation must also be researched separately, not generalized.

## Files and reproducibility

- `physics.js`, `cases.json`: generic speed-dependent installed engine calculation and explicitly caveated critical-source inputs; original v2.0 default behavior preserved.
- `ram_predictive_audit_v21.cjs` → `ram_predictive_results_v21.json`: no measured climb MAP used as input; Spitfire, P-51 and IL-2 109 comparisons, speed sensitivity and provenance.
- `plot_v21.py` → `predictive_installed_power_v21.png`: four-panel scientific diagnostic.
- `make_html_v21.py` → `Universal_Four_Aircraft_Model_v2.1.html`: self-contained HTML with a working power-model toggle, historical comparison tables, and the new graph. Prior version diagnostics are retained.
- `test_ram_predictive_v21.cjs`, `test_html_static_v21.cjs`: new automated validation. **All 23 historical/regression test files pass** in the current source folder.
- Historical original source documents, Greg's untouched files, earlier prototypes, source concordance and earlier releases remain in the full handover archive.

From `03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/`:

```bash
node ram_predictive_audit_v21.cjs --write
python3 plot_v21.py
python3 make_html_v21.py
node test_ram_predictive_v21.cjs
node test_html_static_v21.cjs
```

## Next narrow target (not a new multi-month research detour)

Quantify the **P-51B-15 missing 113–118 useful hp** across low-speed and altitude using the *same aircraft, mass, propeller and cooling configuration*. Prioritize an actual period propeller efficiency / installed thrust curve, plus shaft power and radiator drag at the historical climb state. Only alter parameters when independent evidence supports them. In parallel, verify the F-4 simulator-conditioned turning factor with a truly withheld turn datum or relevant original source. Keep the Spitfire as the fourth, substantially different aerodynamic sanity check.
