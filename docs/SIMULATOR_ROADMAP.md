# Simulator roadmap after 4.17

## Next milestone · M3 — Validate clean stall, level acceleration and climb time

Ship one comparison scorecard answering three questions. At the test weight, how slowly can each aircraft fly clean? How long does it need to accelerate through the same indicated speeds in level flight? How much time separates two aircraft climbing between the same heights? The [first research results and primary sources](research/M3_STALL_ACCELERATION_CLIMB.md) are ready for this milestone.

[4.17](V417_EVIDENCE_AND_PERFORMANCE.md) delivered milestones 1 and 2. All 14 profiles have level-speed and time-to-altitude evidence groups. Eleven have linked clean-stall records with varying calibration or aircraft matches. Five have a roll record or related-variant lead. The three acceleration entries previously counted a restored Mustang, two secondary accounts of a single Finnish trial, and an energy check derived from a Spitfire climb.

| Priority | Sessions out of ten | Work and first targets | Deliverable |
| --- | ---: | --- | --- |
| **1. M3 · Clean stall, timed level acceleration and climb time** | **8** | Spend three sessions on comparable clean stalls, three on timed acceleration, and two on the E-3 and Va climb clocks. Start with the records and gaps below. | One scorecard of observed and modeled differences, source conditions and uncertainty. Publish which aircraft orderings survive the checks. |
| 2. Roll rate versus airspeed | 1 | Extend the existing P-47B and P-51B comparison at 400 mph with same-variant measurements at another speed. Prefer achieved maximum or full-deflection results. Record direction and test force where supplied. | Show comparable observations as points in degrees per second against airspeed. Keep a single-speed result as one point and mark related variants separately. [USAAF Table I and NACA leads](../references/analysis/fleet-roll-evidence.json) |
| 3. Show which comparisons the evidence supports | 1 | Use the existing comparison screen. At the selected condition, put the modeled gap beside the observed gap and any reading or configuration uncertainty. Prioritize a contrast already supported by measurements, such as the LF/HF IX speed difference. | A reader can see which aircraft leads, by how much, and over which measured range. When plausible errors can reverse the order, label that ordering unresolved. Distinguish same-trial checks, separate aircraft and extrapolation. [Current benchmark](V417_EVIDENCE_AND_PERFORMANCE.md) |

### M3 acceptance

| Work | Evidence to use or recover | Completion check |
| --- | --- | --- |
| Clean stall · 3 sessions | Seek Wright Field Eng-47-1734-A Figs. 1–2 for 43-6883 and a clean, low-speed calibration applicable to LF IX BS.543. Use the P-38G sister-aircraft test and calibrated F4U-4 measurements as cross-checks where conditions match. | For the first supported pair, compare source and modeled stall at the documented weight, wing, gear, flaps and power. Show uncertainty in the observed gap. Label instrument-only readings in IAS. If a pair cannot be supported, name the missing correction or run weight and publish the usable individual measurements. [Stall audit](V412_CONTINUOUS_STALL.md) |
| Timed level acceleration · 3 sessions | Correct the 4.17 benchmark display using Ellis and Wheal's published Figure 8. Use the lower- and higher-speed intervals as separate checks. Seek the original Finnish MT-215 sheet or an independent wartime run with altitude, weight, rating, cooling and airspeed basis. | Show seconds per interval at the same indicated speeds with the test conditions beside the replay. Reserve the higher-speed interval before any fit. Mark both intervals as one flight and record whether a second flight replicated it. Use a proxy-only result to bound the comparison. [Figure readings and model times](research/M3_STALL_ACCELERATION_CLIMB.md#timed-level-acceleration) |
| Climb time · 2 sessions | Start with CEMA's E-3 at 23,000–26,300 ft and A&AEE's Va at 33,000–37,000 ft. Look for the E-3 speed and cooling schedule and the Va's high-altitude installed power and propeller evidence. | Publish consecutive-band errors and the E-3/Va gap over the shared 3,280–19,750 ft interval. Recheck that gap and the lower-altitude clocks after any proposed change. [4.17 band results](research/M3_STALL_ACCELERATION_CLIMB.md#climb-time-on-the-417-replay) |

Use primary reports first, traceable secondary accounts next, and labeled IL-2 or DCS comparisons where useful. For each measure record the tested serial, loading, rating, units and role in the analysis. If a solver change is supported, reproduce speed and climb for the four reference aircraft before and after it and check a reserved observation. A documented source gap closes the allotted search and leaves that comparison open.

## After M3

Roll rate versus airspeed and the comparison display each have one session outside the eight-session milestone. Preserve test force alongside roll measurements when supplied. Further work on pilot strength can wait. Sustained level turn is the next major milestone once the clean lift boundary and straight-flight power balance support one well-documented pair. [Existing maneuver evidence](V415_FLEET_MANEUVER_ENERGY.md)

Add an aircraft or revisit propeller efficiency, radiator drag or engine power when a matched test identifies a comparison the change can improve. Full turn-to-recovery modeling needs a continuous timed record.
