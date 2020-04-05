(function() {
  
  // Public server modules

  module.exports.generateShop = function(num_items) {
    var results = []
    var buildings = [
      // //cultural
      // [
      // {'name': 'Docks',      'type': 'Cultural',       'bm': 1, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': '*'},
      // {'name': 'Embassy',    'type': 'Cultural',       'bm': 1, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': '*'},
      // {'name': 'Cathedral',  'type': 'Cultural',       'bm': 2, 'c': 3, 'l': 0, '?': 0, 'limit': 5, 'vp': 6},
      // {'name': 'City Hall',  'type': 'Cultural',       'bm': 1, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
      // {'name': 'Marina',     'type': 'Cultural',       'bm': 2, 'c': 3, 'l': 0, '?': 0, 'limit': 5, 'vp': 6}
      // ],

      //infrastructure
      [ 
      {'name': 'Boulevard',  'type': 'Infrastructure',               'bm': 2, 'c': 1, 'l': 2, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Tunnel',     'type': 'Infrastructure',               'bm': 1, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': 3},
      {'name': 'Prison',     'type': 'Infrastructure',               'bm': 0, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Tramway',    'type': 'Infrastructure',               'bm': 3, 'c': 0, 'l': 0, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Foundry',    'type': 'Infrastructure',               'bm': 0, 'c': 0, 'l': 3, '?': 0, 'limit': 5, 'vp': 1}
      ],

      //aquatic
      [
      {'name': 'Bridge',     'type': 'Aquatic',                      'bm': 3, 'c': 1, 'l': 0, '?': 0, 'limit': 5, 'vp': 3},
      {'name': 'Harbor',     'type': 'Aquatic',                      'bm': 0, 'c': 2, 'l': 1, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Canal',      'type': 'Aquatic',                      'bm': 2, 'c': 2, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
      {'name': 'Ferry',      'type': 'Aquatic',                      'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 3},
      {'name': 'Lighthouse', 'type': 'Aquatic',                      'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 2}
      ],

      //commercial
      [
      {'name': 'Tenement',   'type': 'Commercial',                   'bm': 0, 'c': 0, 'l': 0, '?': 4, 'limit': 4, 'vp': 3},
      {'name': 'Bazaar',     'type': 'Commercial',                   'bm': 0, 'c': 0, 'l': 0, '?': 6, 'limit': 5, 'vp': 3},
      {'name': 'Refinery',   'type': 'Commercial',                   'bm': 0, 'c': 0, 'l': 0, '?': 3, 'limit': 5, 'vp': 1}, 
      {'name': 'Casino',     'type': 'Commercial',                   'bm': 0, 'c': 0, 'l': 0, '?': 4, 'limit': 5, 'vp': 0},
      {'name': 'Watchtower', 'type': 'Commercial',                   'bm': 0, 'c': 2, 'l': 3, '?': 0, 'limit': 5, 'vp': 3}
      ],

      //civic
      [
      {'name': 'Tax House',  'type': 'Civic',                        'bm': 0, 'c': 3, 'l': 2, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Cemetery',   'type': 'Civic',                        'bm': 3, 'c': 2, 'l': 0, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Shipyard',   'type': 'Civic',                        'bm': 1, 'c': 0, 'l': 3, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Sewers',     'type': 'Civic',                        'bm': 2, 'c': 0, 'l': 3, '?': 0, 'limit': 5, 'vp': 2},
      {'name': 'Monument',   'type': 'Civic',                        'bm': 3, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 2}
      ],

      //new cultural
      [
      {'name': 'Place Charles de Gaulle',   'type': 'NewCultural',   'bm': 3, 'c': 1, 'l': 2, '?': 0, 'limit': 1, 'vp': 8},
      {'name': 'Parc de Buttes Chaumont',   'type': 'NewCultural',   'bm': 1, 'c': 2, 'l': 3, '?': 0, 'limit': 1, 'vp': 7},
      {'name': 'Rue de Rivoli',             'type': 'NewCultural',   'bm': 3, 'c': 2, 'l': 1, '?': 0, 'limit': 1, 'vp': 6},
      // {'name': 'The City Hall',             'type': 'NewCultural',   'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 1, 'vp': 0},
      {'name': 'The Embassy',               'type': 'NewCultural',   'bm': 2, 'c': 3, 'l': 2, '?': 0, 'limit': 1, 'vp': 0},
      {'name': 'Tour Eiffel',               'type': 'NewCultural',   'bm': 1, 'c': 1, 'l': 1, '?': 0, 'limit': 1, 'vp': 6},
      {'name': 'Bois de Vincennes',         'type': 'NewCultural',   'bm': 2, 'c': 1, 'l': 2, '?': 0, 'limit': 1, 'vp': 0},
      {'name': 'Waterworks',                'type': 'NewCultural',   'bm': 2, 'c': 3, 'l': 2, '?': 0, 'limit': 1, 'vp': 0},
      {'name': 'Musee du Louvre',           'type': 'NewCultural',   'bm': 2, 'c': 3, 'l': 1, '?': 0, 'limit': 1, 'vp': 0},
      {'name': 'Guild Hall',                'type': 'NewCultural',   'bm': 2, 'c': 1, 'l': 2, '?': 0, 'limit': 1, 'vp': 0},
      {'name': 'Musee du Orsay',            'type': 'NewCultural',   'bm': 1, 'c': 2, 'l': 2, '?': 0, 'limit': 1, 'vp': 2},
      {'name': 'Le Havre',                  'type': 'NewCultural',   'bm': 3, 'c': 3, 'l': 0, '?': 0, 'limit': 1, 'vp': 0},
      ]
    ]

    for (i=0; i<4; i++) {
      var x = Math.floor(Math.random() * buildings[i].length)
      results.push(buildings[i][x])
      buildings[i].splice(x, 1)
    }
    for (i=0; i<3; i++) {
      var x = Math.floor(Math.random() * buildings[4].length)
      results.push(buildings[4][x])
      buildings[4].splice(x, 1)
    }
    return results
  }

  module.exports.generateBoard = function(num_rows, num_cols, percent_water) {
    board = []
    p1_resources = {'bm':0, 'l':0, 'c':0}
    p2_resources = {'bm':0, 'l':0, 'c':0}
    tiles_left = []
    var i=0
    num_water = parseInt(108 * (percent_water/100))
    num_bm = parseInt((108 - num_water)/3)
    num_l = parseInt((108 - num_water - num_bm)/2)
    num_c = parseInt(108 - num_water - num_bm - num_l)
    while (i < num_bm) {
      tiles_left.push('bm')
      i++
    }
    while (i < num_bm + num_l) {
      tiles_left.push('l')
      i++
    }
    while (i < num_bm + num_l + num_c) {
      tiles_left.push('c')
      i++
    }
    while (i < num_bm + num_l + num_c + num_water) {
      tiles_left.push('w')
      i++
    }
    for (row=0; row<num_rows; row+=1) {
      new_row = []

      num_columns = num_cols
      for (col=0; col<num_columns; col+=1) {
        const markerType = getMarker(row, col, num_rows, num_cols)
        results = getTileType(markerType, tiles_left)
        tiles_left = results[1]
        type = results[0]
        // isRim = (row == 0 || row == num_rows-1 || col == 0 || col == num_cols-1)
        // if (isRim && type == 'w') {
        //   let x = Math.floor(Math.random() * 9)
        //   type = ['l', 'bm', 'c', 'w', 'w', 'w', 'w', 'w', 'w'][x]
        // }
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

  function getTileType(markerType, tiles_left) {
    let x = Math.floor(Math.random() * tiles_left.length)
    var returnType = ""
    if (markerType != 'empty') {
      if (x < tiles_left.length/3) { returnType = 'bm' }
      else if (x < (2*tiles_left.length)/3) { returnType = 'l' }
      else { returnType = 'c' }
    } else {
      returnType = tiles_left[x]
    } 
    tiles_left.splice(x, 1)
    return [returnType, tiles_left]
  }

  function getMarker(row, col, num_rows, num_cols) {
    if ((row == 2 && col == (num_cols - 3)) || (row == (num_rows - 3) && col == 2)) {
      return "player_one"
    }
    if ((row == 2 && col == 2) || (row == (num_rows - 3) && col == (num_cols - 3))) {
      return "player_two"
    }
    return 'empty'
  }
}())
