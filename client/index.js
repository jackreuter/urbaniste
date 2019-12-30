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


// Matrix of Tile objects. Details of bord should come from server on game start
var BOARD = undefined
// Should come from server on game start
var SHOP = undefined

var MY_TURN = false
var SOCKET_ID = undefined
var RESPONSE = undefined

var MY_BM = 0
var MY_C = 0
var MY_L = 0


function getColor(row, col) {
	var type = BOARD[row][col].type
	if (type == 'w') { return 'blue' }
	if (type == 'bm') { return 'red' }
	if (type == 'l') { return 'green' }
	if (type == 'c') { return 'yellow' }
}

function displayBoard() {
	const container = document.getElementById("board")

	rows = BOARD.length
	cols = BOARD[1].length
  container.style.setProperty('--grid-rows', rows)
  container.style.setProperty('--grid-cols', cols)
  for (row = 0; row < BOARD.length; row++) {
  	for (col = 0; col < BOARD[row].length; col++) {
	    var cell = document.createElement("div")
	    cell.style.background = getColor(row, col)
	    cell.id = row + "_" + col

	    cell.onclick = function(cell) {
	    	return function() {
	    		var coor = cell.id.split("_")
		 			var row = coor[0]
		 			var col = coor[1]
		 			if (BOARD[row][col].marker == 'empty' && BOARD[row][col].type != 'w') {
		 				clearPendingSelections()
		 				cell.innerText = '*'
		 				RESPONSE = {'marker_placement': cell.id}
		 			}
	    	}
	 			
	  	}(cell) // immediatlly invoke this function to tie it to correct cell
	    container.appendChild(cell).className = "grid-item"
	  }
	}
}

function clearPendingSelections() {
	for (row = 0; row < BOARD.length; row++) {
		for (col = 0; col < BOARD[row].length; col++) {
			if (document.getElementById(row + "_" + col).innerText == "*") {
				 document.getElementById(row + "_" + col).innerText = ""
			}
		}
	}
}

function displayBuildings() {
	// Iterate through BOARD object and draw svg lines for buildings
}

function displayShop() {
	var shop = document.getElementById('shop')
	for (i = 0; i < SHOP.length; i++) { 
		var row = document.createElement("tr")
		row.onclick = function(row) {
			return function() {
				console.log(row)
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

function incrementResource(type) {
	if (type == 'bm') {
		MY_BM += 1
		document.getElementById('resource_bm').innerText = "Building Materials: " + MY_BM
	}
	if (type == 'l') {
		MY_L += 1
		document.getElementById('resource_l').innerText = "Labor: " + MY_L
	}
	if (type == 'c') {
		MY_C += 1
		document.getElementById('resource_c').innerText = "Coin: " + MY_C
	}
}

window.onload = () => {
  var socket = io();

	// handle different messages from server
	socket.on('your_turn', () => {
		console.log('my turn')
    MY_TURN = true
    document.getElementById('turn_title').innerText = 'Your Turn'
  });

  socket.on('not_your_turn', () => {
  	console.log('not my turn')
    MY_TURN = false
    document.getElementById('turn_title').innerText = 'Opponents Turn'
  });

  socket.on('server_response', (response) => {
    MY_TURN = true
    document.getElementById('turn_title').innerText = 'Your Turn'

    var coor = response.marker_placement.split("_")
		var row = coor[0]
		var col = coor[1]
    if (response.socket_id == SOCKET_ID) {
    	BOARD[row][col].marker = 'M'
    	document.getElementById(response.marker_placement).innerText = 'Mine'
    	incrementResource(BOARD[row][col].type)
    }
    else {
    	BOARD[row][col].marker = 'E'
    	document.getElementById(response.marker_placement).innerText = 'Enemy'
    }
  });

	socket.on('starting_info', (response) => {
    console.log(response)
    BOARD = response.board
    SOCKET_ID = response.socket_id
    SHOP = response.shop
    displayBoard()
    displayShop()
  });

  // handle submit button click
  document.getElementById("submit_btn").onclick = () => {
    socket.emit('submit_move', RESPONSE);
  }
}
