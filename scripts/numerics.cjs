'use strict';
function collect(directory){
 const path=require('node:path'),get=n=>require(path.join(directory,n));
 return {
  crossAircraft:get('cross_aircraft_diagnostic_v15.cjs').run(),
  spitfire:get('spitfire_audit_v20.cjs').run(),
  greg:get('greg_reconciliation_v11.cjs').run(),
  p47Controlled:get('p47_control_v12.cjs').run(),
  ramPredictive:get('ram_predictive_audit_v21.cjs').run(),
  p47cOCR:get('p47c_source_audit_v25.cjs').results
 };
}
module.exports={collect};
