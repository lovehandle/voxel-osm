var voxel = require("voxel")

module.exports = function generate(opts) {
  if (!opts) opts = {};

  var chunkDistance = opts.chunkDistance || 2;
  var chunkSize     = opts.chunkSize     || 32;
  var width         = opts.width         || chunkDistance * 2 * chunkSize;
  var nodes         = opts.nodes         || new Int8Array(width * width);

  return function (low, high) {
    var fromLow  = chunkSize * -chunkDistance;
    var fromHigh = chunkSize * chunkDistance;

    return voxel.generate(low, high, function (x, y, z, n) {
      x = scale(x, fromLow, fromHigh, 0, width);
      y = scale(y, fromLow, fromHigh, 0, width);
      z = scale(z, fromLow, fromHigh, 0, width);

      var index = generateIndex( x, y, z, width );

      if (nodes[index]) {
        return 2; // brick for all nodes
      } else {
        getMaterialIndex( x, y, z );
      }
    });
  }
}

function scale ( x, fromLow, fromHigh, toLow, toHigh ) {
  return ( x - fromLow ) * ( toHigh - toLow ) / ( fromHigh - fromLow ) + toLow;
}

function generateIndex ( x, y ,z, width) {
  return x + y * width + z * width * width;
}

function getMaterialIndex( x, y, z ) {
  if (y == 0) {
    return 1; // grass for all other points
  }
}
