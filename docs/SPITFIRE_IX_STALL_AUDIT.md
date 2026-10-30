# Spitfire IX stall configuration audit

The [September 1946 third-edition pilot notes](https://zenoswarbirdvideos.com/Images/spit/SPIT9MANUAL.pdf), A.P.1565J, P & L-P.N., paragraph 42(i), printed page 24 (PDF page 16), qualify the inherited figures:

| IAS mph | Reference weight lb | Gear / flaps | Wings / fuselage | Loading |
|---:|---:|---|---|---|
| 90 | 7,150 | Up / up | Clipped / non-rear-view | Full main tanks; no ammunition or external stores |
| 93 | 7,800 | Up / up | Clipped / non-rear-view | Full main tanks; full ammunition; 45-gallon blister drop tank |

Full-span guidance is an approximate 3-6 mph reduction, not a measured BS.543 interval. Paragraph 53, printed page 32 (PDF page 20), begins its position-correction table at 120 mph IAS. No correction nodes were digitized: extracted column alignment is ambiguous, and coverage excludes the stalls. This postwar edition is not a wartime BS.543 test.

PDF text was inspected; page pixels were not verified. Records retain `scanVerified: false`. No clipped-wing reference area is established, so the full-span model area has been removed from those evidence rows.

The [BS.543 performance-report transcription](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html), sections 2-4, covers climb and level speed. It explicitly adopts BF.274 pressure-head correction through matching head make, location and setting, citing A&AEE/692,m, third part. That linkage is a useful retrieval lead, not proof of near-stall coverage. Its 7,485 lb takeoff/climb state and 7,110 lb normalized speed state remain distinct from stall weight. The original report scan was not visually verified.

The shared evidence gate now checks explicit target wing, gear/flap and stores fields. Matching configuration-ID strings cannot override conflicting fields, including in IAS calibration. The active Spitfire comparison remains a full-span, gear/flaps-up, no-stores model state; these labels describe the modeled research configuration, not a newly authenticated historical stall.

Synthetic tests cover acceptance with complete evidence and rejection of clipped wings, tank carriage, gear/flap changes, absent fields and incompatible calibration. No default coefficient, mass or prediction changes. The [machine-readable audit](../references/spitfire-ix-stall-audit.json) records provenance and retrieval leads; the [combined review](FOUR_AIRCRAFT_STALL_REVIEW.md) brings all four aircraft together.
