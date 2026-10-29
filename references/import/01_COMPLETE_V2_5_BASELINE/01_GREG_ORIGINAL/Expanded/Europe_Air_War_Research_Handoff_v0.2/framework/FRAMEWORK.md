# WWII Aircraft Performance Laboratory — implementation framework

Version 0.1, 26 October 2026. For the Europe Air War project. The existing Site was NOT changed.

## Core decision

Use one common physics engine, with AIRCRAFT-SPECIFIC aerodynamic and propulsion parameters. A fixed 95/5 or 93/7 parasite/induced drag percentage is invalid. Instead calculate each component for every speed, altitude, weight, load factor and configuration.

The reference aircraft is **P-51B-15-NA, serial 43-24777, tested 20 May 1944**. Contemporary USAAF reports supply the speed and engine-power points. Aerodynamic coefficients and propeller efficiency here are conspicuously **provisional assumptions**, not measured data for that serial.

## 1. Data needed and what to calculate

| Topic | Store as historical input | Derived result | Rule |
| --- | --- | --- | --- |
| Weight | Empty, test-point gross, fuel/oil/ammo/stores, CG | Current weight, wing loading, hp/weight | Varies during flight; preserve tested mass |
| Parasite drag | Whole-aircraft CD0 or equivalent flat-plate area, configuration increments, Mach/Re dependence | Parasite drag at every TAS/altitude | Not airfoil profile drag alone |
| Induced drag | Wing span/area, empirical polar/e or Oswald estimate, lift dependency | k CL squared; D induced at all speeds and G | Aircraft-specific k; no universal ratio |
| Horsepower | BHP-versus-altitude per RPM, boost, blower, fuel, duration | Power at selected altitude/mode | Never extrapolate through blower/critical-altitude gaps |
| Propeller | Manufacturer/model, diameter, blades, gearing, pitch, RPM, Ct/Cp or eta map | Advance ratio, installed efficiency and useful thrust power | Generic eta only with D-grade warning |
| Airfoils | Wing-section data by station, twist, flaps, NACA section reports | CL(alpha), stall and Mach trends | 2D section CD is not aircraft CD0 |
| Wing geometry | S, span b, AR, MAC, taper, sweep, controls | q, CL, wing loading, induced factor | Mandatory |
| Climb | Historical ROC-altitude/speed, time-to-height, power/radiator conditions | Ps, best climb speed, ROC, climb time | Historical curve remains a separate validation source |
| Power/weight | Installed shaft BHP(h), test weight | BHP/lb, eta BHP/lb, excess power per unit weight | Show engine vs propulsive power separately |

Historical Greg example (1,137 lb parasite plus 81 lb induced at 325 mph) illustrates one condition ONLY. We must derive the varying ratio, not enter its 93.3%/6.7% proportions as universal constants.

## 2. Database/entities

1. AircraftFamily: type/role/manufacturer/nation; never use a whole family as a single performance identity.
2. Variant: subtype, block, serial/modification range, engine/prop fit, service date.
3. AirframeGeometry: span, wing area, MAC, aspect ratio, twist, airfoil sections, controls, cooling and configuration.
4. WeightState: basic empty, military load, fuel, ammunition, tanks, bombs/racks, CG, source test weight.
5. EngineInstallation: engine subtype, manifold pressure units, RPM, supercharger gear/stage, engine chart, fuel grade, approved period, temperature/time restrictions.
6. PowerCurve: list of altitude/BHP points BY rating and gear, with critical-height and gear-shift annotations.
7. PropellerMap: prop type and installed efficiency versus advance ratio J, pitch, RPM, Mach/tip effects (or labeled provisional map).
8. AerodynamicPolar: CD(CL,Mach,Re,configuration), CD0, k/e, CLmax, stall/buffet/dive boundaries, cooling/external-drag corrections.
9. HandlingEnvelope: structural G, IAS/CAS corrections, roll/control-force curves, stability and high-Mach limits.
10. TestObservation: original measured or manufacturer-calculated speed/ROC/turn/stall/power point, test condition, source and units.
11. FlightScenario: h, TAS, weather, selected mode, fuel/stores/ammo and boost elapsed time.
12. CalculatedPoint: all Greg fields and modeled energy/turn output, linked to source and assumption IDs.
13. ValidationRun: model version, exact test comparisons, residuals, hold-outs, input assumptions and limitations.

Each data point needs value, unit, document title/report number, page/figure, original quoted condition, serial, date, setting, weight, configuration, measured-or-calculated classification, quality grade and uncertainty. A source can contain both measured speed (A) and power derived from engine charts (B).

Quality scale: A original measurements; B historical official/manufacturer calculation; C calibrated reconstruction; D estimate/engineering prior/secondary; UNKNOWN insufficient evidence. Never convert UNKNOWN to zero.

Compatibility key for combining data: variant + serial applicability + engine + propeller + modifications + loading + radiator/stores + engine setting + date. NACA P-51B-1 experiments conducted **without a propeller** are not direct drag measurements of powered P-51B-15 serial 43-24777.

## 3. Common calculation pipeline

Use SI internally, aviation units at display/input boundary.

1. ISA atmosphere at altitude: density rho, pressure, temperature, speed of sound. TAS versus equivalent speed EAS = TAS sqrt(rho/rho0). IAS requires instrument/position calibration; do not quietly treat IAS as EAS.
2. Geometry: S, b, AR=b²/S, k=1/(pi AR e), W as FORCE in newtons. Dynamic pressure q=0.5 rho V².
3. Lift coefficient in quasi-steady maneuver: CL=nW/(qS), subject to CLmax and structural/control bounds.
4. First-order drag polar: CD=CD0(Mach,Re,configuration)+k CL²+DeltaCDwave. This quadratic polar is an approximation for the studied regime, not an exact universal law.
5. Dparasite=qS CD0; Dinduced=qS kCL²; Dother=qS DeltaCDwave; Dtotal=sum. Component percentages computed from forces.
6. BHP(h,rating,gear,RPM,fuel). Propeller advance ratio J=V/(nprop Dprop), efficiency eta=J Ct/Cp when data exist. Useful propulsive power Pav=eta Pshaft. Aerodynamic required power Preq=Dtotal V; required SHAFT power=Preq/eta.
7. Specific excess power Ps=(Pav-Preq)/W; approximated constant-speed ROC=Ps, while Vx maximizes excess thrust and Vy maximizes excess power. Integrate dt=dh/ROC for climb time using consistent power/gear/mass.
8. Approximate level acceleration a=(Pav-DV)/(mV). In combined climb/speed change: Ps=dh/dt+(V/g)(dV/dt).
9. Instantaneous turn: ninst=min(qS CLmax/W, structural/control limit). Coordinated level turn omega=g sqrt(n²-1)/V and radius=V²/[g sqrt(n²-1)]. Sustained load factor solves Pav=D(n)V, capped by ninst. If straight level flight is unsustainable, output 'not available'.
10. High-Mach, Reynolds, radiator, roughness and propwash effects require their own evidence-backed functions, not a generic fudge factor.

Full Greg-style row **per speed**: altitude, TAS, EAS, Mach, temperature, rho, q, W, S, wing loading, power loading, mode/gear/boost/RPM/BHP, prop eta, useful power, CL, CD0/CDinduced/CDother/CDtotal, parasite/induced/other/total drag, percent shares, L/D, required shaft/propulsive HP, excess power, Ps, ROC, level acceleration, stall margin, instant/sustained G, turn rate/radius, source/quality tags.

## 4. All four phases: inputs, outputs, gates

### Phase 1 — Historical foundations (reference DATA implemented)

Input exact variant, source snapshots, engine and prop, geometry, weight, altitude/power charts, flight-test measurements. Output source specification, speed-altitude comparison, BHP(h) and hp/weight(h). Acceptance: no invented power outside measured gear/rating interval, documented serial/config, valid units, rating-date compatibility.

Reference aircraft: 43-24777, P-51B-15, Packard V-1650-7, four-blade Hamilton Standard Hydromatic, 233 ft² wing, 37-ft span, 9,335-lb test takeoff mass, 9,240-lb corrected test weight at 22,400 ft, wing racks installed. At 20,800 ft high blower: 67 inHg gives 1,390 BHP and 417 mph; 75 inHg gives 1,572 BHP and 431 mph. The 75-inHg rating was **proposed/tested** on 44-1 fuel, not automatically frontline-approved on all P-51Bs.

### Phase 2 — Greg-level aerodynamics (first-order kernel implemented)

Input drag-polar coefficients, speed/alt prop efficiency, source power curve, configuration, mass. Output speed sweep, drag breakdown, power curves, Vmax, approximate climb and acceleration. Acceptance: Dparasite grows ~V² and Dinduced falls ~1/V² under 1g subcritical assumptions; power/work units correct; use measured points only within their documented conditions; any calibrated anchor is NOT independent validation.

Reference uses CD0=0.016, e=0.8, eta=0.80, CLmax=1.6. **All are provisional D-grade**. Historical NACA P-51B-1 drag curves guide research methodology but cannot be copied as measured values of this other aircraft. Constant prop efficiency is a temporary simplification only.

### Phase 3 — Energy and maneuverability (algorithm scaffold implemented; historical envelopes missing)

Need source CLmax(alpha,Mach), control-force and roll tests, G/IAS/Mach limits, full polar. Compute ninstant, nsustain, corner speed, omega, radius, acceleration, Ps diagrams, dive/zoom trajectory. Acceptance: sustained turn cannot exceed instant envelope; no turns beyond stall/structure; show incomplete envelope as incomplete. The sample 6G structural bound is **scenario-only**, not sourced P-51B history.

### Phase 4 — Operational realism (mass scenario implemented; detailed limits remain missing)

Need mode-dependent fuel-flow maps, emergency power duration and cooldown, temperatures/radiator dynamics, ammunition/stores mass/drag, date-specific permissions, weather. Calculate mass/fuel update, endurance/range, WEP timer, cooling drag and jettison effects, stateful maneuver/combat timeline. Acceptance: no invented emergency duration, no negative fuel, deterministic mass bookkeeping, unknown mode not used. Reference includes only user-specified fuel burned and a provisional 6 lb per US gallon conversion; it does **not** invent fuel flow, cooling or thermals.

## 5. Worked P-51B-15 quantitative outputs

Actual 67-inHg maximum speeds versus the provisional model at *constant 9,240 lb* (historical weight varied, so not an exact condition match):

| Height ft | Gear | Observed mph TAS | Model mph TAS | Model minus observed |
| ---: | :--- | ---: | ---: | ---: |
| 0 | Low | 361.5 | 360.7 | -0.8 |
| 4,000 | Low | 380.0 | 378.2 | -1.8 |
| 7,400 | Low | 395.5 | 394.1 | -1.4 |
| 10,300 | Low | 409.0 | 408.7 | -0.3 |
| 18,000 | High | 408.0 | 410.4 | +2.4 |
| 20,800 | High | 417.0 | 422.5 | +5.5 |
| 24,000 | High | 426.0 | 437.0 | +11.0 |
| 28,000 | High | 419.0 | 429.5 | +10.5 |
| 32,000 | High | 410.0 | 419.8 | +9.8 |

The low-altitude agreement is **calibration**, not independent proof. Upper-altitude overprediction remains visible: full propeller-efficiency and aerodynamic altitude/Mach dependencies need investigation.

At 2,200 ft the USAAF reported max climb 3,820 ft/min (67 inHg) and 4,380 ft/min (proposed 75 inHg); illustrative model about 3,642 and 4,237 ft/min respectively. Do not interpret the small ROC residual as validation of the model's predicted Vy (140 mph TAS), which is NOT yet source-tested.

Illustrative Greg speed sweep at **22,400 ft, 9,240 lb**, calculated from the model, NOT drag-force flight measurements:

| TAS mph | Parasite lb | Induced lb | Parasite share | Required shaft hp |
| ---: | ---: | ---: | ---: | ---: |
| 150 | 105 | 879 | 11% | 492 |
| 200 | 187 | 494 | 27% | 454 |
| 250 | 292 | 316 | 48% | 507 |
| 300 | 421 | 220 | 66% | 641 |
| 350 | 573 | 162 | 78% | 857 |
| 400 | 748 | 124 | 86% | 1,163 |
| 425 | 845 | 109 | 89% | 1,352 |

The changing shares answer the 'golden number' question. The 150-mph point is near the **illustrative** stall boundary, so its fidelity especially needs CLmax/IAS calibration.

## 6. NACA research checked

- NACA ACR 4K02 (W. T. Hamilton, February 1945): correlation of P-51B-1 drag from propeller-off dives and high-speed wind tunnel. Figures 9–15 chart CD(CL,Mach); measured dust/roughness affected minimum drag. These historical tests show why one CD0 is only a local approximation, why CL/Mach/Re matter, and why installation/condition differences matter.
- NACA Report 824 (Abbott, Von Doenhoff, Stivers, 1945): airfoil-section lift/drag behavior and Reynolds effects; use for section priors, not a complete airplane's parasite drag.
- NACA TN-484 (Hartman, 1934): controllable-propeller operating behavior; reinforces the need for installed eta maps instead of universal constant.
- USAAF flight-test memorandum Eng-47-1715-A (20 May 1944): original 43-24777 speed, engine, gear, weight, stall and power-required chart at 22,400 ft.
- Wartime USAAF 'Power Required and Power Available for P-51A, P-51B and P-47B': additional historical power-curve crosscheck.

Primary document and hosted-report links:

https://ntrs.nasa.gov/citations/19930092458

https://ntrs.nasa.gov/api/citations/19930090976/downloads/19930090976.pdf

https://ntrs.nasa.gov/citations/19930081396

https://www.wwiiaircraftperformance.org/mustang/p51b-24777.html

https://www.wwiiaircraftperformance.org/mustang/P-51B_24777_Power_Required.jpg

https://www.wwiiaircraftperformance.org/mustang/Power_required_available_P-51A_P-51B_P-47B.pdf

## 7. Next calibration tasks before production use

1. Accurately digitize the USAAF 22,400-ft **power required versus TAS** curve with uncertainty; hold out some points for independent validation.
2. Locate Hamilton Standard propeller Ct/Cp/eta data and Packard installed shaft-power maps, including blower changes, RPM/pitch/tip-Mach boundaries.
3. Derive the local drag polar from multiple speed/power observations; use NACA P-51B-1 CD(CL,Mach) only as explicitly identified proxy, not same-aircraft truth.
4. Digitize historical climb-speed, ROC, time-to-altitude, radiator settings, weight change; compare predicted Vy and ROC separately.
5. Recover P-51B-15 airfoil/wing CLmax and calibrated CAS/EAS, structural/control limits, and roll-rate-vs-IAS.
6. Research source-backed fuel flow, WEP time/temperature limits and operational availability of 75-inHg fuel/boost.
7. Run falsifiable validation: at least three independent performance observations per power/configuration before quality upgrades. Preserve residuals and source-quality badges in the UI.

For all later aircraft, inherit the equations and source schema, **never the P-51B coefficients**. German ata, British boost in lb/in² and American manifold inHg are normalized by unit conversion with original reported values retained. Jets/rockets need a separate thrust model.

## 8. Files and execution

- p51b15.json: serial-specific historical power/speed nodes and D-grade assumptions, clearly annotated.
- aircraft.schema.json: machine-readable starter contract for additional variants (expand evidence per-point in production).
- performance_engine.mjs: ES-module reference engine (ISA, interpolation, BHP(h), drag/power, max speed, best climb, turn, time to climb, mass state).
- demo.mjs: produces two comparison tables and a multi-speed Greg-style sweep.
- test.mjs: verifies interpolation boundaries, drag trends, energy consistency, published anchor residuals, boost, turns, scenario weight and unsupported-data refusal.

Run in Node 20+: 'node test.mjs' and 'node demo.mjs'.

**Honesty boundary:** first-order example, not certified flight mechanics, not yet a historical turn or fuel/thermal model, no fully characterized propeller. Missing values remain missing. The operational Europe Air War Site remains untouched.
