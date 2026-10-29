# European Air War — Clean Physics v2.3 / Original NACA 1934–1946 Research

**October 27, 2026.** New source-first archival physics checkpoint; previous v2.2 functionality and all prior research are retained. **Four aircraft**: P-51B-15, Bf109F-4, P-47B, Spitfire LF Mk IXc (BS.543). Other variants used for source comparisons are explicitly segregated.

## Start here

Open **`Universal_Four_Aircraft_Model_v2.3.html`** — portable 4.28 MB offline application (no server needed). Original **C** profile stays selected by default. Choose research propeller mode **N** to test independent 1941 NACA `η(J,Cp)` approximate graph curves, with blade count from aircraft geometry. Existing Greg **G**, earlier scenarios and source plots remain.

The entirely new primary-source research dossier is `../../06_SOURCE_AND_SCIENTIFIC_EVIDENCE/NACA_1934_1946_DEEP_RESEARCH/NACA_DEEP_RESEARCH_v23.md`. **112 original NACA report PDFs, 112 smaller page-count-checked copies, 3,874 report pages, all NASA provenance/SHA hashes, 104 extracted and eight newly OCRed transcriptions** are indexed under that directory; some are duplicates or tangential items, not 112 independent sets of measurements.

### The implemented change

The optional N model interpolates **NACA 1941 Biermann & Conway** original Fig.10–12 graphs (NASA citation `19930093644`, PDF page27) at `Cp=.2,.4,.6`, `J=.3–3.5`, 3-/4-blade. It is not an installed-aircraft prop map. The original underlying experiment studied a particular blade family; digitizing a figure is approximate (η uncertainty ±.03–.05). Power coefficient below 0.2 is **clamped with a visible out-of-range flag**, not scientifically extrapolated. No explicit tip compressibility loss, variable pitch/blade-section geometry or prop/spinner/cooling integration yet. `C` unchanged.

Reference math: `J=V/(nD)`, `Cp=P_shaft/(rho n³ D⁵)` in consistent units; `(T*V)/P_shaft=eta`. Separate `IAS/CAS/EAS/TAS` remain modeled. An NACA chart cannot replace an engine's rating-specific altitude BHP curve.

### Genuine independent period checks, without fitting

| Test | New N model | Original measured/source |
|---|---:|---:|
| Four-blade 1944 NACA design example at `J=2.26`, `Cp=.342` | η **.844** | η **.848** in Crigler & Talkin, 1944 (`19930093312`) |
| 1945 in-flight **P-47D three-blade** 6507A-2 prop, 6 climb-condition runs | mean absolute η error **.0141** | Flight Table I, Gardner 1945 (`19930093653`) |
| Same 1945 real prop, 6 high-speed runs | error **.0579**, positive bias **.0574** | Flight Table II; higher tip Mach exposes missing compressibility |
| Bf109F-4 270km/h IAS turn, 0/3000m, *Greg independent drag polar* | **20.33 / 26.01 sec** | IL-2 secondary **20.30 / 26.10 sec** |
| Bf109F-4 combat top speed, same polar | **320.5 mph** | historical 325 mph; residual −4.5 mph, not adjusted away |
| P-51B at 2200ft 67/75-inHg steady climbs, speed reanchored | **3320 / 3894 fpm** | historical **3820 / 4380**; still short 500/486 fpm |

NACA's early 1941 low-speed curves predict the 1945 actual P-47D **climb** propeller efficiencies surprisingly well out of sample. However, the source three-blade P-47D is **not the modeled P-47B**. At higher tip Mach, there is a much larger missing compressibility term. Do not treat IL-2 Bf109 game turns as historical combat flight-test measurements. We have *not* solved P-51B low-speed useful power, and should not claim we have.

The Mustang's undershoot is not something to paper over with a constant Meredith heat-credit: original 1939 NACA experiments found waste-heat recovery not practically significant up to 400 mph for the tested radiator ducts, and 1943 cooling theory varies pressure recovery with altitude and duct configuration. The drag polar/source weight and 67/75 engine power at climb speed are still important unresolved checks.

## Reproduce from source

```bash
node naca_propeller_benchmark_v23.cjs --write
node naca_inflight_prop_holdout_v23.cjs --write
python3 plot_naca_v23.py
python3 make_html_v23.py
node --test test_*.cjs
```

Source files:

- `physics.js`, `cases.json` — full current source and original four-aircraft data.
- `naca_propeller_benchmark_v23.cjs` plus `naca_propeller_benchmark_results_v23.json` — NACA 1944 design consistency, four aircraft, Greg-independent Bf 109 source polar and Mustang historical figures.
- `naca_inflight_prop_holdout_v23.cjs`, `naca_inflight_prop_holdout_results_v23.json` — 12 independently selected original NACA **P-47D 1945** flight-propeller test rows, input J/Cp/η/Mtip and exact run labels.
- `plot_naca_v23.py`, `naca_flight_power_comparison_v23.png`, `naca_1941_original_fig10_12_v23.jpg` — analytical figure and original report graph.
- `make_html_v23.py` — reproducibly embeds up-to-date physics and cases into self-contained offline HTML.
- `test_naca_v23.cjs`, `test_naca_holdout_v23.cjs`, `test_html_static_v23.cjs` plus all older historical regressions. Offline HTML script syntax is validated using Node VM; **no live Chromium/Playwright browser session was available here**.

## Next large physics iteration

1. Digitize the full period `eta(J,Cp,Mtip)` contour sources, especially the successful OCR'd **1946 YP-47M 6507A-2 three/four-blade** high-loading tunnel series, and understand the 1945 flight-observed tip Mach penalty. Preserve measured 1945 P-47D samples as the holdout.
2. Engine-specific rated BHP vs altitude, RPM, induction temperature and ram for the **Merlin V-1650-3, DB601E, R-2800-21, Merlin 66**; 1939–44 NACA supercharger/turbo reports supply the governing structure but **not** substitution for these engines' measured schedules.
3. Proper lift-dependent parasite/profile drag (wing section != whole-airframe CD0), cooling system/ram/exit flap behavior, and simultaneous multi-speed climb/turn/level-power testing.

Old `README_CLEAN_v22.md`, earlier HTML snapshots, source images, workbook and archived ZIPs remain historically reproducible; follow **v2.3** as the current model checkpoint.
