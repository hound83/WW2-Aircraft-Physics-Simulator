# Next steps

## Completed bounded milestones

- Executable stall gate and four-aircraft sensitivity: [source audit](STALL_SOURCE_AUDIT.md), [results](STALL_CALIBRATION_RESULTS.md).
- P-51B installation/correction audit: [findings](P51_LOW_SPEED_CALIBRATION_AUDIT.md). No matched near-stall correction established.
- P-47B original acceptance report: [findings](P47B_STALL_WEIGHT_AUDIT.md). New 105 mph indicated clean power-off observation; both nominal loading statements and the complete correction-table basis retained. Instantaneous mass, stall altitude and near-stall correction remain blocked.

- Bf 109 F-4 bounded audit: [findings](BF109F4_STALL_AUDIT.md). Original stall pages remain unverified; placeholder specimen matches and undocumented/mismatched slat states now fail the gate. No numerical recalibration.

These feature milestones preserve default numerical behavior, frozen source/Greg material and the Mustang climb failure. See [current validation](CURRENT_VALIDATION.md). Open feature PRs are not released main.

## Next single assignment: Spitfire LF IX original stall evidence

Audit an original Spitfire IX manual/test for applicability to LF IX BS543, clean power-off stall, instantaneous weight/configuration and calibrated airspeed basis. Keep other marks, engines, wings and generic pilot-note figures separate. Record supported observations in the existing source gate; quantify only defensible numerical changes. Stop with the evidence finding, tested data/code improvement and reviewable commit, rather than broadening into an all-aircraft literature search.

Reopen F-4 only with new original stall/configuration, weight and calibration evidence. Reopen P-47B numerical calibration only with new matched stall-run/loading and low-speed correction evidence. Reopen P-51 only with new matched original instrument/stall sheets. Do not repeat unavailable corrections as new milestones. Use current GitHub records and a fresh Work session for the next substantial assignment.
