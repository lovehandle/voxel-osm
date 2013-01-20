var OSM             = require("../lib/osm.js");
var CurrentLocation = require("../lib/current_location.js");
var CartoDB         = require("../lib/cartodb.js");

var curLoc = new CurrentLocation({
  success: init,
  error:   error
});


function init () {
  var lat   = curLoc.latitude;
  var lng   = curLoc.longitude;

  var sql   = new CartoDB(); 
  var query = nearby(lat, lng); 

  sql.execute(query, function ( error, response, body ) {
    if (error) throw(error);

    var osm = new OSM({
      nodes:  body.rows,
      startingLat: lat,
      startingLng: lng
    });

    osm.create.apply(osm)
  });
};


function error () {
  throw("fuck");
}

function nearby (lat, lng) {
  return "SELECT X(the_geom), Y(the_geom) FROM map_point WHERE ST_Distance(the_geom, ST_GeomFromText('POINT("+ lng + " " + lat + ")', 4326)) < 10000";
}
