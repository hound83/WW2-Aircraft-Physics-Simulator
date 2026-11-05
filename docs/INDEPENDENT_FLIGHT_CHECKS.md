# Separate flight reports and the DB 601 E transfer

## Bf 109 F-4 above rated altitude

The September 1942 Messerschmitt report **V.B. 109 19 L 42** records a G-1 (W.Nr. 14026) tested with a DB 601 E and the production F-series VDM propeller at 1.3 ata and 2,500 rpm. The translated summary gives 386 mph at the 6,000 m full-throttle height. The searchable German scan reads 522 km/h where the translation implies about 621 km/h. The nominal model uses the translation and reports the OCR alternative as a separate sensitivity. [Report translation](https://wwiiaircraftperformance.com/org/me109/g/me109g-14026.html) · [German scan](https://www.wwiiaircraftperformance.org/me109/VB-109-19-L-42.pdf)

Profile P now offers a separate **DB 601 E inlet transfer** option. It caps boost at 1.3 ata and uses the inlet total-pressure ratio to the G-1 full-throttle reference to estimate the falloff. The F-4's existing nominal 1,184 BHP, reference polar and propeller model are held fixed. Recovery 0.85 and charge exponent 2/3 are engineering assumptions. The G-1 data do not identify the F-4 intake recovery, supercharger characteristics or actual shaft horsepower. The calculation is available to 23,000 ft for combat power. At 1.42 ata the source gate stays closed. The default F-4 and the historical comparison gate retain their original domains.

| 7,000 m, combat | Speed |
|---|---:|
| v3.8 default | Unavailable |
| v3.8 rejected pressure-only continuation | 588.5 km/h |
| New inlet transfer | 633.2 km/h |
| Secondary F-4 figure | 645 km/h |

The 645 km/h value is a check outside the power derivation. The model is 11.8 km/h low and needs about 47 more propulsive hp to hold the source speed at the assumed weight and drag. Recovery 0.65–1.00 and charge exponents 2/3–1 give 622.2–633.5 km/h with the translated reference. Substituting the disputed OCR reading gives 641.4 km/h at the nominal assumptions. The closer fit does not settle the reading. The 670 km/h emergency figure remains outside this evidence. [Secondary F-4 data](https://info.eduard.com/en/06-2023-1)

### Emergency-power challenger

A secondary transcription attributed to a DB data sheet gives 1,320 PS at 4,800 m/1.42 ata and 700 PS at 10,000 m/0.80 ata, both at 2,700 rpm. A power-vs-static-pressure fit to those two endpoints, followed by the same inlet calculation, gives **655.0 km/h at 7,000 m** against the separate 670 km/h figure. Recovery 0.65–1.00 gives 646.0–661.9 km/h. The simple pressure proxy gives 0.68 ata at the second static point, against the transcribed 0.80. The underlying sheet and its inlet conditions need verification. The challenger remains diagnostic and does not enter the emergency flight model. The inventory lists the May 1942 DB 601 E–G manual starting at frame 4587517. [Transcription](https://forum-marinearchiv.de/smf/index.php?topic=4926.285) · [Archive inventory](https://www.maparchive.ru/nara-doc/Field_and_Technica_Manuals/Field_and_Technical_Manuals.pdf)

## Tests on separate airframes

The references below were excluded from the v3.8 fast-flight fit and the 41-5902 cooling fit. The tests preserve both gains and failures. Only the production P-47B comparison has the same type, engine, propeller, rating and known shaft power. It still compares two different production aircraft.

| Report / comparison | Result |
|---|---|
| **P-47B 41-5942**, FS-M-19-1523-A | 2.37 mph TAS MAE on three level-speed points. On five climb points at reported BHP and TAS, MAE is 615.7 ft/min with the clean polar, 94.2 with the earlier fixed cooling CD₀ and 76.8 with the current cooling model. |
| **XP-47B 40-3051**, PHQ-M-19-1288-A | Substituting measured prototype BHP reduces the transfer MAE from 9.52 to 7.25 mph. The prototype has an R-2800-35. |
| **Spitfire LF IX MA.648**, A&AEE Table I | On 16 points the BS.543 model gives 1.75 mph MAE without the fast-flight term and 4.71 with it. Substituting reported boost alone gives 4.54 mph. The distinct SU injection pump, intake and propeller are relevant. The 36,000-ft point is outside the BS.543 working engine range. |
| **Mustang IV TK589**, A&AEE §4.2 | At 10,300 ft and +18 psi, measured TAS was 396 mph. Transferring the P-51B estimate gives 407.8 without the fast-flight term and 409.4 with it. The engine and propeller blade drawing match, while the airframe, cooling and exact rating differ. |

The P-47B comparison uses 12,620 lb, 2,700 rpm and the cuffed Curtiss 714-1C2-12. The report has eight guns versus six on 41-5902. At 30,000 ft, the current cooling residual is +97 ft/min, compared with +32 for the fixed cooling CD₀. The current shape helps on the overall five-point set, with a worse result at that point. [Wright Field reports](https://www.wwiiaircraftperformance.com/org/p-47/p-47.html)

The MA.648 and TK589 results argue against applying the BS.543 and 43-24777 fast-flight corrections across specimens. The existing identity gates keep that scope in the application. These tests still lack independent exact-specimen calibration, usable corrected clean stall points, and evidence for the 5:1 criterion. [MA.648](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLFMkIX_MA648.html) · [TK589](https://www.wwiiaircraftperformance.com/org/p-51/tk589.html)

Run `npm run diagnose:independent-flight` or `npm run check`. The [source ledger](../references/independent-flight-checks.json) records test conditions. CI includes the point-by-point JSON in the validation artifact.
