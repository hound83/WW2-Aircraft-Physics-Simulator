# Provisional stall envelope candidate

Grok’s draft is preserved as a [research calculation](../analysis/provisional_stall_envelope_2026-11-12.json). Its inputs come from the [fleet stall source rows](ww2_fleet_stall_2026-11-12.json). The graph handoff needs a calculated EAS value or band for each applicable test condition.

## Source review

| Draft example | What the original observations support |
| --- | --- |
| F4U-4, 89.4–97.4 mph | The 89.4 mph CAS point is landing power off. The 97.4 mph CAS point is clean power on. Use the two conditions separately. The stall altitude is unspecified in these rows. |
| Spitfire IX, 76–86 mph | These are handbook IAS values for landing and clean configurations at the handbook normal load. Keep the clean 86 mph IAS as a source value and qualify any transfer to the modeled full-span LF IX. |
| P-47B, 85–105 mph | The handbook lists four power and configuration cases. The stall paragraph leaves the speed basis and numerical gross weight open. Retain the four observations and state the loading and airspeed assumptions for each derived value. |
| P-38G, 69–112 mph | The low endpoint is a 15,000 lb landing IAS from the D/G handbook. The high endpoint is the 42-12690 clean power-off CAS at approximately 14,800 lb and 10,000 ft. The latter has its own matched IAS/CAS pair. |

For each provisional value, record the source observation ID and locator, variant, original unit and speed basis, power, gear, flaps, loading and altitude. Show the IAS-to-CAS correction or explicit assumption and any range, then use the shared airspeed conversion to calculate EAS. If the source permits a defensible bound, grade the derived input as calculated and use it in the provisional graph segment and scorecard. Carry the assumptions and range into the tooltip. Use reported values in their original basis where a defensible EAS estimate is unavailable. Preserve the applicable primary-source points and the supported portions of the solid line. Use separate matched powered-turn evidence to evaluate sustained turn. [Current stall evidence and limitations](../../docs/research/WW2_FLEET_STALL_INPUTS_2026-11-12.md) · [Graph evidence grades](../../docs/V46_CHART_DATA.md)

## Draft ranges as submitted

These spans show the endpoints selected by the draft. The observations include different airspeed bases, configurations and loads. The source review above governs their use.

| Aircraft | Draft nominal span (mph) | n | Notes |
| --- | ---: | ---: | --- |
| F4U-4 | 89.4 – 97.4 | 2 | Reported CAS |
| Spitfire LF Mk IX | 76 – 86 | 2 | Uncorrected IAS |
| P-47B | 85 – 105 | 4 | Unestablished / manual |
| P-38G | 69 – 112 | 11 | Mix of IAS and CAS |

No solid primary-source stall result is replaced. The band and the limitation string travel with the observation so the UI can show a dotted line and an expandable note.
