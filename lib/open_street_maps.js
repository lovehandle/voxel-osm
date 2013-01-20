var Position = require("./position.js")

var chunkSize = 32
var chunkDistance = 2
var startingPoint = [ 0, 0, 0 ]

module.exports = OSM

function OSM (opts) {
  if (!opts) opts = {}

  var origin = new Position({
    x: opts.startingLat,
    y: 0,
    z: opts.startingLng
  })

  origin = origin.scaleX(-180, 180, 0, 360)
  origin = origin.scaleZ(-180, 180, 0, 360)
  origin = origin.toMeters()

  var nodes = opts.nearbyNodes || []

  this.startingPoint = origin.toArray()

  this.chunkSize     = opts.chunkSize || chunkSize
  this.chunkDistance = opts.chunkDistance || chunkDistance
  this.width         = 2 * this.chunkSize * this.chunkDistance

  this.vFromLow      = -this.width / 2
  this.vFromHigh     = this.width / 2

  this.points = new Int8Array(this.width * this.width)

  for (var i=0; i < nodes.length; i++) {
    var node     = nodes[i]
    var position = new Position({
      x: node.latitude,
      y: 0,
      z: node.longitude
    })

    position = position.scaleX(-180, 180, 0, 360)
    position = position.scaleZ(-180, 180, 0, 360)
    position = position.toMeters()

    var index = this.generateIndex( position.x, position.y, position.z )

    this.points[index] = 1
  }
}

OSM.prototype.generate = function ( x, y, z ) {
  var position = new Position({
    x: x,
    y: y,
    z: z
  })
  
  position = position.scaleX(this.vFromLow, this.vFromHigh, 0, this.width)
  position = position.scaleZ(this.vFromLow, this.vFromHigh, 0, this.width)

  var index = this.generateIndex(position.x, position.y, position.z)
  var point = this.points[index]

  if (point) {
    return 1
  } else {
    return 0
  }
}

OSM.prototype.generateIndex = function ( x, y, z ) {
  return x + y * this.width + z * this.width * this.width
}
