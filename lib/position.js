module.exports = Position

var lat_to_m = 110992;
var lng_to_m = 88099;

function Position (opts) {
  if (!opts) opts = {}

  this.lat_to_m = opts.lat_to_m || lat_to_m
  this.lng_to_m = opts.lng_to_m || lng_to_m

  this.units = opts.units || "degrees"

  this.x = opts.x || 0
  this.y = opts.y || 0 
  this.z = opts.z || 0 
}

Position.prototype.scaleX = function (fromLow, fromHigh, toLow, toHigh) {
  this.x = this.scale( this.x, fromLow, fromHigh, toLow, toHigh ) 
  return this
}

Position.prototype.scaleY = function (fromLow, fromHigh, toLow, toHigh) {
  this.y = this.scale( this.y, fromLow, fromHigh, toLow, toHigh ) 
  return this
}

Position.prototype.scaleZ = function (fromLow, fromHigh, toLow, toHigh) {
  this.z = this.scale( this.z, fromLow, fromHigh, toLow, toHigh ) 
  return this
}

Position.prototype.scale = function (x, fromLow, fromHigh, toLow, toHigh) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}

Position.prototype.toMeters = function () {
  if (this.units == "meters") return this

  this.x = ~~(this.x * this.lat_to_m)
  this.z = ~~(this.z * this.lng_to_m)
  this.units = "meters"

  return this
}

Position.prototype.toDegrees = function () {
  if (this.units == "degrees") return this
  this.x = ~~(this.x / this.lat_to_m)
  this.z = ~~(this.z / this.lng_to_m)
  this.units = "degrees"

  return this
}

Position.prototype.toArray = function () {
  return [ this.x, this.y, this.z ]
}
