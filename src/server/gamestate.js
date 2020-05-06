var constants = require('./constants');

var rooms = {};
var players = {};

const cleanState = () => {
  rooms = {};
  players = {};
};

/**
 * @private
 * @return {string} A random name
 */
const getRandomName = () => {
  return constants.names[Math.floor(Math.random() * constants.names.length)];
};

/**
 * @private
 * Fisher-Yates shuffle (see https://stackoverflow.com/a/2450976).
 * Changes the element order inplace
 * @param {array} array The input array that will be shuffled
 * @return {array}
 */
const shuffle = (array) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

/**
 * @private
 * @param {string} roomId
 */
const setMatchUps = (roomId) => {
  console.log('Setting up new match order for room '+roomId);
  let players = getPlayerIDs(roomId);
  let rOrdered = shuffle(players);
  rooms[roomId].matches = {};
  for(let i=0; i<rOrdered.length; i+=2) {
    rooms[roomId].matches[rOrdered[i]] = rOrdered[i+1];
    rooms[roomId].matches[rOrdered[i+1]] = rOrdered[i];
    getPlayer(rOrdered[i]).state = constants.state.decision;
    getPlayer(rOrdered[i+1]).state = constants.state.decision;
  }
  console.log('Finished new match order for room '+roomId);
};

/**
 * @public
 * Creates a new game room
 * @param {string} roomId - The ID of the room that will be created
 * @return {boolean} True if the room was created, otherwise false
 */
const createRoom = (roomId) => {
  if(rooms[roomId]) {
    return false;
  }
  rooms[roomId] = {
    isClosed: false,
    matches: {},
  };
  return true;
};

/**
 * @private
 * Close the room to start playing
 * @param {string} roomId - The ID of the room that will be closed
 * @return {undefined}
 */
const closeRoom = (roomId) => {
  if(rooms[roomId]) {
    rooms[roomId].isClosed = true;
  }
};

/**
 * @public
 * @param {string} roomId - The ID of the room that will be queried
 * @return {boolean} True if the room is open and players can join.
 */
const roomIsOpen = (roomId) => {
  if(!rooms[roomId] || rooms[roomId].isClosed) {
    return false;
  }
  return true;
};

/**
 * @public
 * Calculate the results for each match and update the state objects
 * @param {string} roomId - The ID of the room that will be queried
 */
const calculateResults = (roomId) => {
  let room = rooms[roomId];

  //check if all player have decided
  playerIds = getPlayerIDs(roomId);
  let waitingPlayers = playerIds.filter(p => getPlayer(p).state == constants.state.waitingForOpponent).length;

  if(waitingPlayers != playerIds.length) {
    return;
  }
  playerIds.forEach(playerId => {
    //check the result of the match between the two players
    let player = getPlayer(playerId);
    let partner = getPlayer(room.matches[playerId]);

    //the result is the number of cheaters in the match
    let result = 0; //both cooperated
    if(!partner.cooperate) {
      if(!player.cooperate) {
        result = 2; //both cheated
      } else {
        result = 1; //the player got betrayed!
      }
    } else if(!player.cooperate) {
        result = 3; //the player betrayed his partner
    }
    player.state = constants.state.result;
    player.result = result;
    if(result === 0 || result === 3) {
      player.score += 3;
    }
  });
};

/**
 * @public
 * Adds a new player to the room
 * @param {string} roomId - The ID of the room the new player will be added to
 * @param {string} playerId - The ID of the player that will be added
 * @return True, if the player was added, false, if the room is already closed
 */
const addPlayer = (roomId, playerId) => {
  if(!rooms[roomId] || rooms[roomId].isClosed) {
    return false;
  }
  players[playerId] = {
    name: getRandomName(),
    room: roomId,
    score: 0,
    state: constants.state.waitingForPlayers,
    voteToStart: false,
    cooperate: null,
    result: null,
  };
  return true;
};

/**
 * @public
 * @param {string} playerId - The ID of the player that will be queried
 * Delete a player. If the player was the last player in a room, the room is also deleted.
 */
const removePlayer = (playerId) => {
  console.log('A user disconnected: '+playerId);
  if(!players[playerId]) {
    return; //already deleted or never existed in this life cycle
  }
  let roomId = players[playerId].room;
  if(players[playerId]) {
    console.log('Deleting player "'+playerId+'" from room "'+players[playerId].room+'"');
      delete players[playerId];
  }
  if(roomId && countPlayers(roomId) < 1) {
    console.log('Deleting empty room "'+roomId+'"');
    delete rooms[roomId];
  }
};

/**
 * @public
 * @param {string} playerId - The ID of the player that will be queried
 * @return {string} The roomId the player is using
 */
const getRoomId = (playerId) => {
  if(players[playerId]) {
    return players[playerId].room;
  }
  return null;
};

/**
 * @public
 * @param {string} playerId - The ID of the player that will be queried
 * @return {object} The player object or undefined if no such object exists
 */
const getPlayer = (playerId) => {
  return players[playerId];
};

/**
 * @public
 * @param {string} playerId - The ID of the player that will be queried
 * @return {object} The current game state for the player
 */
const getPlayerState = (playerId) => {
  let p = getPlayer(playerId);
  console.log('Handling request of state object for player '+playerId+' with state '+p.state);
  let r = getRoomId(playerId);
  return {
    score: p.score,
    state: p.state,
    partner: getPlayer(rooms[r].matches[playerId]).name,
    result: p.result,
  };
};

/**
 * @public
 * @param {string} playerId - The ID of the player that will be queried
 * @param {boolean} decisionVal - True, if the player cooperate, otherwise false
 */
const setPlayerDecision = (playerId, decisionVal) => {
  let player = getPlayer(playerId);
  if(player.state != constants.state.decision) {
    console.log('Player '+playerId+' already decided (state '+player.state+')');
    return;
  }
  player.cooperate = decisionVal;
  if(player.cooperate) {
    player.score--;
  }
  player.state = constants.state.waitingForOpponent;
};

/**
 * @public
 * @param {string} roomId - The ID of the room that will be queried
 * @return {integer} The number of players in a room
 */
const countPlayers = (roomId) => {
  return getPlayerIDs(roomId).length;
};

/**
 * @public
 * @param {string} roomId - The ID of the room that will be queried
 * @return {array} Array of player ids
 */
const getPlayerIDs = (roomId) => {
  let playersInRoom = [];
  for(let p in players) {
    if(players[p].room == roomId) {
      playersInRoom.push(p);
    }
  }
  return playersInRoom;
};

/**
 * @public
 * @param {string} playerId - The ID of the player that triggers the vote
 * @return {integer} 0, if the vote triggered the game to start, 1 if other players still have to vote and 2 if the vote is invalid in the current state
 */
const voteToStart = (playerId) => {
  if(!players[playerId]) {
    console.log('Unknown player tried to vote. The server will not respond.');
    return;
  }
  let roomId = getRoomId(playerId);
  let playerCount = countPlayers(roomId);
  if(playerCount%2 != 0) {
    console.log('Player '+playerId+' tried to start the game, but the player count in '+roomId+' is uneven.');
    return 2;
  }
  getPlayer(playerId).voteToStart = true;
  let votes = 0;
  let playerIds = getPlayerIDs(roomId);
  for(let pid of playerIds) {
    votes += getPlayer(pid).voteToStart?1:0;
  }
  console.log('Got '+votes+'/'+playerCount+' votes to start the game in room '+roomId);
  if(votes >= playerCount) {
    //the game will start, close the room
    closeRoom(roomId);
    setMatchUps(roomId);
    return 0;
  }
  return 1;
};

/**
 * @public
 * @param {string} playerId - The ID of the player that triggers the vote
 * @return {boolean} True if the vote triggered the next round for all players
 */
const voteNextRound = (playerId) => {
  let player = getPlayer(playerId);
  if(player.state != constants.state.result) {
    console.log('Player '+playerId+' cannot replay right now');
    return false;
  }
  //player.cooperate = null;
  player.state = constants.state.waitingForNextRound;

  //check if all players are waiting
  let playerIds = getPlayerIDs(player.room);
  let waitingPlayers = playerIds.filter(p => getPlayer(p).state == constants.state.waitingForNextRound).length;

  if(waitingPlayers != playerIds.length) {
    return false;
  }
  //all players are ready for the next round
  setMatchUps(getRoomId(playerId));
  return true;
};

/**
 * @public
 * @param {string} requestingPlayerId - The ID of the player that requests the ranking. The name of this player will be replaced with "You"
 * @return {array}
 */
const getRanking = (requestingPlayerId) => {
  let roomId = getRoomId(requestingPlayerId);
  let playerIds = getPlayerIDs(roomId);
  let ranking = [];
  playerIds.forEach(playerId => {
    //check the result of the match between the two players
    let player = getPlayer(playerId);
    let name = (playerId != requestingPlayerId)?player.name : 'You';
    ranking.push({ name: name, score: player.score });
  });
  ranking.sort((a,b) => b.score - a.score);
  return ranking;
};



module.exports = {
  cleanState: cleanState,
  createRoom: createRoom,
  roomIsOpen: roomIsOpen,
  getRoomId: getRoomId,
  getRanking: getRanking,
  calculateResults: calculateResults,
  addPlayer: addPlayer,
  removePlayer: removePlayer,
  getPlayer: getPlayer,
  getPlayerState: getPlayerState,
  setPlayerDecision: setPlayerDecision,
  countPlayers: countPlayers,
  getPlayerIDs: getPlayerIDs,
  voteToStart: voteToStart,
  voteNextRound: voteNextRound,
};
