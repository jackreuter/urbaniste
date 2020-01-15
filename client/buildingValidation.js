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

const BuildingValidation = { 
  'validateBuildingSelection': validateBuildingSelection
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

function taxHouse(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeTriangle(coords)
}

function jail(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDouble(coords)
}

function quarry(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDouble(coords)
}

function depot(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShapeDouble(coords)
}

function trolley(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShape3Line(coords)
}

function wall(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShape3Line(coords)
}

function bridge(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShape3Line(coords)
}

function sewers(coords, move, board, startingPlayer) {
  return ShapeUtils.checkShape3Line(coords)
}

function docks(coords, move, board, startingPlayer) {return true}
function settlement(coords, move, board, startingPlayer) {return true}
function bazaar(coords, move, board, startingPlayer) {return true}
function bank(coords, move, board, startingPlayer) {return true}
function embassy(coords, move, board, startingPlayer) {return true}
function guardTower(coords, move, board, startingPlayer) {return true}
function customsOffice(coords, move, board, startingPlayer) {return true}
function casino(coords, move, board, startingPlayer) {return true}
function graveyard(coords, move, board, startingPlayer) {return true}
function workShop(coords, move, board, startingPlayer) {return true}
function mill(coords, move, board, startingPlayer) {return true}
function church(coords, move, board, startingPlayer) {return true}
function boulevard(coords, move, board, startingPlayer) {return true}
function aqueduct(coords, move, board, startingPlayer) {return true}
function shipyard(coords, move, board, startingPlayer) {return true}
function cityHall(coords, move, board, startingPlayer) {return true}
function tunnel(coords, move, board, startingPlayer) {return true}
function plaza(coords, move, board, startingPlayer) {return true}

var buildingData = {
  'Tax House': {'validation_function': taxHouse, 'length': 3},
  'Docks': {'validation_function': docks, 'length': 4},
  'Settlement': {'validation_function': settlement, 'length': 4},
  'Bazaar': {'validation_function': bazaar, 'length': 4},
  'Quarry': {'validation_function': quarry, 'length': 2},
  'Bank': {'validation_function': bank, 'length': 3},
  'Embassy': {'validation_function': embassy, 'length': 3},
  'Guard Tower': {'validation_function': guardTower, 'length': 1},
  'Customs Office': {'validation_function': customsOffice, 'length': 4},
  'Casino': {'validation_function': casino, 'length': 3},
  'Lighthouse': {'validation_function': lightHouse, 'length': 1},
  'Graveyard': {'validation_function': graveyard, 'length': 3},
  'Jail': {'validation_function': jail, 'length': 2},
  'Workshop': {'validation_function': workShop, 'length': 4},
  'Mill': {'validation_function': mill, 'length': 4},
  'Wall': {'validation_function': wall, 'length': 3},
  'Church': {'validation_function': church, 'length': 3},
  'Boulevard': {'validation_function': boulevard, 'length': 4},
  'Aqueduct': {'validation_function': aqueduct, 'length': 4},
  'Harbor': {'validation_function': harbor, 'length': 1},
  'Shipyard': {'validation_function': shipyard, 'length': 3},
  'Trolley': {'validation_function': trolley, 'length': 3},
  'City Hall': {'validation_function': cityHall, 'length': 3},
  'Bridge': {'validation_function': bridge, 'length': 3},
  'Tunnel': {'validation_function': tunnel, 'length': 1},
  'Sewers': {'validation_function': sewers, 'length': 3},
  'Depot': {'validation_function': depot, 'length': 2},
  'Plaza': {'validation_function': plaza, 'length': 4}
}
