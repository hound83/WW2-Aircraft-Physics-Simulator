# Next steps

## Completed bounded milestones

- Executable stall gate, four-aircraft EAS/weight sensitivity and explicit unresolved pairwise comparisons: [source audit](STALL_SOURCE_AUDIT.md), [results](STALL_CALIBRATION_RESULTS.md).
- Targeted P-51B near-stall source audit: [findings](P51_LOW_SPEED_CALIBRATION_AUDIT.md). Five candidates inspected; no matched correction established. The gate now checks pressure-installation identity and instrument-correction convention, including rejection of double correction.

Both milestones preserve default coefficients, frozen material, Greg checks and the existing Mustang climb failure. See [current validation](CURRENT_VALIDATION.md). Feature PRs must be reviewed/merged before describing them as part of main.

## Next single assignment: P-47B contemporaneous stall weight

Audit the original P-47B 41-5902 test/manual evidence for a clean power-off stall at documented instantaneous weight, configuration and measurement installation. Keep generic B/C/D/G manual figures and P-47D tests separate. Populate the existing source gate only with supported data; quantify any defensible correction or retain an explicit blocker. Do not broaden to a propeller redesign, new aircraft or Atlas work.

P-51 numerical calibration should be reopened only with new original 43-24777 stall/instrument sheets establishing the observed channel, correction convention, near-stall domain and uncertainty. Repeating the existing high-speed plot is not another milestone. Use current GitHub records and a fresh Work session for the next substantial assignment.
