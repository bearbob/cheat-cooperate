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

  playerDisconnected: (socket, roomId) => {
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
    socket.emit('state', game.getPlayer(roomId, socket.id));

    console.log('Added new player to the game. Players: '+game.countPlayers(roomId));
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

  }
};
