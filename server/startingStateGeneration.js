(function() {
  
  // Public server modules

  module.exports.generateShop = function(beginner_mode) {
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
      {'name': 'Boulevard',       'type': 'Infrastructure',               'bm': 2, 'c': 2, 'l': 0, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      {'name': 'Tunnel',          'type': 'Infrastructure',               'bm': 1, 'c': 1, 'l': 3, '?': 0, 'limit': 5, 'vp': 3, 'beginner': false},
      {'name': 'Prison',          'type': 'Infrastructure',               'bm': 0, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      {'name': 'Tramway',         'type': 'Infrastructure',               'bm': 3, 'c': 0, 'l': 0, '?': 0, 'limit': 5, 'vp': 3, 'beginner': false},
      {'name': 'Foundry',         'type': 'Infrastructure',               'bm': 0, 'c': 0, 'l': 3, '?': 0, 'limit': 5, 'vp': 1, 'beginner': false},
      // {'name': 'Watchtower',      'type': 'Infrastructure',               'bm': 0, 'c': 2, 'l': 3, '?': 0, 'limit': 5, 'vp': 3, 'beginner': false},
      // {'name': 'WatchtowerBOnly', 'type': 'Infrastructure',               'bm': 0, 'c': 2, 'l': 2, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      {'name': 'Landfill',        'type': 'Infrastructure',               'bm': 3, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      
      ],

      //aquatic
      [
      {'name': 'Bridge',     'type': 'Aquatic',                      'bm': 3, 'c': 1, 'l': 0, '?': 0, 'limit': 5, 'vp': 3, 'beginner': true},
      {'name': 'Harbor',     'type': 'Aquatic',                      'bm': 0, 'c': 3, 'l': 0, '?': 0, 'limit': 5, 'vp': 2, 'beginner': true},
      {'name': 'Canal',      'type': 'Aquatic',                      'bm': 2, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      {'name': 'Ferry',      'type': 'Aquatic',                      'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 3, 'beginner': true},
      {'name': 'Lighthouse', 'type': 'Aquatic',                      'bm': 1, 'c': 3, 'l': 1, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      ],

      //commercial
      [
      {'name': 'Tenement',        'type': 'Commercial',               'bm': 0, 'c': 0, 'l': 0, '?': 5, 'limit': 5, 'vp': 3, 'beginner': true},
      {'name': 'Bazaar',          'type': 'Commercial',               'bm': 0, 'c': 0, 'l': 0, '?': 6, 'limit': 5, 'vp': 3, 'beginner': true},
      {'name': 'Refinery',        'type': 'Commercial',               'bm': 0, 'c': 0, 'l': 0, '?': 3, 'limit': 5, 'vp': 1, 'beginner': true}, 
      {'name': 'Casino',          'type': 'Commercial',               'bm': 0, 'c': 0, 'l': 0, '?': 4, 'limit': 5, 'vp': 0, 'beginner': false},
      {'name': 'Loan Office',     'type': 'Commercial',               'bm': 0, 'c': 0, 'l': 0, '?': 2, 'limit': 5, 'vp': -1, 'beginner': false},

      ],

      //civic
      [
      {'name': 'Shipyard',   'type': 'Civic',                        'bm': 1, 'c': 0, 'l': 3, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      {'name': 'Tax House',  'type': 'Civic',                        'bm': 0, 'c': 3, 'l': 2, '?': 0, 'limit': 5, 'vp': 2, 'beginner': true},
      {'name': 'Cemetery',   'type': 'Civic',                        'bm': 3, 'c': 2, 'l': 0, '?': 0, 'limit': 5, 'vp': 2, 'beginner': true},
      {'name': 'Sewers',     'type': 'Civic',                        'bm': 2, 'c': 0, 'l': 3, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      {'name': 'Monument',   'type': 'Civic',                        'bm': 3, 'c': 1, 'l': 1, '?': 0, 'limit': 5, 'vp': 2, 'beginner': false},
      ],


      //default
      [
      {'name': 'Housing Shack',             'type': 'Default',       'bm': 0, 'c': 0, 'l': 0, '?': 3, 'limit': 10, 'vp': 1, 'beginner': true},
      ],

      //new cultural
      [
      {'name': 'Place Charles de Gaulle',   'type': 'NewCultural',   'bm': 3, 'c': 2, 'l': 2, '?': 0, 'limit': 1, 'vp': 8, 'beginner': true},
      {'name': 'Parc de Buttes Chaumont',   'type': 'NewCultural',   'bm': 1, 'c': 2, 'l': 3, '?': 0, 'limit': 1, 'vp': 6, 'beginner': true},
      {'name': 'Rue de Rivoli',             'type': 'NewCultural',   'bm': 3, 'c': 2, 'l': 1, '?': 0, 'limit': 1, 'vp': 6, 'beginner': false},  
      {'name': 'The Embassy',               'type': 'NewCultural',   'bm': 1, 'c': 2, 'l': 2, '?': 0, 'limit': 1, 'vp': 0, 'beginner': true},  
      {'name': 'Tour Eiffel',               'type': 'NewCultural',   'bm': 1, 'c': 1, 'l': 1, '?': 0, 'limit': 1, 'vp': 5, 'beginner': true},
      {'name': 'Bois de Vincennes',         'type': 'NewCultural',   'bm': 2, 'c': 1, 'l': 3, '?': 0, 'limit': 1, 'vp': 0, 'beginner': false},
      {'name': 'Musee du Louvre',           'type': 'NewCultural',   'bm': 2, 'c': 3, 'l': 1, '?': 0, 'limit': 1, 'vp': 0, 'beginner': false},
      {'name': 'Guild Hall',                'type': 'NewCultural',   'bm': 2, 'c': 2, 'l': 2, '?': 0, 'limit': 1, 'vp': 0, 'beginner': false},
      {'name': 'Opera Garnier',            'type': 'NewCultural',   'bm': 1, 'c': 2, 'l': 2, '?': 0, 'limit': 1, 'vp': 2, 'beginner': false},

      // {'name': 'The Grand Canal',           'type': 'NewCultural',   'bm': 2, 'c': 3, 'l': 2, '?': 0, 'limit': 1, 'vp': 0},
      // {'name': 'Le Havre',                  'type': 'NewCultural',   'bm': 0, 'c': 3, 'l': 3, '?': 0, 'limit': 1, 'vp': 0},
      // {'name': 'Waterworks',                'type': 'NewCultural',   'bm': 2, 'c': 3, 'l': 2, '?': 0, 'limit': 1, 'vp': 0},
      ]
    ]

    if (beginner_mode) {
      for (i=1; i<5; i++) {
        while (true) {
          var x = Math.floor(Math.random() * buildings[i].length)
          if (buildings[i][x].beginner){
            results.push(buildings[i][x])
            buildings[i].splice(x, 1)
            break
          }
        }
      }
      for (i=0; i<2; i++) {
        while (true) {
          var x = Math.floor(Math.random() * buildings[5].length)
          if (buildings[5][x].beginner) {
            results.push(buildings[5][x])
            buildings[5].splice(x, 1)
            break
          }
        }
      }
    } else {
      for (i=0; i<5; i++) {
        var x = Math.floor(Math.random() * buildings[i].length)
        results.push(buildings[i][x])
        buildings[i].splice(x, 1)
      }
      for (i=0; i<3; i++) {
        var x = Math.floor(Math.random() * buildings[5].length)
        results.push(buildings[5][x])
        buildings[5].splice(x, 1)
      }
    }
    return results
  }

  module.exports.generateBoard = function(percent_water, beginner_mode) {
    if (beginner_mode) {
      num_rows = 9
      num_cols = 9
    } else {
      num_rows = 9
      num_cols = 12
    } 
    board = []
    p1_resources = {'bm':0, 'l':0, 'c':0}
    p2_resources = {'bm':0, 'l':0, 'c':0}
    tiles_left = []
    var i=0
    num_water = parseInt((num_rows*num_cols) * (percent_water/100))
    num_bm = parseInt(((num_rows*num_cols) - num_water)/3)
    num_l = parseInt(((num_rows*num_cols) - num_water - num_bm)/2)
    num_c = parseInt((num_rows*num_cols) - num_water - num_bm - num_l)
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
        const markerType = getMarker(row, col, num_rows, num_cols, beginner_mode)
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

  function getMarker(row, col, num_rows, num_cols, beginner_mode) {
    if (beginner_mode) {
      if ((row == 1 && col == (num_cols - 3)) || (row == (num_rows - 2) && col == 2)) {
        return "player_one"
      }
      if ((row == 1 && col == 2) || (row == (num_rows - 2) && col == (num_cols - 3))) {
        return "player_two"
      }
      return 'empty'
    } else {
      if ((row == 2 && col == (num_cols - 3)) || (row == (num_rows - 3) && col == 2)) {
        return "player_one"
      }
      if ((row == 2 && col == 2) || (row == (num_rows - 3) && col == (num_cols - 3))) {
        return "player_two"
      }
      return 'empty'
    }
  }
}())
