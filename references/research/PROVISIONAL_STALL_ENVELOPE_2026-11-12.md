# Provisional stall envelope review

Grok’s [first draft](../analysis/provisional_stall_envelope_2026-11-12.json) and [three-aircraft expansion](../analysis/provisional_stall_expansion_2026-11-12.json) are preserved byte for byte. The checked cases below refer to individual observations already in the research catalog.

## Review of the expansion

| Draft addition | Checked source and disposition |
| --- | --- |
| P-51B, 69–94 mph | The listed inputs are 86 and 94 mph **IAS** from two specimens. The 86 mph point is B-15 **43-24777**, 9,270 lb at 8,000 ft, power off with flaps and gear up and shutters closed. The 94 mph point is B-5 **43-6883**, about 9,100 lb at stall with the corresponding settings. Its table removes instrument error and leaves position correction open. Use the two cases separately. The B-15 table also has a 69 mph power-on row with gear and flaps down at 8,950 lb. [B-15 §V.E](https://wwiiaircraftperformance.com/org/p-51/p51b-24777.html) · [B-5 §V.F](https://wwiiaircraftperformance.com/org/p-51/p-51b-6883.html) |
| Fw 190, 110–118 mph | The RAF report describes approximately 110 mph clean and 105 mph gear/flaps down on the captured **A-3**. The stall paragraph leaves airspeed basis and test conditions open. The 118 mph figure remains a secondary lead pending the original report and test conditions. The WNr 783 A-4 retains its calculated reference with the existing assumptions. [RAF tactical trials §31](https://wwiiaircraftperformance.com/com/gb/documents/fw190a3_RAE-Test-Jul42-new.html) · [Fleet stall references](../../docs/research/WW2_FLEET_STALL_INPUTS_2026-11-12.md) |
| Bf 109, 84–103 mph | The draft groups a clean and a landing value under a family label. The cited Rechlin test identity and clean stall are still open. The checked F-4 sheets describe **135 km/h landing speed**. Retain the existing calculated clean reference with its mass and lift assumptions. [German sources](../../docs/research/WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md) · [Fleet stall references](../../docs/research/WW2_FLEET_STALL_INPUTS_2026-11-12.md) |

The P-51 observations are `stall_us_2026-11-10:US02:0001` and `stall_us_2026-11-10:US01:0001`. The RAF rows are `stall_global_2026-11-10:FW190-A3-RAF-1` and `FW190-A3-RAF-2` under that same catalog prefix. Reuse these IDs in calculations and keep the original airspeed basis. [Original source and report checks](REPORT_INVESTIGATION_2026-11-12.md)

## Source review

| Draft example | What the original observations support |
| --- | --- |
| F4U-4, 89.4–97.4 mph | The 89.4 mph CAS point is landing power off. The 97.4 mph CAS point is clean power on. Use the two conditions separately. The stall altitude is unspecified in these rows. |
| Spitfire IX, 76–86 mph | These are handbook IAS values for landing and clean configurations at the handbook normal load. Keep the clean 86 mph IAS as a source value and qualify any transfer to the modeled full-span LF IX. |
| P-47B, 85–105 mph | The handbook lists four power and configuration cases. The stall paragraph leaves the speed basis and numerical gross weight open. Retain the four observations and state the loading and airspeed assumptions for each derived value. |
| P-38G, 69–112 mph | The low endpoint is a 15,000 lb landing IAS from the D/G handbook. The high endpoint is the 42-12690 clean power-off CAS at approximately 14,800 lb and 10,000 ft. The latter has its own matched IAS/CAS pair. |

For each provisional value, record the source observation ID and locator, variant, original unit and speed basis, power, gear, flaps, loading and altitude. Show the IAS-to-CAS correction or explicit assumption and any range, then use the shared airspeed conversion to calculate EAS. If the source permits a defensible bound, grade the derived input as calculated and use it in the provisional graph segment and scorecard. Carry the assumptions and range into the tooltip. Use reported values in their original basis where a defensible EAS estimate is unavailable. Preserve the applicable primary-source points and the supported portions of the solid line. Use separate matched powered-turn evidence to evaluate sustained turn. [Current stall evidence and limitations](../../docs/research/WW2_FLEET_STALL_INPUTS_2026-11-12.md) · [Graph evidence grades](../../docs/V46_CHART_DATA.md)

## Graph handoff

Apply the evidence style to the part of the curve that depends on the input. On an EAS axis, convert a corrected IAS/CAS stall point to EAS at the declared conditions. Show an isolated calculated point or range as a marker or band. Dot a modeled extension only up to the first independently supported point in the same case. If the provisional lift limit determines a longer interval, style that interval as provisional too. A numeric IAS correction affects the speed conversion for its matched case. Its size alone does not define a span on an EAS graph.

For fixed weight and configuration, the lift ceiling in G is `q S CLmax / W`. Where the same lift coefficient applies at the 1-G stall and in the calculation, this is `(EAS / stall EAS)^2`. Propagate any stall-speed range into the lift range and use the applicable maneuver-lift data when available. [Next simulator milestone](../../docs/LATEST_INSIGHTS.md#next-simulator-milestone)
