var constants = require('./constants');
var game = require('./gamestate');

module.exports = {
  playerDisconnected: (socket) => {
    game.removePlayer(socket.id);
  },

  playerJoined: (io, socket) => {
    //a new player wants to join. Check if this is possible
    if(game.countPlayers() >= 2) {
      console.log('Cannot add new player, maximum players already reached.');
      socket.emit('state', constants.state.maxPlayersReached);
      return;
    }
    game.addPlayer(socket.id);
    socket.emit('state', game.getPlayer(socket.id));

    console.log('Added new player to the game. Players: '+game.countPlayers());
    if(game.countPlayers() == 2) {
      let playerIds = game.getPlayerIDs();
      playerIds.forEach(socketId => {
        game.getPlayer(socketId).state = constants.state.decision;
        io.to(socketId).emit('state', game.getPlayer(socketId));
      });
    }
  },


  sendDecision: (io, socket, bPlayerCooperates) => {
    let player = game.getPlayer(socket.id);
    if(player.cooperate != null && player.state != constants.state.decide) {
      console.log('Player already voted.');
      return;
    }
    player.cooperate = bPlayerCooperates;
    player.state = constants.state.waitingForOpponent;
    playerIds = game.getPlayerIDs();

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
  },

  replay: (io, socket) => {
    let player = game.getPlayer(socket.id);
    if(player.state != constants.state.result) {
      console.log('Player cannot replay right now');
      return;
    }
    player.cooperate = null;
    player.state = constants.state.decision;
    socket.emit('state', player);

  }
};
