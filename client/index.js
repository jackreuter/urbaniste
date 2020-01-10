/* MAIN CLIENT SIDE CODE */

/*
	BUILDING object:
		{
			id: ,
			player: ,
			type: ,
			location_array: , // unordered list of coordinates this building exists on
		}

	TILE object:
		{
			marker: , // unoccupied or which playe has a marker on this tile
			building_id: ,
			type: , // w, bm, c, l, other?
			dom_id: , // id of dom element associated to this tile
		}

	BOARD object:  Matrix of Tiles.
*/


// Matrix of Tile objects. Details of board should come from server on game start
var BOARD = undefined
var BUILDINGS = undefined
var SHOP = undefined

var SOCKET_ID = undefined

var MY_TURN = false
var MY_MOVE = {
  'marker_placement': undefined, 
  'building': undefined
}

var STARTING_PLAYER = false
var MY_RESOURCES = {'bm':0, 'l':0, 'c':0}


// creates HTML class name for hexagons, referenced by CSS
function getHexagonColorString(row, col) {
	var type = BOARD[row][col].type
	if (type == 'w') { return 'hexagon color-blue' }
	if (type == 'bm') { return 'hexagon color-red' }
	if (type == 'l') { return 'hexagon color-green' }
	if (type == 'c') { return 'hexagon color-yellow' }
}

// render the board HTML
function displayBoard() {
	const container = document.getElementById("board")
	while (document.getElementById('board').childNodes.length > 0) {
		document.getElementById('board').childNodes[0].remove()
	}
	rows = BOARD.length
	cols = BOARD[1].length
  container.style.setProperty('--grid_rows', rows)
  container.style.setProperty('--grid_cols', cols)
  for (row = 0; row < BOARD.length; row++) {
  	for (col = 0; col < BOARD[row].length; col++) {
	    var cell = document.createElement("div")
	    cell.id = row + "_" + col
	    if ((STARTING_PLAYER && BOARD[row][col].marker == 'player_one') || (!STARTING_PLAYER && BOARD[row][col].marker == 'player_two')) {
	    	cell.innerText = 'Mine'
        console.log("STARTING_PLAYER")
        console.log(STARTING_PLAYER)
	    }
	    if ((STARTING_PLAYER && BOARD[row][col].marker == 'player_two') || (!STARTING_PLAYER && BOARD[row][col].marker == 'player_one')) {
	    	cell.innerText = 'Enemy'
	    }

	    cell.onclick = function(cell) {
	    	return function() {
	    		var coor = cell.id.split("_")
		 			var row = +coor[0]
		 			var col = +coor[1]
	        console.log("cell clicked:")
	        console.log(row)
	        console.log(col)

          if (MY_MOVE['building']===undefined) {
		 			  if (BOARD[row][col].marker == 'empty' && BOARD[row][col].type != 'w' && tileAdjacentToFriendly(row, col)) {
		 				  clearPendingPlacements()
		 				  cell.innerText = '*'
		 				  MY_MOVE['marker_placement'] = {'row': row, 'col': col}
		 			  }
          }
	    	}
	 			
	  	}(cell) // immediatlly invoke this function to tie it to correct cell
	    container.appendChild(cell).className = getHexagonColorString(row, col)
	  }
	}
}

// remove * marker from selected tiles
function clearPendingPlacements() {
	for (row = 0; row < BOARD.length; row++) {
		for (col = 0; col < BOARD[row].length; col++) {
			if (document.getElementById(row + "_" + col).innerText == "*") {
				 document.getElementById(row + "_" + col).innerText = ""
			}
		}
	}
}

// Iterate through BOARD object and draw svg lines for buildings
function displayBuildings() {
  // just playing around with svg lines
  console.log("line test")
  var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
  newLine.setAttribute('id','line');
  newLine.setAttribute('x1','35');
  newLine.setAttribute('y1','35');
  newLine.setAttribute('x2','130');
  newLine.setAttribute('y2','200');
  newLine.setAttribute("stroke", "black");
  newLine.setAttribute("stroke-width", '40');
  $("svg").append(newLine);
}

// helper functions to check building validity
function checkShapeDouble(tiles) {
  if (tiles.length != 2) {
    return false;
  } else {
  }
}
function checkShape3Line(tiles) {
  if (tiles.length != 3) {
    return false;
  } else {
  }
}
function checkShapeV(tiles) {
  if (tiles.length != 3) {
    return false;
  } else {
  }
}
function checkShapeCane(tiles) {
  if (tiles.length != 4) {
    return false;
  } else {
  }
}
function checkShapeY(tiles) {
  if (tiles.length != 4) {
    return false;
  } else {
  }
}

// check if two sets of coordinates are adjacent
function adjacent(row1, col1, row2, col2) {
}

// get all adjacent tile coordinates
function getAdjacentCoordinates(row, col) {
  adjacents = [[row, col-1], [row, col+1]]
	if (row%2 == 0) {
    adjacents.push([row-1, col-1])
    adjacents.push([row+1, col-1])
    adjacents.push([row-1, col])
    adjacents.push([row+1, col])
	} else {
    adjacents.push([row-1, col])
    adjacents.push([row+1, col])
    adjacents.push([row-1, col+1])
    adjacents.push([row+1, col+1])
  }
  return adjacents
}

// check if tile at coordinates is friendly
function friendly(row, col) {
	try {
		if (STARTING_PLAYER) {
  		return BOARD[row][col].marker == 'player_one'
  	} else {
  		return BOARD[row][col].marker == 'player_two'
  	}
	} catch(e) {
		return false
	}
}

// check if tile at coordinates is adjacent to friendly marker
function tileAdjacentToFriendly(row, col) {
  adjacentCoordinates = getAdjacentCoordinates(row, col)
  for (i = 0; i < adjacentCoordinates.length; i++) {
    coords = adjacentCoordinates[i]
    if (friendly(coords[0], coords[1])) {
      return true;
    }
  }
  return false;
}

// render shop HTML
function displayShop() {
	var shop = document.getElementById('shop')
	while (document.getElementById('shop').childNodes.length > 2) {
		document.getElementById('shop').childNodes[2].remove()
	}
	for (i = 0; i < SHOP.length; i++) { 
		var row = document.createElement("tr")
    row.id = SHOP[i]['name']
    row.style.backgroundColor = 'white'

    // onclick function to handle building
		row.onclick = function(row) {
			return function() {
        buildingName = row.id
        if (MY_MOVE['marker_placement'] !== undefined) {
          try {
            if (MY_MOVE['building']['name'] === buildingName) {
		 		      MY_MOVE['building'] = undefined
              row.style.backgroundColor = 'white'
            } else {
		          document.getElementById(MY_MOVE['building']['name']).style.backgroundColor = 'white'
		 		      MY_MOVE['building'] = {'name': buildingName}
              row.style.backgroundColor = 'red'
            }
          } catch (x) {
		 		    MY_MOVE['building'] = {'name': buildingName}
            row.style.backgroundColor = 'red'
          }
	        console.log(MY_MOVE)
        }
      }
		}(row, i)
		var datum
		for (attribute of Object.keys(SHOP[i])) {
			datum = document.createElement("th")
			datum.innerText = SHOP[i][attribute]
			row.appendChild(datum)
		}

		shop.appendChild(row)
	}
}

// render resource list HTML
function displayResources() {
	document.getElementById('resource_bm').innerText = "Building Materials: " + MY_RESOURCES.bm
	document.getElementById('resource_l').innerText = "Labor: " + MY_RESOURCES.l
	document.getElementById('resource_c').innerText = "Coin: " + MY_RESOURCES.c
}

// Reconcile global variables to server's values. Display elements.
function ingestServerResponse(server_response) {
	BOARD = server_response.game_state.board
  BUILDINGS = server_response.game_state.buildings
  SHOP = server_response.game_state.shop

	if (STARTING_PLAYER) {
    MY_RESOURCES = server_response.game_state.p1_resources
  } else {
    MY_RESOURCES = server_response.game_state.p2_resources
  }

  displayBoard()
  displayBuildings()
  displayShop()
  displayResources()
}

window.onload = () => {
  var socket = io();

	// handle different messages from server
	socket.on('your_turn', () => {
    MY_TURN = true
    document.getElementById('turn_title').innerText = 'Your Turn'
  });

  socket.on('not_your_turn', () => {
    MY_TURN = false
    document.getElementById('turn_title').innerText = 'Opponents Turn'
  });

  socket.on('server_response', (server_response) => {
    console.log(server_response.game_state)

    MY_TURN = true
    document.getElementById('turn_title').innerText = 'Your Turn'

		ingestServerResponse(server_response)  
  });

	socket.on('starting_info', (server_response) => {
    console.log(server_response)
    
    STARTING_PLAYER = server_response.starting_player
    SOCKET_ID = server_response.socket_id

    ingestServerResponse(server_response)  
  });

	socket.on('received_message', function(message) {
		console.log(message)
	})

  // handle submit button click
  document.getElementById("submit_btn").onclick = () => {
    socket.emit('submit_move', MY_MOVE);
    MY_MOVE['marker_placement'] = undefined
    MY_MOVE['building'] = undefined
  }

  document.getElementById('message_btn').onclick = function() {
  	socket.emit('chat_message', document.getElementById('message_block').value)
  }
}
