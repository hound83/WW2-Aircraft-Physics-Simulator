'use strict';

const gradeOrder = ['primary', 'secondary', 'calculated'];

// Absolute limits use the units shown here. Percentages apply to the magnitude
// of the case mean. The allowed spread is the full observed span.
const tolerances = {
  stall_speed: { unit: 'km/h CAS or EAS', accuracy: 2, spread: 3 },
  level_speed: { unit: 'km/h TAS', accuracy: 3, spread: 5 },
  climb_rate: { unit: '%', accuracy: 3, spread: 5 },
  elapsed_time: { unit: '%', accuracy: 3, spread: 5 },
  sustained_turn_rate: { unit: 'deg/s', accuracy: 0.3, spread: 0.5 },
  shaft_power: { unit: '%', accuracy: 2, spread: 3 },
  drag_or_lift_to_drag: { unit: '%', accuracy: 3, spread: 5 },
};

const epsilon = 1e-9;
const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const envelope = values => [Math.min(...values), Math.max(...values)];
const limit = (policy, field, value) => policy.unit === '%' ? Math.abs(value) * policy[field] / 100 : policy[field];

function casePolicy(metric, unit) {
  const policy = tolerances[metric];
  if (!policy || !unit) return null;
  if (policy.unit === '%' || metric === 'sustained_turn_rate' && policy.unit === unit) return policy;
  const speed = /^(km\/h|mph|kt) (CAS|EAS|TAS)$/.exec(unit);
  if (!speed || !(metric === 'level_speed' && speed[2] === 'TAS' ||
    metric === 'stall_speed' && ['CAS', 'EAS'].includes(speed[2]))) return null;
  const toKmh = { 'km/h': 1, mph: 1.609344, kt: 1.852 }[speed[1]];
  return { unit, accuracy: policy.accuracy / toKmh, spread: policy.spread / toKmh };
}

function withinSpread(policy, values) {
  const [low, high] = envelope(values);
  return policy && high - low <= limit(policy, 'spread', average(values)) + epsilon;
}

function resolveCase({ id, metric, unit, candidates }) {
  const policy = casePolicy(metric, unit);
  const byGrade = {};
  for (const grade of gradeOrder) {
    const eligible = candidates.filter(row =>
      row.case_id === id && row.grade === grade && row.use === 'eligible' && row.method !== 'mean');
    const rows = eligible.filter(row => row.method !== 'reported-summary');
    // Printed summaries remain available when the underlying individual
    // readings are unavailable. A printed mean is never another replicate.
    const usable = rows.length ? rows : eligible;
    if (!usable.length) continue;
    if (usable.some(row => !Number.isFinite(row.value) || !Array.isArray(row.observation_ids) ||
      (row.range !== null && !(row.range?.length === 2 && row.range.every(Number.isFinite) &&
        row.range[0] <= row.value && row.range[1] >= row.value)))) throw Error('Invalid candidate for ' + id);
    const distinct = [];
    for (const row of usable) {
      const duplicate = row.sample_id && distinct.find(other => other.sample_id === row.sample_id);
      if (!duplicate) distinct.push(row);
      else if (row.value !== duplicate.value) {
        byGrade[grade] = { status: 'conflict', reason: 'duplicate-reading-disagreement', candidate_ids: usable.map(row => row.id) };
        break;
      }
    }
    if (byGrade[grade]) continue;

    const values = distinct.map(row => row.value);
    const observed_span = envelope(values);
    const candidate_ids = distinct.map(row => row.id);
    if (distinct.length > 1 && (!distinct.every(row => row.sample_id && row.combine_group &&
        row.combine_group === distinct[0].combine_group) || !withinSpread(policy, values))) {
      byGrade[grade] = { status: 'conflict', reason: 'unmatched-or-excess-spread', observed_span, candidate_ids };
      continue;
    }

    const isMean = distinct.length > 1;
    const value = average(values);
    byGrade[grade] = {
      status: 'accepted', grade, method: isMean ? 'mean' : distinct[0].method, value,
      range: distinct.every(row => row.range !== null) ? envelope(distinct.flatMap(row => row.range)) : null,
      observed_span: isMean ? observed_span : null, candidate_ids,
      observation_ids: [...new Set(distinct.flatMap(row => row.observation_ids))],
      lineage: distinct.every(row => row.lineage?.length) ? [...new Set(distinct.flatMap(row => row.lineage))] : null,
      accuracy_reviewed: distinct.every(row => row.accuracy_reviewed === true),
    };
  }

  const best = gradeOrder.map(grade => byGrade[grade]).find(Boolean);
  if (best?.status !== 'accepted') {
    return { status: best?.status ?? 'missing', preferred: null, by_grade: byGrade, gold: false };
  }

  const qualified = gradeOrder.map(grade => byGrade[grade]);
  const gold = Boolean(policy && qualified.every(row => row?.status === 'accepted' && row.lineage && row.accuracy_reviewed &&
    row.range && Math.max(row.value - row.range[0], row.range[1] - row.value) <= limit(policy, 'accuracy', row.value) + epsilon) &&
    new Set(qualified.flatMap(row => row.lineage)).size === qualified.reduce((sum, row) => sum + row.lineage.length, 0) &&
    withinSpread(policy, qualified.map(row => row.value)));
  return { status: 'accepted', preferred: best, by_grade: byGrade, gold };
}

module.exports = { tolerances, resolveCase };
