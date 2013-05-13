var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var texturePath = require('painterly-textures')(__dirname)
var voxel = require('voxel')
var convert = require('./lib/voxel-degrees')
var extend = require('extend')
var geojson = require("./map")

window.geojson = geojson

// Code for America Offices
var origin = {
  lat: 37.775589,
  lng: -122.413912
}

origin = {
  lat: 37.7885423,
  lng: -122.3960285
}

var world = {}
window.world = world

module.exports = function(opts, setup) {

  var position = convert.degreesToPosition(origin.lat, origin.lng)
  position = [24171244, 0, 5073305]

  function connectNodes (nodeA, nodeB) {
    var posA = convert.degreesToPosition(nodeA[1], nodeA[0])
    var posB = convert.degreesToPosition(nodeB[1], nodeB[0])

    var m = (posA[2] - posB[2]) / (posA[0] - posB[0])
    var b = (posA[2] - (posA[0] * m))

    var xmin, xmax

    (posA[0] < posB[0]) ? (xmin = posA[0], xmax = posB[0]) : (xmin = posB[0], xmax = posA[0])

    for (var x = xmin; x <= xmax; x++) {
      world[ [x, 0, Math.round(m*x+b) ].join("|") ] = properties
    }
  }

  function processLineString (coordinates) {
    var func = function (i, j)  {
      var nodeA = coordinates[i],
          nodeB = coordinates[j]
      connectNodes(nodeA, nodeB)
    }

    if (coordinates[0] < coordinates[coordinates.length]) {
      for (var i = 0; i < coordinates.length; i++) { var j = i + 1; func(i,j) }
    } else {
      for (var i = coordinates.length - 1; i > 0; i--) { var j = i - 1; func(i,j) }
    }
  }

  var features = geojson.features
  for (var i = 0; i < features.length; i++) {
    var feature    = features[i]
    var properties = feature.properties
    var geometry   = feature.geometry

    if (geometry.type == "LineString" || geometry.type == "Polygon") {
      processLineString(geometry.coordinates) 
    }
  }

  // Setup new game
  setup = setup || defaultSetup
  var defaults = {
    generate: function (x, y, z) {
      x = x + position[0], y = y + position[1], z = z + position[2]
      // Don't worry about elevation for now.
      if (y != 0) return 0;
      // Calculate index to look up metadata
      var index = [x,y,z].join("|")
      // If data exists return data; else return grass
      if (window.world[index]) {
        return 2; 
      } else {
        return 1
      } 

    },
    chunkDistance: 2,
    materials: [
      ['grass', 'dirt', 'grass_dirt'],
      'obsidian',
      'brick',
      'grass',
      'plank'
    ],
    texturePath: texturePath,
    startingPosition: position,
    worldOrigin: position,
    controls: { discreteFire: true }
  }
  opts = extend({}, defaults, opts || {})

  // setup the game and add some trees
  var game = createGame(opts)
  var container = opts.container || document.body
  window.game = game // for debugging
  game.appendTo(container)
  if (game.notCapable()) return game
  
  var createPlayer = player(game)

  // create the player from a minecraft skin file and tell the
  // game to use it as the main player
  var avatar = createPlayer(opts.playerSkin || 'player.png')
  avatar.possess()
  avatar.yaw.position.set(2, 14, 4)

  setup(game, avatar)
  
  return game

}

function displayMetaData (data) {
  $element = document.querySelector("#metadata");
  $element.style["padding"] = "20px";
  $element.style["height"] = "auto";
  $element.style["opacity"] = 0.5;
  $element.innerHTML = "<h1>"+data+"</h1>";
}

function hideMetaData () {
  $element = document.querySelector("#metadata");
  $element.style["padding"] = 0;
  $element.style["height"] = 0;
  $element.style["opacity"] = 0;
}

function defaultSetup(game, avatar) {
  // highlight blocks when you look at them, hold <Ctrl> for block placement
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, { color: 0xff0000 })
  hl.on('highlight', function (voxelPos) { 
    blockPosErase = voxelPos; 

    var index = [game.startingPosition[0] + voxelPos[0], game.startingPosition[1] + voxelPos[1], game.startingPosition[2] + voxelPos[2]] .join("|")
    var data = world[index]

    if (data) {
      displayMetaData(data["name"])
    }
  });
  hl.on('remove', function (voxelPos) { 
    blockPosErase = null 
    hideMetaData()
  })
  hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
  hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

  // toggle between first and third person modes
  window.addEventListener('keydown', function (ev) {
    if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
  })

  // block interaction stuff, uses highlight data
  var currentMaterial = 1

  game.on('fire', function (target, state) {
    var position = blockPosPlace
    if (position) {
      game.createBlock(position, currentMaterial)
    }
    else {
      position = blockPosErase
      if (position) game.setBlock(position, 0)
    }
  })

}
