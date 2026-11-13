# Drag above 1 G and the Mustang–Spitfire comparison

**v4.13.0-rc.2 · Fighter Sim Inputs v1.11.0.** In the Normal / Combat benchmark, open **How does turn drag affect this matchup?** under **Sustained-turn advantage**. It follows the shared speed probe and shows the effect of varying added turn drag independently on each aircraft, the drag change needed to match the other aircraft, and a provisional Spitfire glide replay at the milestone conditions. [Live benchmark](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#operating-benchmark) · [Source register](../references/analysis/turn-drag-evidence-2026-11-13.json) · [Frozen before-scorecard](../references/analysis/v413-turn-drag-before.json)

## The 200 mph comparison

Clean, dry Combat at 10,000 ft, 50% internal fuel, 200 mph EAS (232.73 mph TAS). Power is useful propulsive hp unless specified as shaft BHP.

| Aircraft | Model weight | 1 G required | Available | 1 G induced component | Sustained G | Sustained turn | Limit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| P-51B-15 43-24777 | 8,925 lb | 394.2 hp | 1,488.6 hp | 122.2 hp | 3.126 | 15.99°/s | Lift |
| Spitfire LF Mk IXc BS.543 | 7,178.76 lb | 465.3 hp | 1,494.3 hp | 122.3 hp | 3.068 | 15.66°/s | Power |

The nominal Mustang lead is **0.33°/s**, inside the **0.5°/s** practical tie margin. Varying extra turn drag by the existing engineering range of **−15% to +15% per aircraft** gives **−1.92 to +1.38°/s** (Mustang minus Spitfire), with lift and useful power fixed. Varying all three inputs gives −3.40 to +3.70°/s. Either aircraft can lead within the drag sweep. These ranges are sensitivity calculations. With the rival at its nominal turn, **6.46% more** added drag puts the Mustang at parity, and **4.05% less** puts the Spitfire at parity.

The Mk I glide scenario lets the LF IX reach **3.188 G and 16.35°/s** at the last measured lift coefficient. It still has **85.2 hp** of surplus power there. The source range ends before the scenario reaches a limiting turn, so 16.35°/s is a lower bound within this calculation. It lies inside the practical tie margin against the nominal Mustang. At **210 mph EAS**, the modeled limiting point is inside the measured lift range, and the scenario gives the Spitfire **16.31°/s** versus the nominal Mustang **15.58°/s**. This is a plausible reversal under the transfer assumptions. Historical powered-turn accuracy remains unresolved.

| EAS (mph) | Nominal Mustang minus Spitfire (°/s) | Drag-only sweep (°/s) | Spitfire glide scenario (°/s) |
| ---: | ---: | ---: | ---: |
| 170 | −3.70 | −5.18 to −2.51 | ≥13.18 |
| 180 | −2.30 | −3.73 to −1.16 | ≥14.29 |
| 190 | −0.96 | −2.34 to +0.14 | ≥15.34 |
| 195 | −0.31 | −2.00 to +0.77 | ≥15.85 |
| 200 | +0.33 | −1.92 to +1.38 | ≥16.35 |
| 205 | +0.53 | −1.84 to +2.06 | 16.70 |
| 210 | +0.57 | −1.75 to +2.77 | 16.31 |
| 220 | +0.66 | −1.57 to +2.89 | 15.51 |
| 230 | +0.75 | −1.37 to +2.89 | 14.67 |
| 240 | +0.86 | −1.16 to +2.89 | 13.81 |

## Spitfire glide fit and reserved checks

A&AEE's clean Spitfire Mk I glide table gives seven standard-sea-level-equivalent speeds and sink rates, with an estimated mean weight of 5,750 lb. Use gear and flaps up, coarse pitch and engine off. A gross wing area of 242 ft² comes from the RAE Mk I model report's full-scale geometry. The early engine and propeller, the windmilling drag, and unknown individual-run weight, altitude and trim limit the transfer to BS.543. [A&AEE glide table](https://wwiiaircraftperformance.com/org/spitcom/mk1/spitmk1_K9793.html) · [RAE R&M 2535, Part I, Table 1](https://reports.aerade.cranfield.ac.uk/handle/1826.2/3821)

With steady glide angle γ, sink w and flight-path speed V, sin γ = w/V, drag is W sin γ and lift is W cos γ. Using q = ½ρ₀V² gives the measured effective Cᴅ and Cʟ. Fit Cᴅ = Cᴅ₀ + kCʟ² to 100, 120, 140 and 160 mph. The control fits its intercept to the same four rows at the live Spitfire slope. The candidate fits both terms. To predict a check sink rate, solve the same force balance at the check airspeed and weight, using the predicted flight-path angle for lift.

| Fit | Cᴅ₀ | k | Reserved sink MAE | Mean absolute percentage error |
| --- | ---: | ---: | ---: | ---: |
| Live slope, glide intercept fitted | 0.01813 | 0.09463 | 46.0 ft/min | 4.33% |
| Mk I glide slope and intercept fitted | 0.02458 | 0.07872 | 31.6 ft/min | 2.69% |

| Reserved speed | Observed sink | Control error | Candidate error |
| ---: | ---: | ---: | ---: |
| 110 mph | 895 ft/min | +30.7 ft/min | −4.8 ft/min |
| 130 mph | 1,010 ft/min | −41.7 ft/min | −7.1 ft/min |
| 156 mph | 1,210 ft/min | −65.5 ft/min | +82.8 ft/min |

Mean absolute sink error falls by **31%** over the three reserved speeds. The 156 mph absolute residual increases by **17.2 ft/min**. These are same-report glide checks. Dropping any one fit point moves k from 0.07840 to 0.07923. A leave-one-out range describes that fit choice. It gives no bound on windmilling or transfer error. The observed Cʟ domain is **0.3614 to 0.9249**. The browser limits the donor calculation to the scoped 170–240 mph EAS sweep and dry, clean 50% Combat settings at 10,000 ft. No quantitative XP-51B high-lift ordinate was verified. [Source register and excluded landing configuration](../references/analysis/turn-drag-evidence-2026-11-13.json)

## Power and drag calculation

At fixed TAS, multiplying lift by the load factor n gives the live increment Pᵢ,₁G(n²−1). Level-flight power is subtracted from useful propulsive power first. The nominal solver takes the lowest of the resulting power limit, the lift limit, and the structural cap. The coordinated turn rate is g√(n²−1)/V in rad/s. Break-even drag is the spare hp divided by Pᵢ,₁G(nᵣᵢᵥₐₗ²−1), conditional on reaching the rival's load within the lift and structure limits. This calculation uses equal TAS for the two aircraft at the shared EAS and altitude. [Shared turn calculation](../src/turn-performance.js)

For the Spitfire glide scenario, use the existing 1 G power at each speed. Between 1 G and the lower lift coefficient of the source, keep the original incremental slope. Within the measured interval, use the Mk I slope, **0.8319 times** the current LF IX slope. This applies the change only where lift rises above 1 G and inside the measured lift range. If the model has power left at the upper edge, report the attained load and surplus power at the edge. The glide intercept stays in the glide fit.

The original 43-24777 Figure 5 level-flight check at 22,400 ft uses six existing chart readings and replays the live clean drag with each reported gear and 2,100–3,000 RPM. Dividing modeled drag power by efficiency at the reported BHP gives a mean absolute difference of **43.7 BHP (4.95%)**. All six differences are positive (11.2 to 95.1 BHP). Chart allowances are at least ±4 mph and ±35 BHP, and BHP is chart-derived. The replay's Cʟ is 0.171–0.434, compared with 1.171 for the nominal Mustang turn at 200 mph EAS. This checks the 1 G power budget and leaves the Mustang's turn-drag slope open. [Wright Field Figure 5](https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Power_Required.jpg) · [Archived chart readings](../validation/baseline/p51_power_required_source_v16.json)

AFDU paragraph 20 reports the Spitfire IX turning inside a 10,100 lb Mustang III FZ.107 with a V-1650-3. The comparison describes clipped-wing BS.552 and full-span JL.359. Turn-run EAS, load factor, power and energy history are missing. The trial provides qualitative context at its own conditions. The NA-5548 quarter-scale tunnel plot and NACA 4K02 propeller-off dives are leads for further drag work. [AFDU tactical comparison](https://wwiiaircraftperformance.com/org/p-51/mustang-tactical.html) · [NA-5548 via Lednicer, Figure 10](https://forum.dcs.world/applications/core/interface/file/attachment.php?id=67373) · [NACA ACR 4K02](https://ntrs.nasa.gov/citations/19930092458)

## Nominal benchmark regression

The seven original operating profiles reproduce the v4.12 baseline at the recorded precision across **84 steady, 42 timed acceleration and 14 timed climb cases**, plus the ten crossover probes. This includes instantaneous turn, sustained turn, stall, climb and level speed. The three later intake profiles also reproduce their v4.13.0-rc.1 baselines across 36 steady, 18 timed acceleration and six timed climb cases. Their turn rankings remain unavailable. [Intake report](V413_AIRCRAFT_INTAKE.md) · [Intake baseline](../references/analysis/v413-turn-drag-intake-before.json) Representative dry Combat values at 10,000 ft are shown as before → after below.

| Aircraft | Stall (mph EAS) | Level (mph TAS) | Best climb (ft/min) | Peak sustained turn (°/s) | 180–300 mph EAS acceleration (s) | 0–10,000 ft climb (s) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| P-51B-15 | 96.77 → 96.77 | 408.07 → 408.07 | 4,203 → 4,203 | 16.08 → 16.08 | 49.53 → 49.53 | 150.79 → 150.79 |
| Spitfire LF Mk IXc | 85.16 → 85.16 | 380.32 → 380.32 | 4,705 → 4,705 | 19.26 → 19.26 | 49.35 → 49.35 | 117.27 → 117.27 |
| P-47B | 108.35 → 108.35 | 371.07 → 371.07 | 2,798 → 2,798 | 13.63 → 13.63 | 85.70 → 85.70 | 207.24 → 207.24 |
| Bf 109 F-4 | 95.59 → 95.59 | 373.55 → 373.55 | 4,763 → 4,763 | 18.76 → 18.76 | 56.89 → 56.89 | 136.85 → 136.85 |
| Fw 190 A-4 | 107.30 → 107.30 | 379.55 → 379.55 | 3,569 → 3,569 | 14.69 → 14.69 | 73.82 → 73.82 | 154.44 → 154.44 |
| P-38G-1 | 110.58 → 110.58 | 362.26 → 362.26 | 3,499 → 3,499 | 15.46 → 15.46 | 93.12 → 93.12 | 172.40 → 172.40 |
| F4U-4 | 100.37 → 100.37 | 369.40 → 369.40 | 3,400 → 3,400 | 14.90 → 14.90 | 96.16 → 96.16 | 159.60 → 159.60 |

**Reproduce** with `node validation/diagnostics/turn_drag.cjs`. The full result is also generated by `npm run check` and included as `validation/current/turn-drag.json` in the Physics regression artifact. The tests check the drag and turn equations, fit/check isolation, source limits, probe controls and parity with the frozen scorecard.

**Acceptance** covers the source replay and sensitivity tool. The default turn calculation retains its existing coefficients. A matched high-lift drag or sustained-turn observation with recorded power, weight, configuration, speed, altitude and load is still needed for a historical accuracy percentage or a 5:1 claim. A synchronized energy-loss run could also support a comparison if its altitude and speed histories can resolve the power difference.
