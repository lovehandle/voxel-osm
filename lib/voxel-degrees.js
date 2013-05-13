var voxel = require("voxel")

// Constants
var LAT_TO_M = 110992
var LNG_TO_M = 88099

// VoxelDegrees
var VoxelDegrees = {}

// Convert Degrees to X,Y,Z Coordinates
VoxelDegrees.degreesToPosition = function (lat, lng) {
  var x = Math.round(voxel.scale(lat, -180, 180, 0, 360) * LAT_TO_M),
      y = 0,
      z = Math.round(voxel.scale(lng, -180, 180, 0, 360) * LNG_TO_M)

  return [x,y,z]
}

module.exports = VoxelDegrees
