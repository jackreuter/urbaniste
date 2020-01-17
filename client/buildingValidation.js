/* Building validation functions */
import ShapeUtils from './util.js'

// check that given coordinate selection is valid for building placement
function validateBuilding(buildingName, coords, move, board, startingPlayer) {
  if (coords.length != buildingData[buildingName]['length']) {
    return false
  } else {
    return buildingData[buildingName]['validation_function'](coords, move, board, startingPlayer)
  }
}

// recursively checks if any possible valid building could exist using given tiles
function validateBuildingSelection(buildingName, coords, move, board, startingPlayer) {
  if (coords.length > buildingData[buildingName]['length']) {
    return false
  } else if (validateBuilding(buildingName, coords, move, board, startingPlayer)) {
    return true
  } else {
    for (var row = 0; row < board.length; row++) {
      for (var col = 0; col < board[row].length; col++) {
        var newTileNeighborsSelection = false
        for (var i = 0; i < coords.length; i++) {
          if (row == coords[i].row && col == coords[i].col) {
            newTileNeighborsSelection = false
            break
          }
          if (ShapeUtils.adjacent(coords[i], {'row': row, 'col': col})) {
            newTileNeighborsSelection = true
          }
        }
        if (newTileNeighborsSelection) {
          var newCoords = clone(coords)
          newCoords.push({'row': row, 'col': col})
          var newCoordsValid = false
          var newCoordsValid = validateBuildingSelection(buildingName, newCoords, move, board, startingPlayer)
          if (newCoordsValid) {
            return true
          }
        }
      }
    }
    return false
  }
}

function canPayForBuilding(building_name, my_resources, shop) {
  for (var i=0; i<shop.length; i++) {
    if (shop[i].name == building_name) {
      if (canPayCost(shop[i], my_resources)) {
        my_resources.bm -= shop[i].bm
        my_resources.l -= shop[i].l
        my_resources.c -= shop[i].c
        return my_resources
      } else {
        return null
      }
    }
  }
  return null
}

function canPayCost(cost, my_resources) {
  return my_resources.bm >= cost.bm && my_resources.l >= cost.l && my_resources.c >= cost.c
}

const BuildingValidation = { 
  'validateBuildingSelection': validateBuildingSelection,
  'canPayForBuilding': canPayForBuilding
}

export default BuildingValidation 

// deep copy needed for recursive function
// taken from https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
}

//infrastructure
function boulevard(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeCane(coords)
}
function tunnel(coords, move, board, startingPlayer) {
  if (coords.length != 1) {
    return false
  } else {
    return true
  }
}
function prison(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDouble(coords)
}
function tramway(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShape3Line(coords)
}
function plaza(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDiamond(coords)
}

//aquatic
function harbor(coords, move, board, startingPlayer) {
  var row = coords[0]['row']
  var col = coords[0]['col']
  var tileAdjacency = ShapeUtils.tileAdjacencyCheck(row, col, move, board, startingPlayer)
  if (tileAdjacency.adjacentToFriendly && board[row][col].type === 'w') {
    return true
  } else {
    return false
  }
}
function bridge(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShape3Line(coords)
}
function canal(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeCane(coords)
}
function lock(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDiamond(coords)
}
function ferry(coords, move, board, startingPlayer) {
  var row = coords[0]['row']
  var col = coords[0]['col']
  var tileAdjacency = ShapeUtils.tileAdjacencyCheck(row, col, move, board, startingPlayer)
  if (
    (ShapeUtils.friendly(row, col, board, startingPlayer) || (move['marker_placement']['row'] == row && move['marker_placement']['col'] == col))
    && tileAdjacency.adjacentToWater
  ) {
    return true
  } else {
    return false
  }
}
function lightHouse(coords, move, board, startingPlayer) {
  var row = coords[0]['row']
  var col = coords[0]['col']
  var tileAdjacency = ShapeUtils.tileAdjacencyCheck(row, col, move, board, startingPlayer)
  if (
    (ShapeUtils.friendly(row, col, board, startingPlayer) || (move['marker_placement']['row'] == row && move['marker_placement']['col'] == col))
    && tileAdjacency.adjacentToWater
  ) {
    return true
  } else {
    return false
  }
}

//cultural
function docks(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeCane(coords)
}
function embassy(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeV(coords)
}
function cathedral(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeV(coords)
}
function cityHall(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeTriangle(coords)
}
function marina(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeU(coords)
}

//commercial
function tenement(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDiamond(coords)
}
function bazaar(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeCane(coords)
}
function refinery(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDouble(coords)
}
function casino(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeTriangle(coords)
}
function watchTower(coords, move, board, startingPlayer) {
  if (coords.length != 1) {
    return false
  } else {
    return true
  }
}

//civic
function taxHouse(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeTriangle(coords)
}
function cemetary(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeV(coords)
}
function shipyard(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeTriangle(coords)
}
function sewers(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShape3Line(coords)
}
function monument(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDouble(coords)
}

var buildingData = {
  //infrastructure
  'Boulevard': {'validation_function': boulevard, 'length': 4},
  'Tunnel': {'validation_function': tunnel, 'length': 1},
  'Prison': {'validation_function': prison, 'length': 2},
  'Tramway': {'validation_function': tramway, 'length': 3},
  'Plaza': {'validation_function': plaza, 'length': 4},

  //aquatic
  'Bridge': {'validation_function': bridge, 'length': 3},
  'Harbor': {'validation_function': harbor, 'length': 1},
  'Canal': {'validation_function': canal, 'length': 4},
  'Lock': {'validation_function': lock, 'length': 4},
  'Ferry': {'validation_function': ferry, 'length': 1},
  'Lighthouse': {'validation_function': lightHouse, 'length': 1},

  //cultural
  'Docks': {'validation_function': docks, 'length': 4},
  'Embassy': {'validation_function': embassy, 'length': 3},
  'Cathedral': {'validation_function': cathedral, 'length': 3},
  'City Hall': {'validation_function': cityHall, 'length': 3},
  'Marina': {'validation_function': marina, 'length': 4},

  //commericial
  'Tenement': {'validation_function': tenement, 'length': 4},
  'Bazaar': {'validation_function': bazaar, 'length': 4},
  'Refinery': {'validation_function': refinery, 'length': 2},
  'Casino': {'validation_function': casino, 'length': 3},
  'Watchtower': {'validation_function': watchTower, 'length': 1},

  //civic
  'Tax House': {'validation_function': taxHouse, 'length': 3},
  'Cemetary': {'validation_function': cemetary, 'length': 3},
  'Shipyard': {'validation_function': shipyard, 'length': 3},
  'Sewers': {'validation_function': sewers, 'length': 3},
  'Monument': {'validation_function': monument, 'length': 2}
}
