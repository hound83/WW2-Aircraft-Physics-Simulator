# European Air War — Clean Physics v2.2 — 27 October 2026

## Outcome

**Open `Universal_Four_Aircraft_Model_v2.2.html`** for the complete self-contained offline model with four aircraft and all prior comparisons. Version 2.2 adds:

1. **Greg power-curve `G` what-if** in the live propeller menu: actual shape of Greg's high-powered P-47D **propulsive-horsepower-versus-speed** worksheet, scaled by the worksheet's **2,210/2,600 = 0.85** plateau. The speed ramp is not itself a sourced installed Hamilton Standard, VDM or Rotol efficiency map. Original candidate C remains default.
2. **Greg F-4 drag-polar scenario** in the live Bf 109 menu: `CD₀ = 0.02437285`, `e = 0.55767067` inferred from his screenshot's 325-mph parasite and induced drag with **6,371 lb** assumed mass. IL-2-derived fit stays the default; Greg's separate source is optional. The 109 is tested against **both turns and level speeds**.
3. **Quantified dual validation**: `greg_power_budget_results_v22.json`, four-panel `greg_power_budget_v22.png`, all historical reference rows and original reports in the handover.

**The model's original default predictions and the four-aircraft geometry/engine records are unchanged.** There is no new user-specific prop efficiency or Meredith-effect cooling-drag coefficient fitted to a historical climb result.

## Greg arithmetic findings — original numbers matter

The two source sheets list effective propulsive horsepower, NOT independently measured shaft horsepower or engine thrust:

| Greg screenshot | 100 mph | 175 mph | 225 mph | 325 mph | High-speed plateau |
|---|---:|---:|---:|---:|---:|
| Bf 109 F-4 | 832 hp | 1,000 hp | 1,058 hp | 1,058 hp | **1,058 propulsive hp** |
| P-47D high-power | 1,700 hp | 2,080 hp | 2,210 hp | 2,210 hp | **2,210 propulsive hp** |

Normalize by each plateau: the shared 100/125/150/175/200/225-mph nodes differ by **0.76 percentage points mean absolute**. It is a compelling, repeatable *Greg-model structural check*, but the common shape likely comes from a **shared assumed efficiency-versus-speed function**. Do not confuse an arithmetic match with two independent historical propeller measurements.

Greg's P-47D 2,600-bhp assumption implies η **0.80 at 175 mph** (2,080/2,600), η **0.85 at 225 mph and faster** (2,210/2,600), not a constant .85 at all airspeeds. Its engine, turbocharging and wing/cooling configuration **must not be silently copied into the separately modeled P-47B**.

Greg's F-4 1,058 propulsive-hp plateau cannot yield an unambiguous η without identifying the DB 601E rating used:

- Existing model's **combat** shaft estimate is **1,184 bhp** at sea level, so 1,058 / 1,184 implies η≈**0.894**.
- Its **emergency** shaft estimate is **1,332 bhp**, implying η≈**0.795**.
- The screenshot omits matching engine BHP/rating; these are **alternative denominators, not two proven propeller maps**. Old `README_GREG_v11.md` assumed a different rating/model snapshot and is superseded for installed power.

## Mustang independent climb-and-speed check

Source: 20 May 1944 Wright Field P-51B-15 serial **43-24777**, with original documented **9,335-lb takeoff weight**. At 2,200 ft with 3,000 rpm:

| Measure | Historical | Current C model | Greg-P-47D G, fixed drag | Greg-P-47D G, speed-reanchored drag |
|---|---:|---:|---:|---:|
| 67 inHg best steady climb | **3,820 fpm** | 3,401 | 3,497 | 3,475 |
| 75 inHg best steady climb | **4,380 fpm** | 3,979 | 4,094 | 4,070 |
| Sea-level 67 inHg top speed | **361.5 mph** | 361.5 | **366.7** | 361.5 |

The unchanged C model has **~419/401-fpm** residual, corresponding to **~118.5/113.6 useful excess hp** at 9,335 lb. If solely a fixed-TAS propeller efficiency change filled it, η would have to rise from **0.781→0.855** at the model's 171-mph 67-inHg optimum and **0.784→0.847** at 175-mph 75-inHg optimum. That is **not** derived from a matched aircraft-specific efficiency map. The shaft curves are already at their rated **1,603/1,811 bhp** at this altitude under the present ideal-inlet model. Increasing induction pressure below a regulated boost point does not automatically add horsepower.

Using Greg's high-power P-47D curve reduces the Mustang residual, but **breaks a measured speed anchor unless CD₀ is re-fitted**. Reanchoring to the same speed reduces the apparent climb gain further, leaving ~345/310 fpm unexplained. Real climb TAS, mass at 2,200 ft, in-flight shaft power, radiator condition and actual installed propeller performance remain uncertain. Even idealized `e=1.0` and an arbitrary 8500-lb weight are insufficient as a physically defensible stand-alone explanation. The radiator Meredith effect is a **speed- and configuration-dependent net cooling system effect**, not a warrant to subtract drag or add positive thrust at climb TAS.

## Bf 109 F-4: don't buy good turns by losing high-speed accuracy

Source Greg wing drag split at 325 mph, 6,371-lb assumption: `CD₀=.02437285`, `e=.55767067`. IL-2 F-4 official specs supply **20.3 s at sea level and 26.1 s at 3000 m** for 270 km/h IAS 360° sustained turns. IAS≈CAS is provisionally assumed because a matched measured instrument correction is unavailable.

| Model assumption | 0 m turn | 3000 m turn | Combat top TAS |
|---|---:|---:|---:|
| IL-2 secondary reference | **20.30 s** | **26.10 s** | Not the historical combat-speed anchor |
| Generic model e=.78, speed-reanchored | 17.47 s | 21.06 s | 325 mph by calibration |
| Former IL-2-conditioned e≈.547 | 20.30 s | 25.89 s | 325 mph by calibration |
| **Greg independent polar + current C prop** | **20.23 s** | **25.83 s** | **315.5 mph** |
| Greg independent polar + transferred G prop | 20.14 s | 25.37 s | 319.3 mph |
| Published Rechlin-based **combat** speed reference | — | — | **325 mph** |

The source-derived polar nicely narrows the **turn** gap without tuning to IL-2. But it underpredicts the separately sourced 325-mph level-speed reference by ~**9.5 mph** under C and ~**5.7 mph** under G. The generic e=.78 case is worse for turns. Thus **all of engine rating, η(TAS), CD₀ and e must pass both tests simultaneously** before treating any F-4 parameter set as historically corroborated. `greg_power_budget_v22.cjs` explicitly computes F-4 turn results for both interpretations of Greg's hidden shaft-power denominator; they differ by more than one second in sustained turn time.

## Other aircraft and speed definitions

- The Spitfire LF Mk IXc BS.543 remains modeled; v2.1's speed-dependent boost prediction reduced original 16-point RAF climb MAE from **365 to 139 ft/min** with a pressure MAE of **0.42 psi**. The G scenario is research-only on this aircraft and cannot override original RAF data.
- The P-47B 1943 original report is preserved, including speed and climb cross-checks; the P-47D 2,600-bhp Greg case is explicitly **not** treated as P-47B data.
- The P-51B-15 (Wright Field), P-51B-5 in IL-2, P-51D in DCS, P-47B original and P-47D-28/D-30 in games are **distinct aircraft/engine/configuration references**. No cross-variant numerical merges.
- `IAS`, `CAS`, `EAS`, and `TAS` are never treated as synonymous. Greg table velocity labels are not self-documenting; provisional TAS interpretation is shown, not asserted as measured.

## Running, changing and checking v2.2

From `03_MODEL_PROTOTYPES/CURRENT_v0.7_WORKING_SOURCE/`:

```bash
node greg_power_budget_v22.cjs --write
python3 plot_v22.py
python3 make_html_v22.py
node --test test_*.cjs
```

**23 automated Node tests pass**, including the two new v2.2 files and all earlier regressions. The generated HTML embeds all datasets, scripts and charts for offline use. Chromium/Playwright browser smoke testing is included as `test_browser_v22.py` but was **not executable in this runtime** (Playwright and Chromium not installed); code/static syntax and programmatic numerical tests passed. The 1944 original pages, Greg's full original files, the 1943 RAF original reports, IL-2/DCS variant references, and historical intermediate scripts are included in the full handover ZIP.

### Next one or two high-value tests

1. Use a **historical installed P-51B-15 K-6523A-24 propeller map** or measured low-speed thrust / complete prop curves tied to test RPM and Fig.5, **then test the same new input against the 2,200-ft 67/75 climbs AND 361.5-mph level-speed anchor**. Never take Greg's P-47D profile as a period measurement of this propeller.
2. Use original F-4 drag/thrust or source matched power settings to reconcile Greg's polar with **both** IL-2 turns (secondary) and Rechlin-sourced combat/emergency speeds. First identify Greg's missing engine-power denominator/rating or get source full-throttle power-vs-speed.

The goal remains an independently constrained, **universal** E-M model, not one curve tuned to reproduce one flight test.
