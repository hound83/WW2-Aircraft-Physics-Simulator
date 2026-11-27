'use strict';
const fs = require('node:fs');
const {speedInterval} = require('../../src/fleet-comparison.js');

function chart() {
  const csv = fs.readFileSync(require.resolve('../../references/analysis/m3-figure8-readings.csv'),'utf8');
  const figurePoints = csv.trim().split(/\r?\n/).slice(1).map(line => {
    const [aircraft, time, speed, allowance, marker] = line.split(',');
    return {aircraft,seconds:Number(time),value:Number(speed),allowance:Number(allowance),marker};
  });
  const mustang = figurePoints.filter(p => p.aircraft.includes('45-11586'));
  const at60 = mustang.find(p => p.seconds === 60);
  const low = at60.value-at60.allowance, high = at60.value+at60.allowance;
  return {mustang,figurePoints,low,high};
}

function intervals(acceleration) {
  const {mustang}=chart();
  return [[160,200],[200,230]].map(([low,high])=>{
    const observed=speedInterval(mustang,low,high), predicted=speedInterval(acceleration.nominal.trace,low,high);
    return {low,high,observed,predicted,error:Number.isFinite(predicted)&&Number.isFinite(observed)?predicted-observed:null};
  });
}
module.exports={chart,intervals};
