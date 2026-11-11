'use strict';
const fs=require('node:fs'),M=require('../src/physics.js'),B=require('../src/operating-benchmark.js'),T=require('../src/turn-lift.js'),L=require('../references/p51-turn-lift-tn1044.json');
const {models,specification:S}=require('../validation/diagnostics/operating_benchmark_v42.cjs').buildData();
const previous=require('../references/analysis/v41-comparative-performance.json');
const report=require('../validation/current/operating-benchmark-v42.json');
const n=(x,d=1)=>Number.isFinite(x)?x.toFixed(d):'unavailable';
const rows=Object.entries(models).map(([id,m])=>({id,before:previous.rows.find(r=>r.id===id&&r.altFt===15000&&r.mode==='reference'),
 normal:B.metrics(M,T,L,m,S.aircraft[id],S.policy,{mode:'normal',fuelFraction:.5,extension:true},15000),
 combat:B.metrics(M,T,L,m,S.aircraft[id],S.policy,{mode:'combat',fuelFraction:.5,extension:true},15000)}));
fs.mkdirSync('references/analysis',{recursive:true});
fs.writeFileSync('references/analysis/v42-operating-before-after.json',JSON.stringify({baseline:S.baselineCommit,altFt:15000,qualification:'Different loading/rating policies, not historical accuracy error reductions. Same original source aerodynamic coefficients.',rows})+'\n');
let doc=`# v4.2 operational benchmark

Research candidate **4.2.0-rc.1**, implemented against main \`${S.baselineCommit}\`. This milestone implements Michael's agreed engine, load and altitude comparison policy. It does not refit the aerodynamic calibration or certify historical turn accuracy.

## Delivered behavior

The new first panel compares two independently configured aircraft. Each side selects its own aircraft, **Normal or Combat**, **25/50/75% internal fuel**, and a separate injection switch where fitted. The common altitude selector has **sea level, 10000, 20000, 30000, 35000 and 40000 ft**. Injection is disabled for unequipped aircraft and for Normal; changing one side does not change the other. Same-aircraft comparisons are allowed. The current Corsair has water/methanol injection; no MW50/GM1 or later-model Thunderbolt injection is invented for the other six profiles.

Both profiles calculate maximum sustained turn rate, speed at the peak, 360-degree time, g and radius, minimum sustained radius, an instantaneous 7g-cap scenario, maximum climb rate/Vy, rate at the recorded climb-speed schedule, and maximum steady level speed. The turn plot uses the two selected physical configurations. Instantaneous capability can consume energy; level-speed equilibrium does not include the time required to accelerate to it during a short rating.

The atmosphere now follows the ISA lapse-rate layer through 11 km and the isothermal layer above it through 40000 ft. Every tropospheric value in the old domain remains unchanged. The selectable **labelled high-altitude estimate** uses a density-lapse continuation from the final engine source node. Turning this option off returns source-power-unavailable rather than old/stale results. Estimated engine coverage is not a measured ceiling or validated historical turn envelope.

## Engine settings and provenance

| Aircraft | Normal | Dry Combat | Separate injection |
|---|---|---|---|
`;
for(const[id,m]of Object.entries(models)){const s=S.aircraft[id];doc+=`| ${m.ac.name} | ${s.normal.label}; ${s.normal.seconds?s.normal.seconds/60+' min':'no timed limit selected'} | ${s.combat.label}; ${s.combat.seconds/60} min | ${s.injection?s.injection.label:'not fitted'} |\n`;}
doc+=`
Every per-aircraft setting, source URL, loading formula and qualification is captured in [the compact operating register](../references/benchmark-operating-profiles.json). Important qualifications are also visible in the app:

- Spitfire +12/2850 and +18/3000 limits are corroborated by the matched report and pilot notes. Its lower-rating BHP is a pressure/RPM proxy, not measured installed torque.
- Mustang normal procedure is a V1650-7 manual-family transfer. The actual 43-24777 report distinguishes current 67-inHg WEP from proposed 75-inHg trials; proposed 75 is excluded from this benchmark.
- P-47B uses its dry normal/military ratings and verified 2:1 gearing. No D-model injection is transferred. The eight-gun loaded reference and original six-gun aerodynamic trial are explicitly different specimens.
- The F4 numerical rating/clearance cells were not independently recovered from the original handbook; its existing secondary rating/duration assumptions remain marked provisional. No artificial fit to an IL-2 turn is performed.
- Fw190 emergency power is a BMW801D2 manual rating transfer to the earlier trial. It does not establish the clearance of the exact 783 test on its original date.
- Early P-38G manual OCR has ambiguous minute/MAP cells. The 37-inHg/2600 normal input and five-minute military allowance require original-cell verification. No later J/L 54-inHg input is admitted. This profile is explicitly qualified, not silently labelled fully manual-verified.
- Corsair sea-level dry and injected rated powers have source support. The altitude power ratio, assumed 100-lb charged fluid reservoir and 20-lb/min flow are engineering scenarios. They do not reconstruct an original water system. The source-only gate does not validate these other transfers.

## Air-to-air loading

Standard fixed guns, full ammunition, pilot/oil/service equipment; no bombs, rockets, external tanks or optional gunpods. Removable racks are excluded. The Mustang uses its clean calibration and the source's rear-tank-empty/full-ammo combat mass, not a global subtraction of the high-speed-only rack fit. Corsair fixed standard fittings remain part of its reference clean-fighter polar. The original racked test replays remain unchanged below the benchmark.

Fuel percentage is relative to stated usable internal capacity, at 6 lb/US gal for this scenario. Normal, dry Combat and injected Combat start at identical mass for the same fuel choice; the charged injection reservoir is carried in all three cases. Full-climb replay consumes fluid only when injection is active. Full-service weight attribution is not completely verified: the P-38 reconstruction adds two guns/ammunition to an underarmed trial; P-47 full-fuel/full-ammo attribution is assumed; most other source gross masses are not recovered instantaneous combat weights. These are documented load reconstructions, not newly measured standard-load airframes. No 100% fuel option forces an unsuitable rear-tank state into a maneuvering comparison.

## Full climb and rating limits

The climb begins already airborne at the selected start height; takeoff is excluded. Normal follows its recorded routine IAS schedule, currently treated as CAS for the calculation where an exact applicable instrument correction is unavailable. Per-aircraft schedule transfers and engineering altitude extensions are stated in the source register.

Combat tests contiguous boost windows on a 1000-ft altitude grid, refines around the best window at 500 ft, then uses the quickest tested valid replay. Speeds are obtained from shared-solver maximum-climb searches at three load levels. The rates and fuel flow are re-evaluated at actual midpoint mass at every integration step. It is a bounded engineering window search, not proof of global time-optimal flight. It excludes speed-change acceleration and a dynamic temperature model. Therefore the report says quickest **tested** window rather than universal historical combat doctrine or a validated absolute minimum climb time.

Combat time and injection fluid do not reset at altitude presets. The dry and wet Combat ratings share their high-power clock. Fluid exhaustion can return to dry Combat for the remaining common allowance; power-time exhaustion returns to Normal. Where Normal has a finite duration, its clock includes the preceding higher-power time conservatively and then uses the documented lower continuous setting. No automatic cooldown replenishment is invented. Fuel exhaustion, missing source coverage and inability to climb are distinct outcomes.

Fuel consumption uses an illustrative 0.50 lb/total shaft-hp-hour. It is not a measured per-engine BSFC map. Results report the selected power schedule, combat time used/remaining, injection fluid remaining, fuel burned and arrival mass. Settings changes clear old climb results.

### Modeled climb from sea level to 20000 ft, 50% internal fuel

| Aircraft | Normal min | Combat min | Combat time used sec | Selected boost start ft |
|---|---:|---:|---:|---:|
`;
for(const[id,m]of Object.entries(models)){const a=report.climbs.find(c=>c.id===id&&c.settings.mode==='normal'),b=report.climbs.find(c=>c.id===id&&c.settings.mode==='combat');doc+=`| ${m.ac.name} | ${n(a.seconds/60,2)} | ${n(b.seconds/60,2)} | ${n(b.combatSeconds,1)} | ${n(b.boostStartFt,0)} |\n`;}
doc+=`
The Corsair Combat climb in this table uses its separate injection switch. These are scenario calculations, not historical flight-test residuals. A shorter time can arise from changed fuel/armament mass, power policy, climb-speed selection or injection rather than improved aerodynamic accuracy.

## Before and after: 15000-ft turn benchmark

| Aircraft | Earlier reference rating | Earlier reference maximum sustained deg/s | Normal, 50% fuel deg/s | Dry Combat, 50% fuel deg/s |
|---|---|---:|---:|---:|
`;
for(const r of rows)doc+=`| ${models[r.id].ac.name} | ${r.before.rating} | ${n(r.before.sustained?.value,2)} | ${n(r.normal.sustained?.rateDegSec,2)} | ${n(r.combat.sustained?.rateDegSec,2)} |\n`;
doc+=`
These columns intentionally represent different scenario policies. They are **not** before/after historical turn-error scores. The old reference and its fit/check cohorts remain preserved. [Full numerical snapshot](../references/analysis/v42-operating-before-after.json). Generated \`validation/current/operating-benchmark-v42.json\` contains all 90 default-fuel altitude/profile combinations plus fourteen full climbs in the downloadable CI artifact.

## Verification and remaining scientific gates

Run \`npm run check\` and \`npm run test:browser\`. The added tests verify both profiles and all three fuel loads for every aircraft, instantaneous/turn kinematics, unchanged legacy atmosphere values, ISA continuity at 11 km, 40000-ft conversion, P-47 gearing, separate injection, unavailable source-only results, fuel/clock depletion, fluid-before-power exhaustion, bounded boost-window comparison and climb-step convergence. Browser checks operate the real controls, compare the untouched other side, share all six heights, exercise missing-coverage clearing and a timed full climb, invalidate stale output, and inspect mobile layout.

No original data, imported source hash, protected coefficient or frozen historical benchmark is changed. Engineering acceptance is distinct from independent historical performance accuracy. A stable turn-model or 5:1 claim is not made. Next work should replace the explicit load/rating/altitude conversions with exact same-variant sources, improve joint low-speed drag/propulsion constraints and verify historical turn capability; source-coverage percentages must not be substituted for prediction accuracy.
`;
fs.writeFileSync('docs/V42_OPERATING_BENCHMARK.md',doc);
