/* Building validation functions */
import ShapeUtils from './util.js'
import ErrorHandler from './ErrorHandler.js'

// check that given coordinate selection is valid for building placement
function validateBuilding(buildingName, coords, move, board, startingPlayer, variableBuildingCost) {
  if (coords.length != buildingData[buildingName]['length']) {
    return false
  } else {
    return buildingData[buildingName]['validation_function'](coords, move, board, startingPlayer, variableBuildingCost)
  }
}

function validateVariableCost(building, variableBuildingCost, casinoSteal, myResources, enemyResources, buildings, shop, startingPlayer, board) {
  var buildingName = building['name']
  var totalBuildingVariableCost
  var buildingBMs
  var buildingCs
  var buildingLs 
  var deduction = 0

  for (var i=0; i<shop.length; i++) {
    if (shop[i].name == buildingName) {
      totalBuildingVariableCost = shop[i]['?']
      buildingBMs = shop[i]['bm']
      buildingCs = shop[i]['c']
      buildingLs = shop[i]['l'] 
    }
  }
  if (!totalBuildingVariableCost) {
    return true
  }
  
  if (buildingName == "Casino") {
    return casinoSteal.bm + casinoSteal.l + casinoSteal.c == 2
        &&  enemyResources.bm >= casinoSteal.bm
        &&  enemyResources.l >= casinoSteal.l
        &&  enemyResources.c >= casinoSteal.c
        &&  variableBuildingCost.bm + variableBuildingCost.l + variableBuildingCost.c == 4
        &&  myResources.bm >= variableBuildingCost.bm
        &&  myResources.l >= variableBuildingCost.l
        &&  myResources.c >= variableBuildingCost.c
  }
  if (buildingName == "Tenement") {
    for (var i=0; i<buildings.length; i++) {
      if ((buildings[i].name == 'Tenement') && ((buildings[i].player == 'player_one' && startingPlayer) || (buildings[i].player == 'player_two' && !startingPlayer))) {
        deduction += 1
      }
    }
  }
  if (buildingName == "Bazaar") {
    var numNextTo = ShapeUtils.numNextTo(buildings, board, buildings.length, building, startingPlayer)
    deduction += numNextTo.numAdjacentEnemyBuildings
    deduction += numNextTo.numAdjacentFriendlyBuildings
  }
  if (buildingName == "Refinery") {
    if (variableBuildingCost.bm != totalBuildingVariableCost && variableBuildingCost.l != totalBuildingVariableCost && variableBuildingCost.c != totalBuildingVariableCost) {
      return false
    }
  }
  
  return myResources.bm >= variableBuildingCost.bm + buildingBMs
      && myResources.l >= variableBuildingCost.l + buildingCs
      && myResources.c >= variableBuildingCost.c + buildingLs
      && variableBuildingCost.bm + variableBuildingCost.l + variableBuildingCost.c == (totalBuildingVariableCost - deduction)
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

function buildingAvailable(building_name, shop) {
  for (var i=0; i<shop.length; i++) {
    if (shop[i].name == building_name) {
      return shop[i].limit > 0
    }
  }
}

function canPayCost(cost, my_resources) {
  return my_resources.bm >= cost.bm && my_resources.l >= cost.l && my_resources.c >= cost.c
}

function canPayVariableCost(building, buildings, starting_player, my_resources) {
  var deductions = 0
  if (building.name == "Tenement") {
    for (var i=0; i<buildings.length; i++) {
      if ((buildings[i].name == 'Tenement') && ((buildings[i].player == 'player_one' && starting_player) || (buildings[i].player == 'player_two' && !starting_player))) {
        deductions += 1
      }
    }
  }
  if (building.name == "Refinery") {
    return (my_resources.bm >= 3 || my_resources.l >= 3 || my_resources.c >= 3)
  }
  return my_resources.bm + my_resources.l + my_resources.c >= (building['?'] + building['bm'] + building['l'] + building['c'] - deductions)
}

function isWatchtowerBlocked(row, col, buildings, startingPlayer) {
  var adjacent = ShapeUtils.getAdjacentCoordinates(row, col)
  for (var building=0; building<buildings.length; building++) {
    if (buildings[building].name == "Watchtower") {
      if ((startingPlayer && buildings[building]['player'] == 'player_two') || (!startingPlayer && buildings[building]['player'] == 'player_one')) {
        for (var index=0; index<adjacent.length; index++) {
          if ((buildings[building]['location_array'][0]['row'] == adjacent[index]['row']) && (buildings[building]['location_array'][0]['col'] == adjacent[index]['col'])) {
            return true
          }
        }
      }
    }
  }
  return false
}


const BuildingValidation = { 
  'validateBuilding': validateBuilding,
  'validateVariableCost': validateVariableCost,
  'validateBuildingSelection': validateBuildingSelection,
  'isWatchtowerBlocked': isWatchtowerBlocked,
  'canPayForBuilding': canPayForBuilding,
  'buildingAvailable': buildingAvailable,
  'canPayCost': canPayCost,
  'canPayVariableCost': canPayVariableCost,
  'validateFerryExtra': validateFerryExtra,
  'validatePrisonExtra': validatePrisonExtra,
  'validateTunnelExtra': validateTunnelExtra,
  'validateTramwayExtra': validateTramwayExtra,
  'validateMonumentExtra': validateMonumentExtra
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
  return on.friendly == 1 && adjacentTo.enemyBuildings.length >= 1 && coords.length == 1
}
function validateTunnelExtra(buildings, startingPlayer, coords, extraArray, board, move) {
  return extraArray
      && extraArray.length == 1
      && (extraArray[0]['row'] != coords[0]['row'] || extraArray[0]['col'] != coords[0]['col'])
      && (extraArray[0]['row'] != move['row'] || extraArray[0]['col'] != move['col'])
      && board[extraArray[0]['row']][extraArray[0]['col']].marker == 'empty'
      && board[extraArray[0]['row']][extraArray[0]['col']].type != 'w'
      && tunnelHelper(buildings, startingPlayer, coords, extraArray) 
}
function tunnelHelper(buildings, startingPlayer, coords, extraArray) {
  var adjacentEnemyBuildings = new Set()
  for (var i=0; i<buildings.length; i++) {
    for (var j=0; j<buildings[i]['location_array'].length; j++) {
      var adjacentToCoords = ShapeUtils.getAdjacentCoordinates(coords[0]['row'], coords[0]['col'])
      for (var a=0; a<adjacentToCoords.length; a++) {
        if (buildings[i]['location_array'][j]['row'] == adjacentToCoords[a]['row'] && buildings[i]['location_array'][j]['col'] == adjacentToCoords[a]['col']) {
          if ((buildings[i].player == 'player_two' && startingPlayer) || (buildings[i].player == 'player_one' && !startingPlayer)) {
            adjacentEnemyBuildings.add(i)
          }
        }
      }
    }
  }
  if (adjacentEnemyBuildings.size != 1) {
    return false
  }

  for (var i=0; i<buildings[Array.from(adjacentEnemyBuildings)[0]]['location_array'].length; i++) {
    var adjacentToExtra = ShapeUtils.getAdjacentCoordinates(extraArray[0]['row'], extraArray[0]['col'])
    for (var j=0; j<adjacentToExtra.length; j++) {      
      if (buildings[Array.from(adjacentEnemyBuildings)[0]]['location_array'][i]['row'] == adjacentToExtra[j]['row'] && buildings[Array.from(adjacentEnemyBuildings)[0]]['location_array'][i]['col'] == adjacentToExtra[j]['col']) {
        return true
      }
    }
  }
  return false
}
function prison(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 2 && ShapeUtils.checkShapeDouble(coords)
}
function validatePrisonExtra(buildings, startingPlayer, coords, extraArray, board, move) {
  return extraArray
      && extraArray.length == 1
      && board[extraArray[0]['row']][extraArray[0]['col']].type != 'w'
      && prisonHelper(buildings, startingPlayer, coords, extraArray, board, move) 
}
function prisonHelper(buildings, startingPlayer, coords, extraArray, board, move) {
  var allPrisonCoords = []
  for (var i=0; i<coords.length; i++) {
    allPrisonCoords.push(coords[i])
  }
  for (var i=0; i<buildings.length; i++) {
    if (buildings[i].name == "Prison") {
      if ((startingPlayer && buildings[i].player == 'player_one') || (!startingPlayer && buildings[i].player == 'player_two')) {
        for (var j=0; j<buildings[i]['location_array'].length; j++) {
          allPrisonCoords.push(buildings[i]['location_array'][j])
        }
      }
    }
  }
  for (var c=0; c<allPrisonCoords.length; c++) {
    var adjacentToCoord = ShapeUtils.getAdjacentCoordinates(allPrisonCoords[c]['row'], allPrisonCoords[c]['col'])
    for (var a=0; a<adjacentToCoord.length; a++) {
      if (extraArray[0]['row'] == adjacentToCoord[a]['row'] && extraArray[0]['col'] == adjacentToCoord[a]['col']) {
        if (board[extraArray[0]['row']][extraArray[0]['col']].marker != 'empty' || (move['row'] == extraArray[0]['row'] && move['col'] == extraArray[0]['col'])) {
          return true
        }
      }
    }
  }
  return false
}
function tramway(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 3 && ShapeUtils.checkShape3Line(coords)
}
function validateTramwayExtra(coords, extraArray, board, move) {
  return extraArray
      && extraArray.length == 2
      && tramwayHelper(coords, extraArray, board, move) 
}
function tramwayHelper(coords, extraArray, board, move) {
  var fromHexValidated = 0
  var toHexValidated = 0
  var adjacentToCoords = false
  
  for (var i=0; i<extraArray.length; i++) {
    if (board[extraArray[0]['row']][extraArray[0]['col']].type == 'w') {
      return false
    }

    if ((board[extraArray[i]['row']][extraArray[i]['col']].marker == 'empty') && !(extraArray[i]['row'] == move['row'] && extraArray[i]['col'] == move['col'])){
      toHexValidated += 1
    } else {
      fromHexValidated += 1
    }
    
    for (var j=0; j<coords.length; j++) {
      if (extraArray[i]['row'] == coords[j]['row'] && extraArray[i]['col'] == coords[j]['col']) {
        return false
      }
      var adjacentToCoord = ShapeUtils.getAdjacentCoordinates(coords[j]['row'], coords[j]['col'])
      for (var a=0; a<adjacentToCoord.length; a++) {
        if (adjacentToCoord[a]['row'] == extraArray[i]['row'] && adjacentToCoord[a]['col'] == extraArray[i]['col']) {
          adjacentToCoords = true
        }
      }
    }
  }
  return adjacentToCoord && (fromHexValidated == 1) && (toHexValidated == 1)
}
function foundry(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 2 && ShapeUtils.checkShapeDouble(coords)
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
  return on.friendly == 1 && adjacentTo.water >= 1 && coords.length == 1
}
function validateFerryExtra(coords, extraArray, board, move) {
  return extraArray
      && extraArray.length == 1
      && (extraArray[0]['row'] != coords[0]['row'] || extraArray[0]['col'] != coords[0]['col'])
      && (extraArray[0]['row'] != move['row'] || extraArray[0]['col'] != move['col'])
      && board[extraArray[0]['row']][extraArray[0]['col']].marker == 'empty'
      && board[extraArray[0]['row']][extraArray[0]['col']].type != 'w'
      && ferryHelper(coords, extraArray, board, move) 
}
function ferryHelper(coords, extraArray, board, move) {
  var adjacentToCoord = ShapeUtils.getAdjacentCoordinates(coords[0]['row'], coords[0]['col'])
  var adjacentToExtra = ShapeUtils.getAdjacentCoordinates(extraArray[0]['row'], extraArray[0]['col'])
  for (var c=0; c<adjacentToCoord.length; c++) {
    for (var e=0; e<adjacentToExtra.length; e++) {
      if (adjacentToCoord[c]['row'] == adjacentToExtra[e]['row'] && adjacentToCoord[c]['col'] == adjacentToExtra[e]['col'] && board[adjacentToCoord[c]['row']][adjacentToCoord[c]['col']].type == 'w') {
        return true
      }
    }
  }
  return false
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
  return on.friendly == 4 && adjacentTo.friendlyBuildings.length == 0 && ShapeUtils.checkShapeDiamond(coords)
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
function cemetery(coords, move, board, startingPlayer) {
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
function validateMonumentExtra(coords, extraArray, board, move, startingPlayer) {
  return extraArray
      && extraArray.length == 1
      && (extraArray[0]['row'] != coords[0]['row'] || extraArray[0]['col'] != coords[0]['col'])
      && (extraArray[0]['row'] != move['row'] || extraArray[0]['col'] != move['col'])
      && monumentHelper(coords, extraArray, board, move, startingPlayer) 
}
function monumentHelper(coords, extraArray, board, move, startingPlayer) {
  var adjacentToExtra = ShapeUtils.getAdjacentCoordinates(extraArray[0]['row'], extraArray[0]['col'])
  for (var i=0; i<coords.length; i++) {
    var adjacentToCoord = ShapeUtils.getAdjacentCoordinates(coords[i]['row'], coords[i]['col'])
    for (var c=0; c<adjacentToCoord.length; c++) {
      for (var e=0; e<adjacentToExtra.length; e++) {
        if (adjacentToCoord[c]['row'] == adjacentToExtra[e]['row'] && adjacentToCoord[c]['col'] == adjacentToExtra[e]['col']) {
          if ((board[extraArray[0]['row']][extraArray[0]['col']].marker == 'player_one' && !startingPlayer) || (board[extraArray[0]['row']][extraArray[0]['col']].marker == 'player_two' && startingPlayer))
            return true
        }
      }
    }
  }
  return false
}

//commercial
function placeCharlesDeGaulle(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 7 // TODO: write 7 check
}
function parcDeButtesChaumont(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 5 // TODO: write 6 ring, and surrounded by water check
}
function rueDeRivoli(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 6 // TODO: write 5 in a row check
}
function theCityHall(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 5 // TODO: write 5 in a V check
}
function theEmbassy(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 3 && ShapeUtils.checkShapeV(coords)
}
function tourEiffel(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 1 // TODO: surrounded by buildings on all sides
}
function boisDeVincennes(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 2 && ShapeUtils.checkShapeDouble(coords)
}
function waterworks(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  var adjacentTo = builtAdjacentTo(coords, move, board, startingPlayer)
  return on.friendly == 1 && adjacentTo.water >= 1 && coords.length == 1
}
function museeDuLouvre(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 3 && ShapeUtils.checkShapeTriangle(coords)
}
function guildHall(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 6 // TODO: write 6 in a triangle shape
}
function museeDuOrsay(coords, move, board, startingPlayer) {
  var on = builtOn(coords, move, board, startingPlayer)
  return on.friendly == 2 && ShapeUtils.checkShapeDouble(coords)
}

var buildingData = {
  //infrastructure
  'Boulevard': {'validation_function': boulevard, 'length': 4},
  'Tunnel': {'validation_function': tunnel, 'length': 1},
  'Prison': {'validation_function': prison, 'length': 2},
  'Tramway': {'validation_function': tramway, 'length': 3},
  'Foundry': {'validation_function': foundry, 'length': 2},

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
  'Cathedral': {'validation_function': cathedral, 'length': 4},
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
  'Cemetery': {'validation_function': cemetery, 'length': 3},
  'Shipyard': {'validation_function': shipyard, 'length': 3},
  'Sewers': {'validation_function': sewers, 'length': 3},
  'Monument': {'validation_function': monument, 'length': 2},

  //new cultural
  'Place Charles de Gaulle': {'validation_function': placeCharlesDeGaulle, 'length': 7}, 
  'Parc de Buttes Chaumont': {'validation_function': parcDeButtesChaumont, 'length': 5},
  'Rue de Rivoli': {'validation_function': rueDeRivoli, 'length': 6},
  'The City Hall': {'validation_function': theCityHall, 'length': 5},
  'The Embassy': {'validation_function': theEmbassy, 'length': 3},
  'Tour Eiffel': {'validation_function': tourEiffel, 'length': 1},
  'Bois de Vincennes': {'validation_function': boisDeVincennes, 'length': 2},
  'Waterworks': {'validation_function': waterworks, 'length': 1},
  'Musee du Louvre': {'validation_function': museeDuLouvre, 'length': 3},
  'Guild Hall': {'validation_function': guildHall, 'length': 6},
  'Musee du Orsay': {'validation_function': museeDuOrsay, 'length': 2}
}
