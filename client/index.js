/* MAIN CLIENT SIDE CODE */

/*
	BUILDING object:
		{
			player: ,
			name: ,
			location_array: , // unordered list of coordinates this building exists on
		}

	TILE object:
		{
			marker: , // unoccupied or which player has a marker on this tile
			building: ,
			type: , // w, bm, c, l, other?
		}

	BOARD object:  Matrix of Tiles.
*/

// individual functions to validate building placement in separate local file
import BuildingValidation from './buildingValidation.js'
import ShapeUtils from './util.js'
import ErrorHandler from './errorHandler.js'

// Matrix of Tile objects. Details of board should come from server on game start
var BOARD = undefined
var BUILDINGS = undefined
var SHOP = undefined

var SOCKET_ID = undefined

var MY_TURN = false
var MY_MOVE = {}

var STARTING_PLAYER = false
var MY_RESOURCES = {'bm':0, 'l':0, 'c':0}
var ENEMY_RESOURCES = {'bm':0, 'l':0, 'c':0}


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
	    if (BOARD[row][col].building === undefined) {
	    	if ((STARTING_PLAYER && BOARD[row][col].marker == 'player_one') || (!STARTING_PLAYER && BOARD[row][col].marker == 'player_two')) {
		    	cell.innerText = 'Mine'
		    }
		    if ((STARTING_PLAYER && BOARD[row][col].marker == 'player_two') || (!STARTING_PLAYER && BOARD[row][col].marker == 'player_one')) {
		    	cell.innerText = 'Enemy'
		    }
  		}
	    cell.onclick = function(cell) {
	    	return function() {
          handleHexClick(cell)
        }
	  	}(cell) // immediatlly invoke this function to tie it to correct cell
	    container.appendChild(cell).className = getHexagonColorString(row, col)
	  }
	}
}

// handle hex click
// force marker placement selection first
// then allow building selection, with shape restrictions
function handleHexClick(cell) {
	var coor = cell.id.split("_")
	var row = +coor[0]
	var col = +coor[1]

  // force marker selection first
  if (MY_MOVE['building'] === undefined) {
		handleHexClickForMarkerPlacement(cell, row, col) 
  } else {
		handleHexClickForBuildingPlacement(cell, row, col)
  }
}

function handleHexClickForMarkerPlacement(cell, row, col) {
	// Clicking on an already selected hex will de-select it.
  if (cell.innerText == '*') {
		clearPendingPlacements()
		displayResources()
		MY_MOVE = {}
	} else if (
  		BOARD[row][col].marker == 'empty'
    	&& BOARD[row][col].type != 'w' 
    	&& BOARD[row][col].building == undefined
    	&& ShapeUtils.tileAdjacencyCheck(row, col, MY_MOVE, BOARD, STARTING_PLAYER).adjacentToFriendly
  ) {
		clearPendingPlacements()
		cell.innerText = '*'
		
		MY_RESOURCES[BOARD[row][col].type] += 1
		displayResources()

		MY_MOVE['marker_placement'] = {'row': row, 'col': col}
	} else {
		ErrorHandler.invalidHexClick(BOARD[row][col], ShapeUtils.tileAdjacencyCheck(row, col, MY_MOVE, BOARD, STARTING_PLAYER).adjacentToFriendly)
	}
  displayShop()
}

function handleHexClickForBuildingPlacement(cell, row, col) {
	// check if tile available to build
  if ( BOARD[row][col].building !== undefined ) {
  	return
  }
  // if tile have already been selected, check if click is to remove
  var locationArray = []
  for (var coordinate of MY_MOVE['building']['location_array']) {
  	locationArray.push(coordinate)
  }
  for (var i = 0; i < locationArray.length; i++) {
    if (locationArray[i]['row'] == row && locationArray[i]['col'] == col) {
			MY_MOVE['building']['location_array'].splice(i, 1)
    	clearBuildingBText(row, col)
    	return
    }
  }
  locationArray.push({'row': row, 'col': col})
  if (BuildingValidation.validateBuildingSelection(
    	MY_MOVE['building']['name'], 
    	locationArray,
    	MY_MOVE,
    	BOARD,
    	STARTING_PLAYER
  )) {
  	MY_MOVE['building']['location_array'] = locationArray
    cell.innerText = 'B'
  }
}

function clearBuildingBText(row, col) {
	if (MY_MOVE['marker_placement']
			&& MY_MOVE['marker_placement'].row === row
			&& MY_MOVE['marker_placement'].col === col
	) {
	  document.getElementById(row + "_" + col).innerText = "*"
  } else if ((STARTING_PLAYER && BOARD[row][col].marker == 'player_one') || (!STARTING_PLAYER && BOARD[row][col].marker == 'player_two')) {
	  document.getElementById(row + "_" + col).innerText = "Mine"
  } else if ((STARTING_PLAYER && BOARD[row][col].marker == 'player_two') || (!STARTING_PLAYER && BOARD[row][col].marker == 'player_one')) {
	  document.getElementById(row + "_" + col).innerText = "Enemy"
	} else {
		document.getElementById(row + "_" + col).innerText = ""
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
				// If tile was selected for move and building was previously selected over it, go back to tile placement display
				clearBuildingBText(row, col)
			}
		}
	}
}


var SVG_HEX_WIDTH = 100 // must match css file
var SVG_SPACING = 5 // must match css file
var SVG_WIDTH_MULTIPLIER = SVG_HEX_WIDTH + SVG_SPACING
var SVG_WIDTH_BUFFER = SVG_WIDTH_MULTIPLIER/2
var SVG_HEIGHT_MULTIPLIER = 90.5 // trial and error bullshit
var SVG_HEIGHT_BUFFER = 55 // trial and error bullshit
var SVG_LINE_WIDTH = 45

// Iterate through BOARD object and draw SVG lines for buildings
function displayBuildings() {
  var lineWidth = 45
  for (var i = 0; i < BUILDINGS.length; i++) {
    var locationArray = BUILDINGS[i]['location_array']
    var lineColor = (BUILDINGS[i]['player'] === 'player_one') ? 'white' : 'black'
    if (locationArray.length == 1) {
      drawLineOnTile(locationArray[0], lineColor)
    } else {
      for (var j = 0; j < locationArray.length; j++) {
        for (var k = j+1; k < locationArray.length; k++) {
          var tile1 = locationArray[j]
          var tile2 = locationArray[k]
          // draw line between adjacent tiles
          if (ShapeUtils.adjacent(tile1, tile2)) {
            drawLineBetweenTiles(tile1, tile2, lineColor)
          }
        }
      }
    }
  }
}

// draw SVG line between two tiles
function drawLineBetweenTiles(tile1, tile2, lineColor) {
  var x1 = SVG_HEX_WIDTH/2 + SVG_SPACING/2 + SVG_WIDTH_MULTIPLIER*(tile1.col)
  var x2 = SVG_HEX_WIDTH/2 + SVG_SPACING/2 + SVG_WIDTH_MULTIPLIER*(tile2.col)
  var y1 = SVG_HEIGHT_BUFFER + SVG_HEIGHT_MULTIPLIER*(tile1.row)
  var y2 = SVG_HEIGHT_BUFFER + SVG_HEIGHT_MULTIPLIER*(tile2.row)

  if (tile1.row%2 != 0) {
    x1 += SVG_WIDTH_BUFFER
  }
  if (tile2.row%2 != 0) {
    x2 += SVG_WIDTH_BUFFER
  }

  drawLine(x1, y1, x2, y2, lineColor)
}

// draw SVG line on single tile
function drawLineOnTile(tile, lineColor) {
  var x = SVG_HEX_WIDTH/2 + SVG_SPACING/2 + SVG_WIDTH_MULTIPLIER*(tile.col)
  var y = SVG_HEIGHT_BUFFER + SVG_HEIGHT_MULTIPLIER*(tile.row)
  if (tile.row%2 != 0) {
    x += SVG_WIDTH_BUFFER
  }

  var x1 = x - SVG_LINE_WIDTH/2
  var x2 = x + SVG_LINE_WIDTH/2
  var y1 = y - SVG_LINE_WIDTH/2
  var y2 = y + SVG_LINE_WIDTH/2

  drawLine(x1, y1, x2, y2, lineColor)
}

// draw SVG line
function drawLine(x1, y1, x2, y2, lineColor) {
  var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
  newLine.setAttribute('id','line');
  newLine.setAttribute('x1', x1);
  newLine.setAttribute('y1', y1);
  newLine.setAttribute('x2', x2);
  newLine.setAttribute('y2', y2);
  newLine.setAttribute("stroke", lineColor);
  newLine.setAttribute("stroke-width", SVG_LINE_WIDTH);
  $("svg").append(newLine);

}

// render SVG text element
// not in use yet, just playing around with SVG text
function drawTextOnTile(tile, text) {
  var x = SVG_HEX_WIDTH/2 + SVG_SPACING/2 + SVG_WIDTH_MULTIPLIER*(tile.col)
  var y = SVG_HEIGHT_BUFFER + SVG_HEIGHT_MULTIPLIER*(tile.row)
  if (tile.row%2 != 0) {
    x += SVG_WIDTH_BUFFER
  }
  var textSVG = document.createElementNS('http://www.w3.org/2000/svg','text');
  textSVG.setAttribute('id','text');
  textSVG.setAttribute('x', x);
  textSVG.setAttribute('y', y);
  textSVG.setAttribute('fill', 'red');
  textSVG.textContent=text
  $("svg").append(textSVG);
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
    if (MY_MOVE['building'] && MY_MOVE['building']['name'] && MY_MOVE['building']['name'] === row.id) {
      row.style.backgroundColor = 'red'
    } else if (BuildingValidation.canPayCost(SHOP[i], MY_RESOURCES)) {
      row.style.backgroundColor = 'yellow'
    } else {
      row.style.backgroundColor = 'white'
    }

    // onclick function to handle building selection
		row.onclick = function(row) {
			return function() {
        onClickShopRow(row)
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

// handle shop row click
function onClickShopRow(row) {
  var buildingName = row.id
  if (MY_MOVE['marker_placement'] === undefined) {
    ErrorHandler.shopError()
    return
  }
  // If shop item is already selected, deselect it
  if (MY_MOVE['building'] && MY_MOVE['building']['name'] === buildingName) {
 		MY_MOVE['building'] = undefined
  } else { // Select Shop Item
    if (BuildingValidation.canPayForBuilding(buildingName, MY_RESOURCES, SHOP)) {
	 		MY_MOVE['building'] = {'name': buildingName, 'location_array': []}
    } else {
      ErrorHandler.notEnoughMoney(buildingName)
    }
  }
  displayShop()
  clearPendingBuildings()
}

// render resource list HTML
function displayResources() {
	document.getElementById('resource_bm').innerText = "Building Materials: " + MY_RESOURCES.bm
	document.getElementById('resource_l').innerText = "Labor: " + MY_RESOURCES.l
	document.getElementById('resource_c').innerText = "Coin: " + MY_RESOURCES.c

	document.getElementById('resource_bm_e').innerText = "Building Materials: " + ENEMY_RESOURCES.bm
	document.getElementById('resource_l_e').innerText = "Labor: " + ENEMY_RESOURCES.l
	document.getElementById('resource_c_e').innerText = "Coin: " + ENEMY_RESOURCES.c
}

// Reconcile global variables to server's values. Display elements.
function ingestServerResponse(server_response) {
	// $().alert('close') <- TODO
	BOARD = server_response.game_state.board
  BUILDINGS = server_response.game_state.buildings
  SHOP = server_response.game_state.shop

	if (STARTING_PLAYER) {
    MY_RESOURCES = server_response.game_state.p1_resources
    ENEMY_RESOURCES = server_response.game_state.p2_resources
  } else {
    MY_RESOURCES = server_response.game_state.p2_resources
    ENEMY_RESOURCES = server_response.game_state.p1_resources
  }

  displayBoard()
  displayBuildings()
  displayShop()
  displayResources()
}

window.onload = () => {
  var socket = io();

  socket.on('not_welcome', () => {
  	ErrorHandler.notWelcome()
    document.getElementById('not_valid_player_title').innerText = 'You Are Not Connected To Play. In VIEW ONLY Mode.'
  });

  socket.on('game_ended', (final_score) => {
  	console.log(final_score)
  	var your_score
  	var opponent_score
  	if (STARTING_PLAYER) {
  		your_score = final_score.p1_vps
  		opponent_score = final_score.p2_vps
  	} else {
  		your_score = final_score.p2_vps
  		opponent_score = final_score.p1_vps
  	}
  	if (your_score > opponent_score) {
  		document.getElementById('not_valid_player_title').innerText = "YOU WIN. Your score: " + your_score + ". Your opponent's score: " + opponent_score + "."
  	} else if (your_score < opponent_score) {
  		document.getElementById('not_valid_player_title').innerText = "YOU LOSE. Your score: " + your_score + ". Your opponent's score: " + opponent_score + "."
  	} else {
  		document.getElementById('not_valid_player_title').innerText = "You tied with score: " + your_score + ". Lame."
  	}
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

	document.getElementById("pass_btn").onclick = () => {
		if (MY_TURN) {
			if (confirm("Are you sure you want to pass forever??")) {
			  socket.emit("pass_forever")
			}
		} else {
	  	ErrorHandler.notYourTurn()
	  }
	}

  // handle submit button click
  document.getElementById("submit_btn").onclick = () => {
  	if (MY_TURN) {
	    socket.emit('submit_move', MY_MOVE);
	    MY_MOVE = {}
	  } else {
	  	ErrorHandler.notYourTurn()
	  }
  }
}
