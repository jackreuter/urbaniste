/* Building validation functions */

import {
  tileAdjacencyCheck,
  friendly
} from './util.js'

export function validateBuilding(buildingName, coords, move, board, startingPlayer) {
  return buildingValidationFunctions[buildingName](coords, move, board, startingPlayer)
}

function Harbor(coords, move, board, startingPlayer) {
  if (coords.length != 1) {
    return false
  } else { 
    var row = coords[0]['row']
    var col = coords[0]['col']
    var tileAdjacency = tileAdjacencyCheck(row, col, move, board, startingPlayer)
    if (tileAdjacency['friendly'] && board[row][col].type === 'w') {
      return true
    } else {
      return false
    }
  }
}

function lightHouse(coords, move, board, startingPlayer) {
  if (coords.length != 1) {
    return false
  } else { 
    var row = coords[0]['row']
    var col = coords[0]['col']
    var tileAdjacency = tileAdjacencyCheck(row, col, move, board, startingPlayer)
    if (
      (friendly(row, col, board, startingPlayer) || (move['marker_placement']['row'] == row && move['marker_placement']['col'] == col)) && tileAdjacency['water']) {
      return true
    } else {
      return false
    }
  }
}

function taxHouse(coords, move, board, startingPlayer) {return true}
function docks(coords, move, board, startingPlayer) {return true}
function settlement(coords, move, board, startingPlayer) {return true}
function bazaar(coords, move, board, startingPlayer) {return true}
function quarry(coords, move, board, startingPlayer) {return true}
function bank(coords, move, board, startingPlayer) {return true}
function embassy(coords, move, board, startingPlayer) {return true}
function guardTower(coords, move, board, startingPlayer) {return true}
function customsOffice(coords, move, board, startingPlayer) {return true}
function casino(coords, move, board, startingPlayer) {return true}
function graveyard(coords, move, board, startingPlayer) {return true}
function jail(coords, move, board, startingPlayer) {return true}
function workShop(coords, move, board, startingPlayer) {return true}
function mill(coords, move, board, startingPlayer) {return true}
function wall(coords, move, board, startingPlayer) {return true}
function church(coords, move, board, startingPlayer) {return true}
function boulevard(coords, move, board, startingPlayer) {return true}
function aqueduct(coords, move, board, startingPlayer) {return true}
function harbor(coords, move, board, startingPlayer) {return true}
function shipyard(coords, move, board, startingPlayer) {return true}
function trolley(coords, move, board, startingPlayer) {return true}
function cityHall(coords, move, board, startingPlayer) {return true}
function bridge(coords, move, board, startingPlayer) {return true}
function tunnel(coords, move, board, startingPlayer) {return true}
function sewers(coords, move, board, startingPlayer) {return true}
function depot(coords, move, board, startingPlayer) {return true}
function plaza(coords, move, board, startingPlayer) {return true}

var buildingValidationFunctions = {
  'Tax House': taxHouse,
  'Docks': docks,
  'Settlement': settlement,
  'Bazaar': bazaar,
  'Quarry': quarry,
  'Bank': bank,
  'Embassy': embassy,
  'Guard Tower': guardTower,
  'Customs Office': customsOffice,
  'Casino': casino,
  'Lighthouse': lightHouse,
  'Graveyard': graveyard,
  'Jail': jail,
  'Workshop': workShop,
  'Mill': mill,
  'Wall': wall,
  'Church': church,
  'Boulevard': boulevard,
  'Aqueduct': aqueduct,
  'Harbor': harbor,
  'Shipyard': shipyard,
  'Trolley': trolley,
  'City Hall': cityHall,
  'Bridge': bridge,
  'Tunnel': tunnel,
  'Sewers': sewers,
  'Depot': depot,
  'Plaza': plaza
}
