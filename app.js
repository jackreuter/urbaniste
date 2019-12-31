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

var STARTING_BOARD = generateBoard()
var STARTING_SHOP = generateShop(5)

// Express to serve correct client side code
app.use(express.static(path.join(__dirname, 'client')))

// Socket.io code to listen for client connection.
io.on('connection', function(socket) {
  console.log('New player joined. Id: ' + socket.id)
  PLAYER_IDS.push(socket.id)
  console.log('num playes: ' + PLAYER_IDS.length)

  socket.emit('starting_info', {'board': STARTING_BOARD, 'socket_id': socket.id, 'shop': STARTING_SHOP} )

  // If the first player is connecting
  if (PLAYER_IDS[ACTIVE_PLAYER_INDEX] === socket.id) { 
    // Emit message to specific client rather than to all connected clients
    io.sockets.emit('not_your_turn')
    socket.emit('your_turn')
  } else {
    io.sockets.emit('your_turn')
    socket.emit('not_your_turn')
  }

  // When "submit_move" message comes in, call a function
  socket.on('submit_move', function(client_object) {
    emitMoveToPlayers(client_object, socket)
  })
  // When a client disconnects, clean that connection up
  socket.on('disconnect', function() {
    handleDisconnect(socket.id)
  })

})

// Starta a client by going to localhost:8080 in a browser 
http.listen(8080, function(){
  console.log('listening on *:8080')
})


function emitMoveToPlayers(client_object, socket) {  
  if (PLAYER_IDS[ACTIVE_PLAYER_INDEX] === socket.id) {
    io.sockets.emit('server_response', {'marker_placement': client_object['marker_placement'], 'socket_id': socket.id})

    socket.emit('not_your_turn')
    ACTIVE_PLAYER_INDEX = +(!ACTIVE_PLAYER_INDEX)
  }
}

function handleDisconnect(socket_id) {
  PLAYER_IDS.splice(PLAYER_IDS.indexOf(socket_id), 1)
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
    {'name': 'Tax House', 'bm': 1, 'c': 3, 'l': 2, 'amount': 5},
    {'name': 'Docks', 'bm': 0, 'c': 3, 'l': 2, 'amount': 5},
    {'name': 'Settlement', 'bm': 1, 'c': 3, 'l': 2, 'amount': 5},
    {'name': 'Bazaar', 'bm': 2, 'c': 3, 'l': 2, 'amount': 5},
    {'name': 'Quarry', 'bm': 0, 'c': 2, 'l': 2, 'amount': 5}, 
    {'name': 'Bank', 'bm': 3, 'c': 0, 'l': 2, 'amount': 5},
    {'name': 'Embassy', 'bm': 1, 'c': 3, 'l': 2, 'amount': 5}//,'Guard Tower','Customs Office','Casino','Lighthouse','Graveyard','Jail','Workshop','Mill','Wall','Church','Boulevard','Aqueduct','Harbor','Shipyard','Trolley','City Hall','Bridge','Tunnel','Sewers','Depot','Plaza']
  ]
  for (i=0; i<num_items; i++) {
    var x = Math.floor(Math.random() * buildings.length)
    results.push(buildings[x])
    buildings.splice(x, 1)
  }
  return results
}

function generateBoard() {
  board = []
  for (row=0; row<12; row+=1) {
    new_row = []
    num_columns = (row%2 == 0) ? 8 : 9
    for (column=0; column<num_columns; column+=1) {
      type = getTileType()
      tile = {
        'marker': 'empty',
        'type': type
      }
      new_row.push(tile)
    }
    board.push(new_row)
  }
  return board
}










