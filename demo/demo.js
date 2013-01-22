var createEngine    = require("voxel-engine");
var OSM             = require("../lib/open_street_maps.js");
var CurrentLocation = require("../lib/current_location.js");
var CartoDB         = require("../lib/cartodb.js");

var chunkSize = 32
var chunkDistance = 2

var bind = function (f, context) {
  return function () {
    return f.apply(context, arguments)
  }
}

// Retrieve current location
var position = new CurrentLocation({
  success: init,
  error: onGetLocationError
});

// Handle errors from location retrieval
function onGetLocationError () {
  console.log("damn");
}

// Retrieve nodes from CartoDB
function init () {
  var sql = new CartoDB();
  sql.nearby( position.latitude, position.longitude, 10000, handleCartoDBResponse )
};

// Handle errors from CartoDB
function handleCartoDBResponse( error, response, body ) {
  if (error) throw(error);
  create(body.rows);
}

// Create world from nodes
function create ( nodes ) {
  var osm = new OSM({
    startingLat: position.latitude,
    startingLng: position.longitude,
    nearbyNodes: nodes
  });

  var game = window.game = createEngine({
    texturePath: "../textures/",
    chunkSize: osm.chunkSize,
    chunkDistance: osm.chunkDistance,
    generate: bind(osm.generate, osm),
    startingPoint: osm.startingPoint
  })

  game.appendTo("#container")

  game.on("tick", function () {
    game.controls.gravityEnabled = false;
  });

  var container = document.querySelector('#container');
  container.addEventListener('click', function() {
    game.requestPointerLock(container)
  });
}
