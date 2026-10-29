# European Air War source-first v2.4 — START HERE

**Scope:** universal 4-aircraft experimental flight physics, + two source-informed NACA prop research options, including 1938/1945 tip-Mach sensitivity. This is a larger research evidence consolidation on top of the **pre-existing** v2.3 112-report NACA registry; not 112 newly downloaded originals.

1. Open `03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/Universal_Four_Aircraft_Model_v2.4.html` for standalone/offline aircraft comparisons. Defaults to the pre-existing C physics. Experimental N and M available in propeller selector.
2. Read `03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/README_CLEAN_v24.md` for model derivation, results and known misses.
3. Browse the 20-record ranked source subset under `06_SOURCE_AND_SCIENTIFIC_EVIDENCE/NACA_1934_1946_DEEP_RESEARCH/NACA_ADDITIONAL_PRIORITY_REGISTER_v24.csv`. Also includes prior NTRS 112-record metadata and 1945 source-page text extracts.
4. Reproduce checks: `cd 03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE && node naca_mach_analysis_v24.cjs --write && node --test test_*.cjs`. All 27 scripts passed in this build.

### Important limitations

- The underlying 112 original NACA PDF scans (total >1.5GB, per inherited metadata) were **not included in the pre-existing v2.3 portable ZIP and are NOT in this ZIP either**. Their NASA URL citations, prior hashes/download logs, indexed extracted text and existing selected figure images are preserved. They are not represented as verified downloadable PDF originals in this archive.
- Period source 1945 says 'about 7 percent' reduction: the v2.4 M research model **assumes relative efficiency percentage rather than absolute η percentage points**; interpretation requires further audit.
- M is a transferable, *opt-in* historical physics hypothesis, NOT a validated K-6523A-24/VDM/Rotol prop map, and the Mustang's remaining climb deficit is unresolved.
- The 1943 NACA F2A-3 *measured* turn paper is cataloged as a future independent test; numerical turn-chart points not yet transcribed. Do not use IL-2/DCS or F2A as direct measured turn data for Bf109 or Spitfire IX.
- Model website/GitHub Atlas deployment not touched.
