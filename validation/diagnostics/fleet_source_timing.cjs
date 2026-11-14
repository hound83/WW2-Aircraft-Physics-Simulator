'use strict';

const M = require('../../src/physics.js');
const B = require('../../src/operating-benchmark.js');
const T = require('../../src/turn-lift.js');
const L = require('../../references/p51-turn-lift-tn1044.json');
const shared = require('./shared_flight_climb.cjs');
const supplemental = require('../../references/analysis/fleet-timing-supplement-v1.json');

const FT = .3048;
const MPH_PER_KMH = 1 / 1.609344;
const LB_PER_KG = 1 / .45359237;
const settings = mode => ({ mode, fuelFraction:.5 });

function getSeries(catalog, prefix) {
  const observations = catalog.observations.filter(row => row.id.startsWith(prefix + ':'));
  if (!observations.length) throw Error('Missing fleet validation series ' + prefix);
  return observations;
}

function derivedClimbSchedule(data, id, mode, weightLb, altitudes, bestRate = false) {
  const spec = data.specification.aircraft[id];
  return altitudes.map(altFt => {
    const tas = bestRate ? B.bestClimb(M,T,L,data.models[id],spec,settings(mode),altFt,weightLb).tasMph :
      spec.climbTAS ? B.interpolate(spec.climbTAS,altFt,1) : M.tasFrom(B.interpolate(spec.climbIAS,altFt,1),'CAS',altFt);
    if (!(tas > 0)) throw Error('Missing replay speed at ' + altFt + ' ft for ' + id);
    return [altFt,tas];
  });
}

function timedGroups(data, catalog, intake) {
  const byId = new Map(catalog.sources.map(source => [source.id,source]));
  const url = record => byId.get(record.source_id).primary_url;
  const result = shared.timedChecks(data).map(row => ({
    aircraft:row.id, key:row.id + '-source-timing', source:row.source, qualifier:row.evidence,
    reference:row.qualification, grade:row.evidence==='same-report elapsed check'?'report-conditioned':'conditional',
    row:{ ...row, observed:row.observedSeconds, predicted:row.afterSeconds },
  }));
  function replay(id, key, mode, weightLb, schedule, intervals, source, qualifier, reference, grade) {
    for (const { fromFt, toFt, observed, ...original } of intervals) {
      const integration = shared.sourceTiming(data,id,mode,weightLb,schedule,fromFt,toFt,100,true);
      result.push({ aircraft:id,key,source,qualifier,reference,grade,
        row:{ ...original,...integration,mode,weightLb,observed,predicted:integration.afterSeconds } });
    }
  }

  const hf = supplemental.hfSpitfire;
  const [startFt, startMin] = hf.rows[0];
  const hfRecorded = getSeries(catalog,'archival-2026-11-10:S06');
  replay('spitfire_hfix_bs551','hf-bs551-combat','combat',7470,
    hfRecorded.map(r => [r.values.alt_ft,r.values.tas_mph]),
    hf.rows.slice(1).map(([toFt,t]) => ({ fromFt:startFt,toFt,observed:60*(t-startMin),timeFromStartMin:t })),
    hf.source,'A&AEE Table III elapsed replay',hf.conditions+' Report boost schedule with estimated installed BHP.', 'report-conditioned');

  const d = getSeries(catalog,'ww2_priority_aircraft_2026-11-13:p51d-4415342-climb-wep');
  replay('p51d15_4415342','p51d-4415342-wep','combat',9760,
    d.filter(r => r.values.altitude_ft<=40000).map(r => [r.values.altitude_ft,
      M.tasFrom(r.values.instrument_corrected_ias_mph,'CAS',r.values.altitude_ft)]),
    d.filter(r => [10000,20000,30000].includes(r.values.altitude_ft)).map(r => ({
      fromFt:0,toFt:r.values.altitude_ft,observed:r.values.elapsed_min*60,observationId:r.id })),
    url(d[0]),'Wright Field elapsed replay with IAS-as-CAS',
    'WEP rack-on, 9,760 lb takeoff held fixed. Uses chart BHP, instrument-corrected IAS as CAS and the test WEP schedule.', 'conditional');

  const bf = getSeries(catalog,'ww2_thirteen_fighter_source_recovery_2026-11-11:g2-mt215-original-upper-climb');
  const speedChart = getSeries(catalog,'ww2_thirteen_fighter_source_recovery_2026-11-11:g2-mt215-climb-speed-map');
  const first = bf[0].values;
  replay('bf109g2_db605a','mt215-upper-climb','combat',3050*LB_PER_KG,
    speedChart.map(r => [r.values.corrected_altitude_m/FT,r.values.tas_kmh*MPH_PER_KMH]),
    bf.slice(1).map(r => ({
      fromFt:first.cina_altitude_m/FT,toFt:r.values.cina_altitude_m/FT,
      observed:60*(r.values.elapsed_min-first.elapsed_min),observationId:r.id,
    })),url(bf[0]),'Finnish scan elapsed replay',
    'Segments from the 5,000 m CINA time reading. Uses the corrected-altitude TAS table evaluated at CINA height, 3,050 kg nominal and 1.30 ata. The run mass and altitude alignment remain open.', 'conditional');

  const f4 = getSeries(catalog,'ww2_german_fighter_archive_2026-11-11:f4-original-1941-climb-time');
  const f4Target = f4.slice(1);
  const f4Start = f4[0].values;
  const f4Mass = f4Start.listed_flight_loading_kg*LB_PER_KG;
  const f4Id = 'bf109f4';
  replay(f4Id,'f4-mtt-1941','normal',f4Mass,derivedClimbSchedule(data,f4Id,'normal',f4Mass,
    f4.map(r => r.values.top_altitude_m/FT)),f4Target.map(r => ({
      fromFt:f4Start.top_altitude_m/FT,toFt:r.values.top_altitude_m/FT,
      observed:60*(r.values.elapsed_min-f4Start.elapsed_min),observationId:r.id,
    })),url(f4[0]),'Messerschmitt 1941 elapsed comparison',
    'Segments start at 1,000 m, 2,890 kg. The Normal 1.30 ata rating and handbook climb speed are modeled assumptions for the flown data sheet.', 'conditional');

  const fw = getSeries(catalog,'ww2_engine_ratings_and_propeller_2026-11-12:a4-handbook-climb-time');
  const fwId = 'fw190a4', fwMass = fw[0].values.reference_weight_kg*LB_PER_KG;
  const fwStart = fw[0].values;
  const upperFt=fw.at(-1).values.altitude_m/FT;
  const heights=[fwStart.altitude_m/FT,...Array.from({length:19},(_,i)=>8000+i*1000),upperFt];
  replay(fwId,'a4-handbook','normal',fwMass,derivedClimbSchedule(data,fwId,'normal',fwMass,heights,true),
    fw.slice(1).map(r => ({
      fromFt:fwStart.altitude_m/FT,toFt:r.values.altitude_m/FT,
      observed:60*(r.values.time_min-fwStart.time_min),observationId:r.id,
    })),url(fw[0]),'A-2 through A-4 handbook comparison',
    'Handbook family at 3,900 kg and climb power. Shares WNr 783 modeled best-climb TAS and equivalent cooling loss within its matching envelope.',
    'conditional');

  const corsair = supplemental.corsair, corsairMass = 12405;
  replay('f4u4','f4u4-vought-7289','normal',corsairMass,
    derivedClimbSchedule(data,'f4u4','normal',corsairMass,Array.from({length:21},(_,i)=>i*1000),true),
    corsair.rows.map(([toFt,t])=>({ fromFt:0,toFt,observed:60*t,timeFromSeaLevelMin:t })),
    corsair.source,'Vought specification comparison',
    corsair.conditions+' Climb TAS is modeled and takeoff mass is held fixed.', 'conditional');

  const fIx = intake.aircraft.find(row => row.id==='spitfire_fix_bf274');
  for (const mode of ['normal','combat']) {
    for (const row of fIx.elapsed.filter(row => row.mode===mode)) {
      result.push({
        aircraft:fIx.id,key:'bf274-' + mode,source:data.specification.sources.fix.url,
        qualifier:'A&AEE ' + (mode==='normal'?'Normal':'Combat') + ' elapsed replay',
        reference:'Uses measured climb TAS, estimated sea-level TAS, fixed takeoff mass and the report rating schedule.',
        grade:'report-conditioned',row:{ ...row, fromFt:0,toFt:row.altFt },
      });
    }
  }
  return result;
}

module.exports = { timedGroups };
