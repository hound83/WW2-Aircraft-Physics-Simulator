# Current validation

v3.7: [four-aircraft flight scorecard](FLIGHT_SCORECARD.md) and [bounded Mustang clean-stall lift](../releases/v3.7.0.md).

Validated with Node.js 22 and headless Chromium. The GitHub Actions workflow produces the runnable HTML and point-by-point flight scorecard in its physics-validation artifact.

| Check | Result |
|---|---|
| Research version | 3.7.0 |
| Node regression scripts | 51/51 pass |
| Numeric values compared with v2.5 setup | 3628 |
| Exact floating-point differences | 38 |
| Legacy C changes above numeric tolerance | 0 |
| Missing / added numeric paths | 0 / 0 |
| Engine SHA256 | 67558157176b73a8799eb8eaecfec971b0c22d850802c1e1acd34afb1edcf667 |
| Interactive browser tests | Passed 32 headless checks |
| Historical stall/CLmax validation | Unresolved; executable source gate and four-aircraft sensitivity tested |
| 5:1 comparative accuracy | Unresolved |

v3.1 climb model: [condition-aware source-climb gains and tradeoffs](V31_CLIMB_IMPROVEMENT.md); clean and Mustang predictions retained.

v3.0 release candidate: [calculation domains, source nodes and scenario ranges](V3_RELEASE_CANDIDATE.md); historical accuracy unresolved.

v2.9 robustness: [power, mass, RPM and split sensitivity](V29_ROBUSTNESS.md); v2.8 working coefficients retained.

v2.8 working model: [joint calibration results](V28_RESULTS.md); P is the application default. Legacy C numerical compatibility is reported separately.

Chart-power mode: [explicit source-chart climb input](SOURCE_CHART_CLIMB_MODE.md); [progress assessment](PROGRESS_ASSESSMENT.md); legacy C predictions unchanged; P is the new working profile.

Propeller milestone: [coupled source/candidate audit](P51_PROPELLER_EFFICIENCY_AUDIT.md); retained as earlier research; superseded for the working profile by the v2.8 joint engineering fit.

Mustang reconstruction: [original chart power/weight states](P51_CLIMB_STATE_RECONSTRUCTION.md); sparse pixel-reading brackets and joint sensitivities, no default correction.

Climb diagnosis: [useful-power and cooling budget](CLIMB_POWER_COOLING_DIAGNOSIS.md); inverse sensitivities separated from measured corrections; default solver unchanged.

Speed/climb validation: [69 source-conditioned checkpoints](PERFORMANCE_VALIDATION.md); fitted, diagnostic and independently matched scores separated; no new historical accuracy claim.

Consolidated evidence review: [four-aircraft readiness](FOUR_AIRCRAFT_STALL_REVIEW.md), including the [Spitfire configuration audit](SPITFIRE_IX_STALL_AUDIT.md).

Bf 109 F-4 source milestone: [bounded audit](BF109F4_STALL_AUDIT.md); original stall pages unverified, specimen/slat gate tightened.

P-47B source milestone: [primary stall/loading audit](P47B_STALL_WEIGHT_AUDIT.md); 105 mph IAS observation added, corrected EAS/CLmax unresolved.

P-51 source milestone: [installation and low-speed audit](P51_LOW_SPEED_CALIBRATION_AUDIT.md); no supported coefficient change.

Stall milestone: [source audit](STALL_SOURCE_AUDIT.md), [comparison tables](STALL_CALIBRATION_RESULTS.md), [machine-readable results](../validation/current/stall-gate.json).


The setup baseline and current output include the same known scientific failures and provisional evidence. Zero numerical change establishes import parity, not historical accuracy. The original 30 regression scripts are preserved; additional scripts check current standalone embedding, stall-evidence/sensitivity and matched-performance scoring guardrails.

The P-47C 20-1 fixture still carries the original 0.799 OCR value; the handover reports 0.779 from the scan. This is an open evidence correction, not a setup regression failure. See [known limitations](KNOWN_LIMITATIONS.md).

README, scientific decisions, limitations and next priorities must be reviewed when accepting each milestone. This report is generated; it does not decide whether a physics change is scientifically justified.
