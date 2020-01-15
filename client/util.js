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

// Exported methods. Accessed via "e.g. ShapeUtils.checkShapeDouble(tiles)"
const ShapeUtils = {
  adjacent: adjacent,
  getAdjacentCoordinates: getAdjacentCoordinates,
  checkShapeDouble: (tiles) => {
    if (tiles.length != 2) {
      return false
    } else {
      return adjacent(tiles[0], tiles[1]);
    }
  },
  checkShapeTriangle: (tiles) => {
    if (tiles.length != 3) {
      return false;
    } else {
      return adjacent(tiles[0], tiles[1]) && adjacent(tiles[1], tiles[2]) && adjacent(tiles[0], tiles[2])
    }
  },
  checkShape3Line: (tiles) => {
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
              return true
            }
            if (col1 == Math.max(col3, col2) && row1%2 == 0) {
              return true
            }
          }
        }
      }
      return false
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

export default ShapeUtils;
