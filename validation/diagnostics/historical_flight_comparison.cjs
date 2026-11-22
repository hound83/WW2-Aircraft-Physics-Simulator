'use strict';

const early = require('../../references/analysis/ww2_early_war_flight_tests_2026-11-14.json');
const extra = require('../../references/analysis/combined-flight-comparison-sources.json');
const finn = require('../../references/analysis/powered-turn-evidence-2026-11-13.json').finnish;
const g6 = require('./g6_archival_climb.cjs');
const { reconcile } = require('./early_war_series_crosswalk.cjs');

const ftPerM = 1 / 0.3048;
const kmhPerMph = 1.609344;
const round = (n, decimals = 1) => Number(n.toFixed(decimals));
const fixPack = 'ww2_g6trop_and_f_ix_2026-11-13:';
const ixPack = 'archival-2026-11-10:';
const idFor = (prefix, i) => prefix + ':' + String(i + 1).padStart(4, '0');

function earlyRows(id) {
  const s = early.series.find(s => s.id === id);
  return s.rows.map((r, i) => ({ id:idFor(id, i), ...Object.fromEntries(s.columns.map((k, j) => [k, r[j]])) }));
}

function catalogRows(catalog, id) {
  return catalog.observations.filter(r => r.id.startsWith(id + ':')).map(r => ({ ...r.values, id:r.id }));
}

// A returned bracket always belongs to one configuration. No extrapolation.
function readAt(rows, altitude, height, metric) {
  const ordered = rows.filter(r => Number.isFinite(r[metric])).sort((a,b) => a[height] - b[height]);
  const exact = ordered.find(r => Math.abs(r[height] - altitude) < 1e-6);
  if (exact) return { value:exact[metric], kind:'source', ids:[exact.id] };
  const i = ordered.findIndex(r => r[height] > altitude);
  if (i <= 0) return null;
  const [a,b] = ordered.slice(i - 1, i + 1);
  if (a.phase !== b.phase) return null;
  const fraction = (altitude - a[height]) / (b[height] - a[height]);
  return { value:round(a[metric] + fraction * (b[metric] - a[metric]), 3), kind:'interpolated', ids:[a.id,b.id] };
}

function earlyComparison() {
  const vaLevel = earlyRows('x4922-level');
  const vaClimb = earlyRows('x4922-climb').map(r => ({...r, phase:r.rpm}));
  const level = earlyRows('1304-cema-p4-level').map(r => {
    const altFt = r.altitude_m * ftPerM, va = readAt(vaLevel, altFt, 'altitude_ft', 'tas_mph');
    return { altM:r.altitude_m, altFt:round(altFt), radiator:r.radiator, pressureMm:r.manifold_pressure_mm,
      eKmh:r.speed_kmh, eMph:round(r.speed_kmh / kmhPerMph), eId:r.id, va,
      vaMinusEMph:va ? round(va.value - r.speed_kmh / kmhPerMph) : null };
  });
  const french = earlyRows('1304-cema-rae-climb');
  const origin = french[0];
  const vaStart = readAt(vaClimb, origin.altitude_ft, 'altitude_ft', 'elapsed_min');
  const climb = french.map(r => {
    const h = r.altitude_ft;
    const rate = readAt(vaClimb, h, 'altitude_ft', 'roc_ft_min');
    const time = readAt(vaClimb, h, 'altitude_ft', 'elapsed_min');
    const eInterval = r.french_elapsed_s - origin.french_elapsed_s;
    const vaInterval = time ? 60 * (time.value - vaStart.value) : null;
    return { altFt:h, eRateFpm:r.point_roc_fpm, eId:r.id, eSourceSeconds:r.french_elapsed_s,
      vaRateFpm:rate, vaElapsedMin:time, vaMinusERateFpm:rate ? round(rate.value - r.point_roc_fpm) : null,
      eIntervalSeconds:eInterval, vaIntervalSeconds:time ? round(vaInterval) : null,
      vaMinusEIntervalSeconds:time ? round(vaInterval - eInterval) : null };
  });
  return { level, climb, intervalDatumFt:origin.altitude_ft, vaStart,
    caution:'The French absolute clock origin is unspecified. Compare elapsed intervals from 3,280 ft. The French radiators progressively closed above 13,000 ft. Each row uses the recorded French point and the Va at the same height. CEMA quoted 2–3% speed uncertainty (about 15 km/h at peak). The two aircraft retain their own test weights and power schedules.' };
}

function laterComparison(catalog) {
  function gearRows(id, phase) { return catalogRows(catalog, ixPack + id).map(r => ({...r, phase})); }
  const fLevel = catalogRows(catalog, fixPack + 'bf274-level-clean');
  const levelGears = {
    f:[fLevel.filter(r => r.gear === 'low'), fLevel.filter(r => r.gear === 'high')],
    lf:[gearRows('S01','MS'), gearRows('S02','FS')], hf:[gearRows('S04','MS'), gearRows('S05','FS')],
  };
  function levelAt(id,h) {
    const withinGear = levelGears[id].map((rows,index) => {
      const reading = readAt(rows,h,'alt_ft',id === 'f' ? 'tas_mph' : 'speed');
      return reading && { ...reading, gear:index === 0 ? 'MS' : 'FS' };
    }).filter(Boolean);
    return withinGear.sort((a,b) => b.value - a.value)[0] ?? null;
  }
  const climbIx = (id, elapsedKey, shiftFt) => {
    const times = new Map(extra.spitfireElapsed[elapsedKey].rows);
    const points = catalogRows(catalog, ixPack + id).map(r => {
      if (!times.has(r.alt_ft)) throw Error('Missing elapsed companion for ' + r.id);
      return { ...r, seconds:60 * times.get(r.alt_ft), phase:r.alt_ft < shiftFt ? 'MS' : 'FS' };
    });
    return [{id:'A&AEE-'+elapsedKey+'-clock-origin',alt_ft:0,roc:null,seconds:0,phase:'MS'}, ...points];
  };
  const climbs = {
    f:catalogRows(catalog, fixPack + 'bf274-climb-combat').map(r => ({...r,roc:r.roc_fpm,seconds:60*r.elapsed_min,phase:r.gear})),
    lf:climbIx('S03','bs543',13000), hf:climbIx('S06','bs551',18600),
    g6:g6.observations().rows.map(r => ({id:'mtt-109-10-l-43-blatt7-'+r.altKm+'km',
      alt_ft:1000*r.altKm*ftPerM, roc:r.rateMps*60*ftPerM, seconds:r.elapsedMin === null ? null : 60*r.elapsedMin})),
  };
  const critical = catalogRows(catalog, fixPack+'g6-level-fth')[0];
  const anchor = catalogRows(catalog, fixPack+'g6-level-attachments').find(r => r.run === '3b');
  const g6Levels = [{id:anchor.id,h:0,tas:anchor.tas_kmh/kmhPerMph},
    {id:critical.id,h:critical.alt_m*ftPerM,tas:critical.tas_kmh/kmhPerMph}];
  const heights = [...new Set([0, ...Array.from({length:18}, (_, i) => (i + 1)*2000), critical.alt_m*ftPerM])].sort((a,b) => a-b);
  const rows = heights.map(h => {
    const german = g6Levels.find(r => Math.abs(r.h-h)<1e-6);
    const level = {g6:german ? {value:round(german.tas,3),kind:'source',ids:[german.id]} : null};
    for (const id of ['f','lf','hf']) level[id] = levelAt(id,h);
    const rate = {}, seconds = {};
    for (const [id, rows] of Object.entries(climbs)) {
      rate[id] = readAt(rows,h,'alt_ft','roc');
      seconds[id] = readAt(rows,h,'alt_ft','seconds');
    }
    const deltas = {};
    for (const [metric, values] of Object.entries({tasMph:level,rateFpm:rate,seconds})) {
      deltas[metric] = {};
      for (const id of ['f','lf','hf']) deltas[metric][id+'MinusG6'] =
        values[id] && values.g6 ? round(values[id].value - values.g6.value) : null;
      deltas[metric].hfMinusLf = values.hf && values.lf ? round(values.hf.value-values.lf.value) : null;
    }
    return { altFt:round(h,2), level, rate, seconds, deltas };
  });
  const reversals = [];
  let previous;
  for (const row of rows.filter(r => r.level.hf?.kind === 'source' && r.level.lf?.kind === 'source')) {
    if (row.deltas.tasMph.hfMinusLf === 0) continue;
    if (previous && Math.sign(row.deltas.tasMph.hfMinusLf) !== Math.sign(previous.deltas.tasMph.hfMinusLf))
      reversals.push([previous.altFt, row.altFt]);
    previous = row;
  }
  return { rows, measuredLevelReversalBandsFt:reversals,
    caution:'Speeds use the higher supported gear-specific value at each height. Interpolate within a gear only. G-6 level speeds are native anchors, with no interpolation across the 6,420 m gap. Rate and elapsed sources are the aircraft-specific full-rating test climbs. G-6 values at English heights interpolate the printed curves. Missing entries retain their original domain or condition.' };
}

function dynamicComparison(acceleration) {
  const maxSegments = finn.relatedAcceleration.rows.filter(r => r.rating === 'Maximum');
  const turns = finn.relatedTurns.map(r => {
    let span = 0, seconds = 0;
    for (const s of maxSegments) {
      const share = Math.max(0, Math.min(r.startKmh,s.toKmh) - Math.max(r.endKmh,s.fromKmh));
      span += share;
      seconds += s.seconds * share / (s.toKmh-s.fromKmh);
    }
    return { headingDeg:r.headingChangeDeg, turnSeconds:r.elapsedSeconds, startKmh:r.startKmh, exitKmh:r.endKmh,
      speedLostKmh:r.startKmh-r.endKmh, measuredRecoverySeconds:null,
      separateStraightSegmentEstimateSeconds:span === r.startKmh-r.endKmh ? round(seconds) : null };
  });
  const row = extra.restored.rows.find(r => r[1] === '45-11586');
  const simulated = acceleration.nominal.trace.find(r => r.seconds === 60).value;
  return { mt215:turns, accelerationSegments:maxSegments,
    reconstruction:'Overlapping speed span divided by total span times segment duration, summed over the two distinct level acceleration intervals. Assumes uniform acceleration inside each interval and compatible power, altitude and loading. It is not a recorded post-turn time or an independent validation.',
    restoredMustang:{ observed60sKias:[row[3],row[4]], modeled60sProxyKias:round(simulated,2),
      residualKias:[round(simulated-row[4]),round(simulated-row[3])],
      recordedFigureLabelMaxKias:255, secondaryTargetKias:acceleration.observation.endpoints.endKnots,
      secondaryElapsedSeconds:acceleration.observation.endpoints.elapsedSeconds,
      modeledSecondsToSecondaryTarget:round(acceleration.nominal.seconds,2),
      residualSeconds:round(acceleration.nominal.residualSeconds,2) },
    restoredTrials:extra.restored.rows.map(([aircraft,serial,takeoffLb,kLow,kHigh,tLow,tHigh,turn180Seconds,cleanStallKt,decelerating3gStallKt]) =>
      ({aircraft,serial,takeoffLb,fig8KiasAt60s:[kLow,kHigh],fig8SecondsToMax:[tLow,tHigh],
        turn180Seconds,turnExitKt:null,measuredRecoverySeconds:null,cleanStallKt,decelerating3gStallKt})),
    restoredFigure:extra.restored.printedFig8,restoredTables:extra.restored.paper,p47Glide:extra.p47Glide,
    recordedComplete180AndRecoveryTrials:0, testFamilies:['Bf 109','Mustang','Thunderbolt','Corsair','Hellcat'] };
}

function build(catalog, fleet, intake, acceleration) {
  const airplanes = ['spitfire_fix_bf274','spitfire_lfix_bs543','spitfire_hfix_bs551',g6.id];
  const comparison = {};
  for (const a of fleet.aircraft.filter(a => airplanes.includes(a.id))) {
    comparison[a.id] = {};
    for (const metric of ['level','climb','elapsed']) comparison[a.id][metric] =
      a.evidence[metric].filter(group => group.count).map(group => ({source:group.source,qualifier:group.qualifier,
        grade:group.grade,unit:group.unit,count:group.count,bias:group.bias,mape:group.mape,
        rows:group.checks.filter(row => Number.isFinite(row.error)).map(({id,altFt,fromFt,toFt,mode,gear,observed,predicted,error}) =>
          ({id,altFt,fromFt,toFt,mode,gear,observed,predicted,error}))}));
  }
  return {schema:'ww2-historical-flight-comparison/v1',simulator:fleet.version,inputs:fleet.inputPack,
    sourceFiles:['references/analysis/ww2_early_war_flight_tests_2026-11-14.json','references/analysis/combined-flight-comparison-sources.json','references/analysis/g6-16476-climb-charts.json'],
    early:earlyComparison(),later:laterComparison(catalog),g6:g6.observations(),modelMinusSource:comparison,
    hfTransfer:extra.hfTransfer, researchConditions:{
      e3:'French campaign, 5,600 lb in the RAE climb reproduction. CEMA level calibration is approximate. No operating profile.',
      va:'A&AEE X.4922, 6,450 lb, de Havilland, nominal +9 psi. 3,000 rpm level, climb mostly 2,850 rpm. No operating profile.',
      g6:'One Messerschmitt climb campaign on WNr 16476. Fit uses sea-level run 3b. No independently repeated matched climb.',
      f:'BF.274, clean 7,480 lb, Merlin 61. Level and full-rating climb from the same A&AEE report. Normal climb remains separately identified in modelMinusSource.',
      lf:'BS.543 Merlin 66. Level 7,110 lb corrected, climb 7,485 lb. Level points were used in fitting. Reserved climb points belong to the same campaign.',
      hf:'BS.551 Merlin 70. Level 7,090 lb corrected, climb 7,470 lb. Sea-level speed was fitted. EN.524 is a separate specimen comparison, with a related speed schedule and calibration.' },
    hfLfModelComparison:intake.crossover, dynamic:dynamicComparison(acceleration),
    earlySeries:reconcile(catalog),fleetCoverage:fleet.coverage };
}


function comparisonCsv(report) {
  const csv = [['group','altitude_ft','altitude_m','metric','unit','condition','E3_1304','Va_X4922',
    'G6_16476','F_IX_BF274','LF_IX_BS543','HF_IX_BS551','Va_minus_E','F_minus_G6','LF_minus_G6','HF_minus_G6','HF_minus_LF','interpolated_aircraft']];
  const earlyRow = (ft,m,metric,unit,condition,e,va,delta,method) =>
    csv.push(['early',ft,m,metric,unit,condition,e,Number.isFinite(va) ? round(va) : null,'','','','',delta,'','','','',method === 'interpolated' ? 'Va' : '']);
  for (const r of report.early.level)
    earlyRow(r.altFt,r.altM,'level','mph TAS','E radiator '+r.radiator+' '+r.pressureMm+' mm',r.eMph,r.va?.value,r.vaMinusEMph,r.va?.kind);
  for (const r of report.early.climb) {
    earlyRow(r.altFt,round(r.altFt*0.3048),'climb rate','ft/min','as tested',r.eRateFpm,r.vaRateFpm?.value,r.vaMinusERateFpm,r.vaRateFpm?.kind);
    earlyRow(r.altFt,round(r.altFt*0.3048),'elapsed from 3280 ft','s','as tested',r.eIntervalSeconds,r.vaIntervalSeconds,
      r.vaMinusEIntervalSeconds,r.vaElapsedMin ? 'interpolated' : null);
  }
  for (const r of report.later.rows) {
    for (const [key,label,unit,deltaKey] of [['level','level','mph TAS','tasMph'],['rate','climb rate','ft/min','rateFpm'],['seconds','time from chart start','s','seconds']]) {
      const vals = r[key], dif = r.deltas[deltaKey];
      const interpolated = Object.entries(vals).filter(([,v]) => v?.kind === 'interpolated').map(([id]) => id).join(' ');
      csv.push(['later',r.altFt,round(r.altFt*0.3048),label,unit,key === 'level' ? 'fastest bracketed gear' : 'as tested','','',
        ...['g6','f','lf','hf'].map(id => vals[id] ? round(vals[id].value) : null),
        '',dif.fMinusG6,dif.lfMinusG6,dif.hfMinusG6,dif.hfMinusLf,interpolated]);
    }
  }
  return csv.map(row => row.map(v => v ?? '').join(',')).join('\n') + '\n';
}

module.exports = { build, comparisonCsv, earlyComparison, laterComparison, dynamicComparison };
