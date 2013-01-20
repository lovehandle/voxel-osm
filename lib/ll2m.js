module.exports = LL2M

function LL2M (opts) {
  if (!opts) opts = {};

  this.lat_2_m = opts.lat_2_m || 110992;
  this.lng_2_m = opts.lng_2_m || 88099;

  this.lat_low  = -180 * this.lat_2_m;
  this.lat_high = 180  * this.lat_2_m; 

  this.lng_low  = -180 * this.lng_2_m;
  this.lng_high = 180  * this.lng_2_m;
}

LL2M.prototype.convertLat = function ( lat ) {
  return Math.floor( +lat * this.lat_2_m );
}

LL2M.prototype.convertLng = function ( lng ) {
  return Math.floor( +lng * this.lng_2_m );
}
