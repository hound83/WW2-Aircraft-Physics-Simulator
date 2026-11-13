# Minimum viable sim data requirement

Use this checklist to assemble an aircraft input dossier. Identify the exact airframe and installation, or name the representative configuration and record the basis for transferring each value. Keep source values, calculations and engineering assumptions traceable.

## Required inputs by use

| Input | Research profile | Speed and climb comparison | Acceleration and sustained-turn comparison |
| --- | --- | --- | --- |
| Geometry and loading | Wing area, span, a reference mass and its fuel, ammunition, stores, gear and flap state | Document the test mass or a defensible range for each condition | Match mass and load factor throughout the comparison |
| Engine and propeller | Engine and propeller installation, diameter, blade count, gearing, a rated power schedule and an efficiency estimate | Identify the relevant rating, boost, RPM, blower or turbo schedule, critical altitudes, applicable limits and cooling state. Keep installed, chart-assigned and estimated shaft power identifiable | Bound effective propulsive power at the maneuver speeds. A single efficiency estimate can start a sensitivity run |
| Level speed and climb | Source points or a documented transfer in a named condition | Seek 3–5 points each across the supported altitude range, including both branches where applicable. A matched time-to-height segment can constrain climb. Carry original speed basis, power, loading and cooling, and reserve available points for checking | Use a separate high-lift or off-design check where available and report the supported speed, altitude and load-factor range |
| Stall and lift | Clean stall from source CAS/EAS, then source IAS, then a documented estimate. Use **emergency research needed** when all are unavailable | Retain source mass, power, speed basis and configuration. Use IAS as cockpit evidence and carry a documented correction or range when estimating lift | Derive clean `CLmax` from matched EAS, mass and wing area. Carry position-error or run-weight uncertainty into maneuver lift |
| Drag | A condition-specific two-term drag polar, or documented coefficients from the same installation | Greg's drag split with a known total-drag anchor is sufficient to calculate a first polar. Check it against any reserved performance observations and record sensitivity to the split and propeller efficiency | A second drag constraint at a meaningfully different lift coefficient, or a matched sustained maneuver, supports stronger claims about drag under load |

A first research profile can use 0.80 as an explicitly assumed propeller efficiency where a better input is missing. Record any effect on the result. Use the power branches the installation actually has, including a hydraulic supercharger or turbosupercharger where appropriate. Use the data at the confidence each metric earns.

## Calculating drag from sparse evidence

Use consistent units. Let `q = ½ ρ V_TAS²`, `CL = n W/(q S)`, and `CD = CD0 + k CL²`, where `W` is weight force and `n` is the load factor. The parasite and induced terms are `q S CD0` and `q S k CL²`.

1. **One anchor and a drag split.** For total drag `D` and induced fraction `f` at the anchor, use `CD0 = (1−f)D/(q S)` and `k = fD/(q S CL²)`. A bounded Oswald efficiency `e` and `AR = span²/S` can instead supply `k = 1/(π e AR)`. In steady level flight use `D = P_effective/V_TAS`, with installed shaft power, propeller efficiency and any separately supported residual thrust. Record how the total and split were obtained. The split applies at the anchor. Recalculate both terms as speed, density or load changes.
2. **Two drag anchors.** For the same configuration at sufficiently different `CL²`, use `k = (CD₂−CD₁)/(CL₂²−CL₁²)`, with `CD = D/(q S)`, then `CD0 = CD₁−k CL₁²`. Check positive, plausible coefficients and sensitivity to the separation between the points, power uncertainty and airspeed error.
3. **Check and label the result.** Store the source IDs, conditions, split or efficiency range, applicable envelope, and which observations were fitted or reserved. Record the drag polar as calculated. A reserved speed, climb, glide or powered maneuver can check a part of the envelope. Limit extrapolation into stall, compressibility, different cooling or stores, and high load factors to clearly labeled estimates.

Greg's Bf 109 F-4 table uses 1,137 lbf parasite and 81 lbf induced drag at 325 mph. At the same density and weight, scaling the terms by the square of speed and its inverse reproduces about 644.5 lbf total at 200 mph versus 646 lbf in the table. [Greg reference rows](../../aircraft/cases.json) · [Arithmetic replay](../../validation/diagnostics/greg_reconciliation_v11.cjs) · [Induced drag relation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/induced-drag-coefficient/)

## Other inputs that can be calculated

| Quantity | Inputs needed |
| --- | --- |
| Clean `CLmax` and stall at a different mass | EAS at the reference stall, mass, wing area and matching configuration. Use `CLmax = 2W/(ρ₀ S V_EAS²)` and the square-root weight rule at the same load factor and lift limit |
| Excess power and drag in climb, glide or acceleration | True speed, vertical speed, change in true speed and weight. At known propulsive power, `D = (P_effective−W·dh/dt−m V·dV/dt)/V`. A power-off glide may include windmilling or idle thrust |
| Time to climb and climb fuel | Integrate a condition-matched climb-rate schedule and account for blower changes. Calculate fuel used from a matched fuel-flow schedule or read it from the trial |
| Propeller advance ratio, tip Mach and power between source points | Gear ratio, propeller diameter, RPM and true speed, plus atmosphere for Mach. Interpolate only within a documented power branch and keep power and efficiency uncertainty separate |
| Cooling or stores drag increment | Paired runs with the same installation and known power, weight, cooling and external-load differences. Carry propulsive-efficiency uncertainty into the result |

See the [fighter input roadmap](WW2_FIGHTER_DATA_ROADMAP.md) for the next dossiers and the [data handoff](../SIMULATOR_DATA_HANDOFF.md) for the production pack.

## Greg's workflow for limited datasets

Use this workflow to build a minimum viable research dossier while primary sources are still being recovered. One credible performance anchor and a documented drag split or Oswald efficiency range are enough to start a provisional drag curve. The [required inputs by use](#required-inputs-by-use) table guides which comparisons the resulting dossier can support.

1. **Choose the anchor.** Start with the best identifiable steady level speed and matched installed power, or a reported total drag or drag split. Record the airframe, speed basis, altitude, loading, power setting, propeller and cooling or stores configuration. A traceable secondary reading or comparable installation can supply a provisional anchor when primary evidence is sparse. Record the basis and uncertainty of the transfer.
2. **Fill the gaps that affect the result.** Start with the available geometry, loading and propulsion data. Use the [drag equations above](#calculating-drag-from-sparse-evidence) with the anchor split or a bounded estimate of the induced term. Vary uncertain inputs such as propeller efficiency, weight or the drag split to produce a central estimate and a plausible range. Use a source-indicated stall speed as a cockpit reference and document any correction used for lift.
3. **Build and hand off the first curve.** Calculate drag and power required across the speeds relevant to the dossier. Recompute both drag terms at each speed or load. Carry full precision through the calculation and round for display. Save the anchor and source locators, formula, assumptions, central estimate, range and supported conditions with the aircraft. Mark the curve as **calculated** and the assumed inputs as **estimated**. The result can support preliminary speed and climb work within that scope. Label any extension to higher lift, another configuration or an untested speed range as provisional.
4. **Check what you can and target the next measurement.** Reserve a usable point for checking whenever the data allow. A lower-speed or higher-lift observation helps constrain induced drag, and a power or propeller measurement can narrow the effective-power range. Record the residual and the check's source lineage. With only the fit anchor, keep the curve available for provisional use and name the single observation that would most improve it. Update the estimate as stronger evidence arrives.

**Rounding in the F-4 replay.** The required-power difference averaged 2.27 hp across the 11 tabulated points. Greg attributes the small offset to rounding compounded across intermediate steps in his worksheet. The replay reproduces the worksheet method using the published rounded values. A flight-data check would establish how well the resulting curve predicts aircraft performance. [F-4 worksheet values](../../aircraft/cases.json) · [Replay diagnostic](../../validation/diagnostics/greg_reconciliation_v11.cjs)
