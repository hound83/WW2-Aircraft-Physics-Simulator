# Provisional stall bands attached to the chart

The chart now draws a light dotted vertical band when an aircraft object has a `provisionalStallBand` property.

## Shape expected
```js
aircraft.provisionalStallBand = {
  minEasMph: 89.4,
  maxEasMph: 97.4,
  limitation: 'reported CAS used as provisional EAS'
};
```

## How to supply it
Use the loader already on main:
```js
const { getProvisionalBand } = require('./provisional-stall-loader');
const band = getProvisionalBand('f4u4');
if (band) aircraft.provisionalStallBand = band;
```

The band is drawn as a light filled range plus dotted vertical lines. It does not replace or alter the solid 1 G stall line. No solver or baseline change.
