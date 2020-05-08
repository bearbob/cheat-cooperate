var constants = require('./constants');
var game = require('./gamestate');

/**
 * @public
 * Creates a new game room
 * @param {object} socket The socket of the player that tries to create the room
 * @param {string} roomId The identifier of the room
 * @return {boolean} True, if the room was created, false, if a room with this name already exists
 */
const createServer = (socket, roomId) => {
  console.log('Creating game room with id "'+roomId+'"');
  if(game.createRoom(roomId)) {
    socket.emit('joined_game', {id: roomId});
    return true;
  } else {
    socket.emit('join_error', 'Game with given ID already exist.');
    return false;
  }
};

/**
 * @public
 * Removes a player from the game
 * @param {object} io Broadcast object to notify the remaining players of the disconnect
 * @param {object} socket The socket of the player that left the room
 */
const playerDisconnected = (io, socket) => {
  let name = null;
  if(game.getPlayer(socket.id)) {
    name = game.getPlayer(socket.id).name;
  }
  let roomId = game.removePlayer(socket.id);
  if(roomId) {
      io.to(roomId).emit('playercount', game.countPlayers(roomId));
      io.to(roomId).emit('add_log', '<b>'+name+'</b> disconnected.');
  }
};

/**
 * @public
 * Adds a player to the room
 * @param {object} io Broadcast object to notify the other players
 * @param {object} socket The socket of the player that tries to join the room
 * @param {string} roomId The identifier of the room
 * @return {boolean} True, if the player joined, false, if a problem occured (e.g. the room does not exist)
 */
const playerJoined = (io, socket, roomId) => {
  //a new player wants to join. Check if this is possible
  if(!game.roomIsOpen(roomId)) {
    console.log('Cannot add new player, the room is locked or does not exist.');
    socket.emit('state', constants.state.maxPlayersReached);
    return false;
  }
  game.addPlayer(roomId, socket.id);
  socket.join(roomId);
  socket.emit('state', game.getPlayer(socket.id));

  console.log('Added new player to the game. Players: '+game.countPlayers(roomId));
  //update the playercount for all players in the room
  io.to(roomId).emit('playercount', game.countPlayers(roomId));
  socket.to(roomId).emit('add_log', '<b>'+game.getPlayer(socket.id).name+'</b> joined the room.');
  socket.emit('add_log', 'You joined the room "'+roomId+'".');

  return true;
};

/**
 * @public
 * Receive the decision of the player
 * @param {object} io Broadcast object to notify the other players
 * @param {object} socket The socket of the player
 * @param {boolean} bPlayerCooperates The decision - true if cooperate, otherwise false
 */
const sendDecision = (io, socket, bPlayerCooperates) => {
  game.setPlayerDecision(socket.id, bPlayerCooperates);
  let roomId = game.getRoomId(socket.id);
  game.calculateResults(roomId);
  let playerIds = game.getPlayerIDs(roomId);

  playerIds.forEach(id => {
    io.to(id).emit('state', game.getPlayerState(id));
  });
};

/**
 * @public
 * The player wants to begin the next round
 * @param {object} io Broadcast object to notify the other players
 * @param {object} socket The socket of the player
 */
const replay = (io, socket) => {
  //initiate next round
  if(game.voteNextRound(socket.id)) {
    broadcastState(io, socket);
  } else {
    socket.emit('state', game.getPlayerState(socket.id));
  }
  //the round is ending (or has ended), show the results in the log before we go on
  let player = game.getPlayer(socket.id);
  let msg = '<b>'+player.name+'</b> decided to ';
  msg += (player.cooperate)? 'cooperate with':'betray';
  msg += ' their partner.';
  socket.to(game.getRoomId(socket.id)).emit('add_log',msg);
};

/**
 * @public
 * Broadcast the current game state and ranking to each player after a player took an action
 * @param {object} io Broadcast object to notify the other players
 * @param {object} socket The socket of the player that did something
 */
const broadcastState = (io, socket) => {
  let roomId = game.getRoomId(socket.id);
  let playerIds = game.getPlayerIDs(roomId);

  playerIds.forEach(id => {
    io.to(id).emit('state', game.getPlayerState(id));
    io.to(id).emit('ranking', game.getRanking(id));
  });
};

/**
 * @public
 * A player wants to start the game
 * @param {object} io Broadcast object to notify the other players
 * @param {object} socket The socket of the player
 */
const sendStartVote = (io, socket) => {
  let roomId = game.getRoomId(socket.id);
  let voteResult = game.voteToStart(socket.id);
  switch(voteResult) {
    case 0:
      console.log('The game is starting in room '+roomId);
      socket.to(roomId).emit('add_log', '<b>'+game.getPlayer(socket.id).name+'</b> voted to start.');
      socket.emit('add_log', 'You voted to start.');
      io.to(roomId).emit('add_log', 'The game is starting.');
      broadcastState(io, socket);
      break;
    case 1:
      socket.emit('voteResult', 'Waiting for other players to vote');
      socket.to(roomId).emit('add_log', '<b>'+game.getPlayer(socket.id).name+'</b> voted to start.');
      socket.emit('add_log', 'You voted to start.');
      break;
    case 2:
      socket.emit('add_log', 'Cannot start with uneven player count');
      break;
  }
};

module.exports = {
  createServer: createServer,
  playerJoined: playerJoined,
  playerDisconnected: playerDisconnected,
  sendDecision: sendDecision,
  replay: replay,
  sendStartVote: sendStartVote,
};
