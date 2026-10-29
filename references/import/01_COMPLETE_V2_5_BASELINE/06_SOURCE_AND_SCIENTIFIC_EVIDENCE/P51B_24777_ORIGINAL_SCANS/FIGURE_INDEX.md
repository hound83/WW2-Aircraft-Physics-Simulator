# Original period Wright Field P-51B-15 43-24777 figures

Source: USAAF Army Air Forces Materiel Command, Eng-47-1749-A, Wright Field,
20 May 1944. Original wartime image scans mirrored by Mike Williams at
<https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html>.

The four JPEGs in this folder are **unmodified downloaded source images**:

| Local scan | Original URL | Modeling relevance |
|---|---|---|
| `Fig_1_airspeed_calibration.jpg` | <https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Airspeed_Calibration.jpg> | IAS position correction; do not double apply to already corrected TAS |
| `Fig_5_power_required.jpg` | <https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Power_Required.jpg> | Original 22,400 ft **test shaft BHP versus true speed**, point engine RPM changes |
| `Fig_6_climb_vs_altitude.jpg` | <https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Climb.jpg> | 67/75 inHg climb rate vs altitude, not a measured climb airspeed schedule |
| `Fig_7_climb_power_vs_altitude.jpg` | <https://www.wwiiaircraftperformance.com/org/p-51/p-51_files/P-51B_24777_Power_vs_Altitude-Climb.jpg> | Original climb power versus altitude/manifold pressure, not a prop thrust map |

The six points separately listed in `../../03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/p51_power_required_source_v16.json` are *approximate digitization by eye*, not data printed as a numeric table. Their initial ±4 mph/±35 bhp reading limits do not cover all test-condition or horsepower-chart uncertainty.
