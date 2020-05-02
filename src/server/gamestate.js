var constants = require('./constants');

var rooms = {};
var players = {};

/**
 * @private
 * @return {string}
 */
const getPlayerName = () => {
  return constants.names[Math.floor(Math.random() * constants.names.length)];
};

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
    name: getPlayerName(),
    score: 0,
    state: constants.state.waitingForPlayers,
    voteToStart: false,
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

/**
 *
 * @return {integer} 0, if the vote triggered
 */
const voteToStart = (roomId, playerId) => {
  let player = rooms[roomId].players;
  if(countPlayers(roomId)%2 == 0) {
    console.log('Player '+playerId+' tried to start the game, but the player count is uneven.');
    return 2;
  }
  players[playerId].voteToStart = true;
  let votes = 0;
  for(let pid in players) {
    votes += players[pid].voteToStart?1:0;
  }
  console.log('Got '+votes+' votes to start the game in room '+roomId);
  if(votes == countPlayers(roomId)) {
    return 0;
  }
  return 1;
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
