'use strict';
// Pixel brackets describe chart reading, never total historical uncertainty.
function reading(axis,pixels){
 if(!axis||!Array.isArray(axis.ticks)||axis.ticks.length!==2||!Array.isArray(pixels)||pixels.length!==2||pixels[0]>pixels[1]||![...axis.ticks.flat(),...pixels,axis.pixelAllowance].every(Number.isFinite)||axis.pixelAllowance<0||!(axis.roundOut>0))throw Error('Invalid chart axis/bracket');
 const [[p0,v0],[p1,v1]]=axis.ticks;
 if(p0===p1||v0===v1)throw Error('Degenerate chart axis');
 const scale=(v1-v0)/(p1-p0),pad=axis.pixelAllowance;
 const values=[pixels[0]-pad,pixels[1]+pad].map(p=>v0+(p-p0)*scale);
 return [Math.floor(Math.min(...values)/axis.roundOut)*axis.roundOut,Math.ceil(Math.max(...values)/axis.roundOut)*axis.roundOut];
}
function pointAt(ledger,kind,altFt,rating){
 // No invented continuity across gear/rating transitions or absent masses.
 return ledger.readings.find(p=>p.kind===kind&&p.altFt===altFt&&(kind==='weight'||p.rating===rating))??null;
}
function weightForClimb(point){return point?.application==='matched-climb-weight'?point.bounds:null;}
module.exports={reading,pointAt,weightForClimb};
