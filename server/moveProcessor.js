(function() {
  var method = MoveProcessor.prototype

  // Constructor

  function MoveProcessor(game_state, client_object, active_player_index) {
    this.game_state = game_state
    this.active_player_index = active_player_index
    this.client_object = client_object
  }

  // Public server modules

  method.validateMove = function(socket_id, active_player_id) {
    // If it's the active player's turn to submit
    if (this.client_object && this.client_object.marker_placement && active_player_id === socket_id){
      var row = this.client_object.marker_placement.row
      var col = this.client_object.marker_placement.col 
      
      if (
        this.game_state.board[row][col].marker == 'empty'
        && this.game_state.board[row][col].type != 'w'
        && tileAdjacentToFriendly(row, col, this.active_player_index, this.game_state)
      ) {
        return true
      }
    }
    return false
  }

  method.processMove = function() {
    var row = this.client_object.marker_placement.row
    var col = this.client_object.marker_placement.col
    if (this.active_player_index == 0) {
      this.game_state.board[row][col].marker = 'player_one'
    } else {
      this.game_state.board[row][col].marker = 'player_two'
    }    
    incrementResource(this.game_state.board[row][col].type, this.active_player_index, this.game_state)
    return this.game_state
  }

  // Private helper function

  function tileAdjacentToFriendly(row, col, active_player_index, game_state) {
    if (adjacent(row, col+1, active_player_index, game_state) || adjacent(row, col-1, active_player_index, game_state)) {
      return true
    }
    if (row%2 == 0) {
      return (
        adjacent(row-1, col-1, active_player_index, game_state)
        || adjacent(row+1, col-1, active_player_index, game_state)
        || adjacent(row-1, col, active_player_index, game_state)
        || adjacent(row+1, col, active_player_index, game_state)
      )
    } else {
      return (
        adjacent(row-1, col, active_player_index, game_state)
        || adjacent(row+1, col, active_player_index, game_state)
        || adjacent(row-1, col+1, active_player_index, game_state)
        || adjacent(row+1, col+1, active_player_index, game_state)
      )
    }
  }

  function adjacent(row, col, active_player_index, game_state) {
    try {
      if (!active_player_index) {
        return game_state.board[row][col].marker == 'player_one'
      } else {
        return game_state.board[row][col].marker == 'player_two'
      }
    } catch(e) {
      return false
    }
  }

  function incrementResource(type, active_player_index, game_state) {
    if (active_player_index == 0) {
      game_state.p1_resources[type] += 1
    } else {
      game_state.p2_resources[type] += 1
    }
  }


  module.exports = MoveProcessor

}())