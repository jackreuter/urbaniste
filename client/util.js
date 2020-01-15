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

// Exported methods. Accessed via "e.g. ShapeUtils.checkShapeDouble(tiles)"
const ShapeUtils = {
  // check if two tiles are adjacent
  adjacent: (tileA, tileB) => {
    var adjacentToA = getAdjacentCoordinates(tileA.row, tileA.col)
    for (var i = 0; i < adjacentToA.length; i++) {
      if (adjacentToA[i].row == tileB.row 
          && adjacentToA[i].col == tileB.col) {
        return true;
      }
    }
    return false;
  },

  checkShapeDouble: (tiles) => {
    if (tiles.length != 2) {
      return false;
    } else {
    }
  },
  checkShape3Line: (tiles) => {
    if (tiles.length != 3) {
      return false;
    } else {
    }
  },
  checkShapeV: (tiles) => {
    if (tiles.length != 3) {
      return false;
    } else {
    }
  },
  checkShapeCane: (tiles) => {
    if (tiles.length != 4) {
      return false;
    } else {
    }
  },
  checkShapeY: (tiles) => {
    if (tiles.length != 4) {
      return false;
    } else {
    }
  },

  friendly: friendly,
  // check if tile at coordinates is adjacent to friendly marker, pending placement, or water tile
  tileAdjacencyCheck: (row, col, move, board, startingPlayer) => {
    var adjacentCoordinates = getAdjacentCoordinates(row, col)
    var adjacentToFriendly = false
    var adjacentToPlacement = false
    var adjacentToWater = false
    for (var i = 0; i < adjacentCoordinates.length; i++) {
      var coords = adjacentCoordinates[i]
      
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
    }
    return {
      'adjacentToFriendly': adjacentToFriendly,
      'adjacentToPlacement': adjacentToPlacement,
      'adjacentToWater': adjacentToWater
    }
  }
}

export default ShapeUtils
