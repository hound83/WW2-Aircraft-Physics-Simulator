# Provisional stall envelope (dotted-line path)

Generated from existing observations in `ww2_fleet_stall_2026-11-12.json`.

These values are for the provisional / dotted-line display only. They treat the reported airspeed as a provisional EAS when no matched correction exists.

## Aircraft that gain a usable provisional band

| Aircraft | Provisional EAS band (mph) | n | Notes |
| --- | ---: | ---: | --- |
| F4U-4 | 89.4 – 97.4 | 2 | Reported CAS |
| Spitfire LF Mk IX | 76 – 86 | 2 | Uncorrected IAS |
| P-47B | 85 – 105 | 4 | Unestablished / manual |
| P-38G | 69 – 112 | 11 | Mix of IAS and CAS |

No solid primary-source stall result is replaced. The band and the limitation string travel with the observation so the UI can show a dotted line and an expandable note.

## How to use
- Feed `provisionalBandEasMph` into the existing dotted-line / provisional graph path.
- Do not use these numbers as matched corrected stall EAS or to derive a verified CLmax.
