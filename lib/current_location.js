module.exports = CurrentLocation

var bind = function (f, context) {
  return function () {
    return f.apply(context, arguments)
  }
}

function CurrentLocation (opts) {
  if (!opts) opts = {}

  // Geolocator 
  var geolocator = navigator.geolocation

  // Callbacks
  var onSuccess  = bind(this.onSuccess, this)
  var onError    = bind(this.onError, this)

  // User defined callbacks
  var func     = function () {}
  this.success = opts.success || func
  this.failure = opts.failure || func

  if (geolocator) {
    console.log("Retrieving current position...")
    geolocator.getCurrentPosition(onSuccess, onError);
  } else {
    throw("Browser does not support geolocation");
  }
}

CurrentLocation.prototype.onSuccess = function (position) {
  console.log("Position retrieved successfully.")
  this.latitude  = position.coords.latitude
  this.longitude = position.coords.longitude

  return this.success()  
} 

CurrentLocation.prototype.onError = function (error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.")
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.")
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.")
      break;
    case error.UNKOWN_ERROR:
      console.log("An unknown error occurred.")
      break;
  }
}
