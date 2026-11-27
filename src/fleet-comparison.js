'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FleetComparison = factory();
})(globalThis, function () {
  // Selectors display whole feet; two source coordinates may differ by rounding.
  const sameHeight = (a, b) => Math.abs(a - b) <= 0.51;

  function clockAt(points, h) {
    const exact = points.find(p => sameHeight(p.height,h));
    if (exact) return {...exact, interpolated:false};
    if (points.length <= 2) return null;
    const i = points.findIndex(p => p.height > h);
    if (i <= 0) return null;
    const a=points[i-1], b=points[i], fraction=(h-a.height)/(b.height-a.height);
    const mix=(x,y) => Number.isFinite(x) && Number.isFinite(y) ? x+(y-x)*fraction : null;
    return {observed:mix(a.observed,b.observed),predicted:mix(a.predicted,b.predicted),
      bounds:a.bounds && b.bounds ? a.bounds.map((x,j)=>mix(x,b.bounds[j])) : null, interpolated:true};
  }

  function interval(trial, low, high) {
    if (!trial || high <= low) return null;
    const a=clockAt(trial.points,low), b=clockAt(trial.points,high);
    if (!a || !b) return null;
    const uninterrupted = trial.points.every(p => p.height<=low || p.height>=high || Number.isFinite(p.predicted));
    return {observed:b.observed-a.observed,
      predicted:uninterrupted && Number.isFinite(a.predicted) && Number.isFinite(b.predicted) ? b.predicted-a.predicted : null,
      bounds:a.bounds && b.bounds ? [b.bounds[0]-a.bounds[1],b.bounds[1]-a.bounds[0]] : null,
      interpolated:a.interpolated || b.interpolated};
  }

  function crossing(trace, speed) {
    // First crossing. Neither the origin nor the final attainable speed is guessed.
    for (let i=0;i<trace.length;i++) {
      const p=trace[i];
      if (p.value===speed) return p.seconds;
      const prev=trace[i-1];
      if (prev && prev.value < speed && p.value > speed)
        return prev.seconds+(p.seconds-prev.seconds)*(speed-prev.value)/(p.value-prev.value);
    }
    return null;
  }

  function speedInterval(trace, low, high) {
    const start=crossing(trace,low), finish=crossing(trace,high);
    return high>low && start!==null && finish!==null && finish>=start ? finish-start : null;
  }

  return {interval,speedInterval};
});
