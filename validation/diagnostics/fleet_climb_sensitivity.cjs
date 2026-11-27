'use strict';
const early = require('./early_war_replay.cjs');
const {E3} = require('../../scripts/early-war-batch.cjs');
const {sourceTiming} = require('./shared_flight_climb.cjs');
const g6 = require('./g6_archival_climb.cjs');

const FT = 0.3048;
const round = seconds=>Number(seconds.toFixed(2));

// Independent arithmetic on the vertical-rate curve of the same climb sheet.
function secondsFromRates(points) {
  return round(points.slice(1).reduce((seconds,p,i)=>{
    const previous = points[i];
    return seconds+(p.metres-previous.metres)*0.5*(1/p.mps+1/previous.mps);
  },0));
}

function run(data,catalog) {
  const specification = data.specification, spec = specification.aircraft[E3];
  const e3 = [145,155,165].map(casMph=>{
    const trial = {...spec,climbIAS:spec.climbIAS.map(([altFt])=>[altFt,casMph])};
    const aircraft = {...specification.aircraft,[E3]:trial};
    const {elapsed} = early.run({...data,specification:{...specification,aircraft}},E3);
    const row = elapsed.find(r=>r.altFt===19750);
    return {casMph,fromFt:elapsed[0].altFt,toFt:row.altFt,observed:row.observed,seconds:row.predicted};
  });
  const pack = 'ww2_thirteen_fighter_source_recovery_2026-11-11:';
  const values = key=>catalog.observations.filter(r=>r.id.startsWith(pack+key+':')).map(r=>r.values);
  const speed = values('g2-mt215-climb-speed-map');
  const g2Rates = values('g2-mt215-original-upper-climb').map(r=>({metres:r.cina_altitude_m,mps:r.climb_rate_mps}));
  const g6Rates = g6.observations().rows.map(r=>({metres:r.altKm*1000,mps:r.rateMps}));
  const within = r=>r.metres>=5000 && r.metres<=8000;
  const g2Schedule = ['corrected_altitude_m','altimeter_m'].map(height=>{
    const schedule = speed.map(r=>[r[height]/FT,r.tas_kmh/1.609344]);
    const replay = sourceTiming(data,'bf109g2_db605a','combat',3050/0.45359237,schedule,5000/FT,8000/FT,100,true);
    return {heightColumn:height,seconds:replay.afterSeconds,status:replay.afterStatus};
  });
  return {e3,g2Schedule,fromM:5000,toM:8000,fromRateSeconds:{g2:secondsFromRates(g2Rates.filter(within)),
    g6:secondsFromRates(g6Rates.filter(within))}};
}

module.exports = {run};
