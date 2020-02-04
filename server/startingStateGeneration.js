(function() {
  
  // Public server modules

  module.exports.generateShop = function(num_items) {
    var results = []
    var buildings = [
      //infrastructure
      {'name': 'Boulevard', 'type': 'Infrastructure', 'bm': 2, 'c': 1, 'l': 2, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Tunnel', 'type': 'Infrastructure', 'bm': 1, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': 3}, //
      {'name': 'Prison', 'type': 'Infrastructure', 'bm': 0, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': 3}, //
      {'name': 'Tramway', 'type': 'Infrastructure', 'bm': 2, 'c': 1, 'l': 0, '?': 0, 'limit': 5, 'vp': 2},  //
      {'name': 'Plaza', 'type': 'Infrastructure', 'bm': 3, 'c': 0, 'l': 2, '?': 0, 'limit': 5, 'vp': 4},

      //aquatic
      {'name': 'Bridge', 'type': 'Aquatic', 'bm': 3, 'c': 1, 'l': 0, '?': 0, 'limit': 5, 'vp': 3},
      {'name': 'Harbor', 'type': 'Aquatic', 'bm': 2, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
      {'name': 'Canal', 'type': 'Aquatic', 'bm': 2, 'c': 2, 'l': 1, '?': 0, 'limit': 5, 'vp': 4},
      {'name': 'Lock', 'type': 'Aquatic', 'bm': 2, 'c': 2, 'l': 0, '?': 0, 'limit': 5, 'vp': 2}, //
      {'name': 'Ferry', 'type': 'Aquatic', 'bm': 3, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 3}, //
      {'name': 'Lighthouse', 'type': 'Aquatic', 'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 2},

      //cultural
      {'name': 'Docks', 'type': 'Cultural', 'bm': 1, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': '*'}, //
      {'name': 'Embassy', 'type': 'Cultural', 'bm': 1, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': '*'}, //
      {'name': 'Cathedral', 'type': 'Cultural', 'bm': 2, 'c': 3, 'l': 0, '?': 0, 'limit': 5, 'vp': 5},
      {'name': 'City Hall', 'type': 'Cultural', 'bm': 1, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
      {'name': 'Marina', 'type': 'Cultural', 'bm': 2, 'c': 3, 'l': 0, '?': 0, 'limit': 5, 'vp': 6},

      //commercial
      {'name': 'Tenement', 'type': 'Commercial', 'bm': 0, 'c': 0, 'l': 0, '?': 4, 'limit': 4, 'vp': 3},
      {'name': 'Bazaar', 'type': 'Commercial', 'bm': 0, 'c': 0, 'l': 0, '?': 6, 'limit': 5, 'vp': 3}, //
      {'name': 'Refinery', 'type': 'Commercial', 'bm': 0, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': 2}, 
      {'name': 'Casino', 'type': 'Commercial', 'bm': 1, 'c': 0, 'l': 3, '?': 0, 'limit': 5, 'vp': 0},
      {'name': 'Watchtower', 'type': 'Commercial', 'bm': 0, 'c': 2, 'l': 3, '?': 0, 'limit': 5, 'vp': 3}, //

      //civic
      {'name': 'Tax House', 'type': 'Civic', 'bm': 0, 'c': 3, 'l': 2, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Cemetery', 'type': 'Civic', 'bm': 2, 'c': 0, 'l': 2, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Shipyard', 'type': 'Civic', 'bm': 1, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': 4},
      {'name': 'Sewers', 'type': 'Civic', 'bm': 2, 'c': 2, 'l': 1, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Monument', 'type': 'Civic', 'bm': 3, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 2} //
    ]

    return [
      {'name': 'Plaza', 'type': 'Infrastructure', 'bm': 3, 'c': 0, 'l': 2, '?': 0, 'limit': 5, 'vp': 4},
      {'name': 'Lighthouse', 'type': 'Aquatic', 'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Tenement', 'type': 'Commercial', 'bm': 0, 'c': 0, 'l': 0, '?': 4, 'limit': 4, 'vp': 3},
      {'name': 'Cemetery', 'type': 'Civic', 'bm': 2, 'c': 0, 'l': 2, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Lock', 'type': 'Aquatic', 'bm': 2, 'c': 2, 'l': 0, '?': 0, 'limit': 5, 'vp': 2}, //
    ]

    // for (i=0; i<5; i++) {
    //   var x = Math.floor(Math.random() * buildings.length)
    //   results.push(buildings[x])
    //   buildings.splice(x, 1)
    // }
    // return results
  }

  module.exports.generateBoard = function(num_rows, num_cols) {
    board = []
    p1_resources = {'bm':0, 'l':0, 'c':0}
    p2_resources = {'bm':0, 'l':0, 'c':0}
    for (row=0; row<num_rows; row+=1) {
      new_row = []
      //num_columns = (row%2 == 0) ? 8 : 9
      num_columns = num_cols
      for (col=0; col<num_columns; col+=1) {
        const markerType = getMarker(row, col, num_rows, num_cols)
        type = getTileType(markerType)
        if (markerType == "player_one") {
          p1_resources[type] += 1 
        } else if (markerType == "player_two") {
          p2_resources[type] += 1
        }
        tile = {
          'marker': markerType,
          'type': type
        }
        new_row.push(tile)
      }
      board.push(new_row)
    }
    return [board, p1_resources, p2_resources]
  }

  // Private helper function

  function getTileType(markerType) {
    x = Math.floor(Math.random() * 33)
    if (markerType != 'empty') {
      if (x < 11) { return 'bm' }
      if (x < 22) { return 'l' }
      return 'c'
    } else {
      if  (x < 9) { return 'bm' }
      if (x < 18) { return 'l' }
      if (x < 27) { return 'c' }
      return 'w'
    } 
  }

  function getMarker(row, col, num_rows, num_cols) {
    if ((row == 1 && col == (num_cols - 2)) || (row == (num_rows - 2) && col == 1)) {
      return "player_one"
    }
    if ((row == 1 && col == 1) || (row == (num_rows - 2) && col == (num_cols - 2))) {
      return "player_two"
    }
    return 'empty'
  }
}())
