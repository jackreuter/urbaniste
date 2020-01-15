/* MAIN CLIENT SIDE CODE */

/*
	BUILDING object:
		{
			id: ,
			player: ,
			name: ,
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

// individual functions to validate building placement in separate local file
import BuildingValidation from './buildingValidation.js'
import ShapeUtils from './util.js'

// Matrix of Tile objects. Details of board should come from server on game start
var BOARD = undefined
var BUILDINGS = undefined
var SHOP = undefined

var SOCKET_ID = undefined

var MY_TURN = false
var MY_MOVE = {}

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
	var rows = BOARD.length
  var	cols = BOARD[1].length
  container.style.setProperty('--grid_rows', rows)
  container.style.setProperty('--grid_cols', cols)
  for (var row = 0; row < BOARD.length; row++) {
  	for (var col = 0; col < BOARD[row].length; col++) {
	    var cell = document.createElement("div")
	    cell.id = row + "_" + col
	    if ((STARTING_PLAYER && BOARD[row][col].marker == 'player_one') || (!STARTING_PLAYER && BOARD[row][col].marker == 'player_two')) {
	    	cell.innerText = 'Mine'
	    }
	    if ((STARTING_PLAYER && BOARD[row][col].marker == 'player_two') || (!STARTING_PLAYER && BOARD[row][col].marker == 'player_one')) {
	    	cell.innerText = 'Enemy'
	    }

      // handle hex click
      // force marker placement selection first
      // then allow building selection, with shape restrictions
	    cell.onclick = function(cell) {
	    	return function() {
	    		var coor = cell.id.split("_")
		 			var row = +coor[0]
		 			var col = +coor[1]

          // force marker selection first
          if (!MY_MOVE['building']) {
						// Clicking on an already selected hex will de-select it.
		        if (cell.innerText == '*') {
			 				clearPendingPlacements()
			 				displayResources()
			 				MY_MOVE = {}
			 			} else if (
              BOARD[row][col].marker == 'empty'
                && BOARD[row][col].type != 'w' 
                && BOARD[row][col].building_id == undefined
                && ShapeUtils.tileAdjacencyCheck(row, col, MY_MOVE, BOARD, STARTING_PLAYER).adjacentToFriendly) {
			 				clearPendingPlacements()
			 				cell.innerText = '*'
			 				
			 				MY_RESOURCES[BOARD[row][col].type] += 1
			 				displayResources()

			 				MY_MOVE['marker_placement'] = {'row': row, 'col': col}
			 			}
          } else {
            // handle building selection
            // check if tile available to build
            if ( BOARD[row][col].building_id == undefined ) {
              
              // check if first tile selected
              if (MY_MOVE['building']['location_array'] && MY_MOVE['building']['location_array'].length == 0) {
                if (BuildingValidation.validateBuildingSelection(
                      MY_MOVE['building']['name'], 
                      [{'row': row, 'col': col}],
                      MY_MOVE,
                      BOARD,
                      STARTING_PLAYER
                    )){

                      MY_MOVE['building']['location_array'] = [{'row': row, 'col': col}]
                      cell.innerText = 'B'
                    }
              } else {
                // if tile have already been selected, check if click is to remove
                var locationArray = MY_MOVE['building']['location_array']
                var newLocationArray = []
                var found = false
                for (var i = 0; i < locationArray.length; i++) {
                  if (locationArray[i]['row'] == row && locationArray[i]['col'] == col) {
                    found = true
                  } else {
                    newLocationArray.push(locationArray[i])
                  }
                }
                // if tile already selected, use new array with selection removed
                if (found) {
                  MY_MOVE['building']['location_array'] = newLocationArray
                  cell.innerText = ""
                  // otherwise, check validity and add new tile to array
                } else {
                  newLocationArray.push({'row': row, 'col': col})
                  if (BuildingValidation.validateBuildingSelection(
                        MY_MOVE['building']['name'], 
                        newLocationArray,
                        MY_MOVE,
                        BOARD,
                        STARTING_PLAYER
                      )) {
                        MY_MOVE['building']['location_array'] = newLocationArray
                        cell.innerText = 'B'
                      }
                }
              }
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
	for (var row = 0; row < BOARD.length; row++) {
		for (var col = 0; col < BOARD[row].length; col++) {
			if (document.getElementById(row + "_" + col).innerText == "*") {
				document.getElementById(row + "_" + col).innerText = ""
				MY_RESOURCES[BOARD[row][col].type] -= 1
			}
		}
	}
}

// remove B marker from selected tiles
function clearPendingBuildings() {
	for (var row = 0; row < BOARD.length; row++) {
		for (var col = 0; col < BOARD[row].length; col++) {
			if (document.getElementById(row + "_" + col).innerText == "B") {
				 document.getElementById(row + "_" + col).innerText = ""
			}
		}
	}
}

// Iterate through BOARD object and draw svg lines for buildings
function displayBuildings() {
  for (var i = 0; i < BUILDINGS.length; i++) {
    var locationArray = BUILDINGS[i].location_array
    for (var j = 0; j < locationArray.length; j++) {
      for (var k = j+1; k < locationArray.length; k++) {
        var tile1 = locationArray[j]
        var tile2 = locationArray[k]
        var lineWidth = 65
        // draw line between adjacent tiles
        if (ShapeUtils.adjacent(tile1, tile2)) {
          drawLineBetweenTiles(tile1, tile2, lineWidth)
        }
      }
    }
  }
}

// draw SVG line between two tiles
function drawLineBetweenTiles(tile1, tile2, lineWidth) {
  var row1 = tile1.row
  var row2 = tile2.row
  var col1 = tile1.col
  var col2 = tile2.col

  var hexWidth = 100 // must match css file
  var spacing = 5 // must match css file
  var widthMultiplier = hexWidth + spacing
  var heightMultiplier = 90.5 // trial and error bullshit
  var x1 = hexWidth/2 + spacing + widthMultiplier*(col1)
  var x2 = hexWidth/2 + spacing + widthMultiplier*(col2)
  var y1 = 80 + heightMultiplier*(row1)
  var y2 = 80 + heightMultiplier*(row2)

  if (row1%2 != 0) {
    x1 += widthMultiplier/2
  }
  if (row2%2 != 0) {
    x2 += widthMultiplier/2
  }

  var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
  newLine.setAttribute('id','line');
  newLine.setAttribute('x1', x1);
  newLine.setAttribute('y1', y1);
  newLine.setAttribute('x2', x2);
  newLine.setAttribute('y2', y2);
  newLine.setAttribute("stroke", "black");
  newLine.setAttribute("stroke-width", lineWidth);
  $("svg").append(newLine);
}

// render shop HTML
function displayShop() {
	var shop = document.getElementById('shop')
	while (document.getElementById('shop').childNodes.length > 2) {
		document.getElementById('shop').childNodes[2].remove()
	}
	for (var i = 0; i < SHOP.length; i++) { 
		var row = document.createElement("tr")
    row.id = SHOP[i]['name']
    row.style.backgroundColor = 'white'

    // onclick function to handle building selection
		row.onclick = function(row) {
			return function() {
        var buildingName = row.id
        if (MY_MOVE['marker_placement']) {
          try {
            if (MY_MOVE['building']['name'] === buildingName) {
		 		      MY_MOVE['building'] = undefined
              row.style.backgroundColor = 'white'
              clearPendingBuildings()
            } else {
		          document.getElementById(MY_MOVE['building']['name']).style.backgroundColor = 'white'
		 		      MY_MOVE['building'] = {'name': buildingName, 'location_array': []}
              row.style.backgroundColor = 'red'
              clearPendingBuildings()
            }
          } catch (x) {
		 		    MY_MOVE['building'] = {'name': buildingName, 'location_array': []}
            row.style.backgroundColor = 'red'
            clearPendingBuildings()
          }
        }
      }
		}(row)
		var datum
		for (var attribute of Object.keys(SHOP[i])) {
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
  console.log(BUILDINGS)
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

  socket.on('not_welcome', () => {
    document.getElementById('not_valid_player_title').innerText = 'You Are Not Connected To Play. In VIEW ONLY Mode.'
  });

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
    MY_MOVE = {}
  }

  document.getElementById('message_btn').onclick = function() {
  	socket.emit('chat_message', document.getElementById('message_block').value)
  }
}
