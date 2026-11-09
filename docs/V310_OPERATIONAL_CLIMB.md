# v3.10 research build: operational climb and aircraft intake

Compare Spitfire LF Mk IX BS.543 and P-47B 41-5902 from 20,000 to 30,000 ft. Both start in a climb in standard atmosphere, with cooling open. Use each aircraft's documented ratings and climb schedule. Hold the gross-weight inputs at 7,485 and 12,565 lb. Each short-power setting represents the same allowance remaining per aircraft at 20,000 ft, independent of how it got there.

| Short power available at start | Spitfire time | P-47B time | Spitfire time advantage | Spitfire rate advantage at 20k / 30k |
|---|---:|---:|---:|---:|
| Sustained only | 244.4 s | 438.1 s | 193.7 s | 1,362 / 612 ft/min |
| 2 min | 228.3 s | 379.9 s | 151.6 s | 1,391 / 612 ft/min |
| 5 min | 218.7 s | 325.1 s | 106.4 s | 1,391 / 800 ft/min |

The v3.9 historical replay used Spitfire combat and Thunderbolt normal power, giving a 219.4 s advantage against 222.0 s from the reports. The new rows change the operational policy and model inputs. Their differences from v3.9 quantify the scenario choice. At two minutes the Spitfire returns to sustained power at 26,248 ft and the P-47B at 24,394 ft. With five minutes the Spitfire reaches 30,000 ft within its allowance and the P-47B switches at about 29,505 ft.

## Model and evidence

- **Spitfire.** A&AEE lists +12 psi/2,850 rpm for 60-minute climb and +18 psi/3,000 rpm for five-minute combat. Table II records the combat climb. For sustained power, use the lesser of +12 and the same-height combat boost as a pressure-availability proxy. Scale the replay BHP by the absolute pressure ratio raised to 0.75 and by the RPM ratio, and recalculate propeller efficiency at 2,850 rpm. Carry over the climb TAS and fitted open-cooling drag. These are engineering assumptions for the documented rating. A measured installed +12 climb-power map and a climb schedule at that rating remain outstanding. [A&AEE section 2.4 and Table II](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html)
- **Thunderbolt.** Normal power reuses the same-specimen 1,625 torque bhp at 2,550 rpm. High-altitude military BHP and TAS come from the 41-5942 production-aircraft test and are transferred to the 41-5902 scenario. That donor's power drops from 2,000 bhp at 24,000 ft to 1,645 at 30,000 ft. The five-minute allowance comes from the 41-5902 test programme. The shared solver recalculates propulsive and excess power at each node. It uses the existing open-cooling model and verified 0.5 propeller gearing. The 41-5942 power/speed inputs can drive a check at the donor weight without fitting its observed climb rates. The three in-band residuals are +61, +172 and +97 ft/min, or 110 ft/min MAE. That check tests force balance at donor inputs. It does not validate transferring those inputs or the resulting time to 41-5902. [Wright Field PHQ-M-19-1417-A and FS-M-19-1523-A](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html)
- **Time and uncertainty.** Integrate reciprocal climb rate through linear interpolation between source altitude nodes. Solve for the switch altitude at the moment the allowance runs out, and integrate the sustained curve from that altitude. There is no added acceleration time for changing climb speed. With sustained power only, varying the Spitfire pressure exponent from 2/3 to 1 and removing or including proportional RPM scaling gives a 191.5–214.6 s lead. This is a sensitivity of the Spitfire power assumptions. Historical uncertainty remains unbounded, and 3:1 and 5:1 remain unresolved. At five minutes this particular sensitivity drops out because the Spitfire never needs the sustained curve. Other uncertainties still apply.

## First new fighter

The Fw 190 A-4 W.Nr. 783 now has indexed combat-rating source graphs in addition to the earlier special 1.70 ata test. Report 783/1 records a 3,870 kg takeoff weight, BMW 801 D-2/20208, a 652 km/h peak at 6,950 m with the long external intake, and separate cooling-flap climb curves. Use the long intake as an explicitly documented installation. The short intake produced substantial scatter. Report 665/3 offers a separate specimen comparison, subject to its own documented engine trouble and cooling conditions. [783/1](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-783-nr1.html) · [665/3](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-665-nr3.html)

The [aircraft intake ledger](../references/aircraft-intake.json) records required data, benchmark gates, source pointers and remaining blockers. Digitize the long-intake speed and climb graphs, verify exact configuration, and establish source-bounded installed BHP and propeller inputs before promotion. Document fit and reserved rows before any calibration. Keep these sources and unresolved limits compactly in GitHub.

## Reproduction and release scope

Open **Compare four fighters** in the standalone CI artifact and choose a short-rating allowance. The JSON export includes every rate node, switch altitude, sensitivity and source pointer. Regenerate with `npm run diagnose:fighter-comparison`. The acceptance gate retains the 12 frozen v3.9 states and the earlier historical climb replay. This is a research build. Stable historical-accuracy claims require independent evidence.
