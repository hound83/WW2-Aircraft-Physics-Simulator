# Fleet maneuver and energy benchmark

**v4.15.0-rc.1 research candidate · Fighter Sim Inputs 1.11.0 · [Issue #106](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/issues/106)**

The fleet benchmark now runs a level 180° turn followed by straight acceleration to the entry speed. Choose two aircraft, use the existing power, fuel, cooling and injection controls, then set a common altitude, entry EAS and G command. The same calculation covers the five recent intakes with provisional maneuver limits. The grid repeats the comparison at 5,000, 10,000 and 20,000 ft and 180, 210 and 250 mph EAS. The original sustained-turn plots retain their admission criteria. [Open the maneuver panel](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#bench-maneuver).

## Fleet scorecard

The operating comparison uses 10,000 ft, initial Combat rating, 50% internal fuel and dry power. Gross weights follow each profile's service-load reconstruction. The level, acceleration and turn runs use the selected clean cooling case. Climb uses the operating climb cooling configuration. Timers use sea level to 10,000 ft and 180–250 mph EAS respectively, with the operating power allowances. The turn and recovery starts at 210 mph EAS with a 4 G command.

| Aircraft | Level speed (mph TAS) | Climb rate (ft/min) | Climb time (s) | 1 G stall (mph EAS) | Acceleration (s) | Turn + recovery (s) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Spitfire LF Mk IXc | 380.3 | 4705 | 117.3 | 85.2 | 19.0 | 15.2 |
| Bf 109 F-4 | 373.6 | 4763 | 136.9 | 95.6 | 20.6 | 13.7 |
| P-47B Thunderbolt | 371.1 | 2798 | 207.2 | 108.4 | 28.7 | 20.3 |
| P-51B-15 Mustang | 408.1 | 4203 | 150.8 | 96.8 | 21.5 | 12.1 |
| Fw 190 A-4 | 379.6 | 3569 | 154.4 | 107.3 | 28.7 | 18.2 |
| P-38G-1 Lightning | 362.3 | 3499 | 172.4 | 110.6 | 29.3 | 15.0 |
| F4U-4 Corsair | 369.4 | 3400 | 159.6 | 100.4 | 31.3 | 21.5 |
| Spitfire HF Mk IXc | 377.7 | 5083 | 127.1 | 85.1 | 18.6 | 11.4 |
| Bf 109 G-2 | 355.9 | 3947 | 149.3 | 98.3 | 25.3 | 16.1 |
| P-51D-15 Mustang | 417.4 | 3320 | 154.8 | 101.5 | 22.2 | 16.4 |
| Spitfire F Mk IXc | 359.9 | 4498 | 146.1 | 85.1 | 22.4 | 13.3 |
| Bf 109 G-6/Trop | 333.9 | 3485 | 169.0 | 101.8 | 32.4 | 18.9 |

| Area | Profiles with a model output | Profiles with a numerical source comparison | Profiles with a relevant source reference |
| --- | ---: | ---: | ---: |
| Level speed | 12/12 | 12/12 | 12/12 |
| Climb rate | 12/12 | 10/12 | 11/12 |
| Time to climb | 12/12 | 11/12 | 11/12 |
| Clean 1 G stall | 12/12 | 2/12 | 9/12 |
| Level acceleration | 12/12 | 1/12 | 3/12 |
| Maneuverability | 12/12 | 2/12 | 3/12 |

The numerical source column includes qualified historical comparisons, curve fit consistency and separate-airframe transfers. Every source group identifies its scope and count. Agreement is $100 - \mathrm{MAPE}$. Signed errors are model minus observed, and fitted observations remain separate from reserved observations. Shared-report, shared-start and shared-figure rows are correlated. The maneuver comparisons are P-51B usable lift and the provisional MT-215 360° case. The restored P-51D acceleration comparison uses a wartime profile as a proxy. [Fleet validation table](https://hound83.github.io/WW2-Aircraft-Physics-Simulator/#bench-fleet-validation) · [Full calculations in the verified build artifact](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/runs/43602800017/artifacts/14117122442).

## Historical agreement by aircraft

Each cell shows the first numerical comparison in that scorecard entry with its sample count and basis. Select the entry in the simulator for additional comparisons, signed errors and source conditions.

| Aircraft | Level speed | Climb rate | Time to climb | Clean 1 G stall | Level acceleration | Maneuverability |
| --- | --- | --- | --- | --- | --- | --- |
| Spitfire LF Mk IXc | 99.7% (17, fit consistency) | 97.8% (10, reserved) | 99.9% (1, report inputs) | Source reference | Source reference | Model only |
| Bf 109 F-4 | 98.9% (1, conditional) | Model only | 90.5% (3, conditional) | Source reference | Model only | Model only |
| P-47B Thunderbolt | 99.6% (5, reserved) | 95.7% (5, reserved) | 99.3% (2, report inputs) | Source reference | Model only | Model only |
| P-51B-15 Mustang | 99.9% (8, fit consistency) | 94.5% (3, conditional) | 99.7% (2, conditional) | Source reference | Model only | 98.9% (5, lift only) |
| Fw 190 A-4 | 98.0% (7, reserved) | 90.4% (8, reserved) | 96.2% (3, conditional) | Source reference | Model only | Source reference |
| P-38G-1 Lightning | 99.8% (3, reserved) | 93.0% (7, reserved) | 98.9% (7, report inputs) | 99.5% (1, transfer) | Model only | Model only |
| F4U-4 Corsair | 98.0% (7, conditional) | 94.5% (7, conditional) | 93.2% (2, conditional) | 96.5% (1, transfer) | Model only | Model only |
| Spitfire HF Mk IXc | 98.1% (18, report inputs) | 92.2% (21, report inputs) | 98.7% (3, report inputs) | Model only | Model only | Model only |
| Bf 109 G-2 | 98.2% (11, report inputs) | 87.2% (6, report inputs) | 84.7% (5, conditional) | Source reference | Source reference | 90.9% (1, 360° proxy) |
| P-51D-15 Mustang | 99.0% (26, report inputs) | 92.6% (12, report inputs) | 96.4% (3, conditional) | Source reference | 70.2% (1, restored proxy) | Model only |
| Spitfire F Mk IXc | 98.6% (15, report inputs) | 92.4% (34, report inputs) | 97.3% (4, report inputs) | Model only | Model only | Model only |
| Bf 109 G-6/Trop | 98.2% (2, report inputs) | Source reference | Model only | Model only | Model only | Model only |

## Timed-climb evidence

The replay integrates the signed TAS energy change along the report schedule. BS.551 uses retained Table III TAS and the elapsed column transcribed for this milestone. Wright Field P-51D uses recorded instrument-corrected IAS as a CAS proxy and fixed takeoff mass. The Corsair comparison uses the Vought detail specification at 12,405 lb and modeled climb TAS. Existing matched flight tests and the Normal/Combat operating timer use their respective rating schedules. [Timing supplement](../references/analysis/fleet-timing-supplement-v1.json) · [Climb integration](V411_SHARED_FLIGHT_CLIMB.md).

| Aircraft | First comparison in scorecard | Residuals / source rows | Agreement | Mean signed error |
| --- | --- | ---: | ---: | ---: |
| Spitfire LF Mk IXc | same-report elapsed check | 1/1 | 99.9% | +0.4 s |
| Bf 109 F-4 | Messerschmitt 1941 elapsed comparison | 3/4 | 90.5% | -20.1 s |
| P-47B Thunderbolt | same-report elapsed check | 2/2 | 99.3% | -2.7 s |
| P-51B-15 Mustang | digitized curve and modeled TAS | 2/2 | 99.7% | +0.1 s |
| Fw 190 A-4 | A-2 through A-4 handbook comparison | 3/3 | 96.2% | +4.3 s |
| P-38G-1 Lightning | same-report elapsed check | 7/7 | 98.9% | +1.6 s |
| F4U-4 Corsair | Vought specification comparison | 2/2 | 93.2% | -21.3 s |
| Spitfire HF Mk IXc | A&AEE Table III elapsed replay | 3/3 | 98.7% | -1.5 s |
| Bf 109 G-2 | Finnish scan elapsed replay | 5/5 | 84.7% | +26.2 s |
| P-51D-15 Mustang | Wright Field elapsed replay with IAS-as-CAS | 3/3 | 96.4% | +2.9 s |
| Spitfire F Mk IXc | A&AEE Normal elapsed replay | 4/4 | 97.3% | -2.9 s |
| Bf 109 G-6/Trop | Ceiling only | 0 | Open | Open |

The F-4's 8,000 m observation is retained with a source-power-limited replay. The G-6/Trop factory report provides a ceiling and a climb IAS but no elapsed checkpoints in the recovered data. The G-2 comparison uses CINA altitude with the related TAS chart and nominal loading. Its residual is larger than the other elapsed comparisons with available predictions.

## Turn and recovery

At the stated operating case the shorter turn and the shorter total run can belong to different aircraft. For example, the P-51B spends 10.9 s in the turn and recovers in 1.2 s. The LF IX turns in 8.4 s and recovers in 6.8 s. Their tested total-time ranges overlap.

| Aircraft | Turn (s) | Exit speed (mph EAS) | Recovery (s) | Total (s) | Tested total range (s) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Spitfire LF Mk IXc | 8.4 | 179.4 | 6.8 | 15.2 | 12.2–18.5 |
| Bf 109 F-4 | 8.6 | 189.3 | 5.1 | 13.7 | 11.1–16.7 |
| P-47B Thunderbolt | 10.7 | 181.2 | 9.6 | 20.3 | 16.0–25.1 |
| P-51B-15 Mustang | 10.9 | 205.7 | 1.2 | 12.1 | 10.7–15.2 |
| Fw 190 A-4 | 10.3 | 185.9 | 8.0 | 18.2 | 14.3–22.5 |
| P-38G-1 Lightning | 10.5 | 197.6 | 4.4 | 15.0 | 11.6–18.7 |
| F4U-4 Corsair | 9.3 | 174.4 | 12.2 | 21.5 | 17.1–26.1 |
| Spitfire HF Mk IXc | 8.8 | 198.7 | 2.6 | 11.4 | 9.2–13.9 |
| Bf 109 G-2 | 8.8 | 184.6 | 7.3 | 16.1 | 12.8–19.6 |
| P-51D-15 Mustang | 9.2 | 183.8 | 7.2 | 16.4 | 12.9–20.1 |
| Spitfire F Mk IXc | 8.7 | 192.8 | 4.6 | 13.3 | 10.7–16.1 |
| Bf 109 G-6/Trop | 9.3 | 181.7 | 9.6 | 18.9 | 14.9–23.2 |

The ranges use all eight endpoint combinations of **±10% maneuver lift**, **±5% useful power** and **±15% added induced drag**. The wider source lift bracket applies where available. Ranges describe these input perturbations. Instant bank and rollout, constant altitude, rated-power transitions, and energy-limited speed changes define the maneuver. Roll dynamics, unloading technique, the pilot's G tolerance and buffet dynamics are outside this calculation. Curves are dotted during the loaded turn. A recovery interval can be solid where its start, midpoint and end use covered inputs. The source grade applies to the calculated interval it covers.

## Formula and regression checks

| Quantity | Calculation |
| --- | --- |
| Lift cap | $n_\text{lift}=qSC_{L\max,\text{maneuver}}/W$, with $q=\tfrac12\rho V_\text{TAS}^2$. Apply the lowest of commanded G, lift limit and the model's G cap. |
| Added drag power | $P_{D,n}=P_{D,1}+(n^2-1)P_{i,1}$. The clean level-drag term stays in the balance at all loads. |
| Signed speed change | $dV_\text{TAS}/dt=(P_\text{useful}-P_{D,n})/(mV_\text{TAS})$. hp is converted to watts. At fixed altitude multiply by $\sqrt{\rho/\rho_0}$ for the EAS step. |
| Heading rate | $\dot\psi=g\sqrt{n^2-1}/V_\text{TAS}$ in radians per second. Integrate to 180°, then command 1 G. |
| Hold-speed equilibrium | At the power-limited sustained load, $P_\text{useful}=P_{D,n}$ and the tangential acceleration is zero. |
| Integrated energy | Track differential $V_\text{TAS}^2/2$ against integrated net power per mass. The comparison includes fuel and injection mass changes and preserves the rating clock at rollout. |

All twelve profiles complete all nine altitude/speed cases at the stated load command. The one-G calculation agrees with a direct force-balance check to less than $10^{-9}$ mph/s. The sustained-turn power residual is below $10^{-8}$ hp. Halving the 0.5 s timestep changes the nominal completion time by less than 0.001 s on every profile. The sum of absolute per-step specific-work residuals stays below 0.28 J/kg. CI enforces the earlier 144 steady cases, 72 timed accelerations, 24 timed climbs and 12 fixed probes against the [frozen baseline](../references/analysis/v415-fleet-maneuver-before.json). [MIT climb energy equation](https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/node100.html) · [US Air Force energy-maneuverability reference](https://static.e-publishing.af.mil/production/1/af_a3/publication/afman11-2t-38a-b/afman11-2t-38a-b.pdf).

## Next milestone

Use the same replay form to recover straight-flight acceleration and loaded-turn energy from at least two independent aircraft families. Start with the original MT-215 sheet, then seek one recorded speed-history run from a British or US aircraft with a matched turn. Retain heading, speed basis and corrections, loading, altitude, rating, configuration and cooling. Derive added drag only where both energy balances overlap. Use a separate interval or experiment to check any proposed coefficient. Add corrected or properly weight-scaled clean stall references wherever the reports permit.
