# Aircraft and engine records

The [F4U-4 80765 profile](f4u4.json) is assembled with the shared solver by `validation/diagnostics/f4u4.cjs`. Source clean-stall CAS anchors, nominal engine ratings and equivalent low-J calibration have separate roles. [v4.0 scope and restrictions](../docs/V4_MILESTONE.md).

`cases.json` is the canonical active dataset: four benchmark aircraft, power/propeller/configuration records, historical transcriptions and Greg's internal arithmetic benchmarks. `stores.json` retains the inherited external-store fixtures; they do not expand the four-aircraft UI scope.

The setup copies both files byte-for-byte from v2.5. Future changes require source/configuration/weight/airspeed provenance and regression comparison. Dataset assumptions and simulator-conditioned values are not measurements.
