var createEngine  = require("voxel-engine");
var request       = require("browser-request");
var createTerrain = require("../index.js");

var LAT2M    = 110992;
var LNG2M    = 88099;
var ENDPOINT = "http://ryanc.cartodb.com/api/v2/sql?q="
var nodes    = new Int8Array(128*128);

function init () {
  var geolocator = navigator.geolocation;

  if (geolocator) {
    return geolocator.getCurrentPosition(getLocationSuccess, getLocationFailure);
  } else {
    console.log("Browser does not support geolocation.");
  }
};

function getLocationSuccess (position) {
  var latitude  = position.coords.latitude;
  var longitude = position.coords.longitude;
  var startNode = ll2m(latitude, longitude);
  var query     = "SELECT X(the_geom), Y(the_geom) FROM map_point "+
    "WHERE ST_Distance(the_geom, "+
    "ST_GeomFromText('POINT("+longitude+" "+latitude+")'"+
    ", 4326)) < 10000"

  request({ url: ENDPOINT + query, json: true }, function (error, response, body) {
    if (error) throw error;
    nodesFromRows(body.rows);
   });

  var game = window.game = createEngine({
    generateVoxelChunk: createTerrain({
      nodes: nodes
    }),
    startingPosition: [ startNode.x, startNode.y, startNode.z ]
  });

  game.appendTo("#container")
}

function getLocationFailure (error) {
  if (error.code == 1) {
    console.log("Error: Access is denied");
  } else if (error.code == 2) {
    console.log("Error: Position is unavailable");
  }
}

// Utility Functions

function nodesFromRows (rows) {
  for (var i = 0; i < rows.length; i++) {
    var row   = rows[i];

    var x     = row.x;
    var y     = row.y;
    var z     = row.z;

    var index = x + y * 128 + z * 128 * 128;

    nodes[index] = y;
  }

  window.nodes = nodes;
}

function ll2m (lat, lng) {
  var x = ~~(LAT2M * lat) / 100000;
  var z = ~~(LNG2M * lng) / 100000;
  var y = 0;

  console.log(x,y,z);

  return { x: x, y: y, z: z};
}

init();
