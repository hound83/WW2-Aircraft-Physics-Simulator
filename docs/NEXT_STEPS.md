# Next steps

## Completed bounded milestones

- Executable stall gate and four-aircraft sensitivity: [source audit](STALL_SOURCE_AUDIT.md), [results](STALL_CALIBRATION_RESULTS.md).
- P-51B installation/correction audit: [findings](P51_LOW_SPEED_CALIBRATION_AUDIT.md). No matched near-stall correction established.
- P-47B original acceptance report: [findings](P47B_STALL_WEIGHT_AUDIT.md). New 105 mph indicated clean power-off observation; both nominal loading statements and the complete correction-table basis retained. Instantaneous mass, stall altitude and near-stall correction remain blocked.

These feature milestones preserve default numerical behavior, frozen source/Greg material and the Mustang climb failure. See [current validation](CURRENT_VALIDATION.md). Open feature PRs are not released main.

## Next single assignment: Bf 109 F-4 original stall evidence

Audit an original F-4 flight manual or test for clean power-off stall, actual weight, slat/configuration state and calibrated airspeed basis. Keep F-2/G-series and simulator values separate. Record supported observations in the existing source gate; quantify only defensible numerical changes. Stop with the evidence finding, tested data/code improvement and reviewable commit, rather than broadening into an all-aircraft literature search.

Reopen P-47B numerical calibration only with new matched stall-run/loading and low-speed correction evidence. Reopen P-51 only with new matched original instrument/stall sheets. Do not repeat unavailable corrections as new milestones. Use current GitHub records and a fresh Work session for the next substantial assignment.
