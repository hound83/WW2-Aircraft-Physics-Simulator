# Known uncertainties, unsuccessful tests, and next model gates

**Not a declaration of completion:** Historical reproduction of single flight tests is often incomplete due to cooling/boost/airspeed/specimen condition. No flight model is yet validated for historic combat turn comparisons.

**New v1.7 F4 conditional narrowing, but NOT historical closure:** An IL-2 Great Battles game specification (another simulator, NOT an actual F4 flight test) specifies F4 turn 20.3 seconds sea level and 26.1 seconds at 3000m, 270km/h IAS, emergency rating, normal 2890kg. Our e=.78 predicts 17.47/21.06s; one e=.54698 inferred from ONLY the game sea-level result predicts 25.89s withheld vs 26.10s game. Greg e=.55767 is similar. The v1.7 UI defaults the F4 to this explicitly **game-conditioned working scenario**, with switch back to generic; **do not claim a historical measured F4 e or eliminate possible alternatives**. F4 IAS/CAS correction remains unknown and is currently a labeled IAS≈CAS proxy. Hypothetical ±5% installed-power changes inferred e from .517 to .580. Original type-specific drag/prop/turn tests are still P0/P1 evidence gates.

**New shared low-speed prop issue:** Original [NACA TN 2022](https://ntrs.nasa.gov/citations/19930082679) reports decreased three-blade propeller efficiency with higher climb blade loading from induced losses, whereas candidate-C universal heuristic has a weak opposite η(power) sign for BOTH P51/F4 low-speed points. This evidence is qualitative and a different radial aircraft installation; transfer **no numeric curve**. Resolve with P-51 K-6523A-24 and Bf109 VDM propeller source maps if obtainable. P51 absolute climb deficits remain 419/401 fpm; NACA evidence is not a source to patch them arbitrarily.

**New v1.6 physics blocker:** inspected ORIGINAL Wright Field P-51B 43-24777 Fig.5, at 22,400ft (scans saved). At 318mph true / 2300rpm original chart shows about 610 TEST bhp. Common prop C, source-actual rpm and frozen sea-level high-speed calibrated drag predict about 729 bhp. Implied prop efficiency .946 at current polar, exceeding generic η cap .91. Sweeping e all the way to 1.00 still does not remove the lower/mid-speed residual. **Do not fix this by choosing e=1, making Mustang prop η=.946, inventing extra engine/exhaust thrust, or applying P-47's fitted climb penalty to P-51.** Original charts Fig1 IAS calibration and Fig6/7 climb/power are now local, but do not contain a complete prop thrust map or matched climb IAS schedule. First reconcile test chart conditions, installed prop performance and low/mid aerodynamic shape.

## Concrete remaining scientific work (priority order)

**P0 — measurement comparability and input states**
- Explicit IAS→CAS from actual aircraft/condition calibration; CAS→EAS compressibility; EAS↔TAS atmosphere. Keep raw reported IAS, published corrected TAS and corrections separate. Do NOT apply correction twice. Especially critical for P-47 near-stall manual 115 mph IAS (clean) because the manual calibration starts at 170 mph IAS; do NOT extrapolate without provenance.
- Ensure Bf109F-4 Greg 325 mph worksheet remains its own power assumption. Other sources propose 325 mph at combat / 336 mph emergency; exact DB601E boost and power curves need report-backed resolution before replacing rating labels.
- Implement test-specific cooling/engine operating state; P-47B Wright Field high-altitude climb uses less MAP than level-speed runs. P-51B first 20 May and separate 15 May weight series are distinct, and their climb-speed schedule is unverified.

**P1 — lift, climb and comparative evidence**
- Derive physically bounded CLmax using correctly corrected stall EAS and test weight; use n_L = (V_EAS / Vs_EAS)^2 for constant weight/configuration; enforce stall and structural/G limits. Never let a below-stall point report achievable positive climb/turn just because unconstrained P_excess>0.
- Use independent climb/engine test conditions and don't apply the P47B fitted aggregate cooling Cd0 penalty to P-51B. P51 67→75 inHg reported +560 ft/min; candidates predict distinct absolute errors and power difference; no winner yet.
- Induced drag / Oswald e is a high-impact turn comparison assumption: Greg BF109F4 implies a different value than his P47 example at assumed weights; use wing geometry and sensitivity, not one universal 93/7 split.
- Keep shaft horsepower, propulsive power and thrust distinct, identify speed vs climb engine ratings and conditions. Never use a 2,600-bhp D28 row to model 2,000-bhp P47B without labeling the scenario.

**P1 — distinct external-store changes**
- Mosquito B IX LR495 raw peak-speed differences ~20/22 mph; RAF historical stated 15–18 mph with airframe-deterioration caveat, unmatched peak altitudes. Model v0.6 infers 14.85% equivalent additional parasite fraction from low-alt pair and predicts 383.01 mph at high-alt pair — NOT validated 0.01 mph accuracy.
- Fw190 A4 WNr619 source Report 1 321→293 mph with four 50-kg bombs. Transferring Mosquito 14.85% stores penalty predicts 304.58 mph (~+11.58 mph too fast): FAIL. Store geometry and rack position matter; build and test drag area Δ(Cd S) profiles; don't guess a universal fixed percentage.
- Fw190 Report5 loaded external tanks can add 6–7 km/h to IAS underread, not directly comparable across source series; no double correction.
- Greg P38 vs Mosquito-with-bombs screenshot is a secondary graph without authenticated original conditions; P38G clean Wright Field values are separate.

**P2 — valid-source simplification choices**
- Compare A fixed prop eta, B simple speed-dependent, C heuristic J/Cp/Mach on one same scored test set; no generic propeller class wins on all studies. P47B six-propeller historical swap can produce opposite trend to simple diameter-only model.
- Any aerodynamics model may use defensible uncertain CD0, Oswald e, eta, CLmax; provide *ranges* and per-output sensitivity; input assumption priority matters more for stall/turn than peak cruise speed.
- Encourage controlled changes of engine rating, propeller, cooling and stores on the *same aircraft specimen* as stronger tests than mismatched max-speed summaries.

**Validation meaning:** Greg spreadsheets=internal arithmetic regression, not independent evidence. Historical report transcriptions=observational evidence with audit caveats. Unit tests=physics invariants, not historical fit. Climb fit point vs withheld points must be distinguished; P47 and P51 comparisons depend on reported conditions and actual climb airspeed availability.
