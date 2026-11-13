# Stall speed correction factors

Short reference for how stall observations are (and are not) corrected in this project.

## 1. Airspeed basis correction (IAS → CAS → EAS)

| Factor | What it corrects | Typical size | Status |
| --- | --- | --- | --- |
| Instrument error | Scale and installation error of the airspeed indicator | Usually small (±1–3 mph) if known | Rarely measured at stall speeds |
| Position error (PEC) | Pitot-static location error that changes with angle of attack | Can be 3–10+ mph near stall | Almost never available below ~100 mph |
| Compressibility | IAS to EAS conversion | Negligible at stall speeds | Not a practical issue here |

**Rule:** If no low-speed position-error chart covers the stall speed, do not invent a correction. Treat the reported IAS as a provisional EAS and label it.

**Example (F4U-1 handbook):** 75 kt IAS (landing) → 72.5 kt CAS* after applying the manufacturer’s position-correction table (within its documented range). The clean 87 kt IAS lies below the table minimum, so no correction is applied.

## 2. Weight correction

Stall speed scales with the square root of weight:

$$V_{s2} = V_{s1} \times \sqrt{\frac{W_2}{W_1}}$$

**Example:** A stall measured at 9,270 lb is not directly comparable to a combat weight of 10,000 lb. The corrected speed would be higher by \(\sqrt{10000/9270} \approx 1.039\) (~4 %).

**Status:** Most stall observations lack a matched instantaneous weight. The project therefore keeps the original reported speed and notes the weight basis rather than applying an unproven correction.

## 3. Configuration and power effects

These are separate conditions that must be matched, not averaged:

- Flaps up vs down
- Gear up vs down
- Power off vs power on (propeller wash can lower stall speed)
- Cooling shutters / canopy position

**Status:** Provisional bands keep these as separate observations.

## 4. Sensitivity of CLmax to a small speed error

If the true stall EAS is 5 mph higher than an assumed 86 mph:

$$\left(\frac{86}{91}\right)^2 \approx 0.893$$

That is a 10.7 % reduction in the inferred CLmax. At 170 mph EAS the corresponding lift limit drops by about 0.4 g. This is why the project refuses to invent a position-error correction.

## Current practice summary

| Correction | Applied when | Otherwise |
| --- | --- | --- |
| Position error | A documented low-speed curve covers the stall speed | Provisional EAS = reported speed |
| Weight | Instantaneous stall weight is known and different from the comparison weight | Keep original speed + note |
| Configuration / power | Always kept as separate observations | Never averaged into one “clean” number |
| CLmax derivation | Only when both corrected EAS and matched weight exist | Blocked |

Related: `docs/STALL_WEIGHT_GATE.md`, provisional stall envelope, and the US/global correction JSON packs.
