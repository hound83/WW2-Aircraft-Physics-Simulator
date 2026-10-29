# Copy/paste this message in the main Europe Air War conversation

I've attached `Europe_Air_War_Research_Handoff_v0.2.zip`, which contains our complete researched aircraft-performance framework, including:

- `README_START_HERE.md` — handoff, scope, caveats and integration plan;
- `data/WWII_Aircraft_Complete_Data_Table_v0.2.xlsx` — the 142-field source/data inventory and 46-column, 66-row live-formula Greg-style table;
- `visuals/P51B_Greg_Complete_Table_Visual.png` — exactly the readable complete Greg-style result we want to see in the simulator;
- `framework/FRAMEWORK.md`, `p51b15.json`, `aircraft.schema.json`, `performance_engine.mjs`, `test.mjs`, `demo.mjs` — the four-phase source-led design and working P-51B reference implementation.

**Please read `README_START_HERE.md` and `framework/FRAMEWORK.md`, inspect the spreadsheet and picture, then integrate this into our existing Europe Air War v7.5 work.** Keep the Site and interface we've been developing; don't replace it with the bare reference demo. The whole point is a historically credible, impressive multi-aircraft laboratory, with the actual Greg-speed analysis built in and understandable to users.

Critical decisions:

1. Multiple real aircraft/variants eventually, not merely P-47 vs Bf 109. Each variant needs its own historically documented geometry, engine/power-vs-altitude, boost and blower gear, weight/configuration, drag polar and propeller-efficiency evidence.
2. The aerodynamic engine computes parasite/induced drag independently at many speeds and altitudes. **There is no universal drag percentage or propeller efficiency.** The existing .80 eta / .016 CD0 / .80 Oswald-e / 1.60 CLmax in the P-51B example are explicitly **D-grade provisional assumptions**, not historical measurements.
3. Changing the altitude slider recalculates **both** available engine horsepower (by rating/gear/critical altitude) and required power through density/drag. Boost must be limited by actual historical ratings/durations/service dates.
4. Include power available vs power required, excess power, Ps, climb, acceleration, G/sustained turns, instantaneous turns, energy maneuverability, stall boundaries, and eventually operational fuel/thermal/load effects. Show missing values transparently.
5. Use NACA/USAAF/manufacturer primary research and transparent calibrated secondary proxies where required. The NACA P-51B-1 propeller-off drag results are NOT direct P-51B-15 prop-on measurements. Preserve provenance and measured-vs-estimated quality badges.
6. Use the provided poster as a **visual acceptance reference**: the tool should be able to present the complete 46-field Greg-style analysis for any selected aircraft/variant and flight state once its source data is available.

Please begin by inspecting the ZIP and telling me which pieces can be imported directly, which require source research or physics revisions, and how they fit into our four implementation phases. Continue our existing v7.5 design and development from there; preserve all existing work. The reference test command is `node framework/test.mjs`.
