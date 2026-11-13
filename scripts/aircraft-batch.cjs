'use strict';

const M = require('../src/physics.js');
const greg = require('../references/analysis/fighter-greg-drag-models-v1.json');

const HF = 'spitfire_hfix_bs551';
const G2 = 'bf109g2_db605a';
const D = 'p51d15_4415342';
const FT = .3048;
const KMH = 1.609344;
const PS_TO_HP = 735.49875 / 745.6998716;
const LB_PER_KG = 1 / .45359237;
const GALLON_L = 3.785411784;
const FPM_PER_MPS = 60 / FT;

const sources = {
  hf: {
    title: 'A&AEE BS.551 Merlin 70, Tables III and VI',
    url: 'https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html',
    kind: 'period flight report', facts: '7,470 lb takeoff, 7,090 lb reduced level weight. Rotol R5/4F5/4 with four wooden RA10046 blades. Closed radiators in level flight, open in climb.',
  },
  merlin70: {
    title: 'Aircraft Engines of the World, Merlin 70/71, p. 205',
    url: 'https://www.wwiiaircraftperformance.org/Aircraft_Engines_of_the_World_Rolls-Royce_Merlin.pdf',
    kind: 'published engine ratings', facts: 'Military: 1,710 bhp at 11,000 ft in MS and 1,475 bhp at 23,250 ft in FS. Normal: 1,360 at 13,750 ft and 1,210 at 26,000 ft. Installed flight power remains estimated.',
  },
  g2: {
    title: 'Finnish MT-215, WNr 14783 performance trials',
    url: 'https://wwiiaircraftperformance.com/org/me109/g/g_files/me-109g2-finn.pdf',
    kind: 'period flight charts with separately indexed table transcription',
    facts: 'Test: actual 2,540 rpm; about 1.30 ata below full-throttle height. 400 L at departure. Exact run loading unknown. Upper-climb scan and tabulation give different rates.',
  },
  g2engine: {
    title: 'DB 605 A ratings and Bf 109 G-2 operating limits',
    url: 'https://github.com/hound83/WW2-Aircraft-Physics-Simulator/blob/main/docs/research/WW2_GERMAN_FIGHTER_ARCHIVE_2026-11-11.md#bf-109-g-2',
    kind: 'period engine ratings and operating instructions',
    facts: '1.30 ata/2,600 rpm climb/combat for 30 min; 1.15 ata/2,300 rpm continuous. The documented clearance blocks 1.42 ata.',
  },
  p51d: {
    title: 'Wright Field TSCEP5E-1908, P-51D 44-15342, Tables A–D',
    url: 'https://wwiiaircraftperformance.com/org/p-51/p51d-15342.html',
    kind: 'period flight report and chart-assigned power',
    facts: 'V-1650-7 and Hamilton Standard K6523A-24. No external load, wing racks fitted. Level Normal and WEP and separate WEP climb power schedules.',
  },
  p51dk: {
    title: 'AN 01-60JE-1 P-51D/K, clean stall table, p. 21',
    url: 'https://data.ntsb.gov/Docket/Document/docBLOB?FileExtension=.PDF&FileName=P51D+Normal+Operating+Instructions-Master.PDF&ID=40206631',
    kind: 'period operating instructions',
    facts: 'Clean handbook IAS at 7,500, 8,500 and 9,500 lb. The range is a cockpit indication check; matching position-error calibration remains open.',
  },
};

function series(catalog, prefix) {
  const rows = catalog.observations.filter(row => row.id.startsWith(prefix + ':'));
  if (!rows.length) throw Error('Missing profile source series: ' + prefix);
  return rows.map(row => ({ id: row.id, ...row.values }));
}
const archived = (catalog, id) => series(catalog, 'archival-2026-11-10:' + id);
const finnish = (catalog, id) => series(catalog, 'ww2_thirteen_fighter_source_recovery_2026-11-11:g2-mt215-' + id);
const mustang = (catalog, id) => series(catalog, 'ww2_priority_aircraft_2026-11-13:p51d-4415342-' + id);
const db605 = catalog => series(catalog, 'ww2_engine_ratings_and_propeller_2026-11-12:db605a-rated-power');
const node = (altFt, bhp, mapInHg) => ({ altFt, bhp, ...(mapInHg === undefined ? {} : { mapInHg }) });
const curve = gears => ({ gears });
const phase = (label, rpm, map, nativeRating, seconds) => ({ label, rpm, map, nativeRating, seconds, powerFactor: 1 });
function levelPolar(ac, anchor, source, e = .8) {
  ac.calibration = { altFt: anchor.altFt, tasMph: anchor.tasMph, gear: anchor.gear, rating: ac.defaultRating };
  const rated = ac.powerRatings[ac.defaultRating].gears;
  const fitCase = { ...ac, propGeometry: { ...ac.propGeometry, engineRpmByRating: { [ac.defaultRating]: anchor.rpm } },
    powerRatings: { [ac.defaultRating]: { gears: { [anchor.gear]: rated[anchor.gear].map(row =>
      ({ ...row, bhp: row.bhp * (anchor.powerFactor ?? 1) })) } } } };
  const fit = M.cd0FromAnchor(fitCase, 'P', e);
  if (!fit?.valid) throw Error('Invalid level-speed anchor for ' + ac.name);
  return { cd0: fit.cd0, e, source };
}
function gregPolar(ac, id, gear, rpm, powerFactor = 1) {
  const { anchor, polar } = greg.aircraft.find(row => row.id === id);
  const runtime = levelPolar(ac, { altFt: anchor.altitudeFt, tasMph: anchor.tasMph, gear, rpm, powerFactor },
    'Greg-method anchor evaluated with the shared propeller at trial RPM', polar.oswaldE);
  if (runtime.cd0 < polar.cd0Range[0] || runtime.cd0 > polar.cd0Range[1]) {
    throw Error('Shared propeller fit outside Greg drag sensitivity for ' + id);
  }
  return { ...runtime, gregReferenceCd0: polar.cd0, gregReferenceCd0Range: polar.cd0Range };
}
const clFromEas = (wingAreaM2, weightLb, speedMph) =>
  2 * weightLb * 4.4482216153 / (1.225 * wingAreaM2 * (speedMph * .44704) ** 2);

function aircraft(id, name, engine, force, geometry, propGeometry, weightLb, clMaxAssumed, powerRatings, defaultRating) {
  return { name, engine, force, ...geometry, propGeometry, weightLb, clMaxAssumed, powerRatings, defaultRating,
    stallIdentity: { aircraftId: id, variant: name }, defaultGear: 'auto' };
}
const geometry = ({ wingAreaM2, spanM }) => ({ wingAreaM2, spanM });
const prop = (donor, diameterFt, reductionRatioEnginePerProp, bladeCount, installation) => ({
  diameterFt, reductionRatioEnginePerProp, bladeCount, installation,
  momentumModel: donor.propGeometry.momentumModel,
});

function hfProfile(base, catalog) {
  const lf = base.models.spitfire_lfix_bs543.ac;
  const low = archived(catalog, 'S04'), high = archived(catalog, 'S05'), climbs = archived(catalog, 'S06');
  const fthPower = (rows, peak, sea, fth) => rows.map(row => node(row.alt_ft,
    (row.alt_ft < 11000 && sea ? sea + (peak - sea) * row.alt_ft / 11000 : peak) *
    (row.alt_ft > fth ? (14.6959 + Math.min(18.5, row.boost_psi)) / 33.1959 : 1)));
  const combat = phase('Combat +18 psi / 3000 rpm', 3000, 32.6959, 'combat', 300);
  const normal = phase('Climb +12 psi / 2850 rpm', 2850, 26.6959, 'normal', 3600);
  const levels = { combat: curve({ low: fthPower(low, 1710, 1520, 15400), high: fthPower(high, 1475, null, 27400) }),
    normal: curve({ low: [node(0, 1220), node(13750, 1360), node(19000, 1360), node(22000, 1160)],
      high: [node(18000, 1200), node(26000, 1210), node(31000, 1210), node(36000, 900)] }) };
  // Table III has a measured boost change at 18,600 ft. The two branches
  // meet at the shift with distinct powers; there is no blended gear.
  const shiftFt = 18600;
  const climbLow = climbs.filter(row => row.alt_ft < shiftFt);
  const climbHigh = climbs.filter(row => row.alt_ft > shiftFt);
  const capBoost = (row, peak, lowGear) => node(row.alt_ft,
    (lowGear ? Math.min(peak, 1520 + (peak - 1520) * row.alt_ft / 11000) : peak) *
    (14.6959 + row.boost_psi) / 33.1959);
  const cLow = [node(0, 1520), ...climbLow.map(row => capBoost(row, 1710, true))];
  cLow.push(node(shiftFt, cLow.at(-1).bhp));
  const cHigh = [node(shiftFt, 1475), ...climbHigh.map(row => capBoost(row, 1475, false))];
  const normalClimb = curve({
    low: [node(0, 1220), node(13750, 1360), node(19000, 1090), node(22000, 950)],
    high: [node(16500, 1190), node(26000, 1210), node(40000, 630)],
  });
  const ac = aircraft(HF, 'Spitfire HF Mk IXc', 'Merlin 70', 'RAF', geometry(lf),
    prop(lf, 10.75, 1 / .477, 4, 'Rotol R5/4F5/4, wooden RA10046'), 7090, lf.clMaxAssumed, levels, 'combat');
  ac.propGeometry.engineRpmByRating = { combat: 3000, normal: 2850, continuous: 2650 };
  const model = {
    ac, options: {}, timedClimbEnergy: true,
    benchmarkPolar: levelPolar(ac, { altFt: 0, tasMph: low[0].speed, gear: 'low', rpm: 2960 },
      'A&AEE Table VI sea-level level-speed fit, estimated Merlin 70 shaft power and Rotol efficiency'),
    climbPowerRatings: { combat: curve({ low: cLow, high: cHigh }), normal: normalClimb },
    climbGearChangesFt: { combat: shiftFt },
    climbCoolingAreaM2: .09,
  };
  const spec = { ...base.specification.aircraft.spitfire_lfix_bs543,
    sources: ['hf', 'merlin70', 'spit-notes'], referenceWeightLb: 7470,
    baseRating: 'combat', normal, combat,
    continuous: { ...phase('Continuous +7 psi / 2650 rpm', 2650, 21.6959, 'normal', null),
      powerFactor: (21.6959 / 26.6959) ** .75 * 2650 / 2850 },
    climbIAS: [[0, 180], [40000, 180]],
    loadQualification: 'BS.551 7,470 lb trial takeoff with an assumed full 85 Imperial gal. Fuel presets vary that reference loading.',
    speedQualification: 'Pilot notes Normal climb IAS schedule. Report checks use Table III climb TAS and Table VI level TAS.',
    ratingEvidence: 'Merlin 70 power uses published rating anchors, a sea-level estimate, and flight boost lapse. The Rotol efficiency and open-radiator drag area are estimates.',
    stallQualification: 'Provisional full-span BS.543 lift assumption at BS.551 loading. A&AEE matched wing and CG; BS.551 has no corrected stall run.',
  };
  return { model, spec, level: [...low.map(row => ({ ...row, gear: 'low' })), ...high.map(row => ({ ...row, gear: 'high' }))], climbs,
    service: { group: 'mid', years: [1943, 1945], theatres: ['Western Europe'], displayName: ac.name, country: 'uk', source: sources.hf.url } };
}

function g2Profile(base, catalog) {
  const donor = base.models.bf109f4.ac;
  const level = finnish(catalog, 'speed-power-table'), climbs = finnish(catalog, 'climb-speed-map');
  const ratings = db605(catalog);
  const [combatSea, combatPeak] = ratings.filter(row => row.rating === 'climb-combat');
  const [normalSea, normalPeak] = ratings.filter(row => row.rating === 'maximum-continuous');
  const rated = (lo, hi, metres) => lo.power_ps + (hi.power_ps - lo.power_ps) * Math.min(1, metres / hi.altitude_m);
  const combatCurve = rows => curve({ hydraulic: [node(0, combatSea.power_ps * PS_TO_HP), ...rows.map(row => {
    const metres = row.corrected_altitude_m, map = row.actual_map_ata ?? row.map_ata;
    return node(metres / FT, rated(combatSea, combatPeak, metres) * PS_TO_HP * Math.min(1, map / 1.3) ** .88, map);
  })] });
  const normalCurve = rows => curve({ hydraulic: [node(0, normalSea.power_ps * PS_TO_HP), ...rows.map(row => {
    const metres = row.corrected_altitude_m, map = row.actual_map_ata ?? row.map_ata;
    return node(metres / FT, rated(normalSea, normalPeak, metres) * PS_TO_HP * Math.min(1, map / 1.15) ** .88, Math.min(1.15, map));
  })] });
  const normal = phase('Continuous 1.15 ata / 2300 rpm', 2300, 1.15, 'normal', null);
  const combat = phase('Climb/combat 1.30 ata / 2600 rpm', 2600, 1.3, 'combat', 1800);
  const fuel = 400 / GALLON_L, weightLb = 3050 * LB_PER_KG;
  const ac = aircraft(G2, 'Bf 109 G-2', 'DB 605 A', 'Luftwaffe', { wingAreaM2: 16.05, spanM: 9.92 },
    prop(donor, 3 / FT, 1.685, 3, '3 m VDM, family installation; MT-215 blade drawing open'), weightLb, donor.clMaxAssumed,
    { normal: normalCurve(level), combat: combatCurve(level) }, 'combat');
  const model = { ac, options: {}, timedClimbEnergy: true, benchmarkPolar: gregPolar(ac, G2, 'hydraulic', level[0].actual_rpm, level[0].actual_rpm / combat.rpm), climbCoolingAreaM2: .12,
    climbPowerRatings: { combat: combatCurve(climbs), normal: normalCurve(climbs) } };
  const spec = {
    sources: ['g2', 'g2engine'], fuelCapacityUSGal: fuel, referenceFuelUSGal: fuel, referenceWeightLb: weightLb,
    armament: 'Fuselage guns, no optional wing gun pods', baseRating: 'combat', baseRpm: 2600, baseMap: 1.3,
    mapUnit: 'ata', pressureExponent: .88, normal, combat, continuous: normal,
    climbIAS: [[0, climbs[0].ias_kmh / KMH], ...climbs.map(row => [row.corrected_altitude_m / FT, row.ias_kmh / KMH])],
    loadQualification: '3,050 kg full-400-L departure is a reconstructed loading scenario. Finnish run masses remain open.',
    speedQualification: 'Finnish climb IAS schedule with IAS approximated as CAS for planning. Historical replay uses report TAS.',
    ratingEvidence: 'Shaft power estimates use DB 605 A rated points and Finnish boost lapse. The operational Combat rating uses 2,600 rpm. Trial checks use 2,540 rpm.',
    stallQualification: 'Provisional F-4 lift prior with G-2 geometry. Soviet WNr 14513 and captured G-2/Trop remain separate source checks with unresolved conditions.',
  };
  return { model, spec, level, climbs, scan: finnish(catalog, 'original-upper-climb'), transcribed: finnish(catalog, 'cina-climb'),
    service: { group: 'mid', years: [1942, 1944], theatres: ['Eastern Front', 'Finland', 'Mediterranean'], displayName: ac.name, country: 'germany', source: sources.g2.url } };
}

function p51dProfile(base, catalog) {
  const donor = base.models.p51b.ac;
  const normalRows = mustang(catalog, 'level-normal'), combatRows = mustang(catalog, 'level-wep');
  const militaryRows = mustang(catalog, 'level-mil');
  const military = phase('Military 61 inHg / 3000 rpm', 3000, 61, 'military', 900);
  const climbs = mustang(catalog, 'climb-wep');
  const toCurve = rows => {
    const low = rows.filter(r => r.blower === 'low').map(r => node(r.altitude_ft, r.bhp_from_chart, r.manifold_pressure_inhg));
    const high = rows.filter(r => r.blower === 'high').map(r => node(r.altitude_ft, r.bhp_from_chart, r.manifold_pressure_inhg));
    if (low.at(-1).altFt < high[0].altFt) {
      const shift = (low.at(-1).altFt + high[0].altFt) / 2;
      low.push({ ...low.at(-1), altFt: shift });
      high.unshift({ ...high[0], altFt: shift });
    }
    return curve({ low, high });
  };
  const stall = series(catalog, 'ww2_priority_aircraft_2026-11-13:p51d-an0160je1-stall-racks').filter(row => row.gear === 'up');
  const normal = phase('Normal 46 inHg / 2700 rpm', 2700, 46, 'normal', null);
  const combat = phase('WEP 67 inHg / 3000 rpm', 3000, 67, 'combat', 300);
  const wingAreaM2 = 235 * FT ** 2;
  const ac = aircraft(D, 'P-51D-15 Mustang', 'Packard V-1650-7', 'USAAF', { wingAreaM2, spanM: 37 * FT },
    prop(donor, 11 + 2 / 12, 44 / 21, 4, 'Hamilton Standard Hydromatic K6523A-24'), 9700,
    clFromEas(wingAreaM2, stall[1].gross_weight_lb, stall[1].speed_mph),
    { normal: toCurve(normalRows), combat: toCurve(combatRows), military: toCurve(militaryRows) }, 'combat');
  const model = { ac, options: {}, timedClimbEnergy: true, benchmarkPolar: gregPolar(ac, D, 'low', combat.rpm),
    climbPowerRatings: { combat: toCurve(climbs) }, climbGearChangesFt: { combat: 15500 } };
  const spec = {
    sources: ['p51d', 'p51dk', 'p51'], fuelCapacityUSGal: 269, referenceFuelUSGal: 209, referenceWeightLb: 9760,
    armament: 'Six .50 cal guns; trial wing racks fitted, no external load', baseRating: 'combat', baseRpm: 3000,
    baseMap: 67, mapUnit: 'inHg', pressureExponent: 1, normal, combat, military, continuous: normal,
    climbIAS: climbs.filter(row => row.altitude_ft <= 40000).map(row => [row.altitude_ft, row.instrument_corrected_ias_mph]),
    loadQualification: '44-15342 took off at 9,760 lb with 184 US gal wing and 25 US gal fuselage fuel. Presets use the 269-US-gal installation and retain trial racks.',
    speedQualification: 'Wright Field climb ASI is instrument-corrected. Using it as CAS in the planning schedule is an assumption.',
    ratingEvidence: 'Wright Field chart-assigned shaft power. Combat uses a separate climb curve. Normal climb uses the level-power schedule as a proxy. Timed Combat planning switches from WEP to Normal at the boost limit.',
    stallWeightRangeLb: [stall[0].gross_weight_lb, stall.at(-1).gross_weight_lb],
    stallQualification: 'Calculated stall assumes the 97 mph IAS handbook reference at 8,500 lb approximates EAS. Original 91/97/103 mph IAS retained and no calibrated stall is implied.',
  };
  return { model, spec, level: [...normalRows.map(row => ({ ...row, mode: 'normal' })), ...combatRows.map(row => ({ ...row, mode: 'combat' })),
    ...militaryRows.map(row => ({ ...row, mode: 'military' }))],
    climbs, stall, service: { group: 'late', years: [1944, 1945], theatres: ['Western Europe', 'Pacific'], displayName: ac.name, country: 'us', source: sources.p51d.url } };
}

function profiles(base, catalog) {
  return { [HF]: hfProfile(base, catalog), [G2]: g2Profile(base, catalog), [D]: p51dProfile(base, catalog) };
}

function addAircraftBatch(base, catalog) {
  const data = profiles(base, catalog);
  const models = { ...base.models };
  const aircraft = { ...base.specification.aircraft };
  const service = { ...base.service, aircraft: { ...base.service.aircraft } };
  const graphEvidence = { ...base.graphEvidence };
  for (const [id, { model, spec, service: context }] of Object.entries(data)) {
    models[id] = model;
    aircraft[id] = { ...spec, performanceIntake: true };
    service.aircraft[id] = context;
    graphEvidence[id] = { source: sources[spec.sources[0]], calculatedPower: 'source-bounded intake estimate' };
  }
  return { ...base, models, service, graphEvidence, specification: { ...base.specification, aircraft, sources: { ...base.specification.sources, ...sources } } };
}

function stallReferences(catalog) {
  const refs = new Map(catalog.sources.map(s => [s.id, s]));
  const row = (observation, speed, weightLb, role, qualification) => {
    const source = refs.get(observation.source_id);
    return { id: observation.id, aircraft: observation.aircraft, speed, weightLb, altFt: null, power: null,
      grade: 'primary', role, qualification, source: { title: source.report, url: source.primary_url || source.source } };
  };
  const observations = catalog.observations;
  const d = observations.filter(o => o.id.includes('p51d-an0160je1-stall-racks:') && o.values.gear === 'up');
  const g2 = observations.find(o => o.id === 'stall_global_2026-11-10:BF109-G2-trop-1');
  const soviet = observations.find(o => o.id.endsWith('g2-14513-minimum-controlled-speed:0001'));
  if (d.length !== 3 || !g2 || !soviet) throw Error('Missing aircraft intake stall sources');
  return {
    [HF]: [],
    [D]: d.map(o => row(o, { value: o.values.speed_mph, unit: 'mph', basis: 'IAS' }, o.values.gross_weight_lb,
      'D/K handbook reference', 'Gear and flaps up, no external load. Altitude and power are unstated.')),
    [G2]: [
      row(g2, { value: 112, unit: 'mph', basis: 'IAS' }, null,
        'Separate G-2/Trop report', 'Clean. Stall-run mass and power are unstated.'),
      row(soviet, { value: soviet.values.indicated_kmh, unit: 'km/h', basis: 'indicated' }, null,
        'Soviet minimum-control reference', 'WNr 14513 in glide with flaps up. Test takeoff mass 3,235 kg. The second speed column gives 186 km/h and its basis remains open.'),
    ],
  };
}

module.exports = { addAircraftBatch, profiles, stallReferences, sources, HF, G2, D, FT, KMH, FPM_PER_MPS };
