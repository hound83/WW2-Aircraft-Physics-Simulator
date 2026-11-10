# IL-2 Great Battles and DCS comparisons with v3.13

Research snapshot, 10 November 2026. Model baseline [v3.13](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/commit/be952b248aef5c5bb6e76fb1c4037334752ac988). The IL-2 figures are developer specifications. The DCS numeric series is a community test from November 2020. No new game flights were run. Simulator-to-simulator agreement has no weight as independent historical validation, and this comparison supplies no historical 5:1 bound.

## IL-2 Great Battles

Source for the IL-2 columns: [developer specifications](https://forum.il2sturmovik.com/topic/25993-aircraft-flight-and-technical-specifications-and-operational-details/), entries Bf 109 F-4, Spitfire Mk.IXe (Merlin 66), P-51B-5 (V-1650-7), Fw 190 A-3, P-47D-22 and P-38J-25. Values use ISA and the loading convention of each entry. Mass and fuel fraction listed below are as described by IL-2, with no inferred actual mass for fuel-adjusted cases. All pairs below are **v3.13 / IL-2**. Rounded model values are for comparison, not estimates of measurement precision.

| v3.13 / IL-2 aircraft | Altitude m | Model / IL-2 | Metric | Conditions and eligibility |
|---|---:|---:|---|---|
| Bf 109 F-4 / F-4 | 0 / 2,000 / 6,000 | 523/522; 556/570; 631/635 | km/h TAS | Combat 1.30 ata / 2,500 rpm; 6,371 lb vs 2,890 kg. First row is our speed anchor. Last row uses the optional DB 601 E inlet transfer; default domain is unavailable. |
| Bf 109 F-4 / F-4 | 0 / 3,000 | 20.3/19.5; 19.7/18.8 | m/s climb | Same rating; our best-speed grid and unknown IL-2 climb speed. |
| Bf 109 F-4 / F-4 | 0 / 3,000 | 17.5/20.3; 20.4/26.1 | seconds per 360° | Emergency 1.42 ata / 2,700 rpm. IL-2 270 km/h IAS, model treats it as CAS for this scenario. Model reference polar e=0.78, separate from legacy game-conditioned turn scenario. |
| P-51B-15 / P-51B-5 | 0 / 7,500 | 582/604; 686/717 | km/h TAS | Both V-1650-7 and 67 inHg / 3,000 rpm; our 9,240 lb reference, IL-2 lists 4,389 kg standard and 68% fuel for performance. Exact rack/drag configuration may differ. |
| P-51B-15 / P-51B-5 | 0 / 6,250 | 607/626; 697/721 | km/h TAS | Same comparison at 75 inHg / 3,000 rpm; 150-grade WEP in IL-2. |
| P-51B-15 / P-51B-5 | 0 / 3,000 / 6,000 | 19.4/19.3; 20.4/18.0; 15.4/11.8 | m/s climb | 67 inHg nominal WEP. Our clean/reference drag at modeled best speed. IL-2 climb speed and shutter positions not given. Use as a diagnostic for the altitude trend. |
| Spitfire LF IXc BS.543 / LF IXe | 0 / 3,350 / 6,850 | 541/542; 618/610; 654/664 | km/h TAS | Both Merlin 66 and +18 lb / 3,000 rpm. Native 7,110 lb vs 3,359 kg. At the IL-2 listed mass, v3.13 gives 540 / 617 / 653 km/h. |
| Spitfire LF IXc BS.543 / LF IXe | 0 / 3,000 | 17.2/17.7; 20.6/20.5 | seconds per 360° | +18 lb / 3,000 rpm. Model run at 3,359 kg, treating the published 270 / 260 km/h IAS as CAS. Different wing armament and unverified airspeed correction. IL-2 climb 21.5 / 18.6 / 15.5 m/s at 0 / 3,000 / 6,000 m is at +12 lb / 2,850 rpm; no direct comparison against our +18 preset. |
| Fw 190 A-4 W.Nr. 783 / A-3 | 0 / 6,000 | 523/535; 633/626 | km/h TAS | Both combat, 1.32 ata / 2,400 rpm nominal; BMW 801 D family, 3,870 vs 3,855 kg. Different subtype and intake/airframe details. |
| Fw 190 A-4 W.Nr. 783 / A-3 | 0 / 6,000 | 16.9/16.0; 11.9/10.3 | m/s climb | Combat, v3.13 open cooling and best-speed search; IL-2 climb speed/cooling details unspecified. |
| P-47B 41-5902 / P-47D-22 | 0 / 9,000 | 541/518; 688/685 | km/h TAS | Model military near 2,000 bhp vs D-22 combat (52 inHg / 2,700 rpm, about 1,950 hp at sea level). B and D engine/propeller installations differ. IL-2 lists 6,213 kg standard and 50% fuel for performance, B reference 12,565 lb. |
| P-47B 41-5902 / P-47D-22 | 0 / 3,000 / 6,000 | 13.3/12.6; 12.6/11.9; 11.6/10.7 | m/s climb | Same nominal ratings as previous row; v3.13 open cooling. At 6,000 m the D-22 WEP specification instead gives 16.9 m/s (64 inHg / 2,700 rpm). |
| P-38G 42-12687 / P-38J-25 | 7,860 | 659/674 | km/h TAS | v3.13 G reference level schedule at 13,550 lb; J WEP 60 inHg / 3,000 rpm. IL-2 lists 7,890 kg standard and 70% fuel for performance. Variant and rating differ. |
| P-38G 42-12687 / P-38J-25 | 0 / 3,000 / 6,000 | 18.9/20.4; 18.5/19.1; 17.6/15.0 | m/s climb | G chart-conditioned open-shutter climb at 13,900 lb, around 44.7 inHg. J WEP; at combat (54 inHg), IL-2 instead gives 12.8 / 11.5 / 9.4 m/s. Context only. |

The F-4 legacy optional turn scenario already used IL-2 data to choose a turn parameter ([historical project note](../KNOWN_LIMITATIONS_LEGACY.md)). Its agreement with IL-2 cannot be treated as an external check. The reference polar is a distinct model and the quicker turns above expose its sensitivity to that choice. The +18 Spitfire turn resemblance has no measured historical turn bound. IAS stall ranges were deliberately kept out of the numerical comparison, since they combine different weights and lack a matched IAS-to-CAS/EAS correction.

## DCS World

[Player test, DCS Open Beta 2.5.6.57530](https://forum.dcs.world/topic/253210-tas-speeds-horizontal-flight-for-all-dcs-wwii-fighters-at-three-levels/?comment=4485171&do=findComment), Normandy, reported 20°C, 29.92 inHg, zero wind and 50% fuel. TAS was read from the status bar after acceleration. The report gives metric heights with approximate imperial labels. Model calculations use its metric labels. v3.13 runs ISA and native aircraft weight. These are qualified comparisons of shapes and scale across an older build. Exact mass, radiator position, power at height and configuration are not fully matched.

| v3.13 / DCS aircraft | Reported power v3.13 / DCS | 0 m | 3,300 m | 6,100 m |
|---|---|---:|---:|---:|
| Spitfire LF IXc BS.543 / LF IX | +18 lb / +18 lb, 3,000 rpm | 541/525 | 618/585 | 643/611 |
| P-51B-15 / P-51D | 67 inHg / 67 inHg, 3,000 rpm | 582/592 | 657/631 | 666/674 |
| Fw 190 A-4 / A-8 | Combat / emergency | 523/542 | 583/572 | 635/628 |
| P-47B / P-47D-30 | Military / 71 inHg with water injection | 541/615 | 598/646 | 650/670 |
| Bf 109 F-4 / K-4 | Combat / 1.75 ata MW50 | 523/592 | 579/637 | unavailable/678 |

All speeds in km/h TAS, model / DCS. The DCS P-47D-30 test used maximum obtainable boost, which the tester identifies as overboost for that run. The F-4 and K-4 figures are retained as variant context. No usable DCS P-38 counterpart was found. The closest DCS configuration here is the Spitfire. The ED developer's [2016 reference discussion](https://forum.dcs.world/topic/137303-dcs-spitfire-mk-ix-performance/) uses BS.543 for speed and climb, MA.648 for speed and JF.275 for both. Developer traces are not used as numeric readings here because the original plots could not be verified from the accessible post. Shared BS.543 reference data limits independence. The observed 16–33 km/h gap to the separate 2020 player test is worth distinguishing from agreement with the developer's reference programme. The [ED flight-model paper](https://www.digitalcombatsimulator.com/upload/iblock/dcc/DCS%20FM%20principles%20plus%20MiG-29%20P-47%20F-16.pdf) shows P-51D traces at 61 inHg and distinguishes excess power from actual climb with automatic radiators. Those traces do not enter the numeric 67-inHg comparison. No matched DCS climb/turn or full time-to-climb series was verified.

## Reproduction

Use `src/physics.js` with `aircraft/cases.json` and `calibration/flight-envelope.json`. For the four core aircraft call `maxSpeed` at altitude in feet (m / 0.3048), profile P and the specified rating, with the flight envelope. Multiply mph by 1.609344 for km/h. For F-4 6,000 m only, select `engineModel: 'inlet-transfer'`. For F-4 and Mustang climb use `bestClimb` at profile P, 120–220 mph EAS mapped to TAS, with steps of 1 mph TAS. Use the same search with the envelope's open cooling for the P-47B. Multiply ft/min by 0.3048 / 60 for m/s. For turn use `evaluated` at the published IAS treated as CAS, then divide 360 by sustained degrees per second.

For the Fw 190 use the installed model from `validation/diagnostics/fw190a4.cjs` and its `fastFlight` envelope for the two extra DCS heights. For the P-38 use the two-engine model in `validation/diagnostics/p38g.cjs`, with its existing level and climb configurations. Its best-climb context samples 120–220 mph EAS in 1 mph steps. For the DCS table retain native weights and default model ratings. This review changes no inputs or coefficients.
