# WWII fighter input reference · Fighter Sim Inputs v1.4.0

These inputs link the German engine ratings to the original tables and give the simulator separate records for the actual test installations. Every value carries a source locator and its original unit. [Source register](../../references/research/ww2_engine_ratings_and_propeller_2026-11-12.json) · [Simulator handoff](../SIMULATOR_DATA_HANDOFF.md)

## Starting numbers

| Aircraft and condition | Input |
| --- | --- |
| **Bf 109 G-2, DB 605 A, B4, climb and combat** | **1,310 PS at 0 m** and **1,250 PS at 5,800 m**, both at **1.30 ata / 2,600 rpm**. Engine-to-propeller reduction **1.685:1**. Retain the actual conditions on the WNF and Finnish MT-215 flight traces. |
| **Fw 190 A-4, BMW 801 D, climb and combat** | **1,520 PS at 700 m in low gear** and **1,320 PS at 5,300 m in high gear**, both at **1.32 ata / 2,400 rpm**. These are the handbook full-throttle heights without ram. Use WNr 783's actual speed and boost for the installed flight checks. |
| **Bf 109 G-1 WNr 14026, DB 601 E and DB 605 A** | The DB 601 E test reached **622 km/h at 6,000 m**, and the DB 605 A test reached **626 km/h at 6,100 m**. Both used a **1.30 ata** target, at **2,500** and **2,600 rpm**, respectively. The engine, intake and propeller differed between the two installations. |
| **P-47D-28, NACA modified Curtiss 838-1C2-18** | The recorded climb efficiencies average **82.5% Normal**, **79.9% Military** and **78.2% War Emergency**. The observations apply to the tested three-blade propeller with trailing-edge extensions. |

The Daimler-Benz table lists **1,475 PS at 1.42 ata and 2,800 rpm** in a separate emergency rating. Use the documented combat setting for the restricted G-2. The same useful power as 80% of 1,310 PS would imply **71.1%** if divided by 1,475 PS. Preserve metric horsepower and convert with **0.73549875 kW per PS**. Label the power as an engine rating when the flight report supplies no installed measurement. [Daimler-Benz PDF pp. 12 and 14](https://degnans.com/markd/DB605.pdf) · [G-2 operating limits and WNF tests](WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md#bf-109-g-2)

## Flight checks

- **Fw 190 WNr 783.** Long external intakes reach **652 km/h TAS at 6,950 m**. The normal internal intake reaches **645 km/h at 6,000 m**, where the long-intake curve reads about **631 ±4 km/h**. The climb full-throttle heights are **6,150 m** with long external intakes and **5,500 m** with the internal intake. At 10,000 m the long-intake test reads **0.91 ata** in level flight and **0.80 ata** in climb, each with **±0.025 ata** chart reading allowance. Use the installation and flight phase on every lookup. [783 Nr. 1 and graphs](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-783-nr1.html) · [783 Nr. 2 pp. 1–2](https://www.wwiiaircraftperformance.org/fw190/Fw_190_783_Nr2.pdf) · [A-4 handbook p. 9](https://degnans.com/markd/Fw%20190%20A-2%20bis%20A-4%20Teil%2000.pdf)

- **BMW 801 D-2 gear selection.** NACA E5D19 tested a removed controller from engine 304068. It found about **5,200 ft** of overlap between the upward and downward gear changes on the bench. The shift depended on engine speed and the direction of the pressure change. [NACA E5D19 pp. 2–3, 8, 14–15 and Fig. 14](https://ntrs.nasa.gov/citations/19930093290)

- **Messerschmitt WNr 14026.** Blatt 1 prints **622 km/h**. The earlier **522** reading came from OCR. Blatt 7 places the curve near 619 km/h before the report's **+3 km/h** radiator-indicator correction, which the summary already includes. The pack keeps the original chart readings and corrections with **±3 km/h** reading allowance. Withholding each interior point and interpolating on its side of full-throttle height gives **5.00 km/h** mean error for the 601 E and **3.38 km/h** for the 605 A. Keep the observed nodes near full-throttle height. Use the two G-1 installations for comparison with the F-4 and G-2. [Messerschmitt 109 19 L 42, Blatt 1–4 and 7–8](https://www.wwiiaircraftperformance.org/me109/VB-109-19-L-42.pdf)

## Independent propeller check

NACA L7D10 Tables I and II add 50 in-flight readings. The printed efficiencies agree with \(J C_T/C_P\) and the tip Mach values agree with \(M\sqrt{1+(\pi/J)^2}\) within table precision. The 80% and 76% references were set in v1.3 before these points were collected.

| Climb rating | Readings | Observed span | Mean absolute error at 80% | At 76% |
| --- | ---: | ---: | ---: | ---: |
| Normal | 24 | 81.1–84.4% | 2.51 pp | 6.51 pp |
| Military | 14 | 78.9–81.7% | 0.74 pp | 3.89 pp |
| War Emergency | 12 | 76.6–79.5% | 1.79 pp | 2.21 pp |

Use **80%** as the starting reference in comparable conditions. The **76%** reference applies to the separately checked P-47B Curtiss 714 military climb and the stated fast-flight tip Mach branch. [NACA L7D10 printed pp. 12–13](https://ntrs.nasa.gov/citations/20050019331) · [v1.3 checks](WW2_PROPELLER_REFERENCE_VALUES_2026-11-12.md)

## Using the inputs

1. Read `engine_reference.rated_power` in `dist/fighter-sim-inputs.json` for the original PS anchors and their kW/BHP equivalents. Read `engine_reference.flight_tests` for the installed level TAS and boost comparisons. Six reviewed cases cover the four combat power anchors and both WNr 783 intake configurations.
2. Match rating, RPM, gear, altitude, flight phase and configuration. Use the existing 6 km/h level TAS spread and 5% timed climb spread. Retain the original values and allowances with the preferred case.
3. Preserve the airspeed basis. \(V_{EAS}=V_{TAS}\sqrt{\rho/\rho_0}\). Apply the test's instrument and position corrections for IAS to CAS. For a clean-stall transfer, use actual stall mass and matched configuration. [Airspeed conversions, *Aerodynamics for Naval Aviators*](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf) · [Data contract](WW2_FIGHTER_SIM_INPUTS_V1.md#simulator-handoff)

The 110 additional catalog rows include 50 newly transcribed propeller points and 22 original Messerschmitt speed readings. The rubric already credits installed-engine evidence on the G-2 and A-4. The coverage delta is **0 pp** and the GOLD and GOLD* delta is **0**. The next source targets are the DB 601 E power-altitude table at **1.30 ata / 2,500 rpm** and the actual MT-215 run loading. [DB 601 E-G manual inventory, May 1942, frame 4587517](https://www.maparchive.ru/nara-doc/Field_and_Technica_Manuals/Field_and_Technical_Manuals.pdf)
