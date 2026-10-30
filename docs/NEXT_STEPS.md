# Next steps

## Completed bounded milestone: executable stall gate

The source gate and opt-in EAS/weight sensitivity pathway are implemented for four benchmark aircraft. Default coefficients remain unchanged because no matched near-stall correction is verified. See [source audit](STALL_SOURCE_AUDIT.md), [comparison](STALL_CALIBRATION_RESULTS.md) and [current validation](CURRENT_VALIDATION.md). Frozen import and Greg material remain intact.

## Next single assignment: P-51B near-stall calibration

Obtain and audit a configuration/specimen-matched low-speed airspeed calibration for P-51B-15 43-24777 at the 8,000-ft stall condition. Start with the existing report, its instrument/static installation, and linked original evidence. Record calibrated speed coverage, instrument/position uncertainty and contemporaneous mass. If supported, populate `references/stall-calibration.json`, pass the existing gate and quantify changes to lift/turn outputs. If unavailable, record the evidence limit without inventing a correction. Preserve other aircraft coefficients and the Mustang climb failure. Stop at this one source/calibration milestone.

Do not add aircraft, redesign the Atlas, expand all NACA research or fix unrelated propeller/climb issues. Current source history is in GitHub; use a fresh Work session per substantial assignment.
