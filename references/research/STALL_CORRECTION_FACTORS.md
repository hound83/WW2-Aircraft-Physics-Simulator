# Stall speed correction factors

Use the [variant transfer audit](STALL_WEIGHT_TRANSFER_2026-11-13.md) for donor and target pairs across the five fighter families.

## 1. Airspeed basis correction (IAS → CAS → EAS)

| Factor | What it corrects | Typical size | Status |
| --- | --- | --- | --- |
| Instrument error | Calibration and scale error of the instrument | Use the original calibration allowance | Often unresolved for these source rows |
| Position error (PEC) | Pitot-static location error that changes with angle of attack | Installation-specific; can reach double digits | Match the near-stall configuration and airspeed channel |
| Compressibility | CAS to EAS conversion | Usually small at low Mach | Evaluate at the source altitude |

**Rule:** Keep source IAS in its reported basis if the matching low-speed position correction is unavailable. An explicit IAS-equals-EAS sensitivity scenario requires its own label and assumptions.

**Example (F4U-1 handbook):** 75 kt IAS (landing) → 72.5 kt CAS* after applying the manufacturer’s position-correction table (within its documented range). The clean 87 kt IAS lies below the table minimum, so no correction is applied.

## 2. Weight correction

Stall EAS scales with the square root of weight at fixed load factor, effective wing area and usable maximum lift coefficient. This applies to sibling variants with matched stall aerodynamics and configuration.

$$V_{s2} = V_{s1} \times \sqrt{\frac{W_2}{W_1}}$$

**Example:** For the same wing, configuration and load factor, the weight-scaled EAS at 10,000 lb relative to 9,270 lb is higher by \(\sqrt{10000/9270} \approx 1.039\) (~4 %).

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
| Position error | A documented low-speed curve covers the stall speed | Keep original reported IAS and qualify any explicit sensitivity scenario |
| Weight | Instantaneous stall weight is known and different from the comparison weight | Keep original speed + note |
| Configuration / power | Match gear, flaps, stores and power for a transfer | Preserve the distinct source conditions |
| CLmax derivation | Only when both corrected EAS and matched weight exist | Blocked |

Related: `docs/STALL_WEIGHT_GATE.md`, provisional stall envelope, and the US/global correction JSON packs.
