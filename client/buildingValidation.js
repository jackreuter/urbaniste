/* Building validation functions */
import ShapeUtils from './util.js'
import ErrorHandler from './ErrorHandler.js'

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
  } else if (coords.length == buildingData[buildingName]['length']) {
    return validateBuilding(buildingName, coords, move, board, startingPlayer)
  } else {
    for (var row = 0; row < board.length; row++) {
      for (var col = 0; col < board[row].length; col++) {
        var newTileIsAdjacentToSelection = false
        var newTileIsRepeat = false
        for (var i = 0; i < coords.length && !newTileIsRepeat; i++) {
          if (row == coords[i].row && col == coords[i].col) {
            newTileIsAdjacentToSelection = false
            newTileIsRepeat = true
          } else if (ShapeUtils.adjacent(coords[i], {'row': row, 'col': col})) {
            newTileIsAdjacentToSelection = true
          }
        }
        // check if proposed tile is adjacent to selected tiles and can be built upon
        if (newTileIsAdjacentToSelection && board[row][col].building == undefined) {
          var newCoords = clone(coords)
          newCoords.push({'row': row, 'col': col})
          if (validateBuildingSelection(buildingName, newCoords, move, board, startingPlayer)) {
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
        return true
      }
    }
  }
  return false
}

function canPayCost(cost, my_resources) {
  return my_resources.bm >= cost.bm && my_resources.l >= cost.l && my_resources.c >= cost.c
}

const BuildingValidation = { 
  'validateBuildingSelection': validateBuildingSelection,
  'canPayForBuilding': canPayForBuilding,
  'canPayCost': canPayCost
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

//get counts of tile types built on
function builtOn(coords, move, board, startingPlayer) {
  var emptyCount = 0
  var friendlyCount = 0
  var enemyCount = 0
  var waterCount = 0
  var bmCount = 0
  var cCount = 0
  var lCount = 0
  for (var i = 0; i < coords.length; i++) {
    var tile = board[coords[i].row][coords[i].col]
    if (move['marker_placement']['row'] == coords[i].row && move['marker_placement']['col'] == coords[i].col) { friendlyCount++ } 
    if ((tile.marker === 'player_one' && startingPlayer) || tile.marker === 'player_two' && !startingPlayer) { friendlyCount++ } 
    if ((tile.marker === 'player_one' && !startingPlayer) || tile.marker === 'player_two' && startingPlayer) { enemyCount++ } 
    if (tile.marker === 'empty' && tile.type !== 'w' 
        && !(move['marker_placement']['row'] == coords[i].row && move['marker_placement']['col'] == coords[i].col)) { emptyCount++ }
    if (tile.type === 'w') { waterCount++ }
    if (tile.type === 'bm') { bmCount++ }
    if (tile.type === 'c') { cCount++ }
    if (tile.type === 'l') { lCount++ }
  }
  return {
    'empty': emptyCount,
    'friendly': friendlyCount,
    'enemy': enemyCount,
    'water': waterCount,
    'bm': bmCount,
    'c': cCount,
    'l': lCount
  }
}

//get counts of tile types built adjacent to
function builtAdjacentTo(coords, move, board, startingPlayer) {
  var emptyCount = 0
  var friendlyMarkerCount = 0
  var enemyMarkerCount = 0
  var waterCount = 0
  var bmCount = 0
  var cCount = 0
  var lCount = 0
  var enemyBuildings = []
  var friendlyBuildings = []

  for (var row = 0; row < board.length; row++) {
    for (var col = 0; col < board[row].length; col++) {
      var tile = board[row][col]
      var isAdjacent = false
      for (var i = 0; i < coords.length && !isAdjacent; i++) {
        if (ShapeUtils.adjacent({'row': row, 'col': col}, coords[i])) {
          isAdjacent = true
        }
      }
      if (isAdjacent) {
        if (tile.building == undefined) {
          if (move['marker_placement']['row'] == row && move['marker_placement']['col'] == col) { friendlyMarkerCount++ } 
          if ((tile.marker === 'player_one' && startingPlayer) || tile.marker === 'player_two' && !startingPlayer) { friendlyMarkerCount++ } 
          if ((tile.marker === 'player_one' && !startingPlayer) || tile.marker === 'player_two' && startingPlayer) { enemyMarkerCount++ } 
          if (tile.marker === 'empty' && tile.type !== 'w' 
              && !(move['marker_placement']['row'] == row && move['marker_placement']['col'] == col)) { emptyCount++ }
        } else {
          if ((tile.building.player == 'player_one' && startingPlayer) 
            || tile.building.player == 'player_two' && !startingPlayer) { friendlyBuildings.push(tile.building.name) }
          if ((tile.building.player == 'player_one' && !startingPlayer) 
            || tile.building.player == 'player_two' && startingPlayer) { enemyBuildings.push(tile.building.name) }
        }
        if (tile.type === 'w') { waterCount++ }
        if (tile.type === 'bm') { bmCount++ }
        if (tile.type === 'c') { cCount++ }
        if (tile.type === 'l') { lCount++ }
      }
    }
  }
  return {
    'empty': emptyCount,
    'friendlyMarker': friendlyMarkerCount,
    'friendlyBuildings': friendlyBuildings,
    'enemyMarker': enemyMarkerCount,
    'enemyBuildings': enemyBuildings,
    'water': waterCount,
    'bm': bmCount,
    'c': cCount,
    'l': lCount
  }
}

//infrastructure
function boulevard(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.empty == 2 && on.friendly == 2 && ShapeUtils.checkShapeCane(coords)
}
function tunnel(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  var adjacentTo = builtAdjacentTo(coords, move, board, startingPlayer)
  return on.friendly == 1 && adjacentTo.enemyBuildings.length >= 1 && coords.length == 1 // TODO built next to exactly one building
}
function prison(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 2 && ShapeUtils.checkShapeDouble(coords)
}
function tramway(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 3 && ShapeUtils.checkShape3Line(coords)
}
function plaza(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 4 && ShapeUtils.checkShapeDiamond(coords)
}

//aquatic
function harbor(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  var adjacentTo = builtAdjacentTo(coords, move, board, startingPlayer)
  return on.water == 1 && (adjacentTo.friendlyMarker >= 1 || adjacentTo.friendlyBuildings.length >= 1) && coords.length == 1
}
function bridge(coords, move, board, startingPlayer) {
  if (coords.length != 3) {
    return false
  } else {
    var middle
    var outer
    for (var i = 0; i < 3; i++) {
      if (ShapeUtils.adjacent(coords[i], coords[(i+1)%3]) && ShapeUtils.adjacent(coords[i], coords[(i+2)%3])) {
        middle = coords[i]
        outer = [coords[(i+1)%3], coords[(i+2)%3]]
      }
    }
    if (middle == undefined || outer == undefined) {
      return false
    } else {
      var middleOn = builtOn([middle], move, board, startingPlayer)
      var outerOn = builtOn(outer, move, board, startingPlayer)
      return middleOn.water == 1 && outerOn.friendly == 1 && outerOn.empty == 1 && ShapeUtils.checkShape3Line(coords)
    }
  }
}
function canal(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.water == 2 && on.friendly == 2 && ShapeUtils.checkShapeCane(coords)
}
function lock(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 4 && ShapeUtils.checkShapeDiamond(coords)
}
function ferry(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  var adjacentTo = builtAdjacentTo(coords, move, board, startingPlayer)
  return on.friendly == 2 && adjacentTo.water >= 1 && ShapeUtils.checkShapeDouble(coords)
}
function lightHouse(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  var adjacentTo = builtAdjacentTo(coords, move, board, startingPlayer)
  return on.friendly == 1 && adjacentTo.water >= 1 && coords.length == 1
}

//cultural
function docks(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 4 && ShapeUtils.checkShapeCane(coords)
}
function embassy(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 3 && ShapeUtils.checkShapeV(coords)
}
function cathedral(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  var adjacentTo = builtAdjacentTo(coords, move, board, startingPlayer)
  return on.friendly == 3 && adjacentTo.friendlyBuildings.length == 0 && ShapeUtils.checkShapeV(coords)
}
function cityHall(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 3 && on.bm == 1 && on.c == 1 && on.l == 1 && ShapeUtils.checkShapeTriangle(coords)
}
function marina(coords, move, board, startingPlayer) {
  var adjacents = ShapeUtils.getAdjacentCoordinates(coords[0].row, coords[0].col)
  var centerIsWater = false
  for (var i = 0; i < adjacents.length; i++) {
    var adjacentToAll = true
    for (var j = 0; j < coords.length; j++) {
      adjacentToAll = adjacentToAll && ShapeUtils.adjacent(adjacents[i], coords[j])
    }
    if (adjacentToAll && board[adjacents[i].row][adjacents[i].col].type === 'w') {
      centerIsWater = true
    }
  }
  var on = builtOn(coords, move, board, startingPlayer)
  var adjacentTo = builtAdjacentTo(coords, move, board, startingPlayer)
  return centerIsWater && on.friendly == 4 && !adjacentTo.friendlyBuildings.includes('Marina') && !adjacentTo.enemyBuildings.includes('Marina') && ShapeUtils.checkShapeU(coords)
}

//commercial
function tenement(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 4 && ShapeUtils.checkShapeDiamond(coords)
}
function bazaar(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 4 && ShapeUtils.checkShapeCane(coords)
}
function refinery(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 2 && ShapeUtils.checkShapeDouble(coords)
}
function casino(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 3 && ShapeUtils.checkShapeTriangle(coords)
}
function watchTower(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 1 && coords.length == 1
}

//civic
function taxHouse(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 1 && on.enemy == 2 && ShapeUtils.checkShapeTriangle(coords)
}
function cemetary(coords, move, board, startingPlayer) {
 if (coords.length != 3) {
    return false
  } else {
    var middle
    var outer
    for (var i = 0; i < 3; i++) {
      if (ShapeUtils.adjacent(coords[i], coords[(i+1)%3]) && ShapeUtils.adjacent(coords[i], coords[(i+2)%3])) {
        middle = coords[i]
        outer = [coords[(i+1)%3], coords[(i+2)%3]]
      }
    }
  }
  if (middle == undefined || outer == undefined) {
    return false
  } else {
    var middleOn = builtOn([middle], move, board, startingPlayer)
    var outerOn = builtOn(outer, move, board, startingPlayer)
    return middleOn.enemy == 1 && outerOn.friendly == 1 && outerOn.enemy == 1 && ShapeUtils.checkShapeV(coords)
  }
}
function shipyard(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 1 && on.enemy == 1 && on.water == 1 && ShapeUtils.checkShapeTriangle(coords)
}
function sewers(coords, move, board, startingPlayer) {
 if (coords.length != 3) {
    return false
  } else {
    var middle
    var outer
    for (var i = 0; i < 3; i++) {
      if (ShapeUtils.adjacent(coords[i], coords[(i+1)%3]) && ShapeUtils.adjacent(coords[i], coords[(i+2)%3])) {
        middle = coords[i]
        outer = [coords[(i+1)%3], coords[(i+2)%3]]
      }
    }
  }
  if (middle == undefined || outer == undefined) {
    return false
  } else {
    var middleOn = builtOn([middle], move, board, startingPlayer)
    var outerOn = builtOn(outer, move, board, startingPlayer)
    return middleOn.enemy == 1 && outerOn.friendly == 1 && outerOn.empty == 1 && ShapeUtils.checkShape3Line(coords)
  }
}
function monument(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 2 && ShapeUtils.checkShapeDouble(coords)
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
  'Ferry': {'validation_function': ferry, 'length': 2},
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
