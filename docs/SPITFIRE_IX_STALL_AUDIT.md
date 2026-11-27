# Spitfire IX stall configuration audit

The [September 1946 third-edition pilot notes](https://zenoswarbirdvideos.com/Images/spit/SPIT9MANUAL.pdf), A.P.1565J, P & L-P.N., paragraph 42(i), printed page 24 (PDF page 16), qualify the inherited figures:

| IAS mph | Reference weight lb | Gear / flaps | Wings / fuselage | Loading |
|---:|---:|---|---|---|
| 90 | 7,150 | Up / up | Clipped / non-rear-view | Full main tanks; no ammunition or external stores |
| 93 | 7,800 | Up / up | Clipped / non-rear-view | Full main tanks; full ammunition; 45-gallon blister drop tank |

The manual assigns standard wings an approximate 3–6 mph reduction. At the 7,150 lb loading that gives 84–87 mph IAS. The 7,800 lb loading with the blister tank gives 87–90 mph IAS. Both are derived handbook ranges. Paragraph 53, printed page 32 (PDF page 20), begins its position-correction table at 120 mph IAS, above both ranges.

The November 2026 follow-up verified the scanned pages in both handbook editions. In June 1943 the published normal all-up weight was 7,445 lb. The engine-off clean stall was 86 mph IAS and gear/flaps down was 76 mph IAS. The paragraph leaves the wing tips and serial unspecified. The 1943 correction also begins at 120 mph IAS. The clipped-wing reference area and the exact low-speed corrections remain open. [June 1943, §40](https://www.docdroid.com/file/download/HRosRhd/supermarine-spitfire-fix-pilots-notes-pdf.pdf#page=11) · [Evidence across the three IX profiles](research/FLEET_CLIMB_SPITFIRE_STALL_MT215_2026-11-27.md)

The [BS.543 performance-report transcription](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html), sections 2-4, covers climb and level speed. It explicitly adopts BF.274 pressure-head correction through matching head make, location and setting, citing A&AEE/692,m, third part. That linkage is a useful retrieval lead, not proof of near-stall coverage. Its 7,485 lb takeoff/climb state and 7,110 lb normalized speed state remain distinct from stall weight. The original report scan was not visually verified.

The shared evidence gate now checks explicit target wing, gear/flap and stores fields. Matching configuration-ID strings cannot override conflicting fields, including in IAS calibration. The active Spitfire comparison remains a full-span, gear/flaps-up, no-stores model state; these labels describe the modeled research configuration, not a newly authenticated historical stall.

Synthetic tests cover acceptance with complete evidence and rejection of clipped wings, tank carriage, gear/flap changes, absent fields and incompatible calibration. No default coefficient, mass or prediction changes. The [machine-readable audit](../references/spitfire-ix-stall-audit.json) records provenance and retrieval leads; the [combined review](FOUR_AIRCRAFT_STALL_REVIEW.md) brings all four aircraft together.
