/* General utility functions */

// get all adjacent tile coordinates
export function getAdjacentCoordinates(row, col) {
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

// check if tile at coordinates is friendly
export function friendly(row, col, board, startingPlayer) {
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

// check if tile at coordinates is adjacent to friendly marker, pending placement, or water tile
export function tileAdjacencyCheck(row, col, move, board, startingPlayer) {
  var adjacentCoordinates = getAdjacentCoordinates(row, col)
  var adjacentToFriendly = false
  var adjacentToPlacement = false
  var adjacentToWater = false
  var i
  for (i = 0; i < adjacentCoordinates.length; i++) {
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
    'friendly': adjacentToFriendly,
    'placement': adjacentToPlacement,
    'water': adjacentToWater
  }
}

// helper export functions to check building validity
export function checkShapeDouble(tiles) {
  if (tiles.length != 2) {
    return false;
  } else {
  }
}
export function checkShape3Line(tiles) {
  if (tiles.length != 3) {
    return false;
  } else {
  }
}
export function checkShapeV(tiles) {
  if (tiles.length != 3) {
    return false;
  } else {
  }
}
export function checkShapeCane(tiles) {
  if (tiles.length != 4) {
    return false;
  } else {
  }
}
export function checkShapeY(tiles) {
  if (tiles.length != 4) {
    return false;
  } else {
  }
}
