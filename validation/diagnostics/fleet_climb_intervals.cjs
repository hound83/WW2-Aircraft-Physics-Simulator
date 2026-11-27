'use strict';

// Clocks from different flights, ratings or start heights cannot be subtracted.
function clockSeries(aircraft) {
  const series = [];
  for (const plane of aircraft) {
    for (const group of plane.evidence.elapsed) {
      const byCondition = new Map();
      for (const row of group.checks) {
        if (!Number.isFinite(row.error)) continue;
        const { fromFt, toFt, observed, predicted } = row;
        if (!(Number.isFinite(fromFt) && Number.isFinite(toFt) && toFt > fromFt)) {
          throw Error('Missing clock boundaries for ' + plane.id + ', ' + group.qualifier);
        }
        const source = row.source || group.source;
        const key = JSON.stringify([fromFt, row.mode, row.weightLb, source]);
        if (!byCondition.has(key)) {
          const entry = { aircraftId: plane.id, aircraft: plane.name, trial: group.qualifier,
            mode: row.mode ?? null, weightLb: row.weightLb ?? null, source, grade: group.grade,
            conditions: group.reference, points: [{ height: fromFt, observed: 0, predicted: 0, readUncertaintySeconds:0 }] };
          byCondition.set(key, entry);
          series.push(entry);
        }
        byCondition.get(key).points.push({ height: toFt, observed, predicted, readUncertaintySeconds:row.readUncertaintySeconds });
      }
    }
  }
  for (const record of series) {
    record.points.sort((a, b) => a.height - b.height);
    for (let i = 1; i < record.points.length; i++) {
      if (record.points[i].height === record.points[i-1].height) {
        throw Error('Duplicate clock height within ' + record.aircraft + ', ' + record.trial);
      }
    }
  }
  return series;
}

const round = seconds => Number(seconds.toFixed(3));

function clockAt(points, h, permitInterpolation) {
  // Published rows can round an altitude converted from metres to one decimal foot.
  const recorded = points.find(p => Math.abs(p.height - h) <= 0.051);
  if (recorded) return recorded;
  if (!permitInterpolation || points.length < 3) return null;
  const i = points.findIndex(p => p.height > h);
  if (i <= 0) return null;
  const a = points[i-1], b = points[i], fraction = (h-a.height)/(b.height-a.height);
  return { height: h, interpolated: true, observed: a.observed + fraction*(b.observed-a.observed),
    predicted: a.predicted + fraction*(b.predicted-a.predicted) };
}

function interval(a, b) {
  const observed = b.observed - a.observed, predicted = b.predicted - a.predicted;
  return { fromFt: a.height, toFt: b.height, observed: round(observed), predicted: round(predicted),
    error: round(predicted - observed),
    readAllowanceSeconds: Number.isFinite(a.readUncertaintySeconds)&&Number.isFinite(b.readUncertaintySeconds)?a.readUncertaintySeconds+b.readUncertaintySeconds:null,
    interpolated: Boolean(a.interpolated || b.interpolated) };
}

function compare(series, left, right, low, high, permitInterpolation = false) {
  function sample(index) {
    const points = series[index].points;
    const a = clockAt(points, low, permitInterpolation), b = clockAt(points, high, permitInterpolation);
    return a && b ? interval(a, b) : null;
  }
  const a = sample(left), b = sample(right);
  if (!a || !b) return null;
  // Positive gap means the left aircraft completed the interval faster.
  const observedGap = round(b.observed-a.observed), modeledGap = round(b.predicted-a.predicted);
  return { left, right, fromFt: low, toFt: high, a, b, observedGap, modeledGap,
    gapError: round(modeledGap-observedGap), reversed: observedGap*modeledGap < 0 };
}

function build(aircraft) {
  const series = clockSeries(aircraft);
  const pairs = [];
  for (const [left, a] of series.entries()) {
    for (let right = left+1; right < series.length; right++) {
      const b = series[right];
      if (a.aircraftId === b.aircraftId) continue;
      const common = a.points.filter(p => clockAt(b.points, p.height, false));
      for (let i = 1; i < common.length; i++) {
        pairs.push(compare(series, left, right, common[i-1].height, common[i].height));
      }
    }
  }
  pairs.sort((a,b) => Math.abs(b.gapError)-Math.abs(a.gapError));
  function focus(leftId, rightId, low, high, interpolate) {
    const left = series.findIndex(row => row.aircraftId === leftId);
    const right = series.findIndex(row => row.aircraftId === rightId);
    return left < 0 || right < 0 ? null : compare(series, left, right, low, high, interpolate);
  }
  return {
    series: series.map(({points,...metadata}) => ({...metadata,
      bands: points.slice(1).map((end,i) => interval(points[i],end))})),
    pairs,
    focus: [focus('spitfire_va_x4922','bf109e3_1304',3280,19750,true),
      focus('bf109g2_db605a','bf109g6trop_16476',5000/0.3048,8000/0.3048,false)].filter(Boolean)
  };
}

function asCsv(series) {
  const columns = ['aircraft_id','aircraft','trial','mode','weight_lb','from_ft','to_ft','observed_s','model_s','model_minus_observed_s','chart_read_allowance_s','grade','source','conditions'];
  const quote = value=>'"'+String(value??'').replaceAll('"','""')+'"';
  const lines = [columns.join(',')];
  for (const group of series) {
    for (const b of group.bands) {
      lines.push([group.aircraftId,group.aircraft,group.trial,group.mode,group.weightLb===null?'':round(group.weightLb),
        round(b.fromFt),round(b.toFt),b.observed,b.predicted,b.error,b.readAllowanceSeconds,group.grade,group.source,group.conditions].map(quote).join(','));
    }
  }
  return lines.join('\n')+'\n';
}

if (require.main===module) {
  const fs=require('node:fs');
  const report=JSON.parse(fs.readFileSync(process.argv[2]??'dist/fleet-validation.json','utf8'));
  process.stdout.write(asCsv(report.climbIntervals.series));
}

module.exports = { build, asCsv };
