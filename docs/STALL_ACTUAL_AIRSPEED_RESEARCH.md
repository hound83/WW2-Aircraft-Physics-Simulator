# Actual stall airspeed research, 2 November 2026

The useful new numerical result is a **P-51B low-Mach engineering candidate near 103 mph EAS at 9240 lb**, based on calibrated flight measurements of maximum lift, rather than treating the reported 84-86 mph IAS as aerodynamic speed. It is not an exact correction of the Wright Field instrument and has not changed the active model. None of the four exact target specimens yet has a completed cockpit-stall IAS-to-CAS evidence chain.

Michael explicitly prioritised actual stall calibration, including primary and secondary sources, ahead of further climb work. Relevant secondary leads were followed to original reports and visually checked pages. Primary evidence controls where the sources disagree.

## Which speed the solver needs

Use EAS for dynamic pressure and lift. Correct the cockpit indication for the appropriate instrument and installation/position errors to obtain CAS, then apply the compressibility correction at the test pressure altitude to obtain EAS. Derive TAS separately using density. A density correction or a fixed percentage does not convert IAS to CAS.

For steady one-g flight, Vs,EAS = sqrt(2 W / (rho0 S CLmax)). Weight, area and coefficient must use the same convention and configuration. A descending or post-stall time history can have normal acceleration below one g: its minimum recorded speed is not automatically a one-g stall. NACA TN1044 explicitly uses measured normal acceleration and stall-time weight.

## Four target decisions

| Aircraft | Historical indication | New usable evidence | Decision |
|---|---|---|---|
| P-51B-15 43-24777 | Clean power off at 8000 ft: 86 IAS at 9270 lb, shutters closed; 84 IAS at 9240 lb, open | NACA TN1044 calibrated P-51B low-Mach CLmax approximately 1.45 | Test approximately 103.4 EAS / 103.5 CAS at 9240 lb as a source-informed candidate. Exact specimen, propeller and finish transfer remain qualified. This is not a recovered +19.5 mph instrument correction. |
| Spitfire LF IX BS.543 | Manual training row: 90 IAS at 7150 lb, clipped wings; full-span indications roughly 3-6 mph lower | RAE Aero1106 reports earlier Spitfire I CLmax 1.36 in glide using trailing static head | At 7110 lb and 242 sqft this implies 91.9 EAS. Older-mark transfer sensitivity only, not measured BS.543 stall. |
| P-47B 41-5902 | 105 IAS, clean power off, cowl closed, oil/intercooler neutral | Exact original calibration covers 170-310 IAS; new D-30 stall plots still say service IAS | No corrected B stall number recovered. Do not treat 105 as EAS or borrow N/D corrections. |
| Bf 109 F-4 | Earlier 154-171 km/h traces to IL-2 specifications | Original F1/F2 specification distinguishes 140 indicated and 150 true km/h at landing, 2700 kg | This confirms the speed-basis issue, but does not calibrate a clean F4 stall. No historical F4 CAS/EAS target accepted. |

These are different evidence levels, not four equally validated answers. The Spitfire transfer is substantially weaker than the same-variant Mustang candidate.

## P-51B: calibrated flight lift gives a useful alternative

Primary: [NACA TN1044, Effect of Mach and Reynolds Numbers on Maximum Lift Coefficient](https://ntrs.nasa.gov/citations/19930084610), J.R. Spreiter and P.J. Steffen, 28 March 1946. [Download](https://ntrs.nasa.gov/api/citations/19930084610/downloads/19930084610.pdf).

Visually inspected printed pp.3-4 and Figures 1/6; PDF pages 3-5,21,29. Swivelling probes about a chord ahead of the wing were calibrated for position error. All propeller-fighter tests were clean gradual stalls in turns or pull-ups, engine throttled, propeller high pitch. Mustang surfaces were carefully filled, waxed and polished. CLmax uses stall-time weight and measured normal acceleration; the report states less than 2% error from its lift/normal-force approximation.

Figure 1 supplies P-51B area 233.2 sqft, MAC 6.65 ft, span 37 ft and gross weight 9300 lb. This gross weight is not automatically each stall's instantaneous weight.

Figure 6 gives approximately 1.45 near Mach 0.14-0.18 in the 5100/9300-ft tests. A rounded 1.40-1.48 engineering bracket reflects visual reading and nearby test variation; it is not a published confidence interval. At 9240 lb that bracket implies **102.3-105.2 mph EAS**. The nominal 103.4 EAS is Mach 0.158 at 8000 ft, inside that low-Mach region. Figure 6 also shows a marked reduction in CLmax as Mach increases. Do not label a constant 1.45 historically valid across altitude and turn speed.

The [secondary discussion](https://ww2aircraft.net/forum/threads/the-zeros-maneuverability.64084/page-15) led to the report but describes the Mustang results as power-on. Original printed p.4 explicitly establishes the throttled-engine condition. Use the primary.

[TR829](https://ntrs.nasa.gov/citations/19930091906), Table I printed p.6 and Figure 4 p.9, provides supporting full-scale-tunnel evidence: airplane 1 has a 233.2-sqft NACA-NAA compromise wing, Mustang planform and maximum lift about 1.4. Names are not printed in the table, so identification is an inference from geometry/planform. Complete-airplane-less-propeller tests at roughly 60 mph are not identical to flight conditions.

Original **AP2025G-P.N., Mustang III**, June 1944, printed p.24 para.43 says engine-off clean stall 90 IAS. Printed p.31 para.54 gives position corrections:

| IAS band, mph | Add, mph |
|---|---:|
| 120-150 | +6 |
| 150-190 | +3 |
| 190-240 | 0 |
| 240-300 | -3 |
| 300-350 | -6 |
| 350-400 | -9 |

[Public scan](https://drive.google.com/file/d/1reJrEW9CZ6kMD5n6lbmCs3tNJ0E7ACKC/view), PDF pages 26/33 visually checked. These are bands, not interpolation nodes. They do not cover the 90 IAS stall; do not extrapolate +6. Position correction does not establish a particular indicator's instrument error.

[FX953 primary report](https://www.wwiiaircraftperformance.com/org/p-51/fx953.html) section 3.1 independently limits its position-error measurement to 120-360 ASI. The Wright Field [43-24777 graph](https://www.wwiiaircraftperformance.com/org/p-51/p51b-24777.html) starts around 140 IAS. Neither closes the stall correction.

Original **TO1F-51D-1**, printed p.96 Figure A-1, explicitly gives installation corrections to obtain CAS. With gear/flaps up and canopy closed: **100 IAS +5 =105 CAS**. This is a concrete conversion example, not a claim that the D stalls at 100. It cannot calibrate B/C or extend below 100.
[Scan](https://stephentaylorhistorian.com/wp-content/uploads/2020/04/p-51d-manual-b.pdf), PDF pages 100-101 visually checked. Additional points IAS/add mph: 120/+5,140/+4,160/+4,180/+3,200/+3,220/+2,240/+2,260/+2,280/+2,300/+2,350/+3,400/+4.

## Spitfire: primary sources disagree about the measurement method

[NACA L353](https://ntrs.nasa.gov/citations/19930092581), September 1942, tested a VA at approximately 6184 lb, CG31.4% MAC. Printed p.7 reports clean throttle-closed CLmax1.18 with gun ports covered and1.15 open. Figure5 has correct indicated airspeed on x and pilot meter reading on y, with separate glide/cruise/landing symbols. Invert appropriately for pilot-reading conversion. Do not assume the table's own indicated-speed column is uncorrected pilot reading and correct it again.

The original **RAE Aero1106 (Misc.) (Revised), M.B. Morgan, March1943**, p.2 sections2.3/2.5, criticises formation/pacer calibration for stall measurements. RAE reports flaps-up CLmax **1.36 in glide and1.89 full throttle**, measured with swivelling pitot and trailing static head. Section2.5 identifies the comparison as **Spitfire I**, not IX.
[Recovered original two-page scan](https://web.archive.org/web/20160313134537id_/http://www.spitfireperformance.com/rae1106.pdf). Original live URL returned404; archived PDF recovered successfully and both pages visually checked.

This is a genuine primary-source measurement dispute, not justification to select or average values without qualification. Preserve NACA results and RAE criticism together. [Secondary discovery lead](https://forum.il2sturmovik.com/topic/25323-p-40-turn-rateflight-model-check/page/14/).

The [IX/XI/XVI manual reproduction](https://zenoswarbirdvideos.com/Images/spit/SPIT9MANUAL.pdf), para53, starts at120 IAS (+4 to150). Its pages were visually checked, but the file appears re-typeset and contains apparent transcription/typesetting errors in other cells: do not mark original-print scan verification complete. The lower bound still does not cover stall.

Its bands IAS/add mph:120-150/+4,150-170/+2,170-210/0,210-240/-2,240-290/-4,290-350/-6. Para42 separates clipped/full-span wings and stores. [BF274 report](https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitFmkIX_BF274.html), whose calibration BS543 adopted, explicitly says measured range130-320 ASI.

## P-47: a research boom does not make every trace CAS

The tracked original PHQ-M-19-1417-A establishes 41-5902's105 IAS stall and higher-speed calibration. Instantaneous stall mass, altitude and low-speed correction remain missing. P47N's120 IAS to120 CAS is for a different wing/installation, not proof of zero correction at B's105.

[NACA RM L8A06](https://ntrs.nasa.gov/citations/20090022749), Figures49-51 (PDF72-74), has D-30 43-3441 gliding-stall histories at5000/24000ft with mass andCG. The speed trace explicitly says **service indicated airspeed**. Related [TN2675](https://ntrs.nasa.gov/citations/19930083825), printed p.4, describes a calibrated research boom and defines CAS, but does not give the missing service-indicator correction at stall. Do not relabel the RM trace CAS. B/D transfer is a separate unresolved issue.

[TR792](https://ntrs.nasa.gov/citations/19930091869) is an abrupt-manoeuvre/tail-load study. A transient peak is not a gradual one-g stall input. The secondary forum linked both this and RM L8A06; they must not be confused.
[Discovery lead](https://forum.il2sturmovik.com/topic/74337-p-47-maneuverability-or-lack-thereof/page/6/).

## Bf109: original F-series speed distinctions recovered

[Original F1/F2 Kennblatt](https://stephentaylorhistorian.com/wp-content/uploads/2020/04/109_f1f2_kennblatt.pdf), Blatt6, visually verified: landing at2700kg is140 indicated/150 true km/h; unstick at2780kg is130/140. Neither is a clean F4 stall. The difference is not a universal +10 km/h CAS correction.
[Secondary discovery lead](https://ww2aircraft.net/forum/threads/f6f-5-vs-109.16319/page-6).

The retrieved F2/F4 Wa manual concerns weapons. The US evaluation contains no usable stall correction. The F-series flight/maintenance handbook is catalogued, but public download and archive attempts did not yield an inspectable flight-manual scan. This remains a specific retrieval lead, not proof no correction exists. Preserve [Hafner catalogue](https://luftfahrt-archiv-hafner.de/Flugzeuge/messerschmitt.html) and [historical handbook link discussion](https://www.flugzeugforum.de/threads/bf-109-technische-fragen-technische-antworten.23887/page-47).

## Calculations actually run

Used shared ISA/CAS/EAS functions and SI lift balance with rho0=1.225kg/m3,1mph=.44704m/s,1lbf=4.4482216153N.

| Case | Weight lb | Area sqft | CLmax | EAS mph | CAS at8000ft | TAS at8000ft |
|---|---:|---:|---:|---:|---:|---:|
| P51B candidate |9240|233.2|1.45|103.387|103.469|116.614|
| Same candidate at closed-shutter test mass |9270|233.2|1.45|103.555|103.637|116.803|
| Earlier-Spitfire transfer sensitivity |7110|242|1.36|91.926|91.983|103.686|

These are derived one-g scenarios, not observations on the target specimens. Present rounded operational conclusions, not this calculation precision as historical accuracy.

Current active provisional model, evaluated at its default weights: P51B98.464 EAS/CL1.6/9240lb; Spitfire84.751/1.6/7110lb; P47B112.261/1.3/12565lb; Bf109F4 98.065/1.5/6371lb. These are model outputs, not calibrated historical stall targets.

## Integration and verification status

The v3.5 stall laboratory now integrates the candidate through the shared solver, preserves CL times area, exposes source altitude/Mach limits and separates manual correction outcomes. The interrupted diagnostic property-name error is fixed. Ten selected-page source excerpts and their SHA256/page-mapping manifest are preserved under references/sources/stall-2026-11-02. The Spitfire manual reproduction is correctly distinguished from an original-print scan.

See [v3.5 delivered behavior and validation](V35_STALL_LAB.md), [structured register](../references/stall-calibration-research-2026-11-02.json), [source manifest](../references/sources/stall-2026-11-02/manifest.json), and [calculation sweep](../validation/current/v35-stall-lab.json). No active general coefficient or solver changes were made and no exact-target historical stall calibration is claimed.

Next complete milestone: recover matching low-speed records for the remaining F4/P47B/IX cases and validate a suitable altitude/Mach-dependent lift model. Stall calibration remains ahead of unrelated climb fitting.
