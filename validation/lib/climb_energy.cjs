'use strict';
// Conditional energy accounting. This does not identify an engine, propeller,
// cooling or exhaust correction and never fits the shared physical solver.
const HP=745.6998716,LBF=4.4482216153,FPM=196.8503937,MPH=.44704;
function budget(x){
 for(const k of ['weightLb','shaftHp','eta','qPa','wingAreaM2','tasMph'])if(!Number.isFinite(x[k])||x[k]<=0)throw Error('Positive finite '+k+' required');
 if(x.eta>1||!Number.isFinite(x.requiredHp)||x.requiredHp<0||!Number.isFinite(x.observedClimbFpm))throw Error('Invalid power/efficiency/rate inputs');
 const hpPerFpm=x.weightLb*LBF/(HP*FPM),availableUsefulHp=x.eta*x.shaftHp,observedExcessHp=x.observedClimbFpm*hpPerFpm;
 const requiredUsefulHp=x.requiredHp+observedExcessHp,gapUsefulHp=requiredUsefulHp-availableUsefulHp;
 return {...x,hpPerFpm,availableUsefulHp,modelExcessHp:availableUsefulHp-x.requiredHp,modelClimbFpm:(availableUsefulHp-x.requiredHp)/hpPerFpm,observedExcessHp,requiredUsefulHp,gapUsefulHp,
  extraShaftHpAtFixedEta:gapUsefulHp/x.eta,etaIfPropOnly:requiredUsefulHp/x.shaftHp,propOnlyWithinEnergyConservation:requiredUsefulHp>=0&&requiredUsefulHp<=x.shaftHp,
  equivalentNetDragDeltaHp:-gapUsefulHp,equivalentNetCd0Delta:-gapUsefulHp*HP/(x.qPa*x.wingAreaM2*x.tasMph*MPH),
  additionalPositiveDragCanCloseGap:gapUsefulHp<=0,
  interpretation:'Conditional inverse budget at supplied TAS, weight, shaft proxy and frozen polar. Equivalent net drag delta is not measured cooling drag. Efficiency requirement is not an installed-propeller measurement.'};
}
function withExtraDragHp(b,extraDragHp){
 if(!Number.isFinite(extraDragHp)||extraDragHp<0)throw Error('Nonnegative added drag power required');
 return (b.availableUsefulHp-b.requiredHp-extraDragHp)/b.hpPerFpm;
}
module.exports={budget,withExtraDragHp};
