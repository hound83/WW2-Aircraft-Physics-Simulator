# Next steps

## v3.1 completed: condition-aware P47/Spitfire climb

The accepted engineering model reduces original reserved climb MAE by 39.5% for P47 and 29.3% for Spitfire, with unchanged clean speed and Mustang predictions. It uses recorded climb boost, a shared fitted power-response law and nonnegative configuration drag. The new application table uses fixed matched source conditions, not exploratory generic-flight controls. See V31_CLIMB_IMPROVEMENT.md for the fair refit comparisons, unfavorable alternate case and stress limits.

## Next cohesive milestone: high-altitude source-condition validation

Test the fixed v3.1 law against additional compatible high-altitude climb conditions before extending it to general climb predictions. Prioritize the existing P47 30000-ft deficit and Spitfire reference/climb boost gaps, especially 14000 ft. Use retained source scans and indexed evidence first; acquire only the specific missing power/configuration records that could distinguish the remaining hypotheses. Keep the selected law fixed during validation and separate any subsequent recalibration.

Acceptance: source-matched identities, rating/gear, actual or explicitly qualified mass, airspeed and cooling state; before/after residuals and unresolved input gaps; no invented source interpolation; npm run check and the conditioned-climb browser smoke. No Atlas work, new aircraft or unsupported turn/stall claims.
