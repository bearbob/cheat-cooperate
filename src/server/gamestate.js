var constants = require('./constants');

//TODO: Game object for game rooms and state of the room to respond to a player that a game has already started and cannot be joined

var rooms = {};
var players = {};

module.exports = {
  createRoom: (roomId) => {
    if(rooms[roomId]) {
      return false;
    }
    rooms[roomId] = {
      isClosed: false,
      players: {},
    };
    return true;
  },

  closeRoom: (roomId) => {
    rooms[roomId].isClosed = true;
  },

  roomIsOpen: (roomId) => {
    if(!rooms[roomId] || rooms[roomId].isClosed) {
      return false;
    }
    return true;
  },

  /**
   * Adds a new player to the room
   * @return True, if the player was added, false, if the room is already closed
   */
  addPlayer: (roomId, playerId) => {
    if(!rooms[roomId] || rooms[roomId].isClosed) {
      return false;
    }
    rooms[roomId].players[playerId] = {
      score: 0,
      state: constants.state.waitingForPlayers,
      cooperate: null,
      result: null,
    };
    return true;
  },

  removePlayer: (playerId) => {
    console.log('A user disconnected: '+playerId);
    let roomIds = Object.keys(rooms);
    for(let i=0; i<roomIds.length; i++) {
      if(rooms[roomId].players[playerId]) {
          delete rooms[roomId].players[playerId];
      }
    }
  },

  getPlayer: (roomId, playerId) => {
    return rooms[roomId].players[playerId];
  },
  countPlayers: (roomId) => {
    return Object.keys(rooms[roomId].players).length;
  },
  getPlayerIDs: (roomId) => {
    return Object.keys(rooms[roomId].players);
  }
};
