# EUROPE AIR WAR — AIRCRAFT PHYSICS & HISTORICAL DATA HANDOFF

**Handoff release v0.2 — 26 October 2026**

This is a self-contained transfer of the data-modeling work from a separate ChatGPT research conversation into the main **Europe Air War simulator / version 7.5** conversation. **The actual simulator website / Site source code is NOT in this package and has NOT been modified by this work.** The recipient should combine this package with the existing simulator project already present in that other chat.

## Open these files in order

1. **`visuals/P51B_Greg_Complete_Table_Visual.png`** — readable 46-field Greg-style example showing eleven P-51B speeds at 20,800 feet. A visual guide to the exact outputs desired in the tool.
2. **`data/WWII_Aircraft_Complete_Data_Table_v0.2.xlsx`** — main deliverable with all **142 aircraft/physics/source fields** in `Full Field Inventory`; a live-formula `Greg Speed Table` containing **46 fields × 66 speed/altitude/power-mode cases**, plus historical power data, test validation, editable assumptions, references/gaps. Six worksheets total.
3. **`framework/FRAMEWORK.md`** — full four-phase architecture, mathematical methods, historical data, calibration residuals, NACA report references, and next source-research gates.
4. **`framework/p51b15.json`** and **`framework/aircraft.schema.json`** — one historically grounded variant and general source schema.
5. **`framework/performance_engine.mjs`** — runnable JavaScript reference computation engine; `test.mjs` and `demo.mjs` show use. Tests passed in the source environment.
6. **`PASTE_IN_OTHER_CHAT.md`** — a convenient task handoff to paste together with the ZIP attachment into the Europe Air War conversation.
7. **`tools/render_greg_table.py`** — optional reproducible renderer for the pictured table; reads the workbook's cached values and requires Python with `openpyxl` and `Pillow` to rerender the poster. It does not change the workbook.

## The key decision

One common physics engine; **aircraft- and variant-specific data**. Never bake one fixed parasite/induced drag ratio into the simulator. Compute both at every speed/altitude/weight/load factor. Likewise never assume one universal propeller efficiency or one universal horsepower curve: rated shaft power must vary by altitude, blower gear, RPM and boost, and historical service authorization.

Greg's quoted example of 1,137 lb parasite versus 81 lb induced drag at 325 mph represents **a single speed/condition**, not an aircraft-independent 93/7 split. This package models the full speed dependence.

## Four-phase plan and actual state

| Phase | Intended scope | What is actually implemented here | Still missing / not validated |
|---|---|---|---|
| **1. Historical foundations** | Exact variants, sources, geometry, weight, engine rating/gear/boost/altitude, historical performance | P-51B-15-NA serial 43-24777 geometry, 16 reported power nodes, flight-test observations and source tags | Detailed installation maps, many configurations, more aircraft, serial/date-specific rating permissions |
| **2. Greg-style aerodynamics** | Speed sweeps with parasite/induced/wave/cooling drag, propulsive power, excess power, Vmax, climb | The 46-column/66-row workbook; executable first-order engine and one attractive readable reference picture | Original whole-plane drag polars and installed propeller eta maps; Mach/Re/cooling dependencies; more historical validation |
| **3. Energy/maneuverability** | Ps, acceleration, sustained/instantaneous turns, G, stall, roll, dive, corner speed | Preliminary Ps/ROC/acceleration/G/turn calculations and code/tests | Measured CLmax and IAS–EAS calibration, actual structural/control limits, roll-rate curve, compressibility/handling, trajectory model |
| **4. Operational realism** | Fuel burn, changing weight/CG, ammunition/stores/radiator/boost timers, temperature, service dates | Starter changing-mass scenario in reference engine | Actual fuel-flow charts, thermal/duration limits, stores and radiator drag, authorization by variant/time, weather |

## Historical source vs model estimate — DO NOT BLUR

Reference: **P-51B-15-NA, s/n 43-24777**, USAAF test 20 May 1944, Packard **V-1650-7**, Hamilton Standard Hydromatic propeller.

Historical figures include 233 ft² wing, 37-ft span, reported 9,335 lb takeoff and 9,240 lb corrected weight at 22,400 ft, 67 inHg/high blower **1,390 BHP / 417 mph at 20,800 ft**, with proposed/tested 75 inHg, 1,572 BHP / 431 mph. 75 inHg is **not automatically frontline-approved**; respect period, fuel grade, theater and engine installation.

The following are **D-grade temporary assumptions**, not sourced measurements of this aircraft: whole-airplane `CD0 = 0.016`, Oswald `e = 0.80`, propeller `eta = 0.80`, clean `CLmax = 1.60`, illustrative six-G structural cap, zero added Mach/radiator/store drag in the sample kernel. Replace each with flight-test/NACA/manufacturer evidence. Other models must **never inherit these as factual values**.

The P-51B model's low-altitude speed fit is close, but it overpredicts measured maximum speeds by about **5–11 mph at high altitude**. This is calibration, not independent validation. The 130 mph / 20,800 ft reference-table column lies **below the modeled stall boundary**; its calculated climb/turn figures are not physically usable.

NACA P-51B-1 drag research was in a different variant/configuration with **propeller removed**, and is not directly transferable as measured P-51B-15 powered drag. NACA 824 airfoil data likewise describe sections, not full-aircraft parasite drag. Citations and URLs are in `framework/FRAMEWORK.md` and the spreadsheet `Sources and Gaps` tab.

## Key equations

Use SI internally and convert for display:

```text
q = 0.5 * rho * TAS^2
AR = span^2 / wing_area
k = 1 / (pi * AR * Oswald_e)
CL = load_factor * weight_force / (q * wing_area)
CD = CD0 + k * CL^2 + CD_wave + CD_configuration
D_parasite = q * wing_area * CD0
D_induced = q * wing_area * k * CL^2
D_total = D_parasite + D_induced + D_other
P_propulsive_available = eta_prop * P_shaft_available(alt, boost, rpm, gear)
P_required_propulsive = D_total * TAS
P_excess = P_propulsive_available - P_required_propulsive
specific_excess_power = P_excess / weight_force
approx_steady_ROC = specific_excess_power
level_acceleration = P_excess / (mass * TAS)
instantaneous_n = min(q * S * CLmax / W, structural_and_control_limits)
sustained_n = highest n <= instantaneous_n with available_power >= turn_power_required
turn_rate_rad_s = g * sqrt(n^2 - 1) / TAS
turn_radius_m = TAS^2 / (g * sqrt(n^2 - 1))
```

Outside the modeled stall, operating, power and compressibility limits, output **not valid / unavailable** rather than displaying nonsensical values as achieved performance.

## Integration checklist for the existing simulator

- Add a source-aware, variant-specific data layer; keep unknown separate from zero.
- Reuse the first-order engine as **reference logic**, not a validated final solver. Add power/drag/prop configuration and weather dependence with uncertainty.
- Populate **all relevant aircraft models** progressively, not only P-47 and Bf 109. Distinguish service variants, engines, altitude performance, emergency ratings, propellers, and configurations.
- Build altitude, true/indicated/equivalent speed, weight, boost/rating, blower, stores, and maneuver-load controls; changing altitude MUST recalculate both available engine power and drag.
- Show Greg-style drag split, available/required/excess horsepower, Ps/climb and turn envelopes; let users inspect source/quality for every coefficient/output.
- Never silently promote D-grade assumptions to measured historical facts. Display residuals against independently observed speed/climb data.
- Ensure the existing UI/design, aircraft pictures, aircraft selection and other tabs remain intact while incrementally integrating these calculations.

## Running the reference engine

Requirements: Node.js 20 or newer. No npm install necessary.

```bash
cd framework
node test.mjs
node demo.mjs
```

The accompanying Excel formulas can be edited, but the sampled historical **BHP node in each speed row is a snapshot**. If manually changing altitude in the workbook, refresh/recalculate the correct node via the JS engine; the spreadsheet formula does not automatically requery the engine map.

## Scope boundary

This ZIP includes everything **created in this research/data conversation** needed to transfer the model/table into the other chat: workbook, visualization, full framework, source URLs, data schema, example aircraft, calculation engine and tests. It does **not** contain the live Europe Air War Site, its database, or the other chat's entire previous correspondence.

