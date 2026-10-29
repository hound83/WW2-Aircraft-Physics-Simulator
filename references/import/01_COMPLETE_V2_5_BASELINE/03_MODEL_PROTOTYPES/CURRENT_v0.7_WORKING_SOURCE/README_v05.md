# Universal Three-Aircraft Model v0.5 — source-condition audit

**Status:** Working, offline, experimental. No changes to the published Air War Atlas. The three-aircraft solver and Greg worksheet reconstructions from v0.4 are retained. The next analysis is deliberately **not** a new aircraft-specific fit.

## What changed

1. Read the original-report transcription for P-51B-15 43-24777, 20 May 1944, including its references to Figures 6 and 7, test fuel, cooling shutters and wing racks. **The report text provides no climbing TAS/IAS schedule**; Fig. 6 is climb rate versus altitude, Fig. 7 power versus altitude. We cannot claim a measured speed at which the best climb was achieved.
2. Extracted a separate 15 May 1944 Wright Field summary from the same aircraft/testing programme. Its climb table reports **9,680 lb**, whereas the 20 May more detailed report states **9,335 lb at takeoff**. The figures are not independent aircraft tests and should **not be pooled as observations under a common weight**. The model retains both with report identity, date, engine rating and reported mass. Instantaneous in-flight weight remains unknown.
3. Ran all three generic propulsion candidates, unchanged, against P-47B withheld climb observations (15,000-ft configuration-loss fit; 4 other altitudes withheld), and against the P-51B reported climb rates under their **correct report-specific weight**. P-51B has its documented **automatic cooling shutters**; P-47B climb has cowl/oil/intercooler flaps wide open, so the P-47 fitted loss term is **not** transplanted.
4. Retained the independent Greg screenshot arithmetic checks for Bf 109 F-4 and high-power P-47, plus the 27,000-ft preliminary comparison. No claimed verified high-altitude Bf 109 F-4 climb/turn result is invented.
5. Embedded the full audit and source-by-source residuals in the interactive single-file browser prototype. Desktop/mobile browser tests and numerical tests pass.

## Key results — model versus separate source conditions

These are **predictions**, not matched-speed validation results, and the reports are **not independent samples**.

| Candidate | P-47 withheld climb MAE, ft/min | P-51 May 20 absolute climb MAE, ft/min | P-51 May 15 absolute climb MAE, ft/min (only supported power nodes) | P-51 May 20 rating gain error, ft/min |
|---|---:|---:|---:|---:|
| A constant efficiency | 114 | 236 | 522 | +28 |
| B simple speed curve | 229 | **98** | **246** | +70 |
| C J/Cp/tip-Mach heuristic | **56** | 410 | 615 | **+17** |

A/B/C share the same **solver equations**. Each has different propeller-efficiency assumptions. For P-47 each source-specific added cooling/configuration loss is separately fitted at just one observation, and the coefficient differs by profile: that is a **diagnostic fit, not a universal cooling drag measurement**. For P-51 **no climb fitting** is performed.

Interpretation: B better on absolute Mustang rates, C better on P-47 held-out rates and Mustang *gain*. No universally validated profile can be selected from this evidence. A shared numerical +CD0 copied from P-47 to P-51 was already independently falsified in v0.4.

## Scientific next decision (kept short)

- **Resolve model structural uncertainty:** obtain the actual climbing schedule or propeller/engine installation information if present in original flight records; published Fig. 6/7 descriptions alone do not give measured climb IAS/TAS. Do not substitute the model's predicted optimum speed for a historical fact.
- **Challenge one physically motivated shared propeller profile** against both aircraft without tuning to their held-out climb rates. The v0.5 result exposes why per-aircraft hand-fitting is not an acceptable shortcut.
- **Until then:** permit Greg-derived comparisons and research estimates, but **do not certify historical sustained-turn rankings** or promote an arbitrary aerodynamic loss term to a generally applicable rule.

## Research sources

- Wright Field, **Eng-47-1749-A**, 20 May 1944, P-51B-15 serial 43-24777, later HTML transcription: https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html
- USAAF Wright Field cross-aircraft memo dated **15 May 1944**, P-51B-15 43-24777, separate reported mass and critical-altitude climb: https://www.wwiiaircraftperformance.org/mustang/mustangtest.html
- Wright Field P-47B **PHQ-M-19-1417-A**, 41-5902, original level-speed versus climb MAP and distinct open cooling flaps: https://wwiiaircraftperformance.com/org/p-47/p-47.html
- Greg's original user-provided screenshots in `reference_screenshots/`. They are **calculated worksheets**, not independent historical flight tests.

## Rebuild and test

```bash
node test.mjs
node write_results.mjs
python make_html.py
python test_browser.py
```

The standalone HTML is `Universal_Three_Aircraft_Model_v0.5.html`. The detailed JSON result file is `results.json`, at `sourceConditionAudit`. The `climb_audit.js` shared audit logic can be run without browser dependencies.
