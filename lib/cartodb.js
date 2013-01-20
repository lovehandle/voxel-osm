var request = window.request =  require("browser-request");

module.exports = CartoDB

function CartoDB (opts) {
  if (!opts) opts = {}

  this.username = opts.username || "ryanc"
  this.url      = "http://" + this.username + ".cartodb.com"
  this.path     = "/api/v2/sql?q="
  this.endpoint = this.url + this.path
}

CartoDB.prototype.nearby = function (latitude, longitude, distance, callback) {
  var point  = "POINT("+ longitude + " " + latitude + ")"
  var select = "SELECT X(the_geom) AS latitude, Y(the_geom) as longitude";
  var from   = "FROM map_point";
  var where  = "WHERE ST_Distance(the_geom, ST_GeomFromText('" + point + "', 4326)) < " + distance;
  var query  = [ select, from, where ].join(" ");

  this.execute(query, callback)
}

CartoDB.prototype.execute = function ( query, callback ) {
  var options = {
    url:  this.endpoint + query,
    json: true,
    async: false
  }

  return request(options, callback)
}
