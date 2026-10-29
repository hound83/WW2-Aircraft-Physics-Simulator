# European Air War — Clean Physics v2.0 — 26 October 2026

## Outcome

**Four aircraft now run through the same aerodynamic/propeller solver.** This step adds a directly documented Spitfire LF Mk IXc (A&AEE specimen **BS.543**, Merlin 66), tests a genuine lower-speed/turn shape, and introduces an **optional, sourced same-altitude engine-manifold-pressure correction**. The previous three aircraft and their working `C` propeller approximation remain unchanged. There is **no new global prop efficiency, lift, exhaust or drag cheat**.

The most important progress: the original 1943 RAF Spitfire report records manifold pressure both at maximum level speed and in the slower climb. The lower-speed MAP can differ significantly, especially above the engine's lower-airspeed full-throttle height. At **22,000 ft**, the report gives **+18.5 psi at 407 mph TAS, level** but **+13.8 psi at 225 mph TAS, climb**; replacing the unqualified level-speed chart horsepower with a proportional **absolute-MAP** estimate brings calculated climb from **4,166 to 3,360 ft/min** versus the **3,270 ft/min observed**. This is an actual, source-constrained discovery about power *at a specific speed* rather than an arbitrary power multiplier.

Across **15 of 16** A&AEE climb altitudes with pressure readings in both flight configurations:

| Test (same historical altitude and TAS) | MAE vs measured climb |
|---|---:|
| Original power assumed from maximum-speed condition | **376 ft/min** |
| Power corrected with source-observed climb boost | **97 ft/min** |
| Error reduction | **74%** |

The **14,000-ft** climb point has no matching documented high-gear maximum-speed boost in Table V and is excluded from the correction rather than imputed. The original 16 climb rates were **not** used to choose the correction or tune a propeller coefficient: they remain performance checks; the reported *boost pressures* at those 15 speeds are inputs.

### Differences between three kinds of evidence

1. **Primary original** (A&AEE 1943): Spitfire BS.543 flight TAS, the precise same specimen's level and climb MAP, reported mass, gear, prop model and RPM; 21 speeds, 16 climbs. Original transcript: <https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html>.
2. **Primary engine-rating points**, not a complete installed chart: Rolls-Royce Merlin 66 **1,705 BHP low gear / 5,750 ft**, **1,580 BHP high gear / 16,000 ft** at +18 PSI/3,000 RPM. Also published in the developer's IL-2 reference, but originally engine ratings. <https://www.wwiiaircraftperformance.org/Aircraft_Engines_of_the_World_Rolls-Royce_Merlin.pdf>. Our other engine power nodes remain **provisional**. At 0 ft, the nominal +18 **1,600 BHP** node is an assumption, NOT a report fact. The A&AEE level-speed critical heights **10,800 ft MS** and **22,000 ft FS** differ from the engine's bench rating heights because the airplane is flying quickly, gaining inlet dynamic pressure; the actual boost and power depend on flight regime.
3. **Secondary simulation sanity**: IL-2 **Mk IXe** Merlin 66 developer figures, **17.7 s at 270 km/h IAS sea level** and **20.5 s at 260 km/h IAS / 3,000 m** (<https://forum.il2sturmovik.com/topic/25993-aircraft-flight-and-technical-specifications-and-operational-details/>). DCS has an **LF Mk IX** module with standard-wing option and a published official flight manual (<https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-spitfire_flight_manual_en/>). No unverified numerical DCS turn values inserted.

## Historical configuration firewall

| Specific A&AEE BS.543 test | Maximum level flight | Climb |
|---|---|---|
| Mass used by published result | **7,110 lb** (normalized to 95% of takeoff) | **7,485 lb** takeoff mass |
| Radiator shutters | **Closed** | **Fully open** |
| Engine | Merlin 66, ~3000 rpm +18 psi | Merlin 66, 3000 rpm +18 maximum, may fall below target at altitude |
| Airspeed | TAS in Table V; measured IAS/PEC also printed | IAS and **TAS** both in Table II |
| Supercharger change | separate M.S./F.S. speed curves | changed at 13,000 ft |

The interactive default Spitfire speed polar is anchored at **7,110 lb**. The climb audit explicitly sets **7,485 lb**. The radiator-open additional drag **has not been measured** or introduced. At higher altitudes it can contribute to remaining residuals; it cannot be inferred uniquely from ROC alone because engine BHP and propeller losses are also uncertain. No category called “Spitfire turn fighter” exists in the physics engine.

## Unfitted original level-speed results

One anchor: **336 mph TAS sea level**, +18 psi MS, corrected to 7,110 lb.

The remaining **20 points** against the shared `C` heuristic/`e=.78` with explicitly provisional Merlin 66 BHP interpolation give **4.99 mph MAE**. This is a valuable result but the flight-test pressure, gear critical-altitude and slope observations partly inform the *estimated input power curve*. The speed outputs are **not fitted**; don't claim fully independent engine evidence. At 34,000 ft error approaches 11 mph; the high-altitude BHP shape, ram pressure, and propeller performance are priority unknowns.

## The new low-speed turn challenge

At the primary climb mass **7,485 lb**, and the current common `e=.78`, equating **IL-2 IAS to CAS provisionally**:

| Turn | IL-2 Mk IXe | Common `e=.78` model | Optional sim-conditioned e |
|---|---:|---:|---:|
| 0 m / 270 km/h IAS | **17.70 s** | **15.62 s** | **17.70 s** (one fitted) |
| 3,000 m / 260 km/h IAS | **20.50 s** | **18.42 s** | **20.90 s** (withheld) |

The optional `e≈0.6235` comes from just one **game** point at sea level, with the historical sea-level drag anchor re-derived for that e. The **0.40-second** 3,000-m miss is encouraging; it is *not* a measured Spitfire `e`, nor proof the airplane in the game has the original 1943 wing and mass. Original A&AEE BS.543 used **standard Mk Vc wings / 2 cannon + 4 machine guns**, while IL-2's comparison is **IXe**. IAS/CAS error at low speed and the source of actual `CLmax` remain unknown. Live UI does **not** silently turn on the game-conditioned `e`.

This is a more meaningful fourth-aircraft check than assigning a preset archetype: wing span/area, mass, power at speed and induced drag produce the turn behavior. Users can adjust e in the interactive chart and see tradeoffs on all four types.

## What was implemented

- `cases.json`: source-traceable historical **BS.543** fourth airframe, speed and climb data, exact historical 7,110 vs 7,485 lb conditions, four-blade Rotol geometry and reduction, 2 source-supported BHP critical points plus *flagged* inferred nodes, and source boost profile.
- `physics.js`: new **opt-in, generic** `shaftPowerAtMeasuredBoost(ac,alt,rating,gear,condition)`; `evaluated` accepts `engineCondition` only with source ID and valid source pressure. It scales BHP at constant RPM by `P_absolute,climb / P_absolute,level`, capped at 1. Previous calls cannot change.
- `spitfire_audit_v20.cjs`: exact primary level-speed holdouts and unfit climb-rate checks; compares recorded climb vs level boost at matching altitude/gear and reports J, Cp, heuristic η and inferred η budgets. Includes a **one-fit-one-hold** secondary IXe turning experiment.
- `spitfire_results_v20.json`: complete numerical results and provenance, including source status and explicitly missing rows.
- `plot_v20.py` → `four_aircraft_diagnostic_v20.png`: 4-panel, annotated analysis.
- `simulator_reference_spitfire_v20.json`: IL-2 IXe and DCS LF IX variant warnings and directly attributable references; old `simulator_reference_v18.json` untouched.
- `make_html_v20.py` → **`Universal_Four_Aircraft_Model_v2.0.html`**: four colored live cards, four overlaid charts, speed source selector for the actual Spitfire, new source-annotated panel, existing v1.9 and earlier diagnostics intact, fully self-contained/offline.
- `test_spitfire_v20.cjs` (11 tests) and `test_html_static_v20.cjs` (JS/JSON parsing of offline app) plus optional browser smoke `test_browser_v20.py`. The browser smoke may require optional Chromium/Playwright installation; static checks are self-contained.

## Deliberate stops / next physical improvements

1. **The next actual problem is speed-dependent installed shaft power:** source-identified inlet ram pressure and full-throttle / supercharger behavior between slow turn and max-speed flight. Spitfire high-altitude source supports a model or hypothesis. It **does not imply** the same large manifold-pressure drop at the **2,200-ft Mustang climb** where +67/+75 may already be fully attainable. Compare available original P-51 climb MAP before transferring anything.
2. **Propeller:** primary Hamilton Standard P-51B **K-6523A-24**, 11ft 2in, 4 blades; Rotol **RA10061**, 10ft 9in, 4 blades; Curtiss P-47B and VDM F-4 are not equivalent. Seek blade-angle/section/absorbed-power curves and evaluate actual **J/Cp/η**, rather than globally set η=0.85 or fit target climb outcomes. NACA method: <https://ntrs.nasa.gov/citations/19930093312> (1944 *Charts for Determining Propeller Efficiency*). The numerical installed maps **remain unavailable** in this version; working `C` is honestly labeled heuristic, `D` ideal-disk remains optional and unvalidated.
3. **Turn validation:** dedicated low-speed CAS/IAS corrections, `CLmax`/stall test and real aircraft sustained-turn measurements; compare DCS telemetry at controlled standard-wing, fuel mass/boost/altitude if found. A simulator's wing variant and IAS are not wartime flight-measured figures. Preserve 109F-4's earlier simulator-conditioned `e` and report it as such.

## Reproduce

Run from the working-model folder:

```bash
node spitfire_audit_v20.cjs --write
node test_spitfire_v20.cjs
node test_installed_power_v19.cjs
node test_html_static_v19.cjs
python plot_v20.py
python make_html_v20.py
node test_html_static_v20.cjs
```

**Bottom line:** the fourth aircraft exposed and quantified a genuine engine-at-speed effect and improved a full set of withheld historic climb rates without an arbitrary aerodynamic multiplier. The P-51 low-altitude residual and exact propeller-map reconstruction remain open; the new dataset lets us test them with more constraints.
