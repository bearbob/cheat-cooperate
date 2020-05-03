var constants = require('./constants');
var game = require('./gamestate');

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

const playerDisconnected = (socket) => {
  game.removePlayer(socket.id);
};

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

  /*
  //this was used for the two-player variant to tell the other player that the game starts
  if(game.countPlayers(roomId) == 2) {
    let playerIds = game.getPlayerIDs(roomId);
    playerIds.forEach(socketId => {
      game.getPlayer(socketId).state = constants.state.decision;
      io.to(socketId).emit('state', game.getPlayer(socketId));
    });
  }
  */
  return true;
};


const sendDecision = (io, socket, bPlayerCooperates) => {
  let roomId = game.getRoomId(socket.id);
  let player = game.getPlayer(socket.id);
  if(player.cooperate != null && player.state != constants.state.decide) {
    console.log('Player already voted.');
    return;
  }
  player.cooperate = bPlayerCooperates;
  player.state = constants.state.waitingForOpponent;
  playerIds = game.getPlayerIDs(roomId);

  let waitingPlayers = 0;
  let cheaters = 0;
  playerIds.forEach(socketId => {
    if (game.getPlayer(socketId).state == constants.state.waitingForOpponent) {
      waitingPlayers++;
      if(!game.getPlayer(socketId).cooperate) {
        cheaters++;
      }
    }
  });
  if(waitingPlayers == playerIds.length) {
    playerIds.forEach(socketId => {
      game.getPlayer(socketId).state = constants.state.result;
      game.getPlayer(socketId).result = cheaters;
      //TODO add or subtract points
      if(cheaters == 0) {
        game.getPlayer(socketId).score += 2;
      } else if(cheaters != playerIds.length) {
        if(game.getPlayer(socketId).cooperate) {
          game.getPlayer(socketId).score -= 1;
        } else {
          game.getPlayer(socketId).score += 3;
        }

      }
      io.to(socketId).emit('state', game.getPlayer(socketId));
    });
  } else {
    socket.emit('state', player);
  }
};

const replay = (io, socket) => {
  let roomId = game.getRoomId(socket.id);
  let player = game.getPlayer(socket.id);
  if(player.state != constants.state.result) {
    console.log('Player cannot replay right now');
    return;
  }
  player.cooperate = null;
  player.state = constants.state.decision;
  socket.emit('state', player);
};

const broadcastState = (io, socket) => {
  let roomId = game.getRoomId(socket.id);
  let playerIds = game.getPlayerIDs(roomId);

  playerIds.forEach(id => {
    io.to(id).emit('state', game.getPlayerState(id));
  });
};

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
