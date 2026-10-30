# Next steps

## v2.6.0 completed research increment

The accumulated four-aircraft stall gates, 69-record performance package, climb-energy diagnosis and Mustang original-chart reconstruction are combined with the [installed-propeller candidate audit](P51_PROPELLER_EFFICIENCY_AUDIT.md). See [release notes](../releases/v2.6.0.md).

C/D/N/M were compared with both the original and separately anchored polars. D/N/M improve some Figure 5 diagnostics but worsen sampled low-altitude climb after preserving the original speed anchor. No inspected source establishes a measured target-installed efficiency map. Preserve C; no default numerical changes or validated historical accuracy claim.

## Next cohesive milestone: source-bounded climb-power input mode

Use readable Figure 7 low-blower BHP states to implement an explicit source-chart diagnostic input mode, separate from the level-flight/ram proxy. Extend coordinates only where original curve/rating/RPM identity is readable. Preserve missing high-blower transitions, actual climb airspeed and instantaneous weight as exclusions; do not extrapolate the level-flight engine curve beyond its source domain.

Acceptance: traceable input nodes/reading limits, shared-solver use with explicit original versus candidate polar, before/after climb and level-speed diagnostics, preserved default behavior and npm run check. This mode must not imply that chart-assigned BHP is measured torque or that a normalization weight is actual climb mass. Keep Atlas/UI redesign and additional aircraft out of scope. Complete one research/code/test/review milestone without routine substep approvals.
