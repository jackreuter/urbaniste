(function() {
  var method = MoveProcessor.prototype

  // Constructor

  function MoveProcessor(game_state, client_object, active_player_index, beginner_mode) {
    this.game_state = game_state
    this.active_player_index = active_player_index
    this.client_object = client_object
    this.beginner_mode = beginner_mode
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
    incrementResource(this.game_state.board[row][col].type, this.active_player_index, this.game_state, row, col)

    // handle buildings
    if (this.client_object.building) {
      var newBuilding = {
        'player': player,
        'name': this.client_object.building.name,
        'location_array': this.client_object.building.location_array,
        'extra_array': this.client_object.building.extra_array
      }
      if (!validateCost(this.game_state, this.active_player_index, this.client_object.building.name, this.client_object.building.variable_cost, this.client_object.building.casino_steal, newBuilding)
          || !validateAvailable(this.game_state, this.client_object.building.name)
      ) {
        return this.game_state
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
      if (newBuilding.name == 'Foundry') {
        if (this.active_player_index == 0) {
          this.game_state.p2_immediately_passes = true
        } else {
          this.game_state.p1_immediately_passes = true
        }
      }
      if (newBuilding.name == 'Ferry') {
        var r = newBuilding.extra_array[0].row
        var c = newBuilding.extra_array[0].col
        this.game_state.board[r][c].marker = player
        this.game_state.board[r][c].most_recent = true
      }
      if (newBuilding.name == 'Prison') {
        for (e=0; e<newBuilding.extra_array.length; e++) {
          var r = newBuilding.extra_array[e].row
          var c = newBuilding.extra_array[e].col
          this.game_state.board[r][c].marker = 'empty'
        }
      }
      if (newBuilding.name == 'Landfill') {
        var r = newBuilding.location_array[0].row
        var c = newBuilding.location_array[0].col
        var adjacentHexes = getAdjacentCoordinates(r, c)

        for (h=0; h<adjacentHexes.length; h++) {
          if (player == 'player_one') {
            var looking_for = 'player_two'
          }
          if (player == 'player_two') {
            var looking_for = 'player_one'
          }
          if (this.game_state.board[adjacentHexes[h].row] && this.game_state.board[adjacentHexes[h].row][adjacentHexes[h].col] && this.game_state.board[adjacentHexes[h].row][adjacentHexes[h].col].marker == looking_for) {
            for (var building=0; building<this.game_state.buildings.length; building++) {
              for (var tile=0; tile<this.game_state.buildings[building].location_array.length; tile++) {
                if (this.game_state.buildings[building].location_array[tile].row != adjacentHexes[h].row  && this.game_state.buildings[building].location_array[tile].col != adjacentHexes[h].col) {
                  this.game_state.board[adjacentHexes[h].row][adjacentHexes[h].col].marker = 'empty'
                }
              }
            }
          }
        }
      }
      if (newBuilding.name == 'Tramway') {
        var r0 = newBuilding.extra_array[0].row
        var c0 = newBuilding.extra_array[0].col
        var r1 = newBuilding.extra_array[1].row
        var c1 = newBuilding.extra_array[1].col
          
        if (board[r0][c0].marker == 'empty') {
          var oldMarker = this.game_state.board[r1][c1].marker
          this.game_state.board[r1][c1].marker = 'empty'
          this.game_state.board[r0][c0].marker = oldMarker
          this.game_state.board[r0][c0].most_recent = true
        } else {
          var oldMarker = this.game_state.board[r0][c0].marker
          this.game_state.board[r0][c0].marker = 'empty'
          this.game_state.board[r1][c1].marker = oldMarker
          this.game_state.board[r1][c1].most_recent = true
        }
      }
      if (newBuilding.name == 'Tunnel') {
        var r = newBuilding.extra_array[0].row
        var c = newBuilding.extra_array[0].col
        this.game_state.board[r][c].marker = player
        this.game_state.board[r][c].most_recent = true
      }
      if (newBuilding.name == 'Monument') {
        var r = newBuilding.extra_array[0].row
        var c = newBuilding.extra_array[0].col
        this.game_state.board[r][c].marker = player
        this.game_state.board[r][c].most_recent = true
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

  function validateCost(game_state, active_player_index, building_name, variable_cost, casino_steal, newBuilding) {
    var player_resources
    if (active_player_index == 0) {
      player_resources = game_state.p1_resources
    } else {
      player_resources = game_state.p2_resources
    }  
    for (var i=0; i<game_state.shop.length; i++) {
      if (game_state.shop[i].name == building_name) {
        if (game_state.shop[i]['?'] > 0) {
          if (canPayVariableCost(game_state, game_state.shop[i], player_resources, variable_cost, active_player_index, newBuilding)) {
            if (active_player_index == 0) {
              game_state.p1_resources.bm -= (variable_cost.bm + game_state.shop[i].bm)
              game_state.p1_resources.l -= (variable_cost.l + game_state.shop[i].l)
              game_state.p1_resources.c -= (variable_cost.c + game_state.shop[i].c)
            } else {
              game_state.p2_resources.bm -= (variable_cost.bm + game_state.shop[i].bm)
              game_state.p2_resources.l -= (variable_cost.l + game_state.shop[i].l)
              game_state.p2_resources.c -= (variable_cost.c + game_state.shop[i].c)
            }
            if (game_state.shop[i].name == "Casino") {
              if (active_player_index == 0) {
                game_state.p2_resources.bm -= casino_steal.bm
                game_state.p2_resources.l -= casino_steal.l
                game_state.p2_resources.c -= casino_steal.c
                game_state.p1_resources.bm += casino_steal.bm
                game_state.p1_resources.l += casino_steal.l
                game_state.p1_resources.c += casino_steal.c
              } else {
                game_state.p1_resources.bm -= casino_steal.bm
                game_state.p1_resources.l -= casino_steal.l
                game_state.p1_resources.c -= casino_steal.c
                game_state.p2_resources.bm += casino_steal.bm
                game_state.p2_resources.l += casino_steal.l
                game_state.p2_resources.c += casino_steal.c
              }
            }
            if (game_state.shop[i].name == "Loan Office") {
              if (active_player_index == 0) {
                game_state.p1_resources.bm += casino_steal.bm
                game_state.p1_resources.l += casino_steal.l
                game_state.p1_resources.c += casino_steal.c
              } else {
                game_state.p2_resources.bm += casino_steal.bm
                game_state.p2_resources.l += casino_steal.l
                game_state.p2_resources.c += casino_steal.c
              }
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

  function adjacentBuildings(buildings, board, building) {
    
    var adjacentEnemyBuildingIndices = new Set()
    var adjacentFriendlyBuildingIndices = new Set()

    for (var index=0; index<building['location_array'].length; index++) {
      var adjacentHexes = getAdjacentCoordinates(building['location_array'][index]['row'], building['location_array'][index]['col'])
      for (var i=0; i<adjacentHexes.length; i++) {
        for (var buildingIndex=0; buildingIndex<buildings.length; buildingIndex++) {
          for (var hex=0; hex<buildings[buildingIndex]['location_array'].length; hex++) {
            if (adjacentHexes[i]['row'] == buildings[buildingIndex]['location_array'][hex]['row'] && adjacentHexes[i]['col'] == buildings[buildingIndex]['location_array'][hex]['col']) {
              if (building.player == buildings[buildingIndex]['player']) {
                adjacentFriendlyBuildingIndices.add(buildingIndex) 
              } else {
                adjacentEnemyBuildingIndices.add(buildingIndex)
              }
            }
          }
        } 
      }
    }

    return {
      'numAdjacentEnemyBuildings': adjacentEnemyBuildingIndices.size,
      'numAdjacentFriendlyBuildings': adjacentFriendlyBuildingIndices.size
    }
  }

  function canPayVariableCost(game_state, shop_item, player_resources, variable_cost, active_player_index, newBuilding) {
    var deduction = 0
    if (shop_item.name == "Tenement") {
      for (var i=0; i<game_state.buildings.length; i++) {
        if ((game_state.buildings[i].name == 'Tenement') && (
          (game_state.buildings[i].player == 'player_one' && active_player_index == 0)
          || (game_state.buildings[i].player == 'player_two' && active_player_index == 1)
        )) {
          deduction += 1
        }
      }
    }
    if (shop_item.name == "Bazaar") {
      var numNextTo = adjacentBuildings(game_state.buildings, game_state.board, newBuilding)
      deduction += numNextTo.numAdjacentEnemyBuildings
      deduction += numNextTo.numAdjacentFriendlyBuildings
    }

    return player_resources.bm >= variable_cost.bm + shop_item['bm']
        && player_resources.l >= variable_cost.l + shop_item['l']
        && player_resources.c >= variable_cost.c + shop_item['c']
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

  function getAdjacentCoordinates(row, col) {
    var adjacents = [{'row': row, 'col': col-1}, {'row': row, 'col': col+1}]
    if (row%2 == 0) {
      adjacents.push({'row': row-1, 'col': col-1})
      adjacents.push({'row': row+1, 'col': col-1})
      adjacents.push({'row': row-1, 'col': col})
      adjacents.push({'row': row+1, 'col': col})
    } else {
      adjacents.push({'row': row-1, 'col': col})
      adjacents.push({'row': row+1, 'col': col})
      adjacents.push({'row': row-1, 'col': col+1})
      adjacents.push({'row': row+1, 'col': col+1})
    }
    var col_limit = this.beginner_mode ? 8 : 11
    return adjacents.filter(a => a.row>=0 && a.col>=0 && a.row<=8 && a.col<=col_limit)
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

  function incrementResource(type, active_player_index, game_state, row, col) {
    if (active_player_index == 0) {
      game_state.p1_resources[type] += 1
    } else {
      game_state.p2_resources[type] += 1
    }

    for (var i=0; i<game_state.buildings.length; i++) {
      if (game_state.buildings[i].name == 'Opera Garnier') {
        adjacents1 = getAdjacentCoordinates(game_state.buildings[i]['location_array'][0]['row'], game_state.buildings[i]['location_array'][0]['col'])
        adjacents2 = getAdjacentCoordinates(game_state.buildings[i]['location_array'][1]['row'], game_state.buildings[i]['location_array'][1]['col'])

        for (var j1=0; j1<adjacents1.length; j1++) {
          if (adjacents1[j1]['row'] == row && adjacents1[j1]['col'] == col) {
            if (active_player_index == 0) {
              game_state.p1_resources[type] += 1
            } else {
              game_state.p2_resources[type] += 1
            }
            return
          }
        }
        for (var j2=0; j2<adjacents2.length; j2++) {
          if (adjacents2[j2]['row'] == row && adjacents2[j2]['col'] == col) {
            if (active_player_index == 0) {
              game_state.p1_resources[type] += 1
            } else {
              game_state.p2_resources[type] += 1
            }
            return
          }
        }
      }
    }
  }


  module.exports = MoveProcessor

}())
