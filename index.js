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

var padding = {
  residential: 2,
  secondary: 6
}

var world = {}
window.world = world

module.exports = function(opts, setup) {

  var position = convert.degreesToPosition(origin.lat, origin.lng)
  position = [24171244, 0, 5073305]

  function connectNodes (nodeA, nodeB) {
    // Convert nodes from degrees to meters
    var posA = convert.degreesToPosition(nodeA[1], nodeA[0])
    var posB = convert.degreesToPosition(nodeB[1], nodeB[0])

    // Calculate intermediary nodes using y = mx + b
    var m = (posA[2] - posB[2]) / (posA[0] - posB[0])
    var b = (posA[2] - (posA[0] * m))

    // Set xmin and xmax
    var xmin, xmax
    (posA[0] < posB[0]) ? (xmin = posA[0], xmax = posB[0]) : (xmin = posB[0], xmax = posA[0])

    // Set index for each intermediary node
    for (var x = xmin; x <= xmax; x++) {
      var yPadding = 0
      var zPadding = 0 
      var z = Math.round(m*x+b)
      var y = 0

      if (properties.highway) {
        zPadding = padding[properties.highway]
      }

      if (properties.building) {
        yPadding = 5 
      }

      for (var zn = (z - zPadding); zn <= (z + zPadding); zn++) {
        for (var yn =  (y - yPadding); yn <= (y + yPadding); yn++){
          setIndex( [x, yn, zn] )
        }
      }
    }
  }

  function setIndex (position) {
    world[ position.join("|") ] = properties
  }

  function processNode (node) {
    setIndex( convert.degreesToPosition(node[1], node[0]) )
  }

  function processNodes (nodes) {
    if (!(nodes[0] < nodes[nodes.length])) nodes = nodes.reverse()
    for (var i = 0; i < nodes.length - 1; i++) {
      connectNodes(nodes[i], nodes[i+1])
    }
  }

  function processNodeSets (nodeSets) {
    for (var i = 0; i < nodeSets.length; i++) {
      processNodes( nodeSets[i] ) 
    }
  }

  for (var i = 0; i < geojson.features.length; i++) {
    var feature    = geojson.features[i]
    var properties = feature.properties
    var geometry   = feature.geometry

    switch (geometry.type) {
      case "Point" :
        processNode(geometry.coordinates)
        break
      case "LineString" :
        processNodes(geometry.coordinates)
        break
      case "Polygon" :
        processNodeSets(geometry.coordinates)
        break
    }
  }

  // Setup new game
  setup = setup || defaultSetup
  var defaults = {
    generate: function (x, y, z) {
      x = x + position[0], y = y + position[1], z = z + position[2]
      // Calculate index to look up metadata
      var index = [x,y,z].join("|")
          data  = world[index]
      // If data exists return data; else return grass
      if (data) {
        if (data.building == "yes") {
          return 3 
        } else {
          return 2 
        }
      } else {
        if (y != 0) return 0
        return 1
      } 

    },
    chunkSize: 10,
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
  $element.style["padding"] = "10px 5px";
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

function relativePosition (position) {
  var origin = game.startingPosition,
      x = Math.round(origin[0] + position[0]),
      y = Math.round(origin[1] + position[1]),
      z = Math.round(origin[2] + position[2])

  return [x,y,z]
}

function defaultSetup(game, avatar) {
  // highlight blocks when you look at them, hold <Ctrl> for block placement
  var blockPosPlace, blockPosErase
  var hl = game.highlighter = highlight(game, { color: 0xff0000 })
  hl.on('highlight', function (voxelPos) { 
    blockPosErase = voxelPos; 
    data = world[ relativePosition(voxelPos).join("|") ]
    if (data) displayMetaData(data.name)
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
