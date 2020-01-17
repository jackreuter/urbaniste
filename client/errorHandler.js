
function displayError(message) {
  console.log(message)
}

const ErrorHandler = {
  invalidHexClick: (boardTile, isAdjacentToFriendly) => {
    if (boardTile.marker !== 'empty') {
      displayError("Cannot place marker over an existing marker.")
    } else if (boardTile.type === 'w') {
      displayError("Cannot place marker over water hexes.")
    } else if (boardTile.building_id) {
      displayError("Cannot place marker over an existing building.")
    } else if (!isAdjacentToFriendly) {
      displayError("Must place marker adjacent to one of your existing markers or buildings.")
    } 
  },
  shopError: () => {
    displayError("Cannot select building to build until you have placed a marker this turn.")
  },
  invalidBuilding: (buildingName, invalidBuildingOptions) => {
    if (invalidBuildingOptions.tooFewCoordinates) {
      displayError("Too few hexes selected for this " + buildingName + ".")
    }
  },
  notWelcome: () => {
    displayError("You are not one of the two connected players. You are in VIEW ONLY mode.")
  },
  notEnoughMoney: (building_name) => {
    displayError("You cannot pay the cost for that " + building_name + ".")
  }

}

export default ErrorHandler;