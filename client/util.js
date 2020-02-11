/* General utility functions */

// Private methods

// get all adjacent tile coordinates
function getAdjacentCoordinates(row, col) {
  var adjacents = [{'row': row, 'col': col-1}, {'row': row, 'col': col+1}]
  if (row%2 == 0) {
    adjacents.push({'row': row-1, 'col': col-1})
    adjacents.push({'row': row+1, 'col': col-1})
    adjacents.push({'row': row-1, 'col': col})
    adjacents.push({'row': row+1, 'col': col})
  } else {
    adjacents.push({'row': row-1, 'col': col})
    adjacents.push({'row': row+1, 'col': col})
    adjacents.push({'row': row-1, 'col': col+1})
    adjacents.push({'row': row+1, 'col': col+1})
  }
  return adjacents
}

// check if tile with given coordinates has a friendly marker
function friendly(row, col, board, startingPlayer) {
  try {
    if (startingPlayer) {
      return board[row][col].marker == 'player_one'
    } else {
      return board[row][col].marker == 'player_two'
    }
  } catch(e) {
    return false
  }
}

// check if two tiles are adjacent
function adjacent(tileA, tileB) {
  var adjacentToA = getAdjacentCoordinates(tileA.row, tileA.col)
  for (var i = 0; i < adjacentToA.length; i++) {
    if (adjacentToA[i].row == tileB.row 
        && adjacentToA[i].col == tileB.col) {
      return true;
    }
  }
  return false;
}

function numNextTo(buildings, board, building_index, building, startingPlayer) {
  var adjacentEnemyBuildingIndices = new Set()
  var adjacentFriendlyBuildingIndices = new Set()
  var adjacentWater = new Set()

  for (var index=0; index<building['location_array'].length; index++) {
    var adjacentHexes = getAdjacentCoordinates(building['location_array'][index]['row'], building['location_array'][index]['col'])
    for (var i=0; i<adjacentHexes.length; i++) {
      for (var buildingIndex=0; buildingIndex<buildings.length; buildingIndex++) {
        if (building_index != buildingIndex) {
          for (var hex=0; hex<buildings[buildingIndex]['location_array'].length; hex++) {
            if (adjacentHexes[i]['row'] == buildings[buildingIndex]['location_array'][hex]['row'] && adjacentHexes[i]['col'] == buildings[buildingIndex]['location_array'][hex]['col']) {
              if ((startingPlayer && buildings[buildingIndex]['player'] == 'player_one') || (!startingPlayer && buildings[buildingIndex]['player'] == 'player_two')) {
                adjacentFriendlyBuildingIndices.add(buildingIndex) 
              } else {
                adjacentEnemyBuildingIndices.add(buildingIndex)
              }
            }
          }
        }
      } 
      try {
        if (board[adjacentHexes[i]['row']][adjacentHexes[i]['col']].type == 'w') {
          // unique transform of row,col for set uniqueness
          adjacentWater.add(100*adjacentHexes[i]['row'] + adjacentHexes[i]['col'])
        }
      } catch (e) {}
    }
  }

  return {
    'numAdjacentEnemyBuildings': adjacentEnemyBuildingIndices.size,
    'numAdjacentFriendlyBuildings': adjacentFriendlyBuildingIndices.size,
    'numAdjacentWater': adjacentWater.size
  }

}

// check if tiles form a double
function checkShapeDouble(tiles) {
  if (tiles.length != 2) {
    return false;
  } else {
    return adjacent(tiles[0], tiles[1]);
  }
}

// check if tiles form a triangle
function checkShapeTriangle(tiles) {
  if (tiles.length != 3) {
    return false;
  } else {
    return adjacent(tiles[0], tiles[1]) && adjacent(tiles[1], tiles[2]) && adjacent(tiles[0], tiles[2])
  }
}

// check if tiles form a straight line of length 3
function checkShape3Line(tiles) {
  if (tiles.length != 3) {
    return false;
  } else {
    var tile1 = tiles[0]
    var tile2 = tiles[1]
    var tile3 = tiles[2]
    var row1 = tile1.row
    var row2 = tile2.row
    var row3 = tile3.row
    var col1 = tile1.col
    var col2 = tile2.col
    var col3 = tile3.col

    // horizontal
    if (row1 == row2 && row2 == row3) {
      if ((col1 == col2 - 1 && col2 == col3 - 1) //123
        || (col1 == col3 - 1 && col3 == col2 - 1) //132
          || (col2 == col3 - 1 && col3 == col1 - 1) //231
          || (col2 == col1 - 1 && col1 == col3 - 1) //213
          || (col3 == col1 - 1 && col1 == col2 - 1) //312
          || (col3 == col2 - 1 && col2 == col1 - 1) //321
         ){
           return true
         }
    } else {
      // vertical
      if ((row1 == row2-1 && row2 == row3-1) || (row3 == row2-1 && row2 == row1-1)) { //123 321
        if (col1 == col3-1 || col3 == col1-1) {
          if (col2 == Math.min(col1, col3) && row2%2 == 1) {
            return true
          }
          if (col2 == Math.max(col1, col3) && row2%2 == 0) {
            return true
          }
        }
      }
      if ((row1 == row3-1 && row3 == row2-1) || (row2 == row3-1 && row3 == row1-1)) { //132 231
        if (col1 == col2-1 || col2 == col1-1) {
          if (col3 == Math.min(col1, col2) && row3%2 == 1) {
            return true
          }
          if (col3 == Math.max(col1, col2) && row3%2 == 0) {
            return true
          }
        }
      }
      if ((row2 == row1-1 && row1 == row3-1) || (row3 == row1-1 && row1 == row2-1)) { //213 312
        if (col3 == col2-1 || col2 == col3-1) {
          if (col1 == Math.min(col3, col2) && row1%2 == 1) {
            return true;
          }
          if (col1 == Math.max(col3, col2) && row1%2 == 0) {
            return true
          }
        }
      }
    }
    return false
  }
}

// check if tiles form a V shape
function checkShapeV(tiles) {
  if (tiles.length != 3) {
    return false
  } else {
    var tile1 = tiles[0]
    var tile2 = tiles[1]
    var tile3 = tiles[2]
    var adjacentToTile1 = getAdjacentCoordinates(tile1.row, tile1.col)
    var foundTileAdjacentToAll = false
    for (var i = 0; i < adjacentToTile1.length; i++) {
      if (adjacent(adjacentToTile1[i], tile2) && adjacent(adjacentToTile1[i], tile3)) {
        foundTileAdjacentToAll = true
      }
    }
    if (foundTileAdjacentToAll) {
      if (
        (adjacent(tile1, tile2) && adjacent(tile2, tile3))
        || (adjacent(tile1, tile3) && adjacent(tile2, tile3))
          || (adjacent(tile1, tile2) && adjacent(tile1, tile3))
      ) {
        return true
      }
    }
    return false
  }
}

// check if tiles form a cane shape
function checkShapeCane(tiles) {
  if (tiles.length != 4) {
    return false
  } else {
    var found3Line = false
    var foundV = false
    for (var i = 0; i < tiles.length; i++) {
      for (var j = i+1; j < tiles.length; j++) {
        for (var k = j+1; k < tiles.length; k++) {
          var subsetOfTiles = [tiles[i], tiles[j], tiles[k]]
          found3Line = found3Line || checkShape3Line(subsetOfTiles)
          foundV = foundV || checkShapeV(subsetOfTiles)
          if (checkShapeTriangle(subsetOfTiles)) {
            return false
          }
        }
      }
    }
    return found3Line && foundV
  }
}

// check if tiles form a diamond shape
function checkShapeDiamond(tiles) {
  if (tiles.length != 4) {
    return false
  } else {
    var triangleCount = 0
    var vCount = 0
    for (var i = 0; i < tiles.length; i++) {
      for (var j = i+1; j < tiles.length; j++) {
        for (var k = j+1; k < tiles.length; k++) {
          var subsetOfTiles = [tiles[i], tiles[j], tiles[k]]
          if (checkShape3Line(subsetOfTiles)) {
            return false
          }
          if (checkShapeTriangle(subsetOfTiles)) {
            triangleCount++
          }
          if (checkShapeV(subsetOfTiles)) {
            vCount++
          }
        }
      }
    }
    return triangleCount == 2 && vCount == 2
  }
}

// check if tiles form a U shape
function checkShapeU(tiles) {
  if (tiles.length != 4) {
    return false
  } else {
    var tile1 = tiles[0]
    var tile2 = tiles[1]
    var tile3 = tiles[2]
    var tile4 = tiles[3]
    var adjacentToTile1 = getAdjacentCoordinates(tile1.row, tile1.col)
    var foundTileAdjacentToAll = false
    for (var i = 0; i < adjacentToTile1.length; i++) {
      if (adjacent(adjacentToTile1[i], tile2) && adjacent(adjacentToTile1[i], tile3) && adjacent(adjacentToTile1[i], tile4)) {
        foundTileAdjacentToAll = true
      }
    }
    if (foundTileAdjacentToAll) {
      var vCount = 0
      for (var i = 0; i < tiles.length; i++) {
        for (var j = i+1; j < tiles.length; j++) {
          for (var k = j+1; k < tiles.length; k++) {
            var subsetOfTiles = [tiles[i], tiles[j], tiles[k]]
            if (checkShape3Line(subsetOfTiles)) {
              return false
            }
            if (checkShapeTriangle(subsetOfTiles)) {
              return false
            }
            if (checkShapeV(subsetOfTiles)) {
              vCount++
            }
          }
        }
      }
      return vCount == 2
    } else {
      return false
    }
  }
}

// Exported methods. Accessed via "e.g. ShapeUtils.checkShapeDouble(tiles)"
const ShapeUtils = {
  adjacent: adjacent,
  numNextTo: numNextTo,
  getAdjacentCoordinates: getAdjacentCoordinates,
  checkShapeDouble: checkShapeDouble,
  checkShapeTriangle: checkShapeTriangle,
  checkShape3Line: checkShape3Line,
  checkShapeV: checkShapeV,
  checkShapeCane: checkShapeCane,
  checkShapeDiamond: checkShapeDiamond,
  checkShapeU: checkShapeU,
  friendly: friendly,

  // check if tile at coordinates is adjacent to friendly marker, pending placement, or water tile
  tileAdjacencyCheck: (row, col, move, board, startingPlayer, buildings) => {
    var adjacentCoordinates = getAdjacentCoordinates(row, col)
    var adjacentToFriendly = false
    var adjacentToPlacement = false
    var adjacentToWater = false
    var adjacentViaLighthouse = false
    var adjacentViaLock = false
    for (var i = 0; i < adjacentCoordinates.length; i++) {
      var coords = adjacentCoordinates[i]
      var twoAway = getAdjacentCoordinates(coords['row'], coords['col'])
      
      // check if adjacent tile is friendly
      adjacentToFriendly = adjacentToFriendly || friendly(coords['row'], coords['col'], board, startingPlayer)

      // check if adjacent tile is pending placement
      if (move['marker_placement'] != undefined) {
        adjacentToPlacement = adjacentToPlacement || (move['marker_placement']['row'] == coords['row'] && move['marker_placement']['col'] == coords['col'])
      }

      // check if adjacent tile is water
      try {
        adjacentToWater = adjacentToWater || board[coords['row']][coords['col']].type === 'w'
      } catch (e) {
      }

      if (buildings) {
        for (var j=0; j<twoAway.length; j++) {
          for (var building=0; building<buildings.length; building++) {
            if (buildings[building].location_array[0].row == twoAway[j].row
                && buildings[building].location_array[0].col == twoAway[j].col
                && buildings[building].name == "Lighthouse"
                && ((buildings[building].player == "player_one" && startingPlayer) || (buildings[building].player == "player_two" && !startingPlayer))) {
              adjacentViaLighthouse = true
            }
          }
        }
        for (var j=0; j<twoAway.length; j++) {
          for (var building=0; building<buildings.length; building++) {
            if (board[coords['row']] && board[coords['row']][coords['col']] && board[coords['row']][coords['col']].type === 'w'
                && buildings[building].name == "Lock"
                && ((buildings[building].player == "player_one" && startingPlayer) || (buildings[building].player == "player_two" && !startingPlayer))) {
              for (var h=0; h<buildings[building].location_array.length; h++) {
                if (buildings[building].location_array[h].row == twoAway[j].row && buildings[building].location_array[h].col == twoAway[j].col) {
                  adjacentViaLock = true
                }
              }
            }
          }
        }
      }
    }
    return {
      'adjacentToFriendly': adjacentToFriendly,
      'adjacentToPlacement': adjacentToPlacement,
      'adjacentToWater': adjacentToWater,
      'adjacentViaLighthouse': adjacentViaLighthouse,
      'adjacentViaLock': adjacentViaLock
    }
  }
}

export default ShapeUtils;
