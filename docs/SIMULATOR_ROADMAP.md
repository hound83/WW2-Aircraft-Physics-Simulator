# Simulator roadmap · 27 November 2026

**Start with climb.** All 14 operating aircraft already have measured climb times. The 75 numerical comparisons are enough to find where the simulator gets the gap between two aircraft wrong. Clean stall has numerical checks on two profiles, both using another aircraft's data. Timed level acceleration has one, using a restored Mustang. Those two areas offer the best return from finding better measurements. [4.17 fleet baseline](research/M3_STALL_ACCELERATION_CLIMB.md#417-baseline-for-all-14-aircraft) · [Data inventory](research/WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md#what-the-simulator-can-check-today)

## M3 · One update for the 14 operating aircraft

Budget eight of the next ten work sessions for the three performance passes below. Use the other two for measured roll and the comparison screen. The allocations express priority and can move when a source search runs out of promising leads.

| Order | Sessions | Why spend time here? | Result to ship |
| --- | ---: | --- | --- |
| **1. Climb between common heights** | **4** | Existing clocks cover the whole roster. Run them first at each aircraft's test settings. Compare like altitude bands, rank errors that can reverse an ordering or materially change its size, and test the best-supported explanation across every affected profile. | Per-band measured and modeled seconds, leading aircraft and size of the gap. Show before/after results for a supported correction and regressions across all 14. Keep a single measured interval intact where no intermediate clocks exist. |
| **2. Clean stall at known weight** | **2** | Eleven profiles have linked records. A trial weight or a low-speed airspeed correction can make an existing measurement usable. Search by wing and configuration, prioritizing records that unlock comparisons across several variants. | Compare stall speeds for every supported pair at documented weight, gear, flaps and power. Distinguish an exact trial from a compatible-wing transfer and from uncorrected indicated speed. Aim for two families with usable measurements. [Stall audit](V412_CONTINUOUS_STALL.md) |
| **3. Timed level acceleration** | **2** | One common test chart contains four aircraft. Use the curves together and look for the original Finnish MT-215 sheet or another independent wartime run with usable test conditions. | Seconds through common speed intervals, with rating, loading, cooling, altitude and speed basis. Bundle the corrected Mustang reading with the other curves. Keep separate flights distinct from multiple points on one curve. [Chart and matched intervals](research/M3_STALL_ACCELERATION_CLIMB.md#timed-level-acceleration) |
| **4. Achieved roll rate versus airspeed** | **1** | A second measured speed for a documented pair adds more to a handling comparison than another assumption about pilot strength. | Show degrees per second at supported speeds. Start from the P-47B/P-51B 400 mph observations. Record test direction, configuration and force as supplied, and distinguish full deflection from a force-limited test. [Roll evidence](../references/analysis/fleet-roll-evidence.json) |
| **5. Put the measured gap on the comparison screen** | **1** | A correct ordering can still hide a large error in the margin. | At the selected condition, show the measured gap, modeled gap, and whether measurement or configuration uncertainty could reverse the lead. When only a prediction exists, label it. [Current benchmark](V417_EVIDENCE_AND_PERFORMANCE.md) |

### Two comparisons to check first

| Climb interval | Trial records | 4.17 replay | What it tests |
| --- | ---: | ---: | --- |
| Spitfire Va versus Bf 109 E-3, 3,280–19,750 ft | Va quicker by **64 s** | Va quicker by **26 s** | Correct ordering, understated margin. The Va clock is interpolated at the E-3's recorded heights. Look separately at the E-3's middle altitudes and the Va near its ceiling. [Band analysis](research/M3_STALL_ACCELERATION_CLIMB.md#climb-time-on-the-417-replay) |
| Bf 109 G-2 versus G-6/Trop, 5–8 km | G-2 **210 s**, G-6 **300 s**. Gap **90 s**. | G-2 **238 s**, G-6 **269 s**. Gap **32 s**. | The G-2 is about 28 s slow and the G-6 about 31 s fast. A blanket increase or decrease in climb performance would move one farther from its trial. Check the two schedules, altitude basis, loading and power before attributing the difference to the model. |

The G-2 comparison uses the Finnish clock starting at 5 km, with 3,050 kg nominal loading and unresolved altitude alignment. The G-6 comparison uses the German chart at 3,260 kg takeoff. Subtracting the G-6 cumulative times at 5 and 8 km gives 636 − 336 = 300 s measured and 586.1 − 316.8 = 269.3 s modeled. The G-2 replay takes 237.551 s. These gaps describe the two tests at their respective conditions. The 75 climb comparisons include repeated heights from individual trials. [Reproducible 4.17 fleet report in the build artifact](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/actions/runs/45638227636) · [G-6 chart analysis](research/BF109G6_HIGH_ALTITUDE_CLIMB_2026-11-22.md)

### How to choose a correction

Prioritize a lead when it can change a meaningful comparison, the test conditions are recoverable, and one result can check several profiles or distinguish two explanations. Use primary reports first, traceable secondary accounts next, and labeled IL-2 or DCS results for context. Look for an applicable calibration or a known-weight run across compatible wing variants. Keep clipped wings and different engine or cooling installations separate. A Mustang-only archive lead earns more time if it supplies a missing calibration in the measured range or a genuinely independent timed run. If it only duplicates an existing proxy, spend the remaining time on the next ranked source.

M3 ships **one before/after scorecard covering all 42 aircraft/metric combinations**. Show model predictions throughout, signed errors where measured, evidence quality and any ordering affected. Retest a proposed shared calculation on all 14, preserve the four reference speed/climb checks, and use reserved observations before accepting a change. Where the source cannot distinguish causes, publish the measured discrepancy and the missing datum. The remaining profiles can still ship together.

## What follows

| Milestone | When it earns the effort | Outcome |
| --- | --- | --- |
| **M4 · Sustained level turn** | The clean lift limit and straight-flight power balance are constrained over an overlapping speed and altitude range, and a steady-turn measurement exists for a useful comparison. | Run the turn model across the roster. Compare supported pairs at matched weight, speed, altitude and rating. Show where the measured difference survives uncertainty. [Existing turn evidence](V415_FLEET_MANEUVER_ENERGY.md) |
| **M5 · Extend the roster in a useful comparison batch** | A new configuration fills a missing historical comparison and has measured speed and climb at known settings. | Prepare the Spitfire I comparison with the existing E-3 and the F6F-3 as a new family. Select the release batch by evidence readiness and the comparisons it adds. [Candidate dossiers and entry criteria](research/WW2_AIRCRAFT_INPUT_RESEARCH_ROADMAP_2026-11-25.md) |

Detailed stick-force modeling, full turn-to-recovery dynamics and a fleet-wide propeller overhaul stay behind these milestones until measured roll, timed recovery or installed-power data show a comparison that the added complexity would resolve.
