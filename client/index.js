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

      // handle hex click
      // force marker placement selection first
      // then allow building selection, with shape restrictions
	    cell.onclick = function(cell) {
	    	return function() {
	    		var coor = cell.id.split("_")
		 			var row = +coor[0]
		 			var col = +coor[1]

          // create move object
          if (MY_MOVE == {}) {
            MY_MOVE = {
              'marker_placement': undefined,
              'building': undefined
            }
          }

          // force marker selection first
          if (MY_MOVE['building']===undefined) {
						// Clicking on an already selected hex will de-select it.
		        if (cell.innerText == '*') {
			 				clearPendingPlacements()
			 				displayResources()
			 				MY_MOVE = {}
			 			} else if (BOARD[row][col].marker == 'empty' && BOARD[row][col].type != 'w' && tileAdjacentToFriendly(row, col)) {
			 				clearPendingPlacements()
			 				cell.innerText = '*'
			 				
			 				MY_RESOURCES[BOARD[row][col].type] += 1
			 				displayResources()

			 				MY_MOVE = {'marker_placement': {'row': row, 'col': col}}
			 			}
          } else {

            // handle building selection
            // check if first tile selected
            if (MY_MOVE['building']['location_array'].length == 0) {
              if (BUILDING_VALIDITY_FUNCTIONS[MY_MOVE['building']['name']]([[row, col]])) {
                MY_MOVE['building']['location_array'] = [[row, col]]
                cell.innerText = 'B'
              }
            } else {
              // if tile have already been selected, check if click is to remove
              locationArray = MY_MOVE['building']['location_array']
              newLocationArray = []
              found = false
              for (i = 0; i < locationArray.length; i++) {
                if (locationArray[i][0] == row && locationArray[i][1] == col) {
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
                newLocationArray.push([row, col])
                if (BUILDING_VALIDITY_FUNCTIONS[MY_MOVE['building']['name']](newLocationArray)) {
                  MY_MOVE['building']['location_array'] = newLocationArray
                  cell.innerText = 'B'
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
	for (row = 0; row < BOARD.length; row++) {
		for (col = 0; col < BOARD[row].length; col++) {
			if (document.getElementById(row + "_" + col).innerText == "*") {
				document.getElementById(row + "_" + col).innerText = ""
				MY_RESOURCES[BOARD[row][col].type] -= 1
			}
		}
	}
}

// remove B marker from selected tiles
function clearPendingBuildings() {
	for (row = 0; row < BOARD.length; row++) {
		for (col = 0; col < BOARD[row].length; col++) {
			if (document.getElementById(row + "_" + col).innerText == "B") {
				 document.getElementById(row + "_" + col).innerText = ""
			}
		}
	}
}

// Iterate through BOARD object and draw svg lines for buildings
function displayBuildings() {
  // just playing around with svg lines
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

    // onclick function to handle building selection
		row.onclick = function(row) {
			return function() {
        var buildingName = row.id
        if (MY_MOVE['marker_placement'] !== undefined) {
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

/*-----------------------BUILDING VALIDITY FUNCTIONS---------------------------*/
var BUILDING_VALIDITY_FUNCTIONS = {
  'Harbor': harborValid,
  'Tax House': taxHouseValid,
  'Docks': docksValid,
  'Settlement': settlementValid,
  'Bazaar': bazaarValid,
  'Quarry': quarryValid,
  'Bank': bankValid,
  'Embassy': embassyValid,
  'Guard Tower': guardTowerValid,
  'Customs Office': customsOfficeValid,
  'Casino': casinoValid,
  'Lighthouse': lightHouseValid,
  'Graveyard': graveyardValid,
  'Jail': jailValid,
  'Workshop': workShopValid,
  'Mill': millValid,
  'Wall': wallValid,
  'Church': churchValid,
  'Boulevard': boulevardValid,
  'Aqueduct': aqueductValid,
  'Harbor': harborValid,
  'Shipyard': shipyardValid,
  'Trolley': trolleyValid,
  'City Hall': cityHallValid,
  'Bridge': bridgeValid,
  'Tunnel': tunnelValid,
  'Sewers': sewersValid,
  'Depot': depotValid,
  'Plaza': plazaValid,
}

function harborValid(coords) {
  if (coords.length != 1) {
    return false
  } else { 
    row = coords[0][0]
    col = coords[0][1]
    if (tileAdjacentToFriendlyOrPlacement(row, col) && BOARD[row][col].type === 'w') {
      return true
    } else {
      return false
    }
  }
}

function taxHouseValid() {return false}
function docksValid() {return false}
function settlementValid() {return false}
function bazaarValid() {return false}
function quarryValid() {return false}
function bankValid() {return false}
function embassyValid() {return false}
function guardTowerValid() {return false}
function customsOfficeValid() {return false}
function casinoValid() {return false}
function lightHouseValid() {return false}
function graveyardValid() {return false}
function jailValid() {return false}
function workShopValid() {return false}
function millValid() {return false}
function wallValid() {return false}
function churchValid() {return false}
function boulevardValid() {return false}
function aqueductValid() {return false}
function harborValid() {return false}
function shipyardValid() {return false}
function trolleyValid() {return false}
function cityHallValid() {return false}
function bridgeValid() {return false}
function tunnelValid() {return false}
function sewersValid() {return false}
function depotValid() {return false}
function plazaValid() {return false}

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

// check if tile at coordinates is adjacent to friendly marker or placement
function tileAdjacentToFriendlyOrPlacement(row, col) {
  adjacentCoordinates = getAdjacentCoordinates(row, col)
  for (i = 0; i < adjacentCoordinates.length; i++) {
    coords = adjacentCoordinates[i]
    if (friendly(coords[0], coords[1]) || (MY_MOVE['marker_placement']['row'] == coords[0] && MY_MOVE['marker_placement']['col'] == coords[1])) {
      return true;
    }
  }
  return false;
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
