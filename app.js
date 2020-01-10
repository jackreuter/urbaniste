// Server side code. To launch server locally:
// 1) install node.js, express, socket.io
// 2) run "node app.js" inside whatever directory you save this file. Server will then be up and running, and and logs will go to that terminal window. 

var express = require('express')
var path = require('path')
var app = express()

var http = require('http').createServer(app)
var io = require('socket.io')(http)

var ACTIVE_PLAYER_INDEX = 0
var PLAYER_IDS = []

var GAME_STATE = {
  'board': generateBoard(),
  'buildings': [],
  'shop': generateShop(5),
  'p1_resources': {'bm':0, 'l':0, 'c':0},
  'p2_resources': {'bm':0, 'l':0, 'c':0}
}

// Express to serve correct client side code
app.use(express.static(path.join(__dirname, 'client')))

// Socket.io code to listen for client connection.
io.on('connection', function(socket) {
  handlePlayerConnect(socket.id)
    
  // if STARTING_PLAYER
  if (socket.id == PLAYER_IDS[0].socket_id) {
    socket.emit('starting_info', {
      'game_state': GAME_STATE,
      'socket_id': socket.id,
      'starting_player': true
    })
  } else {
    socket.emit('starting_info', {
      'game_state': GAME_STATE,
      'socket_id': socket.id,
      'starting_player': false
    })
  }

  console.log("Players: ")
  console.log(PLAYER_IDS)

  // If the first player is connecting
  if (PLAYER_IDS[ACTIVE_PLAYER_INDEX].socket_id === socket.id) { 
    // Emit message to specific client rather than to all connected clients
    io.sockets.emit('not_your_turn')
    socket.emit('your_turn')
  } else {
    io.sockets.emit('your_turn')
    socket.emit('not_your_turn')
  }

  // When "submit_move" message comes in, call a function
  socket.on('submit_move', function(client_object) {
    if (validateMove(client_object, socket.id)) {
      processMove(client_object)
      emitMoveToPlayers(GAME_STATE, socket)
    }
  })
  // When a client disconnects, clean that connection up
  socket.on('disconnect', function() {
    handleDisconnect(socket.id)
  })

  socket.on('chat_message', function(message) {
    io.sockets.emit('received_message', message)
  })

})

// Starta a client by going to localhost:8080 in a browser 
http.listen(8080, function(){
  console.log('listening on *:8080')
})

function handlePlayerConnect(socket_id) {
  // replace first inactive socket with new connection
  for (var i=0; i<PLAYER_IDS.length; i++) {
    if (!PLAYER_IDS[i].active) {
      PLAYER_IDS[i].socket_id = socket_id
      PLAYER_IDS[i].active = true 
      console.log('Player reconnected with Id: ' + socket_id)
      return
    }
  }
  if (PLAYER_IDS.length < 2) {
    console.log('New player joined. Id: ' + socket_id)
    PLAYER_IDS.push({
      'socket_id': socket_id,
      'active': true
    })
  }
}

function handleDisconnect(socket_id) {
  console.log('Player disconnected with Id: ' + socket_id)
  for (var i=0; i<PLAYER_IDS.length; i++) {
    if (PLAYER_IDS[i].socket_id == socket_id) {
      PLAYER_IDS[i].active = false
      return
    }
  }
}

function emitMoveToPlayers(GAME_STATE, socket) {  
  io.sockets.emit('server_response', {
    'game_state': GAME_STATE,
    'socket_id': socket.id
  })
  socket.emit('not_your_turn')
  ACTIVE_PLAYER_INDEX = +(!ACTIVE_PLAYER_INDEX)
}

function getTileType() {
  x = Math.floor(Math.random() * 25)
  if  (x < 4) { return 'w' }
  if (x < 11) { return 'bm' }
  if (x < 18) { return 'l' }
  return 'c'
}

function generateShop(num_items) {
  var results = []
  var buildings = [
    {'name': 'Tax House', 'bm': 0, 'c': 3, 'l': 2, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Docks', 'bm': 1, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': '*'},
    {'name': 'Settlement', 'bm': 1, 'c': 3, 'l': 2, '?': 4, 'limit': 5, 'vp': 2},
    {'name': 'Bazaar', 'bm': 0, 'c': 0, 'l': 0, '?': 6, 'limit': 5, 'vp': 3},
    {'name': 'Quarry', 'bm': 0, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': 2}, 
    {'name': 'Bank', 'bm': 0, 'c': 0, 'l': 0, '?': 3, 'limit': 5, 'vp': 2},
    {'name': 'Embassy', 'bm': 1, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': '*'},
    {'name': 'Guard Tower', 'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Customs Office', 'bm': 0, 'c': 3, 'l': 3, '?': 0, 'limit': 5, 'vp': 4},
    {'name': 'Casino', 'bm': 1, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 0},
    {'name': 'Lighthouse', 'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 2},
    {'name': 'Graveyard', 'bm': 1, 'c': 0, 'l': 3, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Jail', 'bm': 0, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Workshop', 'bm': 0, 'c': 0, 'l': 0, '?': 3, 'limit': 5, 'vp': 2},
    {'name': 'Mill', 'bm': 3, 'c': 0, 'l': 2, '?': 0, 'limit': 5, 'vp': 4},
    {'name': 'Wall', 'bm': 1, 'c': 0, 'l': 0, '?': 0, 'limit': 5, 'vp': 1},
    {'name': 'Church', 'bm': 2, 'c': 1, 'l': 0, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Boulevard', 'bm': 2, 'c': 1, 'l': 2, '?': 0, 'limit': 5, 'vp': 2},
    {'name': 'Aqueduct', 'bm': 2, 'c': 2, 'l': 0, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Harbor', 'bm': 0, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Shipyard', 'bm': 1, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Trolley', 'bm': 0, 'c': 3, 'l': 0, '?': 0, 'limit': 5, 'vp': 2},
    {'name': 'City Hall', 'bm': 1, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Bridge', 'bm': 3, 'c': 1, 'l': 0, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Tunnel', 'bm': 1, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Sewers', 'bm': 2, 'c': 2, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Depot', 'bm': 1, 'c': 3, 'l': 2, '?': 0, 'limit': 5, 'vp': 3},
    {'name': 'Plaza', 'bm': 1, 'c': 2, 'l': 1, '?': 0, 'limit': 5, 'vp': '*'}
  ]
  for (i=0; i<num_items; i++) {
    var x = Math.floor(Math.random() * buildings.length)
    results.push(buildings[x])
    buildings.splice(x, 1)
  }
  return results
}

function getMarker(row, col) {
  if ((row == 0 && col == 7) || (row == 11 && col == 0)) {
    return "player_one"
  }
  if ((row == 0 && col == 0) || (row == 11 && col == 7)) {
    return "player_two"
  }
  return 'empty'
}

function generateBoard() {
  board = []
  for (row=0; row<12; row+=1) {
    new_row = []
    //num_columns = (row%2 == 0) ? 8 : 9
    num_columns = 8
    for (col=0; col<num_columns; col+=1) {
      type = getTileType()
      tile = {
        'marker': getMarker(row, col),
        'type': type
      }
      new_row.push(tile)
    }
    board.push(new_row)
  }
  return board
}

function validateMove(client_object, socket_id) {
  // If it's the active player's turn to submit
  if (client_object && PLAYER_IDS[ACTIVE_PLAYER_INDEX].socket_id === socket_id){
    var row = client_object.marker_placement.row
    var col = client_object.marker_placement.col 
    if (GAME_STATE.board[row][col].marker == 'empty' && GAME_STATE.board[row][col].type != 'w' && tileAdjacentToFriendly(row, col)) {
      return true
    }
  }
  return false
}

function processMove(client_object) {
  var row = client_object.marker_placement.row
  var col = client_object.marker_placement.col
  if (ACTIVE_PLAYER_INDEX == 0) {
    GAME_STATE.board[row][col].marker = 'player_one'
  } else {
    GAME_STATE.board[row][col].marker = 'player_two'
  }    
  incrementResource(GAME_STATE.board[row][col].type, ACTIVE_PLAYER_INDEX)
}

function incrementResource(type, player_index) {
  if (player_index == 0) {
    GAME_STATE.p1_resources[type] += 1
  } else {
    GAME_STATE.p2_resources[type] += 1
  }
}

function tileAdjacentToFriendly(row, col) {
  if (adjacent(row, col+1) || adjacent(row, col-1)) {
    return true
  }
  if (row%2 == 0) {
    return (adjacent(row-1, col-1) || adjacent(row+1, col-1) || adjacent(row-1, col) || adjacent(row+1, col))
  } else {
    return (adjacent(row-1, col) || adjacent(row+1, col) || adjacent(row-1, col+1) || adjacent(row+1, col+1))
  }
}

function adjacent(row, col) {
  try {
    if (!ACTIVE_PLAYER_INDEX) {
      return GAME_STATE.board[row][col].marker == 'player_one'
    } else {
      return GAME_STATE.board[row][col].marker == 'player_two'
    }
  } catch(e) {
    return false
  }
}








