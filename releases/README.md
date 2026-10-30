# Milestones

## Baseline v2.5 import, 2026-10-29

Imported the working four-aircraft source, original Greg records, latest stall audit and regression suite into a dedicated physics project. Paths/tooling changed; equations, coefficients and input evidence did not.

The original standalone page is `baseline-v2.5.html`. Build the current code with `npm run build`.

Frozen GitHub branch: `baseline/v2.5-import`. This is a reproducibility checkpoint. It is not v3.0 and has no historical accuracy certification.

Major releases must document acceptance gates, results, remaining failures and unresolved comparisons before a stable version tag is created.

## v2.8.0 working approximation, 2026-10-30

Joint drag/propeller calibration becomes the application default P. See [results and limitations](v2.8.0.md). This is a useful engineering iteration, not an independently certified final model.

## v2.9.0 robustness, 2026-10-30

Stress power/weight/RPM and alternate fit assignments. Retain the v2.8 working calibration because no tested fixed replacement meets all cross-condition limits. See [results and limitations](v2.9.0.md).

## v3.0.0-rc.1 supported-envelope candidate, 2026-10-31

Live calculation coverage, qualified scenario differences, exact-node chart ranges and executed Chrome smoke checks. Working calibration remains v2.8; see [release notes](v3.0.0-rc.1.md). No stable v3.0 tag or historical accuracy claim.
