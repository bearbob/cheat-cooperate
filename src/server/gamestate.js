var constants = require('./constants');

//TODO: Game object for game rooms and state of the room to respond to a player that a game has already started and cannot be joined

var rooms = {};
var players = {};

const createRoom = (roomId) => {
  if(rooms[roomId]) {
    return false;
  }
  rooms[roomId] = {
    isClosed: false,
    players: {},
  };
  return true;
};

const closeRoom = (roomId) => {
  rooms[roomId].isClosed = true;
};

const roomIsOpen = (roomId) => {
  if(!rooms[roomId] || rooms[roomId].isClosed) {
    return false;
  }
  return true;
};

/**
 * Adds a new player to the room
 * @return True, if the player was added, false, if the room is already closed
 */
const addPlayer = (roomId, playerId) => {
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
};

const removePlayer = (playerId) => {
  console.log('A user disconnected: '+playerId);
  for (var roomId in rooms) {
    if(rooms[roomId].players[playerId]) {
      console.log('Deleting player "'+playerId+'" from room "'+roomId+'"');
        delete rooms[roomId].players[playerId];
    }
    //if the room is empty, delete it
    if(countPlayers(roomId) < 1) {
      console.log('Deleting empty room "'+roomId+'"');
      delete rooms[roomId];
    }
  }
};

const getPlayer = (roomId, playerId) => {
  return rooms[roomId].players[playerId];
};

const countPlayers = (roomId) => {
  return Object.keys(rooms[roomId].players).length;
};

const getPlayerIDs = (roomId) => {
  return Object.keys(rooms[roomId].players);
};

module.exports = {
  createRoom: createRoom,
  closeRoom: closeRoom,
  roomIsOpen: roomIsOpen,
  addPlayer: addPlayer,
  removePlayer: removePlayer,
  getPlayer: getPlayer,
  countPlayers: countPlayers,
  getPlayerIDs: getPlayerIDs,
};
