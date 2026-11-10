# v3.15.0 | turn and stall correction

This correction targets sustained turns and the lift limit. The requested v3.12 correction is delivered on the current v3.14 research baseline, retaining its evidence explorer and continuing the build numbering. Historical climb, Greg and level-speed scorecards retain their prior calculation policies. The live explorer in profile P and a before/after panel expose the bounded new Mustang lift case. At unsupported states the maneuver model uses its provisional legacy lift. The browser panel identifies the evidence basis.

## What the book verifies

H. H. Hurt, [Aerodynamics for Naval Aviators, NAVWEPS 00-80T-80](https://www.chinook-helicopter.com/Publications/Navy/Aerodynamics_for_Naval_Aviators_00-80T-80_1-Jan-1965.pdf), Flight at High Lift Conditions (Figure 1.16), induced drag, climb and turning performance. In steady coordinated level flight, n = 1/cos(bank) and turn rate = g sqrt(n² - 1) / TAS. EAS determines dynamic pressure. With constant lift limit, stall EAS rises by sqrt(n). The implementation checks the book's 1,091 tan(bank)/TAS-knots approximation and the lift balance numerically. Induced drag scales with n² for a fixed effective polar. Sustained load is the smallest of the lift, structure and zero-excess-power limits. A lift correction does not change the propulsive power or drag at the same 1g state. The book does not establish aircraft-specific lift, drag or propeller coefficients.

## Adopted correction and stall evidence

[NACA TN1044 Figure 6](../references/p51-turn-lift-tn1044.json) gives calibrated gradual maneuver stalls with the engine throttled and the propeller in high pitch. The test P-51B was carefully finished. The centre panel uses the right ordinate. The new ledger records a broad approximate engineering read across the overlapping traces. It is not an isolated altitude-resolved measurement surface. The simulation uses the existing one-g nominal 1.45 transfer for the reference stall and a separate Mach-dependent maneuver lift limit, preserving the source/model area convention. Both are conditional transfers to 43-24777. The historical cockpit IAS correction is still missing. Retain the original assumptions outside the 5,100–9,300 ft transfer window. The maneuver curve is used only within Mach 0.14–0.34, with no extrapolation. The one-g stall must fall in Mach 0.14–0.18. The known gear-up, flaps-up, clean/rack and throttle differences limit the strength of the transfer.

| Mustang at 8,000 ft / 9,240 lb | Previous | Corrected |
|---|---:|---:|
| One-g clean stall, mph EAS | 98.5 | 103.4 (source bracket 102.3–105.2) |
| Sustained at 145 mph EAS | 2.17 g | 1.83 g |
| Sustained at 160 mph EAS | 2.64 g | 2.17 g |
| Sustained at 175 mph EAS | 2.94 g | 2.53 g (sampled lift spread 2.40–2.65) |
| Turn rate at 175 mph EAS | 17.62°/s | 14.77°/s |
| Sustained at 200 mph EAS | 3.08 g | 3.08 g, power-limited for nominal lift |

The most useful distinction is the active constraint. Changing stall lift reduces the Mustang result at 145–175 mph EAS. With the current power model and nominal lift, the limit at 200 mph EAS is power. The visual spread does not include propwash, installed thrust, drag curvature or pilot/control limits.

| Exact target | Stall evidence and disposition |
|---|---|
| P-51B-15 43-24777 | Reported 84/86 IAS at 8,000 ft uses open/closed shutters at different weights. Neither is a CAS/EAS measurement. TN1044 is the bounded same-type transfer above. |
| Bf 109 F-4 | IL-2 154–171 km/h IAS spans masses. The F-1/F-2 Kennblatt landing indications and true speeds are a different condition. Exact F-4 clean corrected stall remains open. |
| P-47B 41-5902 | The 105 IAS clean power-off reading is below the original calibration's 170 IAS lower edge. D-30 service IAS traces remain a different installation. |
| Spitfire LF IX BS.543 | BF274 calibration does not reach stall. Earlier Spitfire I and VA maximum-lift reports have differing methods and settings. They remain sensitivity evidence. |
| Fw 190 A-4 W.Nr. 783 | Flugbericht 783/1 is a speed and climb source. It supplies no matched clean stall here. |
| P-38G-1 42-12687 | FS-M-19-1538-A supports level and climb cases. NACA TN1044 also covers a separate P-38F. No adopted G stall transfer. |

See the [v3.14 four-track follow-up](research/WW2_STALL_FOUR_TRACK_FOLLOWUP_2026-11-10.md) for the distinction between CAS, provisional CAS*, instrument-corrected IAS and original source channels. Its source packs remain available in the explorer. Also see [stall source audit](STALL_ACTUAL_AIRSPEED_RESEARCH.md), [NACA TN1044](https://ntrs.nasa.gov/citations/19930084610), [Fw 190 source](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-783-nr1.html), and [P-38G source record](../references/p38g-42-12687.json).

## After-correction cross-checks

### F-4 vs IL-2 and Greg

[IL-2 developer specification](https://il2sturmovik.com/museum/fighters/bf-109-f-4/) gives 20.3 s at sea level and 26.1 s at 3,000 m, 270 km/h IAS, emergency power, 2,890 kg. Use the published IAS as a CAS proxy and approximately the same mass. At sea level the reference solver is lift-limited at 2.93 g. At 3,000 m it is narrowly power-limited at 2.91 g. The two IL-2 times imply 2.57 and 2.35 g. At those target loads, the reference power budget still has +338/+329 hp. A lift-only explanation would require equivalent one-g EAS of 104.7 and 109.0 mph (baseline 98.1), rather than one common clean stall setting. A power-only explanation would require roughly 30% less propulsive power at these turn states. At fixed power and existing parasite drag, the effective induced drag needed at the target loads is about 1.53 times our value. These inversions are alternative explanations, not measurements of CLmax, drag or thrust.

| State | v3.13 reference | Corrected build reference | Greg polar with same model power | IL-2 |
|---|---:|---:|---:|---:|
| Sea level | 17.5 s | 17.5 s | 19.2 s | 20.3 s |
| 3,000 m | 20.4 s | 20.4 s | 24.7 s | 26.1 s |

The Greg column substitutes only the worksheet-derived polar with the model's emergency-power schedule held fixed. The existing optional game-conditioned profile uses IL-2, so agreement with it is circular. A trial extra induced loss proportional to n²(n² - 1) preserves the 1g anchor. Fitting the sea-level IL-2 point gives k=0.0941 and predicts 25.35 s at the 3,000 m point. That checks behavior against a second point from the same game and does not identify an aircraft correction. The trial remains out of the accepted polar. The [1944 tactical comparison lead](https://generalstaff.org/WW2/Papers/P-51_Mustang_Daneu.htm) and the [1989-era warbird test write-up](https://www.wwiiaircraftperformance.com/com/others/endingtheargument.html), Figs. 9–10, are independent direction checks for other P-51 and P-47 variants/power settings. They do not validate the exact modeled aircraft or numeric F-4 correction.

### P-51, Spitfire, and P-47

| Check | v3.13 | Corrected build | External |
|---|---:|---:|---:|
| Mustang 20,800 ft / 250 mph TAS / 67 inHg | 2.388 g | 2.388 g | Greg 2.130 g |
| P-47B 27,000 ft curve MAE, CAS interpretation | 0.153 g | 0.153 g | Greg worksheet, seven points |
| P-47B same, EAS interpretation | 0.111 g | 0.111 g | Greg worksheet, seven points |
| Mustang B, 3,000 m, IL-2 B-5/-7 WEP speed proxy | 21.8 s | 21.8 s | IL-2 28.0 s |
| Spitfire, 3,000 m, IL-2 Merlin 66/+18 speed proxy | 20.6 s | 20.6 s | IL-2 20.5 s |
| Mustang B vs DCS P-51D at 4,331 kg, 132 KIAS, sea level | 17.2°/s | 17.2°/s | DCS 17°/s |
| Spitfire vs DCS LF IX at 3,525 kg, 152 KIAS, sea level | 19.4°/s | 19.4°/s | DCS 24°/s |

The DCS comparison uses [community energy-maneuverability reconstructions](https://forum.dcs.world/applications/core/interface/file/attachment.php?id=305468&key=26a0b990bcb927af9b382945f5225455), pp. 26–27. Tacview test July 2022, labeled low confidence, clean and full power. The actual boost/RPM were not provided. The model treats KIAS as KCAS and uses its own reference ratings at the stated masses. The B/D Mustang difference and the absence of matching power are material. At the DCS Spitfire turn rate, the model lift limit (3.90 g) is above the implied 3.49 g. Holding this model's drag would require roughly 1,909 propulsive hp vs 1,360 available. Stall changes alone cannot account for that result in this model. The DCS data cannot identify whether drag, available power, airspeed or reconstruction assumptions explain the gap. At Greg's Mustang point the approximately 115 hp propulsive-power difference from the worksheet persists and the point is outside the adopted transfer window. Neither games nor Greg were used to fit the adopted NACA transfer.

## Reproduction

Run `npm run diagnose:fighter-comparison` and inspect `turnCorrection` in the JSON export. Run `npm run check` for the book identities, lift guards, old scorecards and protected import. `npm run test:browser` verifies that the live model and the dedicated view apply the correction. Independent exact-specimen powered stall and sustained-turn measurements are still required to assess historical ranking or 5:1.
