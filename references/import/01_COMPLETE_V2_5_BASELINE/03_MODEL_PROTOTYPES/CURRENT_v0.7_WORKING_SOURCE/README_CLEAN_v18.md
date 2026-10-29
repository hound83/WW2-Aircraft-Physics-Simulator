# European Air War — Clean Physics v1.8 handover

**2026-10-26 · working physics default: C · candidate D: rejected as default**

The goal is still the same: derive plausible, reproducible WWII fighter speed, climb, excess power and sustained-turn behavior from a **shared physical solver**, and match independent historical evidence **without aircraft-specific magic constants**. v1.8 advances that goal in three respects:

1. Implements an opt-in, physically interpretable **ideal momentum-disk propeller** trial (D) in the same `physics.js` source, with no bespoke P-51 or Bf 109 multiplier.
2. Benchmarks D against the original P-47B and P-51B wartime data and against the F-4's clearly marked IL-2 **simulator** turn checkpoints. **C remains default** because D makes the two wartime speed holdouts and the Mustang absolute climb worse.
3. Establishes a machine-readable and human-readable cross-simulator comparison for **IL-2 P-47D-28, P-51B-5/V-1650-7 and P-51D-15**, and **DCS P-47D-30 and P-51D**. The variant, rating, mass, altitude and IAS/TAS mismatches are recorded rather than hidden.

## Start here

1. Open `Universal_Three_Aircraft_Model_v1.8.html` in a browser **offline**. The landing controls still default to working profile **C**; candidate **D** can be selected (automatically reanchors parasite drag to the same original speed-test anchor).
2. Read the top `v1.8` section: complete comparison table plus the 4-panel `prop_sim_diagnostic_v18.png` scientific chart.
3. Reproduce calculations with `node prop_sim_sanity_v18.cjs --write`; run verification with `node test_prop_sim_v18.cjs` and all prior regression tests. The JSON reference input and result output are both included.

## Same-aircraft historical validation — absolute outputs

These numbers use each plane's *actual existing* case definition, not an imagined P-47D or P-51D populated using a P-47B or B-15 engine.

| Independent check | Historical evidence | Working C | D physical trial | Interpretation |
|---|---:|---:|---:|---|
| P-47B level-speed holdouts (five) | 1940s Wright Field | 3.65 mph MAE | 10.70 mph MAE | D is worse |
| P-51B-15 level-speed holdouts (eight at 67 inHg) | 1940s Wright Field | 2.61 mph MAE | 5.92 mph MAE | D is worse |
| P-51B original Fig. 5 power-required markers (four low/mid) | Chart source, approx ±35 bhp reading | 88.6 bhp MAE | 60.7 bhp MAE | D improves *one* independent-speed-range constraint |
| P-51B climb, 2,200 ft, 67 inHg | **3,820 ft/min** | **3,401 ft/min** | **3,380 ft/min** | D worse; still 440 ft/min short |
| P-51B climb, 2,200 ft, 75 inHg | **4,380 ft/min** | **3,979 ft/min** | **3,917 ft/min** | D worse; still 463 ft/min short |
| Bf 109F-4 270 km/h *IAS*, sea level, WEP | **20.30 s IL-2 game** | 20.30 s | 20.43 s | C is *calibrated to this simulator row* through e, NOT independently proven |
| Bf 109F-4 270 km/h *IAS*, 3,000 m, WEP | **26.10 s IL-2 game** | 25.89 s | 26.30 s | Withheld simulator holdout; IAS modeled as CAS proxy |

The Bf 109 F-4's **e = 0.54698 is a simulator-conditioned parameter** fitted at sea level by v1.7; it is **not** a measured historical Oswald efficiency. v1.8 freezes that parameter for the C/D experiment; it is not fitted again for D. The original Greg-derived e≈0.55767 remains a separate worksheet-derived comparator. The wide generic e=0.78 vs .55 turn spread should *not* be advertised as a realistic range of distinct real-airframe performance.

## Newly captured IL-2 and DCS secondary benchmarks

Numbers taken as published by the simulator developer or tester. Original reports remain the stronger historical controls. "Turn" always records IAS conditions; "top speed" TAS and sea-level unless stated.

| Simulator / aircraft | Rating | Published reference mass | SL max TAS | SL climb | SL sustained 360° turn |
|---|---|---:|---:|---:|---:|
| **IL-2 P-47D-28** | 64 inHg / 2,600 hp WEP | 6,503 kg / 14,337 lb (50% fuel) | 557 km/h / 346.1 mph | 18.1 m/s / 3,563 ft/min | 27.5 s at 322 km/h IAS |
| **IL-2 P-51B-5 V-1650-7** | 67 inHg / 1,650 hp WEP | 4,389 kg / 9,676 lb (68% fuel) | 604 km/h / 375.3 mph | 19.3 m/s / 3,799 ft/min | 19.0 s at 290 km/h IAS |
| **IL-2 P-51D-15** | WEP | Not transcribed | 592 km/h / 367.9 mph | 18.1 m/s / 3,563 ft/min | 20.0 s at 290 km/h IAS |
| **DCS P-51D** (player E-M plot, 2022) | Full power, exact MAP not documented | 4,331 kg / 9,548 lb | Not in E-M plot | 47 ft/s / 2,820 ft/min | **17.0°/s** = **21.18 s** at **132 knots IAS** |
| **DCS P-51D** (player test, 2020) | 67 inHg / 3,000 rpm | 50% fuel, mass not supplied | 592 km/h / 367.9 mph | Not supplied | Not supplied |
| **DCS P-47D-30** (player test, 2020) | **71 inHg / 2,700 rpm** | 50% fuel, mass not supplied | 615 km/h / 382.1 mph | Not supplied | Not supplied |

**High-value sanity checks and strict limitations:**

- Both IL-2's P-51D-15 developer data and the 2020 DCS player's P-51D 67-inHg run report **592 km/h** sea-level speed. Interesting agreement, **not matched testing**; version/temperature/fuel conditions differ.
- IL-2 P-47D-28 **557 km/h at 64 inHg** roughly agrees with **~345 mph (~555 km/h)** for a historical P-47D-30 in a DCS developer's historical source table, *not a measured DCS game output*.
- The 2020 DCS P-47D-30 615 km/h was at **71 inHg**. Comparing it to IL-2 D-28 at **64 inHg** and attributing all 58 km/h to aerodynamics would be invalid.
- Our original **P-47B weighs 12,565 lb** with a 2,000-bhp R-2800-21; IL-2's D-28 is ~1,772 lb heavier and has 2,600 hp. Greg's **2,600-hp D-style worksheet** uses **13,065 lb**, not IL-2's 14,337 lb. Greg's 2,000/2,600-hp comparison is power-only at fixed Greg weight and drag, never a direct B vs D comparison.
- IL-2 P-51B-5 engine V-1650-7 is a valuable near-match to our P-51B-15, **but** 9,676 lb vs 9,240 lb and published 1,650 hp vs our source-derived 1,580 bhp at sea level differ. Do not refit to IL-2's 375-mph game number.
- DCS's 2022 Tacview E-M P-51D chart is explicitly **LOW confidence by its author**. Its 132-knot IAS optimum turn speed and a sea-level 47-ft/s climb cannot be compared as identical setups to IL-2's 290-km/h IAS D-15 turn and 18.1-m/s WEP climb.
- IL-2's turn airspeed is **IAS**; our present F-4 diagnostic uses IAS≈CAS only because specimen-specific calibration is not available. Our physics solver will not fabricate a CAS correction.

### Primary and secondary source URLs

- IL-2 developer's maintained aircraft specifications (Han): https://forum.il2sturmovik.com/topic/25993-aircraft-flight-and-technical-specifications-and-operational-details/
- Official DCS P-47D Flight Manual: https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-thunderbolt_flight_manual_en/
- Official DCS P-51D Flight Manual: https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-p-51d_flight_manual_en/
- Actual **2020 DCS player** 3-altitude controlled TAS tests (P-47D-30 71 inHg, P-51D 67 inHg): https://forum.europeanaf.net/t/dcs-tas-speeds-horizontal-flight-for-all-dcs-wwii-fighters-at-three-levels/35780
- **2022 player** E-M tests processed from DCS Tacview, Contact Light, September/November 2022; P-51D 17°/s peak at 132 KIAS, 47-ft/s climb at 132 KIAS, author LOW confidence: https://www.8492sqdn.net/guides/combat-sim/bfm/docs/em.pdf
- Eagle Dynamics developer historical **D-30 power/speed** reference table discussion (not measured in DCS): https://forum.dcs.world/topic/242249-top-speed-p-47d-vs-p-51d/
- NACA 1944 primary propeller loss theory, ACR L4I29 (not a fitted type-specific profile): https://ntrs.nasa.gov/citations/19930093312
- NACA TN 2022 (1950) P-47D three-bladed prop flight trial; reduced η with more power loading at low speed (other prop): https://ntrs.nasa.gov/citations/19930082679
- See `README_CLEAN_v17.md`, `README_CLEAN_v16.md`, and the full handover's `06_SOURCE_AND_SCIENTIFIC_EVIDENCE` for existing P-47B, P-51B, F-4, Greg, and wartime source provenance.

## Physics D — what was implemented and what it does NOT mean

**C (unchanged)** uses a preliminary function of advance ratio J, power coefficient Cp and tip Mach. It accidentally increases η slightly when low-speed shaft power goes up, which opposes the NACA-induced-loading trend.

**D (new, opt-in)** assumes a perfect, infinitely bladed actuator disk plus **one global 0.85 fraction** of engine shaft power reaching ideal airflow (remaining 0.15 assigned to unspecified blade/profile/installation losses). For air density ρ, disk area A, forward true speed V and induced slipstream speed vi:

    0.85 P_shaft = 2 ρ A vi (V + vi)^2
    thrust T = 2 ρ A vi (V + vi)
    η = 0.85 V / (V + vi)

The solver numerically finds vi. More shaft power at fixed V necessarily increases induced loss and lowers η. **0.85 is a globally assumed sensitivity condition, not a source-measured constant, and D is NOT NACA-validated**. No engine/propeller blade type, power-rating or aircraft-specific coefficient was smuggled into D. Its benefit is the defensible *shape of the induced-loss term*; its failure is that a single profile/installation fraction and ideal blade model cannot describe the historical four-bladed constant-speed propeller across RPM, blade loading, and altitude.

**Decision:** leave C live. Do NOT combine C and D arbitrarily or tune D's fraction against the IL-2 graph. Prioritize the historic P-51B Fig. 5 power accounting, independent installed propeller curves and engine-vs-shaft/exhaust corrections; then attempt a calibrated installed-prop map and run these exact validation tables before promotion. Maintain a separate F-4 historically sourced low-speed polar gate rather than declaring the IL-2-conditioned e historical fact.

## File inventory and reproducibility

**New v1.8 files:**

- `Universal_Three_Aircraft_Model_v1.8.html` — single-file offline interactive dashboard; C working, D selectable.
- `physics.js` — original APIs intact, one additive D profile branch.
- `simulator_reference_v18.json` — original units and power/variant restrictions.
- `prop_sim_sanity_v18.cjs` — reproducible cross-simulator and C/D numerical test.
- `prop_sim_results_v18.json` — full absolute, per-speed output including each simulator datum.
- `plot_v18.py` and `prop_sim_diagnostic_v18.png` — four independent historical/simulator scientific panels.
- `test_prop_sim_v18.cjs` — C frozen regression, D physical behavior, variant/power gates and complete HTML script-parse verification.
- `README_CLEAN_v18.md` — this handover.

**Preserved:** v1.7/v1.6/v1.5 generated apps and their tests/data, all original Greg worksheets/screenshots, historically traced sources and source-archive evidence. Full bundle ZIP contains the previous handover tree plus all v1.8 additions.
