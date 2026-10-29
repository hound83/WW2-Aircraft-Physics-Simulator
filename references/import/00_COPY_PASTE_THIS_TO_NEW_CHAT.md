# START HERE — copy into a NEW ChatGPT chat in the Hobby project

Continue my **European Air War universal WWII flight-performance model** using the attached `European_Air_War_v3.0_COMPLETE_HANDOVER_STARTER.zip`. This is a complete handover for **BUILDING v3.0**, not a claim that v3.0 has already been built or validated.

**FIRST read** these files inside the ZIP:
- `00_START_HERE.md`
- `01_COMPLETE_V2_5_BASELINE/07_DECISIONS_AND_HANDOVER/ACCEPTED_MODEL_DECISIONS.md`
- `01_COMPLETE_V2_5_BASELINE/07_DECISIONS_AND_HANDOVER/KNOWN_ERRORS_AND_OPEN_ITEMS.md`
- `02_V3_STALL_WEIGHT_AUDIT/STALL_WEIGHT_GATE_v3_prework.md`
- `02_V3_STALL_WEIGHT_AUDIT/stall_evidence_register.csv`
- `V3_PLAN_AND_ACCEPTANCE.md`
- the latest full working source and v2.5 test suite in `01_COMPLETE_V2_5_BASELINE/03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/` (legacy directory name; it CONTAINS v2.5).

**OUR GOAL:** One reusable, scientifically defensible, reasonably simple physical model that calculates max speed, shaft/propulsive power, climb, stall, Ps, sustained/instantaneous turn and energy performance for many historical WWII aircraft. The initial four benchmark aircraft are **Bf 109F-4, P-47B, P-51B-15 and Spitfire LF Mk IX**. Keep Greg's original drag/power spreadsheets and controlled 2,000/2,600 hp P-47 case; the 2,600 hp case is not a verified historical P-47B rating.

**ACCURACY GOAL:** Aim for **5:1 separation**: any claimed difference between aircraft should be at least five times the validated worst-case *combined differential prediction error* under comparable conditions. For a 1.3-second historical turn-time gap, this requires a total differential-error budget <= 0.26 seconds, e.g. <= +/-0.13 sec per aircraft if two equal opposite errors are conservatively assumed. This is an ambitious target, NOT measured accuracy. If sources cannot support the precision, label the matchup unresolved rather than narrow uncertainty artificially. Check both absolute residuals and differential errors; simulator specifications IL-2/DCS are independent sanity checks only if not used to fit, NEVER historical measurements.

**HIGHEST PRIORITY / FIVE STEPS:**
1. Audit clean **POWER-OFF STALL, TEST WEIGHT, CONFIGURATION and wing area** for the four aircraft using original flight-test reports, NACA/NASA, RAF/A&AEE, German primary sources, and pilot manuals.
2. Apply IAS -> CAS -> EAS (and TAS where needed) using the *actual aircraft-specific low-speed calibration*; don't equate IAS to EAS, double-correct, or extrapolate the high-speed calibration to stall without evidence. Keep unmatched variants/weights separate.
3. Only derive CLmax from verified matching corrected stall EAS + actual weight + wing area; otherwise preserve explicit, labelled assumptions and physical bounds.
4. Recalculate lift-limited and power-limited turn/energy envelopes with ONE shared lift/drag/power solver. Include stall, structural G, weights, engine setting, and the distinction between instantaneous and sustained turn. Explore whether correcting stall actually changes the rankings; do NOT assume it fixes power-limited turns.
5. Run all four-aircraft speed/climb/turn/stall regression tests (plus Greg and the P-47 propeller NACA fixtures), publish **absolute results, historical values, error by point, and matched-condition pairwise differences**. Test the 5:1 criterion and flag unresolved matchups.

**IMPORTANT PRIMARY SOURCE INCLUDED:** The actual 35-page December 1944 NACA ACR L4L07 Curtiss 714-1C2-12 P-47C propeller PDF, containing Tables I/II, figures 4-6, 8-10 and the blade geometry. It corrects an OCR misread: climb run 20-1 has efficiency 0.779, not 0.799. Prefer tables to manually digitizing plots where both exist. This propeller family is particularly relevant to the P-47B/C but is NOT a universal curve for all aircraft.

**KEEP EYES ON THE BALL:** Do not add aircraft, redesign the Atlas website, rebuild the UI for cosmetic reasons, endlessly expand sources, or add variant-specific fudge factors. Gather specific missing evidence as needed, but **deliver a working consolidated v3.0 engine + tested standalone HTML + source/validation tables + full self-contained handover ZIP**. Preserve what already works, show before/after numerical regressions, and explicitly disclose remaining failures. Do not invent unverified calibration corrections. If blocked, make the strongest source-bounded implementation possible and mark the blocker.

**MODEL CURRENT STATUS:** v2.5 is the working baseline (not validated v3). P-47B and P-51B max-speed predictions are promising; the P-51B underpredicts two 2,200-ft climb tests by ~400 ft/min; 109 turn assumptions remain too wide and IL-2-conditioned; Spitfire predictive boost/climb improved; low-speed propeller-power loading is an identified weakness. The v3 prework audit found no verified aircraft-matched low-speed correction for *any* of the four that supports a precise historical clean CLmax. Its hypothetical corrections are sensitivity examples, not measurements.

Please **inspect the attached files, set up the actual source, make the next meaningful changes, run tests and produce the artifacts**, rather than only propose another incremental research agenda. Do not modify the GitHub Atlas website unless I explicitly ask.
