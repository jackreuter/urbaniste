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
      
      if (this.game_state.board[row][col].marker == 'empty'
          && this.game_state.board[row][col].type != 'w'
          && this.game_state.board[row][col].building_id == undefined
          && tileAdjacentToFriendly(row, col, this.active_player_index, this.game_state)
      ) {
        return true
      }
    }
    return false
  }

  method.processMove = function() {
    // handle marker placement
    var row = this.client_object.marker_placement.row
    var col = this.client_object.marker_placement.col
    var player
    if (this.active_player_index == 0) {
      player = 'player_one'
    } else {
      player = 'player_two'
    }    
    this.game_state.board[row][col].marker = player
    for (var i=0; i<this.game_state.board.length; i++) {
      for (var j=0; j<this.game_state.board[i].length; j++) {
        this.game_state.board[i][j].most_recent = false
      }
    }
    this.game_state.board[row][col].most_recent = true
    incrementResource(this.game_state.board[row][col].type, this.active_player_index, this.game_state)

    // handle buildings
    if (this.client_object.building) {
      if (!validateCost(this.game_state, this.active_player_index, this.client_object.building.name, this.client_object.building.variable_cost)
          || !validateAvailable(this.game_state, this.client_object.building.name)
      ) {
        return this.game_state
      }
      var newBuilding = {
        'player': player,
        'name': this.client_object.building.name,
        'location_array': this.client_object.building.location_array
      }
      // update building availability
      for (var i=0; i<this.game_state.shop.length; i++) {
        if (this.game_state.shop[i].name == this.client_object.building.name) {
          this.game_state.shop[i].limit -= 1
        }
      }
      // handle building-specific interactions
      if (newBuilding.name == 'Refinery') {
        for (var i=0; i<newBuilding.location_array.length; i++) {
          var r = newBuilding.location_array[i].row
          var c = newBuilding.location_array[i].col
          var resource_type = this.game_state.board[r][c].type
          if (this.active_player_index == 0) {
            this.game_state.p1_resources[resource_type] += 1
          } else {
            this.game_state.p2_resources[resource_type] += 1
          }
        }
      }
      if (newBuilding.name == 'Plaza') {
        if (this.active_player_index == 0) {
          this.game_state.p2_immediately_passes = true
        } else {
          this.game_state.p1_immediately_passes = true
        }
      }

      this.game_state.buildings.push(newBuilding)
      for (var i = 0; i < newBuilding.location_array.length; i++) {
        var r = newBuilding.location_array[i].row
        var c = newBuilding.location_array[i].col
        this.game_state.board[r][c].building = newBuilding
        this.game_state.board[r][c].marker = player
      }
    }
    
    return this.game_state
  }

  // Private helper function

  function validateAvailable(game_state, building_name) {
      for (var i=0; i<game_state.shop.length; i++) {
        if (game_state.shop[i].name == building_name) {
          return game_state.shop[i].limit > 0
        }
      }
    }

  function validateCost(game_state, active_player_index, building_name, variable_cost) {
    var player_resources
    if (active_player_index == 0) {
      player_resources = game_state.p1_resources
    } else {
      player_resources = game_state.p2_resources
    }  
    for (var i=0; i<game_state.shop.length; i++) {
      if (game_state.shop[i].name == building_name) {
        if (game_state.shop[i]['?'] > 0) {
          if (canPayVariableCost(game_state, game_state.shop[i], player_resources, variable_cost, active_player_index)) {
            if (active_player_index == 0) {
              game_state.p1_resources.bm -= variable_cost.bm
              game_state.p1_resources.l -= variable_cost.l
              game_state.p1_resources.c -= variable_cost.c
            } else {
              game_state.p2_resources.bm -= variable_cost.bm
              game_state.p2_resources.l -= variable_cost.l
              game_state.p2_resources.c -= variable_cost.c
            }
            return true
          } else {
            return false
          } 
        } else if (canPayCost(game_state.shop[i], player_resources)) {
          if (active_player_index == 0) {
            game_state.p1_resources.bm -= game_state.shop[i].bm
            game_state.p1_resources.l -= game_state.shop[i].l
            game_state.p1_resources.c -= game_state.shop[i].c
          } else {
            game_state.p2_resources.bm -= game_state.shop[i].bm
            game_state.p2_resources.l -= game_state.shop[i].l
            game_state.p2_resources.c -= game_state.shop[i].c
          }
          if (game_state.shop[i].name == "Casino") {
            if (active_player_index == 0) {
              game_state.p2_resources.bm -= variable_cost.bm
              game_state.p2_resources.l -= variable_cost.l
              game_state.p2_resources.c -= variable_cost.c
              game_state.p1_resources.bm += variable_cost.bm
              game_state.p1_resources.l += variable_cost.l
              game_state.p1_resources.c += variable_cost.c
            } else {
              game_state.p1_resources.bm -= variable_cost.bm
              game_state.p1_resources.l -= variable_cost.l
              game_state.p1_resources.c -= variable_cost.c
              game_state.p2_resources.bm += variable_cost.bm
              game_state.p2_resources.l += variable_cost.l
              game_state.p2_resources.c += variable_cost.c
            }
          }
          return true
        } else {
          return false
        }
      }
    }
    return false
  }

  function canPayCost(cost, player_resources) {
    return player_resources.bm >= cost.bm && player_resources.l >= cost.l && player_resources.c >= cost.c
  }

  function canPayVariableCost(game_state, shop_item, player_resources, variable_cost, active_player_index) {
    if (shop_item.name == "Tenement") {
      var deduction = 0
      for (var i=0; i<game_state.buildings.length; i++) {
        if ((game_state.buildings[i].name == 'Tenement') && (
          (game_state.buildings[i].player == 'player_one' && active_player_index == 0)
          || (game_state.buildings[i].player == 'player_two' && active_player_index == 1)
        )) {
          deduction += 1
        }
      }
    }
    return player_resources.bm >= variable_cost.bm
        && player_resources.l >= variable_cost.l
        && player_resources.c >= variable_cost.c
        && variable_cost.bm + variable_cost.l + variable_cost.c == (shop_item['?'] - deduction)
  }

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
