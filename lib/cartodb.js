var request = window.request =  require("browser-request");

module.exports = CartoDB

function CartoDB (opts) {
  if (!opts) opts = {}

  this.username = opts.username || "ryanc"
  this.url      = "http://" + this.username + ".cartodb.com"
  this.path     = "/api/v2/sql?q="
  this.endpoint = this.url + this.path
}

CartoDB.prototype.execute = function ( query, callback ) {
  var options = {
    url:  this.endpoint + query,
    json: true,
    async: false
  }

  return request(options, callback)
}
