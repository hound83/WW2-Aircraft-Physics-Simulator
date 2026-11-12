# Minimum viable sim data requirement

Base requirement for adding or expanding an aircraft in the simulator.  
These fields are what the current solver actually uses for level speed, climb, acceleration, and sustained-turn calculations.

## 1. Geometry & mass (once)
- Wing area (m²)
- Span (m)
- One reference clean weight (lb) with configuration note (fuel, ammo, stores, gear/flaps)

## 2. Propulsion
- Power-by-altitude curve for the main combat/military rating
  - Low blower points (including critical altitude)
  - High blower points (including critical altitude)
- Propeller diameter and number of blades
- One representative propeller efficiency (default 0.80 is acceptable if nothing better exists)
- Cooling state note for level flight vs climb (closed / open / auto) if known

## 3. Observed performance (minimum calibration set)
- Level speed: at least 3–5 points across altitude (one solid point in low blower, one in high blower)
  - Altitude, TAS, rating, gear, weight, cooling state
- Climb: at least 3–5 points or a time-to-altitude
  - Altitude, rate of climb (or time), TAS or IAS, rating, gear, weight, cooling state
- Clean stall speed (CAS or EAS preferred) at a known mass and configuration

## 4. Minimum viable checklist

| Item | Required | Notes |
|------|----------|-------|
| Wing area + span | Yes | |
| Reference clean weight | Yes | With configuration note |
| Power curve (low + high blower) | Yes | Main combat rating |
| Propeller diameter + blade count | Yes | |
| Propeller efficiency | Yes | Single number OK |
| Level-speed points (3–5) | Yes | Matched conditions |
| Climb points (3–5) | Yes | Matched conditions |
| Clean stall speed | Yes | CAS/EAS preferred |
| Cooling state notes | Strongly preferred | Level vs climb |
| Extra speed/climb points | Optional | Improves accuracy |
| Turn or acceleration points | Optional | For validation |

**With the “Yes” items the simulator can produce level speed, climb, acceleration, and sustained-turn comparisons under matched conditions.**  
Everything else raises confidence and reduces uncertainty.

## Priority aircraft status

See the sorted priority list in [WW2_FIGHTER_DATA_ROADMAP.md](WW2_FIGHTER_DATA_ROADMAP.md).

Top near-term targets (data + sim):
- Bf 109 G-2
- P-51D
- P-47D

Next data targets:
- Spitfire I & V
- Bf 109 E
- Bf 109 G-6/G-14
- Fw 190 A-8 / D-9
