'use strict';
const M = require('../../src/physics.js');
const {aircraft} = require('../../aircraft/cases.json');
const source = require('../../references/research/ww2_twelve_fighter_gap_followup_2026-11-10.json');
function run() {
  const series = source.series.find(item => item.id === 'bf109f4-il2-reference-turn-times');
  const ac = aircraft.bf109f4;
  const rows = series.rows.map(([altM, weightKg, iasKmh, seconds, rating]) => {
    const altFt = altM / .3048;
    const weightLb = weightKg / .45359237;
    const at = offset => {
      const tas = M.tasFrom(iasKmh / 1.609344 + offset, 'CAS', altFt);
      const options = M.workingOptions(ac, {rating, weightLb});
      const r = M.evaluated(ac, altFt, tas, options);
      const speed = tas * .44704;
      const nAtTarget = Math.sqrt(1 + ((2 * Math.PI / seconds) * speed / 9.80665) ** 2);
      const required = M.dragBreakdown(ac, altFt, tas, weightLb, options.polar.cd0, options.polar.e, nAtTarget);
      return {assumedCasMinusIasMph: offset, seconds: 360 / r.limits.sustDegSec,
        nominalLimit: r.limits.nPower < r.limits.nInst ? 'power' : 'lift',
        targetNormalG: nAtTarget, targetRequiredCl: required.CL,
        conditionalEtaIfPowerOnly: required.requiredHp / r.power.shaftHp,
        modeledEta: r.prop.eta,
        conditionalAddedCd0IfDragOnly: (r.power.propulsiveHp - required.requiredHp) * 745.6998716 /
          (required.q * ac.wingAreaM2 * speed)};
    };
    return {altM, weightKg, iasKmh, seconds, rating, scenarios: [-5, 0, 5].map(at), historicalResidual: null};
  });
  return {source: series.source_id, rows,
    qualification: 'Official IL-2 software reference, not historical measured truth. CAS equals stated game IAS plus an assumed offset. Clean configuration and source standard mass are used. Inverse lift/eta/drag explanations are alternative conditional budgets, not identified corrections. No parameter fitted to IL-2.'};
}
module.exports = {run};
