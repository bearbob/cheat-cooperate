var constants = require('./constants');
var game = require('./gamestate');

module.exports = {
  createServer: (socket, roomId) => {
    console.log('Creating game room with id "'+roomId+'"');
    if(game.createRoom(roomId)) {
      socket.emit('joined_game', {id: roomId});
      return true;
    } else {
      socket.emit('join_error', 'Game with given ID already exist.');
      return false;
    }
  },

  playerDisconnected: (socket) => {
    game.removePlayer(socket.id);
  },

  playerJoined: (io, socket, roomId) => {
    //a new player wants to join. Check if this is possible
    if(!game.roomIsOpen(roomId)) {
      console.log('Cannot add new player, the room is locked or does not exist.');
      socket.emit('state', constants.state.maxPlayersReached);
      return false;
    }
    game.addPlayer(roomId, socket.id);
    socket.join(roomId);
    socket.emit('state', game.getPlayer(roomId, socket.id));

    console.log('Added new player to the game. Players: '+game.countPlayers(roomId));
    //update the playercount for all players in the room
    io.to(roomId).emit('playercount', game.countPlayers(roomId));
    io.to(roomId).emit('add_log', '<b>'+game.getPlayer(roomId, socket.id).name+'</b> joined the room.');

    if(game.countPlayers(roomId) == 2) {
      let playerIds = game.getPlayerIDs(roomId);
      playerIds.forEach(socketId => {
        game.getPlayer(roomId, socketId).state = constants.state.decision;
        io.to(socketId).emit('state', game.getPlayer(roomId, socketId));
      });
    }
    return true;
  },


  sendDecision: (io, socket, roomId, bPlayerCooperates) => {
    let player = game.getPlayer(roomId, socket.id);
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
      if (game.getPlayer(roomId, socketId).state == constants.state.waitingForOpponent) {
        waitingPlayers++;
        if(!game.getPlayer(roomId, socketId).cooperate) {
          cheaters++;
        }
      }
    });
    if(waitingPlayers == playerIds.length) {
      playerIds.forEach(socketId => {
        game.getPlayer(roomId, socketId).state = constants.state.result;
        game.getPlayer(roomId, socketId).result = cheaters;
        //TODO add or subtract points
        if(cheaters == 0) {
          game.getPlayer(roomId, socketId).score += 2;
        } else if(cheaters != playerIds.length) {
          if(game.getPlayer(roomId, socketId).cooperate) {
            game.getPlayer(roomId, socketId).score -= 1;
          } else {
            game.getPlayer(roomId, socketId).score += 3;
          }

        }
        io.to(socketId).emit('state', game.getPlayer(roomId, socketId));
      });
    } else {
      socket.emit('state', player);
    }
  },

  replay: (io, socket) => {
    let player = game.getPlayer(roomId, socket.id);
    if(player.state != constants.state.result) {
      console.log('Player cannot replay right now');
      return;
    }
    player.cooperate = null;
    player.state = constants.state.decision;
    socket.emit('state', player);
  },

  sendStartVote: (io, socket, roomId) => {
    let voteResult = game.voteToStart(roomId, socket.id);
    switch(voteResult) {
      case 0:
        io.to(roomId).emit('gameIsStarting');
        break;
      case 1:
        socket.emit('voteResult', 'Waiting for other players to vote');
        break;
      case 2:
        socket.emit('voteResult', 'Cannot start with uneven player count');
        break;
    }
  },
};
