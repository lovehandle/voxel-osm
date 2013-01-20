var OSM             = require("../lib/open_street_maps.js");
var CurrentLocation = require("../lib/current_location.js");
var CartoDB         = require("../lib/cartodb.js");

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
  var osm    = new OSM({
    startingLat: position.latitude,
    startingLng: position.longitude,
    nearbyNodes: nodes
  });

  window.osm = osm
}
