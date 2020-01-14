(function() {
  
  // Public server modules

  module.exports.generateShop = function(num_items) {
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

  module.exports.generateBoard = function() {
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

  // Private helper function

  function getTileType() {
    x = Math.floor(Math.random() * 25)
    if  (x < 4) { return 'w' }
    if (x < 11) { return 'bm' }
    if (x < 18) { return 'l' }
    return 'c'
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
}())
