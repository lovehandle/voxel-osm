var createEngine = require("voxel-engine");
var LL2M         = require("./ll2m.js")

var bind = function (f, context) {
  return function () {
    return f.apply(context, arguments)
  }
}

module.exports = OSM

function OSM (opts) {
  if (!opts) opts = {}

  this.ll2m = new LL2M();

  // Game options
  this.chunkSize = opts.chunkSize || 32 
  this.chunkDistance = opts.chunkDistance || 2
  this.width = opts.width || this.chunkSize * 2 * this.chunkDistance

  // Starting Position
  this.startingX        = this.scale(this.ll2m.convertLat(opts.startingLat), this.ll2m.lat_low, this.ll2m.lat_high, 0, this.width);
  this.startingZ        = this.scale(this.ll2m.convertLng(opts.startingLng), this.ll2m.lng_low, this.ll2m.lng_high, 0, this.width);
  this.startingPosition = [ this.startingX, 0, this.startingZ ]

  // Nodes
  this.nodes  = opts.nodes  || []
  this.points = new Int8Array(this.width * this.width)

  
  for (var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];

    var x = this.scale(this.ll2m.convertLat(node.y), this.ll2m.lat_low, this.ll2m.lat_high, 0, this.width);
    var y = 0;
    var z = this.scale(this.ll2m.convertLng(node.x), this.ll2m.lng_low, this.ll2m.lng_high, 0, this.width);

    var index = this.generateIndex( x, y, z )

    console.log(x,y,z,index)

    this.points[index] = 1;
  }
}

OSM.prototype.create = function () {
  var game = createEngine({
    texturePath: "../textures/",
    generate: bind(this.generate, this),
    startingPosition: this.startingPosition
  });

  game.appendTo("#container");

  var container = document.querySelector('#container')
  container.addEventListener('click', function() {
    game.requestPointerLock(container)
  })
}

OSM.prototype.generate = function ( x, y, z ) {
  x = this.scale(this.ll2m.convertLat(x), this.ll2m.lat_low, this.ll2m.lat_high, 0, this.width)
  y = 0;
  z = this.scale(this.ll2m.convertLng(z), this.ll2m.lng_low, this.ll2m.lng_high, 0, this.width);

  var index = this.generateIndex( x, y, z )
  var point = this.points[index]

  if (point) {
    return 1
  } else {
    return 0
  }
}

OSM.prototype.generateIndex = function ( x, y, z ) {
  return x + y * this.width * z * this.width * this.width
}

OSM.prototype.scale = function ( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow
}
