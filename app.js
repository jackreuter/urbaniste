// Server side code. To launch server locally:
// 1) install node.js
// 2) run "node app.js" inside whatever directory you save this file. Server will then be up and running, and and logs will go to that terminal window. 
// 3) Open two clients on different localhost:8080 chrome tabs. Client logs will go to dev tools console

var express = require('express')
var path = require('path')
var app = express()

var http = require('http').createServer(app)
var io = require('socket.io')(http)

// Locally written server side code
var startingStateGeneration = require('./server/startingStateGeneration')
var MoveProcessor = require('./server/moveProcessor')

var ACTIVE_PLAYER_INDEX = 0
var PLAYER_IDS = []

var beginner_mode = false


var startState = startingStateGeneration.generateBoard(20, beginner_mode)
var GAME_STATE = {
  'board': startState[0],
  'buildings': [],
  'shop': startingStateGeneration.generateShop(beginner_mode),
  'p1_resources': startState[1],
  'p2_resources': startState[2],
  'vps': {'p1':0, 'p2':0, 'p1_special':false, 'p2_special':false}
}

// Express to serve correct client side code
app.use(express.static(path.join(__dirname, 'client')))

// Socket.io code to listen for client connection.
io.on('connection', function(socket) {
  handlePlayerConnect(socket)
    
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

  socket.on("pass", function() {
    GAME_STATE.p1_immediately_passes = false
    GAME_STATE.p2_immediately_passes = false
    emitMoveToPlayers(socket)
  })

  // When "submit_move" message comes in, call a function
  socket.on('submit_move', function(client_object) {

    var moveProcessor = new MoveProcessor(GAME_STATE, client_object, ACTIVE_PLAYER_INDEX, beginner_mode)
    
    if (moveProcessor.validateMove(socket.id, PLAYER_IDS[ACTIVE_PLAYER_INDEX].socket_id)) {
      GAME_STATE = moveProcessor.processMove(client_object)
      GAME_STATE.vps = calcVPS()
      emitMoveToPlayers(socket)
    }

    for (var i=0; i<PLAYER_IDS.length; i++) {
      if (PLAYER_IDS[i].pass_forever) {
        io.sockets.emit('server_response', {
          'game_state': GAME_STATE,
          'socket_id': PLAYER_IDS[i].socket_id
        })
        io.sockets.emit('not_your_turn')
        socket.emit('your_turn')

        ACTIVE_PLAYER_INDEX = +(!ACTIVE_PLAYER_INDEX)
      }
    }
  })
  // When a client disconnects, clean that connection up
  socket.on('disconnect', function() {
    handleDisconnect(socket.id)
    console.log("Players: ")
    console.log(PLAYER_IDS)
  })

  socket.on('pass_forever', function() {
    for (var i=0; i<PLAYER_IDS.length; i++) {
      if (PLAYER_IDS[i].socket_id == socket.id) {
        PLAYER_IDS[i].pass_forever = true
      }
    }
    var game_end = true
    for (var i=0; i<PLAYER_IDS.length; i++) {
      if (!PLAYER_IDS[i].pass_forever) {
        game_end = false
      }
    }
    if (game_end) {
      gameEnded() 
    }
    emitMoveToPlayers(socket)
  })
})

// Starta a client by going to localhost:8080 in a browser 
http.listen(8080, function(){
  console.log('listening on *:8080')
})

function handlePlayerConnect(socket) {
  // replace first inactive socket with new connection
  for (var i=0; i<PLAYER_IDS.length; i++) {
    if (!PLAYER_IDS[i].active) {
      PLAYER_IDS[i].socket_id = socket.id
      PLAYER_IDS[i].active = true 
      console.log('Player reconnected with Id: ' + socket.id)
      return
    }
  }
  if (PLAYER_IDS.length < 2) {
    console.log('New player joined. Id: ' + socket.id)
    PLAYER_IDS.push({
      'socket_id': socket.id,
      'active': true
    })
  } else if (PLAYER_IDS.length >= 2) {
    socket.emit('not_welcome')
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

function emitMoveToPlayers(socket) { 
  io.sockets.emit('server_response', {
    'game_state': GAME_STATE,
    'socket_id': socket.id
  })
  socket.emit('not_your_turn')
  ACTIVE_PLAYER_INDEX = +(!ACTIVE_PLAYER_INDEX)
}

function calcVPS() {
  p1_vps = 0
  p2_vps = 0
  p1_special = false
  p2_special = false
  for (var i=0; i<GAME_STATE.buildings.length; i++) {
    for (var j=0; j<GAME_STATE.shop.length; j++) {
      if (GAME_STATE.shop[j].name == GAME_STATE.buildings[i].name) {
        if (GAME_STATE.buildings[i].player == 'player_one') {
          if (GAME_STATE.shop[j].vp != "0" || GAME_STATE.shop[j].name == 'Casino') {
            p1_vps += GAME_STATE.shop[j].vp
          } else {
            p1_special = true
          }
        }
        if (GAME_STATE.buildings[i].player == 'player_two') {
          if (GAME_STATE.shop[j].vp != "0" || GAME_STATE.shop[j].name == 'Casino') {
            p2_vps += GAME_STATE.shop[j].vp
          } else {
            p2_special = true
          }
        }
      }
    }
  }
  return {'p1':p1_vps, 'p2':p2_vps, 'p1_special':p1_special, 'p2_special':p2_special}
}

function gameEnded() {
  p1_vps = 0
  p2_vps = 0
  for (var i=0; i<GAME_STATE.buildings.length; i++) {
    for (var j=0; j<GAME_STATE.shop.length; j++) {
      if (GAME_STATE.shop[j].name == GAME_STATE.buildings[i].name) {
        if (GAME_STATE.buildings[i].player == 'player_one') {
          if (GAME_STATE.shop[j].vp != "*") {
            p1_vps += GAME_STATE.shop[j].vp
          }
        }
        if (GAME_STATE.buildings[i].player == 'player_two') {
          if (GAME_STATE.shop[j].vp != "*") {
            p2_vps += GAME_STATE.shop[j].vp
          }
        }
      }
    }
  }
  io.sockets.emit('game_ended', {'p1_vps': p1_vps, 'p2_vps': p2_vps})
}







