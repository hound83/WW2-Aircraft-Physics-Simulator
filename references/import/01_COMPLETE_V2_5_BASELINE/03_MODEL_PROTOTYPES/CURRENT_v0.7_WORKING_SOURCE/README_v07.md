# Universal Three-Aircraft Model v0.7 — stores-generalization test

## Outcome

The user asked for a second independent, historically sourced before/after stores experiment to challenge the universal model. The base three-aircraft physics solver and Greg regressions remain unchanged.

**New evidence:** Focke-Wulf flight tests of **Fw 190 A-4, Werknummer 619**, November 1942–February 1943. Source translations (primary test reports hosted as secondary transcriptions):

- [Report No. 1, 4 November 1942](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-619-nr1.html): five sea-level/ combat-power configurations 321/318/317/310/293 mph, with historical reported gross weights **3670 / unknown / 3720 / 3797 / 3997 kg**. Printed last loss rounded 29 mph but 321 − 293 = **28 mph**. The report acknowledges initially incorrect engine boost-control settings; no completely controlled same-day flights are claimed.
- [Report No. 3, 20 January 1943](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-619-nr3.html): independent subsequent same-specimen stores families report 22/58/73 km/h speed loss for three ETC 501 racks, racks+tanks, and racks+tanks+250-kg bomb respectively. Report No. 3 uses a distinct later airframe installation state; values must NOT be added to the losses from report No. 1.
- [Report No. 5, February 1943](https://www.wwiiaircraftperformance.com/org/fw190/a4/fw190-619-nr5.html): **external fuel tanks increased indicated airspeed underreading by a further 6–7 km/h**, caused by static pressure interference. We do not automatically add a historical correction to already corrected TAS.

## Cross-aircraft generalization without hidden fits

The separate v0.6 Mosquito 1943/44 fixture inferred an additional **14.85% effective parasite-drag increase** in one specific bomb+faired rack configuration, using its lower-altitude peak-speed pair. v0.7 applies exactly that SAME fitted percentage to the Fw 190 619's fully bomb-laden stage. It uses source-reported mass ratio 3997/3670 and an illustrative 7% induced drag fraction at the clean aircraft's maximum speed. **No parameter is fitted to the Fw 190.**

- Reported Fw speed with 4×50-kg bombs: **293 mph**.
- Prediction using transferred Mosquito fractional penalty: **304.58 mph** (**+11.58 mph too fast**).
- To reproduce the Fw source point within this inverse approximation requires a **28.53% effective parasite-drag increase** (not an independently measured drag coefficient). Other plausible induced-share settings change this estimate, but not the broad conclusion.
- Across stores stages the inferred equivalent parasite increases are distinct (ETC rack ~3.52%, bomb locks ~10.12%, full four bombs ~28.53%). The fixed Mosquito penalty overstates some small modifications and understates heavy draggy stores. Unknown wheel-door mass is left missing.

**This is a useful negative result, not a universal coefficient to replace with 0.285.** Different store positions, quantity, size, rack fairings, and sometimes pitot-static calibration change the installation penalty. v0.6 already has correct universal inputs `storesWeightLb` and `addedDragAreaM2`; the practical next enhancement is to source or estimate *configuration-specific equivalent drag area* by store+rack class. There is no reason to refit the three aircraft clean polars or introduce new independent engine formulas.

## New and retained QA

- `node test.mjs`
- `node test_stores.cjs`
- `node test_fw190.cjs`
- `python make_html.py`
- `python test_browser.py` (Chromium desktop/mobile, tests for five data rows, range slider, no overflow)

The historic fixtures Mosquito, P-38G and Fw 190 A-4 **do not become trusted aircraft physics simulations**. The original three-aircraft E-M solver is still experimental. No GitHub Atlas commits or deployment.
