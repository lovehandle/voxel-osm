module.exports = CurrentLocation

function CurrentLocation (opts) {
  if (!opts) opts = {}

  var func       = function () {};
  var geolocator = navigator.geolocation;

  this.success = opts.success || func
  this.failure = opts.failure || func

  var bind = function (f, context) {
    return function () {
      return f.apply(context, arguments);
    }
  } 

  if (geolocator) {
    geolocator.getCurrentPosition(bind(this.onSuccess, this), bind(this.onFailure, this));
  } else {
    throw("Browser does not support geolocation");
  }
}

CurrentLocation.prototype.onSuccess = function (position) {
  this.latitude  = position.coords.latitude;
  this.longitude = position.coords.longitude;

  this.success();
}

CurrentLocation.prototype.onFailure = function (error) {
  if (error.code == 1) {
    throw("Geolocation Error: Access is denied.");
  } else if (error.code == 2) {
    throw("Geolocation Error: Position is unavailable.");
  }

  this.failure();
}
